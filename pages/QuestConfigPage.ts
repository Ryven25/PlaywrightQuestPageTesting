import { Page, Locator, expect } from '@playwright/test';

export class QuestConfigPage {
    readonly page: Page;

    // Form input elements
    readonly questNameInput: Locator;
    readonly questDescriptionInput: Locator;

    // Navigation buttons
    readonly initiateButton: Locator;
    readonly embarkButton: Locator;

    // Page content elements
    readonly pageTitle: Locator;
    readonly configForm: Locator;
    readonly errorMessage: Locator;

    // Warrior selection elements
    readonly warriorSelection: Locator;
    readonly warriorOptions: Locator;
    readonly selectedWarrior: Locator;

    constructor(page: Page) {
        this.page = page;

        // Form inputs
        this.questNameInput = page.getByRole('textbox', { name: 'Test Quest Name:' });
        this.questDescriptionInput = page.getByRole('textbox', { name: 'Test Quest Description:' });

        // Buttons
        this.initiateButton = page.locator('button:has-text("Initiate QA Adventure")');
        this.embarkButton = page.locator('button:has-text("Embark on Testing")');

        // Page content
        this.pageTitle = page.getByRole('heading', { name: 'QA Adventure Configuration' });
        this.configForm = page.locator('form.quest-config');
        this.errorMessage = page.locator('.error-message');

        // Warrior selection
        this.warriorSelection = page.locator('.warrior-selection');
        this.warriorOptions = page.locator('.warrior-option');
        this.selectedWarrior = page.locator('.selected-warrior');
    }


    // Enter quest configuration details

    async configureQuest(name: string, description: string) {
        await this.questNameInput.fill(name);
        await this.questDescriptionInput.fill(description);
    }


    // Click the "Initiate QA Adventure" button

    async initiateAdventure() {
        await this.initiateButton.click();
        await expect(this.page).toHaveURL(/quest-config/);
    }


    // Click the "Embark on Testing" button

    async embarkOnTest() {
        await this.embarkButton.click();
        // Allow time for navigation to complete
        await this.page.waitForURL(/quest/, { timeout: 10000 });
    }


    //Verify the config page has loaded correctly

    async verifyConfigPageLoaded() {
        await expect(this.pageTitle).toBeVisible();
        await expect(this.pageTitle).toHaveText('QA Adventure Configuration');
        await expect(this.questNameInput).toBeVisible();
        await expect(this.questDescriptionInput).toBeVisible();
    }


    // Select a warrior by name

    async selectWarrior(warriorName: string) {
        const warriorOption = this.warriorSelection.locator(`text=${warriorName}`);
        await expect(warriorOption).toBeVisible();
        await warriorOption.click();
    }


    // Get the currently selected warrior name

    async getSelectedWarrior(): Promise<string> {
        return await this.selectedWarrior.textContent() || '';
    }


    // Get the available warrior count

    async getWarriorOptionsCount(): Promise<number> {
        return await this.warriorOptions.count();
    }


    // Check if the form is valid (no error messages shown)

    async isFormValid(): Promise<boolean> {
        return !(await this.errorMessage.isVisible());
    }


    //Get the error message if present

    async getErrorMessage(): Promise<string> {
        if (await this.errorMessage.isVisible()) {
            return await this.errorMessage.textContent() || '';
        }
        return '';
    }


    // Complete the entire configuration process and navigate to the Quest page

    async completeConfiguration(name: string, description: string, warriorName?: string) {
        await this.configureQuest(name, description);

        if (warriorName) {
            await this.selectWarrior(warriorName);
        }

        await this.initiateAdventure();
        await this.embarkOnTest();
    }
}
