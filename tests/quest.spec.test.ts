import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/MainPage';
import { QuestConfigPage } from '../pages/QuestConfigPage';
import { QuestPage } from '../pages/QuestPage';


// Test data for reuse
const testData = {
    questName: 'Go Go Game',
    questDescription: 'New Game the best',
    customAction: 'Perform special test',
    invalidAction: '',
    qaWarriors: [
        { name: 'Bug Hunter', description: /bugs|defects/i },
        { name: 'Code Guardian', description: /code|protect/i },
        { name: 'Test Mage', description: /test|magic/i }
    ]
};

test.describe('Quest Page Functional Tests', () => {
    let mainPage: MainPage;
    let questConfigPage: QuestConfigPage;
    let questPage: QuestPage;

    // Setup before each test
    test.beforeEach(async ({ page }) => {

        // Initialize page objects
        mainPage = new MainPage(page);
        questConfigPage = new QuestConfigPage(page);
        questPage = new QuestPage(page);

        // Navigate through pages to set up the Quest page
        await mainPage.goto();
        await mainPage.verifyMainPageLoaded();
        await mainPage.clickStartQuest();

        await questConfigPage.verifyConfigPageLoaded();
        await questConfigPage.configureQuest(testData.questName, testData.questDescription);
        await questConfigPage.initiateAdventure();
        await questConfigPage.embarkOnTest();
    });

    // Test 2.1: Quest Details
    test('2.1 - Verify quest details are displayed correctly', async () => {
        // Verify quest name and description
        await expect(questPage.questName).toHaveText(`QA Quest: ${testData.questName}`);
        await expect(questPage.questDescription).toHaveText(testData.questDescription);
    });

    // Test 2.2: Progress Tracking
    test('2.2 - Progress tracking functionality works correctly', async () => {

        await questPage.verifyProgress('30% Defect-Free', 30);


        // 1. Verify initial state (30% by default)
        await questPage.verifyProgress('30% Defect-Free', 30);
        await questPage.waitForProgressUpdate(() => questPage.fixBugButton.click(), 10);


        // 2. Test increasing progress by fixing bugs (+10%)
        await questPage.waitForProgressUpdate(
            () => questPage.fixBugButton.click(),
            10,
            'Progress: 30% Defect-Free'
        );

        // 3. Test decreasing progress by finding bugs (-10%)
        await questPage.waitForProgressUpdate(
            () => questPage.findBugButton.click(),
            -10
        );
        //  await questPage.verifyProgress('Progress: 30% Defect-Free', 30);

        // 4. Test reaching 100% (victory) 
        await questPage.resetProgress();
        for (let i = 0; i < 7; i++) {
            await questPage.waitForProgressUpdate(
                () => questPage.fixBugButton.click(),
                10
            );
        }
        await questPage.verifyVictoryAlert();

        // 5. Test reaching 0% (failure)
        await questPage.resetProgress();
        for (let i = 0; i < 3; i++) {
            await questPage.waitForProgressUpdate(
                () => questPage.findBugButton.click(),
                -10
            );
        }
        await questPage.verifyFailureAlert();
    });

    // Test 2.3: Rewards System
    test('2.3 - Rewards system functions correctly', async () => {
        // Verify initial reward counts
        expect(await questPage.getGoldCoinsCount()).toBe(0);
        expect(await questPage.getArtifactsCount()).toBe(0);
        expect(await questPage.getDaysOffCount()).toBe(0);

        // Test "Claim Bonus" button - adds 10 Gold Coins
        await questPage.claimBonusButton.click();
        expect(await questPage.getGoldCoinsCount()).toBe(10);

        // Test "Obtain QA Artifact" button - adds 1 Artifact
        await questPage.obtainArtifactButton.click();
        expect(await questPage.getArtifactsCount()).toBe(1);

        // Test "Earn Days Off" button - adds 5 Days Off

        await questPage.earnDaysOffButton.click();
        expect(await questPage.getDaysOffCount()).toBe(5);
    });

    // Test 2.4: Action Buttons
    test('2.4 - Action buttons function correctly', async () => {
        // Test Fix Bug button functionality
        const initialProgress = await questPage.getProgressValue();
        await questPage.fixBugButton.click();
        await questPage.waitForProgressToUpdate(initialProgress + 10);

        // Test Find Bug button functionality
        await questPage.findBugButton.click();
        await questPage.waitForProgressToUpdate(initialProgress);

        // Test reward buttons functionality 
        const initialGoldCoins = await questPage.getGoldCoinsCount();
        const initialArtifacts = await questPage.getArtifactsCount();
        const initialDaysOff = await questPage.getDaysOffCount();

        // Verify "Claim Bonus" button
        await questPage.claimBonus();
        expect(await questPage.getGoldCoinsCount()).toBe(initialGoldCoins + 10);

        // Verify "Obtain QA Artifact" button
        await questPage.obtainArtifact();
        expect(await questPage.getArtifactsCount()).toBe(initialArtifacts + 1);

        // Verify "Earn Days Off" button
        await questPage.earnDaysOff();
        expect(await questPage.getDaysOffCount()).toBe(initialDaysOff + 5);
    });

    // Test 2.5: Custom Actions
    test('2.5 - Custom actions input works correctly', async () => {
        // Test valid custom action
        await questPage.performCustomAction(testData.customAction);
        await questPage.verifyCustomActionNotification(testData.customAction);

        // Test invalid/empty input
        await questPage.performCustomAction(testData.invalidAction);
        await questPage.verifyEmptyActionNotification();
    });

    // Test 2.6: Custom Alerts
    test('2.6 - Custom alerts are displayed correctly', async ({ page }) => {
        // Test victory alert
        await questPage.fixBugsUntilVictory();
        await questPage.verifyVictoryAlert();

        // Reset test environment and test failure alert
        await page.reload();
        await questPage.resetProgress();
        await questPage.findBugsUntilFailure();
        await questPage.verifyFailureAlert();

        // Reset test environment and test custom action alert
        await page.reload();
        await questPage.performCustomAction(testData.customAction);
        await questPage.verifyCustomActionNotification(testData.customAction);
    });

    // Test 2.7: QA Warriors
    test('2.7 - QA Warriors are displayed correctly', async () => {
        // Verify warrior names are displayed in the list
        await expect(questPage.warriorsList).toContainText('Bug Hunter');
        await expect(questPage.warriorsList).toContainText('Code Guardian');
        await expect(questPage.warriorsList).toContainText('Test Mage');

        const count = await questPage.getQAWarriorsCount();
        console.log(`Total warriors found: ${count}`);
        expect(count).toBe(3);

        const expectedNames = [
            'Warrior 1: Bug Hunter',
            'Warrior 2: Code Guardian',
            'Warrior 3: Test Mage'
        ];

        for (let i = 0; i < expectedNames.length; i++) {
            const actual = await questPage.getQAWarriorName(i);
            console.log(`Warrior ${i + 1} text: ${actual}`);
            expect(actual.trim()).toBe(expectedNames[i]);
        }
    });

});
