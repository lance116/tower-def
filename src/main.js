import * as THREE from "three";

const canvas = document.getElementById("gameCanvas");
const ui = {
  gold: document.getElementById("goldValue"),
  orbs: document.getElementById("orbValue"),
  stones: document.getElementById("stoneValue"),
  chest: document.getElementById("chestValue"),
  wave: document.getElementById("waveValue"),
  enemies: document.getElementById("enemyValue"),
  startWaveBtn: document.getElementById("startWaveBtn"),
  speedBtn: document.getElementById("speedBtn"),
  fireballBtn: document.getElementById("fireballBtn"),
  freezeBtn: document.getElementById("freezeBtn"),
  repairBtn: document.getElementById("repairBtn"),
  summonBtn: document.getElementById("summonBtn"),
  summon10Btn: document.getElementById("summon10Btn"),
  specialSummonBtn: document.getElementById("specialSummonBtn"),
  eventText: document.getElementById("eventText"),
  log: document.getElementById("logText"),
  towerInfo: document.getElementById("towerInfo"),
  hint: document.getElementById("hintText"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  removeBtn: document.getElementById("sellBtn"),
  roster: document.getElementById("heroRoster"),
  gameOver: document.getElementById("gameOver"),
  restartBtn: document.getElementById("restartBtn")
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.17;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xafe9ff);
scene.fog = new THREE.Fog(0xafe9ff, 65, 210);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 64, 26);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8ed66f, 1.35));
const sun = new THREE.DirectionalLight(0xfff4c4, 1.15);
sun.position.set(35, 72, 20);
scene.add(sun);

const GRID_W = 13;
const GRID_H = 9;
const TILE = 4;
const SAVE_KEY = "idle_summoner_td_save_v3";

const SUMMON_ORB_COST = 10;
const FIREBALL_COST = 140;
const FREEZE_COST = 170;
const REPAIR_COST = 180;

const PATH_TILES = [
  { x: 6, y: 0 },
  { x: 6, y: 1 },
  { x: 5, y: 1 },
  { x: 4, y: 1 },
  { x: 3, y: 1 },
  { x: 3, y: 2 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 5, y: 3 },
  { x: 6, y: 3 },
  { x: 7, y: 3 },
  { x: 8, y: 3 },
  { x: 9, y: 3 },
  { x: 9, y: 4 },
  { x: 9, y: 5 },
  { x: 8, y: 5 },
  { x: 7, y: 5 },
  { x: 6, y: 5 },
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 6 },
  { x: 3, y: 7 },
  { x: 4, y: 7 },
  { x: 5, y: 7 },
  { x: 6, y: 7 },
  { x: 6, y: 8 }
];

const HERO_SLOTS = [
  { x: 2, y: 2, row: 0, col: 0 },
  { x: 6, y: 2, row: 0, col: 1 },
  { x: 10, y: 2, row: 0, col: 2 },
  { x: 2, y: 4, row: 1, col: 0 },
  { x: 6, y: 4, row: 1, col: 1 },
  { x: 10, y: 4, row: 1, col: 2 },
  { x: 2, y: 6, row: 2, col: 0 },
  { x: 6, y: 6, row: 2, col: 1 },
  { x: 10, y: 6, row: 2, col: 2 }
];

const SLOT_GRID_LOOKUP = new Map(HERO_SLOTS.map((slot, i) => [`${slot.row},${slot.col}`, i]));

const RARITY_ORDER = ["common", "rare", "epic", "legendary", "special"];
const rarityCatalog = {
  common: { label: "common", color: 0xb9c4bb, weight: 800, duplicateGold: 250 },
  rare: { label: "rare", color: 0x5eb7ff, weight: 960, duplicateGold: 500 },
  epic: { label: "epic", color: 0xffbe55, weight: 440, duplicateGold: 900 },
  legendary: { label: "legendary", color: 0xff8f67, weight: 55, duplicateGold: 1800 },
  special: { label: "special", color: 0xd58dff, weight: 180, duplicateGold: 3200 }
};

const monsterCatalog = {
  slimey: {
    name: "slimey",
    rarity: "common",
    color: 0x8fd96f,
    accent: 0xeaffd6,
    baseDamage: 16,
    range: 7,
    fireRate: 1.2,
    projectileColor: 0xb9ff8f
  },
  mocha: {
    name: "mocha",
    rarity: "common",
    color: 0xf6b765,
    accent: 0xfff0c4,
    baseDamage: 12,
    range: 6.2,
    fireRate: 1.9,
    projectileColor: 0xffd46e
  },
  spikey: {
    name: "spikey",
    rarity: "common",
    color: 0x97e0e8,
    accent: 0xe1fbff,
    baseDamage: 11,
    range: 6.8,
    fireRate: 1.05,
    slow: 0.62,
    slowDuration: 1.4,
    projectileColor: 0x9be8ff
  },
  teddy: {
    name: "teddy",
    rarity: "rare",
    color: 0xff9f73,
    accent: 0xffeed5,
    baseDamage: 17,
    range: 6.6,
    fireRate: 1.15,
    splash: 2.5,
    projectileColor: 0xffbf7f
  },
  clyde: {
    name: "clyde",
    rarity: "rare",
    color: 0xff7d7d,
    accent: 0xffdad1,
    baseDamage: 28,
    range: 5.8,
    fireRate: 0.8,
    projectileColor: 0xff8e8e
  },
  cappuccino: {
    name: "cappuccino",
    rarity: "rare",
    color: 0xdbc285,
    accent: 0xfff2cc,
    baseDamage: 18,
    range: 6.3,
    fireRate: 1,
    stunChance: 0.18,
    stunDuration: 1.2,
    projectileColor: 0xffdf9e
  },
  mighty: {
    name: "mighty",
    rarity: "epic",
    color: 0xf4db56,
    accent: 0xfff3bf,
    baseDamage: 10,
    range: 5.2,
    fireRate: 0.95,
    supportDamage: 0.32,
    projectileColor: 0xffec8f
  },
  speedy: {
    name: "speedy",
    rarity: "epic",
    color: 0x7ad1ff,
    accent: 0xe4f8ff,
    baseDamage: 8,
    range: 5,
    fireRate: 0.95,
    supportSpeed: 0.34,
    projectileColor: 0x95e8ff
  },
  frostbite: {
    name: "frostbite",
    rarity: "epic",
    color: 0x86f3ff,
    accent: 0xebfcff,
    baseDamage: 19,
    range: 7.2,
    fireRate: 1.15,
    splash: 1.8,
    slow: 0.45,
    slowDuration: 1.7,
    projectileColor: 0xb9f8ff
  },
  slime_king: {
    name: "slime king",
    rarity: "legendary",
    color: 0x9e7cff,
    accent: 0xf1e8ff,
    baseDamage: 24,
    range: 7.4,
    fireRate: 1.05,
    special: "global_stun",
    specialCooldown: 10,
    projectileColor: 0xb89eff
  },
  felina: {
    name: "felina",
    rarity: "legendary",
    color: 0xff8072,
    accent: 0xffeadf,
    baseDamage: 30,
    range: 9,
    fireRate: 0.85,
    splash: 3.4,
    projectileColor: 0xffa887
  },
  kevin: {
    name: "kevin",
    rarity: "legendary",
    color: 0xffd66d,
    accent: 0xfff6c9,
    baseDamage: 38,
    range: 6.8,
    fireRate: 1,
    tripleHit: true,
    projectileColor: 0xffe18c
  },
  pirate_cat: {
    name: "pirate cat",
    rarity: "special",
    color: 0xf56fd2,
    accent: 0xffdcf4,
    baseDamage: 22,
    range: 7,
    fireRate: 1.15,
    splash: 2.2,
    projectileColor: 0xff96e8
  },
  hellhound: {
    name: "hellhound",
    rarity: "special",
    color: 0xff5a48,
    accent: 0xffd4c5,
    baseDamage: 16,
    range: 5.4,
    fireRate: 1.05,
    supportDamage: 0.48,
    projectileColor: 0xff8a6d,
    eventOnly: true
  }
};

