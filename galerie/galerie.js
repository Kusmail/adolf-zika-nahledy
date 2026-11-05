// Prohlížení fotografií — sdílený základ variant v navrhy/galerie/ (mřížka, výstava, filmový pás, kontaktní arch).
// Data: rubriky z ZIKA.fotografie, fotky z FOTKY (ze starého webu, jen 300–500 px) a zkušební obrazec 4000 × 5000 px,
// na kterém jde vyzkoušet lupa 1:1, dokud nemáme originály.
// Prohlížeč: otevření z náhledu, efekt zhasnutí / reflektor / bez efektu, pozadí černá / šedá / bílá, lupa 1:1 (klik, Z),
// listování šipkami, tažením i filmovým pásem, zavření Esc / tlačítkem Zpět v prohlížeči, odkaz na fotku (#id).
// Pravidlo: na samotnou fotku se nesahá — žádný filtr, záře ani zvětšení přes její rozlišení; efekty jsou jen okolo.
(function () {
  "use strict";
  var G = (window.G = {});
  var KLID = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DOTYK = matchMedia("(hover: none)").matches;
  var EFEKTY = { zhasnuti: "Zhasnutí sálu", reflektor: "Reflektor", zadny: "Bez efektu" };
  var POZADI = { cerna: "Černá", seda: "Šedá", bila: "Bílá" };
  G.EFEKTY = EFEKTY;
  G.POZADI = POZADI;

  var OBRAZEC = {
    id: "obrazec", obrazec: true, w: 4000, h: 5000,
    nahled: "obrazec/obrazec-800.webp",
    zdroje: [["obrazec/obrazec-800.webp", 800], ["obrazec/obrazec-1600.webp", 1600], ["obrazec/obrazec-2400.webp", 2400]],
    plny: "obrazec/obrazec-4000.webp",
    popis: "Zkušební obrazec 4000 × 5000 px — zástupce originálu"
  };

  // --- Volby z adresy: ?r=akty&efekt=reflektor&pozadi=bila ---
  var q = new URLSearchParams(location.search);
  G.volby = { r: q.get("r") || "cb", efekt: q.get("efekt") || "zhasnuti", pozadi: q.get("pozadi") || "cerna" };
  if (!EFEKTY[G.volby.efekt]) G.volby.efekt = "zhasnuti";
  if (!POZADI[G.volby.pozadi]) G.volby.pozadi = "cerna";
  G.uloz = function () {
    var p = new URLSearchParams(location.search);
    for (var k in G.volby) p.set(k, G.volby[k]);
    history.replaceState(history.state, "", "?" + p + location.hash);
  };
  G.nastav = function (x) {
    for (var k in x) G.volby[k] = x[k];
    G.uloz();
    if (lb) { lb.dataset.pozadi = G.volby.pozadi; lb.dataset.efekt = G.volby.efekt; }
    document.dispatchEvent(new CustomEvent("g-volby"));
  };

  G.rubrika = function (id) {
    return ZIKA.fotografie.filter(function (r) { return r.id === id; })[0] || ZIKA.fotografie[0];
  };
  // Položky rubriky: zkušební obrazec + fotky ze starého webu
  G.sada = function (id) {
    var r = G.rubrika(id);
    return [OBRAZEC].concat(Z.fotky(r.slozka).map(function (f, k) {
      return { id: r.id + "-" + (k + 1), w: f.w, h: f.h, nahled: f.src, zdroje: [[f.src, f.w]], plny: null, maly: true,
        popis: r.nazev + " · " + (k + 1) };
    }));
  };
  G.srcset = function (f) {
    return f.zdroje.length > 1 ? f.zdroje.map(function (z) { return z[0] + " " + z[1] + "w"; }).join(", ") : "";
  };
  // Nejmenší zdroj, který pokryje šířku v CSS px na tomto displeji (pro lupu kontaktního archu)
  G.zdrojPro = function (f, sirka) {
    var potreba = sirka * (devicePixelRatio || 1);
    for (var k = 0; k < f.zdroje.length; k++) if (f.zdroje[k][1] >= potreba) return f.zdroje[k][0];
    return f.plny || f.zdroje[f.zdroje.length - 1][0];
  };
  function prednactiFotku(f, w) {
    var el = new Image();
    el.sizes = Math.round(w || ram(f).w) + "px";
    var ss = G.srcset(f);
    if (ss) el.srcset = ss;
    el.src = f.zdroje[0][0];
  }
  G.predem = function (f) { if (lb || document.body) prednactiFotku(f, Math.min(innerWidth, innerHeight * f.w / f.h)); };

  // --- Lišta variant: rubrika, efekt, pozadí ---
  G.lista = function (el, nast) {
    function volba(k, nazev, moznosti) {
      var o = "";
      for (var v in moznosti) o += '<option value="' + v + '">' + Z.esc(moznosti[v]) + "</option>";
      return '<label><span>' + nazev + '</span><select data-v="' + k + '">' + o + "</select></label>";
    }
    var rub = {};
    ZIKA.fotografie.forEach(function (r) { rub[r.id] = r.nazev + " (" + (FOTKY[r.slozka] || []).length + ")"; });
    el.classList.add("g-lista");
    el.innerHTML = '<a class="g-zpet" href="./">← Způsoby prohlížení</a><b>' + Z.esc(nast.nazev) + "</b>" +
      volba("r", "Rubrika", rub) +
      (nast.efekt === false ? "" : volba("efekt", "Efekt", EFEKTY)) +
      (nast.pozadi === false ? "" : volba("pozadi", nast.pozadiNazev || "Pozadí", POZADI)) +
      (nast.navic || "") +
      '<p class="g-info">Fotky ze starého webu mají jen 300–500 px, proto jsou měkké. Ostrost a lupu 1:1 ukazuje první položka: zkušební obrazec.</p>';
    function sesynchronizuj() {
      el.querySelectorAll("select[data-v]").forEach(function (s) { s.value = G.volby[s.dataset.v]; });
    }
    sesynchronizuj();
    el.addEventListener("change", function (e) {
      var s = e.target.closest("select[data-v]");
      if (!s) return;
      var x = {};
      x[s.dataset.v] = s.value;
      G.nastav(x);
      if (nast.zmena) nast.zmena(s.dataset.v);
    });
    document.addEventListener("g-volby", sesynchronizuj);
    // Výška lišty do CSS proměnné — výstava a filmový pás se podle ní zarovnávají
    function vyska() { document.documentElement.style.setProperty("--g-lista", el.offsetHeight + "px"); }
    vyska();
    if (window.ResizeObserver) new ResizeObserver(vyska).observe(el);
  };

  // --- Mřížka v řadách: nic se neořezává, každá fotka má svůj poměr stran ---
  G.radky = function (kont, polozky, nast) {
    nast = nast || {};
    var mezera = nast.mezera == null ? 8 : nast.mezera, sirka = 0;
    var dlazdice = polozky.map(function (f, k) {
      var a = document.createElement("a");
      a.className = "g-dl";
      a.href = "#" + f.id;
      a.setAttribute("aria-label", "Otevřít: " + f.popis);
      var im = document.createElement("img");
      im.alt = "";
      im.width = f.w;
      im.height = f.h;
      im.loading = "lazy";
      im.decoding = "async";
      im.onload = function () { im.classList.add("nacteno"); };
      a.appendChild(im);
      a.addEventListener("click", function (e) { e.preventDefault(); G.otevri(polozky, k, najdi); });
      a.addEventListener("pointerenter", function () { G.predem(f); }, { once: true });
      return a;
    });
    function najdi(j) { return dlazdice[j] && dlazdice[j].firstChild; }
    function sestav() {
      var cs = getComputedStyle(kont), W = Math.floor(kont.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      if (!W || W === sirka) return;
      sirka = W;
      // Cílová výška řady; funkce dostane i pořadí řady, takže výšky se mohou střídat (rytmus velká / menší řada)
      function cilRady(i) { return typeof nast.vyska === "function" ? nast.vyska(W, i) : nast.vyska || 300; }
      var rady = [], rada = [], soucet = 0;
      polozky.forEach(function (f, k) {
        rada.push(k);
        soucet += f.w / f.h;
        var h = (W - mezera * (rada.length - 1)) / soucet;
        if (h <= cilRady(rady.length)) { rady.push({ k: rada, h: h }); rada = []; soucet = 0; }
      });
      if (rada.length) rady.push({ k: rada, h: Math.min(cilRady(rady.length), (W - mezera * (rada.length - 1)) / soucet), konec: true });
      var frag = document.createDocumentFragment();
      rady.forEach(function (r) {
        var div = document.createElement("div");
        div.className = "g-rada";
        div.style.gap = div.style.marginBottom = mezera + "px";
        var zbyva = W - mezera * (r.k.length - 1);
        r.k.forEach(function (k, n) {
          var f = polozky[k], a = dlazdice[k], im = a.firstChild;
          var w = n === r.k.length - 1 && !r.konec ? zbyva : Math.floor(f.w / f.h * r.h);
          zbyva -= w;
          a.style.width = w + "px";
          a.style.height = Math.round(r.h) + "px";
          im.sizes = w + "px";
          if (!im.getAttribute("src")) {
            var ss = G.srcset(f);
            if (ss) im.srcset = ss;
            im.src = f.nahled;
          }
          div.appendChild(a);
        });
        frag.appendChild(div);
      });
      kont.innerHTML = "";
      kont.appendChild(frag);
      if (nast.poSestaveni) nast.poSestaveni(kont.querySelectorAll(".g-rada"));
    }
    sestav();
    // Při změně rubriky se mřížka staví znovu do stejného prvku — starý hlídač velikosti odpojit
    if (kont._hlidac) kont._hlidac.disconnect();
    if (window.ResizeObserver) (kont._hlidac = new ResizeObserver(sestav)).observe(kont);
    return { najdi: najdi };
  };

  // ---------- Prohlížeč ----------
  var lb, scena, img, svetlo, pocet, popisEl, poznamkaEl, pasEl, hlaskaEl, sada = [], i = 0, nahledFn = null,
    otevreno = false, trvale = false, sPasem = false, lupa = null, posledniFokus = null, vHistorii = false,
    schovany = null, casovac = null, casHlasky = null;

  function vytvor() {
    lb = document.createElement("div");
    lb.className = "g-lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Prohlížeč fotografií");
    lb.innerHTML =
      '<div class="g-zed"></div><div class="g-svetlo"></div><div class="g-scena"></div>' +
      '<div class="g-ovl g-horni"><span class="g-pocet" aria-live="polite"></span>' +
      '<button class="g-b g-lupa" title="Lupa 1:1 (Z)" aria-pressed="false">Lupa 1:1</button>' +
      '<button class="g-b g-pozadi" title="Pozadí (B)" aria-label="Změnit pozadí"><i></i></button>' +
      '<button class="g-b g-x" title="Zavřít (Esc)" aria-label="Zavřít">×</button></div>' +
      '<button class="g-ovl g-b g-sip g-p" aria-label="Předchozí fotografie">‹</button>' +
      '<button class="g-ovl g-b g-sip g-n" aria-label="Další fotografie">›</button>' +
      '<div class="g-ovl g-dolni"><p class="g-popis"></p><p class="g-poznamka"></p><div class="g-pas" hidden></div></div>' +
      '<p class="g-hlaska" role="status"></p>';
    document.body.appendChild(lb);
    scena = lb.querySelector(".g-scena");
    svetlo = lb.querySelector(".g-svetlo");
    pocet = lb.querySelector(".g-pocet");
    popisEl = lb.querySelector(".g-popis");
    poznamkaEl = lb.querySelector(".g-poznamka");
    pasEl = lb.querySelector(".g-pas");
    hlaskaEl = lb.querySelector(".g-hlaska");
    lb.querySelector(".g-x").onclick = function () { G.zavri(); };
    lb.querySelector(".g-p").onclick = function () { prejdi(i - 1, -1); };
    lb.querySelector(".g-n").onclick = function () { prejdi(i + 1, 1); };
    lb.querySelector(".g-lupa").onclick = function () { prepniLupu(); };
    lb.querySelector(".g-pozadi").onclick = dalsiPozadi;
    pasEl.addEventListener("click", function (e) {
      var b = e.target.closest(".g-pol");
      if (b) prejdi(+b.dataset.k, +b.dataset.k > i ? 1 : -1);
    });
    gesta();
    document.addEventListener("keydown", klavesy);
    lb.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") probud(); });
    addEventListener("resize", function () {
      if (!otevreno || !img) return;
      zrusLupu(true);
      img.style.transition = "none";
      umisti(img, sada[i]);
      if (sPasem) stavPasu();
    });
    addEventListener("popstate", function () {
      if (otevreno && vHistorii) { vHistorii = false; G.zavri(); }
    });
  }

  // Geometrie v souřadnicích prohlížeče (u filmového pásu začíná pod lištou stránky)
  function plocha() {
    var b = lb.getBoundingClientRect(), mob = b.width < 700;
    var nahore = mob ? 52 : 60, dole = (mob ? 66 : 76) + (sPasem ? 80 : 0), bok = mob || DOTYK ? 10 : 76;
    return { b: b, x: bok, y: nahore, w: b.width - 2 * bok, h: b.height - nahore - dole };
  }
  function ram(f) {
    if (!lb) return { w: Math.min(innerWidth, 1600) };
    var p = plocha(), s = Math.min(p.w / f.w, p.h / f.h), w = f.w * s, h = f.h * s;
    return { x: p.x + (p.w - w) / 2, y: p.y + (p.h - h) / 2, w: w, h: h };
  }
  function umisti(el, f) {
    var r = ram(f);
    el.style.left = r.x + "px";
    el.style.top = r.y + "px";
    el.style.width = r.w + "px";
    el.style.height = r.h + "px";
    if (el === img) sviti(r);
    return r;
  }
  // Světelný kužel reflektoru dopadá na stěnu za fotkou, ne na fotku
  function sviti(r) {
    svetlo.style.left = r.x - r.w * 0.55 + "px";
    svetlo.style.top = r.y - r.h * 0.34 + "px";
    svetlo.style.width = r.w * 2.1 + "px";
    svetlo.style.height = r.h * 1.68 + "px";
  }
  function vyrobImg(f) {
    var el = new Image();
    el.className = "g-foto";
    el.alt = f.popis;
    el.draggable = false;
    el.decoding = "async";
    el.sizes = Math.round(ram(f).w) + "px";
    var ss = G.srcset(f);
    if (ss) el.srcset = ss;
    el.src = f.zdroje[0][0];
    return el;
  }
  // Počká na dekódování (nejdéle max ms), aby se fotka nikdy neukázala rozmazaná nebo napůl načtená
  function dekoduj(el, max) {
    return Promise.race([
      el.decode ? el.decode().catch(function () {}) : Promise.resolve(),
      new Promise(function (ok) { setTimeout(ok, max || 400); })
    ]);
  }
  function nahled(j) {
    var el = nahledFn && nahledFn(j);
    if (!el) return null;
    var t = el.getBoundingClientRect();
    return t.width && t.bottom > 0 && t.top < innerHeight ? t : null;
  }
  function zNahledu(t, r) {
    var b = lb.getBoundingClientRect();
    return "translate(" + (t.left - b.left - r.x) + "px," + (t.top - b.top - r.y) + "px) scale(" + t.width / r.w + "," + t.height / r.h + ")";
  }
  function schovej(j) {
    obnov();
    var el = nahledFn && nahledFn(j);
    if (el) { el.style.visibility = "hidden"; schovany = el; }
  }
  function obnov() { if (schovany) { schovany.style.visibility = ""; schovany = null; } }

  G.otevri = function (polozky, n, fn, moznosti) {
    if (!lb) vytvor();
    moznosti = moznosti || {};
    sada = polozky;
    nahledFn = fn || null;
    trvale = !!moznosti.trvale;
    sPasem = !!moznosti.pas;
    if (!otevreno) posledniFokus = document.activeElement;
    otevreno = true;
    zrusLupu(true);
    lb.classList.toggle("trvale", trvale);
    lb.dataset.efekt = G.volby.efekt;
    lb.dataset.pozadi = G.volby.pozadi;
    lb.classList.remove("vidno", "hned");
    lb.classList.add("on");
    if (!trvale) document.documentElement.classList.add("g-zamceno");
    i = (n + sada.length) % sada.length;
    scena.innerHTML = "";
    img = vyrobImg(sada[i]);
    scena.appendChild(img);
    var r = umisti(img, sada[i]);
    popisky();
    stavPasu(true);
    prednacti();
    if (!trvale && !moznosti.zOdkazu && !vHistorii) {
      history.pushState({ galerie: 1 }, "", location.pathname + location.search + "#" + sada[i].id);
      vHistorii = true;
    }
    var t = nahled(i), efekt = G.volby.efekt;
    if (efekt === "zadny" || KLID || trvale) {
      lb.classList.add("hned", "vidno");
      void lb.offsetWidth; // styl bez přechodů se musí uplatnit dřív, než se přechody vrátí
      requestAnimationFrame(function () { lb.classList.remove("hned"); });
    } else if (efekt === "reflektor") {
      // Sál nejdřív zhasne, pak se rozsvítí reflektor a v jeho světle se objeví fotka
      img.style.opacity = 0;
      requestAnimationFrame(function () { lb.classList.add("vidno"); });
      var tento = img;
      dekoduj(img, 900).then(function () {
        setTimeout(function () {
          tento.style.transition = "opacity 1s ease";
          tento.style.opacity = 1;
        }, 420);
      });
    } else {
      // Zhasnutí sálu: fotka vyletí z náhledu (už ostrá), okolí ztmavne
      if (t) {
        img.style.transformOrigin = "0 0";
        img.style.transform = zNahledu(t, r);
        schovej(i);
      } else img.style.opacity = 0;
      var tenhle = img;
      dekoduj(img, 350).then(function () {
        requestAnimationFrame(function () {
          lb.classList.add("vidno");
          tenhle.style.transition = "transform .46s cubic-bezier(.2,.75,.15,1), opacity .3s ease";
          tenhle.style.transform = "none";
          tenhle.style.opacity = 1;
          setTimeout(obnov, 480);
        });
      });
    }
    var fokus = lb.querySelector(trvale ? ".g-lupa" : ".g-x");
    if (!trvale) fokus.focus({ preventScroll: true });
    probud();
  };

  G.zavri = function () {
    if (!otevreno || trvale) return;
    otevreno = false;
    zrusLupu(true);
    if (vHistorii) { vHistorii = false; history.back(); }
    else if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    var t = nahled(i), efekt = G.volby.efekt, doba = 0;
    lb.classList.remove("vidno");
    if (efekt === "zadny" || KLID) {
      lb.classList.add("hned");
    } else if (efekt === "zhasnuti" && t) {
      img.style.transformOrigin = "0 0";
      img.style.transition = "transform .36s cubic-bezier(.4,0,.2,1)";
      img.style.transform = zNahledu(t, ram(sada[i]));
      schovej(i);
      doba = 370;
    } else {
      img.style.transition = "opacity .4s ease";
      img.style.opacity = 0;
      doba = efekt === "reflektor" ? 700 : 400;
    }
    var cil = nahledFn && nahledFn(i);
    setTimeout(function () {
      lb.classList.remove("on", "hned", "klid");
      scena.innerHTML = "";
      obnov();
      document.documentElement.classList.remove("g-zamceno");
      var f = (cil && cil.closest("a,button")) || posledniFokus;
      if (f && f.focus) f.focus({ preventScroll: true });
    }, doba);
  };

  function prejdi(n, smer) {
    if (!sada.length) return;
    n = (n + sada.length) % sada.length;
    if (n === i) return;
    zrusLupu(true);
    var stary = img, f = sada[n];
    i = n;
    [].slice.call(scena.children).forEach(function (c) { if (c !== stary) c.remove(); });
    img = vyrobImg(f);
    umisti(img, f);
    scena.appendChild(img);
    popisky();
    stavPasu();
    prednacti();
    if (vHistorii) history.replaceState({ galerie: 1 }, "", location.pathname + location.search + "#" + f.id);
    if (G.volby.efekt === "zadny" || KLID) { if (stary) stary.remove(); return; }
    var tento = img, posun = (smer || 1) * 40;
    tento.style.opacity = 0;
    tento.style.transform = "translateX(" + posun + "px)";
    dekoduj(tento, 500).then(function () {
      if (tento !== img) return;
      requestAnimationFrame(function () {
        var tr = "opacity .34s ease, transform .34s cubic-bezier(.2,.75,.15,1)";
        tento.style.transition = tr;
        tento.style.opacity = 1;
        tento.style.transform = "none";
        if (stary) {
          stary.style.transition = tr;
          stary.style.opacity = 0;
          stary.style.transform = "translateX(" + -posun + "px)";
          setTimeout(function () { stary.remove(); }, 360);
        }
      });
    });
  }

  function popisky() {
    var f = sada[i];
    pocet.textContent = i + 1 + " / " + sada.length;
    popisEl.textContent = f.popis;
    poznamkaEl.textContent = f.maly
      ? "Ukázka ze starého webu, jen " + f.w + " × " + f.h + " px. Z originálu bude ostrá a půjde zvětšit 1:1."
      : f.obrazec ? "Klikněte do obrazce nebo stiskněte Z — lupa ukáže každý pixel originálu." : "";
  }

  function stavPasu(znovu) {
    pasEl.hidden = !sPasem;
    if (!sPasem) return;
    if (znovu) {
      pasEl.innerHTML = sada.map(function (f, k) {
        return '<button class="g-pol" data-k="' + k + '" aria-label="Fotografie ' + (k + 1) + '"><img src="' + f.nahled +
          '" alt="" width="' + Math.round(56 * f.w / f.h) + '" height="56" loading="lazy" decoding="async"></button>';
      }).join("");
    }
    [].forEach.call(pasEl.children, function (b, k) {
      b.classList.toggle("akt", k === i);
      if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    var a = pasEl.children[i];
    if (a) pasEl.scrollTo({ left: a.offsetLeft - pasEl.clientWidth / 2 + a.offsetWidth / 2, behavior: KLID || znovu ? "auto" : "smooth" });
  }

  function prednacti() {
    [i + 1, i - 1, i + 2].forEach(function (k) { prednactiFotku(sada[(k + sada.length) % sada.length]); });
  }

  // --- Lupa 1:1: jeden pixel fotky = jeden pixel displeje; plné rozlišení se načte až teď ---
  function prepniLupu(bod) {
    if (lupa) return zrusLupu();
    var f = sada[i], r = ram(f), dpr = devicePixelRatio || 1, s = f.w / dpr / r.w;
    if (!f.plny || s <= 1.05) {
      hlaska(f.maly
        ? "Lupa 1:1 začne fungovat s originály — tato ukázka ze starého webu má jen " + f.w + " × " + f.h + " px."
        : "Fotka už je zobrazená v plném rozlišení.");
      return;
    }
    var b = lb.getBoundingClientRect();
    bod = bod || { x: b.left + r.x + r.w / 2, y: b.top + r.y + r.h / 2 };
    var px = (bod.x - b.left - r.x) / r.w, py = (bod.y - b.top - r.y) / r.h;
    lupa = { W: r.w * s, H: r.h * s, L: 0, T: 0 };
    img.style.transition = KLID ? "none" : "left .4s cubic-bezier(.2,.75,.15,1), top .4s cubic-bezier(.2,.75,.15,1), width .4s cubic-bezier(.2,.75,.15,1), height .4s cubic-bezier(.2,.75,.15,1)";
    img.style.transform = "none";
    posun(bod.x - b.left - px * lupa.W, bod.y - b.top - py * lupa.H);
    lb.classList.add("lupa");
    lb.querySelector(".g-lupa").setAttribute("aria-pressed", "true");
    if (img.dataset.plny !== "1") {
      var hi = new Image(), tento = img;
      hi.src = f.plny;
      lb.classList.add("nacita");
      dekoduj(hi, 15000).then(function () {
        lb.classList.remove("nacita");
        if (tento !== img) return;
        tento.removeAttribute("srcset");
        tento.src = f.plny;
        tento.dataset.plny = "1";
      });
    }
  }
  function posun(L, T) {
    var b = lb.getBoundingClientRect(), W = lupa.W, H = lupa.H;
    L = W <= b.width ? (b.width - W) / 2 : Math.min(0, Math.max(b.width - W, L));
    T = H <= b.height ? (b.height - H) / 2 : Math.min(0, Math.max(b.height - H, T));
    lupa.L = L;
    lupa.T = T;
    img.style.left = L + "px";
    img.style.top = T + "px";
    img.style.width = W + "px";
    img.style.height = H + "px";
  }
  function zrusLupu(hned) {
    if (!lupa) return;
    lupa = null;
    lb.classList.remove("lupa", "nacita");
    lb.querySelector(".g-lupa").setAttribute("aria-pressed", "false");
    img.style.transition = hned || KLID ? "none" : "left .34s ease, top .34s ease, width .34s ease, height .34s ease";
    umisti(img, sada[i]);
  }

  // --- Ovládání: tažení (listování, posun v lupě, zavření tahem dolů), klepnutí (lupa), klávesy ---
  function gesta() {
    var st = null;
    scena.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      st = { x: e.clientX, y: e.clientY, L: lupa && lupa.L, T: lupa && lupa.T, pohyb: false, cil: e.target };
      scena.setPointerCapture(e.pointerId);
    });
    scena.addEventListener("pointermove", function (e) {
      if (!st) return;
      var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.pohyb && Math.abs(dx) + Math.abs(dy) > 6) { st.pohyb = true; img.style.transition = "none"; }
      if (!st.pohyb) return;
      if (lupa) posun(st.L + dx, st.T + dy);
      else img.style.transform = Math.abs(dy) > Math.abs(dx) && !trvale
        ? "translateY(" + Math.max(0, dy) + "px)" : "translateX(" + dx + "px)";
    });
    scena.addEventListener("pointerup", function (e) {
      if (!st) return;
      var s = st, dx = e.clientX - s.x, dy = e.clientY - s.y;
      st = null;
      if (s.pohyb) {
        if (lupa) return;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) prejdi(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        else if (dy > 110 && !trvale) G.zavri();
        else { img.style.transition = "transform .25s ease"; img.style.transform = "none"; }
        return;
      }
      if (s.cil !== img) { if (!lupa && !trvale) G.zavri(); return; }
      prepniLupu({ x: e.clientX, y: e.clientY });
    });
    scena.addEventListener("pointercancel", function () {
      st = null;
      if (img && !lupa) { img.style.transition = "transform .25s ease"; img.style.transform = "none"; }
    });
    scena.addEventListener("wheel", function (e) {
      if (!lupa) return;
      e.preventDefault();
      posun(lupa.L - e.deltaX, lupa.T - e.deltaY);
    }, { passive: false });
  }

  function klavesy(e) {
    if (!otevreno || (e.target.closest && e.target.closest("select,input,textarea"))) return;
    var k = e.key;
    if (k === "Escape") { if (lupa) zrusLupu(); else G.zavri(); }
    else if (k === "ArrowRight") prejdi(i + 1, 1);
    else if (k === "ArrowLeft") prejdi(i - 1, -1);
    else if (k === "Home") prejdi(0, -1);
    else if (k === "End") prejdi(sada.length - 1, 1);
    else if (k === "z" || k === "Z") prepniLupu();
    else if (k === "b" || k === "B") dalsiPozadi();
    else if (k === "Tab") { pastFokusu(e); probud(); return; }
    else return;
    e.preventDefault();
    probud();
  }
  function pastFokusu(e) {
    if (trvale) return;
    var f = [].slice.call(lb.querySelectorAll("button")).filter(function (b) { return b.offsetParent !== null && !b.disabled; });
    if (!f.length) return;
    var a = f.indexOf(document.activeElement);
    if (e.shiftKey && a <= 0) { f[f.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && a === f.length - 1) { f[0].focus(); e.preventDefault(); }
  }
  function dalsiPozadi() {
    var k = Object.keys(POZADI), n = k[(k.indexOf(G.volby.pozadi) + 1) % k.length];
    G.nastav({ pozadi: n });
    hlaska("Pozadí: " + POZADI[n]);
  }
  function hlaska(t) {
    hlaskaEl.textContent = t;
    hlaskaEl.classList.add("on");
    clearTimeout(casHlasky);
    casHlasky = setTimeout(function () { hlaskaEl.classList.remove("on"); }, 2800);
  }
  // Ovládání zmizí, když se myš 2,6 s nehne — zůstane jen fotka
  function probud() {
    if (!lb) return;
    lb.classList.remove("klid");
    clearTimeout(casovac);
    if (!DOTYK) casovac = setTimeout(function () {
      if (otevreno && !lb.querySelector(".g-ovl:hover")) lb.classList.add("klid");
    }, 2600);
  }

  // Otevře fotku podle #id v adrese (odkaz poslaný e-mailem)
  G.zOdkazu = function (polozky, fn, moznosti) {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return false;
    for (var k = 0; k < polozky.length; k++) if (polozky[k].id === id) {
      moznosti = moznosti || {};
      moznosti.zOdkazu = true;
      G.otevri(polozky, k, fn, moznosti);
      return true;
    }
    return false;
  };
})();
