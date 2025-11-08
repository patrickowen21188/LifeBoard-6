import { gameData } from './loader.js';
import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';
// --- FIX: Import the realism filter function ---
import { applyRealismFilters } from './tablet-helpers.js';

// Helper to format zone names (e.g., "inner" -> "Inner")
const formatZoneName = (zone) => {
    if (zone === 'All') return 'All Zones';
    return zone.charAt(0).toUpperCase() + zone.slice(1);
};

// Helper to get the correct icon for each zone
const getZoneIcon = (zone) => {
    const iconMap = {
        'All': 'apps',
        'inner': 'location_city', // e7f1
        'suburb': 'storefront',    // ef9f
        'outer': 'agriculture'     // e586
    };
    return iconMap[zone] || 'label'; // Default icon
};

// --- NEW: Add a persistent variable to store the active sub-tab ---
let currentActiveZone = 'All';

/**
 * Renders the content for the Property tab.
 * This now includes zone sub-tabs with icons.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Property tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderPropertyLayout(container, color, isUpdate = false) {
    const tabName = 'Property';
    const data = gameData[tabName];
    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }

    // --- NEW: Reset the sub-tab only if it's NOT an update ---
    if (!isUpdate) {
        currentActiveZone = 'All';
    }
    // --- END NEW ---

    // Get all unique zones and add "All" to the front
    const zones = ['All', ...new Set(data.map(item => item.zone))];

    // --- Create Sub-Tab Navigation ---
    // MODIFIED: Uses currentActiveZone to set the 'active' class
    const subTabHTML = zones.map(zone => `
        <button data-zone="${zone}" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${zone === currentActiveZone ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">${getZoneIcon(zone)}</span>
            ${formatZoneName(zone)}
        </button>
    `).join('');

    // --- Main Layout with Sub-Tabs ---
    // We use a flex-col layout. The nav does not shrink.
    // The sub-content container (flex-grow) will contain the h-full grid.
    // min-h-0 is a flexbox fix to ensure h-full works correctly in the child.
    container.innerHTML = `
        <div class="flex flex-col h-full">
            <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                ${subTabHTML}
            </nav>
            <div id="property-sub-content" class="flex-grow min-h-0">
                <!-- The two-column layout will be rendered here -->
            </div>
        </div>`;
    
    const subContentContainer = document.getElementById('property-sub-content');
    const subTabs = container.querySelectorAll('.profile-sub-tab');

    // --- Function to render the two-column layout for a zone ---
    const renderSubZone = (zone) => {
        // --- *** CRITICAL BUG FIX *** ---
        // 1. Apply the global realism filter (age, etc.) *first*
        //    We must pass window.gameState to the helper function.
        const baseData = applyRealismFilters(data, tabName, window.gameState);
        // --- *** END FIX *** ---

        // 2. Filter data based on zone (using the *already filtered* list)
        const filteredData = (zone === 'All') 
            ? baseData 
            : baseData.filter(item => item.zone === zone);
        
        // 3. Inject the two-column layout HTML
        // This grid is h-full, making it fill the #property-sub-content container.
        // The columns inside it are also h-full and scroll independently.
        subContentContainer.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
                <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto">
                    <ul id="item-list" class="space-y-2"></ul>
                </div>
                <div id="item-details" class="lg:col-span-3 h-full overflow-y-auto p-2">
                    <!-- Details will be injected here, or a placeholder -->
                </div>
            </div>`;
        
        const itemList = subContentContainer.querySelector('#item-list');
        const itemDetails = subContentContainer.querySelector('#item-details');

        // 4. Populate the list
        itemList.innerHTML = filteredData.map(item => {
            const originalIndex = data.indexOf(item); // Use original index to find in details
            // Details.renderListItem will automatically show the inflated price/rent
            return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${originalIndex}"><div class="bg-white p-2 rounded-lg shadow-sm">${Details.renderListItem(tabName, item, color)}</div></li>`;
        }).join('');

        // 5. Set default details text
        // This placeholder is now inside the right-hand scrolling column.
        const defaultDetailsHTML = filteredData.length > 0 
            ? `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an item to see the details.</div>` 
            : `<p class="text-gray-500 p-4">No properties found in this zone.</p>`;
        itemDetails.innerHTML = defaultDetailsHTML;


        // 6. Add click listener for the list
        itemList.addEventListener('click', (e) => {
            const shortcutButton = e.target.closest('button[data-action]');
            if (shortcutButton) {
                return; // Let tablet-main.js handle it
            }

            const listItem = e.target.closest('li');
            if (listItem) {
                const index = parseInt(listItem.dataset.index, 10);
                if(data[index]) {
                    itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                    listItem.classList.add('bg-blue-100');
                    // We render the details *into* the right column div
                    // Details.renderDetails will automatically show inflated price/rent
                    Details.renderDetails(tabName, data[index], color);
                }
            }
        });
    };

    // --- Add Event Listeners to Sub-Tabs ---
    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const zone = e.currentTarget.dataset.zone;
            
            // --- NEW: Update the persistent variable ---
            currentActiveZone = zone;
            // --- END NEW ---
            
            // Update active tab style
            subTabs.forEach(t => {
                t.classList.toggle('active', t.dataset.zone === zone);
                t.classList.toggle('text-gray-500', t.dataset.zone !== zone);
            });
            
            // Render the content for the clicked zone
            renderSubZone(zone);
        });
    });

    // --- Initial Render ---
    // --- MODIFIED: Render the stored sub-tab, not just 'All' ---
    renderSubZone(currentActiveZone);
}
