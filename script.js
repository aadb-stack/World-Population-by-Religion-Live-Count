// =============================================
// Time-Aware Population Counter (GLOBAL VERSION)
// Firebase Realtime Database
// =============================================

const { initializeApp, getDatabase, ref, get, set } = window.firebaseModules;

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

  // ---- WORLD ----
  worldPopulation += worldPopulation * (growthRates.world / secondsPerYear);
  const worldEl = document.getElementById("world");

  if (worldEl) {
    const currentWorld = Math.floor(worldPopulation);
    worldEl.textContent = currentWorld.toLocaleString();

    if (currentWorld > previousDisplay.world) {
      worldEl.style.color = "#00ff88";
    } else if (currentWorld < previousDisplay.world) {
      worldEl.style.color = "#ff4d4d";
    } else {
      worldEl.style.color = "white";
    }

    previousDisplay.world = currentWorld;
  }

  // ---- RELIGIONS ----
  for (let key in religions) {
    religions[key] += religions[key] * (growthRates[key] / secondsPerYear);
    const el = document.getElementById(key);
    if (!el) continue;

    const current = Math.floor(religions[key]);
    el.textContent = current.toLocaleString();

    if (current > previousDisplay[key]) {
      el.style.color = "#00ff88";
    } else if (current < previousDisplay[key]) {
      el.style.color = "#ff4d4d";
    } else {
      el.style.color = "white";
    }

    previousDisplay[key] = current;
  }

  // Save globally
  saveToDatabase();
}

// ---- RUN ----
loadData().then(() => {
  updateCounters();
  setInterval(updateCounters, 1000);
});













