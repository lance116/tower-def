import * as THREE from "three";

const canvas = document.getElementById("gameCanvas");
const ui = {
  gold: document.getElementById("goldValue"),
  chest: document.getElementById("chestValue"),
  wave: document.getElementById("waveValue"),
  enemies: document.getElementById("enemyValue"),
  summonBtn: document.getElementById("summonBtn"),
  startWaveBtn: document.getElementById("startWaveBtn"),
  speedBtn: document.getElementById("speedBtn"),
  fireballBtn: document.getElementById("fireballBtn"),
  freezeBtn: document.getElementById("freezeBtn"),
  towerInfo: document.getElementById("towerInfo"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  sellBtn: document.getElementById("sellBtn"),
  log: document.getElementById("logText"),
  gameOver: document.getElementById("gameOver"),
  restartBtn: document.getElementById("restartBtn")
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1312);
scene.fog = new THREE.Fog(0x0c1312, 60, 180);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 54, 42);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xc9ffe8, 0x17211f, 0.75));
const sun = new THREE.DirectionalLight(0xfff4dd, 1.15);
sun.position.set(35, 55, 14);
scene.add(sun);

const GRID_W = 13;
const GRID_H = 9;
const TILE = 4;
const SUMMON_COST = 50;
const FIREBALL_COST = 80;
const FREEZE_COST = 120;
const SAVE_KEY = "idle_summoner_td_save_v1";

