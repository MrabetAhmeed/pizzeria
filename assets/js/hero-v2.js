/* ==========================================================================
   Hero piloté au scroll : les images de assets/frames sont dessinées sur un
   <canvas> collant. Descendre fait avancer la pizza, remonter la rembobine.
   Pas de librairie : la position de scroll donne directement l'image à afficher.

   Timeline (en « écrans » de scroll, réglables dans la config) :
     pause d'ouverture (image-clé « pâte ») → clip 1 → pause → clip 2 → … → clip 8 → pause finale + CTA
   ========================================================================== */
(function () {
  const cfg = window.SITE.hero;
  const section = document.querySelector(".hero");
  const canvas = section.querySelector(".hero-canvas");
  const ctx = canvas.getContext("2d");
  const wordEl = section.querySelector("[data-hero-word]");
  const textEl = section.querySelector("[data-hero-text]");
  const ctaEl = section.querySelector("[data-hero-cta]");
  const hintEl = section.querySelector("[data-hero-hint]");
  const stepsEl = section.querySelector("[data-hero-steps]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const total = cfg.frames;
  const starts = cfg.clipStarts;
  const clips = starts.length;
  const clipEnd = (k) => (k + 1 < clips ? starts[k + 1] : total - 1);

  /* ---- Timeline : segments « pause » (image fixe) et « lecture » (de a à b) ----
     Position -1 = image d'ouverture (poster), 0…total-1 = images de la vidéo. */
  const segs = [];
  const open = cfg.holdStart;
  segs.push({ len: open * 0.6, a: -1, b: -1, step: 0 });
  segs.push({ len: open * 0.4, a: -1, b: 0, step: 0 });          // fondu poster → 1re image
  for (let k = 0; k < clips; k++) {
    segs.push({ len: cfg.steps[k + 1].scroll || 1, a: starts[k], b: clipEnd(k), step: k + 1 });
    const last = k === clips - 1;
    segs.push({ len: last ? cfg.holdEnd : cfg.holdBetween, a: clipEnd(k), b: clipEnd(k), step: k + 1, end: last });
  }
  const length = segs.reduce((s, g) => s + g.len, 0);
  section.style.setProperty("--hero-length", (length * 100 + 100) + "svh");

  function locate(screens) {
    let acc = 0;
    for (const g of segs) {
      if (screens <= acc + g.len) {
        const t = g.len ? (screens - acc) / g.len : 1;
        return { pos: g.a + (g.b - g.a) * t, step: g.step, end: !!g.end };
      }
      acc += g.len;
    }
    const g = segs[segs.length - 1];
    return { pos: g.b, step: g.step, end: true };
  }

  /* ---- Chargement : le voisinage de la position d'abord, le reste en fond ---- */
  const frames = new Array(total);
  const requested = new Set();
  let inflight = 0;
  // images plus légères sur petit écran (choisies une fois au chargement)
  const framePath = cfg.framePathMobile && matchMedia("(max-width: 760px)").matches ? cfg.framePathMobile : cfg.framePath;
  const src = (i) => framePath + String(i).padStart(4, "0") + ".webp";
  function load(i) {
    if (i < 0 || i >= total || requested.has(i)) return;
    requested.add(i);
    inflight++;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { frames[i] = img; inflight--; needsDraw = true; };
    img.onerror = () => { inflight--; };
    img.src = src(i);
  }
  const poster = new Image();
  poster.onload = () => (needsDraw = true);
  poster.src = cfg.poster;

  // En fond : 1 image sur 8, puis 1 sur 4, 2, 1 — sans saturer le réseau
  const order = [];
  const seen = new Set();
  for (let step = 8; step >= 1; step >>= 1)
    for (let i = 0; i < total; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  let cursor = 0;
  (function pump() {
    while (inflight < 4 && cursor < order.length) load(order[cursor++]);
    if (cursor < order.length) setTimeout(pump, 60);
  })();
  // Prioritaire : les images juste devant (et un peu derrière) la position courante
  function loadAround(pos, dir) {
    let issued = 0;
    for (let d = 0; d < 36 && issued < 4; d++) {
      const i = Math.round(pos) + (dir >= 0 ? d : -d);
      if (!requested.has(i) && i >= 0 && i < total) { load(i); issued++; }
    }
  }

  // Image i, ou à défaut la plus proche déjà chargée DANS LE MÊME CLIP (jamais une autre étape)
  function clipOf(i) { let k = 0; while (k + 1 < clips && starts[k + 1] <= i) k++; return k; }
  function frameNear(i) {
    if (i < 0) return poster.complete && poster.naturalWidth ? poster : null;
    if (frames[i]) return frames[i];
    const k = clipOf(i), lo = starts[k], hi = clipEnd(k);
    for (let d = 1; d <= 12; d++) {
      if (i - d >= lo && frames[i - d]) return frames[i - d];
      if (i + d <= hi && frames[i + d]) return frames[i + d];
    }
    return null;
  }

  /* ---- Dessin : cadrage qui garde la pizza visible (centre ~62 % de l'image) ---- */
  const FOCUS = { x: 0.34, w: 0.58 };   // zone de l'image à toujours montrer (en largeur)
  let vw = 0, vh = 0, dpr = 1, mobile = false;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);   // les images font 854 px : au-delà, aucun gain visible
    vw = canvas.clientWidth; vh = canvas.clientHeight;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    mobile = vw < 760;
    needsDraw = true;
  }
  function placement(img) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cover = Math.max(vw / iw, vh / ih);
    const fit = Math.min(vw / (iw * FOCUS.w), vh / ih);
    const s = Math.min(cover, fit);
    const dw = iw * s, dh = ih * s;
    const focusCx = (FOCUS.x + FOCUS.w / 2) * dw;     // centre de la pizza, en px dessinés
    const anchorX = mobile ? 0.5 : 0.62;
    let x = vw * anchorX - focusCx;
    x = Math.min(0, Math.max(vw - dw, x));            // pas de bord vide si l'image couvre
    if (dw < vw) x = vw * anchorX - focusCx;
    // mobile : sous le texte, centré dans l'espace restant
    let y = mobile ? Math.min(vh - dh - 48, vh * 0.6 - dh / 2) : (vh - dh) / 2;
    if (dh >= vh) y = (vh - dh) / 2;
    return { x, y, dw, dh };
  }
  // Deux images voisines superposées : le fondu entre elles lisse les mouvements rapides
  function draw(imgA, imgB, mix) {
    const { x, y, dw, dh } = placement(imgA);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0e0c0b";
    ctx.fillRect(0, 0, vw, vh);
    ctx.drawImage(imgA, x, y, dw, dh);
    if (imgB && imgB !== imgA && mix > 0.01) {
      ctx.globalAlpha = mix;
      ctx.drawImage(imgB, x, y, dw, dh);
      ctx.globalAlpha = 1;
    }
    // fondu des bords quand l'image ne couvre pas tout l'écran (mobile, écrans très larges)
    const fade = (x0, y0, x1, y1) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, "rgba(14,12,11,0)"); g.addColorStop(1, "rgba(14,12,11,1)");
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0) || vw, Math.abs(y1 - y0) || vh);
    };
    const F = 70;
    if (y > 0) fade(0, y + F, 0, y);
    if (y + dh < vh) fade(0, y + dh - F, 0, y + dh);
    if (x + dw < vw) fade(x + dw - F, 0, x + dw, 0);
  }

  /* ---- Scroll → position + texte ---- */
  let target = -1, current = -1, needsDraw = true, lastStep = -1, dir = 1;
  function readScroll() {
    const r = section.getBoundingClientRect();
    const range = section.offsetHeight - window.innerHeight;
    const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
    const res = locate(p * length);
    if (res.pos !== target) dir = res.pos > target ? 1 : -1;
    target = res.pos;
    setStep(res.step);
    hintEl.classList.toggle("is-hidden", p > 0.01);
    ctaEl.classList.toggle("is-on", res.end);
  }

  function setStep(i) {
    if (i === lastStep) return;
    lastStep = i;
    const s = cfg.steps[i];
    wordEl.classList.remove("is-in");
    void wordEl.offsetWidth;                             // relance l'animation d'entrée
    wordEl.textContent = s.word;
    wordEl.dataset.tone = s.tone;
    wordEl.classList.add("is-in");
    textEl.textContent = s.text;
    stepsEl.querySelectorAll("li").forEach((li, k) => {
      li.classList.toggle("is-done", k < i);
      li.classList.toggle("is-now", k === i);
    });
  }

  stepsEl.innerHTML = cfg.steps.map((s) => `<li><span>${s.word.replace(".", "")}</span></li>`).join("");

  let lastT = performance.now();
  function tick(now) {
    const dt = Math.min(64, now - lastT); lastT = now;
    const diff = target - current;
    // lissage indépendant de la fréquence d'écran : l'image « glisse » après le geste
    const k = 1 - Math.pow(1 - cfg.smoothing, dt / 16.67);
    current = reduceMotion || Math.abs(diff) < 0.01 ? target : current + diff * k;
    if (needsDraw || Math.abs(diff) >= 0.01) {
      const a = Math.floor(current), mix = current - a;
      const imgA = frameNear(a), imgB = frameNear(a + 1);
      if (imgA) { draw(imgA, imgB, mix); needsDraw = false; }
      else if (imgB) { draw(imgB, null, 0); }
      loadAround(current, dir);
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => { resize(); readScroll(); });
  window.addEventListener("scroll", readScroll, { passive: true });
  resize();
  readScroll();
  current = target;
  requestAnimationFrame(tick);
})();
