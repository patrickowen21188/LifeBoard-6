import { gameState } from './state.js';
import { showTutorialModal, startInactivityTimer } from './ui-controller.js';
import * as Game from './game-logic.js';

// --- TUTORIAL SCRIPT DATA ---
// This array holds the script and the logic for the "Next" button label
const TUTORIAL_STEPS = [
    // Step 0: Welcome! (Get a Job) - Triggered by tablet-main.js after Goal select
    {
        title: "👋 Welcome to LifeBoard!",
        body: "Let's get you started! Your first goal is to make some money. You can't do anything without cash, right?<br><br>Go to the **'Jobs' tab** (the green one with the briefcase) and pick your first job!",
        tip: "Look at the 'Junior Rates'! In Australia, your pay rate is based on your age. It'll go up automatically as you get older. Pretty cool!",
        buttonLabel: "Got it!"
    },
    // Step 1: You're Hired! (Explains Super) - Triggered by action in tablet-main.js
    {
        title: "🎉 You're Hired!",
        body: "Awesome! You'll get your first paycheck at the end of the turn. But look out—having a job adds stress. This will lower your **Wellbeing** (the ❤️ icon) *every* turn.<br><br>Let's end the turn and see what happens.",
        tip: "P.S. Your boss is also paying into your **Superannuation** (your retirement fund) *for free*! That's the law! You can see it in the 'Super' tab.",
        buttonLabel: "Okay, next turn!"
    },
    // Step 2: Your Dashboard! (Explains Profile Tab) - Triggered by handleNextTurn (turn 1)
    {
        title: "📈 Your Dashboard: The 'Profile' Tab",
        body: "Okay, your first turn is done! Go to the **'Profile' tab** (the blue one). This is your main dashboard!<br><br>You can see your **Goal**, your new **Job**, and... oh! Your **Wellbeing** dropped. That's the stress from working. We need to fix that, or it's Game Over!",
        tip: "This 'Status' page shows everything you own and owe. Check your 'Cash Flow' and 'Net Worth' sub-tabs here to see exactly where your money is going.",
        buttonLabel: "Got it. Fix wellbeing!"
    },
    // Step 3: Feeling the Burn... (Explains Lifestyle) - Triggered immediately after Step 2 closes
    {
        title: "😴 Feeling a Bit Tired...",
        body: "Time to fix your Wellbeing. Go to the **'Lifestyle' tab** (the pink one) and buy something fun.<br><br>A **'Movie Night'** (one-time purchase) or a **'Video Streaming'** (recurring subscription) will do the trick!",
        tip: "This is the core loop: **Work for Money, then use Money for Wellbeing.**",
        buttonLabel: "Let's go!"
    },
    // Step 4: Time to Save! (Explains Bank) - Triggered after first Lifestyle purchase
    {
        title: "💸 Don't Just Spend It!",
        body: "Great! That'll boost your mood. Now, see that leftover cash in your Wallet? It's not doing anything. Let's put it to work.<br><br>Go to the **'Bank' tab** (the yellow one) and invest in the **'High-Yield Online Savings'**. It's super safe and will earn you interest every turn!",
        buttonLabel: "To the Bank!"
    },
    // Step 5: You're an Investor! (Explains Investment Growth) - Triggered after first investment
    {
        title: "🤑 You're an Investor!",
        body: "Nice one! That money will now earn *more* money all by itself. This is called 'compounding'.<br><br>At the end of every turn, your investments (and your Super!) will grow. You can track this in the **'My Investment'** sub-tab.",
        buttonLabel: "Sweet! Next Turn."
    },
    // Step 6: It's Tax Time! (Explains Tax Lodge) - Triggered by handleNextTurn (Age 15/16, Month 6)
    {
        title: "🧾 It's Tax Time!",
        body: "Your first tax return has been lodged automatically! This is where the ATO checks if you paid the right amount of tax during the year.<br><br>It looks like you got a **Tax Refund**! This means you paid *too much* tax, so the ATO is giving it back. Nice bonus!",
        tip: "Sometimes you might get a **Tax Bill** if you didn't pay *enough* tax. You can see all your past tax returns in the **'ATO' tab**.",
        buttonLabel: "Awesome!"
    },
    // Step 7: The "Sick Day" Event (Explains Medicare) - Triggered by action in game-logic.js if medical event hits
    {
        title: "🤒 Ouch! That's Life...",
        body: "Oh no, a random event! You got a medical bill.<br><br>But look! Your **Medicare** (which you get for free) automatically covered some of the cost. That's a relief!",
        tip: "If you had 'Basic Health Insurance' (from the 'Insurance' tab), it would have covered even more. Insurance is for reducing the cost of nasty surprises.",
        buttonLabel: "Phew, thanks Medicare!"
    },
    // Step 8: The Big Decision! (Explains Pathway) - Triggered by handleNextTurn at Age 18
    {
        title: "🎓 Time for a Big Choice!",
        body: "You're 18! The game is paused. You *must* choose your **Pathway**.<br><br>This is a huge decision that unlocks new, high-paying jobs but might give you a massive HECS debt. Check out the **'Pathway' tab** (the purple one) now!",
        buttonLabel: "Okay, this is big..."
    },
    // Step 9: About That Debt... (Explains HECS) - Triggered by action in game-logic.js after pathway choice
    {
        title: "🧑‍🎓 About That HECS Debt...",
        body: "Great choice! You'll see you now have a **HECS Debt** (check your 'Net Worth' on the Profile tab). This is a government loan for your studies.<br><br>The good news? You don't pay it back until you start earning a high income. It's the 'best' debt you can have!",
        tip: "Remember, as a student you're restricted to part-time jobs until you're 24. Go to the 'Jobs' tab to find one!",
        buttonLabel: "Got it!"
    },
    // Step 10: Time to Move Out! (Nudge to Property) - Triggered by handleNextTurn at Age 22
    {
        title: "🏡 Time to Move Out?",
        body: "You're 22 and (probably) finishing your studies! It's time to move out of your parents' place. The **'Property' tab** is now your best friend.<br><br>But be careful! Where you live affects your budget.",
        tip: "Living far from work ('Outer' zone) is cheap, but **transport costs** will be very high! Check your 'Cash Flow' (in the Profile tab) after you move to see the impact.",
        buttonLabel: "Let's look!"
    },
    // Step 11: Rent vs. Buy (Explains Mortgage/Cost) - Triggered after player first clicks on a property item in the Property tab
    {
        title: "🔑 Renting vs. Buying",
        body: "Okay, you have two choices:<br><br>**Renting:** This is a simple, recurring expense. It's flexible, but the money is 'gone' every turn.<br><br>**Buying:** This is a *huge* commitment. You need a **20% cash deposit** to get a **Mortgage** (a giant loan). You'll be in debt for years, but you'll be building an *asset*.",
        tip: "A mortgage is 'good debt' because it's for an asset that can grow in value. But the interest payments will be a major drain on your cash flow!",
        buttonLabel: "Decisions, decisions..."
    },
    // Step 12: (Conditional) Pack Your Bags! (Explains Travel Insurance) - Triggered after player buys a holiday
    {
        title: "✈️ Pack Your Bags!",
        body: "Nice! You're going on holiday. But wait! What if something goes wrong?<br><br>A random event (like getting sick or an accident) would be *super* expensive right now. Go to the **'Insurance' tab** and buy **'Travel Insurance'** *before* you end your turn. It's cheap peace of mind.",
        tip: "Travel insurance is a 'must-have' for any big trip, just in case.",
        buttonLabel: "Good idea!"
    }
];

