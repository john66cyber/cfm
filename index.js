/* =====================================================================
   2. YOUR SHOP — EDIT EVERYTHING IN THIS BLOCK
   ---------------------------------------------------------------------
   IMAGES: create a folder called "images" next to this file and drop your
   photos in it, then point each "image" below at the file name.
   A product with no image simply shows a labelled empty slot, so the page
   never looks broken while you are still taking photos.
   ===================================================================== */

const SHOP = {
  whatsapp: "256706042981",     // <- your WhatsApp number, digits only, country code first
  currency: "UGX"
};

const CATEGORIES = ["All", "Scrubs", "Lab coats", "Nurse coats", "Stethoscopes", "Accessories"];

const PRODUCTS = [
  {
    id: "scrub-set",
    name: "Timberland scrub set",
    category: "Scrubs",
    price: 60000,            // numbers only — no commas, no "UGX"
    badge: "Best seller",    // small tag on the photo, or delete this line
    image: "scrubs.jpeg"                                                                                                  ,
    desc: "Top and trousers in a breathable poly-cotton blend that survives a full week of ward rounds.",
    specs: ["Four pockets", "Drawstring waist", "Machine washable at 40°"],
    sizes: ["XS","S","M","L","XL","2XL","3XL"],
    colors: ["Navy","Ceil blue","Wine","Teal"],
    inStock: true,
    featured: true
  },
  {
    id: "lab-coat",
    name: "Timberland lab coat",
    category: "Lab coats",
    price: 50000,
    image: "timberlandlabc.jpeg",
    desc: "Knee-length white coat with a notched collar that holds its shape after pressing.",
    specs: ["Three pockets", "Cotton drill", "Embroidery on request"],
    sizes: ["S","M","L","XL","2XL"],
    colors: ["White"],
    inStock: true,
    featured: true
  },
  {
    id: "nurse-coat",
    name: "Timberland nurse coat",
    category: "Nurse coats",
    price: 50000,
    image: "nurselabc.jpeg",
    desc: "Tailored nurse coat cut slightly shorter for movement, with a soft finish on the inside seams.",
    specs: ["Two hip pockets", "Button front", "Fade resistant"],
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: ["White","Powder blue"],
    inStock: true,
    featured: true
  },
  {
    id: "steth-dual",
    name: "Dual-head stethoscope",
    category: "Stethoscopes",
    price: 150000,
    badge: "New",
    image: "stethoscope-iii.jpeg",
    desc: "Bell and diaphragm in one chestpiece, with soft ear tips and a spare pair in the box.",
    specs: ["Stainless chestpiece", "Latex-free tubing", "One year warranty"],
    sizes: [],
    colors: ["Black","Navy","Burgundy","Rose gold"],
    inStock: true,
    featured: true
  },
  {
    id: "steth-cardio",
    name: "Cardiology stethoscope",
    category: "Stethoscopes",
    price: 250000,
    badge: "New",
    image: "cardiology.jpeg",
    desc: "For picking up the quiet sounds — tuned for low and high frequencies without swapping the head.",
    specs: ["Dual-lumen tubing", "Adjustable ear tips", "Engraving on request"],
    sizes: [],
    colors: ["Black","Smoke", "Orange"],
    inStock: true
  },
  {
    id: "name-tag",
    name: "Name embroidery",
    category: "Accessories",
    price: 10000,
    image: "embroidery.jpg",
    desc: "Your name and course stitched onto any coat or scrub top. Add it alongside the garment.",
    specs: ["Up to 25 characters", "Ready in three days"],
    sizes: [],
    colors: [],
    inStock: true
  },
  {
    id: "steth-student",
    name: "Student stethoscope",
    category: "Stethoscopes",
    price: 150000,
    image: "student-stethoscope.jpeg",
    desc: "A light, honest starter scope for first and second years. Clear enough for practicals.",
    specs: ["Single head", "Aluminium chestpiece"],
    sizes: [],
    colors: ["Black","Purple","Green", "Blue", "Orange"],
    inStock: true   // doesnt show a "Sold out" overlay
  }
];

