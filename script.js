const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const lobbyMessageText = document.getElementById("lobbyMessage");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let units = [];
let selectedUnit = null;
let battleStarted = false;
let money = 1500;

const unitData = {
  soldier: {
    name: "Soldado",
    cost: 50,
    hp: 100,
    damage: 12,
    range: 35,
    speed: 1.3,
    size: 18,
    color: "#3498db"
  },
  archer: {
    name: "Arquero",
    cost: 80,
    hp: 70,
    damage: 18,
    range: 160,
    speed: 1,
    size: 16,
    color: "#2ecc71"
  },
  giant: {
    name: "Gigante",
    cost: 150,
    hp: 250,
    damage: 28,
    range: 45,
    speed: 0.7,
    size: 28,
    color: "#9b59b6"
  }
};

/* ======================= */
/* LOBBY */
/* ======================= */

function lobbyMessage(text) {
  lobbyMessageText.innerText = text;
}

function goToGame() {
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetGame();
}

function showLobby() {
  battleStarted = false;
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  lobbyMessage("Volviste al lobby. Presiona JUGAR cuando estés listo.");
}

/* ======================= */
/* CREAR UNIDADES */
/* ======================= */

function selectUnit(type) {
  selectedUnit = type;

  document.getElementById("msg").innerText =
    "Unidad seleccionada: " + unitData[type].name + ". Haz clic en tu lado azul.";
}

canvas.addEventListener("click", (e) => {
  if (battleStarted || !selectedUnit) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (x > canvas.width / 2) {
    document.getElementById("msg").innerText =
      "Solo puedes colocar unidades en el lado azul.";
    return;
  }

  if (y < 120) {
    document.getElementById("msg").innerText =
      "Coloca las unidades más abajo, en el campo de batalla.";
    return;
  }

  const data = unitData[selectedUnit];

  if (money < data.cost) {
    document.getElementById("msg").innerText = "No tienes dinero suficiente.";
    return;
  }

  money -= data.cost;
  updateMoney();

  units.push(createUnit(x, y, "blue", selectedUnit));

  document.getElementById("msg").innerText =
    data.name + " colocado. Puedes poner más tropas o iniciar la batalla.";
});

function createUnit(x, y, team, type) {
  const data = unitData[type];

  return {
    x,
    y,
    team,
    type,
    hp: data.hp,
    maxHp: data.hp,
    damage: data.damage,
    range: data.range,
    speed: data.speed,
    size: data.size,
    color: team === "blue" ? data.color : "#e74c3c",
    attackCooldown: 0,
    dead: false,
    fallRotation: 0,
    vx: 0,
    vy: 0,
    attackAnim: 0
  };
}

function createEnemyArmy() {
  units.push(createUnit(710, 270, "red", "soldier"));
  units.push(createUnit(750, 350, "red", "soldier"));
  units.push(createUnit(830, 260, "red", "archer"));
  units.push(createUnit(885, 350, "red", "giant"));
}

/* ======================= */
/* CONTROLES DE BATALLA */
/* ======================= */

function startBattle() {
  const blueAlive = units.some(u => u.team === "blue" && !u.dead);

  if (!blueAlive) {
    document.getElementById("msg").innerText =
      "Primero coloca al menos una unidad azul.";
    return;
  }

  battleStarted = true;
  selectedUnit = null;
  document.getElementById("msg").innerText = "¡Batalla iniciada!";
}

function resetGame() {
  units = [];
  battleStarted = false;
  selectedUnit = null;
  money = 500;

  updateMoney();
  createEnemyArmy();

  document.getElementById("msg").innerText =
    "Elige una unidad y colócala en tu lado azul.";
}

function updateMoney() {
  document.getElementById("money").innerText = money;
}

/* ======================= */
/* LÓGICA */
/* ======================= */

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function findNearestEnemy(unit) {
  const enemies = units.filter(u => u.team !== unit.team && !u.dead);

  let nearest = null;
  let bestDist = Infinity;

  for (let enemy of enemies) {
    const d = distance(unit, enemy);

    if (d < bestDist) {
      bestDist = d;
      nearest = enemy;
    }
  }

  return nearest;
}