// Stores the next step to be shown after the modal is closed.
let nextStepIndexAfterClose = -1;

/**
 * Executes a step of the tutorial.
 * @param {number} stepIndex - The index of the step to show.
 * @param {boolean} [forced=false] - True if triggered by game event (like sickness), ignoring tutorial step counter.
 */
function executeStep(stepIndex, forced = false) {
    // Only run if in 'learning' difficulty AND game is in progress
    const isLearningMode = gameState.chosenDifficulty === 'learning';
    if (!isLearningMode || gameState.isGameOver) return;
    
    // Check if we are jumping ahead (e.g., from an event trigger) or if it's the expected next step
    if (!forced && stepIndex !== gameState.tutorialStep) return;
    if (stepIndex >= TUTORIAL_STEPS.length) return;

    const step = TUTORIAL_STEPS[stepIndex];

    // Set the state to the current step (important for subsequent triggers)
    gameState.tutorialStep = stepIndex; 

    // Store the next step index for when the modal closes
    nextStepIndexAfterClose = stepIndex + 1;

    // Show the modal
    showTutorialModal(step.title, step.body, step.tip, step.buttonLabel);
}

/**
 * Advances the tutorial one step after the modal is closed.
 * Called by showTutorialModal (in ui-controller) when the player clicks 'Next'.
 */
