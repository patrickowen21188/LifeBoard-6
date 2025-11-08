/*
This file contains static educational content about the Australian Tax system,
written in plain English for a game context.
It is used by the 'ATO' tab in the tablet UI.
This content is for educational simulation purposes and is not financial advice.
Sources are linked for real-world information.
*/
export const taxData = {
    // This is the array that the loader.js file will import
    "education": [
        {
            "id": "tax_what_is",
            "headline": "What is Tax and Why Do We Pay It?",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/coming-to-australia-or-going-overseas/coming-to-australia/your-first-tax-return-and-tax-basics",
            "image": "images/events/charity.png",
            "summary": "Tax is money collected by the government from individuals and businesses to pay for public services for the whole community.",
            "full_text": "When you earn money, like from a job, you need to pay tax. The Australian Taxation Office (ATO) is the government body that collects this money.\n\nThe government uses this tax to pay for things that benefit everyone, such as:\n\n* **Health:** Hospitals, Medicare, and ambulances.\n* **Education:** Public schools, TAFEs, and universities.\n* **Transport:** Roads, railways, and public transport.\n* **Services:** Police, fire brigades, and social support (like Centrelink).\n\nIn this game, tax is automatically deducted from your pay each turn. This is called 'Pay As You Go' (PAYG) withholding. Paying tax is your contribution to the community.",
            "isRead": true
        },
        {
            "id": "tax_how_calc",
            "headline": "How is Tax Calculated? (Tax Brackets)",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/income-and-deductions/how-much-income-tax-you-pay/individual-income-tax-rates",
            "image": "images/events/fee.png",
            "summary": "Australia uses a 'progressive' tax system with different 'tax brackets'. The more you earn, the higher your *rate* of tax on the money *within* that bracket.",
            "full_text": "Your tax isn't just a flat percentage. It's calculated in slices called 'tax brackets'.\n\nFor example (rates are for game simulation):\n* **$0 - $18,200:** You pay 0c for each $1 (this is the tax-free threshold).\n* **$18,201 - $45,000:** You pay 19c for each $1 *over* $18,200.\n* **$45,001 - $120,000:** You pay 32.5c for each $1 *over* $45,000.\n* **...and so on.**\n\nThis means if you earn $50,000, you don't pay 32.5% on the *whole amount*. You pay 0% on the first $18,200, then 19% on the next slice, and then 32.5% on the final slice. Everyone gets the first $18,200 tax-free!",
            "isRead": true
        },
        {
            "id": "tax_tfn",
            "headline": "Your First Step: Get a TFN",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/tax-file-number",
            "image": "images/events/scholarship.png",
            "summary": "A Tax File Number (TFN) is your personal reference number for the tax system. You need one to get a job.",
            "full_text": "A TFN is a unique number that identifies you to the ATO. You'll have the same TFN for your whole life.\n\nYou need to give your TFN to your employer when you start a job. If you don't, your employer must withhold tax from your pay at the *highest possible rate*, which is a very expensive mistake!\n\nYou also need a TFN to open most bank accounts (so they can report any interest you earn) and for your superannuation fund.",
            "isRead": true
        },
        {
            "id": "tax_payg",
            "headline": "How Do You Pay Tax? (PAYG)",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/income-and-deductions/income-you-must-declare/payg-payment-summaries",
            "image": "images/investments/savings.png",
            "summary": "You pay tax as you earn it. Your employer takes the tax out of your pay *before* it hits your bank account.",
            "full_text": "This system is called 'Pay As You Go' (PAYG) Withholding. You don't have to save up a big lump of money to pay your tax at the end of the year.\n\nInstead, your employer calculates an *estimate* of the tax you'll owe based on how much you earn in that pay period. They 'withhold' that amount and send it directly to the ATO on your behalf.\n\nIn this game, your 'Net Cash Flow' on the Profile tab is your income *after* this PAYG tax has been taken out.",
            "isRead": true
        },
        {
            "id": "tax_gross_vs_net",
            "headline": "Gross Income vs. Net Income",
            "source": "moneysmart.gov.au",
            "link": "https://moneysmart.gov.au/getting-paid/your-first-payslip",
            "image": "images/events/bonus.png",
            "summary": "'Gross' income is your total pay *before* tax. 'Net' income is the 'take-home' pay that goes into your bank account *after* tax and other deductions.",
            "full_text": "This is a key concept to understand on your payslip.\n\n* **Gross Income:** The total amount you earned (e.g., 20 hours @ $25/hr = $500). This is the 'top line' number.\n\n* **Deductions:** This is the money taken out *before* you get paid. This includes PAYG Tax, Superannuation (SGC), and any other deductions.\n\n* **Net Income:** This is the final amount you actually receive. (e.g., $500 Gross - $80 Tax = $420 Net).\n\nYour game 'Wallet' and 'Cash Flow' are based on your **Net Income**.",
            "isRead": true
        },
        {
            "id": "tax_lodge",
            "headline": "What is a Tax Return (Lodgement)?",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/income-and-deductions/how-to-lodge-your-tax-return",
            "image": "images/events/tax_refund.png",
            "summary": "A tax return is your annual 'check-up' with the ATO. You report all your income, and the ATO checks if your PAYG estimates were correct.",
            "full_text": "Once per year (after June 30th), you must 'lodge a tax return'.\n\nThis process involves:\n1.  **Reporting Income:** Telling the ATO *exactly* how much you earned in the whole year from all sources (jobs, bank interest, investments).\n2.  **Claiming Deductions:** Telling the ATO about any work-related expenses you're allowed to claim (this is not simulated in the game).\n\n**The Result (The 'Reconciliation'):**\nThe ATO compares the *actual* tax you should have paid (based on your total income) with the *estimated* PAYG tax you already paid during the year.\n\n* If you paid *too much* tax, you get a **Tax Refund**.\n* If you paid *too little* tax, you get a **Tax Bill** and must pay the difference.",
            "isRead": true
        },
        {
            "id": "tax_medicare",
            "headline": "What is the Medicare Levy?",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy",
            "image": "images/insurance/basic.png",
            "summary": "The Medicare levy is an extra 2% tax on your taxable income. It helps fund Australia's public health system (Medicare).",
            "full_text": "The Medicare levy is collected from you *in addition* to your income tax. It's how we all chip in to pay for hospitals and doctor's visits, making healthcare accessible to everyone.\n\nIf you don't have private hospital insurance and you earn over a certain amount (e.g., $93,000), you may also have to pay an *extra* penalty called the **Medicare Levy Surcharge (MLS)**. This is why having Basic Health Insurance (as seen in the 'Insurance' tab) can sometimes save you money at tax time if you're a high-income earner.\n\nFor simplicity in this game, the Medicare Levy is included in your main tax calculation.",
            "isRead": true
        },
        {
            "id": "tax_hecs_help",
            "headline": "Paying Back HECS/HELP Debt",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/study-and-training-support-loans/compulsory-repayments",
            "image": "images/events/textbooks.png",
            "summary": "Once you earn over a certain threshold, you start paying back your HECS/HELP student loan *through the tax system*.",
            "full_text": "A HECS/HELP loan is a loan from the government to pay for your university or TAFE fees. It's one of the 'best' loans you can have, as it doesn't gain interest like a bank loan (it just gets indexed to inflation).\n\nYou don't make regular monthly payments. Instead, repayments are handled *automatically* at tax time.\n\nOnce your 'Repayment Income' goes above a certain threshold (e.g., ~$54,300), a percentage of your income is automatically taken as a repayment. This percentage increases as your income gets higher.\n\nThis extra payment is calculated when you lodge your tax return, and it will either reduce your tax refund or add to your tax bill.",
            "isRead": true
        },
        {
            "id": "tax_deductions",
            "headline": "What are Tax Deductions?",
            "source": "ato.gov.au",
            "link": "https://www.ato.gov.au/individuals-and-families/income-and-deductions/deductions-you-can-claim",
            "image": "images/market/jobs/construction_labourer.jpg",
            "summary": "Deductions are work-related expenses you paid for with your own money, which can be used to *reduce* your taxable income.",
            "full_text": "When you lodge your tax return, you can 'claim deductions'. This means you subtract the cost of work-related items from your *Gross Income*, which lowers your *Taxable Income*.\n\nCommon examples include:\n* Tools or equipment for your job (e.g., a tradie's tools).\n* Protective clothing or uniforms (e.g., steel-cap boots).\n* Self-education costs related to your *current* job.\n\nClaiming deductions lowers your taxable income, which means you've often overpaid your PAYG tax. This is a common reason people get a tax refund.\n\n**Note:** For simplicity, deductions are not simulated in this game. Your tax is calculated on your full gross income.",
            "isRead": true
        }
    ]
};
