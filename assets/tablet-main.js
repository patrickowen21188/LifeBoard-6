import { tabletData } from './tablet-data.js';
// Import *all* layout functions from the central layouts file
import * as Layouts from './tablet-layouts.js';
import { gameData } from './loader.js';
// MODIFIED: Import applyGameStartSettings (the new master launch function)
import * as Game from '../game-logic.js';
// MODIFIED: Import getFilteredItemIDs and difficulty settings
import { getFilteredItemIDs } from './tablet-helpers.js';
import { difficultySettings } from './data/difficulties.js';


let activeTabName = 'Difficulty'; // NEW: Start on Difficulty tab
let sounds = {};
let previousPlayerState = {};
// NEW: Store the temporary difficulty choice here
let tempDifficultyId = null;

// NEW: Countdown variables
let countdownInterval = null;
let countdownValue = 3; 

/**
 * Initializes the tablet UI.
 * This function is called by main.js to build the browser-like interface
 * inside the #panel-content element defined in index.html.
 */
export function initTablet() {
    const panelContent = document.getElementById('panel-content');
    if (!panelContent) {
        console.error("Tablet UI cannot initialize: panel-content is missing.");
        return;
    }

    // Define the HTML structure for the tablet's "browser" UI.
    const browserHTML = `
        <div id="browser-container">
            <header id="browser-header">
                <div class="traffic-lights"><div class="dot" style="background-color: #f87171;"></div><div class="dot" style="background-color: #fbbd23;"></div><div class="dot" style="background-color: #34d399;"></div></div>
                <div id="browser-address-bar">lifeboard.game</div>
            </header>
            <nav id="browser-tabs"></nav>
            <main id="browser-content"></main>
        </div>
        <!-- Notification container lives outside the browser but is created by it -->
        <div id="notification-container" class="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"></div>`;

    panelContent.innerHTML = browserHTML;

    // Initialize sound effects for the tablet UI
    sounds = {
        mouseOver: new window.Howl({ src: ['sounds/ui_mouseover.mp3'], volume: 0.5 }),
        click: new window.Howl({ src: ['sounds/ui_click.mp3'], volume: 0.5 }),
        confirm: new window.Howl({ src: ['sounds/event_positive.mp3'], volume: 0.7 }),
        countdownTick: new window.Howl({ src: ['sounds/countdown_tick.mp3'], volume: 0.9 })
    };

    renderTabs();
    
    // Always start on the Difficulty tab if the game hasn't started
    if (!window.gameState.gameStarted) {
        setActiveTab('Difficulty');
    } else {
        // If loaded mid-game (e.g. state persistence), default to Profile
        setActiveTab('Profile'); 
    }

    setupEventListeners();

    // Initialize the previous state for notification checking
    if (window.gameState) {
        previousPlayerState = {
            year: window.gameState.year,
            pathwayChosen: window.gameState.pathwayChosen
        };
    }
}

/**
 * Renders the navigation tabs based on the tabletData configuration.
 * MODIFIED: Acts as the master gatekeeper for the entire game flow.
 */
function renderTabs() {
    const tabsContainer = document.getElementById('browser-tabs');
    if (!tabsContainer) return; 
    
    const allTabNames = Object.keys(tabletData);
    const playerState = window.gameState;
    if (!playerState) return;

    let filteredTabNames = [];

    if (!playerState.gameStarted) {
        // STEP 1: Difficulty Selection is Active
        filteredTabNames = ['Difficulty'];
        activeTabName = 'Difficulty';
    } else if (!playerState.chosenGoal) {
        // STEP 2: Goal Selection is Active
        filteredTabNames = ['Goals'];
        activeTabName = 'Goals';
    } else if (playerState.year >= 18 && !playerState.pathwayChosen) {
        // STEP 3 (Mid-game): Pathway Selection is Active
        filteredTabNames = allTabNames.filter(tabName => tabName === 'Pathway');
        activeTabName = 'Pathway';
    } else {
        // STEP 4: Game is fully running (Show all tabs except setup ones)
        filteredTabNames = allTabNames.filter(tabName => 
            tabName !== 'Difficulty' && tabName !== 'Goals' && tabName !== 'Pathway'
        );
        // NEW: Hide Property tab if under 18
        if (playerState.year < 18) {
            filteredTabNames = filteredTabNames.filter(tabName => tabName !== 'Property');
        }
        // If we are fully running and the active tab was a setup tab, switch to Profile
        if (['Difficulty', 'Goals'].includes(activeTabName)) {
            activeTabName = 'Profile';
        }
    }

    tabsContainer.innerHTML = filteredTabNames.map(tabName => {
        const tab = tabletData[tabName];
        // NEW: Check if the current active tab is the correct one for the flow
        const isActive = tabName === activeTabName; 
        
        return `
            <button class="browser-tab relative ${isActive ? 'active' : ''}" data-tab="${tabName}" id="tab-button-${tabName}" style="--tab-bg-color: ${tab.color.bg};">
                <span class="material-symbols-outlined text-base">${tab.icon}</span>
                <span class="tab-text">${tabName}</span>
            </button>`;
    }).join('');
}


