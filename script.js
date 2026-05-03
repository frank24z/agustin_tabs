import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================
   ELEMENTOS DEL HTML
========================= */
const accountScreen = document.getElementById("accountScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const gameContainer = document.getElementById("game3d");

const accountForm = document.getElementById("accountForm");
const nicknameInput = document.getElementById("nicknameInput");
const ageInput = document.getElementById("ageInput");
const accountError = document.getElementById("accountError");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

const playButton = document.getElementById("playButton");
const freeModeButton = document.getElementById("freeModeButton");
const multiplayerButton = document.getElementById("multiplayerButton");
const multiplayerPanel = document.getElementById("multiplayerPanel");
const closeMultiplayerPanel = document.getElementById("closeMultiplayerPanel");
const playerSearchInput = document.getElementById("playerSearchInput");
const searchPlayerButton = document.getElementById("searchPlayerButton");
const playerSearchResults = document.getElementById("playerSearchResults");
const inviteBox = document.getElementById("inviteBox");
const inviteText = document.getElementById("inviteText");
const acceptInviteButton = document.getElementById("acceptInviteButton");
const rejectInviteButton = document.getElementById("rejectInviteButton");
const backLobbyButton = document.getElementById("backLobbyButton");
const startBattleButton = document.getElementById("startBattleButton");
const resetBattleButton = document.getElementById("resetBattleButton");
const nextLevelButton = document.getElementById("nextLevelButton");

const statusText = document.getElementById("statusText");
const moneyText = document.getElementById("moneyText");
const modeText = document.getElementById("modeText");
const levelText = document.getElementById("levelText");
const levelSuffix = document.getElementById("levelSuffix");
const blueCountText = document.getElementById("blueCountText");
const redCountText = document.getElementById("redCountText");
const multiplayerBudgetPill = document.getElementById("multiplayerBudgetPill");
const blueMoneyText = document.getElementById("blueMoneyText");
const redMoneyText = document.getElementById("redMoneyText");
const multiplayerOpponentPill = document.getElementById("multiplayerOpponentPill");
const opponentNameText = document.getElementById("opponentNameText");

const lobbyMessage = document.getElementById("lobbyMessage");
const lobbyCoins = document.getElementById("lobbyCoins");
const lobbyLevel = document.getElementById("lobbyLevel");
const lobbyTrophies = document.getElementById("lobbyTrophies");

const freeModeToolbar = document.getElementById("freeModeToolbar");
const placeBlueButton = document.getElementById("placeBlueButton");
const placeRedButton = document.getElementById("placeRedButton");
const randomEnemiesButton = document.getElementById("randomEnemiesButton");
const clearFreeButton = document.getElementById("clearFreeButton");
const freeTeamText = document.getElementById("freeTeamText");
const multiplayerToolbar = document.getElementById("multiplayerToolbar");
const multiPlaceBlueButton = document.getElementById("multiPlaceBlueButton");
const multiPlaceRedButton = document.getElementById("multiPlaceRedButton");
const multiTeamText = document.getElementById("multiTeamText");

const unitButtons = [...document.querySelectorAll(".unit-btn")];

/* =========================
   ESTADO DEL JUEGO
========================= */
const ACCOUNT_STORAGE_KEY = "agustinTabs3DAccount";
const MULTIPLAYER_PLAYERS_KEY = "agustinTabs3DPlayers";
const MULTIPLAYER_BUDGET = 2000;
let playerAccount = null;

let currentLevel = 1;
let money = 500;
let trophies = 0;
let currentGameMode = "campaign";
let freePlacementTeam = "blue";
let multiplayerPlacementTeam = "blue";
let multiplayerBlueMoney = MULTIPLAYER_BUDGET;
let multiplayerRedMoney = MULTIPLAYER_BUDGET;
let pendingInviteName = "";
let multiplayerOpponentName = "";
let selectedUnitType = null;
let battleStarted = false;
let battleWon = false;

const units = [];
const projectiles = [];
const effects = [];

const FIELD = {
  minX: -18,
  maxX: 18,
  minZ: -14,
  maxZ: 14,
  blueMaxX: -1.2,
  redMinX: 1.2
};

/* =========================
   UNIDADES
========================= */
const unitTypes = {
  clubber: {
    name: "Garrote",
    cost: 50,
    hp: 95,
    damage: 18,
    range: 1.45,
    moveSpeed: 3.15,
    attackInterval: 0.9,
    attackDuration: 0.34,
    kind: "melee",
    scale: 1,
    color: 0x63e6be,
    pants: 0x364fc7,
    weapon: "club"
  },
  shield: {
    name: "Escudo",
    cost: 70,
    hp: 160,
    damage: 13,
    range: 1.3,
    moveSpeed: 2.7,
    attackInterval: 0.95,
    attackDuration: 0.34,
    kind: "melee",
    scale: 1,
    color: 0x74c0fc,
    pants: 0x1c7ed6,
    weapon: "shield"
  },
  spearman: {
    name: "Lancero",
    cost: 90,
    hp: 110,
    damage: 24,
    range: 2.35,
    moveSpeed: 3.0,
    attackInterval: 1.0,
    attackDuration: 0.32,
    kind: "melee",
    scale: 1,
    color: 0xa5d8ff,
    pants: 0x1864ab,
    weapon: "spear"
  },
  archer: {
    name: "Arquero",
    cost: 100,
    hp: 80,
    damage: 18,
    range: 10,
    preferredRange: 8.5,
    retreatDistance: 4.3,
    moveSpeed: 2.75,
    attackInterval: 1.15,
    attackDuration: 0.35,
    projectileSpeed: 18,
    kind: "ranged",
    scale: 1,
    color: 0xb2f2bb,
    pants: 0x2b8a3e,
    weapon: "bow"
  },
  knight: {
    name: "Caballero",
    cost: 130,
    hp: 180,
    damage: 30,
    range: 1.55,
    moveSpeed: 3.05,
    attackInterval: 0.95,
    attackDuration: 0.34,
    kind: "melee",
    scale: 1.08,
    color: 0xd0bfff,
    pants: 0x5f3dc4,
    weapon: "sword"
  },
  giant: {
    name: "Gigante",
    cost: 180,
    hp: 380,
    damage: 44,
    range: 2.25,
    moveSpeed: 2.15,
    attackInterval: 1.28,
    attackDuration: 0.42,
    kind: "melee",
    scale: 1.55,
    color: 0xffd8a8,
    pants: 0x845ef7,
    weapon: "club"
  },
  mage: {
    name: "Mago",
    cost: 160,
    hp: 85,
    damage: 25,
    range: 9.5,
    preferredRange: 8,
    retreatDistance: 4.1,
    moveSpeed: 2.65,
    attackInterval: 1.3,
    attackDuration: 0.42,
    projectileSpeed: 13,
    splashRadius: 2.2,
    kind: "ranged",
    scale: 1,
    color: 0xe599f7,
    pants: 0x862e9c,
    weapon: "staff"
  },
  devil: {
    name: "Diablo",
    cost: 400,
    hp: 300,
    damage: 55,
    range: 1.85,
    moveSpeed: 3.45,
    attackInterval: 0.85,
    attackDuration: 0.38,
    kind: "melee",
    scale: 1.18,
    color: 0xc92a2a,
    pants: 0x3b0a0a,
    weapon: "demonSword",
    teleport: true,
    teleportRange: 8.5,
    teleportCooldown: 3.2,
    teleportDistance: 1.35
  },
  death: {
    name: "La Muerte",
    cost: 370,
    hp: 260,
    damage: 46,
    range: 2.45,
    moveSpeed: 2.95,
    attackInterval: 1.05,
    attackDuration: 0.48,
    kind: "melee",
    scale: 1.12,
    color: 0x212529,
    pants: 0x111111,
    weapon: "scythe",
    pushPower: 2.6,
    pushRadius: 3.4
  },
  god: {
    name: "Dios",
    cost: 400,
    hp: 310,
    damage: 34,
    meleeDamage: 38,
    rangedDamage: 0,
    range: 11,
    meleeRange: 1.75,
    preferredRange: 8.5,
    retreatDistance: 3.1,
    moveSpeed: 3.05,
    attackInterval: 1.05,
    attackDuration: 0.43,
    projectileSpeed: 15,
    kind: "hybrid",
    scale: 1.17,
    color: 0xfff3bf,
    pants: 0xffd43b,
    weapon: "divine",
    projectileType: "time",
    paralysisDuration: 3,
    paralysisDrainPerMillisecond: 1
  },
  ninja: {
    name: "Ninja",
    cost: 220,
    hp: 120,
    damage: 28,
    range: 1.35,
    moveSpeed: 4.35,
    attackInterval: 0.55,
    attackDuration: 0.28,
    kind: "melee",
    scale: 0.95,
    color: 0x343a40,
    pants: 0x111111,
    weapon: "daggers"
  },
  samurai: {
    name: "Samurái",
    cost: 250,
    hp: 165,
    damage: 42,
    range: 1.95,
    moveSpeed: 3.25,
    attackInterval: 0.82,
    attackDuration: 0.34,
    kind: "melee",
    scale: 1.05,
    color: 0xff922b,
    pants: 0x7f2704,
    weapon: "katana"
  },
  berserker: {
    name: "Berserker",
    cost: 230,
    hp: 210,
    damage: 38,
    range: 1.75,
    moveSpeed: 3.45,
    attackInterval: 0.7,
    attackDuration: 0.36,
    kind: "melee",
    scale: 1.1,
    color: 0xfa5252,
    pants: 0x5c2e0f,
    weapon: "axe"
  },
  paladin: {
    name: "Paladín",
    cost: 260,
    hp: 250,
    damage: 32,
    range: 1.7,
    moveSpeed: 2.75,
    attackInterval: 0.95,
    attackDuration: 0.4,
    kind: "melee",
    scale: 1.12,
    color: 0xf8f9fa,
    pants: 0xffd43b,
    weapon: "hammer"
  },
  cannoneer: {
    name: "Cañonero",
    cost: 240,
    hp: 135,
    damage: 40,
    range: 10.5,
    preferredRange: 8.7,
    retreatDistance: 4.2,
    moveSpeed: 2.25,
    attackInterval: 1.55,
    attackDuration: 0.48,
    projectileSpeed: 12,
    splashRadius: 2.4,
    kind: "ranged",
    scale: 1.05,
    color: 0x868e96,
    pants: 0x495057,
    weapon: "cannon",
    projectileType: "cannonball"
  },
  vampire: {
    name: "Vampiro",
    cost: 260,
    hp: 150,
    damage: 30,
    range: 1.45,
    moveSpeed: 3.55,
    attackInterval: 0.72,
    attackDuration: 0.31,
    kind: "melee",
    scale: 1,
    color: 0x7b2cbf,
    pants: 0x240046,
    weapon: "claws",
    lifeSteal: 0.45
  },
  angel: {
    name: "Ángel",
    cost: 300,
    hp: 170,
    damage: 30,
    range: 10,
    preferredRange: 8.2,
    retreatDistance: 4,
    moveSpeed: 3.0,
    attackInterval: 1.0,
    attackDuration: 0.38,
    projectileSpeed: 17,
    kind: "ranged",
    scale: 1.07,
    color: 0xffffff,
    pants: 0xa5d8ff,
    weapon: "angelStaff",
    projectileType: "light"
  }
};

/* =========================
   10 NIVELES
========================= */
const levels = [
  {
    budget: 500,
    reward: 60,
    enemies: [
      { type: "clubber", x: 8, z: -3 },
      { type: "clubber", x: 8, z: 0 },
      { type: "shield", x: 9, z: 3 }
    ]
  },
  {
    budget: 550,
    reward: 80,
    enemies: [
      { type: "shield", x: 8, z: -4 },
      { type: "clubber", x: 9, z: -1 },
      { type: "clubber", x: 9, z: 2 },
      { type: "archer", x: 11, z: 5 }
    ]
  },
  {
    budget: 600,
    reward: 100,
    enemies: [
      { type: "spearman", x: 8, z: -5 },
      { type: "shield", x: 8, z: -1 },
      { type: "archer", x: 11, z: 2 },
      { type: "archer", x: 11, z: 5 }
    ]
  },
  {
    budget: 650,
    reward: 120,
    enemies: [
      { type: "knight", x: 8, z: -3 },
      { type: "clubber", x: 9, z: 0 },
      { type: "shield", x: 9, z: 3 },
      { type: "archer", x: 11, z: 6 }
    ]
  },
  {
    budget: 700,
    reward: 140,
    enemies: [
      { type: "spearman", x: 8, z: -5 },
      { type: "spearman", x: 8, z: -1 },
      { type: "knight", x: 9, z: 3 },
      { type: "archer", x: 11, z: 0 },
      { type: "archer", x: 11, z: 6 }
    ]
  },
  {
    budget: 760,
    reward: 160,
    enemies: [
      { type: "giant", x: 8, z: 0 },
      { type: "clubber", x: 10, z: -4 },
      { type: "clubber", x: 10, z: 4 }
    ]
  },
  {
    budget: 820,
    reward: 180,
    enemies: [
      { type: "shield", x: 8, z: -5 },
      { type: "shield", x: 8, z: -1 },
      { type: "giant", x: 9, z: 3 },
      { type: "archer", x: 12, z: -3 },
      { type: "archer", x: 12, z: 5 }
    ]
  },
  {
    budget: 880,
    reward: 210,
    enemies: [
      { type: "mage", x: 11, z: -5 },
      { type: "spearman", x: 8, z: -1 },
      { type: "knight", x: 8, z: 3 },
      { type: "archer", x: 11, z: 6 }
    ]
  },
  {
    budget: 940,
    reward: 250,
    enemies: [
      { type: "mage", x: 11, z: -6 },
      { type: "mage", x: 11, z: 6 },
      { type: "shield", x: 8, z: -2 },
      { type: "shield", x: 8, z: 2 },
      { type: "knight", x: 9, z: 0 }
    ]
  },
  {
    budget: 1000,
    reward: 320,
    enemies: [
      { type: "giant", x: 8, z: 0 },
      { type: "knight", x: 9, z: -4 },
      { type: "knight", x: 9, z: 4 },
      { type: "archer", x: 12, z: -6 },
      { type: "archer", x: 12, z: 6 },
      { type: "mage", x: 12, z: 0 }
    ]
  }
];

/* =========================
   THREE.JS ESCENA
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8a8d8f);
scene.fog = new THREE.Fog(0x8a8d8f, 38, 82);

const camera = new THREE.PerspectiveCamera(
  55,
  Math.max(1, gameContainer.clientWidth) / Math.max(1, gameContainer.clientHeight),
  0.1,
  200
);
camera.position.set(0, 15, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
gameContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 2.3, 0);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 8;
controls.maxDistance = 50;

renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x6f7470, 1.18);
scene.add(hemiLight);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(14, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -26;
sun.shadow.camera.right = 26;
sun.shadow.camera.top = 26;
sun.shadow.camera.bottom = -26;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 34),
  new THREE.MeshStandardMaterial({ color: 0x6f7470, roughness: 0.92 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const blueZone = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 28),
  new THREE.MeshBasicMaterial({ color: 0x1c7ed6, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
);
blueZone.rotation.x = -Math.PI / 2;
blueZone.position.set(-9.5, 0.015, 0);
scene.add(blueZone);

const redZone = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 28),
  new THREE.MeshBasicMaterial({ color: 0xfa5252, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
);
redZone.rotation.x = -Math.PI / 2;
redZone.position.set(9.5, 0.015, 0);
scene.add(redZone);

const divider = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.05, 28),
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.12 })
);
divider.position.set(0, 0.035, 0);
scene.add(divider);

const grid = new THREE.GridHelper(40, 20, 0x000000, 0x000000);
grid.material.opacity = 0.12;
grid.material.transparent = true;
scene.add(grid);

const placementPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 34),
  new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
);
placementPlane.rotation.x = -Math.PI / 2;
scene.add(placementPlane);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* =========================
   DECORACION LOW POLY
========================= */
function makeMat(color, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    flatShading: true,
    roughness: 0.8
  });
}

