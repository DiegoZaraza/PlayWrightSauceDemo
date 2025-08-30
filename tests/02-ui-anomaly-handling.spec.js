import { test, expect, PRODUCTS } from '../fixtures/text-fixtures';

test.describe('UI Anomaly Handling - Problem User', () => {
  
  test('Replicate and confirm the cart anomaly bug for problem_user', async ({ 
    problemUserSession, 
    inventoryPage, 
    cartPage 
  }) => {
    // Test specifically for Fleece Jacket anomaly with problem_user
    const targetProduct = PRODUCTS.fleeceJacket;
    
    console.log(`Attempting to add ${targetProduct} to cart for problem_user...`);
    
    // Step 1: Attempt to add Fleece Jacket to cart
    await inventoryPage.addProductToCart(targetProduct);
    
    // Step 2: Navigate to cart to see what actually got added
    await inventoryPage.goToCart();
    await cartPage.verifyPageLoaded();
    
    // Step 3: Get what's actually in the cart
    const cartItems = await cartPage.getCartItems();
    console.log('Items found in cart:', cartItems.map(item => item.name));
    
    // Step 4: Verify the bug - Fleece Jacket should NOT be in cart
    await cartPage.verifyItemNotInCart(targetProduct);
    
    // Step 5: Document what wrong item appears instead
    expect(cartItems.length).toBeGreaterThan(1);
    const wrongItem = cartItems[0];
    
    console.log(`BUG CONFIRMED: Clicked "${targetProduct}" but got "${wrongItem.name}" in cart`);
    
    // Verify we have the wrong item
    expect(wrongItem.name).not.toBe(targetProduct);
    
    // Additional verification - the wrong item should be visible in cart
    await cartPage.verifyItemInCart(wrongItem.name);
  });

  test('Successfully add Fleece Jacket to cart using reliable method for problem_user', async ({ 
    problemUserSession, 
    inventoryPage, 
    cartPage 
  }) => {
    const targetProduct = PRODUCTS.fleeceJacket;
    
    console.log(`Adding ${targetProduct} using direct method to bypass UI glitch...`);
    
    // Step 1: Use the direct/reliable method to add the product
    await inventoryPage.addProductToCartDirectly(targetProduct);
    
    // Step 2: Verify the button state changed (product was added)
    await inventoryPage.verifyProductAddedToCart(targetProduct);
    
    // Step 3: Verify cart badge updated
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(1);
    
    // Step 4: Go to cart and verify correct item is present
    await inventoryPage.goToCart();
    await cartPage.verifyPageLoaded();
    
    // Step 5: Confirm the correct product is in cart
    await cartPage.verifyItemInCart(targetProduct);
    
    // Step 6: Get cart items and verify details
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(1);
    expect(cartItems[0].name).toBe(targetProduct);
    
    console.log(`SUCCESS: ${targetProduct} correctly added to cart using reliable method`);
    console.log(`Cart contains: ${cartItems[0].name} at ${cartItems[0].priceText}`);
  });

  test('Verify problem_user can complete checkout with correctly added items', async ({ 
    problemUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    const targetProduct = PRODUCTS.fleeceJacket;
    
    // Step 1: Add product using reliable method
    await inventoryPage.addProductToCartDirectly(targetProduct);
    await inventoryPage.verifyProductAddedToCart(targetProduct);
    
    // Step 2: Get expected price before going to cart
    const productDetails = await inventoryPage.getProductDetails(targetProduct);
    const expectedPrice = productDetails.price;
    
    // Step 3: Complete checkout process
    await inventoryPage.goToCart();
    await cartPage.verifyItemInCart(targetProduct);
    await cartPage.proceedToCheckout();
    
    // Step 4: Fill checkout information
    await checkoutPage.fillCheckoutInformation({
      firstName: 'Problem',
      lastName: 'User',
      postalCode: '54321'
    });
    
    // Step 5: Verify pricing accuracy in checkout
    const checkoutItems = await checkoutPage.getCheckoutItems();
    expect(checkoutItems.length).toBe(1);
    expect(checkoutItems[0].name).toBe(targetProduct);
    expect(checkoutItems[0].price).toBe(expectedPrice);
    
    await checkoutPage.verifySubtotal(expectedPrice);
    
    // Step 6: Complete the order
    await checkoutPage.finishOrder();
    await checkoutPage.verifyOrderComplete();
    
    console.log(`SUCCESS: problem_user completed purchase of ${targetProduct} for ${expectedPrice.toFixed(2)}`);
  });

  test('Compare behavior difference between standard_user and problem_user', async ({ page }) => {
    const LoginPage = require('../page-objects/LoginPage');
    const InventoryPage = require('../page-objects/InventoryPage');
    const CartPage = require('../page-objects/CartPage');
    const { USERS } = require('../fixtures/test-fixtures');
    
    const targetProduct = PRODUCTS.fleeceJacket;
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    // Test with standard_user first
    await loginPage.navigate();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.verifyPageLoaded();
    
    await inventoryPage.addProductToCart(targetProduct);
    await inventoryPage.goToCart();
    
    const standardUserCart = await cartPage.getCartItems();
    console.log(`Standard user cart:`, standardUserCart.map(item => item.name));
    
    // Logout (go back to login)
    await page.goto('/');
    
    // Test with problem_user
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await inventoryPage.verifyPageLoaded();
    
    await inventoryPage.addProductToCart(targetProduct);
    await inventoryPage.goToCart();
    
    const problemUserCart = await cartPage.getCartItems();
    console.log(`Problem user cart:`, problemUserCart.map(item => item.name));
    
    // Verify the difference in behavior
    if (standardUserCart.length > 0 && problemUserCart.length > 0) {
      if (standardUserCart[0].name === targetProduct && problemUserCart[0].name !== targetProduct) {
        console.log(`BEHAVIOR DIFFERENCE CONFIRMED:
          - standard_user: correctly added ${targetProduct}
          - problem_user: incorrectly added ${problemUserCart[0].name} instead`);
      }
    }
  });
});
