/**
 * finance-logic.js
 * * This new file acts as the "Financial Engine" for the game.
 * It handles all complex calculations for Australian Tax (PAYG, Lodgement)
 * and Superannuation (SGC, Growth, Fees) to keep the core game logic clean.
 */

// TAX CONSTANTS (Based on 2024-2025 Rates for realism)
// Note: These are annual brackets. We will scale them for turn-based calculations.
const TAX_BRACKETS = [
    { threshold: 120000, rate: 0.37, base: 29467 },
    { threshold: 45000, rate: 0.30, base: 5092 },
    { threshold: 18200, rate: 0.19, base: 0 }
    // $0 - $18,200 is 0%
];
// Medicare Levy
const MEDICARE_LEVY_RATE = 0.02;

// SUPER CONSTANTS (Based on Nov 2025 realism)
const SGC_RATE = 0.115; // 11.5% as of July 2024
const SUPER_TAX_ON_GROWTH = 0.15; // 15% tax on concessional contributions & growth
const SUPER_ADMIN_FEE_PER_TURN = 15; // This is the BASE FEE FOR A 3-MONTH TURN ($5/month)
const SUPER_GROWTH_RATE_MIN = 0.04; // 4% p.a. min growth
const SUPER_GROWTH_RATE_MAX = 0.08; // 8% p.a. max growth


/**
 * Calculates the PAYG tax to be withheld for a single turn.
 * @param {object} gameState - The entire game state.
 * @param {number} annualGrossIncome - The pre-calculated, inflated annual gross income.
 * @returns {number} The PAYG tax amount to withhold this turn.
 */
export function calculatePAYG(gameState, annualGrossIncome) {
    if (annualGrossIncome <= 18200) {
        return 0; // Below tax-free threshold
    }

    let annualTax = 0;
    
    // 1. Calculate Income Tax
    for (const bracket of TAX_BRACKETS) {
        if (annualGrossIncome > bracket.threshold) {
            annualTax = (annualGrossIncome - bracket.threshold) * bracket.rate + bracket.base;
            break;
        }
    }

    // 2. Add Medicare Levy
    const medicareLevy = annualGrossIncome * MEDICARE_LEVY_RATE;
    annualTax += medicareLevy;

    // 3. Add HECS/HELP Repayment
    const { hecsDebt, wageIndex } = gameState;
    let hecsRepayment = 0;
    
    const HECS_THRESHOLD = 55000;
    const HECS_RATE = 0.04; 
    
    const inflatedHecsThreshold = HECS_THRESHOLD * wageIndex;

    if (hecsDebt > 0 && annualGrossIncome > inflatedHecsThreshold) {
        hecsRepayment = annualGrossIncome * HECS_RATE;
        hecsRepayment = Math.min(hecsDebt, hecsRepayment); // Don't overpay
        annualTax += hecsRepayment; // Add HECS to the total tax to be withheld
    }

    // --- MODIFIED: Use dynamic turn length to scale tax ---
    const turnsPerYear = 12 / gameState.turnLengthInMonths;
    // Return the amount for *this turn*
    return annualTax / turnsPerYear;
}

/**
 * Calculates the SGC (Super) contribution for a single turn.
 * @param {number} annualGrossIncome - The pre-calculated, inflated annual gross income.
 * @param {number} year - from gameState.year
 * @param {object} gameState - The entire game state (for turnLengthInMonths).
 * @returns {number} The SGC amount to contribute this turn.
 */
export function calculateSGC(annualGrossIncome, year, gameState) {
    const annualSGC = annualGrossIncome * SGC_RATE;
    
    // --- MODIFIED: Use dynamic turn length to scale SGC ---
    const turnsPerYear = 12 / gameState.turnLengthInMonths;
    // Return the amount for *this turn*
    return annualSGC / turnsPerYear;
}

/**
 * Processes superannuation and investment growth/fees for the turn.
 * Called by handleNextTurn() in game-logic.js
 * @param {object} gameState - The entire game state.
 * @param {string} turn - The current turn string (e.g., "18Y 3M").
 */
