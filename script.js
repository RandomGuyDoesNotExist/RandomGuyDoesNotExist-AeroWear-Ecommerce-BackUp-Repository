const track = document.getElementById('heroCarouselTrack');
const dotsWrap = document.getElementById('heroCarouselControls');
const btnPrev = document.getElementById('heroArrowPrev');
const btnNext = document.getElementById('heroArrowNext');

const slides = track.querySelectorAll('.heroSlide');
const totalSlides = slides.length;
let currentSlide = 0;
let autoPlayTimer;

slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'heroDot' + (i === 0 ? ' isActive' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
});

function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

    dotsWrap.querySelectorAll('.heroDot').forEach((d, i) => {
        d.classList.toggle('isActive', i === currentSlide);
    });
}

btnPrev.addEventListener('click', () => {
    resetAutoPlay();
    goToSlide(currentSlide - 1);
});

btnNext.addEventListener('click', () => {
    resetAutoPlay();
    goToSlide(currentSlide + 1);
});

function startAutoPlay() {
    autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 15000);
}

function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
}

startAutoPlay();

const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('navMobileMenu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('isOpen');
});

let productsData = {};
let flatProducts = [];

const productsGrid = document.getElementById('dynamicProductsGrid');
const filterBar = document.getElementById('productFilters');
const productModal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        productsData = await response.json();

        flatProducts = [];
        Object.keys(productsData).forEach(cat => {
            productsData[cat].forEach(prod => {
                flatProducts.push(prod);
            });
        });

        renderProducts('All');
        setupCategoryCardListeners();
    } catch (error) {
        console.error('Error fetching product data:', error);
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--colorGray500); font-weight: 600;">Unable to load products. Please try again later.</p>`;
    }
}

function renderProducts(category) {
    productsGrid.innerHTML = '';
    
    let filteredList = [];
    if (category === 'All') {
        filteredList = flatProducts;
    } else {
        filteredList = productsData[category] || [];
    }

    if (filteredList.length === 0) {
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--colorGray500);">No products found in this category.</p>`;
        return;
    }

    filteredList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'productCard';

        let badgeHtml = '';
        if (product.badge) {
            badgeHtml = `<span class="productBadge">${product.badge}</span>`;
        } else if (product.rating >= 4.8) {
            badgeHtml = `<span class="productBadge badgeBestSelling">Best Seller</span>`;
        }

        const mainImage = (product.images && product.images.length > 0) ? product.images[0] : 'logoWhite.png';

        card.innerHTML = `
            <div class="productCardImgWrap">
                <img src="${mainImage}" alt="${product.product_name}" loading="lazy" />
                ${badgeHtml}
            </div>
            <p class="productCardName">${product.product_name}</p>
            <p class="productCardColorsLabel">${product.brand}</p>
            <p class="productCardPrice">₱ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p class="productCardCategory">${product.category}</p>
        `;

        // Open modal when card (not button) is clicked
        card.addEventListener('click', () => {
            openProductModal(product);
        });

        // no inline add-to-cart button on cards

        productsGrid.appendChild(card);
    });
}

if (filterBar) {
    filterBar.querySelectorAll('.filterBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBar.querySelectorAll('.filterBtn').forEach(b => b.classList.remove('isActive'));
            btn.classList.add('isActive');
            renderProducts(btn.dataset.category);
        });
    });
}

