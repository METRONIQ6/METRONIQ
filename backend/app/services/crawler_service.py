import ipaddress
import socket
import urllib.parse
try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None
import os
import uuid
import json
import httpx
import re
import time
import asyncio
import gc

class SSRFError(Exception):
    pass

CRAWL_CACHE = {}
MAX_CRAWL_CACHE = 50
CACHE_TTL = 3600

def validate_url(url: str):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ["http", "https"]: raise SSRFError(f"Unsupported scheme: {parsed.scheme}")
    hostname = parsed.hostname
    if not hostname: raise SSRFError("Invalid URL hostname")
    try:
        ip = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip)
    except socket.gaierror: raise SSRFError("Failed to resolve hostname")
    if ip_obj.is_loopback or ip_obj.is_private or ip_obj.is_link_local or ip_obj.is_multicast:
        raise SSRFError(f"Target resolves to restricted IP: {ip}")
    return url

def normalize_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    query = urllib.parse.parse_qs(parsed.query)
    for k in list(query.keys()):
        if k.startswith("utm_") or k in ["fbclid", "gclid", "_ga"]:
            del query[k]
    new_query = urllib.parse.urlencode(query, doseq=True)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, ""))

def parse_html_fast(html, url):
    title_match = re.search(r'<title>(.*?)</title>', html, re.I)
    title = title_match.group(1).strip() if title_match else ""
    
    json_ld_raw = None
    scripts = re.findall(r'<script(?:[^>]*?)type=[\"\']application/ld\+json[\"\'][^>]*>(.*?)</script>', html, re.I | re.S)
    for s in scripts:
        try:
            data = json.loads(s)
            items = data if isinstance(data, list) else (data.get('@graph', [data]) if isinstance(data, dict) else [data])
            for item in items:
                if isinstance(item, dict) and item.get('@type') in ['Product', 'Grocery']:
                    json_ld_raw = item
                    break
            if json_ld_raw: break
        except: pass
        
    dom_price = None
    if not json_ld_raw:
        price_match = re.search(r'class=\"[^\"]*(price|mrp)[^\"]*\">([^<]+)<', html, re.I)
        if price_match: dom_price = price_match.group(2).strip()
            
    is_valid = bool(json_ld_raw or dom_price or "product" in url.lower())
    return is_valid, {
        "title": title,
        "source_url": url,
        "product_data": json_ld_raw,
        "dom_price": dom_price,
        "dom_seller": None,
        "screenshot_path": None,
        "screenshot_name": None,
        "automation": "HTTP"
    }

async def block_resources(route):
    if route.request.resource_type in ["image", "media", "font", "stylesheet"]:
        await route.abort()
    else:
        await route.continue_()

app_client = httpx.AsyncClient(verify=False, timeout=httpx.Timeout(10.0, connect=3.0))

async def scrape_and_screenshot(url: str):
    validate_url(url)
    norm_url = normalize_url(url)
    
    if norm_url in CRAWL_CACHE:
        cached = CRAWL_CACHE[norm_url]
        if time.time() - cached["time"] < CACHE_TTL:
            return cached["data"]
            
    try:
        resp = await app_client.get(url, follow_redirects=True, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        if resp.status_code == 200:
            is_valid, parsed_data = parse_html_fast(resp.text, url)
            if is_valid and parsed_data["product_data"]: 
                if len(CRAWL_CACHE) >= MAX_CRAWL_CACHE:
                    CRAWL_CACHE.pop(next(iter(CRAWL_CACHE)), None)
                CRAWL_CACHE[norm_url] = {"time": time.time(), "data": parsed_data}
                return parsed_data
    except Exception:
        pass
        
    browser = None
    context = None
    page = None
    async with async_playwright() as p:
        # Launch Chromium with memory-conserving flags for containerized environments
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--single-process"]
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 2000})
        page = await context.new_page()
        await page.route("**/*", block_resources)
        
        try:
            response = await page.goto(url, wait_until="domcontentloaded", timeout=12000)
            if not response or not response.ok:
                raise Exception(f"Failed to load page: {response.status if response else 'Unknown'}")
                
            file_name = f"{uuid.uuid4()}.jpg".replace("-", "")
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, file_name)
            
            await page.screenshot(path=file_path, full_page=True, type="jpeg")
            
            title = await page.title()
            json_ld_raw = await page.evaluate('''() => {
                    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for(let s of scripts) {
                        try {
                            const data = JSON.parse(s.innerText);
                            let items = Array.isArray(data) ? data : (data['@graph'] || [data]);
                            for(let item of items) {
                                if(item['@type'] === 'Product' || item['@type'] === 'Grocery') return item;
                            }
                        } catch(e) {}
                    }
                    return null;
                }
            ''')
            
            dom_price = await page.evaluate('''() => {
                    const el = document.querySelector('.price, .mrp, span[class*="price"], div[class*="price"]');
                    return el ? el.innerText.trim() : null;
                }
            ''')
            
            seller = await page.evaluate('''() => {
                    const el = document.querySelector('.seller, .sold-by, span[class*="seller"], div[class*="seller"]');
                    return el ? el.innerText.trim() : null;
                }
            ''')
            
            if not json_ld_raw and not dom_price and not seller and "product" not in url.lower():
                raise Exception("NOT_PRODUCT_PAGE")
                
            res_data = {
                "screenshot_path": file_path,
                "screenshot_name": file_name,
                "title": title,
                "source_url": url,
                "product_data": json_ld_raw,
                "dom_price": dom_price,
                "dom_seller": seller,
                "automation": "PLAYWRIGHT"
            }
            if len(CRAWL_CACHE) >= MAX_CRAWL_CACHE:
                CRAWL_CACHE.pop(next(iter(CRAWL_CACHE)), None)
            CRAWL_CACHE[norm_url] = {"time": time.time(), "data": res_data}
            return res_data
        except Exception as e:
            err_msg = str(e)
            if "NOT_PRODUCT_PAGE" in err_msg: raise Exception("NOT_PRODUCT_PAGE")
            if "Timeout" in err_msg: raise Exception("CRAWL_TIMEOUT")
            raise Exception(f"Crawler error: {err_msg}")
        finally:
            try:
                if page: await page.close()
            except Exception: pass
            try:
                if context: await context.close()
            except Exception: pass
            try:
                if browser: await browser.close()
            except Exception: pass
            gc.collect()
