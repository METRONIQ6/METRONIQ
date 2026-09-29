from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://metroniq.vercel.app")
    page.wait_for_timeout(3000)
    print("Title:", page.title())
    content = page.content()
    if "MetronIQ" in content:
        print("Frontend loaded successfully!!")
    else:
        print("Failed to load MetronIQ text")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
