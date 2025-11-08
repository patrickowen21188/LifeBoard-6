import { gameData } from './loader.js';

// --- LIST ITEM RENDERERS ---

/**
 * Renders the HTML for a single item in a list view.
 * @param {string} tabName - The name of the active tab (e.g., 'Jobs', 'Lifestyle').
 * @param {object} item - The data object for the item to render.
 * @param {object} color - The color theme object for the active tab.
 * @returns {string} The HTML string for the list item.
 */
export function renderListItem(tabName, item, color) {
    let shortcutButtonHTML = '';
    let contentHTML = '';
    
    const priceIndex = window.gameState.priceIndex || 1;
    const wageIndex = window.gameState.wageIndex || 1;
    const playerAge = window.gameState.year || 15;

    switch(tabName) {
        case 'Jobs': 
            let displayRate = item.hourlyRate;
            if (playerAge < 18 && item.juniorRates && item.juniorRates[playerAge] > 0) {
                displayRate = item.juniorRates[playerAge];
            }

            const inflatedRate = (displayRate * wageIndex);
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p><div class="flex items-center gap-2 text-xs text-gray-600 mt-1"><span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">business_center</span>${item.contract.replace('_', ' ')}</span><span class="flex items-center gap-1 font-bold text-green-600"><span class="material-symbols-outlined text-sm">payments</span>$${inflatedRate.toFixed(2)}/hr</span></div>`;
            shortcutButtonHTML = `<button data-action="take-job" data-item-id="${item.id}" class="sfx-button list-shortcut-button text-green-800 hover:text-green-600"><span class="material-symbols-outlined">add_circle</span></button>`;
            break;
        case 'Lifestyle': 
            const cost = item.purchaseType === 'recurring' 
                ? `$${(item.costPerTurn * priceIndex).toFixed(0)}/turn` 
                : `$${(item.oneTimeCost * priceIndex).toFixed(0)}`; 
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p><div class="flex items-center justify-between text-xs text-gray-600 mt-1"><span class="flex items-center gap-1 font-bold text-red-600"><span class="material-symbols-outlined text-sm">payments</span>${cost}</span></div>`;
            shortcutButtonHTML = `<button data-action="purchase-lifestyle" data-item-id="${item.id}" class="sfx-button list-shortcut-button text-pink-800 hover:text-pink-600"><span class="material-symbols-outlined">add_circle</span></button>`;
            break;
        case 'Property': 
            let buyHTML = item.options.buy ? `<span class="flex items-center gap-1 font-bold text-red-600"><span class="material-symbols-outlined text-sm">sell</span>$${(item.options.buy.price * priceIndex).toLocaleString()}</span>` : ''; 
            let rentHTML = item.options.rent ? `<span class="flex items-center gap-1 font-bold text-red-600"><span class="material-symbols-outlined text-sm">payments</span>$${(item.options.rent.rentPerTurn * priceIndex).toLocaleString()}/turn</span>` : ''; 
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p><div class="flex items-center justify-between text-xs text-gray-600 mt-1"><div class="flex items-center gap-2">${buyHTML}${rentHTML}</div><span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span>${item.zone}</span></div>`;
            break;
        case 'Insurance': 
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p><div class="flex items-center gap-2 text-xs text-gray-600 mt-1"><span class="flex items-center gap-1 font-bold text-red-600"><span class="material-symbols-outlined text-sm">payments</span>$${(item.premiumPerTurn * priceIndex).toFixed(0)}/turn</span></div>`;
            shortcutButtonHTML = `<button data-action="select-insurance" data-item-id="${item.id}" class="sfx-button list-shortcut-button text-cyan-800 hover:text-cyan-600"><span class="material-symbols-outlined">add_circle</span></button>`;
            break;
        case 'Bank':
            // Bank items (investments) don't inflate, they have returns
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p><div class="flex items-center gap-2 text-xs text-gray-600 mt-1"><span class="flex items-center gap-1 text-green-600 font-bold"><span class="material-symbols-outlined text-sm">trending_up</span>${(item.expectedAnnualReturnMin * 100).toFixed(1)}%</span><span class="flex items-center gap-1 text-red-600 font-bold"><span class="material-symbols-outlined text-sm">monitoring</span>${(item.volatility * 100)}% Risk</span></div>`;
            shortcutButtonHTML = `<button data-action="make-investment" data-item-id="${item.id}" class="sfx-button list-shortcut-button text-yellow-800 hover:text-yellow-600"><span class="material-symbols-outlined">add_circle</span></button>`;
            break;
        default: 
            contentHTML = `<p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p>`;
    }

    return `<div class="flex items-center justify-between gap-2">
                <div class="flex-grow">${contentHTML}</div>
                <div class="flex-shrink-0">
                    ${shortcutButtonHTML}
                </div>
            </div>`;
}

