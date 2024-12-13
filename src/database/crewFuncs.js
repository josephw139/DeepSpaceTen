const { firstNames, lastNames, appearances, personalities, attitudes, careers } = require('./npcs/npcTraits.js');


function generateRandomCrewMember() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const appearance = appearances[Math.floor(Math.random() * appearances.length)];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
	const attitude = attitudes[Math.floor(Math.random() * attitudes.length)];
	const career = careers[Math.floor(Math.random() * careers.length)];
	const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18; // Generate a random age between 18 and 60
    const cost = Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000; // Generate a random cost between 20000 and 30000
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

	  const careerStats = {
		Danger: [
			"Asteroid Miner", "Exosuit Designer", "Starship Scrubber", "Deep Space Explorer",
			"Zero-G Construction Worker", "Warp Drive Mechanic", "Extraterrestrial Rights Activist",
			"Quantum Engineer", "Cryonics Technician", "Wildlife Biologist", "Forensic Scientist"
		],
		Tech: [
			"Quantum Engineer", "Cyber Security Analyst", "Robotics Technician",
			"Artificial Intelligence Programmer", "Data Scientist", "Nanotechnologist",
			"Genetic Modification Engineer", "Quantum Physicist", "Theoretical Physicist",
			"Holographic Designer", "Virtual Reality Architect", "Communication Specialist",
			"Computing Analyst"
		],
		Academic: [
			"Researcher", "Quantum Physicist", "Exobiologist", "Planetary Geologist",
			"Astrobiologist", "Historian", "Geologist", "Environmental Scientist",
			"Geneticist", "Meteorologist", "Oceanographer", "Galactic Historian",
			"Astrophysics Researcher", "Linguist", "Psychologist"
		],
		Leadership: [
			"Ambassador", "Operations Research Analyst", "Marketing Executive",
			"Human Resources Manager", "Venture Capitalist", "Lawyer", "Diplomat",
			"Logistics Manager", "Pilot", "Space Station Crew Coordinator",
			"Business Consultant", "Chief Executive Officer", "Military General"
		],
		Charm: [
			"Performance Artist", "Sommelier", "Teacher", "Public Relations Specialist",
			"Flight Attendant", "Salesperson", "Art Director", "Interior Designer",
			"Space Tourism Guide", "Clinical Psychologist", "Host"
		],
		Stealth: [
			"Cryonics Technician", "Zero-G Construction Worker", "Spy", "Data Analyst",
			"Investment Banker", "Jeweler", "Security Consultant", "Smuggler"
		]
	};
	

	  const combinedDescription = `${appearance} ${personality}`;


	  // Adjust stats based on the selected career
	  Object.keys(careerStats).forEach(statCategory => {
        if (careerStats[statCategory].includes(career)) {
            stats[statCategory] += 1; // Increment the stat by 1 for matching careers
        }
      });

	  evaluateAndIncreaseStats(combinedDescription, statKeywords, stats);

	  

    return {
        name: `${firstName} ${lastName}`,
        appearance,
        personality,
		attitude,
		career,
		age,
		cost,
		morale: 7,
		stats: { ...stats },
		health: 10,
		armor_rating: 0,
		equipment: {
			weapon: {},
			armor: {},
			suit: {},
			utility: {},
		}
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