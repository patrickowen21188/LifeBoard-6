import { gameData } from './assets/loader.js';
// MODIFIED: Import applyDifficultyAndGoal from state.js
import { gameState, turnStartState, applyDifficultyAndGoal, calculateCashFlow } from './state.js';
import * as FinanceLogic from './finance-logic.js';

// Mappings for Event Logic
// These arrays link specific event IDs from events.js to the type of
// insurance coverage that should apply to them.
const medicalEventIds = ['i14_dentist_bill', 'i34_sick_day'];
const carEventIds = ['i12_car_repair'];
const accidentEventIds = ['i18_electronics_break', 'i10_appliance_breaks'];


// --- CORE GAME ACTIONS ---

/**
 * Helper to dispatch UI notifications for ERRORS
 * Dispatches a custom event that tablet-main.js can listen for
 * to show a pop-up notification.
 * @param {string} message - The text to display.
 * @param {string} [type='negative'] - 'negative' or 'positive'.
 */
function _dispatchUINotification(message, type = 'negative') {
    const detail = { 
        message: message, 
        isPositive: type === 'positive',
        icon: type === 'positive' ? 'task_alt' : 'error' 
    };
    document.dispatchEvent(new CustomEvent('ui-notification', { detail }));
}

/**
 * Helper to log a successful action AND dispatch a notification
 * This adds the action to the log and shows a positive pop-up.
 * @param {string} title - The title for the log entry (e.g., "Job Started").
 * @param {string} description - The description (e.g., "You are now a Barista.").
 * @param {string} icon - The Material Icon name to use.
 */
function _logAction(title, description, icon) {
    const turn = `${gameState.year}Y ${gameState.month}M`;
    
    // 1. Add to the new actionLog
    gameState.actionLog.unshift({
        id: `log_${Date.now()}`, // Simple unique ID
        turn: turn,
        title: title,
        description: description,
        icon: icon
    });

    // 2. Dispatch a *positive* UI notification
    const detail = { 
        message: description, 
        isPositive: true,
        icon: icon 
    };
    document.dispatchEvent(new CustomEvent('ui-notification', { detail }));
}

/**
 * NEW FUNCTION: Called by tablet-main.js to finalize difficulty/goal selection
 * and start the game.
 * @param {string} difficultyId - ID of the chosen difficulty.
 * @param {string} goalId - ID of the chosen goal.
 */
export function applyGameStartSettings(difficultyId, goalId) {
    // Delegates the setup to state.js
    return applyDifficultyAndGoal(difficultyId, goalId);
}


/**
 * Resets all actions taken during the current turn back to how things were
 * at the start of the turn. This is the new "Undo" functionality.
 */
export function handleUndo() {
    if (!gameState.gameStarted) return false; // NEW: Don't undo if game hasn't started

    // Restore the game state by deep copying from the saved turn-start state.
    Object.assign(gameState, JSON.parse(JSON.stringify(turnStartState)));

    // Recalculate financial totals after restoring the state.
    calculateCashFlow();

    // Notify the UI that the state has changed so it can redraw.
    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'undo' } }));
    return true; // Indicate success
}

/**
 * Cancels an active job, subscription, insurance plan, or home lease.
 * This function is called from the Profile tab UI.
 * @param {string} action - The type of item to cancel (e.g., 'resign-job').
 * @param {string} itemId - The ID of the item to find and remove from the state.
 */
