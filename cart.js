/**
 * ============================================================
 *  ATELIER — Shared Cart Engine (cart.js)
 *  Handles: localStorage, cart count badge, add/remove/qty,
 *           price totals, size/color selection, quick-add,
 *           search filtering, shop page filters, checkout.
 *  NO UI changes — only JS functionality is added here.
 * ============================================================
 */

/* ────────────────────────────────────────────
   1.  LOCAL STORAGE HELPERS
   ──────────────────────────────────────────── */

const CART_KEY = 'atelier_cart';

/** Return the current cart array from localStorage */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/** Persist the cart array to localStorage */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/** Return total item count (sum of quantities) */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/* ────────────────────────────────────────────
   2.  CART BADGE — shown on navbar shopping_bag icon
   ──────────────────────────────────────────── */

function updateCartBadge() {
  const count = getCartCount();

  // Remove any existing badges first (avoid duplicates on re-render)
  document.querySelectorAll('.atelier-cart-badge').forEach(el => el.remove());

  if (count === 0) return;

  // Find every shopping_bag icon on the page and attach a badge
  document.querySelectorAll('[data-icon="shopping_bag"], .material-symbols-outlined')
    .forEach(icon => {
      if (icon.textContent.trim() !== 'shopping_bag') return;
      const parent = icon.closest('button') || icon.parentElement;
      if (!parent) return;

      // Make sure parent has position:relative so badge can absolutely-position
      const computedPos = window.getComputedStyle(parent).position;
      if (computedPos === 'static') parent.style.position = 'relative';

      const badge = document.createElement('span');
      badge.className = 'atelier-cart-badge';
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.cssText = [
        'position:absolute',
        'top:-6px',
        'right:-6px',
        'background:#000',
        'color:#fff',
        'font-size:9px',
        'font-family:Manrope,sans-serif',
        'font-weight:700',
        'letter-spacing:0',
        'line-height:1',
        'min-width:16px',
        'height:16px',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:0 3px',
        'pointer-events:none',
        'z-index:9999',
      ].join(';');

      parent.appendChild(badge);
    });
}

/* ────────────────────────────────────────────
   3.  ADD TO CART
   ──────────────────────────────────────────── */

/**
 * Add a product object to the cart.
 * @param {{ id, name, price, image, quantity, size, color }} product
 */
function addToCart(product) {
  const cart = getCart();

  // Match by id + size + color (same product, different options = different line)
  const key = `${product.id}__${product.size}__${product.color}`;
  const existing = cart.find(
    item => `${item.id}__${item.size}__${item.color}` === key
  );

  if (existing) {
    existing.quantity = Math.max(1, existing.quantity + (product.quantity || 1));
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image,
      quantity: product.quantity || 1,
      size:     product.size     || 'One Size',
      color:    product.color    || 'Default',
    });
  }

  saveCart(cart);
  updateCartBadge();
  showAddedFeedback(product.name);
}

