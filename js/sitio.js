/* ================================================================
   giusantoro.com — sitio estático, sin build
   Lee el contenido de /content/*.json (que escribe el panel /admin)
   ================================================================ */

const TRABAJOS = ["Modelo", "Molde", "Escultura", "Decoración", "Producción", "Acabado", "Reparación", "3D"];
const CONTEXTOS = ["Encargo", "Personal", "Marca propia"];

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

/* ================================================================
   HOME
   ================================================================ */
async function home() {
  const [t, a] = await Promise.all([cargar("textos"), cargar("archivo")]);

  document.querySelector("#hero").innerHTML = `
    <h1 class="h1">${esc(t.home_titulo_1)} <em>y</em><br>${esc(t.home_titulo_2)}</h1>
    <p class="sub">${esc(t.home_ciudad)}</p>
    <p class="caps">${esc(t.home_capacidades)}</p>
    <a class="cta" href="/archivo">Ver el archivo →</a>`;

  document.querySelector("#tira").textContent = t.home_tira;

  const sel = a.piezas.slice(0, 3);
  const cont = document.querySelector("#seleccion");
  cont.innerHTML = sel.map(tarjeta).join("");
  cont.querySelectorAll(".tarj").forEach((b) =>
    b.addEventListener("click", () => abrirFicha(sel[+b.dataset.i]))
  );
}

/* ================================================================
   SERVICIOS
   ================================================================ */
async function servicios() {
  const t = await cargar("textos");

  document.querySelector("#intro").textContent = t.servicios_intro;

  document.querySelector("#servicios").innerHTML = t.servicios.map((s) => `
    <article class="serv">
      <h3>${esc(s.nombre)}</h3>
      <p class="linea">${esc(s.linea)}</p>
      <p class="txt">${esc(s.texto)}</p>
      ${s.filtro ? `<a class="verlo" href="/archivo?${esc(s.filtro)}">Verlo en el archivo →</a>` : ""}
    </article>`).join("");

  document.querySelector("#fases").innerHTML = t.fases.map((f, i) => `
    <li>
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <div><strong>${esc(f.nombre)}</strong><span class="d">${esc(f.texto)}</span></div>
    </li>`).join("");

  document.querySelector("#necesito").textContent = t.necesito;
  document.querySelector("#recibes").textContent = t.recibes;
}

/* ================================================================
   ARCHIVO — filtros vivos en la URL
   ================================================================ */
