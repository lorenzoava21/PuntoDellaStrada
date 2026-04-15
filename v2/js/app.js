import { AREAS } from './data.js';

// ─── Firebase Setup ───
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBgiFCobMeV6z18Vyp-iSjYAXo-Z9sbYhI",
  authDomain: "puntodellastrada-2026.firebaseapp.com",
  projectId: "puntodellastrada-2026",
  storageBucket: "puntodellastrada-2026.firebasestorage.app",
  messagingSenderId: "974823717158",
  appId: "1:974823717158:web:daae47188c630e9ee6e9e7"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ─── State ───
let currentUser = null;   // { name, pin, docId }
let userData = {};         // persisted data
let currentStep = -1;
let pin = '';
let radarChart = null;
let saveTimeout = null;
let reachedSummary = false;  // once true, full progress bar stays

// ─── DOM refs ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  setupHomeTimeline();
  setupSummaryButtons();
  setupFeedbackButtons();
  addSaveIndicator();
  preloadLogo();
});

// ─── Save indicator ───
function addSaveIndicator() {
  const div = document.createElement('div');
  div.className = 'save-indicator';
  div.id = 'save-indicator';
  div.textContent = 'Salvato';
  document.body.appendChild(div);
}

function flashSaved() {
  const el = $('#save-indicator');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1200);
}

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
function setupLogin() {
  const keypad = $('#pin-keypad');
  const dots = $$('#pin-dots .pin-dot');
  const nameInput = $('#login-name');
  const btnLogin = $('#btn-login');
  const errorEl = $('#login-error');

  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || btn.classList.contains('key-empty')) return;
    const key = btn.dataset.key;

    if (key === 'del') {
      pin = pin.slice(0, -1);
    } else if (pin.length < 4) {
      pin += key;
    }

    dots.forEach((d, i) => d.classList.toggle('filled', i < pin.length));
    updateLoginButton();
  });

  nameInput.addEventListener('input', updateLoginButton);

  function updateLoginButton() {
    const name = nameInput.value.trim();
    btnLogin.disabled = !(name.length >= 2 && pin.length === 4);
  }

  btnLogin.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name || pin.length !== 4) return;

    btnLogin.disabled = true;
    btnLogin.textContent = 'Caricamento...';
    errorEl.textContent = '';

    try {
      const docId = name.toLowerCase().replace(/\s+/g, '_');
      const userRef = doc(db, 'users', docId);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.pin !== pin) {
          errorEl.textContent = 'PIN errato. Riprova.';
          btnLogin.disabled = false;
          btnLogin.textContent = 'Entra';
          return;
        }
        currentUser = { name: data.name, pin, docId };
        userData = data;
      } else {
        // New user
        const newData = {
          name,
          pin,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          areas: {},
          objectives: [],
          actions: []
        };
        await setDoc(userRef, newData);
        currentUser = { name, pin, docId };
        userData = newData;
      }

      enterApp();
    } catch (err) {
      console.error(err);
      errorEl.textContent = 'Errore di connessione. Riprova.';
      btnLogin.disabled = false;
      btnLogin.textContent = 'Entra';
    }
  });
}

