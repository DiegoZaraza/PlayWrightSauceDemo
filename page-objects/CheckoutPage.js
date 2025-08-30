const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    // Step 1 - Information
    this.firstNameInput = '[data-test="firstName"]';
    this.lastNameInput = '[data-test="lastName"]';
    this.postalCodeInput = '[data-test="postalCode"]';
    this.continueButton = '[data-test="continue"]';
    this.cancelButton = '[data-test="cancel"]';
    
    // Step 2 - Overview
    this.cartItems = '.cart_item';
    this.itemTotal = '.summary_subtotal_label';
    this.tax = '.summary_tax_label';
    this.total = '.summary_total_label';
    this.finishButton = '[data-test="finish"]';
    
    // Step 3 - Complete
    this.completeHeader = '.complete-header';
    this.completeText = '.complete-text';
    this.backHomeButton = '[data-test="back-to-products"]';
  }

  /**
   * Fill checkout information form
   * @param {Object} userInfo - User information object
   */
  async fillCheckoutInformation(userInfo = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345'
  }) {
    await this.fillElement(this.firstNameInput, userInfo.firstName);
    await this.fillElement(this.lastNameInput, userInfo.lastName);
    await this.fillElement(this.postalCodeInput, userInfo.postalCode);
    await this.clickElement(this.continueButton);
    await this.waitForPageLoad();
  }

  /**
   * Get order summary details
   * @returns {Promise<Object>} Order summary with subtotal, tax, and total
   */
  async getOrderSummary() {
    const itemTotalText = await this.getElementText(this.itemTotal);
    const taxText = await this.getElementText(this.tax);
    const totalText = await this.getElementText(this.total);

    return {
      subtotal: this.parsePrice(itemTotalText),
      subtotalText: itemTotalText,
      tax: this.parsePrice(taxText),
      taxText: taxText,
      total: this.parsePrice(totalText),
      totalText: totalText
    };
  }

  /**
   * Get items in checkout overview
   * @returns {Promise<Array>} Array of items in checkout
   */
  async getCheckoutItems() {
    const items = [];
    const cartItemElements = await this.page.locator(this.cartItems).all();

    for (const item of cartItemElements) {
      const name = await item.locator('.inventory_item_name').textContent();
      const priceText = await item.locator('.inventory_item_price').textContent();
      const price = this.parsePrice(priceText);

      items.push({
        name: name.trim(),
        price,
        priceText
      });
    }

    return items;
  }

  /**
   * Verify the subtotal matches expected amount
   * @param {number} expectedSubtotal - Expected subtotal amount
   */
  async verifySubtotal(expectedSubtotal) {
    const summary = await this.getOrderSummary();
    expect(summary.subtotal).toBe(expectedSubtotal);
  }

  /**
   * Complete the order
   */
  async finishOrder() {
    await this.clickElement(this.finishButton);
    await this.waitForPageLoad();
  }

  /**
   * Verify order completion
   */
  async verifyOrderComplete() {
    await expect(this.page.locator(this.completeHeader)).toBeVisible();
    await expect(this.page.locator(this.completeHeader)).toHaveText('Thank you for your order!');
    await expect(this.page.locator(this.completeText)).toBeVisible();
  }

  /**
   * Calculate expected total from item prices
   * @param {Array} items - Array of items with prices
   * @returns {number} Expected subtotal
   */
  calculateExpectedSubtotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  /**
   * Return to products page
   */
  async backToProducts() {
    await this.clickElement(this.backHomeButton);
    await this.waitForPageLoad();
  }
}

module.exports = CheckoutPage;