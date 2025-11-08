import { gameData } from './loader.js';
import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';

// --- FIX: Removed direct 'gameState' import to use 'window.gameState' ---
// This prevents race conditions and ensures live data is always read.
// import { gameState } from '../state.js'; // <-- REMOVED

// MODIFIED: Removed the generic layout import as we are creating a custom one.
// import { renderTwoColumnLayout } from './tablet-layouts.js';

// --- NEW: Add a persistent variable to store the active sub-tab ---
let currentActiveSubTab = 'investment';

/**
 * Renders the content for the Bank tab, which includes sub-tabs.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Bank tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderBankLayout(container, color, isUpdate = false) {
    
    // --- NEW: Reset the sub-tab only if it's NOT an update ---
    if (!isUpdate) {
        currentActiveSubTab = 'investment';
    }
    // --- END NEW ---

    // --- Create Sub-Tab Navigation ---
    // --- MODIFIED: Renamed "Investment", added "My Investment" ---
    const subTabHTML = `
        <button data-subtab="investment" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${currentActiveSubTab === 'investment' ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">store</span>
            Buy Investment
        </button>
        <button data-subtab="my_investment" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${currentActiveSubTab === 'my_investment' ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">inventory</span>
            My Investment
        </button>
        <button data-subtab="loan" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${currentActiveSubTab === 'loan' ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">request_quote</span>
            Loan
        </button>
    `;

    // --- Main Layout with Sub-Tabs ---
    // We use a flex-col layout. The nav does not shrink.
    // The sub-content container (flex-grow) will contain the h-full grid.
    // min-h-0 is a flexbox fix to ensure h-full works correctly in the child.
    container.innerHTML = `
        <div class="flex flex-col h-full">
            <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                ${subTabHTML}
            </nav>
            <div id="bank-sub-content" class="flex-grow min-h-0">
                <!-- The sub-tab content will be rendered here -->
            </div>
        </div>`;

    const subContent = document.getElementById('bank-sub-content');
    const subTabs = container.querySelectorAll('.profile-sub-tab');

    /**
     * Switches the active sub-tab and renders its content.
     * @param {string} subTabName - The name of the sub-tab to activate.
     */
    function setActiveSubTab(subTabName) {
        // --- NEW: Update the persistent variable ---
        currentActiveSubTab = subTabName;
        // --- END NEW ---

        // Update tab styles
        subTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.subtab === subTabName);
            tab.classList.toggle('text-gray-500', tab.dataset.subtab !== subTabName);
        });
        
        // Render content for the active sub-tab
        if (subTabName === 'investment') {
            // MODIFIED: Call our new local function instead of the generic one
            renderInvestmentSubTab(subContent, color);
        } else if (subTabName === 'my_investment') {
            // --- NEW: Call the "My Investment" renderer ---
            renderMyInvestmentSubTab(subContent, color);
        } else if (subTabName === 'loan') {
            // The "Loan" tab uses a custom layout
            renderLoanSubTab(subContent, color);
        }
    }
    
    // Add click listeners to sub-tabs
    subTabs.forEach(tab => tab.addEventListener('click', (e) => setActiveSubTab(e.currentTarget.dataset.subtab)));
    
    // Initial render
    // --- MODIFIED: Render the stored sub-tab ---
    setActiveSubTab(currentActiveSubTab);
}

/**
 * NEW LOCAL FUNCTION
 * Renders the custom layout for the "Buy Investment" sub-tab.
 * This is a modified copy of the generic renderTwoColumnLayout.
 * @param {HTMLElement} container - The sub-content container.
 * @param {object} color - The color theme for the Bank tab.
 */
