import * as Game from './game-logic.js';

let topUiBar, timelineMarkersContainer, audioToggleButton, volumeOnIcon, volumeOffIcon, volumeSlider,
    yearDisplay, monthDisplay, ageDisplayBox, mainPanel,
    undoButton, nextTurnButton, mobileUndoButton, mobileNextTurnButton, characterPlaceholder,
    characterSprite, backgroundGradient, nextTurnButtonText, mobileNextTurnButtonText, sfxButtons,
    desktopHudElements, mobileHudElements;

let sounds = {};
let lastVolume = 0.75;
let bgmStarted = false;

let inactivityTimer = null;
let countdownTimer = null;
let countdownValue = 30;

let isFading = false;
let currentSpritePosition = '0% 0%';

const visualStartAge = 14;
const visualEndAge = 31;
const gameStartAge = 15;
const gameEndAge = 30;
const totalVisualYears = visualEndAge - visualStartAge;
let initialPlayerOffset = 0;

// MODIFIED: Added 'gameStarted' to track initial state
let previousHudState = { money: 0, cashFlow: 0, wellBeing: 0, gameStarted: false };

// This function is called by main.js to start the UI
export function initUI() {
    topUiBar = document.getElementById('top-ui-bar');
    timelineMarkersContainer = document.getElementById('timeline-markers');
    audioToggleButton = document.getElementById('audio-toggle');
    volumeOnIcon = document.getElementById('volume-on-icon');
    volumeOffIcon = document.getElementById('volume-off-icon');
    volumeSlider = document.getElementById('volume-slider');
    yearDisplay = document.getElementById('current-year');
    monthDisplay = document.getElementById('current-month');
    ageDisplayBox = document.getElementById('age-display-box');
    mainPanel = document.getElementById('main-panel');

    undoButton = document.getElementById('restart-button');
    nextTurnButton = document.getElementById('next-turn-button');
    mobileUndoButton = document.getElementById('mobile-restart-button');
    mobileNextTurnButton = document.getElementById('mobile-next-turn-button');
    characterPlaceholder = document.getElementById('character-placeholder');
    characterSprite = document.getElementById('character-sprite');
    backgroundGradient = document.getElementById('background-gradient');
    nextTurnButtonText = document.getElementById('next-turn-text');
    mobileNextTurnButtonText = document.getElementById('mobile-next-turn-text');
    sfxButtons = document.querySelectorAll('.sfx-button');

    // Desktop Status HUD Elements
    desktopHudElements = {
        statusHud: document.getElementById('status-hud'),
        wallet: document.getElementById('hud-wallet'),
        cashflow: document.getElementById('hud-cashflow'),
        wellbeing: document.getElementById('hud-wellbeing'),
        moneyValue: document.getElementById('money-value'),
        moneyIcon: document.getElementById('money-icon'),
        cashflowValue: document.getElementById('cashflow-value'),
        cashflowIcon: document.getElementById('cashflow-icon'),
        wellbeingValue: document.getElementById('wellbeing-value'),
        wellbeingIcon: document.getElementById('wellbeing-icon'),
    };

    // Mobile Status HUD Elements
    mobileHudElements = {
        statusHud: document.getElementById('mobile-status-hud'),
        wallet: document.getElementById('mobile-hud-wallet'),
        cashflow: document.getElementById('mobile-hud-cashflow'),
        wellbeing: document.getElementById('mobile-hud-wellbeing'),
        moneyValue: document.querySelector('.mobile-money-value'),
        moneyIcon: document.querySelector('.mobile-money-icon'),
        cashflowValue: document.querySelector('.mobile-cashflow-value'),
        cashflowIcon: document.querySelector('.mobile-cashflow-icon'),
        wellbeingValue: document.querySelector('.mobile-wellbeing-value'),
        wellbeingIcon: document.querySelector('.mobile-wellbeing-icon'),
    };

    // Access Howler from the global window scope
    window.Howler.volume(lastVolume);
    sounds = {
        // Access Howl from the global window scope
        mouseOver: new window.Howl({ src: ['sounds/ui_mouseover.mp3'], volume: 0.5 }),
        click: new window.Howl({ src: ['sounds/ui_click.mp3'], volume: 0.5 }),
        undo: new window.Howl({ src: ['sounds/undo_click.mp3'], volume: 0.5 }),
        notification: new window.Howl({ src: ['sounds/notification.mp3'], volume: 0.8 }),
        countdown: new window.Howl({ src: ['sounds/countdown_tick.mp3'], volume: 0.7 }),
        nextTurn: new window.Howl({ src: ['sounds/coin_collect.mp3'], volume: 0.7 }),
        win: new window.Howl({ src: ['sounds/win.wav'], volume: 1 }),
        lose: new window.Howl({ src: ['sounds/lose.wav'], volume: 1 }),
        wellbeingUp: new window.Howl({ src: ['sounds/wellbeing_up.mp3'], volume: 0.7 }),
        wellbeingDown: new window.Howl({ src: ['sounds/wellbeing_down.mp3'], volume: 0.7 }),
        bgm: new window.Howl({
            src: ['sounds/background_music.mp3'],
            loop: true,
            volume: 0.1,
        })
    };
    window.addEventListener('play-notification-sound', () => sounds.notification.play());

    // NOTE: initAnimations() is NOT called here. It is called when gameState.gameStarted becomes true.
    if (window.innerWidth >= 1024) generateTimeline();

    // Update UI once to get initial values
    updateAllUI();

    // Set the initial previousHudState *after* the first UI update
    if (window.gameState) {
        previousHudState = {
            money: window.gameState.money,
            cashFlow: window.gameState.cashFlow,
            wellBeing: window.gameState.wellBeing,
            year: window.gameState.year,
            month: window.gameState.month,
            gameStarted: window.gameState.gameStarted // Capture initial state
        };
    }

    setTimeOfDay();
    setInterval(setTimeOfDay, 60000);
    startInactivityTimer();

    document.addEventListener('gameStateChanged', (e) => {
        if (e.detail?.sound && sounds[e.detail.sound]) sounds[e.detail.sound].play();
        updateAllUI();
        startInactivityTimer();
    });

    const nextTurnHandler = () => {
        if (!window.gameState.gameStarted) {
             _dispatchUINotification("Please select your difficulty and goal before starting.");
             return;
        }

        if (!bgmStarted) {
            sounds.bgm.play();
            bgmStarted = true;
        }
        // Check if the game is paused for the pathway choice
        if (window.gameState.year >= 18 && !window.gameState.pathwayChosen) {
             console.warn("Next Turn is blocked until a Pathway is chosen.");
             ageDisplayBox.classList.add('zoom-bounce-animation');
             return;
        }
        sounds.click.play();
        Game.handleNextTurn();
    };

    nextTurnButton.addEventListener('click', nextTurnHandler);
    mobileNextTurnButton.addEventListener('click', nextTurnHandler);
    undoButton.addEventListener('click', () => { if (Game.handleUndo()) sounds.undo.play(); });
    mobileUndoButton.addEventListener('click', () => { if (Game.handleUndo()) sounds.undo.play(); });

    sfxButtons.forEach(button => button.addEventListener('mouseenter', () => sounds.mouseOver.play()));
    audioToggleButton.addEventListener('click', toggleAudio);
    volumeSlider.addEventListener('input', (e) => setVolume(Number(e.target.value)));
}