export function advanceTutorial() {
    // If the modal was closed, fire the next logical step that was stored.
    if (gameState.chosenDifficulty !== 'learning') return;

    // If step 3 closed, immediately show step 4 (Fix Wellbeing -> Time to Save)
    if (nextStepIndexAfterClose === 4) {
        // We handle Step 4 (Time to Save) here, and Step 5 is triggered by an action
        gameState.tutorialStep = 4;
        const step = TUTORIAL_STEPS[3]; // We need Step 3 content (Feeling the Burn)
        showTutorialModal(step.title, step.body, step.tip, step.buttonLabel);
        return;
    }
    
    // For all other linear steps, just advance the counter.
    // The next action-based trigger will then pick up where we left off.
    gameState.tutorialStep = nextStepIndexAfterClose;
    nextStepIndexAfterClose = -1; // Reset until next modal show
}

// --- EXPORTED TRIGGERS ---

export const tutorialManager = {
    // Called by tablet-main.js after the user selects a Goal (Game Start)
    start: () => {
        executeStep(0);
    },

    // Called by tablet-main.js after a job is taken
    onJobTaken: () => {
        if (gameState.tutorialStep === 0) {
            executeStep(1); // Step 1: You're Hired!
        }
    },

    // Called by game-logic.js after the first successful turn
    onFirstTurnComplete: () => {
        // Only run after the first successful turn (age 15Y 3M or 15Y 6M)
        if (gameState.tutorialStep === 1) {
            executeStep(2); // Step 2: Your Dashboard! (Explains Profile)
        }
    },

    // Called by tablet-main.js after a lifestyle item is purchased
    onLifestylePurchased: () => {
        if (gameState.tutorialStep === 3) {
            executeStep(4); // Step 4: Time to Save! (Explains Bank)
        }
    },

    // Called by tablet-main.js after an investment is made
    onInvestmentMade: () => {
        if (gameState.tutorialStep === 4) {
            executeStep(5); // Step 5: You're an Investor!
        }
    },

    // Called by game-logic.js after a Tax Lodgement is made
    onTaxLodged: () => {
        if (gameState.tutorialStep === 5) {
            executeStep(6, true); // Step 6: It's Tax Time! (Forced event)
        }
    },

    // Called by game-logic.js when a medical event is processed
    onMedicalEvent: (isInsuranceCovered) => {
        // Check if the player is ready for the insurance/medicare explanation
        if (gameState.tutorialStep === 6) {
            executeStep(7, true); // Step 7: The "Sick Day" Event (Forced event)
        }
    },
    
    // Called by game-logic.js at Age 18
    onAge18Pause: () => {
        if (gameState.tutorialStep < 8) {
             executeStep(8, true); // Step 8: The Big Decision!
        }
    },

    // Called by game-logic.js after Pathway is chosen (if Vocational or Uni)
    onPathwayChosen: (pathwayName) => {
        if (gameState.tutorialStep === 8 && (pathwayName === 'Vocational' || pathwayName === 'University')) {
            executeStep(9, true); // Step 9: About That HECS Debt...
        }
    },

    // Called by game-logic.js at Age 22
    onAge22Unpause: () => {
        if (gameState.tutorialStep < 10) {
            executeStep(10, true); // Step 10: Time to Move Out!
        }
    },

    // Called by tablet-main.js when a property details button is clicked
    onPropertyDetailsClicked: () => {
        if (gameState.tutorialStep === 10) {
            executeStep(11, true); // Step 11: Rent vs. Buy
        }
    },
    
    // Called by game-logic.js when a holiday is purchased
    onHolidayPurchased: () => {
        // This is the last step, so we don't advance the counter after it.
        executeStep(12, true); // Step 12: Pack Your Bags!
    }
};