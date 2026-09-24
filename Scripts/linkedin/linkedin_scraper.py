"""Optional authenticated LinkedIn refresh; fail closed on login challenges."""
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def scrape_linkedin_profile(linkedin_url):
    for key in ("LINKEDIN_EMAIL", "LINKEDIN_PASSWORD"):
        if not os.getenv(key):
            raise ValueError(f"{key} is required for live LinkedIn refresh")
    if not linkedin_url or not linkedin_url.startswith("https://www.linkedin.com/in/"):
        raise ValueError("LINKEDIN_URL must be a LinkedIn profile URL")
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    try:
        driver.set_page_load_timeout(45)
        wait = WebDriverWait(driver, 30)
        driver.get("https://www.linkedin.com/login")
        wait.until(EC.presence_of_element_located((By.ID, "username"))).send_keys(os.environ["LINKEDIN_EMAIL"])
        driver.find_element(By.ID, "password").send_keys(os.environ["LINKEDIN_PASSWORD"])
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        wait.until(lambda d: "/feed" in d.current_url)
        driver.get(linkedin_url.rstrip("/") + "/")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "main h1")))
        result = {"profile": driver.find_element(By.TAG_NAME, "main").text}
        for section in ("experience", "education", "certifications", "skills", "honors"):
            driver.get(linkedin_url.rstrip("/") + f"/details/{section}/")
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "main .artdeco-card")))
            result[section] = driver.find_element(By.TAG_NAME, "main").text
        return result
    finally:
        driver.quit()
