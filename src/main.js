import * as THREE from "three";

const appRoot = document.getElementById("app");
const canvas = document.getElementById("gameCanvas");
const ui = {
  topHud: document.getElementById("topHud"),
  leftPanel: document.getElementById("leftPanel"),
  rightPanel: document.getElementById("rightPanel"),
  rosterPanel: document.getElementById("rosterPanel"),
  closeStatsBtn: document.getElementById("closeStatsBtn"),
  closeControlsBtn: document.getElementById("closeControlsBtn"),
  closeHeroBtn: document.getElementById("closeHeroBtn"),
  closeInventoryBtn: document.getElementById("closeInventoryBtn"),
  toggleStatsBtn: document.getElementById("toggleStatsBtn"),
  toggleControlsBtn: document.getElementById("toggleControlsBtn"),
  toggleHeroBtn: document.getElementById("toggleHeroBtn"),
  toggleInventoryBtn: document.getElementById("toggleInventoryBtn"),
  gold: document.getElementById("goldValue"),
  orbs: document.getElementById("orbValue"),
  stones: document.getElementById("stoneValue"),
  chest: document.getElementById("chestValue"),
  wave: document.getElementById("waveValue"),
  enemies: document.getElementById("enemyValue"),
  startWaveBtn: document.getElementById("startWaveBtn"),
  nextStageBtn: document.getElementById("nextStageBtn"),
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
  rosterDetailTitle: document.getElementById("rosterDetailTitle"),
  rosterDetailStats: document.getElementById("rosterDetailStats"),
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

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 500);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8ed66f, 1.35);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xfff4c4, 1.15);
sun.position.set(35, 72, 20);
scene.add(sun);

const GRID_W = 17;
const GRID_H = 11;
const TILE = 4;
const SAVE_KEY = "idle_summoner_td_save_v3";

const SUMMON_ORB_COST = 10;
const FIREBALL_COST = 140;
const FREEZE_COST = 170;
const REPAIR_COST = 180;

const PATH_TILES = [
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 5, y: 3 },
  { x: 6, y: 3 },
  { x: 7, y: 3 },
  { x: 8, y: 3 },
  { x: 9, y: 3 },
  { x: 10, y: 3 },
  { x: 11, y: 3 },
  { x: 12, y: 3 },
  { x: 13, y: 3 },
  { x: 14, y: 3 },
  { x: 14, y: 4 },
  { x: 14, y: 5 },
  { x: 13, y: 5 },
  { x: 12, y: 5 },
  { x: 11, y: 5 },
  { x: 10, y: 5 },
  { x: 9, y: 5 },
  { x: 8, y: 5 },
  { x: 7, y: 5 },
  { x: 6, y: 5 },
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
  { x: 2, y: 5 },
  { x: 2, y: 6 },
  { x: 2, y: 7 },
  { x: 3, y: 7 },
  { x: 4, y: 7 },
  { x: 5, y: 7 },
  { x: 6, y: 7 },
  { x: 7, y: 7 },
  { x: 8, y: 7 },
  { x: 9, y: 7 },
  { x: 10, y: 7 },
  { x: 11, y: 7 },
  { x: 12, y: 7 },
  { x: 13, y: 7 },
  { x: 14, y: 7 },
  { x: 14, y: 8 }
];

const STONE_SLOTS = [
  { x: 5, y: 2, row: 0, idx: 0 },
  { x: 9, y: 2, row: 0, idx: 1 },
  { x: 13, y: 2, row: 0, idx: 2 },
  { x: 3, y: 4, row: 1, idx: 0 },
  { x: 7, y: 4, row: 1, idx: 1 },
  { x: 11, y: 4, row: 1, idx: 2 },
  { x: 5, y: 6, row: 2, idx: 0 },
  { x: 9, y: 6, row: 2, idx: 1 },
  { x: 13, y: 6, row: 2, idx: 2 }
];

const HERO_SLOTS = STONE_SLOTS.map((slot) => ({
  x: slot.x,
  y: slot.y,
  row: slot.row,
  col: slot.idx
}));

const STAGE_THEME_TIERS = [
  {
    until: 4,
    name: "sunny meadow",
    sky: 0xafe9ff,
    fog: 0xafe9ff,
    fogNear: 65,
    fogFar: 210,
    grass: 0x59bc53,
    path: 0xe6be75,
    stone: 0x4caee8,
    rune: 0x90f0ff,
    spawn: 0x84d6ff,
    chestBase: 0xab6f2d,
    chestLid: 0xf8c95c,
    ambient: 0x6dc957,
    halo: 0xffffff,
    hemiSky: 0xffffff,
    hemiGround: 0x8ed66f,
    hemiIntensity: 1.35,
    sunColor: 0xfff4c4,
    sunIntensity: 1.15,
    sunPos: [35, 72, 20],
    exposure: 1.17
  },
  {
    until: 8,
    name: "autumn fields",
    sky: 0xffd6ac,
    fog: 0xffd6ac,
    fogNear: 58,
    fogFar: 190,
    grass: 0x9bbf4a,
    path: 0xe3a25f,
    stone: 0x63b9ea,
    rune: 0xffe5b2,
    spawn: 0xffc47c,
    chestBase: 0xa4602a,
    chestLid: 0xf2b653,
    ambient: 0xd4b368,
    halo: 0xfff4dd,
    hemiSky: 0xfff3dc,
    hemiGround: 0xd2b25d,
    hemiIntensity: 1.26,
    sunColor: 0xffcf8f,
    sunIntensity: 1.22,
    sunPos: [18, 64, 36],
    exposure: 1.12
  },
  {
    until: 12,
    name: "arcane dusk",
    sky: 0xa8b9ff,
    fog: 0xa8b9ff,
    fogNear: 56,
    fogFar: 170,
    grass: 0x6db39c,
    path: 0xc4abf3,
    stone: 0x7ea3ff,
    rune: 0xe3e9ff,
    spawn: 0xb5a9ff,
    chestBase: 0x8360b6,
    chestLid: 0xd3b8ff,
    ambient: 0x8ea8eb,
    halo: 0xe9edff,
    hemiSky: 0xe4e9ff,
    hemiGround: 0x6687d0,
    hemiIntensity: 1.22,
    sunColor: 0xd4c3ff,
    sunIntensity: 1.1,
    sunPos: [-22, 63, 34],
    exposure: 1.1,
    platform: 0x5376b5,
    frame: 0x967ce7,
    hill: 0x8898dc,
    foliage: 0x72bc9f,
    rock: 0xa9a3d3,
    crystal: 0xb8d8ff
  },
  {
    until: 16,
    name: "frost garden",
    sky: 0xcbf2ff,
    fog: 0xcbf2ff,
    fogNear: 58,
    fogFar: 185,
    grass: 0x8ac3b9,
    path: 0xdcecff,
    stone: 0x8fd8ff,
    rune: 0xefffff,
    spawn: 0xb6efff,
    chestBase: 0x6e90b8,
    chestLid: 0xd9eeff,
    ambient: 0xa1e0de,
    halo: 0xf6ffff,
    hemiSky: 0xf6ffff,
    hemiGround: 0x94d4ce,
    hemiIntensity: 1.32,
    sunColor: 0xe7f7ff,
    sunIntensity: 1.08,
    sunPos: [26, 70, -14],
    exposure: 1.13
  },
  {
    until: 20,
    name: "ember canyon",
    sky: 0xffbe9d,
    fog: 0xffbe9d,
    fogNear: 52,
    fogFar: 160,
    grass: 0x8f7a4c,
    path: 0xe18357,
    stone: 0xff8e75,
    rune: 0xffd7b6,
    spawn: 0xff9b7b,
    chestBase: 0x8a4a1f,
    chestLid: 0xf6a35f,
    ambient: 0xd38d4f,
    halo: 0xffe2b8,
    hemiSky: 0xffd5b3,
    hemiGround: 0xb3643d,
    hemiIntensity: 1.24,
    sunColor: 0xffa568,
    sunIntensity: 1.28,
    sunPos: [-14, 58, 24],
    exposure: 1.09,
    platform: 0xb86c48,
    frame: 0xea9358,
    hill: 0xe3a875,
    foliage: 0xb28a54,
    rock: 0xd89a68,
    crystal: 0xffbe87
  },
  {
    until: Infinity,
    name: "void citadel",
    sky: 0x86c3ff,
    fog: 0x86c3ff,
    fogNear: 48,
    fogFar: 152,
    grass: 0x5b87dc,
    path: 0x9f8bf2,
    stone: 0x9ec8ff,
    rune: 0xf0e8ff,
    spawn: 0xc0b9ff,
    chestBase: 0x6b5aa6,
    chestLid: 0xd5bfff,
    ambient: 0x7da0ee,
    halo: 0xe7e0ff,
    hemiSky: 0xedebff,
    hemiGround: 0x5476c0,
    hemiIntensity: 1.2,
    sunColor: 0xc3d0ff,
    sunIntensity: 1.08,
    sunPos: [8, 60, 12],
    exposure: 1.13,
    platform: 0x4d6eb6,
    frame: 0x8f79e3,
    hill: 0x7990d5,
    foliage: 0x78a5ef,
    rock: 0xb1a4df,
    crystal: 0xcbe4ff
  }
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
    passive: "ooze_regen",
    special: "slime_flood",
    specialCooldown: 12.5,
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
    passive: "espresso_crit",
    special: "rapid_brew",
    specialCooldown: 11.8,
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
    passive: "glacier_venom",
    special: "frost_spike_burst",
    specialCooldown: 11.2,
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
    passive: "pack_hunter",
    special: "maul_quake",
    specialCooldown: 10.6,
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
    passive: "armor_break",
    special: "execution_strike",
    specialCooldown: 10.2,
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
    passive: "barista_focus",
    special: "latte_barrier",
    specialCooldown: 9.8,
    projectileColor: 0xffdf9e
  },
  mighty: {
    name: "mighty",
    rarity: "epic",
    color: 0xf4db56,
    accent: 0xfff3bf,
    baseDamage: 24,
    range: 6.2,
    fireRate: 1.05,
    supportDamage: 0.58,
    passive: "divine_command",
    special: "divine_smite",
    specialCooldown: 7.5,
    projectileColor: 0xffec8f
  },
  speedy: {
    name: "speedy",
    rarity: "epic",
    color: 0x7ad1ff,
    accent: 0xe4f8ff,
    baseDamage: 18,
    range: 6,
    fireRate: 1.2,
    supportSpeed: 0.72,
    passive: "hyperflow",
    special: "time_warp",
    specialCooldown: 9.2,
    projectileColor: 0x95e8ff
  },
  frostbite: {
    name: "frostbite",
    rarity: "epic",
    color: 0x86f3ff,
    accent: 0xebfcff,
    baseDamage: 34,
    range: 7.2,
    fireRate: 1.25,
    splash: 2.6,
    slow: 0.35,
    slowDuration: 2.4,
    chainJumps: 3,
    chainFalloff: 0.72,
    passive: "permafrost",
    special: "blizzard_nova",
    specialCooldown: 8.8,
    projectileColor: 0xb9f8ff
  },
  slime_king: {
    name: "slime king",
    rarity: "legendary",
    color: 0x9e7cff,
    accent: 0xf1e8ff,
    baseDamage: 44,
    range: 7.4,
    fireRate: 1.2,
    passive: "royal_tribute",
    special: "global_stun",
    specialCooldown: 8.5,
    projectileColor: 0xb89eff
  },
  felina: {
    name: "felina",
    rarity: "legendary",
    color: 0xff8072,
    accent: 0xffeadf,
    baseDamage: 58,
    range: 10,
    fireRate: 1,
    splash: 4.4,
    passive: "solar_burn",
    special: "meteor_rain",
    specialCooldown: 8,
    projectileColor: 0xffa887
  },
  kevin: {
    name: "kevin",
    rarity: "legendary",
    color: 0xffd66d,
    accent: 0xfff6c9,
    baseDamage: 66,
    range: 7.4,
    fireRate: 1.15,
    tripleHit: true,
    executeThreshold: 0.28,
    passive: "apex_predator",
    special: "dragon_fury",
    specialCooldown: 7.2,
    projectileColor: 0xffe18c
  },
  pirate_cat: {
    name: "pirate cat",
    rarity: "special",
    color: 0xf56fd2,
    accent: 0xffdcf4,
    baseDamage: 42,
    range: 8.4,
    fireRate: 1.25,
    splash: 3.5,
    special: "broadside",
    specialCooldown: 8.8,
    goldStealChance: 0.32,
    passive: "high_plunder",
    projectileColor: 0xff96e8
  },
  hellhound: {
    name: "hellhound",
    rarity: "special",
    color: 0xff5a48,
    accent: 0xffd4c5,
    baseDamage: 36,
    range: 6.2,
    fireRate: 1.28,
    supportDamage: 0.74,
    passive: "alpha_howl",
    special: "inferno_aura",
    specialCooldown: 2.1,
    burnDps: 28,
    projectileColor: 0xff8a6d,
    eventOnly: true
  },
  pebble: {
    name: "pebble",
    rarity: "common",
    color: 0xb6be8f,
    accent: 0xf2f0d2,
    baseDamage: 14,
    range: 6.5,
    fireRate: 1.05,
    passive: "thorns_shell",
    special: "vine_snare",
    specialCooldown: 10.5,
    projectileColor: 0xdde0af
  },
  fizz: {
    name: "fizz",
    rarity: "common",
    color: 0x7fd4ff,
    accent: 0xe0f6ff,
    baseDamage: 13,
    range: 6.8,
    fireRate: 1.4,
    passive: "mana_surge",
    special: "prism_beam",
    specialCooldown: 10.2,
    projectileColor: 0xaff0ff
  },
  sprout: {
    name: "sprout",
    rarity: "common",
    color: 0x89d278,
    accent: 0xe3ffd8,
    baseDamage: 11,
    range: 6.9,
    fireRate: 1.1,
    passive: "ooze_regen",
    special: "guardian_totem",
    specialCooldown: 11.4,
    projectileColor: 0xc0f59d
  },
  emberling: {
    name: "emberling",
    rarity: "common",
    color: 0xff9c74,
    accent: 0xffe4cb,
    baseDamage: 15,
    range: 6.3,
    fireRate: 1.25,
    passive: "ember_heart",
    special: "shadow_barrage",
    specialCooldown: 10.4,
    projectileColor: 0xffbf8e
  },
  scouty: {
    name: "scouty",
    rarity: "common",
    color: 0x98b8ff,
    accent: 0xe7eeff,
    baseDamage: 13,
    range: 8.8,
    fireRate: 1.08,
    passive: "sniper_focus",
    special: "rapid_brew",
    specialCooldown: 10.8,
    projectileColor: 0xb2d2ff
  },
  bruno: {
    name: "bruno",
    rarity: "rare",
    color: 0xd09f78,
    accent: 0xffe6d0,
    baseDamage: 22,
    range: 6.4,
    fireRate: 1.05,
    splash: 2.8,
    passive: "pack_hunter",
    special: "maul_quake",
    specialCooldown: 9.9,
    projectileColor: 0xf3c38f
  },
  ivy: {
    name: "ivy",
    rarity: "rare",
    color: 0x80d977,
    accent: 0xe6ffe1,
    baseDamage: 19,
    range: 7.2,
    fireRate: 1.05,
    passive: "tidal_guard",
    special: "vine_snare",
    specialCooldown: 9.6,
    projectileColor: 0xb7f39a
  },
  volt: {
    name: "volt",
    rarity: "rare",
    color: 0x7ac7ff,
    accent: 0xe0f4ff,
    baseDamage: 24,
    range: 6.9,
    fireRate: 1.35,
    chainJumps: 2,
    chainFalloff: 0.77,
    passive: "storm_link",
    special: "thunder_dome",
    specialCooldown: 9.4,
    projectileColor: 0xa7e3ff
  },
  misty: {
    name: "misty",
    rarity: "rare",
    color: 0x95d7f7,
    accent: 0xe7f8ff,
    baseDamage: 21,
    range: 6.9,
    fireRate: 1.2,
    passive: "mana_surge",
    special: "tidal_crash",
    specialCooldown: 9.8,
    projectileColor: 0xbdeeff
  },
  marina: {
    name: "marina",
    rarity: "rare",
    color: 0x79c7d9,
    accent: 0xdcf8ff,
    baseDamage: 20,
    range: 7.3,
    fireRate: 1.08,
    passive: "tidal_guard",
    special: "guardian_totem",
    specialCooldown: 9.5,
    projectileColor: 0xa4e4f4
  },
  aurora: {
    name: "aurora",
    rarity: "epic",
    color: 0x7ea2ff,
    accent: 0xe0e7ff,
    baseDamage: 37,
    range: 8,
    fireRate: 1.3,
    chainJumps: 3,
    chainFalloff: 0.8,
    passive: "storm_link",
    special: "prism_beam",
    specialCooldown: 8.4,
    projectileColor: 0xafe2ff
  },
  riftfox: {
    name: "riftfox",
    rarity: "epic",
    color: 0xc484ff,
    accent: 0xf2deff,
    baseDamage: 35,
    range: 7.6,
    fireRate: 1.26,
    passive: "shadow_mark",
    special: "rift_lock",
    specialCooldown: 8.6,
    projectileColor: 0xe2a3ff
  },
  thunderpaw: {
    name: "thunderpaw",
    rarity: "epic",
    color: 0xffc061,
    accent: 0xffefc8,
    baseDamage: 40,
    range: 7.1,
    fireRate: 1.2,
    splash: 3.1,
    passive: "ember_heart",
    special: "thunder_dome",
    specialCooldown: 8.2,
    projectileColor: 0xffdf84
  },
  shade: {
    name: "shade",
    rarity: "epic",
    color: 0x9f9fff,
    accent: 0xebe6ff,
    baseDamage: 34,
    range: 7.7,
    fireRate: 1.34,
    passive: "shadow_mark",
    special: "shadow_barrage",
    specialCooldown: 8.5,
    projectileColor: 0xc5b4ff
  },
  cobalt: {
    name: "cobalt",
    rarity: "epic",
    color: 0x4bbdff,
    accent: 0xd7f4ff,
    baseDamage: 36,
    range: 9.5,
    fireRate: 1.08,
    passive: "sniper_focus",
    special: "prism_beam",
    specialCooldown: 8.7,
    projectileColor: 0x87dcff
  },
  seraphina: {
    name: "seraphina",
    rarity: "legendary",
    color: 0xff9aa0,
    accent: 0xffecef,
    baseDamage: 62,
    range: 10.5,
    fireRate: 1.1,
    splash: 4.8,
    passive: "mana_surge",
    special: "starfall",
    specialCooldown: 7.4,
    projectileColor: 0xffb9c6
  },
  leviathan: {
    name: "leviathan",
    rarity: "legendary",
    color: 0x73b6ff,
    accent: 0xdcf0ff,
    baseDamage: 58,
    range: 8.4,
    fireRate: 1.06,
    passive: "tidal_guard",
    special: "tidal_crash",
    specialCooldown: 7.6,
    projectileColor: 0x9fd8ff
  },
  nyx: {
    name: "nyx",
    rarity: "legendary",
    color: 0xba85ff,
    accent: 0xf3e5ff,
    baseDamage: 60,
    range: 8.8,
    fireRate: 1.2,
    passive: "shadow_mark",
    special: "soul_siphon",
    specialCooldown: 7.3,
    projectileColor: 0xd7a8ff
  },
  atlas: {
    name: "atlas",
    rarity: "legendary",
    color: 0xd2b989,
    accent: 0xfff1da,
    baseDamage: 57,
    range: 7.8,
    fireRate: 1.05,
    splash: 3.4,
    passive: "thorns_shell",
    special: "guardian_totem",
    specialCooldown: 7.7,
    projectileColor: 0xf4d3a0
  },
  infernia: {
    name: "infernia",
    rarity: "legendary",
    color: 0xff7f63,
    accent: 0xffe0d2,
    baseDamage: 64,
    range: 9.2,
    fireRate: 1.12,
    splash: 4.5,
    passive: "ember_heart",
    special: "starfall",
    specialCooldown: 7.1,
    projectileColor: 0xffa983
  },
  chrono_wisp: {
    name: "chrono wisp",
    rarity: "special",
    color: 0x89e2ff,
    accent: 0xe3fbff,
    baseDamage: 54,
    range: 9.4,
    fireRate: 1.5,
    passive: "tempo_master",
    special: "rift_lock",
    specialCooldown: 5.8,
    projectileColor: 0xb4f2ff
  },
  void_reaper: {
    name: "void reaper",
    rarity: "special",
    color: 0xbe76ff,
    accent: 0xf2dfff,
    baseDamage: 70,
    range: 9.8,
    fireRate: 1.28,
    passive: "lucky_strike",
    special: "soul_siphon",
    specialCooldown: 6.4,
    projectileColor: 0xe2a4ff
  },
  crystal_queen: {
    name: "crystal queen",
    rarity: "special",
    color: 0x82d9ff,
    accent: 0xe8fcff,
    baseDamage: 66,
    range: 10.2,
    fireRate: 1.2,
    splash: 3.8,
    passive: "mana_surge",
    special: "prism_beam",
    specialCooldown: 6.2,
    projectileColor: 0xb7f2ff
  }
};