async function archivo() {
  const { piezas } = await cargar("archivo");

  const q = new URLSearchParams(location.search);
  let material = q.get("material") || "Todo";
  let trabajos = q.getAll("trabajo");
  let contexto = q.get("contexto") || null;

  // normaliza la capitalización que venga de la URL
  const cap = (v, lista) => lista.find((x) => x.toLowerCase() === String(v).toLowerCase()) || v;
  material = cap(material, ["Todo", "Cerámica", "Joyería"]);
  trabajos = trabajos.map((x) => cap(x, TRABAJOS));
  if (contexto) contexto = cap(contexto, CONTEXTOS);

  const disponibles = TRABAJOS.filter((t) => piezas.some((p) => p.trabajo.includes(t)));

  function narrar(n) {
    if (n === 0) return "Ninguna pieza con estos filtros.";
    if (contexto === "Encargo") return "Trabajo por encargo: para marcas, talleres y estudios.";
    if (contexto === "Marca propia") return "Producto propio: diseñado, producido y vendido por mí.";
    if (contexto === "Personal") return "Investigación personal. De aquí sale casi todo lo demás.";
    if (trabajos.length) return "Filtrado por técnica.";
    if (material !== "Todo") return `Todo el trabajo en ${material.toLowerCase()}.`;
    return "Cerámica y joyería. Encargo, marca propia e investigación.";
  }

  function sincronizarURL() {
    const p = new URLSearchParams();
    if (material !== "Todo") p.set("material", material);
    trabajos.forEach((t) => p.append("trabajo", t));
    if (contexto) p.set("contexto", contexto);
    const s = p.toString();
    history.replaceState(null, "", "/archivo" + (s ? "?" + s : ""));
    return location.host + "/archivo" + (s ? "?" + s : "");
  }

  function pintar() {
    const res = piezas.filter((p) => {
      if (material !== "Todo" && !p.material.includes(material)) return false;
      if (contexto && p.contexto !== contexto) return false;
      if (trabajos.length && !trabajos.some((t) => p.trabajo.includes(t))) return false;
      return true;
    });

    document.querySelector("#count").innerHTML =
      `${String(res.length).padStart(2, "0")}<i>/</i>${piezas.length}`;

    document.querySelector("#f-material").innerHTML = ["Todo", "Cerámica", "Joyería"]
      .map((m) => `<button class="mat ${material === m ? "on" : ""}" data-m="${m}">${m}</button>`).join("");

    document.querySelector("#f-trabajo").innerHTML = disponibles
      .map((t) => `<button class="chip ${trabajos.includes(t) ? "on" : ""}" data-t="${t}">${t}</button>`).join("");

    const activos = (material !== "Todo") + trabajos.length + (contexto ? 1 : 0);
    document.querySelector("#f-contexto").innerHTML = CONTEXTOS
      .map((c) => `<button class="chip ${contexto === c ? "on" : ""}" data-c="${c}">${c}</button>`).join("")
      + (activos ? `<button class="reset" id="reset">Quitar filtros ✕</button>` : "");

    document.querySelector("#url").textContent = sincronizarURL();
    document.querySelector("#narra").textContent = narrar(res.length);

    const rej = document.querySelector("#rejilla");
    rej.innerHTML = res.map(tarjeta).join("");
    rej.querySelectorAll(".tarj").forEach((b) =>
      b.addEventListener("click", () => abrirFicha(res[+b.dataset.i]))
    );

    document.querySelectorAll("#f-material .mat").forEach((b) =>
      b.addEventListener("click", () => { material = b.dataset.m; pintar(); }));
    document.querySelectorAll("#f-trabajo .chip").forEach((b) =>
      b.addEventListener("click", () => {
        const t = b.dataset.t;
        trabajos = trabajos.includes(t) ? trabajos.filter((x) => x !== t) : [...trabajos, t];
        pintar();
      }));
    document.querySelectorAll("#f-contexto .chip").forEach((b) =>
      b.addEventListener("click", () => { contexto = contexto === b.dataset.c ? null : b.dataset.c; pintar(); }));
    const r = document.querySelector("#reset");
    if (r) r.addEventListener("click", () => { material = "Todo"; trabajos = []; contexto = null; pintar(); });
  }

  document.querySelector("#copiar").addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText("https://" + document.querySelector("#url").textContent);
      e.target.textContent = "Copiado ✓";
      setTimeout(() => { e.target.textContent = "Copiar enlace"; }, 1600);
    } catch (_) { /* el navegador puede bloquearlo; el enlace se ve igual */ }
  });

  pintar();
}

/* ================================================================
   CONTACTO
   ================================================================ */
async function contacto() {
  const t = await cargar("textos");
  document.querySelector("#intro").textContent = t.contacto_intro;
  document.querySelector("#datos").innerHTML = `
    <div><dt>Correo</dt><dd><a href="mailto:${esc(t.email)}">${esc(t.email)}</a></dd></div>
    <div><dt>Taller</dt><dd>${esc(t.ciudad)}</dd></div>
    <div><dt>Instagram</dt><dd><a href="https://instagram.com/${esc(t.instagram)}" target="_blank" rel="noopener">@${esc(t.instagram)}</a></dd></div>
    <div><dt>LinkedIn</dt><dd><a href="${esc(t.linkedin)}" target="_blank" rel="noopener">Giuseppe Santoro</a></dd></div>`;
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
const RUTAS = { home, servicios, archivo, contacto };

document.addEventListener("DOMContentLoaded", () => {
  pie();
  const fn = RUTAS[document.body.dataset.pagina];
  if (fn) fn().catch((e) => {
    console.error(e);
    const m = document.querySelector("main");
    if (m) m.insertAdjacentHTML("afterbegin",
      '<p style="color:#1B3A8C">No se ha podido cargar el contenido. Recarga la página.</p>');
  });
});
