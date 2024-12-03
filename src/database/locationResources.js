const levelWeights = {
    'Very_Low': 1,
    'Low': 2,
    'Medium': 3,
    'High': 4,
    'Very_High': 5,
    'Rich': 6,
    'None': 0
};


const resources = {
    Ore: {
        Iron: {
            type: "Ore",
            weight: 3,
            sellPrice: 70,
            availability: {
                Very_Low: { min: 50, max: 90 },
                Low: { min: 70, max: 120 },
                Medium: { min: 100, max: 150 },
                High: { min: 130, max: 190 },
                Very_High: { min: 160, max: 220 },
                Rich: { min: 190, max: 250 },
            }
        },
        Platinum: {
            type: "Ore",
            weight: 5,
            sellPrice: 120,
            availability: {
                Very_Low: { min: 10, max: 20 },
                Low: { min: 15, max: 30 },
                Medium: { min: 25, max: 40 },
                High: { min: 35, max: 50 },
                Very_High: { min: 45, max: 60 },
                Rich: { min: 55, max: 70 },
            }
        }
    },
    Gas: {
        Helium_3: {
            type: "Gas",
            sellPrice: 40,
            weight: 1,
            availability: {
                Very_Low: { min: 80, max: 140 },
                Low: { min: 120, max: 200 },
                Medium: { min: 180, max: 260 },
                High: { min: 240, max: 320 },
                Very_High: { min: 300, max: 380 },
                Rich: { min: 360, max: 440 },
            }
        },
        Tritium: {
            type: "Gas",
            sellPrice: 50,
            weight: 0.9,
            availability: {
                Very_Low: { min: 90, max: 160 },
                Low: { min: 140, max: 220 },
                Medium: { min: 200, max: 300 },
                High: { min: 280, max: 360 },
                Very_High: { min: 340, max: 420 },
                Rich: { min: 400, max: 480 },
            }
        }
    }
};

const uniqueItems = {
    pulsating_rock: { 
        name: "Pulsating Rock",
        quantity: 1, weight: 3, sellPrice: 1100, baseChance: 0.1,
        description: "It beats, almost like a heart. You can feel it pulsing in your grip. Is it alive?"
    },
    lightless_stone: {
        name: "Lightless Stone",
        baseChance: 0.01, 
        quantity: 1,
        weight: 10,
        sellPrice: 1500,
        description: "A dense, mysterious stone seemingly absorbing light around it. Darker than vantablack."
    },
    hidden_message: {
        name: "Hidden Message",
        baseChance: 0.05, 
        quantity: 1,
        weight: 0,
        sellPrice: 2000,
        description: ''
    },
    g7_cloud_manta: {
        name: "G7 Cloud Manta",
        baseChance: 0.01, 
        quantity: 1,
        weight: 5,
        sellPrice: 3000,
        description: `Alien life! A rare creature, somewhat resembling a manta ray, which breathes and flies through G7's natural gases.`
    },
}



const researchSellPrice = {
    Bio: 1250,
    Tech: 1250,
    Cosmic: 1250,
    Exotic: 1250,
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
    resources,
    researchSellPrice,
    researchTypes,
    uniqueItems,
    hiddenMessages,
    calculateWeight,
    randomizeInput,
    getRndInteger,
 };
