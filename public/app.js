// SportHub front-end logic. Cart state is in localStorage.
(function () {
  const CART_KEY = "sh_cart_v1";

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function findProduct(id) {
    return (window.SH_PRODUCTS || []).find((p) => p.id === Number(id));
  }

  function fmt(n) { return "$" + n.toFixed(2); }

  function renderCartBadge() {
    const el = document.getElementById("cart-badge");
    if (!el) return;
    const items = loadCart();
    const total = items.reduce((a, it) => a + it.qty, 0);
    el.textContent = total;
    el.style.display = total > 0 ? "inline-flex" : "none";
  }

  function productCard(p) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-thumb" style="background: linear-gradient(135deg, ${p.color}33, ${p.color}11); color:${p.color};">
        <span class="product-emoji">${p.emoji}</span>
      </div>
      <div class="product-meta">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-name">${p.name}</h4>
        <p class="product-price">${fmt(p.price)}</p>
        <button class="btn btn-add" data-id="${p.id}">Add to cart</button>
      </div>
    `;
    card.querySelector(".btn-add").addEventListener("click", () => addToCart(p.id));
    return card;
  }

  function renderProducts(elId, cat) {
    const root = document.getElementById(elId);
    if (!root) return;
    const all = window.SH_PRODUCTS || [];
    const list = (cat && cat !== "all") ? all.filter((p) => p.category === cat) : all;
    root.innerHTML = "";
    if (list.length === 0) {
      root.innerHTML = `<p class="muted">No products in this category.</p>`;
      return;
    }
    list.forEach((p) => root.appendChild(productCard(p)));
  }

  function renderFeatured(elId) {
    const root = document.getElementById(elId);
    if (!root) return;
    const ids = window.SH_FEATURED_IDS || [];
    root.innerHTML = "";
    ids.map(findProduct).filter(Boolean).forEach((p) => root.appendChild(productCard(p)));
  }

  function highlightActivePill(cat) {
    document.querySelectorAll(".pill").forEach((el) => {
      el.classList.toggle("active", el.dataset.cat === cat);
    });
  }

  function addToCart(id) {
    const items = loadCart();
    const existing = items.find((it) => it.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ id, qty: 1 });
    }
    saveCart(items);
    renderCartBadge();
    flash("Added to cart");
  }

  function changeQty(id, delta) {
    const items = loadCart();
    const it = items.find((x) => x.id === id);
    if (!it) return;
    it.qty = Math.max(0, it.qty + delta);
    const filtered = items.filter((x) => x.qty > 0);
    saveCart(filtered);
    renderCart();
    renderCartBadge();
  }

  function removeFromCart(id) {
    const items = loadCart().filter((x) => x.id !== id);
    saveCart(items);
    renderCart();
    renderCartBadge();
  }

  function renderCart() {
    const empty = document.getElementById("cart-empty");
    const body = document.getElementById("cart-body");
    const content = document.getElementById("cart-content");
    if (!body) return;
    const items = loadCart();
    if (items.length === 0) {
      content.style.display = "none";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    content.style.display = "block";
    body.innerHTML = "";
    let subtotal = 0;
    items.forEach((it) => {
      const p = findProduct(it.id);
      if (!p) return;
      const lineTotal = p.price * it.qty;
      subtotal += lineTotal;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="cart-item">
          <span class="cart-thumb" style="background:${p.color}22; color:${p.color};">${p.emoji}</span>
          <span>${p.name}</span>
        </td>
        <td>${fmt(p.price)}</td>
        <td>
          <div class="qty-control">
            <button class="qty-btn" data-act="dec" data-id="${p.id}">−</button>
            <span>${it.qty}</span>
            <button class="qty-btn" data-act="inc" data-id="${p.id}">+</button>
          </div>
        </td>
        <td>${fmt(lineTotal)}</td>
        <td><button class="qty-remove" data-id="${p.id}">Remove</button></td>
      `;
      body.appendChild(row);
    });
    body.querySelectorAll(".qty-btn").forEach((b) =>
      b.addEventListener("click", () => changeQty(Number(b.dataset.id), b.dataset.act === "inc" ? 1 : -1)),
    );
    body.querySelectorAll(".qty-remove").forEach((b) =>
      b.addEventListener("click", () => removeFromCart(Number(b.dataset.id))),
    );
    document.getElementById("sub").textContent = fmt(subtotal);
    document.getElementById("ship").textContent = fmt(9.99);
    document.getElementById("total").textContent = fmt(subtotal + 9.99);
  }

  function flash(text) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 200);
    }, 1400);
  }

  window.SH = {
    renderCartBadge,
    renderProducts,
    renderFeatured,
    renderCart,
    highlightActivePill,
    addToCart,
    cart: loadCart,
  };
})();
