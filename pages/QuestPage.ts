import { Page, Locator, expect } from '@playwright/test';

export class QuestPage {
    readonly page: Page;

    // Quest details locators
    readonly questName: Locator;
    readonly questDescription: Locator;

    // Progress tracking locators
    readonly progressBar: Locator;
    readonly progressText: Locator;
    readonly progressContainer: Locator;

    // Notification locators
    readonly notification: Locator;
    readonly victoryAlert: Locator;
    readonly failureAlert: Locator;
    readonly customActionNotification: Locator;

    // Rewards system locators
    readonly goldCoins: Locator;
    readonly artifacts: Locator;
    readonly daysOff: Locator;

    // Action buttons
    readonly fixBugButton: Locator;
    readonly findBugButton: Locator;
    readonly claimBonusButton: Locator;
    readonly obtainArtifactButton: Locator;
    readonly earnDaysOffButton: Locator;

    // Custom action elements
    readonly customActionInput: Locator;
    readonly submitCustomAction: Locator;

    // QA Warriors elements
    readonly warriorsList: Locator;
    readonly warriorDetails: Locator;

    constructor(page: Page) {
        this.page = page;

        // Quest details
        this.questName = page.getByRole('heading', { name: /QA Quest:/ });
        this.questDescription = page.getByText('New Game the best');

        // Progress tracking
        this.progressBar = this.page.locator('#progressBarFill');
        this.progressText = page.getByText('% Defect-Free');
        this.progressContainer = page.locator('.progress-container');

        // Notifications
        this.notification = page.locator('#customAlertMessage');
        this.victoryAlert = page.getByText('🎉 Victory! All defects');
        this.failureAlert = page.getByText('💀 Quest Failed! The bugs');
        this.customActionNotification = page.locator('#customAlertMessage');

        // Rewards system
        this.goldCoins = page.locator('#goldCount');
        this.artifacts = page.locator('#artifactCount');
        this.daysOff = page.locator('#honorCount');

        // Action buttons
        this.fixBugButton = page.getByRole('button', { name: 'Fix Bug' });
        this.findBugButton = page.getByRole('button', { name: 'Find Bug' });
        this.claimBonusButton = page.getByRole('button', { name: 'Claim Bonus' });
        this.obtainArtifactButton = page.getByRole('button', { name: 'Obtain QA Artifact' });
        this.earnDaysOffButton = page.getByRole('button', { name: 'Earn Days Off' });

        // Custom action elements
        this.customActionInput = page.getByRole('textbox', { name: 'Enter custom QA action' })
        this.submitCustomAction = page.getByRole('button', { name: 'Submit Action' });

        // QA Warriors
        this.warriorsList = page.locator('.warriors-list');
        this.warriorDetails = page.locator('.warrior-details');
    }

    // Progress tracking methods
    async getProgressText(): Promise<string> {
        return (await this.progressText.textContent())?.trim() || '';
    }

    async getProgressValue(): Promise<number> {
        const progressText = await this.progressText.textContent();
        const match = progressText?.match(/(\d+)%/);
        const value = match ? parseInt(match[1]) : 0;

        console.log('Parsed progress value:', value);
        return value;
    }

    async verifyProgress(expectedText: string, expectedValue: number) {
        await expect(this.progressText).toBeVisible();
        await expect(this.progressText).toHaveText(expectedText, { timeout: 15000 });

        await expect.poll(async () => {
            const text = await this.progressText.textContent();
            if (!text) return 0;
            const match = text.match(/(\d+)%/);
            if (!match) return 0;
            return parseInt(match[1], 10);
        }, {
            message: `Progress should be ${expectedValue}%`,
            timeout: 20000
        }).toBe(expectedValue);
    }



    async waitForProgressUpdate(action: () => Promise<void>, expectedChange: number, expectedText?: string) {
        const initialValue = await this.getProgressValue();
        await action();
        await this.waitForProgressToUpdate(initialValue + expectedChange);

        if (expectedText) {
            await expect(this.progressText).toContainText(`${initialValue + expectedChange}%`);
            if (expectedText.includes('Defect-Free')) {
                await expect(this.progressText).toContainText('Defect-Free');
            }
        }
    }


