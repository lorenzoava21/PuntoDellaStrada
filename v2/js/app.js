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

// ─── DOM refs ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  setupHomeTimeline();
  setupSummaryButtons();
  addSaveIndicator();
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
    $('#progress').classList.remove('visible');
    renderSummary();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goStep(idx) {
  currentStep = idx;
  renderStep(idx);
  showView('step');
  buildProgress(idx);
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
        <div class="score-labels"><span>1 — Lontano</span><span>10 — Sono arrivato</span></div>
      </div>

      <div class="score-item">
        <label>Dove vorresti arrivare?</label>
        <div class="score-row">
          <input type="range" min="1" max="10" value="${doveVado}"
            class="score-slider score-goal" data-area="${area.id}" data-field="doveVado" />
          <span class="score-value goal" id="sv-${area.id}-goal">${doveVado}</span>
        </div>
        <div class="score-labels"><span>1 — Non prioritario</span><span>10 — Il mio obiettivo</span></div>
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

  $('#btn-export-pdf').addEventListener('click', exportPDF);

  $('#btn-back-home').addEventListener('click', () => showView('home'));

  $('#btn-logout').addEventListener('click', () => {
    currentUser = null;
    userData = {};
    pin = '';
    $$('#pin-dots .pin-dot').forEach(d => d.classList.remove('filled'));
    $('#login-name').value = '';
    $('#login-error').textContent = '';
    $('#btn-login').textContent = 'Entra';
    $('#screen-app').classList.remove('active');
    $('#screen-login').classList.add('active');
  });
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
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── Cover page ──
    y = 60;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(70, 38, 120);
    pdf.text('Punto della Strada', pageW / 2, y, { align: 'center' });
    y += 14;
    pdf.setFontSize(14);
    pdf.setTextColor(231, 64, 48);
    pdf.text('R / S', pageW / 2, y, { align: 'center' });
    y += 20;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Clan Strada Facendo', pageW / 2, y, { align: 'center' });
    y += 8;
    pdf.text('Domenica 19 aprile 2026', pageW / 2, y, { align: 'center' });
    y += 20;
    pdf.setFontSize(16);
    pdf.setTextColor(33, 22, 56);
    pdf.text(currentUser.name, pageW / 2, y, { align: 'center' });

    // ── Area pages ──
    AREAS.forEach(area => {
      pdf.addPage();
      y = margin;

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(70, 38, 120);
      pdf.text(area.title, margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 102, 96);
      pdf.text(area.subtitle, margin, y);
      y += 14;

      // Scores
      const areaData = userData.areas?.[area.id] || {};
      const doveSono = areaData.doveSono ?? 5;
      const doveVado = areaData.doveVado ?? 5;

      pdf.setFillColor(247, 245, 242);
      pdf.roundedRect(margin, y, contentW, 20, 3, 3, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(70, 38, 120);
      pdf.text(`Dove sono oggi: ${doveSono}/10`, margin + 8, y + 8);
      pdf.setTextColor(231, 64, 48);
      pdf.text(`Dove voglio andare: ${doveVado}/10`, margin + 8, y + 16);
      y += 28;

      // Questions & Answers
      area.questions.forEach((q, qi) => {
        const answer = areaData.answers?.[`q${qi}`] || '(nessuna risposta)';

        if (y > 260) { pdf.addPage(); y = margin; }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(231, 64, 48);
        pdf.text(`${qi + 1}.`, margin, y);
        pdf.setTextColor(26, 26, 26);
        const qLines = pdf.splitTextToSize(q, contentW - 8);
        pdf.text(qLines, margin + 6, y);
        y += qLines.length * 5 + 4;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const aLines = pdf.splitTextToSize(answer, contentW - 4);
        pdf.text(aLines, margin + 4, y);
        y += aLines.length * 5 + 10;
      });
    });

    // ── Radar chart page ──
    pdf.addPage();
    y = margin;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(70, 38, 120);
    pdf.text('Riepilogo', margin, y);
    y += 12;

    // Add radar chart as image
    if (radarChart) {
      const chartImg = radarChart.toBase64Image();
      const chartSize = 120;
      pdf.addImage(chartImg, 'PNG', (pageW - chartSize) / 2, y, chartSize, chartSize);
      y += chartSize + 14;
    }

    // Objectives
    const objectives = (userData.objectives || []).filter(o => o.trim());
    if (objectives.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(33, 22, 56);
      pdf.text('I miei obiettivi', margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      objectives.forEach((obj, i) => {
        pdf.text(`${i + 1}. ${obj}`, margin + 4, y);
        y += 6;
      });
      y += 6;
    }

    // Actions
    const actions = (userData.actions || []).filter(a => a.trim());
    if (actions.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(33, 22, 56);
      pdf.text('Come ci arrivo', margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      actions.forEach((act, i) => {
        pdf.text(`${i + 1}. ${act}`, margin + 4, y);
        y += 6;
      });
    }

    pdf.save(`PuntoDellaStrada_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('Errore nella generazione del PDF. Riprova.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Esporta PDF';
  }
}
