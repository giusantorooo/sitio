/* ================================================================
   giusantoro.com — sitio estático, sin build
   Lee el contenido de /content/*.json (que escribe el panel /admin)
   ================================================================ */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

/* markdown mínimo: **negrita** + párrafos */
const md = (t) =>
  String(t || "")
    .split(/\n\s*\n/)
    .map((p) => "<p>" + esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>") + "</p>")
    .join("");

const clase = (m) => (m.length > 1 ? "m" : m[0] === "Joyería" ? "j" : "");

async function cargar(archivo) {
  const r = await fetch(`/content/${archivo}.json`, { cache: "no-store" });
  if (!r.ok) throw new Error(archivo);
  return r.json();
}

/* ---------- TARJETA ---------- */
function tarjeta(p, i) {
  const fondo = p.portada ? `style="background-image:url('${esc(p.portada)}')"` : "";
  const ph = p.portada ? "" : '<span class="ph">Foto</span>';
  return `
    <button class="tarj" data-i="${i}" style="animation-delay:${i * 55}ms">
      <div class="foto ${clase(p.material)}" ${fondo}>${ph}</div>
      <div class="tmeta">
        <span class="m">${esc(p.material.join(" + "))}</span>
        <span class="a">${esc(p.anio)}</span>
      </div>
      <h3>${esc(p.titulo)}</h3>
      <div class="ttag">${esc(p.trabajo.join(" · "))} — ${esc(p.contexto)}</div>
    </button>`;
}

/* ---------- FICHA ---------- */
function abrirFicha(p) {
  const fondo = p.portada ? `style="background-image:url('${esc(p.portada)}')"` : "";
  const ph = p.portada ? "" : '<span class="ph">Portada</span>';
  const gal = (p.galeria || []).length
    ? `<div class="gal">${p.galeria.map((g) => `<img src="${esc(g)}" alt="" loading="lazy">`).join("")}</div>`
    : "";

  const div = document.createElement("div");
  div.className = "overlay";
  div.innerHTML = `
    <div class="ficha" role="dialog" aria-modal="true">
      <button class="cerrar" aria-label="Cerrar">✕</button>
      <div class="foto foto-big ${clase(p.material)}" ${fondo}>${ph}</div>
      <h2>${esc(p.titulo)}</h2>
      <dl class="spec">
        <div><dt>Material</dt><dd>${esc(p.material.join(" + "))}</dd></div>
        <div><dt>Trabajo</dt><dd>${esc(p.trabajo.join(", "))}</dd></div>
        <div><dt>Contexto</dt><dd>${esc(p.contexto)}</dd></div>
        <div><dt>Año</dt><dd>${esc(p.anio)}</dd></div>
      </dl>
      <div class="cuerpo">${md(p.cuerpo)}</div>
      ${gal}
    </div>`;

  const cerrar = () => { div.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") cerrar(); };

  div.addEventListener("click", (e) => { if (e.target === div) cerrar(); });
  div.querySelector(".cerrar").addEventListener("click", cerrar);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(div);
}

/* ---------- rejilla de piezas (clicables) ---------- */
function pintarPiezas(sel, lista) {
  const cont = document.querySelector(sel);
  if (!cont) return;
  cont.innerHTML = lista.map(tarjeta).join("");
  cont.querySelectorAll(".tarj").forEach((b) =>
    b.addEventListener("click", () => abrirFicha(lista[+b.dataset.i]))
  );
}

/* ================================================================
   HOME
   ================================================================ */
async function home() {
  const [t, a] = await Promise.all([cargar("textos"), cargar("archivo")]);

  document.querySelector("#hero").innerHTML = `
    <h1 class="h1">${esc(t.home_titulo_1)} <em>y</em><br>${esc(t.home_titulo_2)}</h1>
    <p class="sub">${esc(t.home_ciudad)}</p>
    <p class="lead">${esc(t.home_intro)}</p>
    <div class="rutas">
      <a class="ruta" href="/ceramica"><span>Cerámica</span><i>→</i></a>
      <a class="ruta" href="/joyeria"><span>Joyería</span><i>→</i></a>
    </div>`;

  document.querySelector("#tira").textContent = t.home_tira;

  const sel = a.piezas.slice(0, 3);
  pintarPiezas("#seleccion", sel);
}

/* ================================================================
   SECCIÓN (Cerámica / Joyería) = intro + servicios + archivo filtrado
   ================================================================ */
async function seccion(material, introKey, serviciosKey) {
  const [t, a] = await Promise.all([cargar("textos"), cargar("archivo")]);

  document.querySelector("#intro").textContent = t[introKey];

  document.querySelector("#servicios").innerHTML = (t[serviciosKey] || []).map((s) => `
    <article class="serv">
      <h3>${esc(s.nombre)}</h3>
      <p class="linea">${esc(s.linea)}</p>
      <p class="txt">${esc(s.texto)}</p>
    </article>`).join("");

  const piezas = a.piezas.filter((p) => p.material.includes(material));
  pintarPiezas("#piezas", piezas);
}

const ceramica = () => seccion("Cerámica", "ceramica_intro", "ceramica_servicios");
const joyeria = () => seccion("Joyería", "joyeria_intro", "joyeria_servicios");

/* ================================================================
   SOBRE MÍ
   ================================================================ */
async function sobre() {
  const t = await cargar("textos");
  const parr = t.sobre_parrafos || String(t.sobre_cuerpo || "").split(/\n\s*\n/);
  document.querySelector("#cuerpo").innerHTML = parr.map((p) => "<p>" + esc(p) + "</p>").join("");
}

/* ================================================================
   CONTACTO
   ================================================================ */
async function contacto() {
  const t = await cargar("textos");
  document.querySelector("#intro").textContent = t.contacto_intro;
  document.querySelector("#datos").innerHTML = `
    <div><dt>Correo</dt><dd><a href="mailto:${esc(t.email)}">${esc(t.email)}</a></dd></div>
    <div><dt>Instagram</dt><dd><a href="https://instagram.com/${esc(t.instagram)}" target="_blank" rel="noopener">@${esc(t.instagram)}</a></dd></div>`;
}

/* ---------- pie común ---------- */
async function pie() {
  try {
    const t = await cargar("textos");
    const el = document.querySelector("#pie-datos");
    if (el) el.textContent = `${t.email} · @${t.instagram}`;
  } catch (_) {}
}

/* ---------- arranque ---------- */
const RUTAS = { home, ceramica, joyeria, sobre, contacto };

document.addEventListener("DOMContentLoaded", () => {
  pie();
  const pag = document.body.dataset.pagina;
  document.querySelectorAll(`.links a[data-n="${pag}"]`).forEach((a) => a.classList.add("on"));
  const fn = RUTAS[pag];
  if (fn) fn().catch((e) => {
    console.error(e);
    const m = document.querySelector("main");
    if (m) m.insertAdjacentHTML("afterbegin", '<p style="color:#1B3A8C">No se ha podido cargar el contenido. Recarga la página.</p>');
  });
});
