/*
This file contains static educational content about the Australian Superannuation system,
written in plain English for a game context.
It is used by the 'Superannuation' tab in the tablet UI.
This content is for educational simulation purposes and is not financial advice.
Sources are linked for real-world information.
*/
export const superData = {
    // This is the array that the loader.js file will import
    "education": [
        {
            "id": "super_what_is",
            "headline": "What is Superannuation (Super)?",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/how-super-works",
            "image": "images/investments/savings.png",
            "summary": "Superannuation (or 'super') is a long-term savings plan designed to help you save money for your retirement.",
            "full_text": "Think of super as a locked savings account that you can't touch until you reach your 'preservation age' (usually around 60-65).\n\nIts main purpose is to give you an income in retirement when you are no longer working.\n\n**How does money get in?**\nWhen you work, your employer must pay a percentage of your salary *into* your super fund. This is called the **Superannuation Guarantee Charge (SGC)**.\n\nIn this game, this SGC contribution (e.g., 11.5% of your gross pay) is automatically paid into your super fund each turn. This money is paid *in addition* to your salary; it doesn't come out of your 'take-home' pay.",
            "isRead": true
        },
        {
            "id": "super_how_works",
            "headline": "How Does My Super Grow?",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/how-super-works/how-super-is-invested",
            "image": "images/investments/robo.png",
            "summary": "Your super money is invested in assets like stocks and bonds to help it grow. It is also charged fees and a low rate of tax.",
            "full_text": "Your super money doesn't just sit in a bank account. It is invested by a 'super fund' into a mix of assets, like Australian and global shares, property, and bonds.\n\nThis means your super balance will change over time based on three main factors:\n\n* **Investment Growth:** Over the long term, these investments are expected to grow, compounding your savings. This shows up as 'Investment Growth' in your transaction history.\n* **Fees:** Your fund will charge admin and investment fees for managing your money. These are automatically deducted.\n* **Tax:** The investment earnings *inside* your super fund are taxed at a special low rate of 15%, which is much lower than your normal income tax.\n\nYour transaction history shows all these movements, so you can see exactly how your balance is changing.",
            "isRead": true
        },
        {
            "id": "super_voluntary",
            "headline": "Adding Your Own Money (Voluntary Contributions)",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/how-super-works/adding-to-your-super",
            "image": "images/investments/asx200.png",
            "summary": "You can add your *own* money to your super, called a 'voluntary contribution', to boost your retirement savings.",
            "full_text": "Besides your employer's SGC payments, you can also choose to add your own money from your bank account (your 'after-tax' money).\n\n**Why would you do this?**\nBecause the investment earnings in super are taxed at a very low rate (15%), it can be a very powerful way to save for the long term. Money you invest *outside* of super (like in the 'Bank' tab) has its earnings taxed at your normal income tax rate, which is much higher.\n\nIn this game, you can use the 'Add Fund' button on your super tab to make a voluntary contribution at any time. This will transfer money from your 'Wallet' to your 'Super Fund'. Remember, this money is locked away until you retire!",
            "isRead": true
        },
        {
            "id": "super_access",
            "headline": "When Can I Access My Super?",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/superannuation/withdrawing-and-using-your-super/when-you-can-access-your-super",
            "image": "images/investments/term_deposit.png",
            "summary": "Your super is 'preserved', meaning it's locked away until you reach your 'preservation age' (usually 60-65).",
            "full_text": "This is the most important rule of super. It is *not* a normal savings account.\n\nYou cannot withdraw your super early to buy a house, pay off debt, or go on a holiday. The government locks this money away to make sure you have *something* to live on when you retire.\n\nIn this game, the money in your 'Superannuation' balance is included in your 'Net Worth', but you cannot spend it. It is growing in the background, waiting for your retirement (which is beyond the end of this game!).",
            "isRead": true
        },
        {
            "id": "super_insurance",
            "headline": "Insurance Inside Super",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/how-super-works/insurance-through-super",
            "image": "images/insurance/income_protection.png",
            "summary": "Most super accounts automatically come with insurance cover, like Life and Income Protection.",
            "full_text": "Many super funds offer insurance as a package deal. The most common types are:\n\n* **Life Insurance:** Pays a lump sum to your family if you pass away.\n* **Total and Permanent Disability (TPD):** Pays you a lump sum if you are permanently disabled and can't work again.\n* **Income Protection:** (Like the plan in the 'Insurance' tab) Pays you a portion of your salary for a temporary time if you're sick or injured and can't work.\n\nThe 'premiums' (cost) for this insurance are automatically deducted from your super balance, not your bank account. This makes it easier to afford, but it does reduce your super savings over time.",
            "isRead": true
        },
        {
            "id": "super_choice",
            "headline": "Choosing a Super Fund",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/how-super-works/choosing-a-super-fund",
            "image": "images/events/scam.png",
            "summary": "You can usually choose which super fund manages your money. Fees and investment performance can make a huge difference.",
            "full_text": "When you start a new job, you can usually tell your employer which super fund you want them to pay into. If you don't choose, they will pay into a 'default' fund.\n\nWhy choose? Because different funds charge different **fees** and have different **investment performance**.\n\nA fund with high fees and low returns can leave you with *thousands* of dollars less in retirement compared to a good, low-cost fund. It's always a good idea to compare funds.\n\n(In this game, you only have one fund, but in real life, this is one of your most important financial decisions!)",
            "isRead": true
        }
    ]
};
