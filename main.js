import { initGameState } from './state.js';
import { initUI } from './ui-controller.js';
import { initTablet } from './assets/tablet-main.js';

// This is the main entry point for the entire application.
// It ensures that all parts of the game are initialized in the correct order
// once the HTML document is fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Set up the core game state object first. This is the "brain"
    //    of the game and must exist before any UI tries to access it.
    initGameState(); 
    
    // 2. Then, initialize the main UI components (HUDs, timeline, controls).
    //    These components depend on the initial game state being available.
    initUI();

    // 3. Finally, initialize the interactive tablet UI. This is also
    //    dependent on the game state.
    initTablet(); 
});