const MONSTER_VISUALS = {
  slimey: { silhouette: "blob", symbol: "drop", badge: "sl" },
  mocha: { silhouette: "blob", symbol: "orb", badge: "mo" },
  spikey: { silhouette: "dragon", symbol: "snow", badge: "sp" },
  teddy: { silhouette: "beast", symbol: "paw", badge: "te" },
  clyde: { silhouette: "beast", symbol: "axe", badge: "cl" },
  cappuccino: { silhouette: "mage", symbol: "cup", badge: "ca" },
  mighty: { silhouette: "mage", symbol: "sword", badge: "mi" },
  speedy: { silhouette: "mage", symbol: "bolt", badge: "sd" },
  frostbite: { silhouette: "dragon", symbol: "ice", badge: "fr" },
  slime_king: { silhouette: "mage", symbol: "crown", badge: "sk" },
  felina: { silhouette: "cat", symbol: "flame", badge: "fe" },
  kevin: { silhouette: "dragon", symbol: "fang", badge: "ke" },
  pirate_cat: { silhouette: "cat", symbol: "skull", badge: "pc" },
  hellhound: { silhouette: "beast", symbol: "claw", badge: "hh" },
  pebble: { silhouette: "blob", symbol: "shield", badge: "pb" },
  fizz: { silhouette: "blob", symbol: "orb", badge: "fz" },
  sprout: { silhouette: "beast", symbol: "leaf", badge: "sr" },
  emberling: { silhouette: "cat", symbol: "flame", badge: "em" },
  scouty: { silhouette: "mage", symbol: "scope", badge: "sc" },
  bruno: { silhouette: "beast", symbol: "paw", badge: "br" },
  ivy: { silhouette: "beast", symbol: "leaf", badge: "iv" },
  volt: { silhouette: "mage", symbol: "bolt", badge: "vo" },
  misty: { silhouette: "blob", symbol: "wave", badge: "ms" },
  marina: { silhouette: "mage", symbol: "drop", badge: "ma" },
  aurora: { silhouette: "dragon", symbol: "prism", badge: "au" },
  riftfox: { silhouette: "cat", symbol: "rift", badge: "rf" },
  thunderpaw: { silhouette: "beast", symbol: "thunder", badge: "tp" },
  shade: { silhouette: "dragon", symbol: "moon", badge: "sh" },
  cobalt: { silhouette: "mage", symbol: "scope", badge: "co" },
  seraphina: { silhouette: "cat", symbol: "star", badge: "se" },
  leviathan: { silhouette: "dragon", symbol: "wave", badge: "lv" },
  nyx: { silhouette: "mage", symbol: "rift", badge: "nx" },
  atlas: { silhouette: "beast", symbol: "shield", badge: "at" },
  infernia: { silhouette: "dragon", symbol: "flame", badge: "in" },
  chrono_wisp: { silhouette: "mage", symbol: "clock", badge: "cw" },
  void_reaper: { silhouette: "dragon", symbol: "void", badge: "vr" },
  crystal_queen: { silhouette: "cat", symbol: "prism", badge: "cq" }
};

const SPECIAL_LABELS = {
  slime_flood: "slime flood",
  rapid_brew: "rapid brew",
  frost_spike_burst: "frost spike burst",
  maul_quake: "maul quake",
  execution_strike: "execution strike",
  latte_barrier: "latte barrier",
  divine_smite: "divine smite",
  time_warp: "time warp",
  blizzard_nova: "blizzard nova",
  global_stun: "royal decree",
  meteor_rain: "meteor rain",
  dragon_fury: "dragon fury",
  broadside: "broadside",
  inferno_aura: "inferno aura",
  prism_beam: "prism beam",
  thunder_dome: "thunder dome",
  vine_snare: "vine snare",
  tidal_crash: "tidal crash",
  shadow_barrage: "shadow barrage",
  soul_siphon: "soul siphon",
  starfall: "starfall",
  rift_lock: "rift lock",
  guardian_totem: "guardian totem"
};

const PASSIVE_LABELS = {
  ooze_regen: "ooze regen",
  espresso_crit: "espresso crit",
  glacier_venom: "glacier venom",
  pack_hunter: "pack hunter",
  armor_break: "armor break",
  barista_focus: "barista focus",
  divine_command: "divine command",
  hyperflow: "hyperflow",
  permafrost: "permafrost",
  royal_tribute: "royal tribute",
  solar_burn: "solar burn",
  apex_predator: "apex predator",
  high_plunder: "high plunder",
  alpha_howl: "alpha howl",
  sniper_focus: "sniper focus",
  mana_surge: "mana surge",
  storm_link: "storm link",
  thorns_shell: "thorns shell",
  tidal_guard: "tidal guard",
  shadow_mark: "shadow mark",
  ember_heart: "ember heart",
  tempo_master: "tempo master",
  lucky_strike: "lucky strike"
};

const SKILL_ICON_PATHS = {
  slime_flood: "M3 14C5 11 7 11 9 14C11 17 13 17 15 14C17 11 19 11 21 14",
  rapid_brew: "M6 7H14V14H6Z M14 8H17A2 2 0 0 1 17 13H14 M8 5C9 4 9 3 8 2 M11 5C12 4 12 3 11 2",
  frost_spike_burst: "M12 3V21 M5 7L19 17 M19 7L5 17 M4 12H20",
  maul_quake: "M4 17L8 13L11 16L14 10L18 14L21 9",
  execution_strike: "M6 19L18 7 M12 5L20 5 M7 14L3 18",
  latte_barrier: "M12 3L19 6V12C19 16 16 19 12 21C8 19 5 16 5 12V6Z",
  divine_smite: "M13 2L6 13H11L10 22L18 10H13Z",
  time_warp: "M12 5A7 7 0 1 1 5 12 M12 8V12L15 14",
  blizzard_nova: "M12 3V21 M6 6L18 18 M18 6L6 18 M3 12H21 M8 3L16 21 M16 3L8 21",
  global_stun: "M5 9L8 4L12 8L16 4L19 9 M7 9V14H17V9 M10 14V18H14V14",
  meteor_rain: "M4 7L8 3 M10 9L14 5 M16 11L20 7 M7 16A2 2 0 1 0 7 15.99",
  dragon_fury: "M4 16C8 9 12 7 18 8C15 10 14 13 16 16C12 17 8 18 4 16Z",
  broadside: "M4 15H14V9H4Z M14 12H19 M6 15V18H8V15 M10 15V18H12V15",
  inferno_aura: "M12 3C15 7 18 10 15 14C13 17 9 18 7 15C5 12 7 9 12 3Z M12 10C13 12 12 14 10 15",
  ooze_regen: "M12 4C15 8 17 10 17 13A5 5 0 1 1 7 13C7 10 9 8 12 4 M12 9V17 M8 13H16",
  espresso_crit: "M12 5L14 10L19 10L15 13L16 18L12 15L8 18L9 13L5 10L10 10Z",
  glacier_venom: "M6 5L18 19 M18 5L6 19 M12 3V21 M4 12H20",
  pack_hunter: "M8 15A2 2 0 1 0 8 14.99 M16 15A2 2 0 1 0 16 14.99 M10 10A1.6 1.6 0 1 0 10 9.99 M14 10A1.6 1.6 0 1 0 14 9.99",
  armor_break: "M12 3L19 6V12C19 16 16 19 12 21C8 19 5 16 5 12V6Z M8 8L16 16 M16 8L8 16",
  barista_focus: "M6 8H14V14H6Z M14 9H17A2 2 0 0 1 17 13H14 M8 6C9 5 9 4 8 3",
  divine_command: "M3 12H21 M12 3V21 M6 6L18 18 M18 6L6 18",
  hyperflow: "M3 10H14 M3 14H18 M9 6L13 10L9 14 M13 10L17 14",
  permafrost: "M12 3V21 M6 6L18 18 M18 6L6 18 M3 12H21",
  royal_tribute: "M12 4A8 8 0 1 1 12 20A8 8 0 1 1 12 4 M9 12H15 M12 9V15",
  solar_burn: "M12 7A5 5 0 1 1 12 17A5 5 0 1 1 12 7 M12 2V5 M12 19V22 M2 12H5 M19 12H22 M4.5 4.5L6.5 6.5 M17.5 17.5L19.5 19.5 M17.5 6.5L19.5 4.5 M4.5 19.5L6.5 17.5",
  apex_predator: "M6 7C8 6 10 6 12 8C14 6 16 6 18 7C17 11 14 13 12 18C10 13 7 11 6 7",
  high_plunder: "M12 3L19 12L12 21L5 12Z M9 12L12 9L15 12L12 15Z",
  alpha_howl: "M5 16C8 10 11 8 15 8C13 10 13 13 16 15C12 17 8 17 5 16",
  prism_beam: "M4 12H20 M8 8L12 12L8 16 M14 8L18 12L14 16",
  thunder_dome: "M6 16C7 11 10 8 14 8C13 10 13 12 16 13C14 15 11 17 6 16 M14 4L12 9H15L11 16",
  vine_snare: "M4 16C8 17 10 13 12 9C13 7 15 6 18 6 M8 19C11 18 13 15 14 12 M5 12C7 13 9 12 10 10",
  tidal_crash: "M3 14C5 12 7 12 9 14C11 16 13 16 15 14C17 12 19 12 21 14 M5 18H19",
  shadow_barrage: "M4 6L10 10 M10 10L4 14 M10 10L4 18 M20 6L14 10 M14 10L20 14 M14 10L20 18",
  soul_siphon: "M12 3C15 6 16 9 14 12C13 14 11 16 12 21C9 18 7 15 7 12C7 8 9 5 12 3 M16 8L21 8 M16 12L21 12",
  starfall: "M12 3L14.5 9H21L15.8 12.8L17.8 20L12 15.8L6.2 20L8.2 12.8L3 9H9.5Z",
  rift_lock: "M5 5H19V19H5Z M8 8L16 16 M16 8L8 16 M12 3V21",
  guardian_totem: "M12 3L18 7V14C18 17 15.6 19.6 12 21C8.4 19.6 6 17 6 14V7Z",
  sniper_focus: "M12 4A8 8 0 1 1 12 20A8 8 0 1 1 12 4 M12 7V17 M7 12H17",
  mana_surge: "M5 15C9 14 9 10 12 6C15 10 15 14 19 15 M12 6V20",
  storm_link: "M4 12H8L10 8L14 16L16 12H20",
  thorns_shell: "M12 3L15 8L21 9L17 13L18 20L12 17L6 20L7 13L3 9L9 8Z",
  tidal_guard: "M4 15C7 11 11 10 14 12C16 13 18 13 20 11 M5 18H19",
  shadow_mark: "M4 18L20 6 M7 6H12V11 M12 18H17V13",
  ember_heart: "M12 4C14 7 17 9 15 13C13 16 10 16 9 13C8 10 9 7 12 4 M10 14H14",
  tempo_master: "M12 4A8 8 0 1 1 12 20A8 8 0 1 1 12 4 M12 8V12L16 14 M5 5L7 7 M17 17L19 19",
  lucky_strike: "M12 3L15 9H21L16 13L18 21L12 16L6 21L8 13L3 9H9Z M12 9V16"
};

const skillIconCache = new Map();

const PASSIVE_AURA_STYLES = {
  ooze_regen: { color: 0x87e879, accent: 0xd7ffd0, kind: "ripple", spin: 1.2, pulse: 2.2, interval: 1.7 },
  espresso_crit: { color: 0xffd273, accent: 0xff9648, kind: "spark", spin: 2.8, pulse: 3.8, interval: 1.35 },
  glacier_venom: { color: 0x8eefff, accent: 0x61cbff, kind: "shard", spin: 1.7, pulse: 2.9, interval: 1.55 },
  pack_hunter: { color: 0xffba86, accent: 0xff7d5f, kind: "claw", spin: 2.5, pulse: 3.2, interval: 1.45 },
  armor_break: { color: 0xff8f8a, accent: 0xff5f58, kind: "slash", spin: 3.3, pulse: 3.8, interval: 1.35 },
  barista_focus: { color: 0xffdfb5, accent: 0xc9985f, kind: "sigil", spin: 1.5, pulse: 2.2, interval: 1.75 },
  divine_command: { color: 0xfff292, accent: 0xd3b04d, kind: "halo", spin: 1.1, pulse: 2, interval: 1.8 },
  hyperflow: { color: 0x93e5ff, accent: 0x4ea4ff, kind: "spiral", spin: 3.9, pulse: 4.4, interval: 1.2 },
  permafrost: { color: 0xbdf8ff, accent: 0x72ddff, kind: "snow", spin: 1.4, pulse: 2.6, interval: 1.55 },
  royal_tribute: { color: 0xd5a6ff, accent: 0xa26cec, kind: "crown", spin: 1.6, pulse: 2.5, interval: 1.65 },
  solar_burn: { color: 0xffb783, accent: 0xff744a, kind: "flare", spin: 2.1, pulse: 3.1, interval: 1.3 },
  apex_predator: { color: 0xffcf83, accent: 0xde8840, kind: "fang", spin: 2.4, pulse: 2.9, interval: 1.4 },
  high_plunder: { color: 0xffade7, accent: 0xff6bc8, kind: "gem", spin: 2.7, pulse: 3.3, interval: 1.25 },
  alpha_howl: { color: 0xff916c, accent: 0xc25340, kind: "howl", spin: 2.3, pulse: 3.2, interval: 1.45 },
  sniper_focus: { color: 0xa9c3ff, accent: 0x7294ff, kind: "halo", spin: 1.8, pulse: 2.4, interval: 1.55 },
  mana_surge: { color: 0x91ebff, accent: 0x63b8ff, kind: "spiral", spin: 3.6, pulse: 4, interval: 1.2 },
  storm_link: { color: 0xa8dbff, accent: 0x6d9eff, kind: "spark", spin: 3.1, pulse: 3.4, interval: 1.25 },
  thorns_shell: { color: 0xc6cf93, accent: 0x94a35d, kind: "shard", spin: 2.2, pulse: 2.6, interval: 1.5 },
  tidal_guard: { color: 0x7ed9ff, accent: 0x4db6eb, kind: "ripple", spin: 1.6, pulse: 2.5, interval: 1.45 },
  shadow_mark: { color: 0xd8a7ff, accent: 0x8f62d4, kind: "slash", spin: 3.4, pulse: 3.6, interval: 1.3 },
  ember_heart: { color: 0xffb28a, accent: 0xff6f4c, kind: "flare", spin: 2.6, pulse: 3.3, interval: 1.35 },
  tempo_master: { color: 0x90f4ff, accent: 0x69c8ff, kind: "spiral", spin: 4.2, pulse: 4.6, interval: 1.05 },
  lucky_strike: { color: 0xf2b8ff, accent: 0xd07dff, kind: "gem", spin: 2.9, pulse: 3.4, interval: 1.2 }
};

const SPECIAL_FX_STYLES = {
  slime_flood: { color: 0x86ea8b, accent: 0xc6ffd2, kind: "ripple", size: 1.2, life: 0.88 },
  rapid_brew: { color: 0xffd37c, accent: 0xffaa5d, kind: "spark", size: 1.05, life: 0.62 },
  frost_spike_burst: { color: 0x9bedff, accent: 0x6fd8ff, kind: "shard", size: 1.16, life: 0.86 },
  maul_quake: { color: 0xffb180, accent: 0xff8c5e, kind: "claw", size: 1.3, life: 0.9 },
  execution_strike: { color: 0xff958c, accent: 0xff5f58, kind: "slash", size: 1.06, life: 0.62 },
  latte_barrier: { color: 0xffe0bb, accent: 0xe1b57e, kind: "sigil", size: 1.35, life: 1.02 },
  divine_smite: { color: 0xffec86, accent: 0xffc64f, kind: "halo", size: 1.35, life: 0.78 },
  time_warp: { color: 0x97e7ff, accent: 0x62b8ff, kind: "spiral", size: 1.24, life: 0.92 },
  blizzard_nova: { color: 0xb7f8ff, accent: 0x89dfff, kind: "snow", size: 1.45, life: 0.98 },
  global_stun: { color: 0xb08fff, accent: 0xd4c2ff, kind: "crown", size: 1.46, life: 1.04 },
  meteor_rain: { color: 0xffa889, accent: 0xff7f63, kind: "flare", size: 1.32, life: 0.86 },
  dragon_fury: { color: 0xffcf74, accent: 0xffa043, kind: "fang", size: 1.38, life: 0.86 },
  broadside: { color: 0xff98eb, accent: 0xff67d8, kind: "gem", size: 1.24, life: 0.78 },
  inferno_aura: { color: 0xff8665, accent: 0xff5e3f, kind: "howl", size: 1.15, life: 0.82 },
  prism_beam: { color: 0x9ee6ff, accent: 0x6fb0ff, kind: "halo", size: 1.26, life: 0.84 },
  thunder_dome: { color: 0xffd184, accent: 0xffa44d, kind: "spark", size: 1.32, life: 0.85 },
  vine_snare: { color: 0x9de68e, accent: 0x64b76a, kind: "ripple", size: 1.22, life: 0.92 },
  tidal_crash: { color: 0x9fe8ff, accent: 0x62c9ff, kind: "spiral", size: 1.35, life: 0.9 },
  shadow_barrage: { color: 0xcfa9ff, accent: 0x8d63d7, kind: "slash", size: 1.15, life: 0.74 },
  soul_siphon: { color: 0xe0b8ff, accent: 0xac6de6, kind: "howl", size: 1.22, life: 0.9 },
  starfall: { color: 0xffcf95, accent: 0xff9766, kind: "flare", size: 1.44, life: 0.95 },
  rift_lock: { color: 0xafa9ff, accent: 0x7b71dd, kind: "crown", size: 1.3, life: 0.88 },
  guardian_totem: { color: 0xc0f2bd, accent: 0x7fd385, kind: "sigil", size: 1.36, life: 0.98 }
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
  },
  assassin: {
    name: "shadow fang",
    color: 0x9a83ff,
    capColor: 0xddc8ff,
    hpScale: 1.12,
    speed: 2.85,
    damage: 5,
    rewardGold: 17,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 14,
    ability: "blink",
    model: "spike"
  },
  juggernaut: {
    name: "juggernaut",
    color: 0xb65f56,
    capColor: 0xffbf88,
    hpScale: 3.1,
    speed: 1.22,
    damage: 9,
    rewardGold: 22,
    rewardOrbs: 3,
    rewardStones: 0,
    rockDamage: 18,
    ability: "enrage",
    model: "cube"
  },
  necromancer: {
    name: "necromancer",
    color: 0x8658cc,
    capColor: 0xead5ff,
    hpScale: 1.75,
    speed: 1.7,
    damage: 6,
    rewardGold: 24,
    rewardOrbs: 3,
    rewardStones: 0,
    rockDamage: 14,
    ability: "summon_imps",
    model: "mage"
  },
  frost_weaver: {
    name: "frost weaver",
    color: 0x7dc6ff,
    capColor: 0xe5f6ff,
    hpScale: 1.55,
    speed: 1.82,
    damage: 6,
    rewardGold: 21,
    rewardOrbs: 3,
    rewardStones: 0,
    rockDamage: 13,
    ability: "hero_chill",
    model: "mage"
  },
  bomber: {
    name: "goblin bomber",
    color: 0xff985d,
    capColor: 0xfff09d,
    hpScale: 1.2,
    speed: 2.35,
    damage: 4,
    rewardGold: 18,
    rewardOrbs: 2,
    rewardStones: 0,
    rockDamage: 16,
    ability: "suicide_blast",
    model: "orb"
  },
  leech: {
    name: "void leech",
    color: 0x5f7fd1,
    capColor: 0xc5d8ff,
    hpScale: 1.9,
    speed: 1.92,
    damage: 7,
    rewardGold: 23,
    rewardOrbs: 3,
    rewardStones: 0,
    rockDamage: 16,
    ability: "drain",
    model: "orb"
  },
  sentinel: {
    name: "runic sentinel",
    color: 0x6abbc0,
    capColor: 0xd8f8ff,
    hpScale: 2.35,
    speed: 1.55,
    damage: 8,
    rewardGold: 24,
    rewardOrbs: 3,
    rewardStones: 0,
    rockDamage: 18,
    ability: "fortify",
    model: "cube"
  },
  mimic: {
    name: "gold mimic",
    color: 0xf4d05d,
    capColor: 0xffffff,
    hpScale: 0.85,
    speed: 2.7,
    damage: 4,
    rewardGold: 40,
    rewardOrbs: 4,
    rewardStones: 45,
    rockDamage: 10,
    ability: "split",
    model: "orb"
  },
  boss_colossus: {
    name: "obsidian colossus",
    color: 0x8b5c42,
    capColor: 0xffc489,
    hpScale: 13.5,
    speed: 1.08,
    damage: 20,
    rewardGold: 330,
    rewardOrbs: 26,
    rewardStones: 240,
    rockDamage: 56,
    ability: "boss_quake",
    isBoss: true,
    model: "cube"
  },
  boss_void_queen: {
    name: "void queen",
    color: 0xa07bff,
    capColor: 0xf3ddff,
    hpScale: 14.8,
    speed: 1.16,
    damage: 22,
    rewardGold: 380,
    rewardOrbs: 30,
    rewardStones: 300,
    rockDamage: 60,
    ability: "boss_rift",
    isBoss: true,
    model: "mage"
  }
};

