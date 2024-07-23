const levelWeights = {
    'Very_Low': 1,
    'Low': 2,
    'Medium': 3,
    'High': 4,
    'Very_High': 5,
    'Rich': 6,
    'None': 0
};


const miningSellPrice = {
    Ore: 70,
    Gas: 35,
    Titanium: 200,
}


const miningResources = {
    Ore: {
        Very_Low: { min: 10, max: 30 },
        Low: { min: 40, max: 100 },
        Medium: { min: 120, max: 210 },
        High: { min: 180, max: 270 },
        Very_High: { min: 230, max: 340 },
        Rich: { min: 340, max: 500 },
    },
    Gas: {
        Very_Low: { min: 5, max: 20 },
        Low: { min: 30, max: 60 },
        Medium: { min: 70, max: 120 },
        High: { min: 100, max: 160 },
        Very_High: { min: 140, max: 220 },
        Rich: { min: 220, max: 320 },
    },
    Titanium: {
        Very_Low: { min: 1, max: 10 },
        Low: { min: 10, max: 30 },
        Medium: { min: 25, max: 50 },
        High: { min: 40, max: 80 },
        Very_High: { min: 70, max: 100 },
        Rich: { min: 100, max: 140 },
    }
};

const uniqueItems = {
    rune_carved_stone: { 
        name: "Rune-Carved Stone",
        quantity: 1, weight: 2, sell_price: 1000, baseChance: 0.05,
        description: "A very old stone, with carvings predating any language you're aware of."},
    unfathomable_rock: {
        name: "Unfathomable Rock",
        baseChance: 0.01, 
        quantity: 1,
        weight: 5,
        sell_price: 5000,
        description: "A dense, mysterious rock seemingly absorbing light around it."
    }
}

function calculateWeight(type, quantity) {
    // Define how weight is calculated based on type and quantity
    switch (type) {
        case 'Ore':
            return quantity; // Example: 1 unit of quantity equals 1 unit of weight
        case 'Gas':
            return quantity * 0.5; // Example: Gas is lighter
        case 'Titanium':
            return quantity * 2; // Example: Titanium is heavier
        default:
            return quantity; // Default case
    }
}

module.exports = { levelWeights, miningSellPrice, miningResources, uniqueItems, calculateWeight };