function renderInvestmentSubTab(container, color) {
    const tabName = 'Bank'; // Hardcode tabName
    const data = gameData.Bank; // Hardcode data source
    
    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }

    // --- MODIFIED: Create Filters based on Risk ---
    const riskOptions = ['All Risk Levels', 'Low Risk', 'Medium Risk', 'High Risk'];
    let filters = [{ id: 'bank-risk-filter', options: riskOptions }];
    const filterHTMLs = filters.map(filter => 
        `<select id="${filter.id}" class="text-xs rounded-md border-gray-300 shadow-sm w-full">
            ${filter.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>`
    );
    // --- End Modification ---

    // MODIFIED: Added mb-2 for spacing
    const filterContainer = filters.length > 0 ? `<div class="flex items-center gap-2 mb-2">${filterHTMLs.join('')}</div>` : '';

    // --- Render Layout ---
    // MODIFIED:
    // 1. Removed the outer header div and the <h1> title.
    // 2. Changed layout to h-full.
    // 3. Moved ${filterContainer} into the left column.
    // 4. Made left column flex-col so list can scroll independently of filter.
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full flex flex-col overflow-hidden">
                ${filterContainer}
                <ul id="item-list" class="space-y-2 flex-grow overflow-y-auto"></ul>
            </div>
            <div id="item-details" class="lg:col-span-3 h-full p-2 overflow-y-auto"></div>
        </div>`;

    const itemList = document.getElementById('item-list');
    const itemDetails = document.getElementById('item-details');

    /**
     * Updates the list on the left based on filtered data.
     * @param {Array} itemsToRender - The items to show in the list.
     */
    const updateList = (itemsToRender) => {
        itemList.innerHTML = itemsToRender.map(item => {
            const originalIndex = data.indexOf(item);
            // Details.renderListItem will automatically handle inflation display
            return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${originalIndex}"><div class="bg-white p-2 rounded-lg shadow-sm">${Details.renderListItem(tabName, item, color)}</div></li>`;
        }).join('');
        itemDetails.innerHTML = itemsToRender.length > 0 ? `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an item to see the details.</div>` : `<p class="text-gray-500 p-4">No items found.</p>`;
    };

    /** Applies all active filters to the data and updates the list */
    const applyFilters = () => {
        // --- MODIFIED: Custom filter logic for risk ---
        let filteredData = [...data];
        const riskSelect = document.getElementById('bank-risk-filter');
        
        if (riskSelect) {
            switch (riskSelect.value) {
                case 'Low Risk':
                    filteredData = data.filter(item => item.volatility < 0.10);
                    break;
                case 'Medium Risk':
                    filteredData = data.filter(item => item.volatility >= 0.10 && item.volatility < 0.30);
                    break;
                case 'High Risk':
                    filteredData = data.filter(item => item.volatility >= 0.30);
                    break;
                case 'All Risk Levels':
                default:
                    filteredData = [...data]; // No filter
                    break;
            }
        }
        updateList(filteredData);
        // --- End Modification ---
    };

    // --- Initial Render and Event Listeners ---
    updateList(data);
    filters.forEach(filter => document.getElementById(filter.id)?.addEventListener('change', applyFilters));

    itemList.addEventListener('click', (e) => {
        // Check for shortcut button click first
        const shortcutButton = e.target.closest('button[data-action]');
        if (shortcutButton) {
            return; // Let tablet-main.js handle the action
        }

        // Handle list item click to show details
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.dataset.index, 10);
            if (data[index]) {
                itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                listItem.classList.add('bg-blue-100');
                // Details.renderDetails will automatically handle inflation display
                Details.renderDetails(tabName, data[index], color);
            }
        }
    });
}

/**
 * --- NEW FUNCTION ---
 * Renders the custom layout for the "My Investment" sub-tab.
 * This lists owned investments from `window.gameState`.
 * @param {HTMLElement} container - The sub-content container.
 * @param {object} color - The color theme for the Bank tab.
 */
