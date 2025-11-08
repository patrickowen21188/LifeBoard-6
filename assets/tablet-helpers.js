/**
 * tablet-helpers.js
 * Contains shared helper functions for the tablet UI, including
 * realism filters, the item ID checker for notifications,
 * and the generic list/detail renderer.
 */

import * as Details from './tablet-details.js';
import { gameData } from './loader.js';

/**
 * Applies realism filters (Age, Pathway, Cost, Market Weight) to a list of game data.
 * This is the single source of truth for filtering.
 * @param {Array} data - The full array of items (e.g., gameData.Jobs).
 * @param {string} tabName - The tab name ('Jobs', 'Lifestyle', 'Property').
 * @param {object} playerState - A snapshot of player state (e.g., { year, pathwayChosen }).
 * @returns {Array} The filtered array of items.
 */
export function applyRealismFilters(data, tabName, playerState) {
    if (!playerState) {
        console.warn("Realism filter: playerState is not available.");
        return [];
    }

    const { year: playerAge, pathwayChosen } = playerState;

    return data.filter(item => {
        let agePass = true;
        let pathwayPass = true;

        // Dynamic Job Market (Market Weight)
        // Check if the job should appear this turn based on its weight
        if (tabName === 'Jobs' && item.marketWeight) {
            if (Math.random() > item.marketWeight) {
                return false; // Job does not appear in the market this turn
            }
        }

        if (tabName === 'Jobs') {
            const pathwayRequirement = item.requirements?.pathways;

            // Under 18 Job Filter
            if (playerAge < 18) {
                const notFullTime = item.contract !== 'full_time';
                const hasJuniorRate = item.juniorRates && item.juniorRates[playerAge] > 0;
                
                pathwayPass = notFullTime && hasJuniorRate;
            
            } else if (pathwayChosen) {
                // Player is 18+ and has chosen a path
                if (Array.isArray(pathwayRequirement) && pathwayRequirement.length > 0) {
                    pathwayPass = pathwayRequirement.includes(pathwayChosen);
                } else {
                    pathwayPass = true; 
                }
            
            } else {
                // Player is 18+ and has NO path chosen (decision screen)
                pathwayPass = false; // Hide all jobs
            }
        
        } else if (tabName === 'Lifestyle') {
            // Standard age check
            const ageMin = item.ageMin || 0;
            const ageMax = item.ageMax || 99;
            agePass = (playerAge >= ageMin) && (playerAge <= ageMax);
            
            if (playerAge < 18) {
                // Hide expensive one-time purchases like holidays
                if (item.purchaseType === 'one_time' && item.oneTimeCost > 300) {
                    agePass = false;
                }
            }
        
        } else if (tabName === 'Property') {
            // Standard age check (tab is hidden < 18, but filter is here for safety)
            if (playerAge < 18) return false;

            const rentAgeMin = item.options.rent?.ageMin || 999;
            const buyAgeMin = item.options.buy?.ageMin || 999;
            const ageMin = Math.min(rentAgeMin, buyAgeMin);

            const rentAgeMax = item.options.rent?.ageMax || 0;
            const buyAgeMax = item.options.buy?.ageMax || 0;
            const ageMax = Math.max(rentAgeMax, buyAgeMax);
            
            if (ageMax === 0) {
                agePass = (playerAge >= ageMin);
            } else {
                agePass = (playerAge >= ageMin) && (playerAge <= ageMax);
            }
        }

        return agePass && pathwayPass;
    });
}

/**
 * A pure function that gets a Set of available item IDs.
 * This function now uses applyRealismFilters to avoid duplicating logic.
 * @param {string} tabName - The tab name ('Jobs', 'Lifestyle', 'Property').
 * @param {object} playerState - A snapshot of player state (e.g., { year, pathwayChosen }).
 * @returns {Set<string>} A Set of available item IDs.
 */
export function getFilteredItemIDs(tabName, playerState) {
    if (!playerState || !gameData[tabName]) return new Set();

    const data = gameData[tabName] || [];

    const filteredItems = applyRealismFilters(data, tabName, playerState);

    return new Set(filteredItems.map(item => item.id));
}


/**
 * Renders a generic two-column layout (list on left, details on right)
 * This is used by ATO and Super education tabs.
 * @param {HTMLElement} container - The main browser content container.
 * @param {Array} data - The array of items to display (e.g., education articles).
 * @param {Function} detailRenderer - The function to call to render details (e.g., Details.renderEducationDetails).
 * @param {object} color - The color theme object.
 * @param {string} emptyText - Text to show if data array is empty.
 * @param {boolean} [isUpdate=false] - Flag if this is just a content refresh.
 */
export function renderListDetailView(container, data, detailRenderer, color, emptyText = "No items available.", isUpdate = false) {
    
    let itemList = document.getElementById('item-list');
    let itemDetails = document.getElementById('item-details');

    if (!isUpdate || !itemList || !itemDetails) {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
                <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto">
                    <ul id="item-list" class="space-y-2"></ul>
                </div>
                <div id="item-details" class="lg:col-span-3 h-full overflow-y-auto p-2">
                </div>
            </div>`;
        itemList = document.getElementById('item-list');
        itemDetails = document.getElementById('item-details');
    }

    if (!data || data.length === 0) {
        itemList.innerHTML = `<p class="text-gray-500 p-4">${emptyText}</p>`;
        itemDetails.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">${emptyText}</div>`;
        return;
    }

    itemList.innerHTML = data.map((item, index) => {
        return `<li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${index}">
                    <div class="bg-white p-2 rounded-lg shadow-sm">
                        <p class="font-bold text-xs" style="color: ${color.text}">${item.headline || item.title}</p>
                        <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>${item.source || item.financialYear}</span>
                            <span>${item.isRead ? '' : (item.turn || '')}</span>
                        </div>
                    </div>
                </li>`;
    }).join('');

    // Re-bind listener to new 'itemList' to prevent duplicates
    const newList = itemList.cloneNode(true);
    itemList.parentNode.replaceChild(newList, itemList);
    
    newList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.dataset.index, 10);
            const item = data[index];
            if (item) {
                detailRenderer(item, color);
                
                if (item.isRead !== undefined) {
                    item.isRead = true;
                }
                
                newList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                listItem.classList.add('bg-blue-100');
            }
        }
    });

    if (data.length > 0 && !isUpdate) { // Only show first item on initial load
        detailRenderer(data[0], color);
        if (data[0].isRead !== undefined) data[0].isRead = true;
        newList.querySelector('li[data-index="0"]')?.classList.add('bg-blue-100');
    } else if (data.length > 0 && isUpdate) {
         itemDetails.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select an item to see details.</div>`;
    }
}