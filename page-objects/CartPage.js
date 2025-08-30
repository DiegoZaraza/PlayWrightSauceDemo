const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.cartContainer = '.cart_contents_container';
    this.cartItems = '.cart_item';
    this.checkoutButton = '[data-test="checkout"]';
    this.continueShoppingButton = '[data-test="continue-shopping"]';
    this.cartItemNames = '.inventory_item_name';
    this.cartItemPrices = '.inventory_item_price';
    this.removeButtons = 'button[data-test*="remove"]';
  }

  async verifyPageLoaded() {
    await expect(this.page.locator(this.cartContainer)).toBeVisible();
  }

  /**
   * Get all items currently in the cart
   * @returns {Promise<Array>} Array of cart items with name and price
   */
  async getCartItems() {
    const items = [];
    const cartItemElements = await this.page.locator(this.cartItems).all();

    for (const item of cartItemElements) {
      const name = await item.locator(this.cartItemNames).textContent();
      const priceText = await item.locator(this.cartItemPrices).textContent();
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
   * Verify specific item is in cart
   * @param {string} productName - Name of the product to verify
   */
  async verifyItemInCart(productName) {
    const itemLocator = this.page.locator(this.cartItems).filter({
      has: this.page.locator(this.cartItemNames).filter({ hasText: productName })
    });
    await expect(itemLocator).toBeVisible();
  }

  /**
   * Verify item is NOT in cart (for bug replication)
   * @param {string} productName - Name of the product that should not be in cart
   */
  async verifyItemNotInCart(productName) {
    const itemLocator = this.page.locator(this.cartItems).filter({
      has: this.page.locator(this.cartItemNames).filter({ hasText: productName })
    });
    await expect(itemLocator).toHaveCount(0);
  }

  /**
   * Verify wrong item appears in cart (for bug replication)
   * @param {string} expectedItem - Item that was clicked to add
   * @param {string} actualItem - Item that actually appears in cart
   */
  async verifyWrongItemInCart(expectedItem, actualItem) {
    // Verify the expected item is NOT in cart
    await this.verifyItemNotInCart(expectedItem);
    
    // Verify the wrong item IS in cart
    await this.verifyItemInCart(actualItem);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.clickElement(this.checkoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Get cart item count
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartItemCount() {
    return (await this.page.locator(this.cartItems).count());
  }
}

module.exports = CartPage;