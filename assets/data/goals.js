/**
 * goals.js
 * Contains the static data for the player-selectable goals.
 * Converted from goals.json
 */
export const goalsData = {
  "version": "1.0",
  "goals": [
    {
      "id": "networth_50k",
      "name": "Build Wealth",
      "icon": "payments",
      "description": "Finish with a net worth of at least $50,000 by age 30.",
      "criteria": { "netWorthMin": 50000 },
      "teachingFocus": "Shows that wealth is not just cash, but assets (money, investments, super) minus debts (loans, HECS)."
    },
    {
      "id": "debt_free",
      "name": "Debt Free",
      "icon": "credit_card_off",
      "description": "Finish the game with no outstanding loans or HECS debt.",
      "criteria": { "noDebt": true },
      "teachingFocus": "Highlights the importance of responsible borrowing and managing repayments to achieve financial freedom."
    },
    {
      "id": "property_owner",
      "name": "Property Owner",
      "icon": "home",
      "description": "Own at least one property by the end of the game.",
      "criteria": { "propertyOwned": 1 },
      "teachingFocus": "Encourages players to consider home ownership, manage a mortgage, and build equity."
    },
    {
      "id": "super_saver",
      "name": "Super Saver",
      "icon": "savings",
      "description": "Accumulate at least $20,000 in superannuation by age 30.",
      "criteria": { "superBalanceMin": 20000 },
      "teachingFocus": "Demonstrates the long-term benefits of employer contributions (SGC) and voluntary contributions."
    },
    {
      "id": "happiness_first",
      "name": "Happiness First",
      "icon": "sentiment_satisfied",
      "description": "Finish with a Well-being Score of 20 or more.",
      "criteria": { "wpMin": 20 },
      "teachingFocus": "Balances financial literacy with lifestyle, showing that managing stress and wellbeing is as important as money."
    },
    {
      "id": "high_earner",
      "name": "Career Climber",
      "icon": "trending_up",
      "description": "Reach a job that pays at least $40/hour before age 30.",
      "criteria": { "hourlyRateMin": 40 },
      "teachingFocus": "Teaches career progression, showing how pathways and prerequisites unlock higher-paying jobs."
    },
    {
      "id": "investor_mindset",
      "name": "Smart Investor",
      "icon": "query_stats",
      "description": "Hold at least $10,000 worth of investments by the end.",
      "criteria": { "investmentsMin": 10000 },
      "teachingFocus": "Reinforces the value of investing early and consistently to build wealth outside of just saving cash."
    },
    {
      "id": "balanced_player",
      "name": "Balanced Life",
      "icon": "library_add_check",
      "description": "Finish with at least $20,000 net worth AND a Well-being Score of 15+.",
      "criteria": { "netWorthMin": 20000, "wpMin": 15 },
      "teachingFocus": "Promotes the core challenge: balancing financial security (Net Worth) with lifestyle satisfaction (Wellbeing)."
    }
  ]
};