    async waitForProgressToUpdate(expectedValue: number, timeout = 10000) {
        await expect.poll(async () => {
            return await this.getProgressValue();
        }, {
            timeout,
            message: `Expected progress to be ${expectedValue}%`
        }).toBe(expectedValue);
    }

    // Action buttons methods
    async fixBug(): Promise<void> {
        await this.fixBugButton.click();
    }

    async findBug(): Promise<void> {
        await this.findBugButton.click();
    }

    async claimBonus(): Promise<void> {
        await this.claimBonusButton.click();
    }

    async obtainArtifact(): Promise<void> {
        await this.obtainArtifactButton.click();
    }

    async earnDaysOff(): Promise<void> {
        await this.earnDaysOffButton.click();
    }

    // Custom actions methods
    async performCustomAction(action: string) {
        await this.customActionInput.fill(action);
        await this.submitCustomAction.click();
    }

    // Reward system methods
    async getGoldCoinsCount(): Promise<number> {
        const text = await this.goldCoins.textContent();
        console.log('Gold coins text:', text);
        const match = text?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    async getArtifactsCount(): Promise<number> {
        const text = await this.artifacts.textContent();
        const match = text?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    async getDaysOffCount(): Promise<number> {
        const text = await this.daysOff.textContent();
        const match = text?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }


    // Verification methods
    async verifyVictoryAlert() {
        await expect(this.victoryAlert).toBeVisible();
        await expect(this.victoryAlert).toContainText('Victory! All defects vanquished!');
    }

    async verifyFailureAlert() {
        await expect(this.failureAlert).toBeVisible();
        await expect(this.failureAlert).toContainText('💀 Quest Failed! The bugs have taken over. 💀');
    }

    async verifyWarriorDetails(warriorName: string) {
        await expect(this.warriorDetails).toContainText(warriorName);
    }

    async verifyCustomActionNotification(action: string) {
        //  await expect(this.customActionNotification).toContainText(`You have performed the action: ${action}`);
        await expect(this.customActionNotification).toContainText(action);
    }

    async verifyEmptyActionNotification() {
        await expect(this.notification).toContainText('Please enter a valid action');
    }

    // Helper methods for test scenarios
    async resetProgress() {
        const currentProgress = await this.getProgressValue();
        if (currentProgress > 30) {
            while (await this.getProgressValue() > 30) {
                await this.findBugButton.click();
                await this.page.waitForTimeout(300);
            }
        } else if (currentProgress < 30) {
            while (await this.getProgressValue() < 30) {
                await this.fixBugButton.click();
                await this.page.waitForTimeout(300);
            }
        }
    }

    async fixBugsUntilVictory(): Promise<void> {
        while (await this.getProgressValue() < 100) {
            await this.fixBugButton.click();
            await this.page.waitForTimeout(300);
        }
    }

    async findBugsUntilFailure(): Promise<void> {
        while (await this.getProgressValue() > 0) {
            await this.findBugButton.click();
            await this.page.waitForTimeout(300);
        }
    }

    // QA Warriors methods
    async getQAWarriorsCount(): Promise<number> {
        return await this.warriorsList.locator('.warrior-item').count();
    }

    async getQAWarriorName(index: number): Promise<string> {
        const warrior = this.page.locator(`.warrior-item:nth-child(${index + 1}) .warrior-name`);
        return await warrior.textContent() || '';
    }

    async getQAWarriorDescription(index: number): Promise<string> {
        const warrior = this.page.locator(`.warrior-item:nth-child(${index + 1}) .warrior-description`);
        return await warrior.textContent() || '';
    }

    async verifyQAWarriors() {
        await expect(this.warriorsList).toContainText('Bug Hunter');
        await expect(this.warriorsList).toContainText('Code Guardian');
        await expect(this.warriorsList).toContainText('Test Mage');
    }

}