/** Brief toast notification when item is added */
function showAddedFeedback(name) {
  // Remove any existing toasts
  document.querySelectorAll('.atelier-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'atelier-toast';
  toast.textContent = `"${name}" added to bag`;
  toast.style.cssText = [
    'position:fixed',
    'bottom:32px',
    'left:50%',
    'transform:translateX(-50%) translateY(20px)',
    'background:#1c1b1b',
    'color:#fcf9f8',
    'font-family:Manrope,sans-serif',
    'font-size:11px',
    'letter-spacing:0.15em',
    'text-transform:uppercase',
    'padding:14px 28px',
    'z-index:99999',
    'opacity:0',
    'transition:all 0.35s ease',
    'pointer-events:none',
    'white-space:nowrap',
  ].join(';');

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // Animate out after 2.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

/* ────────────────────────────────────────────
   4.  REMOVE FROM CART
   ──────────────────────────────────────────── */

/** Remove a cart item by its composite key */
function removeFromCart(id, size, color) {
  const key = `${id}__${size}__${color}`;
  const cart = getCart().filter(
    item => `${item.id}__${item.size}__${item.color}` !== key
  );
  saveCart(cart);
  updateCartBadge();
  renderCartPage(); // re-render if on cart page
}

/* ────────────────────────────────────────────
   5.  QUANTITY UPDATE
   ──────────────────────────────────────────── */

function updateQuantity(id, size, color, delta) {
  const key = `${id}__${size}__${color}`;
  const cart = getCart();
  const item = cart.find(i => `${i.id}__${i.size}__${i.color}` === key);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

/* ────────────────────────────────────────────
   6.  PRICE CALCULATION HELPERS
   ──────────────────────────────────────────── */

/** Parse "$1,450" → 1450 */
function parsePrice(str) {
  if (typeof str === 'number') return str;
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
}

/** Format 1450 → "$1,450.00" */
function formatPrice(num) {
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
}

function calcShipping(subtotal) {
  return subtotal >= 5000 ? 0 : 35;
}

/* ────────────────────────────────────────────
   7.  CART PAGE RENDERER
   Replaces the static placeholder items in the
   shopping_cart page with live localStorage data.
   ──────────────────────────────────────────── */

function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountLabel      = document.getElementById('cart-count-label');
  const subtotalEl          = document.getElementById('cart-subtotal');
  const shippingEl          = document.getElementById('cart-shipping');
  const totalEl             = document.getElementById('cart-total');

  if (!cartItemsContainer) return; // not on cart page

  const cart = getCart();

  // Update item count label
  if (cartCountLabel) {
    const n = cart.reduce((s, i) => s + i.quantity, 0);
    cartCountLabel.textContent = `${n} ITEM${n !== 1 ? 'S' : ''} IN CART`;
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="py-24 text-center">
        <p class="font-label text-[0.6875rem] tracking-[0.2em] uppercase text-neutral-400 mb-8">Your bag is empty</p>
        <a href="../shop_product_listing_ethos_couture/shop_product_listing_ethos_couture.html"
           class="font-label text-xs tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">
          CONTINUE SHOPPING
        </a>
      </div>`;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="group flex flex-col md:flex-row gap-8 pb-12 bg-surface border-b border-outline-variant/10"
           data-item-id="${item.id}" data-item-size="${item.size}" data-item-color="${item.color}">
        <div class="w-full md:w-48 aspect-[4/5] overflow-hidden bg-surface-container-low flex-shrink-0">
          <img class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
               src="${item.image}" alt="${item.name}" />
        </div>
        <div class="flex-1 flex flex-col justify-between py-2">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-editorial text-2xl font-bold mb-2">${item.name}</h3>
              <p class="font-label text-xs tracking-wider text-neutral-500 uppercase mb-4">
                Color: ${item.color} | Size: ${item.size}
              </p>
            </div>
            <span class="font-editorial text-xl item-line-total">${formatPrice(parsePrice(item.price) * item.quantity)}</span>
          </div>
          <div class="flex items-center justify-between mt-8">
            <div class="flex items-center border-b border-outline-variant/30 pb-1 gap-6">
              <button class="hover:opacity-50 transition-opacity qty-minus" aria-label="Decrease quantity">
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>
              <span class="font-label text-sm w-8 text-center qty-display">${String(item.quantity).padStart(2,'0')}</span>
              <button class="hover:opacity-50 transition-opacity qty-plus" aria-label="Increase quantity">
                <span class="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <button class="remove-item font-label text-[0.6875rem] tracking-widest text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">close</span> REMOVE
            </button>
          </div>
        </div>
      </div>`).join('');

    // Attach qty/remove listeners
    cartItemsContainer.querySelectorAll('[data-item-id]').forEach(row => {
      const id    = row.dataset.itemId;
      const size  = row.dataset.itemSize;
      const color = row.dataset.itemColor;

      row.querySelector('.qty-minus').addEventListener('click', () => updateQuantity(id, size, color, -1));
      row.querySelector('.qty-plus').addEventListener('click',  () => updateQuantity(id, size, color, +1));
      row.querySelector('.remove-item').addEventListener('click', () => removeFromCart(id, size, color));
    });
  }

  // Update totals panel
  const subtotal = calcSubtotal(cart);
  const shipping = calcShipping(subtotal);
  const total    = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  if (totalEl)    totalEl.textContent    = formatPrice(total);
}

/* ────────────────────────────────────────────
   8.  CHECKOUT (with API sync)
   ──────────────────────────────────────────── */

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your bag is empty. Add items before checking out.');
    return;
  }

  const subtotal = calcSubtotal(cart);
  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  // Try to send order to API
  let orderId = null;
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        subtotal,
        shipping,
        total
      })
    });

    if (response.ok) {
      const data = await response.json();
      orderId = data.data.orderId;
    }
  } catch (error) {
    // API not available, continue with local checkout
  }

  // Clear cart
  saveCart([]);
  updateCartBadge();

  // Show success overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:#fcf9f8',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'z-index:999999',
    'gap:24px',
    'font-family:Manrope,sans-serif',
  ].join(';');

  overlay.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:56px;opacity:0.7">check_circle</span>
    <h2 style="font-family:'Noto Serif',serif;font-size:2.5rem;font-weight:700;letter-spacing:-0.02em;margin:0">
      Order Confirmed
    </h2>
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#5f5e5e;margin:0">
      Thank you for your purchase — ${formatPrice(total)}
    </p>
    ${orderId ? `<p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#1c1b1b;margin:0">Order #${orderId.slice(-8).toUpperCase()}</p>` : ''}
    <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;margin:0">
      A confirmation will be sent to your registered email.
    </p>
    <button id="atelier-continue-btn"
      style="margin-top:16px;border:1px solid #1c1b1b;padding:14px 40px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;background:transparent;font-family:Manrope,sans-serif">
      CONTINUE SHOPPING
    </button>`;

  document.body.appendChild(overlay);
  renderCartPage(); // clear the cart page items

  overlay.querySelector('#atelier-continue-btn').addEventListener('click', () => {
    overlay.remove();
  });
}

/* ────────────────────────────────────────────
   9.  SIZE & COLOR SELECTION (Product Detail Page)
   ──────────────────────────────────────────── */

/** Tracks the user's current size/color selections */
const productSelection = {
  size:  null,
  color: null,
  qty:   1,
};

function initSizeSelector() {
  // Size buttons — product detail page has a grid of size buttons
  const sizeGrid = document.querySelector('.grid.grid-cols-4');
  if (!sizeGrid) return;

  const sizeBtns = sizeGrid.querySelectorAll('button');

  // Set default to the pre-selected one (has border-on-surface)
  sizeBtns.forEach(btn => {
    if (btn.classList.contains('border-on-surface')) {
      productSelection.size = btn.textContent.trim();
    }
  });

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Clear active styles from all
      sizeBtns.forEach(b => {
        b.classList.remove('border-on-surface', 'bg-surface-container');
        b.classList.add('border-outline-variant');
      });
      // Apply active to clicked
      btn.classList.remove('border-outline-variant');
      btn.classList.add('border-on-surface', 'bg-surface-container');
      productSelection.size = btn.textContent.trim();
    });
  });

  // Default size = first already-selected, or first button
  if (!productSelection.size && sizeBtns.length) {
    productSelection.size = sizeBtns[0].textContent.trim();
  }
}

function initColorSelector() {
  // Color buttons — 3 circle buttons in product detail
  const colorSection = document.querySelector('.flex.gap-4');
  if (!colorSection) return;

  const colorBtns = colorSection.querySelectorAll('button[class*="w-10"]');
  const colorNames = ['Midnight Noir', 'Pearl', 'Slate'];

  // Determine default from ring class
  colorBtns.forEach((btn, idx) => {
    if (btn.classList.contains('ring-1') || btn.classList.contains('border-on-surface')) {
      productSelection.color = colorNames[idx] || 'Default';
    }
  });

  colorBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      // Clear rings from all
      colorBtns.forEach(b => {
        b.classList.remove('ring-1', 'ring-offset-4', 'ring-black\\/10', 'border-2', 'border-on-surface');
        b.style.outline = '';
        b.style.outlineOffset = '';
      });
      // Mark selected
      btn.style.outline = '2px solid #1c1b1b';
      btn.style.outlineOffset = '3px';
      productSelection.color = colorNames[idx] || 'Default';
    });
  });

  // Set default if none found
  if (!productSelection.color) productSelection.color = colorNames[0] || 'Default';
}

function initQtyControlProductPage() {
  // The quantity stepper in the product detail "ADD TO SHOPPING BAG" section
  const qtySection = document.querySelector('.flex.border.border-outline-variant.items-center');
  if (!qtySection) return;

  const minusBtn   = qtySection.querySelector('button:first-child');
  const plusBtn    = qtySection.querySelector('button:last-child');
  const qtyDisplay = qtySection.querySelector('span.font-label');
  if (!minusBtn || !plusBtn || !qtyDisplay) return;

  productSelection.qty = 1;
  qtyDisplay.textContent = '01';

  minusBtn.addEventListener('click', () => {
    productSelection.qty = Math.max(1, productSelection.qty - 1);
    qtyDisplay.textContent = String(productSelection.qty).padStart(2, '0');
  });

  plusBtn.addEventListener('click', () => {
    productSelection.qty++;
    qtyDisplay.textContent = String(productSelection.qty).padStart(2, '0');
  });
}

/* ────────────────────────────────────────────
   10.  ADD TO BAG — Product Detail Page
   ──────────────────────────────────────────── */

function initAddToBagButton() {
  // "ADD TO SHOPPING BAG" button
  const addBtn = document.querySelector('button.flex-1.bg-primary');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    // Gather product info from the page
    const nameEl  = document.querySelector('h1.font-headline');
    const priceEl = document.querySelector('span.font-headline.text-3xl');
    const imgEl   = document.querySelector('.col-span-10 img') ||
                    document.querySelector('.lg\\:col-span-7 img');

    const name  = nameEl  ? nameEl.textContent.trim()  : 'Atelier Piece';
    const price = priceEl ? priceEl.textContent.trim()  : '$0.00';
    const image = imgEl   ? imgEl.src                   : '';
    const id    = slugify(name);

    addToCart({ id, name, price, image,
      quantity: productSelection.qty,
      size:     productSelection.size  || 'One Size',
      color:    productSelection.color || 'Default' });
  });

  // "INSTANT CHECKOUT" button
  const checkoutBtn = document.querySelector('button.w-full.h-16.bg-transparent');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      // Add to cart first, then go to checkout overlay
      const nameEl  = document.querySelector('h1.font-headline');
      const priceEl = document.querySelector('span.font-headline.text-3xl');
      const imgEl   = document.querySelector('.col-span-10 img') ||
                      document.querySelector('.lg\\:col-span-7 img');

      const name  = nameEl  ? nameEl.textContent.trim() : 'Atelier Piece';
      const price = priceEl ? priceEl.textContent.trim() : '$0.00';
      const image = imgEl   ? imgEl.src : '';
      const id    = slugify(name);

      addToCart({ id, name, price, image,
        quantity: productSelection.qty,
        size:     productSelection.size  || 'One Size',
        color:    productSelection.color || 'Default' });

      setTimeout(handleCheckout, 400);
    });
  }
}

/* ────────────────────────────────────────────
   11.  SHOP PAGE — Quick Add buttons on product cards
   ──────────────────────────────────────────── */

function initShopPageQuickAdd() {
  // Each product card has an add_shopping_cart button (on hover overlay)
  document.querySelectorAll('.group.relative').forEach((card, idx) => {
    const quickAddBtn = card.querySelector('button[class*="absolute bottom-4"]');
    if (!quickAddBtn) return;

    const nameEl  = card.querySelector('h4.font-headline');
    const priceEl = card.querySelector('span.font-headline.italic');
    const imgEl   = card.querySelector('img');
    const catEl   = card.querySelector('p.font-label');

    const name  = nameEl  ? nameEl.textContent.trim()  : `Product ${idx + 1}`;
    const price = priceEl ? priceEl.textContent.trim()  : '$0.00';
    const image = imgEl   ? imgEl.src  : '';
    const id    = slugify(name);

    quickAddBtn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart({ id, name, price, image, quantity: 1, size: 'One Size', color: 'Default' });
    });
  });
}

/* ────────────────────────────────────────────
   12.  HOME PAGE — Quick Add buttons ("QUICK ADD" slide-up)
   ──────────────────────────────────────────── */

function initHomePageQuickAdd() {
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.trim() !== 'QUICK ADD') return;

    const card    = btn.closest('.group');
    if (!card) return;

    const nameEl  = card.querySelector('h4');
    const priceEl = card.querySelector('p.font-headline');
    const imgEl   = card.querySelector('img');

    const name  = nameEl  ? nameEl.textContent.trim()  : 'Atelier Piece';
    const price = priceEl ? priceEl.textContent.trim()  : '$0.00';
    const image = imgEl   ? imgEl.src : '';
    const id    = slugify(name);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart({ id, name, price, image, quantity: 1, size: 'One Size', color: 'Default' });
    });
  });
}

/* ────────────────────────────────────────────
   13.  SEARCH FILTER — Shop Page
   ──────────────────────────────────────────── */

function initSearchFilter() {
  const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                      document.querySelector('input[type="text"]');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    filterProducts({ search: query });
  });
}

/* ────────────────────────────────────────────
   14.  SIDEBAR FILTERS — Shop Page
   ──────────────────────────────────────────── */

function initShopFilters() {
  const productGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
  if (!productGrid) return; // only on shop page

  let activeCategory = null;
  let activeSize     = null;
  let maxPrice       = Infinity;

  // ── Category filter links ──
  const catLinks = document.querySelectorAll('aside ul li a');
  catLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.textContent.trim().split(' ')[0]; // "Outerwear", "Dresses", etc.
      activeCategory = (activeCategory === cat) ? null : cat; // toggle
      filterProducts({ category: activeCategory, size: activeSize, maxPrice });
    });
  });

  // ── Price range slider ──
  const priceSlider = document.querySelector('input[type="range"]');
  if (priceSlider) {
    const maxLabel = document.querySelector('.flex.justify-between.font-headline span:last-child');
    priceSlider.addEventListener('input', () => {
      maxPrice = parseFloat(priceSlider.value);
      if (maxLabel) maxLabel.textContent = '$' + maxPrice.toLocaleString('en-US');
      filterProducts({ category: activeCategory, size: activeSize, maxPrice });
    });
  }

  // ── Size filter buttons (sidebar) ──
  const sidebarSizeBtns = document.querySelectorAll('aside .grid.grid-cols-3 button');
  sidebarSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sz = btn.textContent.trim();
      activeSize = (activeSize === sz) ? null : sz;

      // Visual toggle
      sidebarSizeBtns.forEach(b => {
        b.classList.remove('border-black', 'bg-black', 'text-white');
        b.classList.add('border-outline-variant/30');
      });
      if (activeSize) {
        btn.classList.add('border-black');
        btn.classList.remove('border-outline-variant/30');
      }

      filterProducts({ category: activeCategory, size: activeSize, maxPrice });
    });
  });
}

/**
 * Central filter function — hides cards that don't match the criteria.
 * Works purely on DOM; no data fetch.
 */
function filterProducts({ search = '', category = null, size = null, maxPrice = Infinity } = {}) {
  const cards = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2 > .group.relative');
  let visible = 0;

  cards.forEach(card => {
    const nameEl  = card.querySelector('h4.font-headline');
    const priceEl = card.querySelector('span.font-headline.italic');
    const catEl   = card.querySelector('p.font-label');

    const name  = nameEl  ? nameEl.textContent.trim().toLowerCase()  : '';
    const price = priceEl ? parsePrice(priceEl.textContent)          : 0;
    const cat   = catEl   ? catEl.textContent.trim()                 : '';

    const matchSearch   = !search   || name.includes(search);
    const matchCategory = !category || cat.toLowerCase().includes(category.toLowerCase());
    const matchPrice    = price <= maxPrice;
    // size filter: all products "match" unless we have specific size data attributes
    const matchSize     = !size; // can be extended when products have data-sizes

    const show = matchSearch && matchCategory && matchPrice && matchSize;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Update "Showing X of Y" label
  const countLabel = document.querySelector('span.font-headline.italic.text-sm');
  if (countLabel) {
    const total = cards.length;
    countLabel.textContent = `Showing ${visible} of ${total} items`;
  }
}

/* ────────────────────────────────────────────
   15.  CART PAGE — Checkout button
   ──────────────────────────────────────────── */

function initCheckoutButton() {
  // The "Proceed to Checkout" button in the order summary panel
  const checkoutBtn = document.querySelector(
    'button.w-full.bg-primary.text-on-primary.py-6'
  );
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
}

/* ────────────────────────────────────────────
   16.  UTILITY
   ──────────────────────────────────────────── */

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ────────────────────────────────────────────
   17.  DYNAMIC PRODUCT FETCHING (API)
   ──────────────────────────────────────────── */

let API_BASE = '';

// Detect if we're running locally or on server
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = 'http://localhost:3000';
}

/**
 * Fetch products from API
 * @param {Object} filters - category, minPrice, maxPrice, search, isNewArrival
 */
async function fetchProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE}/api/products?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    // Return empty array if API not available - use hardcoded fallback
    return [];
  }
}

/**
 * Fetch single product by ID
 */
async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_BASE}/api/products/${id}`);
    if (!response.ok) throw new Error('Product not found');

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