function enterApp() {
  $('#screen-login').classList.remove('active');
  $('#screen-app').classList.add('active');
  $('#home-welcome').textContent = `Ciao ${currentUser.name}!`;
  showView('home');
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function stopAllVideos() {
  $$('iframe').forEach(iframe => {
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  });
}

function showView(name) {
  stopAllVideos();
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${name}`).classList.add('active');

  if (name === 'home') {
    $('#hero').style.display = '';
    $('#progress').classList.remove('visible');
    currentStep = -1;
  } else if (name === 'step') {
    $('#hero').style.display = 'none';
    $('#progress').classList.add('visible');
  } else if (name === 'summary') {
    $('#hero').style.display = 'none';
    $('#progress').classList.add('visible');
    reachedSummary = true;
    buildFullProgress('summary');
    renderSummary();
  } else if (name === 'feedback') {
    $('#hero').style.display = 'none';
    $('#progress').classList.add('visible');
    buildFullProgress('feedback');
    renderFeedback();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goStep(idx) {
  currentStep = idx;
  renderStep(idx);
  showView('step');
  if (reachedSummary) {
    buildFullProgress(idx);
  } else {
    buildProgress(idx);
  }
}

function buildProgress(idx) {
  const track = $('#progress-track');
  const label = $('#progress-label');
  track.innerHTML = '';

  AREAS.forEach((area, i) => {
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'progress-line' + (i <= idx ? ' done' : '');
      track.appendChild(line);
    }
    const dot = document.createElement('button');
    dot.className = 'progress-dot';
    if (i < idx) dot.classList.add('done');
    if (i === idx) dot.classList.add('active');
    dot.innerHTML = `<svg><use href="#${area.icon}"/></svg>`;
    dot.addEventListener('click', () => goStep(i));
    track.appendChild(dot);
  });

  label.innerHTML = `Passo <strong>${idx + 1}</strong> di 5 &mdash; ${AREAS[idx].title}`;
}

// Full progress bar: Home + 5 sections + Summary — highlights current
// `active` can be a section index (0-4), 'summary', or 'feedback'
function buildFullProgress(active) {
  const track = $('#progress-track');
  const label = $('#progress-label');
  track.innerHTML = '';

  const isSectionActive = typeof active === 'number';
  const isSummary = active === 'summary';
  const isFeedback = active === 'feedback';

  // Home dot
  const homeDot = document.createElement('button');
  homeDot.className = 'progress-dot done';
  homeDot.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/></svg>`;
  homeDot.addEventListener('click', () => showView('home'));
  track.appendChild(homeDot);

  // Section dots
  AREAS.forEach((area, i) => {
    const line = document.createElement('div');
    line.className = 'progress-line done';
    track.appendChild(line);

    const dot = document.createElement('button');
    dot.className = 'progress-dot';
    if (isSectionActive && i === active) {
      dot.classList.add('active');
    } else {
      dot.classList.add('done');
    }
    dot.innerHTML = `<svg><use href="#${area.icon}"/></svg>`;
    dot.addEventListener('click', () => goStep(i));
    track.appendChild(dot);
  });

  // Summary dot
  const sumLine = document.createElement('div');
  sumLine.className = 'progress-line done';
  track.appendChild(sumLine);

  const sumDot = document.createElement('button');
  sumDot.className = 'progress-dot' + (isSummary ? ' active' : ' done');
  sumDot.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
  sumDot.addEventListener('click', () => showView('summary'));
  track.appendChild(sumDot);

  // Label
  if (isSectionActive) {
    label.innerHTML = `Passo <strong>${active + 1}</strong> di 5 &mdash; ${AREAS[active].title}`;
  } else if (isSummary) {
    label.innerHTML = `<strong>Riepilogo</strong>`;
  } else if (isFeedback) {
    label.innerHTML = `<strong>Feedback</strong>`;
  }
}

// ═══════════════════════════════════════════
// HOME TIMELINE
// ═══════════════════════════════════════════
function setupHomeTimeline() {
  const tl = $('#home-timeline');
  AREAS.forEach((area, i) => {
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'tl-line';
      tl.appendChild(line);
    }
    const icon = document.createElement('div');
    icon.className = 'tl-icon';
    icon.innerHTML = `
      <div class="tl-icon-circle"><svg><use href="#${area.icon}"/></svg></div>
      <span class="tl-icon-label">${area.title}</span>
    `;
    tl.appendChild(icon);
  });

  $('#btn-start').addEventListener('click', () => goStep(0));
}

