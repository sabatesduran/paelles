const ratios = { 50: 3, 60: 3.5, 70: 4.5 };

const originalRecipe = {
  arròs: 600,
  fumet_de_peix: 1,
  calamar_gran: 1,
  sipia_gran: 1,
  gambons: 12,
  escopinyes: 200,
  cloïsses: 200,
  nyora: 1,
  ceba_de_figueres: 1,
  tomàquet_de_pera_madur: 3,
  grills_d_all: 2,
  pebre_vermell_dolç: 1,
  zafrà: 1,
  oli: "Al gust",
  sal: "Al gust",
};

const ingredientEmojis = {
  Arròs: "🌾", "Fumet de peix": "🐟", "Calamar gran": "🦑", "Sipia gran": "🦑",
  Gambons: "🦐", Escopinyes: "🐚", Cloïsses: "🐚", Nyora: "🌶️",
  "Ceba de figueres": "🧅", "Tomàquet de pera madur": "🍅", "Grills d'all": "🧄",
  "Pebre vermell dolç": "🌶️", Zafrà: "🌼", Oli: "🫒", Sal: "🧂",
};

const numberFormat = new Intl.NumberFormat("ca-ES", { maximumFractionDigits: 2 });
const plural = (quantity, singular, multiple) => (quantity === 1 ? singular : multiple);
const displayName = (name) => name.replace(/_/g, " ").replace("d all", "d'all").replace(/^./, (letter) => letter.toUpperCase());
const wholeIngredients = {
  calamar_gran: ["calamar gran", "calamars grans"],
  sipia_gran: ["sípia gran", "sípies grans"],
  gambons: ["gambó", "gambons"],
  nyora: ["nyora", "nyores"],
  grills_d_all: ["grill d'all", "grills d'all"],
};
const halfIngredients = {
  ceba_de_figueres: ["ceba de Figueres", "cebes de Figueres"],
  tomàquet_de_pera_madur: ["tomàquet de pera madur", "tomàquets de pera madurs"],
};

function formatHalves(quantity) {
  const rounded = Math.round(quantity * 2) / 2;
  return rounded % 1 === 0.5 ? `${Math.floor(rounded) || ""}½` : numberFormat.format(rounded);
}

function formatIngredient(name, quantity) {
  if (typeof quantity !== "number") return "Al gust";

  if (["arròs", "escopinyes", "cloïsses"].includes(name)) {
    const grams = Math.round(quantity / 25) * 25;
    return grams >= 1000
      ? `${numberFormat.format(grams / 1000)} kg`
      : `${numberFormat.format(grams)} ${plural(grams, "gram", "grams")}`;
  }
  if (name === "fumet_de_peix") {
    const litres = Math.round(quantity * 10) / 10;
    return `${numberFormat.format(litres)} ${plural(litres, "litre", "litres")}`;
  }
  if (wholeIngredients[name]) {
    const units = Math.ceil(quantity);
    return `${units} ${plural(units, ...wholeIngredients[name])}`;
  }
  if (halfIngredients[name]) {
    const units = Math.round(quantity * 2) / 2;
    return `${formatHalves(units)} ${plural(units, ...halfIngredients[name])}`;
  }
  if (name === "pebre_vermell_dolç") {
    const spoons = Math.round(quantity * 2) / 2;
    return `${formatHalves(spoons)} ${plural(spoons, "cullerada de postres", "cullerades de postres")}`;
  }
  if (name === "zafrà") {
    const pinches = Math.round(quantity * 2) / 2;
    return `${formatHalves(pinches)} ${plural(pinches, "pessic", "pessics")}`;
  }
  return `${numberFormat.format(quantity)} ${plural(quantity, "unitat", "unitats")}`;
}

function calculateIngredients(panSize, people) {
  const rice = (originalRecipe.arròs / 6) * people;
  const recipe = {};

  for (const [name, originalQuantity] of Object.entries(originalRecipe)) {
    let quantity = originalQuantity;
    if (typeof quantity === "number") {
      quantity = name === "arròs" ? rice : name === "fumet_de_peix" ? (rice / 1000) * ratios[panSize] : (quantity / 6) * people;
    }
    recipe[displayName(name)] = formatIngredient(name, quantity);
  }

  return recipe;
}