/* =========================
   MAPA TIPO CASTILLO LOW POLY
   Inspirado en la imagen que mandaste, sin usar assets oficiales.
   Mantiene el juego, cuenta, lobby, niveles, ataques y camara.
========================= */
const castleGroup = new THREE.Group();
scene.add(castleGroup);

function addBox(x, baseY, z, w, h, d, material, group = castleGroup) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, baseY + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function createPitchedRoofGeometry(w, d, h) {
  const vertices = new Float32Array([
    -w / 2, 0, -d / 2,
     w / 2, 0, -d / 2,
     0,     h, -d / 2,
    -w / 2, 0,  d / 2,
     w / 2, 0,  d / 2,
     0,     h,  d / 2
  ]);

  const indices = [
    0, 1, 2,
    3, 5, 4,
    0, 3, 4, 0, 4, 1,
    0, 2, 5, 0, 5, 3,
    1, 4, 5, 1, 5, 2
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addPitchedRoof(x, baseY, z, w, d, h, material) {
  const roof = new THREE.Mesh(createPitchedRoofGeometry(w, d, h), material);
  roof.position.set(x, baseY, z);
  roof.castShadow = true;
  roof.receiveShadow = true;
  castleGroup.add(roof);
  return roof;
}

function addPyramidRoof(x, baseY, z, w, d, h, material) {
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, h, 4), material);
  roof.scale.set(w * 0.72, 1, d * 0.72);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(x, baseY + h / 2, z);
  roof.castShadow = true;
  roof.receiveShadow = true;
  castleGroup.add(roof);
  return roof;
}

function createArchShape(w, h) {
  const shape = new THREE.Shape();
  const r = w / 2;
  const rectH = Math.max(0.1, h - r);

  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2, rectH);
  shape.absarc(0, rectH, r, Math.PI, 0, false);
  shape.lineTo(w / 2, 0);
  shape.lineTo(-w / 2, 0);

  return shape;
}

function addArch(x, baseY, frontZ, w, h, trimScale = 1.18) {
  const trim = new THREE.Mesh(
    new THREE.ShapeGeometry(createArchShape(w * trimScale, h * trimScale)),
    makeMat(0xb0b0aa)
  );
  trim.position.set(x, baseY, frontZ + 0.018);
  trim.castShadow = true;
  trim.receiveShadow = true;
  castleGroup.add(trim);

  const dark = new THREE.Mesh(
    new THREE.ShapeGeometry(createArchShape(w, h)),
    new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.64, side: THREE.DoubleSide })
  );
  dark.position.set(x, baseY, frontZ + 0.035);
  castleGroup.add(dark);

  return dark;
}

function addWindow(x, baseY, frontZ, w = 0.52, h = 1.0) {
  addArch(x, baseY, frontZ, w, h, 1.35);
}

function addHorizontalStoneLines(x, frontZ, w, minY, maxY, count) {
  const lineMat = makeMat(0x525755);

  for (let i = 1; i < count; i++) {
    const y = minY + ((maxY - minY) * i) / count;
    addBox(x, y, frontZ + 0.04, w, 0.035, 0.045, lineMat);
  }
}

function addBattlements(x, z, w, d, baseY, material) {
  const step = 1.05;
  const countX = Math.floor(w / step);

  for (let i = 0; i <= countX; i++) {
    const px = x - w / 2 + i * step;
    addBox(px, baseY, z + d / 2 + 0.05, 0.46, 0.45, 0.34, material);
  }

  const countZ = Math.floor(d / step);

  for (let i = 0; i <= countZ; i++) {
    const pz = z - d / 2 + i * step;
    addBox(x - w / 2 - 0.05, baseY, pz, 0.34, 0.45, 0.46, material);
    addBox(x + w / 2 + 0.05, baseY, pz, 0.34, 0.45, 0.46, material);
  }
}

function addTileLines() {
  const lineMat = makeMat(0x4f5351);

  for (let x = -18; x <= 18; x += 2) {
    addBox(x, 0.018, 0, 0.035, 0.035, 28.2, lineMat);
  }

  for (let z = -14; z <= 14; z += 2) {
    addBox(0, 0.022, z, 36.2, 0.03, 0.035, lineMat);
  }
}

function addBarrel(x, z, rot = 0, s = 1) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34 * s, 0.34 * s, 0.72 * s, 12),
    makeMat(0x8d5524)
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.rotation.y = rot;
  barrel.position.set(x, 0.38 * s, z);
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  castleGroup.add(barrel);

  const ringMat = makeMat(0x343a40);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.34 * s, 0.025 * s, 6, 14), ringMat);
  ring1.rotation.y = Math.PI / 2;
  ring1.position.set(x - 0.24 * Math.cos(rot), 0.38 * s, z - 0.24 * Math.sin(rot));
  ring1.castShadow = true;
  castleGroup.add(ring1);

  const ring2 = ring1.clone();
  ring2.position.set(x + 0.24 * Math.cos(rot), 0.38 * s, z + 0.24 * Math.sin(rot));
  castleGroup.add(ring2);
}

function addCrate(x, z, s = 1) {
  const crate = addBox(x, 0, z, 0.75 * s, 0.75 * s, 0.75 * s, makeMat(0x9c6644));
  crate.rotation.y = 0.4 + x * 0.03;

  addBox(x, 0.25 * s, z + 0.39 * s, 0.82 * s, 0.08 * s, 0.07 * s, makeMat(0x5c3d2e));
  addBox(x, 0.25 * s, z - 0.39 * s, 0.82 * s, 0.08 * s, 0.07 * s, makeMat(0x5c3d2e));
}

function addBench(x, z, rot = 0, s = 1) {
  const bench = new THREE.Group();
  castleGroup.add(bench);
  bench.position.set(x, 0, z);
  bench.rotation.y = rot;

  addBox(0, 0.45 * s, 0, 2.2 * s, 0.18 * s, 0.45 * s, makeMat(0x7f4f24), bench);
  addBox(-0.8 * s, 0, 0, 0.16 * s, 0.5 * s, 0.16 * s, makeMat(0x5c3d2e), bench);
  addBox(0.8 * s, 0, 0, 0.16 * s, 0.5 * s, 0.16 * s, makeMat(0x5c3d2e), bench);
}

