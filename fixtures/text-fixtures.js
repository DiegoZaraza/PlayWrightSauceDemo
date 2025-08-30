const { test: base } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage');
const InventoryPage = require('../page-objects/InventoryPage');
const CartPage = require('../page-objects/CartPage');
const CheckoutPage = require('../page-objects/CheckoutPage');

// Test credentials
const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce'
  },
  problem: {
    username: 'problem_user', 
    password: 'secret_sauce'
  }
};

// Product names for consistency
const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  tshirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  bikeLight: 'Sauce Labs Bike Light',
  onesie: 'Sauce Labs Onesie',
  redTshirt: 'Test.allTheThings() T-Shirt (Red)'
};

// Extend base test with our page objects and utilities
const test = base.extend({
  // Page objects
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // Auto-login fixtures
  standardUserSession: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.navigate();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.verifyPageLoaded();
    await use({ loginPage, inventoryPage });
  },

  problemUserSession: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.navigate();
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await inventoryPage.verifyPageLoaded();
    await use({ loginPage, inventoryPage });
  }
});

module.exports = { 
  test, 
  USERS, 
  PRODUCTS,
  expect: require('@playwright/test').expect 
};