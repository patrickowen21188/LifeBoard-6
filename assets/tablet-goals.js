/**
 * tablet-goals.js
 * Renders the goal selection screen.
 * This is a new file, modeled after tablet-jobs.js (two-column layout)
 */

import { gameData } from './loader.js';
import * as Details from './tablet-details.js';

// --- NEW: Simplified List Item Renderer for Goals ---
function renderGoalListItem(item, color) {
    return `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl" style="color: ${color.text}">${item.icon || 'flag'}</span>
            <div>
                <p class="font-bold text-xs" style="color: ${color.text}">${item.name}</p>
                <p class="text-xs text-gray-600 mt-1">${item.description}</p>
            </div>
        </div>`;
}

// --- NEW: Simplified Details Renderer for Goals ---
function renderGoalDetails(item, color, container) {
    container.innerHTML = `
        <div class="flex flex-col gap-y-4 h-full p-2">
            <div class="w-full bg-gray-100 rounded-lg min-h-[120px] flex items-center justify-center">
                 <span class="material-symbols-outlined text-8xl" style="color: ${color.text}">${item.icon || 'flag'}</span>
            </div>
            <div>
                <h2 class="text-xl font-black" style="color: ${color.text}">${item.name}</h2>
                <p class="text-sm font-semibold text-gray-700">${item.description}</p>
                <div class="border-l-4 rounded mt-2 p-2 text-xs italic bg-white" style="border-color: ${color.bg};">
                    <strong>Learning Focus:</strong> ${item.teachingFocus}
                </div>
            </div>
            <div class="mt-auto pt-2">
                <button data-action="choose-goal" data-item-id="${item.id}" class="sfx-button text-white font-bold py-2 px-4 rounded-lg w-full text-sm flex items-center justify-center gap-1"
                        style="background-color: ${color.bg};">
                    Select This Goal
                </button>
            </div>
        </div>`;
}


/**
 * Renders the content for the Goals tab.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Goals tab.
 */
export function renderGoalsLayout(container, color) {
    const tabName = 'Goals';
    const data = gameData[tabName]; // This is the original, unfiltered data

    if (!data) {
        container.innerHTML = `<p class="p-4 text-gray-600">No data available for ${tabName}.</p>`;
        return;
    }

    // 1. Inject the two-column layout HTML
    container.innerHTML = `
        <div class="p-4 pt-0 flex flex-col h-full">
            <h1 class="text-2xl font-black text-center mb-4" style="color: ${color.text};">Choose Your Goal</h1>
            <p class="text-center text-gray-600 mb-6 text-sm">Select one goal to aim for. Your choice will be tracked in your Profile.</p>
            
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-grow min-h-0">
                <div class="lg:col-span-2 bg-black/5 p-2 rounded-lg h-full overflow-y-auto">
                    <ul id="item-list" class="space-y-2"></ul>
                </div>
                <div id="item-details" class="lg:col-span-3 h-full overflow-y-auto p-2">
                </div>
            </div>
        </div>`;
    
    const itemList = container.querySelector('#item-list');
    const itemDetails = container.querySelector('#item-details');

    // 2. Populate the list
    itemList.innerHTML = data.map(item => {
        // Use original index to find in details
        const originalIndex = data.indexOf(item); 
        return `
            <li class="p-2 cursor-pointer hover:bg-black/5 rounded-lg" data-index="${originalIndex}">
                <div class="bg-white p-2 rounded-lg shadow-sm">
                    ${renderGoalListItem(item, color)}
                </div>
            </li>`;
    }).join('');

    // 3. Set default details text
    itemDetails.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">Select a goal to see the details.</div>`;

    // 4. Add click listener for the list
    itemList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.dataset.index, 10);
            if(data[index]) {
                itemList.querySelectorAll('li').forEach(li => li.classList.remove('bg-blue-100'));
                listItem.classList.add('bg-blue-100');
                renderGoalDetails(data[index], color, itemDetails);
            }
        }
    });

    // 5. Show first item by default
    if (data.length > 0) {
        itemList.querySelector('li[data-index="0"]')?.classList.add('bg-blue-100');
        renderGoalDetails(data[0], color, itemDetails);
    }
}