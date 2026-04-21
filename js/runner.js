// ===================================================
// 🏃 BIRTHDAY RUNNER GAME
// ===================================================

const canvas = document.getElementById('runner-canvas');
const ctx    = canvas.getContext('2d');

const GROUND_Y   = canvas.height - 40;
const PLAYER_W   = 36;
const PLAYER_H   = 48;
const GRAVITY    = 0.7;
const JUMP_POWER = -14;

let player, obstacles, particles, score, bestScore, speed, gameActive, animId;
let frameCount = 0;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playJumpSound() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start(); osc.stop(audioCtx.currentTime + 0.2);
  } catch(e) {}
}
function playHitSound() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
}

const OBSTACLE_EMOJIS  = ['🎃','🌵','🔴','🪨'];
const COLLECTIBLE_EMOJIS = ['⭐','🎈','🌟'];
const CLOUD_EMOJIS     = ['☁️','🌤️'];

let clouds = [{x:100,y:30,emoji:'☁️'},{x:350,y:50,emoji:'🌤️'},{x:550,y:25,emoji:'☁️'}];

function startGame() {
  cancelAnimationFrame(animId);
  player = {
    x: 80, y: GROUND_Y - PLAYER_H,
    vy: 0, jumping: false, frame: 0
  };
  obstacles  = [];
  particles  = [];
  score      = 0;
  speed      = 4;
  frameCount = 0;
  gameActive = true;
  bestScore  = bestScore || 0;
  updateUI();
  gameLoop();
}

function jump() {
  if (!gameActive) { startGame(); return; }
  if (!player.jumping) {
    player.vy      = JUMP_POWER;
    player.jumping = true;
    playJumpSound();
  }
}

function spawnObstacle() {
  const types = ['obstacle','collectible'];
  const type  = Math.random() < 0.7 ? 'obstacle' : 'collectible';
  const emoji = type === 'obstacle'
    ? OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)]
    : COLLECTIBLE_EMOJIS[Math.floor(Math.random() * COLLECTIBLE_EMOJIS.length)];
  const h = type === 'obstacle' ? (Math.random() * 20 + 30) : 30;
  obstacles.push({
    x: canvas.width + 20,
    y: GROUND_Y - h,
    w: 32, h,
    emoji, type
  });
}

function gameLoop() {
  if (!gameActive) return;
  animId = requestAnimationFrame(gameLoop);
  frameCount++;

  // Update speed
  speed = 4 + Math.floor(score / 200) * 0.5;

  // Spawn obstacles
  const spawnRate = Math.max(60, 120 - Math.floor(score / 100) * 5);
  if (frameCount % spawnRate === 0) spawnObstacle();

  // Update player
  player.vy += GRAVITY;
  player.y  += player.vy;
  if (player.y >= GROUND_Y - PLAYER_H) {
    player.y       = GROUND_Y - PLAYER_H;
    player.vy      = 0;
    player.jumping = false;
  }
  player.frame = (player.frame + 1) % 20;

  // Update obstacles
  obstacles = obstacles.filter(ob => ob.x > -60);
  obstacles.forEach(ob => {
    ob.x -= speed;

    // Collision with player
    const px = player.x, py = player.y;
    const hit = px < ob.x + ob.w - 4 &&
                px + PLAYER_W - 4 > ob.x &&
                py < ob.y + ob.h &&
                py + PLAYER_H > ob.y;

    if (hit) {
      if (ob.type === 'collectible') {
        score += 50;
        spawnParticles(ob.x, ob.y, ob.emoji);
        ob.x = -100; // remove
      } else {
        gameOver();
        return;
      }
    }
  });

  // Score
  score++;
  updateUI();

  // Update clouds
  clouds.forEach(c => {
    c.x -= 0.5;
    if (c.x < -80) c.x = canvas.width + 80;
  });

  // Update particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2;
    p.life--;
  });

  draw();
}

function spawnParticles(x, y, emoji) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 2,
      life: 30, emoji
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#0a0a2e');
  sky.addColorStop(0.7, '#1a2a1a');
  sky.addColorStop(1, '#2a1500');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 20; i++) {
    const sx = (i * 137 + frameCount * 0.1) % canvas.width;
    const sy = (i * 53) % (GROUND_Y - 60);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Clouds
  ctx.font = '28px serif';
  clouds.forEach(c => ctx.fillText(c.emoji, c.x, c.y));

  // Ground
  const ground = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
  ground.addColorStop(0, '#4a2800');
  ground.addColorStop(1, '#2a1500');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  // Ground line
  ctx.strokeStyle = '#6BCB77';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y); ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // Draw obstacles
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  obstacles.forEach(ob => {
    ctx.fillText(ob.emoji, ob.x + ob.w/2, ob.y + ob.h + 4);
  });

  // Draw player (simple character)
  drawPlayer();

  // Draw particles
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    ctx.font = '20px serif';
    ctx.fillText(p.emoji, p.x, p.y);
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const x = player.x, y = player.y;
  const legBob = player.jumping ? 0 : Math.sin(player.frame / 5 * Math.PI) * 5;

  // Body
  ctx.fillStyle = '#4D96FF';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 16, 24, 22, 6);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FFD93D';
  ctx.beginPath();
  ctx.arc(x + 18, y + 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Party hat
  ctx.fillStyle = '#FF6B9D';
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 3);
  ctx.lineTo(x + 18, y - 14);
  ctx.lineTo(x + 26, y + 3);
  ctx.fill();
  ctx.fillStyle = '#FFD93D';
  ctx.beginPath();
  ctx.arc(x + 18, y - 14, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath(); ctx.arc(x + 14, y + 10, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 22, y + 10, 2, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + 18, y + 13, 4, 0, Math.PI);
  ctx.stroke();

  // Legs
  ctx.fillStyle = '#2a2a5e';
  ctx.fillRect(x + 8,  y + 36, 8, 10 + (player.jumping ? 0 : legBob));
  ctx.fillRect(x + 20, y + 36, 8, 10 - (player.jumping ? 0 : legBob));

  // Shoes
  ctx.fillStyle = '#FF8C42';
  ctx.fillRect(x + 6,  y + 44 + (player.jumping ? 0 : legBob), 11, 5);
  ctx.fillRect(x + 18, y + 44 - (player.jumping ? 0 : legBob), 11, 5);
}

function gameOver() {
  gameActive = false;
  playHitSound();
  if (score > bestScore) bestScore = score;
  updateUI();

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 28px Fredoka One, cursive';
  ctx.fillStyle = '#FF4560';
  ctx.fillText('💥 GAME OVER!', canvas.width/2, canvas.height/2 - 30);
  ctx.font = '18px Bubblegum Sans, cursive';
  ctx.fillStyle = '#FFD93D';
  ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 10);
  ctx.font = '14px Bubblegum Sans, cursive';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Tap JUMP or click New Game to retry!', canvas.width/2, canvas.height/2 + 40);
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('speed').textContent = Math.ceil(speed - 3);
  document.getElementById('best').textContent  = bestScore;
}

// Controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); });

// Resize for mobile
function resizeCanvas() {
  const w = Math.min(600, window.innerWidth - 20);
  canvas.style.width  = w + 'px';
  canvas.style.height = (w / 3) + 'px';
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => { resizeCanvas(); startGame(); });