function selectedPeople() {
  const input = document.getElementById("persons");
  const people = Number.parseInt(input.value, 10);
  return Number.isFinite(people) ? Math.min(40, Math.max(2, people)) : 6;
}

function syncUrl(panSize, people) {
  const url = new URL(window.location.href);
  url.searchParams.set("mp", panSize);
  url.searchParams.set("p", people);
  window.history.replaceState({}, "", url);
}

function updatePanButtons(panSize) {
  document.querySelectorAll(".pan-option").forEach((button) => {
    const active = button.dataset.size === panSize;
    button.classList.toggle("border-orange-600", active);
    button.classList.toggle("bg-orange-50", active);
    button.classList.toggle("text-orange-800", active);
    button.classList.toggle("border-stone-200", !active);
    button.classList.toggle("text-stone-600", !active);
    button.setAttribute("aria-pressed", active);
  });
}

function calculate() {
  const panSize = document.getElementById("paellaSize").value;
  const people = selectedPeople();
  const recipe = calculateIngredients(panSize, people);

  document.getElementById("persons").value = people;
  document.getElementById("riceSummary").textContent = recipe.Arròs;
  document.getElementById("stockSummary").textContent = recipe["Fumet de peix"];
  document.getElementById("recipeSubtitle").textContent = `Per a ${people} ${plural(people, "persona", "persones")} amb paellera de ${panSize} cm.`;
  updatePanButtons(panSize);
  syncUrl(panSize, people);

  const recipeList = document.getElementById("recipeList");
  recipeList.replaceChildren(...Object.entries(recipe).map(([ingredient, quantity]) => {
    const item = document.createElement("li");
    item.className = "flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3";
    item.innerHTML = `<span class="flex min-w-0 items-center gap-3"><span class="text-xl" aria-hidden="true">${ingredientEmojis[ingredient] || "🥘"}</span><span class="font-medium text-stone-700">${ingredient}</span></span><span class="shrink-0 rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-orange-700 shadow-sm">${quantity}</span>`;
    return item;
  }));
}

function shareText(panSize, people) {
  const ingredients = calculateIngredients(panSize, people);
  const list = Object.entries(ingredients)
    .map(([ingredient, quantity]) => `${ingredientEmojis[ingredient] || "🥘"} ${ingredient}: ${quantity}`)
    .join("\n");
  return `🥘 Paella de marisc\n\nPersones: ${people}\nMida de la paellera: ${panSize} cm\n\nIngredients:\n${list}\n\nBon profit!\n${window.location.href}`;
}

async function shareRecipe() {
  const panSize = document.getElementById("paellaSize").value;
  const people = selectedPeople();
  const text = shareText(panSize, people);

  if (navigator.share) {
    await navigator.share({ title: "Paella de marisc", text });
    return;
  }

  await navigator.clipboard.writeText(text);
  const label = document.getElementById("shareLabel");
  label.textContent = "Copiat al porta-retalls";
  window.setTimeout(() => { label.textContent = "Compartir compra"; }, 1800);
}

function initialize() {
  document.getElementById("paellaSize").addEventListener("change", calculate);
  document.getElementById("persons").addEventListener("change", calculate);
  document.getElementById("decreasePersons").addEventListener("click", () => { document.getElementById("persons").value = selectedPeople() - 1; calculate(); });
  document.getElementById("increasePersons").addEventListener("click", () => { document.getElementById("persons").value = selectedPeople() + 1; calculate(); });
  document.querySelectorAll(".person-preset").forEach((button) => button.addEventListener("click", () => { document.getElementById("persons").value = button.dataset.persons; calculate(); }));
  document.querySelectorAll(".pan-option").forEach((button) => button.addEventListener("click", () => { document.getElementById("paellaSize").value = button.dataset.size; calculate(); }));
  document.getElementById("shareButton").addEventListener("click", () => { shareRecipe().catch(() => { document.getElementById("shareLabel").textContent = "No s'ha pogut compartir"; }); });

  const params = new URLSearchParams(window.location.search);
  const panSize = ratios[params.get("mp")] ? params.get("mp") : "70";
  document.getElementById("paellaSize").value = panSize;
  document.getElementById("persons").value = params.get("p") || 6;
  calculate();
}

if (typeof document !== "undefined") initialize();
if (typeof module !== "undefined") module.exports = { calculateIngredients };
