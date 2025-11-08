// --- MODIFIED: This file is completely redesigned to use the new sub-tab structure ---

// --- FIX: Removed stale gameState import ---
// import { gameState } from '../state.js';
// Import gameData to access static tax education articles
import { gameData } from './loader.js';
// Import tab configuration for title
import { tabletData } from './tablet-data.js';
// Import detail renderers for education articles and tax lodge summaries
import * as Details from './tablet-details.js';
// Import the shared list/detail layout helper function
import { renderListDetailView } from './tablet-helpers.js';

/**
 * Renders the main layout for the ATO Tab, including its sub-tabs ("Tax Lodgements", "Tax Education").
 * Handles switching between the sub-tabs, matching the new design language.
 * @param {HTMLElement} container - The main container element for the ATO tab content.
 * @param {object} color - The color theme object for the ATO tab (Red).
 * @param {boolean} [isUpdate=false] - Flag indicating if this is just an update or initial render.
 */
export function renderAtoLayout(container, color, isUpdate = false) {
    // 1. Setup Main Layout and Sub-tabs (only on initial render)
    let currentSubTab = 'lodgements'; // Default to lodgements
    if (!isUpdate) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Sub-tab Navigation (using .profile-sub-nav style) -->
                <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                    <button data-subtab="lodgements" class="profile-sub-tab py-2 px-4 text-sm font-bold active" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                        <span class="material-symbols-outlined text-base mr-1">request_quote</span>
                        Tax Lodgements
                    </button>
                    <button data-subtab="education" class="profile-sub-tab py-2 px-4 text-sm font-bold text-gray-500" style="--active-color:${color.bg}; --active-color-text:${color.text};">
                        <span class="material-symbols-outlined text-base mr-1">school</span>
                        Tax Education
                    </button>
                </nav>
                <!-- Sub-tab Content Area -->
                <div id="ato-sub-content" class="flex-grow min-h-0">
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
    const subContentContainer = document.getElementById('ato-sub-content');
    const subTabButtons = container.querySelectorAll('.profile-sub-tab');
    if (!subContentContainer || subTabButtons.length === 0) {
        console.error("ATO sub-tab elements not found.");
        return;
    }
    
    // --- FIX: Ensure live gameState is available ---
    if (!window.gameState) {
        container.innerHTML = `<p>Loading state...</p>`;
        return;
    }

    // 3. Function to Set Active Sub-tab and Render Content
    function setActiveSubTab(subTabName) {
        subTabButtons.forEach(button => {
            const isActive = button.dataset.subtab === subTabName;
            button.classList.toggle('active', isActive); // Style active tab
            button.classList.toggle('text-gray-500', !isActive);
        });

        // Render content based on the active sub-tab using the shared helper
        if (subTabName === 'education') {
            // Display static tax education articles from gameData.Tax
            renderListDetailView(
                subContentContainer,
                gameData.Tax,                     // Data source: Static tax articles
                Details.renderEducationDetails,   // Detail renderer for articles
                color,
                "No tax education articles available.",
                isUpdate // Pass update flag
            );
        } else if (subTabName === 'lodgements') {
            // Display dynamic tax lodge history from gameState.tax
            // --- FIX: Read from window.gameState ---
            renderListDetailView(
                subContentContainer,
                window.gameState.tax.taxLodgeHistory,   // Data source: Player's lodge history
                Details.renderTaxLodgeDetails,   // Detail renderer for lodge summaries
                color,
                "You haven't lodged any tax returns yet.",
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
    // This will render the default tab on load, or refresh the active tab on update
    setActiveSubTab(currentSubTab);
}

