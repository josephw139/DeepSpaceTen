const { uniqueItems } = require('./miningResources');

// Activities: Shop, Build, Hangar, Mine, Research, Light_Scan, Deep_Scan
// Mining & Research Levels: None, Very_Low, Low, Medium, High, Very_High
// Mining: Ore, Gas, Titanium
// Research: Tech, Bio, Cosmic, Exotic
// Danger: Hazards - ["Crime", "Environmental", "Atmospheric", "Pirates", "Fauna", "Asteroids"]
// Danger Levels: 0 - 5

const sectors = {
  North: {
      description: "A vast expanse of uncharted territory filled with hidden dangers and ancient mysteries.",
      systems: [
          {
              name: "KulaniSystem",
              locations: [
                  { name: "Planet X", description: "A mysterious planet with unknown properties." },
                  { name: "Moon Y", description: "A small moon orbiting Planet X." },
              ]
          },
      ]
  },
  Northeast: {
      description: "Home to the thriving trade routes that connect the eastern colonies with the core worlds.",
      systems: []
  },
  East: {
      description: "Known for its rich asteroid fields and the fierce competition among mining corporations.",
      systems: []
  },
  Southeast: {
      description: "Multiple lightyears away from the fringes of U.C.S. space, the beginning of Frontier space to explore.",
      systems: [
          {
              name: "Argus' Beacon",
              description: "The closest region to civilized space, just on the edge of the Frontier. Named after Captain Argus, his ship lost in an FTL jump decades ago, only recently discovered by the U.C.S.",
              locations: [
                  {
                      name: "Orion Station",
                      description: "The first station built on the Frontier, serving as a refueling and jumping point for explorers.",
                      activities: ["Shop", "Build", "Hangar"],
                      light_scan: [],
                      deep_scan: [],
                      danger: {
                        level: 0,
                        hazards: [],
                      }
                  },
                  {
                      name: "Vaxas",
                      description: "A windswept and barren planet, the only one in the system with moons.",
                      activities: ["Mine", "Research"],
                      mining: {Ore: "Very_Low", Gas: "None", Titanium: "Low"},
                      research: {Tech: "None", Bio: "None", Cosmic: "Very_Low", Exotic: "None"},
                      unique_items: [
                        {
                          item: uniqueItems.rune_carved_stone,
                          adjustedChance: 1,
                        }
                      ],
                      light_scan: [],
                      deep_scan: [],
                      danger: {
                        level: 1,
                        hazards: ["Environmental"],
                      }
                  },
                  {
                    name: "Vaxas II",
                    description: "A forested moon orbiting Vaxas, with no apparant sapient life.",
                    activities: ["Research", "Mine"],
                    mining: {Ore: "Very_Low", Gas: "None", Titanium: "None"},
                    research: {Tech: "None", Bio: "Medium", Cosmic: "Very_Low", Exotic: "None"},
                    light_scan: [],
                    deep_scan: [],
                    danger: {
                      level: 1,
                      hazards: ["Fauna"],
                    }
                  },
                  {
                    name: "Epsilon Outpost",
                    description: "A research facility set up by the U.C.S. on Vaxas V, orbiting Vaxas.",
                    activities: ["Research", "Mine"],
                    mining: {Ore: "Very_Low", Gas: "None", Titanium: "None"},
                    research: {Tech: "Very_Low", Bio: "None", Cosmic: "Medium", Exotic: "None"},
                    light_scan: [],
                    deep_scan: [],
                    danger: {
                      level: 0,
                      hazards: [],
                    }
                  },
                  {
                    name: "G7",
                    description: "A gas giant, seventh planet from the Sun. A neverending storm crawls across a fifth of the planet.",
                    activities: ["Mine", "Research", ],
                    mining: {Ore: "None", Gas: "High", Titanium: "None"},
                    research: {Tech: "None", Bio: "None", Cosmic: "Low", Exotic: "Very_Low"},
                    light_scan: [],
                    deep_scan: [],
                    danger: {
                      level: 2,
                      hazards: ["Atmospheric"],
                    }
                  },
                  {
                    name: "A-357 Asteroid Belt",
                    description: "A mineral-rich belt of asteroids, orbiting the central Sun in the Beacon.",
                    activities: ["Mine", "Research"],
                    mining: {Ore: "Medium", Gas: "Low", Titanium: "Very_Low"},
                    research: {Tech: "None", Bio: "None", Cosmic: "Low", Exotic: "Very_Low"},
                    light_scan: [],
                    deep_scan: [],
                    unique_items: [
                      {
                        item: uniqueItems.rune_carved_stone,
                        adjustedChance: 0.05,
                      }
                    ],
                    danger: {
                      level: 1,
                      hazards: ["Asteroids"],
                    }
                  }
              ]
          }
      ]
  },
  // Add descriptions for other sectors and their systems as needed
  South: { description: "A description for the South sector", systems: [] },
  Southwest: { description: "A description for the Southwest sector", systems: [] },
  West: { description: "A description for the West sector", systems: [] },
  Northwest: { description: "A description for the Northwest sector", systems: [] },
  Center: { description: "A description for the Center sector", systems: [] }
};

// Example function to get the starting locations (in the Southeast Sector)
const getStartingLocations = () => {
  return sectors['Southeast'].systems[0].locations; // Adjusted to match the new structure
};

module.exports = { sectors };