const PATH_TILES = [
  { x: 0, y: 4 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 4 },
  { x: 3, y: 3 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
  { x: 6, y: 3 },
  { x: 6, y: 4 },
  { x: 6, y: 5 },
  { x: 7, y: 5 },
  { x: 8, y: 5 },
  { x: 9, y: 5 },
  { x: 10, y: 5 },
  { x: 10, y: 4 },
  { x: 10, y: 3 },
  { x: 11, y: 3 },
  { x: 12, y: 3 }
];

const towerCatalog = {
  stone: {
    name: "Stone Guardian",
    color: 0xd8d2b3,
    damage: 17,
    range: 6.2,
    fireRate: 1.4,
    splash: 0,
    slow: 0,
    slowDuration: 0
  },
  ember: {
    name: "Ember Witch",
    color: 0xf49e64,
    damage: 14,
    range: 6,
    fireRate: 0.9,
    splash: 2.8,
    slow: 0,
    slowDuration: 0
  },
  frost: {
    name: "Frost Shade",
    color: 0x86d3ff,
    damage: 11,
    range: 6.7,
    fireRate: 1,
    splash: 0,
    slow: 0.55,
    slowDuration: 1.5
  }
};

const rarityCatalog = {
  common: { label: "Common", damageMult: 1, color: 0xc8d0cf, upgradeScale: 1 },
  rare: { label: "Rare", damageMult: 1.25, color: 0x5ec3ff, upgradeScale: 1.2 },
  epic: { label: "Epic", damageMult: 1.6, color: 0xffc95d, upgradeScale: 1.5 }
};

const state = {
  gold: 130,
  chestHp: 100,
  chestHpMax: 100,
  wave: 1,
  passiveGoldRate: 4.2,
  gameSpeed: 1,
  waveActive: false,
  autoWaveTimer: 4,
  queueToSpawn: 0,
  spawnCooldown: 0,
  spawnInterval: 1.15,
  spawnedThisWave: 0,
  selectedTower: null,
  pendingTower: null,
  pendingSpell: null,
  fireballCd: 0,
  freezeCd: 0,
  globalSlowTimer: 0,
  runOver: false,
  nextTowerId: 1,
  nextEnemyId: 1,
  chestHitFlash: 0,
  saveTimer: 0
};

const towers = [];
const enemies = [];
const projectiles = [];
const pulses = [];

const tileMeshes = [];
const buildTiles = [];
const pathTileSet = new Set(PATH_TILES.map((tile) => key(tile.x, tile.y)));
const occupiedTiles = new Map();

const pathWorld = PATH_TILES.map((tile) => tileToWorld(tile.x, tile.y, 0.84));
const pathLengths = [];
for (let i = 0; i < pathWorld.length - 1; i += 1) {
  pathLengths.push(pathWorld[i].distanceTo(pathWorld[i + 1]));
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let groundPlane;
let chestMesh;

const rangeIndicator = new THREE.Mesh(
  new THREE.RingGeometry(0.9, 1.1, 48),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
);
rangeIndicator.rotation.x = -Math.PI / 2;
rangeIndicator.visible = false;
scene.add(rangeIndicator);

buildBoard();
wireUi();
loadGame();
updateAllUi();

const clock = new THREE.Clock();
renderer.setAnimationLoop(tick);

function key(x, y) {
  return `${x},${y}`;
}

function tileToWorld(x, y, yOffset = 0) {
  return new THREE.Vector3((x - (GRID_W - 1) / 2) * TILE, yOffset, (y - (GRID_H - 1) / 2) * TILE);
}

function worldToTile(point) {
  return {
    x: Math.round(point.x / TILE + (GRID_W - 1) / 2),
    y: Math.round(point.z / TILE + (GRID_H - 1) / 2)
  };
}

function buildBoard() {
  const boardGroup = new THREE.Group();

  const colorByKind = {
    build: 0x264032,
    path: 0x6f6357,
    spawn: 0x355f87,
    chest: 0x8b6f2d
  };

  const tileGeo = new THREE.BoxGeometry(TILE * 0.95, 0.8, TILE * 0.95);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const k = key(x, y);
      let kind = "build";
      if (pathTileSet.has(k)) kind = "path";
      if (k === key(PATH_TILES[0].x, PATH_TILES[0].y)) kind = "spawn";
      if (k === key(PATH_TILES[PATH_TILES.length - 1].x, PATH_TILES[PATH_TILES.length - 1].y)) kind = "chest";

      const tile = new THREE.Mesh(
        tileGeo,
        new THREE.MeshPhongMaterial({ color: colorByKind[kind], shininess: kind === "path" ? 8 : 25 })
      );
      const pos = tileToWorld(x, y, -0.4);
      tile.position.copy(pos);
      tile.receiveShadow = true;
      tile.userData = { tileX: x, tileY: y, tileKind: kind };

      tileMeshes.push(tile);
      boardGroup.add(tile);

      if (kind === "build") buildTiles.push({ x, y });
    }
  }

  scene.add(boardGroup);

  const spawnPos = tileToWorld(PATH_TILES[0].x, PATH_TILES[0].y, 0.2);
  const spawnPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.35, 0.25, 24),
    new THREE.MeshBasicMaterial({ color: 0x5da2ff, transparent: true, opacity: 0.7 })
  );
  spawnPad.position.copy(spawnPos);
  scene.add(spawnPad);

  const chestPos = tileToWorld(PATH_TILES[PATH_TILES.length - 1].x, PATH_TILES[PATH_TILES.length - 1].y, 1.35);
  chestMesh = new THREE.Group();
  const chestBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.8, 1.9),
    new THREE.MeshPhongMaterial({ color: 0x7b4723, shininess: 12 })
  );
  const chestLid = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.7, 1.92),
    new THREE.MeshPhongMaterial({ color: 0xb8822f, shininess: 35 })
  );
  chestLid.position.y = 1.05;
  chestMesh.add(chestBase, chestLid);
  chestMesh.position.copy(chestPos);
  scene.add(chestMesh);

  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.3, GRID_H * TILE * 1.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  scene.add(groundPlane);

  const ambientPattern = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.45, GRID_H * TILE * 1.45),
    new THREE.MeshPhongMaterial({ color: 0x14201d, transparent: true, opacity: 0.6 })
  );
  ambientPattern.rotation.x = -Math.PI / 2;
  ambientPattern.position.y = -0.85;
  scene.add(ambientPattern);
}

