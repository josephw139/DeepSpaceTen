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
    Copper: 60,
    Ore: 80,
    Gas: 40,
    Titanium: 140,
}

const researchSellPrice = {
    Bio: 1250,
    Tech: 1250,
    Cosmic: 1250,
    Exotic: 1250,
}


const miningResources = {
    Copper: {
        Very_Low: { min: 60, max: 110 },
        Low: { min: 80, max: 160 },
        Medium: { min: 130, max: 220 },
        High: { min: 190, max: 280 },
        Very_High: { min: 250, max: 350 },
        Rich: { min: 310, max: 410 },
    },
    Ore: {
        Very_Low: { min: 50, max: 100 },
        Low: { min: 70, max: 150 },
        Medium: { min: 120, max: 210 },
        High: { min: 180, max: 270 },
        Very_High: { min: 240, max: 340 },
        Rich: { min: 300, max: 400 },
    },
    Gas: {
        Very_Low: { min: 100, max: 200 },
        Low: { min: 170, max: 270 },
        Medium: { min: 230, max: 370 },
        High: { min: 320, max: 480 },
        Very_High: { min: 450, max: 600 },
        Rich: { min: 530, max: 700 },
    },
    Titanium: {
        Very_Low: { min: 5, max: 10 },
        Low: { min: 8, max: 20 },
        Medium: { min: 15, max: 30 },
        High: { min: 20, max: 40 },
        Very_High: { min: 30, max: 50 },
        Rich: { min: 40, max: 60 },
    }
};

const uniqueItems = {
    pulsating_rock: { 
        name: "Pulsating Rock",
        quantity: 1, weight: 3, sell_price: 1100, baseChance: 0.1,
        description: "It beats, almost like a heart. You can feel it pulsing in your grip. Is it alive?"
    },
    lightless_stone: {
        name: "Lightless Stone",
        baseChance: 0.01, 
        quantity: 1,
        weight: 10,
        sell_price: 1500,
        description: "A dense, mysterious stone seemingly absorbing light around it. Darker than vantablack."
    },
    hidden_message: {
        name: "Hidden Message",
        baseChance: 0.05, 
        quantity: 1,
        weight: 0,
        sell_price: 2000,
        description: ''
    },
    g7_cloud_manta: {
        name: "G7 Cloud Manta",
        baseChance: 0.01, 
        quantity: 1,
        weight: 5,
        sell_price: 3000,
        description: `Alien life! A rare creature, somewhat resembling a manta ray, which breathes and flies through G7's natural gases.`
    },
}

function calculateWeight(type, quantity) {
    // Define how weight is calculated based on type and quantity
    switch (type) {
        case 'Ore':
            return quantity * 3; // Example: 1 unit of quantity equals 5 unit of weight
        case 'Gas':
            return quantity; // Example: Gas is lighter
        case 'Titanium':
            return quantity * 5; // Example: Titanium is heavier
        case 'Copper':
            return quantity * 3; // Example: Copper is same as Ore
        default:
            return quantity; // Default case
    }
}


const researchTypes = {
    Bio: {
        Very_Low: { min: 1, max: 2 },
        Low: { min: 1, max: 3 },
        Medium: { min: 2, max: 3 },
        High: { min: 3, max: 5 },
        Very_High: { min: 4, max: 6 },
        Rich: { min: 4, max: 8 },
    },
    Tech: {
        Very_Low: { min: 1, max: 2 },
        Low: { min: 1, max: 3 },
        Medium: { min: 2, max: 3 },
        High: { min: 3, max: 5 },
        Very_High: { min: 4, max: 6 },
        Rich: { min: 4, max: 8 },
    },
    Cosmic: {
        Very_Low: { min: 1, max: 2 },
        Low: { min: 1, max: 3 },
        Medium: { min: 2, max: 3 },
        High: { min: 3, max: 5 },
        Very_High: { min: 4, max: 6 },
        Rich: { min: 4, max: 8 },
    },
    Exotic: {
        Very_Low: { min: 1, max: 2 },
        Low: { min: 1, max: 3 },
        Medium: { min: 2, max: 3 },
        High: { min: 3, max: 5 },
        Very_High: { min: 4, max: 6 },
        Rich: { min: 4, max: 8 },
    }
}


hiddenMessages = [
    `-ross the lines, and across th-`,
    `-loyed at a worrying distance of the border, in an uncanny resemblance t-`,
    `-wn another thirteen percent this quarter, with another drop pro-`,
    `-ey go silent before the leap, you know this, i know this. But it co-`,
    `-fore kinetics, we had bullets and shells. Before then, spears and rocks. In a hundred years, w-`,
    `-ish you could see the images!! you have to come over the second you can, it looks almost almost like a cat, and it t-`,
    `-n they must not care about undue attention, no “planetary mining operation” needs proximity mines and-`,
    `-ke a tower of fire dancing across the sun where there is no sun, where there should be no fire, and f-`,
    `-ne. Two. Four. Six. Ten. Zero. Ten. One. Two. Two. Two. Two. Tw-`,
    `-The best decision man ever made was taking shelter in a cave come nightfall. The worst, by far, w-`,

]

function randomizeInput(array) {
    selection = getRndInteger(0, array.length);
    return array[selection];
}

//Returns a random number between min and max (min excluded, max excluded):
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

module.exports = {
    levelWeights,
    miningSellPrice,
    miningResources,
    researchSellPrice,
    researchTypes,
    uniqueItems,
    hiddenMessages,
    calculateWeight,
    randomizeInput,
    getRndInteger,
 };
