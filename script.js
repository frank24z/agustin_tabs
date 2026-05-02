import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================
   ELEMENTOS DEL HTML
========================= */
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const gameContainer = document.getElementById("game3d");

const playButton = document.getElementById("playButton");
const backLobbyButton = document.getElementById("backLobbyButton");
const startBattleButton = document.getElementById("startBattleButton");
const resetBattleButton = document.getElementById("resetBattleButton");
const nextLevelButton = document.getElementById("nextLevelButton");

const statusText = document.getElementById("statusText");
const moneyText = document.getElementById("moneyText");
const levelText = document.getElementById("levelText");
const redCountText = document.getElementById("redCountText");

const lobbyMessage = document.getElementById("lobbyMessage");
const lobbyCoins = document.getElementById("lobbyCoins");
const lobbyLevel = document.getElementById("lobbyLevel");
const lobbyTrophies = document.getElementById("lobbyTrophies");

const unitButtons = [...document.querySelectorAll(".unit-btn")];

/* =========================
   ESTADO DEL JUEGO
========================= */
let currentLevel = 1;
let money = 500;
let trophies = 0;
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
  blueMaxX: -1.2
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
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 35, 75);

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

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x7ca86d, 1.15);
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
  new THREE.MeshStandardMaterial({ color: 0x69db7c, roughness: 0.85 })
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