function addFountain(x, z, s = 1) {
  const stone = makeMat(0xa6a6a0);
  const water = new THREE.MeshStandardMaterial({
    color: 0x74c0fc,
    emissive: 0x1971c2,
    emissiveIntensity: 0.25,
    roughness: 0.35,
    flatShading: true
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1 * s, 1.2 * s, 0.28 * s, 18), stone);
  base.position.set(x, 0.14 * s, z);
  base.castShadow = true;
  base.receiveShadow = true;
  castleGroup.add(base);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9 * s, 0.7 * s, 0.45 * s, 18), stone);
  bowl.position.set(x, 0.5 * s, z);
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  castleGroup.add(bowl);

  const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.72 * s, 0.72 * s, 0.04 * s, 18), water);
  pool.position.set(x, 0.75 * s, z);
  castleGroup.add(pool);

  const top = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 12, 8), water);
  top.position.set(x, 1.18 * s, z);
  castleGroup.add(top);
}

function addCannon(x, z, rot = 0, s = 1) {
  const cannon = new THREE.Group();
  castleGroup.add(cannon);
  cannon.position.set(x, 0, z);
  cannon.rotation.y = rot;

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.38 * s, 1.3 * s, 12), makeMat(0x2f3336));
  body.rotation.z = Math.PI / 2;
  body.position.set(0, 0.55 * s, 0);
  body.castShadow = true;
  cannon.add(body);

  const wheelMat = makeMat(0x5c3d2e);
  const wheelL = new THREE.Mesh(new THREE.TorusGeometry(0.35 * s, 0.07 * s, 8, 16), wheelMat);
  wheelL.position.set(-0.25 * s, 0.3 * s, 0.42 * s);
  wheelL.rotation.y = Math.PI / 2;
  wheelL.castShadow = true;
  cannon.add(wheelL);

  const wheelR = wheelL.clone();
  wheelR.position.z = -0.42 * s;
  cannon.add(wheelR);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.2 * s, 0.16 * s, 0.35 * s), makeMat(0x8d5524));
  stand.position.set(-0.15 * s, 0.22 * s, 0);
  stand.castShadow = true;
  cannon.add(stand);
}

function buildCastleMap() {
  const stone = makeMat(0x8c8d89);
  const stoneDark = makeMat(0x686b68);
  const roof = makeMat(0x67696c);
  const roofLight = makeMat(0x777a7d);
  const trim = makeMat(0xb5b5ae);

  addTileLines();

  // Edificios principales del fondo.
  addBox(-10, 0, -16.1, 14.5, 4.5, 3.0, stone);
  addPitchedRoof(-10, 4.5, -16.1, 15.1, 3.6, 1.25, roof);
  addHorizontalStoneLines(-10, -14.56, 14.2, 0.5, 4.2, 5);
  addArch(-14.2, 0.05, -14.54, 2.2, 2.35);
  addArch(-9.8, 0.05, -14.54, 2.2, 2.35);
  addArch(-5.4, 0.05, -14.54, 2.2, 2.35);
  addWindow(-12.2, 2.7, -14.52, 0.55, 0.9);
  addWindow(-7.6, 2.7, -14.52, 0.55, 0.9);

  addBox(7.8, 0, -16.1, 9.8, 4.4, 3.0, stone);
  addPitchedRoof(7.8, 4.4, -16.1, 10.4, 3.6, 1.2, roof);
  addHorizontalStoneLines(7.8, -14.56, 9.6, 0.5, 4.0, 5);
  addArch(5.0, 0.05, -14.54, 2.2, 2.45);
  addArch(9.2, 0.05, -14.54, 1.6, 2.2);
  addWindow(7.2, 2.7, -14.52, 0.55, 0.9);
  addWindow(11.2, 2.7, -14.52, 0.55, 0.9);

  // Torres laterales.
  addBox(-17.4, 0, -15.7, 3.7, 6.2, 4.1, stoneDark);
  addBattlements(-17.4, -15.7, 3.7, 4.1, 6.2, trim);
  addPyramidRoof(-17.4, 6.55, -15.7, 3.9, 4.2, 1.7, roofLight);
  addWindow(-17.4, 1.4, -13.62, 0.65, 1.1);
  addWindow(-17.4, 3.3, -13.62, 0.55, 0.95);

  addBox(17.1, 0, -15.2, 4.2, 6.8, 4.2, stoneDark);
  addBattlements(17.1, -15.2, 4.2, 4.2, 6.8, trim);
  addPyramidRoof(17.1, 7.1, -15.2, 4.4, 4.4, 1.8, roofLight);
  addWindow(17.1, 1.5, -13.08, 0.65, 1.15);
  addWindow(16.2, 3.6, -13.08, 0.52, 0.95);
  addWindow(18.0, 3.6, -13.08, 0.52, 0.95);

  // Torre central alta tipo campanario.
  addBox(0, 0, -15.8, 3.6, 7.0, 3.5, stoneDark);
  addBox(0, 7.0, -15.8, 2.7, 3.3, 2.8, stone);
  addBattlements(0, -15.8, 3.0, 3.1, 10.3, trim);
  addPitchedRoof(0, 10.7, -15.8, 3.2, 3.0, 1.05, roofLight);
  addArch(0, 0.05, -14.0, 1.35, 2.1);
  addWindow(-0.65, 3.0, -13.98, 0.48, 0.9);
  addWindow(0.65, 3.0, -13.98, 0.48, 0.9);
  addWindow(-0.62, 7.7, -14.37, 0.65, 1.55);
  addWindow(0.62, 7.7, -14.37, 0.65, 1.55);

  // Torre derecha interior y balcon.
  addBox(13.0, 0, -15.5, 3.5, 5.9, 3.6, stone);
  addBattlements(13.0, -15.5, 3.5, 3.6, 5.9, trim);
  addPyramidRoof(13.0, 6.2, -15.5, 3.6, 3.8, 1.55, roofLight);
  addWindow(13.0, 1.4, -13.67, 0.58, 1.05);
  addWindow(12.35, 3.2, -13.67, 0.44, 0.85);
  addWindow(13.65, 3.2, -13.67, 0.44, 0.85);

  addBox(11.0, 3.0, -13.55, 3.8, 0.25, 0.55, trim);
  addBox(9.25, 2.0, -13.55, 0.18, 1.0, 0.18, trim);
  addBox(10.1, 2.0, -13.55, 0.18, 1.0, 0.18, trim);
  addBox(10.95, 2.0, -13.55, 0.18, 1.0, 0.18, trim);
  addBox(11.8, 2.0, -13.55, 0.18, 1.0, 0.18, trim);
  addBox(12.65, 2.0, -13.55, 0.18, 1.0, 0.18, trim);

  // Muros laterales del patio.
  addBox(-20.2, 0, 0, 0.55, 2.0, 29, stoneDark);
  addBox(20.2, 0, 0, 0.55, 2.0, 29, stoneDark);
  addBattlements(-20.2, 0, 0.65, 29, 2.0, trim);
  addBattlements(20.2, 0, 0.65, 29, 2.0, trim);

  // Props del patio medieval, ubicados en bordes para no tapar la batalla.
  addFountain(0, -10.2, 0.8);
  addBench(-6.0, 11.6, 0.12, 0.9);
  addBench(6.1, 11.3, -0.16, 0.9);

  addBarrel(-13.6, -12.7, 0.15, 0.9);
  addBarrel(-12.9, -12.7, 0.15, 0.9);
  addBarrel(13.7, -12.3, -0.2, 0.9);
  addBarrel(14.4, -12.3, -0.2, 0.9);
  addCrate(-1.2, -12.2, 0.8);
  addCrate(1.2, -12.3, 0.8);
  addCrate(15.2, 10.5, 0.75);
  addCrate(-15.6, 10.8, 0.75);
  addCannon(-11.4, 12.1, -0.35, 0.85);
}

buildCastleMap();

/* =========================
   CAMARA CON TECLADO
========================= */
const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

function updateFreeCamera(dt) {
  const speed = 12 * dt;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

  if (keys.KeyW) {
    camera.position.addScaledVector(forward, speed);
    controls.target.addScaledVector(forward, speed);
  }
  if (keys.KeyS) {
    camera.position.addScaledVector(forward, -speed);
    controls.target.addScaledVector(forward, -speed);
  }
  if (keys.KeyA) {
    camera.position.addScaledVector(right, -speed);
    controls.target.addScaledVector(right, -speed);
  }
  if (keys.KeyD) {
    camera.position.addScaledVector(right, speed);
    controls.target.addScaledVector(right, speed);
  }
  if (keys.KeyR) {
    camera.position.y += speed;
    controls.target.y += speed * 0.45;
  }
  if (keys.KeyF) {
    camera.position.y = Math.max(2, camera.position.y - speed);
    controls.target.y = Math.max(0, controls.target.y - speed * 0.45);
  }
}

/* =========================
   CREAR MODELOS DE UNIDADES
========================= */
function pivotedBox(width, height, depth, color) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), makeMat(color));
  mesh.position.y = -height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  pivot.add(mesh);
  return { pivot, mesh };
}