/* ────────────────────────────────────────────
   18.  PRODUCT CARD RENDERER
   ──────────────────────────────────────────── */

/**
 * Render a product card with exact Tailwind classes from existing HTML
 */
function renderProductCard(product, showQuickAdd = true) {
  const badgeHtml = product.isNewArrival
    ? '<div class="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-label">New Arrival</div>'
    : product.isLimited
    ? '<div class="absolute top-4 left-4 bg-primary-container text-on-primary-container px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-label">Limited</div>'
    : '';

  const quickAddBtn = showQuickAdd
    ? `<button class="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-product-id="${product._id}">
        <span class="material-symbols-outlined">add_shopping_cart</span>
       </button>`
    : '';

  return `
    <div class="group relative" data-product-id="${product._id}">
      <div class="aspect-[4/5] overflow-hidden bg-surface-container-low mb-6 relative">
        <a href="product_details_ethos_couture.html?id=${product._id}">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               src="${product.images[0] || ''}"
               alt="${product.name}" />
        </a>
        ${badgeHtml}
        ${quickAddBtn}
      </div>
      <div class="space-y-1">
        <p class="font-label text-[0.625rem] tracking-widest text-secondary uppercase">${product.category}</p>
        <div class="flex justify-between items-start">
          <a href="product_details_ethos_couture.html?id=${product._id}">
            <h4 class="font-headline text-lg group-hover:underline underline-offset-4 decoration-1">${product.name}</h4>
          </a>
          <span class="font-headline italic">$${product.price.toLocaleString()}</span>
        </div>
      </div>
    </div>`;
}

