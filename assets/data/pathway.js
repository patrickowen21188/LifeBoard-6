/*
This file contains the static data for the three major life pathways
a player can choose at age 18. This choice is loaded once by loader.js.

--- VERSION 2.0 FIXES ---
1. [FIXED] Changed 'name: "Enter the Workforce"' to 'name: "Workforce"'.
2. [FIXED] Changed 'name: "Vocational (TAFE)"' to 'name: "Vocational"'.
This is critical so that the 'name' property saved to the game state
matches the 'requirements.pathways' array in the jobs.js file.
*/

export const pathwayData = {
    "pathways": [
        {
            "id": "workforce",
            "name": "Workforce", // <-- FIX: Was "Enter the Workforce"
            "icon": "work",
            "image": "images/pathways/workforce.png",
            "tooltip": "Start working full-time immediately and earn money now.",
            "description": "Choose to start your full-time career immediately. You'll avoid student debt and start building your savings and experience right away.",
            "hecsDebt": 0,
            "pros": [
                "Start earning a full-time salary at age 18.",
                "Incur no student debt.",
                "Gain 4 extra years of work experience and savings."
            ],
            "cons": [
                "Locked out of specialized mid- and high-tier jobs.",
                "Lower long-term earning potential."
            ]
        },
        {
            "id": "vocational",
            "name": "Vocational", // <-- FIX: Was "Vocational (TAFE)"
            "icon": "handyman",
            "image": "images/pathways/vocational.png",
            "tooltip": "Gain practical skills for in-demand trades and mid-tier jobs.",
            "description": "Enroll in a 4-year vocational course. You'll gain practical, in-demand skills for specialized trades. You can only work part-time until age 22.",
            "hecsDebt": 20000,
            "pros": [
                "Unlocks mid-tier specialized jobs (e.g., Electrician, Chef).",
                "Less debt than a university degree.",
                "Good, reliable earning potential."
            ],
            "cons": [
                "Incur $20,000 in HECS/HELP debt.",
                "Can only work part-time or casual jobs until age 22.",
                "Locked out of high-tier professional jobs."
            ]
        },
        {
            "id": "university",
            "name": "University", // This one was already correct
            "icon": "school",
            "image": "images/pathways/university.png",
            "tooltip": "Study for 4 years to unlock high-tier professional careers.",
            "description": "Commit to a 4-year university degree. This is the only path to the highest-paying professional careers, but it comes with significant debt.",
            "hecsDebt": 45000,
            "pros": [
                "Unlocks high-tier jobs (e.g., Software Engineer, Nurse, Accountant).",
                "Highest long-term earning potential."
            ],
            "cons": [
                "Incur $45,000 in HECS/HELP debt.",
                "Can only work part-time or casual jobs until age 22.",
                "Delays full-time earning by 4 years."
            ]
        }
    ]
};
