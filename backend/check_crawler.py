from app.services.crawler_service import scrape_and_screenshot
import asyncio
import sys

async def main():
    try:
        data = await scrape_and_screenshot("https://example.com")
        print("Success:", data)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(main())
