// Návrhy písem: písma pro nadpisy a pro text, dvojice k výběru. Čte je rozcestník (index.html) i vzorek webu (vzorek.html).
// Každé písmo má české znaky (Google Fonts, sada latin-ext — ověřeno 5. 11. 2026).
window.PISMA = {
  // Písma pro jméno, nadpisy a názvy filmů; u každého jeho přirozená tloušťka, prostrkání a velká písmena
  nadpisy: {
    archivoBlack: { nazev: "Archivo Black", css: '"Archivo Black", sans-serif', w: 400, ls: "-0.015em", tt: "none", logoTt: "uppercase", kurziva: false, zdroj: "návrh 1" },
    cormorant: { nazev: "Cormorant Garamond", css: '"Cormorant Garamond", Georgia, serif', w: 500, ls: "-0.01em", tt: "none", logoTt: "none", kurziva: true, zdroj: "návrh 2" },
    bodoni: { nazev: "Bodoni Moda", css: '"Bodoni Moda", Didot, serif', w: 500, ls: "-0.02em", tt: "none", logoTt: "uppercase", kurziva: true },
    archivoSiroke: { nazev: "Archivo široké", css: '"Archivo", sans-serif', w: 600, ls: "0.02em", tt: "uppercase", logoTt: "uppercase", sirka: "125%", kurziva: false },
    instrumentSerif: { nazev: "Instrument Serif", css: '"Instrument Serif", Georgia, serif', w: 400, ls: "-0.01em", tt: "none", logoTt: "none", kurziva: true }
  },
  // Písma pro odstavce, menu a popisky
  texty: {
    inter: { nazev: "Inter", css: "Inter, system-ui, sans-serif", w: 400, zdroj: "návrh 1" },
    jost: { nazev: "Jost", css: "Jost, system-ui, sans-serif", w: 400, zdroj: "návrh 2" },
    archivo: { nazev: "Archivo", css: "Archivo, system-ui, sans-serif", w: 400 },
    instrumentSans: { nazev: "Instrument Sans", css: '"Instrument Sans", system-ui, sans-serif', w: 400 }
  },
  dvojice: [
    { id: "d7", nazev: "Výloha 1 + 3", n: "archivoSiroke", t: "inter", doporuceno: true,
      napad: "Doporučeno po schůzce 5. 11.: stejná rodina jako jméno v návrhu 1, ale klidnější. Široké verzálky jen u jména a nadpisů, texty v Interu. Použito v návrhu 6.",
      pro: "Klidné, černobílé, galerijní a trochu nedosažitelné. Navazuje na návrh 1, který se panu Zikovi líbí nejvíc, a čte se dobře i na telefonu.", proti: "Méně okázalé než Archivo Black. Široké jméno zabere na telefonu celou šířku." },
    { id: "d1", nazev: "Jako návrh 1", n: "archivoBlack", t: "inter",
      napad: "Tučné bezpatkové jméno jako razítko, čistý text. Dnešní písmo návrhu Bílá stěna.",
      pro: "Výrazné a sebevědomé. Jméno funguje i jako logo, text je dokonale čitelný.", proti: "Těžké jméno může na stránce přetlačit fotky. Působí spíš „reklamně“ než umělecky." },
    { id: "d2", nazev: "Jako návrh 2", n: "cormorant", t: "jost",
      napad: "Klasické knižní patkové písmo a geometrický text. Dnešní písmo návrhu Ve stínu světla.",
      pro: "Elegantní a tiché, sedí k černobílé fotografii a knihám. Má krásnou kurzívu na citáty.", proti: "Jost má malá písmena malá a v menších velikostech na telefonu se čte hůř než Inter." },
    { id: "d3", nazev: "Spojení 1 + 2", n: "cormorant", t: "inter",
      napad: "Jméno a nadpisy z návrhu 2, texty a menu z návrhu 1. Přesně to, co chce pan Zika kombinovat.",
      pro: "Elegance návrhu 2 a čitelnost návrhu 1. Fotky nechá vyniknout a dobře se čte i v telefonu.", proti: "Nejméně překvapivé ze všech. Osobitost musí přinést fotky a rozvržení, ne písmo." },
    { id: "d4", nazev: "Módní obálka", n: "bodoni", t: "jost",
      napad: "Kontrastní písmo módních časopisů. Navazuje na jeho práci pro módní značky a Playboy.",
      pro: "Okamžitě „magazínové“, luxusní a výrazné. Silné u velkého jména na úvodní stránce.", proti: "Tenké tahy se v malých velikostech a na tmavém pozadí ztrácejí. Hodně spojované s Vogue." },
    { id: "d5", nazev: "Moderní galerie", n: "archivoSiroke", t: "archivo",
      napad: "Široké verzálky a jedna rodina písma na všechno, jako popisky v galerii současného umění.",
      pro: "Současné, úsporné a jednotné. Jedno písmo znamená rychlé načítání a jednoduchou údržbu.", proti: "Chladnější a technické. Dlouhé názvy filmů ve verzálkách zaberou hodně místa." },
    { id: "d6", nazev: "Tichý editorial", n: "instrumentSerif", t: "instrumentSans",
      napad: "Úzké patkové písmo dnešních kulturních magazínů a k němu sesterský bezpatkový text.",
      pro: "Úzké jméno se vejde velké i na telefon. Působí moderně a přitom kultivovaně.", proti: "Je teď hodně v módě, za pár let může působit dobově. Nadpis má jen jednu tloušťku." }
  ],
  // Jeden požadavek na Google Fonts pro všechna písma
  odkaz: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wdth,wght@100..125,400..700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Instrument+Sans:wght@400..600&family=Instrument+Serif:ital@0;1&family=Inter:wght@300..600&family=Jost:wght@300..500&display=swap"
};
