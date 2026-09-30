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

def find_product_json_ld(obj):
    if not obj:
        return None
    if isinstance(obj, list):
        for item in obj:
            found = find_product_json_ld(item)
            if found:
                return found
    elif isinstance(obj, dict):
        t = obj.get('@type')
        if t in ['Product', 'Grocery', 'IndividualProduct']:
            return obj
        if '@graph' in obj:
            return find_product_json_ld(obj['@graph'])
        if 'mainEntity' in obj:
            return find_product_json_ld(obj['mainEntity'])
    return None

def parse_html_fast(html, url):
    title_match = re.search(r'<title>(.*?)</title>', html, re.I)
    title = title_match.group(1).strip() if title_match else ""
    
    json_ld_raw = None
    scripts = re.findall(r'<script(?:[^>]*?)type=[\"\']application/ld\+json[\"\'][^>]*>(.*?)</script>', html, re.I | re.S)
    for s in scripts:
        try:
            data = json.loads(s)
            found = find_product_json_ld(data)
            if found:
                json_ld_raw = found
                break
        except Exception:
            pass
        
    dom_price = None
    if not json_ld_raw:
        price_match = re.search(r'class=\"[^\"]*(?:price|mrp)[^\"]*\">([^<]+)<', html, re.I)
        if price_match:
            dom_price = price_match.group(1).strip()
        else:
            cur_match = re.search(r'(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)', html)
            if cur_match:
                dom_price = cur_match.group(0).strip()
            
    is_valid = bool(json_ld_raw or dom_price or "product" in url.lower() or "item" in url.lower())
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
    # Only abort heavy streaming media to allow styles, fonts and packaging images to render
    if route.request.resource_type in ["media"]:
        await route.abort()
    else:
        await route.continue_()

app_client = httpx.AsyncClient(verify=False, timeout=httpx.Timeout(4.0, connect=2.0))

async def scrape_and_screenshot(url: str):
    validate_url(url)
    norm_url = normalize_url(url)
    
    if norm_url in CRAWL_CACHE:
        cached = CRAWL_CACHE[norm_url]
        if time.time() - cached["time"] < CACHE_TTL:
            return cached["data"]

    requires_browser = any(d in url.lower() for d in [
        "flipkart.com", "amazon.", "blinkit.com", "zeptonow.com", "myntra.com", "swiggy.com", "jiomart.com"
    ])
            
    if not requires_browser:
        try:
            resp = await app_client.get(
                url,
                follow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-IN,en;q=0.9'
                }
            )
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
        # Launch Chromium without --single-process to prevent renderer crashes on redirects
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 1600},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            locale="en-IN"
        )
        page = await context.new_page()
        await page.route("**/*", block_resources)
        
        try:
            response = None
            try:
                response = await page.goto(url, wait_until="domcontentloaded", timeout=25000)
            except Exception as nav_err:
                if "Timeout" in str(nav_err) and page.url != "about:blank":
                    pass
                else:
                    raise nav_err
            if response:
                if response.status == 404:
                    raise Exception("PAGE_NOT_FOUND")
                if response.status == 403:
                    raise Exception("ACCESS_DENIED")
                if not response.ok and response.status >= 500:
                    raise Exception(f"SERVER_ERROR_{response.status}")
                
            # Allow client-side hydration / rendering
            await page.wait_for_timeout(1500)
                
            file_name = f"{uuid.uuid4().hex}.jpg"
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, file_name)
            
            # Screenshot viewport where product header, packaging photo and prices reside
            await page.screenshot(path=file_path, full_page=False, type="jpeg", quality=85)
            
            title = await page.title()
            
            # Recursive JSON-LD extractor
            json_ld_raw = await page.evaluate('''() => {
                const findInJson = (obj) => {
                    if (!obj) return null;
                    if (Array.isArray(obj)) {
                        for (const item of obj) {
                            const res = findInJson(item);
                            if (res) return res;
                        }
                    } else if (typeof obj === 'object') {
                        const t = obj['@type'];
                        if (t === 'Product' || t === 'Grocery' || t === 'IndividualProduct') return obj;
                        if (obj['@graph']) return findInJson(obj['@graph']);
                        if (obj['mainEntity']) return findInJson(obj['mainEntity']);
                    }
                    return null;
                };

                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                for (const s of scripts) {
                    try {
                        const data = JSON.parse(s.innerText);
                        const prod = findInJson(data);
                        if (prod) return prod;
                    } catch(e) {}
                }
                return null;
            }''')
            
            dom_price = await page.evaluate(r'''() => {
                const priceSelectors = [
                    '.price', '.mrp', 'span[class*="price"]', 'div[class*="price"]', 
                    'div._30jeq3', 'div.Nx9daj', '.a-price .a-offscreen', 'span.a-price-whole',
                    '#priceblock_ourprice', '#priceblock_dealprice', 'div[class*="Price"]',
                    'span[data-testid="price"]', 'h4[data-testid="item-price"]'
                ];
                for (const sel of priceSelectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText && el.innerText.trim()) {
                        return el.innerText.trim();
                    }
                }
                // Fallback: search leaf nodes for currency
                const all = Array.from(document.querySelectorAll('span, div, p, b, strong'));
                for (const el of all) {
                    const t = (el.innerText || '').trim();
                    if (el.children.length === 0 && /^(\u20b9|Rs\.?|INR)\s*[\d,]+(\.\d{1,2})?$/.test(t)) {
                        return t;
                    }
                }
                return null;
            }''')
            
            seller = await page.evaluate('''() => {
                const sellerSelectors = [
                    '.seller', '.sold-by', 'span[class*="seller"]', 'div[class*="seller"]',
                    '#sellerProfileTriggerId', 'div._1RLviY', 'div[class*="merchant"]'
                ];
                for (const sel of sellerSelectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText && el.innerText.trim()) {
                        return el.innerText.trim();
                    }
                }
                return null;
            }''')
            
            if not json_ld_raw and not dom_price and not seller and "product" not in url.lower() and "item" not in url.lower():
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
            if "PAGE_NOT_FOUND" in err_msg or "404" in err_msg: raise Exception("PAGE_NOT_FOUND")
            if "ACCESS_DENIED" in err_msg or "403" in err_msg: raise Exception("ACCESS_DENIED")
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
            gc.collect()
