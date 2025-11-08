/**
 * difficulties.js
 * Defines the parameters for each game difficulty level.
 * This file is now also used to render the selection UI.
 */

export const difficultySettings = {
  
  /**
   * LEARNING (Easy)
   * - 6-month turns for a slower pace.
   * - High starting money and wellbeing.
   */
  learning: {
    id: "learning",
    name: "Learning",
    icon: "school",
    description: "A guided, slower-paced experience. Turns are 6 months. Ideal for understanding the basics.",
    turnLengthInMonths: 6,
    initialState: {
      money: 3000,
      wellBeing: 15
    },
    pros: [
      "Start with +$1,500 extra cash.",
      "Start with +3 extra wellbeing.",
      "Turns are 6 months long, giving you more time."
    ],
    cons: [
      "Slower-paced game."
    ]
  },

  /**
   * NORMAL
   * - 3-month turns.
   * - Standard starting money and wellbeing.
   */
  normal: {
    id: "normal",
    name: "Realistic",
    icon: "balance",
    description: "The standard, balanced experience. Turns are 3 months.",
    turnLengthInMonths: 3,
    initialState: {
      money: 1500,
      wellBeing: 12
    },
    pros: [
      "The standard, balanced experience.",
      "3-month turns for a faster-paced game."
    ],
    cons: [
      "Standard starting conditions."
    ]
  },

  /**
   * ADVANCE (Hard)
   * - 3-month turns.
   * - Low starting money and wellbeing.
   */
  advance: {
    id: "advance",
    name: "Advance",
    icon: "local_fire_department",
    description: "A challenging start. Money is tight and wellbeing is lower. Turns are 3 months.",
    turnLengthInMonths: 3,
    initialState: {
      money: 250,
      wellBeing: 8
    },
    pros: [
      "A true test of your financial skill.",
      "3-month turns for a faster-paced game."
    ],
    cons: [
      "Start with only $250.",
      "Start with -4 wellbeing, making you vulnerable."
    ]
  }
};