import readline from "readline";

import User from "./spacetraders/user.js";
import {waitMs} from "./spacetraders/utils.js";

let running = true;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", () => {
	running = false;
});

const user = new User(process.env.token);

async function purchase(ship, good, quantity) {
	while(quantity > 0) {
		const amount = Math.min(ship.loadingSpeed, quantity);
		
		await user.my.newPurchaseOrder(ship.id, good, amount);

		quantity -= amount;
	}
}

async function sell(ship, good, quantity) {
	while(quantity > 0) {
		const amount = Math.min(ship.loadingSpeed, quantity);
		
		await user.my.newSellOrder(ship.id, good, amount);

		quantity -= amount;
	}
}

const ship = (await user.my.ships())[0];

while(running) {
	const creditsBefore = (await user.my.account()).credits;

	await purchase(ship, "METALS", ship.spaceAvailable);
	
	await waitMs((await user.my.newFlightPlan(ship.id, "OE-PM")).timeRemainingInSeconds * 1000);

	await sell(ship, "METALS", ship.spaceAvailable);

	await waitMs((await user.my.newFlightPlan(ship.id, "OE-PM-TR")).timeRemainingInSeconds * 1000);

	await purchase(ship, "FUEL", 3);

	const creditsMade = (await user.my.account()).credits - creditsBefore;

	console.log(`Done! Made ${creditsMade} credits!`);

	if(creditsMade <= 0) {
		console.log("Lost credits, aborting flight!");
		
		break;
	}
}

rl.close();

function log(obj) {
	console.dir(obj, {depth: null});
}

/*
Marketplaces

OE-PM-TR
[
  {
    symbol: 'FUEL',
    volumePerUnit: 1,
    pricePerUnit: 2,
    spread: 1,
    purchasePricePerUnit: 3,
    sellPricePerUnit: 1,
    quantityAvailable: 87271
  },
  {
    symbol: 'CONSTRUCTION_MATERIALS',
    volumePerUnit: 1,
    pricePerUnit: 140,
    spread: 4,
    purchasePricePerUnit: 144,
    sellPricePerUnit: 136,
    quantityAvailable: 11
  },
  {
    symbol: 'METALS',
    volumePerUnit: 1,
    pricePerUnit: 3,
    spread: 1,
    purchasePricePerUnit: 4,
    sellPricePerUnit: 2,
    quantityAvailable: 91789
  },
  {
    symbol: 'FUSION_REACTORS',
    volumePerUnit: 6,
    pricePerUnit: 20400,
    spread: 196,
    purchasePricePerUnit: 20596,
    sellPricePerUnit: 20204,
    quantityAvailable: 0
  }
]

OE-PM
[
  {
    symbol: 'DRONES',
    volumePerUnit: 1,
    pricePerUnit: 20,
    spread: 2,
    purchasePricePerUnit: 22,
    sellPricePerUnit: 18,
    quantityAvailable: 65214
  },
  {
    symbol: 'METALS',
    volumePerUnit: 1,
    pricePerUnit: 42,
    spread: 1,
    purchasePricePerUnit: 43,
    sellPricePerUnit: 41,
    quantityAvailable: 10
  },
  {
    symbol: 'TEXTILES',
    volumePerUnit: 1,
    pricePerUnit: 70,
    spread: 2,
    purchasePricePerUnit: 72,
    sellPricePerUnit: 68,
    quantityAvailable: 10
  },
  {
    symbol: 'CONSUMER_GOODS',
    volumePerUnit: 1,
    pricePerUnit: 105,
    spread: 4,
    purchasePricePerUnit: 109,
    sellPricePerUnit: 101,
    quantityAvailable: 14
  },
  {
    symbol: 'FUEL',
    volumePerUnit: 1,
    pricePerUnit: 9,
    spread: 1,
    purchasePricePerUnit: 10,
    sellPricePerUnit: 8,
    quantityAvailable: 64149
  },
  {
    symbol: 'BIOMETRIC_FIREARMS',
    volumePerUnit: 1,
    pricePerUnit: 80,
    spread: 12,
    purchasePricePerUnit: 92,
    sellPricePerUnit: 68,
    quantityAvailable: 22171
  }
]

OE-CR
[
  {
    symbol: 'TEXTILES',
    volumePerUnit: 1,
    pricePerUnit: 10,
    spread: 2,
    purchasePricePerUnit: 12,
    sellPricePerUnit: 8,
    quantityAvailable: 58429
  },
  {
    symbol: 'FOOD',
    volumePerUnit: 1,
    pricePerUnit: 5,
    spread: 1,
    purchasePricePerUnit: 6,
    sellPricePerUnit: 4,
    quantityAvailable: 66649
  },
  {
    symbol: 'PROTEIN_SYNTHESIZERS',
    volumePerUnit: 1,
    pricePerUnit: 355,
    spread: 22,
    purchasePricePerUnit: 377,
    sellPricePerUnit: 333,
    quantityAvailable: 0
  },
  {
    symbol: 'FUEL',
    volumePerUnit: 1,
    pricePerUnit: 9,
    spread: 1,
    purchasePricePerUnit: 10,
    sellPricePerUnit: 8,
    quantityAvailable: 59494
  }
]
*/