// --- MAIN DETAILS RENDERER ---
/**
 * A router function that calls the correct details renderer based on the tab.
 * @param {string} tabName - The name of the active tab.
 * @param {object} item - The data object for the selected item.
 * @param {object} color - The color theme object.
 */
export function renderDetails(tabName, item, color) {
    const itemDetailsContainer = document.getElementById('item-details');
    if (!itemDetailsContainer) {
        console.error("renderDetails: Cannot find #item-details container.");
        return; 
    }

    switch(tabName) {
        case 'Jobs': renderJobDetails(item, color, itemDetailsContainer); break;
        case 'Lifestyle': renderLifestyleDetails(item, color, itemDetailsContainer); break;
        case 'Property': renderPropertyDetails(item, color, itemDetailsContainer); break;
        case 'Insurance': renderInsuranceDetails(item, color, itemDetailsContainer); break;
        case 'Bank': renderBankDetails(item, color, itemDetailsContainer); break;
    }
}

// --- SPECIFIC DETAILS RENDERERS ---

/**
 * Renders the detailed view for a Job item.
 * @param {object} item - The job data object.
 * @param {object} color - The color theme object.
 * @param {HTMLElement} itemDetailsContainer - The container to render into.
 */
function renderJobDetails(item, color, itemDetailsContainer) {
    const wageIndex = window.gameState.wageIndex || 1;
    const playerAge = window.gameState.year || 15;

    let displayRate = item.hourlyRate;
    let rateLabel = "Hourly Rate:";
    if (playerAge < 18 && item.juniorRates && item.juniorRates[playerAge] > 0) {
        displayRate = item.juniorRates[playerAge];
        rateLabel = `Junior Rate (Age ${playerAge}):`;
    }
    const inflatedRate = (displayRate * wageIndex);

    // Helper function to format the requirements list.
    const formatRequirements = (req) => {
        if (!req) return 'None';
        let html = '<ul class="space-y-1 text-xs">';
        if (req.pathways?.length) html += `<li><strong class="font-semibold block">Pathways:</strong> ${req.pathways.join(', ')}</li>`;
        if (req.experienceTurns > 0) html += `<li><strong class="font-semibold block">Experience:</strong> ${req.experienceTurns} turns</li>`;
        if (req.prerequisiteJobIds?.length) {
            const prereqJobs = req.prerequisiteJobIds.map(id => gameData.Jobs.find(job => job.id === id)?.name || id).join(', ');
            html += `<li><strong class="font-semibold block">Prerequisites:</strong> ${prereqJobs}</li>`;
        }
        return html + '</ul>';
    };
    
    itemDetailsContainer.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div class="w-full bg-gray-200 rounded-lg min-h-[120px]"><img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"></div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-xs font-semibold text-gray-500">${item.subtitle || item.category}</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">${item.tooltip || ''}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <ul class="space-y-3">
                    <li><strong>Contract:</strong> ${item.contract.replace('_', ' ')}</li>
                    <li><strong>Weekly Hours:</strong> ${item.weeklyHoursBase} - ${item.maxWeeklyHours}</li>
                    <li><strong>${rateLabel}</strong> <span class="font-bold text-green-600">$${inflatedRate.toFixed(2)}</span></li>
                </ul>
                <ul class="space-y-3">
                    <li><strong>Work Zone:</strong> ${item.workZone}</li>
                    <li><strong>Wellbeing Stress:</strong> <span class="font-bold text-red-600">-${item.stressPerTurn} / turn</span></li>
                    <li><strong>Requirements:</strong> ${formatRequirements(item.requirements)}</li>
                </ul>
            </div>
            <div class="mt-auto pt-2"><button data-action="take-job" data-item-id="${item.id}" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full text-sm flex items-center justify-center gap-1"><span class="material-symbols-outlined text-base">assignment_add</span>Take Job</button></div>
        </div>`;
}

/**
 * Renders the detailed view for a Lifestyle item.
 * @param {object} item - The lifestyle data object.
 * @param {object} color - The color theme object.
 * @param {HTMLElement} itemDetailsContainer - The container to render into.
 */
function renderLifestyleDetails(item, color, itemDetailsContainer) {
    const priceIndex = window.gameState.priceIndex || 1;

    const cost = item.purchaseType === 'recurring' 
        ? `$${(item.costPerTurn * priceIndex).toFixed(0)}/turn` 
        : `$${(item.oneTimeCost * priceIndex).toFixed(0)} one-time`;
    
    const wellbeing = item.purchaseType === 'recurring' ? `${item.wpDeltaPerTurn}/turn` : `${item.wpInstant} instant`;
    const wellbeingColor = (item.wpDeltaPerTurn || item.wpInstant) >= 0 ? 'text-green-600' : 'text-red-600';
    
    const buttonText = item.purchaseType === 'recurring' ? 'Subscribe' : 'Purchase';
    const buttonIcon = item.purchaseType === 'recurring' ? 'play_circle' : 'shopping_cart';
    
    itemDetailsContainer.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div class="w-full bg-gray-200 rounded-lg min-h-[120px]"><img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"></div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-xs font-semibold text-gray-500">${item.category}</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">${item.tooltip || ''}</div>
            </div>
            <ul class="space-y-3 text-xs">
                <li><strong>Type:</strong> ${item.purchaseType.replace('_', ' ')}</li>
                <li><strong>Cost:</strong> <span class="font-bold text-red-600">${cost}</span></li>
                <li><strong>Wellbeing:</strong> <span class="font-bold ${wellbeingColor}">${wellbeing}</span></li>
            </ul>
            <div class="mt-auto pt-2"><button data-action="purchase-lifestyle" data-item-id="${item.id}" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full text-sm flex items-center justify-center gap-1"><span class="material-symbols-outlined text-base">${buttonIcon}</span>${buttonText}</button></div>
        </div>`;
}

