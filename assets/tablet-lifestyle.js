import { gameData } from './loader.js';
import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';
import { applyRealismFilters } from './tablet-helpers.js';

// Helper to format category names (e.g., "food_and_drink" -> "Food & Drink")
const formatCategoryName = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to get the correct icon for each category
const getCategoryIcon = (category) => {
    const iconMap = {
        'All': 'apps',
        'entertainment': 'play_circle',
        'food_and_drink': 'restaurant',
        'leisure_and_social': 'downhill_skiing',
        'health': 'health_and_safety',
        'learning': 'school'
    };
    return iconMap[category] || 'label'; // Default icon
};

let currentActiveCategory = 'All';

/**
 * Renders the content for the Lifestyle tab.
 * This now includes category sub-tabs with icons.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Lifestyle tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderLifestyleLayout(container, color, isUpdate = false) {
    const tabName = 'Lifestyle';
    const data = gameData[tabName];
    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }

    if (!isUpdate) {
        currentActiveCategory = 'All';
    }

    // Get all unique categories and add "All" to the front
    const categories = ['All', ...new Set(data.map(item => item.category))];

    const subTabHTML = categories.map(category => `
        <button data-category="${category}" 
                class="profile-sub-tab py-2 px-4 text-sm font-bold ${category === currentActiveCategory ? 'active' : 'text-gray-500'}" 
                style="--active-color:${color.bg}; --active-color-text:${color.text};">
            <span class="material-symbols-outlined text-base mr-1">${getCategoryIcon(category)}</span>
            ${formatCategoryName(category)}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="flex flex-col h-full">
            <nav class="profile-sub-nav flex items-center border-b border-gray-300 mb-4 flex-shrink-0">
                ${subTabHTML}
            </nav>
            <div id="lifestyle-sub-content" class="flex-grow min-h-0">
                <!-- The two-column layout will be rendered here -->
            </div>
        </div>`;
    
    const subContentContainer = document.getElementById('lifestyle-sub-content');
    const subTabs = container.querySelectorAll('.profile-sub-tab');

    // Function to render the two-column layout for a category
    const renderSubCategory = (category) => {
        // [THIS IS THE BUG FIX]
        // Apply global realism filters first, passing window.gameState
        let baseData = applyRealismFilters(data, tabName, window.gameState);

        // Filter by player status (Student vs. Adult)
        const playerAge = window.gameState.year;
        const pathway = window.gameState.pathwayChosen;

        // Determine if the player is currently a "student"
        // Students are: under 18 OR (in Uni/TAFE AND under 24)
        const isStudent = (playerAge < 18) || 
                          ((pathway === 'University' || pathway === 'Vocational') && playerAge < 24);

        if (isStudent) {
            // If player is a student, REMOVE non-student recurring items
            baseData = baseData.filter(item => 
                item.purchaseType === 'one_time' || // Keep all one-time items
                item.id.includes('_student') || // Keep student items
                item.id.includes('_basic') || // Keep basic learning
                item.id.includes('_standard') // Keep standard items
            );
        } else {
            // If player is an "Adult" (Workforce or 24+), REMOVE student-only items
            baseData = baseData.filter(item => !item.id.includes('_student'));
        }

        // 1. Filter data based on category (using the *already filtered* list)
        const filteredData = (category === 'All') 
            ? baseData 
            : baseData.filter(item => item.category === category);
        
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
            : `<p class="text-gray-500 p-4">No items found matching your criteria.</p>`;
        itemDetails.innerHTML = defaultDetailsHTML;


        // 5. Add click listener for the list
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
                    Details.renderDetails(tabName, data[index], color);
                }
            }
        });
    };

    // Add Event Listeners to Sub-Tabs
    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            
            currentActiveCategory = category;
            
            subTabs.forEach(t => {
                t.classList.toggle('active', t.dataset.category === category);
                t.classList.toggle('text-gray-500', t.dataset.category !== category);
            });
            
            renderSubCategory(category);
        });
    });

    // Initial Render
    renderSubCategory(currentActiveCategory);
}