export function processTurnFinance(gameState, turn) {
    const superState = gameState.superannuation;
    const balance = superState.value;
    
    // --- NEW: Calculate turn factor for scaling annual data ---
    const turnsPerYear = 12 / gameState.turnLengthInMonths;
    // Scale the Admin Fee (which is based on a 3-month turn)
    const scaledAdminFee = (SUPER_ADMIN_FEE_PER_TURN / 3) * gameState.turnLengthInMonths;
    // --- END NEW ---
    
    // --- 1. Process Super ---
    if (balance > 0) {
        // 1a. Calculate Investment Growth
        // (Rate p.a. / turnsPerYear) to get per-turn rate
        const turnGrowthRate = (Math.random() * (SUPER_GROWTH_RATE_MAX - SUPER_GROWTH_RATE_MIN) + SUPER_GROWTH_RATE_MIN) / turnsPerYear;
        let growthAmount = balance * turnGrowthRate;
        
        // 1b. Calculate Tax on Growth
        let taxOnGrowth = growthAmount * SUPER_TAX_ON_GROWTH;

        // 1c. Apply changes
        const netGrowth = growthAmount - taxOnGrowth;
        const finalBalance = balance + netGrowth - scaledAdminFee; // MODIFIED: Use scaledAdminFee
        
        superState.value = finalBalance;

        // 1d. Add transactions to history (newest first)
        superState.transactions.unshift({
            id: `t_${turn}_fee`,
            turn: turn,
            type: "Fees & Tax",
            details: `Admin Fee ($${scaledAdminFee.toFixed(2)}) & Tax ($${taxOnGrowth.toFixed(2)})`, // MODIFIED: Use scaledAdminFee in details
            amount: -(scaledAdminFee + taxOnGrowth) // MODIFIED: Use scaledAdminFee
        });
        superState.transactions.unshift({
            id: `t_${turn}_growth`,
            turn: turn,
            type: "Investment Growth",
            details: `Grew by ${(turnGrowthRate * 100).toFixed(2)}%`,
            amount: growthAmount
        });
    }

    // --- 2. Process Investments ---
    gameState.investments.forEach(inv => {
        if (inv.value <= 0) {
            inv.lastTurnGrowth = 0;
            return;
        }

        // 2a. Calculate Total Return
        const turnReturnRate = (Math.random() * (inv.expectedAnnualReturnMax - inv.expectedAnnualReturnMin) + inv.expectedAnnualReturnMin) / turnsPerYear; // MODIFIED: Use turnsPerYear
        const totalReturnAmount = inv.value * turnReturnRate;

        // 2b. Calculate Fees (based on total value)
        const feeAmount = (inv.value * inv.feeRate) / turnsPerYear; // MODIFIED: Use turnsPerYear
        
        // 2c. Calculate Net Return (Total Return - Fees)
        const netReturn = totalReturnAmount - feeAmount;

        // 2d. Split *Net Return* into Income (paid to wallet) vs. Growth (reinvested)
        let incomePortion = 0;
        if (inv.incomeType === 'interest') {
            incomePortion = 1.0; // All return is interest
        } else if (inv.incomeType === 'dividends' && inv.incomeSplit?.dividendsPortion) {
            incomePortion = inv.incomeSplit.dividendsPortion;
        } else if (inv.incomeType === 'mixed' && inv.incomeSplit?.incomePortion) {
            incomePortion = inv.incomeSplit.incomePortion;
        }

        const incomeAmount = netReturn * incomePortion;
        const growthAmount = netReturn * (1 - incomePortion);
        
        // Calculate and store growth numbers
        const netGrowth = growthAmount;
        inv.lastTurnGrowth = netGrowth;
        
        // Initialize YTD if it doesn't exist
        if (inv.growthYTD === undefined) inv.growthYTD = 0;
        
        inv.growthYTD += netGrowth;

        // 2e. Apply changes
        inv.value += netGrowth; // Growth is reinvested

        if (incomeAmount > 0) {
            // Income is paid to wallet and is taxable
            gameState.money += incomeAmount;
            const sourceName = `Investment: ${inv.name}`;
            gameState.tax.annualGrossIncomeSources[sourceName] = (gameState.tax.annualGrossIncomeSources[sourceName] || 0) + incomeAmount;
        }

        // Log transactions to history array
        if (totalReturnAmount !== 0) {
            inv.history.push({ type: 'Investment Growth', amount: totalReturnAmount, turn: turn });
        }
        if (incomeAmount > 0) {
            inv.history.push({ type: 'Income Paid', amount: incomeAmount, turn: turn });
        }
        if (feeAmount > 0) {
            inv.history.push({ type: 'Fees', amount: -feeAmount, turn: turn });
        }
    });
}

/**
 * Simulates lodging an annual tax return.
 * Compares tax paid (PAYG) vs tax owed.
 * Called by handleNextTurn() in game-logic.js once per year.
 * @param {object} gameState - The entire game state.
 */
