// =============================================
// Time-Aware Population Counter (GLOBAL VERSION)
// Firebase Realtime Database
// =============================================

const { initializeApp, getDatabase, ref, get, set } = window.firebaseModules;
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

// 🔐 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432",
  measurementId: "G-KTLELSJPFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const statsRef = ref(database, "/");

const secondsPerYear = 365 * 24 * 60 * 60;

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

// ---- Global State ----
let worldPopulation = 0;
let religions = {};
let lastTimestamp = 0;
let previousDisplay = {};
let lastTickTime = Date.now();

// =============================================
// LOAD DATA FROM FIREBASE
// =============================================
async function loadData() {
  const snapshot = await get(statsRef);
  console.log("Firebase snapshot:", snapshot.val());


  if (snapshot.exists()) {
    const data = snapshot.val();
    worldPopulation = data.world;
    religions = data.religions;
    lastTimestamp = data.lastTimestamp || Date.now();
  }

  // Apply background growth
  const now = Date.now();
  const elapsedSeconds = (now - lastTimestamp) / 1000;

  worldPopulation += worldPopulation * (growthRates.world * elapsedSeconds / secondsPerYear);

  for (let key in religions) {
    religions[key] += religions[key] * (growthRates[key] * elapsedSeconds / secondsPerYear);
  }

  // Initialize previous display
  previousDisplay.world = Math.floor(worldPopulation);
  for (let key in religions) {
    previousDisplay[key] = Math.floor(religions[key]);
  }

  saveToDatabase();
}

// =============================================
// SAVE DATA TO FIREBASE
// =============================================
function saveToDatabase() {
  set(statsRef, {
    world: worldPopulation,
    religions: religions,
    lastTimestamp: Date.now()
  });
}

// =============================================
// UPDATE FUNCTION (LIVE)
// =============================================
function updateCounters() {

  // ===== WORLD GROWTH =====
  const oldWorld = worldPopulation;

  const now = Date.now();
const elapsedSeconds = (now - lastTickTime) / 1000;
lastTickTime = now;

// Grow world using REAL elapsed time
worldPopulation += worldPopulation *
  (growthRates.world * elapsedSeconds / secondsPerYear);

  const deltaWorld = worldPopulation - oldWorld;

  // ===== DISTRIBUTE DELTA =====
  let distributed = 0;

  for (let key in religions) {
    const add = deltaWorld * religionShares[key];
    religions[key] += add;
    distributed += add;
  }

  // ===== ROUNDING RESIDUE FIX (CRITICAL) =====
  const sumReligions = Object.values(religions)
    .reduce((a, b) => a + b, 0);

  const residue = worldPopulation - sumReligions;

  // Put residue into unaffiliated to conserve total
  religions.unaffiliated += residue;

  // ===== DISPLAY WORLD =====
  const worldEl = document.getElementById("world");
  const worldDisplay = Math.floor(worldPopulation);
  worldEl.textContent = worldDisplay.toLocaleString();

  worldEl.style.color =
    worldDisplay > previousDisplay.world ? "#00ff88" :
    worldDisplay < previousDisplay.world ? "#ff4d4d" : "white";

  previousDisplay.world = worldDisplay;

  // ===== DISPLAY RELIGIONS =====
  for (let key in religions) {
    const el = document.getElementById(key);
    if (!el) continue;

    const value = Math.floor(religions[key]);
    el.textContent = value.toLocaleString();

    el.style.color =
      value > previousDisplay[key] ? "#00ff88" :
      value < previousDisplay[key] ? "#ff4d4d" : "white";

    previousDisplay[key] = value;
  }

  // ===== SAVE =====
  saveToDatabase();
}


// ---- RUN ----
loadData().then(() => {
  updateCounters();
  setInterval(updateCounters, 1000);
});