export function cancelItem(action, itemId) {
    if (!gameState.gameStarted) return; // NEW: Guard

    let changed = false;
    let itemName = itemId; // Fallback to ID
    let logMessage = `Cancelled: ${itemId}`;

    switch (action) {
        case 'resign-job':
            const jobIndex = gameState.activeJobs.findIndex(j => j.id === itemId);
            if (jobIndex > -1) {
                itemName = gameState.activeJobs[jobIndex].name;
                logMessage = `You are no longer working as a ${itemName}.`;
                gameState.activeJobs.splice(jobIndex, 1);
                changed = true;
            }
            break;
        case 'cancel-subscription':
            const subIndex = gameState.subscriptions.findIndex(s => s.id === itemId);
            if (subIndex > -1) {
                itemName = gameState.subscriptions[subIndex].name;
                logMessage = `Cancelled subscription: ${itemName}.`;
                gameState.subscriptions.splice(subIndex, 1);
                changed = true;
            }
            break;
        case 'cancel-insurance':
            const insIndex = gameState.insurances.findIndex(p => p.id === itemId);
            if (insIndex > -1) {
                itemName = gameState.insurances[insIndex].name;
                logMessage = `Cancelled insurance: ${itemName}.`;
                gameState.insurances.splice(insIndex, 1);
                changed = true;
            }
            break;
        case 'end-lease':
            if (gameState.home && gameState.home.id === itemId && gameState.home.purchaseType === 'rent') {
                itemName = gameState.home.name;
                logMessage = `You have ended your lease at ${itemName}.`;
                gameState.home = null;
                changed = true;
            }
            break;
        case 'sell-property':
            if (gameState.home && gameState.home.id === itemId && gameState.home.purchaseType === 'buy') {
                // Sell property: Get equity back (Price - Mortgage)
                const currentMarketPrice = gameState.home.options.buy.price * gameState.priceIndex;
                const equity = currentMarketPrice - gameState.mortgage;

                itemName = gameState.home.name;
                logMessage = `You have sold ${itemName} for $${currentMarketPrice.toLocaleString()}.`;

                gameState.money += equity;
                gameState.mortgage = 0; // Clear the mortgage
                gameState.home = null; // Move back home
                changed = true;
            }
            break;
    }

    if (changed) {
        calculateCashFlow();
        _logAction('Item Cancelled', logMessage, 'cancel');
        document.dispatchEvent(new CustomEvent('gameStateChanged'));
    }
}