/**
 * Helper function to format tax treatment strings for display.
 * @param {string} taxString - The taxTreatment ID from the data.
 * @returns {string} A user-friendly HTML string.
 */
function _formatTaxTreatment(taxString) {
    switch (taxString) {
        case 'interest_taxable':
            return 'Taxed as Income';
        case 'dividends_franked_partial':
            return 'Partially Franked Dividends';
        case 'dividends_foreign_taxable':
            return 'Foreign Dividends (Taxable)';
        case 'capital_gains_only':
            return 'Capital Gains Only';
        case 'mixed_taxable':
            return 'Mixed (Taxable)';
        default:
            return 'Standard';
    }
}

/**
 * Renders the detailed view for a Bank item (investment).
 * @param {object} item - The investment data object.
 * @param {object} color - The color theme object.
 * @param {HTMLElement} itemDetailsContainer - The container to render into.
 */
function renderBankDetails(item, color, itemDetailsContainer) {
    let placeholder = "Amount";
    if (item.unitPrice > 1) {
        placeholder += ` (in multiples of $${item.unitPrice})`;
    }

    itemDetailsContainer.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div class="w-full bg-gray-200 rounded-lg min-h-[120px]"><img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"></div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-xs font-semibold text-gray-500">${item.type.replace(/_/g, ' ')}</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">${item.teaching || item.tooltip}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <ul class="space-y-3">
                    <li><strong>Return (p.a.):</strong> <span class="font-bold text-green-600">${(item.expectedAnnualReturnMin * 100).toFixed(1)}% - ${(item.expectedAnnualReturnMax * 100).toFixed(1)}%</span></li>
                    <li><strong>Risk:</strong> <span class="font-bold text-red-600">${(item.volatility * 100)}%</span></li>
                    <li><strong>Fees (p.a.):</strong> <span class="font-bold text-red-600">${(item.feeRate * 100).toFixed(4)}%</span></li>
                </ul>
                <ul class="space-y-3">
                    <li><strong>Min. Investment:</strong> <span class="font-bold">$${item.minInvestment.toLocaleString()}</span></li>
                    <li><strong>Unit Price:</strong> <span class="font-bold">$${item.unitPrice.toLocaleString()}</span></li>
                    <li><strong>Lockup:</strong> ${item.lockupMonths ? item.lockupMonths + ' months' : 'None'}</li>
                    <li><strong>Tax:</strong> <span class="font-semibold">${_formatTaxTreatment(item.taxTreatment)}</span></li>
                </ul>
            </div>
            <div class="mt-auto pt-2 flex items-stretch gap-2">
                <input type="number" id="investment-amount" placeholder="${placeholder}" class="w-1/2 p-2 text-sm border-gray-300 rounded-md">
                <button data-action="make-investment" data-item-id="${item.id}" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm w-1/2 flex items-center justify-center">
                    <span class="material-symbols-outlined mr-1">savings</span>
                    Invest
                </button>
            </div>
        </div>`;
}

/**
 * Renders the detailed view for a Property item.
 * @param {object} item - The property data object.
 * @param {object} color - The color theme object.
 * @param {HTMLElement} itemDetailsContainer - The container to render into.
 */
 function renderPropertyDetails(item, color, itemDetailsContainer) {
    const priceIndex = window.gameState.priceIndex || 1;

    let rentHTML = '<div class="p-2 text-gray-500 text-xs">Not available for rent.</div>';
    if (item.options.rent) {
        const rent = item.options.rent;
        const inflatedRent = (rent.rentPerTurn * priceIndex);
        rentHTML = `
            <div class="h-full flex flex-col"><button data-action="rent-property" data-item-id="${item.id}" class="sfx-button mb-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center justify-center gap-1"><span class="material-symbols-outlined text-sm">key</span>Rent</button>
                <ul class="space-y-2 text-xs flex-grow">
                    <li class="flex justify-between"><strong>Cost:</strong><span class="font-bold text-red-600">$${inflatedRent.toLocaleString()}/turn</span></li>
                    <li class="flex justify-between"><strong>Wellbeing:</strong><span class="font-bold ${rent.wpDeltaPerTurn >= 0 ? 'text-green-600':'text-red-600'}">${rent.wpDeltaPerTurn >= 0 ? '+':''}${rent.wpDeltaPerTurn}/turn</span></li>
                </ul>
            </div>`;
    }

    let buyHTML = '<div class="p-2 text-gray-500 text-xs">Not available for sale.</div>';
    if (item.options.buy) {
        const buy = item.options.buy;
        const inflatedPrice = (buy.price * priceIndex);
        const inflatedMortgage = (buy.mortgagePerTurn * priceIndex);
        buyHTML = `
             <div class="h-full flex flex-col"><button data-action="buy-property" data-item-id="${item.id}" class="sfx-button mb-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center justify-center gap-1"><span class="material-symbols-outlined text-sm">real_estate_agent</span>Buy</button>
                <ul class="space-y-2 text-xs flex-grow">
                    <li class="flex justify-between"><strong>Price:</strong><span>$${inflatedPrice.toLocaleString()}</span></li>
                    <li class="flex justify-between"><strong>Mortgage:</strong><span class="font-bold text-red-600">$${inflatedMortgage.toLocaleString()}/turn</span></li>
                    <li class="flex justify-between"><strong>Wellbeing:</strong><span class="font-bold ${buy.wpDeltaPerTurn >= 0 ? 'text-green-600':'text-red-600'}">${buy.wpDeltaPerTurn >= 0 ? '+':''}${buy.wpDeltaPerTurn}/turn</span></li>
                </ul>
            </div>`;
    }

    itemDetailsContainer.innerHTML = `
         <div class="flex flex-col gap-y-3 h-full p-2">
            <div class="w-full bg-gray-200 rounded-lg min-h-[120px]"><img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"></div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-xs font-semibold text-gray-500">${item.zone} Zone</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">${item.tooltip}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="bg-blue-50 p-2 rounded-lg">${rentHTML}</div>
                <div class="bg-green-50 p-2 rounded-lg">${buyHTML}</div>
            </div>
        </div>`;
}

/**
 * Renders the detailed view for an Insurance item.
 * @param {object} item - The insurance plan data object.
 * @param {object} color - The color theme object.
 * @param {HTMLElement} itemDetailsContainer - The container to render into.
 */
function renderInsuranceDetails(item, color, itemDetailsContainer) {
    const priceIndex = window.gameState.priceIndex || 1;

    itemDetailsContainer.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div class="w-full bg-gray-200 rounded-lg min-h-[120px]"><img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"></div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-xs font-semibold text-gray-500">${item.type.replace(/_/g, ' ')}</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">${item.teaching || item.tooltip}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                 <ul class="space-y-3">
                    <li><strong>Premium/turn:</strong><span class="font-bold text-red-600">$${(item.premiumPerTurn * priceIndex).toFixed(0)}</span></li>
                    <li><strong>Wellbeing/turn:</strong><span class="font-bold ${item.wpDeltaPerTurn >= 0 ? 'text-green-600' : 'text-red-600'}">${item.wpDeltaPerTurn >= 0 ? '+' : ''}${item.wpDeltaPerTurn}</span></li>
                </ul>
                 <ul class="space-y-3">
                    <li><strong>Coverage:</strong>
                        <ul class="mt-1 list-disc list-inside text-xs">
                            <li>Medical: ${(item.coverage.medicalEvents * 100)}%</li>
                            <li>Accidents: ${(item.coverage.accidents * 100)}%</li>
                            <li>Job Loss: ${(item.coverage.jobLoss * 100)}%</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="mt-auto pt-2"><button data-action="select-insurance" data-item-id="${item.id}" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full text-sm flex items-center justify-center gap-1"><span class="material-symbols-outlined text-base">health_and_safety</span>Select Plan</button></div>
        </div>`;
}