function buildWeapon(def) {
  const weapon = new THREE.Group();

  if (def.weapon === "club") {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.0, 6), makeMat(0x8d5524));
    handle.rotation.z = Math.PI / 2;
    handle.position.x = 0.43;
    weapon.add(handle);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), makeMat(0x868e96));
    head.position.x = 0.95;
    weapon.add(head);
  }

  if (def.weapon === "shield") {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.82, 0.08), makeMat(0xe9ecef));
    sword.rotation.z = Math.PI / 2;
    sword.position.set(0.56, -0.05, 0);
    weapon.add(sword);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), makeMat(0x8d5524));
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0.18, -0.05, 0);
    weapon.add(guard);
  }

  if (def.weapon === "spear") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 6), makeMat(0x8d5524));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.85;
    weapon.add(shaft);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 4), makeMat(0xd0d4da));
    tip.rotation.z = -Math.PI / 2;
    tip.position.x = 1.82;
    weapon.add(tip);
  }

  if (def.weapon === "bow") {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 16, Math.PI), makeMat(0x8d5524));
    bow.rotation.z = Math.PI / 2;
    bow.position.x = 0.42;
    weapon.add(bow);

    const string = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.72, 0.03), makeMat(0xf8f9fa));
    string.position.x = 0.42;
    weapon.add(string);
  }

  if (def.weapon === "sword") {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), makeMat(0xe9ecef));
    blade.rotation.z = Math.PI / 2;
    blade.position.x = 0.68;
    weapon.add(blade);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), makeMat(0xf08c00));
    guard.rotation.z = Math.PI / 2;
    guard.position.x = 0.22;
    weapon.add(guard);
  }

  if (def.weapon === "staff") {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.65, 6), makeMat(0x8d5524));
    staff.rotation.z = Math.PI / 2;
    staff.position.x = 0.72;
    weapon.add(staff);

    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.2, 0),
      makeMat(0xe599f7, 0xe599f7, 0.8)
    );
    orb.position.x = 1.55;
    weapon.add(orb);
  }



  if (def.weapon === "demonSword") {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.35, 0.1), makeMat(0xff6b6b, 0xff0000, 0.35));
    blade.rotation.z = Math.PI / 2;
    blade.position.x = 0.78;
    weapon.add(blade);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.1), makeMat(0x111111));
    guard.rotation.z = Math.PI / 2;
    guard.position.x = 0.2;
    weapon.add(guard);
  }

  if (def.weapon === "scythe") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.95, 6), makeMat(0x2b2d42));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.78;
    weapon.add(shaft);

    const blade = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.045, 8, 18, Math.PI * 1.2), makeMat(0xd0d4da));
    blade.rotation.set(0, 0, Math.PI * 0.22);
    blade.position.set(1.65, 0.18, 0);
    weapon.add(blade);
  }

  if (def.weapon === "divine") {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.45, 6), makeMat(0xffd43b, 0xffd43b, 0.35));
    staff.rotation.z = Math.PI / 2;
    staff.position.x = 0.7;
    weapon.add(staff);

    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.23, 0), makeMat(0xfff3bf, 0xfff3bf, 1.0));
    orb.position.x = 1.45;
    weapon.add(orb);
  }

  if (def.weapon === "daggers") {
    for (const z of [-0.12, 0.12]) {
      const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.055), makeMat(0xe9ecef));
      dagger.rotation.z = Math.PI / 2;
      dagger.position.set(0.55, 0, z);
      weapon.add(dagger);
    }
  }

  if (def.weapon === "katana") {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1.35, 0.055), makeMat(0xf8f9fa));
    blade.rotation.z = Math.PI / 2;
    blade.position.x = 0.75;
    weapon.add(blade);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.09), makeMat(0x111111));
    handle.rotation.z = Math.PI / 2;
    handle.position.x = 0.18;
    weapon.add(handle);
  }

  if (def.weapon === "axe") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.25, 6), makeMat(0x8d5524));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.62;
    weapon.add(shaft);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.1), makeMat(0xc0c4c8));
    head.position.x = 1.18;
    weapon.add(head);
  }

  if (def.weapon === "hammer") {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.15, 6), makeMat(0x8d5524));
    handle.rotation.z = Math.PI / 2;
    handle.position.x = 0.58;
    weapon.add(handle);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.32), makeMat(0xd0d4da));
    head.position.x = 1.16;
    weapon.add(head);
  }

  if (def.weapon === "cannon") {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.95, 12), makeMat(0x343a40));
    barrel.rotation.z = Math.PI / 2;
    barrel.position.x = 0.62;
    weapon.add(barrel);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 12), makeMat(0x111111));
    rim.rotation.y = Math.PI / 2;
    rim.position.x = 1.1;
    weapon.add(rim);
  }

  if (def.weapon === "claws") {
    for (const z of [-0.16, 0, 0.16]) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.55, 5), makeMat(0xe9ecef));
      claw.rotation.z = -Math.PI / 2;
      claw.position.set(0.45, -0.05, z);
      weapon.add(claw);
    }
  }

  if (def.weapon === "angelStaff") {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 6), makeMat(0xf8f9fa, 0xffffff, 0.2));
    staff.rotation.z = Math.PI / 2;
    staff.position.x = 0.7;
    weapon.add(staff);

    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), makeMat(0xfff3bf, 0xfff3bf, 0.85));
    star.position.x = 1.46;
    weapon.add(star);
  }

  weapon.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return weapon;
}

function createHealthBar() {
  const group = new THREE.Group();

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x400000, side: THREE.DoubleSide })
  );

  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.22, 0.09),
    new THREE.MeshBasicMaterial({ color: 0x51cf66, side: THREE.DoubleSide })
  );

  fill.position.z = 0.002;
  group.add(bg);
  group.add(fill);

  return { group, fill };
}

function createUnit(type, team, x, z) {
  const def = unitTypes[type];
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(def.scale);

  const bodyRoot = new THREE.Group();
  group.add(bodyRoot);

  const teamColor = team === "blue" ? 0x1971c2 : 0xe03131;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.13, 12), makeMat(teamColor));
  base.position.y = 0.06;
  bodyRoot.add(base);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.98, 0.48), makeMat(def.color));
  torso.position.y = 1.35;
  bodyRoot.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), makeMat(0xffd8a8));
  head.position.y = 2.1;
  bodyRoot.add(head);

  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.03), makeMat(0x111111));
  eyeL.position.set(-0.13, 2.14, 0.325);
  bodyRoot.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.03), makeMat(0x111111));
  eyeR.position.set(0.13, 2.14, 0.325);
  bodyRoot.add(eyeR);

  const leftArmData = pivotedBox(0.23, 0.8, 0.23, 0xffd8a8);
  leftArmData.pivot.position.set(-0.54, 1.74, 0);
  bodyRoot.add(leftArmData.pivot);

  const rightArmData = pivotedBox(0.23, 0.8, 0.23, 0xffd8a8);
  rightArmData.pivot.position.set(0.54, 1.74, 0);
  bodyRoot.add(rightArmData.pivot);

  const leftLegData = pivotedBox(0.26, 0.9, 0.26, def.pants);
  leftLegData.pivot.position.set(-0.2, 0.93, 0);
  bodyRoot.add(leftLegData.pivot);

  const rightLegData = pivotedBox(0.26, 0.9, 0.26, def.pants);
  rightLegData.pivot.position.set(0.2, 0.93, 0);
  bodyRoot.add(rightLegData.pivot);

  const weapon = buildWeapon(def);
  weapon.position.set(0.12, -0.24, 0);
  rightArmData.pivot.add(weapon);

  if (type === "shield") {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.09, 7), makeMat(0x4dabf7));
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.12, -0.15, 0.22);
    leftArmData.pivot.add(shield);
  }

  if (type === "knight") {
    const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.45, 6), makeMat(0xd0d4da));
    helmet.position.y = 2.5;
    bodyRoot.add(helmet);
  }

  if (type === "archer") {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.39, 0.5, 6), makeMat(0x2b8a3e));
    hood.position.y = 2.45;
    bodyRoot.add(hood);
  }

  if (type === "mage") {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.75, 6), makeMat(0xae3ec9));
    hat.position.y = 2.6;
    bodyRoot.add(hat);
  }


  if (type === "devil") {
    for (const x of [-0.22, 0.22]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 6), makeMat(0x111111));
      horn.position.set(x, 2.55, 0);
      bodyRoot.add(horn);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6), makeMat(0x7f1d1d));
    tail.rotation.x = Math.PI / 2.5;
    tail.position.set(0, 1.15, -0.45);
    bodyRoot.add(tail);
  }

  if (type === "death") {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.43, 0.62, 6), makeMat(0x111111));
    hood.position.y = 2.48;
    bodyRoot.add(hood);
  }

  if (type === "god") {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 24), makeMat(0xfff3bf, 0xfff3bf, 0.9));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 2.62;
    bodyRoot.add(halo);
  }

  if (type === "ninja") {
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.22, 0.66), makeMat(0x111111));
    mask.position.y = 2.17;
    bodyRoot.add(mask);
  }

  if (type === "samurai") {
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.35, 0.25, 8), makeMat(0x7f2704));
    helmet.position.y = 2.48;
    bodyRoot.add(helmet);
  }

  if (type === "berserker") {
    for (const x of [-0.24, 0.24]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), makeMat(0xf8f9fa));
      horn.position.set(x, 2.52, 0);
      bodyRoot.add(horn);
    }
  }

  if (type === "paladin") {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 8), makeMat(0xffd43b, 0xffd43b, 0.25));
    crown.position.y = 2.48;
    bodyRoot.add(crown);
  }

  if (type === "cannoneer") {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.72), makeMat(0x343a40));
    cap.position.y = 2.48;
    bodyRoot.add(cap);
  }

  if (type === "vampire") {
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.2, 0.08), makeMat(0x240046));
    cape.position.set(0, 1.35, -0.34);
    bodyRoot.add(cape);
  }

  if (type === "angel") {
    for (const x of [-0.52, 0.52]) {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.95, 6), makeMat(0xf8f9fa, 0xffffff, 0.18));
      wing.rotation.z = x < 0 ? -0.65 : 0.65;
      wing.position.set(x, 1.65, -0.42);
      bodyRoot.add(wing);
    }
  }

  const { group: hpBarGroup, fill: hpFill } = createHealthBar();
  hpBarGroup.position.set(0, 3.05, 0);
  group.add(hpBarGroup);

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  scene.add(group);

  return {
    group,
    team,
    type,
    def,
    hp: def.hp,
    maxHp: def.hp,
    dead: false,
    cooldown: 0.25 + Math.random() * 0.4,
    specialCooldown: 0,
    attackAnim: 0,
    attackTarget: null,
    currentAttackKind: null,
    hitDone: false,
    moving: false,
    moveCycle: Math.random() * Math.PI * 2,
    hurtFlash: 0,
    paralyzedTime: 0,
    paralysisDrainPerMillisecond: 0,
    paralysisEffectTimer: 0,
    bodyRoot,
    torso,
    head,
    leftArm: leftArmData.pivot,
    rightArm: rightArmData.pivot,
    leftLeg: leftLegData.pivot,
    rightLeg: rightLegData.pivot,
    hpBarGroup,
    hpFill
  };
}

/* =========================
   PROYECTILES Y EFECTOS
========================= */
function xzDistanceVec(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function xzDistanceUnit(a, b) {
  return xzDistanceVec(a.group.position, b.group.position);
}

function spawnHitEffect(position, color = 0xfff3bf, size = 0.22) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, 0),
    makeMat(color, color, 0.7)
  );
  mesh.position.copy(position);
  scene.add(mesh);

  effects.push({ mesh, life: 0.25, maxLife: 0.25 });
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.life -= dt;
    const t = Math.max(0, effect.life / effect.maxLife);
    effect.mesh.scale.setScalar(1 + (1 - t) * 2.5);
    effect.mesh.material.opacity = t;
    effect.mesh.material.transparent = true;

    if (effect.life <= 0) {
      scene.remove(effect.mesh);
      effects.splice(i, 1);
    }
  }
}