function renderMyInvestmentSubTab(container, color) {
    // 1. Read data from the live game state
    const data = window.gameState.investments || [];

    // 2. Render the two-column layout (no filters needed)
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full flex flex-col overflow-hidden">
                <ul id="item-list" class="space-y-2 flex-grow overflow-y-auto"></ul>
            </div>
            <div id="item-details" class="lg:col-span-3 h-full p-2 overflow-y-auto"></div>
        </div>`;

    const itemList = document.getElementById('item-list');
    const itemDetails = document.getElementById('item-details');

    // 3. Populate the list with owned investments
    const listHTML = data.map((item) => {
        // Find the original item data to get the name/color
        const originalItem = gameData.Bank.find(b => b.id === item.id);
        const name = originalItem?.name || item.id;
        const itemColor = tabletData.Bank.color.text; // Use the bank color

        // Create a list item showing current value and last turn's growth
        return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-item-id="${item.id}">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                        <p class="font-bold text-xs" style="color: ${itemColor}">${name}</p>
                        <div class="flex items-center justify-between text-xs text-gray-600 mt-1">
                            <span class="flex items-center gap-1 font-bold">
                                <span class="material-symbols-outlined text-sm text-blue-600">account_balance</span>
                                Value: $${Math.round(item.value).toLocaleString()}
                            </span>
                            <span class="flex items-center gap-1 font-bold ${item.lastTurnGrowth >= 0 ? 'text-green-600' : 'text-red-600'}">
                                <span class="material-symbols-outlined text-sm">trending_up</span>
                                Turn: ${item.lastTurnGrowth >= 0 ? '+' : ''}$${item.lastTurnGrowth.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </li>`;
    }).join('');
    
    itemList.innerHTML = listHTML;

    // 4. Set default details text
    const defaultDetailsHTML = data.length > 0
        ? `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an investment to see details.</div>`
        : `<p class="text-gray-500 p-4">You do not own any investments. Go to the "Buy Investment" tab to get started.</p>`;
    itemDetails.innerHTML = defaultDetailsHTML;

    // 5. Add click listener
    itemList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const itemId = listItem.dataset.itemId;
            const item = data.find(i => i.id === itemId);
            
            if (item) {
                // Highlight the selected item
                itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                listItem.classList.add('bg-blue-100');
                
                // --- Call the new details renderer (to be created in tablet-details.js) ---
                Details.renderMyInvestmentDetails(item, color);
            }
        }
    });
}


/**
 * Renders the custom layout for the "Loan" sub-tab.
 * @param {HTMLElement} container - The sub-content container.
 * @param {object} color - The color theme for the Bank tab.
 */
function renderLoanSubTab(container, color) {
    // --- FIX: Read from window.gameState ---
    // Ensure window.gameState is available
    if (!window.gameState) {
        container.innerHTML = `<p class="p-4 text-gray-600">Loading loan data...</p>`;
        return;
    }
    
    const { hecsDebt = 0, personalLoan = 0, mortgage = 0 } = window.gameState;
    // --- END FIX ---
    
    // This layout is h-full and scrolls internally
    container.innerHTML = `
        <div class="p-2 md:p-4 overflow-y-auto h-full">
            <h2 class="text-xl font-black mb-4" style="color: ${color.text}">Loan Management</h2>
            <div class="space-y-4">
                <div class="bg-white p-3 rounded-lg shadow-sm">
                    <h3 class="font-bold text-md mb-2 text-gray-800">Current Debts</h3>
                    <ul class="space-y-2 text-xs">
                        <li class="flex justify-between items-center"><span>HECS/HELP Debt:</span><span class="font-black text-md text-red-600">$${Math.round(hecsDebt).toLocaleString()}</span></li>
                        <li class="flex justify-between items-center"><span>Personal Loan:</span><span class="font-black text-md text-red-600">$${Math.round(personalLoan).toLocaleString()}</span></li>
                        <li class="flex justify-between items-center"><span>Mortgage:</span><span class="font-black text-md text-red-600">$${Math.round(mortgage).toLocaleString()}</span></li>
                    </ul>
                </div>
                <div class="md:flex md:gap-4 space-y-4 md:space-y-0">
                    <div class="bg-white p-3 rounded-lg shadow-sm w-full">
                        <h3 class="font-bold text-md mb-2 text-gray-800">Request Loan</h3>
                        <div class="flex items-center gap-2">
                            <input type="number" id="loan-request-amount" placeholder="Amount" class="w-full p-2 text-sm border-gray-300 rounded-md">
                            <button data-action="request-loan" class="sfx-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm">Request</button>
                        </div>
                    </div>
                    <div class="bg-white p-3 rounded-lg shadow-sm w-full">
                        <h3 class="font-bold text-md mb-2 text-gray-800">Make Repayment</h3>
                        <div class="flex items-center gap-2">
                            <input type="number" id="loan-repay-amount" placeholder="Amount" class="w-full p-2 text-sm border-gray-300 rounded-md">
                            <button data-action="repay-loan" class="sfx-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm">Repay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}
