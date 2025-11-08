// --- MODIFIED: This file is redesigned to use the new sub-tab structure ---

// --- FIX: Removed direct import. Will use window.gameState instead. ---
// import { gameState } from '../state.js';
// Import gameData to access static super education articles
import { gameData } from './loader.js';
// Import tab configuration for title
import { tabletData } from './tablet-data.js';
// Import detail renderer for education articles
import * as Details from './tablet-details.js';
// Import the shared list/detail layout helper function
import { renderListDetailView } from './tablet-helpers.js';

/**
 * Renders the content specifically for the "Fund Details" sub-tab within the Superannuation tab.
 * Displays the current balance, transaction history, and allows voluntary contributions.
 * @param {HTMLElement} container - The container element for the fund details sub-tab content.
 * @param {object} color - The color theme object for the Superannuation tab (Purple).
 */
function renderFundDetails(container, color) {
    // --- FIX: Read from window.gameState ---
    // Ensure gameState is available before rendering
    if (!window.gameState || !window.gameState.superannuation) {
        container.innerHTML = `<p class="p-4 text-gray-600">Loading superannuation data... Please wait.</p>`;
        return;
    }
    const { superannuation } = window.gameState;
    // --- END FIX ---

    // Generate the HTML for the fund details sub-tab
    container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full p-1">
        <!-- Left Column: Summary & Contribution -->
        <div class="lg:col-span-2 space-y-4">
            <!-- Fund Summary Box -->
            <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-bold text-md mb-2 text-gray-800">Fund Summary</h3>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Current Balance:</span>
                    <span class="text-2xl font-black" style="color: ${color.text}">$${Math.round(superannuation.value).toLocaleString()}</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">This balance is preserved for your retirement.</p>
            </div>

            <!-- Voluntary Contribution Box -->
            <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h3 class="font-bold text-md mb-2 text-gray-800">Make Voluntary Contribution</h3>
                <p class="text-xs text-gray-600 mb-2">Add your own after-tax money from your wallet to boost your super.</p>
                <div class="flex items-center gap-2 mt-3">
                    <input type="number" id="super-contrib-amount" placeholder="Amount ($)" min="1" step="1" class="w-full p-2 text-sm border-gray-300 rounded-md focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
                    <button data-action="add-to-super" class="sfx-button flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm whitespace-nowrap">
                        Add Funds
                    </button>
                </div>
            </div>
        </div>

        <!-- Right Column: Transaction History -->
        <div class="lg:col-span-3 bg-gray-100 p-2 rounded-lg h-full overflow-y-auto border border-gray-200">
            <h3 class="font-bold text-md mb-2 text-gray-800 p-1 sticky top-0 bg-gray-100 z-10">Transaction History</h3>
            <ul id="super-transactions" class="space-y-1 text-xs">
                ${superannuation.transactions.length === 0
                    ? '<li class="text-gray-500 p-2 text-center">No transactions recorded yet.</li>'
                    // Display latest transactions first (index 0 is newest)
                    : superannuation.transactions.map(t => `
                        <li class="bg-white p-2 rounded shadow-sm flex justify-between items-center border border-gray-100">
                            <div>
                                <span class="font-semibold block">${t.type}</span>
                                <span class="text-gray-500 text-[11px]">${t.details || t.turn} ${t.details ? `(${t.turn})` : ''}</span>
                            </div>
                            <span class="font-bold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}">
                                ${t.amount >= 0 ? '+' : ''}$${Math.round(t.amount).toLocaleString()}
                            </span>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
    </div>
    `;
};

/**
 * Renders the main layout for the Superannuation Tab, including its sub-tabs ("Fund Details", "Super Education").
 * Handles switching between the sub-tabs, matching the new design language.
 * @param {HTMLElement} container - The main container element for the superannuation tab content.
 * @param {object} color - The color theme object for the Superannuation tab (Purple).
 * @param {boolean} [isUpdate=false] - Flag indicating if this is just an update or initial render.
 */
export function renderSuperLayout(container, color, isUpdate = false) {
    // 1. Setup Main Layout and Sub-tabs (only on initial render)
    let currentSubTab = 'details'; // Default to details
    if (!isUpdate) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Sub-tab Navigation (using .profile-sub-nav style) -->
                <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                    <button data-subtab="details" class="profile-sub-tab py-2 px-4 text-sm font-bold active" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                        <span class="material-symbols-outlined text-base mr-1">account_balance_wallet</span>
                        Fund Details
                    </button>
                    <button data-subtab="education" class="profile-sub-tab py-2 px-4 text-sm font-bold text-gray-500" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                        <span class="material-symbols-outlined text-base mr-1">school</span>
                        Super Education
                    </button>
                </nav>
                <!-- Sub-tab Content Area -->
                <div id="super-sub-content" class="flex-grow min-h-0">
                    <!-- Content for the active sub-tab will be rendered here -->
                </div>
            </div>`;
    } else {
        // If updating, find out which sub-tab is currently active
        const activeTabButton = container.querySelector('.profile-sub-tab.active');
        if (activeTabButton) {
            currentSubTab = activeTabButton.dataset.subtab;
        }
    }

    // 2. Get References
    const subContentContainer = document.getElementById('super-sub-content');
    const subTabButtons = container.querySelectorAll('.profile-sub-tab');
    if (!subContentContainer || subTabButtons.length === 0) {
        console.error("Superannuation sub-tab elements not found.");
        return;
    }

    // 3. Function to Set Active Sub-tab and Render Content
    function setActiveSubTab(subTabName) {
        subTabButtons.forEach(button => {
            const isActive = button.dataset.subtab === subTabName;
            button.classList.toggle('active', isActive); // Style active tab
            button.classList.toggle('text-gray-500', !isActive);
        });

        // Render content based on the active sub-tab
        if (subTabName === 'details') {
            // Render the specific UI for fund details and transactions
            renderFundDetails(subContentContainer, color);
        } else if (subTabName === 'education') {
            // Use the shared helper to display static super education articles
            renderListDetailView(
                subContentContainer,
                gameData.Super,                 // Data source: Static super articles
                Details.renderEducationDetails, // Detail renderer for articles
                color,
                "No superannuation education articles available.",
                isUpdate // Pass update flag
            );
        }
    }

    // 4. Setup Event Listeners (only on initial render)
    if (!isUpdate) {
        subTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                setActiveSubTab(e.currentTarget.dataset.subtab); // Click is not initial load
            });
        });
    }

    // 5. Initial Render or Update Content
    setActiveSubTab(currentSubTab);
}