function spawnProjectile(unit, target) {
  const projectileType = unit.def.projectileType || (unit.type === "mage" ? "magic" : "arrow");
  const isOrb = ["magic", "cannonball", "light", "time"].includes(projectileType);
  const projectileColor = {
    arrow: 0xf8f9fa,
    magic: 0xe599f7,
    cannonball: 0x111111,
    light: 0xfff3bf,
    time: 0x74c0fc
  }[projectileType] || 0xf8f9fa;

  const geometry = projectileType === "arrow"
    ? new THREE.CylinderGeometry(0.035, 0.035, 0.72, 6)
    : new THREE.IcosahedronGeometry(projectileType === "cannonball" ? 0.24 : 0.18, 0);

  const mesh = new THREE.Mesh(
    geometry,
    makeMat(projectileColor, projectileColor, projectileType === "arrow" ? 0.18 : 0.85)
  );

  const from = new THREE.Vector3(
    unit.group.position.x,
    1.8 * unit.def.scale,
    unit.group.position.z
  );

  const to = new THREE.Vector3(
    target.group.position.x,
    1.25 * target.def.scale,
    target.group.position.z
  );

  const velocity = new THREE.Vector3().subVectors(to, from).normalize().multiplyScalar(unit.def.projectileSpeed || 14);

  mesh.position.copy(from);
  if (!isOrb) {
    mesh.rotation.z = Math.PI / 2;
  }
  mesh.castShadow = true;
  scene.add(mesh);

  projectiles.push({
    mesh,
    team: unit.team,
    damage: unit.def.rangedDamage ?? unit.def.damage,
    velocity,
    life: 2.6,
    splashRadius: unit.def.splashRadius || 0,
    projectileType,
    freezeDuration: unit.def.paralysisDuration || 0,
    drainPerMillisecond: unit.def.paralysisDrainPerMillisecond || 0,
    isOrb
  });
}

function removeProjectile(index) {
  const p = projectiles[index];
  if (!p) return;
  scene.remove(p.mesh);
  projectiles.splice(index, 1);
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    p.life -= dt;
    if (p.life <= 0) {
      removeProjectile(i);
      continue;
    }

    p.mesh.position.addScaledVector(p.velocity, dt);

    if (!p.isOrb) {
      const dir = p.velocity.clone().normalize();
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      p.mesh.quaternion.copy(quat);
    } else {
      p.mesh.rotation.x += dt * 8;
      p.mesh.rotation.y += dt * 7;
    }

    const enemies = units.filter(u => !u.dead && u.team !== p.team);
    let hitTarget = null;

    for (const enemy of enemies) {
      const dist = xzDistanceVec(p.mesh.position, enemy.group.position);
      const hitRadius = 0.75 * enemy.def.scale;

      if (dist <= hitRadius) {
        hitTarget = enemy;
        break;
      }
    }

    if (hitTarget) {
      const hitPos = hitTarget.group.position.clone();
      hitPos.y = 1.2 * hitTarget.def.scale;

      if (p.splashRadius > 0) {
        spawnHitEffect(hitPos, p.projectileType === "cannonball" ? 0xff922b : 0xe599f7, 0.34);
        for (const enemy of enemies) {
          const d = xzDistanceUnit(enemy, hitTarget);
          if (d <= p.splashRadius) {
            applyDamage(enemy, p.damage, p.team);
          }
        }
      } else {
        spawnHitEffect(hitPos, p.projectileType === "time" ? 0x74c0fc : 0xfff3bf, p.projectileType === "time" ? 0.32 : 0.22);
        applyDamage(hitTarget, p.damage, p.team);
      }

      if (p.freezeDuration > 0) {
        applyParalysis(hitTarget, p.freezeDuration, p.drainPerMillisecond);
      }

      removeProjectile(i);
    }
  }
}

/* =========================
   LOGICA DE BATALLA
========================= */
function findNearestEnemy(unit) {
  let nearest = null;
  let best = Infinity;

  for (const other of units) {
    if (other.dead || other.team === unit.team) continue;

    const d = xzDistanceUnit(unit, other);
    if (d < best) {
      best = d;
      nearest = other;
    }
  }

  return nearest;
}

function faceTarget(unit, target) {
  unit.group.lookAt(target.group.position.x, unit.group.position.y, target.group.position.z);
}

function moveToward(unit, target, dt) {
  const dir = new THREE.Vector3().subVectors(target.group.position, unit.group.position);
  dir.y = 0;

  if (dir.lengthSq() > 0.001) {
    dir.normalize();
    unit.group.position.addScaledVector(dir, unit.def.moveSpeed * dt);
    unit.moving = true;
  }
}

function moveAway(unit, target, dt) {
  const dir = new THREE.Vector3().subVectors(unit.group.position, target.group.position);
  dir.y = 0;

  if (dir.lengthSq() > 0.001) {
    dir.normalize();
    unit.group.position.addScaledVector(dir, unit.def.moveSpeed * dt);
    unit.moving = true;
  }
}

function startAttack(unit, target, attackKind = unit.def.kind) {
  unit.cooldown = unit.def.attackInterval;
  unit.attackAnim = unit.def.attackDuration;
  unit.attackTarget = target;
  unit.currentAttackKind = attackKind;
  unit.hitDone = false;

  if (attackKind === "ranged") {
    spawnProjectile(unit, target);
    unit.hitDone = true;
  }
}

function applyParalysis(target, seconds, drainPerMillisecond = 0) {
  if (!target || target.dead) return;

  target.paralyzedTime = Math.max(target.paralyzedTime || 0, seconds);
  target.paralysisDrainPerMillisecond = Math.max(target.paralysisDrainPerMillisecond || 0, drainPerMillisecond);
  target.moving = false;
  target.attackAnim = 0;
  target.cooldown = Math.max(target.cooldown, 0.3);

  const pos = target.group.position.clone();
  pos.y = 1.8 * target.def.scale;
  spawnHitEffect(pos, 0x74c0fc, 0.38);
}

function updateParalysis(unit, dt) {
  if (!unit.paralyzedTime || unit.paralyzedTime <= 0) return false;

  unit.paralyzedTime -= dt;
  unit.moving = false;
  unit.attackAnim = 0;

  const drain = (unit.paralysisDrainPerMillisecond || 0) * 1000 * dt;
  if (drain > 0) {
    unit.hp -= drain;
    unit.hurtFlash = 0.08;
  }

  unit.paralysisEffectTimer -= dt;
  if (unit.paralysisEffectTimer <= 0) {
    const pos = unit.group.position.clone();
    pos.y = 1.65 * unit.def.scale;
    spawnHitEffect(pos, 0x74c0fc, 0.16);
    unit.paralysisEffectTimer = 0.18;
  }

  if (unit.hp <= 0) {
    unit.hp = 0;
    unit.dead = true;
    unit.cooldown = 999;
    unit.paralyzedTime = 0;
  }

  if (unit.paralyzedTime <= 0) {
    unit.paralyzedTime = 0;
    unit.paralysisDrainPerMillisecond = 0;
  }

  return true;
}

function teleportNearTarget(unit, target) {
  if (!unit.def.teleport || unit.specialCooldown > 0) return false;

  const dist = xzDistanceUnit(unit, target);
  if (dist < unit.def.range + 1.2 || dist > unit.def.teleportRange) return false;

  const oldPos = unit.group.position.clone();
  oldPos.y = 1.1 * unit.def.scale;

  const dir = new THREE.Vector3().subVectors(unit.group.position, target.group.position);
  dir.y = 0;
  if (dir.lengthSq() < 0.001) dir.set(unit.team === "blue" ? -1 : 1, 0, 0);
  dir.normalize();

  unit.group.position.copy(target.group.position).addScaledVector(dir, unit.def.teleportDistance || 1.35);
  unit.group.position.y = 0;
  clampUnit(unit);
  faceTarget(unit, target);
  unit.specialCooldown = unit.def.teleportCooldown || 3;

  const newPos = unit.group.position.clone();
  newPos.y = 1.1 * unit.def.scale;
  spawnHitEffect(oldPos, 0xff6b6b, 0.42);
  spawnHitEffect(newPos, 0xff6b6b, 0.42);
  return true;
}

function pushEnemiesFrom(sourceUnit, centerTarget, power = 1.8, radius = 2.8) {
  const enemies = units.filter(u => !u.dead && u.team !== sourceUnit.team);

  for (const enemy of enemies) {
    const d = xzDistanceUnit(enemy, centerTarget);
    if (d > radius) continue;

    const dir = new THREE.Vector3().subVectors(enemy.group.position, sourceUnit.group.position);
    dir.y = 0;
    if (dir.lengthSq() < 0.001) dir.set(sourceUnit.team === "blue" ? 1 : -1, 0, 0);
    dir.normalize();

    const strength = power * Math.max(0.25, 1 - d / radius);
    enemy.group.position.addScaledVector(dir, strength);
    enemy.hurtFlash = 0.18;
    clampUnit(enemy);

    const pos = enemy.group.position.clone();
    pos.y = 1.2 * enemy.def.scale;
    spawnHitEffect(pos, 0xd0d4da, 0.22);
  }
}

function healUnit(unit, amount) {
  if (!unit || unit.dead || amount <= 0) return;
  unit.hp = Math.min(unit.maxHp, unit.hp + amount);

  const pos = unit.group.position.clone();
  pos.y = 1.35 * unit.def.scale;
  spawnHitEffect(pos, 0x51cf66, 0.13);
}

function applyDamage(target, damage, attackerTeam) {
  if (target.dead) return;

  target.hp -= damage;
  target.hurtFlash = 0.15;

  const push = attackerTeam === "blue" ? 0.16 : -0.16;
  target.group.position.x += push;

  const effectPos = target.group.position.clone();
  effectPos.y = 1.2 * target.def.scale;
  spawnHitEffect(effectPos, damage <= 0 ? 0x74c0fc : 0xffd43b, damage <= 0 ? 0.12 : 0.18);

  if (target.hp <= 0) {
    target.hp = 0;
    target.dead = true;
    target.attackAnim = 0;
    target.cooldown = 999;
    target.paralyzedTime = 0;
  }
}

function clampUnit(unit) {
  unit.group.position.x = THREE.MathUtils.clamp(unit.group.position.x, FIELD.minX, FIELD.maxX);
  unit.group.position.z = THREE.MathUtils.clamp(unit.group.position.z, FIELD.minZ, FIELD.maxZ);
}

function separateUnits() {
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const a = units[i];
      const b = units[j];

      if (a.dead || b.dead) continue;

      const dx = b.group.position.x - a.group.position.x;
      const dz = b.group.position.z - a.group.position.z;
      const dist = Math.hypot(dx, dz);
      const minDist = 0.75 * a.def.scale + 0.75 * b.def.scale;

      if (dist > 0.001 && dist < minDist) {
        const overlap = (minDist - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;

        a.group.position.x -= nx * overlap;
        a.group.position.z -= nz * overlap;
        b.group.position.x += nx * overlap;
        b.group.position.z += nz * overlap;
      }
    }
  }
}

function updateHealthBar(unit) {
  const ratio = Math.max(0, unit.hp / unit.maxHp);
  unit.hpFill.scale.x = ratio;
  unit.hpFill.position.x = -(1.22 * (1 - ratio)) / 2;
  unit.hpBarGroup.visible = !unit.dead;
  unit.hpBarGroup.lookAt(camera.position);
}

