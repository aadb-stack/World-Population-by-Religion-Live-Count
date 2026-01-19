the code which u gave me: // =============================================
// World Population by Religion
// Server-Authoritative (Firebase Anchor)
// =============================================

const { initializeApp, getDatabase, ref, get } = window.firebaseModules;

// --- CONSTANTS ---
const secondsPerYear = 365 * 24 * 60 * 60;

const growthRates = {
  world: 0.0085
};

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

// --- FIREBASE INIT ---
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const statsRef = ref(database, "/");

// --- GLOBAL ANCHOR ---
let baseWorld = 0;
let baseTimestamp = 0;

// --- LOAD ANCHOR FROM FIREBASE ---
async function loadData() {
  const snapshot = await get(statsRef);
  const data = snapshot.val();

  baseWorld = Number(data.baseWorld);
  baseTimestamp = Number(data.baseTimestamp);
}

// --- PURE WORLD CALCULATION ---
function computeWorldNow() {
  const now = Date.now();
  const elapsedSeconds = (now - baseTimestamp) / 1000;

  return Math.floor(
    baseWorld *
    (1 + growthRates.world * elapsedSeconds / secondsPerYear)
  );
}

// --- DISPLAY ONLY ---
function updateCounters() {
  // 🔒 Guard: don’t run until Firebase data is loaded
  if (!baseWorld || !baseTimestamp) {
    console.warn("Waiting for Firebase data...");
    return;
  }

  const worldInt = computeWorldNow();

  const worldEl = document.getElementById("world");
  if (worldEl) {
    worldEl.textContent = worldInt.toLocaleString();
  }

  for (let key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;

    const value = Math.floor(worldInt * religionShares[key]);
    el.textContent = value.toLocaleString();
  }
}


// --- RUN ---
loadData().then(() => {
  updateCounters();
  setInterval(updateCounters, 1000);
});
