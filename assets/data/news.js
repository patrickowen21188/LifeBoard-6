export const newsData = {
    "articles": [
        // --- 1. ANNUAL ECONOMY REPORTS (Total: 30) ---
        // These are picked *once per year* by the _runAnnualEconomyUpdate function
        
        // --- Positive Reports (15) ---
        {
            "id": "eco_report_stable",
            "articleType": "economy_report", 
            "headline": "Economy Stable: Inflation at 2.4%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "The annual report for ${year} shows inflation at 2.4% and wage growth at 2.8%. Markets are calm and consumer confidence is steady.",
            "full_text": "A stable year sees the economy growing as expected. The Central Bank has indicated interest rates will likely remain on hold. This is a good environment for both savers and investors.",
            "inflationRate": 0.024,
            "wageGrowthRate": 0.028,
            "effect": {
                "investments": { "returnAdjustment": 0.01, "savingsBonus": 0.005 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_boom",
            "articleType": "economy_report",
            "headline": "Productivity Boom! Wages Grow 4.0%, Inflation 2.0%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "A fantastic year for workers. The annual report for ${year} shows a productivity boom has led to strong wage growth of 4.0%, with inflation remaining a healthy 2.0%.",
            "full_text": "Technological adoption has led to a surge in productivity, allowing companies to raise wages without passing on high costs to consumers. This 'goldilocks' economy is excellent for building wealth, as investments are performing well and purchasing power is increasing.",
            "inflationRate": 0.020,
            "wageGrowthRate": 0.040,
            "effect": {
                "investments": { "returnAdjustment": 0.03 },
                "jobs": { "availabilityMultiplier": 1.1 },
                "wpDelta": 2
            }
        },
        {
            "id": "eco_report_green_tech",
            "articleType": "economy_report",
            "headline": "Green Tech Investments Surge",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "Massive public and private investment in green technology in ${year} has created jobs. Inflation 2.2%, Wage Growth 3.5%.",
            "full_text": "The transition to renewable energy is accelerating. Billions have been invested this year, leading to strong hiring in trades, engineering, and logistics. This has pushed wage growth above the moderate 2.2% inflation rate.",
            "inflationRate": 0.022,
            "wageGrowthRate": 0.035,
            "effect": {
                "investments": { "returnAdjustment": 0.02 },
                "jobs": { "availabilityMultiplier": 1.15 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_low_stable",
            "articleType": "economy_report",
            "headline": "Low and Stable: Inflation 1.5%, Wages 2.0%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/interest.png",
            "summary": "A 'slow and steady' year for ${year}. Inflation is low at 1.5%, and wage growth is a modest 2.0%.",
            "full_text": "The economy is in a period of low, stable growth. While not exciting, this predictable environment is good for long-term planning. Savers are benefiting from positive real wage growth.",
            "inflationRate": 0.015,
            "wageGrowthRate": 0.020,
            "effect": {
                "investments": { "savingsBonus": 0.01 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_export_boom",
            "articleType": "economy_report",
            "headline": "Export Boom Boosts Economy",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "High demand for Australian exports in ${year} has led to a strong economy. Inflation 3.0%, Wage Growth 3.8%.",
            "full_text": "A surge in global demand for local resources and services has boosted national income. This has resulted in strong job security and wage growth that is comfortably outpacing inflation.",
            "inflationRate": 0.030,
            "wageGrowthRate": 0.038,
            "effect": {
                "investments": { "returnAdjustment": 0.02 },
                "jobs": { "availabilityMultiplier": 1.1 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_consumer_confidence",
            "articleType": "economy_report",
            "headline": "Consumer Confidence High",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "Strong retail and service sector performance in ${year}. Inflation 2.8%, Wage Growth 3.5%.",
            "full_text": "People are feeling good about their financial situation, leading to high consumer spending. This has been a great year for hospitality and retail jobs. Inflation remains in check.",
            "inflationRate": 0.028,
            "wageGrowthRate": 0.035,
            "effect": {
                "investments": { "returnAdjustment": 0.015 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_ai_efficiency",
            "articleType": "economy_report",
            "headline": "AI Adoption Boosts Productivity",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "Widespread AI adoption in ${year} has increased company profits, leading to bonuses. Inflation 2.0%, Wage Growth 3.0%.",
            "full_text": "Businesses are seeing significant efficiency gains from new AI tools. This has boosted profits and led to strong investment returns and employee bonuses. Wage growth is solid.",
            "inflationRate": 0.020,
            "wageGrowthRate": 0.030,
            "effect": {
                "investments": { "returnAdjustment": 0.035 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_tax_cuts",
            "articleType": "economy_report",
            "headline": "Government Tax Cuts Stimulate Growth",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/tax_refund.png",
            "summary": "Tax cuts announced in ${year} have boosted spending. Inflation 2.5%, Wage Growth 2.5%.",
            "full_text": "This year's tax cuts have put more money in people's pockets, leading to a strong year for the economy. Inflation and wage growth are perfectly balanced.",
            "inflationRate": 0.025,
            "wageGrowthRate": 0.025,
            "effect": {
                // The tax cut is simulated by the lodgement, this is the market effect
                "investments": { "returnAdjustment": 0.01 },
                "wpDelta": 2
            }
        },
        {
            "id": "eco_report_strong_housing",
            "articleType": "economy_report",
            "headline": "Stable Housing Market Lifts All Boats",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/properties/suburb_townhouse.png",
            "summary": "A stable, healthy housing market in ${year} supports the economy. Inflation 2.3%, Wage Growth 2.8%.",
            "full_text": "With no housing bubbles or crashes, the construction industry is stable and consumer confidence is high. This has supported steady job growth and a positive economic outlook.",
            "inflationRate": 0.023,
            "wageGrowthRate": 0.028,
            "effect": {
                "properties": { "equityAdjustment": 0.01 }, // Minor equity boost
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_biotech_breakthrough",
            "articleType": "economy_report",
            "headline": "Local Biotech Breakthrough",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "A major biotech discovery in ${year} has led to a boom in the health sector. Inflation 1.9%, Wage Growth 3.0%.",
            "full_text": "A local university's discovery has been licensed for billions, sparking a boom in the healthcare and research sectors. This has created high-paying jobs and boosted investment markets.",
            "inflationRate": 0.019,
            "wageGrowthRate": 0.030,
            "effect": {
                "investments": { "returnAdjustment": 0.025 },
                "jobs": { "availabilityMultiplier": 1.1 },
                "wpDelta": 2
            }
        },
        {
            "id": "eco_report_global_recovery",
            "articleType": "economy_report",
            "headline": "Strong Global Recovery",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "A strong global recovery in ${year} has increased demand for everything. Inflation 3.5%, Wage Growth 4.0%.",
            "full_text": "The world economy is firing on all cylinders. This has led to high demand, high inflation, but even higher wage growth as companies compete for workers.",
            "inflationRate": 0.035,
            "wageGrowthRate": 0.040,
            "effect": {
                "investments": { "returnAdjustment": 0.02 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_calm_year",
            "articleType": "economy_report",
            "headline": "A Calm, Predictable Year",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/investments/savings.png",
            "summary": "Nothing major happened in ${year}. Inflation 2.0%, Wage Growth 2.2%.",
            "full_text": "Sometimes no news is good news. A calm, predictable year has been good for planning and saving. Both inflation and wage growth are low and stable.",
            "inflationRate": 0.020,
            "wageGrowthRate": 0.022,
            "effect": {
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_infrastructure_spend",
            "articleType": "economy_report",
            "headline": "Infrastructure Spending Creates Jobs",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/market/jobs/construction_labourer.jpg",
            "summary": "Government infrastructure projects in ${year} are creating thousands of jobs. Inflation 2.8%, Wage Growth 3.5%.",
            "full_text": "New railways, roads, and hospitals are being built. This has created huge demand for trades, construction, and engineering roles, pushing up wages in those sectors.",
            "inflationRate": 0.028,
            "wageGrowthRate": 0.035,
            "effect": {
                "jobs": { "availabilityMultiplier": 1.2 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_manufacturing_renaissance",
            "articleType": "economy_report",
            "headline": "On-shoring Boosts Manufacturing",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/market/jobs/warehouse_picker.jpg",
            "summary": "A trend of 'on-shoring' in ${year} has revitalised local manufacturing. Inflation 2.5%, Wage Growth 3.2%.",
            "full_text": "Companies are moving their manufacturing back home, creating a boom for skilled factory and logistics workers. This has led to solid wage growth across the industrial sector.",
            "inflationRate": 0.025,
            "wageGrowthRate": 0.032,
            "effect": {
                "jobs": { "availabilityMultiplier": 1.15 },
                "wpDelta": 1
            }
        },
        {
            "id": "eco_report_services_boom",
            "articleType": "economy_report",
            "headline": "Services Sector Thrives",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/market/jobs/barista.jpg",
            "summary": "A strong year for services (hospitality, tourism, retail) in ${year}. Inflation 2.9%, Wage Growth 3.5%.",
            "full_text": "Consumers are spending strongly on experiences. This has been a great year for jobs in cafes, restaurants, and retail, with solid wage growth to attract staff.",
            "inflationRate": 0.029,
            "wageGrowthRate": 0.035,
            "effect": {
                "investments": { "returnAdjustment": 0.01 },
                "wpDelta": 1
            }
        },

        // --- Negative Reports (15) ---
        {
            "id": "eco_report_high_inf",
            "articleType": "economy_report",
            "headline": "Inflation Spikes to 7.2%!",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/inflation.png",
            "summary": "The annual report for ${year} shows a supply chain shock has pushed inflation to 7.2%, while wages lag at 3.1%. The Central Bank is expected to raise interest rates.",
            "full_text": "Significant global supply chain issues have led to a sharp rise in prices for consumers. While wage growth is present, it is not keeping up with the cost of living, putting pressure on household budgets. Expect investment market volatility.",
            "inflationRate": 0.072,
            "wageGrowthRate": 0.031,
            "effect": {
                "investments": { "returnAdjustment": -0.02, "savingsBonus": 0.03 },
                "expenses": { "lifestyleMultiplier": 1.05 }, // Extra price hike
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_stagflation",
            "articleType": "economy_report",
            "headline": "Stagflation Warning: 4.5% Inflation, 1.0% Wage Growth",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/recession.png",
            "summary": "The worst-case scenario: The annual report for ${year} shows high inflation at 4.5% but almost no economic growth, with wages rising only 1.0%.",
            "full_text": "Economists are concerned as the economy appears to be stagnating. Prices are rising due to external factors, but companies are not expanding, leading to minimal wage growth. This is the toughest environment for workers, as cash flow is squeezed from both ends.",
            "inflationRate": 0.045,
            "wageGrowthRate": 0.010,
            "effect": {
                "investments": { "returnAdjustment": -0.03 },
                "jobs": { "availabilityMultiplier": 0.8 },
                "wpDelta": -3
            }
        },
        {
            "id": "eco_report_mild_recession",
            "articleType": "economy_report",
            "headline": "Mild Recession Hits: Inflation 0.5%, Wages -1.0%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/recession.png",
            "summary": "The economy has officially entered a mild recession in ${year}. Inflation is 0.5%, but wage growth has turned negative at -1.0% as jobs are cut.",
            "full_text": "Two quarters of negative growth have confirmed a recession. Companies are laying off staff, especially in casual and part-time roles. Investment markets are down, and consumer confidence is very low.",
            "inflationRate": 0.005,
            "wageGrowthRate": -0.010,
            "effect": {
                "investments": { "returnAdjustment": -0.04 },
                "jobs": { "availabilityMultiplier": 0.7 },
                "wpDelta": -3
            }
        },
        {
            "id": "eco_report_housing_correction",
            "articleType": "economy_report",
            "headline": "Housing Correction: Prices Tumble 10%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/property_correction.png",
            "summary": "A sharp interest rate rise in ${year} has caused a 10% drop in property values. Inflation 5.0%, Wage Growth 2.0%.",
            "full_text": "The Central Bank's fight against inflation has hit the property market hard. While bad for homeowners' equity, this may present an opportunity for first-home buyers. The broader economy has stalled.",
            "inflationRate": 0.050,
            "wageGrowthRate": 0.020,
            "effect": {
                "properties": { "equityAdjustment": -0.10 },
                "investments": { "returnAdjustment": -0.01 },
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_oil_shock",
            "articleType": "economy_report",
            "headline": "Oil Price Shock Hits Transport",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/inflation.png",
            "summary": "A global oil shock in ${year} has doubled transport costs. Inflation 6.0%, Wage Growth 2.5%.",
            "full_text": "Disruptions to the global oil supply have seen petrol and energy prices skyrocket. This is feeding into high inflation across the board, squeezing household budgets.",
            "inflationRate": 0.060,
            "wageGrowthRate": 0.025,
            "effect": {
                "expenses": { "transportMultiplier": 1.5, "lifestyleMultiplier": 1.02 },
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_jobless_recovery",
            "articleType": "economy_report",
            "headline": "Jobless Recovery: Inflation 3.0%, Wages 0.5%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/job_loss.png",
            "summary": "The economy is technically growing in ${year}, but it's a 'jobless recovery'. Inflation is 3.0%, but wage growth is near zero at 0.5%.",
            "full_text": "Company profits are up, but businesses are not hiring, choosing to use automation instead. This is leading to high investment returns but terrible outcomes for workers, whose purchasing power is falling fast.",
            "inflationRate": 0.030,
            "wageGrowthRate": 0.005,
            "effect": {
                "investments": { "returnAdjustment": 0.02 }, // Profits are up
                "jobs": { "availabilityMultiplier": 0.8 }, // But no one is hiring
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_drought",
            "articleType": "economy_report",
            "headline": "Drought Pushes Food Prices Higher",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/inflation.png",
            "summary": "A severe drought in ${year} has impacted food production. Inflation 4.0%, Wage Growth 2.0%.",
            "full_text": "Failed crops have led to a sharp increase in the price of groceries. This has pushed up inflation, while the rest of the economy remains sluggish. Household budgets are under strain.",
            "inflationRate": 0.040,
            "wageGrowthRate": 0.020,
            "effect": {
                "expenses": { "lifestyleMultiplier": 1.1 }, // Food costs are part of lifestyle
                "wpDelta": -1
            }
        },
        {
            "id": "eco_report_interest_hike",
            "articleType": "economy_report",
            "headline": "Central Bank Hikes Rates",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/interest_rate_rise.png",
            "summary": "To fight lingering inflation, the Central Bank hiked rates in ${year}. Inflation 3.5%, Wage Growth 2.0%.",
            "full_text": "The Central Bank is trying to slow the economy. This is good for savers, who get more interest, but bad for borrowers and investment markets, which are stalling.",
            "inflationRate": 0.035,
            "wageGrowthRate": 0.020,
            "effect": {
                "investments": { "returnAdjustment": -0.01, "savingsBonus": 0.025 },
                "expenses": { "loanMultiplier": 1.1 },
                "wpDelta": -1
            }
        },
        {
            "id": "eco_report_trade_war",
            "articleType": "economy_report",
            "headline": "Global Trade War Begins",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/recession.png",
            "summary": "A new trade war in ${year} has frozen global markets. Inflation 1.0%, Wage Growth 0.0%.",
            "full_text": "New tariffs and trade barriers have caused global investment to freeze. Companies have stopped hiring, and both inflation and wage growth have fallen to zero as the economy waits to see what happens next.",
            "inflationRate": 0.010,
            "wageGrowthRate": 0.000,
            "effect": {
                "investments": { "returnAdjustment": -0.05 },
                "jobs": { "availabilityMultiplier": 0.75 },
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_deflation",
            "articleType": "economy_report",
            "headline": "Deflation Spiral: Inflation -1.0%, Wages -2.0%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/recession.png",
            "summary": "A rare but dangerous deflationary spiral has begun in ${year}. Prices are falling 1.0%, but wages are falling faster at 2.0%.",
            "full_text": "Deflation is a dangerous economic state where prices fall. Consumers stop spending, waiting for prices to fall further. This causes companies to lose money, cut jobs, and cut wages, reinforcing the cycle.",
            "inflationRate": -0.010,
            "wageGrowthRate": -0.020,
            "effect": {
                "investments": { "returnAdjustment": -0.03 },
                "jobs": { "availabilityMultiplier": 0.7 },
                "wpDelta": -3
            }
        },
        {
            "id": "eco_report_sticky_inflation",
            "articleType": "economy_report",
            "headline": "Sticky Inflation: 5.0% Inflation, 3.0% Wages",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/inflation.png",
            "summary": "Inflation just won't go away. The report for ${year} shows 'sticky' inflation at 5.0%, while wages struggle at 3.0%.",
            "full_text": "Despite efforts, inflation for services and rent remains high. This is slowly eroding purchasing power and causing frustration, as the cost of living continues to outpace wage gains.",
            "inflationRate": 0.050,
            "wageGrowthRate": 0.030,
            "effect": {
                "investments": { "savingsBonus": 0.015 },
                "expenses": { "lifestyleMultiplier": 1.02, "housingMultiplier": 1.02 },
                "wpDelta": -1
            }
        },
        {
            "id": "eco_report_weak_growth",
            "articleType": "economy_report",
            "headline": "Weak Growth, Low Inflation",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/job_loss.png",
            "summary": "A stagnant year for ${year}. Inflation is low at 1.0%, but wage growth is also very low at 1.2%.",
            "full_text": "The economy is 'muddling through' without any real direction. There's no crisis, but there's no growth either. It's a frustrating time for career progression and wealth building.",
            "inflationRate": 0.010,
            "wageGrowthRate": 0.012,
            "effect": {
                "investments": { "returnAdjustment": 0.005 },
                "jobs": { "availabilityMultiplier": 0.9 },
                "wpDelta": -1
            }
        },
        {
            "id": "eco_report_skill_shortage",
            "articleType": "economy_report",
            "headline": "Skill Shortage: Inflation 3.5%, Wages 4.5%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "A major skills shortage in ${year} is forcing companies to pay more. Wages are up 4.5%, pushing inflation to 3.5%.",
            "full_text": "Companies are desperate for skilled workers and are paying high salaries to attract them. This is great for workers (positive real wage growth) but is also pushing up the price of services.",
            "inflationRate": 0.035,
            "wageGrowthRate": 0.045,
            "effect": {
                "jobs": { "availabilityMultiplier": 1.25 },
                "wpDelta": 1
            }
        },
         {
            "id": "eco_report_energy_crisis",
            "articleType": "economy_report",
            "headline": "Energy Crisis: Inflation 5.5%, Wages 2.5%",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/utility_spike.png",
            "summary": "An energy crisis in ${year} has spiked utility bills. Inflation is high at 5.5%, while wages lag at 2.5%.",
            "full_text": "The closure of several power plants has led to a spike in electricity and gas prices. This is a direct hit to household budgets and is causing inflation across the economy.",
            "inflationRate": 0.055,
            "wageGrowthRate": 0.025,
            "effect": {
                "expenses": { "lifestyleMultiplier": 1.05, "housingMultiplier": 1.05 }, // Utilities
                "wpDelta": -2
            }
        },
        {
            "id": "eco_report_tax_hike",
            "articleType": "economy_report",
            "headline": "Government Hikes Taxes",
            "source": "Annual Economic Review",
            "link": "#",
            "image": "images/events/fee.png",
            "summary": "To pay down debt, the government has raised taxes in ${year}. Inflation 2.0%, Wage Growth 1.5%.",
            "full_text": "New tax levies are slowing the economy. This will be felt at tax time, and has also slowed down hiring and wage growth as companies face new taxes themselves.",
            "inflationRate": 0.020,
            "wageGrowthRate": 0.015,
            "effect": {
                // This will be simulated by a change to TAX_BRACKETS in finance-logic.js (a future update)
                // For now, it just slows the economy.
                "investments": { "returnAdjustment": -0.01 },
                "jobs": { "availabilityMultiplier": 0.9 },
                "wpDelta": -2
            }
        },


        // --- 2. RANDOM GLOBAL EVENTS (Total: 16) ---
        // These are picked *randomly* (25% chance per turn) by triggerEvents
        
        // --- Existing Random Events (6) ---
        {
            "id": "g1_recession",
            "articleType": "random_global", 
            "eventId": "g1_recession",
            "headline": "Global Markets Tumble as Recession Fears Mount",
            "source": "Global Financial Times",
            "link": "https://www.gft.com/world/economy/global-markets-tumble-recession-fears",
            "image": "images/events/recession.png",
            "summary": "A sharp downturn in manufacturing output and consumer spending has economists sounding the alarm. The likelihood of a global recession has increased significantly, leading to widespread job cuts and a freeze in investment.",
            "full_text": "Economic indicators released today paint a grim picture for the global economy. The Purchasing Managers' Index (PMI) has fallen to its lowest level in a decade, while retail sales have plummeted unexpectedly. Central banks are now under immense pressure to act, but with interest rates already low, their options are limited. Major corporations have already announced hiring freezes and layoffs, particularly in the tech and manufacturing sectors. Financial analysts are advising investors to move towards lower-risk assets as market volatility is expected to continue for the foreseeable future. The downturn is predicted to have a significant impact on the job market for young people and recent graduates.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 3,
            "effect": {
                "jobs": { "availabilityMultiplier": 0.6, "casualHoursCut": 0.8 },
                "investments": { "returnAdjustment": -0.06 },
                "wpDelta": -2
            },
            "teaching": "Recessions lower job availability and returns. Emergency savings and budgeting buffer shocks."
        },
        {
            "id": "g2_boom",
            "articleType": "random_global", 
            "eventId": "g2_boom",
            "headline": "Unexpected Surge in Innovation Drives Market Boom",
            "source": "Tech & Capital Weekly",
            "link": "https://www.tcweekly.com/markets/innovation-surge-drives-boom",
            "image": "images/events/boom.png",
            "summary": "Breakthroughs in renewable energy and AI have ignited a market rally, with tech and industrial stocks leading the charge. Job growth is accelerating as companies expand to meet new opportunities.",
            "full_text": "A wave of optimism has swept through global markets following major advancements in battery storage technology and generative AI applications. The subsequent surge in productivity has led to record-breaking corporate profits and a flurry of investment in new ventures. The unemployment rate has fallen to a historic low as companies across all sectors are aggressively hiring to scale their operations. 'We are at the beginning of a new industrial revolution,' one analyst commented. 'The opportunities for growth and innovation are immense.' Investors are enjoying significant returns, although some economists caution that the rapid growth could lead to inflationary pressures down the line.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "jobs": { "availabilityMultiplier": 1.2 },
                "investments": { "returnAdjustment": 0.08 },
                "wpDelta": 1
            },
            "teaching": "In booms, jobs and returns improve. Stay diversified—booms can reverse."
        },
        {
            "id": "g3_inflation",
            "articleType": "random_global", 
            "eventId": "g3_inflation",
            "headline": "Supply Chain Disruptions Push Inflation to Record Highs",
            "source": "World Economic Review",
            "link": "https://www.wer.org/economy/inflation-record-highs-supply-chain",
            "image": "images/events/inflation.png",
            "summary": "Ongoing global supply chain bottlenecks and rising energy costs have caused consumer prices to spike. The cost of living is now a major concern for households worldwide as wages fail to keep pace.",
            "full_text": "The latest Consumer Price Index (CPI) figures show inflation running at its highest rate in over 20 years. The primary drivers are persistent disruptions in global shipping, a shortage of key manufacturing components, and soaring energy prices. The cost of everyday goods, from groceries to gasoline, has risen sharply, eroding the purchasing power of consumers. While central banks are beginning to raise interest rates to cool down the economy, analysts warn this could trigger a slowdown in growth. For now, households are feeling the squeeze, with discretionary spending expected to fall significantly in the coming months.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 3,
            "effect": {
                "expenses": { "lifestyleMultiplier": 1.15, "housingMultiplier": 1.1, "transportMultiplier": 1.08 },
                "investments": { "returnAdjustment": 0.02 },
                "wpDelta": -1
            },
            "teaching": "Inflation erodes purchasing power. Investing helps money keep up over time."
        },
        {
            "id": "g4_property_correction",
            "articleType": "random_global", 
            "eventId": "g4_property_correction",
            "headline": "Housing Bubble Shows Signs of Deflating as Prices Drop",
            "source": "National Property Journal",
            "link": "https://www.npj.com.au/market-news/housing-bubble-deflating",
            "image": "images/events/property_correction.png",
            "summary": "After years of rapid growth, property markets in major urban centers are finally cooling off. Higher interest rates and increased housing supply have led to the first significant price drop in five years.",
            "full_text": "The seemingly unstoppable rise in property values has come to a halt. Data from the past quarter reveals a 5% drop in median house prices in capital cities, with auction clearance rates falling to their lowest point since the last market downturn. The correction is being attributed to a combination of factors, including recent interest rate hikes making mortgages more expensive, and a wave of new apartment completions increasing supply. While this is welcome news for first-time homebuyers, existing homeowners who bought at the peak of the market may face the risk of negative equity. The long-term outlook remains uncertain, with most experts predicting a period of stagnation or further slow declines.",
            "ageMin": 20,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "properties": { "equityAdjustment": -0.05 }
            },
            "teaching": "Property doesn’t always go up. Avoid over-leverage and keep buffers."
        },
        {
            "id": "g5_interest_rate_rise",
            "articleType": "random_global", 
            "eventId": "g5_interest_rate_rise",
            "headline": "Central Bank Announces Surprise Interest Rate Hike to Combat Inflation",
            "source": "Central Bank Press Office",
            "link": "https://www.centralbank.gov/press/interest-rate-hike-inflation",
            "image": "images/events/interest_rate_rise.png",
            "summary": "In an effort to curb soaring inflation, the central bank has raised the official cash rate by 0.5%. The move will increase borrowing costs for homeowners and businesses but will boost returns for savers.",
            "full_text": "The Reserve Bank has taken decisive action today, announcing a 50-basis-point increase to the official cash rate. The move, which was larger than most economists predicted, is a clear signal of the bank's commitment to bringing inflation back under control. For variable-rate mortgage holders, this will mean an immediate increase in monthly repayments. Businesses with outstanding loans will also face higher borrowing costs, potentially slowing down expansion plans. On the other side of the ledger, savers will finally see a meaningful increase in the interest earned on their deposits, providing some relief from the rising cost of living.",
            "ageMin": 18,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                // --- FIX: Changed 'mortgageMultiplier' to 'housingMultiplier' ---
                // The 'loanMultiplier' is not currently used by state.js, but 'housingMultiplier' is.
                "expenses": { "housingMultiplier": 1.1 },
                "investments": { "savingsBonus": 0.01 }
            },
            "teaching": "Rates affect borrowers and savers differently. Review debt and savings strategy."
        },
        {
            "id": "g6_pandemic",
            "articleType": "random_global", 
            "eventId": "g6_pandemic",
            "headline": "Global Health Crisis Declared; Nations Impose Lockdowns",
            "source": "World Health Network",
            "link": "https://www.whn.org/alerts/global-health-crisis-pandemic",
            "image": "images/events/pandemic.png",
            "summary": "A novel virus has spread rapidly across the globe, leading to a declared pandemic. Governments are implementing strict lockdown measures, causing widespread disruption to travel, work, and daily life.",
            "full_text": "The World Health Network has declared a global pandemic as a new, highly contagious virus continues to spread. In response, countries are closing their borders and enforcing strict stay-at-home orders to slow the transmission rate. The economic consequences are expected to be severe, with hospitality, tourism, and retail sectors facing an unprecedented shutdown. Healthcare systems are under extreme pressure, and citizens are being urged to follow public health advice to protect themselves and their communities. The long-term social and economic impacts of this crisis are still unknown but are expected to be profound and long-lasting.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "jobs": { "availabilityMultiplier": 0.5 },
                "expenses": { "medicalMultiplier": 1.25 },
                "wpDelta": -3
            },
            "teaching": "Shocks highlight the value of insurance, emergency funds and flexible plans."
        },

        // --- New Random Global Events (10) ---
        {
            "id": "g7_cyber_attack",
            "articleType": "random_global",
            "headline": "Major Banks Hit By Cyber Attack",
            "source": "Global Tech Alert",
            "link": "#",
            "image": "images/events/scam_loss.png",
            "summary": "A coordinated cyber attack has temporarily frozen bank transfers and payments. Markets are spooked, and a 'digital services' fee may be introduced.",
            "full_text": "Financial institutions are scrambling to restore services after a major cyber attack. Confidence in the banking system has taken a hit, causing a temporary dip in investment markets and a hit to consumer wellbeing.",
            "ageMin": 18,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "investments": { "returnAdjustment": -0.01 },
                "expenses": { "lifestyleMultiplier": 1.05 }, // New bank fees
                "wpDelta": -2
            },
            "teaching": "Systemic risks are real. Diversification helps mitigate shocks you can't predict."
        },
        {
            "id": "g8_trade_deal",
            "articleType": "random_global",
            "headline": "New Trade Deal Signed",
            "source": "World Trade Monitor",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "A new trade deal with emerging markets is expected to boost exports and lower the cost of imported goods.",
            "full_text": "Economists have praised the new trade agreement, which opens up new markets for local businesses and reduces tariffs on consumer electronics and vehicles. This is expected to be good for jobs and investment.",
            "ageMin": 18,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "investments": { "returnAdjustment": 0.015 },
                "jobs": { "availabilityMultiplier": 1.1 },
                "wpDelta": 1
            },
            "teaching": "Global trade can be a powerful engine for economic growth and lower prices."
        },
        {
            "id": "g9_drought",
            "articleType": "random_global",
            "headline": "Severe Drought Hits Farmers",
            "source": "National Weather Service",
            "link": "#",
            "image": "images/events/inflation.png",
            "summary": "A severe drought is impacting the agricultural sector, leading to a sharp rise in grocery prices for consumers.",
            "full_text": "Widespread drought conditions have led to a poor harvest, significantly increasing the cost of fresh food and groceries. This is a direct hit to the 'lifestyle' portion of household budgets.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 3,
            "effect": {
                "expenses": { "lifestyleMultiplier": 1.1 }, // Food costs
                "wpDelta": -1
            },
            "teaching": "The cost of essentials can be volatile. A buffer in your budget is key."
        },
        {
            "id": "g10_mineral_discovery",
            "articleType": "random_global",
            "headline": "Rare Earth Mineral Discovery",
            "source": "Mining Weekly",
            "link": "#",
            "image": "images/events/bonus.png",
            "summary": "A massive deposit of rare earth minerals has been discovered, sparking a 'modern gold rush' and a boom for the resources sector.",
            "full_text": "Investment is pouring into the mining and exploration sectors following a major discovery. This is expected to create thousands of jobs and a significant boost to the national economy for years to come.",
            "ageMin": 20,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "investments": { "returnAdjustment": 0.03 },
                "jobs": { "availabilityMultiplier": 1.15 },
                "wpDelta": 1
            },
            "teaching": "Economic booms can be sparked by unexpected discoveries. Be ready for opportunity."
        },
        {
            "id": "g11_banking_stress",
            "articleType": "random_global",
            "headline": "Banking System Stress Test",
            "source": "Financial Regulator",
            "link": "#",
            "image": "images/events/interest_rate_rise.png",
            "summary": "The regulator has forced banks to hold more capital, slowing down lending. This has cooled the property and investment markets.",
            "full_text": "New macro-prudential rules mean banks are lending less. This makes it harder to get a mortgage or a business loan, slowing economic growth and reducing property market activity.",
            "ageMin": 18,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 3,
            "effect": {
                "investments": { "returnAdjustment": -0.01 },
                "properties": { "equityAdjustment": -0.02 }
            },
            "teaching": "Credit availability is the engine of the economy. When it tightens, growth slows."
        },
        {
            "id": "g12_ai_breakthrough",
            "articleType": "random_global",
            "headline": "Global AI Breakthrough Changes Everything",
            "source": "Tech & Capital Weekly",
            "link": "#",
            "image": "images/events/boom.png",
            "summary": "A new AI model has achieved AGI, sparking a massive, unprecedented boom in tech and productivity. The future is here.",
            "full_text": "This is it. A true general AI has been demonstrated, and markets are reacting with extreme optimism. Every industry is being re-evaluated. This is a once-in-a-generation event.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 1,
            "effect": {
                "investments": { "returnAdjustment": 0.15 }, // Massive boom
                "jobs": { "availabilityMultiplier": 1.5 },
                "wpDelta": 3
            },
            "teaching": "Technological leaps can create immense new wealth and opportunities."
        },
        {
            "id": "g13_tourism_collapse",
            "articleType": "random_global",
            "headline": "Tourism Collapses After Natural Disaster",
            "source": "World Travel Advisory",
            "link": "#",
            "image": "images/events/job_loss.png",
            "summary": "A volcanic eruption (or similar) has halted global travel. The tourism and hospitality sectors are in crisis.",
            "full_text": "Following a major natural disaster, international travel has been suspended. This has been catastrophic for hospitality and tourism operators, leading to immediate job losses in those sectors.",
            "ageMin": 15,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "jobs": { "availabilityMultiplier": 0.8 }, // Sector-specific, but affects overall
                "wpDelta": -1
            },
            "teaching": "Industries can be highly sensitive to external shocks. Diversify your skills."
        },
        {
            "id": "g14_green_subsidy",
            "articleType": "random_global",
            "headline": "New 'Green Home' Subsidy Announced",
            "source": "Government Press Office",
            "link": "#",
            "image": "images/events/tax_refund.png",
            "summary": "The government has announced a new subsidy for green home upgrades, like solar panels and insulation.",
            "full_text": "To meet climate targets, new rebates are available for homeowners. This reduces the cost of utilities and home improvements, providing a small boost to household cash flow.",
            "ageMin": 20,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                "expenses": { "housingMultiplier": 0.95 }, // Cheaper utilities
                "wpDelta": 1
            },
            "teaching": "Government subsidies can change the math on major purchases."
        },
        {
            "id": "g15_education_reform",
            "articleType": "random_global",
            "headline": "Major Education Reform Bill",
            "source": "Department of Education",
            "link": "#",
            "image": "images/events/scholarship.png",
            "summary": "A new reform bill has passed, making university and TAFE courses in key areas (like health and tech) significantly cheaper.",
            "full_text": "In an effort to fill skill shortages, the government has heavily subsidised education in certain fields. This is a great time to study, as it will reduce your future HECS/HELP debt.",
            "ageMin": 17,
            "ageMax": 25,
            "frequency": "rare",
            "weight": 2,
            "effect": {
                // This would ideally reduce the cost of HECS debt accumulation
                // For now, it provides a wellbeing boost and small cash bonus (simulating grants)
                "wpDelta": 2,
                "cashDelta": 500 // Simulates a grant
            },
            "teaching": "Education policy can make a big difference to the cost of upskilling."
        },
        {
            "id": "g16_robotaxi_approval",
            "articleType": "random_global",
            "headline": "Robo-Taxis Approved for City Use",
            "source": "City Transport Authority",
            "link": "#",
            "image": "images/events/car_repair.png",
            "summary": "Autonomous vehicles have been approved, slashing the cost of transport for everyone. This is hitting transport-related jobs hard.",
            "full_text": "The age of autonomous transport is here. The cost of getting around has plummeted, but this disruption is causing job losses for delivery drivers and other transport workers.",
            "ageMin": 20,
            "ageMax": 30,
            "frequency": "rare",
            "weight": 1,
            "effect": {
                "expenses": { "transportMultiplier": 0.5 },
                "jobs": { "availabilityMultiplier": 0.9 }, // Bad for transport jobs
                "wpDelta": 1
            },
            "teaching": "Technological disruption has winners and losers. Adapt your skills."
        }
    ]
};
