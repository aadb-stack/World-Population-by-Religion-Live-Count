// =============================================
// World Population by Religion – FINAL WORKING
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ---------------------------------------------
// Firebase Config
// ---------------------------------------------
const firebaseConfig = {
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootRef = ref(db, "/");
const previousDisplay = {};
const baseReligions = {};


// ---------------------------------------------
// Constants
// ---------------------------------------------
const secondsPerYear = 365 * 24 * 60 * 60;
const WORLD_GROWTH_RATE = 0.0085;

const religionShares = {
  christian: 2380000000 / 8180000000,
  islam: 2020000000 / 8180000000,
  hindu: 1200000000 / 8180000000,
  buddhism: 520000000 / 8180000000,
  sikhism: 30000000 / 8180000000,
  judaism: 15000000 / 8180000000,
  taoism: 12000000 / 8180000000,
  confucianism: 6000000 / 8180000000,
  jainism: 4500000 / 8180000000,
  shinto: 3000000 / 8180000000,
  unaffiliated: 1900000000 / 8180000000
};
// ---------------------------------------------
// Religion-specific growth rates (per year)
// ---------------------------------------------
const religionGrowthRates = {
  christian: 0.003,      // slow growth
  islam: 0.017,          // fast growth
  hindu: 0.010,
  buddhism: -0.002,      // declining
  sikhism: 0.008,
  judaism: 0.002,
  taoism: -0.004,
  confucianism: -0.003,
  jainism: 0.001,
  shinto: -0.006,        // declining
  unaffiliated: 0.012
};

// ---------------------------------------------
// Load Firebase Anchor
// ---------------------------------------------
async function loadBase() {
  const snapshot = await get(rootRef);

  if (!snapshot.exists()) {
    console.error("No Firebase data found");
    return;
  }

const { baseWorld, baseTimestamp } = snapshot.val();

// STEP 3: initialize base religion populations (ONCE)
for (const key in religionShares) {
  baseReligions[key] = baseWorld * religionShares[key];
}

startCounters(baseWorld, baseTimestamp);


// ---------------------------------------------
// Counter Logic
// ---------------------------------------------
function startCounters(baseWorld, baseTimestamp) {
  setInterval(() => {
    const elapsed = (Date.now() - baseTimestamp) / 1000;
    const world =
      baseWorld *
      Math.exp(WORLD_GROWTH_RATE * (elapsed / secondsPerYear));

    renderWorld(world);
    renderReligions(world);
  }, 1000);
}

// ---------------------------------------------
// Render
// ---------------------------------------------
function renderWorld(val) {
  const el = document.getElementById("world");
  if (!el) return;

  const display = Math.floor(val);
  const prev = previousDisplay.world ?? display;

  el.textContent = display.toLocaleString();

  el.style.color =
    display > prev ? "#00ff88" :
    display < prev ? "#ff4d4d" :
    "white";

  previousDisplay.world = display;
}

function renderReligions(world) {
  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

   const elapsedYears =
  (Date.now() - baseTimestamp) / (1000 * secondsPerYear);

const raw =
  baseReligions[key] *
  Math.exp(religionGrowthRates[key] * elapsedYears);

const display = Math.floor(raw);

    const prev = previousDisplay[key] ?? display;

    el.textContent = display.toLocaleString();

    el.style.color =
      display > prev ? "#00ff88" :
      display < prev ? "#ff4d4d" :
      "white";

    previousDisplay[key] = display;
  }
}


// ---------------------------------------------
// Run
// ---------------------------------------------
loadBase();