function wireUi() {
  ui.summonBtn.addEventListener("click", summonTowerCard);
  ui.startWaveBtn.addEventListener("click", () => {
    if (state.waveActive || state.runOver) return;
    startWave();
  });
  ui.speedBtn.addEventListener("click", () => {
    state.gameSpeed = state.gameSpeed === 1 ? 2 : 1;
    ui.speedBtn.textContent = `Speed x${state.gameSpeed}`;
  });
  ui.fireballBtn.addEventListener("click", () => {
    if (state.runOver) return;
    if (state.fireballCd > 0) {
      log(`Fireball cooling down (${state.fireballCd.toFixed(1)}s).`);
      return;
    }
    if (state.gold < FIREBALL_COST) {
      log("Not enough gold for Fireball.");
      return;
    }
    state.pendingSpell = "fireball";
    state.pendingTower = null;
    log("Fireball armed. Click a spot on the board.");
  });
  ui.freezeBtn.addEventListener("click", castFreeze);
  ui.upgradeBtn.addEventListener("click", upgradeSelectedTower);
  ui.sellBtn.addEventListener("click", sellSelectedTower);
  ui.restartBtn.addEventListener("click", restartRun);

  canvas.addEventListener("pointerdown", onBoardClick);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("beforeunload", saveGame);
}

function summonTowerCard() {
  if (state.runOver) return;

  if (state.gold < SUMMON_COST) {
    log("Need more gold to summon.");
    return;
  }
  if (!hasEmptyBuildSlot()) {
    log("No empty build tile available.");
    return;
  }

  state.gold -= SUMMON_COST;
  const rarityRoll = Math.random();
  let rarity = "common";
  if (rarityRoll > 0.95) rarity = "epic";
  else if (rarityRoll > 0.72) rarity = "rare";

  const types = Object.keys(towerCatalog);
  const type = types[Math.floor(Math.random() * types.length)];

  state.pendingTower = { type, rarity };
  state.pendingSpell = null;

  log(`Summoned ${rarityCatalog[rarity].label} ${towerCatalog[type].name}. Click a build tile.`);
  updateAllUi();
}

function hasEmptyBuildSlot() {
  for (const tile of buildTiles) {
    if (!occupiedTiles.has(key(tile.x, tile.y))) return true;
  }
  return false;
}

function onBoardClick(event) {
  if (state.runOver) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (state.pendingSpell === "fireball") {
    const groundHit = raycaster.intersectObject(groundPlane, false)[0];
    if (groundHit) castFireball(groundHit.point);
    return;
  }

  const hits = raycaster.intersectObjects(tileMeshes, false);
  if (!hits.length) return;

  const tileX = hits[0].object.userData.tileX;
  const tileY = hits[0].object.userData.tileY;
  const tileKind = hits[0].object.userData.tileKind;
  const k = key(tileX, tileY);

  if (state.pendingTower) {
    if (tileKind !== "build") {
      log("Tower can only be placed on green build tiles.");
      return;
    }
    if (occupiedTiles.has(k)) {
      log("That tile is occupied.");
      return;
    }
    addTower(state.pendingTower.type, state.pendingTower.rarity, tileX, tileY, 1, SUMMON_COST, false);
    state.pendingTower = null;
    updateAllUi();
    return;
  }

  const selected = occupiedTiles.get(k);
  if (selected) {
    state.selectedTower = selected;
    updateRangeIndicator();
    updateTowerPanel();
  } else {
    clearSelection();
  }
}

function addTower(type, rarity, tileX, tileY, level = 1, spent = SUMMON_COST, silent = false) {
  const worldPos = tileToWorld(tileX, tileY, 0);
  const mesh = createTowerMesh(type, rarity);
  mesh.position.set(worldPos.x, 0, worldPos.z);
  scene.add(mesh);

  const tower = {
    id: state.nextTowerId++,
    type,
    rarity,
    tileX,
    tileY,
    level,
    spent,
    cooldown: Math.random() * 0.4,
    mesh
  };

  tower.mesh.scale.setScalar(1 + (level - 1) * 0.08);

  towers.push(tower);
  occupiedTiles.set(key(tileX, tileY), tower);

  state.selectedTower = tower;
  updateRangeIndicator();
  updateTowerPanel();

  if (!silent) {
    log(`${rarityCatalog[rarity].label} ${towerCatalog[type].name} deployed.`);
  }

  return tower;
}

