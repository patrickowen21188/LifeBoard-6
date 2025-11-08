import { tabletData } from './tablet-data.js';
import * as Details from './tablet-details.js';

/**
 * Renders the content for the News tab.
 * Automatically selects and displays the first unread item.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the News tab.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
export function renderNewsLayout(container, color, isUpdate = false) {
    const layoutHTML = `
        <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-black" style="color: ${color.text}">${tabletData['News'].title}</h1>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-3rem)]">
            <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto"><ul id="item-list" class="space-y-2"></ul></div>
            <div id="item-details" class="lg:col-span-3 h-full p-2 overflow-y-auto"></div>
        </div>`;
    container.innerHTML = layoutHTML;

    const itemList = document.getElementById('item-list');
    const itemDetails = document.getElementById('item-details');
    const newsLog = window.gameState?.newsLog || [];

    /**
     * Renders the list of news items on the left.
     * @param {boolean} animateFirst - If true, adds an animation class to the first item.
     */
    const updateNewsList = (animateFirst) => {
        itemList.innerHTML = newsLog.map((item, index) => `
            <li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg ${animateFirst && index === 0 ? 'new-item-animation' : ''}" data-index="${index}">
                <div class="bg-white p-2 rounded-lg shadow-sm">
                   <div class="flex items-start justify-between">
                        <div>
                            <p class="font-bold text-xs" style="color: ${item.isRead ? '' : color.text}">${item.headline}</p>
                            <div class="flex items-center justify-between text-xs text-gray-500 mt-1"><span>${item.source}</span><span>${item.turn}</span></div>
                        </div>
                        ${!item.isRead ? '<span class="new-badge">New</span>' : ''}
                    </div>
                </div>
            </li>`).join('');
    };

    // Initial render of the list
    updateNewsList(isUpdate);

    // --- Auto-Show Logic ---
    // Find the first unread item. If all are read, default to the first item (index 0).
    let targetIndex = newsLog.findIndex(item => !item.isRead);
    if (targetIndex === -1 && newsLog.length > 0) {
        targetIndex = 0; // Default to the very first item if all are read
    }

    if (targetIndex !== -1) {
        // If we found an item to display
        const itemToDisplay = newsLog[targetIndex];
        
        // Show its details
        Details.renderNewsDetails(itemToDisplay, color);
        
        // Mark it as read and re-render the list to remove the "New" badge
        if (!itemToDisplay.isRead) {
            itemToDisplay.isRead = true;
            updateNewsList(false); // Re-render list without animation
        }
        
        // Add the highlight to the correct list item
        itemList.querySelector(`li[data-index="${targetIndex}"]`)?.classList.add('bg-blue-100');
    } else {
        // No news items at all
        itemDetails.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">No news to report.</div>`;
    }
    // --- End Auto-Show Logic ---

    // Add click listener for all other items in the list
    itemList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.dataset.index, 10);
            const item = newsLog[index];
            if (item) {
                // Show details
                Details.renderNewsDetails(item, color);

                // Mark as read (if needed) and re-render list
                if (!item.isRead) {
                    item.isRead = true;
                    updateNewsList(false);
                }

                // Update highlighting
                itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                itemList.querySelector(`li[data-index="${index}"]`)?.classList.add('bg-blue-100');
            }
        }
    });
}
