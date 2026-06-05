const catalog = window.FITNESS_LINE_CATALOG || { categories: [], products: [] };
const productsDatabase = catalog.products;
const OFFICIAL_WHATSAPP = "573203823557";
const CATALOG_DISPLAY_LIMIT = 10;
const INITIAL_PRODUCTS_RENDER = 10;
const PRODUCTS_RENDER_CHUNK = 10;
let productRenderToken = 0;

function getHighResolutionImageUrl(url) {
    return url?.replace(/-324x324(?=\.(?:png|jpe?g|webp)(?:\?|$))/i, "") || "";
}

function scheduleIdleTask(callback) {
    if ("requestIdleCallback" in window) {
        return window.requestIdleCallback(callback, { timeout: 700 });
    }
    return window.setTimeout(callback, 32);
}

let cart = JSON.parse(localStorage.getItem("fitness_line_cart")) || [];
let favorites = JSON.parse(localStorage.getItem("fitness_line_favorites")) || [];
let navigationIndex = Number(window.history.state?.index || 0);
let catalogMenuPinned = false;
let activeProduct = null;
let navScrollFrame = null;
let navCatalogCloseTimer = null;

const CATEGORY_ALIASES = {
    brasieres: "brassieres",
    brassieres: "brassieres",
    enterizas: "fajas-enterizas",
    "fajas enterizas": "fajas-enterizas",
    "post parto": "post-parto",
    postparto: "post-parto",
    "ultra invisible": "linea-ultra-invisible",
    "linea ultra invisible": "linea-ultra-invisible",
    "línea ultra invisible": "linea-ultra-invisible",
    deportiva: "fajas-deportivas",
    "linea deportiva": "fajas-deportivas",
    "línea deportiva": "fajas-deportivas",
    seamless: "bodyshape-seamless",
    "reloj de arena": "linea-reloj-de-arena"
};

const FILTER_TERM_CATEGORY_SLUGS = {
    "reloj de arena": "linea-reloj-de-arena",
    "fajas enterizas": "fajas-enterizas",
    cinturillas: "cinturillas",
    chalecos: "chalecos",
    "ultra invisible": "linea-ultra-invisible",
    "linea deportiva": "fajas-deportivas",
    "línea deportiva": "fajas-deportivas",
    combos: "combos",
    "linea post-parto": "post-parto",
    "línea post-parto": "post-parto",
    "linea post parto": "post-parto",
    "línea post parto": "post-parto",
    brassieres: "brassieres",
    brasieres: "brassieres",
    seamless: "bodyshape-seamless"
};

const CATEGORY_FILTER_SLUGS = [
    "fajas-enterizas",
    "post-parto",
    "fajas-post-quirurgicas",
    "linea-ultra-invisible",
    "fajas-deportivas",
    "bodyshape-seamless",
    "chalecos",
    "cinturillas",
    "complementos"
];

