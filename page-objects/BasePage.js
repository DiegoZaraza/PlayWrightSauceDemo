const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }

  async getTitle() {
    return this.page.title();
  }

  async expectTitle(title) {
    await expect(this.page).toHaveTitle(title);
  }

  async clickElement(selector, timeout = 10000) {
      await this.page.waitForSelector(selector, { timeout });
      await this.page.click(selector);
  }

  async fillElement(selector, value, timeout = 10000) {
      await this.page.waitForSelector(selector, { timeout });
      await this.page.fill(selector, value);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState();
  }

  async getElementText(selector) {
    await this.page.waitForSelector(selector);
    return await this.page.textContent(selector);
  }

  parsePrice(priceText) {
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
}

module.exports = BasePage;
