// =============================================
// World Population by Religion – FINAL WORKING
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
let GLOBAL_BASE_TIMESTAMP = 0;

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
const CLEAN_WORLD = 8271000000;

const religionShares = {
  christian: 2400000000 / CLEAN_WORLD,   // 2.40 B
  islam: 2040000000 / CLEAN_WORLD,       // 2.04 B
  hindu: 1210000000 / CLEAN_WORLD,       // 1.21 B
  buddhism: 520000000 / CLEAN_WORLD,     // keep as is
  sikhism: 30000000 / CLEAN_WORLD,
  judaism: 15000000 / CLEAN_WORLD,
  taoism: 12000000 / CLEAN_WORLD,
  confucianism: 6000000 / CLEAN_WORLD,
  jainism: 4500000 / CLEAN_WORLD,
  shinto: 3000000 / CLEAN_WORLD,
  unaffiliated: 1900000000 / CLEAN_WORLD
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
  GLOBAL_BASE_TIMESTAMP = baseTimestamp;

  for (const key in religionShares) {
    baseReligions[key] = baseWorld * religionShares[key];
  }

  startCounters(baseWorld, baseTimestamp);
} // 👈 THIS was missing



// ---------------------------------------------
// Counter Logic
// ---------------------------------------------
function startCounters(baseWorld, baseTimestamp) {
  setInterval(() => {
    const elapsedYears =
      (Date.now() - baseTimestamp) / (1000 * secondsPerYear);

    const world =
      baseWorld *
      Math.exp(WORLD_GROWTH_RATE * elapsedYears);

    renderWorld(world);
    renderReligions(elapsedYears);
  }, 1000);
} // ✅ startCounters closed

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

function renderReligions(elapsedYears) {
  if (!GLOBAL_BASE_TIMESTAMP || !baseReligions.christian) return;

  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

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
