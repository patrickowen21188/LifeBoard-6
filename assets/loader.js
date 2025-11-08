import { jobsData } from './data/jobs.js';
import { lifestyleData } from './data/lifestyle.js';
import { investmentData } from './data/investment.js';
import { insuranceData } from './data/insurance.js';
import { propertiesData } from './data/properties.js';
import { newsData } from './data/news.js';
import { eventsData } from './data/events.js';
import { taxData } from './data/tax.js';
import { superData } from './data/super.js';
import { pathwayData } from './data/pathway.js';
import { goalsData } from './data/goals.js';
import { difficultySettings } from './data/difficulties.js';


/**
 * The main game data object. This acts as a centralized "database" for all
 * content in the game, making it easy for other modules to access what they need.
 * It imports data from various dedicated files in the '/data/' subdirectory.
 */
export const gameData = {
    // Contains all available jobs the player can take.
    Jobs: jobsData.jobs,
    
    // Contains all lifestyle subscriptions and one-time purchases.
    Lifestyle: lifestyleData.lifestyles,
    
    // Contains all financial assets available for investment in the "Bank" tab.
    Bank: investmentData.assets,
    
    // Contains all available insurance plans.
    Insurance: insuranceData.plans,
    
    // Contains all properties available to rent or buy.
    Property: propertiesData.properties,
    
    // Contains all possible global news events that can occur.
    News: newsData.articles,
    
    // Contains all possible individual, personal events that can occur.
    IndividualEvents: eventsData.individual,

    // --- NEW: Add the new data objects ---
    Tax: taxData.education,
    Super: superData.education,
    // --- FIX: Export the 'pathways' array directly, not the object ---
    Pathway: pathwayData.pathways,
    
    // --- NEW: Export goals data ---
    Goals: goalsData.goals,

    // --- NEW: Export difficulty settings ---
    // This makes it available to the tablet UI for rendering the selection
    Difficulty: difficultySettings
};