/**
 * Sets the active tab, updates the content, and styles.
 * @param {string} tabName - The name of the tab to activate.
 * @param {boolean} [isUpdate=false] - If true, just refreshes content.
 */
function setActiveTab(tabName, isUpdate = false) {
    activeTabName = tabName;
    const data = tabletData[tabName];
    if (!data) return;

    const browserContainer = document.getElementById('browser-container');
    const contentContainer = document.getElementById('browser-content');

    // Update tab button styles
    document.querySelectorAll('.browser-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

    // Update browser theme
    if (browserContainer) {
        browserContainer.style.setProperty('--active-content-bg', data.color.bg_light);
    }
    const addressBar = document.getElementById('browser-address-bar');
    if (addressBar) {
        addressBar.textContent = data.title;
    }

    // Clear notification dot and RESET COUNT
    const tabButton = document.getElementById(`tab-button-${tabName}`);
    if (tabButton) {
        const notification = tabButton.querySelector('.notification-dot');
        if (notification) notification.remove();
        
        if (window.gameState.notificationCounts) {
            window.gameState.notificationCounts[tabName] = 0;
        }
    }

    if (!contentContainer) return; // Safety check before rendering content
    
    // Render the content for the selected tab by calling the appropriate layout function
    switch(tabName) {
        // NEW STARTUP TABS
        case 'Difficulty': Layouts.renderDifficultyLayout(contentContainer, data.color); break;
        case 'Goals': Layouts.renderGoalsLayout(contentContainer, data.color); break;
        
        // GAME FLOW TABS
        case 'Pathway': Layouts.renderPathwayLayout(contentContainer, data.color, isUpdate); break; 
        case 'Profile': Layouts.renderProfileContent(contentContainer, data.color, isUpdate); break;
        case 'News': Layouts.renderNewsLayout(contentContainer, data.color, isUpdate); break;
        case 'Bank': Layouts.renderBankLayout(contentContainer, data.color, isUpdate); break;
        case 'Jobs': Layouts.renderJobsLayout(contentContainer, data.color, isUpdate); break;
        case 'Lifestyle': Layouts.renderLifestyleLayout(contentContainer, data.color, isUpdate); break;
        case 'Property': Layouts.renderPropertyLayout(contentContainer, data.color, isUpdate); break;
        case 'ATO': Layouts.renderAtoLayout(contentContainer, data.color, isUpdate); break;
        case 'Superannuation': Layouts.renderSuperLayout(contentContainer, data.color, isUpdate); break;

        // Default/Simple Layouts
        case 'Insurance':
            Layouts.renderTwoColumnLayout(contentContainer, tabName, gameData[tabName], data.color);
            break;
        default:
            contentContainer.innerHTML = `<h1 class="text-xl p-4 font-black" style="color: ${data.color.text}">${data.title}</h1><div>${data.content || ''}</div>`;
    }
}

/**
 * NEW FUNCTION: Initiates the 3-second countdown visual inside the tablet.
 * @param {string} difficultyId - The chosen difficulty ID.
 * @param {string} goalId - The chosen goal ID.
 */
function _showCountdown(difficultyId, goalId) {
    const contentContainer = document.getElementById('browser-content');
    if (!contentContainer) return;

    // Reset countdown variables
    countdownValue = 3;
    clearInterval(countdownInterval);

    contentContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 class="text-4xl font-black text-gray-700 mb-6">Starting Game...</h1>
            <div id="countdown-display" class="text-9xl font-black text-green-600 transition-transform">3</div>
        </div>
    `;
    const countdownDisplay = document.getElementById('countdown-display');

    const tick = () => {
        if (countdownValue > 0) {
            countdownDisplay.textContent = countdownValue;
            countdownDisplay.classList.remove('scale-100');
            countdownDisplay.classList.add('scale-125');
            sounds.countdownTick.play();
            
            setTimeout(() => {
                countdownDisplay.classList.remove('scale-125');
                countdownDisplay.classList.add('scale-100');
            }, 100);
            
            countdownValue--;
        } else {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = "GO!";
            
            // FINAL STEP: Apply settings and officially start the game
            Game.applyGameStartSettings(difficultyId, goalId);
        }
    };

    // Run immediately, then every second
    tick(); 
    countdownInterval = setInterval(tick, 1000);
}


/**
 * Handles all click events inside the #browser-content area.
 * MODIFIED: Handles the three-step startup flow.
 * @param {Event} e - The click event.
 */
function handleAction(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    sounds.confirm.play();
    const { action, itemId } = button.dataset;
    let amount;

    // --- NEW: STARTUP FLOW ACTIONS ---
    switch (action) {
        case 'choose-difficulty':
            // Step 1 complete: Store difficulty and move to Goal selection
            tempDifficultyId = itemId;
            renderTabs();
            setActiveTab('Goals');
            return;
        
        case 'choose-goal':
            // Step 2 complete: Start Countdown
            const goalId = itemId;
            _showCountdown(tempDifficultyId, goalId);
            return;
            
        case 'choose-pathway':
            // Step 3 complete (mid-game): Resume normal flow
            Game.choosePathway(itemId); 
            activeTabName = 'Profile'; 
            break;
    // --- END NEW STARTUP FLOW ACTIONS ---
            
        case 'take-job': Game.takeJob(gameData.Jobs.find(j => j.id === itemId)); break;
        case 'purchase-lifestyle': Game.purchaseLifestyle(gameData.Lifestyle.find(l => l.id === itemId)); break;
        case 'select-insurance': Game.selectInsurance(gameData.Insurance.find(p => p.id === itemId)); break;
        case 'rent-property': Game.rentProperty(gameData.Property.find(p => p.id === itemId)); break;
        case 'buy-property': Game.buyProperty(gameData.Property.find(p => p.id === itemId)); break;

        // Bank Actions (Investment, Loan, Repay)
        case 'make-investment':
            let investmentAmountEl = document.getElementById('investment-amount'); 
            if (!investmentAmountEl) investmentAmountEl = document.getElementById('invest-topup-amount');
            amount = parseInt(investmentAmountEl?.value, 10);
            Game.makeInvestment(gameData.Bank.find(i => i.id === itemId), amount);
            if (investmentAmountEl) investmentAmountEl.value = ''; 
            break;
        case 'request-loan':
            const loanRequestAmountEl = document.querySelector('#bank-sub-content #loan-request-amount');
            amount = parseInt(loanRequestAmountEl?.value, 10);
            Game.requestLoan(amount);
            if (loanRequestAmountEl) loanRequestAmountEl.value = ''; 
            break;
        case 'repay-loan':
            const loanRepayAmountEl = document.querySelector('#bank-sub-content #loan-repay-amount');
            amount = parseInt(loanRepayAmountEl?.value, 10);
            Game.repayLoan(amount);
            if (loanRepayAmountEl) loanRepayAmountEl.value = ''; 
            break;
        
        // Sell Investment Action
        case 'sell-investment':
            let withdrawAmountEl = document.querySelector(`#withdraw-amount-${itemId}`); 
            if (!withdrawAmountEl) withdrawAmountEl = document.getElementById('invest-withdraw-amount'); 
            if (!withdrawAmountEl) return;
            amount = parseInt(withdrawAmountEl.value, 10);
            Game.sellInvestment(itemId, amount);
            withdrawAmountEl.value = ''; 
            break;

        // Superannuation Action
        case 'add-to-super':
            const superContribAmountEl = document.querySelector('#super-sub-content #super-contrib-amount');
            amount = parseInt(superContribAmountEl?.value, 10);
            Game.addVoluntarySuper(amount);
            if (superContribAmountEl) superContribAmountEl.value = ''; 
            break;

        // Profile "Cancel" & Property Management Actions
        case 'resign-job':
        case 'cancel-subscription':
        case 'cancel-insurance':
        case 'end-lease':
        case 'sell-property':
            Game.cancelItem(action, itemId);
            break;
        case 'set-property-occupied':
            Game.setPropertyStatus('occupied');
            break;
        case 'set-property-rented':
            Game.setPropertyStatus('rented_out');
            break;
    }

    // Refresh the current tab's content to show the change
    renderTabs();
    // Only refresh the tab if we are in the main game loop
    if (window.gameState.gameStarted && window.gameState.chosenGoal) {
        setActiveTab(activeTabName, true);
    }
}

