// Mining Levels: None, Very_Low, Low, Medium, High, Very_High
// Activities: Shop, Build, Hangar, Mine, Research

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
      description: "The cradle of civilization where the first interstellar jump was made, marking the dawn of a new era.",
      systems: [
          {
              name: "StarterSystem",
              description: "The starting point for all new adventurers, offering a safe haven and opportunities for those willing to explore.",
              locations: [
                  {
                      name: "Orion Station",
                      description: "A bustling trade hub orbiting a vibrant jungle planet.",
                      activities: ["Shop", "Build", "Hangar"]
                  },
                  {
                      name: "Epsilon Outpost",
                      description: "A remote research facility on a desolate moon.",
                      activities: ["Research", "Mine"],
                      mining: {Ore: "Very_Low", Gas: "None", Adamantium: "None"},
                  },
                  {
                      name: "G-357 Asteroid Belt",
                      description: "A mineral-rich belt of asteroids, promising wealth to those who dare to mine it.",
                      activities: ["Mine", "Research"],
                      mining: {Ore: "Medium", Gas: "Low", Adamantium: "Very_Low"},
                      research: "Low",
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
