// =============================================
// Time-Aware Population Counter (GLOBAL VERSION)
// Firebase Realtime Database
// =============================================

const { initializeApp, getDatabase, ref, get, set } = window.firebaseModules;
function getDeterministicReligionIntegers(worldInt, religionShares) {
  const entries = Object.entries(religionShares);

  // Step 1: raw values
  const raw = entries.map(([key, share]) => ({
    key,
    value: worldInt * share
  }));

  // Step 2: floor all
  const floored = raw.map(r => ({
    key: r.key,
    value: Math.floor(r.value),
    frac: r.value - Math.floor(r.value)
  }));

  // Step 3: distribute remainder deterministically
  let remainder =
    worldInt - floored.reduce((s, r) => s + r.value, 0);

  // Sort by fractional part DESC, then key (stable tie-break)
  floored.sort((a, b) =>
    b.frac - a.frac || a.key.localeCompare(b.key)
  );

  for (let i = 0; i < remainder; i++) {
    floored[i % floored.length].value++;
  }

  // Step 4: return object
  return Object.fromEntries(
    floored.map(r => [r.key, r.value])
  );
}

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
const statsRef = ref(database, "world");

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
let previousDisplay = {};


// =============================================
// LOAD DATA FROM FIREBASE
// =============================================
async function loadData() {
  const snapshot = await get(statsRef);

  if (snapshot.exists()) {
    worldPopulation = snapshot.val();
  } else {
    // absolute safety fallback
    worldPopulation = 8180000000;
  }

  previousDisplay.world = Math.floor(worldPopulation);
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

  // Grow world population
  worldPopulation += worldPopulation * (growthRates.world / secondsPerYear);

  // ===== WORLD DISPLAY =====
  const worldEl = document.getElementById("world");
  const worldInt = Math.floor(worldPopulation);

  worldEl.textContent = worldInt.toLocaleString();
  worldEl.style.color =
    worldInt > previousDisplay.world ? "#00ff88" :
    worldInt < previousDisplay.world ? "#ff4d4d" : "white";

  previousDisplay.world = worldInt;

  // ===== DETERMINISTIC RELIGION DISPLAY =====
  const religionInts = getDeterministicReligionIntegers(
    worldInt,
    religionShares
  );

  for (let key in religionInts) {
    const el = document.getElementById(key);
    if (!el) continue;

    el.textContent = religionInts[key].toLocaleString();
    previousDisplay[key] = religionInts[key];
  }
}



// ---- RUN ----
loadData().then(() => {
  updateCounters();
  setInterval(updateCounters, 1000);
});