const enemyTypes = {
  grunt: {
    name: "footman",
    color: 0xff8d6c,
    capColor: 0xffda86,
    hpScale: 1,
    speed: 2,
    damage: 3,
    rewardGold: 8,
    rewardOrbs: 1,
    rewardStones: 0,
    rockDamage: 8
  },
  runner: {
    name: "wolf rider",
    color: 0xffb07f,
    capColor: 0xfff4a3,
    hpScale: 0.72,
    speed: 3.15,
    damage: 2,
    rewardGold: 9,
    rewardOrbs: 1,
    rewardStones: 0,
    rockDamage: 7
  },
  tank: {
    name: "shield brute",
    color: 0xe56a57,
    capColor: 0xffc05b,
    hpScale: 2.1,
    speed: 1.5,
    damage: 6,
    rewardGold: 15,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 11
  },
  breaker: {
    name: "rage berserker",
    color: 0xf44f45,
    capColor: 0xffd05b,
    hpScale: 1.4,
    speed: 2.15,
    damage: 5,
    rewardGold: 14,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 26,
    ability: "slot_stun"
  },
  mage: {
    name: "warlock",
    color: 0xb68cff,
    capColor: 0xffd5ff,
    hpScale: 1.25,
    speed: 1.8,
    damage: 4,
    rewardGold: 14,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 10,
    ability: "heal"
  },
  shaman: {
    name: "shaman",
    color: 0x7bc6ff,
    capColor: 0xdff4ff,
    hpScale: 1.32,
    speed: 1.9,
    damage: 4,
    rewardGold: 15,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 10,
    ability: "shield"
  },
  knome: {
    name: "treasure knome",
    color: 0xf8d85a,
    capColor: 0xffffff,
    hpScale: 0.58,
    speed: 3.2,
    damage: 0,
    rewardGold: 18,
    rewardOrbs: 3,
    rewardStones: 80,
    rockDamage: 4
  },
  boss_archmage: {
    name: "archmage",
    color: 0x8f72ff,
    capColor: 0xffecff,
    hpScale: 7,
    speed: 1.35,
    damage: 13,
    rewardGold: 180,
    rewardOrbs: 16,
    rewardStones: 140,
    rockDamage: 35,
    ability: "mass_heal",
    isBoss: true
  },
  boss_king: {
    name: "the king",
    color: 0xff6f58,
    capColor: 0xffe27a,
    hpScale: 9.2,
    speed: 1.25,
    damage: 16,
    rewardGold: 240,
    rewardOrbs: 20,
    rewardStones: 180,
    rockDamage: 48,
    ability: "war_cry",
    isBoss: true
  }
};

const state = {
  gold: 350,
  orbs: 120,
  stones: 0,
  chestHp: 120,
  chestHpMax: 120,
  wave: 1,
  waveActive: false,
  waveQueue: [],
  spawnedThisWave: 0,
  spawnCooldown: 0,
  spawnInterval: 0.95,
  autoWaveTimer: 5,
  gameSpeed: 1,
  fireballCd: 0,
  freezeCd: 0,
  repairCd: 0,
  pendingSpell: null,
  globalSlowTimer: 0,
  enemyHasteTimer: 0,
  runOver: false,
  selectedMonsterId: null,
  selectedSlotIndex: null,
  chestHitFlash: 0,
  saveTimer: 0,
  nextEnemyId: 1,
  eventMonsterId: "hellhound"
};

const collection = {};
for (const monsterId of Object.keys(monsterCatalog)) {
  collection[monsterId] = {
    owned: false,
    stars: 0,
    level: 1,
    copies: 0,
    investedGold: 0
  };
}
collection.slimey.owned = true;
collection.slimey.stars = 1;
collection.mocha.owned = true;
collection.mocha.stars = 1;
collection.spikey.owned = true;
collection.spikey.stars = 1;

const slotOccupants = Array(HERO_SLOTS.length).fill(null);
const heroes = [];
const heroByMonster = new Map();

const enemies = [];
const projectiles = [];
const pulses = [];
const floorMarks = [];

const toonGradientMap = createToonGradientTexture();
const spriteCache = new Map();

const pathTileSet = new Set(PATH_TILES.map((tile) => `${tile.x},${tile.y}`));
const pathWorld = PATH_TILES.map((tile) => tileToWorld(tile.x, tile.y, 0.84));
const pathEndProgress = PATH_TILES.length - 1;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tileMeshes = [];
const slotMeshes = [];
let groundPlane;
let chestMesh;

const barricades = [];

const rangeIndicator = new THREE.Mesh(
  new THREE.RingGeometry(0.92, 1.1, 44),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
);
rangeIndicator.rotation.x = -Math.PI / 2;
rangeIndicator.visible = false;
scene.add(rangeIndicator);

buildBoard();
wireUi();
loadGame();
seedInitialLineup();
renderRoster();
updateAllUi();

const clock = new THREE.Clock();
renderer.setAnimationLoop(tick);

function tileToWorld(x, y, yOffset = 0) {
  return new THREE.Vector3((x - (GRID_W - 1) / 2) * TILE, yOffset, (y - (GRID_H - 1) / 2) * TILE);
}

function createToonGradientTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 1;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = "#dfdfdf";
  ctx.fillRect(1, 0, 1, 1);
  ctx.fillStyle = "#bbbbbb";
  ctx.fillRect(2, 0, 1, 1);
  ctx.fillStyle = "#939393";
  ctx.fillRect(3, 0, 1, 1);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

function buildBoard() {
  const boardGroup = new THREE.Group();

  const tileGeo = new THREE.BoxGeometry(TILE * 0.95, 0.8, TILE * 0.95);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const isPath = pathTileSet.has(`${x},${y}`);
      const tile = new THREE.Mesh(
        tileGeo,
        new THREE.MeshToonMaterial({
          color: isPath ? 0xe6be75 : 0x59bc53,
          gradientMap: toonGradientMap
        })
      );
      tile.position.copy(tileToWorld(x, y, -0.4));
      tile.userData = { tileX: x, tileY: y, isPath };
      boardGroup.add(tile);
      tileMeshes.push(tile);
    }
  }

  scene.add(boardGroup);

  for (let i = 0; i < HERO_SLOTS.length; i += 1) {
    const slot = HERO_SLOTS[i];
    const pos = tileToWorld(slot.x, slot.y, 0.12);

    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.24, 30),
      new THREE.MeshToonMaterial({ color: 0xeef4fb, gradientMap: toonGradientMap })
    );
    ring.position.copy(pos);
    ring.userData = { slotIndex: i };
    scene.add(ring);
    slotMeshes.push(ring);

    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x9ce9ff, transparent: true, opacity: 0.55 })
    );
    inner.position.set(pos.x, pos.y + 0.15, pos.z);
    scene.add(inner);
  }

  for (const y of [2, 4, 6]) {
    for (const x of [4, 8]) {
      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.88, 0.45, 8),
        new THREE.MeshToonMaterial({ color: 0x4ab0e7, gradientMap: toonGradientMap })
      );
      stone.position.copy(tileToWorld(x, y, 0.1));
      scene.add(stone);
    }
  }

  const spawnPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.24, 24),
    new THREE.MeshBasicMaterial({ color: 0x84d6ff, transparent: true, opacity: 0.9 })
  );
  spawnPad.position.copy(tileToWorld(PATH_TILES[0].x, PATH_TILES[0].y, 0.17));
  scene.add(spawnPad);

  chestMesh = new THREE.Group();
  const chestPos = tileToWorld(PATH_TILES[PATH_TILES.length - 1].x, PATH_TILES[PATH_TILES.length - 1].y, 1.2);
  const chestBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 1.5, 1.85),
    new THREE.MeshToonMaterial({ color: 0xab6f2d, gradientMap: toonGradientMap })
  );
  const chestLid = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.7, 1.92),
    new THREE.MeshToonMaterial({ color: 0xf8c95c, gradientMap: toonGradientMap })
  );
  chestLid.position.y = 0.97;
  chestMesh.add(chestBase, chestLid);
  chestMesh.position.copy(chestPos);
  scene.add(chestMesh);

  const ambient = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.45, GRID_H * TILE * 1.45),
    new THREE.MeshBasicMaterial({ color: 0x9ee273, transparent: true, opacity: 0.58 })
  );
  ambient.rotation.x = -Math.PI / 2;
  ambient.position.y = -0.85;
  scene.add(ambient);

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(GRID_W * TILE * 0.9, 60),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -0.84;
  scene.add(halo);

  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.5, GRID_H * TILE * 1.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  scene.add(groundPlane);

  const barricadeProgress = [6, 13, 20];
  for (let i = 0; i < barricadeProgress.length; i += 1) {
    const pathIndex = barricadeProgress[i];
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.78, 0),
      new THREE.MeshToonMaterial({ color: 0x4caee8, gradientMap: toonGradientMap })
    );
    const pos = pathWorld[pathIndex].clone();
    pos.y = 1.15;
    mesh.position.copy(pos);
    scene.add(mesh);

    const hpBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x2d2d2d })
    );
    hpBg.position.set(pos.x, 2.0, pos.z);

    const hpFill = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.09, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x67e5ff })
    );
    hpFill.position.set(pos.x, 2.0, pos.z + 0.01);

    scene.add(hpBg, hpFill);

    barricades.push({
      id: i,
      pathIndex,
      hp: 220,
      maxHp: 220,
      mesh,
      hpBg,
      hpFill
    });
  }
}