// ═══════════════════════════════════════════
// STEP RENDERING
// ═══════════════════════════════════════════
function renderStep(idx) {
  const area = AREAS[idx];
  const areaData = userData.areas?.[area.id] || {};
  const container = $('#step-content');

  let html = '';

  // Header
  html += `
    <div class="section-header">
      <div class="icon-wrap"><svg><use href="#${area.icon}"/></svg></div>
      <h2>${area.title}</h2>
      <p class="subtitle">${area.subtitle}</p>
    </div>
  `;

  // Gospel (for fede)
  if (area.gospel) {
    html += `<div class="gospel"><div class="ref">${area.gospel.ref}</div>`;
    area.gospel.paragraphs.forEach(p => { html += `<p>${p}</p>`; });
    html += `</div>`;
  }

  // Stimuli
  area.stimuli.forEach(s => {
    html += `
      <div class="card">
        <div class="card-label">${s.label}</div>
        <h3>${s.title}</h3>
        <div class="embed-wrap">
          <iframe src="${s.url}" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    `;
  });

  // Quotes
  area.quotes.forEach(q => {
    html += `<div class="quote-block">"${q.text}"`;
    if (q.cite) html += `<cite>${q.cite}</cite>`;
    html += `</div>`;
  });

  // Body note
  if (area.bodyNote) {
    html += `<p class="body-note">${area.bodyNote}</p>`;
  }

  // Questions
  html += `<div class="domande"><div class="domande-title">Domande per riflettere</div>`;
  area.questions.forEach((q, qi) => {
    const savedAnswer = areaData.answers?.[`q${qi}`] || '';
    html += `
      <div class="domanda-block">
        <div class="domanda-text" data-n="${qi + 1}">${q}</div>
        <textarea class="domanda-answer" data-area="${area.id}" data-q="q${qi}"
          placeholder="Scrivi qui la tua risposta...">${savedAnswer}</textarea>
      </div>
    `;
  });
  html += `</div>`;

  // Scoring
  const doveSono = areaData.doveSono ?? 5;
  const doveVado = areaData.doveVado ?? 5;

  html += `
    <div class="scoring">
      <div class="scoring-title">Il tuo punteggio</div>

      <div class="score-item">
        <label>Dove ti trovi oggi in quest'area?</label>
        <div class="score-row">
          <input type="range" min="1" max="10" value="${doveSono}"
            class="score-slider score-current" data-area="${area.id}" data-field="doveSono" />
          <span class="score-value current" id="sv-${area.id}-current">${doveSono}</span>
        </div>
        <div class="score-labels"><span>1 — Lontano</span><span>10 — Raggiunto</span></div>
      </div>

      <div class="score-item">
        <label>Dove vorresti arrivare?</label>
        <div class="score-row">
          <input type="range" min="1" max="10" value="${doveVado}"
            class="score-slider score-goal" data-area="${area.id}" data-field="doveVado" />
          <span class="score-value goal" id="sv-${area.id}-goal">${doveVado}</span>
        </div>
        <div class="score-labels"><span>1 — Lontano</span><span>10 — Raggiunto</span></div>
      </div>
    </div>
  `;

  // Nav
  html += `<div class="step-nav">`;
  if (idx > 0) {
    html += `<button class="btn-prev" id="btn-step-prev">&larr; ${AREAS[idx - 1].title}</button>`;
  }
  if (idx < AREAS.length - 1) {
    html += `<button class="btn-next" id="btn-step-next">Avanti: ${AREAS[idx + 1].title} &rarr;</button>`;
  } else {
    html += `<button class="btn-next" id="btn-step-finish">Vedi il riepilogo &rarr;</button>`;
  }
  html += `</div>`;

  container.innerHTML = html;

  // Event listeners
  container.querySelectorAll('.domanda-answer').forEach(ta => {
    ta.addEventListener('input', (e) => {
      const areaId = e.target.dataset.area;
      const qKey = e.target.dataset.q;
      if (!userData.areas) userData.areas = {};
      if (!userData.areas[areaId]) userData.areas[areaId] = {};
      if (!userData.areas[areaId].answers) userData.areas[areaId].answers = {};
      userData.areas[areaId].answers[qKey] = e.target.value;
      debounceSave();
    });
  });

  container.querySelectorAll('.score-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const areaId = e.target.dataset.area;
      const field = e.target.dataset.field;
      const val = parseInt(e.target.value);
      if (!userData.areas) userData.areas = {};
      if (!userData.areas[areaId]) userData.areas[areaId] = {};
      userData.areas[areaId][field] = val;
      const label = field === 'doveSono' ? 'current' : 'goal';
      $(`#sv-${areaId}-${label}`).textContent = val;
      debounceSave();
    });
  });

  const prevBtn = container.querySelector('#btn-step-prev');
  if (prevBtn) prevBtn.addEventListener('click', () => goStep(idx - 1));

  const nextBtn = container.querySelector('#btn-step-next');
  if (nextBtn) nextBtn.addEventListener('click', () => goStep(idx + 1));

  const finishBtn = container.querySelector('#btn-step-finish');
  if (finishBtn) finishBtn.addEventListener('click', () => showView('summary'));
}

