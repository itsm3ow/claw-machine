const plushSources = [
  {
    name: "Sleepy Kitty",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images___lia-51946fdd-9143-4bfc-bf1b-5535127284fb.png"
  },
  {
    name: "Drooly Kitty",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images_download__2_-58e658db-0df8-4d4e-8d6b-27b3bf45a231.png"
  },
  {
    name: "Grin Kitty",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images_download__1_-7244524f-00f9-4ce7-827e-231b3927d7b1.png"
  },
  {
    name: "Angry Kitty",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images_____emoji_White_cat____-f9e0fb31-bb91-4acd-9f93-26e314549992.png"
  },
  {
    name: "Happy Tongue Kitty",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images__basiilleaf-59d2643d-fb29-4051-b210-2706812b7315.png"
  },
  {
    name: "Bonus Plush",
    path: "C:\\Users\\dell\\.cursor\\projects\\c-Users-dell-OneDrive-Documents\\assets\\c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_ded0776ccbb64c647e451d63d4262174_images_Chibi_Bochi-950ee58e-7833-4da6-a33e-1c06e28c802f.png"
  }
];

const machineGlass = document.getElementById("machineGlass");
const plushBin = document.getElementById("plushBin");
const claw = document.getElementById("claw");
const coinCountEl = document.getElementById("coinCount");
const caughtList = document.getElementById("caughtList");
const message = document.getElementById("message");
const creditLight = document.getElementById("creditLight");
const coinSlot = document.getElementById("coinSlot");
const prizeSlot = document.getElementById("prizeSlot");
const machineBottom = document.querySelector(".machine-bottom");

const coinBtn = document.getElementById("coinBtn");
const grabBtn = document.getElementById("grabBtn");
const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

const clawStops = [10, 30, 50, 70, 90];
let clawIndex = 2;
let coins = 0;
let plushies = [];
let lockControls = false;
let caughtCount = 0;
let machineBusy = false;
let joystickLoop = null;
let joystickDirection = 0;

function toFileUrl(winPath) {
  return `file:///${winPath.replace(/\\/g, "/")}`;
}

function setMessage(text) {
  message.textContent = text;
}

function updateCoins() {
  coinCountEl.textContent = String(coins);
  if (coins > 0) {
    creditLight.textContent = "CREDIT READY";
    creditLight.classList.add("active");
  } else {
    creditLight.textContent = "NO CREDIT";
    creditLight.classList.remove("active");
  }
}

function spawnPlushies() {
  plushBin.innerHTML = "";
  plushies = [];

  for (let i = 0; i < 9; i += 1) {
    const source = plushSources[i % plushSources.length];
    const plush = document.createElement("img");
    plush.className = "plushie";
    plush.alt = source.name;
    plush.dataset.name = source.name;
    plush.src = toFileUrl(source.path);
    plush.onerror = () => {
      plush.src =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><rect width='90' height='90' rx='16' fill='%23fff'/><text x='45' y='54' text-anchor='middle' font-size='34'>%F0%9F%A7%B8</text></svg>";
    };

    const x = Math.random() * 78 + 4;
    const y = Math.random() * 50 + 42;
    plush.style.left = `${x}%`;
    plush.style.top = `${y}%`;

    plushBin.appendChild(plush);
    plushies.push(plush);
  }
}

function moveClaw() {
  claw.style.left = `${clawStops[clawIndex]}%`;
}

function setControlsEnabled(enabled) {
  grabBtn.disabled = !enabled;
  joystickBase.style.opacity = enabled ? "1" : "0.65";
  joystickBase.style.pointerEvents = enabled ? "auto" : "none";
}

function getClosestPlush() {
  const glassBox = machineGlass.getBoundingClientRect();
  const targetX = (clawStops[clawIndex] / 100) * glassBox.width;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestDepth = 0;

  plushies.forEach((plush) => {
    if (!plush.isConnected) return;
    const plushLeft = parseFloat(plush.style.left || "50");
    const plushTop = parseFloat(plush.style.top || "60");
    const plushX = (plushLeft / 100) * glassBox.width;
    const plushY = (plushTop / 100) * glassBox.height;
    const distance = Math.abs(plushX - targetX);
    const weightedDistance = distance + plushY * 0.06;
    if (weightedDistance < bestDistance) {
      bestDistance = distance;
      best = plush;
      bestDepth = plushY;
    }
  });

  return bestDistance <= 90 ? { target: best, distance: bestDistance, depth: bestDepth } : null;
}