function wireUi() {
  ui.startWaveBtn.addEventListener("click", () => {
    if (state.runOver || state.waveActive) return;
    startWave();
  });

  ui.speedBtn.addEventListener("click", () => {
    state.gameSpeed = state.gameSpeed === 1 ? 2 : 1;
    ui.speedBtn.textContent = `speed x${state.gameSpeed}`;
  });

  ui.fireballBtn.addEventListener("click", () => {
    if (state.runOver) return;
    if (state.fireballCd > 0) {
      log(`fireball cooling down (${state.fireballCd.toFixed(1)}s).`);
      return;
    }
    if (state.gold < FIREBALL_COST) {
      log("not enough gold for fireball.");
      return;
    }
    state.pendingSpell = "fireball";
    log("fireball armed. click on the board.");
  });

  ui.freezeBtn.addEventListener("click", castFreeze);
  ui.repairBtn.addEventListener("click", castRepair);

  ui.summonBtn.addEventListener("click", () => summonOrbs(1));
  ui.summon10Btn.addEventListener("click", () => summonOrbs(10));
  ui.specialSummonBtn.addEventListener("click", eventSummon);

  ui.upgradeBtn.addEventListener("click", upgradeSelectedHero);
  ui.removeBtn.addEventListener("click", removeSelectedHero);
  ui.restartBtn.addEventListener("click", restartRun);

  ui.roster.addEventListener("click", onRosterClick);
  canvas.addEventListener("pointerdown", onBoardClick);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("beforeunload", saveGame);
}

function onRosterClick(event) {
  const card = event.target.closest(".roster-card");
  if (!card) return;
  const monsterId = card.dataset.monsterId;
  if (!monsterId) return;

  const entry = collection[monsterId];
  if (!entry.owned) {
    if (monsterId === state.eventMonsterId) {
      log("this event monster is unlocked using event stones.");
    } else {
      log("summon this monster first.");
    }
    return;
  }

  state.selectedMonsterId = monsterId;
  state.selectedSlotIndex = heroByMonster.has(monsterId) ? heroByMonster.get(monsterId).slotIndex : null;

  updateSelectionIndicator();
  updateAllUi();
}

function onBoardClick(event) {
  if (state.runOver) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (state.pendingSpell === "fireball") {
    const hit = raycaster.intersectObject(groundPlane, false)[0];
    if (hit) castFireball(hit.point);
    return;
  }

  const slotHit = raycaster.intersectObjects(slotMeshes, false)[0];
  if (!slotHit) return;

  const slotIndex = slotHit.object.userData.slotIndex;
  handleSlotClick(slotIndex);
}

function handleSlotClick(slotIndex) {
  const occupant = slotOccupants[slotIndex];

  if (state.selectedMonsterId) {
    const selectedId = state.selectedMonsterId;
    const entry = collection[selectedId];
    if (!entry.owned) {
      log("selected monster is not unlocked.");
      return;
    }

    const selectedHero = heroByMonster.get(selectedId);
    const fromSlot = selectedHero ? selectedHero.slotIndex : null;

    if (fromSlot === slotIndex) {
      state.selectedSlotIndex = slotIndex;
      updateSelectionIndicator();
      updateAllUi();
      return;
    }

    if (fromSlot === null) {
      if (occupant) clearHeroFromSlot(slotIndex);
      placeHeroInSlot(selectedId, slotIndex);
      log(`${monsterCatalog[selectedId].name} placed.`);
    } else if (!occupant) {
      moveHero(selectedId, slotIndex);
      log(`${monsterCatalog[selectedId].name} moved.`);
    } else {
      const swapId = occupant;
      swapHeroes(selectedId, swapId);
      log(`${monsterCatalog[selectedId].name} swapped with ${monsterCatalog[swapId].name}.`);
    }

    state.selectedSlotIndex = heroByMonster.get(selectedId)?.slotIndex ?? null;
    updateSelectionIndicator();
    renderRoster();
    updateAllUi();
    return;
  }

  if (occupant) {
    state.selectedMonsterId = occupant;
    state.selectedSlotIndex = slotIndex;
    log(`${monsterCatalog[occupant].name} selected.`);
  } else {
    state.selectedMonsterId = null;
    state.selectedSlotIndex = null;
  }

  updateSelectionIndicator();
  renderRoster();
  updateAllUi();
}

function moveHero(monsterId, toSlot) {
  const hero = heroByMonster.get(monsterId);
  if (!hero) return;

  slotOccupants[hero.slotIndex] = null;
  slotOccupants[toSlot] = monsterId;
  hero.slotIndex = toSlot;

  const pos = tileToWorld(HERO_SLOTS[toSlot].x, HERO_SLOTS[toSlot].y, 0);
  hero.baseY = pos.y;
  hero.mesh.position.x = pos.x;
  hero.mesh.position.z = pos.z;
}

function swapHeroes(monsterA, monsterB) {
  const heroA = heroByMonster.get(monsterA);
  const heroB = heroByMonster.get(monsterB);
  if (!heroA || !heroB) return;

  const slotA = heroA.slotIndex;
  const slotB = heroB.slotIndex;

  slotOccupants[slotA] = monsterB;
  slotOccupants[slotB] = monsterA;

  heroA.slotIndex = slotB;
  heroB.slotIndex = slotA;

  const posA = tileToWorld(HERO_SLOTS[slotB].x, HERO_SLOTS[slotB].y, 0);
  const posB = tileToWorld(HERO_SLOTS[slotA].x, HERO_SLOTS[slotA].y, 0);

  heroA.baseY = posA.y;
  heroB.baseY = posB.y;

  heroA.mesh.position.x = posA.x;
  heroA.mesh.position.z = posA.z;
  heroB.mesh.position.x = posB.x;
  heroB.mesh.position.z = posB.z;
}

function placeHeroInSlot(monsterId, slotIndex) {
  if (heroByMonster.has(monsterId)) {
    moveHero(monsterId, slotIndex);
    return;
  }

  const monster = monsterCatalog[monsterId];
  const mesh = createHeroMesh(monsterId);
  const pos = tileToWorld(HERO_SLOTS[slotIndex].x, HERO_SLOTS[slotIndex].y, 0);
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);

  const hero = {
    monsterId,
    slotIndex,
    mesh,
    baseY: pos.y,
    cooldown: Math.random() * 0.45,
    specialCd: monster.specialCooldown || 0,
    disabledTimer: 0,
    animSeed: Math.random() * Math.PI * 2
  };

  heroes.push(hero);
  heroByMonster.set(monsterId, hero);
  slotOccupants[slotIndex] = monsterId;
}