/* =====================================================================
   3. ENGINE — you don't need to change anything below this line
   ===================================================================== */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const money = n => SHOP.currency + " " + Number(n).toLocaleString("en-US");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

let cart = [];
let state = { cat:"All", q:"", sort:"featured" };
let current = null, curQty = 1, curSize = null, curColor = null;

/* ---- storage (safe if the browser blocks it) ---- */
function saveCart(){ try{ localStorage.setItem("cfm-cart", JSON.stringify(cart)); }catch(e){} }
function loadCart(){
  try{
    const raw = localStorage.getItem("cfm-cart");
    if(raw) cart = JSON.parse(raw) || [];
  }catch(e){ cart = []; }
  if(!Array.isArray(cart)) cart = [];
}

/* ---- theme ---- */
function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem("cfm-theme"); }catch(e){}
  if(saved) document.documentElement.setAttribute("data-theme", saved);
}
$("#themeBtn").addEventListener("click", () => {
  const now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", now);
  try{ localStorage.setItem("cfm-theme", now); }catch(e){}
});

/* ---- toast ---- */
let toastTimer;
function toast(msg){
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
}

/* ---- image helper: real photo, or a labelled empty slot ---- */
function imgHTML(p, cls=""){
  if(!p.image) return `<div class="placeholder">Photo slot<br>${esc(p.name)}</div>`;
  return `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"
    onerror="this.outerHTML='<div class=\\'placeholder\\'>Add <b>${esc(p.image)}</b><br>to the images folder</div>'">`;
}