export function lodgeTaxReturn(gameState) {
    const turn = `${gameState.year}Y ${gameState.month}M`;
    const financialYear = `${gameState.year - 1}-${gameState.year}`;
    const { annualGrossIncomeSources, annualTaxPaid } = gameState.tax;
    let { hecsDebt } = gameState;


    // Calculate total gross income from the sources object
    let annualGrossIncome = 0;
    for (const source in annualGrossIncomeSources) {
        annualGrossIncome += annualGrossIncomeSources[source];
    }

    // Reset Investment YTD Growth
    gameState.investments.forEach(inv => {
        inv.growthYTD = 0;
        inv.lastTurnGrowth = 0; // Also reset this for a clean start
    });

    if (annualGrossIncome <= 18200) {
        // No income, or below threshold. Refund all tax paid (if any).
        const refund = annualTaxPaid;
        gameState.money += refund;
        
        // Log the lodgement
        const description = `You lodged your ${financialYear} tax return. Your income was below the tax-free threshold, so all $${annualTaxPaid.toFixed(2)} you paid in PAYG was refunded.`;
        const lodgeEvent = {
            id: `lodge_${financialYear}`,
            turn: turn,
            title: `Tax Lodgement ${financialYear}`,
            financialYear: financialYear,
            incomeSources: JSON.parse(JSON.stringify(annualGrossIncomeSources)),
            grossIncome: annualGrossIncome,
            taxWithheld: annualTaxPaid,
            taxOwed: 0,
            hecsRepayment: 0,
            finalAmount: refund, // Positive = refund
            description: description
        };
        gameState.tax.taxLodgeHistory.unshift(lodgeEvent);
        
        gameState.tax.annualGrossIncomeSources = {};
        gameState.tax.annualTaxPaid = 0;
        
        document.dispatchEvent(new CustomEvent('tax-update', { 
            detail: { isPositive: true, message: description } 
        }));
        return;
    }

    // --- 1. Calculate Final Tax Owed ---
    let totalTaxOwed = 0;
    
    // Income Tax
    for (const bracket of TAX_BRACKETS) {
        if (annualGrossIncome > bracket.threshold) {
            totalTaxOwed = (annualGrossIncome - bracket.threshold) * bracket.rate + bracket.base;
            break;
        }
    }
    // Medicare Levy
    totalTaxOwed += annualGrossIncome * MEDICARE_LEVY_RATE;
    
    // --- 2. Calculate HECS/HELP Repayment ---
    let hecsRepayment = 0;
    // Simplified HECS threshold & rate (e.g., 4% over $55k)
    const HECS_THRESHOLD = 55000;
    const HECS_RATE = 0.04; 
    
    const inflatedHecsThreshold = HECS_THRESHOLD * gameState.wageIndex;

    if (hecsDebt > 0 && annualGrossIncome > inflatedHecsThreshold) {
        hecsRepayment = annualGrossIncome * HECS_RATE;
        hecsRepayment = Math.min(hecsDebt, hecsRepayment); // Don't overpay
        totalTaxOwed += hecsRepayment;
        gameState.hecsDebt -= hecsRepayment; // Reduce the debt
    }
    
    // --- 3. Reconciliation ---
    const difference = annualTaxPaid - totalTaxOwed;
    const finalAmount = difference; // Positive = refund, Negative = bill
    
    let description = '';
    if (finalAmount > 0) {
        // Refund
        description = `You lodged your ${financialYear} tax return. You paid $${annualTaxPaid.toFixed(2)} in PAYG, but only owed $${totalTaxOwed.toFixed(2)}. You received a refund of $${finalAmount.toFixed(2)}.`;
        gameState.money += finalAmount;
    } else {
        // Bill
        description = `You lodged your ${financialYear} tax return. You paid $${annualTaxPaid.toFixed(2)} in PAYG, but owed $${totalTaxOwed.toFixed(2)}. You had to pay a tax bill of $${Math.abs(finalAmount).toFixed(2)}.`;
        gameState.money += finalAmount; // Will subtract the amount
    }

    // --- 4. Log Lodgement ---
    const lodgeEvent = {
        id: `lodge_${financialYear}`,
        turn: turn,
        title: `Tax Lodgement ${financialYear}`,
        financialYear: financialYear,
        incomeSources: JSON.parse(JSON.stringify(annualGrossIncomeSources)),
        grossIncome: annualGrossIncome,
        taxWithheld: annualTaxPaid,
        taxOwed: totalTaxOwed - hecsRepayment, // Base tax + medicare
        hecsRepayment: hecsRepayment,
        finalAmount: finalAmount,
        description: description
    };
    gameState.tax.taxLodgeHistory.unshift(lodgeEvent);

    // --- 5. Reset Annual Trackers ---
    gameState.tax.annualGrossIncomeSources = {};
    gameState.tax.annualTaxPaid = 0;

    // --- 6. Dispatch Notification ---
    document.dispatchEvent(new CustomEvent('tax-update', { 
        detail: { isPositive: finalAmount > 0, message: description } 
    }));
}