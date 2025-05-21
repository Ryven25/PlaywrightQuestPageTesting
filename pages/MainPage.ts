import { Page, Locator, expect } from '@playwright/test';

export class MainPage {
  readonly page: Page;
  readonly startQuestButton: Locator;
  readonly improveSkillButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly heroImage: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    // Main navigation and action elements
    this.startQuestButton = page.locator('button:has-text("Start your testing quest")');
    this.improveSkillButton = page.locator('button:has-text("Improve your skill")');

    // Content elements
    this.pageTitle = page.locator('h1');
    this.pageDescription = page.locator('.description');
    this.heroImage = page.locator('.hero-image');
    this.footer = page.locator('footer');
  }


  // Navigate to the main page

  async goto() {
    await this.page.goto("/");
  }


  // Click the 'Start your testing quest' button

  async clickStartQuest() {
    await this.startQuestButton.click();
  }


  // Click the 'Improve your skill' button

  async clickImproveSkill() {
    await this.improveSkillButton.click();
  }


  // Verify that the main page has loaded correctly

  async verifyMainPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText('Legion QA Guild Signup');
    await expect(this.startQuestButton).toBeVisible();
    await expect(this.improveSkillButton).toBeVisible();
  }


  // Get the page title text

  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }


  // Get the page description text

  async getPageDescription(): Promise<string> {
    return await this.pageDescription.textContent() || '';
  }


  // Check if the hero image is visible

  async isHeroImageVisible(): Promise<boolean> {
    return await this.heroImage.isVisible();
  }


  // Check if the footer is visible and contains expected content

  async verifyFooter(expectedText?: string) {
    await expect(this.footer).toBeVisible();
    if (expectedText) {
      await expect(this.footer).toContainText(expectedText);
    }
  }
}

