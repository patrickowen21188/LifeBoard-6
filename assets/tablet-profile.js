import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';
import * as FinanceLogic from '../finance-logic.js';

// --- CHART RENDERING HELPER FUNCTIONS ---
function createCashflowChart(container, data) {
    const ctx = container.getContext('2d');
    if (!ctx) return;

    if (container.chartInstance) {
        container.chartInstance.destroy();
    }

    // Access Chart from the global window scope
    container.chartInstance = new window.Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 10 } } },
                title: { display: true, text: 'Spending Breakdown (per turn)', font: { size: 12 } }
            }
        }
    });
}

function createNetWorthChart(container, data) {
    const ctx = container.getContext('2d');
    if (!ctx) return;

    if (container.chartInstance) {
        container.chartInstance.destroy();
    }
    
    // Access Chart from the global window scope
    container.chartInstance = new window.Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wallet', 'Investments', 'Super', 'Mortgage', 'HECS Debt', 'Personal Loan'],
            datasets: [{
                label: 'Assets',
                data: [data.wallet, data.investments, data.super, 0, 0, 0],
                backgroundColor: ['#22c55e', '#16a34a', '#10b981'],
            }, {
                label: 'Liabilities',
                data: [0, 0, 0, data.mortgage, data.hecsDebt, data.personalLoan],
                backgroundColor: ['#ef4444', '#dc2626', '#b91c1c'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 10 } } },
                title: { display: true, text: 'Assets vs Liabilities', font: { size: 12 } }
            }
        }
    });
}

// --- PROFILE TAB RENDERERS ---

/**
 * Renders the "Status" sub-tab content.
 * @param {HTMLElement} container - The element to render content into.
 * @param {object} gameState - The main game state object.
 * @param {object} color - The color theme for the Profile tab.
 * @param {object} latestEvent - The most recent profile log event.
 * @param {string} eventEffectHTML - The formatted HTML for the event's effects.
 * @param {boolean} isPositive - Whether the event is positive or negative.
 */
