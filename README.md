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

## Approach and Justification

### Code Structure

The project is organized using the Page Object Model (POM) pattern. Each page (e.g., inventory, cart, checkout) has a dedicated file in the `pages/` directory, encapsulating selectors and actions for maintainability and reusability. Test specs reside in `tests/`, and shared fixtures are in `fixtures/` for modularity.

### Element Selection Philosophy

Selectors are chosen for stability and clarity, preferring data-test attributes or unique IDs when available. This minimizes test flakiness and makes the tests resilient to UI changes.

### Problem Approach

The challenge was addressed by validating cart totals and price consistency using dynamic product data, ensuring tests adapt to changes in inventory. Edge cases, such as maximum item subtotals, are covered to ensure robustness.

### Improvements

With more time, I would:
- Add visual regression tests to catch UI anomalies.
- Integrate reporting tools for better test insights and CI/CD integration.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Sauce Demo](https://www.saucedemo.com/)