// ═══════════════════════════════════════════
// DB PERSISTENCE
// ═══════════════════════════════════════════
function debounceSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToFirestore(), 1500);
}

async function saveToFirestore() {
  if (!currentUser) return;
  try {
    userData.lastUpdated = new Date().toISOString();
    const userRef = doc(db, 'users', currentUser.docId);
    await setDoc(userRef, userData);
    flashSaved();
  } catch (err) {
    console.error('Save failed:', err);
  }
}

// ═══════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════
function renderSummary() {
  renderRadarChart();
  renderObjectives();
  renderActions();
}

function renderRadarChart() {
  const canvas = $('#radar-chart');
  const ctx = canvas.getContext('2d');

  const labels = AREAS.map(a => a.title);
  const doveSonoData = AREAS.map(a => userData.areas?.[a.id]?.doveSono ?? 5);
  const doveVadoData = AREAS.map(a => userData.areas?.[a.id]?.doveVado ?? 5);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Dove sono oggi',
          data: doveSonoData,
          backgroundColor: 'rgba(70, 38, 120, 0.15)',
          borderColor: '#462678',
          borderWidth: 2,
          pointBackgroundColor: '#462678',
          pointRadius: 4
        },
        {
          label: 'Dove voglio andare',
          data: doveVadoData,
          backgroundColor: 'rgba(231, 64, 48, 0.12)',
          borderColor: '#E74030',
          borderWidth: 2,
          pointBackgroundColor: '#E74030',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2, font: { size: 10 } },
          pointLabels: { font: { family: "'Roboto Slab', serif", size: 12, weight: 600 } }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: "'Roboto', sans-serif", size: 12 }, padding: 16 }
        }
      }
    }
  });
}

function renderObjectives() {
  const list = $('#objectives-list');
  const objectives = userData.objectives || ['', ''];
  list.innerHTML = '';
  objectives.forEach((obj, i) => {
    list.innerHTML += `
      <div class="obj-input-row">
        <span class="obj-num">${i + 1}</span>
        <input type="text" class="obj-input" data-type="objectives" data-idx="${i}"
          placeholder="Obiettivo ${i + 1}..." value="${obj}" />
      </div>
    `;
  });
  attachObjListeners(list);
}

function renderActions() {
  const list = $('#actions-list');
  const actions = userData.actions || ['', ''];
  list.innerHTML = '';
  actions.forEach((act, i) => {
    list.innerHTML += `
      <div class="obj-input-row">
        <span class="obj-num">${i + 1}</span>
        <input type="text" class="obj-input" data-type="actions" data-idx="${i}"
          placeholder="Azione concreta ${i + 1}..." value="${act}" />
      </div>
    `;
  });
  attachObjListeners(list);
}

function attachObjListeners(container) {
  container.querySelectorAll('.obj-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const type = e.target.dataset.type;
      const idx = parseInt(e.target.dataset.idx);
      if (!userData[type]) userData[type] = [];
      userData[type][idx] = e.target.value;
      debounceSave();
    });
  });
}

function setupSummaryButtons() {
  $('#btn-add-obj').addEventListener('click', () => {
    if (!userData.objectives) userData.objectives = [];
    if (userData.objectives.length >= 5) return;
    userData.objectives.push('');
    renderObjectives();
    debounceSave();
  });

  $('#btn-add-action').addEventListener('click', () => {
    if (!userData.actions) userData.actions = [];
    if (userData.actions.length >= 5) return;
    userData.actions.push('');
    renderActions();
    debounceSave();
  });

  $('#btn-export-pdf').addEventListener('click', async () => {
    await exportPDF();
    showView('feedback');
  });

  $('#btn-back-io').addEventListener('click', () => goStep(AREAS.length - 1));

  $('#btn-back-home').addEventListener('click', () => showView('home'));

  $('#btn-logout').addEventListener('click', () => {
    currentUser = null;
    userData = {};
    pin = '';
    reachedSummary = false;
    $$('#pin-dots .pin-dot').forEach(d => d.classList.remove('filled'));
    $('#login-name').value = '';
    $('#login-error').textContent = '';
    $('#btn-login').textContent = 'Entra';
    $('#screen-app').classList.remove('active');
    $('#screen-login').classList.add('active');
  });
}