/**
 * Renders the detailed view for a News item.
 * @param {object} item - The news article object.
 * @param {object} color - The color theme object.
 */
export function renderNewsDetails(item, color) {
    const itemDetailsContainer = document.getElementById('item-details');
    if (!itemDetailsContainer) return;
    
    // Helper function to format the complex "effect" object into readable HTML.
    const formatNewsEffect = (effect) => {
        if (!effect) return '<span>No direct financial effect.</span>';
        let parts = [];
        if (effect.wpDelta) parts.push(`<span class="${effect.wpDelta > 0 ? 'text-green-600' : 'text-red-600'}">${effect.wpDelta > 0 ? '+' : ''}${effect.wpDelta} Wellbeing</span>`);
        
        if (effect.investments?.returnAdjustment) parts.push(`<span class="${effect.investments.returnAdjustment > 0 ? 'text-green-600' : 'text-red-600'}">${(effect.investments.returnAdjustment * 100).toFixed(0)}% Investments</span>`);
        if (effect.investments?.savingsBonus) parts.push(`<span class="text-green-600">+${(effect.investments.savingsBonus * 100).toFixed(0)}% Savings Rate</span>`);
        if (effect.jobs?.availabilityMultiplier) parts.push(`<span class="${effect.jobs.availabilityMultiplier > 1 ? 'text-green-600' : 'text-red-600'}">${((effect.jobs.availabilityMultiplier - 1) * 100).toFixed(0)}% Job Market</span>`);
        if (effect.expenses?.lifestyleMultiplier) parts.push(`<span class="text-red-600">+${((effect.expenses.lifestyleMultiplier - 1) * 100).toFixed(0)}% Lifestyle Costs</span>`);
        if (effect.expenses?.housingMultiplier) parts.push(`<span class="text-red-600">+${((effect.expenses.housingMultiplier - 1) * 100).toFixed(0)}% Housing Costs</span>`);
        if (effect.expenses?.transportMultiplier) parts.push(`<span class="text-red-600">+${((effect.expenses.transportMultiplier - 1) * 100).toFixed(0)}% Transport Costs</span>`);

        return parts.join(', ') || '<span>No direct financial effect.</span>';
    };

    itemDetailsContainer.innerHTML = `
        <div class="p-2">
            <p class="text-xs font-semibold text-gray-500">${item.source} - ${item.turn}</p>
            <h2 class="text-xl font-black mt-1 mb-3" style="color: ${color.text}">${item.headline}</h2>
            <div class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3"><img src="${item.image}" alt="${item.headline}" class="w-full h-full object-cover rounded-lg"></div>
            <div class>
                <strong class="block mb-1 text-gray-600 text-xs">Potential Effects:</strong>
                <div class="p-2 bg-white rounded-md text-xs">${formatNewsEffect(item.effect)}</div>
            </div>
            <p class="text-sm font-semibold text-gray-700 my-3">${item.summary}</p>
            <div class="border-t pt-3"><p class="text-xs text-gray-600">${item.full_text}</p></div>
        </div>`;
}


