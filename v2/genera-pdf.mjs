import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_URL = 'https://puntodellastrada-42-2026.web.app';

const AREAS = [
  {
    title: 'Strada',
    subtitle: 'Camminare \u00e8 gi\u00e0 una risposta.',
    questions: [
      'Che cosa intendi quando dici "sono sulla strada"?',
      'Dove pensi di essere adesso nel tuo cammino di Rover/Scolta?',
      "C'\u00e8 qualcosa che ti ha fermato ultimamente: una fatica, un dubbio, una pausa? Come l'hai affrontata e come ti ha cambiato?"
    ]
  },
  {
    title: 'Fede',
    subtitle: 'Il Vangelo di Emmaus: i discepoli che camminano senza riconoscerlo.',
    questions: [
      'Rileggi il brano lentamente, nota i dettagli, nomi, luoghi, emozioni, dialoghi. Quale parola o frase ti colpisce di pi\u00f9?',
      'In cosa ti senti simile ai discepoli di Emmaus?',
      '"Non ardeva forse in noi il nostro cuore?" Quando \u00e8 stata l\'ultima volta che hai sentito ardere il cuore? Cosa fa ardere il cuore nella tua vita?',
      'Sento che il cuore arde quando ascolto il Signore?',
      'Cerco attivamente un momento per coltivare questa relazione?'
    ]
  },
  {
    title: 'Servizio',
    subtitle: 'Non per chi lo fa. Per chi ne ha bisogno.',
    questions: [
      "Quando fai servizio, lo fai per gli altri o anche per te stesso? C'\u00e8 differenza?",
      "C'\u00e8 un momento in cui il servizio ti ha cambiato, in cui hai ricevuto pi\u00f9 di quanto hai dato? Che cosa hai dato di te e cosa hai ricevuto in cambio?",
      'Qual \u00e8 la forma di servizio che senti pi\u00f9 tua in questo periodo della tua vita?'
    ]
  },
  {
    title: 'Comunit\u00e0',
    subtitle: 'Il clan, la vita, gli altri. Il "tu" che \u00e8 fratello.',
    questions: [
      'In clan, chi senti davvero come compagno di strada in questo momento? Perch\u00e9 gli altri non li senti tali?',
      'Nella comunit\u00e0 pi\u00f9 larga (scuola, lavoro, paese, ...) c\'\u00e8 un "tu" che senti come fratello o sorella? Come lo vivi?',
      'Come ti relazioni nei confronti di quello che sta succedendo nel resto del mondo? Ti senti parte di questa comunit\u00e0?',
      'Quali sono le fatiche che senti nel far parte di queste comunit\u00e0? Che cosa ti danno che non ti aspettavi?'
    ]
  },
  {
    title: 'Io',
    subtitle: 'Il mio essere sulla strada. Dove sono adesso.',
    questions: [
      'Dove senti di essere adesso nel tuo cammino di vita?',
      "C'\u00e8 qualcosa di te che stai scoprendo in questo periodo? Qualcosa che stai perdendo?",
      'Che sogno hai per la tua vita?'
    ]
  }
];

const PURPLE = [70, 38, 120];
const RED    = [231, 64, 48];
const GREY   = [107, 102, 96];
const LIGHT  = [247, 245, 242];
const WHITE  = [255, 255, 255];

// A5 dimensions
const pageW = 148;
const pageH = 210;
const margin = 14;
const contentW = pageW - margin * 2;

function drawTopBar(pdf) {
  pdf.setFillColor(...PURPLE);
  pdf.rect(0, 0, pageW, 2.5, 'F');
  pdf.setDrawColor(...RED);
  pdf.setLineWidth(0.25);
  pdf.line(0, 2.8, pageW, 2.8);
}

function drawFooter(pdf) {
  pdf.setFontSize(5.5);
  pdf.setTextColor(180, 180, 180);
  pdf.text('Punto della Strada \u2014 Clan Strada Facendo', pageW / 2, pageH - 7, { align: 'center' });
}

function drawAccentLine(pdf, yPos) {
  pdf.setDrawColor(...PURPLE);
  pdf.setLineWidth(0.4);
  pdf.line(margin, yPos, pageW - margin, yPos);
}