function createTowerMesh(type, rarity) {
  const rarityColor = rarityCatalog[rarity].color;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.2, 0.7, 22),
    new THREE.MeshPhongMaterial({ color: 0x2e3d37, shininess: 20 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.12, 10, 24),
    new THREE.MeshBasicMaterial({ color: rarityColor })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.37;

  const coreColor = towerCatalog[type].color;
  const coreMat = new THREE.MeshPhongMaterial({ color: coreColor, shininess: 90 });

  const group = new THREE.Group();

  if (type === "stone") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 2.4, 16), coreMat);
    body.position.y = 1.45;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 18, 16), coreMat);
    head.position.y = 2.8;
    group.add(body, head);
  }

  if (type === "ember") {
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.5, 18), coreMat);
    body.position.y = 1.7;
    const crest = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.12, 12, 20),
      new THREE.MeshBasicMaterial({ color: 0xffcf8e })
    );
    crest.rotation.x = Math.PI / 2;
    crest.position.y = 2.9;
    group.add(body, crest);
  }

  if (type === "frost") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.82, 2.5, 8), coreMat);
    body.position.y = 1.62;
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65),
      new THREE.MeshPhongMaterial({ color: 0xd5f4ff, shininess: 100 })
    );
    crystal.position.y = 3;
    group.add(body, crystal);
  }

  group.add(base, ring);
  return group;
}

function computeTowerStats(tower) {
  const base = towerCatalog[tower.type];
  const rarity = rarityCatalog[tower.rarity];
  const levelBonus = 1 + (tower.level - 1) * 0.52;
  const damage = base.damage * rarity.damageMult * levelBonus;
  const range = base.range + (tower.level - 1) * 0.26;
  const attackDelay = 1 / (base.fireRate * (1 + (tower.level - 1) * 0.07));

  return {
    damage,
    range,
    attackDelay,
    splash: base.splash,
    slow: base.slow,
    slowDuration: base.slowDuration
  };
}

function upgradeCost(tower) {
  const rarity = rarityCatalog[tower.rarity];
  return Math.round(26 * Math.pow(1.68, tower.level - 1) * rarity.upgradeScale);
}

function upgradeSelectedTower() {
  if (!state.selectedTower || state.runOver) return;
  const tower = state.selectedTower;

  if (tower.level >= 10) {
    log("Tower is already max level.");
    return;
  }

  const cost = upgradeCost(tower);
  if (state.gold < cost) {
    log(`Need ${cost} gold for that upgrade.`);
    return;
  }

  state.gold -= cost;
  tower.level += 1;
  tower.spent += cost;
  tower.mesh.scale.setScalar(1 + (tower.level - 1) * 0.08);

  updateTowerPanel();
  updateRangeIndicator();
  log(`${towerCatalog[tower.type].name} upgraded to Lv ${tower.level}.`);
}

function sellSelectedTower() {
  if (!state.selectedTower || state.runOver) return;

  const tower = state.selectedTower;
  const refund = Math.round(tower.spent * 0.65);

  state.gold += refund;

  const idx = towers.indexOf(tower);
  if (idx >= 0) towers.splice(idx, 1);
  occupiedTiles.delete(key(tower.tileX, tower.tileY));
  scene.remove(tower.mesh);

  clearSelection();
  log(`Tower sold for ${refund} gold.`);
}

function clearSelection() {
  state.selectedTower = null;
  rangeIndicator.visible = false;
  updateTowerPanel();
}

function updateRangeIndicator() {
  if (!state.selectedTower) {
    rangeIndicator.visible = false;
    return;
  }

  const stats = computeTowerStats(state.selectedTower);
  const center = tileToWorld(state.selectedTower.tileX, state.selectedTower.tileY, 0.06);

  rangeIndicator.visible = true;
  rangeIndicator.position.copy(center);
  rangeIndicator.scale.set(stats.range, stats.range, stats.range);
}

