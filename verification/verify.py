from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Go to home page
            page.goto("http://localhost:3000")

            # Wait for map to load (Loading component disappears)
            page.wait_for_selector(".leaflet-container", timeout=10000)

            # Check for Admin button (new icon)
            page.wait_for_selector("a[title='Administration']")

            # Check for Locate control
            page.wait_for_selector(".leaflet-control.leaflet-bar button[title='Me localiser']")

            # Take screenshot of home
            page.screenshot(path="verification/home.png")
            print("Home screenshot taken")

            # Go to admin
            page.goto("http://localhost:3000/admin")

            # Wait for login form
            page.wait_for_selector("input[type='password']")

            # Take screenshot of admin login
            page.screenshot(path="verification/admin_login.png")
            print("Admin login screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
