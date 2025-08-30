const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameInput = '[data-test="username"]';
        this.passwordInput = '[data-test="password"]';
        this.loginButton = '[data-test="login-button"]';
        this.errorMessage = '[data-test="error"]';
        this.loginContainer = '.login_container';
    }

    async navigate() {
        await this.page.goto('/');
        await this.waitForPageLoad();
        await expect(this.page.locator(this.loginContainer)).toBeVisible();
    }

    async login(username, password) {
        await this.fillElement(this.usernameInput, username);
        await this.fillElement(this.passwordInput, password);
        await this.clickElement(this.loginButton);
        await this.waitForPageLoad()
    }

    async verifyLoginError() {
        await expect(this.page.locator(this.errorMessage)).toBeVisible();
    }
}

module.exports = LoginPage;
