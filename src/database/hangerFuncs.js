const { resources } = require('./locationResources.js');
const db = require('./db.js');


// Remove from Active Ship Inventory (used in Hanger DEPOSIT)
function removeItemFromShipInventory(playerId, fleet, activeShip, itemName, quantityToRemove, hangar=null) {
    // Find the ship and item
    const shipIndex = fleet.ships.findIndex(s => s.name === activeShip.name);
    const ship = fleet.ships[shipIndex];
    let itemIndex = ship.inventory.findIndex(i => i.name === itemName);
    let isLab = false;
    if (itemIndex === -1) {
        itemIndex = ship.lab.findIndex(i => i.name === itemName);
        if (itemIndex === -1) {
            return null; // Item not found
        }
        isLab = true;
        if (hangar == "hangar") return 10;
        // Hangar is a string passed in the /hangar command to determine the source of the function call
        // If someone is trying to deposit Research, stop them and return 10. 10 is arbitrary.
    }
    
    const item = isLab ? ship.lab[itemIndex] : ship.inventory[itemIndex];

    const quantity = quantityToRemove !== null ? quantityToRemove : item.quantity;

    if (item.quantity < quantity) return null; // Not enough quantity
    // console.log("Fleet:");
    // Adjust quantity or remove item from inventory
    if (item.quantity > quantity) {

        let objectWeight;
        let weightAdjusted;
        try {
            objectWeight = resources[item.description][item.name].weight;
            weightAdjusted = Math.floor((item.quantity - quantity) * objectWeight);
        } catch (err) {
            //console.error("Error fetching item weight:", err);
            objectWeight = item.weight / item.quantity; // Fallback to per unit weight based on current data
            weightAdjusted = Math.floor((item.quantity - quantity) * objectWeight);
        }

        const updatedItem = {
            ...item,
            quantity: item.quantity - quantity,
            weight: weightAdjusted
        };

        if (isLab) {
            ship.lab[itemIndex] = updatedItem;
        } else {
            ship.inventory[itemIndex] = updatedItem;
        }

        console.log(`Updated item in inventory:`, updatedItem);
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");

        // Return a new object representing the removed portion
        return {
            ...item,
            quantity: quantity,
            weight: Math.floor(objectWeight * quantity)
        };
    } else {
        // Remove the item entirely if quantity matches
        if (isLab) {
            fleet.ships[shipIndex].lab.splice(itemIndex, 1);
        } else {
            fleet.ships[shipIndex].inventory.splice(itemIndex, 1);
        }
        
        // console.log(fleet);
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

    //console.log("Updated Hangar:");
    //console.log(hangar);
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

        let objectWeight;
        let weightAdjusted;
        try {
            objectWeight = resources[item.description][item.name].weight;
            weightAdjusted = Math.floor((item.quantity - quantity) * objectWeight);
        } catch (err) {
            //console.error("Error fetching item weight:", err);
            objectWeight = item.weight / item.quantity; // Fallback to per unit weight based on current data
            weightAdjusted = Math.floor((item.quantity - quantity) * objectWeight);
        }

        hangar[itemIndex].quantity -= quantity;
        hangar[itemIndex].weight -= weightToRemove;
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
