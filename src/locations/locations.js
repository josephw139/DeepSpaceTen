// Mining Levels: None, Very_Low, Low, Medium, High, Very_High

const sectors = {
    North: [
      {
        name: "KulaniSystem",
        locations: [
          { name: "Planet X", description: "A mysterious planet with unknown properties." },
          { name: "Moon Y", description: "A small moon orbiting Planet X." },
          
        ]
      },
      
    ],
    Northeast: [],
    East: [],
    Southeast: [
      {
        name: "StarterSystem",
        locations: [
          {
            name: "Orion Station",
            description: "A bustling trade hub orbiting a vibrant jungle planet.",
            activities: ["Shop", "Trade", "Build"]
          },
          {
            name: "Epsilon Outpost",
            description: "A remote research facility on a desolate moon.",
            activities: ["Trade", "Research"]
          },
          {
            name: "G-357 Asteroid Belt",
            description: "A mineral rich belt of asteroids.",
            activities: ["Mine", "Research"],
            mining: {Ore: "Medium", Gas: "Low", Adamantium: "Very_Low"},
            research: "Low",
          }
        ]
      }
    ],
    South: [],
    Southwest: [],
    West: [],
    Northwest: [],
    Center: []
  };
  
  // Example function to get the starting locations (in the Southeast Sector)
  const getStartingLocations = () => {
    return sectors['Southeast'][0].locations; // Gets the locations of the first system in Southeast
  };
  
  module.exports = { sectors };
  