function addRock(x, z, s = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.7 * s, 0),
    makeMat(0x7d8597)
  );
  rock.position.set(x, 0.45 * s, z);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function addTree(x, z, s = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 1.6 * s, 6),
    makeMat(0x8d5524)
  );
  trunk.position.set(x, 0.8 * s, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.1 * s, 2.1 * s, 7),
    makeMat(0x2f9e44)
  );
  leaves.position.set(x, 2.2 * s, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

addRock(-17, -12, 1.2);
addRock(-15, 12, 0.9);
addRock(16, -11, 1.1);
addRock(16, 11, 0.8);
addTree(-18, -6, 1.1);
addTree(-17, 7, 1.0);
addTree(18, -5, 1.1);
addTree(17, 8, 1.0);

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
    attackAnim: 0,
    attackTarget: null,
    hitDone: false,
    moving: false,
    moveCycle: Math.random() * Math.PI * 2,
    hurtFlash: 0,
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
  const isMage = unit.type === "mage";
  const color = isMage ? 0xe599f7 : 0xf8f9fa;

  const mesh = new THREE.Mesh(
    isMage
      ? new THREE.IcosahedronGeometry(0.18, 0)
      : new THREE.CylinderGeometry(0.035, 0.035, 0.72, 6),
    makeMat(color, color, isMage ? 0.85 : 0.18)
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

  const velocity = new THREE.Vector3().subVectors(to, from).normalize().multiplyScalar(unit.def.projectileSpeed);

  mesh.position.copy(from);
  if (!isMage) {
    mesh.rotation.z = Math.PI / 2;
  }
  mesh.castShadow = true;
  scene.add(mesh);

  projectiles.push({
    mesh,
    team: unit.team,
    damage: unit.def.damage,
    velocity,
    life: 2.4,
    splashRadius: unit.def.splashRadius || 0,
    isMage
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

    if (!p.isMage) {
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
        spawnHitEffect(hitPos, 0xe599f7, 0.34);
        for (const enemy of enemies) {
          const d = xzDistanceUnit(enemy, hitTarget);
          if (d <= p.splashRadius) {
            applyDamage(enemy, p.damage, p.team);
          }
        }
      } else {
        spawnHitEffect(hitPos, 0xfff3bf, 0.22);
        applyDamage(hitTarget, p.damage, p.team);
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

function startAttack(unit, target) {
  unit.cooldown = unit.def.attackInterval;
  unit.attackAnim = unit.def.attackDuration;
  unit.attackTarget = target;
  unit.hitDone = false;

  if (unit.def.kind === "ranged") {
    spawnProjectile(unit, target);
    unit.hitDone = true;
  }
}

function applyDamage(target, damage, attackerTeam) {
  if (target.dead) return;

  target.hp -= damage;
  target.hurtFlash = 0.15;

  const push = attackerTeam === "blue" ? 0.16 : -0.16;
  target.group.position.x += push;

  const effectPos = target.group.position.clone();
  effectPos.y = 1.2 * target.def.scale;
  spawnHitEffect(effectPos, 0xffd43b, 0.18);

  if (target.hp <= 0) {
    target.hp = 0;
    target.dead = true;
    target.attackAnim = 0;
    target.cooldown = 999;
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
    if (unit.hurtFlash > 0) unit.hurtFlash -= dt;

    const target = findNearestEnemy(unit);
    if (!target) continue;

    faceTarget(unit, target);
    const dist = xzDistanceUnit(unit, target);

    if (unit.def.kind === "melee") {
      if (dist > unit.def.range) {
        moveToward(unit, target, dt);
      } else if (unit.cooldown <= 0) {
        startAttack(unit, target);
      }

      if (unit.attackAnim > 0 && !unit.hitDone && unit.attackTarget && !unit.attackTarget.dead) {
        const progress = 1 - unit.attackAnim / unit.def.attackDuration;
        const targetStillClose = xzDistanceUnit(unit, unit.attackTarget) <= unit.def.range + 0.75;

        if (progress >= 0.48 && targetStillClose) {
          applyDamage(unit.attackTarget, unit.def.damage, unit.team);
          unit.hitDone = true;
        }
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
        startAttack(unit, target);
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

    if (unit.def.kind === "melee") {
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

  if (unit.hurtFlash > 0) {
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
  setStatus(`Seleccionaste ${def.name}. Haz clic en la zona azul para colocarlo.`);
}

function canPlaceAt(x, z) {
  if (x > FIELD.blueMaxX) return false;
  if (x < FIELD.minX + 1 || z < FIELD.minZ + 1 || z > FIELD.maxZ - 1) return false;

  for (const unit of units) {
    if (unit.team !== "blue" || unit.dead) continue;
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

  if (money < def.cost) {
    setStatus("No tienes dinero suficiente para esa unidad.");
    return;
  }

  if (!canPlaceAt(x, z)) {
    setStatus("Coloca la unidad dentro de la zona azul y deja espacio.");
    return;
  }

  money -= def.cost;
  const unit = createUnit(selectedUnitType, "blue", x, z);
  units.push(unit);
  updateUI();
  setStatus(`${def.name} colocado. Puedes colocar mas tropas o iniciar la batalla.`);
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
    setStatus("Perdiste. Reinicia la batalla y prueba otra formacion.");
  }

  if (!redAlive && battleStarted) {
    battleStarted = false;
    battleWon = true;

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

function resetBattle() {
  clearBattlefield();
  battleStarted = false;
  battleWon = false;
  selectedUnitType = null;
  nextLevelButton.disabled = true;

  unitButtons.forEach(btn => btn.classList.remove("selected"));

  money = levels[currentLevel - 1].budget;
  spawnEnemiesForLevel();
  updateUI();
  setStatus("Elige una unidad y colocala en la zona azul.");
}

function startBattle() {
  const blueCount = units.filter(u => u.team === "blue").length;

  if (blueCount === 0) {
    setStatus("Primero coloca al menos una unidad azul.");
    return;
  }

  battleStarted = true;
  battleWon = false;
  selectedUnitType = null;
  unitButtons.forEach(btn => btn.classList.remove("selected"));
  setStatus("¡Batalla iniciada! Ahora si se atacan: melee golpea y distancia dispara.");
}

function nextLevel() {
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
  const redAlive = units.filter(u => !u.dead && u.team === "red").length;

  moneyText.textContent = money;
  levelText.textContent = currentLevel;
  redCountText.textContent = redAlive;

  lobbyCoins.textContent = money;
  lobbyLevel.textContent = currentLevel;
  lobbyTrophies.textContent = trophies;
}

function showLobby() {
  battleStarted = false;
  battleWon = false;
  selectedUnitType = null;
  currentLevel = 1;
  trophies = 0;
  money = levels[0].budget;
  nextLevelButton.disabled = true;
  unitButtons.forEach(btn => btn.classList.remove("selected"));

  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  updateUI();
  lobbyMessage.textContent = "Volviste al lobby. Los niveles se reiniciaron.";
}

function showGame() {
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resizeRenderer();
  resetBattle();
}

function simpleLobbyMessage(text) {
  lobbyMessage.textContent = text;
}

playButton.addEventListener("click", showGame);
backLobbyButton.addEventListener("click", showLobby);
startBattleButton.addEventListener("click", startBattle);
resetBattleButton.addEventListener("click", resetBattle);
nextLevelButton.addEventListener("click", nextLevel);

unitButtons.forEach(btn => {
  btn.addEventListener("click", () => selectUnit(btn.dataset.unit));
});

document.getElementById("settingsBtn").addEventListener("click", () => simpleLobbyMessage("Ajustes todavia no disponible."));
document.getElementById("shopBtn").addEventListener("click", () => simpleLobbyMessage("Tienda todavia no disponible."));
document.getElementById("fightersBtn").addEventListener("click", () => simpleLobbyMessage("Luchadores: Garrote, Escudo, Lancero, Arquero, Caballero, Gigante y Mago."));
document.getElementById("missionsBtn").addEventListener("click", () => simpleLobbyMessage("Mision: gana los 10 niveles."));
document.getElementById("eventsBtn").addEventListener("click", () => simpleLobbyMessage("Evento actual: Batalla 3D."));
document.getElementById("clubBtn").addEventListener("click", () => simpleLobbyMessage("Club todavia no disponible."));
document.getElementById("passBtn").addEventListener("click", resetProgress);
document.getElementById("newsBtn").addEventListener("click", () => simpleLobbyMessage("Noticias: ya funcionan ataques melee y de distancia."));

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
showLobby();
animate();
