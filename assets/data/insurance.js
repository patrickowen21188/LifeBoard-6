export const insuranceData = {
  "plans": [
    {
      "id": "medicare",
      "name": "Medicare (Public Health)",
      "type": "health",
      "isDefault": true, // Flag to identify this as the starting plan
      "image": "images/insurance/medicare.png",
      "tooltip": "Australia's public health system. Provides basic cover for hospital visits and some medical costs.",
      "premiumPerTurn": 0,
      "coverage": {
        "medicalEvents": 0.3, // Covers 30% of medical event costs
        "accidents": 0.0,
        "jobLoss": 0.0
      },
      "wpDeltaPerTurn": 0,
      "teaching": "Medicare is your default public safety net, covering essential medical services. It does not cover most dental, specialist, or accident-related costs, which is where private insurance comes in."
    },
    {
      "id": "basic_health",
      "name": "Basic Health Insurance",
      "type": "health",
      "image": "images/insurance/basic.png",
      "tooltip": "Low premium, covers 50% of hospital and specialist events. Exempts you from the Medicare Levy Surcharge.",
      "premiumPerTurn": 200,
      "coverage": {
        "medicalEvents": 0.5,
        "accidents": 0.3,
        "jobLoss": 0.0
      },
      "wpDeltaPerTurn": 1,
      "teaching": "Basic cover reduces big medical costs and avoids the Medicare Levy Surcharge if your income is high."
    },
    {
      "id": "premium_health",
      "name": "Premium Health Insurance",
      "type": "health",
      "image": "images/insurance/premium.png",
      "tooltip": "High premium, but covers 90% of medical and accident costs. Exempts you from MLS. Increases wellbeing.",
      "premiumPerTurn": 500,
      "coverage": {
        "medicalEvents": 0.9,
        "accidents": 0.8,
        "jobLoss": 0.0
      },
      "wpDeltaPerTurn": 2,
      "teaching": "Premium cover is expensive, but gives peace of mind and maximum protection for both medical and accident events."
    },
    {
      "id": "income_protection",
      "name": "Income Protection",
      "type": "income",
      "image": "images/insurance/income_protection.png",
      "tooltip": "Optional add-on. Helps replace wages (70% cover) if you lose your job due to an event.",
      "premiumPerTurn": 150,
      "coverage": {
        "medicalEvents": 0.0,
        "accidents": 0.0,
        "jobLoss": 0.7 // Covers 70% of job loss
      },
      "wpDeltaPerTurn": 0,
      "teaching": "This insurance pays you a portion of your income if you are unable to work due to illness or injury, protecting your cash flow."
    },
    {
      "id": "car_insurance",
      "name": "Car Insurance (Comprehensive)",
      "type": "general",
      "image": "images/insurance/car_insurance.png",
      "tooltip": "Covers 80% of costs related to car accidents and repairs.",
      "premiumPerTurn": 120,
      "coverage": {
        "medicalEvents": 0.0,
        "accidents": 0.8, // Specifically for car-related accidents
        "jobLoss": 0.0
      },
      "wpDeltaPerTurn": 0,
      "teaching": "Essential if you own a car. Covers a large portion of accident costs (like 'Unexpected Car Repair' events)."
    },
    {
      "id": "travel_insurance",
      "name": "Travel Insurance (Annual)",
      "type": "general",
      "image": "images/insurance/travel_insurance.png",
      "tooltip": "Covers medical emergencies and accidents while on holiday.",
      "premiumPerTurn": 50,
      "coverage": {
        "medicalEvents": 0.2, // Adds some medical cover
        "accidents": 0.2, // Adds some accident cover
        "jobLoss": 0.0
      },
      "wpDeltaPerTurn": 0,
      "teaching": "A safety net for when you are travelling. Can save you thousands in unexpected overseas medical or cancellation fees."
    }
  ],
  "notes": {
    "model": "Coverage is a percentage of cost reduction. Medicare is now the default. Car insurance coverage should be coded to apply only to relevant car events."
  }
};