function updateAllUI() {
    // Read from window.gameState and add a safety check
    if (!window.gameState) return;

    const { year, month, isGameOver, money, cashFlow, wellBeing, gameStarted } = window.gameState;

    // *** NEW: GAME START CHECK ***
    if (gameStarted && !previousHudState.gameStarted) {
        // Game just started! Trigger intro animations and unlock controls
        initAnimations();
        if (window.innerWidth >= 1024) generateTimeline(); // Regenerate timeline with correct age positioning
        console.log("Game fully started! Activating HUD.");
    }

    // Toggle opacity for all HUD elements based on gameStarted state
    const hudElements = [topUiBar, desktopHudElements.statusHud, mobileHudElements.statusHud, characterPlaceholder, undoButton, nextTurnButton, mobileUndoButton, mobileNextTurnButton, mainPanel];
    hudElements.forEach(el => {
        if (el) el.style.opacity = gameStarted ? '1' : '0';
    });
    // *** END NEW ***


    yearDisplay.textContent = year;
    monthDisplay.textContent = month;

    // Only bounce HUD elements if game has started
    if (gameStarted) {
        // Compare new values with the previous state and trigger animations
        if (money !== previousHudState.money) {
            triggerZoomBounceAnimation(desktopHudElements.wallet);
            triggerZoomBounceAnimation(mobileHudElements.wallet);
        }
        if (cashFlow !== previousHudState.cashFlow) {
            triggerZoomBounceAnimation(desktopHudElements.cashflow);
            triggerZoomBounceAnimation(mobileHudElements.cashflow);
        }
        if (wellBeing !== previousHudState.wellBeing) {
            triggerZoomBounceAnimation(desktopHudElements.wellbeing);
            triggerZoomBounceAnimation(mobileHudElements.wellbeing);
        }

        // Only bounce the age box if the age *actually* changed
        if(!isGameOver) {
             const currentAge = `${year}Y ${month}M`;
             const previousAge = `${previousHudState.year || year}Y ${previousHudState.month || month}M`;
             if (currentAge !== previousAge) {
                triggerZoomBounceAnimation(ageDisplayBox);
             }
        }
    }


    // Update the HUD display (this sets text content, colors, etc.)
    updateHudDisplay(desktopHudElements);
    updateHudDisplay(mobileHudElements);
    updateCharacterSprite();

    if (window.innerWidth >= 1024) updatePlayerPosition();

    if (isGameOver) {
        nextTurnButtonText.textContent = 'Game Over';
        mobileNextTurnButtonText.textContent = 'Game Over';
        [nextTurnButton, mobileNextTurnButton].forEach(btn => {
            btn.classList.remove('countdown-active');
            btn.classList.add('game-over');
        });
        clearTimeout(inactivityTimer);
        clearInterval(countdownTimer);
    } else {
        [nextTurnButton, mobileNextTurnButton].forEach(btn => btn.classList.remove('game-over'));
    }

    // Store the new values as the "previous" state for the next check
    previousHudState = {
        money: money,
        cashFlow: cashFlow,
        wellBeing: wellBeing,
        year: year, // Also store age for the age box animation
        month: month,
        gameStarted: gameStarted // Store new gameStarted status
    };
}