function updateBattle(dt) {
  for (const unit of units) {
    updateHealthBar(unit);
  }

  if (!battleStarted) return;

  for (const unit of units) {
    if (unit.dead) continue;

    unit.moving = false;
    unit.cooldown -= dt;
    unit.specialCooldown = Math.max(0, (unit.specialCooldown || 0) - dt);
    if (unit.hurtFlash > 0) unit.hurtFlash -= dt;

    if (updateParalysis(unit, dt)) {
      clampUnit(unit);
      continue;
    }

    const target = findNearestEnemy(unit);
    if (!target) continue;

    faceTarget(unit, target);
    const dist = xzDistanceUnit(unit, target);

    if (unit.def.kind === "melee") {
      if (unit.def.teleport && teleportNearTarget(unit, target)) {
        startAttack(unit, target, "melee");
      } else if (dist > unit.def.range) {
        moveToward(unit, target, dt);
      } else if (unit.cooldown <= 0) {
        startAttack(unit, target, "melee");
      }
    }

    if (unit.def.kind === "ranged") {
      const retreatDistance = unit.def.retreatDistance || 4;
      const preferredRange = unit.def.preferredRange || unit.def.range * 0.85;

      if (dist < retreatDistance) {
        moveAway(unit, target, dt);
      } else if (dist > preferredRange) {
        moveToward(unit, target, dt);
      } else if (dist <= unit.def.range && unit.cooldown <= 0) {
        startAttack(unit, target, "ranged");
      }
    }

    if (unit.def.kind === "hybrid") {
      const meleeRange = unit.def.meleeRange || 1.6;
      const retreatDistance = unit.def.retreatDistance || 3;
      const preferredRange = unit.def.preferredRange || unit.def.range * 0.75;

      if (dist <= meleeRange && unit.cooldown <= 0) {
        startAttack(unit, target, "melee");
      } else if (dist <= unit.def.range && unit.cooldown <= 0) {
        startAttack(unit, target, "ranged");
      } else if (dist > preferredRange) {
        moveToward(unit, target, dt);
      } else if (dist < retreatDistance) {
        moveAway(unit, target, dt);
      }
    }

    if (unit.attackAnim > 0 && unit.currentAttackKind === "melee" && !unit.hitDone && unit.attackTarget && !unit.attackTarget.dead) {
      const progress = 1 - unit.attackAnim / unit.def.attackDuration;
      const hitRange = (unit.def.meleeRange || unit.def.range) + 0.85;
      const targetStillClose = xzDistanceUnit(unit, unit.attackTarget) <= hitRange;

      if (progress >= 0.48 && targetStillClose) {
        const hitDamage = unit.def.meleeDamage ?? unit.def.damage;
        applyDamage(unit.attackTarget, hitDamage, unit.team);

        if (unit.def.pushPower) {
          pushEnemiesFrom(unit, unit.attackTarget, unit.def.pushPower, unit.def.pushRadius || 2.8);
        }

        if (unit.def.lifeSteal) {
          healUnit(unit, hitDamage * unit.def.lifeSteal);
        }

        unit.hitDone = true;
      }
    }

    clampUnit(unit);
  }

  separateUnits();
  checkWinner();
  updateUI();
}

/* =========================
   ANIMACIONES DE CORRER Y ATACAR
========================= */
function animateUnit(unit, dt) {
  if (unit.dead) {
    unit.group.rotation.z = THREE.MathUtils.lerp(unit.group.rotation.z, unit.team === "blue" ? -1.25 : 1.25, dt * 5);
    unit.bodyRoot.position.y = THREE.MathUtils.lerp(unit.bodyRoot.position.y, -0.2, dt * 4);
    return;
  }

  if (unit.paralyzedTime > 0) {
    unit.bodyRoot.rotation.z = Math.sin(unit.moveCycle * 8) * 0.02;
    unit.leftLeg.rotation.x = 0;
    unit.rightLeg.rotation.x = 0;
    unit.leftArm.rotation.x = -0.4;
    unit.rightArm.rotation.x = -0.4;
  }

  unit.moveCycle += dt * (unit.moving ? 7.8 : 2.1);
  const runPower = unit.moving ? 1 : 0.12;
  const swingA = Math.sin(unit.moveCycle) * runPower;
  const swingB = Math.sin(unit.moveCycle + Math.PI) * runPower;
  const bounce = Math.abs(Math.sin(unit.moveCycle * 2)) * (unit.moving ? 0.07 : 0.015);

  unit.bodyRoot.position.y = bounce;
  unit.bodyRoot.rotation.z = Math.sin(unit.moveCycle) * (unit.moving ? 0.055 : 0.015);

  unit.leftLeg.rotation.x = swingA * 0.82;
  unit.rightLeg.rotation.x = swingB * 0.82;
  unit.leftArm.rotation.x = swingB * 0.58;
  unit.rightArm.rotation.x = swingA * 0.58;

  if (unit.attackAnim > 0) {
    unit.attackAnim -= dt;
    if (unit.attackAnim < 0) unit.attackAnim = 0;

    const progress = 1 - unit.attackAnim / unit.def.attackDuration;
    const strike = Math.sin(progress * Math.PI);

    const animIsMelee = unit.currentAttackKind === "melee" || (unit.def.kind === "melee" && unit.currentAttackKind !== "ranged");

    if (animIsMelee) {
      unit.rightArm.rotation.x = -1.45 + strike * 2.25;
      unit.leftArm.rotation.x *= 0.25;
      unit.bodyRoot.rotation.y = strike * (unit.team === "blue" ? 0.28 : -0.28);
    } else {
      unit.rightArm.rotation.x = -0.95 + strike * 0.45;
      unit.leftArm.rotation.x = -0.75 + strike * 0.3;
      unit.bodyRoot.rotation.y = strike * (unit.team === "blue" ? -0.18 : 0.18);
    }
  } else {
    unit.bodyRoot.rotation.y = THREE.MathUtils.lerp(unit.bodyRoot.rotation.y, 0, dt * 8);
  }

  if (unit.paralyzedTime > 0) {
    unit.head.scale.setScalar(0.96);
    unit.torso.scale.setScalar(0.96);
  } else if (unit.hurtFlash > 0) {
    unit.head.scale.setScalar(1.08);
    unit.torso.scale.setScalar(1.05);
  } else {
    unit.head.scale.setScalar(1);
    unit.torso.scale.setScalar(1);
  }
}

/* =========================
   COLOCACION DE TROPAS
========================= */
function setStatus(text) {
  statusText.textContent = text;
}

function selectUnit(type) {
  selectedUnitType = type;
  unitButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.unit === type));

  const def = unitTypes[type];

  if (currentGameMode === "free") {
    const teamText = freePlacementTeam === "blue" ? "aliados azules" : "enemigos rojos";
    setStatus(`Modo libre: seleccionaste ${def.name}. Ahora colócalo como ${teamText}.`);
    return;
  }

  if (currentGameMode === "multiplayer") {
    const teamText = multiplayerPlacementTeam === "blue" ? "tu equipo azul" : `el equipo rojo de ${multiplayerOpponentName || "invitado"}`;
    setStatus(`Multijugador: seleccionaste ${def.name}. Ahora colócalo en ${teamText}.`);
    return;
  }

  setStatus(`Seleccionaste ${def.name}. Haz clic en la zona azul para colocarlo.`);
}

function setFreePlacementTeam(team) {
  freePlacementTeam = team;
  placeBlueButton.classList.toggle("active", team === "blue");
  placeRedButton.classList.toggle("active", team === "red");

  const teamText = team === "blue" ? "aliados azules" : "enemigos rojos";
  if (freeTeamText) {
    freeTeamText.textContent = `Colocando: ${team === "blue" ? "Azules" : "Enemigos rojos"}`;
  }
  setStatus(`Modo libre: ahora estás colocando ${teamText}. Elige un luchador y haz clic en su zona.`);
}

function setMultiplayerPlacementTeam(team) {
  multiplayerPlacementTeam = team;
  if (multiPlaceBlueButton) multiPlaceBlueButton.classList.toggle("active", team === "blue");
  if (multiPlaceRedButton) multiPlaceRedButton.classList.toggle("active", team === "red");

  const teamText = team === "blue" ? "Azul" : "Rojo invitado";
  const budget = team === "blue" ? multiplayerBlueMoney : multiplayerRedMoney;
  if (multiTeamText) {
    multiTeamText.textContent = `Colocando: ${teamText} | Dinero $${budget}`;
  }
  updateUI();
  setStatus(`Multijugador: turno ${teamText}. Elige luchadores y colócalos en su zona. Cada jugador empezó con $${MULTIPLAYER_BUDGET}.`);
}

function canPlaceAt(x, z, team = "blue") {
  if (x < FIELD.minX + 1 || x > FIELD.maxX - 1 || z < FIELD.minZ + 1 || z > FIELD.maxZ - 1) {
    return false;
  }

  if (currentGameMode === "free" || currentGameMode === "multiplayer") {
    if (team === "blue" && x > FIELD.blueMaxX) return false;
    if (team === "red" && x < FIELD.redMinX) return false;
  } else {
    if (x > FIELD.blueMaxX) return false;
  }

  for (const unit of units) {
    if (unit.dead) continue;
    const d = Math.hypot(unit.group.position.x - x, unit.group.position.z - z);
    if (d < 1.45) return false;
  }

  return true;
}

function placeUnitAt(x, z) {
  if (battleStarted) return;

  if (!selectedUnitType) {
    setStatus("Primero elige una unidad de la barra.");
    return;
  }

  const def = unitTypes[selectedUnitType];
  const isFree = currentGameMode === "free";
  const isMultiplayer = currentGameMode === "multiplayer";
  const team = isFree ? freePlacementTeam : (isMultiplayer ? multiplayerPlacementTeam : "blue");

  if (!isFree && !isMultiplayer && money < def.cost) {
    setStatus("No tienes dinero suficiente para esa unidad.");
    return;
  }

  if (isMultiplayer) {
    const teamMoney = team === "blue" ? multiplayerBlueMoney : multiplayerRedMoney;
    if (teamMoney < def.cost) {
      setStatus(`${team === "blue" ? "Azul" : "Rojo"} no tiene dinero suficiente para ${def.name}.`);
      return;
    }
  }

  if (!canPlaceAt(x, z, team)) {
    if ((isFree || isMultiplayer) && team === "red") {
      setStatus("Coloca los enemigos rojos en la zona roja y deja espacio.");
    } else if ((isFree || isMultiplayer) && team === "blue") {
      setStatus("Coloca los aliados azules en la zona azul y deja espacio.");
    } else {
      setStatus("Coloca la unidad dentro de la zona azul y deja espacio.");
    }
    return;
  }

  if (isMultiplayer) {
    if (team === "blue") {
      multiplayerBlueMoney -= def.cost;
    } else {
      multiplayerRedMoney -= def.cost;
    }
  } else if (!isFree) {
    money -= def.cost;
  }

  const unit = createUnit(selectedUnitType, team, x, z);
  units.push(unit);
  updateUI();

  if (isMultiplayer) {
    const teamText = team === "blue" ? "azul" : `rojo de ${multiplayerOpponentName || "invitado"}`;
    const remaining = team === "blue" ? multiplayerBlueMoney : multiplayerRedMoney;
    setStatus(`${def.name} colocado en el equipo ${teamText}. Dinero restante: $${remaining}.`);
  } else if (isFree) {
    const teamText = team === "blue" ? "aliado azul" : "enemigo rojo";
    setStatus(`${def.name} colocado como ${teamText}. Puedes elegir otro luchador o iniciar la batalla.`);
  } else {
    setStatus(`${def.name} colocado. Puedes colocar mas tropas o iniciar la batalla.`);
  }
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (gameScreen.classList.contains("hidden")) return;
  if (battleStarted) return;
  if (event.button !== 0) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(placementPlane);

  if (hits.length > 0) {
    const p = hits[0].point;
    placeUnitAt(p.x, p.z);
  }
});

