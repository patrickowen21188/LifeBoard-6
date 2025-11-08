// This object is the single source of truth for the entire game.
export let gameState = {};

// This object stores a snapshot of the game state at the START of the current turn.
// It's used by the new "Undo" logic to reset any interim actions.
export let turnStartState = {};

import * as FinanceLogic from './finance-logic.js';
// --- NEW: Import difficulty settings for initialization ---
import { difficultySettings } from './assets/data/difficulties.js';

// This function sets up the initial state structure (pre-game).
// It is called once when the app loads.
export function initGameState() {
    const initialState = {
        // --- NEW: Game Flow Control (Default values before selection) ---
        gameStarted: false, // Flag set after difficulty/goal chosen
        chosenDifficulty: null, // Stores the ID of the chosen difficulty
        chosenGoal: null, // Stores the ID of the chosen goal
        turnLengthInMonths: 3, // Default, overridden by difficulty (3 or 6)
        
        year: 15,
        month: 0,
        money: 0, // Initial money set by difficulty
        cashFlow: 0,
        wellBeing: 0, // Initial wellbeing set by difficulty
        isGameOver: false,
        newsLog: [],
        profileLog: [],
        activeJobs: [],
        subscriptions: [],
        insurances: [],
        investments: [],
        home: null,
        mortgage: 0,
        personalLoan: 0,
        hecsDebt: 0,
        activeGlobalEffects: {}, // Holds effects from News events

        tax: {
            annualGrossIncomeSources: {}, // e.g., { 'Job: Barista': 20000, 'Property: 123 Main St': 5000 }
            annualTaxPaid: 0,       // Tracks PAYG tax withheld for the year
            taxLodgeHistory: []     // A log of all past tax returns
        },
        superannuation: {
            value: 0,               // The player's total super balance
            transactions: []        // A log of all contributions, growth, and fees
        },
        
        pathwayChosen: null, // Stores the chosen pathway object once selected
        
        priceIndex: 1.0, // Tracks inflation for goods, services, property
        wageIndex: 1.0,  // Tracks inflation for salaries

        isTraveling: false,

        actionLog: [],

        notificationCounts: {
            Profile: 0,
            News: 0,
            Jobs: 0,
            Lifestyle: 0,
            Property: 0,
            ATO: 0
        }
    };
    
    // Set the initial game state structure
    Object.assign(gameState, JSON.parse(JSON.stringify(initialState)));
    
    // Set the initial "turn start" state structure
    Object.assign(turnStartState, JSON.parse(JSON.stringify(initialState)));

    window.gameState = gameState; // Expose globally for UI components
    // NOTE: calculateCashFlow is NOT called here. It will be called after difficulty is chosen.
}

/**
 * NEW FUNCTION: Called after the player selects difficulty and goal.
 * This sets the final initial state and starts the game.
 * @param {string} difficultyId - The ID of the chosen difficulty ('learning', 'normal', 'advance').
 * @param {string} goalId - The ID of the chosen goal.
 */
export function applyDifficultyAndGoal(difficultyId, goalId) {
    const settings = difficultySettings[difficultyId];
    if (!settings) {
        console.error(`Difficulty ID ${difficultyId} not found.`);
        return false;
    }

    // 1. Apply Initial State from Difficulty Settings
    gameState.money = settings.initialState.money;
    gameState.wellBeing = settings.initialState.wellBeing;
    gameState.turnLengthInMonths = settings.turnLengthInMonths;

    // 2. Apply Persistent Effects (if any)
    // NOTE: This currently has no persistent effects, but structure is ready.

    // 3. Set Game Flags
    gameState.chosenDifficulty = difficultyId;
    gameState.chosenGoal = goalId;
    gameState.gameStarted = true;

    // 4. Set Initial Previous State for Undo/Animations
    Object.assign(turnStartState, JSON.parse(JSON.stringify(gameState)));

    // 5. Initial Calculations
    calculateCashFlow();

    // 6. Notify UI (This will trigger HUD animations and timeline generation)
    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'confirm' } }));
    return true;
}