function updateTowerPanel() {
  if (!state.selectedTower) {
    ui.towerInfo.textContent = "None";
    ui.upgradeBtn.disabled = true;
    ui.sellBtn.disabled = true;
    return;
  }

  const tower = state.selectedTower;
  const stats = computeTowerStats(tower);
  const nextUpgradeCost = tower.level >= 10 ? "MAX" : upgradeCost(tower);

  ui.towerInfo.textContent = `${towerCatalog[tower.type].name} | ${rarityCatalog[tower.rarity].label} | Lv ${tower.level} | DMG ${stats.damage.toFixed(
    0
  )} | RNG ${stats.range.toFixed(1)} | Next ${nextUpgradeCost}`;

  ui.upgradeBtn.disabled = tower.level >= 10;
  ui.sellBtn.disabled = false;
}

function getWaveEnemyCount(wave) {
  return 8 + Math.floor(wave * 2.2);
}

function startWave() {
  state.waveActive = true;
  state.queueToSpawn = getWaveEnemyCount(state.wave);
  state.spawnedThisWave = 0;
  state.spawnInterval = Math.max(0.42, 1.2 - state.wave * 0.022);
  state.spawnCooldown = 0.15;
  state.autoWaveTimer = 0;
  log(`Wave ${state.wave} begins. ${state.queueToSpawn} enemies incoming.`);
}

function spawnEnemy() {
  const ordinal = state.spawnedThisWave + 1;
  const isBoss = ordinal % 10 === 0;

  const hpBase = 46 + state.wave * 15;
  const speedBase = 2.05 + state.wave * 0.05;
  const rewardBase = 8 + state.wave * 1.7;

  const hp = isBoss ? hpBase * 4.2 : hpBase;
  const speed = isBoss ? speedBase * 0.8 : speedBase;
  const reward = isBoss ? rewardBase * 4 : rewardBase;
  const size = isBoss ? 2.05 : 1.25;
  const damage = isBoss ? 11 : 4;

  const mesh = createEnemyMesh(isBoss);
  const start = pathWorld[0];
  mesh.position.set(start.x, size * 0.54, start.z);
  scene.add(mesh);

  enemies.push({
    id: state.nextEnemyId++,
    mesh,
    hp,
    maxHp: hp,
    speed,
    reward,
    size,
    damage,
    segment: 0,
    t: 0,
    progress: 0,
    slowTimer: 0,
    slowFactor: 1,
    isBoss
  });
}

function createEnemyMesh(isBoss) {
  const size = isBoss ? 1.25 : 0.82;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(size, 14, 12),
    new THREE.MeshPhongMaterial({ color: isBoss ? 0x8f2f1e : 0xbf5346, shininess: isBoss ? 18 : 8 })
  );
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.55, size * 0.95, 9),
    new THREE.MeshPhongMaterial({ color: isBoss ? 0xd39a45 : 0xe2b06f, shininess: 60 })
  );
  top.position.y = size * 0.92;

  const group = new THREE.Group();
  group.add(body, top);
  return group;
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    let removed = false;

    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= dt;
      if (enemy.slowTimer <= 0) enemy.slowFactor = 1;
    }

    const slowMult = state.globalSlowTimer > 0 ? 0.45 : 1;
    const speed = enemy.speed * enemy.slowFactor * slowMult;

    enemy.t += (speed * dt) / pathLengths[enemy.segment];

    while (enemy.t >= 1) {
      enemy.segment += 1;
      enemy.t -= 1;

      if (enemy.segment >= pathWorld.length - 1) {
        damageChest(enemy.damage);
        removeEnemyByIndex(i, false);
        removed = true;
        break;
      }
    }

    if (removed) continue;

    const from = pathWorld[enemy.segment];
    const to = pathWorld[enemy.segment + 1];
    enemy.mesh.position.lerpVectors(from, to, enemy.t);
    enemy.mesh.position.y = enemy.size * 0.54;
    enemy.mesh.rotation.y += dt * 2.6;

    enemy.progress = enemy.segment + enemy.t;
  }
}

