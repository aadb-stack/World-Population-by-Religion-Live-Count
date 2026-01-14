// =============================================
// Time-Aware Population Counter
// - Continues growth even when tab is closed
// - Uses timestamps instead of freezing
// =============================================

const secondsPerYear = 365 * 24 * 60 * 60;

// ---- Default Values (only first visit) ----
const defaultWorld = 8180000000;

const defaultReligions = {
  christian: 2380000000,
  islam: 2020000000,
  hindu: 1200000000,

  buddhism: 520000000,
  judaism: 15000000,
  sikhism: 30000000,
  taoism: 12000000,
  confucianism: 6000000,
  jainism: 4500000,
  shinto: 3000000,

  unaffiliated: 1900000000
};

// ---- Growth Rates (per year) ----
const growthRates = {
  world: 0.0085,

  christian: 0.008,
  islam: 0.021,
  hindu: 0.011,

  buddhism: -0.0025,
  judaism: 0.003,
  sikhism: 0.010,
  taoism: -0.004,
  confucianism: -0.004,
  jainism: 0.001,
  shinto: -0.005,

  unaffiliated: 0.012
};

// =============================================
// LOAD SAVED DATA
// =============================================
let worldPopulation = parseFloat(localStorage.getItem("worldPopulation")) || defaultWorld;
let religions = JSON.parse(localStorage.getItem("religions")) || { ...defaultReligions };

// Last time user was on page
let lastTimestamp = parseInt(localStorage.getItem("lastTimestamp")) || Date.now();

// Store previous displayed values (for colors)
let previousDisplay = JSON.parse(localStorage.getItem("previousDisplay")) || {};

// =============================================
// APPLY "BACKGROUND" GROWTH
// =============================================

const now = Date.now();
const elapsedSeconds = (now - lastTimestamp) / 1000;

// Apply growth for time away
worldPopulation += worldPopulation * (growthRates.world * elapsedSeconds / secondsPerYear);

for (let key in religions) {
  religions[key] += religions[key] * (growthRates[key] * elapsedSeconds / secondsPerYear);
}

// Initialize previous display values
previousDisplay.world = Math.floor(worldPopulation);
for (let key in religions) {
  previousDisplay[key] = Math.floor(religions[key]);
}

// =============================================
// UPDATE FUNCTION (LIVE)
// =============================================
function updateCounters() {

  // ---- WORLD ----
  worldPopulation += worldPopulation * (growthRates.world / secondsPerYear);
  const worldEl = document.getElementById("world");

  if (worldEl) {
    const currentWorld = Math.floor(worldPopulation);
    worldEl.textContent = currentWorld.toLocaleString();

    if (currentWorld > previousDisplay.world) {
      worldEl.style.color = "#00ff88";
    } else if (currentWorld < previousDisplay.world) {
      worldEl.style.color = "#ff4d4d";
    } else {
      worldEl.style.color = "white";
    }

    previousDisplay.world = currentWorld;
  }

  // ---- RELIGIONS ----
  for (let key in religions) {

    religions[key] += religions[key] * (growthRates[key] / secondsPerYear);
    const el = document.getElementById(key);
    if (!el) continue;

    const current = Math.floor(religions[key]);
    el.textContent = current.toLocaleString();

    if (current > previousDisplay[key]) {
      el.style.color = "#00ff88";
    } else if (current < previousDisplay[key]) {
      el.style.color = "#ff4d4d";
    } else {
      el.style.color = "white";
    }

    previousDisplay[key] = current;
  }

  // ---- SAVE STATE ----
  localStorage.setItem("worldPopulation", worldPopulation);
  localStorage.setItem("religions", JSON.stringify(religions));
  localStorage.setItem("previousDisplay", JSON.stringify(previousDisplay));
  localStorage.setItem("lastTimestamp", Date.now());
}

// ---- RUN ----
setInterval(updateCounters, 1000);
updateCounters();