export function takeJob(job) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!job) return;
    if (gameState.activeJobs.find(j => j.id === job.id)) {
        _dispatchUINotification("You already have this job.");
        return;
    }

    // --- JOB VALIDATION LOGIC ---

    // 1. Check Pathway
    if (gameState.year >= 18 && gameState.pathwayChosen) {
        if (job.requirements?.pathways && !job.requirements.pathways.includes(gameState.pathwayChosen)) {
            _dispatchUINotification(`Job requires a different pathway. You need: ${job.requirements.pathways.join(', ')}`);
            return;
        }
    }

    // 2. Check Prerequisites
    if (job.requirements?.prerequisiteJobIds && job.requirements.prerequisiteJobIds.length > 0) {
        const hasPrereq = job.requirements.prerequisiteJobIds.some(reqId => 
            gameState.activeJobs.some(activeJob => activeJob.id === reqId)
        );
        
        if (!hasPrereq) {
            if (gameState.activeJobs.length === 0 && job.requirements.experienceTurns > 0)
            {
                _dispatchUINotification("This job requires a prerequisite job that you don't have.");
                return;
            }
        }
    }
    
    // 3. Check Experience (Note: This is not implemented yet)

    // 4. Check Total Weekly Hours Limit
    let currentTotalHours = 0;
    gameState.activeJobs.forEach(j => {
        currentTotalHours += j.weeklyHoursBase;
    });
    
    const newTotalHours = currentTotalHours + job.weeklyHoursBase;
    let maxAllowedHours = 50; // Default "Workforce" limit

    // Rule 1: < 18 years old
    if (gameState.year < 18) {
        maxAllowedHours = 12;
        if (gameState.activeJobs.length >= 1) {
            _dispatchUINotification("Players under 18 can only have one job at a time.");
            return; // Job is rejected
        }
    } 
    // Rule 2: Student (age 18-23)
    else if ( (gameState.pathwayChosen === 'Vocational' || gameState.pathwayChosen === 'University') && gameState.year < 24 ) {
        maxAllowedHours = 24;
    }
    // Rule 3: Workforce or Graduate (age 24+) is covered by the default 50

    if (newTotalHours > maxAllowedHours) {
        _dispatchUINotification(`Cannot take job. Your new total hours (${newTotalHours}/wk) would exceed your limit (${maxAllowedHours}/wk).`);
        return; // Job is rejected
    }

    // --- END JOB VALIDATION ---


    gameState.activeJobs.push(job);
    calculateCashFlow();
    _logAction('Job Started', `You are now working as a ${job.name}.`, 'work');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function purchaseLifestyle(item) {
    if (!gameState.gameStarted) return; // NEW: Guard

    if (!item) return;

    if (item.purchaseType === 'recurring') {
        if (gameState.subscriptions.find(s => s.id === item.id)) return;
        gameState.subscriptions.push(item);
    } else {
        // Apply one-time cost and wellbeing changes
        gameState.money -= (item.oneTimeCost * gameState.priceIndex);
        gameState.wellBeing += item.wpInstant;

        // Travel Insurance Logic
        if (item.id === 'domestic_holiday' || item.id === 'international_holiday') {
            gameState.isTraveling = true;
        }
    }
    calculateCashFlow();
    _logAction('Item Purchased', `You purchased: ${item.name}`, 'shopping_cart');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function selectInsurance(plan) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!plan) return;
    if (gameState.insurances.find(p => p.id === plan.id)) return;
    // Prevent stacking multiple health insurance plans
    if (plan.type === 'health') {
        gameState.insurances = gameState.insurances.filter(p => p.type !== 'health');
    }
    gameState.insurances.push(plan);
    calculateCashFlow();
    _logAction('Plan Selected', `You are now covered by ${plan.name}`, 'health_and_safety');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function rentProperty(property) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!property || !property.options.rent) return;
    if (gameState.home) {
       calculateCashFlow(); // Recalculate without the old home
    }
    gameState.home = { ...property, purchaseType: 'rent' };
    calculateCashFlow();
    _logAction('Property Rented', `You are now renting: ${property.name}`, 'key');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function buyProperty(property) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!property || !property.options.buy) return;

    const inflatedPrice = property.options.buy.price * gameState.priceIndex;
    const depositAmount = inflatedPrice * 0.2;
    const loanAmount = inflatedPrice * 0.8;
    const turnsPerYear = 12 / gameState.turnLengthInMonths; // NEW: Use turns per year
    // MortgagePerTurn is based on 3-month turn data. Scale it.
    const scaledMortgagePerTurn = (property.options.buy.mortgagePerTurn / 3) * gameState.turnLengthInMonths;
    const lockedInMortgagePayment = scaledMortgagePerTurn * gameState.priceIndex;

    // Require a 20% deposit
    if (gameState.money < depositAmount) {
        _dispatchUINotification("Not enough money for the 20% deposit.");
        return;
    }

    gameState.money -= depositAmount;
    gameState.mortgage += loanAmount;

    gameState.home = {
        ...property,
        purchaseType: 'buy',
        status: 'occupied',
        lockedInMortgage: lockedInMortgagePayment // This will be used for cash flow
    };

    calculateCashFlow();
    _logAction('Property Purchased', `You have purchased: ${property.name}`, 'real_estate_agent');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

/**
 * Sets the status of an owned property (e.g., to rent it out).
 * @param {string} status - The new status ('occupied' or 'rented_out').
 */