function updateUnits() {
  if (!battleStarted) return;

  for (let unit of units) {
    if (unit.dead) {
      updateDeadUnit(unit);
      continue;
    }

    const enemy = findNearestEnemy(unit);
    if (!enemy) continue;

    const d = distance(unit, enemy);

    if (d > unit.range) {
      moveTowardEnemy(unit, enemy);
    } else {
      attackEnemy(unit, enemy);
    }

    if (unit.attackCooldown > 0) {
      unit.attackCooldown--;
    }

    if (unit.attackAnim > 0) {
      unit.attackAnim--;
    }

    keepUnitInsideMap(unit);
  }

  separateUnits();
  checkWinner();
}

function moveTowardEnemy(unit, enemy) {
  const angle = Math.atan2(enemy.y - unit.y, enemy.x - unit.x);

  unit.x += Math.cos(angle) * unit.speed;
  unit.y += Math.sin(angle) * unit.speed;
}

function attackEnemy(unit, enemy) {
  if (unit.attackCooldown > 0) return;

  enemy.hp -= unit.damage;
  unit.attackCooldown = unit.type === "giant" ? 70 : 50;
  unit.attackAnim = 12;

  enemy.x += unit.team === "blue" ? 8 : -8;

  if (enemy.hp <= 0) {
    enemy.dead = true;
    enemy.vx = Math.random() * 4 - 2;
    enemy.vy = -4 - Math.random() * 2;
  }
}

function updateDeadUnit(unit) {
  unit.vy += 0.2;
  unit.x += unit.vx;
  unit.y += unit.vy;
  unit.fallRotation += 0.08;

  if (unit.y > 555) {
    unit.y = 555;
    unit.vy *= -0.15;
    unit.vx *= 0.9;
  }
}

function keepUnitInsideMap(unit) {
  unit.x = Math.max(25, Math.min(canvas.width - 25, unit.x));
  unit.y = Math.max(120, Math.min(canvas.height - 35, unit.y));
}

function separateUnits() {
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const a = units[i];
      const b = units[j];

      if (a.dead || b.dead) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const minDist = a.size + b.size;

      if (d > 0 && d < minDist) {
        const push = (minDist - d) / 2;
        const nx = dx / d;
        const ny = dy / d;

        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }
}

function checkWinner() {
  const blueAlive = units.some(u => u.team === "blue" && !u.dead);
  const redAlive = units.some(u => u.team === "red" && !u.dead);

  if (!blueAlive && battleStarted) {
    document.getElementById("msg").innerText = "Ganó el equipo rojo.";
    battleStarted = false;
  }

  if (!redAlive && battleStarted) {
    document.getElementById("msg").innerText = "¡Ganaste! Volviste con +50 monedas.";
    battleStarted = false;
    money += 50;
    updateMoney();
  }
}