/**
 * Renders the detailed view for a Tax or Super Education item.
 * @param {object} item - The education article object.
 * @param {object} color - The color theme object.
 */
export function renderEducationDetails(item, color) {
    const itemDetailsContainer = document.getElementById('item-details');
    if (!itemDetailsContainer) return;

    itemDetailsContainer.innerHTML = `
        <div class="p-2">
            <p class="text-xs font-semibold text-gray-500">${item.source}</p>
            <h2 class="text-xl font-black mt-1 mb-3" style="color: ${color.text}">${item.headline}</h2>
            <div class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                <img src="${item.image}" alt="${item.headline}" class="w-full h-full object-cover rounded-lg">
            </div>
            <p class="text-sm font-semibold text-gray-700 mb-3">${item.summary}</p>
            <div class="border-t pt-3">
                <p class="text-xs text-gray-600">${item.full_text.replace(/\n/g, '<br><br>')}</p>
            </div>
            ${item.link ? `<a href="${item.link}" target="_blank" class="mt-4 inline-block text-xs text-blue-600 hover:underline">Read more at ${item.source}</a>` : ''}
        </div>`;
}

/**
 * Renders the detailed view for a Tax Lodgement history item.
 * @param {object} item - The tax lodgement object from gameState.
 * @param {object} color - The color theme object.
 */