export function setPropertyStatus(status) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!gameState.home || gameState.home.purchaseType !== 'buy') {
        _dispatchUINotification("You do not own a property to manage.");
        return;
    }
    if (status === 'rented_out' && !gameState.home.options.rent) {
        _dispatchUINotification("This property cannot be rented out.");
        return;
    }

    gameState.home.status = status;

    calculateCashFlow();
    _logAction('Property Updated', `Your home status is now: ${status.replace('_', ' ')}`, 'house');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function makeInvestment(investment, amount) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!investment) return;
    if (!amount || amount <= 0) {
        _dispatchUINotification("Please enter a positive amount to invest.");
        return;
    }
    if (gameState.money < amount) {
        _dispatchUINotification("Not enough money in your wallet.");
        return;
    }

    // Enforce Minimum Investment
    if (investment.minInvestment && amount < investment.minInvestment) {
        // Check if it's an initial investment (not a top-up)
        const existingInvestment = gameState.investments.find(inv => inv.id === investment.id);
        if (!existingInvestment) {
            _dispatchUINotification(`Minimum initial investment for this fund is $${investment.minInvestment}.`);
            return;
        }
    }

    // Enforce Unit Price (must be a multiple)
    if (investment.unitPrice && investment.unitPrice > 1 && (amount % investment.unitPrice !== 0)) {
        _dispatchUINotification(`Investment must be in multiples of $${investment.unitPrice} (unit price).`);
        return;
    }

    const turn = `${gameState.year}Y ${gameState.month}M`;

    gameState.money -= amount;
    const existingInvestment = gameState.investments.find(inv => inv.id === investment.id);
    if (existingInvestment) {
        existingInvestment.value += amount;
        existingInvestment.purchaseValue += amount;
        existingInvestment.history.push({ type: 'Contribution', amount: amount, turn: turn });
    } else {
        gameState.investments.push({ 
            ...investment, 
            value: amount,
            purchaseValue: amount, // This is the cost basis
            growthYTD: 0,
            lastTurnGrowth: 0,
            history: [{ type: 'Contribution', amount: amount, turn: turn }]
        });
    }
    calculateCashFlow();
    _logAction('Investment Made', `Invested $${amount.toLocaleString()} in ${investment.name}`, 'savings');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function sellInvestment(investmentId, amount) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!investmentId || !amount || amount <= 0) {
        _dispatchUINotification("Invalid sell amount. Please enter a positive number.");
        return;
    }
    
    const investmentIndex = gameState.investments.findIndex(inv => inv.id === investmentId);
    if (investmentIndex === -1) {
        _dispatchUINotification("Investment not found in your portfolio.");
        return;
    }

    const investment = gameState.investments[investmentIndex];
    
    if (investment.lockupMonths && investment.lockupMonths > 0) {
        _dispatchUINotification(`Investment is locked for ${investment.lockupMonths} months.`);
        return;
    }

    const sellAmount = Math.min(amount, investment.value);
    const turn = `${gameState.year}Y ${gameState.month}M`;
    
    gameState.money += sellAmount;
    investment.value -= sellAmount;

    // Reduce the cost basis (purchaseValue) proportionally
    const proportionSold = sellAmount / (investment.value + sellAmount);
    investment.purchaseValue -= (investment.purchaseValue * proportionSold);
    
    // Also reduce YTD growth proportionally
    investment.growthYTD -= (investment.growthYTD * proportionSold);

    investment.history.push({ type: 'Withdrawal', amount: -sellAmount, turn: turn });

    // If value is 0 (or very close), remove it from the array
    if (investment.value < 0.01) {
        gameState.investments.splice(investmentIndex, 1);
    }
    
    _logAction('Investment Sold', `Withdrew $${sellAmount.toLocaleString()} from ${investment.name}`, 'payments');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}


export function requestLoan(amount) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!amount || amount <= 0) return;
    gameState.money += amount;
    gameState.personalLoan += amount;
    calculateCashFlow();
    _logAction('Loan Requested', `You borrowed $${amount.toLocaleString()}`, 'request_quote');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function repayLoan(amount) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!amount || amount <= 0 || gameState.money < amount) return;
    const repayment = Math.min(amount, gameState.personalLoan);
    gameState.money -= repayment;
    gameState.personalLoan -= repayment;
    calculateCashFlow();
    _logAction('Loan Repayment', `You repaid $${repayment.toLocaleString()}`, 'request_quote');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

export function addVoluntarySuper(amount) {
    if (!gameState.gameStarted) return; // NEW: Guard
    if (!amount || amount <= 0 || gameState.money < amount) {
        _dispatchUINotification("Invalid contribution. Must be a positive amount from your wallet.");
        return;
    }

    gameState.money -= amount;
    gameState.superannuation.value += amount;

    const turn = `${gameState.year}Y ${gameState.month}M`;
    gameState.superannuation.transactions.unshift({
        id: `contrib_${turn}_${amount}`,
        turn: turn,
        type: "Voluntary Contribution",
        details: "From your wallet",
        amount: amount
    });

    _logAction('Super Contribution', `Added $${amount.toLocaleString()} to your super`, 'savings');
    document.dispatchEvent(new CustomEvent('gameStateChanged'));
}

/**
 * Handles the selection of a life pathway at age 18.
 * Applies starting HECS debt and restarts the game flow.
 * @param {string} pathwayId - The ID of the chosen pathway ('workforce', 'vocational', 'university').
 */
