// ================================
// CLEAN, MINIMAL, DETERMINISTIC VERSION
// ================================

const { initializeApp, getDatabase, ref, get } = window.firebaseModules;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 🔹 READ ONLY world seed
const worldRef = ref(database, "world");

// Time constants
const secondsPerYear = 365 * 24 * 60 * 60;
const worldGrowthRate = 0.0085;

// Religion shares (sum ≈ 1)
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

// Global state (ONLY world)
let worldPopulation = 0;

// Deterministic split
function splitReligions(worldInt) {
  const raw = Object.entries(religionShares).map(([k, s]) => ({
    k,
    v: worldInt * s
  }));

  const floored = raw.map(r => ({
    k: r.k,
    v: Math.floor(r.v),
    f: r.v - Math.floor(r.v)
  }));

  let remainder =
    worldInt - floored.reduce((a, b) => a + b.v, 0);

  floored.sort((a, b) => b.f - a.f || a.k.localeCompare(b.k));

  for (let i = 0; i < remainder; i++) {
    floored[i % floored.length].v++;
  }

  return Object.fromEntries(floored.map(r => [r.k, r.v]));
}

// Load world ONCE
async function loadWorld() {
  const snap = await get(worldRef);

  if (snap.exists()) {
    worldPopulation = Number(snap.val());
  } else {
    worldPopulation = 8180000000;
  }
}

// Update UI
function tick() {
  worldPopulation += worldPopulation * (worldGrowthRate / secondsPerYear);

  const worldInt = Math.floor(worldPopulation);
  document.getElementById("world").textContent =
    worldInt.toLocaleString();

  const religions = splitReligions(worldInt);

  for (let key in religions) {
    const el = document.getElementById(key);
    if (el) el.textContent = religions[key].toLocaleString();
  }
}

// Run
loadWorld().then(() => {
  tick();
  setInterval(tick, 1000);
});