function updateHudDisplay(elements) {
    if (!elements.statusHud || !window.gameState) return;
    const { money, cashFlow, wellBeing, gameStarted } = window.gameState;

    const green = 'text-green-600';
    const red = 'text-red-500';
    const yellow = 'text-yellow-500';
    const gray = 'text-gray-500';
    const placeholder = '--';

    // Update Money
    elements.moneyValue.textContent = gameStarted ? `$${Math.round(money).toLocaleString()}` : placeholder;
    [elements.moneyValue, elements.moneyIcon].forEach(el => {
        if(!el) return;
        el.classList.remove(green, red, gray);
        if(gameStarted) {
            el.classList.add(money < 0 ? red : green);
        } else {
            el.classList.add(gray);
        }
    });

    // Update Cashflow
    elements.cashflowValue.textContent = gameStarted ? `${cashFlow >= 0 ? '+' : ''}$${Math.round(cashFlow).toLocaleString()}` : placeholder;
    [elements.cashflowValue, elements.cashflowIcon].forEach(el => {
        if(!el) return;
        el.classList.remove(green, red, gray);
        if(gameStarted) {
            el.classList.add(cashFlow < 0 ? red : green);
        } else {
            el.classList.add(gray);
        }
    });

    // Update Wellbeing
    elements.wellbeingValue.textContent = gameStarted ? wellBeing.toString() : placeholder;
    let wellBeingColor;
    if (wellBeing <= 5) wellBeingColor = red;
    else if (wellBeing <= 10) wellBeingColor = yellow;
    else wellBeingColor = green;
    [elements.wellbeingValue, elements.wellbeingIcon].forEach(el => {
        if(!el) return;
        el.classList.remove(green, red, yellow, gray);
        if(gameStarted) {
            el.classList.add(wellBeingColor);
        } else {
            el.classList.add(gray);
        }
    });
}