/* =========================
   GANAR / PERDER
========================= */
function checkWinner() {
  const blueAlive = units.some(u => !u.dead && u.team === "blue");
  const redAlive = units.some(u => !u.dead && u.team === "red");

  if (!blueAlive && battleStarted) {
    battleStarted = false;
    battleWon = false;
    nextLevelButton.disabled = true;

    if (currentGameMode === "multiplayer") {
      setStatus(`Multijugador: ganó ${multiplayerOpponentName || "el jugador rojo"}. El invitado era el equipo rojo.`);
    } else if (currentGameMode === "free") {
      setStatus("Modo libre: ganaron los enemigos rojos. Puedes reiniciar y probar otra pelea.");
    } else {
      setStatus("Perdiste. Reinicia la batalla y prueba otra formacion.");
    }
  }

  if (!redAlive && battleStarted) {
    battleStarted = false;
    battleWon = true;

    if (currentGameMode === "multiplayer") {
      nextLevelButton.disabled = true;
      const blueName = playerAccount?.nickname || "Jugador azul";
      setStatus(`Multijugador: ganó ${blueName}. El equipo rojo de ${multiplayerOpponentName || "invitado"} perdió.`);
      return;
    }

    if (currentGameMode === "free") {
      nextLevelButton.disabled = true;
      setStatus("Modo libre: ganaron los aliados azules. Puedes reiniciar y crear otra batalla.");
      return;
    }

    const reward = levels[currentLevel - 1].reward;
    money += reward;
    trophies += 10;

    if (currentLevel < levels.length) {
      nextLevelButton.disabled = false;
      setStatus(`Ganaste el nivel ${currentLevel}. Recompensa: $${reward}.`);
    } else {
      nextLevelButton.disabled = true;
      setStatus(`¡Ganaste el nivel final! Completaste los 10 niveles.`);
    }
  }
}


/* =========================
   CUENTA DEL JUGADOR
========================= */
function cleanNickname(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 16);
}

function loadAccount() {
  try {
    const saved = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!saved) return null;

    const account = JSON.parse(saved);
    const nickname = cleanNickname(account.nickname);
    const age = Number(account.age);

    if (nickname.length < 3 || !Number.isInteger(age) || age < 1 || age > 120) {
      return null;
    }

    return {
      nickname,
      age,
      createdAt: account.createdAt || new Date().toISOString()
    };
  } catch (error) {
    return null;
  }
}

function saveAccount(account) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

function getDefaultMultiplayerPlayers() {
  return [
    { nickname: "AgustinPro", age: 12 },
    { nickname: "Frank24z", age: 16 },
    { nickname: "LunaGamer", age: 14 },
    { nickname: "MaxPower", age: 15 },
    { nickname: "NinjaRojo", age: 13 },
    { nickname: "DiosAzul", age: 18 },
    { nickname: "MuerteX", age: 17 },
    { nickname: "Diablo777", age: 16 }
  ];
}

function loadMultiplayerPlayers() {
  try {
    const saved = localStorage.getItem(MULTIPLAYER_PLAYERS_KEY);
    const savedPlayers = saved ? JSON.parse(saved) : [];
    const allPlayers = [...getDefaultMultiplayerPlayers(), ...(Array.isArray(savedPlayers) ? savedPlayers : [])];
    const unique = [];
    const seen = new Set();

    for (const player of allPlayers) {
      const nickname = cleanNickname(player.nickname);
      if (nickname.length < 3) continue;
      const key = nickname.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push({ nickname, age: Number(player.age) || 0 });
    }

    return unique;
  } catch (error) {
    return getDefaultMultiplayerPlayers();
  }
}

function saveMultiplayerPlayers(players) {
  localStorage.setItem(MULTIPLAYER_PLAYERS_KEY, JSON.stringify(players));
}

function registerCurrentPlayerInDirectory() {
  if (!playerAccount) return;

  const players = loadMultiplayerPlayers();
  const nickname = cleanNickname(playerAccount.nickname);
  const exists = players.some(player => player.nickname.toLowerCase() === nickname.toLowerCase());

  if (!exists) {
    players.push({ nickname, age: playerAccount.age });
    saveMultiplayerPlayers(players);
  }
}

function applyAccountToUI() {
  const nickname = playerAccount?.nickname || "AGUSTIN";
  profileName.textContent = nickname.toUpperCase();
  profileAvatar.textContent = nickname.charAt(0).toUpperCase();
}