/*
   It calculates GROSS income, then deducts PAYG tax and adds SGC super
   before calculating the final net cash flow.
*/
export function calculateCashFlow() {
    let grossIncomePerTurn = 0;
    let expensesPerTurn = 0;
    
    let incomeSourcesThisTurn = {};
    
    // --- NEW: Calculate the factor used to scale annual numbers to a single turn ---
    const turnsPerYear = 12 / gameState.turnLengthInMonths;

    // --- 1. Calculate Gross Income Per Turn ---
    if (gameState.home && gameState.home.purchaseType === 'buy' && gameState.home.status === 'rented_out') {
        if (gameState.home.options.rent) {
            // rentPerTurn values in data are based on 3-month turns. Scale them based on chosen turn length.
            const baseRent = gameState.home.options.rent.rentPerTurn;
            const scaledRent = (baseRent / 3) * gameState.turnLengthInMonths;
            
            const rentAmount = scaledRent * gameState.priceIndex;
            const sourceName = `Property: ${gameState.home.name}`;
            incomeSourcesThisTurn[sourceName] = rentAmount;
            grossIncomePerTurn += rentAmount;
        }
    }
    
    gameState.activeJobs.forEach(job => {
        const rate = job.juniorRates?.[gameState.year] || job.hourlyRate;
        // Annual job income is based on (rate * hours * 12 months).
        // Divide by turnsPerYear to get the correct amount for this turn.
        const annualJobIncome = (rate * job.weeklyHoursBase * 12) * gameState.wageIndex;
        const jobIncomePerTurn = annualJobIncome / turnsPerYear;
        
        const sourceName = `Job: ${job.name}`;
        
        incomeSourcesThisTurn[sourceName] = (incomeSourcesThisTurn[sourceName] || 0) + jobIncomePerTurn;
        grossIncomePerTurn += jobIncomePerTurn;
    });


    // --- 2. Calculate & Process Tax and Super ---
    // Pass the calculated *annual* income to tax logic (the scaling by turn length is handled in finance-logic)
    const annualGrossIncome = grossIncomePerTurn * turnsPerYear; 
    
    // Pass the entire gameState for turn length dependency
    const taxWithheldThisTurn = FinanceLogic.calculatePAYG(gameState, annualGrossIncome); 
    const superContributionThisTurn = FinanceLogic.calculateSGC(annualGrossIncome, gameState.year, gameState); 
    
    const turn = `${gameState.year}Y ${gameState.month}M`;

    // Add SGC to super balance and log it
    if (superContributionThisTurn > 0) {
        gameState.superannuation.value += superContributionThisTurn;
        gameState.superannuation.transactions.unshift({
            id: `sgc_${turn}`,
            turn: turn,
            type: "Employer Contribution (SGC)",
            details: `SGC for ${gameState.turnLengthInMonths} months`,
            amount: superContributionThisTurn
        });
    }

    // Track annual totals for tax lodgement by source
    for (const source in incomeSourcesThisTurn) {
        gameState.tax.annualGrossIncomeSources[source] = (gameState.tax.annualGrossIncomeSources[source] || 0) + incomeSourcesThisTurn[source];
    }
    gameState.tax.annualTaxPaid += taxWithheldThisTurn;

    // --- 3. Calculate Expenses ---
    const { 
        lifestyleMultiplier = 1, 
        housingMultiplier = 1, 
        transportMultiplier = 1 
    } = gameState.activeGlobalEffects.expenses || {};

    // Base expense data is typically for a 3-month turn, so we scale it.
    const expenseScaleFactor = gameState.turnLengthInMonths / 3;

    gameState.subscriptions.forEach(sub => expensesPerTurn += (sub.costPerTurn * gameState.priceIndex) * lifestyleMultiplier * expenseScaleFactor);
    gameState.insurances.forEach(plan => expensesPerTurn += (plan.premiumPerTurn * gameState.priceIndex) * expenseScaleFactor);
    
    if (gameState.home) {
        if (gameState.home.purchaseType === 'rent') {
            expensesPerTurn += (gameState.home.options.rent.rentPerTurn * gameState.priceIndex) * housingMultiplier * expenseScaleFactor;
            expensesPerTurn += (gameState.home.options.rent.maintenancePerTurn || 0) * gameState.priceIndex * housingMultiplier * expenseScaleFactor;
        } else { // 'buy'
            // Mortgage payments (lockedInMortgage) are originally calculated for a 3-month turn. Scale payment.
            const scaledMortgage = (gameState.home.lockedInMortgage / 3) * gameState.turnLengthInMonths;
            expensesPerTurn += scaledMortgage * housingMultiplier;
            expensesPerTurn += (gameState.home.options.buy.maintenancePerTurn || 0) * gameState.priceIndex * housingMultiplier * expenseScaleFactor;
        }
    }
    
    // Add transport costs based on home/work zones (300 is a base 3-month cost, so scale it)
    if (gameState.home && gameState.activeJobs.length > 0) {
        const homeZone = gameState.home.zone || 'suburb';
        gameState.activeJobs.forEach(job => {
            if (homeZone !== job.workZone) {
                expensesPerTurn += (300 * gameState.priceIndex) * transportMultiplier * expenseScaleFactor; 
            }
        });
    }

    // --- 4. Calculate Final Net Cash Flow ---
    const netIncomePerTurn = grossIncomePerTurn - taxWithheldThisTurn;
    gameState.cashFlow = netIncomePerTurn - expensesPerTurn;
}