function clearHeroFromSlot(slotIndex) {
  const monsterId = slotOccupants[slotIndex];
  if (!monsterId) return;

  const hero = heroByMonster.get(monsterId);
  if (hero) {
    scene.remove(hero.mesh);
    const idx = heroes.indexOf(hero);
    if (idx >= 0) heroes.splice(idx, 1);
    heroByMonster.delete(monsterId);
  }

  slotOccupants[slotIndex] = null;

  if (state.selectedMonsterId === monsterId) {
    state.selectedSlotIndex = null;
  }
}

function createHeroMesh(monsterId) {
  const monster = monsterCatalog[monsterId];
  const rarityColor = rarityCatalog[monster.rarity].color;

  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.26, 0.6, 20),
    new THREE.MeshToonMaterial({ color: 0xf4fbff, gradientMap: toonGradientMap })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.11, 10, 26),
    new THREE.MeshBasicMaterial({ color: rarityColor, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.45;

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 18, 14),
    new THREE.MeshToonMaterial({ color: monster.color, gradientMap: toonGradientMap })
  );
  body.position.y = 1.25;

  const crest = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.65, 10),
    new THREE.MeshToonMaterial({ color: monster.accent, gradientMap: toonGradientMap })
  );
  crest.position.y = 2;

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1d1b17 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.16, 1.3, 0.53);
  eyeR.position.set(0.16, 1.3, 0.53);

  const iconSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createMonsterSpriteTexture(monsterId),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.92
    })
  );
  iconSprite.position.y = 2.62;
  iconSprite.scale.set(2.45, 2.45, 1);

  group.add(base, ring, body, crest, eyeL, eyeR, iconSprite);
  group.userData.visuals = { ring, iconSprite, body };
  return group;
}

function createMonsterSpriteTexture(monsterId) {
  if (spriteCache.has(monsterId)) return spriteCache.get(monsterId);

  const monster = monsterCatalog[monsterId];
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 256;
  canvas2d.height = 256;
  const ctx = canvas2d.getContext("2d");
  const center = 128;

  const c1 = new THREE.Color(monster.color);
  const c2 = new THREE.Color(monster.accent);

  const halo = ctx.createRadialGradient(center, center, 12, center, center, 122);
  halo.addColorStop(0, `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.95)`);
  halo.addColorStop(0.5, `rgba(${Math.round(c1.r * 255)}, ${Math.round(c1.g * 255)}, ${Math.round(c1.b * 255)}, 0.46)`);
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(center, center, 76, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `rgba(${Math.round(c1.r * 255)}, ${Math.round(c1.g * 255)}, ${Math.round(c1.b * 255)}, 0.98)`;
  ctx.strokeStyle = "rgba(42, 26, 12, 0.95)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(center - 34, center + 44);
  ctx.lineTo(center - 42, center - 16);
  ctx.lineTo(center, center - 58);
  ctx.lineTo(center + 42, center - 16);
  ctx.lineTo(center + 34, center + 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(center - 28, center - 8);
  ctx.lineTo(center - 8, center - 28);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas2d);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  spriteCache.set(monsterId, tex);
  return tex;
}

function seedInitialLineup() {
  if (heroes.length > 0) return;
  placeHeroInSlot("slimey", 4);
  placeHeroInSlot("mocha", 3);
  placeHeroInSlot("spikey", 5);
}

function getEventSummonCost(currentStars) {
  return 1000 * (currentStars + 1);
}

function eventSummon() {
  if (state.runOver) return;

  const eventId = state.eventMonsterId;
  const entry = collection[eventId];
  const required = getEventSummonCost(Math.max(entry.stars, 0));

  if (state.stones < required) {
    log(`need ${required} event stones for ${monsterCatalog[eventId].name}.`);
    return;
  }

  state.stones -= required;

  if (!entry.owned) {
    entry.owned = true;
    entry.stars = 1;
    entry.level = 1;
    log(`${monsterCatalog[eventId].name} unlocked from event stones.`);
  } else if (entry.stars < 3) {
    entry.stars += 1;
    log(`${monsterCatalog[eventId].name} advanced to ${entry.stars} stars.`);
  } else {
    const bonusGold = rarityCatalog.special.duplicateGold * 2;
    state.gold += bonusGold;
    log(`${monsterCatalog[eventId].name} duplicate converted to ${bonusGold} gold.`);
  }

  renderRoster();
  updateAllUi();
}

function summonOrbs(count) {
  if (state.runOver) return;

  const cost = count * SUMMON_ORB_COST;
  if (state.orbs < cost) {
    log(`need ${cost} orbs.`);
    return;
  }

  state.orbs -= cost;

  const pulls = [];
  for (let i = 0; i < count; i += 1) {
    const rarity = rollSummonRarity();
    const monsterId = drawMonsterByRarity(rarity);
    pulls.push(monsterId);
    grantMonster(monsterId);
  }

  if (count === 1) {
    log(`summoned ${monsterCatalog[pulls[0]].name}.`);
  } else {
    const rareHits = pulls.filter((id) => ["epic", "legendary", "special"].includes(monsterCatalog[id].rarity)).length;
    log(`summon x10 complete (${rareHits} high rarity pulls).`);
  }

  renderRoster();
  updateAllUi();
}

function rollSummonRarity() {
  const total = rarityCatalog.common.weight + rarityCatalog.rare.weight + rarityCatalog.epic.weight + rarityCatalog.legendary.weight + rarityCatalog.special.weight;
  let roll = Math.random() * total;

  for (const rarity of RARITY_ORDER) {
    roll -= rarityCatalog[rarity].weight;
    if (roll <= 0) return rarity;
  }

  return "common";
}

function drawMonsterByRarity(rarity) {
  const pool = Object.entries(monsterCatalog)
    .filter(([id, monster]) => monster.rarity === rarity && !monster.eventOnly)
    .map(([id]) => id);

  if (!pool.length) return "slimey";
  return pool[Math.floor(Math.random() * pool.length)];
}

function grantMonster(monsterId) {
  const entry = collection[monsterId];
  const monster = monsterCatalog[monsterId];
  entry.copies += 1;

  if (!entry.owned) {
    entry.owned = true;
    entry.stars = 1;
    entry.level = 1;
    return;
  }

  if (entry.stars < 3) {
    entry.stars += 1;
    return;
  }

  state.gold += rarityCatalog[monster.rarity].duplicateGold;
}

function startWave() {
  if (state.runOver) return;
  state.waveActive = true;
  state.waveQueue = buildWaveQueue(state.wave);
  state.spawnedThisWave = 0;
  state.spawnInterval = Math.max(0.34, 0.95 - state.wave * 0.012);
  state.spawnCooldown = 0.1;
  state.autoWaveTimer = 0;
  log(`wave ${state.wave} began (${state.waveQueue.length} enemies).`);
}

function buildWaveQueue(wave) {
  const queue = [];
  const baseCount = 12 + Math.floor(wave * 2.2);

  for (let i = 0; i < baseCount; i += 1) {
    let type = "grunt";
    if (wave >= 3 && i % 6 === 0) type = "runner";
    if (wave >= 5 && i % 8 === 4) type = "tank";
    if (wave >= 7 && i % 7 === 5) type = "breaker";
    if (wave >= 9 && i % 9 === 2) type = "mage";
    if (wave >= 11 && i % 11 === 7) type = "shaman";
    queue.push(type);
  }

  if (wave % 3 === 0) {
    queue.splice(Math.max(2, Math.floor(baseCount * 0.6)), 0, "knome");
  }

  if (wave % 10 === 0) queue.push("boss_king");
  else if (wave % 5 === 0) queue.push("boss_archmage");

  return queue;
}

function spawnEnemy(type) {
  const enemyType = enemyTypes[type];
  if (!enemyType) return;

  const waveScale = 1 + state.wave * 0.21;
  const hp = 55 * enemyType.hpScale * waveScale;
  const speed = enemyType.speed * (1 + Math.min(0.3, state.wave * 0.01));

  const mesh = createEnemyMesh(enemyType);
  scene.add(mesh);

  const enemy = {
    id: state.nextEnemyId++,
    type,
    enemyType,
    mesh,
    hp,
    maxHp: hp,
    shield: 0,
    speed,
    damage: enemyType.damage,
    rewardGold: enemyType.rewardGold,
    rewardOrbs: enemyType.rewardOrbs,
    rewardStones: enemyType.rewardStones,
    rockDamage: enemyType.rockDamage,
    progress: 0,
    segment: 0,
    t: 0,
    slowTimer: 0,
    slowFactor: 1,
    stunTimer: 0,
    abilityCd: 3 + Math.random() * 2,
    attackCd: 0.25,
    isBoss: !!enemyType.isBoss
  };

  setEnemyProgress(enemy, 0);
  enemies.push(enemy);
}

function createEnemyMesh(enemyType) {
  const size = enemyType.isBoss ? 1.3 : 0.9;
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(size, 14, 12),
    new THREE.MeshToonMaterial({ color: enemyType.color, gradientMap: toonGradientMap })
  );

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.58, size * 0.95, 9),
    new THREE.MeshToonMaterial({ color: enemyType.capColor, gradientMap: toonGradientMap })
  );
  cap.position.y = size * 0.9;

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x281b16 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(size * 0.11, 8, 7), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-size * 0.25, size * 0.14, size * 0.7);
  eyeR.position.set(size * 0.25, size * 0.14, size * 0.7);

  group.add(body, cap, eyeL, eyeR);
  return group;
}