function drawDottedLines(pdf, startY, count, spacing) {
  for (let i = 0; i < count; i++) {
    const ly = startY + i * spacing;
    pdf.setDrawColor(200, 195, 190);
    pdf.setLineWidth(0.15);
    const dashLen = 1.2;
    const gap = 1.8;
    for (let x = margin; x < pageW - margin; x += dashLen + gap) {
      const end = Math.min(x + dashLen, pageW - margin);
      pdf.line(x, ly, end, ly);
    }
  }
  return startY + count * spacing;
}

async function main() {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  let y = 0;

  // Generate QR as base64 PNG
  const qrDataUrl = await QRCode.toDataURL(PUBLIC_URL, {
    width: 400,
    margin: 1,
    color: { dark: '#462678', light: '#ffffff' }
  });

  // Load logo
  let logoDataUrl = null;
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath);
    logoDataUrl = 'data:image/png;base64,' + buf.toString('base64');
  }

  // ════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════
  drawTopBar(pdf);

  y = 32;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(...PURPLE);
  pdf.text('Punto della Strada', pageW / 2, y, { align: 'center' });

  y += 9;
  pdf.setFontSize(11);
  pdf.setTextColor(...RED);
  pdf.text('R / S', pageW / 2, y, { align: 'center' });

  y += 8;
  drawAccentLine(pdf, y);
  y += 9;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text('Clan Strada Facendo', pageW / 2, y, { align: 'center' });
  y += 5;
  pdf.text('19 aprile 2026', pageW / 2, y, { align: 'center' });

  // QR Code
  y += 12;
  const qrSize = 34;
  pdf.addImage(qrDataUrl, 'PNG', (pageW - qrSize) / 2, y, qrSize, qrSize);
  y += qrSize + 7;

  // Instructions
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...PURPLE);
  pdf.text('Come funziona:', pageW / 2, y, { align: 'center' });
  y += 5.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GREY);
  const instructions = [
    '1.  Inquadra il QR code con il telefono',
    '2.  Inserisci il tuo nome e scegli il tuo codice',
    '3.  Puoi rispondere con penna nel tuo quaderno di caccia',
    '     oppure in digitale dal telefono',
  ];
  instructions.forEach(line => {
    pdf.text(line, pageW / 2, y, { align: 'center' });
    y += 4.5;
  });

  y += 3;
  pdf.setFillColor(...PURPLE);
  pdf.roundedRect(pageW / 2 - 8, y, 16, 0.5, 0.25, 0.25, 'F');

  // Logo at bottom
  if (logoDataUrl) {
    const logoSize = 22;
    pdf.addImage(logoDataUrl, 'PNG', (pageW - logoSize) / 2, pageH - 34, logoSize, logoSize);
  }

  drawFooter(pdf);

  // ════════════════════════════════════════
  // PAGE 2 — NAME + first area starts
  // ════════════════════════════════════════
  pdf.addPage();
  drawTopBar(pdf);
  drawFooter(pdf);
  y = margin + 6;

  // Name field
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...PURPLE);
  pdf.text('Nome:', margin, y);
  pdf.setDrawColor(...PURPLE);
  pdf.setLineWidth(0.4);
  pdf.line(margin + 16, y + 0.5, pageW - margin, y + 0.5);

  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  pdf.text('Codice:', margin, y);
  pdf.setDrawColor(200, 195, 190);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 16, y + 0.5, margin + 50, y + 0.5);

  y += 14;

  // ════════════════════════════════════════
  // AREA PAGES
  // ════════════════════════════════════════
  function ensureSpace(needed) {
    if (y + needed > pageH - 14) {
      pdf.addPage();
      drawTopBar(pdf);
      drawFooter(pdf);
      y = margin + 4;
      return true;
    }
    return false;
  }

  AREAS.forEach((area, areaIdx) => {
    // New page for each area (except first which starts on page 2)
    if (areaIdx > 0) {
      pdf.addPage();
      drawTopBar(pdf);
      drawFooter(pdf);
      y = margin + 4;
    }

    // Area title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...PURPLE);
    pdf.text(area.title, margin, y);
    y += 6;

    // Subtitle
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GREY);
    const subLines = pdf.splitTextToSize(area.subtitle, contentW);
    pdf.text(subLines, margin, y);
    y += subLines.length * 3.5 + 2;

    drawAccentLine(pdf, y);
    y += 8;

    // Questions
    area.questions.forEach((q, qi) => {
      const qLines = pdf.splitTextToSize(q, contentW - 10);
      // More lines for areas with fewer questions
      const answerLines = area.questions.length <= 3 ? 7 : 5;
      const lineSpacing = 5.5;
      const neededSpace = qLines.length * 4 + answerLines * lineSpacing + 14;

      ensureSpace(neededSpace);

      // Question number badge (red circle)
      pdf.setFillColor(...RED);
      pdf.circle(margin + 3, y - 1, 3, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...WHITE);
      pdf.text(`${qi + 1}`, margin + 3, y + 0.2, { align: 'center' });

      // Question text
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(50, 45, 40);
      pdf.text(qLines, margin + 9, y);
      y += qLines.length * 4 + 4;

      // Dotted answer lines
      y = drawDottedLines(pdf, y, answerLines, lineSpacing);
      y += 6;
    });
  });

  // ════════════════════════════════════════
  // RADAR CHART PAGE (empty grid)
  // ════════════════════════════════════════
  pdf.addPage();
  drawTopBar(pdf);
  drawFooter(pdf);
  y = margin + 4;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...PURPLE);
  pdf.text('La mia mappa', margin, y);
  y += 4;
  drawAccentLine(pdf, y);
  y += 6;

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  pdf.text('Segna su ogni asse dove sei oggi e dove vuoi arrivare.', margin, y);
  y += 10;

  // Draw radar chart
  {
    const labels = AREAS.map(a => a.title);
    const n = labels.length;
    const cx = pageW / 2;
    const cy = y + 48;
    const maxR = 42;
    const rings = 5; // concentric rings (2, 4, 6, 8, 10)

    // Calculate vertex positions
    function vertex(i, r) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    }

    // Draw concentric pentagons (grid rings)
    for (let ring = 1; ring <= rings; ring++) {
      const r = (maxR / rings) * ring;
      pdf.setDrawColor(215, 210, 225);
      pdf.setLineWidth(ring === rings ? 0.3 : 0.15);

      for (let i = 0; i < n; i++) {
        const a = vertex(i, r);
        const b = vertex((i + 1) % n, r);
        pdf.line(a.x, a.y, b.x, b.y);
      }
    }

    // Draw axis lines from center to each vertex
    for (let i = 0; i < n; i++) {
      const v = vertex(i, maxR);
      pdf.setDrawColor(190, 185, 200);
      pdf.setLineWidth(0.2);
      pdf.line(cx, cy, v.x, v.y);
    }

    // Draw scale numbers along first axis (top)
    for (let ring = 1; ring <= rings; ring++) {
      const r = (maxR / rings) * ring;
      const v = vertex(0, r);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5);
      pdf.setTextColor(180, 175, 190);
      pdf.text(`${ring * 2}`, v.x + 2, v.y + 1);
    }

    // Draw labels
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...PURPLE);

    for (let i = 0; i < n; i++) {
      const v = vertex(i, maxR + 7);
      const align = Math.abs(v.x - cx) < 1 ? 'center' : v.x < cx ? 'right' : 'left';
      const labelY = i === 0 ? v.y - 1 : v.y + 1;
      pdf.text(labels[i], v.x, labelY, { align });
    }

    // Center dot
    pdf.setFillColor(...PURPLE);
    pdf.circle(cx, cy, 0.8, 'F');

    y = cy + maxR + 16;
  }

  // Legend
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);

  // "Dove sono" legend
  pdf.setFillColor(...PURPLE);
  pdf.roundedRect(margin + 10, y - 1.5, 8, 2.5, 0.8, 0.8, 'F');
  pdf.setTextColor(...PURPLE);
  pdf.text('Dove sono oggi', margin + 20, y);

  // "Dove voglio andare" legend
  pdf.setFillColor(...RED);
  pdf.roundedRect(margin + 55, y - 1.5, 8, 2.5, 0.8, 0.8, 'F');
  pdf.setTextColor(...RED);
  pdf.text('Dove voglio arrivare', margin + 65, y);

  // ════════════════════════════════════════
  // LAST PAGE — Notes
  // ════════════════════════════════════════
  pdf.addPage();
  drawTopBar(pdf);
  drawFooter(pdf);
  y = margin + 4;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...PURPLE);
  pdf.text('Note', margin, y);
  y += 4;
  drawAccentLine(pdf, y);
  y += 8;

  drawDottedLines(pdf, y, 28, 6);

  // ── Save ──
  const outPath = path.join(__dirname, 'Punto_della_Strada_Fogli_Risposte.pdf');
  fs.writeFileSync(outPath, Buffer.from(pdf.output('arraybuffer')));
  console.log('PDF salvato in:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