const mainNav = document.getElementById("mainNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const productsGrid = document.getElementById("productsGrid");
const catalogCategoryFilter = document.getElementById("catalogCategoryFilter");
const catalogCount = document.getElementById("catalogCount");
const catalogViewKicker = document.getElementById("catalogViewKicker");
const catalogMenuCategories = document.getElementById("catalogMenuCategories");
const catalogQuickCategories = document.getElementById("catalogQuickCategories");
const navCatalogTrigger = document.getElementById("navCatalogTrigger");
const navCatalog = document.querySelector(".nav-catalog");
const navCatalogDetails = document.getElementById("navCatalogDetails");
const navCatalogToggle = document.getElementById("navCatalogToggle");
const navCatalogPanel = document.getElementById("navCatalogPanel");
const navCatalogClose = document.getElementById("navCatalogClose");
const navCatalogGroups = document.getElementById("navCatalogGroups");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartOverlay = document.getElementById("cartOverlay");
const sideCart = document.getElementById("sideCart");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartEmptyMessage = document.getElementById("cartEmptyMessage");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");
const searchOpenBtn = document.getElementById("searchOpenBtn");
const searchCloseBtn = document.getElementById("searchCloseBtn");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");
const searchResults = document.getElementById("searchResults");
const searchMatchGrid = document.getElementById("searchMatchGrid");
const whatsappBtn = document.getElementById("whatsappBtn");
const productModal = document.getElementById("productModal");
const productModalOverlay = document.getElementById("productModalOverlay");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailMainImage = document.getElementById("detailMainImage");
const detailThumbnails = document.getElementById("detailThumbnails");
const detailZoomBtn = document.getElementById("detailZoomBtn");
const detailCategory = document.getElementById("detailCategory");
const detailProductName = document.getElementById("detailProductName");
const detailPrice = document.getElementById("detailPrice");
const detailDescription = document.getElementById("detailDescription");
const detailFeatures = document.getElementById("detailFeatures");
const detailOptions = document.getElementById("detailOptions");
const detailAddBtn = document.getElementById("detailAddBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const sizeGuide = document.getElementById("sizeGuide");
const zoomModal = document.getElementById("zoomModal");
const zoomImage = document.getElementById("zoomImage");
const zoomCloseBtn = document.getElementById("zoomCloseBtn");

document.addEventListener("DOMContentLoaded", () => {
    renderCategoryFilter();
    renderCatalogNavigation();
    renderUnifiedCatalogMenu();
    updateCartUI();
    initHeroReveal();
    initCategoryPremiumParallax();
    setupEventListeners();
    initScrollAnimations();
    window.history.replaceState({ ...window.history.state, index: navigationIndex }, "", window.location.href);
    applyRouteFromUrl();
});

function initHeroReveal() {
    const hero = document.querySelector("[data-hero-reveal]");
    if (!hero) return;
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(pointer: coarse)").matches
    ) {
        return;
    }

    let frame = null;
    let currentX = 34;
    let currentY = 48;
    let targetX = 34;
    let targetY = 48;
    let currentParallaxX = 0;
    let currentParallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    const render = () => {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;

        hero.style.setProperty("--reveal-x", `${currentX.toFixed(2)}%`);
        hero.style.setProperty("--reveal-y", `${currentY.toFixed(2)}%`);
        hero.style.setProperty("--parallax-x", `${currentParallaxX.toFixed(2)}px`);
        hero.style.setProperty("--parallax-y", `${currentParallaxY.toFixed(2)}px`);

        if (
            Math.abs(targetX - currentX) > 0.01 ||
            Math.abs(targetY - currentY) > 0.01 ||
            Math.abs(targetParallaxX - currentParallaxX) > 0.01 ||
            Math.abs(targetParallaxY - currentParallaxY) > 0.01
        ) {
            frame = requestAnimationFrame(render);
        } else {
            frame = null;
        }
    };

    const requestRender = () => {
        if (!frame) frame = requestAnimationFrame(render);
    };

    const updateTargets = (event) => {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

        targetX = x * 100;
        targetY = y * 100;
        targetParallaxX = (x - 0.5) * -10;
        targetParallaxY = (y - 0.5) * -10;
        requestRender();
    };

    hero.addEventListener("pointermove", updateTargets, { passive: true });
    hero.addEventListener("pointerleave", () => {
        targetParallaxX = 0;
        targetParallaxY = 0;
        requestRender();
    });
}

function initCategoryPremiumParallax() {
    const media = document.querySelector("[data-category-parallax]");
    if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = null;

    const render = () => {
        frame = null;
        const rect = media.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        const offset = -12 * progress;
        media.style.setProperty("--category-parallax-y", `${offset.toFixed(2)}px`);
    };

    const requestRender = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(render);
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    requestRender();
}

function setupEventListeners() {
    window.addEventListener("scroll", () => {
        if (navScrollFrame) return;
        navScrollFrame = requestAnimationFrame(() => {
            mainNav.style.padding = window.scrollY > 40 ? "4px 0" : "0";
            mainNav.classList.toggle("dark", window.scrollY > 40);
            if (navCatalogPanel.classList.contains("active")) closeUnifiedCatalogMenu();
            navScrollFrame = null;
        });
    }, { passive: true });

    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        navToggle.classList.toggle("active");
    });

    navCatalogToggle.addEventListener("change", () => {
        navCatalogPanel.classList.toggle("active", navCatalogToggle.checked);
        navCatalogTrigger.classList.toggle("active", navCatalogToggle.checked);
        navCatalogTrigger.setAttribute("aria-expanded", String(navCatalogToggle.checked));
    });
    navCatalogTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleUnifiedCatalogMenu();
    });
    navCatalog.addEventListener("pointerenter", () => {
        if (shouldUseHoverCatalog()) openUnifiedCatalogMenu();
    });
    navCatalog.addEventListener("pointerleave", () => {
        if (shouldUseHoverCatalog()) scheduleUnifiedCatalogMenuClose();
    });
    navCatalogClose.addEventListener("click", closeUnifiedCatalogMenu);
    navCatalogPanel.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("pointermove", (event) => {
        if (!shouldUseHoverCatalog() || navCatalogPanel.classList.contains("active")) return;
        if (isPointerNearElement(event, navCatalog, 42)) openUnifiedCatalogMenu();
    }, { passive: true });
    document.addEventListener("pointerdown", (event) => {
        if (!event.composedPath().includes(navCatalog)) closeUnifiedCatalogMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeUnifiedCatalogMenu();
    });

    document.querySelectorAll(".nav-view-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigateToSection(link.dataset.view, link.getAttribute("href"));
        });
    });

    cartToggleBtn.addEventListener("click", openCart);
    cartCloseBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    searchOpenBtn.addEventListener("click", openSearch);
    searchCloseBtn.addEventListener("click", closeSearch);
    searchInput.addEventListener("input", (event) => handleSearch(event.target.value));
    catalogCategoryFilter.addEventListener("change", () => {
        navigateToCatalogCategory(catalogCategoryFilter.value);
    });

    document.querySelectorAll(".search-suggestion-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            const hash = link.getAttribute("href");
            if (!hash?.startsWith("#")) {
                closeSearch();
                return;
            }

            event.preventDefault();
            closeSearch();
            if (hash === "#productos") {
                navigateToCatalogCategory("");
                return;
            }

            const target = document.querySelector(hash);
            if (!target) return;
            updateViewUrl(hash.slice(1), hash);
            closeMobileNav();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    document.querySelectorAll(".buy-now-hero-btn").forEach((button) => {
        button.addEventListener("click", () => addDefaultVariation(button.dataset.productId));
    });

    document.querySelectorAll(".mega-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigateToCatalogFilter(link.dataset.filter || "");
        });
    });

    document.querySelectorAll('a[href="#productos"]:not(.mega-link):not(.nav-view-link):not(.search-suggestion-link)').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigateToCatalogCategory("");
        });
    });

    cartCheckoutBtn.addEventListener("click", checkoutOnWhatsApp);
    window.addEventListener("popstate", (event) => {
        const nextIndex = Number(event.state?.index || 0);
        const direction = nextIndex < navigationIndex ? "back" : "forward";
        navigationIndex = nextIndex;
        runViewTransition(applyRouteFromUrl, direction);
    });
    whatsappBtn.addEventListener("click", () => {
        if (whatsappBtn.tagName !== "A") {
            openWhatsApp("Hola Fitness Line, quisiera recibir asesoría sobre sus productos.");
        }
    });
    productModalOverlay.addEventListener("click", closeProductDetail);
    detailCloseBtn.addEventListener("click", closeProductDetail);
    detailZoomBtn.addEventListener("click", openImageZoom);
    zoomCloseBtn.addEventListener("click", closeImageZoom);
    zoomModal.addEventListener("click", (event) => {
        if (event.target === zoomModal) closeImageZoom();
    });
    favoriteBtn.addEventListener("click", toggleFavorite);
    detailAddBtn.addEventListener("click", addActiveProductToCart);
    setupAnimationVisibility();
    document.addEventListener("click", handleCatalogButtonNavigation);
    setupNewsletterForm();
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSearch();
        closeCart();
        closeUnifiedCatalogMenu();
        closeImageZoom();
        closeProductDetail();
    }
});