export function choosePathway(pathwayId) {
    if (!gameState.gameStarted) return; // NEW: Guard
    const pathwayData = gameData.Pathway.find(p => p.id === pathwayId);

    if (!pathwayData || gameState.pathwayChosen) {
        _dispatchUINotification("Error selecting pathway. It may already be set.");
        return;
    }

    gameState.pathwayChosen = pathwayData.name;
    gameState.hecsDebt = pathwayData.hecsDebt;

    gameState.profileLog.unshift({
        id: `path_${pathwayId}`,
        turn: `${gameState.year}Y ${gameState.month}M`,
        title: `Life Path Chosen: ${pathwayData.name}`,
        description: `You committed to the ${pathwayData.name} path. HECS Debt incurred: $${pathwayData.hecsDebt.toLocaleString()}.`,
        effect: { wpDelta: 2 } // Small boost for making a choice
    });
    gameState.wellBeing += 2;

    _logAction('Pathway Chosen', `You selected the ${pathwayData.name} path`, 'alt_route');

    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'confirm' } }));
    console.log(`Pathway set to ${pathwayData.name}. Game flow resumed.`);
}


// --- HELPER & PRIVATE FUNCTIONS ---

/**
 * This function runs once per year to set the economy
 * It picks an "economy_report" from news.js, applies inflation,
 * and sets the global effects for the year.
 */
function _runAnnualEconomyUpdate() {
    const economyReportPool = gameData.News.filter(article => article.articleType === "economy_report");
    if (economyReportPool.length === 0) {
        console.error("No 'economy_report' articles found in news.js!");
        return;
    }

    const report = economyReportPool[Math.floor(Math.random() * economyReportPool.length)];

    if (report.inflationRate) {
        gameState.priceIndex *= (1 + report.inflationRate);
    }
    if (report.wageGrowthRate) {
        gameState.wageIndex *= (1 + report.wageGrowthRate);
    }

    gameState.activeGlobalEffects = report.effect || {};
    if (report.effect?.wpDelta) {
        gameState.wellBeing += report.effect.wpDelta;
    }

    const summary = (report.summary || "").replace(/\$\{year\}/g, gameState.year);

    const newNewsItem = {
        ...report,
        summary: summary,
        turn: `${gameState.year}Y 0M`,
        isRead: false
    };
    gameState.newsLog.unshift(newNewsItem);

    document.dispatchEvent(new CustomEvent('news-update', {
        detail: { isPositive: (report.effect?.wpDelta || 0) > 0 }
    }));
}


/**
 * Triggers random global (News) and individual (Profile) events for the turn.
 */
