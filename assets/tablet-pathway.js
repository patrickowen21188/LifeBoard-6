import { gameData } from './loader.js';
import * as Game from '../game-logic.js';
import { gameState } from '../state.js';

const PATHWAY_DATA = gameData.Pathway;
const PATHWAY_COLOR = '#3b82f6'; // Blue color from the original Pathway tab in tablet-data.js

/**
 * Renders the full Pathway choice layout with three cards.
 * @param {HTMLElement} container - The main browser content container.
 * @param {object} color - The color theme for the Pathway tab.
 */
export function renderPathwayLayout(container, color) {
    if (gameState.pathwayChosen) {
        container.innerHTML = `<div class="p-8 text-center text-gray-600">You have already chosen the **${gameState.pathwayChosen}** path.</div>`;
        return;
    }

    // 1. Create Sub-Tab Navigation
    const subTabHTML = PATHWAY_DATA.map((path, index) => `
        <button data-path-id="${path.id}" 
                class="profile-sub-tab pathway-sub-tab py-2 px-4 text-sm font-bold ${index === 0 ? 'active' : 'text-gray-500'}" 
                style="--active-color:${PATHWAY_COLOR}; --active-color-text:#5b21b6;">
            <span class="material-symbols-outlined text-base mr-1">${path.icon}</span>
            ${path.name}
        </button>
    `).join('');

    // 2. Create the main layout
    container.innerHTML = `
        <div class="p-4 flex flex-col h-full overflow-y-auto">
            <h1 class="text-2xl font-black text-center mb-4" style="color: ${PATHWAY_COLOR};">Choose Your Life Path</h1>
            <p class="text-center text-gray-600 mb-6 text-sm">This decision is permanent and affects your starting debt, available jobs, and long-term earning potential. Choose wisely!</p>
            
            <!-- Sub-Tab Navigation -->
            <nav class="flex justify-center items-center border-b border-gray-300 mb-4 flex-shrink-0">
                ${subTabHTML}
            </nav>

            <!-- Sub-Tab Content Area -->
            <div id="pathway-sub-content" class="flex-grow min-h-0">
                <!-- Content will be injected here by JavaScript -->
            </div>
        </div>`;

    // 3. Get references
    const subContentContainer = document.getElementById('pathway-sub-content');
    const subTabButtons = container.querySelectorAll('.pathway-sub-tab');

    // 4. Function to render content for the selected pathway
    const renderPathwayDetails = (path) => {
        if (!path) {
            subContentContainer.innerHTML = '';
            return;
        }

        const isDebt = path.hecsDebt > 0;
        const hECSDisplay = path.hecsDebt > 0 
            ? `<span class="font-bold text-red-600">+$${path.hecsDebt.toLocaleString()} HECS Debt</span>`
            : `<span class="font-bold text-green-600">No Student Debt</span>`;

        subContentContainer.innerHTML = `
            <div class="space-y-4">
                <p class="text-sm text-gray-700 text-center">${path.description}</p>
                <div class="text-sm font-semibold text-center">${hECSDisplay}</div>
            </div>
            
            <!-- Action Button (Moved to its own centered wrapper) -->
            <div class="mt-4 flex-shrink-0 flex justify-center">
                <button data-action="choose-pathway" data-item-id="${path.id}" class="sfx-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg w-full max-w-xs text-sm transition-transform">
                    Choose ${path.name}
                </button>
            </div>

            <!-- Pros and Cons Side-by-Side -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <!-- Pros Section -->
                <div class="border-l-4 border-green-500 pl-3">
                        <h4 class="font-bold text-green-600 text-sm mb-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">check_circle</span> Pros
                        </h4>
                        <ul class="space-y-1 text-xs lg:text-sm text-gray-700">
                            ${path.pros.map(pro => `<li>&bull; ${pro}</li>`).join('')}
                        </ul>
                    </div>

                    <!-- Cons Section -->
                    <div class="border-l-4 border-red-500 pl-3">
                        <h4 class="font-bold text-red-600 text-sm mb-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">cancel</span> Cons
                        </h4>
                        <ul class="space-y-1 text-xs lg:text-sm text-gray-700">
                            ${path.cons.map(con => `<li>&bull; ${con}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>`;
    };

    // 5. Add event listeners for sub-tabs
    subTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pathId = e.currentTarget.dataset.pathId;
            const pathData = PATHWAY_DATA.find(p => p.id === pathId);

            // Update active button style
            subTabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.pathId === pathId);
                btn.classList.toggle('text-gray-500', btn.dataset.pathId !== pathId);
            });

            // Render the details
            renderPathwayDetails(pathData);
        });
    });

    // 6. Initial render (show the first pathway by default)
    if (PATHWAY_DATA.length > 0) {
        renderPathwayDetails(PATHWAY_DATA[0]);
    }
}