function showAccountScreen() {
  accountScreen.classList.remove("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
}

function startApp() {
  playerAccount = loadAccount();

  if (playerAccount) {
    registerCurrentPlayerInDirectory();
    applyAccountToUI();
    showLobby("Lobby listo. Presiona JUGAR para preparar tu ejercito.");
  } else {
    showAccountScreen();
  }
}

/* =========================
   RESET Y NIVELES
========================= */
function clearBattlefield() {
  while (projectiles.length) {
    const p = projectiles.pop();
    scene.remove(p.mesh);
  }

  while (effects.length) {
    const e = effects.pop();
    scene.remove(e.mesh);
  }

  while (units.length) {
    const unit = units.pop();
    scene.remove(unit.group);
  }
}

function spawnEnemiesForLevel() {
  const level = levels[currentLevel - 1];

  for (const enemy of level.enemies) {
    units.push(createUnit(enemy.type, "red", enemy.x, enemy.z));
  }
}

function updateModePanel() {
  const isFree = currentGameMode === "free";
  const isMultiplayer = currentGameMode === "multiplayer";

  freeModeToolbar.classList.toggle("hidden", !isFree);
  multiplayerToolbar.classList.toggle("hidden", !isMultiplayer);

  if (multiplayerBudgetPill) multiplayerBudgetPill.classList.toggle("hidden", !isMultiplayer);
  if (multiplayerOpponentPill) multiplayerOpponentPill.classList.toggle("hidden", !isMultiplayer);

  nextLevelButton.style.display = (isFree || isMultiplayer) ? "none" : "";

  if (isFree) {
    startBattleButton.textContent = "Iniciar batalla libre";
    resetBattleButton.textContent = "Limpiar modo libre";
  } else if (isMultiplayer) {
    startBattleButton.textContent = "Iniciar duelo multijugador";
    resetBattleButton.textContent = "Reiniciar duelo";
  } else {
    startBattleButton.textContent = "Iniciar batalla";
    resetBattleButton.textContent = "Reiniciar batalla";
  }

  placeBlueButton.classList.toggle("active", freePlacementTeam === "blue");
  placeRedButton.classList.toggle("active", freePlacementTeam === "red");

  if (freeTeamText) {
    freeTeamText.textContent = `Colocando: ${freePlacementTeam === "blue" ? "Azules" : "Enemigos rojos"}`;
  }

  if (multiPlaceBlueButton) multiPlaceBlueButton.classList.toggle("active", multiplayerPlacementTeam === "blue");
  if (multiPlaceRedButton) multiPlaceRedButton.classList.toggle("active", multiplayerPlacementTeam === "red");

  if (multiTeamText) {
    const teamName = multiplayerPlacementTeam === "blue" ? "Azul" : "Rojo invitado";
    const budget = multiplayerPlacementTeam === "blue" ? multiplayerBlueMoney : multiplayerRedMoney;
    multiTeamText.textContent = `Colocando: ${teamName} | Dinero $${budget}`;
  }

  if (opponentNameText) {
    opponentNameText.textContent = multiplayerOpponentName || "Invitado";
  }
}


function addRandomEnemies() {
  if (currentGameMode !== "free") return;

  if (battleStarted) {
    setStatus("No puedes agregar enemigos mientras la batalla esta iniciada.");
    return;
  }

  const enemyTypes = Object.keys(unitTypes);
  const enemyPositions = [
    { x: 7, z: -5 },
    { x: 8.5, z: -2 },
    { x: 8, z: 2 },
    { x: 10, z: 5 },
    { x: 11.5, z: -6 },
    { x: 12, z: 0 }
  ];

  for (const pos of enemyPositions) {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    if (canPlaceAt(pos.x, pos.z, "red")) {
      units.push(createUnit(type, "red", pos.x, pos.z));
    }
  }

  updateUI();
  setStatus("Enemigos aleatorios colocados. También puedes elegir enemigos manualmente con el botón rojo.");
}


function openMultiplayerPanel() {
  if (!playerAccount) {
    showAccountScreen();
    return;
  }

  registerCurrentPlayerInDirectory();
  multiplayerPanel.classList.remove("hidden");
  inviteBox.classList.add("hidden");
  pendingInviteName = "";
  playerSearchInput.value = "";
  playerSearchResults.textContent = "Escribe un nickname para buscar jugadores.";
  lobbyMessage.textContent = "Multijugador: busca un jugador, envía invitación y empieza un duelo con $2000 cada uno.";
}

function closeMultiplayerPanelAction() {
  multiplayerPanel.classList.add("hidden");
  inviteBox.classList.add("hidden");
  pendingInviteName = "";
}

function renderPlayerResult(nickname, subtitle = "Jugador disponible") {
  const row = document.createElement("div");
  row.className = "player-result";

  const info = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = nickname;
  const small = document.createElement("div");
  small.textContent = subtitle;
  info.appendChild(strong);
  info.appendChild(small);

  const button = document.createElement("button");
  button.className = "primary-btn";
  button.textContent = "Invitar";
  button.addEventListener("click", () => sendMultiplayerInvite(nickname));

  row.appendChild(info);
  row.appendChild(button);
  return row;
}

function searchMultiplayerPlayer() {
  const query = cleanNickname(playerSearchInput.value);
  playerSearchResults.innerHTML = "";
  inviteBox.classList.add("hidden");

  if (query.length < 3) {
    playerSearchResults.textContent = "Escribe al menos 3 letras para buscar.";
    return;
  }

  const ownName = (playerAccount?.nickname || "").toLowerCase();

  if (query.toLowerCase() === ownName) {
    playerSearchResults.textContent = "No puedes invitarte a ti mismo. Busca otro nickname.";
    return;
  }

  const players = loadMultiplayerPlayers()
    .filter(player => player.nickname.toLowerCase() !== ownName)
    .filter(player => player.nickname.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  if (players.length === 0) {
    const note = document.createElement("p");
    note.textContent = "No encontré ese nickname en la lista, pero puedes invitarlo igual para probar el modo multijugador local.";
    playerSearchResults.appendChild(note);
    playerSearchResults.appendChild(renderPlayerResult(query, "Nuevo jugador invitado"));
    return;
  }

  for (const player of players) {
    playerSearchResults.appendChild(renderPlayerResult(player.nickname, `Edad ${player.age || "?"} · disponible`));
  }
}

function sendMultiplayerInvite(nickname) {
  pendingInviteName = cleanNickname(nickname);

  if (!pendingInviteName || pendingInviteName.length < 3) {
    inviteBox.classList.add("hidden");
    return;
  }

  inviteBox.classList.remove("hidden");
  inviteText.textContent = `Le enviaste una invitación a ${pendingInviteName}. Si acepta, ${pendingInviteName} será el equipo rojo y tú serás azul.`;
  lobbyMessage.textContent = `Invitación enviada a ${pendingInviteName}. Esperando que acepte...`;
}

function acceptMultiplayerInvite() {
  if (!pendingInviteName) return;

  multiplayerOpponentName = pendingInviteName;
  closeMultiplayerPanelAction();
  showGame("multiplayer");
}

function rejectMultiplayerInvite() {
  if (!pendingInviteName) return;

  const rejectedName = pendingInviteName;
  pendingInviteName = "";
  inviteBox.classList.add("hidden");
  lobbyMessage.textContent = `${rejectedName} rechazó la invitación. Puedes buscar otro jugador.`;
}

function resetBattle() {
  clearBattlefield();
  battleStarted = false;
  battleWon = false;
  selectedUnitType = null;
  nextLevelButton.disabled = true;

  unitButtons.forEach(btn => btn.classList.remove("selected"));

  if (currentGameMode === "free") {
    money = 999999;
    freePlacementTeam = "blue";
    updateModePanel();
    updateUI();
    setStatus("Modo libre: elige cualquier luchador, pon aliados azules y enemigos rojos, luego inicia la batalla.");
    return;
  }

  if (currentGameMode === "multiplayer") {
    multiplayerBlueMoney = MULTIPLAYER_BUDGET;
    multiplayerRedMoney = MULTIPLAYER_BUDGET;
    multiplayerPlacementTeam = "blue";
    money = MULTIPLAYER_BUDGET;
    updateModePanel();
    updateUI();
    setStatus(`Multijugador listo: tú eres azul y ${multiplayerOpponentName || "el invitado"} es rojo. Cada uno tiene $${MULTIPLAYER_BUDGET}.`);
    return;
  }

  updateModePanel();
  money = levels[currentLevel - 1].budget;
  spawnEnemiesForLevel();
  updateUI();
  setStatus("Elige una unidad y colocala en la zona azul.");
}

function startBattle() {
  const blueCount = units.filter(u => !u.dead && u.team === "blue").length;
  const redCount = units.filter(u => !u.dead && u.team === "red").length;

  if (blueCount === 0) {
    setStatus("Primero coloca al menos una unidad azul.");
    return;
  }

  if (redCount === 0) {
    if (currentGameMode === "free") {
      setStatus("En modo libre también debes poner enemigos rojos para poder pelear.");
    } else if (currentGameMode === "multiplayer") {
      setStatus(`Falta que ${multiplayerOpponentName || "el invitado"} coloque al menos un luchador rojo.`);
    } else {
      setStatus("No hay enemigos rojos en el mapa.");
    }
    return;
  }

  battleStarted = true;
  battleWon = false;
  selectedUnitType = null;
  unitButtons.forEach(btn => btn.classList.remove("selected"));

  if (currentGameMode === "free") {
    setStatus("¡Batalla libre iniciada! Tus aliados y enemigos elegidos ya se están atacando.");
  } else if (currentGameMode === "multiplayer") {
    setStatus(`¡Duelo multijugador iniciado! Azul vs rojo de ${multiplayerOpponentName || "invitado"}.`);
  } else {
    setStatus("¡Batalla iniciada! Ahora si se atacan: melee golpea y distancia dispara.");
  }
}

function nextLevel() {
  if (currentGameMode === "free" || currentGameMode === "multiplayer") return;
  if (!battleWon) return;
  if (currentLevel >= levels.length) return;

  currentLevel++;
  resetBattle();
}

function resetProgress() {
  currentLevel = 1;
  trophies = 0;
  money = levels[0].budget;
  updateUI();
  lobbyMessage.textContent = "Progreso reiniciado.";
}

/* =========================
   UI Y PANTALLAS
========================= */
function updateUI() {
  const blueAlive = units.filter(u => !u.dead && u.team === "blue").length;
  const redAlive = units.filter(u => !u.dead && u.team === "red").length;
  const isFree = currentGameMode === "free";
  const isMultiplayer = currentGameMode === "multiplayer";

  if (isMultiplayer) {
    modeText.textContent = "Multijugador";
    moneyText.textContent = multiplayerPlacementTeam === "blue" ? multiplayerBlueMoney : multiplayerRedMoney;
    levelText.textContent = "VS";
    if (levelSuffix) levelSuffix.textContent = "";
    if (blueMoneyText) blueMoneyText.textContent = multiplayerBlueMoney;
    if (redMoneyText) redMoneyText.textContent = multiplayerRedMoney;
    if (opponentNameText) opponentNameText.textContent = multiplayerOpponentName || "Invitado";
  } else {
    modeText.textContent = isFree ? "Libre" : "Campaña";
    moneyText.textContent = isFree ? "∞" : money;
    levelText.textContent = isFree ? "Libre" : currentLevel;
    if (levelSuffix) levelSuffix.textContent = isFree ? "" : "/10";
  }

  if (blueCountText) blueCountText.textContent = blueAlive;
  redCountText.textContent = redAlive;

  lobbyCoins.textContent = money;
  lobbyLevel.textContent = currentLevel;
  lobbyTrophies.textContent = trophies;
  updateModePanel();
}

function showLobby(message = "Volviste al lobby. Los niveles se reiniciaron.") {
  battleStarted = false;
  battleWon = false;
  selectedUnitType = null;
  currentGameMode = "campaign";
  freePlacementTeam = "blue";
  multiplayerPlacementTeam = "blue";
  multiplayerOpponentName = "";
  pendingInviteName = "";
  multiplayerBlueMoney = MULTIPLAYER_BUDGET;
  multiplayerRedMoney = MULTIPLAYER_BUDGET;
  currentLevel = 1;
  trophies = 0;
  money = levels[0].budget;
  nextLevelButton.disabled = true;
  unitButtons.forEach(btn => btn.classList.remove("selected"));
  updateModePanel();

  if (multiplayerPanel) multiplayerPanel.classList.add("hidden");
  if (inviteBox) inviteBox.classList.add("hidden");

  accountScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  applyAccountToUI();
  updateUI();
  lobbyMessage.textContent = message;
}

function showGame(mode = "campaign") {
  currentGameMode = mode;
  freePlacementTeam = "blue";
  multiplayerPlacementTeam = "blue";

  if (currentGameMode !== "multiplayer") {
    multiplayerOpponentName = "";
  }

  accountScreen.classList.add("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resizeRenderer();
  updateModePanel();
  resetBattle();
}

function simpleLobbyMessage(text) {
  lobbyMessage.textContent = text;
}


accountForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nickname = cleanNickname(nicknameInput.value);
  const age = Number(ageInput.value);

  if (nickname.length < 3) {
    accountError.textContent = "El nickname debe tener al menos 3 letras.";
    return;
  }

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    accountError.textContent = "Escribe una edad valida.";
    return;
  }

  playerAccount = {
    nickname,
    age,
    createdAt: new Date().toISOString()
  };

  saveAccount(playerAccount);
  registerCurrentPlayerInDirectory();
  accountError.textContent = "";
  nicknameInput.value = "";
  ageInput.value = "";
  applyAccountToUI();
  showLobby(`Cuenta creada. Bienvenido ${nickname}. Presiona JUGAR para preparar tu ejercito.`);
});

playButton.addEventListener("click", () => showGame("campaign"));
freeModeButton.addEventListener("click", () => showGame("free"));
multiplayerButton.addEventListener("click", openMultiplayerPanel);
closeMultiplayerPanel.addEventListener("click", closeMultiplayerPanelAction);
searchPlayerButton.addEventListener("click", searchMultiplayerPlayer);
playerSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchMultiplayerPlayer();
});
acceptInviteButton.addEventListener("click", acceptMultiplayerInvite);
rejectInviteButton.addEventListener("click", rejectMultiplayerInvite);
backLobbyButton.addEventListener("click", () => showLobby());
startBattleButton.addEventListener("click", startBattle);
resetBattleButton.addEventListener("click", resetBattle);
nextLevelButton.addEventListener("click", nextLevel);
placeBlueButton.addEventListener("click", () => setFreePlacementTeam("blue"));
placeRedButton.addEventListener("click", () => setFreePlacementTeam("red"));
multiPlaceBlueButton.addEventListener("click", () => setMultiplayerPlacementTeam("blue"));
multiPlaceRedButton.addEventListener("click", () => setMultiplayerPlacementTeam("red"));
randomEnemiesButton.addEventListener("click", addRandomEnemies);
clearFreeButton.addEventListener("click", () => {
  if (currentGameMode === "free") resetBattle();
});

unitButtons.forEach(btn => {
  btn.addEventListener("click", () => selectUnit(btn.dataset.unit));
});

document.getElementById("settingsBtn").addEventListener("click", () => simpleLobbyMessage("Ajustes todavia no disponible."));
document.getElementById("shopBtn").addEventListener("click", () => simpleLobbyMessage("Tienda todavia no disponible."));
document.getElementById("fightersBtn").addEventListener("click", () => simpleLobbyMessage("Luchadores: los 7 originales + Diablo, La Muerte, Dios, Ninja, Samurái, Berserker, Paladín, Cañonero, Vampiro y Ángel."));
document.getElementById("missionsBtn").addEventListener("click", () => simpleLobbyMessage("Mision: gana los 10 niveles."));
document.getElementById("eventsBtn").addEventListener("click", () => simpleLobbyMessage("Eventos: Campaña, Modo Libre y Multijugador con invitaciones."));
document.getElementById("clubBtn").addEventListener("click", () => simpleLobbyMessage("Club todavia no disponible."));
document.getElementById("passBtn").addEventListener("click", resetProgress);
document.getElementById("newsBtn").addEventListener("click", () => simpleLobbyMessage("Noticias: multijugador agregado. Busca un jugador, envía invitación y pelea con $2000 cada uno."));

/* =========================
   RENDER Y LOOP
========================= */
function resizeRenderer() {
  const width = Math.max(1, gameContainer.clientWidth);
  const height = Math.max(1, gameContainer.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);

const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);

  updateFreeCamera(dt);
  controls.update();

  updateBattle(dt);
  updateProjectiles(dt);
  updateEffects(dt);

  for (const unit of units) {
    animateUnit(unit, dt);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* =========================
   INICIO
========================= */
resizeRenderer();
updateUI();
startApp();
animate();