function addCaughtPlush(plushName, plushSrc) {
  const row = document.createElement("div");
  row.className = "caught-item";
  row.innerHTML = `<img src="${plushSrc}" alt="${plushName}"><span>${plushName}</span>`;
  caughtList.prepend(row);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setClawDrop(px) {
  claw.style.setProperty("--drop", `${px}px`);
}

function moveLeft() {
  if (lockControls) return;
  clawIndex = Math.max(0, clawIndex - 1);
  moveClaw();
}

function moveRight() {
  if (lockControls) return;
  clawIndex = Math.min(clawStops.length - 1, clawIndex + 1);
  moveClaw();
}

function getCatchChance(distance, depth) {
  const alignBonus = 1 - clamp(distance / 95, 0, 1);
  const depthPenalty = clamp(depth / 520, 0, 1) * 0.35;
  const chance = 0.22 + alignBonus * 0.66 - depthPenalty;
  return clamp(chance, 0.08, 0.88);
}

async function animateGrab(targetInfo) {
  const baseDrop = 160;
  const targetDepth = targetInfo ? Math.max(90, targetInfo.depth - 20) : 180;
  const dropAmount = clamp(targetDepth, baseDrop, 290);

  setClawDrop(dropAmount);
  await sleep(900);
  claw.classList.add("closed");
  await sleep(260);
  setClawDrop(0);
  await sleep(860);
  claw.classList.remove("closed");
}

async function grab() {
  if (lockControls) return;
  if (coins <= 0) {
    setMessage("You need to insert a coin first!");
    return;
  }

  coins -= 1;
  updateCoins();
  lockControls = true;
  machineBusy = true;
  setControlsEnabled(false);
  setMessage("Claw moving... hold your breath!");

  const targetInfo = getClosestPlush();
  const target = targetInfo?.target || null;
  if (target) target.classList.add("selected");

  await animateGrab(targetInfo);

  const chance = targetInfo ? getCatchChance(targetInfo.distance, targetInfo.depth) : 0.06;
  const isSuccess = !!target && Math.random() < chance;

  if (isSuccess && target) {
    const plushName = target.dataset.name;
    target.classList.add("caught");
    await sleep(260);
    addCaughtPlush(plushName, target.src);
    prizeSlot.classList.add("pulse");
    target.remove();
    plushies = plushies.filter((p) => p !== target);
    caughtCount += 1;
    setMessage(`Nice catch! ${plushName} is yours. Total won: ${caughtCount}`);
    setTimeout(() => prizeSlot.classList.remove("pulse"), 700);
  } else {
    if (target) target.classList.remove("selected");
    setMessage("Almost! It slipped from the claw. Try a better alignment.");
  }

  if (plushies.length === 0) {
    await sleep(700);
    spawnPlushies();
    setMessage("Machine refilled with fresh plushies!");
  }

  lockControls = false;
  machineBusy = false;
  setControlsEnabled(true);
}

function animateCoinInsert() {
  const coin = document.createElement("div");
  coin.className = "coin-token";
  machineBottom.appendChild(coin);
  // Force reflow so animation starts reliably each time.
  void coin.offsetWidth;
  coin.classList.add("drop");
  setTimeout(() => coin.remove(), 700);
}

coinBtn.addEventListener("click", () => {
  coins += 1;
  updateCoins();
  animateCoinInsert();
  coinSlot.classList.add("flash");
  setTimeout(() => coinSlot.classList.remove("flash"), 420);
  setMessage("Coin entered! Use joystick and press Grab Plushie.");
});

grabBtn.addEventListener("click", grab);

function setStickPosition(x, y) {
  joystickStick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function stopJoystick() {
  joystickDirection = 0;
  setStickPosition(0, 0);
  if (joystickLoop) {
    clearInterval(joystickLoop);
    joystickLoop = null;
  }
}

function startJoystickLoop() {
  if (joystickLoop) return;
  joystickLoop = setInterval(() => {
    if (machineBusy || lockControls) return;
    if (joystickDirection < 0) moveLeft();
    if (joystickDirection > 0) moveRight();
  }, 190);
}

function onJoystickMove(clientX, clientY) {
  const rect = joystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  const maxRadius = rect.width * 0.3;
  const distance = Math.hypot(dx, dy) || 1;
  const factor = distance > maxRadius ? maxRadius / distance : 1;
  const clampedX = dx * factor;
  const clampedY = dy * factor;
  setStickPosition(clampedX, clampedY);

  if (Math.abs(clampedX) < 10) {
    joystickDirection = 0;
  } else {
    joystickDirection = clampedX < 0 ? -1 : 1;
  }
}

let joystickActivePointer = null;

joystickBase.addEventListener("pointerdown", (event) => {
  joystickActivePointer = event.pointerId;
  joystickBase.setPointerCapture(event.pointerId);
  onJoystickMove(event.clientX, event.clientY);
  startJoystickLoop();
});

joystickBase.addEventListener("pointermove", (event) => {
  if (event.pointerId !== joystickActivePointer) return;
  onJoystickMove(event.clientX, event.clientY);
});

function releaseJoystick(event) {
  if (event.pointerId !== joystickActivePointer) return;
  joystickActivePointer = null;
  stopJoystick();
}

joystickBase.addEventListener("pointerup", releaseJoystick);
joystickBase.addEventListener("pointercancel", releaseJoystick);
joystickBase.addEventListener("lostpointercapture", () => {
  joystickActivePointer = null;
  stopJoystick();
});

document.addEventListener("keydown", (event) => {
  if (machineBusy) return;
  const key = event.key.toLowerCase();
  if (key === "a" || event.key === "ArrowLeft") {
    moveLeft();
  } else if (key === "d" || event.key === "ArrowRight") {
    moveRight();
  } else if (key === "c") {
    coinBtn.click();
  } else if (event.code === "Space") {
    event.preventDefault();
    grabBtn.click();
  }
});

spawnPlushies();
moveClaw();
updateCoins();
setControlsEnabled(true);