function updateCharacterSprite() {
    if (!characterSprite || isFading || !window.gameState || !window.gameState.gameStarted) return; // Guard
    const { wellBeing } = window.gameState;
    let nextSpritePosition = wellBeing > 10 ? '0% 0%' : (wellBeing >= 6 ? '50% 0%' : '100% 0%');

    if (nextSpritePosition !== currentSpritePosition) {
        isFading = true;
        characterSprite.style.setProperty('--next-sprite-pos', nextSpritePosition);
        characterSprite.style.setProperty('--next-sprite-opacity', '1');
        setTimeout(() => {
            characterSprite.style.backgroundPosition = nextSpritePosition;
            currentSpritePosition = nextSpritePosition;
            characterSprite.style.setProperty('--next-sprite-opacity', '0');
            isFading = false;
        }, 300);
    }
}

function initAnimations() {
    // These elements start hidden via index.html/CSS (opacity-0) and are made visible (opacity: 1) in updateAllUI.
    // We run the initial animations here for visual flair.
    topUiBar.classList.add('slide-down-animation');
    // Ensure the main panel gets its intro animation
    mainPanel.classList.add('panel-intro-animation');
}


function triggerZoomBounceAnimation(element) {
    if (!element) return;
    element.classList.remove('zoom-bounce-animation');
    void element.offsetWidth; // This is a trick to force a browser "reflow"
    element.classList.add('zoom-bounce-animation');
}

function setTimeOfDay() {
    const hour = new Date().getHours();
    const classes = ['sunrise', 'noon', 'afternoon', 'sunset', 'evening', 'night'];
    backgroundGradient.classList.remove(...classes);

    if (hour >= 5 && hour < 8) backgroundGradient.classList.add('sunrise');
    else if (hour >= 8 && hour < 16) backgroundGradient.classList.add('noon');
    else if (hour >= 16 && hour < 18) backgroundGradient.classList.add('afternoon');
    else if (hour >= 18 && hour < 20) backgroundGradient.classList.add('sunset');
    else if (hour >= 20 && hour < 22) backgroundGradient.classList.add('evening');
    else backgroundGradient.classList.add('night');
}

function generateTimeline() {
    timelineMarkersContainer.innerHTML = '';
    const playerIcon = document.createElement('div');
    playerIcon.id = 'player-icon';
    playerIcon.className = 'absolute top-1/2 z-10';
    initialPlayerOffset = ((gameStartAge - visualStartAge) / totalVisualYears) * 100;
    playerIcon.style.left = `${initialPlayerOffset}%`;
    playerIcon.style.transform = 'translate(-50%, -85%)';
    playerIcon.innerHTML = `<div class="relative flex items-center justify-center w-10 h-10 drop-shadow-lg"><span class="material-symbols-outlined absolute text-blue-800 text-5xl" style="font-variation-settings: 'FILL' 1;">location_on</span><span class="material-symbols-outlined relative text-white text-2xl">directions_run</span></div>`;
    timelineMarkersContainer.appendChild(playerIcon);

    for (let age = visualStartAge; age <= visualEndAge; age++) {
        if ((age > visualStartAge && age < gameStartAge) || (age > gameEndAge && age < visualEndAge)) continue;

        const percentPosition = ((age - visualStartAge) / totalVisualYears) * 100;
        const markerWrapper = document.createElement('div');
        markerWrapper.style.left = `${percentPosition}%`;

        if (age === visualStartAge) {
            markerWrapper.className = 'absolute h-full flex items-center';
            markerWrapper.style.transform = 'translateX(-50%)';
            markerWrapper.innerHTML = `<span class="text-xs font-bold text-gray-800 whitespace-nowrap">Start</span>`;
        } else if (age === visualEndAge) {
            markerWrapper.className = 'absolute h-full flex items-center';
            markerWrapper.style.transform = 'translateX(-50%)';
            markerWrapper.innerHTML = `<span class="text-xs font-bold text-gray-800 whitespace-nowsemrap">End</span>`;
        } else {
            markerWrapper.style.transform = 'translateX(-50%)';
            markerWrapper.className = 'absolute bottom-0 h-full flex flex-col-reverse items-center justify-start';
            markerWrapper.innerHTML = `<div class="w-0.5 h-2 bg-gray-600/80 rounded-full"></div><span class="mb-1 text-xs font-bold text-gray-800 whitespace-nowrap">${age}</span>`;
        }
        timelineMarkersContainer.appendChild(markerWrapper);

        if (age >= gameStartAge && age < gameEndAge) {
            for (let i = 1; i < 4; i++) { // 3, 6, 9 months
                const quarterAge = age + (i * 0.25);
                const quarterPercent = ((quarterAge - visualStartAge) / totalVisualYears) * 100;

                const quarterMarker = document.createElement('div');
                quarterMarker.className = 'quarter-marker';
                quarterMarker.style.left = `${quarterPercent}%`;
                timelineMarkersContainer.appendChild(quarterMarker);
            }
        }
    }
}