function damageChest(amount) {
  state.chestHp = Math.max(0, state.chestHp - amount);
  state.chestHitFlash = 0.22;
  log(`Chest hit for ${amount.toFixed(0)}.`);
  if (state.chestHp <= 0) {
    triggerGameOver();
  }
}

function removeEnemyByIndex(index, killed) {
  const enemy = enemies[index];
  if (!enemy) return;

  scene.remove(enemy.mesh);
  enemies.splice(index, 1);

  if (killed) {
    state.gold += enemy.reward;
    spawnPulse(enemy.mesh.position, 0xffb98d, 0.6);
  }
}

function getPriorityTarget(tower, range) {
  const towerPos = tower.mesh.position;
  const rangeSq = range * range;

  let best = null;
  let bestProgress = -Infinity;

  for (const enemy of enemies) {
    const distSq = towerPos.distanceToSquared(enemy.mesh.position);
    if (distSq > rangeSq) continue;

    if (enemy.progress > bestProgress) {
      bestProgress = enemy.progress;
      best = enemy;
    }
  }

  return best;
}

function updateTowers(dt) {
  for (const tower of towers) {
    tower.cooldown -= dt;
    if (tower.cooldown > 0) continue;

    const stats = computeTowerStats(tower);
    const target = getPriorityTarget(tower, stats.range);

    if (!target) {
      tower.cooldown = 0.08;
      continue;
    }

    tower.cooldown = stats.attackDelay;
    fireTower(tower, target, stats);
  }
}

function fireTower(tower, target, stats) {
  const from = tower.mesh.position.clone();
  from.y = 2.5;

  if (tower.type === "ember") {
    damageArea(target.mesh.position, stats.splash, stats.damage);
    spawnProjectile(from, target.mesh.position, 0xff9e69);
    spawnPulse(target.mesh.position, 0xff8e58, 0.36);
    return;
  }

  applyDamage(target, stats.damage);

  if (tower.type === "frost") {
    target.slowFactor = Math.min(target.slowFactor, stats.slow);
    target.slowTimer = Math.max(target.slowTimer, stats.slowDuration);
    spawnProjectile(from, target.mesh.position, 0x8fe1ff);
    return;
  }

  spawnProjectile(from, target.mesh.position, 0xe6d7a6);
}

function damageArea(center, radius, damage) {
  const radiusSq = radius * radius;
  for (const enemy of [...enemies]) {
    const distSq = enemy.mesh.position.distanceToSquared(center);
    if (distSq > radiusSq) continue;
    const dist = Math.sqrt(distSq);
    const falloff = 1 - (dist / radius) * 0.32;
    applyDamage(enemy, damage * Math.max(0.45, falloff));
  }
}

function applyDamage(enemy, amount) {
  enemy.hp -= amount;
  if (enemy.hp <= 0) {
    const index = enemies.indexOf(enemy);
    if (index >= 0) removeEnemyByIndex(index, true);
  }
}