/* ────────────────────────────────────────────
   19.  SHOP PAGE DYNAMIC RENDERING
   ──────────────────────────────────────────── */

async function renderShopProducts() {
  const productGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-3');
  if (!productGrid) return;

  // Show loading skeletons
  productGrid.innerHTML = Array(6).fill('').map(() => `
    <div class="group relative">
      <div class="aspect-[4/5] bg-surface-container animate-pulse mb-6"></div>
      <div class="space-y-2">
        <div class="h-3 bg-surface-container animate-pulse w-1/4"></div>
        <div class="h-4 bg-surface-container animate-pulse w-3/4"></div>
        <div class="h-4 bg-surface-container animate-pulse w-1/4"></div>
      </div>
    </div>
  `).join('');

  try {
    const products = await fetchProducts({ limit: 24 });

    if (products.length === 0) {
      // Keep existing static content if API fails
      return;
    }

    productGrid.innerHTML = products.map(p => renderProductCard(p, true)).join('');

    // Re-init quick add buttons for new cards
    initShopPageQuickAddDynamic();

    // Update count label
    const countLabel = document.querySelector('.font-headline.italic.text-sm.text-secondary');
    if (countLabel) {
      countLabel.textContent = `Showing ${products.length} items`;
    }
  } catch (error) {
    // Keep existing static content on error
  }
}

