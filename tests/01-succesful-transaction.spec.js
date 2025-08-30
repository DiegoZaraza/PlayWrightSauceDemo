import { test, expect, PRODUCTS } from '../fixtures/text-fixtures';

test.describe('Successful Transaction Validation', () => {
  
  test('Standard user can complete a purchase successfully with accurate pricing', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Test products to purchase
    const productsToAdd = [PRODUCTS.backpack, PRODUCTS.tshirt];
    
    // Step 1: Add products to cart and collect pricing info
    let expectedSubtotal = 0;
    for (const productName of productsToAdd) {
      const productDetails = await inventoryPage.getProductDetails(productName);
      expectedSubtotal += productDetails.price;
      
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.verifyProductAddedToCart(productName);
    }
    
    // Step 2: Verify cart badge shows correct count
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(productsToAdd.length);
    
    // Step 3: Go to cart and verify items
    await inventoryPage.goToCart();
    await cartPage.verifyPageLoaded();
    
    for (const productName of productsToAdd) {
      await cartPage.verifyItemInCart(productName);
    }
    
    // Step 4: Proceed to checkout
    await cartPage.proceedToCheckout();
    
    // Step 5: Fill checkout information
    await checkoutPage.fillCheckoutInformation({
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345'
    });
    
    // Step 6: Verify pricing accuracy on checkout overview
    const checkoutItems = await checkoutPage.getCheckoutItems();
    const orderSummary = await checkoutPage.getOrderSummary();
    
    // Verify all expected items are present in checkout
    expect(checkoutItems.length).toBe(productsToAdd.length);
    
    for (const productName of productsToAdd) {
      const foundItem = checkoutItems.find(item => item.name === productName);
      console.log(`Found item: ${JSON.parse(JSON.stringify(foundItem)).name}`);
      expect(foundItem).toBeTruthy();
    }
    
    // Verify subtotal calculation accuracy
    const actualSubtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
    expect(orderSummary.subtotal).toBe(actualSubtotal);
    expect(orderSummary.subtotal).toBe(expectedSubtotal);
    
    // Verify total calculation (subtotal + tax)
    const expectedTotal = parseFloat((orderSummary.subtotal + orderSummary.tax).toFixed(2));
    expect(orderSummary.total).toBe(expectedTotal);
    
    console.log(`Order Summary:
      Subtotal: $${orderSummary.subtotal.toFixed(2)}
      Tax: $${orderSummary.tax.toFixed(2)} 
      Total: $${orderSummary.total.toFixed(2)}`);
    
    // Step 7: Complete the order
    await checkoutPage.finishOrder();
    
    // Step 8: Verify successful completion
    await checkoutPage.verifyOrderComplete();
  });

  test('Price validation matches across inventory and checkout pages', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Get all product details from inventory page for reference
    const allProducts = await inventoryPage.getAllProductDetails();
    
    // Add first two products to cart
    const testProducts = allProducts.slice(0, 2);
    let expectedSubtotal = 0;
    
    for (const product of testProducts) {
      await inventoryPage.addProductToCart(product.name);
      expectedSubtotal += product.price;
    }
    
    // Go through checkout process
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInformation();
    
    // Verify prices match between inventory and checkout
    const checkoutItems = await checkoutPage.getCheckoutItems();
    
    for (const checkoutItem of checkoutItems) {
      const originalProduct = allProducts.find(p => p.name === checkoutItem.name);
      expect(originalProduct).toBeTruthy();
      expect(checkoutItem.price).toBe(originalProduct.price);
      console.log(`${checkoutItem.name}: Inventory $${originalProduct.price} = Checkout $${checkoutItem.price} ✓`);
    }
    
    // Verify subtotal calculation
    await checkoutPage.verifySubtotal(expectedSubtotal);
  });
});