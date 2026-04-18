export const AREAS = [
  {
    id: 'strada',
    title: 'Strada',
    subtitle: 'Camminare è già una risposta.',
    icon: 'ic-strada',
    stimuli: [
      { type: 'video', label: 'Ascolta', title: 'Giorgio Gaber — C\'è solo la strada', url: 'https://www.youtube.com/embed/c9AHgZnYAn4' },
      { type: 'video', label: 'Ascolta', title: 'Nomadi — Cammina Cammina', url: 'https://www.youtube.com/embed/yTeintNBOGc' },
      { type: 'video', label: 'Ascolta', title: 'Modena City Ramblers — La Strada', url: 'https://www.youtube.com/embed/shjw39-2hNc' }
    ],
    quotes: [
      { text: 'La strada non è dove si va. La strada è come si va.' }
    ],
    gospel: null,
    questions: [
      'Che cosa intendi quando dici "sono sulla strada"?',
      'Dove pensi di essere adesso nel tuo cammino di Rover/Scolta?',
      'C\'è qualcosa che ti ha fermato ultimamente: una fatica, un dubbio, una pausa? Come l\'hai affrontata e come ti ha cambiato?'
    ]
  },
  {
    id: 'fede',
    title: 'Fede',
    subtitle: 'Il Vangelo di Emmaus: i discepoli che camminano senza riconoscerlo.',
    icon: 'ic-fede',
    stimuli: [
      { type: 'video', label: 'Canzone', title: 'Sulla via di Emmaus', url: 'https://www.youtube.com/embed/ScbfKfIcdTs' }
    ],
    quotes: [],
    gospel: {
      ref: 'Luca 24, 13-35 — Vangelo di Emmaus',
      paragraphs: [
        'Ed ecco, in quello stesso giorno due di loro erano in cammino per un villaggio distante circa undici chilometri da Gerusalemme, di nome Emmaus, e conversavano tra loro di tutto quello che era accaduto.',
        'Mentre conversavano e discutevano insieme, Gesù in persona si avvicinò e camminava con loro. Ma i loro occhi erano impediti a riconoscerlo.',
        'Ed egli disse loro: «Di che cosa state discutendo tra voi lungo il cammino?». Si fermarono, col volto triste; uno di loro, di nome Clèopa, gli rispose: «Tu solo sei così forestiero in Gerusalemme da non sapere ciò che vi è accaduto in questi giorni?».',
        '«Che cosa?» domandò loro. Gli risposero: «Ciò che riguarda Gesù, il Nazareno, che fu profeta potente in opere e in parole, davanti a Dio e a tutto il popolo; come i capi dei sacerdoti e le nostre autorità lo hanno consegnato per farlo condannare a morte e lo hanno crocifisso. Noi speravamo che egli fosse colui che avrebbe liberato Israele; con tutto ciò, sono passati tre giorni da quando queste cose sono accadute.»',
        'Egli disse loro: «Stolti e lenti di cuore a credere in tutto ciò che hanno detto i profeti! Non bisognava che il Cristo patisse queste sofferenze per entrare nella sua gloria?». E, cominciando da Mosè e da tutti i Profeti, spiegò loro in tutte le Scritture ciò che si riferiva a lui.',
        'Quando furono vicini al villaggio dove erano diretti, egli fece come se dovesse andare più lontano. Ma essi insistettero: «Resta con noi, perché si fa sera e il giorno è ormai al tramonto». Egli entrò per rimanere con loro.',
        'Quando fu a tavola con loro, prese il pane, recitò la benedizione, lo spezzò e lo diede loro. Allora si aprirono loro gli occhi e lo riconobbero. Ma egli sparì dalla loro vista. Ed essi dissero l\'un l\'altro: «Non ardeva forse in noi il nostro cuore mentre egli conversava con noi lungo la via, quando ci spiegava le Scritture?».',
        'Partirono senza indugio e fecero ritorno a Gerusalemme, dove trovarono riuniti gli Undici e gli altri che erano con loro, i quali dicevano: «Davvero il Signore è risorto ed è apparso a Simone!». Ed essi narravano ciò che era accaduto lungo la via e come l\'avevano riconosciuto nello spezzare il pane.'
      ]
    },
    questions: [
      'Rileggi il brano lentamente, nota i dettagli, nomi, luoghi, emozioni, dialoghi. Quale parola o frase ti colpisce di più?',
      'In cosa ti senti simile ai discepoli di Emmaus?',
      '"Non ardeva forse in noi il nostro cuore?" Quando è stata l\'ultima volta che hai sentito ardere il cuore? Cosa fa ardere il cuore nella tua vita?',
      'Sento che il cuore arde quando ascolto il Signore?',
      'Cerco attivamente un momento per coltivare questa relazione?'
    ]
  },
  {
    id: 'servizio',
    title: 'Servizio',
    subtitle: 'Non per chi lo fa. Per chi ne ha bisogno.',
    icon: 'ic-servizio',
    stimuli: [
      { type: 'video', label: 'Ascolta', title: 'Mattia Civico — Manda me', url: 'https://www.youtube.com/embed/C7QQ9hdUlyg' },
      { type: 'video', label: 'Guarda', title: 'La felicità è aiutare gli altri', url: 'https://www.youtube.com/embed/zcruIov45bI' },
      { type: 'video', label: 'Ascolta', title: 'Gen Verde — Servire è regnare', url: 'https://www.youtube.com/embed/nJYq0OsOho0' }
    ],
    quotes: [
      { text: 'Il servizio non è un atto eroico. È una scelta quotidiana di guardarsi intorno.' }
    ],
    gospel: null,
    questions: [
      'Quando fai servizio, lo fai per gli altri o anche per te stesso? C\'è differenza?',
      'C\'è un momento in cui il servizio ti ha cambiato, in cui hai ricevuto più di quanto hai dato? Che cosa hai dato di te e cosa hai ricevuto in cambio?',
      'Qual è la forma di servizio che senti più tua in questo periodo della tua vita?'
    ]
  },
  {
    id: 'comunita',
    title: 'Comunità',
    subtitle: 'Il clan, la vita, gli altri. Il "tu" che è fratello.',
    icon: 'ic-comunita',
    stimuli: [
      { type: 'video', label: 'Guarda', title: 'L\'unione fa la forza', url: 'https://www.youtube.com/embed/KH-qIwAGQNk' },
      { type: 'video', label: 'Guarda', title: 'Lavoro di squadra', url: 'https://www.youtube.com/embed/fUXdrl9ch_Q' },
      { type: 'video', label: 'Guarda', title: 'Ho scelto di partire', url: 'https://www.youtube.com/embed/8sZjgidhavc' }
    ],
    quotes: [
      { text: 'C\'è un "tu" che mi precede. Un fratello che esiste prima che io lo riconosca.' }
    ],
    bodyNote: 'Due livelli di comunità: quella del <strong>clan</strong>, i compagni di strada scelti, e quella della <strong>vita</strong>, gli altri, la società, chi incontro ogni giorno. Entrambe mi chiedono qualcosa.',
    gospel: null,
    questions: [
      'In clan, chi senti davvero come compagno di strada in questo momento? Perché gli altri non li senti tali?',
      'Nella comunità più larga (scuola, lavoro, paese, ...) c\'è un "tu" che senti come fratello o sorella? Come lo vivi?',
      'Come ti relazioni nei confronti di quello che sta succedendo nel resto del mondo? Ti senti parte di questa comunità?',
      'Quali sono le fatiche che senti nel far parte di queste comunità? Che cosa ti danno che non ti aspettavi?'
    ]
  },
  {
    id: 'io',
    title: 'Io',
    subtitle: 'Il mio essere sulla strada. Dove sono adesso.',
    icon: 'ic-io',
    stimuli: [
      { type: 'video', label: 'Ascolta', title: 'Max Pezzali / 883 — Ci sono anch\'io', url: 'https://www.youtube.com/embed/ngrJCikQrEM' },
      { type: 'video', label: 'Guarda', title: 'Goditi potere e bellezza della tua gioventù — The Big Kahuna', url: 'https://www.youtube.com/embed/gqQPOYZo6Fs' },
      { type: 'video', label: 'Ascolta', title: 'Lucio Corsi — Cosa faremo da grandi', url: 'https://www.youtube.com/embed/d-dePzDnJT0' }
    ],
    quotes: [
      { text: 'La felicità non è una destinazione, è un modo di viaggiare.' }
    ],
    gospel: null,
    questions: [
      'Dove senti di essere adesso nel tuo cammino di vita?',
      'C\'è qualcosa di te che stai scoprendo in questo periodo? Qualcosa che stai perdendo?',
      'Che sogno hai per la tua vita?'
    ]
  }
];