function renderCategoryFilter() {
    CATEGORY_FILTER_SLUGS
        .map((slug) => catalog.categories.find((category) => category.slug === slug && category.count > 0))
        .filter(Boolean)
        .forEach((category) => {
            catalogCategoryFilter.appendChild(createCategoryFilterOption(category));
        });
}

function createCategoryFilterOption(category) {
    const option = document.createElement("option");
    option.value = category.slug;
    option.textContent = category.name;
    return option;
}

function renderCatalogNavigation() {
    const preferredSlugs = [
        "linea-reloj-de-arena",
        "linea-ultra-invisible",
        "bodyshape-seamless",
        "fusion-line",
        "shine-sculpt",
        "fajas-post-quirurgicas",
        "fajas-deportivas",
        "post-parto",
        "fajas-enterizas",
        "shorts-levantacola",
        "chalecos",
        "cinturillas",
        "complementos"
    ];
    const categories = preferredSlugs
        .map((slug) => catalog.categories.find((category) => category.slug === slug))
        .filter(Boolean);

    categories.forEach((category) => {
        const menuLink = document.createElement("button");
        menuLink.className = "catalog-mega-link";
        menuLink.type = "button";
        menuLink.innerHTML = `<span>${escapeHtml(category.name)}</span><small>${category.count} productos</small>`;
        menuLink.addEventListener("click", () => selectCatalogCategory(category.slug));
        catalogMenuCategories.appendChild(menuLink);

        const quickLink = document.createElement("button");
        quickLink.className = "catalog-entry-link";
        quickLink.type = "button";
        quickLink.innerHTML = `<span>${escapeHtml(category.name)}</span><small>${category.count}</small>`;
        quickLink.addEventListener("click", () => selectCatalogCategory(category.slug));
        if (catalogQuickCategories) catalogQuickCategories.appendChild(quickLink);
    });
}

function renderUnifiedCatalogMenu() {
    const groups = [
        {
            title: "Colecciones",
            slugs: ["linea-reloj-de-arena", "linea-ultra-invisible", "bodyshape-seamless", "fusion-line", "shine-sculpt", "fajas-post-quirurgicas", "fajas-deportivas", "post-parto"]
        },
        {
            title: "Tipos de prenda",
            parentId: 21
        }
    ];

    navCatalogGroups.innerHTML = "";
    groups.forEach((group) => {
        const column = document.createElement("div");
        column.className = "nav-catalog-group";
        column.innerHTML = `<h4>${escapeHtml(group.title)}</h4><div class="nav-catalog-list"></div>`;
        const list = column.querySelector(".nav-catalog-list");

        if (group.rootSlug) {
            const root = catalog.categories.find((category) => category.slug === group.rootSlug);
            if (root) list.appendChild(createUnifiedCategoryButton(root, false));
        }

        const categories = group.slugs
            ? group.slugs.map((slug) => catalog.categories.find((category) => category.slug === slug)).filter(Boolean)
            : catalog.categories.filter((category) => category.parent === group.parentId && category.count > 0);

        categories.forEach((category) => {
            list.appendChild(createUnifiedCategoryButton(category, Boolean(group.parentId)));
        });
        navCatalogGroups.appendChild(column);
    });
}

function createUnifiedCategoryButton(category, nested) {
    const button = document.createElement("button");
    button.className = nested ? "nav-catalog-subcategory" : "nav-catalog-category";
    button.type = "button";
    button.dataset.categorySlug = category.slug;
    button.innerHTML = `<span>${escapeHtml(category.name)}</span><small>${category.count}</small>`;
    button.addEventListener("click", () => {
        closeUnifiedCatalogMenu();
        window.requestAnimationFrame(() => selectCatalogCategory(category.slug));
    });
    return button;
}

