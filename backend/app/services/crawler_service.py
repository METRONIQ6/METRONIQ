import ipaddress
import socket
import urllib.parse
from playwright.async_api import async_playwright
import tempfile
import os
import uuid
import json

class SSRFError(Exception):
    pass

def validate_url(url: str):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ["http", "https"]:
        raise SSRFError(f"Unsupported scheme: {parsed.scheme}")
    
    hostname = parsed.hostname
    if not hostname:
        raise SSRFError("Invalid URL hostname")
        
    try:
        ip = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip)
    except socket.gaierror:
        raise SSRFError("Failed to resolve hostname")
        
    if ip_obj.is_loopback or ip_obj.is_private or ip_obj.is_link_local or ip_obj.is_multicast:
        raise SSRFError(f"Target resolves to restricted IP: {ip}")
        
    return url

async def scrape_and_screenshot(url: str):
    validate_url(url) # security check
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 2000}, # long screenshot for e-commerce
        )
        page = await context.new_page()
        
        try:
            # 15 seconds timeout
            response = await page.goto(url, wait_until="networkidle", timeout=15000)
            if not response or not response.ok:
                raise Exception(f"Failed to load page: {response.status if response else 'Unknown'}")
                
            file_name = f"{uuid.uuid4()}.jpg".replace("-", "")
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, file_name)
            
            await page.screenshot(path=file_path, full_page=True, type="jpeg")
            
            # Complex dynamic metadata extraction
            title = await page.title()
            
            # Extract JSON-LD for rich schema.org/Product detection
            json_ld_raw = await page.evaluate('''
                () => {
                    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for(let s of scripts) {
                        try {
                            const data = JSON.parse(s.innerText);
                            // E-commerce nested graph flattening
                            let items = Array.isArray(data) ? data : (data['@graph'] || [data]);
                            for(let item of items) {
                                if(item['@type'] === 'Product' || item['@type'] === 'Grocery') {
                                    return item;
                                }
                            }
                        } catch(e) {}
                    }
                    return null;
                }
            ''')
            
            # Fallback DOM Price lookup using common selectors if JSON-LD fails
            dom_price = await page.evaluate('''
                () => {
                    const el = document.querySelector('.price, .mrp, span[class*="price"], div[class*="price"]');
                    return el ? el.innerText.trim() : null;
                }
            ''')
            
            seller = await page.evaluate('''
                () => {
                    const el = document.querySelector('.seller, .sold-by, span[class*="seller"], div[class*="seller"]');
                    return el ? el.innerText.trim() : null;
                }
            ''')
            
            if not json_ld_raw and not dom_price and not seller and "product" not in url.lower():
                raise Exception("NOT_PRODUCT_PAGE")
                
            return {
                "screenshot_path": file_path,
                "screenshot_name": file_name,
                "title": title,
                "source_url": url,
                "product_data": json_ld_raw,
                "dom_price": dom_price,
                "dom_seller": seller
            }
        except Exception as e:
            if "NOT_PRODUCT_PAGE" in str(e):
                raise Exception("NOT_PRODUCT_PAGE")
            raise Exception(f"Crawler error: {str(e)}")
        finally:
            await browser.close()
