import { gameData } from './loader.js';
import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';
import { applyRealismFilters } from './tablet-helpers.js';

// Helper to format contract names (e.g., "part_time" -> "Part Time")
const formatContractName = (contract) => {
    if (contract === 'All') return 'All Contracts';
    return contract.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to get the correct icon for each contract type
const getContractIcon = (contract) => {
    const iconMap = {
        'All': 'apps',
        'part_time': 'schedule',
        'full_time': 'business_center',
        'casual': 'work_history'
    };
    return iconMap[contract] || 'label'; // Default icon
};

let currentActiveContract = 'All';

/**
 * Renders the content for the Jobs tab.
 * This is a specialized version of the two-column layout, now with sub-tabs.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Jobs tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderJobsLayout(container, color, isUpdate = false) {
    const tabName = 'Jobs';
    const data = gameData[tabName]; // This is the original, unfiltered data

    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }
    
    if (!isUpdate) {
        currentActiveContract = 'All';
    }

    // Get all unique contract types and add "All" to the front
    const contracts = ['All', ...new Set(data.map(item => item.contract))];

    const subTabHTML = contracts.map(contract => `
        <button data-contract="${contract}" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${contract === currentActiveContract ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">${getContractIcon(contract)}</span>
            ${formatContractName(contract)}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="flex flex-col h-full">
            <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                ${subTabHTML}
            </nav>
            <div id="jobs-sub-content" class="flex-grow min-h-0">
                <!-- The two-column layout will be rendered here -->
            </div>
        </div>`;
    
    const subContentContainer = document.getElementById('jobs-sub-content');
    const subTabs = container.querySelectorAll('.profile-sub-tab');

    // Function to render the two-column layout for a contract type
    const renderSubContract = (contract) => {
        // [THIS IS THE BUG FIX]
        // Apply global realism filters first, passing window.gameState
        const baseData = applyRealismFilters(data, tabName, window.gameState);

        // 1. Filter data based on contract (using the *already filtered* list)
        const filteredData = (contract === 'All') 
            ? baseData 
            : baseData.filter(item => item.contract === contract);
        
        // 2. Inject the two-column layout HTML
        subContentContainer.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
                <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto">
                    <ul id="item-list" class="space-y-2"></ul>
                </div>
                <div id="item-details" class="lg:col-span-3 h-full overflow-y-auto p-2">
                </div>
            </div>`;
        
        const itemList = subContentContainer.querySelector('#item-list');
        const itemDetails = subContentContainer.querySelector('#item-details');

        // 3. Populate the list
        itemList.innerHTML = filteredData.map(item => {
            const originalIndex = data.indexOf(item); // Use original index to find in details
            return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${originalIndex}"><div class="bg-white p-2 rounded-lg shadow-sm">${Details.renderListItem(tabName, item, color)}</div></li>`;
        }).join('');

        // 4. Set default details text
        const defaultDetailsHTML = filteredData.length > 0 
            ? `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an item to see the details.</div>` 
            : `<p class="text-gray-500 p-4">No jobs found matching your criteria.</p>`;
        itemDetails.innerHTML = defaultDetailsHTML;


        // 5. Add click listener for the list
        itemList.addEventListener('click', (e) => {
            const shortcutButton = e.target.closest('button[data-action]');
            if (shortcutButton) {
                return; 
            }

            const listItem = e.target.closest('li');
            if (listItem) {
                const index = parseInt(listItem.dataset.index, 10);
                if(data[index]) {
                    itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                    listItem.classList.add('bg-blue-100');
                    Details.renderDetails(tabName, data[index], color);
                }
            }
        });
    };

    // Add Event Listeners to Sub-Tabs
    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const contract = e.currentTarget.dataset.contract;
            
            currentActiveContract = contract;
            
            subTabs.forEach(t => {
                t.classList.toggle('active', t.dataset.contract === contract);
                t.classList.toggle('text-gray-500', t.dataset.contract !== contract);
            });
            
            renderSubContract(contract);
        });
    });

    // Initial Render
    renderSubContract(currentActiveContract);
}