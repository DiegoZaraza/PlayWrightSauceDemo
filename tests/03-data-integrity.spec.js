import { test, expect } from '../fixtures/text-fixtures';

test.describe('Data Integrity of Cart Totals', () => {
  test('Dynamic subtotal calculation verification for standard_user', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Step 1: Get ALL product details from inventory page for dynamic calculation
    const allProducts = await inventoryPage.getAllProductDetails();
    console.log(`Found ${allProducts.length} products on inventory page`);
    
    // Step 2: Select a variety of products (3-4 items) for robust testing
    const productsToAdd = [
      allProducts[0], // First product
      allProducts[2], // Third product  
      allProducts[4]  // Fifth product (if exists)
    ].filter(Boolean); // Remove undefined entries
    
    let expectedSubtotal = 0;
    const addedProducts = [];
    
    // Step 3: Add selected products to cart and calculate expected total
    for (const product of productsToAdd) {
      console.log(`Adding ${product.name} at ${product.priceText}`);
      
      await inventoryPage.addProductToCart(product.name);
      await inventoryPage.verifyProductAddedToCart(product.name);
      
      expectedSubtotal += product.price;
      addedProducts.push({
        name: product.name,
        price: product.price,
        priceText: product.priceText
      });
    }
    
    console.log(`Expected subtotal from inventory prices: $${expectedSubtotal.toFixed(2)}`);
    
    // Step 4: Navigate through cart to checkout
    await inventoryPage.goToCart();
    await cartPage.verifyPageLoaded();
    
    // Verify all items are in cart
    for (const product of addedProducts) {
      await cartPage.verifyItemInCart(product.name);
    }
    
    await cartPage.proceedToCheckout();
    
    // Step 5: Fill checkout information
    await checkoutPage.fillCheckoutInformation({
      firstName: 'Data',
      lastName: 'Tester',
      postalCode: '99999'
    });
    
    // Step 6: Get checkout items and recalculate from checkout page
    const checkoutItems = await checkoutPage.getCheckoutItems();
    const checkoutCalculatedSubtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
    
    console.log(`Checkout items found: ${checkoutItems.length}`);
    checkoutItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.priceText} (${item.price})`);
    });
    
    // Step 7: Get official order summary
    const orderSummary = await checkoutPage.getOrderSummary();
    console.log(`Order Summary:
      Official Subtotal: ${orderSummary.subtotalText} (${orderSummary.subtotal})
      Tax: ${orderSummary.taxText} (${orderSummary.tax})
      Total: ${orderSummary.totalText} (${orderSummary.total})`);
    
    // Step 8: Perform all validations
    
    // Validation 1: Number of items matches
    expect(checkoutItems.length).toBe(addedProducts.length);
    
    // Validation 2: Each item price matches between inventory and checkout
    for (const checkoutItem of checkoutItems) {
      const originalProduct = addedProducts.find(p => p.name === checkoutItem.name);
      expect(originalProduct).toBeTruthy();
      expect(checkoutItem.price).toBe(originalProduct.price);
    }
    
    // Validation 3: Subtotal calculated from inventory matches checkout calculation
    expect(checkoutCalculatedSubtotal).toBe(expectedSubtotal);
    
    // Validation 4: Official subtotal matches our dynamic calculation
    expect(orderSummary.subtotal).toBe(expectedSubtotal);
    
    // Validation 5: Official subtotal matches checkout items calculation
    expect(orderSummary.subtotal).toBe(checkoutCalculatedSubtotal);
    
    // Validation 6: Total calculation is correct (subtotal + tax)
    const expectedTotal = parseFloat((orderSummary.subtotal + orderSummary.tax).toFixed(2));
    expect(orderSummary.total).toBe(expectedTotal);
    
    console.log(`✓ ALL VALIDATIONS PASSED:
      ✓ Item count: ${checkoutItems.length}
      ✓ Individual prices match between inventory and checkout
      ✓ Dynamic calculation: $${expectedSubtotal.toFixed(2)}
      ✓ Checkout calculation: $${checkoutCalculatedSubtotal.toFixed(2)}
      ✓ Official subtotal: $${orderSummary.subtotal.toFixed(2)}
      ✓ Total calculation: $${expectedTotal.toFixed(2)}`);
  });

  test('Edge case: Single item subtotal verification', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Test with just one item to ensure basic calculation works
    const allProducts = await inventoryPage.getAllProductDetails();
    const singleProduct = allProducts[1]; // Second product
    
    console.log(`Testing single item: ${singleProduct.name} at ${singleProduct.priceText}`);
    
    await inventoryPage.addProductToCart(singleProduct.name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInformation();
    
    const orderSummary = await checkoutPage.getOrderSummary();
    
    // For single item, subtotal should exactly equal the item price
    expect(orderSummary.subtotal).toBe(singleProduct.price);
    
    console.log(`✓ Single item validation passed: ${singleProduct.priceText} = $${orderSummary.subtotal.toFixed(2)}`);
  });

  test('Maximum items subtotal calculation', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Test with all available products
    const allProducts = await inventoryPage.getAllProductDetails();
    
    console.log(`Testing with all ${allProducts.length} products`);
    
    let expectedSubtotal = 0;
    
    // Add all products to cart
    for (const product of allProducts) {
      await inventoryPage.addProductToCart(product.name);
      expectedSubtotal += product.price;
    }
    
    console.log(`Expected subtotal for all items: $${expectedSubtotal.toFixed(2)}`);
    
    // Navigate to checkout
    await inventoryPage.goToCart();
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(allProducts.length);
    
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInformation();
    
    // Verify the calculation with maximum items
    const orderSummary = await checkoutPage.getOrderSummary();
    expect(orderSummary.subtotal).toBe(expectedSubtotal);
    
    console.log(`✓ Maximum items validation passed: $${expectedSubtotal.toFixed(2)} = $${orderSummary.subtotal.toFixed(2)}`);
  });

  test('Price consistency across multiple page navigations', async ({ 
    standardUserSession, 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // This test ensures prices remain consistent when navigating back and forth
    const allProducts = await inventoryPage.getAllProductDetails();
    const testProduct = allProducts[0];
    
    // Record initial price
    const initialPrice = testProduct.price;
    console.log(`Initial price for ${testProduct.name}: $${initialPrice.toFixed(2)}`);
    
    // Add to cart
    await inventoryPage.addProductToCart(testProduct.name);
    
    // Go to cart and back to inventory
    await inventoryPage.goToCart();
    await cartPage.verifyItemInCart(testProduct.name);
    
    // Get price from cart
    const cartItems = await cartPage.getCartItems();
    const cartPrice = cartItems.find(item => item.name === testProduct.name).price;
    console.log(`Price in cart: $${cartPrice.toFixed(2)}`);
    
    // Go to checkout
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCheckoutInformation();
    
    // Get price from checkout
    const checkoutItems = await checkoutPage.getCheckoutItems();
    const checkoutPrice = checkoutItems.find(item => item.name === testProduct.name).price;
    console.log(`Price in checkout: $${checkoutPrice.toFixed(2)}`);
    
    // Verify all prices match
    expect(cartPrice).toBe(initialPrice);
    expect(checkoutPrice).toBe(initialPrice);
    expect(checkoutPrice).toBe(cartPrice);
    
    console.log(`✓ Price consistency verified across all pages: $${initialPrice.toFixed(2)}`);
  });
});