function triggerEvents() {
    // Global News Event (25% chance per turn)
    if (Math.random() < 0.25) {
        const randomNewsPool = gameData.News.filter(article => article.articleType === "random_global" || !article.articleType);
        if (randomNewsPool.length > 0) {
            const event = randomNewsPool[Math.floor(Math.random() * randomNewsPool.length)];
            const newNewsItem = { ...event, turn: `${gameState.year}Y ${gameState.month}M}`, isRead: false };
            gameState.newsLog.unshift(newNewsItem);

            gameState.activeGlobalEffects = event.effect || {};
            if (event.effect.wpDelta) gameState.wellBeing += event.effect.wpDelta;

            const isPositive = (event.effect.wpDelta || 0) > 0 || (event.effect.investments?.returnAdjustment > 0);
            document.dispatchEvent(new CustomEvent('news-update', { detail: { isPositive } }));
        }
    }

    // Individual Profile Event (40% chance per turn)
    if (Math.random() < 0.40) {
        const event = gameData.IndividualEvents[Math.floor(Math.random() * gameData.IndividualEvents.length)];
        const newProfileEvent = { ...event, turn: `${gameState.year}Y ${gameState.month}M}`, isRead: false };
        gameState.profileLog.unshift(newProfileEvent);

        if (event.effect) {
            let cost = (event.effect.cashDelta || 0);
            if (cost < 0) {
                cost = cost * gameState.priceIndex;
            } else if (cost > 0) {
                cost = cost * gameState.wageIndex;
            }

            let wp = event.effect.wpDelta || 0;

            if (event.effect.jobsLost && gameState.activeJobs.length > 0) {
                let jobLossCoverage = gameState.insurances.reduce((acc, plan) => acc + plan.coverage.jobLoss, 0);
                if (Math.random() > jobLossCoverage) {
                    gameState.activeJobs.shift();
                } else {
                    wp += 2;
                    newProfileEvent.description += " Your income protection insurance saved your job!";
                }
            }

            if (cost < 0) {
                let medicareSaved = 0;
                let privateSaved = 0;
                let totalCoverage = 0;

                // Check for car events *first*
                if (carEventIds.includes(event.id)) {
                    const carCoverage = gameState.insurances.reduce((acc, plan) => {
                        return acc + (plan.id === 'car_insurance' ? plan.coverage.accidents : 0);
                    }, 0);
                    totalCoverage = Math.min(1, carCoverage);
                    privateSaved = Math.abs(cost * totalCoverage);
                
                // NEW MEDICARE LOGIC
                } else if (medicalEventIds.includes(event.id)) {
                    // 1. Calculate Medicare coverage
                    const medicarePlan = gameState.insurances.find(p => p.id === 'medicare');
                    const medicareCoverage = medicarePlan?.coverage.medicalEvents || 0.3; // Default 30%
                    medicareSaved = Math.abs(cost * medicareCoverage);
                    
                    // 2. Calculate Private/Travel insurance
                    const privateCoverage = gameState.insurances
                        .filter(p => p.id !== 'medicare') // Exclude Medicare
                        .reduce((acc, plan) => {
                            if (plan.id === 'travel_insurance' && !gameState.isTraveling) return acc;
                            return acc + (plan.coverage.medicalEvents || 0);
                        }, 0);
                    privateSaved = Math.abs(cost * privateCoverage);
                    
                    totalCoverage = Math.min(1, medicareCoverage + privateCoverage);

                } else if (accidentEventIds.includes(event.id)) {
                    // General accidents (non-car)
                    const accidentCoverage = gameState.insurances.reduce((acc, plan) => {
                        if (plan.id === 'car_insurance') return acc;
                        if (plan.id === 'travel_insurance' && !gameState.isTraveling) return acc;
                        return acc + (plan.coverage.accidents || 0);
                    }, 0);
                    totalCoverage = Math.min(1, accidentCoverage);
                    privateSaved = Math.abs(cost * totalCoverage);
                }
                
                // Apply final cost
                cost = cost * (1 - totalCoverage);

                // Build educational description
                let description = "";
                if (medicareSaved > 0) {
                    description += ` Medicare covered $${medicareSaved.toFixed(0)}.`;
                }
                if (privateSaved > 0) {
                    description += ` Your private insurance covered an extra $${privateSaved.toFixed(0)}.`;
                }
                if (description) {
                    newProfileEvent.description += description;
                }
            }

            // Apply final calculated changes to the state
            gameState.wellBeing += wp;
            gameState.money += cost;
        }

        const isPositive = (event.effect.wpDelta || 0) > 0 || (event.effect.cashDelta || 0) > 0;
        document.dispatchEvent(new CustomEvent('profile-update', { detail: { isPositive } }));
    }
}


// --- GAME LOOP ---

/**
 * The main game loop function, called every time the player clicks "Next Turn".
 */