/**
 * Sets up all the necessary event listeners for the tablet.
 */
function setupEventListeners() {
    const tabsContainer = document.getElementById('browser-tabs');
    const contentContainer = document.getElementById('browser-content');

    // Listener for switching tabs
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.browser-tab');
            if (tabButton) {
                sounds.click.play();
                setActiveTab(tabButton.dataset.tab);
            }
        });
    }

    // Single event listener for all actions within the tablet content
    if (contentContainer) {
        contentContainer.addEventListener('click', handleAction);

        // Mouseover sound effect for buttons
        contentContainer.addEventListener('mouseover', (e) => {
            if (e.target.closest('button.sfx-button')) sounds.mouseOver.play();
        });
    }

    // --- Listen for global game events ---

    // When the game state changes, refresh tabs that show live data
    document.addEventListener('gameStateChanged', () => {
        const playerState = window.gameState;
        if (!playerState) return;
        
        const wasGameStarted = previousPlayerState.gameStarted;
        
        renderTabs(); 

        // NEW: If the game just started (first flip from false to true)
        if (playerState.gameStarted && !wasGameStarted) {
            // Trigger all UI initialization that was paused
            document.dispatchEvent(new CustomEvent('unpause-ui'));
            // Switch to the profile tab immediately
            setActiveTab('Profile', true);
            // Clear countdown interval if it was still running (safety)
            clearInterval(countdownInterval); 
        }

        // If game is fully running, refresh the current content
        if (playerState.gameStarted && playerState.chosenGoal) {
            setActiveTab(activeTabName, true);
        }

        // Update the previous state for the *next* turn's comparison
        previousPlayerState = {
            year: playerState.year,
            pathwayChosen: playerState.pathwayChosen,
            gameStarted: playerState.gameStarted // Crucial for detecting the flip
        };
    });
    
    // NEW: Global event listener for when the UI should unpause (called by gameStateChanged)
    document.addEventListener('unpause-ui', () => {
        // These animations were moved from initUI to ui-controller's gameStateChanged listener
        document.getElementById('main-panel').classList.add('panel-intro-animation');
        // NOTE: The rest of the HUD unpause/animations are handled in ui-controller.js
    });

    // When a news event occurs, show a notification and add a dot to the tab
    document.addEventListener('news-update', (e) => {
        if (activeTabName === 'News') setActiveTab('News', true);
        if (window.gameState?.newsLog?.some(item => !item.isRead)) {
            addNotificationDot('News', 1);
        }
        if (!e.detail?.isSilent && window.gameState?.newsLog?.[0]) {
            showNotification(`News: ${window.gameState.newsLog[0].headline}`, 'newspaper', 'News', e.detail.isPositive ? 'positive' : 'negative');
        }
    });

    // When a profile event occurs, show a notification and add a dot to the tab
    document.addEventListener('profile-update', (e) => {
        if (activeTabName === 'Profile') setActiveTab('Profile', true);
        if (window.gameState?.profileLog?.some(item => !item.isRead)) {
            addNotificationDot('Profile', 1);
        }
        if (!e.detail?.isSilent && window.gameState?.profileLog?.[0]) {
            showNotification(`Event: ${window.gameState.profileLog[0].title}`, 'person', 'Profile', e.detail.isPositive ? 'positive' : 'negative');
        }
    });

    // New listener for annual tax lodgement
    document.addEventListener('tax-update', (e) => {
        if (activeTabName === 'ATO') setActiveTab('ATO', true);
        addNotificationDot('ATO', 1); 
        const message = e.detail?.message || 'Tax return lodged.';
        if (!e.detail?.isSilent) showNotification(message, 'receipt_long', 'ATO', e.detail.isPositive ? 'positive' : 'negative');
    });

    // Listener to force pathway tab content to show (if user clicks tab manually)
    window.addEventListener('force-pathway-tab', () => {
        if (activeTabName !== 'Pathway') {
            setActiveTab('Pathway', false);
        }
    });

    // NEW: Listener for clickable titles in Profile (navigating between tabs)
    document.addEventListener('request-tab-switch', (e) => {
        if (e.detail?.tabName) {
            sounds.click.play();
            setActiveTab(e.detail.tabName);
        }
    });
}

