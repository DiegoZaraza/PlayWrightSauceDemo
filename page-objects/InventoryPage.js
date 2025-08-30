const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.inventoryContainer = '.inventory_container';
    this.inventoryItems = '.inventory_item';
    this.cartBadge = '.shopping_cart_badge';
    this.cartLink = '.shopping_cart_link';
    this.menuButton = '#react-burger-menu-btn';
  }

  async verifyPageLoaded() {
    await expect(this.page.locator(this.inventoryContainer)).toBeVisible();
  }

  /**
   * Get product information by name
   * @param {string} productName - Name of the product
   * @returns {Object} Product details including price and add to cart button
   */
  async getProductDetails(productName) {
    const productItem = this.page.locator(this.inventoryItems).filter({
      has: this.page.locator('.inventory_item_name').filter({ hasText: productName })
    });

    await expect(productItem).toBeVisible();

    const price = await productItem.locator('.inventory_item_price').textContent();
    const addToCartButton = productItem.locator('button[data-test*="add-to-cart"]');
    
    return {
      element: productItem,
      price: this.parsePrice(price),
      priceText: price,
      addToCartButton,
      name: productName
    };
  }

  /**
   * Add product to cart by name
   * @param {string} productName - Name of the product to add
   */
  async addProductToCart(productName) {
    const product = await this.getProductDetails(productName);
    await product.addToCartButton.click();
    await this.page.waitForTimeout(500); // Brief wait for cart update
  }

  /**
   * Add product to cart using direct API approach (bypass UI anomalies)
   * @param {string} productName - Name of the product to add
   */
  async addProductToCartDirectly(productName) {
    // Get the product element
    const productItem = this.page.locator(this.inventoryItems).filter({
      has: this.page.locator('.inventory_item_name').filter({ hasText: productName })
    });

    // Extract the product ID from the add to cart button
    const addToCartButton = productItem.locator('button[data-test*="add-to-cart"]');
    const buttonTestId = await addToCartButton.getAttribute('data-test');
    
    // Use JavaScript to directly trigger the add to cart action
    await this.page.evaluate((testId) => {
      const button = document.querySelector(`[data-test="${testId}"]`);
      if (button) {
        button.click();
      }
    }, buttonTestId);

    await this.page.waitForTimeout(500);
  }

  /**
   * Verify product was added to cart by checking if button text changed
   * @param {string} productName - Name of the product
   */
  async verifyProductAddedToCart(productName) {
    const productItem = this.page.locator(this.inventoryItems).filter({
      has: this.page.locator('.inventory_item_name').filter({ hasText: productName })
    });

    const removeButton = productItem.locator('button[data-test*="remove"]');
    await expect(removeButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get current cart item count
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartItemCount() {
    try {
      const badgeText = await this.page.locator(this.cartBadge).textContent();
      return parseInt(badgeText) || 0;
    } catch {
      return 0; // No badge means empty cart
    }
  }

  /**
   * Navigate to cart page
   */
  async goToCart() {
    await this.clickElement(this.cartLink);
    await this.waitForPageLoad();
  }

  /**
   * Get all product details for price calculation
   * @returns {Promise<Array>} Array of all products with their details
   */
  async getAllProductDetails() {
    const products = [];
    const productElements = await this.page.locator(this.inventoryItems).all();

    for (const element of productElements) {
      const name = await element.locator('.inventory_item_name').textContent();
      const priceText = await element.locator('.inventory_item_price').textContent();
      const price = this.parsePrice(priceText);

      products.push({
        name: name.trim(),
        price,
        priceText
      });
    }

    return products;
  }
}

module.exports = InventoryPage;