const state = {
  gold: 350,
  orbs: 120,
  stones: 0,
  chestHp: 120,
  chestShield: 0,
  chestHpMax: 120,
  stage: 1,
  wave: 1,
  waveActive: false,
  stageClearReady: false,
  waveQueue: [],
  spawnedThisWave: 0,
  spawnCooldown: 0,
  spawnInterval: 0.95,
  gameSpeed: 1,
  fireballCd: 0,
  freezeCd: 0,
  repairCd: 0,
  pendingSpell: null,
  globalSlowTimer: 0,
  enemyHasteTimer: 0,
  heroSlowTimer: 0,
  runOver: false,
  selectedMonsterId: null,
  selectedSlotIndex: null,
  chestHitFlash: 0,
  saveTimer: 0,
  nextEnemyId: 1,
  eventMonsterId: "hellhound"
};

const panelState = {
  stats: false,
  controls: false,
  hero: false,
  inventory: false
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
const skillEffects = [];

const toonGradientMap = createToonGradientTexture();
const grassTileTexture = createTilePatternTexture("grass");
const pathTileTexture = createTilePatternTexture("path");
const terrainNoiseTexture = createSoftNoiseTexture();
const spriteCache = new Map();
const heroFigureCache = new Map();
const monsterPortraitCache = new Map();

const pathTileSet = new Set(PATH_TILES.map((tile) => `${tile.x},${tile.y}`));
const pathWorld = PATH_TILES.map((tile) => tileToWorld(tile.x, tile.y, 0.84));
const pathEndProgress = PATH_TILES.length - 1;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tileMeshes = [];
const slotMeshes = [];
const slotRuneMeshes = [];
let groundPlane;
let chestMesh;
let spawnPadMesh;
let boardAmbientMesh;
let boardHaloMesh;
let chestBaseMesh;
let chestLidMesh;
let boardPlatformMesh;
let boardFrameMesh;
let boardBackdropMesh;
const envDecorMeshes = [];
let grassOverlayMesh;
let pathRibbonMesh;

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
applyStageTheme(state.stage);
seedInitialLineup();
renderRoster();
updateAllUi();
updateCameraFraming();
applyPanelVisibility();

const clock = new THREE.Clock();
renderer.setAnimationLoop(tick);

function tileToWorld(x, y, yOffset = 0) {
  return new THREE.Vector3((x - (GRID_W - 1) / 2) * TILE, yOffset, (y - (GRID_H - 1) / 2) * TILE);
}

function getMonsterVisual(monsterId) {
  return MONSTER_VISUALS[monsterId] || { silhouette: "blob", symbol: "orb", badge: monsterId.slice(0, 2) };
}

function getMonsterPortraitUri(monsterId) {
  if (monsterPortraitCache.has(monsterId)) return monsterPortraitCache.get(monsterId);

  let uri = "";
  try {
    const tex = createMonsterSpriteTexture(monsterId);
    const image = tex?.image;
    if (image && typeof image.toDataURL === "function") {
      uri = image.toDataURL("image/png");
    }
  } catch {
    // icon fallback handled below
  }

  if (!uri) {
    const monster = monsterCatalog[monsterId];
    const visual = getMonsterVisual(monsterId);
    const c1 = new THREE.Color(monster?.color || 0x8ec8ff).getHexString();
    const c2 = new THREE.Color(monster?.accent || 0xffffff).getHexString();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs><radialGradient id="g" cx="32%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#${c2}"/><stop offset="100%" stop-color="#${c1}"/>
      </radialGradient></defs>
      <rect x="4" y="4" width="120" height="120" rx="22" fill="url(#g)"/>
      <circle cx="64" cy="64" r="46" fill="rgba(255,255,255,0.20)"/>
      <text x="64" y="73" text-anchor="middle" font-size="34" font-weight="800" fill="#2f1d12" font-family="Nunito, sans-serif">${visual.badge.toUpperCase()}</text>
    </svg>`;
    uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  monsterPortraitCache.set(monsterId, uri);
  return uri;
}

function getSpecialLabel(specialId) {
  return SPECIAL_LABELS[specialId] || "none";
}

function getPassiveLabel(passiveId) {
  return PASSIVE_LABELS[passiveId] || "none";
}

function getSkillIconUri(kind, skillId) {
  const key = `${kind}:${skillId}`;
  if (skillIconCache.has(key)) return skillIconCache.get(key);

  const path = SKILL_ICON_PATHS[skillId] || "M12 4L20 12L12 20L4 12Z";
  const palette = kind === "special"
    ? { bg1: "#ffd47e", bg2: "#e06b3f", ring: "#ffeccb", stroke: "#2b1409" }
    : { bg1: "#b9ffe8", bg2: "#4eb3a5", ring: "#e9fff8", stroke: "#12322f" };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.bg1}"/>
        <stop offset="100%" stop-color="${palette.bg2}"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="11" fill="url(#g)"/>
    <circle cx="12" cy="12" r="9.6" fill="none" stroke="${palette.ring}" stroke-width="1.4"/>
    <path d="${path}" fill="none" stroke="${palette.stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  skillIconCache.set(key, uri);
  return uri;
}

function getPassiveAuraStyle(passiveId) {
  return PASSIVE_AURA_STYLES[passiveId] || {
    color: 0xcce8ff,
    accent: 0x8ec7ff,
    kind: "ripple",
    spin: 1.8,
    pulse: 2.8,
    interval: 1.6
  };
}

function getSpecialFxStyle(specialId) {
  return SPECIAL_FX_STYLES[specialId] || {
    color: 0xffd38d,
    accent: 0xffb568,
    kind: "halo",
    size: 1.2,
    life: 0.8
  };
}

function getStageTheme(stage) {
  for (const theme of STAGE_THEME_TIERS) {
    if (stage <= theme.until) return theme;
  }
  return STAGE_THEME_TIERS[STAGE_THEME_TIERS.length - 1];
}

function applyStageTheme(stage) {
  const theme = getStageTheme(stage);
  scene.background.setHex(theme.sky);
  if (scene.fog) {
    scene.fog.color.setHex(theme.fog);
    scene.fog.near = theme.fogNear;
    scene.fog.far = theme.fogFar;
  }

  hemiLight.color.setHex(theme.hemiSky);
  hemiLight.groundColor.setHex(theme.hemiGround);
  hemiLight.intensity = theme.hemiIntensity;

  sun.color.setHex(theme.sunColor);
  sun.intensity = theme.sunIntensity;
  sun.position.set(theme.sunPos[0], theme.sunPos[1], theme.sunPos[2]);
  renderer.toneMappingExposure = theme.exposure;

  for (const tile of tileMeshes) {
    if (!tile.material || !tile.material.color) continue;
    tile.material.color.setHex(tile.userData.isPath ? theme.path : theme.grass);
    if (tile.material.emissive) {
      tile.material.emissive.setHex(tile.userData.isPath ? theme.path : theme.grass);
      tile.material.emissiveIntensity = tile.userData.isPath ? 0.09 : 0.06;
    }
  }

  for (const stone of slotMeshes) {
    if (stone.material && stone.material.color) stone.material.color.setHex(theme.stone);
  }
  for (const rune of slotRuneMeshes) {
    if (rune.material && rune.material.color) rune.material.color.setHex(theme.rune);
  }

  if (spawnPadMesh?.material?.color) spawnPadMesh.material.color.setHex(theme.spawn);
  if (chestBaseMesh?.material?.color) chestBaseMesh.material.color.setHex(theme.chestBase);
  if (chestLidMesh?.material?.color) chestLidMesh.material.color.setHex(theme.chestLid);
  if (boardAmbientMesh?.material?.color) boardAmbientMesh.material.color.setHex(theme.ambient);
  if (boardHaloMesh?.material?.color) boardHaloMesh.material.color.setHex(theme.halo);
  if (boardPlatformMesh?.material?.color) boardPlatformMesh.material.color.setHex(getThemePropColor(theme, "platform"));
  if (boardFrameMesh?.material?.color) boardFrameMesh.material.color.setHex(getThemePropColor(theme, "frame"));
  if (boardBackdropMesh?.material?.color) boardBackdropMesh.material.color.setHex(getThemePropColor(theme, "hill"));
  if (grassOverlayMesh?.material?.color) grassOverlayMesh.material.color.setHex(theme.halo);
  if (pathRibbonMesh?.material?.color) pathRibbonMesh.material.color.setHex(theme.path);
  for (const decor of envDecorMeshes) {
    if (!decor.material?.color) continue;
    const role = decor.userData.themeRole || "foliage";
    decor.material.color.setHex(getThemePropColor(theme, role));
  }
}

function createFxMaterial(color, opacity = 0.8) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}

function addFxMesh(effect, mesh) {
  effect.group.add(mesh);
  if (mesh.material && "opacity" in mesh.material) {
    effect.materials.push(mesh.material);
  }
}

function spawnMagicFx(kind, position, color, accent, size = 1, life = 0.8) {
  const effect = {
    group: new THREE.Group(),
    materials: [],
    life,
    age: 0,
    size,
    spin: (Math.random() * 1.8 + 0.7) * (Math.random() < 0.5 ? -1 : 1),
    drift: 0.2 + Math.random() * 0.32,
    kind
  };

  const y = Math.max(0.08, (position.y || 0) * 0.08 + 0.08);
  effect.group.position.set(position.x, y, position.z);

  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(0.25 * size, 0.42 * size, 28),
    createFxMaterial(color, 0.78)
  );
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.userData.spin = 1.4;
  addFxMesh(effect, baseRing);

  if (kind === "ripple" || kind === "halo" || kind === "sigil") {
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5 * size, 0.66 * size, 32),
      createFxMaterial(accent, 0.66)
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.userData.spin = -1;
    addFxMesh(effect, outerRing);
  }

  if (kind === "spark" || kind === "slash" || kind === "claw") {
    for (let i = 0; i < 4; i += 1) {
      const slash = new THREE.Mesh(
        new THREE.BoxGeometry(0.38 * size, 0.03, 0.07 * size),
        createFxMaterial(accent, 0.82)
      );
      const a = (i / 4) * Math.PI * 2;
      slash.position.set(Math.cos(a) * 0.46 * size, 0.05, Math.sin(a) * 0.46 * size);
      slash.rotation.y = a + Math.PI * 0.5;
      slash.userData.spin = 2.4;
      addFxMesh(effect, slash);
    }
  }

  if (kind === "shard" || kind === "snow" || kind === "crown") {
    for (let i = 0; i < 5; i += 1) {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.045 * size, 0.26 * size, 6),
        createFxMaterial(accent, 0.8)
      );
      const a = (i / 5) * Math.PI * 2;
      shard.position.set(Math.cos(a) * 0.44 * size, 0.06, Math.sin(a) * 0.44 * size);
      shard.rotation.x = Math.PI / 2;
      shard.rotation.z = a;
      shard.userData.spin = -2;
      addFxMesh(effect, shard);
    }
  }

  if (kind === "spiral" || kind === "howl") {
    const helix = new THREE.Mesh(
      new THREE.TorusGeometry(0.34 * size, 0.038 * size, 8, 22),
      createFxMaterial(accent, 0.7)
    );
    helix.rotation.x = -Math.PI / 2;
    helix.userData.spin = 3.6;
    addFxMesh(effect, helix);
  }

  if (kind === "flare" || kind === "fang" || kind === "gem") {
    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.16 * size, 18),
      createFxMaterial(color, 0.9)
    );
    core.rotation.x = -Math.PI / 2;
    addFxMesh(effect, core);
  }

  scene.add(effect.group);
  skillEffects.push(effect);
}

function spawnPassiveEffect(passiveId, position) {
  const style = getPassiveAuraStyle(passiveId);
  spawnMagicFx(style.kind, position, style.color, style.accent, 0.88, 0.8);
}

function spawnSpecialEffect(specialId, position, scale = 1) {
  const style = getSpecialFxStyle(specialId);
  spawnMagicFx(style.kind, position, style.color, style.accent, style.size * scale, style.life);
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function getSpecialPowerText(monster, stats) {
  const cd = `${(monster.specialCooldown || 0).toFixed(1)}s cd`;
  switch (monster.special) {
    case "slime_flood":
      return `${Math.round(stats.damage * 1.55)} aoe dmg (r3.6), slow 64% for 3.4s, chest heal per hit (${cd})`;
    case "rapid_brew":
      return `${Math.round(stats.damage * 5.05)} total burst across 3 hits (${cd})`;
    case "frost_spike_burst":
      return `up to ${Math.round(stats.damage * 1.45)} x4 targets, 68% slow + freeze (${cd})`;
    case "maul_quake":
      return `${Math.round(stats.damage * 2.15)} aoe quake dmg (r3.7), 1.2s stun (${cd})`;
    case "execution_strike":
      return `${Math.round(stats.damage * 4.4)} strike, then execute at 48% hp (${cd})`;
    case "latte_barrier":
      return `grants ${Math.round(16 + stats.damage * 0.72)} chest shield (${cd})`;
    case "divine_smite":
      return `${Math.round(stats.damage * 4.2)} smite + ${Math.round(stats.damage * 1.8)} aoe splash (${cd})`;
    case "time_warp":
      return `team cooldown acceleration + enemy slow field (${cd})`;
    case "blizzard_nova":
      return `${Math.round(stats.damage * 1.95)} front burst to 6 targets + deep freeze (${cd})`;
    case "global_stun":
      return `${Math.round(stats.damage * 0.9)} global pulse damage + board stun (${cd})`;
    case "meteor_rain":
      return `${Math.round(stats.damage * 2.25)} meteor aoe on 4 front enemies (${cd})`;
    case "dragon_fury":
      return `${Math.round(stats.damage * 3.1)} x3 dragon burst + 55% execute (${cd})`;
    case "broadside":
      return `${Math.round(stats.damage * 1.5)} aoe volleys on 5 enemies +22 gold (${cd})`;
    case "inferno_aura":
      return `${Math.round(stats.damage * 1.2)} aura hit + burn ${stats.burnDps.toFixed(0)}/s (${cd})`;
    case "prism_beam":
      return `${Math.round(stats.damage * 2.55)} beam burst to frontline + chain (${cd})`;
    case "thunder_dome":
      return `${Math.round(stats.damage * 2.2)} aoe lightning dome + stun (${cd})`;
    case "vine_snare":
      return `${Math.round(stats.damage * 1.15)} front snare pulse + root control (${cd})`;
    case "tidal_crash":
      return `${Math.round(stats.damage * 1.75)} wave hit + path pushback (${cd})`;
    case "shadow_barrage":
      return `${Math.round(stats.damage * 2.3)} shadow burst on 7 targets (${cd})`;
    case "soul_siphon":
      return `${Math.round(stats.damage * 4.8)} drain on elite target + chest sustain (${cd})`;
    case "starfall":
      return `${Math.round(stats.damage * 2.48)} meteor aoe on 6 enemies + burn (${cd})`;
    case "rift_lock":
      return `${Math.round(stats.damage * 0.62)} global pulse + heavy slow/fragility (${cd})`;
    case "guardian_totem":
      return `large chest heal+shield and team cooldown reduction (${cd})`;
    default:
      return `no scaling data (${cd})`;
  }
}

function getPassivePowerText(monster, stats) {
  switch (monster.passive) {
    case "ooze_regen":
      return `heals chest ${stats.chestHealOnHit.toFixed(1)} per hit`;
    case "espresso_crit":
      return `${formatPercent(stats.critChance)} crit at x${stats.critMult.toFixed(2)}`;
    case "glacier_venom":
      return `${formatPercent(1 - stats.slow)} slow for ${stats.slowDuration.toFixed(1)}s + ${stats.burnDps.toFixed(0)}/s`;
    case "pack_hunter":
      return `+${formatPercent(stats.bonusVsStunned)} damage vs stunned targets`;
    case "armor_break":
      return `applies +${formatPercent(stats.armorBreak)} damage taken for ${stats.armorBreakDuration.toFixed(1)}s`;
    case "barista_focus":
      return `${formatPercent(stats.stunChance)} stun, ${stats.stunDuration.toFixed(1)}s, +${stats.chestShieldOnStun.toFixed(0)} shield on stun`;
    case "divine_command":
      return `adjacency scaling active (damage/speed/range boost)`;
    case "hyperflow":
      return `high attack flow (${(1 / stats.attackDelay).toFixed(2)} atk/s) + faster special cycle`;
    case "permafrost":
      return `${formatPercent(1 - stats.slow)} slow + chain ${stats.chainJumps} with ${Math.round(stats.chainFalloff * 100)}% falloff`;
    case "royal_tribute":
      return `${formatPercent(stats.tributeChance)} chance for +${stats.tributeGold.toFixed(0)} tribute gold`;
    case "solar_burn":
      return `burn ${stats.burnDps.toFixed(0)}/s with splash radius ${stats.splash.toFixed(1)}`;
    case "apex_predator":
      return `execute at ${formatPercent(stats.executeThreshold)} + ${formatPercent(stats.bossBonus)} vs bosses`;
    case "high_plunder":
      return `${formatPercent(stats.goldStealChance)} gold steal + ${formatPercent(stats.critChance)} crit`;
    case "alpha_howl":
      return `pack aura support + ${formatPercent(stats.bonusVsStunned)} vs stunned`;
    case "sniper_focus":
      return `long range burst + ${formatPercent(stats.critChance)} crit at x${stats.critMult.toFixed(2)}`;
    case "mana_surge":
      return `higher tempo (${(1 / stats.attackDelay).toFixed(2)} atk/s) + faster special cycle`;
    case "storm_link":
      return `chain ${stats.chainJumps} with ${Math.round(stats.chainFalloff * 100)}% carry damage`;
    case "thorns_shell":
      return `reflective shell scaling: splash ${stats.splash.toFixed(1)} + armor break`;
    case "tidal_guard":
      return `${formatPercent(1 - stats.slow)} slow and chest sustain (${stats.chestHealOnHit.toFixed(1)}/hit)`;
    case "shadow_mark":
      return `marks enemies: +${formatPercent(stats.armorBreak)} taken and execute ${formatPercent(stats.executeThreshold)}`;
    case "ember_heart":
      return `burn ${stats.burnDps.toFixed(0)}/s + splash ${stats.splash.toFixed(1)}`;
    case "tempo_master":
      return `party haste aura and accelerated cooldown rhythm`;
    case "lucky_strike":
      return `${formatPercent(stats.critChance)} crit + ${formatPercent(stats.goldStealChance)} gold steal`;
    default:
      return "no passive scaling data";
  }
}

function getSpecialDescription(specialId) {
  switch (specialId) {
    case "slime_flood": return "aoe splash wave that slows enemies and heals the chest.";
    case "rapid_brew": return "rapid multi-hit burst on front enemies.";
    case "frost_spike_burst": return "multi-target freeze burst with heavy slow.";
    case "maul_quake": return "quake slam that stuns enemies in an area.";
    case "execution_strike": return "single-target execute with armor break.";
    case "latte_barrier": return "grants chest shield and stabilizes allies.";
    case "divine_smite": return "high-damage smite with splash follow-up.";
    case "time_warp": return "team haste pulse and enemy time slow.";
    case "blizzard_nova": return "global chill pulse with chain frost damage.";
    case "global_stun": return "board-wide stun pulse from the king.";
    case "meteor_rain": return "drops meteors on front-line enemies.";
    case "dragon_fury": return "dragon burst combo with execute pressure.";
    case "broadside": return "multi-cannon blast that also grants gold.";
    case "inferno_aura": return "close-range burn aura around hellhound.";
    case "prism_beam": return "piercing prismatic beam chain on front enemies.";
    case "thunder_dome": return "electrical field that stuns and bursts enemies.";
    case "vine_snare": return "roots and slows clustered enemies in lanes.";
    case "tidal_crash": return "crashing wave that pushes enemies backward.";
    case "shadow_barrage": return "rapid dark strikes that expose enemies.";
    case "soul_siphon": return "drains elite enemies and reinforces the chest.";
    case "starfall": return "heavy meteor shower with burn and stun.";
    case "rift_lock": return "global time-rift lock that weakens all enemies.";
    case "guardian_totem": return "summons a defensive totem for chest + team.";
    default: return "no active ability.";
  }
}

function getPassiveDescription(passiveId) {
  switch (passiveId) {
    case "ooze_regen": return "attacks restore chest hp over time.";
    case "espresso_crit": return "high crit chance and crit damage.";
    case "glacier_venom": return "adds poison-frost slows and chain.";
    case "pack_hunter": return "bonus damage to stunned targets.";
    case "armor_break": return "applies increased damage taken debuff.";
    case "barista_focus": return "extra stun rate and protective shielding.";
    case "divine_command": return "scales power from adjacent allies.";
    case "hyperflow": return "faster attacks and faster special cycling.";
    case "permafrost": return "strong slow, extra chain, better control.";
    case "royal_tribute": return "chance to generate bonus gold on hit.";
    case "solar_burn": return "high burn damage with large splash.";
    case "apex_predator": return "higher execute threshold, anti-boss bonus.";
    case "high_plunder": return "strong gold steal and crit bonus.";
    case "alpha_howl": return "aura support plus self damage boost.";
    case "sniper_focus": return "long-range precision crit scaling.";
    case "mana_surge": return "increased cast tempo and damage flow.";
    case "storm_link": return "enhances chain attacks and lightning arcs.";
    case "thorns_shell": return "defensive shell that inflicts extra punishment.";
    case "tidal_guard": return "water guard that slows enemies and sustains chest.";
    case "shadow_mark": return "marks targets for execute and armor break.";
    case "ember_heart": return "ignites attacks with persistent burn.";
    case "tempo_master": return "teamwide cadence aura for cooldown acceleration.";
    case "lucky_strike": return "high crit and extra loot generation.";
    default: return "no passive.";
  }
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

function createTilePatternTexture(kind) {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");

  if (kind === "path") {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#f7d088");
    grad.addColorStop(1, "#d9a865");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(125, 77, 36, 0.2)";
    ctx.lineWidth = 3;
    for (let i = 8; i < size; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 12, size);
      ctx.stroke();
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#78d56e");
    grad.addColorStop(1, "#4ea955");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 37) % size;
      const y = (i * 53) % size;
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 4, (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createSoftNoiseTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 1400; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 13;
    ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.4, r, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.6, 1.8);
  tex.needsUpdate = true;
  return tex;
}

function getThemePropColor(theme, role) {
  if (role === "platform") return theme.platform || theme.grass;
  if (role === "frame") return theme.frame || theme.path;
  if (role === "hill") return theme.hill || theme.fog;
  if (role === "foliage") return theme.foliage || theme.grass;
  if (role === "rock") return theme.rock || theme.path;
  if (role === "crystal") return theme.crystal || theme.rune;
  if (role === "halo") return theme.halo || 0xffffff;
  return 0xffffff;
}

function buildBoard() {
  const boardGroup = new THREE.Group();

  boardPlatformMesh = new THREE.Mesh(
    new THREE.BoxGeometry(GRID_W * TILE * 1.06, 4.2, GRID_H * TILE * 1.12),
    new THREE.MeshToonMaterial({ color: 0x4f8d6e, gradientMap: toonGradientMap })
  );
  boardPlatformMesh.position.set(0, -2.35, 0);
  scene.add(boardPlatformMesh);

  boardFrameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(GRID_W * TILE * 1.02, 0.68, GRID_H * TILE * 1.05),
    new THREE.MeshToonMaterial({ color: 0xb48952, gradientMap: toonGradientMap })
  );
  boardFrameMesh.position.set(0, -0.9, 0);
  scene.add(boardFrameMesh);

  boardBackdropMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.9, GRID_H * TILE * 1.3),
    new THREE.MeshBasicMaterial({ color: 0x9fc5f2, transparent: true, opacity: 0.22 })
  );
  boardBackdropMesh.position.set(0, 5.8, -GRID_H * TILE * 0.78);
  scene.add(boardBackdropMesh);

  const tileGeo = new THREE.BoxGeometry(TILE * 0.97, 0.86, TILE * 0.97);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const isPath = pathTileSet.has(`${x},${y}`);
      const tile = new THREE.Mesh(
        tileGeo,
        new THREE.MeshToonMaterial({
          color: isPath ? 0xe6be75 : 0x59bc53,
          gradientMap: toonGradientMap,
          map: isPath ? pathTileTexture : grassTileTexture,
          emissive: isPath ? 0xe6be75 : 0x59bc53,
          emissiveIntensity: isPath ? 0.08 : 0.05
        })
      );
      const lift = isPath ? -0.4 : -0.43 + Math.sin(x * 0.92 + y * 1.17) * 0.04;
      tile.position.copy(tileToWorld(x, y, lift));
      tile.userData = { tileX: x, tileY: y, isPath };
      boardGroup.add(tile);
      tileMeshes.push(tile);
    }
  }

  scene.add(boardGroup);

  grassOverlayMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 0.99, GRID_H * TILE * 0.99),
    new THREE.MeshBasicMaterial({
      map: terrainNoiseTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    })
  );
  grassOverlayMesh.rotation.x = -Math.PI / 2;
  grassOverlayMesh.position.y = 0.05;
  scene.add(grassOverlayMesh);

  const ribbonPoints = pathWorld.map((p) => new THREE.Vector3(p.x, 0.06, p.z));
  const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints, false, "centripetal");
  pathRibbonMesh = new THREE.Mesh(
    new THREE.TubeGeometry(ribbonCurve, 220, TILE * 0.45, 12, false),
    new THREE.MeshToonMaterial({
      color: 0xe8c07b,
      gradientMap: toonGradientMap,
      transparent: true,
      opacity: 0.9
    })
  );
  scene.add(pathRibbonMesh);

  for (let i = 0; i < HERO_SLOTS.length; i += 1) {
    const slot = HERO_SLOTS[i];
    const pos = tileToWorld(slot.x, slot.y, 0.15);

    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.95, 0.4, 10),
      new THREE.MeshToonMaterial({ color: 0x4caee8, gradientMap: toonGradientMap })
    );
    stone.position.copy(pos);
    stone.userData = { slotIndex: i };
    scene.add(stone);
    slotMeshes.push(stone);

    const rune = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.45, 6),
      new THREE.MeshBasicMaterial({ color: 0x90f0ff, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
    );
    rune.rotation.x = -Math.PI / 2;
    rune.position.set(pos.x, pos.y + 0.23, pos.z);
    scene.add(rune);
    slotRuneMeshes.push(rune);

    const slotHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.57, 0.72, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    slotHalo.rotation.x = -Math.PI / 2;
    slotHalo.position.set(pos.x, pos.y + 0.16, pos.z);
    scene.add(slotHalo);
    slotHalo.userData.themeRole = "halo";
    envDecorMeshes.push(slotHalo);
  }

  spawnPadMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.26, 1.26, 0.24, 24),
    new THREE.MeshBasicMaterial({ color: 0x84d6ff, transparent: true, opacity: 0.9 })
  );
  spawnPadMesh.position.copy(tileToWorld(PATH_TILES[0].x, PATH_TILES[0].y, 0.17));
  scene.add(spawnPadMesh);

  const spawnRing = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.45, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
  );
  spawnRing.rotation.x = -Math.PI / 2;
  spawnRing.position.copy(tileToWorld(PATH_TILES[0].x, PATH_TILES[0].y, 0.2));
  scene.add(spawnRing);
  spawnRing.userData.themeRole = "halo";
  envDecorMeshes.push(spawnRing);

  chestMesh = new THREE.Group();
  const chestPos = tileToWorld(PATH_TILES[PATH_TILES.length - 1].x, PATH_TILES[PATH_TILES.length - 1].y, 1.2);
  chestBaseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 1.6, 2.05),
    new THREE.MeshToonMaterial({ color: 0xab6f2d, gradientMap: toonGradientMap })
  );
  chestLidMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.74, 2.08),
    new THREE.MeshToonMaterial({ color: 0xf8c95c, gradientMap: toonGradientMap })
  );
  chestLidMesh.position.y = 1.02;
  chestMesh.add(chestBaseMesh, chestLidMesh);
  chestMesh.position.copy(chestPos);
  scene.add(chestMesh);

  boardAmbientMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.45, GRID_H * TILE * 1.45),
    new THREE.MeshBasicMaterial({ color: 0x6dc957, transparent: true, opacity: 0.42 })
  );
  boardAmbientMesh.rotation.x = -Math.PI / 2;
  boardAmbientMesh.position.y = -0.85;
  scene.add(boardAmbientMesh);

  boardHaloMesh = new THREE.Mesh(
    new THREE.CircleGeometry(GRID_W * TILE * 0.9, 60),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
  );
  boardHaloMesh.rotation.x = -Math.PI / 2;
  boardHaloMesh.position.y = -0.84;
  scene.add(boardHaloMesh);

  const decorCount = 12;
  const boardHalfW = ((GRID_W - 1) * TILE) / 2;
  const boardHalfH = ((GRID_H - 1) * TILE) / 2;
  for (let i = 0; i < decorCount; i += 1) {
    const t = i / (decorCount - 1);
    const x = THREE.MathUtils.lerp(-boardHalfW - 5.5, boardHalfW + 5.5, t);
    const zTop = -boardHalfH - 6.5 + Math.sin(i * 1.6) * 1.2;
    const zBottom = boardHalfH + 6.5 + Math.cos(i * 1.2) * 1.1;

    for (const z of [zTop, zBottom]) {
      const mound = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 1.34, 0.95, 8),
        new THREE.MeshToonMaterial({ color: 0x6ea55f, gradientMap: toonGradientMap })
      );
      mound.position.set(x, -0.28, z);
      scene.add(mound);
      mound.userData.themeRole = "foliage";
      envDecorMeshes.push(mound);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45 + Math.random() * 0.14, 0),
        new THREE.MeshToonMaterial({ color: 0x9fd7ff, gradientMap: toonGradientMap })
      );
      crystal.position.set(x + (Math.random() * 1.2 - 0.6), 0.48, z + (Math.random() * 1.4 - 0.7));
      crystal.rotation.y = Math.random() * Math.PI;
      scene.add(crystal);
      crystal.userData.themeRole = "crystal";
      envDecorMeshes.push(crystal);

      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.42 + Math.random() * 0.18, 0),
        new THREE.MeshToonMaterial({ color: 0xa9a5b4, gradientMap: toonGradientMap })
      );
      rock.position.set(x + (Math.random() * 1.8 - 0.9), -0.03, z + (Math.random() * 1.6 - 0.8));
      scene.add(rock);
      rock.userData.themeRole = "rock";
      envDecorMeshes.push(rock);
    }
  }

  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_W * TILE * 1.5, GRID_H * TILE * 1.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  scene.add(groundPlane);

  // Barricade mechanics are intentionally disabled; stones are placement slots.
}

function wireUi() {
  ui.toggleStatsBtn.addEventListener("click", () => {
    togglePanel("stats");
    applyPanelVisibility();
  });
  ui.toggleControlsBtn.addEventListener("click", () => {
    togglePanel("controls");
    applyPanelVisibility();
  });
  ui.toggleHeroBtn.addEventListener("click", () => {
    togglePanel("hero");
    applyPanelVisibility();
  });
  ui.toggleInventoryBtn.addEventListener("click", () => {
    togglePanel("inventory");
    applyPanelVisibility();
  });
  ui.closeStatsBtn.addEventListener("click", () => {
    panelState.stats = false;
    applyPanelVisibility();
  });
  ui.closeControlsBtn.addEventListener("click", () => {
    panelState.controls = false;
    applyPanelVisibility();
  });
  ui.closeHeroBtn.addEventListener("click", () => {
    panelState.hero = false;
    applyPanelVisibility();
  });
  ui.closeInventoryBtn.addEventListener("click", () => {
    panelState.inventory = false;
    applyPanelVisibility();
  });

  ui.startWaveBtn.addEventListener("click", () => {
    if (state.runOver || state.waveActive) return;
    startWave();
  });
  ui.nextStageBtn.addEventListener("click", () => {
    if (state.runOver || state.waveActive) return;
    advanceStage();
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
    updateCameraFraming();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("beforeunload", saveGame);
}

function togglePanel(name) {
  const wasOpen = panelState[name];
  panelState.stats = false;
  panelState.controls = false;
  panelState.hero = false;
  panelState.inventory = false;
  panelState[name] = !wasOpen;
}

function applyPanelVisibility() {
  ui.topHud.classList.toggle("is-hidden", !panelState.stats);
  ui.leftPanel.classList.toggle("is-hidden", !panelState.controls);
  ui.rightPanel.classList.toggle("is-hidden", !panelState.hero);
  ui.rosterPanel.classList.toggle("is-hidden", !panelState.inventory);
  appRoot.classList.toggle("inventory-open", panelState.inventory);

  ui.toggleStatsBtn.classList.toggle("is-active", panelState.stats);
  ui.toggleControlsBtn.classList.toggle("is-active", panelState.controls);
  ui.toggleHeroBtn.classList.toggle("is-active", panelState.hero);
  ui.toggleInventoryBtn.classList.toggle("is-active", panelState.inventory);
}

function updateCameraFraming() {
  // Keep heroes large and readable on laptop-width screens.
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  if (aspect < 0.95) {
    camera.position.set(0, 17, 30);
    camera.lookAt(0, 1.6, 2.5);
  } else if (aspect < 1.45) {
    camera.position.set(0, 14.5, 25);
    camera.lookAt(0, 1.6, 1.5);
  } else {
    camera.position.set(0, 12.3, 21.8);
    camera.lookAt(0, 1.5, 0.7);
  }
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
  panelState.stats = false;
  panelState.controls = false;
  panelState.hero = false;
  panelState.inventory = true;
  applyPanelVisibility();

  renderRoster();
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
    panelState.stats = false;
    panelState.controls = false;
    panelState.hero = true;
    panelState.inventory = false;
    applyPanelVisibility();
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
    passiveFxTimer: 0.65 + Math.random() * 1.2,
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

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function drawHeroSilhouettePath(ctx, silhouette, variant) {
  if (silhouette === "beast") {
    ctx.moveTo(92, 430);
    ctx.quadraticCurveTo(80, 374, 112, 322);
    ctx.quadraticCurveTo(154, 274, 198, 270);
    ctx.quadraticCurveTo(246, 268, 282, 226);
    ctx.quadraticCurveTo(316, 192, 332, 146);
    ctx.quadraticCurveTo(340, 188, 324, 224);
    ctx.quadraticCurveTo(312, 252, 304, 282);
    ctx.quadraticCurveTo(350, 300, 328, 338);
    ctx.quadraticCurveTo(307, 372, 274, 372);
    ctx.quadraticCurveTo(244, 372, 228, 404);
    ctx.quadraticCurveTo(210, 445, 172, 456);
    ctx.quadraticCurveTo(136, 466, 104, 452);
    ctx.closePath();
    return;
  }

  if (silhouette === "dragon") {
    ctx.moveTo(84, 412);
    ctx.quadraticCurveTo(122, 322, 178, 300);
    ctx.quadraticCurveTo(144, 254, 146, 206);
    ctx.quadraticCurveTo(150, 136, 220, 112);
    ctx.quadraticCurveTo(198, 166, 216, 226);
    ctx.quadraticCurveTo(272, 190, 324, 190);
    ctx.quadraticCurveTo(304, 228, 268, 248);
    ctx.quadraticCurveTo(314, 290, 334, 340);
    ctx.quadraticCurveTo(286, 346, 252, 326);
    ctx.quadraticCurveTo(222, 386, 236, 450);
    ctx.quadraticCurveTo(176, 448, 150, 414);
    ctx.quadraticCurveTo(120, 446, 84, 412);
    ctx.closePath();
    return;
  }

  if (silhouette === "mage") {
    ctx.moveTo(104, 432);
    ctx.quadraticCurveTo(118, 340, 144, 272);
    ctx.quadraticCurveTo(100, 250, 102, 210);
    ctx.quadraticCurveTo(106, 160, 146, 138);
    ctx.quadraticCurveTo(182, 118, 210, 120);
    ctx.quadraticCurveTo(242, 120, 270, 140);
    ctx.quadraticCurveTo(304, 164, 302, 212);
    ctx.quadraticCurveTo(300, 250, 266, 272);
    ctx.quadraticCurveTo(286, 338, 302, 432);
    ctx.quadraticCurveTo(242, 454, 202, 452);
    ctx.quadraticCurveTo(160, 452, 104, 432);
    ctx.closePath();
    ctx.moveTo(140, 180);
    ctx.lineTo(202, 76);
    ctx.lineTo(266, 180);
    ctx.closePath();
    return;
  }

  if (silhouette === "cat") {
    ctx.moveTo(96, 430);
    ctx.quadraticCurveTo(104, 350, 138, 310);
    ctx.quadraticCurveTo(174, 268, 202, 262);
    ctx.quadraticCurveTo(230, 268, 266, 310);
    ctx.quadraticCurveTo(300, 350, 308, 430);
    ctx.quadraticCurveTo(256, 458, 202, 460);
    ctx.quadraticCurveTo(148, 458, 96, 430);
    ctx.closePath();
    ctx.moveTo(136, 286);
    ctx.lineTo(154, 210);
    ctx.lineTo(186, 272);
    ctx.closePath();
    ctx.moveTo(268, 286);
    ctx.lineTo(250, 210);
    ctx.lineTo(218, 272);
    ctx.closePath();
    if (variant % 2 === 0) {
      ctx.moveTo(286, 386);
      ctx.quadraticCurveTo(334, 366, 336, 324);
      ctx.quadraticCurveTo(324, 350, 286, 360);
      ctx.closePath();
    }
    return;
  }

  ctx.moveTo(102, 420);
  ctx.quadraticCurveTo(104, 332, 146, 290);
  ctx.quadraticCurveTo(170, 264, 202, 256);
  ctx.quadraticCurveTo(236, 262, 264, 290);
  ctx.quadraticCurveTo(304, 334, 302, 420);
  ctx.quadraticCurveTo(260, 456, 202, 462);
  ctx.quadraticCurveTo(144, 456, 102, 420);
  ctx.closePath();
}

function createHeroFigureTexture(monsterId) {
  if (heroFigureCache.has(monsterId)) return heroFigureCache.get(monsterId);

  const monster = monsterCatalog[monsterId];
  const visual = getMonsterVisual(monsterId);
  const rarity = rarityCatalog[monster.rarity];
  const variant = hashString(monsterId) % 5;
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 384;
  canvas2d.height = 512;
  const ctx = canvas2d.getContext("2d");

  const c1 = new THREE.Color(monster.color);
  const c2 = new THREE.Color(monster.accent);
  const aura = new THREE.Color(rarity?.color || 0xffffff);

  const glow = ctx.createRadialGradient(192, 264, 28, 192, 264, 180);
  glow.addColorStop(0, `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.95)`);
  glow.addColorStop(0.45, `rgba(${Math.round(c1.r * 255)}, ${Math.round(c1.g * 255)}, ${Math.round(c1.b * 255)}, 0.48)`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 384, 512);

  ctx.strokeStyle = `rgba(${Math.round(aura.r * 255)}, ${Math.round(aura.g * 255)}, ${Math.round(aura.b * 255)}, 0.85)`;
  ctx.lineWidth = monster.rarity === "special" ? 14 : 10;
  ctx.beginPath();
  ctx.arc(192, 264, monster.rarity === "special" ? 124 : 112, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  drawHeroSilhouettePath(ctx, visual.silhouette, variant);
  ctx.fillStyle = "rgba(9, 9, 12, 0.95)";
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.stroke();

  ctx.beginPath();
  drawHeroSilhouettePath(ctx, visual.silhouette, variant);
  const bodyGrad = ctx.createLinearGradient(120, 120, 260, 430);
  bodyGrad.addColorStop(0, `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.92)`);
  bodyGrad.addColorStop(1, `rgba(${Math.round(c1.r * 255)}, ${Math.round(c1.g * 255)}, ${Math.round(c1.b * 255)}, 0.92)`);
  ctx.fillStyle = bodyGrad;
  ctx.globalCompositeOperation = "source-atop";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "rgba(255,255,255,0.93)";
  ctx.beginPath();
  ctx.arc(173, 302, 8, 0, Math.PI * 2);
  ctx.arc(211, 302, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(17,17,20,0.95)";
  ctx.beginPath();
  ctx.arc(174, 304, 3.5, 0, Math.PI * 2);
  ctx.arc(212, 304, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, 24);
  drawMonsterSymbol(ctx, visual.symbol, 192);
  ctx.restore();

  ctx.font = "800 36px Baloo 2";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.fillText(visual.badge.toUpperCase(), 192, 478);

  const tex = new THREE.CanvasTexture(canvas2d);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  heroFigureCache.set(monsterId, tex);
  return tex;
}

function createHeroMesh(monsterId) {
  const monster = monsterCatalog[monsterId];
  const rarityColor = rarityCatalog[monster.rarity].color;
  const group = new THREE.Group();
  const visual = getMonsterVisual(monsterId);
  const variant = hashString(monsterId) % 4;

  const baseShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.28, 30),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })
  );
  baseShadow.rotation.x = -Math.PI / 2;
  baseShadow.position.y = 0.02;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.28, 0.52, 24),
    new THREE.MeshToonMaterial({ color: 0xf4fbff, gradientMap: toonGradientMap })
  );
  base.position.y = 0.26;

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.98, 0.52, 18),
    new THREE.MeshToonMaterial({ color: 0xd6edf8, gradientMap: toonGradientMap })
  );
  plinth.position.y = 0.72;

  const coreGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.44, 0),
    new THREE.MeshToonMaterial({ color: monster.color, gradientMap: toonGradientMap })
  );
  coreGem.position.y = 1.35;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.12, 10, 26),
    new THREE.MeshBasicMaterial({ color: rarityColor, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.86;

  const figureSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createHeroFigureTexture(monsterId),
      transparent: true,
      depthWrite: false,
      alphaTest: 0.02
    })
  );
  figureSprite.center.set(0.5, 0.08);
  figureSprite.position.y = 0.82;
  const figureScale = {
    common: 3.95,
    rare: 4.2,
    epic: 4.45,
    legendary: 4.75,
    special: 5.05
  }[monster.rarity] || 4;
  figureSprite.scale.set(figureScale, figureScale * 1.22, 1);

  const iconSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createMonsterSpriteTexture(monsterId),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.98
    })
  );
  iconSprite.position.y = 3.44;
  const rarityIconScale = {
    common: 2.15,
    rare: 2.25,
    epic: 2.42,
    legendary: 2.58,
    special: 2.72
  }[monster.rarity] || 2.2;
  iconSprite.scale.set(rarityIconScale, rarityIconScale, 1);

  const sideAccent = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.07, 8, 16, Math.PI + variant * 0.22),
    new THREE.MeshBasicMaterial({ color: monster.accent, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
  );
  sideAccent.position.y = 1.55;
  sideAccent.rotation.x = Math.PI / 2;

  let rareAura = null;
  let orbitGroup = null;
  let orbitGroup2 = null;
  let passiveAura = null;
  let passiveAuraInner = null;

  const passiveStyle = getPassiveAuraStyle(monster.passive);
  passiveAura = new THREE.Mesh(
    new THREE.RingGeometry(0.74, 0.97, 28),
    new THREE.MeshBasicMaterial({
      color: passiveStyle.color,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  passiveAura.rotation.x = -Math.PI / 2;
  passiveAura.position.y = 0.1;

  passiveAuraInner = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.57, 20),
    new THREE.MeshBasicMaterial({
      color: passiveStyle.accent,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  passiveAuraInner.rotation.x = -Math.PI / 2;
  passiveAuraInner.position.y = 0.12;

  if (monster.rarity === "epic" || monster.rarity === "legendary" || monster.rarity === "special") {
    rareAura = new THREE.Mesh(
      new THREE.RingGeometry(1.18, 1.34, 28),
      new THREE.MeshBasicMaterial({ color: rarityColor, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    );
    rareAura.rotation.x = -Math.PI / 2;
    rareAura.position.y = 0.08;
  }

  if (monster.rarity === "legendary" || monster.rarity === "special") {
    orbitGroup = new THREE.Group();
    orbitGroup.position.y = 2.66;
    for (let i = 0; i < 3; i += 1) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8),
        new THREE.MeshBasicMaterial({ color: monster.accent, transparent: true, opacity: 0.92 })
      );
      const a = (i / 3) * Math.PI * 2 + variant * 0.3;
      orb.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02);
      orbitGroup.add(orb);
    }
  }

  if (monster.rarity === "special") {
    orbitGroup2 = new THREE.Group();
    orbitGroup2.position.y = 2.16;
    for (let i = 0; i < 5; i += 1) {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.42, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.84 })
      );
      const a = (i / 5) * Math.PI * 2;
      shard.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02);
      shard.rotation.x = Math.PI / 2;
      shard.rotation.z = a;
      orbitGroup2.add(shard);
    }
  }

  if (monsterId === "slime_king") {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.52, 7),
      new THREE.MeshToonMaterial({ color: 0xffdf73, gradientMap: toonGradientMap })
    );
    crown.position.y = 3.02;
    group.add(crown);
  }

  if (monsterId === "felina") {
    const wingL = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.86, 0.56),
      new THREE.MeshToonMaterial({ color: 0xffcfbe, gradientMap: toonGradientMap })
    );
    const wingR = wingL.clone();
    wingL.position.set(-0.74, 2.22, -0.05);
    wingR.position.set(0.74, 2.22, -0.05);
    wingL.rotation.z = 0.42;
    wingR.rotation.z = -0.42;
    group.add(wingL, wingR);
  }

  if (monsterId === "kevin") {
    const bodyMat = new THREE.MeshToonMaterial({ color: monster.color, gradientMap: toonGradientMap });
    const headL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), bodyMat);
    const headR = headL.clone();
    headL.position.set(-0.66, 2.05, 0.16);
    headR.position.set(0.66, 2.05, 0.16);
    group.add(headL, headR);
  }

  if (monsterId === "pirate_cat") {
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
      new THREE.MeshToonMaterial({ color: 0x5a3d28, gradientMap: toonGradientMap })
    );
    mast.position.set(-0.42, 2.78, -0.08);
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.16, 0.02),
      new THREE.MeshToonMaterial({ color: 0xf7f0e1, gradientMap: toonGradientMap })
    );
    flag.position.set(-0.28, 2.96, -0.08);
    group.add(mast, flag);
  }

  if (monsterId === "hellhound") {
    const mane = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.08, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xff7f5a, transparent: true, opacity: 0.85 })
    );
    mane.position.y = 2.5;
    mane.rotation.x = Math.PI / 2;
    group.add(mane);
  }

  group.add(baseShadow, base, plinth, coreGem, ring, sideAccent, figureSprite, iconSprite);
  if (passiveAura) group.add(passiveAura);
  if (passiveAuraInner) group.add(passiveAuraInner);
  if (rareAura) group.add(rareAura);
  if (orbitGroup) group.add(orbitGroup);
  if (orbitGroup2) group.add(orbitGroup2);
  group.userData.visuals = {
    ring,
    iconSprite,
    figureSprite,
    figureScale,
    iconScale: rarityIconScale,
    rareAura,
    orbitGroup,
    orbitGroup2,
    passiveAura,
    passiveAuraInner
  };
  return group;
}

function createMonsterSpriteTexture(monsterId) {
  if (spriteCache.has(monsterId)) return spriteCache.get(monsterId);

  const monster = monsterCatalog[monsterId];
  const visual = getMonsterVisual(monsterId);
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 256;
  canvas2d.height = 256;
  const ctx = canvas2d.getContext("2d");
  const center = 128;

  const c1 = new THREE.Color(monster.color);
  const c2 = new THREE.Color(monster.accent);
  const rarityTone = new THREE.Color(rarityCatalog[monster.rarity]?.color || 0xffffff);

  const halo = ctx.createRadialGradient(center, center, 12, center, center, 122);
  halo.addColorStop(0, `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.95)`);
  halo.addColorStop(0.5, `rgba(${Math.round(c1.r * 255)}, ${Math.round(c1.g * 255)}, ${Math.round(c1.b * 255)}, 0.52)`);
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 256, 256);

  if (monster.rarity === "epic" || monster.rarity === "legendary" || monster.rarity === "special") {
    ctx.strokeStyle = `rgba(${Math.round(rarityTone.r * 255)}, ${Math.round(rarityTone.g * 255)}, ${Math.round(rarityTone.b * 255)}, 0.9)`;
    ctx.lineWidth = monster.rarity === "special" ? 10 : 8;
    ctx.beginPath();
    ctx.arc(center, center, 92, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(center, center, 76, 0, Math.PI * 2);
  ctx.stroke();

  const figureTexture = createHeroFigureTexture(monsterId);
  if (figureTexture?.image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 72, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(figureTexture.image, 58, 24, 140, 186);
    ctx.restore();
  }

  drawMonsterSymbol(ctx, visual.symbol, center);

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "700 18px Nunito";
  ctx.textAlign = "center";
  ctx.fillText(visual.badge.toUpperCase(), center, 220);

  const tex = new THREE.CanvasTexture(canvas2d);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  spriteCache.set(monsterId, tex);
  return tex;
}

function drawMonsterSymbol(ctx, symbol, center) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.96)";
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (symbol === "drop") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.bezierCurveTo(center + 16, center - 6, center + 14, center + 18, center, center + 24);
    ctx.bezierCurveTo(center - 14, center + 18, center - 16, center - 6, center, center - 24);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "snow") {
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(a) * 6, center + Math.sin(a) * 6);
      ctx.lineTo(center + Math.cos(a) * 26, center + Math.sin(a) * 26);
      ctx.stroke();
    }
  } else if (symbol === "paw") {
    ctx.beginPath();
    ctx.arc(center, center + 14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(center - 14, center - 2, 5, 0, Math.PI * 2);
    ctx.arc(center - 4, center - 10, 5, 0, Math.PI * 2);
    ctx.arc(center + 6, center - 10, 5, 0, Math.PI * 2);
    ctx.arc(center + 16, center - 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (symbol === "axe") {
    ctx.beginPath();
    ctx.moveTo(center - 6, center + 24);
    ctx.lineTo(center + 8, center - 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center + 6, center - 14);
    ctx.lineTo(center + 24, center - 8);
    ctx.lineTo(center + 12, center + 4);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "cup") {
    ctx.beginPath();
    ctx.rect(center - 14, center - 4, 28, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center + 16, center + 4, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  } else if (symbol === "sword") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center + 8, center + 8);
    ctx.lineTo(center, center + 20);
    ctx.lineTo(center - 8, center + 8);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "bolt") {
    ctx.beginPath();
    ctx.moveTo(center + 6, center - 24);
    ctx.lineTo(center - 10, center + 2);
    ctx.lineTo(center + 2, center + 2);
    ctx.lineTo(center - 6, center + 24);
    ctx.stroke();
  } else if (symbol === "ice") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center + 18, center);
    ctx.lineTo(center, center + 24);
    ctx.lineTo(center - 18, center);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "crown") {
    ctx.beginPath();
    ctx.moveTo(center - 20, center + 18);
    ctx.lineTo(center - 14, center - 8);
    ctx.lineTo(center, center + 4);
    ctx.lineTo(center + 14, center - 8);
    ctx.lineTo(center + 20, center + 18);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "flame") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.bezierCurveTo(center + 14, center - 10, center + 14, center + 10, center, center + 22);
    ctx.bezierCurveTo(center - 10, center + 10, center - 14, center - 2, center, center - 24);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "fang") {
    ctx.beginPath();
    ctx.moveTo(center - 16, center - 10);
    ctx.lineTo(center - 2, center + 20);
    ctx.lineTo(center + 12, center - 10);
    ctx.stroke();
  } else if (symbol === "skull") {
    ctx.beginPath();
    ctx.arc(center, center + 4, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - 12, center + 18);
    ctx.lineTo(center + 12, center + 18);
    ctx.stroke();
  } else if (symbol === "claw") {
    ctx.beginPath();
    ctx.moveTo(center - 12, center + 20);
    ctx.lineTo(center - 4, center - 14);
    ctx.moveTo(center, center + 20);
    ctx.lineTo(center + 6, center - 16);
    ctx.moveTo(center + 12, center + 20);
    ctx.lineTo(center + 16, center - 12);
    ctx.stroke();
  } else if (symbol === "shield") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center + 20, center - 8);
    ctx.lineTo(center + 14, center + 22);
    ctx.lineTo(center, center + 28);
    ctx.lineTo(center - 14, center + 22);
    ctx.lineTo(center - 20, center - 8);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "leaf") {
    ctx.beginPath();
    ctx.moveTo(center - 18, center + 14);
    ctx.bezierCurveTo(center - 2, center - 22, center + 24, center - 8, center + 12, center + 16);
    ctx.bezierCurveTo(center + 4, center + 24, center - 8, center + 24, center - 18, center + 14);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - 8, center + 14);
    ctx.lineTo(center + 12, center - 4);
    ctx.stroke();
  } else if (symbol === "scope") {
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - 28, center);
    ctx.lineTo(center + 28, center);
    ctx.moveTo(center, center - 28);
    ctx.lineTo(center, center + 28);
    ctx.stroke();
  } else if (symbol === "wave") {
    ctx.beginPath();
    ctx.moveTo(center - 30, center + 8);
    ctx.bezierCurveTo(center - 20, center - 6, center - 8, center - 6, center + 2, center + 8);
    ctx.bezierCurveTo(center + 12, center + 22, center + 24, center + 22, center + 30, center + 8);
    ctx.stroke();
  } else if (symbol === "prism") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center + 22, center + 12);
    ctx.lineTo(center - 22, center + 12);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center, center + 12);
    ctx.stroke();
  } else if (symbol === "rift") {
    ctx.beginPath();
    ctx.moveTo(center - 8, center - 26);
    ctx.lineTo(center + 8, center - 10);
    ctx.lineTo(center - 4, center + 4);
    ctx.lineTo(center + 10, center + 24);
    ctx.stroke();
  } else if (symbol === "thunder") {
    ctx.beginPath();
    ctx.moveTo(center + 8, center - 24);
    ctx.lineTo(center - 6, center - 2);
    ctx.lineTo(center + 4, center - 2);
    ctx.lineTo(center - 8, center + 24);
    ctx.stroke();
  } else if (symbol === "moon") {
    ctx.beginPath();
    ctx.arc(center - 2, center, 22, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.arc(center + 10, center, 14, Math.PI * 0.38, -Math.PI * 0.38, true);
    ctx.stroke();
  } else if (symbol === "star") {
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.lineTo(center + 8, center - 4);
    ctx.lineTo(center + 26, center - 4);
    ctx.lineTo(center + 12, center + 8);
    ctx.lineTo(center + 18, center + 24);
    ctx.lineTo(center, center + 14);
    ctx.lineTo(center - 18, center + 24);
    ctx.lineTo(center - 12, center + 8);
    ctx.lineTo(center - 26, center - 4);
    ctx.lineTo(center - 8, center - 4);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "clock") {
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center, center - 12);
    ctx.lineTo(center + 10, center + 2);
    ctx.stroke();
  } else if (symbol === "void") {
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(center, center, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
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
  if (state.waveActive) return;
  if (state.stageClearReady) {
    log("stage cleared. press next stage.");
    return;
  }
  state.waveActive = true;
  state.wave = state.stage;
  state.waveQueue = buildWaveQueue(state.stage);
  state.spawnedThisWave = 0;
  state.spawnInterval = Math.max(0.22, 0.95 - state.stage * 0.016);
  state.spawnCooldown = 0.1;
  log(`stage ${state.stage} (${getStageTheme(state.stage).name}) began with ${state.waveQueue.length} enemies.`);
}

function advanceStage() {
  if (state.runOver) return;
  if (!state.stageClearReady) {
    log("clear this stage first.");
    return;
  }
  state.stage += 1;
  state.wave = state.stage;
  state.stageClearReady = false;
  applyStageTheme(state.stage);
  log(`advancing to stage ${state.stage}: ${getStageTheme(state.stage).name}.`);
  startWave();
}

function buildWaveQueue(stage) {
  const queue = [];
  const baseCount = 16 + Math.floor(stage * 2.8);

  for (let i = 0; i < baseCount; i += 1) {
    let type = "grunt";
    if (stage >= 2 && i % 5 === 0) type = "runner";
    if (stage >= 4 && i % 7 === 3) type = "tank";
    if (stage >= 6 && i % 7 === 5) type = "breaker";
    if (stage >= 8 && i % 9 === 2) type = "mage";
    if (stage >= 9 && i % 10 === 7) type = "shaman";
    if (stage >= 10 && i % 8 === 1) type = "assassin";
    if (stage >= 12 && i % 11 === 6) type = "bomber";
    if (stage >= 13 && i % 12 === 4) type = "frost_weaver";
    if (stage >= 14 && i % 13 === 8) type = "leech";
    if (stage >= 15 && i % 14 === 9) type = "sentinel";
    if (stage >= 16 && i % 15 === 2) type = "necromancer";
    if (stage >= 18 && i % 17 === 11) type = "juggernaut";
    if (stage >= 20 && i % 16 === 5) type = "mimic";
    queue.push(type);
  }

  if (stage % 3 === 0) {
    queue.splice(Math.max(2, Math.floor(baseCount * 0.42)), 0, "knome");
  }
  if (stage >= 9 && stage % 4 === 0) queue.splice(Math.floor(baseCount * 0.7), 0, "mimic");
  if (stage >= 14 && stage % 5 === 2) queue.splice(Math.floor(baseCount * 0.55), 0, "juggernaut");

  if (stage % 20 === 0) queue.push("boss_void_queen");
  else if (stage % 15 === 0) queue.push("boss_colossus");
  else if (stage % 10 === 0) queue.push("boss_king");
  else if (stage % 5 === 0) queue.push("boss_archmage");

  return queue;
}

function spawnEnemy(type) {
  const enemyType = enemyTypes[type];
  if (!enemyType) return;

  const stageScale = 1 + state.stage * 0.24;
  let hp = 55 * enemyType.hpScale * stageScale;
  let speed = enemyType.speed * (1 + Math.min(0.55, state.stage * 0.017));
  let rewardGold = enemyType.rewardGold;
  let rewardOrbs = enemyType.rewardOrbs;
  let rewardStones = enemyType.rewardStones;
  let rockDamage = enemyType.rockDamage;
  const isElite = !enemyType.isBoss && state.stage >= 10 && Math.random() < Math.min(0.26, 0.12 + state.stage * 0.004);

  if (enemyType.isBoss) {
    hp *= 1 + state.stage * 0.09;
    speed *= 1 + Math.min(0.18, state.stage * 0.004);
    rewardGold = Math.round(rewardGold * (1 + state.stage * 0.08));
    rewardOrbs = Math.round(rewardOrbs * (1 + state.stage * 0.05));
    rewardStones = Math.round(rewardStones * (1 + state.stage * 0.06));
    rockDamage = Math.round(rockDamage * (1 + state.stage * 0.05));
  } else if (isElite) {
    hp *= 1.48;
    speed *= 1.12;
    rewardGold = Math.round(rewardGold * 1.5);
    rewardOrbs = Math.max(1, Math.round(rewardOrbs * 1.35));
    rewardStones = Math.round(rewardStones * 1.25);
    rockDamage = Math.round(rockDamage * 1.32);
  }

  const mesh = createEnemyMesh(enemyType, isElite);
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
    rewardGold,
    rewardOrbs,
    rewardStones,
    rockDamage,
    progress: 0,
    segment: 0,
    t: 0,
    slowTimer: 0,
    slowFactor: 1,
    stunTimer: 0,
    burnTimer: 0,
    burnDps: 0,
    armorBreakTimer: 0,
    damageTakenMult: 1,
    abilityCd: (enemyType.isBoss ? 5.6 : 4.2) + Math.random() * 2.4,
    attackCd: 0.25,
    isBoss: !!enemyType.isBoss,
    isElite,
    enraged: false,
    splitSpawned: false,
    abilityStacks: 0
  };

  setEnemyProgress(enemy, 0);
  enemies.push(enemy);
  return enemy;
}

function createEnemyMesh(enemyType, isElite = false) {
  const size = enemyType.isBoss ? 1.35 : isElite ? 1.02 : 0.9;
  const group = new THREE.Group();
  const model = enemyType.model || "orb";
  const bodyMat = new THREE.MeshToonMaterial({ color: enemyType.color, gradientMap: toonGradientMap });
  const capMat = new THREE.MeshToonMaterial({ color: enemyType.capColor, gradientMap: toonGradientMap });

  let body;
  if (model === "cube") {
    body = new THREE.Mesh(new THREE.BoxGeometry(size * 1.45, size * 1.2, size * 1.3), bodyMat);
    body.position.y = size * 0.52;
  } else if (model === "spike") {
    body = new THREE.Mesh(new THREE.OctahedronGeometry(size * 0.95, 0), bodyMat);
    body.position.y = size * 0.58;
  } else if (model === "mage") {
    body = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.55, size * 0.74, size * 1.2, 10), bodyMat);
    body.position.y = size * 0.52;
  } else {
    body = new THREE.Mesh(new THREE.SphereGeometry(size, 14, 12), bodyMat);
    body.position.y = size * 0.52;
  }

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.58, size * 0.95, 9),
    capMat
  );
  cap.position.y = size * 1.18;

  if (model === "mage") {
    const hatBrim = new THREE.Mesh(
      new THREE.TorusGeometry(size * 0.34, size * 0.08, 8, 16),
      capMat
    );
    hatBrim.position.y = size * 0.94;
    hatBrim.rotation.x = Math.PI / 2;
    group.add(hatBrim);
  }

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x281b16 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(size * 0.11, 8, 7), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-size * 0.25, size * 0.56, size * 0.7);
  eyeR.position.set(size * 0.25, size * 0.56, size * 0.7);

  if (isElite || enemyType.isBoss) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(size * 1.05, size * 0.09, 8, 20),
      new THREE.MeshBasicMaterial({
        color: enemyType.isBoss ? 0xffd089 : enemyType.capColor,
        transparent: true,
        opacity: enemyType.isBoss ? 0.9 : 0.74
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = size * 0.22;
    group.add(ring);
    group.userData.ring = ring;
  }

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
  enemy.mesh.position.y = enemy.isBoss ? 1.18 : enemy.isElite ? 0.82 : 0.7;
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
    if (enemy.mesh.userData.ring) {
      enemy.mesh.userData.ring.rotation.z += dt * (enemy.isBoss ? 2 : 1.4);
    }

    if (enemy.burnTimer > 0) {
      enemy.burnTimer -= dt;
      enemy.hp -= enemy.burnDps * dt;
      if (enemy.hp <= 0) {
        removeEnemy(i, true);
        continue;
      }
    }

    if (enemy.armorBreakTimer > 0) {
      enemy.armorBreakTimer -= dt;
      if (enemy.armorBreakTimer <= 0) {
        enemy.damageTakenMult = 1;
      }
    }

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

    if (enemy.enemyType.ability === "enrage" && !enemy.enraged && enemy.hp / enemy.maxHp <= 0.45) {
      enemy.enraged = true;
      enemy.speed *= 1.35;
      enemy.damage *= 1.45;
      enemy.rockDamage *= 1.35;
      enemy.mesh.scale.multiplyScalar(1.1);
      spawnPulse(enemy.mesh.position, 0xff835f, 0.55);
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
  const ability = enemy.enemyType.ability;
  if (!ability) return;
  enemy.abilityCd = enemy.isBoss ? 6.6 : 5.2;

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
    return;
  }

  if (ability === "blink") {
    const blink = 1.3 + Math.random() * 1.1;
    setEnemyProgress(enemy, Math.min(pathEndProgress - 0.55, enemy.progress + blink));
    spawnPulse(enemy.mesh.position, 0xc8a7ff, 0.44);
    return;
  }

  if (ability === "enrage") {
    if (!enemy.enraged) {
      enemy.shield += enemy.maxHp * 0.12;
      spawnPulse(enemy.mesh.position, 0xff9f8e, 0.5);
    }
    return;
  }

  if (ability === "summon_imps") {
    if (enemies.length > 170) return;
    for (let i = 0; i < 2; i += 1) {
      const imp = spawnEnemy(i === 0 ? "grunt" : "runner");
      if (!imp) continue;
      imp.hp *= 0.58;
      imp.maxHp = imp.hp;
      imp.rewardGold = Math.max(2, Math.round(imp.rewardGold * 0.35));
      imp.rewardOrbs = 0;
      imp.rewardStones = 0;
      setEnemyProgress(imp, Math.max(0, enemy.progress - 0.45 - i * 0.2));
    }
    spawnPulse(enemy.mesh.position, 0xbf94ff, 0.58);
    return;
  }

  if (ability === "hero_chill") {
    state.heroSlowTimer = Math.max(state.heroSlowTimer, 3.6);
    for (const hero of heroes) {
      if (hero.mesh.position.distanceToSquared(enemy.mesh.position) <= 7.2 * 7.2) {
        hero.disabledTimer = Math.max(hero.disabledTimer, 0.38);
      }
    }
    spawnPulse(enemy.mesh.position, 0xa0e6ff, 0.56);
    return;
  }

  if (ability === "suicide_blast") {
    const targetPos = enemy.mesh.position.clone();
    damageArea(targetPos, 3.2, enemy.maxHp * 0.09);
    damageChest(enemy.damage * 1.6);
    spawnPulse(targetPos, 0xffa36f, 0.65);
    const idx = enemies.indexOf(enemy);
    if (idx >= 0) removeEnemy(idx, false);
    return;
  }

  if (ability === "drain") {
    let drained = 0;
    if (state.chestShield > 0) {
      drained = Math.min(state.chestShield, 18 + state.stage * 1.5);
      state.chestShield -= drained;
    } else {
      drained = Math.max(0, Math.min(state.chestHp - 1, 8 + state.stage));
      if (drained > 0) damageChest(drained);
    }
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + drained * 2.2);
    spawnPulse(enemy.mesh.position, 0x89a8ff, 0.58);
    return;
  }

  if (ability === "fortify") {
    for (const other of enemies) {
      if (other.mesh.position.distanceToSquared(enemy.mesh.position) > 7.2 * 7.2) continue;
      other.shield += other.maxHp * 0.14;
    }
    spawnPulse(enemy.mesh.position, 0x85e0df, 0.6);
    return;
  }

  if (ability === "split") {
    if (enemy.splitSpawned || enemies.length > 180) return;
    enemy.splitSpawned = true;
    for (let i = 0; i < 2; i += 1) {
      const split = spawnEnemy(i === 0 ? "runner" : "assassin");
      if (!split) continue;
      split.hp *= 0.42;
      split.maxHp = split.hp;
      split.rewardGold = Math.max(3, Math.round(split.rewardGold * 0.4));
      split.rewardOrbs = 0;
      split.rewardStones = 0;
      setEnemyProgress(split, Math.max(0, enemy.progress - 0.35 - i * 0.22));
    }
    spawnPulse(enemy.mesh.position, 0xffe17f, 0.54);
    return;
  }

  if (ability === "boss_quake") {
    for (const hero of heroes) {
      hero.disabledTimer = Math.max(hero.disabledTimer, 0.95);
      hero.cooldown += 0.25;
    }
    damageChest(enemy.damage * 1.45);
    state.enemyHasteTimer = Math.max(state.enemyHasteTimer, 2.5);
    spawnPulse(enemy.mesh.position, 0xffaa77, 0.9);
    log("colossus slammed the board.");
    return;
  }

  if (ability === "boss_rift") {
    state.enemyHasteTimer = Math.max(state.enemyHasteTimer, 4.6);
    state.heroSlowTimer = Math.max(state.heroSlowTimer, 4.1);
    if (enemies.length < 190) {
      const spawned = [spawnEnemy("assassin"), spawnEnemy("leech"), spawnEnemy("necromancer")];
      for (const add of spawned) {
        if (!add) continue;
        add.hp *= 0.72;
        add.maxHp = add.hp;
        add.rewardGold = Math.max(4, Math.round(add.rewardGold * 0.45));
        add.rewardOrbs = Math.max(0, Math.round(add.rewardOrbs * 0.5));
        add.rewardStones = 0;
        setEnemyProgress(add, Math.max(0, enemy.progress - 0.8));
      }
    }
    spawnPulse(enemy.mesh.position, 0xc7a5ff, 0.96);
    log("void queen opened a rift.");
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
  const heroTimeScale = state.heroSlowTimer > 0 ? 0.62 : 1;
  for (const hero of heroes) {
    const monster = monsterCatalog[hero.monsterId];
    const visuals = hero.mesh.userData.visuals;
    if (visuals) {
      const passiveStyle = getPassiveAuraStyle(monster.passive);
      const bob = Math.sin(elapsed * 2.6 + hero.animSeed) * 0.09;
      hero.mesh.position.y = hero.baseY + bob;
      visuals.ring.rotation.z += dt * 1.7;
      const pulse = 1 + Math.sin(elapsed * 3.2 + hero.animSeed) * 0.08;
      const iconScale = visuals.iconScale || 2.45;
      visuals.iconSprite.scale.set(iconScale * pulse, iconScale * pulse, 1);
      if (visuals.figureSprite) {
        const float = 1 + Math.sin(elapsed * 2.2 + hero.animSeed) * 0.04;
        const baseScale = visuals.figureScale || 4;
        visuals.figureSprite.scale.set(baseScale * float, baseScale * 1.22 * float, 1);
        visuals.figureSprite.material.rotation = Math.sin(elapsed * 1.35 + hero.animSeed) * 0.045;
      }
      if (visuals.rareAura) visuals.rareAura.rotation.z += dt * 1.25;
      if (visuals.orbitGroup) visuals.orbitGroup.rotation.y += dt * 2;
      if (visuals.orbitGroup2) visuals.orbitGroup2.rotation.y -= dt * 2.7;
      if (visuals.passiveAura) {
        const auraPulse = 0.92 + Math.sin(elapsed * passiveStyle.pulse + hero.animSeed) * 0.12;
        visuals.passiveAura.rotation.z += dt * passiveStyle.spin;
        visuals.passiveAura.scale.setScalar(auraPulse);
        visuals.passiveAura.material.opacity = 0.32 + auraPulse * 0.14;
      }
      if (visuals.passiveAuraInner) {
        const innerPulse = 0.94 + Math.cos(elapsed * (passiveStyle.pulse + 0.9) + hero.animSeed) * 0.1;
        visuals.passiveAuraInner.rotation.z -= dt * (passiveStyle.spin + 0.8);
        visuals.passiveAuraInner.scale.setScalar(innerPulse);
        visuals.passiveAuraInner.material.opacity = 0.26 + innerPulse * 0.12;
      }
    }

    if (hero.disabledTimer > 0) {
      hero.disabledTimer -= dt;
      hero.mesh.rotation.y += dt * 4;
      continue;
    }

    hero.cooldown -= dt * heroTimeScale;

    const stats = getHeroStats(hero);
    const passiveStyle = getPassiveAuraStyle(monster.passive);
    hero.passiveFxTimer -= dt * heroTimeScale;
    if (hero.passiveFxTimer <= 0) {
      spawnPassiveEffect(monster.passive, hero.mesh.position);
      hero.passiveFxTimer = passiveStyle.interval + Math.random() * 0.35;
    }

    if ((monster.passive === "hyperflow" || monster.passive === "mana_surge") && hero.specialCd > 0) {
      hero.specialCd = Math.max(0, hero.specialCd - dt * 0.58);
    }

    if (monster.passive === "alpha_howl") {
      for (const ally of heroes) {
        if (ally === hero) continue;
        if (ally.mesh.position.distanceToSquared(hero.mesh.position) > 5.8 * 5.8) continue;
        ally.cooldown = Math.max(0, ally.cooldown - dt * 0.18);
      }
    }

    if (monster.passive === "tempo_master") {
      for (const ally of heroes) {
        if (ally === hero) continue;
        if (ally.mesh.position.distanceToSquared(hero.mesh.position) > 7.5 * 7.5) continue;
        ally.cooldown = Math.max(0, ally.cooldown - dt * 0.28);
        ally.specialCd = Math.max(0, ally.specialCd - dt * 0.16);
      }
    }

    if (monster.special && hero.specialCd > 0) {
      hero.specialCd -= dt * heroTimeScale;
    }

    if (monster.special && hero.specialCd <= 0 && enemies.length) {
      if (triggerHeroSpecial(hero, monster, stats)) {
        hero.specialCd = monster.specialCooldown || 9;
      }
    }

    if (hero.cooldown > 0) continue;

    const target = getTargetInRange(hero, stats.range);
    if (!target) {
      hero.cooldown = 0.08;
      continue;
    }

    hero.cooldown = stats.attackDelay;
    fireHero(hero, target, stats);
  }
}

function triggerHeroSpecial(hero, monster, stats) {
  if (monster.special === "slime_flood") {
    const target = enemies.reduce((best, enemy) => (!best || enemy.progress > best.progress ? enemy : best), null);
    if (!target) return false;
    damageArea(target.mesh.position, 3.6, stats.damage * 1.55);
    let soaked = 0;
    for (const enemy of enemies) {
      if (enemy.mesh.position.distanceToSquared(target.mesh.position) > 3.9 * 3.9) continue;
      enemy.slowFactor = Math.min(enemy.slowFactor, 0.36);
      enemy.slowTimer = Math.max(enemy.slowTimer, 3.4);
      soaked += 1;
    }
    healChest(3 + soaked * 0.8);
    spawnSpecialEffect(monster.special, target.mesh.position, 1.2);
    spawnFloorMark(target.mesh.position, 0x87ea88, 2.8, 0.8);
    log("slimey cast slime flood.");
    return true;
  }

  if (monster.special === "rapid_brew") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
    if (!targets.length) return false;
    const multipliers = [1.35, 1.65, 2.05];
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * multipliers[i]);
      t.stunTimer = Math.max(t.stunTimer, 0.2 + i * 0.12);
      spawnPulse(t.mesh.position, 0xffcd7c, 0.32);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.72 + i * 0.1);
    }
    hero.cooldown = Math.min(hero.cooldown, 0.06);
    spawnPulse(hero.mesh.position, 0xffd47f, 0.62);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1);
    log("mocha cast rapid brew.");
    return true;
  }

  if (monster.special === "frost_spike_burst") {
    const maxDistSq = (stats.range + 2) * (stats.range + 2);
    const targets = [...enemies]
      .filter((enemy) => enemy.mesh.position.distanceToSquared(hero.mesh.position) <= maxDistSq)
      .sort(
        (a, b) => a.mesh.position.distanceToSquared(hero.mesh.position) - b.mesh.position.distanceToSquared(hero.mesh.position)
      )
      .slice(0, 4);
    if (!targets.length) return false;
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * (1.45 - i * 0.16));
      t.slowFactor = Math.min(t.slowFactor, 0.32);
      t.slowTimer = Math.max(t.slowTimer, 3.6);
      if (i === 0) t.stunTimer = Math.max(t.stunTimer, 0.55);
      spawnPulse(t.mesh.position, 0x9deeff, 0.36);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.78 + i * 0.08);
    }
    spawnFloorMark(hero.mesh.position, 0x97eeff, 2.7, 0.64);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.1);
    log("spikey cast frost spike burst.");
    return true;
  }

  if (monster.special === "maul_quake") {
    const target = enemies.reduce((best, enemy) => (!best || enemy.progress > best.progress ? enemy : best), null);
    if (!target) return false;
    damageArea(target.mesh.position, 3.7, stats.damage * 2.15);
    for (const enemy of enemies) {
      if (enemy.mesh.position.distanceToSquared(target.mesh.position) > 3.9 * 3.9) continue;
      enemy.stunTimer = Math.max(enemy.stunTimer, 1.2);
    }
    spawnPulse(target.mesh.position, 0xffb07a, 0.68);
    spawnSpecialEffect(monster.special, target.mesh.position, 1.25);
    log("teddy cast maul quake.");
    return true;
  }

  if (monster.special === "execution_strike") {
    const target = enemies.reduce((best, enemy) => (!best || enemy.maxHp > best.maxHp ? enemy : best), null);
    if (!target) return false;
    target.armorBreakTimer = Math.max(target.armorBreakTimer, 4.4);
    target.damageTakenMult = Math.max(target.damageTakenMult, 1.42);
    applyDamage(target, stats.damage * 4.4);
    if (target.hp > 0 && target.hp / target.maxHp <= 0.48) {
      applyDamage(target, target.maxHp * 0.85);
    }
    spawnPulse(target.mesh.position, 0xff9b89, 0.5);
    spawnSpecialEffect(monster.special, target.mesh.position, 1.02);
    log("clyde cast execution strike.");
    return true;
  }

  if (monster.special === "latte_barrier") {
    const shieldGain = 16 + stats.damage * 0.72;
    addChestShield(shieldGain);
    for (const ally of heroes) {
      ally.disabledTimer = Math.max(0, ally.disabledTimer - 0.45);
    }
    spawnPulse(chestMesh.position, 0xffe0b4, 0.72);
    spawnSpecialEffect(monster.special, chestMesh.position, 1.3);
    log(`cappuccino cast latte barrier (+${Math.round(shieldGain)} shield).`);
    return true;
  }

  if (monster.special === "global_stun") {
    for (const enemy of enemies) {
      enemy.stunTimer = Math.max(enemy.stunTimer, 1.8);
      applyDamage(enemy, stats.damage * 0.9);
    }
    spawnPulse(hero.mesh.position, 0xad91ff, 0.7);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.34);
    log("slime king cast royal decree.");
    return true;
  }

  if (monster.special === "divine_smite") {
    const target = enemies.reduce((best, enemy) => (!best || enemy.maxHp > best.maxHp ? enemy : best), null);
    if (!target) return false;
    applyDamage(target, stats.damage * 4.2);
    damageArea(target.mesh.position, 2.8, stats.damage * 1.8);
    spawnPulse(target.mesh.position, 0xffe074, 0.66);
    spawnSpecialEffect(monster.special, target.mesh.position, 1.22);
    log("mighty cast divine smite.");
    return true;
  }

  if (monster.special === "time_warp") {
    state.globalSlowTimer = Math.max(state.globalSlowTimer, 3);
    for (const ally of heroes) {
      ally.cooldown *= 0.5;
      ally.specialCd = Math.max(0, ally.specialCd - 0.8);
    }
    spawnPulse(hero.mesh.position, 0x89e4ff, 0.66);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.2);
    log("speedy cast time warp.");
    return true;
  }

  if (monster.special === "blizzard_nova") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
    if (!targets.length) return false;
    state.globalSlowTimer = Math.max(state.globalSlowTimer, 4.8);
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * (1.95 - i * 0.12));
      t.slowFactor = Math.min(t.slowFactor, 0.3);
      t.slowTimer = Math.max(t.slowTimer, 3.8);
      t.stunTimer = Math.max(t.stunTimer, 0.45);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.75 + i * 0.06);
    }
    spawnPulse(hero.mesh.position, 0xb1f4ff, 0.78);
    spawnFloorMark(hero.mesh.position, 0xa9efff, 3.2, 0.75);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.36);
    log("frostbite cast blizzard nova.");
    return true;
  }

  if (monster.special === "meteor_rain") {
    const targets = [...enemies].sort((a, b) => b.progress - a.progress).slice(0, 4);
    if (!targets.length) return false;
    for (const t of targets) {
      damageArea(t.mesh.position, 3.1, stats.damage * 2.25);
      t.stunTimer = Math.max(t.stunTimer, 0.5);
      spawnFloorMark(t.mesh.position, 0xff8c5f, 2.2, 0.62);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.9);
    }
    log("felina called meteor rain.");
    return true;
  }

  if (monster.special === "dragon_fury") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
    if (!targets.length) return false;
    for (const t of targets) {
      applyDamage(t, stats.damage * 3.1);
      if (t.hp > 0 && t.hp / t.maxHp <= stats.executeThreshold) {
        applyDamage(t, t.maxHp * 0.55);
      }
      spawnPulse(t.mesh.position, 0xffcd69, 0.5);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.95);
    }
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.18);
    log("kevin unleashed dragon fury.");
    return true;
  }

  if (monster.special === "broadside") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
    if (!targets.length) return false;
    for (const t of targets) {
      damageArea(t.mesh.position, 2.3, stats.damage * 1.5);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.82);
    }
    state.gold += 22;
    spawnPulse(hero.mesh.position, 0xff8de9, 0.65);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.15);
    log("pirate cat fired broadside (+22 gold).");
    return true;
  }

  if (monster.special === "inferno_aura") {
    const origin = hero.mesh.position;
    let hitAny = false;
    for (const enemy of enemies) {
      if (enemy.mesh.position.distanceToSquared(origin) > 4.6 * 4.6) continue;
      applyDamage(enemy, stats.damage * 1.2);
      enemy.burnTimer = Math.max(enemy.burnTimer, 2.8);
      enemy.burnDps = Math.max(enemy.burnDps, stats.burnDps);
      hitAny = true;
    }
    if (hitAny) {
      spawnPulse(origin, 0xff7f5a, 0.6);
      spawnSpecialEffect(monster.special, origin, 1.04);
      log("hellhound ignited inferno aura.");
    }
    return hitAny;
  }

  if (monster.special === "prism_beam") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
    if (!targets.length) return false;
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * (2.55 - i * 0.22));
      if (i < 3) applyChainLightning(t, 1, 4.6, stats.damage * 0.82, 0.88, stats);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.9 + i * 0.04);
      spawnPulse(t.mesh.position, 0x9ce7ff, 0.42);
    }
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.2);
    log(`${monster.name} cast prism beam.`);
    return true;
  }

  if (monster.special === "thunder_dome") {
    const center = enemies.reduce((best, e) => (!best || e.progress > best.progress ? e : best), null);
    if (!center) return false;
    damageArea(center.mesh.position, 4.4, stats.damage * 2.2);
    for (const enemy of enemies) {
      if (enemy.mesh.position.distanceToSquared(center.mesh.position) > 4.6 * 4.6) continue;
      enemy.stunTimer = Math.max(enemy.stunTimer, 1.2);
      enemy.slowFactor = Math.min(enemy.slowFactor, 0.58);
      enemy.slowTimer = Math.max(enemy.slowTimer, 2.4);
    }
    spawnSpecialEffect(monster.special, center.mesh.position, 1.34);
    spawnFloorMark(center.mesh.position, 0xffcc7f, 3.6, 0.8);
    log(`${monster.name} cast thunder dome.`);
    return true;
  }

  if (monster.special === "vine_snare") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
    if (!targets.length) return false;
    for (const t of targets) {
      applyDamage(t, stats.damage * 1.15);
      t.stunTimer = Math.max(t.stunTimer, 1.05);
      t.slowFactor = Math.min(t.slowFactor, 0.45);
      t.slowTimer = Math.max(t.slowTimer, 3.2);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.86);
    }
    spawnFloorMark(hero.mesh.position, 0x92dd86, 3, 0.9);
    log(`${monster.name} cast vine snare.`);
    return true;
  }

  if (monster.special === "tidal_crash") {
    const targets = [...enemies].sort((a, b) => b.progress - a.progress).slice(0, 7);
    if (!targets.length) return false;
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * (1.75 - i * 0.09));
      const shove = 1.25 - i * 0.12;
      setEnemyProgress(t, Math.max(0, t.progress - shove));
      t.slowFactor = Math.min(t.slowFactor, 0.55);
      t.slowTimer = Math.max(t.slowTimer, 2.6);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.86 + i * 0.05);
    }
    state.globalSlowTimer = Math.max(state.globalSlowTimer, 1.8);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.3);
    log(`${monster.name} cast tidal crash.`);
    return true;
  }

  if (monster.special === "shadow_barrage") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 7);
    if (!targets.length) return false;
    for (let i = 0; i < targets.length; i += 1) {
      const t = targets[i];
      applyDamage(t, stats.damage * (2.05 + (Math.random() * 0.55)));
      t.armorBreakTimer = Math.max(t.armorBreakTimer, 3);
      t.damageTakenMult = Math.max(t.damageTakenMult, 1.18);
      spawnSpecialEffect(monster.special, t.mesh.position, 0.74 + i * 0.04);
    }
    spawnPulse(hero.mesh.position, 0xcda5ff, 0.62);
    log(`${monster.name} cast shadow barrage.`);
    return true;
  }

  if (monster.special === "soul_siphon") {
    const target = enemies.reduce((best, e) => (!best || e.maxHp > best.maxHp ? e : best), null);
    if (!target) return false;
    const drain = stats.damage * 4.8;
    applyDamage(target, drain);
    healChest(8 + stats.damage * 0.08);
    addChestShield(10 + stats.damage * 0.14);
    for (const enemy of enemies) {
      if (enemy === target) continue;
      if (enemy.mesh.position.distanceToSquared(target.mesh.position) > 3 * 3) continue;
      applyDamage(enemy, stats.damage * 0.95);
    }
    spawnSpecialEffect(monster.special, target.mesh.position, 1.25);
    spawnPulse(chestMesh.position, 0xd6a8ff, 0.58);
    log(`${monster.name} cast soul siphon.`);
    return true;
  }

  if (monster.special === "starfall") {
    const targets = [...enemies]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
    if (!targets.length) return false;
    for (const t of targets) {
      damageArea(t.mesh.position, 3.8, stats.damage * 2.48);
      t.burnTimer = Math.max(t.burnTimer, 3.4);
      t.burnDps = Math.max(t.burnDps, stats.burnDps || stats.damage * 0.42);
      t.stunTimer = Math.max(t.stunTimer, 0.55);
      spawnFloorMark(t.mesh.position, 0xff9d72, 2.9, 0.68);
      spawnSpecialEffect(monster.special, t.mesh.position, 1);
    }
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.35);
    log(`${monster.name} cast starfall.`);
    return true;
  }

  if (monster.special === "rift_lock") {
    for (const enemy of enemies) {
      enemy.slowFactor = Math.min(enemy.slowFactor, 0.4);
      enemy.slowTimer = Math.max(enemy.slowTimer, 3.7);
      enemy.damageTakenMult = Math.max(enemy.damageTakenMult, 1.2);
      enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer, 3.7);
      applyDamage(enemy, stats.damage * 0.62);
      spawnSpecialEffect(monster.special, enemy.mesh.position, 0.78);
    }
    state.globalSlowTimer = Math.max(state.globalSlowTimer, 3.8);
    spawnSpecialEffect(monster.special, hero.mesh.position, 1.32);
    log(`${monster.name} cast rift lock.`);
    return true;
  }

  if (monster.special === "guardian_totem") {
    healChest(8 + stats.damage * 0.06);
    addChestShield(18 + stats.damage * 0.32);
    for (const ally of heroes) {
      ally.cooldown = Math.max(0, ally.cooldown - 0.45);
      ally.specialCd = Math.max(0, ally.specialCd - 0.2);
      ally.disabledTimer = Math.max(0, ally.disabledTimer - 0.65);
    }
    spawnSpecialEffect(monster.special, chestMesh.position, 1.44);
    spawnPulse(chestMesh.position, 0x9fe59a, 0.78);
    log(`${monster.name} cast guardian totem.`);
    return true;
  }

  return false;
}

function getHeroStats(hero, options = {}) {
  const includeAdjacency = options.includeAdjacency !== false;
  const monster = monsterCatalog[hero.monsterId];
  const entry = collection[hero.monsterId];

  const rarityScale = {
    common: 1,
    rare: 1.26,
    epic: 1.85,
    legendary: 2.75,
    special: 3.15
  }[monster.rarity] || 1;

  const starMult = 1 + (entry.stars - 1) * 0.55;
  const levelMult = 1 + (entry.level - 1) * 0.2;

  let damage = monster.baseDamage * rarityScale * starMult * levelMult;
  let fireRate = monster.fireRate * (1 + (entry.level - 1) * 0.035) * Math.sqrt(rarityScale);
  let range = monster.range + (entry.level - 1) * 0.1 + (rarityScale - 1) * 0.22;
  let splash = monster.splash || 0;
  let slow = monster.slow || 0;
  let slowDuration = monster.slowDuration || 0;
  let stunChance = monster.stunChance || 0;
  let stunDuration = monster.stunDuration || 0;
  let chainJumps = monster.chainJumps || 0;
  let chainFalloff = monster.chainFalloff || 0.72;
  let executeThreshold = monster.executeThreshold || 0;
  let burnDps = monster.burnDps || 0;
  let goldStealChance = monster.goldStealChance || 0;
  let critChance = 0;
  let critMult = 1.75;
  let bonusVsStunned = 0;
  let armorBreak = 0;
  let armorBreakDuration = 0;
  let chestHealOnHit = 0;
  let chestShieldOnStun = 0;
  let tributeChance = 0;
  let tributeGold = 0;
  let bossBonus = 0;

  const hasSlot = Number.isInteger(hero.slotIndex);
  const buffs = includeAdjacency && hasSlot ? getAdjacencyBuffs(hero.slotIndex) : { damage: 0, speed: 0 };
  damage *= 1 + buffs.damage;
  fireRate *= 1 + buffs.speed;

  const adjacentAllies = includeAdjacency && hasSlot ? countAdjacentHeroes(hero.slotIndex) : 0;
  switch (monster.passive) {
    case "ooze_regen":
      chestHealOnHit = 0.6 + entry.level * 0.2 + entry.stars * 0.45;
      break;
    case "espresso_crit":
      critChance = Math.min(0.7, 0.24 + entry.stars * 0.08 + entry.level * 0.004);
      critMult = 1.95 + (entry.stars - 1) * 0.18;
      fireRate *= 1.1;
      break;
    case "glacier_venom":
      slow = slow > 0 ? Math.min(slow, 0.55) : 0.58;
      slowDuration += 1.2;
      burnDps = Math.max(burnDps, damage * 0.14);
      chainJumps = Math.max(chainJumps, 1);
      break;
    case "pack_hunter":
      bonusVsStunned = 0.42 + (entry.stars - 1) * 0.12;
      splash = Math.max(splash, 2.9);
      break;
    case "armor_break":
      armorBreak = 0.18 + (entry.stars - 1) * 0.06;
      armorBreakDuration = 3.3;
      bossBonus = 0.18;
      break;
    case "barista_focus":
      stunChance = Math.min(0.85, stunChance + 0.26);
      stunDuration += 0.65;
      chestShieldOnStun = 3.5 + entry.level * 0.35;
      break;
    case "divine_command":
      damage *= 1 + adjacentAllies * 0.13;
      fireRate *= 1 + adjacentAllies * 0.08;
      range += adjacentAllies * 0.15;
      break;
    case "hyperflow":
      fireRate *= 1.33;
      critChance += 0.12;
      critMult = Math.max(critMult, 1.7);
      break;
    case "permafrost":
      slow = slow > 0 ? Math.min(slow, 0.38) : 0.42;
      slowDuration += 1.6;
      chainJumps = Math.max(chainJumps, 4);
      chainFalloff = Math.max(chainFalloff, 0.82);
      damage *= 1.08;
      break;
    case "royal_tribute":
      tributeChance = 0.2 + (entry.stars - 1) * 0.08;
      tributeGold = 3 + entry.level * 0.4;
      range += 0.4;
      break;
    case "solar_burn":
      burnDps = Math.max(burnDps, damage * 0.52);
      splash = Math.max(splash, 4.2);
      break;
    case "apex_predator":
      executeThreshold = Math.max(executeThreshold, 0.36 + (entry.stars - 1) * 0.05);
      damage *= 1.14;
      bossBonus = Math.max(bossBonus, 0.22);
      break;
    case "high_plunder":
      goldStealChance = Math.min(0.95, Math.max(goldStealChance, 0.42 + (entry.stars - 1) * 0.08));
      critChance += 0.1;
      critMult = Math.max(critMult, 1.85);
      break;
    case "alpha_howl":
      damage *= 1.16;
      fireRate *= 1.08;
      bonusVsStunned += 0.2;
      break;
    case "sniper_focus":
      range += 1.9;
      damage *= 1.12;
      critChance += 0.16 + (entry.stars - 1) * 0.04;
      critMult = Math.max(critMult, 2.05);
      break;
    case "mana_surge":
      fireRate *= 1.12;
      damage *= 1.08;
      critChance += 0.08;
      break;
    case "storm_link":
      chainJumps = Math.max(chainJumps, 3);
      chainFalloff = Math.max(chainFalloff, 0.86);
      damage *= 1.1;
      break;
    case "thorns_shell":
      splash = Math.max(splash, 2.6);
      armorBreak = Math.max(armorBreak, 0.16);
      armorBreakDuration = Math.max(armorBreakDuration, 2.8);
      chestShieldOnStun = Math.max(chestShieldOnStun, 2.8 + entry.stars);
      break;
    case "tidal_guard":
      slow = slow > 0 ? Math.min(slow, 0.5) : 0.55;
      slowDuration = Math.max(slowDuration, 2.4);
      chestHealOnHit = Math.max(chestHealOnHit, 0.9 + entry.level * 0.16);
      break;
    case "shadow_mark":
      armorBreak = Math.max(armorBreak, 0.2);
      armorBreakDuration = Math.max(armorBreakDuration, 3.6);
      critChance += 0.14;
      executeThreshold = Math.max(executeThreshold, 0.24);
      break;
    case "ember_heart":
      burnDps = Math.max(burnDps, damage * 0.34);
      splash = Math.max(splash, 2.8);
      damage *= 1.1;
      break;
    case "tempo_master":
      fireRate *= 1.36;
      critChance += 0.08;
      range += 0.65;
      break;
    case "lucky_strike":
      critChance += 0.22;
      critMult = Math.max(critMult, 2.2);
      goldStealChance = Math.max(goldStealChance, 0.24 + (entry.stars - 1) * 0.08);
      tributeChance = Math.max(tributeChance, 0.15);
      tributeGold = Math.max(tributeGold, 8 + entry.level * 0.36);
      break;
    default:
      break;
  }

  return {
    damage,
    attackDelay: 1 / Math.max(0.2, fireRate),
    range,
    splash,
    slow,
    slowDuration,
    stunChance,
    stunDuration,
    tripleHit: monster.tripleHit || false,
    chainJumps,
    chainFalloff,
    executeThreshold,
    burnDps,
    goldStealChance,
    critChance,
    critMult,
    bonusVsStunned,
    armorBreak,
    armorBreakDuration,
    chestHealOnHit,
    chestShieldOnStun,
    tributeChance,
    tributeGold,
    bossBonus,
    projectileColor: monster.projectileColor
  };
}

function countAdjacentHeroes(slotIndex) {
  const slot = HERO_SLOTS[slotIndex];
  let count = 0;

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const key = `${slot.row + dr},${slot.col + dc}`;
      const adjIndex = SLOT_GRID_LOOKUP.get(key);
      if (adjIndex === undefined) continue;
      if (slotOccupants[adjIndex]) count += 1;
    }
  }

  return count;
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
    damage: Math.min(2.6, damage),
    speed: Math.min(2.2, speed)
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
  const monster = monsterCatalog[hero.monsterId];
  const origin = hero.mesh.position.clone();
  origin.y += 2.4;

  if (stats.armorBreak > 0) {
    applyArmorBreak(target, stats);
  }

  if (stats.tripleHit) {
    applyDamage(target, rollHeroDamage(target, stats, stats.damage * 0.52));
    applyDamage(target, rollHeroDamage(target, stats, stats.damage * 0.62));
    applyDamage(target, rollHeroDamage(target, stats, stats.damage * 0.86));
    spawnProjectile(origin, target.mesh.position, stats.projectileColor);
  } else {
    const shotDamage = rollHeroDamage(target, stats, stats.damage);
    if (stats.splash > 0) {
      damageArea(target.mesh.position, stats.splash, shotDamage);
      spawnProjectile(origin, target.mesh.position, stats.projectileColor);
    } else {
      applyDamage(target, shotDamage);
      spawnProjectile(origin, target.mesh.position, stats.projectileColor);
    }
  }

  if (stats.slow > 0) {
    target.slowFactor = Math.min(target.slowFactor, stats.slow);
    target.slowTimer = Math.max(target.slowTimer, stats.slowDuration);
  }

  if (stats.stunChance > 0 && Math.random() < stats.stunChance) {
    target.stunTimer = Math.max(target.stunTimer, stats.stunDuration);
    if (stats.chestShieldOnStun > 0) {
      addChestShield(stats.chestShieldOnStun);
    }
  }

  if (stats.chainJumps > 0) {
    applyChainLightning(target, stats.chainJumps, 3.6, stats.damage * 0.75, stats.chainFalloff, stats);
  }

  if (stats.executeThreshold > 0 && target.hp > 0 && target.hp / target.maxHp <= stats.executeThreshold) {
    applyDamage(target, target.maxHp * 0.5);
    spawnPulse(target.mesh.position, 0xffd777, 0.4);
  }

  if (stats.burnDps > 0) {
    target.burnTimer = Math.max(target.burnTimer, 2.6);
    target.burnDps = Math.max(target.burnDps, stats.burnDps);
  }

  if (stats.goldStealChance > 0 && Math.random() < stats.goldStealChance) {
    const bonus = 6 + Math.floor(Math.random() * 7);
    state.gold += bonus;
    spawnPulse(hero.mesh.position, 0xff9bf0, 0.45);
  }

  if (stats.tributeChance > 0 && Math.random() < stats.tributeChance) {
    const tributeGold = Math.max(3, Math.round(stats.tributeGold + Math.random() * 3));
    state.gold += tributeGold;
    spawnPulse(hero.mesh.position, 0xc9a5ff, 0.42);
  }

  if (stats.chestHealOnHit > 0) {
    healChest(stats.chestHealOnHit);
  }

  if (monster.name === "mighty" && Math.random() < 0.25) {
    damageArea(target.mesh.position, 2.2, stats.damage * 1.35);
    spawnPulse(target.mesh.position, 0xffe993, 0.45);
  }
}

function rollHeroDamage(target, stats, baseDamage) {
  let damage = baseDamage;
  let crit = false;
  if (stats.critChance > 0 && Math.random() < stats.critChance) {
    damage *= stats.critMult;
    crit = true;
  }
  if (stats.bonusVsStunned > 0 && target.stunTimer > 0) {
    damage *= 1 + stats.bonusVsStunned;
  }
  if (stats.bossBonus > 0 && target.isBoss) {
    damage *= 1 + stats.bossBonus;
  }
  if (crit) {
    spawnPulse(target.mesh.position, 0xfff1a8, 0.28);
  }
  return damage;
}

function applyArmorBreak(target, stats) {
  if (!stats.armorBreak || stats.armorBreak <= 0) return;
  const hadBreak = target.armorBreakTimer > 0;
  target.armorBreakTimer = Math.max(target.armorBreakTimer, stats.armorBreakDuration || 2.8);
  target.damageTakenMult = Math.max(target.damageTakenMult || 1, 1 + Math.min(0.95, stats.armorBreak));
  if (!hadBreak) {
    spawnPulse(target.mesh.position, 0xff8d7f, 0.25);
  }
}

function applyChainLightning(initialTarget, jumps, jumpRange, baseDamage, falloff, stats) {
  const hit = new Set([initialTarget.id]);
  let current = initialTarget;
  let damage = baseDamage;

  for (let i = 0; i < jumps; i += 1) {
    let next = null;
    let bestDist = Infinity;
    for (const enemy of enemies) {
      if (hit.has(enemy.id)) continue;
      const distSq = enemy.mesh.position.distanceToSquared(current.mesh.position);
      if (distSq > jumpRange * jumpRange) continue;
      if (distSq < bestDist) {
        bestDist = distSq;
        next = enemy;
      }
    }
    if (!next) break;

    applyDamage(next, damage);
    if (stats.slow > 0) {
      next.slowFactor = Math.min(next.slowFactor, stats.slow);
      next.slowTimer = Math.max(next.slowTimer, stats.slowDuration);
    }
    spawnPulse(next.mesh.position, 0xb8f5ff, 0.36);
    hit.add(next.id);
    current = next;
    damage *= falloff;
  }
}

function applyDamage(enemy, amount) {
  let dmg = amount * (enemy.damageTakenMult || 1);
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

function updateSkillEffects(dt) {
  for (let i = skillEffects.length - 1; i >= 0; i -= 1) {
    const fx = skillEffects[i];
    fx.age += dt;
    const t = fx.age / fx.life;

    if (t >= 1) {
      scene.remove(fx.group);
      skillEffects.splice(i, 1);
      continue;
    }

    const scale = 1 + t * 2.1;
    fx.group.scale.setScalar(scale);
    fx.group.rotation.y += dt * fx.spin;
    fx.group.position.y += dt * fx.drift;

    const opacity = (1 - t) * (fx.kind === "flare" ? 0.95 : 0.82);
    for (const material of fx.materials) {
      material.opacity = opacity;
    }

    for (const child of fx.group.children) {
      if (!child.userData.spin) continue;
      child.rotation.z += dt * child.userData.spin;
    }
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

function healChest(amount) {
  if (amount <= 0) return;
  state.chestHp = Math.min(state.chestHpMax, state.chestHp + amount);
}

function addChestShield(amount) {
  if (amount <= 0) return;
  state.chestShield = Math.min(state.chestHpMax * 3, state.chestShield + amount);
}

function damageChest(amount) {
  let pending = amount;
  if (state.chestShield > 0) {
    const blocked = Math.min(state.chestShield, pending);
    state.chestShield -= blocked;
    pending -= blocked;
    if (blocked > 0) {
      spawnPulse(chestMesh.position, 0xffe0ac, 0.38);
    }
  }
  state.chestHp = Math.max(0, state.chestHp - pending);
  state.chestHitFlash = 0.24;
  if (pending > 0) log(`chest hit for ${Math.ceil(pending)}.`);
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

  spawnPulse(tileToWorld(8, 5, 0.08), 0x8fe7ff, 0.8);
  log("deep freeze cast.");
}

function castRepair() {
  if (state.runOver) return;
  if (state.repairCd > 0) {
    log(`repair cooldown ${state.repairCd.toFixed(1)}s.`);
    return;
  }
  if (state.gold < REPAIR_COST) {
    log("not enough gold to repair chest.");
    return;
  }

  if (state.chestHp >= state.chestHpMax) {
    log("chest is already full hp.");
    return;
  }

  state.gold -= REPAIR_COST;
  state.repairCd = 11;
  state.chestHp = Math.min(state.chestHpMax, state.chestHp + state.chestHpMax * 0.35);
  spawnPulse(tileToWorld(8, 5, 0.08), 0x7dd6ff, 0.75);
  log("chest repaired.");
}

function updateWaveFlow(dt) {
  if (!state.waveActive) return;

  state.spawnCooldown -= dt;
  while (state.waveQueue.length > 0 && state.spawnCooldown <= 0) {
    const type = state.waveQueue.shift();
    spawnEnemy(type);
    state.spawnedThisWave += 1;
    state.spawnCooldown += state.spawnInterval;
  }

  if (state.waveQueue.length === 0 && enemies.length === 0) {
    const waveBonusGold = 55 + Math.round(state.stage * 6.5);
    const waveBonusOrbs = 4 + Math.floor(state.stage / 2);
    const waveBonusStones = state.stage >= 6 ? 16 + Math.floor(state.stage * 2.4) : 0;

    state.gold += waveBonusGold;
    state.orbs += waveBonusOrbs;
    state.stones += waveBonusStones;
    state.waveActive = false;
    state.stageClearReady = true;

    log(`stage ${state.stage} clear. +${waveBonusGold} gold, +${waveBonusOrbs} orbs${waveBonusStones ? `, +${waveBonusStones} stones` : ""}. press next stage.`);
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
  for (const fx of skillEffects) scene.remove(fx.group);
  enemies.length = 0;
  projectiles.length = 0;
  pulses.length = 0;
  floorMarks.length = 0;
  skillEffects.length = 0;

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
  state.chestShield = 0;
  state.stage = 1;
  state.wave = 1;
  state.waveActive = false;
  state.stageClearReady = false;
  state.waveQueue.length = 0;
  state.spawnCooldown = 0;
  state.gameSpeed = 1;
  state.fireballCd = 0;
  state.freezeCd = 0;
  state.repairCd = 0;
  state.pendingSpell = null;
  state.globalSlowTimer = 0;
  state.enemyHasteTimer = 0;
  state.heroSlowTimer = 0;
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
  applyStageTheme(state.stage);
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
  ui.chest.textContent = `${Math.ceil(state.chestHp)} / ${state.chestHpMax}${state.chestShield > 0 ? ` +${Math.ceil(state.chestShield)} shield` : ""}`;
  ui.wave.textContent = `${state.stage}${state.waveActive ? " (live)" : state.stageClearReady ? " (clear)" : ""}`;
  ui.enemies.textContent = `${enemies.length}${state.waveQueue.length > 0 ? ` + ${state.waveQueue.length}` : ""}`;

  ui.startWaveBtn.disabled = state.runOver || state.waveActive || state.stageClearReady;
  ui.startWaveBtn.textContent = state.waveActive
    ? "stage active"
    : state.stageClearReady
      ? "stage clear"
      : "start stage";
  ui.nextStageBtn.disabled = state.runOver || state.waveActive || !state.stageClearReady;
  ui.nextStageBtn.textContent = state.stageClearReady ? `next stage (${state.stage + 1})` : "next stage";

  ui.fireballBtn.disabled = state.runOver || state.fireballCd > 0;
  ui.fireballBtn.textContent = state.pendingSpell === "fireball"
    ? "click board"
    : state.fireballCd > 0
      ? `fireball (${state.fireballCd.toFixed(1)}s)`
      : `fireball (${FIREBALL_COST})`;

  ui.freezeBtn.disabled = state.runOver || state.freezeCd > 0;
  ui.freezeBtn.textContent = state.freezeCd > 0 ? `deep freeze (${state.freezeCd.toFixed(1)}s)` : `deep freeze (${FREEZE_COST})`;

  ui.repairBtn.disabled = state.runOver || state.repairCd > 0;
  ui.repairBtn.textContent = state.repairCd > 0 ? `repair chest (${state.repairCd.toFixed(1)}s)` : `repair chest (${REPAIR_COST})`;

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

  if (!monsterId) {
    ui.towerInfo.innerHTML = "none";
    ui.upgradeBtn.disabled = true;
    ui.removeBtn.disabled = true;
    ui.hint.textContent = "click a hero card, then click a blue stone to place it.";
    ui.rosterDetailTitle.textContent = "selected: none";
    ui.rosterDetailStats.innerHTML = "click a hero card to inspect stats, ability, and passive.";
    return;
  }

  const entry = collection[monsterId];
  const monster = monsterCatalog[monsterId];
  const stats = hero
    ? getHeroStats(hero)
    : getHeroStats({ monsterId, slotIndex: null }, { includeAdjacency: false });
  const slot = hero ? HERO_SLOTS[hero.slotIndex] : null;
  const specialLabel = getSpecialLabel(monster.special);
  const passiveLabel = getPassiveLabel(monster.passive);
  const specialIcon = getSkillIconUri("special", monster.special);
  const passiveIcon = getSkillIconUri("passive", monster.passive);
  const specialPower = getSpecialPowerText(monster, stats);
  const passivePower = getPassivePowerText(monster, stats);
  const positionText = slot ? `stone r${slot.row + 1}c${slot.col + 1}` : "bench";
  const atkSpeed = (1 / stats.attackDelay).toFixed(2);
  const statStamina = Math.round(entry.level * 34 + entry.stars * 68 + stats.range * 12);
  const statAttack = Math.round(stats.damage);
  const statDefense = Math.round(stats.range * 9 + entry.stars * 14 + (hero ? 10 : 0));
  const statSpeed = Math.round((1 / stats.attackDelay) * 27);
  const statCrit = `${Math.round((stats.critChance || 0) * 100)}%`;
  const extraTags = [];
  if (stats.critChance > 0) extraTags.push(`crit ${Math.round(stats.critChance * 100)}% x${stats.critMult.toFixed(2)}`);
  if (stats.burnDps > 0) extraTags.push(`burn ${stats.burnDps.toFixed(0)}/s`);
  if (stats.slow > 0) extraTags.push(`slow ${Math.round((1 - stats.slow) * 100)}%`);
  if (stats.stunChance > 0) extraTags.push(`stun ${Math.round(stats.stunChance * 100)}%`);
  if (stats.executeThreshold > 0) extraTags.push(`execute ${Math.round(stats.executeThreshold * 100)}%`);
  if (stats.goldStealChance > 0) extraTags.push(`gold steal ${Math.round(stats.goldStealChance * 100)}%`);
  const extrasText = extraTags.length ? extraTags.join(" | ") : "no extra combat modifiers.";

  const nextCost = entry.level >= 30 ? "max" : upgradeCost(monsterId);
  ui.towerInfo.innerHTML = `
    <div class="hero-sheet">
      <div class="hero-sheet-top">
        <div class="hero-sheet-name">${monster.name}</div>
        <div class="hero-chip-row">
          <span class="hero-chip">lv ${entry.level}</span>
          <span class="hero-chip">stars ${entry.stars}</span>
          <span class="hero-chip">${monster.rarity}</span>
          <span class="hero-chip">${positionText}</span>
        </div>
      </div>

      <div class="hero-section-card">
        <div class="hero-section-title">passive</div>
        <div class="hero-skill-row">
          <img class="skill-inline-icon" src="${passiveIcon}" alt="passive icon" />
          <div>
            <div class="hero-skill-name">${passiveLabel}</div>
            <div class="hero-skill-desc">${getPassiveDescription(monster.passive)}</div>
            <div class="hero-skill-power">${passivePower}</div>
          </div>
        </div>
      </div>

      <div class="hero-section-card">
        <div class="hero-section-title">stats</div>
        <div class="hero-stat-list">
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot stamina"></span>stamina</span><strong>${statStamina}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot attack"></span>attack</span><strong>${statAttack}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot defense"></span>defense</span><strong>${statDefense}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot speed"></span>speed</span><strong>${statSpeed}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot crit"></span>crit chance</span><strong>${statCrit}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot range"></span>range</span><strong>${stats.range.toFixed(1)}</strong></div>
          <div class="hero-stat-row"><span class="hero-stat-key"><span class="hero-stat-dot aps"></span>atk/s</span><strong>${atkSpeed}</strong></div>
        </div>
      </div>

      <div class="hero-section-card">
        <div class="hero-section-title">skills</div>
        <div class="detail-skill-row">
          <img class="skill-inline-icon" src="${specialIcon}" alt="active icon" />
          <div>
            <div class="hero-skill-name">${specialLabel}</div>
            <div class="hero-skill-desc">${getSpecialDescription(monster.special)}</div>
            <div class="hero-skill-power">${specialPower}</div>
          </div>
        </div>
        <div class="hero-sheet-footer">extras: ${extrasText}</div>
        <div class="hero-sheet-footer">next upgrade: ${nextCost}</div>
      </div>
    </div>
  `;

  ui.upgradeBtn.disabled = entry.level >= 30 || !entry.owned;
  ui.removeBtn.disabled = !hero;
  ui.hint.textContent = hero
    ? (hero.disabledTimer > 0 ? "hero stunned by a breaker." : "adjacent mighty/speedy/hellhound grant aura buffs.")
    : "selected hero is on bench. click a blue stone to place.";

  ui.rosterDetailTitle.textContent = `${monster.name} • lv ${entry.level} • ${monster.rarity}`;
  ui.rosterDetailStats.innerHTML = `
    <div class="detail-line">stats: dmg ${stats.damage.toFixed(0)} | atk/s ${(1 / stats.attackDelay).toFixed(2)} | range ${stats.range.toFixed(1)} | stars ${entry.stars}</div>
    <div class="detail-skill-row">
      <img class="skill-inline-icon" src="${specialIcon}" alt="active icon" />
      <div>
        <div class="hero-skill-name">active (${specialLabel})</div>
        <div class="hero-skill-desc">${getSpecialDescription(monster.special)} | impact: ${specialPower}</div>
      </div>
    </div>
    <div class="detail-skill-row">
      <img class="skill-inline-icon" src="${passiveIcon}" alt="passive icon" />
      <div>
        <div class="hero-skill-name">passive (${passiveLabel})</div>
        <div class="hero-skill-desc">${getPassiveDescription(monster.passive)} | scaling: ${passivePower}</div>
      </div>
    </div>
    <div class="detail-line">extras: ${extrasText}</div>
  `;
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
    const previewStats = entry.owned
      ? (placedHero ? getHeroStats(placedHero) : getHeroStats({ monsterId: id, slotIndex: null }, { includeAdjacency: false }))
      : null;
    const specialLabel = getSpecialLabel(monster.special);
    const passiveLabel = getPassiveLabel(monster.passive);
    const specialIcon = getSkillIconUri("special", monster.special);
    const passiveIcon = getSkillIconUri("passive", monster.passive);
    const specialTag = previewStats ? getSpecialPowerText(monster, previewStats).split(",")[0] : "no data";
    const portrait = getMonsterPortraitUri(id);

    cards.push(`
      <div class="roster-card rarity-${monster.rarity} ${entry.owned ? "" : "locked"} ${selected ? "selected" : ""}" data-monster-id="${id}">
        <div class="roster-topline">
          <div class="roster-level">lv ${entry.level}</div>
          <div class="roster-rarity-badge">${monster.rarity}</div>
          <div class="roster-stars">stars ${entry.stars}</div>
        </div>
        <div class="roster-head">
          <div class="roster-icon">
            <img class="roster-portrait" src="${portrait}" alt="${monster.name} portrait" />
          </div>
          <div class="roster-meta">
            <div class="roster-name">${monster.name}</div>
            <div class="roster-rarity">${monster.rarity.toUpperCase()}</div>
            <div class="roster-kit"><img class="roster-skill-icon" src="${passiveIcon}" alt="passive icon" />${passiveLabel}</div>
          </div>
        </div>
        <div class="roster-ability"><img class="roster-skill-icon" src="${specialIcon}" alt="active icon" />${specialLabel}</div>
        <div class="roster-skill-power">${specialTag}</div>
        ${previewStats ? `<div class="roster-power">dmg ${previewStats.damage.toFixed(0)} | atk/s ${(1 / previewStats.attackDelay).toFixed(2)} | rng ${previewStats.range.toFixed(1)}</div>` : `<div class="roster-power">summon to unlock</div>`}
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
    chestShield: state.chestShield,
    stage: state.stage,
    wave: state.wave,
    stageClearReady: state.stageClearReady,
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
  state.chestShield = typeof parsed.chestShield === "number" ? Math.max(0, Math.min(state.chestHpMax * 3, parsed.chestShield)) : state.chestShield;
  const loadedStage = typeof parsed.stage === "number"
    ? Math.max(1, Math.floor(parsed.stage))
    : typeof parsed.wave === "number"
      ? Math.max(1, Math.floor(parsed.wave))
      : state.stage;
  state.stage = loadedStage;
  state.wave = loadedStage;
  state.stageClearReady = !!parsed.stageClearReady;

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
    if (state.heroSlowTimer > 0) state.heroSlowTimer = Math.max(0, state.heroSlowTimer - dt);

    updateWaveFlow(dt);
    updateHeroes(dt, elapsed);
    updateEnemies(dt);
    updateProjectiles(dt);
    updatePulses(dt);
    updateFloorMarks(dt);
    updateSkillEffects(dt);

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
    updateSkillEffects(dt);
  }

  updateChestVisual(dt);
  updateSelectionIndicator();
  updateAllUi();

  renderer.render(scene, camera);
}
