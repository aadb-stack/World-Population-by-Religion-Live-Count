// =============================================
// World Population by Religion (FINAL WORKING)
// Firebase Anchor + Green/Red
// =============================================

// 🔹 Firebase imports (THIS FIXES YOUR ERROR)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyC60KbVWhfeMRUyYPQHn_4z3tL_KPuaCAs",
  authDomain: "world-religion-database.firebaseapp.com",
  databaseURL: "https://world-religion-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "world-religion-database",
  storageBucket: "world-religion-database.firebasestorage.app",
  messagingSenderId: "226381276599",
  appId: "1:226381276599:web:5c15d6b6f32e232125b432"
};

// ---------- INIT ----------
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const statsRef = ref(db, "/");

// ---------- CONSTANTS ----------
const secondsPerYear = 365 * 24 * 60 * 60;
const growthRate = 0.0085;

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

// ---------- STATE ----------
let baseWorld = 0;
let baseTimestamp = 0;
let ready = false;
let prevWorld = null;

// ---------- LOAD FIREBASE ----------
async function loadAnchor() {
  const snap = await get(statsRef);

  if (!snap.exists()) {
    console.error("Firebase data missing");
    return;
  }

  const data = snap.val();
  baseWorld = Number(data.baseWorld);
  baseTimestamp = Number(data.baseTimestamp);

  if (!baseWorld || !baseTimestamp) {
    console.error("Invalid Firebase anchor");
    return;
  }

  ready = true;
}

// ---------- CALC ----------
function currentWorld() {
  const elapsed = (Date.now() - baseTimestamp) / 1000;
  return Math.floor(
    baseWorld * (1 + growthRate * elapsed / secondsPerYear)
  );
}

// ---------- UPDATE UI ----------
function update() {
  if (!ready) return;

  const world = currentWorld();
  const worldEl = document.getElementById("world");

  if (worldEl) {
    worldEl.textContent = world.toLocaleString();
    if (prevWorld !== null) {
      worldEl.style.color =
        world > prevWorld ? "#00ff88" :
        world < prevWorld ? "#ff4d4d" :
        "white";
    }
    prevWorld = world;
  }

  for (const key in religionShares) {
    const el = document.getElementById(key);
    if (!el) continue;
    const value = Math.floor(world * religionShares[key]);
    el.textContent = value.toLocaleString();
    el.style.color = "#00ff88";
  }
}

// ---------- START ----------
loadAnchor().then(() => {
  update();
  setInterval(update, 1000);
});