export function renderTaxLodgeDetails(item, color) {
    const itemDetailsContainer = document.getElementById('item-details');
    if (!itemDetailsContainer) return;

    const isRefund = item.finalAmount >= 0;
    const finalAmountColor = isRefund ? 'text-green-600' : 'text-red-600';
    const finalAmountLabel = isRefund ? 'Refund Received' : 'Bill Paid';

    let incomeSourcesHTML = '';
    if (item.incomeSources && Object.keys(item.incomeSources).length > 0) {
        for (const sourceName in item.incomeSources) {
            const amount = item.incomeSources[sourceName];
            incomeSourcesHTML += `
                <tr class="text-gray-700">
                    <td class="py-1 px-2 pl-4">- ${sourceName}</td>
                    <td class="py-1 px-2 text-right">$${Math.round(amount).toLocaleString()}</td>
                </tr>
            `;
        }
    } else if (item.grossIncome > 0) {
        incomeSourcesHTML = `
            <tr class="text-gray-700">
                <td class="py-1 px-2 pl-4">- Total Income</td>
                <td class="py-1 px-2 text-right">$${Math.round(item.grossIncome).toLocaleString()}</td>
            </tr>
        `;
    }

    itemDetailsContainer.innerHTML = `
        <div class="p-2">
            <p class="text-xs font-semibold text-gray-500">${item.turn} / ${item.financialYear}</p>
            <h2 class="text-xl font-black mt-1 mb-3" style="color: ${color.text}">${item.title}</h2>
            
            <div class="bg-white p-3 rounded-lg shadow-sm space-y-2 text-xs">
                <p class="text-xs text-gray-600 mb-3">${item.description}</p>
                
                <table class="w-full text-xs">
                    <tbody class="divide-y divide-gray-100">
                        <tr class="text-gray-700 font-semibold">
                            <td class="py-1 px-2">Annual Gross Income:</td>
                            <td class="py-1 px-2 text-right">$${Math.round(item.grossIncome).toLocaleString()}</td>
                        </tr>
                        ${incomeSourcesHTML}
                        <tr class="text-gray-700">
                            <td class="py-1 px-2">Total Tax Withheld (PAYG):</td>
                            <td class="py-1 px-2 text-right font-semibold">($${Math.round(item.taxWithheld).toLocaleString()})</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2">Actual Tax Owed (inc. Medicare):</td>
                            <td class="py-1 px-2 text-right font-semibold">($${Math.round(item.taxOwed).toLocaleString()})</td>
                        </tr>
                        <tr class="text-gray-700">
                            <td class="py-1 px-2">HECS/HELP Repayment:</td>
                            <td class="py-1 px-2 text-right font-semibold">($${Math.round(item.hecsRepayment).toLocaleString()})</td>
                        </tr>
                    </tbody>
                    <tfoot class="border-t-2 border-gray-300">
                        <tr class="font-bold ${finalAmountColor}">
                            <td class="py-1 px-2 text-lg">${finalAmountLabel}:</td>
                            <td class="py-1 px-2 text-right text-lg">${isRefund ? '+' : '-'}$${Math.round(Math.abs(item.finalAmount)).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>`;
}

