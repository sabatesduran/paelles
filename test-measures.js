const assert = require("node:assert/strict");
const { calculateIngredients } = require("./index.js");

const recipe = calculateIngredients("70", 10);

assert.equal(recipe.Nyora, "2 nyores");
assert.equal(recipe["Ceba de figueres"], "1½ cebes de Figueres");
assert.equal(recipe.Arròs, "1 kg");
assert.equal(recipe["Fumet de peix"], "4,5 litres");