export function handleNextTurn() {
    if (!gameState.gameStarted || gameState.isGameOver) return; // NEW: Guard

    // Pathway Check: Pause the game at 18 until choice is made
    if (gameState.year >= 18 && !gameState.pathwayChosen) {
        document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'pathwayStop' } }));
        window.dispatchEvent(new Event('force-pathway-tab'));
        return; // HALT THE GAME LOOP
    }

    // AGE PROGRESSION
    // MODIFIED: Use dynamic turn length
    gameState.month += gameState.turnLengthInMonths;
    if (gameState.month >= 12) {
        gameState.year++;
        gameState.month = 0;

        if (gameState.year === 18 && !gameState.pathwayChosen) {
            document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'pathwayStop' } }));
            window.dispatchEvent(new Event('force-pathway-tab'));
            return;
        }

        _runAnnualEconomyUpdate();
    }
    
    // Trigger events *before* calculating cash flow
    triggerEvents();

    // FINANCIAL & WELLBEING UPDATES
    calculateCashFlow();

    // Apply the final *net* cash flow to the player's wallet
    gameState.money += gameState.cashFlow;

    const turn = `${gameState.year}Y ${gameState.month}M`;
    FinanceLogic.processTurnFinance(gameState, turn);

    // Tax Lodgement happens mid-year (Month 6)
    // NOTE: This logic needs to be aware of the turn length (6M mode means lodgement happens every other turn)
    if (gameState.month === 6 || (gameState.turnLengthInMonths === 6 && gameState.month === 0)) {
        FinanceLogic.lodgeTaxReturn(gameState);
    }

    // Wellbeing Updates
    // Scale decay based on turn length (Base decay is 1 per 3 months)
    const baseDecay = gameState.turnLengthInMonths / 3;
    gameState.wellBeing -= baseDecay; // Base wellbeing decay per turn

    if (gameState.money < 0) gameState.wellBeing -= baseDecay;
    if (gameState.cashFlow < 0) gameState.wellBeing -= baseDecay;

    if (gameState.home) {
        if (gameState.home.purchaseType === 'rent') {
            gameState.wellBeing += (gameState.home.options.rent.wpDeltaPerTurn || 0);
        } else if (gameState.home.purchaseType === 'buy') {
            gameState.wellBeing += (gameState.home.options.buy.wpDeltaPerTurn || 0);
        }
    }
    gameState.activeJobs.forEach(job => gameState.wellBeing -= job.stressPerTurn);
    gameState.subscriptions.forEach(sub => gameState.wellBeing += (sub.wpDeltaPerTurn || 0));

    // Ensure wellbeing doesn't go below 0
    gameState.wellBeing = Math.max(0, gameState.wellBeing);

    // SICKNESS MECHANIC
    // 50% chance to get sick if wellbeing is 5 or under
    if (gameState.wellBeing <= 5 && Math.random() < 0.5) {
        const event = gameData.IndividualEvents.find(e => e.id === 'i34_sick_day');
        if (event) {
            const newProfileEvent = { ...event, turn: `${gameState.year}Y ${gameState.month}M}`, isRead: false };
            
            // Cost needs to be scaled by turn length too
            let cost = (event.effect.cashDelta || 0) * gameState.priceIndex * baseDecay; // Scale by baseDecay factor
            
            // Apply Insurance Logic
            const medicarePlan = gameState.insurances.find(p => p.id === 'medicare');
            const medicareCoverage = medicarePlan?.coverage.medicalEvents || 0.3;
            const medicareSaved = Math.abs(cost * medicareCoverage);
            
            const privateCoverage = gameState.insurances
                .filter(p => p.id !== 'medicare')
                .reduce((acc, plan) => {
                    if (plan.id === 'travel_insurance' && !gameState.isTraveling) return acc;
                    return acc + (plan.coverage.medicalEvents || 0);
                }, 0);
            const privateSaved = Math.abs(cost * privateCoverage);
            
            const totalCoverage = Math.min(1, medicareCoverage + privateCoverage);
            cost = cost * (1 - totalCoverage);
            
            let description = newProfileEvent.description;
            if (medicareSaved > 0) {
                description += ` Medicare covered $${medicareSaved.toFixed(0)}.`;
            }
            if (privateSaved > 0) {
                description += ` Your private insurance covered an extra $${privateSaved.toFixed(0)}.`;
            }
            newProfileEvent.description = description;

            // Apply final effects
            gameState.wellBeing += (event.effect.wpDelta || 0);
            gameState.money += cost;
            gameState.profileLog.unshift(newProfileEvent);
            
            document.dispatchEvent(new CustomEvent('profile-update', { detail: { isPositive: false } }));
        }
    }

    // CHECK GAME OVER CONDITIONS
    if (gameState.year >= 30 || gameState.wellBeing <= 0) {
        gameState.isGameOver = true;
    }

    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { sound: 'nextTurn' } }));

    gameState.isTraveling = false;

    // At the very end of the turn, save the new state as the "turn start"
    // state for the *next* turn.
    Object.assign(turnStartState, JSON.parse(JSON.stringify(gameState)));
}