/**
 * Renders the detailed view for an OWNED investment item.
 * @param {object} item - The investment object from gameState.investments.
 * @param {object} color - The color theme object.
 */
export function renderMyInvestmentDetails(item, color) {
    const itemDetailsContainer = document.getElementById('item-details');
    if (!itemDetailsContainer) return;

    const originalItem = gameData.Bank.find(b => b.id === item.id);
    if (!originalItem) {
        itemDetailsContainer.innerHTML = `<p>Error: Could not find original item data.</p>`;
        return;
    }

    const { name, image } = originalItem;
    const { value, purchaseValue, growthYTD, history } = item;
    const totalGrowth = value - purchaseValue;
    const totalGrowthColor = totalGrowth >= 0 ? 'text-green-600' : 'text-red-600';
    const ytdGrowthColor = growthYTD >= 0 ? 'text-green-600' : 'text-red-600';

    itemDetailsContainer.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${name}</h2>
                <p class="text-xs font-semibold text-gray-500">${originalItem.type.replace(/_/g, ' ')}</p>
            </div>
            
            <div class="flex items-center justify-between">
                <h3 class="font-bold text-md text-gray-800">Investment Chart</h3>
                <div class="flex items-center gap-1">
                    <button data-filter="3M" class="history-filter-button text-xs font-semibold py-1 px-2 rounded bg-gray-200 hover:bg-gray-300">3M</button>
                    <button data-filter="YTD" class="history-filter-button text-xs font-semibold py-1 px-2 rounded bg-gray-200 hover:bg-gray-300">YTD</button>
                    <button data-filter="ALL" class="history-filter-button text-xs font-semibold py-1 px-2 rounded bg-blue-600 text-white">All</button>
                </div>
            </div>

            <div class="bg-gray-100 p-2 rounded-lg" style="min-height: 250px;">
                <canvas id="investment-history-chart"></canvas>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div class="bg-white p-2 rounded-lg shadow-sm text-center">
                    <div class="text-gray-500 font-semibold">Current Value</div>
                    <div class="text-lg font-black text-blue-600">$${Math.round(value).toLocaleString()}</div>
                </div>
                <div class="bg-white p-2 rounded-lg shadow-sm text-center">
                    <div class="text-gray-500 font-semibold">Total Invested</div>
                    <div class="text-lg font-black text-gray-800">$${Math.round(purchaseValue).toLocaleString()}</div>
                </div>
                <div class="bg-white p-2 rounded-lg shadow-sm text-center">
                    <div class="text-gray-500 font-semibold">Total Growth</div>
                    <div class="text-lg font-black ${totalGrowthColor}">${totalGrowth >= 0 ? '+' : ''}$${Math.round(totalGrowth).toLocaleString()}</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-lg shadow-sm">
                    <h3 class="font-bold text-md mb-2 text-gray-800">Top Up</h3>
                    <div class="flex items-center gap-2">
                        <input type="number" id="invest-topup-amount" placeholder="Amount" class="w-full p-2 text-sm border-gray-300 rounded-md">
                        <button data-action="make-investment" data-item-id="${item.id}" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm">Top Up</button>
                    </div>
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm">
                    <h3 class="font-bold text-md mb-2 text-gray-800">Withdraw</h3>
                    <div class="flex items-center gap-2">
                        <input type="number" id="invest-withdraw-amount" placeholder="Amount" class="w-full p-2 text-sm border-gray-300 rounded-md">
                        <button data-action="sell-investment" data-item-id="${item.id}" class="sfx-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm">Withdraw</button>
                    </div>
                </div>
            </div>

            <div class="flex flex-col">
                <h3 class="font-bold text-md text-gray-800 mb-2">Transaction History</h3>
                <ul id="investment-history-list" class="space-y-1 text-xs overflow-y-auto flex-grow bg-gray-100 p-2 rounded-lg" style="min-height: 200px;">
                    <!-- History list items will be rendered here -->
                </ul>
            </div>
        </div>
    `;
    
    const updateHistoryView = (filter) => {
        itemDetailsContainer.querySelectorAll('.history-filter-button').forEach(btn => {
            const isActive = btn.dataset.filter === filter;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('bg-gray-200', !isActive);
            btn.classList.toggle('hover:bg-gray-300', !isActive);
        });

        const { year: currentYear } = window.gameState;
        let filteredHistory = history;

        if (filter === '3M') {
            const lastTurn = history.length > 0 ? history[history.length - 1].turn : null;
            if(lastTurn) {
                filteredHistory = history.filter(t => t.turn === lastTurn);
            }
        } else if (filter === 'YTD') {
            filteredHistory = history.filter(t => {
                const [y, m] = t.turn.split('Y ');
                const yearNum = parseInt(y, 10);
                const monthNum = parseInt(m.replace('M', ''), 10);
                
                if (monthNum >= 6) { // Current FY
                    return yearNum === currentYear;
                } else { // Previous FY
                    return yearNum === currentYear && monthNum < 6;
                }
            });
        }

        renderHistoryList(document.getElementById('investment-history-list'), filteredHistory);
        createInvestmentHistoryChart(document.getElementById('investment-history-chart'), filteredHistory);
    };

    itemDetailsContainer.querySelectorAll('.history-filter-button').forEach(button => {
        button.addEventListener('click', (e) => {
            updateHistoryView(e.currentTarget.dataset.filter);
        });
    });

    updateHistoryView('ALL');
}

/**
 * Renders the text-based list of transactions.
 * @param {HTMLElement} listElement - The <ul> element.
 * @param {Array} historyData - The filtered array of history transactions.
 */
function renderHistoryList(listElement, historyData) {
    if (!listElement) return;
    if (historyData.length === 0) {
        listElement.innerHTML = `<li class="text-gray-500 p-2 text-center">No transactions in this period.</li>`;
        return;
    }
    
    listElement.innerHTML = [...historyData].reverse().map(t => {
        let color = 'text-gray-700';
        let sign = '';
        if (t.type === 'Contribution') {
            color = 'text-green-600';
            sign = '+';
        } else if (t.type === 'Withdrawal' || t.type === 'Fees') {
            color = 'text-red-600';
        } else if (t.type === 'Investment Growth' || t.type === 'Income Paid') {
            color = 'text-green-600';
            sign = '+';
        }
        
        return `<li class="bg-white p-2 rounded shadow-sm flex justify-between items-center border border-gray-100">
                    <div>
                        <span class="font-semibold block">${t.type}</span>
                        <span class="text-gray-500 text-[11px]">${t.turn}</span>
                    </div>
                    <span class="font-bold ${color}">
                        ${sign}$${Math.round(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </li>`;
    }).join('');
}

/**
 * Creates or updates the investment history chart.
 * @param {HTMLElement} canvasElement - The <canvas> element.
 * @param {Array} historyData - The *filtered* array of transactions.
 */
function createInvestmentHistoryChart(canvasElement, historyData) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    if (canvasElement.chartInstance) {
        canvasElement.chartInstance.destroy();
    }

    const turns = {};
    
    historyData.forEach(t => {
        if (!turns[t.turn]) {
            turns[t.turn] = { growth: 0, netContribution: 0 };
        }
        
        if (t.type === 'Investment Growth' || t.type === 'Income Paid') {
            turns[t.turn].growth += t.amount;
        } else if (t.type === 'Contribution') {
            turns[t.turn].netContribution += t.amount;
        } else if (t.type === 'Withdrawal') {
            turns[t.turn].netContribution += t.amount;
        }
    });
    
    const sortedTurns = Object.keys(turns).sort((a, b) => {
        const [yA, mA] = a.split('Y ').map(s => parseInt(s.replace('M', '')));
        const [yB, mB] = b.split('Y ').map(s => parseInt(s.replace('M', '')));
        if (yA !== yB) return yA - yB;
        return mA - mB;
    });

    const labels = sortedTurns;
    const growthData = sortedTurns.map(turn => turns[turn].growth);
    const netContributionData = sortedTurns.map(turn => turns[turn].netContribution);

    canvasElement.chartInstance = new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Investment Growth',
                    data: growthData,
                    borderColor: '#16a34a', // green-600
                    backgroundColor: '#16a34a',
                    yAxisID: 'yGrowth',
                    tension: 0.1
                },
                {
                    type: 'bar',
                    label: 'Net Contribution',
                    data: netContributionData,
                    backgroundColor: '#2563eb', // blue-600
                    yAxisID: 'yContribution',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 10 } } },
                title: { display: false }
            },
            scales: {
                yGrowth: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Growth ($)', font: { size: 10 } },
                    grid: { drawOnChartArea: false }
                },
                yContribution: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Contribution ($)', font: { size: 10 } }
                }
            }
        }
    });
}