// Prohlížeč fotek návrhu 6 (vybral majitel 5. 11. 2026, varianta 4 z lupa-varianty.html):
// 1) prohlížeč s paspartou se hned otevře přes celou obrazovku (kde to prohlížeč umí; Safari na iPhonu ne — tam zabere okno),
// 2) klik / klepnutí do fotky ukáže samotnou fotku celou přes obrazovku, bez přiblížení,
// 3) přiblížení až na přání: Přiblížit + / − Oddálit, kolečko myši, dva prsty, dvojklik; při přiblížení mapka s výřezem.
// Použití: PROHLIZEC.otevri(polozky, n) — položky jako pro G.radky (w, h, nahled, zdroje, plny, popis „Rubrika · …“).
(function () {
  var h = document.documentElement, DOTYK = matchMedia("(pointer:coarse)").matches;
  var STROP = 1.5;   // v paspartě se fotka nezvětší víc než 1,5× (malé soubory ze starého webu by byly rozmazané)
  var SADA = [], ted = 0, odkud = null, skryti = 0, pv, scena, dt = null;

  function zdroj(f, sirka) {
    var z = f.zdroje || [[f.nahled, f.w]], potreba = sirka * (devicePixelRatio || 1);
    for (var k = 0; k < z.length; k++) if (z[k][1] >= potreba) return z[k][0];
    return f.plny || z[z.length - 1][0];
  }
  function velky(f) { return f.plny || (f.zdroje ? f.zdroje[f.zdroje.length - 1][0] : f.nahled); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // --- Celá obrazovka ---
  function umiCelou() { return !!(pv.requestFullscreen || pv.webkitRequestFullscreen); }
  function naCelou() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function celaObrazovka(zapnout) {
    if (!umiCelou()) return;
    try {
      if (zapnout && !naCelou()) { var r = pv.requestFullscreen ? pv.requestFullscreen() : pv.webkitRequestFullscreen(); if (r && r.catch) r.catch(function () {}); }
      else if (!zapnout && naCelou()) { if (document.exitFullscreen) document.exitFullscreen(); else document.webkitExitFullscreen(); }
    } catch (e) {}
  }

  function postav() {
    pv = document.createElement("div");
    pv.className = "pv"; pv.hidden = true;
    pv.setAttribute("role", "dialog"); pv.setAttribute("aria-modal", "true"); pv.setAttribute("aria-label", "Prohlížeč fotek");
    pv.innerHTML = '<div class="pv-hore"><span class="pv-poc"></span><span class="pv-rub"></span><button class="pv-x">Zavřít</button></div>' +
      '<div class="pv-scena"></div><div class="pv-dole"><button class="pv-pred">← Předchozí</button><button class="pv-dal">Další →</button></div>';
    document.body.appendChild(pv);
    scena = pv.querySelector(".pv-scena");
    pv.querySelector(".pv-x").onclick = zavri;
    pv.querySelector(".pv-pred").onclick = function () { jdi(ted - 1); };
    pv.querySelector(".pv-dal").onclick = function () { jdi(ted + 1); };
    scena.addEventListener("click", function (e) { if (e.target.closest(".pv-dilo img,.pozvanka")) otevriDetail(); });
    var x0 = null;   // listování potažením prstem po paspartě
    scena.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    scena.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) jdi(ted + (dx < 0 ? 1 : -1));
    });
    document.addEventListener("fullscreenchange", prepocet);
    document.addEventListener("webkitfullscreenchange", prepocet);
    addEventListener("resize", prepocet);
    addEventListener("keydown", klavesy);
  }
  function prepocet() { if (dt) dt.meze(); if (pv && !pv.hidden) vykresli(false); }

  // --- Pasparta ---
  function vykresli(prechod) {
    var f = SADA[ted], r = scena.getBoundingClientRect(), malo = innerWidth < 700, uzky = innerWidth <= 480;
    var rub = String(f.popis || "").split(" · ")[0];
    pv.querySelector(".pv-poc").textContent = String(ted + 1).padStart(2, "0") + " / " + String(SADA.length).padStart(2, "0");
    pv.querySelector(".pv-rub").textContent = rub;
    var okraj = Math.round(Math.max(14, Math.min(36, innerWidth * 0.026)));
    var k = Math.min((r.width - (malo ? 32 : 80) - 2 * okraj) / f.w, (r.height - (uzky ? 124 : malo ? 86 : 100) - 2 * okraj) / f.h, STROP);
    var w = Math.round(f.w * k), v = Math.round(f.h * k);
    var pozvanka = DOTYK ? "Klepněte do fotky — jen fotka" : "Klikněte do fotky — jen fotka";
    scena.innerHTML = '<figure class="pv-dilo" style="padding:' + okraj + "px;margin-bottom:" + (uzky ? 94 : malo ? 56 : 64) + "px;opacity:" + (prechod ? 0 : 1) + '">' +
      '<img src="' + zdroj(f, w) + '" alt="' + esc(f.popis) + '" width="' + w + '" height="' + v + '" draggable="false">' +
      '<figcaption class="pv-stitek"><b>[doplnit název]</b>' + esc(rub) + " · [doplnit rok]</figcaption>" +
      '<button class="pozvanka"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/></svg>' + pozvanka + "</button></figure>";
    if (prechod) requestAnimationFrame(function () { requestAnimationFrame(function () { scena.firstChild.style.opacity = 1; }); });
  }
  function otevri(polozky, n) {
    if (!pv) postav();
    clearTimeout(skryti); SADA = polozky; ted = n; odkud = document.activeElement;
    pv.hidden = false; h.style.overflow = "hidden";
    celaObrazovka(true);
    vykresli(false);
    requestAnimationFrame(function () { pv.classList.add("on"); });
    pv.querySelector(".pv-x").focus({ preventScroll: true });
  }
  function zavri() {
    zavriDetail(); celaObrazovka(false);
    pv.classList.remove("on"); h.style.overflow = "";
    skryti = setTimeout(function () { pv.hidden = true; scena.innerHTML = ""; }, 350);
    if (odkud) odkud.focus({ preventScroll: true });
  }
  function jdi(k) { ted = (k + SADA.length) % SADA.length; vykresli(true); }
  function klavesy(e) {
    if (!pv || pv.hidden) return;
    if (dt) {
      if (e.key === "Escape") zavriDetail();
      else if (e.key === "+" || e.key === "=") dt.krok(1);
      else if (e.key === "-") dt.krok(-1);
      else if (e.key === "0") dt.cela();
      return;
    }
    if (e.key === "Escape") zavri();
    else if (e.key === "ArrowLeft") jdi(ted - 1);
    else if (e.key === "ArrowRight") jdi(ted + 1);
  }

  // --- Samotná fotka přes celou obrazovku, přiblížení na přání ---
  function otevriDetail() {
    if (dt) return;
    var f = SADA[ted];
    var el = document.createElement("div");
    el.className = "dt";
    el.innerHTML = '<img class="dt-img" src="' + velky(f) + '" alt="' + esc(f.popis) + '" draggable="false">' +
      '<div class="dt-mapa" title="Klepnutím sem skočíte na jiné místo fotky"><img src="' + f.nahled + '" alt=""><i></i></div>' +
      '<div class="dt-ovl"><button class="dt-minus" aria-label="Oddálit">− Oddálit</button><span class="dt-uroven" aria-live="polite"></span>' +
      '<button class="dt-plus" aria-label="Přiblížit">Přiblížit +</button><button class="dt-zpet">' + (DOTYK ? "Zpět" : "Zpět na fotku") + "</button></div>" +
      '<p class="dt-rada">' + (DOTYK ? "Přiblížit: tlačítko Přiblížit +, dva prsty nebo dvojí klepnutí" : "Přiblížit: tlačítko Přiblížit +, kolečko myši nebo dvojklik") + "</p>" +
      (f.plny ? "" : '<p class="dt-mekke">Malý soubor ze starého webu — s originálem bude detail ostrý</p>');
    pv.appendChild(el);   // uvnitř prohlížeče, aby byl vidět i na celé obrazovce
    var img = el.querySelector(".dt-img"), mapa = el.querySelector(".dt-mapa"), ram = mapa.querySelector("i");
    img.style.width = f.w + "px"; img.style.height = f.h + "px";
    var S = { s: 0, x: 0, y: 0 }, W, H, fit, max, stupne;
    function meze() {
      W = innerWidth; H = innerHeight;
      fit = Math.min(W / f.w, H / f.h);
      max = Math.max(1 / (devicePixelRatio || 1), fit * 2.5);   // originál až 1:1, malý soubor nejvýš 2,5× celé fotky
      stupne = [fit, Math.sqrt(fit * max), max];
    }
    function omez() {
      S.s = Math.min(max, Math.max(fit, S.s));
      var w = f.w * S.s, hh = f.h * S.s;
      S.x = w <= W ? (W - w) / 2 : Math.min(0, Math.max(W - w, S.x));
      S.y = hh <= H ? (H - hh) / 2 : Math.min(0, Math.max(H - hh, S.y));
    }
    function kresli(anim) {
      omez();
      img.style.transition = anim ? "transform .55s cubic-bezier(.2,.7,.2,1)" : "none";
      img.style.transform = "translate(" + S.x + "px," + S.y + "px) scale(" + S.s + ")";
      var cela = S.s <= fit * 1.01;
      el.querySelector(".dt-uroven").textContent = cela ? "Celá fotka" : (f.plny && S.s >= max * 0.99 ? "1 : 1" : (Math.round(S.s / fit * 10) / 10).toString().replace(".", ",") + "×");
      el.querySelector(".dt-minus").disabled = cela;
      el.querySelector(".dt-plus").disabled = S.s >= max * 0.99;
      el.classList.toggle("lze-tahnout", !cela);
      mapa.classList.toggle("skryta", cela);
      var sw = f.w * S.s, sh = f.h * S.s;
      ram.style.left = 5 + Math.max(0, -S.x / sw) * (mapa.clientWidth - 10) + "px";
      ram.style.top = 5 + Math.max(0, -S.y / sh) * (mapa.clientHeight - 10) + "px";
      ram.style.width = Math.min(1, W / sw) * (mapa.clientWidth - 10) + "px";
      ram.style.height = Math.min(1, H / sh) * (mapa.clientHeight - 10) + "px";
    }
    function priblizNa(s, cx, cy, anim) {
      var px = (cx - S.x) / S.s, py = (cy - S.y) / S.s;
      S.s = Math.min(max, Math.max(fit, s)); S.x = cx - px * S.s; S.y = cy - py * S.s; kresli(anim);
    }
    function stred(rx, ry, s) { S.s = s; S.x = W / 2 - rx * f.w * s; S.y = H / 2 - ry * f.h * s; kresli(false); }
    meze(); S.s = fit; kresli(false);
    requestAnimationFrame(function () { el.classList.add("on"); });

    var rada = el.querySelector(".dt-rada"), radaPryc = setTimeout(function () { rada.classList.add("pryc"); }, 4000);
    function schovejRadu() { clearTimeout(radaPryc); rada.classList.add("pryc"); }

    // tažení, dva prsty, dvojí klepnutí / dvojklik
    var body = new Map(), stipnuti = null, pohyb = 0, posledni = { t: 0, x: 0, y: 0 };
    function rozestup() { var p = Array.from(body.values()); return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
    el.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".dt-ovl,.dt-mapa")) return;
      el.setPointerCapture(e.pointerId);
      body.set(e.pointerId, { x: e.clientX, y: e.clientY }); pohyb = 0;
      if (body.size === 2) stipnuti = { d: rozestup(), s: S.s };
      el.classList.add("tahne");
    });
    el.addEventListener("pointermove", function (e) {
      if (!body.has(e.pointerId)) return;
      var a = body.get(e.pointerId), b = { x: e.clientX, y: e.clientY };
      body.set(e.pointerId, b);
      if (body.size === 1) { S.x += b.x - a.x; S.y += b.y - a.y; pohyb += Math.abs(b.x - a.x) + Math.abs(b.y - a.y); kresli(false); }
      else if (stipnuti) {
        var p = Array.from(body.values());
        priblizNa(stipnuti.s * rozestup() / stipnuti.d, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2, false); pohyb += 99;
      }
      if (pohyb > 6) schovejRadu();
    });
    function pust(e) {
      if (!body.has(e.pointerId)) return;
      body.delete(e.pointerId); if (body.size < 2) stipnuti = null;
      if (!body.size) el.classList.remove("tahne");
      if (pohyb < 6 && e.type === "pointerup") {
        var t = Date.now();
        if (t - posledni.t < 320 && Math.hypot(e.clientX - posledni.x, e.clientY - posledni.y) < 30) {
          priblizNa(S.s > fit * 1.05 ? fit : stupne[1], e.clientX, e.clientY, true);
          posledni.t = 0; schovejRadu();
        } else posledni = { t: t, x: e.clientX, y: e.clientY };
      }
    }
    el.addEventListener("pointerup", pust);
    el.addEventListener("pointercancel", pust);
    el.addEventListener("wheel", function (e) { e.preventDefault(); schovejRadu(); priblizNa(S.s * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY, false); }, { passive: false });
    function krok(smer) {
      var cil = smer > 0 ? stupne.filter(function (x) { return x > S.s * 1.01; })[0] : stupne.filter(function (x) { return x < S.s * 0.99; }).pop();
      if (cil != null) priblizNa(cil, W / 2, H / 2, true);
      schovejRadu();
    }
    el.querySelector(".dt-plus").onclick = function () { krok(1); };
    el.querySelector(".dt-minus").onclick = function () { krok(-1); };
    el.querySelector(".dt-zpet").onclick = zavriDetail;
    function naMapu(e) {
      var r = mapa.getBoundingClientRect();
      stred(Math.min(1, Math.max(0, (e.clientX - r.left - 5) / (r.width - 10))), Math.min(1, Math.max(0, (e.clientY - r.top - 5) / (r.height - 10))), S.s);
    }
    mapa.addEventListener("pointerdown", function (e) { mapa.setPointerCapture(e.pointerId); mapa.tah = true; naMapu(e); schovejRadu(); });
    mapa.addEventListener("pointermove", function (e) { if (mapa.tah) naMapu(e); });
    mapa.addEventListener("pointerup", function () { mapa.tah = false; });
    dt = { el: el, meze: function () { meze(); kresli(false); }, krok: krok, cela: function () { priblizNa(fit, W / 2, H / 2, true); } };
  }
  function zavriDetail() {
    if (!dt) return;
    var el = dt.el; dt = null;
    el.classList.remove("on");
    setTimeout(function () { el.remove(); }, 300);
  }

  window.PROHLIZEC = { otevri: otevri, zavri: zavri };
})();
