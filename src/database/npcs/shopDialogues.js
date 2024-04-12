// Shopkeepers

function shopDialogue(locationName) {
    let shopDesc = ``;
    let shopName = ``;

    switch (locationName) {
        case 'Orion Station':
            shopDesc = orionString + orionShop[Math.floor(Math.random() * orionShop.length)];
            shopName = `Wixzys' Wares - Orion Station`;
            break;
    }

    return [shopName, shopDesc];
}

const orionShop = [
	`Stay away from the lower levels tonight, word around is things are getting rowdy."`,
	`How goes the Exploration? Find any neat planets, alien life, robots? There's gotta be robots out there somewhere, man."`,
	`Did you hear about the Conglomerate assassination? People are pointing fingers at the Martians."`
]
const orionString = `A large gray-skinned humanoid greets you with a great smile, "Welcome to Wixzys' Wares, Orion Station's premier shopping outlet! `


module.exports = { shopDialogue };