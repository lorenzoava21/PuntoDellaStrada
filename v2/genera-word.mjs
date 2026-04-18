import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  HeadingLevel, BorderStyle, TabStopPosition, TabStopType,
  PageBreak, SectionType, convertMillimetersToTwip
} from 'docx';
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

const PURPLE = '462678';
const RED = 'E74030';
const GREY = '6B6660';

function blankLines(count) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push(new Paragraph({
      spacing: { after: 80 },
      border: {
        bottom: { style: BorderStyle.DOTTED, size: 1, color: 'C8C3BE', space: 1 }
      },
      children: [new TextRun({ text: '', size: 20 })]
    }));
  }
  return lines;
}

async function main() {
  const children = [];

  // ── Cover page ──
  children.push(
    new Paragraph({ spacing: { before: 2400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'Punto della Strada', bold: true, size: 52, color: PURPLE, font: 'Helvetica' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: 'R / S', bold: true, size: 22, color: RED })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'Clan Strada Facendo', size: 18, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: '19 aprile 2026', size: 18, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'Come funziona:', bold: true, size: 16, color: PURPLE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: `1.  Vai su ${PUBLIC_URL}`, size: 15, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: '2.  Inserisci il tuo nome e scegli il tuo codice', size: 15, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: '3.  Puoi rispondere con penna nel tuo quaderno di caccia', size: 15, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: '     oppure in digitale dal telefono', size: 15, color: GREY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Punto della Strada \u2014 Clan Strada Facendo', size: 11, color: 'B4B4B4' })]
    })
  );

  // ── Name page ──
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'Nome: ', bold: true, size: 20, color: PURPLE }),
        new TextRun({ text: '_______________________________________________', size: 20, color: PURPLE })
      ]
    }),
    new Paragraph({
      spacing: { after: 600 },
      children: [
        new TextRun({ text: 'Codice: ', size: 14, color: 'A0A0A0' }),
        new TextRun({ text: '________________', size: 14, color: 'C8C3BE' })
      ]
    })
  );

  // ── Area pages ──
  AREAS.forEach((area, areaIdx) => {
    if (areaIdx > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Area title
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: area.title, bold: true, size: 36, color: PURPLE })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: area.subtitle, italics: true, size: 15, color: GREY })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: PURPLE, space: 4 } },
        children: []
      })
    );

    // Questions
    const answerLineCount = area.questions.length <= 3 ? 7 : 5;

    area.questions.forEach((q, qi) => {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: `${qi + 1}. `, bold: true, size: 16, color: RED }),
            new TextRun({ text: q, size: 16, color: '32302A' })
          ]
        }),
        ...blankLines(answerLineCount)
      );
    });

    // Footer
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ text: 'Punto della Strada \u2014 Clan Strada Facendo', size: 11, color: 'B4B4B4' })]
      })
    );
  });

  // ── Notes page ──
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Note', bold: true, size: 28, color: PURPLE })]
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: PURPLE, space: 4 } },
      children: []
    }),
    ...blankLines(28)
  );

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(148),
            height: convertMillimetersToTwip(210)
          },
          margin: {
            top: convertMillimetersToTwip(14),
            bottom: convertMillimetersToTwip(14),
            left: convertMillimetersToTwip(14),
            right: convertMillimetersToTwip(14)
          }
        }
      },
      children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'Punto_della_Strada_Fogli_Risposte.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Word salvato in:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
