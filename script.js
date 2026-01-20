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
// Load Firebase Anchor
// ---------------------------------------------
async function loadBase() {
  const snapshot = await get(rootRef);

  if (!snapshot.exists()) {
    console.error("No Firebase data found");
    return;
  }

  const { baseWorld, baseTimestamp } = snapshot.val();
  startCounters(baseWorld, baseTimestamp);
}

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

  const current = Math.floor(val);
  const prev = previousDisplay.world ?? current;

  el.textContent = current.toLocaleString();

  if (current > prev) {
    el.style.color = "#00ff88"; // green
  } else if (current < prev) {
    el.style.color = "#ff4d4d"; // red (theoretical)
  } else {
    el.style.color = "#ffffff"; // white
  }

  previousDisplay.world = current;
}

function renderReligions(world) {
  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const current = Math.floor(world * religionShares[key]);
    const prev = previousDisplay[key] ?? current;

    el.textContent = current.toLocaleString();

    // EXACT behavior you want
    if (current > prev) {
      el.style.color = "#00ff88"; // increase
    } else if (current < prev) {
      el.style.color = "#ff4d4d"; // decrease
    } else {
      el.style.color = "#ffffff"; // NO CHANGE → WHITE
    }

    previousDisplay[key] = current;
  }
}

// ---------------------------------------------
// Run
// ---------------------------------------------
loadBase();
