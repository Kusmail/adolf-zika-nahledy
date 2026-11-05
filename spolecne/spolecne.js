// Společné pomůcky všech návrhů: cesty k obrázkům, prohlížeč fotek (lightbox), světlý/tmavý vzhled.
// Návrh leží v navrhy/<n-nazev>/, obsah a fotky v navrhy/spolecne/ a navrhy/media/.
(function () {
  var Z = (window.Z = {});
  Z.cesta = function (p) { return p ? "../" + p : ""; };
  Z.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  // Seznam fotek složky: [{src, w, h}]
  Z.fotky = function (slozka) {
    return (window.FOTKY[slozka] || []).map(function (f) { return { src: Z.cesta(f[0]), w: f[1], h: f[2] }; });
  };
  Z.img = function (f, alt, cls) {
    return '<img src="' + f.src + '" width="' + f.w + '" height="' + f.h + '" alt="' + Z.esc(alt || "") +
      '" loading="lazy" decoding="async"' + (cls ? ' class="' + cls + '"' : "") + ">";
  };

  // --- Vzhled: ?vzhled=tmavy|svetly nebo zpráva z rozcestníku; bez nich vlastní vzhled návrhu (data-vychozi na <html>) ---
  function nastavVzhled(v) {
    if (v === "tmavy" || v === "svetly") document.documentElement.dataset.vzhled = v;
  }
  try { nastavVzhled(new URLSearchParams(location.search).get("vzhled")); } catch (e) {}
  window.addEventListener("message", function (e) {
    if (e.origin === location.origin && e.data && e.data.vzhled) nastavVzhled(e.data.vzhled);
  });
  Z.prepniVzhled = function () {
    var ted = document.documentElement.dataset.vzhled || document.documentElement.dataset.vychozi || "svetly";
    nastavVzhled(ted === "tmavy" ? "svetly" : "tmavy");
  };

  // --- Prohlížeč fotek ---
  var lb, lbImg, lbPopis, sada = [], i = 0, posledniFokus = null;
  function vytvor() {
    lb = document.createElement("div");
    lb.className = "z-lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Prohlížeč fotografií");
    lb.innerHTML =
      '<button class="z-lb-x" aria-label="Zavřít">×</button>' +
      '<button class="z-lb-p" aria-label="Předchozí">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="z-lb-n" aria-label="Další">›</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector("img");
    lbPopis = lb.querySelector("figcaption");
    lb.querySelector(".z-lb-x").onclick = Z.zavri;
    lb.querySelector(".z-lb-p").onclick = function () { ukaz(i - 1); };
    lb.querySelector(".z-lb-n").onclick = function () { ukaz(i + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") Z.zavri(); });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) ukaz(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") Z.zavri();
      if (e.key === "ArrowRight") ukaz(i + 1);
      if (e.key === "ArrowLeft") ukaz(i - 1);
    });
  }
  function ukaz(n) {
    i = (n + sada.length) % sada.length;
    lbImg.src = sada[i].src;
    lbPopis.textContent = (sada[i].popis ? sada[i].popis + " · " : "") + (i + 1) + " / " + sada.length;
  }
  Z.otevri = function (fotky, n) {
    if (!lb) vytvor();
    sada = fotky; posledniFokus = document.activeElement;
    ukaz(n || 0);
    lb.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    lb.querySelector(".z-lb-x").focus();
  };
  Z.zavri = function () {
    lb.classList.remove("on");
    document.documentElement.style.overflow = "";
    if (posledniFokus) posledniFokus.focus();
  };
  // Klik na [data-sada="slozka"][data-i] otevře prohlížeč
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-sada]");
    if (!t) return;
    e.preventDefault();
    Z.otevri(Z.fotky(t.dataset.sada), +t.dataset.i || 0);
  });

  var css = document.createElement("style");
  css.textContent =
    ".z-lb{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.94);display:none;align-items:center;justify-content:center}" +
    ".z-lb.on{display:flex}.z-lb figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:.8rem;max-width:92vw}" +
    ".z-lb img{max-width:92vw;max-height:82vh;width:auto;height:auto;object-fit:contain}" +
    ".z-lb figcaption{color:#bbb;font:13px/1.4 system-ui,sans-serif;letter-spacing:.08em}" +
    ".z-lb button{position:absolute;background:none;border:0;color:#fff;font:300 44px/1 system-ui,sans-serif;min-width:48px;min-height:48px;cursor:pointer;opacity:.75}" +
    ".z-lb button:hover,.z-lb button:focus-visible{opacity:1;outline:2px solid #fff;outline-offset:2px}" +
    ".z-lb-x{top:10px;right:10px}.z-lb-p{left:6px;top:50%;transform:translateY(-50%)}.z-lb-n{right:6px;top:50%;transform:translateY(-50%)}" +
    "[data-sada]{cursor:zoom-in}";
  document.head.appendChild(css);
})();