function setEnemyProgress(enemy, progress) {
  enemy.progress = Math.max(0, Math.min(pathEndProgress, progress));
  enemy.segment = Math.min(pathEndProgress - 1, Math.floor(enemy.progress));
  enemy.t = enemy.progress - enemy.segment;

  const from = pathWorld[enemy.segment];
  const to = pathWorld[enemy.segment + 1];
  enemy.mesh.position.lerpVectors(from, to, enemy.t);
  enemy.mesh.position.y = enemy.isBoss ? 1.05 : 0.7;
}

function getNextLiveBarrier(enemyProgress) {
  for (const barrier of barricades) {
    if (barrier.hp > 0 && barrier.pathIndex > enemyProgress + 0.001) return barrier;
  }
  return null;
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];

    if (enemy.stunTimer > 0) {
      enemy.stunTimer -= dt;
      enemy.mesh.rotation.y += dt * 8;
      continue;
    }

    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= dt;
      if (enemy.slowTimer <= 0) enemy.slowFactor = 1;
    }

    enemy.abilityCd -= dt;
    if (enemy.abilityCd <= 0) {
      triggerEnemyAbility(enemy);
    }

    const barrier = getNextLiveBarrier(enemy.progress);
    const speedMult = (state.globalSlowTimer > 0 ? 0.45 : 1) * (state.enemyHasteTimer > 0 ? 1.22 : 1);
    const speed = enemy.speed * enemy.slowFactor * speedMult;
    const deltaProgress = (speed * dt) / TILE;

    if (barrier && enemy.progress >= barrier.pathIndex - 0.1) {
      setEnemyProgress(enemy, barrier.pathIndex - 0.1);
      enemy.attackCd -= dt;
      if (enemy.attackCd <= 0) {
        enemy.attackCd = 0.72;
        damageBarrier(barrier, enemy.rockDamage * (state.enemyHasteTimer > 0 ? 1.25 : 1), enemy);
      }
      continue;
    }

    if (barrier && enemy.progress + deltaProgress >= barrier.pathIndex - 0.1) {
      setEnemyProgress(enemy, barrier.pathIndex - 0.1);
      enemy.attackCd = Math.max(0, enemy.attackCd - dt);
      continue;
    }

    const nextProgress = enemy.progress + deltaProgress;
    if (nextProgress >= pathEndProgress) {
      damageChest(enemy.damage);
      removeEnemy(i, false);
      continue;
    }

    setEnemyProgress(enemy, nextProgress);
    enemy.mesh.rotation.y += dt * 2.6;
  }
}

function triggerEnemyAbility(enemy) {
  enemy.abilityCd = enemy.isBoss ? 7.8 : 6.2;
  const ability = enemy.enemyType.ability;
  if (!ability) return;

  if (ability === "heal") {
    for (const other of enemies) {
      if (other === enemy) continue;
      if (other.mesh.position.distanceToSquared(enemy.mesh.position) > 6 * 6) continue;
      other.hp = Math.min(other.maxHp, other.hp + other.maxHp * 0.2);
    }
    spawnPulse(enemy.mesh.position, 0xb897ff, 0.6);
    return;
  }

  if (ability === "shield") {
    let front = null;
    for (const other of enemies) {
      if (!front || other.progress > front.progress) front = other;
    }
    if (front) {
      front.shield += front.maxHp * 0.22;
      spawnPulse(front.mesh.position, 0x89dcff, 0.55);
    }
    return;
  }

  if (ability === "mass_heal") {
    for (const other of enemies) {
      other.hp = Math.min(other.maxHp, other.hp + other.maxHp * 0.24);
      other.slowTimer = 0;
      other.slowFactor = 1;
    }
    spawnPulse(enemy.mesh.position, 0xc99dff, 0.75);
    log("boss cast mass heal.");
    return;
  }

  if (ability === "war_cry") {
    state.enemyHasteTimer = 3.8;
    spawnPulse(enemy.mesh.position, 0xff9b56, 0.78);
    log("boss cast war cry.");
  }
}

function damageBarrier(barrier, amount, sourceEnemy) {
  barrier.hp = Math.max(0, barrier.hp - amount);
  updateBarrierVisual(barrier);

  if (sourceEnemy.enemyType.ability === "slot_stun") {
    for (const hero of heroes) {
      const distSq = hero.mesh.position.distanceToSquared(barrier.mesh.position);
      if (distSq <= 5.7 * 5.7) {
        hero.disabledTimer = Math.max(hero.disabledTimer, 1.1);
      }
    }
  }

  if (barrier.hp <= 0) {
    spawnPulse(barrier.mesh.position, 0x8de3ff, 0.8);
    log("a defense stone was shattered.");
  }
}

function updateBarrierVisual(barrier) {
  const hpRatio = barrier.hp / barrier.maxHp;
  barrier.hpFill.scale.x = Math.max(0.01, hpRatio);
  barrier.hpFill.material.color.setHex(hpRatio > 0.5 ? 0x6fe7ff : hpRatio > 0.2 ? 0xffd46f : 0xff6f6f);

  if (hpRatio <= 0) {
    barrier.mesh.scale.setScalar(0.7);
    barrier.mesh.material.color.setHex(0x6f7f93);
    barrier.mesh.material.opacity = 0.42;
    barrier.mesh.material.transparent = true;
  } else {
    barrier.mesh.scale.setScalar(0.9 + hpRatio * 0.2);
    barrier.mesh.material.color.setHex(0x4caee8);
    barrier.mesh.material.opacity = 1;
    barrier.mesh.material.transparent = false;
  }
}

function updateHeroes(dt, elapsed) {
  for (const hero of heroes) {
    const visuals = hero.mesh.userData.visuals;
    if (visuals) {
      const bob = Math.sin(elapsed * 2.6 + hero.animSeed) * 0.09;
      hero.mesh.position.y = hero.baseY + bob;
      visuals.ring.rotation.z += dt * 1.7;
      const pulse = 1 + Math.sin(elapsed * 3.2 + hero.animSeed) * 0.08;
      visuals.iconSprite.scale.set(2.45 * pulse, 2.45 * pulse, 1);
    }

    if (hero.disabledTimer > 0) {
      hero.disabledTimer -= dt;
      hero.mesh.rotation.y += dt * 4;
      continue;
    }

    hero.cooldown -= dt;

    const monster = monsterCatalog[hero.monsterId];
    if (monster.special && hero.specialCd > 0) {
      hero.specialCd -= dt;
    }

    if (monster.special === "global_stun" && hero.specialCd <= 0 && enemies.length) {
      hero.specialCd = monster.specialCooldown;
      for (const enemy of enemies) {
        enemy.stunTimer = Math.max(enemy.stunTimer, 1.4);
      }
      spawnPulse(hero.mesh.position, 0xad91ff, 0.7);
      log("slime king stunned the enemy wave.");
    }

    if (hero.cooldown > 0) continue;

    const stats = getHeroStats(hero);
    const target = getTargetInRange(hero, stats.range);
    if (!target) {
      hero.cooldown = 0.08;
      continue;
    }

    hero.cooldown = stats.attackDelay;
    fireHero(hero, target, stats);
  }
}