function spawnProjectile(from, to, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10),
    new THREE.MeshBasicMaterial({ color })
  );
  scene.add(mesh);
  mesh.position.copy(from);

  projectiles.push({
    mesh,
    from: from.clone(),
    to: to.clone(),
    t: 0,
    duration: 0.17
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

function spawnPulse(origin, color, speed = 0.32) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.55, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(origin.x, 0.08, origin.z);
  scene.add(mesh);

  pulses.push({ mesh, t: 0, speed });
}

function updatePulses(dt) {
  for (let i = pulses.length - 1; i >= 0; i -= 1) {
    const pulse = pulses[i];
    pulse.t += dt / pulse.speed;

    if (pulse.t >= 1) {
      scene.remove(pulse.mesh);
      pulses.splice(i, 1);
      continue;
    }

    const s = 1 + pulse.t * 4.2;
    pulse.mesh.scale.set(s, s, s);
    pulse.mesh.material.opacity = 1 - pulse.t;
  }
}

function castFireball(point) {
  if (state.pendingSpell !== "fireball") return;

  state.pendingSpell = null;

  if (state.gold < FIREBALL_COST) {
    log("Not enough gold for Fireball.");
    return;
  }

  state.gold -= FIREBALL_COST;
  state.fireballCd = 7;

  const radius = 5.2;
  const damage = 140 + state.wave * 19;

  damageArea(point, radius, damage);
  spawnPulse(point, 0xffc06a, 0.48);
  spawnPulse(point, 0xff7f3a, 0.65);

  log("Fireball detonated.");
}

function castFreeze() {
  if (state.runOver) return;
  if (state.freezeCd > 0) {
    log(`Freeze cooling down (${state.freezeCd.toFixed(1)}s).`);
    return;
  }
  if (state.gold < FREEZE_COST) {
    log("Not enough gold for Freeze.");
    return;
  }

  state.gold -= FREEZE_COST;
  state.freezeCd = 14;
  state.globalSlowTimer = 3.6;

  spawnPulse(tileToWorld(6, 4, 0.08), 0x8fdfff, 0.75);
  log("Freeze cast. Enemies slowed globally.");
}

function updateWaveFlow(dt) {
  if (!state.waveActive) {
    state.autoWaveTimer -= dt;
    if (state.autoWaveTimer <= 0) {
      startWave();
    }
    return;
  }

  state.spawnCooldown -= dt;
  while (state.queueToSpawn > 0 && state.spawnCooldown <= 0) {
    spawnEnemy();
    state.spawnedThisWave += 1;
    state.queueToSpawn -= 1;
    state.spawnCooldown += state.spawnInterval;
  }

  if (state.queueToSpawn === 0 && enemies.length === 0) {
    const reward = 30 + Math.round(state.wave * 3.4);
    state.gold += reward;
    state.wave += 1;
    state.waveActive = false;
    state.autoWaveTimer = 7;
    log(`Wave clear. Bonus +${reward} gold.`);
  }
}

function updateChestVisuals(dt) {
  if (state.chestHitFlash > 0) {
    state.chestHitFlash -= dt;
  }

  const pulse = state.chestHitFlash > 0 ? 1.15 : 1;
  chestMesh.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.2);
}

function updateAllUi() {
  ui.gold.textContent = Math.floor(state.gold).toString();
  ui.chest.textContent = `${state.chestHp.toFixed(0)} / ${state.chestHpMax}`;
  ui.wave.textContent = `${state.wave}${state.waveActive ? " (Live)" : ""}`;
  ui.enemies.textContent = `${enemies.length}${state.queueToSpawn > 0 ? ` + ${state.queueToSpawn}` : ""}`;

  if (state.waveActive) {
    ui.startWaveBtn.textContent = "Wave Active";
    ui.startWaveBtn.disabled = true;
  } else {
    ui.startWaveBtn.textContent = `Start Wave${state.autoWaveTimer > 0 ? ` (${Math.ceil(state.autoWaveTimer)})` : ""}`;
    ui.startWaveBtn.disabled = state.runOver;
  }

  if (state.pendingTower) {
    ui.summonBtn.textContent = `Placing ${rarityCatalog[state.pendingTower.rarity].label} ${towerCatalog[state.pendingTower.type].name}`;
  } else {
    ui.summonBtn.textContent = `Summon Tower (${SUMMON_COST})`;
  }

  if (state.pendingSpell === "fireball") {
    ui.fireballBtn.textContent = "Click Board to Cast";
  } else {
    ui.fireballBtn.textContent = state.fireballCd > 0 ? `Fireball (${state.fireballCd.toFixed(1)}s)` : `Fireball (${FIREBALL_COST})`;
  }

  ui.freezeBtn.textContent = state.freezeCd > 0 ? `Freeze (${state.freezeCd.toFixed(1)}s)` : `Freeze (${FREEZE_COST})`;

  ui.summonBtn.disabled = state.runOver;
  ui.fireballBtn.disabled = state.runOver || state.fireballCd > 0;
  ui.freezeBtn.disabled = state.runOver || state.freezeCd > 0;

  updateTowerPanel();
}

function log(message) {
  ui.log.textContent = message;
}

