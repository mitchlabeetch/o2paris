from playwright.sync_api import sync_playwright

def verify_tile_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")

            print("Checking page title...")
            title = page.title()
            print(f"Page title: {title}")

            print("Taking screenshot of grid...")
            page.screenshot(path="verification/grid_view.png", full_page=True)

            print("Clicking first tile...")
            # Click the text of the first tile
            page.get_by_text("Lumières de Paris").first.click()
            print("Clicked tile.")

            # Wait for modal
            page.wait_for_timeout(2000)
            print("Taking screenshot of modal...")
            page.screenshot(path="verification/modal_view.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tile_layout()