function getHeroStats(hero) {
  const monster = monsterCatalog[hero.monsterId];
  const entry = collection[hero.monsterId];

  const starMult = 1 + (entry.stars - 1) * 0.55;
  const levelMult = 1 + (entry.level - 1) * 0.2;

  let damage = monster.baseDamage * starMult * levelMult;
  let fireRate = monster.fireRate * (1 + (entry.level - 1) * 0.03);
  const range = monster.range + (entry.level - 1) * 0.08;

  const buffs = getAdjacencyBuffs(hero.slotIndex);
  damage *= 1 + buffs.damage;
  fireRate *= 1 + buffs.speed;

  return {
    damage,
    attackDelay: 1 / Math.max(0.2, fireRate),
    range,
    splash: monster.splash || 0,
    slow: monster.slow || 0,
    slowDuration: monster.slowDuration || 0,
    stunChance: monster.stunChance || 0,
    stunDuration: monster.stunDuration || 0,
    tripleHit: monster.tripleHit || false,
    projectileColor: monster.projectileColor
  };
}

function getAdjacencyBuffs(slotIndex) {
  const slot = HERO_SLOTS[slotIndex];
  let damage = 0;
  let speed = 0;

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const key = `${slot.row + dr},${slot.col + dc}`;
      const adjIndex = SLOT_GRID_LOOKUP.get(key);
      if (adjIndex === undefined) continue;
      const adjMonsterId = slotOccupants[adjIndex];
      if (!adjMonsterId) continue;

      const adjMonster = monsterCatalog[adjMonsterId];
      const adjEntry = collection[adjMonsterId];
      if (adjMonster.supportDamage) damage += adjMonster.supportDamage * (1 + (adjEntry.stars - 1) * 0.35);
      if (adjMonster.supportSpeed) speed += adjMonster.supportSpeed * (1 + (adjEntry.stars - 1) * 0.35);
    }
  }

  return {
    damage: Math.min(1.8, damage),
    speed: Math.min(1.6, speed)
  };
}

function getTargetInRange(hero, range) {
  const rangeSq = range * range;
  let best = null;
  let bestProgress = -Infinity;

  for (const enemy of enemies) {
    const distSq = hero.mesh.position.distanceToSquared(enemy.mesh.position);
    if (distSq > rangeSq) continue;
    if (enemy.progress > bestProgress) {
      bestProgress = enemy.progress;
      best = enemy;
    }
  }

  return best;
}

function fireHero(hero, target, stats) {
  const origin = hero.mesh.position.clone();
  origin.y += 2.4;

  if (stats.tripleHit) {
    applyDamage(target, stats.damage * 0.52);
    applyDamage(target, stats.damage * 0.62);
    applyDamage(target, stats.damage * 0.86);
    spawnProjectile(origin, target.mesh.position, stats.projectileColor);
    return;
  }

  if (stats.splash > 0) {
    damageArea(target.mesh.position, stats.splash, stats.damage);
    spawnProjectile(origin, target.mesh.position, stats.projectileColor);
  } else {
    applyDamage(target, stats.damage);
    spawnProjectile(origin, target.mesh.position, stats.projectileColor);
  }

  if (stats.slow > 0) {
    target.slowFactor = Math.min(target.slowFactor, stats.slow);
    target.slowTimer = Math.max(target.slowTimer, stats.slowDuration);
  }

  if (stats.stunChance > 0 && Math.random() < stats.stunChance) {
    target.stunTimer = Math.max(target.stunTimer, stats.stunDuration);
  }
}

function applyDamage(enemy, amount) {
  let dmg = amount;
  if (enemy.shield > 0) {
    const blocked = Math.min(enemy.shield, dmg);
    enemy.shield -= blocked;
    dmg -= blocked;
  }
  if (dmg <= 0) return;

  enemy.hp -= dmg;
  if (enemy.hp <= 0) {
    const idx = enemies.indexOf(enemy);
    if (idx >= 0) removeEnemy(idx, true);
  }
}

function damageArea(center, radius, damage) {
  const radiusSq = radius * radius;
  for (const enemy of [...enemies]) {
    const distSq = enemy.mesh.position.distanceToSquared(center);
    if (distSq > radiusSq) continue;
    const dist = Math.sqrt(distSq);
    const falloff = 1 - (dist / radius) * 0.36;
    applyDamage(enemy, damage * Math.max(0.4, falloff));
  }
}

function spawnProjectile(from, to, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  mesh.position.copy(from);
  scene.add(mesh);

  projectiles.push({
    mesh,
    from: from.clone(),
    to: to.clone(),
    t: 0,
    duration: 0.16
  });
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const p = projectiles[i];
    p.t += dt / p.duration;

    if (p.t >= 1) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
      continue;
    }

    p.mesh.position.lerpVectors(p.from, p.to, p.t);
  }
}

function spawnPulse(position, color, life = 0.42) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.62, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(position.x, 0.1, position.z);
  scene.add(mesh);
  pulses.push({ mesh, t: 0, life });
}

function updatePulses(dt) {
  for (let i = pulses.length - 1; i >= 0; i -= 1) {
    const pulse = pulses[i];
    pulse.t += dt / pulse.life;

    if (pulse.t >= 1) {
      scene.remove(pulse.mesh);
      pulses.splice(i, 1);
      continue;
    }

    const s = 1 + pulse.t * 4.6;
    pulse.mesh.scale.set(s, s, s);
    pulse.mesh.material.opacity = 1 - pulse.t;
  }
}

function spawnFloorMark(position, color, radius, life) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 30),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(position.x, 0.06, position.z);
  scene.add(mesh);
  floorMarks.push({ mesh, life, age: 0 });
}

function updateFloorMarks(dt) {
  for (let i = floorMarks.length - 1; i >= 0; i -= 1) {
    const m = floorMarks[i];
    m.age += dt;
    if (m.age >= m.life) {
      scene.remove(m.mesh);
      floorMarks.splice(i, 1);
      continue;
    }

    const t = m.age / m.life;
    m.mesh.material.opacity = 0.35 * (1 - t);
  }
}

function removeEnemy(index, killed) {
  const enemy = enemies[index];
  if (!enemy) return;

  scene.remove(enemy.mesh);
  enemies.splice(index, 1);

  if (killed) {
    state.gold += enemy.rewardGold;
    state.orbs += enemy.rewardOrbs;
    state.stones += enemy.rewardStones;
    spawnPulse(enemy.mesh.position, enemy.isBoss ? 0xff9e57 : 0xffb98d, 0.55);
  }
}

function damageChest(amount) {
  state.chestHp = Math.max(0, state.chestHp - amount);
  state.chestHitFlash = 0.24;
  if (amount > 0) log(`chest hit for ${amount}.`);
  if (state.chestHp <= 0) triggerGameOver();
}

function castFireball(point) {
  if (state.pendingSpell !== "fireball") return;
  state.pendingSpell = null;

  if (state.gold < FIREBALL_COST) {
    log("not enough gold for fireball.");
    return;
  }

  state.gold -= FIREBALL_COST;
  state.fireballCd = 8;

  const radius = 5.8;
  const damage = 180 + state.wave * 16;
  damageArea(point, radius, damage);
  spawnPulse(point, 0xffb45f, 0.6);
  spawnFloorMark(point, 0xff8a3a, radius * 0.8, 0.55);
  log("fireball landed.");
}

function castFreeze() {
  if (state.runOver) return;
  if (state.freezeCd > 0) {
    log(`deep freeze cooldown ${state.freezeCd.toFixed(1)}s.`);
    return;
  }
  if (state.gold < FREEZE_COST) {
    log("not enough gold for deep freeze.");
    return;
  }

  state.gold -= FREEZE_COST;
  state.freezeCd = 15;
  state.globalSlowTimer = 4.2;

  spawnPulse(tileToWorld(6, 4, 0.08), 0x8fe7ff, 0.8);
  log("deep freeze cast.");
}