function toggleUnifiedCatalogMenu() {
    if (navCatalogPanel.classList.contains("active")) {
        closeUnifiedCatalogMenu();
        return;
    }
    openUnifiedCatalogMenu();
}

function openUnifiedCatalogMenu() {
    clearTimeout(navCatalogCloseTimer);
    navCatalogToggle.checked = true;
    navCatalogPanel.classList.add("active");
    navCatalogPanel.scrollTop = 0;
    navCatalogTrigger.classList.add("active");
    navCatalogTrigger.setAttribute("aria-expanded", "true");
}

function closeUnifiedCatalogMenu() {
    clearTimeout(navCatalogCloseTimer);
    catalogMenuPinned = false;
    navCatalogToggle.checked = false;
    navCatalogPanel.classList.remove("active");
    navCatalogTrigger.classList.remove("active");
    navCatalogTrigger.setAttribute("aria-expanded", "false");
}

function scheduleUnifiedCatalogMenuClose() {
    clearTimeout(navCatalogCloseTimer);
    navCatalogCloseTimer = window.setTimeout(() => {
        closeUnifiedCatalogMenu();
    }, 180);
}

function shouldUseHoverCatalog() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function isPointerNearElement(event, element, distance) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return event.clientX >= rect.left - distance
        && event.clientX <= rect.right + distance
        && event.clientY >= rect.top - distance
        && event.clientY <= rect.bottom + distance;
}

function renderProducts(products) {
    const renderToken = ++productRenderToken;
    productsGrid.innerHTML = "";
    const visibleProducts = products.slice(0, CATALOG_DISPLAY_LIMIT);
    catalogCount.textContent = products.length > CATALOG_DISPLAY_LIMIT
        ? `${visibleProducts.length} de ${products.length} productos`
        : `${visibleProducts.length} productos`;

    appendProductCards(visibleProducts, 0, Math.min(INITIAL_PRODUCTS_RENDER, visibleProducts.length), renderToken);

    if (visibleProducts.length > INITIAL_PRODUCTS_RENDER) {
        scheduleIdleTask(() => appendProductCardsInChunks(visibleProducts, INITIAL_PRODUCTS_RENDER, renderToken));
    }
}

function appendProductCardsInChunks(products, startIndex, renderToken) {
    if (renderToken !== productRenderToken) return;

    const endIndex = Math.min(startIndex + PRODUCTS_RENDER_CHUNK, products.length);
    appendProductCards(products, startIndex, endIndex, renderToken);

    if (endIndex < products.length) {
        scheduleIdleTask(() => appendProductCardsInChunks(products, endIndex, renderToken));
    }
}

