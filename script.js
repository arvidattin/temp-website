// Target Date: 25 October 2026 (00:00:00)
const TARGET_DATE = new Date('2026-10-25T00:00:00').getTime();

// Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

/**
 * Format number with leading zeroes
 */
function formatTime(val, digits = 2) {
  return String(Math.max(0, val)).padStart(digits, '0');
}

/**
 * Update Countdown Timer
 */
function updateCountdown() {
  const now = new Date().getTime();
  const distance = TARGET_DATE - now;

  if (distance < 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    return;
  }

  // Time calculations
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Render values
  daysEl.textContent = formatTime(days, 2);
  hoursEl.textContent = formatTime(hours, 2);
  minutesEl.textContent = formatTime(minutes, 2);
  secondsEl.textContent = formatTime(seconds, 2);
}

// Initial update & interval
updateCountdown();
setInterval(updateCountdown, 1000);

/* ==========================================================================
   Ambient Particle System (Monochrome Dark Grey Dust/Particles)
   ========================================================================== */
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.15;
    this.speedY = (Math.random() - 0.5) * 0.15 - 0.05;
    this.opacity = Math.random() * 0.25 + 0.05;
    this.fade = Math.random() * 0.003 + 0.001;
    this.increasing = Math.random() > 0.5;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.increasing) {
      this.opacity += this.fade;
      if (this.opacity >= 0.3) this.increasing = false;
    } else {
      this.opacity -= this.fade;
      if (this.opacity <= 0.03) this.increasing = true;
    }

    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  draw() {
    // Dark grey monochrome dust
    ctx.fillStyle = `rgba(160, 160, 175, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particleCount = Math.floor(Math.min(width, height) / 18);
const particles = Array.from({ length: particleCount }, () => new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();