function setupCategoryCardListeners() {
    const categoryCards = document.querySelectorAll('.categoryCard');
    categoryCards.forEach(card => {
        const titleEl = card.querySelector('.categoryCardTitle');
        const viewDealsBtn = card.querySelector('.categoryCardBtn');
        if (!titleEl || !viewDealsBtn) return;

        const title = titleEl.textContent.trim().toLowerCase();
        let targetCategory = '';

        if (title.includes('glasses')) targetCategory = 'Glasses Product';
        else if (title.includes('helmet')) targetCategory = 'Cycling Helmets';
        else if (title.includes('glove')) targetCategory = 'Cycling Gloves';

        if (viewDealsBtn && targetCategory) {
            viewDealsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetFilterBtn = filterBar.querySelector(`[data-category="${targetCategory}"]`);
                if (targetFilterBtn) {
                    targetFilterBtn.click();
                }

                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
}

function openProductModal(product) {
    const images = product.images || [];
    const mainImage = images.length > 0 ? images[0] : 'logoWhite.png';

    let thumbsMarkup = '';
    if (images.length > 1) {
        thumbsMarkup = `<div class="modalThumbnails">`;
        images.forEach((img, i) => {
            thumbsMarkup += `
                <div class="modalThumb ${i === 0 ? 'isActive' : ''}" data-img="${img}">
                    <img src="${img}" alt="${product.product_name} view ${i + 1}" />
                </div>
            `;
        });
        thumbsMarkup += `</div>`;
    }

    let sizesMarkup = '';
    if (product.sizes && product.sizes.length > 0) {
        sizesMarkup = `
            <div style="margin-top: 10px;">
                <p class="modalSectionTitle">Available Sizes</p>
                <div class="modalSizes">
                    ${product.sizes.map(size => `<span class="modalSizeTag">${size}</span>`).join('')}
                </div>
            </div>
        `;
    }

    let materialsMarkup = '';
    if (product.materials && Object.keys(product.materials).length > 0) {
        materialsMarkup = `
            <div style="margin-top: 10px;">
                <p class="modalSectionTitle">Specifications</p>
                <ul class="modalMaterials">
                    ${Object.entries(product.materials).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    let ratingStars = '';
    for (let i = 0; i < 5; i++) {
        ratingStars += i < Math.floor(product.rating) ? '✦' : '✧';
    }

    modalContent.innerHTML = `
        <button class="modalCloseBtn" id="modalCloseBtn" aria-label="Close modal">&times;</button>
        
        <div class="modalImagesArea">
            <div class="modalMainImageWrap">
                <img src="${mainImage}" id="modalMainImg" alt="${product.product_name}" />
            </div>
            ${thumbsMarkup}
        </div>

        <div class="modalDetailsArea">
            ${product.badge ? `<span class="modalBadge">${product.badge}</span>` : ''}
            <h2 class="modalTitle">${product.product_name}</h2>
            
            <div class="modalBrandRow">
                <span class="modalBrand">${product.brand}</span>
                <span class="modalRating">${ratingStars} (${product.rating})</span>
            </div>

            <p class="modalPrice">₱ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            
            <p class="modalDescription">${product.description}</p>
            
            ${sizesMarkup}
            ${materialsMarkup}
                <button class="modalBuyBtn">Add To Cart ✦</button>
        </div>
    `;

    productModal.classList.add('isOpen');
    document.body.style.overflow = 'hidden';

    const thumbs = modalContent.querySelectorAll('.modalThumb');
    const mainImgEl = document.getElementById('modalMainImg');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('isActive'));
            thumb.classList.add('isActive');
            mainImgEl.src = thumb.dataset.img;
        });
    });

    const closeBtn = document.getElementById('modalCloseBtn');
    closeBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', handleBackdropClick);
    
        // Wire the modal Add To Cart button for this product
        const modalBuy = modalContent.querySelector('.modalBuyBtn');
        if (modalBuy) {
            modalBuy.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(product);
            });
        }
}

function closeProductModal() {
    productModal.classList.remove('isOpen');
    document.body.style.overflow = '';
    productModal.removeEventListener('click', handleBackdropClick);
}

function handleBackdropClick(e) {
    if (e.target === productModal) {
        closeProductModal();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.classList.contains('isOpen')) {
        closeProductModal();
    }
});

loadProducts();

/* ===== Simple Cart System (hidden by default) with toggle button ===== */
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const cartSidebarEl = document.getElementById('cartSidebar');
const cartToggle = document.getElementById('cartToggle');
const cartToggleCountEl = document.getElementById('cartToggleCount');

let cart = {};

function showCart(shouldOpen = true) {
    if (!cartSidebarEl) return;
    if (shouldOpen) cartSidebarEl.classList.add('isOpen');
    else cartSidebarEl.classList.remove('isOpen');
}

function toggleCart() {
    if (!cartSidebarEl) return;
    cartSidebarEl.classList.toggle('isOpen');
}

if (cartToggle) {
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart();
    });
}

function loadCart() {
    try {
        const raw = localStorage.getItem('aeroCart');
        cart = raw ? JSON.parse(raw) : {};
    } catch (e) {
        cart = {};
    }
    renderCart();
}

function saveCart() {
    localStorage.setItem('aeroCart', JSON.stringify(cart));
    renderCart();
}

function addToCart(product) {
    const key = product.id || product.sku || product.product_name;
    if (!cart[key]) {
        cart[key] = { product, qty: 1 };
    } else {
        cart[key].qty += 1;
    }
    saveCart();
    // open cart so user sees the added item
    showCart(true);
}

function removeFromCart(key) {
    delete cart[key];
    saveCart();
}

function updateQuantity(key, qty) {
    if (!cart[key]) return;
    if (qty <= 0) {
        removeFromCart(key);
        return;
    }
    cart[key].qty = qty;
    saveCart();
}

function renderCart() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    let total = 0;
    let count = 0;
    Object.keys(cart).forEach(k => {
        const item = cart[k];
        total += (item.product.price || 0) * item.qty;
        count += item.qty;

        const itemWrap = document.createElement('div');
        itemWrap.className = 'cartItem';
        itemWrap.innerHTML = `
            <img src="${(item.product.images && item.product.images[0]) || 'logoWhite.png'}" alt="${item.product.product_name}" />
            <div class="cartItemMeta">
                <div class="cartItemName">${item.product.product_name}</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button class="cartQtyDec" data-key="${k}" aria-label="Decrease quantity">-</button>
                    <span class="cartQty">${item.qty}</span>
                    <button class="cartQtyInc" data-key="${k}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cartItemPrice">₱ ${( (item.product.price || 0) * item.qty ).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                <button class="cartRemove" data-key="${k}" aria-label="Remove item">Remove</button>
            </div>
        `;

        cartItemsEl.appendChild(itemWrap);
    });

    if (cartCountEl) cartCountEl.textContent = count;
    if (cartTotalEl) cartTotalEl.textContent = total.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
    if (cartToggleCountEl) cartToggleCountEl.textContent = count;

    // bind controls
    cartItemsEl.querySelectorAll('.cartQtyInc').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const k = el.dataset.key;
            updateQuantity(k, (cart[k].qty || 0) + 1);
        });
    });

    cartItemsEl.querySelectorAll('.cartQtyDec').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const k = el.dataset.key;
            updateQuantity(k, (cart[k].qty || 0) - 1);
        });
    });

    cartItemsEl.querySelectorAll('.cartRemove').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const k = el.dataset.key;
            removeFromCart(k);
        });
    });
}

loadCart();