// ═══════════════════════════════════════════
// FEEDBACK VIEW
// ═══════════════════════════════════════════
function renderFeedback() {
  const container = $('#feedback-content');
  const saved = userData.feedback || {};

  // Restore saved state
  container.querySelectorAll('.feedback-star').forEach(s => {
    s.classList.toggle('active', saved.rating && parseInt(s.dataset.val) <= saved.rating);
  });
  $('#feedback-comment').value = saved.comment || '';
}

function setupFeedbackButtons() {
  // Star rating
  $$('#view-feedback .feedback-star').forEach(star => {
    star.addEventListener('click', (e) => {
      const val = parseInt(e.target.closest('.feedback-star').dataset.val);
      $$('#view-feedback .feedback-star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.val) <= val);
      });
      if (!userData.feedback) userData.feedback = {};
      userData.feedback.rating = val;
      debounceSave();
    });
  });

  // Comment
  $('#feedback-comment').addEventListener('input', (e) => {
    if (!userData.feedback) userData.feedback = {};
    userData.feedback.comment = e.target.value;
    debounceSave();
  });

  // Navigation
  $('#btn-fb-home').addEventListener('click', () => showView('home'));
  $('#btn-fb-logout').addEventListener('click', () => {
    currentUser = null;
    userData = {};
    pin = '';
    reachedSummary = false;
    $$('#pin-dots .pin-dot').forEach(d => d.classList.remove('filled'));
    $('#login-name').value = '';
    $('#login-error').textContent = '';
    $('#btn-login').textContent = 'Entra';
    $('#screen-app').classList.remove('active');
    $('#screen-login').classList.add('active');
  });
}

// ═══════════════════════════════════════════
// LOGO PRELOAD
// ═══════════════════════════════════════════
let logoDataUrl = null;

function preloadLogo() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    logoDataUrl = canvas.toDataURL('image/png');
  };
  img.src = 'assets/logo.png';
}

