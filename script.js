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
const previousRaw = {};

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

  const prev = previousRaw.world ?? val;

  el.textContent = Math.floor(val).toLocaleString();

  if (val > prev) {
    el.style.color = "#00ff88";
  } else if (val < prev) {
    el.style.color = "#ff4d4d";
  } else {
    el.style.color = "#ffffff";
  }

  previousRaw.world = val;
}


function renderReligions(world) {
  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const raw = world * religionShares[key];
    const prev = previousRaw[key] ?? raw;

    el.textContent = Math.floor(raw).toLocaleString();

    // Compare RAW values, not rounded ones
    if (raw > prev) {
      el.style.color = "#00ff88"; // increase
    } else if (raw < prev) {
      el.style.color = "#ff4d4d"; // decrease
    } else {
      el.style.color = "#ffffff"; // truly no change
    }

    previousRaw[key] = raw;
  }
}

// ---------------------------------------------
// Run
// ---------------------------------------------
loadBase();
