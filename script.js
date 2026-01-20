// =============================================
// Time-Aware World + Religion Counter
// Firebase Anchor Based (CORRECTED VERSION)
// =============================================

const { initializeApp, getDatabase, ref, get } = window.firebaseModules;

// ---------------------------------------------
// Firebase Config
// ---------------------------------------------
const firebaseConfig = {
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootRef = ref(db, "/");

// ---------------------------------------------
// Constants
// ---------------------------------------------
const secondsPerYear = 365 * 24 * 60 * 60;

// World growth (realistic avg)
const WORLD_GROWTH_RATE = 0.0085;

// Religion population shares (must sum ~1)
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
// Runtime State
// ---------------------------------------------
let baseWorld = 0;
let baseTimestamp = 0;

// ---------------------------------------------
// Load Anchor From Firebase
// ---------------------------------------------
async function loadBaseData() {
  const snapshot = await get(rootRef);

  if (!snapshot.exists()) {
    console.error("No Firebase data found");
    return;
  }

  const data = snapshot.val();
  baseWorld = data.baseWorld;
  baseTimestamp = data.baseTimestamp;

  console.log("Loaded base:", baseWorld, baseTimestamp);

  startCounters();
}

// ---------------------------------------------
// Counter Logic
// ---------------------------------------------
function startCounters() {
  setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = (now - baseTimestamp) / 1000;

    // Continuous exponential growth
    const worldNow =
      baseWorld *
      Math.exp(WORLD_GROWTH_RATE * (elapsedSeconds / secondsPerYear));

    renderWorld(worldNow);
    renderReligions(worldNow);
  }, 1000);
}

// ---------------------------------------------
// Render World
// ---------------------------------------------
function renderWorld(value) {
  const el = document.getElementById("world");
  if (!el) return;
  el.textContent = Math.floor(value).toLocaleString();
}

// ---------------------------------------------
// Render Religions
// ---------------------------------------------
function renderReligions(worldValue) {
  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const val = worldValue * religionShares[key];
    el.textContent = Math.floor(val).toLocaleString();
  }
}

// ---------------------------------------------
// Run
// ---------------------------------------------
loadBaseData();