/* ---- filters ---- */
function visible(){
  let list = PRODUCTS.filter(p => {
    const inCat = state.cat === "All" || p.category === state.cat;
    const q = state.q.trim().toLowerCase();
    const inQ = !q || (p.name + " " + p.desc + " " + p.category).toLowerCase().includes(q);
    return inCat && inQ;
  });
  if(state.sort === "low")  list.sort((a,b) => a.price - b.price);
  if(state.sort === "high") list.sort((a,b) => b.price - a.price);
  if(state.sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  if(state.sort === "featured") list.sort((a,b) => (b.featured?1:0) - (a.featured?1:0));
  return list;
}

function renderChips(){
  $("#chips").innerHTML = CATEGORIES.map(c =>
    `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c===state.cat}">${esc(c)}</button>`
  ).join("");
}

function renderGrid(){
  const list = visible();
  $("#count").textContent = list.length
    ? `${list.length} item${list.length>1?"s":""}${state.cat!=="All" ? " in " + state.cat.toLowerCase() : ""}`
    : "";
  $("#grid").innerHTML = list.length ? list.map(p => `
    <article class="card rise">
      <button class="thumb" data-open="${esc(p.id)}" aria-label="View ${esc(p.name)}">
        ${imgHTML(p)}
        ${p.badge && p.inStock ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        ${!p.inStock ? `<span class="out">Sold out</span>` : ""}
      </button>
      <div class="card-body">
        <p class="cat">${esc(p.category)}</p>
        <h3>${esc(p.name)}</h3>
        <p class="desc">${esc(p.desc)}</p>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          ${p.was ? `<span class="was">${money(p.was)}</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost" data-open="${esc(p.id)}">Details</button>
          <button class="btn btn-primary" data-quick="${esc(p.id)}" ${p.inStock?"":"disabled style=opacity:.45"}>Add</button>
        </div>
      </div>
    </article>`).join("")
    : `<p class="empty">Nothing matches that search yet. Try a different word, or browse all items.</p>`;
  watch();
}

/* ---- quick view ---- */
function openModal(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  current = p; curQty = 1;
  curSize  = p.sizes  && p.sizes.length  ? p.sizes[0]  : null;
  curColor = p.colors && p.colors.length ? p.colors[0] : null;

  $("#mImg").innerHTML = imgHTML(p);
  $("#mCat").textContent = p.category;
  $("#mTitle").textContent = p.name;
  $("#mPrice").innerHTML = money(p.price) + (p.was ? ` <span class="was">${money(p.was)}</span>` : "");
  $("#mDesc").textContent = p.desc;
  $("#mQty").textContent = 1;
  $("#mSpecs").innerHTML = (p.specs||[]).map(s => `<li>${esc(s)}</li>`).join("");

  $("#mSizes").innerHTML = (p.sizes && p.sizes.length)
    ? `<p class="opt-label">Size</p><div class="opts">${p.sizes.map(s =>
        `<button class="opt" data-size="${esc(s)}" aria-pressed="${s===curSize}">${esc(s)}</button>`).join("")}</div>` : "";
  $("#mColors").innerHTML = (p.colors && p.colors.length)
    ? `<p class="opt-label">Colour</p><div class="opts">${p.colors.map(c =>
        `<button class="opt" data-color="${esc(c)}" aria-pressed="${c===curColor}">${esc(c)}</button>`).join("")}</div>` : "";

  const add = $("#mAdd");
  add.disabled = !p.inStock;
  add.textContent = p.inStock ? "Add to cart" : "Sold out";
  add.style.opacity = p.inStock ? 1 : .45;

  $("#modal").classList.add("on");
  $("#backdrop").classList.add("on");
  document.body.style.overflow = "hidden";
  $("#modalClose").focus();
}

function closeAll(){
  $("#modal").classList.remove("on");
  $("#drawer").classList.remove("on");
  $("#backdrop").classList.remove("on");
  document.body.style.overflow = "";
}

/* ---- cart ---- */
function addToCart(p, qty=1, size=null, color=null){
  if(!p.inStock) return;
  const key = [p.id, size, color].join("|");
  const found = cart.find(l => l.key === key);
  if(found) found.qty += qty;
  else cart.push({ key, id:p.id, name:p.name, price:p.price, image:p.image||"", size, color, qty });
  saveCart(); renderCart();
  toast(`${p.name} added to your cart`);
}

function renderCart(){
  const n = cart.reduce((s,l) => s + l.qty, 0);
  const badge = $("#cartCount");
  badge.textContent = n;
  badge.classList.toggle("on", n > 0);

  $("#cartItems").innerHTML = cart.length ? cart.map(l => `
    <div class="line">
      <div class="line-img">${l.image ? `<img src="${esc(l.image)}" alt="" onerror="this.remove()">` : ""}</div>
      <div>
        <b>${esc(l.name)}</b>
        <small>${[l.size, l.color].filter(Boolean).map(esc).join(" · ") || "&nbsp;"}</small>
        <div class="qty">
          <button data-dec="${esc(l.key)}" aria-label="Reduce quantity">−</button>
          <span>${l.qty}</span>
          <button data-inc="${esc(l.key)}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="line-right">
        <b>${money(l.price * l.qty)}</b>
        <button class="rm" data-rm="${esc(l.key)}">Remove</button>
      </div>
    </div>`).join("")
    : `<p class="empty">Your cart is empty. Add a coat, a set of scrubs or a stethoscope to get started.</p>`;

  $("#total").textContent = money(cart.reduce((s,l) => s + l.price * l.qty, 0));
}

function orderText(){
  const lines = cart.map(l =>
    `• ${l.qty} × ${l.name}${[l.size,l.color].filter(Boolean).length ? " (" + [l.size,l.color].filter(Boolean).join(", ") + ")" : ""} — ${money(l.price*l.qty)}`
  );
  const total = money(cart.reduce((s,l) => s + l.price*l.qty, 0));
  return `Hello Christian Fellowship Makerere, I would like to order:\n\n${lines.join("\n")}\n\nTotal: ${total}\n\nMy name: \nPickup or delivery: `;
}

/* ---- events ---- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-open],[data-quick],[data-cat],[data-size],[data-color],[data-inc],[data-dec],[data-rm]");
  if(!t) return;

  if(t.dataset.open)  openModal(t.dataset.open);
  if(t.dataset.quick){
    const p = PRODUCTS.find(x => x.id === t.dataset.quick);
    if(p && ((p.sizes||[]).length || (p.colors||[]).length)) openModal(p.id);
    else if(p) addToCart(p);
  }
  if(t.dataset.cat){ state.cat = t.dataset.cat; renderChips(); renderGrid(); }
  if(t.dataset.size){ curSize = t.dataset.size; $$("#mSizes .opt").forEach(b => b.setAttribute("aria-pressed", b.dataset.size===curSize)); }
  if(t.dataset.color){ curColor = t.dataset.color; $$("#mColors .opt").forEach(b => b.setAttribute("aria-pressed", b.dataset.color===curColor)); }

  if(t.dataset.inc || t.dataset.dec || t.dataset.rm){
    const key = t.dataset.inc || t.dataset.dec || t.dataset.rm;
    const line = cart.find(l => l.key === key);
    if(!line) return;
    if(t.dataset.inc) line.qty++;
    if(t.dataset.dec) line.qty--;
    if(t.dataset.rm)  line.qty = 0;
    if(line.qty <= 0) cart = cart.filter(l => l.key !== key);
    saveCart(); renderCart();
  }
});

$("#search").addEventListener("input", e => { state.q = e.target.value; renderGrid(); });
$("#sort").addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });

$("#mPlus").addEventListener("click",  () => { curQty++; $("#mQty").textContent = curQty; });
$("#mMinus").addEventListener("click", () => { if(curQty>1){ curQty--; $("#mQty").textContent = curQty; } });
$("#mAdd").addEventListener("click", () => {
  if(!current) return;
  addToCart(current, curQty, curSize, curColor);
  closeAll();
});

$("#cartBtn").addEventListener("click", () => {
  $("#drawer").classList.add("on");
  $("#backdrop").classList.add("on");
  document.body.style.overflow = "hidden";
  $("#drawerClose").focus();
});
$("#drawerClose").addEventListener("click", closeAll);
$("#modalClose").addEventListener("click", closeAll);
$("#backdrop").addEventListener("click", closeAll);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeAll(); });

$("#checkout").addEventListener("click", () => {
  if(!cart.length){ toast("Add something to your cart first"); return; }
  window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(orderText())}`, "_blank");
});
$("#copyOrder").addEventListener("click", async () => {
  if(!cart.length){ toast("Add something to your cart first"); return; }
  try{
    await navigator.clipboard.writeText(orderText());
    toast("Order copied. Paste it anywhere.");
  }catch(e){
    toast("Copying is blocked here — screenshot the cart instead");
  }
});

