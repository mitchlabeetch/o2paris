from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the main page
            page.goto("http://localhost:3000")

            # Wait for map to load (the WaterCurtain might be visible for 2.2s)
            page.wait_for_timeout(3000)

            # Verify Header style
            page.screenshot(path="verification/home_page.png")
            print("Home page screenshot captured.")

            # Verify Tour Button exists
            tour_btn = page.locator("button[title='Démarrer la visite guidée']")
            if tour_btn.count() > 0:
                print("Tour button found.")
            else:
                print("Tour button NOT found.")

            # Navigate to Admin
            page.goto("http://localhost:3000/admin")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/admin_login.png")
            print("Admin login screenshot captured.")

            # Navigate to 404
            page.goto("http://localhost:3000/non-existent-page")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/404_page.png")
            print("404 page screenshot captured.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
