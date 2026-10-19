/* ==========================================================================
   Tout ce qui suit le hero : carte, chiffres, commande, assistant, infos.
   Le contenu vient de window.SITE (config/site.config.js).
   ========================================================================== */
(function () {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const euro = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ---- Textes de marque ---- */
  $$("[data-brand-tagline]").forEach((el) => (el.textContent = S.brand.tagline));
  $("[data-credit]").textContent = S.footer.credit;

  /* ======================= La carte ======================= */
  const menu = S.menu;
  let idx = 0;
  const stage = $("[data-stage]");
  const imgs = $("[data-stage-imgs]");
  imgs.innerHTML = menu.map((p, i) =>
    `<img src="${esc(p.img)}" alt="${esc(p.name)} : ${esc(p.desc)}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" class="${i === 0 ? "is-on" : ""}">`
  ).join("");

  // Ardoise : catégories avec la plage de prix, comme un menu au mur
  $("[data-board]").innerHTML = S.categories.map((c) => {
    const items = menu.filter((p) => p.cat === c.key);
    const prices = items.map((p) => p.price);
    const range = prices.length ? `${Math.min(...prices)}–${Math.max(...prices)}` : "";
    return `<li><button data-cat="${c.key}"><span>${esc(c.label)}</span><span class="board-range">${range}</span></button></li>`;
  }).join("");
  $$("[data-cat]").forEach((b) => b.addEventListener("click", () => {
    show(menu.findIndex((p) => p.cat === b.dataset.cat));
  }));

  $("[data-thumbs]").innerHTML = menu.map((p, i) =>
    `<button role="tab" data-thumb="${i}" aria-label="${esc(p.name)}"><img src="${esc(p.img)}" alt="" loading="lazy"><span>${esc(p.name)}</span></button>`
  ).join("");
  $$("[data-thumb]").forEach((b) => b.addEventListener("click", () => show(+b.dataset.thumb)));

  function show(i) {
    idx = (i + menu.length) % menu.length;
    const p = menu[idx];
    $$("img", imgs).forEach((im, k) => im.classList.toggle("is-on", k === idx));
    const glass = $("[data-glass]");
    glass.classList.remove("is-in"); void glass.offsetWidth; glass.classList.add("is-in");
    $("[data-glass-name]").textContent = p.name;
    $("[data-glass-desc]").textContent = p.desc;
    $("[data-glass-meta]").textContent = `${p.meta} · ${euro(p.price)}`;
    const name = $("[data-stage-name]");
    name.classList.remove("is-in"); void name.offsetWidth; name.classList.add("is-in");
    name.textContent = p.name;
    $("[data-stage-price]").textContent = euro(p.price);
    $("[data-stage-count]").textContent = `${String(idx + 1).padStart(2, "0")} / ${String(menu.length).padStart(2, "0")}`;
    $$("[data-thumb]").forEach((b, k) => b.setAttribute("aria-selected", k === idx));
    $$("[data-cat]").forEach((b) => b.classList.toggle("is-on", b.dataset.cat === p.cat));
    const thumb = $(`[data-thumb="${idx}"]`);
    const strip = $("[data-thumbs]");
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }
  $("[data-prev]").addEventListener("click", () => show(idx - 1));
  $("[data-next]").addEventListener("click", () => show(idx + 1));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let touchX = null;
  stage.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  $("[data-add]").addEventListener("click", (e) => {
    add(menu[idx].id);
    const btn = e.currentTarget;
    btn.textContent = "Ajoutée ✓";
    setTimeout(() => (btn.textContent = "Ajouter à ma commande"), 1100);
  });
  show(0);

  /* ======================= Les chiffres ======================= */
  $("[data-craft]").innerHTML = S.craft.map((c) => `
    <article class="craft-item">
      <p class="giant"><span class="giant-n" data-count="${esc(c.number)}">${esc(c.number)}</span><em>${esc(c.unit)}</em></p>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.text)}</p>
    </article>`).join("");
  // Compteur qui monte quand le chiffre entre à l'écran
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    (function step(t) {
      const k = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => io.observe(el));

  /* ======================= Commande ======================= */
  const basket = new Map();       // id -> quantité
  let mode = S.order.modes[0].key;
  let slot = S.order.slots[3];

  function add(id) { basket.set(id, (basket.get(id) || 0) + 1); renderOrder(); }
  function setQty(id, q) { q <= 0 ? basket.delete(id) : basket.set(id, q); renderOrder(); }

  $("[data-modes]").innerHTML = S.order.modes.map((m) =>
    `<button class="chip" role="radio" data-mode="${m.key}">${esc(m.label)}</button>`).join("");
  $("[data-slots]").innerHTML = S.order.slots.map((s) =>
    `<button class="chip" role="radio" data-slot="${s}">${s}</button>`).join("");
  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; renderOrder(); }));
  $$("[data-slot]").forEach((b) => b.addEventListener("click", () => { slot = b.dataset.slot; renderOrder(); }));

  function renderOrder() {
    const lines = [...basket].map(([id, q]) => ({ p: menu.find((m) => m.id === id), q }));
    const total = lines.reduce((s, l) => s + l.p.price * l.q, 0);
    const count = lines.reduce((s, l) => s + l.q, 0);
    $("[data-order-lines]").innerHTML = lines.length
      ? lines.map(({ p, q }) => `
        <div class="line">
          <span class="line-name">${esc(p.name)}</span>
          <span class="qty">
            <button data-qty="${p.id}" data-d="-1" aria-label="Retirer une ${esc(p.name)}">−</button>
            <b>${q}</b>
            <button data-qty="${p.id}" data-d="1" aria-label="Ajouter une ${esc(p.name)}">+</button>
          </span>
          <span class="line-price">${euro(p.price * q)}</span>
        </div>`).join("") + `<div class="line line-total"><span>Total</span><span></span><span>${euro(total)}</span></div>`
      : `<p class="order-empty">Votre commande est vide. <a href="#carte">Choisissez dans la carte</a> ou commencez par une Margherita.</p>
         <button class="pill pill-ghost" data-quick="margherita">+ Margherita, 11 €</button>`;
    $$("[data-qty]").forEach((b) => b.addEventListener("click", () => setQty(b.dataset.qty, (basket.get(b.dataset.qty) || 0) + +b.dataset.d)));
    const quick = $("[data-quick]");
    if (quick) quick.addEventListener("click", () => add(quick.dataset.quick));

    $$("[data-mode]").forEach((b) => b.setAttribute("aria-checked", b.dataset.mode === mode));
    $$("[data-slot]").forEach((b) => b.setAttribute("aria-checked", b.dataset.slot === slot));

    const what = lines.length ? lines.map(({ p, q }) => `${q} × ${p.name}`).join(", ") : "Une table";
    const modeLabel = S.order.modes.find((m) => m.key === mode).label.toLowerCase();
    const sentence = `${what}, ${modeLabel}, ce soir vers ${slot.replace(":00", " h").replace(":", " h ")}.`;
    $("[data-order-sentence]").textContent = sentence;
    const msg = `Bonjour ${S.brand.name} ! ${sentence}${total ? ` (total ${euro(total)})` : ""}`;
    $("[data-order-wa]").href = `https://wa.me/${S.contact.whatsapp}?text=${encodeURIComponent(msg)}`;
    $("[data-order-call]").href = `tel:${S.contact.phone.replace(/\s/g, "")}`;

    $$("[data-basket-count]").forEach((el) => { el.hidden = !count; el.textContent = count; });
  }
  renderOrder();

  /* ======================= Assistant ======================= */
  const log = $("[data-chat-log]");
  function say(text, who) {
    const p = document.createElement("p");
    p.className = "bubble bubble-" + who;
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }
  function answer(q) {
    const n = norm(q);
    const hit = S.faq.find((f) => f.keys.some((k) => n.includes(k)))
      || menu.filter((p) => n.includes(norm(p.name).split(" ")[0]))
             .map((p) => ({ a: `${p.name} : ${p.desc} ${euro(p.price)}.` }))[0];
    return hit ? hit.a : S.assistantFallback;
  }
  function ask(q) {
    if (!q.trim()) return;
    say(q, "me");
    const typing = document.createElement("p");
    typing.className = "bubble bubble-bot is-typing";
    typing.textContent = "…";
    log.appendChild(typing);
    setTimeout(() => { typing.remove(); say(answer(q), "bot"); }, 550);
  }
  say(`Bonsoir ! Je connais la carte de ${S.brand.name} par cœur. Posez votre question.`, "bot");
  $("[data-chat-chips]").innerHTML = S.faq.slice(0, 5).map((f, i) => `<button class="chip" data-faq="${i}">${esc(f.q)}</button>`).join("");
  $$("[data-faq]").forEach((b) => b.addEventListener("click", () => ask(S.faq[+b.dataset.faq].q)));
  $("[data-chat-form]").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.q;
    ask(input.value);
    input.value = "";
  });

  /* ======================= Infos ======================= */
  $("[data-opening]").textContent = S.contact.opening;
  $("[data-address]").textContent = S.contact.address;
  $("[data-hours]").innerHTML = S.contact.hours.map(([d, h]) => `<div><dt>${esc(d)}</dt><dd>${esc(h)}</dd></div>`).join("");
  const insta = $("[data-insta]");
  insta.href = `https://instagram.com/${S.contact.instagram}`;
  insta.textContent = `@${S.contact.instagram}`;
  $("[data-map]").src = `https://www.google.com/maps?q=${encodeURIComponent(S.contact.mapQuery)}&output=embed`;

  /* Header : fond plein une fois sorti du hero */
  const top = $(".top");
  const hero = $(".hero");
  addEventListener("scroll", () => top.classList.toggle("is-solid", hero.getBoundingClientRect().bottom < 80), { passive: true });

  /* Apparition douce des sections */
  const rv = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), rv.unobserve(e.target))), { threshold: 0.15 });
  $$(".section-head, .menu-shell, .craft-item, .order-card, .chat, .map").forEach((el) => { el.classList.add("reveal"); rv.observe(el); });
})();
