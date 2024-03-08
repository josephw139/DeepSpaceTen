const { calculateWeight } = require('./playerFuncs.js');
const db = require('./db.js');


// Remove from Active Ship Inventory (used in Hanger DEPOSIT)
function removeItemFromShipInventory(playerId, fleet, activeShip, itemName, quantityToRemove) {
    // Find the ship and item
    const shipIndex = fleet.ships.findIndex(s => s.name === activeShip.name);
    const ship = fleet.ships[shipIndex];
    const itemIndex = ship.inventory.findIndex(i => i.name === itemName);
    if (itemIndex === -1) return null; // Item not found
    
    const item = ship.inventory[itemIndex];

    const quantity = quantityToRemove !== null ? quantityToRemove : item.quantity;

    if (item.quantity < quantity) return null; // Not enough quantity
    console.log("Fleet:");
    // Adjust quantity or remove item from inventory
    if (item.quantity > quantity) {
        ship.inventory[itemIndex] = {
            ...item,
            quantity: item.quantity - quantity,
            weight: calculateWeight(item.name, item.quantity - quantity)
        };
        
        console.log(fleet);
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
        // Return a new object representing the removed portion
        return {
            ...item,
            quantity: quantity,
            weight: calculateWeight(item.name, quantity)
        };
    } else {
        // Remove the item entirely if quantity matches
        fleet.ships[shipIndex].inventory.splice(itemIndex, 1);
        console.log(fleet);
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
        return item; // Item matches the quantity to remove, so return it as is
    }
}


// Adds an item to the Hangar
function updateHangar(playerId, hangar, itemToAdd) {
    // Check if the item already exists in the hangar
    const itemIndex = hangar.findIndex(item => item.name === itemToAdd.name);

    if (itemIndex !== -1) {
        // Item exists, update its quantity and weight
        hangar[itemIndex].quantity += itemToAdd.quantity;
        hangar[itemIndex].weight += itemToAdd.weight;
    } else {
        // Item does not exist, add it as a new entry
        hangar.push(itemToAdd);
    }

    console.log("Updated Hangar:");
    console.log(hangar);
    db.player.set(`${playerId}`, hangar, "hangar");
}

// Removes item from Hangar (used in Hangar WITHDRAW)
function withdrawItemFromHangar(playerId, hangar, itemName, quantityToRemove) {
    // Check if the item exists in the hangar
    const itemIndex = hangar.findIndex(item => item.name === itemName);
    if (itemIndex === -1) return null; // Item not found

    const item = hangar[itemIndex];

    // Determine the quantity to withdraw
    const quantity = quantityToRemove !== null ? Math.min(quantityToRemove, item.quantity) : item.quantity;

    // Adjust or remove item from hangar
    if (item.quantity > quantity) {
        hangar[itemIndex].quantity -= quantity;
        hangar[itemIndex].weight -= calculateWeight(item.name, quantity);
    } else {
        hangar.splice(itemIndex, 1); // Remove the item if all of it is withdrawn
    }

    // Update the hangar in the database
    db.player.set(`${playerId}`, hangar, "hangar");

    return {
        ...item,
        quantity, // Return the actual quantity withdrawn
    };
}

// Adds item to Ship Inventory
function addItemToShipInventory(playerId, fleet, activeShip, itemToAdd) {
    const ship = fleet.ships.find(s => s.name === activeShip.name);
    const itemIndex = ship.inventory.findIndex(i => i.name === itemToAdd.name);

    if (itemIndex !== -1) {
        // Item exists in ship's inventory, update quantity
        ship.inventory[itemIndex].quantity += itemToAdd.quantity;
        ship.inventory[itemIndex].weight += itemToAdd.weight;
    } else {
        // Item does not exist, add it
        ship.inventory.push(itemToAdd);
    }

    // Update the fleet in the database
    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
}


module.exports = { removeItemFromShipInventory, updateHangar, withdrawItemFromHangar, addItemToShipInventory };