function castRepair() {
  if (state.runOver) return;
  if (state.repairCd > 0) {
    log(`repair cooldown ${state.repairCd.toFixed(1)}s.`);
    return;
  }
  if (state.gold < REPAIR_COST) {
    log("not enough gold to repair stones.");
    return;
  }

  let repaired = false;
  for (const barrier of barricades) {
    if (barrier.hp >= barrier.maxHp) continue;
    barrier.hp = Math.min(barrier.maxHp, barrier.hp + barrier.maxHp * 0.7);
    updateBarrierVisual(barrier);
    repaired = true;
  }

  if (!repaired) {
    log("all defense stones are already full hp.");
    return;
  }

  state.gold -= REPAIR_COST;
  state.repairCd = 13;
  spawnPulse(tileToWorld(6, 4, 0.08), 0x7dd6ff, 0.75);
  log("defense stones repaired.");
}

function updateWaveFlow(dt) {
  if (!state.waveActive) {
    state.autoWaveTimer -= dt;
    if (state.autoWaveTimer <= 0) startWave();
    return;
  }

  state.spawnCooldown -= dt;
  while (state.waveQueue.length > 0 && state.spawnCooldown <= 0) {
    const type = state.waveQueue.shift();
    spawnEnemy(type);
    state.spawnedThisWave += 1;
    state.spawnCooldown += state.spawnInterval;
  }

  if (state.waveQueue.length === 0 && enemies.length === 0) {
    const waveBonusGold = 40 + Math.round(state.wave * 4.5);
    const waveBonusOrbs = 3 + Math.floor(state.wave / 2);

    state.gold += waveBonusGold;
    state.orbs += waveBonusOrbs;
    state.wave += 1;
    state.waveActive = false;
    state.autoWaveTimer = 7;

    log(`wave clear. +${waveBonusGold} gold, +${waveBonusOrbs} orbs.`);
  }
}

function updateChestVisual(dt) {
  if (state.chestHitFlash > 0) state.chestHitFlash -= dt;
  const target = state.chestHitFlash > 0 ? 1.16 : 1;
  chestMesh.scale.lerp(new THREE.Vector3(target, target, target), 0.2);
}

function upgradeCost(monsterId) {
  const entry = collection[monsterId];
  const rarity = monsterCatalog[monsterId].rarity;
  const base = {
    common: 36,
    rare: 52,
    epic: 80,
    legendary: 115,
    special: 145
  }[rarity];

  return Math.round(base * Math.pow(1.22, entry.level - 1));
}

function upgradeSelectedHero() {
  const monsterId = state.selectedMonsterId;
  const hero = monsterId ? heroByMonster.get(monsterId) : null;
  if (!monsterId || !hero) return;

  const entry = collection[monsterId];
  if (entry.level >= 30) {
    log("hero level is maxed.");
    return;
  }

  const cost = upgradeCost(monsterId);
  if (state.gold < cost) {
    log(`need ${cost} gold.`);
    return;
  }

  state.gold -= cost;
  entry.level += 1;
  entry.investedGold += cost;
  log(`${monsterCatalog[monsterId].name} upgraded to lv ${entry.level}.`);

  renderRoster();
  updateAllUi();
}

function removeSelectedHero() {
  const monsterId = state.selectedMonsterId;
  if (!monsterId) return;
  const hero = heroByMonster.get(monsterId);
  if (!hero) return;

  clearHeroFromSlot(hero.slotIndex);
  log(`${monsterCatalog[monsterId].name} moved to bench.`);

  updateSelectionIndicator();
  renderRoster();
  updateAllUi();
}

function updateSelectionIndicator() {
  const hero = state.selectedMonsterId ? heroByMonster.get(state.selectedMonsterId) : null;
  if (!hero) {
    rangeIndicator.visible = false;
    return;
  }

  const stats = getHeroStats(hero);
  const pos = tileToWorld(HERO_SLOTS[hero.slotIndex].x, HERO_SLOTS[hero.slotIndex].y, 0.06);
  rangeIndicator.visible = true;
  rangeIndicator.position.copy(pos);
  rangeIndicator.scale.set(stats.range, stats.range, stats.range);
}

function triggerGameOver() {
  state.runOver = true;
  state.waveActive = false;
  state.waveQueue.length = 0;
  ui.gameOver.classList.remove("hidden");
  log("the chest has fallen.");
}

function restartRun() {
  for (const enemy of enemies) scene.remove(enemy.mesh);
  for (const projectile of projectiles) scene.remove(projectile.mesh);
  for (const pulse of pulses) scene.remove(pulse.mesh);
  for (const mark of floorMarks) scene.remove(mark.mesh);
  enemies.length = 0;
  projectiles.length = 0;
  pulses.length = 0;
  floorMarks.length = 0;

  for (let i = heroes.length - 1; i >= 0; i -= 1) {
    scene.remove(heroes[i].mesh);
  }
  heroes.length = 0;
  heroByMonster.clear();
  slotOccupants.fill(null);

  state.gold = 350;
  state.orbs = 120;
  state.stones = 0;
  state.chestHp = 120;
  state.wave = 1;
  state.waveActive = false;
  state.waveQueue.length = 0;
  state.spawnCooldown = 0;
  state.autoWaveTimer = 5;
  state.gameSpeed = 1;
  state.fireballCd = 0;
  state.freezeCd = 0;
  state.repairCd = 0;
  state.pendingSpell = null;
  state.globalSlowTimer = 0;
  state.enemyHasteTimer = 0;
  state.runOver = false;
  state.selectedMonsterId = null;
  state.selectedSlotIndex = null;
  state.chestHitFlash = 0;

  for (const barrier of barricades) {
    barrier.hp = barrier.maxHp;
    updateBarrierVisual(barrier);
  }

  collection.slimey.owned = true;
  collection.slimey.stars = Math.max(1, collection.slimey.stars);
  collection.mocha.owned = true;
  collection.mocha.stars = Math.max(1, collection.mocha.stars);
  collection.spikey.owned = true;
  collection.spikey.stars = Math.max(1, collection.spikey.stars);

  seedInitialLineup();
  ui.speedBtn.textContent = "speed x1";
  ui.gameOver.classList.add("hidden");
  log("new run started.");

  updateSelectionIndicator();
  renderRoster();
  updateAllUi();
  saveGame();
}

function updateAllUi() {
  ui.gold.textContent = Math.floor(state.gold).toString();
  ui.orbs.textContent = Math.floor(state.orbs).toString();
  ui.stones.textContent = Math.floor(state.stones).toString();
  ui.chest.textContent = `${Math.ceil(state.chestHp)} / ${state.chestHpMax}`;
  ui.wave.textContent = `${state.wave}${state.waveActive ? " (live)" : ""}`;
  ui.enemies.textContent = `${enemies.length}${state.waveQueue.length > 0 ? ` + ${state.waveQueue.length}` : ""}`;

  ui.startWaveBtn.disabled = state.runOver || state.waveActive;
  ui.startWaveBtn.textContent = state.waveActive
    ? "wave active"
    : `start wave${state.autoWaveTimer > 0 ? ` (${Math.ceil(state.autoWaveTimer)})` : ""}`;

  ui.fireballBtn.disabled = state.runOver || state.fireballCd > 0;
  ui.fireballBtn.textContent = state.pendingSpell === "fireball"
    ? "click board"
    : state.fireballCd > 0
      ? `fireball (${state.fireballCd.toFixed(1)}s)`
      : `fireball (${FIREBALL_COST})`;

  ui.freezeBtn.disabled = state.runOver || state.freezeCd > 0;
  ui.freezeBtn.textContent = state.freezeCd > 0 ? `deep freeze (${state.freezeCd.toFixed(1)}s)` : `deep freeze (${FREEZE_COST})`;

  ui.repairBtn.disabled = state.runOver || state.repairCd > 0;
  ui.repairBtn.textContent = state.repairCd > 0 ? `repair stone (${state.repairCd.toFixed(1)}s)` : `repair stone (${REPAIR_COST})`;

  ui.summonBtn.disabled = state.runOver;
  ui.summon10Btn.disabled = state.runOver;
  ui.summonBtn.textContent = `summon x1 (${SUMMON_ORB_COST} orbs)`;
  ui.summon10Btn.textContent = `summon x10 (${SUMMON_ORB_COST * 10} orbs)`;

  const eventEntry = collection[state.eventMonsterId];
  const eventCost = getEventSummonCost(Math.max(eventEntry.stars, 0));
  ui.specialSummonBtn.textContent = `${eventEntry.owned ? "event star up" : "event summon"} (${eventCost})`;
  ui.specialSummonBtn.disabled = state.runOver;
  ui.eventText.textContent = `event monster: ${monsterCatalog[state.eventMonsterId].name} (${Math.floor(state.stones)} / ${eventCost} stones)`;

  updateSelectedHeroPanel();
}