function _renderProfileStatus(container, gameState, color, latestEvent, eventEffectHTML, isPositive) {
    const { home, activeJobs = [], subscriptions = [], insurances = [], pathwayChosen, priceIndex, wageIndex, investments = [] } = gameState;

    // Job Calculations
    let totalWeeklyHours = 0;
    let totalIncomePerTurn = 0; 
    let totalBaseStressPerTurn = 0;
    
    activeJobs.forEach(job => {
        let displayRate = job.hourlyRate;
        if (gameState.year < 18 && job.juniorRates && job.juniorRates[gameState.year] > 0) {
            displayRate = job.juniorRates[gameState.year];
        }
        const inflatedRate = displayRate * wageIndex;
        
        totalWeeklyHours += job.weeklyHoursBase;
        totalIncomePerTurn += (inflatedRate * job.weeklyHoursBase * 12);
        totalBaseStressPerTurn += job.stressPerTurn;
    });

    let extraWbDeduction = 0;
    let hoursColor = 'text-green-600';
    let hoursWarning = '';

    if (totalWeeklyHours > 50) {
        extraWbDeduction = 2; // Extra 2 WB reduction for > 50 hours
        hoursColor = 'text-red-600';
        hoursWarning = '(Overworked: -2 extra WB/turn)';
    } else if (totalWeeklyHours > 38) {
        extraWbDeduction = 1; // Extra 1 WB reduction for 39-50 hours
        hoursColor = 'text-yellow-600';
        hoursWarning = '(High Load: -1 extra WB/turn)';
    }
    const totalWbDeduction = totalBaseStressPerTurn + extraWbDeduction;

    const jobsHTML = activeJobs.length > 0 ? activeJobs.map(job => {
        let displayRate = job.hourlyRate;
        if (gameState.year < 18 && job.juniorRates && job.juniorRates[gameState.year] > 0) {
            displayRate = job.juniorRates[gameState.year];
        }
        const inflatedRate = displayRate * wageIndex;
        const incomePerTurn = (inflatedRate * job.weeklyHoursBase * 12);
        const stress = job.stressPerTurn;

        return `
        <tr class="border-b border-gray-200">
            <td class="py-2 px-3">
                <div class="font-semibold">${job.name}</div>
                <div class="flex gap-4 text-gray-600">
                    <span class="flex items-center" title="Income per Turn"><span class="material-symbols-outlined text-sm mr-1 text-green-600">account_balance_wallet</span> +$${Math.round(incomePerTurn).toLocaleString()}/turn</span>
                    <span class="flex items-center" title="Base Wellbeing per Turn"><span class="material-symbols-outlined text-sm mr-1 text-red-600">sentiment_stressed</span> -${stress}/turn</span>
                </div>
                <div class="text-gray-500 text-xs">${job.weeklyHoursBase}hr @ $${inflatedRate.toFixed(2)}/hr</div>
            </td>
            <td class="py-2 px-3 text-right align-middle">
                <button data-action="resign-job" data-item-id="${job.id}" class="sfx-button bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">logout</span>
                    Resign
                </button>
            </td>
        </tr>`;
    }).join('') : '<tr><td colspan="2" class="py-2 px-3 text-gray-500">None</td></tr>';

    // Subscription Calculations
    const totalSubscriptionCostPerTurn = subscriptions.reduce((acc, sub) => acc + (sub.costPerTurn * priceIndex), 0);
    const totalSubscriptionWbPerTurn = subscriptions.reduce((acc, sub) => acc + (sub.wpDeltaPerTurn || 0), 0);
    const totalWbColor = totalSubscriptionWbPerTurn >= 0 ? 'text-green-600' : 'text-red-600';
    const totalWbSign = totalSubscriptionWbPerTurn >= 0 ? '+' : '';

    const subsHTML = subscriptions.length > 0 ? subscriptions.map(sub => {
        const cost = (sub.costPerTurn * priceIndex);
        const wellbeing = sub.wpDeltaPerTurn || 0;
        const wellbeingColor = wellbeing >= 0 ? 'text-green-600' : 'text-red-600';

        return `
        <tr class="border-b border-gray-200">
            <td class="py-2 px-3">
                <div class="font-semibold">${sub.name}</div>
                <div class="flex gap-4 text-gray-600">
                    <span class="flex items-center" title="Cost per Turn"><span class="material-symbols-outlined text-sm mr-1 text-red-600">shopping_cart</span> -$${Math.round(cost).toLocaleString()}/turn</span>
                    <span class="flex items-center ${wellbeingColor}" title="Wellbeing per Turn"><span class="material-symbols-outlined text-sm mr-1">${wellbeing >= 0 ? 'mood' : 'mood_bad'}</span> ${wellbeing >= 0 ? '+' : ''}${wellbeing}/turn</span>
                </div>
            </td>
            <td class="py-2 px-3 text-right align-middle">
                <button data-action="cancel-subscription" data-item-id="${sub.id}" class="sfx-button bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">cancel</span>
                    Cancel
                </button>
            </td>
        </tr>`;
    }).join('') : '<tr><td colspan="2" class="py-2 px-3 text-gray-500">None</td></tr>';

    // Investment Calculations
    const totalInvestmentValue = investments.reduce((acc, inv) => acc + inv.value, 0);
    const totalInvestmentGrowthYTD = investments.reduce((acc, inv) => acc + (inv.growthYTD || 0), 0);
    
    const investmentsHTML = investments.length > 0 ? investments.map(inv => {
        const value = inv.value || 0;
        const purchaseValue = inv.purchaseValue || value; 
        const growthYTD = inv.growthYTD || 0;
        const lastTurnGrowth = inv.lastTurnGrowth || 0;

        const ytdPercent = (purchaseValue > 0) ? (growthYTD / purchaseValue) * 100 : 0;
        
        const valueBeforeThisTurn = value - lastTurnGrowth;
        const lastTurnPercent = (valueBeforeThisTurn > 0) ? (lastTurnGrowth / valueBeforeThisTurn) * 100 : 0;


        const ytdColor = growthYTD >= 0 ? 'text-green-600' : 'text-red-600';
        const lastTurnColor = lastTurnGrowth >= 0 ? 'text-green-600' : 'text-red-600';
        
        return `
        <tr class="border-b border-gray-200">
            <td class="py-2 px-3">
                <div class="font-semibold">${inv.name}</div>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                    <span class="flex items-center" title="Current Value">
                        <span class="material-symbols-outlined text-sm mr-1 text-blue-600">account_balance</span>
                        Value: $${Math.round(value).toLocaleString()}
                    </span>
                    <span class="flex items-center ${lastTurnColor}" title="Last Turn Growth">
                        <span class="material-symbols-outlined text-sm mr-1">trending_up</span>
                        Turn: ${lastTurnGrowth >= 0 ? '+' : ''}$${lastTurnGrowth.toFixed(2)} (${lastTurnPercent.toFixed(1)}%)
                    </span>
                    <span class="flex items-center ${ytdColor}" title="Growth Year-to-Date (vs. cost basis)">
                        <span class="material-symbols-outlined text-sm mr-1">query_stats</span>
                        YTD: ${growthYTD >= 0 ? '+' : ''}$${growthYTD.toFixed(2)} (${ytdPercent.toFixed(1)}%)
                    </span>
                </div>
                <!-- Withdraw Form -->
                <div class="mt-2 flex items-center gap-2">
                    <input type="number" id="withdraw-amount-${inv.id}" class="w-full p-2 text-xs border-gray-300 rounded-md" placeholder="Amount to withdraw">
                    <button data-action="sell-investment" data-item-id="${inv.id}" class="sfx-button bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold py-1 px-2 rounded flex items-center">
                        <span class="material-symbols-outlined text-sm mr-1">savings</span>
                        Withdraw
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('') : '<tr><td colspan="1" class="py-2 px-3 text-gray-500">None. Go to the Bank tab to invest.</td></tr>';

    // Insurance Calculations
    const totalInsuranceCostPerTurn = insurances.reduce((acc, plan) => acc + (plan.premiumPerTurn * priceIndex), 0);
    const insuranceHTML = insurances.length > 0 ? insurances.map(plan => {
        const cost = (plan.premiumPerTurn * priceIndex);
        const wellbeing = plan.wpDeltaPerTurn || 0;
        const wellbeingColor = wellbeing >= 0 ? 'text-green-600' : 'text-red-600';

        return `
        <tr class="border-b border-gray-200">
            <td class="py-2 px-3">
                <div class="font-semibold">${plan.name}</div>
                <div class="flex gap-4 text-gray-600">
                    <span class="flex items-center" title="Premium per Turn"><span class="material-symbols-outlined text-sm mr-1 text-red-600">local_atm</span> -$${Math.round(cost).toLocaleString()}/turn</span>
                    <span class="flex items-center ${wellbeingColor}" title="Wellbeing per Turn"><span class="material-symbols-outlined text-sm mr-1">${wellbeing >= 0 ? 'mood' : 'mood_bad'}</span> ${wellbeing >= 0 ? '+' : ''}${wellbeing}/turn</span>
                </div>
            </td>
            <td class="py-2 px-3 text-right align-middle">
                <button data-action="cancel-insurance" data-item-id="${plan.id}" class="sfx-button bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">cancel</span>
                    Cancel
                </button>
            </td>
        </tr>`;
    }).join('') : '<tr><td colspan="2" class="py-2 px-3 text-gray-500">None</td></tr>';

    // Build Home Details HTML
    let homeDetailsHTML = '';
    if (home) {
        if (home.purchaseType === 'rent') {
            const inflatedRent = (home.options.rent.rentPerTurn * priceIndex);
            homeDetailsHTML = `
                <div class="flex gap-4 text-gray-600">
                    <span class="flex items-center" title="Type"><span class="material-symbols-outlined text-sm mr-1">apartment</span>Renting</span>
                    <span class="flex items-center" title="Location"><span class="material-symbols-outlined text-sm mr-1">location_on</span>${home.zone} zone</span>
                    <span class="flex items-center font-bold text-red-600" title="Cost per Turn"><span class="material-symbols-outlined text-sm mr-1">payments</span>-$${Math.round(inflatedRent).toLocaleString()}/turn</span>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <button data-action="end-lease" data-item-id="${home.id}" class="sfx-button bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded flex items-center"><span class="material-symbols-outlined text-sm mr-1">door_front</span>End Lease</button>
                </div>
            `;
        } else if (home.purchaseType === 'buy') {
            const isRented = home.status === 'rented_out';
            const mortgagePayment = home.lockedInMortgage || 0;
            const rentIncome = (isRented && home.options.rent) ? (home.options.rent.rentPerTurn * priceIndex) : 0;
            
            homeDetailsHTML = `
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                    <span class="flex items-center" title="Type"><span class="material-symbols-outlined text-sm mr-1">house</span>Mortgaged</span>
                    <span class="flex items-center" title="Location"><span class="material-symbols-outlined text-sm mr-1">location_on</span>${home.zone} zone</span>
                    <span class="flex items-center font-bold text-red-600" title="Mortgage per Turn"><span class="material-symbols-outlined text-sm mr-1">payments</span>-$${Math.round(mortgagePayment).toLocaleString()}/turn</span>
                    ${rentIncome > 0 ? `<span class="flex items-center font-bold text-green-600" title="Rent Income per Turn"><span class="material-symbols-outlined text-sm mr-1">attach_money</span>+$${Math.round(rentIncome).toLocaleString()}/turn</span>` : ''}
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200 flex flex-wrap justify-between items-center gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold">Status:</span>
                        <button data-action="set-property-occupied" class="sfx-button text-xs font-bold py-1 px-2 rounded ${!isRented ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">Occupy</button>
                        ${home.options.rent ? `<button data-action="set-property-rented" class="sfx-button text-xs font-bold py-1 px-2 rounded ${isRented ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">Rent Out</button>` : ''}
                    </div>
                    <button data-action="sell-property" data-item-id="${home.id}" class="sfx-button bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded flex items-center"><span class="material-symbols-outlined text-sm mr-1">sell</span>Sell Property</button>
                </div>
            `;
        }
    } else {
        // Living with Parents
        homeDetailsHTML = `
            <div class="text-gray-600 flex flex-wrap gap-x-3">
                <span class="flex items-center" title="Location">
                    <span class="material-symbols-outlined text-sm mr-1">location_on</span>
                    outer zone
                </span>
            </div>
        `;
    }

    // Pathway Status Display
    let pathwayStatusHTML = '';
    if (pathwayChosen) {
        const pathIcon = pathwayChosen === 'University' ? 'school' : (pathwayChosen.includes('Vocational') ? 'handyman' : 'work');
        pathwayStatusHTML = `
            <div class="bg-white p-3 rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <span class="material-symbols-outlined text-lg mr-2">${pathIcon}</span>
                    <h3 class="text-sm font-bold">Life Pathway</h3>
                </div>
                <div class="p-3">
                    <div class="font-semibold text-sm">${pathwayChosen}</div>
                    <div class="text-xs text-gray-500 mt-1">Status: Career path locked.</div>
                </div>
            </div>`;
    } else if (gameState.year >= 18) {
        // [THIS IS THE IMPROVEMENT]
        // Added cursor-pointer, hover:shadow-md, and data-navigate-tab="Pathway"
        pathwayStatusHTML = `
            <div class="bg-white p-3 rounded-lg shadow-sm overflow-hidden border-l-4 border-yellow-500 cursor-pointer hover:shadow-md" data-navigate-tab="Pathway">
                <div class="p-2 flex items-center bg-yellow-50 text-yellow-800">
                    <span class="material-symbols-outlined text-lg mr-2">warning</span>
                    <h3 class="text-sm font-bold">Decision Required!</h3>
                </div>
                <div class="p-3 text-sm">
                    <div class="font-semibold">You must choose a Life Pathway now.</div>
                    <div class="text-xs text-gray-600 mt-1">Please select the 'Pathway' tab to continue.</div>
                </div>
            </div>`;
    }


    container.innerHTML = `
        <!-- Recent Event Section -->
        <div class="mb-4">
            <h2 class="font-bold text-md mb-2 text-gray-800">Recent Event</h2>
            ${latestEvent ? `
                <div id="status-recent-event" class="profile-notification-card ${isPositive ? 'positive' : 'negative'}">
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-sm" style="color:${color.text}">${latestEvent.title}</h3>
                        <span class="text-xs text-gray-500">${latestEvent.turn}</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">${latestEvent.description}</p>
                    <div class="text-xs mt-2"><span class="font-semibold">Effect:</span> ${eventEffectHTML}</div>
                    <span class="click-hint text-xs font-semibold text-gray-600/80 absolute bottom-2 right-3">Click to see all...</span>
                </div>` : `
                <div class="bg-white p-3 rounded-lg shadow-sm text-center text-xs text-gray-500">No events yet.</div>`}
        </div>

        <div class="space-y-4 text-xs">
            <!-- Pathway Section -->
            ${pathwayStatusHTML}
            
            <!-- Home Section -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <span class="material-symbols-outlined text-lg mr-2">home</span>
                    <h3 class="text-sm font-bold cursor-pointer hover:underline" data-navigate-tab="Property">Home</h3>
                </div>
                <div class="p-3">
                    <div class="font-semibold mb-1">
                        ${home ? home.name : `<div class="font-semibold flex items-center gap-2">Living with Parents <span class="text-xs text-gray-500 font-normal flex items-center" title="Location"><span class="material-symbols-outlined text-sm mr-1">location_on</span>outer zone</span></div>`}
                    </div>
                    ${homeDetailsHTML}
                </div>
            </div>
            
            <!-- Jobs Section -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center justify-between" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-lg mr-2">work</span>
                        <h3 class="text-sm font-bold cursor-pointer hover:underline" data-navigate-tab="Jobs">Active Jobs</h3>
                    </div>
                    <div class="text-xs text-right flex flex-wrap justify-end items-center gap-x-3 gap-y-1">
                        <span class="flex items-center" title="Turn Income"><span class="material-symbols-outlined text-sm text-green-600">account_balance_wallet</span><span class="font-bold text-green-600 ml-1">+$${Math.round(totalIncomePerTurn).toLocaleString()}/turn</span></span>
                        <span class="flex items-center" title="Wellbeing Deduction"><span class="material-symbols-outlined text-sm text-red-600">sentiment_stressed</span><span class="font-bold text-red-600 ml-1">-${totalWbDeduction} WB/turn</span></span>
                        <span class="flex items-center" title="Weekly Hours"><span class="material-symbols-outlined text-sm ${hoursColor.replace('text-', '')}">${totalWeeklyHours > 38 ? 'error' : 'schedule'}</span><span class="font-bold ${hoursColor} ml-1">${totalWeeklyHours} hr/wk</span><span class="text-red-600 font-semibold ml-2">${hoursWarning}</span></span>
                    </div>
                </div>
                <table class="w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${jobsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Subscriptions Section -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center justify-between" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-lg mr-2">loyalty</span>
                        <h3 class="text-sm font-bold cursor-pointer hover:underline" data-navigate-tab="Lifestyle">Subscriptions</h3>
                    </div>
                    <div class="text-xs text-right flex flex-wrap justify-end items-center gap-x-3 gap-y-1">
                        <span class="flex items-center" title="Total Cost per Turn"><span class="material-symbols-outlined text-sm text-red-600">payments</span><span class="font-bold text-red-600 ml-1">-$${Math.round(totalSubscriptionCostPerTurn).toLocaleString()}/turn</span></span>
                        <span class="flex items-center" title="Total Wellbeing per Turn"><span class="material-symbols-outlined text-sm ${totalWbColor.replace('text-', '')}">${totalSubscriptionWbPerTurn >= 0 ? 'mood' : 'mood_bad'}</span><span class="font-bold ${totalWbColor} ml-1">${totalWbSign}${totalSubscriptionWbPerTurn} WB/turn</span></span>
                    </div>
                </div>
                <table class="w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${subsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Investments Section -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center justify-between" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-lg mr-2">trending_up</span>
                        <h3 class="text-sm font-bold cursor-pointer hover:underline" data-navigate-tab="Bank">Investments</h3>
                    </div>
                    <div class="text-xs text-right flex flex-wrap justify-end items-center gap-x-3 gap-y-1">
                        <span class="flex items-center" title="Total Value">
                            <span class="material-symbols-outlined text-sm text-blue-600">account_balance</span>
                            <span class="font-bold text-blue-800 ml-1">$${Math.round(totalInvestmentValue).toLocaleString()}</span>
                        </span>
                        <span class="flex items-center ${totalInvestmentGrowthYTD >= 0 ? 'text-green-600' : 'text-red-600'}" title="Total Growth YTD">
                            <span class="material-symbols-outlined text-sm">query_stats</span>
                            <span class="font-bold ml-1">${totalInvestmentGrowthYTD >= 0 ? '+' : ''}$${totalInvestmentGrowthYTD.toFixed(2)} YTD</span>
                        </span>
                    </div>
                </div>
                <table class="w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${investmentsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Insurance Section -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-2 flex items-center justify-between" style="background-color: ${color.bg_light}; color: ${color.text};">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-lg mr-2">health_and_safety</span>
                        <h3 class="text-sm font-bold cursor-pointer hover:underline" data-navigate-tab="Insurance">Insurance</h3>
                    </div>
                     <div class="text-xs text-right">
                        <div><span class="font-bold text-red-600">-$${Math.round(totalInsuranceCostPerTurn).toLocaleString()}/turn</span></div>
                    </div>
                </div>
                <table class="w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${insuranceHTML}
                    </tbody>
                </table>
            </div>
        </div>`;
    
    container.addEventListener('click', (e) => {
        const navButton = e.target.closest('[data-navigate-tab]');
        if (navButton) {
            const tabName = navButton.dataset.navigateTab;
            if (tabName) {
                document.dispatchEvent(new CustomEvent('request-tab-switch', { 
                    detail: { tabName } 
                }));
            }
        }
    });
}

/**
 * Renders the "Cash Flow" sub-tab content.
 * This performs a real-time calculation of all incomes and expenses
 * to show the user an accurate breakdown.
 * @param {HTMLElement} container - The element to render content into.
 * @param {object} gameState - The main game state object.
 * @param {object} color - The color theme for the Profile tab.
 */
function _renderProfileCashFlow(container, gameState, color) {
    if (!gameState) {
        container.innerHTML = `<p>Loading data...</p>`;
        return;
    }

    const { 
        activeJobs = [], 
        subscriptions = [], 
        insurances = [], 
        home,
        priceIndex, 
        wageIndex, 
        activeGlobalEffects, 
        year 
    } = gameState;

    // 1. Calculate Gross Income Per Turn (Identical to state.js)
    let grossIncomePerTurn = 0;
    let incomeSources = {};

    if (home && home.purchaseType === 'buy' && home.status === 'rented_out') {
        if (home.options.rent) {
            const rentAmount = (home.options.rent.rentPerTurn * priceIndex);
            incomeSources['Property Income'] = rentAmount;
            grossIncomePerTurn += rentAmount;
        }
    }
    
    activeJobs.forEach(job => {
        let displayRate = job.hourlyRate;
        if (year < 18 && job.juniorRates && job.juniorRates[year] > 0) {
            displayRate = job.juniorRates[year];
        }
        const jobIncome = (displayRate * job.weeklyHoursBase * 12) * wageIndex; 
        const sourceName = `Job: ${job.name}`;
        
        incomeSources[sourceName] = (incomeSources[sourceName] || 0) + jobIncome;
        grossIncomePerTurn += jobIncome;
    });

    // 2. Calculate Tax (Identical to state.js)
    const annualGrossIncome = grossIncomePerTurn * 4;
    // We pass the full gameState to include the HECS fix
    const taxWithheldThisTurn = FinanceLogic.calculatePAYG(gameState, annualGrossIncome);
    const netIncomePerTurn = grossIncomePerTurn - taxWithheldThisTurn;

    // 3. Calculate Expenses (Identical to state.js)
    let expensesPerTurn = 0;
    let expenseSources = {};

    const { 
        lifestyleMultiplier = 1, 
        housingMultiplier = 1, 
        transportMultiplier = 1 
    } = activeGlobalEffects.expenses || {};

    subscriptions.forEach(sub => {
        const cost = (sub.costPerTurn * priceIndex) * lifestyleMultiplier;
        expenseSources['Subscriptions'] = (expenseSources['Subscriptions'] || 0) + cost;
        expensesPerTurn += cost;
    });
    
    insurances.forEach(plan => {
        const cost = (plan.premiumPerTurn * priceIndex);
        expenseSources['Insurance'] = (expenseSources['Insurance'] || 0) + cost;
        expensesPerTurn += cost;
    });
    
    if (home) {
        if (home.purchaseType === 'rent') {
            const cost = (home.options.rent.rentPerTurn * priceIndex) * housingMultiplier;
            expenseSources['Rent'] = cost;
            expensesPerTurn += cost;
        } else { // 'buy'
            const cost = (home.lockedInMortgage || 0) * housingMultiplier;
            expenseSources['Mortgage'] = cost;
            expensesPerTurn += cost;
        }
        if(home.purchaseType === 'rent' && home.options.rent.maintenancePerTurn > 0) {
            const cost = (home.options.rent.maintenancePerTurn * priceIndex) * housingMultiplier;
            expenseSources['Housing Maint.'] = (expenseSources['Housing Maint.'] || 0) + cost;
            expensesPerTurn += cost;
        } else if (home.purchaseType === 'buy' && home.options.buy.maintenancePerTurn > 0) {
            const cost = (home.options.buy.maintenancePerTurn * priceIndex) * housingMultiplier;
            expenseSources['Housing Maint.'] = (expenseSources['Housing Maint.'] || 0) + cost;
            expensesPerTurn += cost;
        }
    }
    
    if (home && activeJobs.length > 0) {
        const homeZone = home.zone || 'suburb';
        let transportCost = 0;
        activeJobs.forEach(job => {
            if (homeZone !== job.workZone) {
                transportCost += (300 * priceIndex) * transportMultiplier; 
            }
        });
        if (transportCost > 0) {
            expenseSources['Transport'] = transportCost;
            expensesPerTurn += transportCost;
        }
    }
    
    // 4. Final Calculation
    const finalNetCashFlow = netIncomePerTurn - expensesPerTurn;

    // 5. Build HTML
    const incomeHTML = Object.entries(incomeSources).map(([name, amount]) => `
        <tr class="text-gray-700">
            <td class="py-1 px-2 pl-4">- ${name}</td>
            <td class="py-1 px-2 text-right">+$${Math.round(amount).toLocaleString()}</td>
        </tr>`).join('');
    
    const expenseHTML = Object.entries(expenseSources).map(([name, amount]) => `
        <tr class="text-gray-700">
            <td class="py-1 px-2 pl-4">- ${name}</td>
            <td class="py-1 px-2 text-right">-$${Math.round(amount).toLocaleString()}</td>
        </tr>`).join('');

    // 6. Data for Chart
    const chartLabels = [];
    const chartValues = [];
    Object.entries(expenseSources).forEach(([name, amount]) => {
        chartLabels.push(name);
        chartValues.push(Math.round(amount));
    });

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded-lg shadow-sm space-y-1 text-xs overflow-hidden">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="border-b">
                            <th class="py-1 px-2 text-left font-bold">Cash Flow (per Turn)</th>
                            <th class="py-1 px-2 text-right font-bold">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr class="font-semibold text-green-600">
                            <td class="py-1 px-2">Total Gross Income</td>
                            <td class="py-1 px-2 text-right">+$${Math.round(grossIncomePerTurn).toLocaleString()}</td>
                        </tr>
                        ${incomeHTML}
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- PAYG Tax Withheld</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(taxWithheldThisTurn).toLocaleString()}</td>
                        </tr>
                        <tr class="font-semibold text-green-800 border-t">
                            <td class="py-1 px-2">Net Income</td>
                            <td class="py-1 px-2 text-right">+$${Math.round(netIncomePerTurn).toLocaleString()}</td>
                        </tr>

                        <tr class="font-semibold text-red-600">
                            <td class="py-1 px-2">Total Expenses</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(expensesPerTurn).toLocaleString()}</td>
                        </tr>
                        ${expenseHTML}
                    </tbody>
                    <tfoot class="border-t-2 border-gray-300">
                        <tr class="font-bold ${finalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}">
                            <td class="py-1 px-2">Net Cash Flow</td>
                            <td class="py-1 px-2 text-right">$${Math.round(finalNetCashFlow).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
                <p class="text-[10px] text-gray-500 pt-2">* This is your real, calculated cash flow per turn, including all inflation and taxes.</p>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center justify-center min-h-[150px]"><canvas id="cashflow-chart"></canvas></div>
        </div>`;
    
    const cfChartEl = document.getElementById('cashflow-chart');
    if (cfChartEl && chartValues.length > 0) {
        createCashflowChart(cfChartEl, { 
            labels: chartLabels, 
            values: chartValues 
        });
    }
}

/**
 * Renders the "Net Worth" sub-tab content.
 * @param {HTMLElement} container - The element to render content into.
 * @param {object} gameState - The main game state object.
 * @param {object} color - The color theme for the Profile tab.
 */
function _renderProfileNetWorth(container, gameState, color) {
    if (!gameState) {
        container.innerHTML = `<p>Loading data...</p>`;
        return;
    }
    const { money = 0, investments = [], mortgage = 0, hecsDebt = 0, personalLoan = 0, superannuation } = gameState;
    const superBalance = superannuation?.value || 0;
    const investmentValue = investments.reduce((acc, inv) => acc + inv.value, 0);

    const totalAssets = money + investmentValue + superBalance;
    const totalLiabilities = mortgage + hecsDebt + personalLoan;
    const netWorth = totalAssets - totalLiabilities;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded-lg shadow-sm space-y-1 text-xs overflow-hidden">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="border-b">
                            <th class="py-1 px-2 text-left font-bold">Net Worth</th>
                            <th class="py-1 px-2 text-right font-bold">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr class="font-semibold text-green-600">
                            <td class="py-1 px-2">Total Assets</td>
                            <td class="py-1 px-2 text-right">$${Math.round(totalAssets).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- Wallet</td>
                            <td class="py-1 px-2 text-right">$${Math.round(money).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- Investments</td>
                            <td class="py-1 px-2 text-right">$${Math.round(investmentValue).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- Superannuation</td>
                            <td class="py-1 px-2 text-right">$${Math.round(superBalance).toLocaleString()}</td>
                        </tr>

                        <tr class="font-semibold text-red-600">
                            <td class="py-1 px-2">Total Liabilities</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(totalLiabilities).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- Mortgage</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(mortgage).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- HECS Debt</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(hecsDebt).toLocaleString()}</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2 pl-4">- Personal Loan</td>
                            <td class="py-1 px-2 text-right">-$${Math.round(personalLoan).toLocaleString()}</td>
                        </tr>
                    </tbody>
                    <tfoot class="border-t-2 border-gray-300">
                        <tr class="font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}">
                            <td class="py-1 px-2">Net Worth</td>
                            <td class="py-1 px-2 text-right">$${Math.round(netWorth).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center justify-center min-h-[150px]"><canvas id="networth-chart"></canvas></div>
        </div>`;

    const nwChartEl = document.getElementById('networth-chart');
    if (nwChartEl) {
        createNetWorthChart(nwChartEl, { 
            wallet: money, investments: investmentValue, super: superBalance, mortgage, hecsDebt, personalLoan 
        });
    }
}

/**
 * Renders the "Event History" sub-tab content.
 * @param {HTMLElement} container - The element to render content into.
 * @param {object} gameState - The main game state object.
 * @param {object} color - The color theme for the Profile tab.
 */
function _renderProfileEventHistory(container, gameState, color) {
    const { profileLog = [] } = gameState;
    if (profileLog.length === 0) {
        container.innerHTML = `<div class="bg-white p-3 rounded-lg shadow-sm text-center text-xs text-gray-500">No events in your history yet.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="space-y-3 event-history-list">
            ${profileLog.map(event => {
                let eventEffectHTML = 'None';
                if (event.effect) {
                    let effects = [];
                    const finalCost = event.effect.cashDelta || 0; 
                    const finalWp = event.effect.wpDelta || 0;
                    if (finalCost !== 0) effects.push(`<span class="font-bold ${finalCost > 0 ? 'text-green-600' : 'text-red-600'}">${finalCost > 0 ? '+' : ''}$${Math.round(finalCost)}</span>`);
                    if (finalWp !== 0) effects.push(`<span class="font-bold ${finalWp > 0 ? 'text-green-600' : 'text-red-600'}">${finalWp > 0 ? '+' : ''}${finalWp} Wellbeing</span>`);
                    if (effects.length > 0) eventEffectHTML = effects.join(', ');
                }
                const isPositive = (event.effect?.wpDelta > 0 || event.effect?.cashDelta > 0);
                
                return `
                    <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 ${isPositive ? 'border-green-400' : 'border-red-400'}">
                        <div class="flex justify-between items-center">
                            <h3 class="font-bold text-sm" style="color:${color.text}">${event.title}</h3>
                            <span class="text-xs text-gray-500">${event.turn}</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">${event.description}</p>
                        <div class="text-xs mt-2"><span class="font-semibold">Effect:</span> ${eventEffectHTML}</div>
                    </div>`;
            }).join('')}
        </div>`;
}

/**
 * Renders the "Action Log" sub-tab content.
 * @param {HTMLElement} container - The element to render content into.
 * @param {object} gameState - The main game state object.
 * @param {object} color - The color theme for the Profile tab.
 */
function _renderProfileActionLog(container, gameState, color) {
    const { actionLog = [] } = gameState;
    if (actionLog.length === 0) {
        container.innerHTML = `<div class="bg-white p-3 rounded-lg shadow-sm text-center text-xs text-gray-500">No actions logged yet.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="space-y-3">
            ${actionLog.map(log => {
                // --- NEW LOGIC TO DETERMINE COLOR ---
                let borderColor = tabletData.Profile.color.bg; // Default blue
                const title = log.title.toLowerCase();

                if (title.includes('job')) {
                    borderColor = tabletData.Jobs.color.bg;
                } else if (title.includes('property') || title.includes('lease')) {
                    borderColor = tabletData.Property.color.bg;
                } else if (title.includes('purchased') || title.includes('subscription')) {
                    borderColor = tabletData.Lifestyle.color.bg;
                } else if (title.includes('invest') || title.includes('loan')) {
                    borderColor = tabletData.Bank.color.bg;
                } else if (title.includes('super')) {
                    borderColor = tabletData.Superannuation.color.bg;
                } else if (title.includes('plan') || title.includes('insurance')) {
                    borderColor = tabletData.Insurance.color.bg;
                } else if (title.includes('pathway')) {
                    borderColor = tabletData.Pathway.color.bg;
                }
                // --- END NEW LOGIC ---

                return `
                    <div class="bg-white p-3 rounded-lg shadow-sm border-l-4" style="border-left-color: ${borderColor};">
                        <div class="flex justify-between items-center">
                            <h3 class="font-bold text-sm" style="color:${borderColor}">${log.title}</h3>
                            <span class="text-xs text-gray-500">${log.turn}</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">${log.description}</p>
                    </div>`;
            }).join('')}
        </div>`;
}


/**
 * Renders the content for the Profile tab (NEW REDESIGN).
 * This is the main function called by tablet-main.js.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Profile tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderProfileContent(container, color, isUpdate = false) {
    if (!window.gameState) {
        container.innerHTML = `<p class="p-4 text-gray-600">Loading profile data...</p>`;
        return;
    }

    const { profileLog = [] } = window.gameState;
    const latestEvent = profileLog[0];
    let eventEffectHTML = 'None';
    let isPositive = false;

    if (latestEvent && latestEvent.effect) {
        const finalCost = latestEvent.effect.cashDelta || 0;
        const finalWp = latestEvent.effect.wpDelta || 0;
        isPositive = (finalWp > 0 || finalCost > 0);
        
        let effects = [];
        if (finalCost !== 0) effects.push(`<span class="font-bold ${finalCost > 0 ? 'text-green-600' : 'text-red-600'}">${finalCost > 0 ? '+' : ''}$${Math.round(finalCost)}</span>`);
        if (finalWp !== 0) effects.push(`<span class="font-bold ${finalWp > 0 ? 'text-green-600' : 'text-red-600'}">${finalWp > 0 ? '+' : ''}${finalWp} Wellbeing</span>`);
        
        if (effects.length > 0) eventEffectHTML = effects.join(', ');
    }

    container.innerHTML = `
        <div class="h-full text-sm flex flex-col">
            
            <!-- Sub-Tab Navigation -->
            <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                <button data-subtab="status" class="profile-sub-tab active" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                    <span class="material-symbols-outlined text-base mr-1">account_circle</span> Status
                </button>
                <button data-subtab="cashflow" class="profile-sub-tab" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                    <span class="material-symbols-outlined text-base mr-1">currency_exchange</span> Cash Flow
                </button>
                <button data-subtab="networth" class="profile-sub-tab" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                    <span class="material-symbols-outlined text-base mr-1">account_balance</span> Net Worth
                </button>
                <button data-subtab="history" class="profile-sub-tab" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                    <span class="material-symbols-outlined text-base mr-1">history</span> Event History
                </button>
                <button data-subtab="log" class="profile-sub-tab" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                    <span class="material-symbols-outlined text-base mr-1">list_alt</span> Action Log
                </button>
            </nav>

            <!-- Sub-Tab Content Area -->
            <div id="profile-sub-content" class="flex-grow bg-gray-100 p-3 rounded-lg overflow-y-auto min-h-0">
                <!-- Content will be injected here by JavaScript -->
            </div>
        </div>`;

    // --- Sub-Tab Logic ---
    const subContentContainer = document.getElementById('profile-sub-content');
    const subTabs = container.querySelectorAll('.profile-sub-tab');

    const switchSubTab = (tabName) => {
        if (!subContentContainer) return;
        
        subTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.subtab === tabName);
        });

        switch (tabName) {
            case 'status':
                _renderProfileStatus(subContentContainer, window.gameState, color, latestEvent, eventEffectHTML, isPositive);
                break;
            case 'cashflow':
                _renderProfileCashFlow(subContentContainer, window.gameState, color);
                break;
            case 'networth':
                _renderProfileNetWorth(subContentContainer, window.gameState, color);
                break;
            case 'history':
                _renderProfileEventHistory(subContentContainer, window.gameState, color);
                break;
            case 'log':
                _renderProfileActionLog(subContentContainer, window.gameState, color);
                break;
            default:
                _renderProfileStatus(subContentContainer, window.gameState, color, latestEvent, eventEffectHTML, isPositive);
        }
    };

    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchSubTab(e.currentTarget.dataset.subtab);
        });
    });

    let currentActiveTab = 'status';
    if (isUpdate) {
        const activeTab = container.querySelector('.profile-sub-tab.active');
        if (activeTab) currentActiveTab = activeTab.dataset.subtab;
    }
    switchSubTab(currentActiveTab);

    const statusEventCard = document.getElementById('status-recent-event');
    if (statusEventCard) {
        statusEventCard.addEventListener('click', () => {
            switchSubTab('history');
        });
    }
}