// ═══════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════
async function exportPDF() {
  const btn = $('#btn-export-pdf');
  btn.disabled = true;
  btn.textContent = 'Generazione PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 0;

    // Helper: draw page footer
    function drawFooter(pg) {
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      pdf.text('Punto della Strada — Clan Strada Facendo — 19 aprile 2026', pageW / 2, pageH - 10, { align: 'center' });
    }

    // Helper: thin accent line
    function drawAccentLine(yPos) {
      pdf.setDrawColor(70, 38, 120);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageW - margin, yPos);
    }

    // ── Cover page ──
    // Subtle top bar
    pdf.setFillColor(70, 38, 120);
    pdf.rect(0, 0, pageW, 3, 'F');

    y = 55;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(70, 38, 120);
    pdf.text('Punto della Strada', pageW / 2, y, { align: 'center' });

    y += 12;
    pdf.setFontSize(14);
    pdf.setTextColor(231, 64, 48);
    pdf.text('R / S', pageW / 2, y, { align: 'center' });

    y += 16;
    drawAccentLine(y);
    y += 12;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Clan Strada Facendo', pageW / 2, y, { align: 'center' });
    y += 7;
    pdf.text('Domenica 19 aprile 2026', pageW / 2, y, { align: 'center' });

    y += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(33, 22, 56);
    pdf.text(currentUser.name, pageW / 2, y, { align: 'center' });

    // Logo at bottom center of cover
    if (logoDataUrl) {
      const logoSize = 35;
      pdf.addImage(logoDataUrl, 'PNG', (pageW - logoSize) / 2, pageH - 60, logoSize, logoSize);
    }

    drawFooter();

    // ── Area pages ──
    AREAS.forEach(area => {
      pdf.addPage();
      y = margin;

      // Colored header bar
      pdf.setFillColor(70, 38, 120);
      pdf.rect(0, 0, pageW, 3, 'F');

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(70, 38, 120);
      pdf.text(area.title, margin, y + 2);
      y += 10;

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(107, 102, 96);
      pdf.text(area.subtitle, margin, y);
      y += 6;

      drawAccentLine(y);
      y += 10;

      // Scores box
      const areaData = userData.areas?.[area.id] || {};
      const doveSono = areaData.doveSono ?? 5;
      const doveVado = areaData.doveVado ?? 5;

      pdf.setFillColor(247, 245, 242);
      pdf.roundedRect(margin, y, contentW, 22, 3, 3, 'F');

      // Score bar visuals
      const barW = 50;
      const barH = 4;
      const barX = margin + 55;

      // Dove sono
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(70, 38, 120);
      pdf.text(`Dove sono oggi:`, margin + 5, y + 8);
      pdf.setFillColor(220, 215, 230);
      pdf.roundedRect(barX, y + 4.5, barW, barH, 1.5, 1.5, 'F');
      pdf.setFillColor(70, 38, 120);
      pdf.roundedRect(barX, y + 4.5, barW * (doveSono / 10), barH, 1.5, 1.5, 'F');
      pdf.text(`${doveSono}/10`, barX + barW + 4, y + 8);

      // Dove vado
      pdf.setTextColor(231, 64, 48);
      pdf.text(`Dove voglio andare:`, margin + 5, y + 17);
      pdf.setFillColor(250, 220, 218);
      pdf.roundedRect(barX, y + 13.5, barW, barH, 1.5, 1.5, 'F');
      pdf.setFillColor(231, 64, 48);
      pdf.roundedRect(barX, y + 13.5, barW * (doveVado / 10), barH, 1.5, 1.5, 'F');
      pdf.text(`${doveVado}/10`, barX + barW + 4, y + 17);

      y += 30;

      // Questions & Answers
      area.questions.forEach((q, qi) => {
        const answer = areaData.answers?.[`q${qi}`] || '(nessuna risposta)';

        if (y > 255) { pdf.addPage(); y = margin; pdf.setFillColor(70, 38, 120); pdf.rect(0, 0, pageW, 3, 'F'); drawFooter(); }

        // Question number badge
        pdf.setFillColor(231, 64, 48);
        pdf.circle(margin + 3, y - 1.2, 3, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${qi + 1}`, margin + 3, y, { align: 'center' });

        // Question text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(26, 26, 26);
        const qLines = pdf.splitTextToSize(q, contentW - 12);
        pdf.text(qLines, margin + 9, y);
        y += qLines.length * 4.5 + 3;

        // Answer text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(60, 60, 60);
        const aLines = pdf.splitTextToSize(answer, contentW - 6);
        pdf.text(aLines, margin + 6, y);
        y += aLines.length * 4.5 + 10;
      });

      drawFooter();
    });

    // ── Radar chart page ──
    pdf.addPage();
    pdf.setFillColor(70, 38, 120);
    pdf.rect(0, 0, pageW, 3, 'F');
    y = margin;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(70, 38, 120);
    pdf.text('Riepilogo', margin, y + 2);
    y += 8;
    drawAccentLine(y);
    y += 8;

    // Add radar chart as image
    if (radarChart) {
      const chartImg = radarChart.toBase64Image();
      const chartSize = 110;
      pdf.addImage(chartImg, 'PNG', (pageW - chartSize) / 2, y, chartSize, chartSize);
      y += chartSize + 12;
    }

    // Objectives
    const objectives = (userData.objectives || []).filter(o => o.trim());
    if (objectives.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(70, 38, 120);
      pdf.text('I miei obiettivi', margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      objectives.forEach((obj, i) => {
        pdf.setFillColor(70, 38, 120);
        pdf.circle(margin + 3, y - 1.2, 2.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${i + 1}`, margin + 3, y, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        pdf.text(obj, margin + 9, y);
        y += 7;
      });
      y += 6;
    }

    // Actions
    const actions = (userData.actions || []).filter(a => a.trim());
    if (actions.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(231, 64, 48);
      pdf.text('Come ci arrivo', margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      actions.forEach((act, i) => {
        pdf.setFillColor(231, 64, 48);
        pdf.circle(margin + 3, y - 1.2, 2.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${i + 1}`, margin + 3, y, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        pdf.text(act, margin + 9, y);
        y += 7;
      });
    }

    drawFooter();

    pdf.save(`PuntoDellaStrada_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('Errore nella generazione del PDF. Riprova.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Esporta PDF';
  }
}
