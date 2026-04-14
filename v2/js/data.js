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
      'Che cosa intendi quando dici "sono sulla strada"? Dove senti di essere adesso nel tuo cammino di Rover/Scolta?',
      'C\'è qualcosa che ti ha fermato ultimamente: una fatica, un dubbio, una pausa? Come ti ha cambiato?',
      'La strada dello scoutismo è anche partenza e inizio: cosa stai iniziando?'
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
      'I discepoli di Emmaus camminavano senza riconoscerlo. Ci sono stati momenti nella tua vita in cui Dio era presente ma tu non te ne sei accorto? Quando te ne sei reso conto?',
      '"Non ardeva forse in noi il nostro cuore?" Quando è stata l\'ultima volta che hai sentito quella fiamma? Cosa la accende nella tua vita?',
      'Come vivi la tua fede oggi: è un cammino, una certezza, una domanda aperta?'
    ]
  },
  {
    id: 'servizio',
    title: 'Servizio',
    subtitle: 'Non per chi lo fa. Per chi ne ha bisogno.',
    icon: 'ic-servizio',
    stimuli: [
      { type: 'video', label: 'Guarda', title: 'L\'unione fa la forza', url: 'https://www.youtube.com/embed/KH-qIwAGQNk' },
      { type: 'video', label: 'Guarda', title: 'Lavoro di squadra', url: 'https://www.youtube.com/embed/fUXdrl9ch_Q' }
    ],
    quotes: [
      { text: 'Il servizio non è un atto eroico. È una scelta quotidiana di guardarsi intorno.' }
    ],
    gospel: null,
    questions: [
      'Quando fai servizio, lo fai per gli altri o un po\' anche per te stesso? C\'è differenza? È un problema?',
      'C\'è un momento in cui il servizio ti ha cambiato, in cui hai ricevuto più di quanto hai dato?',
      'Qual è la forma di servizio che senti più tua in questo periodo della tua vita?'
    ]
  },
  {
    id: 'comunita',
    title: 'Comunità',
    subtitle: 'Il clan, la vita, gli altri. Il "tu" che è fratello.',
    icon: 'ic-comunita',
    stimuli: [
      { type: 'video', label: 'Ascolta', title: 'Francesco Guccini — Canzone per un\'amica', url: 'https://www.youtube.com/embed/4H0fPsORIAo' }
    ],
    quotes: [
      { text: 'C\'è un "tu" che mi precede. Un fratello che esiste prima che io lo riconosca.' }
    ],
    bodyNote: 'Due livelli di comunità: quella del <strong>clan</strong>, i compagni di strada scelti, e quella della <strong>vita</strong>, gli altri, la società, chi incontro ogni giorno. Entrambe mi chiedono qualcosa.',
    gospel: null,
    questions: [
      'Chi è il tuo clan? Non chi è nel clan: chi senti davvero come compagno di strada in questo momento?',
      'Nella comunità più larga, scuola, lavoro, paese, c\'è un "tu" che senti come fratello o sorella? Come lo vivi?',
      'Cosa ti chiede la comunità che fai fatica a dare? Cosa ti dà che non ti aspettavi?'
    ]
  },
  {
    id: 'io',
    title: 'Io',
    subtitle: 'Il mio essere sulla strada. Dove sono adesso.',
    icon: 'ic-io',
    stimuli: [
      { type: 'video', label: 'Ascolta', title: 'Max Pezzali / 883 — Ci sono anch\'io', url: 'https://www.youtube.com/embed/ngrJCikQrEM' },
      { type: 'video', label: 'Ascolta', title: 'Brunori Sas — Fuori dal mondo', url: 'https://www.youtube.com/embed/3gaRTAO8Zyk' }
    ],
    quotes: [
      { text: 'La felicità non è una destinazione, è un modo di viaggiare.' }
    ],
    gospel: null,
    questions: [
      'Dove senti di essere adesso nel tuo cammino personale, non quello del clan? Stai avanzando, stai riposando, stai girando in tondo?',
      'C\'è qualcosa di te che stai scoprendo in questo periodo? Qualcosa che stai perdendo?',
      'Cosa porti con te quando finisce questa uscita? Una parola, un\'immagine, una domanda.'
    ]
  }
];
