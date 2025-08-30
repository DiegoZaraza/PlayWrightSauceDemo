# PlayWrightSauceDemo

Automated end-to-end tests for Sauce Demo using Playwright.

## Features

- Data integrity validation for cart totals
- Edge case and maximum item subtotal checks
- Price consistency across navigation
- Modular page object structure

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run tests

```bash
npx playwright test
```

## Project Structure

- `tests/` - Test specifications
- `fixtures/` - Custom Playwright fixtures
- `pages/` - Page object models

## Notes

- Tests use dynamic product data from the inventory page.
- Ensure Sauce Demo credentials are configured if required.

# Approach and Justification

## Project Structure

```
saucedemo-automation/
├── page-objects/           # Page Object Model implementation
│   ├── BasePage.js        # Base class with common utilities
│   ├── LoginPage.js       # Login functionality
│   ├── InventoryPage.js   # Product inventory interactions
│   ├── CartPage.js        # Shopping cart operations
│   └── CheckoutPage.js    # Checkout process handling
├── fixtures/              # Test fixtures and utilities
│   └── test-fixtures.js   # Shared test setup and constants
├── tests/                 # Test specifications
│   ├── successful-transaction.spec.js
│   ├── ui-anomaly-handling.spec.js
│   └── data-integrity.spec.js
├── playwright.config.js   # Playwright configuration
├── package.json          # Project dependencies
└── README.md            # This file
```

**Page Object Model (POM):** I implemented a robust POM pattern to create maintainable, reusable code:

- **BasePage:** Contains common utilities like safe clicking, text parsing, and error handling that all pages inherit
- **Specialized Pages:** Each page class focuses on its specific functionality while leveraging base utilities
- **Fixtures:** Centralized test setup with pre-configured user sessions and constants for consistency

**Benefits:**
- **Maintainability:** Changes to UI elements require updates in only one location
- **Reusability:** Common actions are shared across tests
- **Readability:** Tests read like business requirements rather than technical implementations

### Element Selection Philosophy

Prioritized **data-test attributtes** for major stability

1. **First selection:** `[data-test="XXXX"]`
2. **Secondary selection:** CSS classes `.inventory_item`
3. **Fallback:** Text based selectors.

Data-test they work well as they are attributes specifically designed for testing and give more reliability in use.

### Problem User Approach

During the creation and execution of the project we detected problems with the user `problem_user` not only with adding different items but also with not loading the cart with the products and also with the cart page loading blank without any data, this is something that should be reviewed thoroughly to find a better way to report these anomalies from the automation process.

### Improvements

With more time, I would:
- Add visual regression tests to catch UI anomalies.
- Integrate reporting tools for better test insights and CI/CD integration.
- Handle of different errors and events.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Sauce Demo](https://www.saucedemo.com/)