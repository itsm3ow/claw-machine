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

const coinBtn = document.getElementById("coinBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const grabBtn = document.getElementById("grabBtn");

const clawStops = [10, 30, 50, 70, 90];
let clawIndex = 2;
let coins = 0;
let plushies = [];
let lockControls = false;
let caughtCount = 0;

function toFileUrl(winPath) {
  return `file:///${winPath.replace(/\\/g, "/")}`;
}

function setMessage(text) {
  message.textContent = text;
}

function updateCoins() {
  coinCountEl.textContent = String(coins);
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
  leftBtn.disabled = !enabled;
  rightBtn.disabled = !enabled;
  grabBtn.disabled = !enabled;
}

function getClosestPlush() {
  const glassBox = machineGlass.getBoundingClientRect();
  const targetX = (clawStops[clawIndex] / 100) * glassBox.width;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  plushies.forEach((plush) => {
    if (!plush.isConnected) return;
    const plushLeft = parseFloat(plush.style.left || "50");
    const plushX = (plushLeft / 100) * glassBox.width;
    const distance = Math.abs(plushX - targetX);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = plush;
    }
  });

  return bestDistance <= 90 ? best : null;
}

function addCaughtPlush(plushName, plushSrc) {
  const row = document.createElement("div");
  row.className = "caught-item";
  row.innerHTML = `<img src="${plushSrc}" alt="${plushName}"><span>${plushName}</span>`;
  caughtList.prepend(row);
}

function grab() {
  if (lockControls) return;
  if (coins <= 0) {
    setMessage("You need to insert a coin first!");
    return;
  }

  coins -= 1;
  updateCoins();
  lockControls = true;
  setControlsEnabled(false);
  setMessage("Claw is dropping...");

  const target = getClosestPlush();
  if (target) target.classList.add("selected");

  setTimeout(() => {
    const isSuccess = !!target && Math.random() > 0.22;
    if (isSuccess && target) {
      const plushName = target.dataset.name;
      addCaughtPlush(plushName, target.src);
      target.remove();
      plushies = plushies.filter((p) => p !== target);
      caughtCount += 1;
      setMessage(`You caught ${plushName}! Total won: ${caughtCount}`);
    } else {
      if (target) target.classList.remove("selected");
      setMessage("Oops! The plushie slipped. Try again!");
    }

    if (plushies.length === 0) {
      setTimeout(() => {
        spawnPlushies();
        setMessage("Machine refilled with fresh plushies!");
      }, 700);
    }

    lockControls = false;
    setControlsEnabled(true);
  }, 1200);
}

coinBtn.addEventListener("click", () => {
  coins += 1;
  updateCoins();
  setMessage("Coin inserted! Move the claw and press Grab Plushie.");
});

leftBtn.addEventListener("click", () => {
  if (lockControls) return;
  clawIndex = Math.max(0, clawIndex - 1);
  moveClaw();
});

rightBtn.addEventListener("click", () => {
  if (lockControls) return;
  clawIndex = Math.min(clawStops.length - 1, clawIndex + 1);
  moveClaw();
});

grabBtn.addEventListener("click", grab);

spawnPlushies();
moveClaw();
updateCoins();
setControlsEnabled(true);