function appendProductCards(products, startIndex, endIndex, renderToken) {
    if (renderToken !== productRenderToken) return;

    products.slice(startIndex, endIndex).forEach((product, offset) => {
        const index = startIndex + offset;
        const shouldPrioritizeImage = index < 6;
        const cardImageUrl = getHighResolutionImageUrl(product.img);
        const card = document.createElement("article");
        card.className = "product-card";
        card.dataset.id = product.id;
        card.innerHTML = `
            <button class="product-image-container product-open" type="button" aria-label="Ver detalles de ${escapeAttribute(product.name)}">
                <span class="product-premium-badge">${escapeHtml(productBadge(product, index))}</span>
                <img src="${escapeAttribute(cardImageUrl)}" alt="${escapeAttribute(product.name)}" class="product-img" width="800" height="800" loading="${shouldPrioritizeImage ? "eager" : "lazy"}" ${shouldPrioritizeImage ? 'fetchpriority="high"' : 'fetchpriority="low"'} decoding="async">
                <span class="product-view-hint">Ver producto</span>
            </button>
            <div class="product-details">
                <div>
                    <span class="product-category">${escapeHtml(primaryCategory(product))}</span>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <div class="product-premium-meta">
                        <span>${escapeHtml(compressionLevel(product))}</span>
                        <span>${escapeHtml(productBenefit(product))}</span>
                    </div>
                    <p class="product-price">${escapeHtml(priceRange(product))}</p>
                </div>
                <button class="product-detail-link product-open" type="button">Ver detalles <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
        card.querySelectorAll(".product-open").forEach((button) => button.addEventListener("click", () => openProductDetail(product)));
        productsGrid.appendChild(card);
    });
}

function setupAnimationVisibility() {
    const marquee = document.querySelector(".technology-marquee");
    if (!marquee || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            marquee.classList.toggle("is-paused", !entry.isIntersecting);
        });
    }, { threshold: 0.08 });

    observer.observe(marquee);
}

function productBadge(product, index) {
    const slugs = product.categories.map((category) => category.slug);
    if (index === 0) return "MÁS VENDIDA";
    if (slugs.includes("post-parto") || slugs.includes("parto-natural") || slugs.includes("parto-por-cesarea")) return "POST PARTO";
    if (slugs.includes("fajas-deportivas") || slugs.includes("compresion-fuerte")) return "ALTA COMPRESIÓN";
    return "NUEVA COLECCIÓN";
}

function compressionLevel(product) {
    const slugs = product.categories.map((category) => category.slug);
    if (slugs.includes("bodyshape-seamless") || slugs.includes("linea-ultra-invisible")) return "Compresión suave";
    if (slugs.includes("fajas-deportivas") || slugs.includes("cinturillas") || slugs.includes("chalecos")) return "Compresión alta";
    if (slugs.includes("post-parto") || slugs.includes("fajas-post-quirurgicas")) return "Soporte gradual";
    return "Compresión media";
}

function productBenefit(product) {
    const slugs = product.categories.map((category) => category.slug);
    if (slugs.includes("bodyshape-seamless") || slugs.includes("linea-ultra-invisible")) return "Invisible bajo ropa";
    if (slugs.includes("fajas-deportivas")) return "Soporte activo";
    if (slugs.includes("post-parto") || slugs.includes("fajas-post-quirurgicas")) return "Recuperación cómoda";
    if (slugs.includes("brassieres")) return "Realce natural";
    return "Moldeo diario";
}

function openProductDetail(product) {
    activeProduct = product;
    detailCategory.textContent = primaryCategory(product);
    detailProductName.textContent = product.name;
    detailDescription.textContent = `Prenda Fitness Line confeccionada para brindar soporte, comodidad y un ajuste definido. Selecciona tu talla antes de añadirla al carrito.`;
    detailFeatures.innerHTML = [
        "Diseño colombiano",
        "Ajuste de compresión",
        "Soporte cómodo para uso diario"
    ].map((feature) => `<span><i class="fa-regular fa-circle-check"></i>${escapeHtml(feature)}</span>`).join("");

    const images = [...new Set([product.img, ...product.variants.map((variant) => variant.img).filter(Boolean)])];
    detailThumbnails.innerHTML = "";
    images.forEach((image, index) => {
        const thumbnail = document.createElement("button");
        thumbnail.className = `detail-thumbnail${index === 0 ? " active" : ""}`;
        thumbnail.type = "button";
        thumbnail.innerHTML = `<img src="${escapeAttribute(image)}" alt="${escapeAttribute(product.name)}" width="92" height="92" loading="lazy" decoding="async">`;
        thumbnail.addEventListener("click", () => setDetailImage(getHighResolutionImageUrl(image), thumbnail));
        detailThumbnails.appendChild(thumbnail);
    });
    setDetailImage(getHighResolutionImageUrl(images[0]));
    renderDetailOptions(product);
    refreshFavoriteButton();
    productModal.classList.add("active");
    productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeProductDetail() {
    productModal.classList.remove("active");
    productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

function renderDetailOptions(product) {
    detailOptions.innerHTML = "";
    Object.entries(product.options).forEach(([attribute, values]) => {
        const group = document.createElement("label");
        group.className = "detail-option-group";
        group.innerHTML = `
            <span>${escapeHtml(attributeLabel(attribute))}</span>
            <select class="detail-option-select" data-attribute="${escapeAttribute(attribute)}">
                ${values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(optionLabel(value))}</option>`).join("")}
            </select>
        `;
        detailOptions.appendChild(group);
    });
    const defaultVariant = firstAvailableVariant(product);
    detailOptions.querySelectorAll(".detail-option-select").forEach((select) => {
        if (defaultVariant?.attributes[select.dataset.attribute]) select.value = defaultVariant.attributes[select.dataset.attribute];
        select.addEventListener("change", updateDetailSelection);
    });
    sizeGuide.style.display = product.options.talla ? "block" : "none";
    updateDetailSelection();
}

function selectedDetailVariant() {
    if (!activeProduct) return null;
    const selected = {};
    detailOptions.querySelectorAll(".detail-option-select").forEach((select) => {
        selected[select.dataset.attribute] = select.value;
    });
    return activeProduct.variants.find((variant) => Object.entries(selected).every(([key, value]) => !variant.attributes[key] || variant.attributes[key] === value));
}

function updateDetailSelection() {
    const variant = selectedDetailVariant();
    if (!variant) {
        detailPrice.textContent = "Combinación no disponible";
        detailAddBtn.disabled = true;
        return;
    }
    detailPrice.textContent = `${formatCOP(variant.price)} COP`;
    detailAddBtn.disabled = !variant.inStock || !variant.purchasable;
    detailAddBtn.textContent = detailAddBtn.disabled ? "Agotado" : "Añadir al carrito";
    if (variant.img) setDetailImage(getHighResolutionImageUrl(variant.img));
}

function addActiveProductToCart() {
    const variant = selectedDetailVariant();
    if (!activeProduct || !variant || !variant.inStock || !variant.purchasable) return;
    closeProductDetail();
    addProductToCart(activeProduct, variant);
}

function setDetailImage(image, thumbnail) {
    detailMainImage.src = image;
    detailMainImage.alt = activeProduct?.name || "Producto Fitness Line";
    detailThumbnails.querySelectorAll(".detail-thumbnail").forEach((item) => item.classList.remove("active"));
    if (thumbnail) thumbnail.classList.add("active");
}

function openImageZoom() {
    zoomImage.src = detailMainImage.src;
    zoomImage.alt = detailMainImage.alt;
    zoomModal.classList.add("active");
    zoomModal.setAttribute("aria-hidden", "false");
}

function closeImageZoom() {
    zoomModal.classList.remove("active");
    zoomModal.setAttribute("aria-hidden", "true");
}

function toggleFavorite() {
    if (!activeProduct) return;
    favorites = favorites.includes(activeProduct.id)
        ? favorites.filter((id) => id !== activeProduct.id)
        : [...favorites, activeProduct.id];
    localStorage.setItem("fitness_line_favorites", JSON.stringify(favorites));
    refreshFavoriteButton();
}