function updatePlayerPosition() {
    const currentIcon = document.getElementById('player-icon');
    if (!currentIcon || !window.gameState) return;
    const { year, month } = window.gameState;
    const decimalAge = year + (month / 12);
    const gameProgressPercent = Math.max(0, ((decimalAge - gameStartAge) / (gameEndAge - gameStartAge)) * 100);
    const gameAreaOnTimeline = ((gameEndAge - gameStartAge) / totalVisualYears) * 100;
    const newLeft = initialPlayerOffset + (gameProgressPercent / 100) * gameAreaOnTimeline;
    currentIcon.style.left = `${Math.min(100, Math.max(0, newLeft))}%`;
}

function toggleAudio() {
    sounds.click.play();
    const newVolume = window.Howler.volume() > 0 ? 0 : lastVolume;
    setVolume(newVolume);
}

function setVolume(newVolume) {
    window.Howler.volume(newVolume);
    if (newVolume > 0) lastVolume = newVolume;
    const isMuted = newVolume === 0;
    volumeOnIcon.classList.toggle('hidden', isMuted);
    volumeOffIcon.classList.toggle('hidden', !isMuted);
    volumeSlider.value = newVolume;
}

function startInactivityTimer() {
    clearTimeout(inactivityTimer);
    clearInterval(countdownTimer);
    resetNextTurnButton();

    // Read from window.gameState and add a safety check
    if (!window.gameState || !window.gameState.gameStarted) {
        nextTurnButtonText.textContent = 'Setup Required';
        mobileNextTurnButtonText.textContent = 'Setup Required';
        return; // NEW: Block timer if game hasn't started
    }

    if (window.gameState.year >= 18 && !window.gameState.pathwayChosen) {
        nextTurnButtonText.textContent = 'Decision Required';
        mobileNextTurnButtonText.textContent = 'Decision Required';
        return;
    }

    if (!window.gameState.isGameOver) {
        inactivityTimer = setTimeout(startCountdown, 30000);
    }
}

function startCountdown() {
    countdownValue = 30;
    [nextTurnButton, mobileNextTurnButton].forEach(btn => btn.classList.add('countdown-active'));
    const update = () => {
        if (countdownValue === 20) sounds.countdown.play();
        nextTurnButtonText.textContent = `Ends In (${countdownValue}s)`;
        mobileNextTurnButtonText.textContent = `Ends In (${countdownValue}s)`;
    };
    update();
    countdownTimer = setInterval(() => {
        countdownValue--;
        update();
        if (countdownValue < 0) Game.handleNextTurn();
    }, 1000);
}

function resetNextTurnButton() {
    nextTurnButtonText.textContent = 'Next Turn';
    mobileNextTurnButtonText.textContent = 'Next Turn';
    [nextTurnButton, mobileNextTurnButton].forEach(btn => btn.classList.remove('countdown-active'));
}