function initShopPageQuickAddDynamic() {
  document.querySelectorAll('[data-product-id]').forEach(card => {
    const quickAddBtn = card.querySelector('button[data-product-id]');
    if (!quickAddBtn) return;

    quickAddBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      const productId = quickAddBtn.dataset.productId;

      // Get product data from DOM or fetch
      const nameEl = card.querySelector('h4.font-headline');
      const priceEl = card.querySelector('span.font-headline.italic');
      const imgEl = card.querySelector('img');

      const name = nameEl ? nameEl.textContent.trim() : 'Product';
      const price = priceEl ? priceEl.textContent.trim() : '$0';
      const image = imgEl ? imgEl.src : '';

      addToCart({
        id: productId,
        name,
        price,
        image,
        quantity: 1,
        size: 'One Size',
        color: 'Default'
      });
    });
  });
}

/* ────────────────────────────────────────────
   20.  HOME PAGE NEW ARRIVALS
   ──────────────────────────────────────────── */

async function renderNewArrivals() {
  const newArrivalsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
  if (!newArrivalsGrid) return;

  // Show loading skeletons
  newArrivalsGrid.innerHTML = Array(4).fill('').map(() => `
    <div class="group cursor-pointer">
      <div class="relative aspect-[4/5] mb-6 overflow-hidden bg-surface-container animate-pulse"></div>
      <div class="space-y-2">
        <div class="h-4 bg-surface-container animate-pulse w-3/4"></div>
        <div class="h-3 bg-surface-container animate-pulse w-1/4"></div>
      </div>
    </div>
  `).join('');

  try {
    const products = await fetchProducts({ isNewArrival: 'true', limit: 4 });

    if (products.length === 0) {
      // Keep existing static content
      return;
    }

    newArrivalsGrid.innerHTML = products.map(product => `
      <div class="group cursor-pointer" data-product-id="${product._id}">
        <div class="relative aspect-[4/5] mb-6 overflow-hidden">
          <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               src="${product.images[0] || ''}" alt="${product.name}" />
          <button class="absolute bottom-0 left-0 right-0 bg-black text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-label text-xs tracking-widest quick-add-btn">QUICK ADD</button>
        </div>
        <h4 class="font-body text-sm font-semibold tracking-tight">${product.name}</h4>
        <p class="font-headline text-sm mt-1">$${product.price.toLocaleString()}</p>
      </div>
    `).join('');

    // Init quick add for new cards
    initHomePageQuickAddDynamic();
  } catch (error) {
    // Keep existing static content
  }
}