function refreshFavoriteButton() {
    const isFavorite = Boolean(activeProduct && favorites.includes(activeProduct.id));
    favoriteBtn.classList.toggle("active", isFavorite);
    favoriteBtn.innerHTML = `<i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>`;
    favoriteBtn.setAttribute("aria-label", isFavorite ? "Quitar de favoritos" : "Guardar como favorito");
}

function renderProductOptions(card, product) {
    const optionsContainer = card.querySelector(".product-options");
    const optionEntries = Object.entries(product.options);

    if (optionEntries.length === 0) {
        optionsContainer.innerHTML = '<p class="product-availability">Producto disponible</p>';
        updateCardSelection(card, product);
        return;
    }

    optionEntries.forEach(([attribute, values]) => {
        const group = document.createElement("label");
        group.className = "option-group";
        group.innerHTML = `
            <span class="option-title">${escapeHtml(attributeLabel(attribute))}</span>
            <select class="product-option-select" data-attribute="${escapeAttribute(attribute)}">
                ${values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(optionLabel(value))}</option>`).join("")}
            </select>
        `;
        optionsContainer.appendChild(group);
    });

    const defaultVariant = firstAvailableVariant(product);
    if (defaultVariant) {
        optionsContainer.querySelectorAll(".product-option-select").forEach((select) => {
            if (defaultVariant.attributes[select.dataset.attribute]) {
                select.value = defaultVariant.attributes[select.dataset.attribute];
            }
        });
    }

    optionsContainer.querySelectorAll(".product-option-select").forEach((select) => {
        select.addEventListener("change", () => updateCardSelection(card, product));
    });
    updateCardSelection(card, product);
}

function updateCardSelection(card, product) {
    const variant = selectedVariant(card, product);
    const price = card.querySelector(".product-price");
    const button = card.querySelector(".add-to-cart-btn");

    if (!variant) {
        price.textContent = "Combinación no disponible";
        button.disabled = true;
        return;
    }

    price.textContent = `${formatCOP(variant.price)} COP`;
    button.disabled = !variant.inStock || !variant.purchasable;
    button.textContent = button.disabled ? "Agotado" : "Añadir a la bolsa";
}

function selectedVariant(card, product) {
    const selected = {};
    card.querySelectorAll(".product-option-select").forEach((select) => {
        selected[select.dataset.attribute] = select.value;
    });

    return product.variants.find((variant) => {
        return Object.entries(selected).every(([key, value]) => {
            return !variant.attributes[key] || variant.attributes[key] === value;
        });
    });
}

function firstAvailableVariant(product) {
    return product.variants.find((variant) => variant.inStock && variant.purchasable)
        || product.variants.find((variant) => variant.purchasable)
        || product.variants[0];
}

function addDefaultVariation(productId) {
    const product = productsDatabase.find((item) => item.id === productId);
    if (!product) return;
    const variant = firstAvailableVariant(product);
    if (variant && variant.inStock && variant.purchasable) addProductToCart(product, variant);
}

function addProductToCart(product, variant) {
    const key = `${product.id}:${variant.id}`;
    const existing = cart.find((item) => item.key === key);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            key,
            id: product.id,
            variantId: variant.id,
            name: product.name,
            price: variant.price,
            img: variant.img || product.img,
            attributes: variant.attributes,
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
    openCart();
}

function removeFromCart(key) {
    cart = cart.filter((item) => item.key !== key);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    cart = cart.filter((item) => item.key && Number.isFinite(item.price));
    saveCart();
    cartCount.textContent = calculateCount();
    cartCount.classList.remove("animate");
    void cartCount.offsetWidth;
    cartCount.classList.add("animate");

    cartItemsList.querySelectorAll(".cart-item").forEach((item) => item.remove());
    cartEmptyMessage.style.display = cart.length === 0 ? "block" : "none";
    cartCheckoutBtn.disabled = cart.length === 0;
    cartCheckoutBtn.style.opacity = cart.length === 0 ? "0.5" : "1";

    cart.forEach((item) => {
        const attributes = formatAttributes(item.attributes);
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img src="${escapeAttribute(item.img)}" alt="${escapeAttribute(item.name)}" class="cart-item-img" width="74" height="74" loading="lazy" decoding="async">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
                <p class="cart-item-meta">${escapeHtml(attributes)}</p>
                <div class="cart-item-quantity">
                    <button class="cart-quantity-btn decrease" type="button" aria-label="Reducir cantidad">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-quantity-btn increase" type="button" aria-label="Aumentar cantidad">+</button>
                </div>
                <p class="cart-item-price">${formatCOP(item.price * item.quantity)} COP</p>
            </div>
            <button class="cart-item-remove" type="button" aria-label="Eliminar ${escapeAttribute(item.name)}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        row.querySelector(".decrease").addEventListener("click", () => changeCartQuantity(item.key, -1));
        row.querySelector(".increase").addEventListener("click", () => changeCartQuantity(item.key, 1));
        row.querySelector(".cart-item-remove").addEventListener("click", () => removeFromCart(item.key));
        cartItemsList.appendChild(row);
    });

    cartSubtotal.textContent = `${formatCOP(calculateTotal())} COP`;
}

function changeCartQuantity(key, delta) {
    const item = cart.find((entry) => entry.key === key);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(key);
        return;
    }
    saveCart();
    updateCartUI();
}

function filterCatalog() {
    const slug = getCanonicalCategorySlug(catalogCategoryFilter.value);
    if (catalogCategoryFilter.value !== slug) catalogCategoryFilter.value = slug;
    const filtered = slug
        ? productsDatabase.filter((product) => product.categories.some((category) => category.slug === slug))
        : productsDatabase;
    renderProducts(filtered);
    updateCatalogViewKicker(slug, filtered.length);
}

function selectCatalogCategory(slug) {
    navigateToCatalogCategory(slug);
}

function navigateToCatalogCategory(slug) {
    const categorySlug = getCanonicalCategorySlug(slug);
    closeUnifiedCatalogMenu();
    catalogCategoryFilter.value = categorySlug;
    filterCatalog();
    updateViewUrl("catalogo", "#productos", categorySlug);
    closeMobileNav();
    scrollToCatalogProducts("smooth");
}

function navigateToCatalogFilter(term) {
    const categorySlug = getCatalogSlugFromFilterTerm(term);
    if (categorySlug) {
        navigateToCatalogCategory(categorySlug);
        return;
    }
    highlightFirstMatch(term);
}

function handleCatalogButtonNavigation(event) {
    const categoryButton = event.target.closest(".premium-category-pill");
    if (categoryButton) {
        event.preventDefault();
        navigateToCatalogCategory(categoryButton.dataset.categorySlug || "");
        return;
    }

    const button = event.target.closest("button");
    if (!button) return;

    const label = normalize(button.textContent);
    const shouldOpenCatalog = [
        "ver catalogo",
        "ver coleccion",
        "ver productos",
        "explorar"
    ].some((text) => label.includes(text));

    if (shouldOpenCatalog) {
        event.preventDefault();
        navigateToCatalogCategory("");
    }
}

function navigateToSection(view, hash) {
    runViewTransition(() => {
        if (view === "catalogo") {
            catalogCategoryFilter.value = defaultCatalogCategorySlug();
            filterCatalog();
        }
        updateViewUrl(view, hash);
        closeMobileNav();
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function runViewTransition(callback, direction = "forward") {
    const directionClass = direction === "back" ? "view-transition-back" : "view-transition-forward";
    document.body.classList.remove("view-transition-forward", "view-transition-back", "view-transition-enter");
    document.body.classList.add("view-transitioning", directionClass);
    window.setTimeout(() => {
        callback();
        document.body.classList.remove("view-transitioning");
        document.body.classList.add("view-transition-enter");
        window.setTimeout(() => {
            document.body.classList.remove(directionClass, "view-transition-enter");
        }, 440);
    }, 170);
}

function updateViewUrl(view, hash, category = "") {
    const url = new URL(window.location.href);
    url.searchParams.set("vista", view);
    if (category) {
        url.searchParams.set("categoria", category);
    } else {
        url.searchParams.delete("categoria");
    }
    url.hash = hash;
    navigationIndex += 1;
    window.history.pushState({ view, category, index: navigationIndex }, "", url);
}

function applyRouteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("vista");
    const category = getCanonicalCategorySlug(params.get("categoria") || "") || defaultCatalogCategorySlug();
    if (view === "catalogo") {
        catalogCategoryFilter.value = category;
        filterCatalog();
    } else {
        catalogCategoryFilter.value = defaultCatalogCategorySlug();
        filterCatalog();
    }
    if (window.location.hash) {
        window.setTimeout(() => {
            if (view === "catalogo" && window.location.hash === "#productos") {
                scrollToCatalogProducts("smooth");
                return;
            }
            document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 40);
    }
}

function scrollToCatalogProducts(behavior = "smooth") {
    const scrollToTarget = () => {
        const target = document.querySelector(".catalog-toolbar") || productsGrid || document.getElementById("productos");
        if (!target) return;

        const navOffset = (mainNav?.getBoundingClientRect().height || 0) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top: Math.max(0, top), behavior });
    };

    window.requestAnimationFrame(scrollToTarget);
    window.setTimeout(scrollToTarget, 260);
}

function updateCatalogViewKicker(slug, count) {
    const category = catalog.categories.find((item) => item.slug === slug);
    const visibleCount = Math.min(count, CATALOG_DISPLAY_LIMIT);
    catalogViewKicker.textContent = category
        ? `${category.name} | ${visibleCount} de ${count} productos`
        : `Catálogo destacado | ${visibleCount} productos`;
}

function defaultCatalogCategorySlug() {
    return CATEGORY_FILTER_SLUGS
        .map((slug) => catalog.categories.find((category) => category.slug === slug && category.count > 0))
        .filter(Boolean)
        .sort((a, b) => a.count - b.count)[0]?.slug || "";
}

function getCatalogSlugFromFilterTerm(term) {
    const normalizedTerm = normalize(term);
    return getCanonicalCategorySlug(FILTER_TERM_CATEGORY_SLUGS[normalizedTerm] || term);
}

function getCanonicalCategorySlug(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) return "";

    const normalizedValue = normalize(rawValue);
    const aliasSlug = CATEGORY_ALIASES[normalizedValue];
    if (aliasSlug && categoryExists(aliasSlug)) return aliasSlug;

    const directSlug = catalog.categories.find((category) => category.slug === rawValue);
    if (directSlug) return directSlug.slug;

    const matchingCategory = catalog.categories.find((category) => {
        return normalize(category.slug) === normalizedValue || normalize(category.name) === normalizedValue;
    });
    return matchingCategory?.slug || "";
}

function categoryExists(slug) {
    return catalog.categories.some((category) => category.slug === slug);
}

function openSearch() {
    searchModal.classList.add("active");
    searchInput.value = "";
    searchInput.focus();
    searchSuggestions.style.display = "block";
    searchResults.style.display = "none";
}

function closeSearch() {
    searchModal.classList.remove("active");
}

function handleSearch(query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        searchSuggestions.style.display = "block";
        searchResults.style.display = "none";
        return;
    }

    const matches = productsDatabase.filter((product) => {
        const searchable = [
            product.name,
            ...product.categories.map((category) => category.name),
            ...Object.values(product.options).flat()
        ].join(" ");
        return normalize(searchable).includes(normalizedQuery);
    });

    searchSuggestions.style.display = "none";
    searchResults.style.display = "block";
    searchMatchGrid.innerHTML = "";

    if (matches.length === 0) {
        searchMatchGrid.innerHTML = '<p class="search-empty">No encontramos productos que coincidan con tu búsqueda.</p>';
        return;
    }

    matches.forEach((product) => {
        const item = document.createElement("button");
        item.className = "suggested-item";
        item.type = "button";
        item.innerHTML = `
            <img src="${escapeAttribute(product.img)}" alt="${escapeAttribute(product.name)}" class="suggested-img" width="50" height="50" loading="lazy" decoding="async">
            <div>
                <h5 class="suggested-name">${escapeHtml(product.name)}</h5>
                <p class="suggested-category">L&iacute;nea: ${escapeHtml(primaryCategory(product))}</p>
                <p class="suggested-price">${escapeHtml(priceRange(product))}</p>
            </div>
        `;
        item.addEventListener("click", () => {
            closeSearch();
            showProduct(product.id);
        });
        searchMatchGrid.appendChild(item);
    });
}

function showProduct(productId) {
    catalogCategoryFilter.value = "";
    renderProducts(productsDatabase);
    requestAnimationFrame(() => {
        const card = document.querySelector(`.product-card[data-id="${CSS.escape(productId)}"]`);
        if (!card) return;
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlighted");
        setTimeout(() => card.classList.remove("highlighted"), 2500);
    });
}

function highlightFirstMatch(term) {
    const normalizedTerm = normalize(term);
    const product = productsDatabase.find((item) => {
        return item.categories.some((category) => normalize(category.name).includes(normalizedTerm))
            || normalize(item.name).includes(normalizedTerm);
    });
    if (product) showProduct(product.id);
}

function checkoutOnWhatsApp() {
    if (cart.length === 0) return;
    const lines = cart.map((item) => {
        const details = formatAttributes(item.attributes);
        return `- ${item.name}${details ? ` (${details})` : ""} x${item.quantity}: ${formatCOP(item.price * item.quantity)} COP`;
    });
    openWhatsApp([
        "Hola Fitness Line, quiero finalizar este pedido:",
        ...lines,
        `Subtotal: ${formatCOP(calculateTotal())} COP`
    ].join("\n"));
}

function setupNewsletterForm() {
    const form = document.querySelector(".footer-newsletter-form");
    if (!form) return;
    const emailInput = form.querySelector('input[type="email"]');
    const consentInput = form.querySelector('input[type="checkbox"]');
    const submitButton = form.querySelector("button");
    if (!emailInput || !consentInput || !submitButton) return;

    submitButton.addEventListener("click", () => {
        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            return;
        }
        if (!consentInput.checked) {
            consentInput.focus();
            return;
        }
        const subject = "Suscripcion boletin Fitness Line Pro";
        const body = `Hola Fitness Line Pro, quiero suscribirme al boletin con este correo: ${emailInput.value}`;
        window.location.href = `mailto:fitnesslinefajas@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

function openWhatsApp(text) {
    window.open(`https://wa.me/${OFFICIAL_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function openCart() {
    sideCart.classList.add("active");
    cartOverlay.classList.add("active");
}

function closeCart() {
    sideCart.classList.remove("active");
    cartOverlay.classList.remove("active");
}

function closeMobileNav() {
    navLinks.classList.remove("active");
    navToggle.classList.remove("active");
    closeUnifiedCatalogMenu();
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".animate-on-scroll").forEach((element) => observer.observe(element));
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCart() {
    localStorage.setItem("fitness_line_cart", JSON.stringify(cart));
}

function formatCOP(amount) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(amount);
}

function priceRange(product) {
    if (product.minPrice === product.maxPrice) return `${formatCOP(product.minPrice)} COP`;
    return `${formatCOP(product.minPrice)} - ${formatCOP(product.maxPrice)} COP`;
}

function primaryCategory(product) {
    return product.categories.find((category) => category.slug !== "productos")?.name || product.category;
}

function formatAttributes(attributes = {}) {
    return Object.entries(attributes)
        .map(([key, value]) => `${attributeLabel(key)}: ${optionLabel(value)}`)
        .join(" | ");
}

function attributeLabel(attribute) {
    const labels = { talla: "Talla", color: "Color", copa: "Copa" };
    return labels[attribute] || optionLabel(attribute);
}

function optionLabel(value) {
    return String(value)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalize(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

