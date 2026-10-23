/* ============================================================
   CONFIG
   ============================================================ */

// Real target date: 25 October 2026, midnight
const REAL_TARGET = new Date('2026-10-25T00:00:00').getTime();

// TEST MODE: set TEST_MODE = true to trigger reveal after 20 seconds.
// Set to false for production.
const TEST_MODE = false;

// When TEST_MODE is true the countdown starts from NOW + 10 seconds.
const TARGET_DATE = TEST_MODE
  ? Date.now() + 10 * 1000
  : REAL_TARGET;

/* ============================================================
   COUNTDOWN
   ============================================================ */
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function formatTime(val, digits = 2) {
  return String(Math.max(0, val)).padStart(digits, '0');
}

let revealTriggered = false;

function updateCountdown() {
  const now = Date.now();
  const distance = TARGET_DATE - now;

  if (distance <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    if (!revealTriggered) {
      revealTriggered = true;
      triggerReveal();
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = formatTime(days);
  hoursEl.textContent = formatTime(hours);
  minutesEl.textContent = formatTime(minutes);
  secondsEl.textContent = formatTime(seconds);
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

/* ============================================================
   REVEAL
   ============================================================ */
function triggerReveal() {
  clearInterval(countdownInterval);

  const countdownScreen = document.getElementById('countdownScreen');
  const revealScreen = document.getElementById('revealScreen');

  // Fade out countdown
  countdownScreen.style.transition = 'opacity 1s ease';
  countdownScreen.style.opacity = '0';

  setTimeout(() => {
    countdownScreen.classList.add('hidden');

    // Show & fade in reveal screen
    revealScreen.classList.remove('hidden');
    void revealScreen.offsetWidth; // force reflow
    revealScreen.classList.add('visible');

    // Init image zoom/pan once reveal is visible
    const img = document.getElementById('mainImage');
    if (img.complete) initImageViewer();
    else img.addEventListener('load', initImageViewer, { once: true });

    // Show key popup after a short dramatic delay
    setTimeout(() => {
      document.getElementById('keyPopup').classList.remove('minimized');
    }, 800);
  }, 1100);
}

/* ============================================================
   IMAGE VIEWER  – scroll to zoom, drag to pan
   ============================================================ */
function initImageViewer() {
  const viewport = document.getElementById('imageViewport');
  const img = document.getElementById('mainImage');

  let scale = 1;
  let tx = 0;   // translation from viewport top-left
  let ty = 0;

  img.style.transformOrigin = '0 0';

  // Fit image to viewport on load
  function fitImage() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    scale = Math.min(vw / iw, vh / ih);
    tx = (vw - iw * scale) / 2;
    ty = (vh - ih * scale) / 2;
    applyTransform();
  }

  function applyTransform() {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  fitImage();
  window.addEventListener('resize', fitImage);

  // ── Scroll to zoom toward cursor ────────────────────────
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.min(12, Math.max(0.3, scale * factor));
    const ratio = newScale / scale;
    tx = mouseX + ratio * (tx - mouseX);
    ty = mouseY + ratio * (ty - mouseY);
    scale = newScale;
    applyTransform();
  }, { passive: false });

  // ── Drag to pan ──────────────────────────────────────────
  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragOriginTx = 0, dragOriginTy = 0;

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOriginTx = tx;
    dragOriginTy = ty;
    viewport.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    tx = dragOriginTx + (e.clientX - dragStartX);
    ty = dragOriginTy + (e.clientY - dragStartY);
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    viewport.style.cursor = 'grab';
  });

  // ── Double-click to reset ────────────────────────────────
  viewport.addEventListener('dblclick', fitImage);
}

/* ============================================================
   KEY POPUP TOGGLE
   ============================================================ */
const keyPopup = document.getElementById('keyPopup');
const keyToggleBtn = document.getElementById('keyToggleBtn');
const closeKeyBtn = document.getElementById('closeKeyPopup');

// Start minimized; reveal logic opens it after a delay
keyPopup.classList.add('minimized');

keyToggleBtn.addEventListener('click', () => {
  keyPopup.classList.toggle('minimized');
});

closeKeyBtn.addEventListener('click', () => {
  keyPopup.classList.add('minimized');
});

/* ============================================================
   AMBIENT PARTICLE SYSTEM
   ============================================================ */
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Particle {
  constructor() { this.reset(); }

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
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

animateParticles();
