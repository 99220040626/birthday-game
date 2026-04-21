// ===================================================
// 🐍 SNAKE GAME
// ===================================================

const canvas = document.getElementById('snake-canvas');
const ctx    = canvas.getContext('2d');

const CELL  = 20;
// Changed from const to let so they can update when the screen resizes!
let COLS  = canvas.width  / CELL; 
let ROWS  = canvas.height / CELL; 

const FOOD_EMOJIS = ['🎂','🍭','🍬','🧁','🍰'];

let snake, dx, dy, food, score, length, bestScore, gameLoop, paused, gameOver;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playEat() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start(); osc.stop(audioCtx.currentTime + 0.2);
  } catch(e) {}
}

function playDie() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    [200, 150, 100].forEach((f, i) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.2);
      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.2);
    });
  } catch(e) {}
}

function startGame() {
  clearInterval(gameLoop);
  
  // Calculate the center of the grid dynamically
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);
  
  // Use dynamic coordinates so the snake is always on screen
  snake = [
    {x: startX, y: startY}, 
    {x: startX - 1, y: startY}, 
    {x: startX - 2, y: startY}
  ];
  
  dx = 1; dy = 0;
  score    = 0;
  length   = 3;
  paused   = false;
  gameOver = false;
  bestScore = bestScore || 0;
  document.getElementById('pause-btn').textContent = '⏸ Pause';
  spawnFood();
  updateUI();
  gameLoop = setInterval(tick, 130);
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function tick() {
  if (paused || gameOver) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame(); return;
  }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame(); return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score  += 10;
    length += 1;
    playEat();
    spawnFood();
    updateUI();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // Background grid
  ctx.fillStyle = 'rgba(10,10,40,0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid dots
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillRect(c * CELL + CELL/2 - 1, r * CELL + CELL/2 - 1, 2, 2);
    }
  }

  // Draw food as emoji
  ctx.font = (CELL - 2) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(food.emoji, food.x * CELL + CELL/2, food.y * CELL + CELL/2);

  // Draw snake
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    const pad = 2;
    const r = isHead ? 6 : 4;

    // Gradient for head vs body
    const grad = ctx.createRadialGradient(
      x + CELL/2 - pad, y + CELL/2 - pad, 1,
      x + CELL/2, y + CELL/2, CELL
    );
    if (isHead) {
      grad.addColorStop(0, '#a0ff80');
      grad.addColorStop(1, '#2dbd3a');
    } else {
      const alpha = 1 - (i / snake.length) * 0.3;
      grad.addColorStop(0, `rgba(107,203,119,${alpha})`);
      grad.addColorStop(1, `rgba(45,189,58,${alpha * 0.7})`);
    }
    ctx.fillStyle = grad;
    roundRect(ctx, x + pad, y + pad, CELL - pad*2, CELL - pad*2, r);
    ctx.fill();

    // Eyes on head
    if (isHead) {
      ctx.fillStyle = '#fff';
      // eye positions based on direction
      let ex1 = 5, ey1 = 5, ex2 = CELL-8, ey2 = 5;
      if (dy !== 0) { ex1 = 4; ex2 = CELL-7; ey1 = dy > 0 ? CELL-8 : 5; ey2 = ey1; }
      ctx.beginPath(); ctx.arc(x + ex1, y + ey1, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + ex2, y + ey2, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x + ex1 + 0.5, y + ey1 + 0.5, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + ex2 + 0.5, y + ey2 + 0.5, 1.2, 0, Math.PI*2); ctx.fill();
    }
  });

  // Paused overlay
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 36px Fredoka One, cursive';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ PAUSED', canvas.width/2, canvas.height/2);
    ctx.font = '18px Bubblegum Sans, cursive';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Press Space or button to resume', canvas.width/2, canvas.height/2 + 40);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function endGame() {
  gameOver = true;
  playDie();
  clearInterval(gameLoop);
  if (score > bestScore) bestScore = score;
  updateUI();

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FF4560';
  ctx.font = 'bold 32px Fredoka One, cursive';
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER!', canvas.width/2, canvas.height/2 - 30);
  ctx.fillStyle = '#FFD93D';
  ctx.font = '22px Bubblegum Sans, cursive';
  ctx.fillText('Score: ' + score + '  Length: ' + length, canvas.width/2, canvas.height/2 + 10);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '16px Bubblegum Sans, cursive';
  ctx.fillText('Click "New Game" to play again!', canvas.width/2, canvas.height/2 + 45);
}

function setDir(newDx, newDy) {
  // Prevent reversing
  if (newDx === -dx && newDy === -dy) return;
  dx = newDx; dy = newDy;
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  document.getElementById('pause-btn').textContent = paused ? '▶ Resume' : '⏸ Pause';
  if (!paused) draw();
}

function updateUI() {
  document.getElementById('score').textContent  = score;
  document.getElementById('length').textContent = length;
  document.getElementById('best').textContent   = bestScore;
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' '].includes(e.key)) {
    e.preventDefault();
  }
  switch(e.key) {
    case 'ArrowUp':    case 'w': setDir(0,-1);  break;
    case 'ArrowDown':  case 's': setDir(0,1);   break;
    case 'ArrowLeft':  case 'a': setDir(-1,0);  break;
    case 'ArrowRight': case 'd': setDir(1,0);   break;
    case ' ': togglePause(); break;
  }
});

// Resize canvas for smaller screens
function resizeCanvas() {
  const size = Math.min(400, window.innerWidth - 40);
  const rounded = Math.floor(size / CELL) * CELL;
  canvas.width  = rounded;
  canvas.height = rounded;
  
  // Update the game boundaries when the screen shrinks!
  COLS = canvas.width / CELL;
  ROWS = canvas.height / CELL;
}

window.addEventListener('load', () => {
  resizeCanvas();
  startGame();
});