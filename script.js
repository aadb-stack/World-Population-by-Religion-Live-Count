// ================================
// World Population by Religion
// Firebase Server-Authoritative
// ================================

// 🔹 Firebase imports (v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Constants
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const WORLD_GROWTH_RATE = 0.0085;

// 🔹 Religion shares (static proportions)
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

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const statsRef = ref(db, "/stats");

// 🔹 Server anchor
let baseWorld = null;
let baseTimestamp = null;

// 🔹 Previous display cache
const previous = {
  world: null,
  religions: {}
};

// 🔹 Load anchor from Firebase
async function loadAnchor() {
  const snapshot = await get(statsRef);

  if (!snapshot.exists()) {
    console.error("No data found in Firebase");
    return;
  }

  const data = snapshot.val();

  baseWorld = Number(data.baseWorld);
  baseTimestamp = Number(data.baseTimestamp);

  console.log("Anchor loaded:", baseWorld, baseTimestamp);
}

// 🔹 Compute current world population
function computeWorldNow() {
  const now = Date.now();
  const elapsedSeconds = (now - baseTimestamp) / 1000;

  return Math.floor(
    baseWorld * (1 + WORLD_GROWTH_RATE * elapsedSeconds / SECONDS_PER_YEAR)
  );
}

// 🔹 Update DOM
function updateUI() {
  if (baseWorld === null || baseTimestamp === null) return;

  const worldNow = computeWorldNow();

  updateNumber("world", worldNow, "world");

  for (const key in religionShares) {
    const value = Math.floor(worldNow * religionShares[key]);
    updateNumber(key, value, key);
  }
}

// 🔹 Helper: animate color on change
function updateNumber(id, value, cacheKey) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value.toLocaleString();

  const prev = previous[cacheKey] ?? previous.religions[cacheKey];

  if (prev !== undefined && prev !== null) {
    el.style.color =
      value > prev ? "#00ff88" :
      value < prev ? "#ff4d4d" :
      "white";
  }

  if (cacheKey === "world") {
    previous.world = value;
  } else {
    previous.religions[cacheKey] = value;
  }
}

// 🔹 Boot
(async function start() {
  await loadAnchor();
  updateUI();
  setInterval(updateUI, 1000);
})();
