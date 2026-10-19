/* ==========================================================================
   Brace — pizzeria napoletana (concept fictif, Grenoble)
   Tout le contenu du site est ici. Remplacer par les vraies infos du client.
   ========================================================================== */
window.SITE = {
  brand: {
    name: "Brace",
    tagline: "Pizzeria napoletana · Grenoble",
    city: "Grenoble",
  },

  contact: {
    phone: "+33 4 00 00 00 00",          // à remplacer
    whatsapp: "33600000000",              // numéro international sans + ni espaces
    instagram: "brace.grenoble",          // handle sans @
    address: "Adresse dévoilée à l'ouverture",
    mapQuery: "Grenoble, France",
    hours: [
      ["Mardi – Jeudi", "18:30 – 22:30"],
      ["Vendredi – Samedi", "18:30 – 23:30"],
      ["Dimanche", "18:30 – 22:00"],
      ["Lundi", "Fermé"],
    ],
    opening: "Ouverture prochaine",
  },

  /* Hero piloté au scroll (v2 : 7 clips, l'étape « huile » est retirée).
     frames : nombre d'images dans framePath (0000.webp …) ; framePathMobile = même découpe en 720 px
     clipStarts : index de la 1re image de chaque clip (sortie de tools/build-frames.sh)
     steps : 1 titre pour l'état de départ + 1 par clip. `tone` colore le mot.
     `scroll` (sur chaque clip) = écrans de scroll pour ce clip : court = geste rapide, long = plan fort. */
  hero: {
    frames: 472,
    framePath: "assets/frames-v2/",
    framePathMobile: "assets/frames-v2-m/",
    poster: "assets/img/hero-poster.webp",   // image d'ouverture (pâte seule)
    clipStarts: [0, 66, 133, 199, 266, 332, 399],
    holdBetween: 0.2,         // pause sur chaque étape, en écrans
    holdStart: 0.4,           // pause d'ouverture
    holdEnd: 0.5,             // pause finale (CTA)
    smoothing: 0.1,           // 0.05 très glissé … 0.3 très direct
    steps: [
      { word: "Pétrie.",     tone: "cream",  text: "Une pâte qui mature 48 heures, étirée à la main." },
      { word: "Nappée.",     tone: "tomato", text: "Tomate San Marzano, écrasée à la main. Rien d'autre.", scroll: 0.8 },
      { word: "Fondante.",   tone: "cream",  text: "Fior di latte, déchirée à la minute.",                 scroll: 0.7 },
      { word: "Parfumée.",   tone: "basil",  text: "Basilic frais et un filet d'huile d'olive.",           scroll: 0.6 },
      { word: "Enfournée.",  tone: "fire",   text: "Four à bois, 485 °C.",                                 scroll: 1.1 },
      { word: "Saisie.",     tone: "fire",   text: "90 secondes. Pas une de plus.",                        scroll: 1.0 },
      { word: "Tranchée.",   tone: "cream",  text: "Six parts, encore fumantes.",                          scroll: 0.8 },
      { word: "Servie.",     tone: "fire",   text: "Et maintenant, la première bouchée.",                  scroll: 1.2 },
    ],
  },

  /* La carte. `cat` doit correspondre à une clé de `categories`. */
  categories: [
    { key: "rouges",   label: "Rouges" },
    { key: "blanches", label: "Blanches" },
    { key: "moment",   label: "Du moment" },
    { key: "dolci",    label: "Dolci" },
  ],
  menu: [
    { id: "margherita", cat: "rouges", name: "Margherita", price: 11,
      desc: "Tomate San Marzano, fior di latte, basilic, huile d'olive.",
      meta: "31 cm · végétarienne", img: "assets/img/margherita.webp", tags: ["veg"] },
    { id: "marinara", cat: "rouges", name: "Marinara", price: 9,
      desc: "Tomate, ail, origan, huile d'olive. Sans fromage.",
      meta: "31 cm · vegan", img: "assets/img/marinara.webp", tags: ["veg", "vegan"] },
    { id: "diavola", cat: "rouges", name: "Diavola", price: 14,
      desc: "Tomate, fior di latte, salami piquant, piment frais, huile pimentée.",
      meta: "31 cm · piquante", img: "assets/img/diavola.webp", tags: ["spicy"] },
    { id: "regina", cat: "rouges", name: "Regina", price: 14,
      desc: "Tomate, fior di latte, jambon cuit, champignons, olives noires.",
      meta: "31 cm", img: "assets/img/regina.webp", tags: [] },
    { id: "quattro", cat: "blanches", name: "Quattro formaggi", price: 15,
      desc: "Fior di latte, gorgonzola, taleggio, parmesan, filet de miel.",
      meta: "31 cm · végétarienne", img: "assets/img/quattro.webp", tags: ["veg"] },
    { id: "alpina", cat: "blanches", name: "L'Alpina", price: 16,
      desc: "Crème, reblochon, lardons fumés, pommes de terre, oignons confits.",
      meta: "31 cm · clin d'œil aux Alpes", img: "assets/img/alpina.webp", tags: [] },
    { id: "tartufo", cat: "blanches", name: "Tartufo", price: 19,
      desc: "Fior di latte, champignons des bois, truffe noire, parmesan.",
      meta: "31 cm · végétarienne", img: "assets/img/tartufo.webp", tags: ["veg"] },
    { id: "burrata", cat: "moment", name: "Burrata & pistache", price: 18,
      desc: "Burrata entière, mortadelle, pesto et éclats de pistache, basilic.",
      meta: "31 cm · édition limitée", img: "assets/img/burrata.webp", tags: [] },
    { id: "tiramisu", cat: "dolci", name: "Tiramisù", price: 7,
      desc: "Mascarpone, café serré, biscuits imbibés, cacao. Fait maison.",
      meta: "en bocal · végétarien", img: "assets/img/tiramisu.webp", tags: ["veg"] },
  ],

  /* Les grands chiffres (motif « un chiffre par chapitre »). */
  craft: [
    { number: "48", unit: "heures", title: "de maturation", text: "La pâte repose deux jours. Plus légère, plus digeste, plus de goût." },
    { number: "485", unit: "°C", title: "au cœur du four", text: "Un four à bois, du hêtre, et la flamme qui fait gonfler le bord." },
    { number: "90", unit: "secondes", title: "de cuisson", text: "Le temps qu'il faut pour une pâte croustillante dehors, moelleuse dedans." },
  ],

  order: {
    slots: ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
    modes: [
      { key: "emporter", label: "À emporter" },
      { key: "place", label: "Sur place" },
    ],
  },

  /* Assistant : réponses tirées de la carte et des infos. Mots-clés en minuscules sans accents. */
  faq: [
    { q: "Vous avez du sans gluten ?", keys: ["gluten", "celiaque", "coeliaque"],
      a: "Pas encore : toutes nos pâtes contiennent du blé, et la farine circule dans tout le laboratoire. On préfère être honnêtes plutôt que risquer une contamination." },
    { q: "Des pizzas végétariennes ?", keys: ["vegetarien", "veggie", "vegan", "viande", "vegetal"],
      a: "Oui : Margherita, Quattro formaggi, Tartufo et le Tiramisù sont végétariens. La Marinara est 100 % vegan." },
    { q: "Vous livrez ?", keys: ["livr", "livraison", "domicile", "uber", "deliveroo"],
      a: "Au lancement, uniquement à emporter et sur place : une pizza napolitaine se mange dans les 5 minutes. Commandez ici, on vous la tend encore fumante." },
    { q: "On peut réserver ?", keys: ["reserv", "table", "groupe", "anniversaire"],
      a: "Oui, choisissez « Sur place » et une heure dans le module de commande : on confirme sur WhatsApp. Pour un groupe de plus de 8, appelez-nous." },
    { q: "Vos horaires ?", keys: ["horaire", "heure", "ouvert", "ferme", "quand"],
      a: "Du mardi au dimanche à partir de 18:30, jusqu'à 22:30 en semaine et 23:30 le week-end. Fermé le lundi." },
    { q: "Une pizza piquante ?", keys: ["piquant", "piment", "epice", "spicy"],
      a: "La Diavola : salami piquant, piment frais et huile pimentée maison." },
    { q: "Les allergènes ?", keys: ["allergen", "allergie", "lactose", "noix", "pistache", "fruits a coque"],
      a: "Blé et lait sur toutes les pizzas sauf la Marinara (blé seulement). La Burrata & pistache contient des fruits à coque. Demandez-nous la fiche complète au comptoir." },
  ],
  assistantFallback: "Je réponds à partir de notre carte et de nos infos. Pour le reste, écrivez-nous sur WhatsApp, on répond vite.",

  footer: {
    credit: "Site concept : maquette offerte, contenus et photos illustratifs.",
  },
};
