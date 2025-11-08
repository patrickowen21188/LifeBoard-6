import { gameData } from './loader.js';
import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';

// --- NEW: Import the new layout renderers ---
import { renderDifficultyLayout } from './tablet-difficulty.js';
import { renderGoalsLayout } from './tablet-goals.js';
// --- END NEW ---

import { renderPathwayLayout } from './tablet-pathway.js';
import { renderProfileContent } from './tablet-profile.js';
import { renderNewsLayout } from './tablet-news.js';
import { renderJobsLayout } from './tablet-jobs.js';
import { renderLifestyleLayout } from './tablet-lifestyle.js';
import { renderBankLayout } from './tablet-bank.js';
import { renderPropertyLayout } from './tablet-property.js';
import { renderAtoLayout } from './tablet-ato.js';
import { renderSuperLayout } from './tablet-super.js';

export {
    // --- NEW: Export the new layouts ---
    renderDifficultyLayout,
    renderGoalsLayout,
    // --- END NEW ---
    
    renderPathwayLayout,
    renderProfileContent,
    renderNewsLayout,
    renderJobsLayout,
    renderLifestyleLayout,
    renderBankLayout,
    renderPropertyLayout,
    renderAtoLayout,
    renderSuperLayout
};

/**
 * Renders a generic two-column layout (list on left, details on right).
 * Used by: Insurance
 * @param {HTMLElement} container - The main browser content container.
 * @param {string} tabName - The key for gameData (e.g., 'Property', 'Insurance').
 * @param {Array} data - The array of items to display.
 * @param {object} color - The color theme object.
 */
export function renderTwoColumnLayout(container, tabName, data, color) {
    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
            <h1 class="text-xl font-black" style="color: ${tabletData[tabName]?.color.text || color.text}">${tabletData[tabName]?.title || 'Market'}</h1>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-4rem)]">
            <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto"><ul id="item-list" class="space-y-2"></ul></div>
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
            return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${originalIndex}"><div class="bg-white p-2 rounded-lg shadow-sm">${Details.renderListItem(tabName, item, color)}</div></li>`;
        }).join('');
        itemDetails.innerHTML = itemsToRender.length > 0 ? `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an item to see the details.</div>` : `<p class="text-gray-500 p-4">No items found.</p>`;
    };

    updateList(data);

    itemList.addEventListener('click', (e) => {
        const shortcutButton = e.target.closest('button[data-action]');
        if (shortcutButton) {
            return; // Let tablet-main.js handle the action
        }

        const listItem = e.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.dataset.index, 10);
            if (data[index]) {
                itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                listItem.classList.add('bg-blue-100');
                Details.renderDetails(tabName, data[index], color);
            }
        }
    });
}