/* ======================= */
/* DIBUJAR */
/* ======================= */

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);

  sky.addColorStop(0, "#74c0fc");
  sky.addColorStop(0.55, "#d0ebff");
  sky.addColorStop(0.56, "#69db7c");
  sky.addColorStop(1, "#2b8a3e");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCloud(130, 80, 1);
  drawCloud(420, 65, 0.8);
  drawCloud(760, 90, 1.1);

  ctx.fillStyle = "#51cf66";
  ctx.fillRect(0, 370, canvas.width, 230);

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let i = 0; i < canvas.width; i += 60) {
    ctx.beginPath();
    ctx.arc(i, 430 + Math.sin(i) * 15, 25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";

  ctx.beginPath();
  ctx.arc(x, y, 28 * s, 0, Math.PI * 2);
  ctx.arc(x + 28 * s, y - 12 * s, 34 * s, 0, Math.PI * 2);
  ctx.arc(x + 62 * s, y, 28 * s, 0, Math.PI * 2);
  ctx.arc(x + 30 * s, y + 12 * s, 32 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawBattleLine() {
  ctx.fillStyle = "rgba(0, 0, 255, 0.12)";
  ctx.fillRect(0, 0, canvas.width / 2, canvas.height);

  ctx.fillStyle = "rgba(255, 0, 0, 0.12)";
  ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);

  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText("TU EQUIPO", 250, 45);
  ctx.fillText("ENEMIGOS", 750, 45);
}

function drawUnit(unit) {
  ctx.save();

  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.dead ? unit.fallRotation : 0);

  const attackMove = unit.attackAnim > 0 ? 8 : 0;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 5;

  /* Sombra */
  ctx.save();
  ctx.rotate(unit.dead ? -unit.fallRotation : 0);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, unit.size + 30, unit.size + 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Piernas */
  ctx.beginPath();
  ctx.moveTo(0, unit.size);
  ctx.lineTo(-10, unit.size + 25);
  ctx.moveTo(0, unit.size);
  ctx.lineTo(10, unit.size + 25);
  ctx.stroke();

  /* Cuerpo */
  ctx.beginPath();
  ctx.moveTo(0, -unit.size);
  ctx.lineTo(0, unit.size);
  ctx.stroke();

  /* Brazos */
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-18, 10);
  ctx.moveTo(0, -5);
  ctx.lineTo(18 + attackMove, 10);
  ctx.stroke();

  /* Cabeza */
  ctx.fillStyle = unit.color;
  ctx.beginPath();
  ctx.arc(0, -unit.size - 12, unit.size * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Ojos */
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-6, -unit.size - 15, 3, 0, Math.PI * 2);
  ctx.arc(8, -unit.size - 15, 3, 0, Math.PI * 2);
  ctx.fill();

  /* Arma */
  ctx.strokeStyle = unit.type === "archer" ? "#8e5a2a" : "#555";
  ctx.lineWidth = unit.type === "giant" ? 7 : 4;
  ctx.beginPath();

  if (unit.type === "archer") {
    ctx.arc(25 + attackMove, 5, 18, -1.5, 1.5);
    ctx.moveTo(25 + attackMove, -13);
    ctx.lineTo(25 + attackMove, 23);

    ctx.stroke();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35 + attackMove, 5);
    ctx.lineTo(65 + attackMove, 5);
    ctx.stroke();
  } else if (unit.type === "giant") {
    ctx.moveTo(20 + attackMove, 8);
    ctx.lineTo(50 + attackMove, -25);
    ctx.stroke();

    ctx.fillStyle = "#868e96";
    ctx.beginPath();
    ctx.arc(55 + attackMove, -30, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.moveTo(18 + attackMove, 10);
    ctx.lineTo(42 + attackMove, -12);
    ctx.stroke();
  }

  ctx.restore();

  drawHealthBar(unit);
}

function drawHealthBar(unit) {
  if (unit.dead) return;

  const barWidth = 54;
  const barHeight = 8;
  const x = unit.x - barWidth / 2;
  const y = unit.y - unit.size - 45;

  ctx.fillStyle = "#111";
  ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

  ctx.fillStyle = "#e03131";
  ctx.fillRect(x, y, barWidth, barHeight);

  ctx.fillStyle = "#51cf66";
  ctx.fillRect(x, y, barWidth * Math.max(0, unit.hp / unit.maxHp), barHeight);
}

function drawPlacementHint() {
  if (battleStarted) return;

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.fillRect(70, 515, 360, 45);
  ctx.strokeRect(70, 515, 360, 45);

  ctx.fillStyle = "#111";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Coloca tus tropas en el lado azul", 250, 544);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawBattleLine();
  drawPlacementHint();

  const sortedUnits = [...units].sort((a, b) => a.y - b.y);

  for (let unit of sortedUnits) {
    drawUnit(unit);
  }
}

function gameLoop() {
  updateUnits();
  draw();
  requestAnimationFrame(gameLoop);
}

/* Iniciar juego */
createEnemyArmy();
updateMoney();
gameLoop();