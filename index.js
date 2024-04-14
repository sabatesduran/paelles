// Constants for the pan sizes and lites per kg of rice
const ratios = {
  70: 4.5,
  60: 3.5,
  50: 3,
};

// Original recipe quantities for 6 people
const originalRecipe = {
  arros: 600, // in grams
  fumet_de_peix: 1, // in liters
  calamar_gran: 1, // in units
  sipia_gran: 1, // in units
  gambons: 12, // in units
  nyora: 1, // in units
  ceba_de_figueres: 1, // in units
  tomàquet_de_pera_madur: 3, // in units
  grills_all: 2, // in units
  pebre_vermell_dolç: 1, // in dessertspoon
  zafrà: 1, // in infusion packet or pinch
  oli: "Al gust", // to taste
  sal: "Al gust", // to taste
};

const ingredientEmojis = {
  Arros: "🌾",
  "Fumet de peix": "🐟",
  "Calamar gran": "🦑",
  "Sipia gran": "🦑",
  Gambons: "🦐",
  Nyora: "🌶️",
  "Ceba morada": "🧅",
  "Tomaquet de pera madur": "🍅",
  Alls: "🧄",
  "Pebre vermell dolç": "🌶️",
  Zafrà: "🌼",
  Oli: "🫒",
  Sal: "🧂",
};

function sanitizeIngredientName(ingredientName) {
  return (
    ingredientName
      // Replace underscores with spaces
      .replace(/_/g, " ")
      // Capitalize the first letter of the string
      .replace(/^./, (str) => str.toUpperCase())
  );
}

function calculateIngredients(panSize, numPeople) {
  const ingredients = {};

  // Calculate the amount of rice for the number of people
  const ricePerPerson = originalRecipe.arros / 6;
  const totalRice = ricePerPerson * numPeople;

  // Convert the total rice in grams to kilograms for the ratio calculation
  const totalRiceInKg = totalRice / 1000;

  // Determine the ratio for the specific pan size
  const ratio = ratios[panSize];

  // Calculate the total fumet based on the ratio and the total rice in kilograms
  const totalFumet = totalRiceInKg * ratio;

  // Loop through all ingredients, adjusting their quantities
  for (const ingredient in originalRecipe) {
    let quantity = originalRecipe[ingredient];

    if (typeof quantity === "number") {
      if (ingredient === "arros") {
        quantity = totalRice;
      } else if (ingredient === "fumet_de_peix") {
        quantity = totalFumet;
      } else {
        quantity = (quantity / 6) * numPeople;
      }

      // Define a helper function to determine the correct unit based on the quantity
      const unit = (qty, single, plural) => (qty === 1 ? single : plural);

      // Special handling for specific ingredients
      if (ingredient === "arros") {
        if (quantity >= 1000) {
          quantity = `${(quantity / 1000).toFixed(2)} kg`;
        } else {
          quantity =
            `${Math.round(quantity)} ${unit(quantity, "gram", "grams")}`;
        }
      } else if (ingredient === "pimenton_dulce") {
        quantity =
          `${Math.round(quantity)} ${unit(quantity, "cullerada de postre", "cullerades de postre")}`;
      } else if (ingredient === "zafrà") {
        quantity =
          `${Math.round(quantity)} ${unit(quantity, "infusió", "infusions")}`;
      } else if (ingredient === "fumet_de_peix") {
        quantity = `${quantity.toFixed(2)} litres`;
      } else {
        quantity = Math.round(quantity);
        quantity += ` ${unit(quantity, "unitat", "unitats")}`;
      }
    } else {
      // For 'Al gust' ingredients, we don't need to calculate quantities
      quantity = "Al gust";
    }

    ingredients[sanitizeIngredientName(ingredient)] = quantity;
  }

  return ingredients;
}

function calculate() {
  const panSize = document.getElementById("paellaSize").value;
  const numPeople = Number.parseInt(document.getElementById("persons").value, 10);

  // Perform the calculation
  const recipe = calculateIngredients(panSize, numPeople);

  // Populate the recipe list
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = ""; // Clear the list first

  for (const [ingredient, quantity] of Object.entries(recipe)) {
    const ingredientName = sanitizeIngredientName(ingredient);

    // Create a card element for each ingredient
    const card = document.createElement("div");
    card.className =
      "p-4 bg-white rounded-lg border shadow-sm flex items-center justify-between";

    const nameElement = document.createElement("span");
    nameElement.className = "text-lg font-medium";
    nameElement.textContent = ingredientName;

    const quantityElement = document.createElement("span");
    quantityElement.className = "text-lg text-blue-600";
    quantityElement.textContent = quantity;

    card.appendChild(nameElement);
    card.appendChild(quantityElement);

    // Append the card to the recipe list container
    recipeList.appendChild(card);
  }
}

function shareText(panSize, numPeople) {
  const ingredients = calculateIngredients(panSize, numPeople);
  let recipeText = `🥘 Paella de marisc:\n
Persones: ${numPeople}
Mida paella: ${panSize} cm:\n
Ingredients:\n`;
  const ingridients = Object.keys(ingredients)
    .map(
      (key) => `${ingredientEmojis[key] || "🥘"} ${key}: ${ingredients[key]}`
    )
    .join("\n");
  recipeText += ingridients;

  recipeText += "\n👩‍🍳 Bon profit!";
  const baseURL = "https://paelles.vercel.app/";
  const queryParams = `persones=${numPeople}&mida_paella=${panSize}`;

  recipeText += `\n\nGenerat amb ${baseURL}?${queryParams}`;

  return recipeText.trim();
}

// Event listeners

document.getElementById("paellaSize").addEventListener("change", () => {
  calculate();
});

document.getElementById("persons").addEventListener("change", () => {
  calculate();
});

document.getElementById("shareButton").addEventListener("click", () => {
  const panSize = document.getElementById("paellaSize").value;
  const numPeople = Number.parseInt(
    document.getElementById("persons").value,
    10
  );
  const recipeText = shareText(panSize, numPeople);

  if (navigator.share) {
    navigator
      .share({
        title: "Calculadora de Paella de marisc",
        text: recipeText,
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
  } else {
    navigator.clipboard
      .writeText(recipeText)
      .then(() => {
        alert("Copiat al porta-retalls!");
      })
      .catch((error) => {
        console.error("Error copying text:", error);
        alert("Error copiant al porta-retalls.");
      });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const validPanSizes = ["70", "60", "50"]; // List of valid pan sizes
  const defaultPanSize = "70"; // Default pan size
  const defaultNumPeople = 6; // Default number of people

  // Function to get parameters from URL or set to default
  function getQueryParam(param, defaultValue, validValues = null) {
    const urlParams = new URLSearchParams(window.location.search);
    let value = urlParams.get(param);
    if (validValues && !validValues.includes(value)) {
      value = defaultValue;
    }
    return value || defaultValue;
  }

  // Get pan size and number of people from URL with validation
  const panSize = getQueryParam("mida_paella", defaultPanSize, validPanSizes);
  const numPeople = getQueryParam("persones", defaultNumPeople);

  // Set the form inputs
  document.getElementById("paellaSize").value = panSize;
  document.getElementById("persons").value = numPeople;

  // Initial calculation
  calculate();
});
