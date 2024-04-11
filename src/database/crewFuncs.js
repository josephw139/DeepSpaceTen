const { firstNames, lastNames, appearances, personalities, attitudes } = require('./npcs/npcTraits.js');


function generateRandomCrewMember() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const appearance = appearances[Math.floor(Math.random() * appearances.length)];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
	const attitude = attitudes[Math.floor(Math.random() * attitudes.length)];
	const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18; // Generate a random age between 18 and 60
    const cost = Math.floor(Math.random() * (9000 - 6000 + 1)) + 6000; // Generate a random cost between 6000 and 9000
	let stats = {
		Danger: 0,
		Tech: 0,
		Academic: 0,
		Leadership: 0,
		Stealth: 0,
		Charm: 0,
	};

	const statKeywords = {
		Danger: [
		  "scar", "tattoo", "rugged", "military", "armor",
		  "blade", "combat", "tactical", "HUD", "former pirate",
		  "former soldier", "thrill-seeker", "haunted", "surviving",
		  "desperate to prove their worth", "monk"
		],
		Tech: [
		  "cybernetic eye", "mechanical arm", "data port", "prosthetic leg",
		  "audio interface", "cybernetic enhancements", "nanotech mesh",
		  "neural jack", "HUD implants", "tech whiz", "knack for languages",
		  "engineering", "hacked", "talented healer", "hacking", "nanite",
		],
		Academic: [
		  "glasses", "glasses", "smart-sensor nodes",
		  "augmented reality", "holographic visor", "graphene suit",
		  "academic", "prodigy", "fascinated ", "enlightenment",
		  "lost cause devotion", "dreams of writing", "academia", "monk",
		],
		Leadership: [
		  "duty", "devoted", "cause", "escaped", "servitude", "sanctity",
		  "neatly dressed", "suit", "commanding presence", "helps others", "monk",
		],
		Charm: [
		  "warm", "smile", "bright", "contagious laugh", "healer",
		  "always looking for the next adventure", "eager", "passionate",
		  "seeks freedom", "sanctity"
		],
		Stealth: [
		  "grew up on the streets", "surviving through wit", "sleek, metallic finish",
		  "light-sensitive eye implants", "cheekbone-integrated comms interface"
		]
	  };

	  const combinedDescription = `${appearance} ${personality}`;

	  evaluateAndIncreaseStats(combinedDescription, statKeywords, stats);

	  

    return {
        name: `${firstName} ${lastName}`,
        appearance,
        personality,
		attitude,
		age,
		cost,
		morale: 7,
		stats: { ...stats },
    };
}

function evaluateAndIncreaseStats(description, statKeywords, stats) {
	for (const [stat, keywords] of Object.entries(statKeywords)) {
		keywords.forEach(keyword => {
			if (description.toLowerCase().includes(keyword)) {
				stats[stat]++;
			}
		});
	}
}

module.exports = { generateRandomCrewMember };