function initHomePageQuickAddDynamic() {
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      const card = btn.closest('[data-product-id]');
      if (!card) return;

      const productId = card.dataset.productId;
      const nameEl = card.querySelector('h4');
      const priceEl = card.querySelector('p.font-headline');
      const imgEl = card.querySelector('img');

      const name = nameEl ? nameEl.textContent.trim() : 'Product';
      const price = priceEl ? priceEl.textContent.trim() : '$0';
      const image = imgEl ? imgEl.src : '';

      addToCart({
        id: productId,
        name,
        price,
        image,
        quantity: 1,
        size: 'One Size',
        color: 'Default'
      });
    });
  });
}

/* ────────────────────────────────────────────
   21.  COUNTDOWN TIMER
   ──────────────────────────────────────────── */

function initCountdownTimer() {
  // Find the countdown section on homepage
  const hoursEl = document.querySelector('.font-headline.text-3xl');
  if (!hoursEl) return;

  // Check if we're in the offers banner section
  const offersSection = hoursEl.closest('section.bg-primary');
  if (!offersSection) return;

  // Get all countdown elements
  const countdownEls = offersSection.querySelectorAll('.font-headline.text-3xl');
  if (countdownEls.length < 3) return;

  // Set end time to 48 hours from now
  let endTime = localStorage.getItem('atelier_countdown_end');
  if (!endTime) {
    endTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('atelier_countdown_end', endTime);
  }

  const updateCountdown = () => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      // Reset countdown
      endTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('atelier_countdown_end', endTime);
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownEls[0].textContent = String(Math.max(0, hours)).padStart(2, '0');
    countdownEls[1].textContent = String(Math.max(0, minutes)).padStart(2, '0');
    countdownEls[2].textContent = String(Math.max(0, seconds)).padStart(2, '0');
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ────────────────────────────────────────────
   22.  PAGE DETECTION & INIT
   ──────────────────────────────────────────── */

function detectPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('shopping_cart'))    return 'cart';
  if (path.includes('product_details'))  return 'product';
  if (path.includes('shop_product'))     return 'shop';
  if (path.includes('home_page') || path.endsWith('/') || path.endsWith('index.html')) return 'home';
  return 'unknown';
}

document.addEventListener('DOMContentLoaded', () => {
  const page = detectPage();

  // Always update badge on every page
  updateCartBadge();

  if (page === 'cart') {
    renderCartPage();
    initCheckoutButton();
  }

  if (page === 'product') {
    initSizeSelector();
    initColorSelector();
    initQtyControlProductPage();
    initAddToBagButton();
  }

  if (page === 'shop') {
    renderShopProducts();
    initShopFilters();
    initSearchFilter();
  }

  if (page === 'home') {
    initHomePageQuickAdd();
    initCountdownTimer();
    renderNewArrivals();
  }
});