function updateSelectedHeroPanel() {
  const monsterId = state.selectedMonsterId;
  const hero = monsterId ? heroByMonster.get(monsterId) : null;

  if (!monsterId || !hero) {
    ui.towerInfo.textContent = "none";
    ui.upgradeBtn.disabled = true;
    ui.removeBtn.disabled = true;
    ui.hint.textContent = "click a roster card, then click a slot to place it.";
    return;
  }

  const entry = collection[monsterId];
  const monster = monsterCatalog[monsterId];
  const stats = getHeroStats(hero);
  const slot = HERO_SLOTS[hero.slotIndex];

  const nextCost = entry.level >= 30 ? "max" : upgradeCost(monsterId);
  ui.towerInfo.textContent = `${monster.name} | ${monster.rarity} | stars ${entry.stars} | lv ${entry.level}\n` +
    `dmg ${stats.damage.toFixed(0)} | rng ${stats.range.toFixed(1)} | row ${slot.row + 1} col ${slot.col + 1}\n` +
    `next upgrade ${nextCost}`;

  ui.upgradeBtn.disabled = entry.level >= 30;
  ui.removeBtn.disabled = false;
  ui.hint.textContent = hero.disabledTimer > 0 ? "hero stunned by a breaker." : "adjacent mighty/speedy/hellhound grant aura buffs.";
}

function renderRoster() {
  const ids = Object.keys(monsterCatalog).sort((a, b) => {
    const mA = monsterCatalog[a];
    const mB = monsterCatalog[b];
    const rankA = RARITY_ORDER.indexOf(mA.rarity);
    const rankB = RARITY_ORDER.indexOf(mB.rarity);
    if (rankA !== rankB) return rankA - rankB;
    return mA.name.localeCompare(mB.name);
  });

  const cards = [];

  for (const id of ids) {
    const monster = monsterCatalog[id];
    const entry = collection[id];
    const selected = state.selectedMonsterId === id;
    const placedHero = heroByMonster.get(id);

    const color = `#${new THREE.Color(monster.color).getHexString()}`;
    const accent = `#${new THREE.Color(monster.accent).getHexString()}`;

    cards.push(`
      <div class="roster-card ${entry.owned ? "" : "locked"} ${selected ? "selected" : ""}" data-monster-id="${id}">
        <div class="roster-head">
          <div class="roster-icon" style="background: radial-gradient(circle at 30% 30%, ${accent}, ${color});"></div>
          <div class="roster-meta">
            <div class="roster-name">${monster.name}</div>
            <div class="roster-rarity">${monster.rarity}</div>
            <div class="roster-level">lv ${entry.level}</div>
          </div>
        </div>
        <div class="roster-stars">stars ${entry.stars}</div>
        ${placedHero ? `<div class="roster-onboard">on board r${HERO_SLOTS[placedHero.slotIndex].row + 1}c${HERO_SLOTS[placedHero.slotIndex].col + 1}</div>` : ""}
      </div>
    `);
  }

  ui.roster.innerHTML = cards.join("");
}

function log(message) {
  ui.log.textContent = message;
}

function saveGame() {
  const save = {
    gold: state.gold,
    orbs: state.orbs,
    stones: state.stones,
    chestHp: state.chestHp,
    wave: state.wave,
    collection,
    slotOccupants,
    barriers: barricades.map((b) => b.hp)
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // ignore storage failures
  }
}

function loadGame() {
  let parsed;
  try {
    parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  } catch {
    return;
  }

  if (!parsed || typeof parsed !== "object") return;

  state.gold = typeof parsed.gold === "number" ? Math.max(0, parsed.gold) : state.gold;
  state.orbs = typeof parsed.orbs === "number" ? Math.max(0, parsed.orbs) : state.orbs;
  state.stones = typeof parsed.stones === "number" ? Math.max(0, parsed.stones) : state.stones;
  state.chestHp = typeof parsed.chestHp === "number" ? Math.max(1, Math.min(state.chestHpMax, parsed.chestHp)) : state.chestHp;
  state.wave = typeof parsed.wave === "number" ? Math.max(1, Math.floor(parsed.wave)) : state.wave;

  if (parsed.collection && typeof parsed.collection === "object") {
    for (const [id, data] of Object.entries(parsed.collection)) {
      if (!collection[id] || !data || typeof data !== "object") continue;
      collection[id].owned = !!data.owned;
      collection[id].stars = Math.max(0, Math.min(3, Number(data.stars) || 0));
      collection[id].level = Math.max(1, Math.min(30, Number(data.level) || 1));
      collection[id].copies = Math.max(0, Number(data.copies) || 0);
      collection[id].investedGold = Math.max(0, Number(data.investedGold) || 0);
    }
  }

  if (Array.isArray(parsed.barriers)) {
    for (let i = 0; i < Math.min(parsed.barriers.length, barricades.length); i += 1) {
      const hp = Number(parsed.barriers[i]);
      if (!Number.isFinite(hp)) continue;
      barricades[i].hp = Math.max(0, Math.min(barricades[i].maxHp, hp));
      updateBarrierVisual(barricades[i]);
    }
  }

  if (Array.isArray(parsed.slotOccupants)) {
    for (const oldHero of heroes) scene.remove(oldHero.mesh);
    heroes.length = 0;
    heroByMonster.clear();
    slotOccupants.fill(null);

    for (let i = 0; i < Math.min(parsed.slotOccupants.length, HERO_SLOTS.length); i += 1) {
      const monsterId = parsed.slotOccupants[i];
      if (typeof monsterId !== "string") continue;
      if (!monsterCatalog[monsterId]) continue;
      if (!collection[monsterId].owned) continue;
      if (heroByMonster.has(monsterId)) continue;
      placeHeroInSlot(monsterId, i);
    }
  }

  collection.slimey.owned = true;
  collection.slimey.stars = Math.max(1, collection.slimey.stars);
  collection.mocha.owned = true;
  collection.mocha.stars = Math.max(1, collection.mocha.stars);
  collection.spikey.owned = true;
  collection.spikey.stars = Math.max(1, collection.spikey.stars);
}

function tick() {
  const baseDt = Math.min(clock.getDelta(), 0.05);
  const dt = baseDt * state.gameSpeed;
  const elapsed = clock.elapsedTime;

  if (!state.runOver) {
    state.gold += dt * 3.6;

    if (state.fireballCd > 0) state.fireballCd = Math.max(0, state.fireballCd - dt);
    if (state.freezeCd > 0) state.freezeCd = Math.max(0, state.freezeCd - dt);
    if (state.repairCd > 0) state.repairCd = Math.max(0, state.repairCd - dt);
    if (state.globalSlowTimer > 0) state.globalSlowTimer = Math.max(0, state.globalSlowTimer - dt);
    if (state.enemyHasteTimer > 0) state.enemyHasteTimer = Math.max(0, state.enemyHasteTimer - dt);

    updateWaveFlow(dt);
    updateHeroes(dt, elapsed);
    updateEnemies(dt);
    updateProjectiles(dt);
    updatePulses(dt);
    updateFloorMarks(dt);

    state.saveTimer += baseDt;
    if (state.saveTimer >= 5) {
      state.saveTimer = 0;
      saveGame();
    }
  } else {
    updateHeroes(dt, elapsed);
    updateProjectiles(dt);
    updatePulses(dt);
    updateFloorMarks(dt);
  }

  updateChestVisual(dt);
  updateSelectionIndicator();
  updateAllUi();

  renderer.render(scene, camera);
}
