
const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
  }


  /**
   * Navigates to the specified URL and waits for page load.
   */
  async navigateTo(url, options = {}) {
    await this.page.goto(url, options);
    await this.waitForPageLoad();
  }


  /**
   * Returns the current page title.
   */
  async getTitle() {
    return await this.page.title();
  }


  /**
   * Asserts that the page title matches the expected value.
   */
  async expectTitle(title) {
    await expect(this.page).toHaveTitle(title);
  }


  /**
   * Clicks an element after waiting for it to be visible.
   */
  async clickElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
      await this.page.click(selector);
    } catch (error) {
      throw new Error(`Failed to click element: ${selector}. ${error}`);
    }
  }


  /**
   * Fills an input element after waiting for it to be visible.
   */
  async fillElement(selector, value, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
      await this.page.fill(selector, value);
    } catch (error) {
      throw new Error(`Failed to fill element: ${selector} with value: ${value}. ${error}`);
    }
  }


  /**
   * Waits for the page to reach the 'load' state.
   */
  async waitForPageLoad(state = 'load') {
    await this.page.waitForLoadState(state);
  }


  /**
   * Gets the text content of an element after waiting for it to be visible.
   */
  async getElementText(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
    return await this.page.textContent(selector);
  }

  /**
   * Checks if an element is visible on the page.
   */
  async isElementVisible(selector) {
    return await this.page.isVisible(selector);
  }

  /**
   * Returns all elements matching a selector.
   */
  async getElements(selector) {
    return await this.page.$$(selector);
  }


  /**
   * Parses a price string and returns a float value.
   */
  parsePrice(priceText) {
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
}

module.exports = BasePage;