/* ---- moving words ---- */
const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function splitWords(el){
  if(el.dataset.split) return;
  el.dataset.split = "1";
  let i = 0;
  Array.from(el.childNodes).forEach(node => {
    if(node.nodeType !== 3 || !node.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if(!part.trim()){ frag.appendChild(document.createTextNode(part)); return; }
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = part;
      s.style.animationDelay = (i++ * 45) + "ms";
      frag.appendChild(s);
    });
    el.replaceChild(frag, node);
  });
}

const seer = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if(!en.isIntersecting) return;
    en.target.classList.add("seen");
    seer.unobserve(en.target);
  });
}, { threshold:.18, rootMargin:"0px 0px -8% 0px" });

function watch(){
  $$(".reveal, .rise").forEach((el, i) => {
    if(still){ el.classList.add("seen"); return; }
    if(el.classList.contains("rise")) el.style.transitionDelay = ((i % 4) * 70) + "ms";
    if(!el.dataset.watched){ el.dataset.watched = "1"; seer.observe(el); }
  });
}

/* the word that keeps changing */
const ROTATING = ["nursing students", "midwives", "clinical officers", "lab technicians"];
function startRotator(){
  const host = $("#rotator");
  if(!host) return;
  host.innerHTML = ROTATING.map((w,i) => `<span class="${i===0?"on":""}">${esc(w)}</span>`).join("");
  if(still) return;
  const spans = $$("span", host);
  let i = 0;
  setInterval(() => {
    spans[i].classList.remove("on");
    i = (i + 1) % spans.length;
    spans[i].classList.add("on");
  }, 2600);
}

/* ---- start ---- */
initTheme();
loadCart();
renderChips();
renderGrid();
renderCart();
$("#year").textContent = new Date().getFullYear();

$$("[data-words]").forEach(splitWords);
if(still) $$(".w").forEach(w => w.style.opacity = 1);
startRotator();
watch();