/**
 * Displays a pop-up notification on the screen.
 * @param {string} message - The text to display.
 * @param {string} icon - The Material Symbols icon name.
 * @param {string} targetTab - The tab to open when the notification is clicked.
 * @param {string} [type='default'] - 'positive' or 'negative' for styling.
 */
function showNotification(message, icon, targetTab, type = 'default') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    window.dispatchEvent(new Event('play-notification-sound'));

    const notification = document.createElement('div');
    notification.className = `notification ui-panel rounded-lg p-3 flex items-start gap-3 shadow-xl relative`;
    if (type === 'positive') notification.classList.add('positive');
    if (type === 'negative') notification.classList.add('negative');

    notification.innerHTML = `
        <span class="material-symbols-outlined text-2xl">${icon}</span>
        <div>
            <p class="font-bold text-gray-800 text-sm">${type === 'positive' ? 'Success' : 'Alert'}</p>
            <p class="text-xs text-gray-600">${message}</p>
        </div>
        <button class="notification-close material-symbols-outlined">close</button>`;

    container.innerHTML = '';
    container.appendChild(notification);

    const close = () => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            notification.addEventListener('animationend', () => notification.remove());
        }
    };

    notification.querySelector('.notification-close').addEventListener('click', (e) => {
        e.stopPropagation();
        close();
    });

    if (targetTab) {
        notification.style.cursor = 'pointer';
        notification.addEventListener('click', () => {
            setActiveTab(targetTab);
            close();
        });
    }

    setTimeout(close, 4000);
}

