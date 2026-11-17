from playwright.sync_api import sync_playwright
import time

out = r"C:\Users\mshiv\.gemini\antigravity\brain\47cae1e2-f0eb-406c-8a15-4e4889858279\screenshot.png"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://127.0.0.1:5000", wait_until="networkidle")
    # Wait for charts to render
    time.sleep(2)
    page.screenshot(path=out, full_page=True)
    browser.close()
    print("Screenshot saved to: " + out)