function triggerGameOver() {
  state.runOver = true;
  state.waveActive = false;
  state.queueToSpawn = 0;
  ui.gameOver.classList.remove("hidden");
  log("The chest has fallen.");
}

function clearVisualArrays() {
  for (const enemy of enemies) scene.remove(enemy.mesh);
  for (const tower of towers) scene.remove(tower.mesh);
  for (const projectile of projectiles) scene.remove(projectile.mesh);
  for (const pulse of pulses) scene.remove(pulse.mesh);

  enemies.length = 0;
  towers.length = 0;
  projectiles.length = 0;
  pulses.length = 0;
  occupiedTiles.clear();
}

function restartRun() {
  clearVisualArrays();
  clearSelection();

  Object.assign(state, {
    gold: 130,
    chestHp: 100,
    chestHpMax: 100,
    wave: 1,
    passiveGoldRate: 4.2,
    gameSpeed: 1,
    waveActive: false,
    autoWaveTimer: 4,
    queueToSpawn: 0,
    spawnCooldown: 0,
    spawnInterval: 1.15,
    spawnedThisWave: 0,
    selectedTower: null,
    pendingTower: null,
    pendingSpell: null,
    fireballCd: 0,
    freezeCd: 0,
    globalSlowTimer: 0,
    runOver: false,
    nextTowerId: 1,
    nextEnemyId: 1,
    chestHitFlash: 0,
    saveTimer: 0
  });

  ui.speedBtn.textContent = "Speed x1";
  ui.gameOver.classList.add("hidden");
  log("New run started.");
  updateAllUi();
  saveGame();
}

function saveGame() {
  const payload = {
    gold: state.gold,
    chestHp: state.chestHp,
    wave: state.wave,
    towers: towers.map((tower) => ({
      type: tower.type,
      rarity: tower.rarity,
      level: tower.level,
      spent: tower.spent,
      x: tower.tileX,
      y: tower.tileY
    }))
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    // Saving is optional; ignore storage quota issues.
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
  state.chestHp = typeof parsed.chestHp === "number" ? Math.max(1, parsed.chestHp) : state.chestHp;
  state.wave = typeof parsed.wave === "number" ? Math.max(1, Math.floor(parsed.wave)) : state.wave;

  if (Array.isArray(parsed.towers)) {
    for (const data of parsed.towers) {
      if (!data || typeof data !== "object") continue;
      const k = key(data.x, data.y);
      if (occupiedTiles.has(k)) continue;
      if (pathTileSet.has(k)) continue;
      if (data.x < 0 || data.x >= GRID_W || data.y < 0 || data.y >= GRID_H) continue;
      if (!towerCatalog[data.type] || !rarityCatalog[data.rarity]) continue;

      const level = Math.max(1, Math.min(10, Number(data.level) || 1));
      const spent = Math.max(SUMMON_COST, Number(data.spent) || SUMMON_COST);
      addTower(data.type, data.rarity, data.x, data.y, level, spent, true);
    }
  }

  if (towers.length) {
    log("Save loaded.");
  }
}

function tick() {
  const baseDt = Math.min(clock.getDelta(), 0.05);
  const dt = baseDt * state.gameSpeed;

  if (!state.runOver) {
    state.gold += state.passiveGoldRate * dt;

    if (state.fireballCd > 0) state.fireballCd = Math.max(0, state.fireballCd - dt);
    if (state.freezeCd > 0) state.freezeCd = Math.max(0, state.freezeCd - dt);
    if (state.globalSlowTimer > 0) state.globalSlowTimer = Math.max(0, state.globalSlowTimer - dt);

    updateWaveFlow(dt);
    updateTowers(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updatePulses(dt);

    state.saveTimer += baseDt;
    if (state.saveTimer >= 5) {
      state.saveTimer = 0;
      saveGame();
    }
  } else {
    updateProjectiles(dt);
    updatePulses(dt);
  }

  updateChestVisuals(dt);
  updateRangeIndicator();
  updateAllUi();

  renderer.render(scene, camera);
}