// --- NEW NOTIFICATION HELPER FUNCTIONS ---

/**
 * Adds a *numbered* notification dot to a tab.
 * @param {string} tabName - The name of the tab (e.g., 'Jobs', 'Lifestyle').
 * @param {number} [count=1] - The number of new items to add to the count.
 */
function addNotificationDot(tabName, count = 1) {
    if (count === 0) return; 
    
    const tabButton = document.getElementById(`tab-button-${tabName}`);
    if (!tabButton) return; 

    if (!window.gameState.notificationCounts) {
        window.gameState.notificationCounts = {}; 
    }
    const newCount = (window.gameState.notificationCounts[tabName] || 0) + count;
    window.gameState.notificationCounts[tabName] = newCount;

    const oldDot = tabButton.querySelector('.notification-dot');
    if (oldDot) oldDot.remove();

    const dot = document.createElement('span');
    dot.className = 'notification-dot absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center';
    dot.textContent = newCount;
    tabButton.appendChild(dot);
}

/**
 * Compares two Sets of item IDs and returns the *count* of new items.
 * @param {Set<string>} newSet - The set of currently available item IDs.
 * @param {Set<string>} oldSet - The set of previously available item IDs.
 * @returns {number} The count of new items.
 */
function getNewItemCount(newSet, oldSet) {
    let count = 0;
    for (const item of newSet) {
        if (!oldSet.has(item)) {
            count++; 
        }
    }
    return count;
}

/**
 * Checks for newly available items in Jobs, Lifestyle, and Property
 * and adds notification dots to tabs if new items are found.
 */
function checkNewItemsAvailable() {
    if (!window.gameState || !window.gameState.gameStarted) return; // Guard
    
    const currentState = {
        year: window.gameState.year,
        pathwayChosen: window.gameState.pathwayChosen
    };

    if (!previousPlayerState.year) return;

    // Check Jobs
    const oldJobs = getFilteredItemIDs('Jobs', previousPlayerState);
    const newJobs = getFilteredItemIDs('Jobs', currentState);
    const newJobCount = getNewItemCount(newJobs, oldJobs);
    if (newJobCount > 0) {
        addNotificationDot('Jobs', newJobCount);
    }
    
    // Check Lifestyle
    const oldLifestyle = getFilteredItemIDs('Lifestyle', previousPlayerState);
    const newLifestyle = getFilteredItemIDs('Lifestyle', currentState);
    const newLifestyleCount = getNewItemCount(newLifestyle, oldLifestyle);
    if (newLifestyleCount > 0) {
        addNotificationDot('Lifestyle', newLifestyleCount);
    }

    // Check Property
    if (currentState.year >= 18) {
        const oldProperty = getFilteredItemIDs('Property', previousPlayerState);
        const newProperty = getFilteredItemIDs('Property', currentState);
        const newPropertyCount = getNewItemCount(newProperty, oldProperty);
        if (newPropertyCount > 0) {
             addNotificationDot('Property', newPropertyCount);
        }
    }
}