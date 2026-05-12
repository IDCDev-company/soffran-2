/**
 * VV Gold Saffron Bio - JavaScript pentru interacțiuni și simulare achiziție
 * 
 * Funcționalități:
 * - Smooth scroll pentru navigare
 * - Animații la scroll
 * - Animație contor pentru statistici
 * - Simulare proces de cumpărare
 * - Validare formulare
 * - Efecte parallax subtile
 * - Sistem de traduceri multi-limbă
 */

// ============================================
// GLOBAL VARIABLES
// ============================================

let selectedWeight = 1;
let selectedPrice = 90;
let currentLanguage = 'ro';
let translations = {};
const LOADER_MIN_TIME = 900;

const ORDER_EMAIL_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

if (document.body) {
    document.body.classList.add('loader-active');
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

function initPremiumLoader() {
    const loader = document.getElementById('premiumLoader');
    if (!loader) return;

    const start = Date.now();
    const hideLoader = () => {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, LOADER_MIN_TIME - elapsed);

        setTimeout(() => {
            loader.classList.add('is-hidden');
            document.body.classList.remove('loader-active');
        }, wait);
    };

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader, { once: true });
    }
}

// ============================================
// NAVIGATION & SMOOTH SCROLL
// ============================================

// ============================================
// TRANSLATION SYSTEM
// ============================================

async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
        translations = await response.json();
        currentLanguage = lang;
        applyTranslations();
        updateLanguageSelector();
        updateMetaTags();
    } catch (error) {
        console.error('Error loading translations:', error);
        if (lang !== 'ro') {
            loadTranslations('ro');
        }
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let translation = getNestedValue(translations, key);
        if (key === 'announcement.text' && typeof translation === 'string') {
            translation = translation.replace(/\s*•\s*/g, '  •  ');
        }
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.value = translation;
                }
            } else if (element.tagName === 'META') {
                element.setAttribute('content', translation);
            } else if (element.tagName === 'TITLE') {
                element.textContent = translation;
            } else {
                element.innerHTML = translation;
            }
        }
    });

    refreshPremiumGalleryAria();
}

/** Etichete aria pentru galeria foto premium (miniaturi, hero, săgeți) */
function refreshPremiumGalleryAria() {
    const galleryRoot = document.getElementById('premiumPhotoGallery');
    if (!galleryRoot) return;

    const thumbs = galleryRoot.querySelectorAll('.premium-gallery-showcase__thumb[data-photo-index]');
    const total = thumbs.length;
    const thumbTmpl =
        translations.gallery?.selectThumbAria ||
        translations.gallery?.openPhotoAria ||
        'Select photo {n} of {total}';
    thumbs.forEach((btn) => {
        const idx = parseInt(btn.getAttribute('data-photo-index'), 10);
        if (Number.isFinite(idx)) {
            btn.setAttribute(
                'aria-label',
                thumbTmpl.replace('{n}', String(idx + 1)).replace('{total}', String(total)),
            );
        }
    });

    const vp = document.getElementById('premiumGalleryThumbsViewport');
    if (vp && translations.gallery?.thumbnailStripLabel) {
        vp.setAttribute('aria-label', translations.gallery.thumbnailStripLabel);
    }

    const expandBtn = document.getElementById('premiumGalleryExpand');
    if (expandBtn && translations.gallery?.expandPhoto) {
        expandBtn.setAttribute('aria-label', translations.gallery.expandPhoto);
    }

    const stripPrev = document.getElementById('premiumGalleryStripPrev');
    const stripNext = document.getElementById('premiumGalleryStripNext');
    if (stripPrev && translations.gallery?.thumbStripPrev) {
        stripPrev.setAttribute('aria-label', translations.gallery.thumbStripPrev);
    }
    if (stripNext && translations.gallery?.thumbStripNext) {
        stripNext.setAttribute('aria-label', translations.gallery.thumbStripNext);
    }

    const hc = galleryRoot.querySelector('.premium-gallery-showcase__hero-card');
    if (hc) {
        hc.setAttribute('tabindex', '0');
        const heroLab =
            translations.gallery?.heroFocusLabel ||
            'Main gallery photo. Use arrow keys to change.';
        hc.setAttribute('aria-label', heroLab);
    }
}

function updateLanguageSelector() {
    const currentLangEl = document.getElementById('currentLanguage');
    if (currentLangEl) {
        currentLangEl.textContent = currentLanguage.toUpperCase();
    }
    
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-lang') === currentLanguage);
    });
}

function updateMetaTags() {
    if (translations.meta) {
        document.querySelector('meta[name="description"]')?.setAttribute('content', translations.meta.description);
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', translations.meta.keywords);
        document.querySelector('title').textContent = translations.meta.title;
    }
    document.documentElement.setAttribute('lang', currentLanguage);
}

function changeLanguage(lang) {
    if (lang === currentLanguage) return;
    loadTranslations(lang);
    localStorage.setItem('preferredLanguage', lang);
}

// ============================================
// LANGUAGE SELECTOR
// ============================================

function initLanguageSelector() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (!languageBtn || !languageDropdown) return;
    
    languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('active');
    });
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
            languageDropdown.classList.remove('active');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initPremiumLoader();

    const savedLanguage = localStorage.getItem('preferredLanguage') || 'ro';
    loadTranslations(savedLanguage);
    initLanguageSelector();
    
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });
        
        // Close menu when clicking on a link or quick-panel button
        const navDismissTargets = navLinks.querySelectorAll(
            '.nav-link, button.nav-quick[data-mobile-bookmark]',
        );
        navDismissTargets.forEach((link) => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Smooth scroll pentru ancorele din meniu (doar link-uri <a>)
    const allNavLinks = document.querySelectorAll('.nav-links a.nav-link');

    allNavLinks.forEach((link) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const targetId = href;
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const announcement = document.querySelector('.announcement-bar');
                const navbar = document.querySelector('.navbar');
                const headerHeight = (announcement ? announcement.offsetHeight : 0) + (navbar ? navbar.offsetHeight : 0);
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Smooth scroll pentru link-urile din footer
    const footerLinks = document.querySelectorAll('.footer-contact a, .contact-details a');
    footerLinks.forEach(link => {
        if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const announcement = document.querySelector('.announcement-bar');
                    const navbar = document.querySelector('.navbar');
                    const headerHeight = (announcement ? announcement.offsetHeight : 0) + (navbar ? navbar.offsetHeight : 0);
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    
    // Intersection Observer pentru animații la scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observă elementele care trebuie animate
    const animateElements = document.querySelectorAll('.about-text, .benefits-grid, .product-showcase, .purchase-form-container, .certificates-content, .contact-content');
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // ============================================
    // STATISTICS COUNTER ANIMATION
    // ============================================
    
    // Animație contor pentru statistici
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statisticsSection = document.querySelector('.statistics');
    if (statisticsSection) {
        statsObserver.observe(statisticsSection);
    }
    
    // Funcție pentru animația contorului
    function animateCounter(element, target) {
        const duration = 2000; // 2 secunde
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString('ro-RO');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('ro-RO');
            }
        };
        
        updateCounter();
    }
    
    // ============================================
    // PRODUCT VARIANT SELECTION
    // ============================================
    
    // Sincronizare formular cu selecția variantelor
    const quantitySelect = document.getElementById('quantity');
    if (quantitySelect) {
        quantitySelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            if (price) {
                updateFormPrice(parseFloat(price));
            }
        });
    }
    
    // ============================================
    // PURCHASE FORM HANDLING
    // ============================================
    
    const purchaseForm = document.getElementById('purchaseForm');
    const successMessage = document.getElementById('successMessage');
    
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validare formular
            if (validateForm()) {
                // Simulare procesare comandă
                processPurchase();
            }
        });
    }
    
    // Validare formular
    function validateForm() {
        const quantity = document.getElementById('quantity').value;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        
        // Validare email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!quantity) {
            showError(translations.purchase?.errorSelectQuantity || 'Vă rugăm să selectați o cantitate.');
            return false;
        }
        
        if (!name || name.length < 2) {
            showError(translations.purchase?.errorValidName || 'Vă rugăm să introduceți un nume valid.');
            return false;
        }
        
        if (!email || !emailRegex.test(email)) {
            showError(translations.purchase?.errorValidEmail || 'Vă rugăm să introduceți o adresă de email validă.');
            return false;
        }
        
        if (!phone || phone.length < 10) {
            showError(translations.purchase?.errorValidPhone || 'Vă rugăm să introduceți un număr de telefon valid.');
            return false;
        }
        
        if (!address || address.length < 10) {
            showError(translations.purchase?.errorValidAddress || 'Vă rugăm să introduceți o adresă completă de livrare.');
            return false;
        }
        
        return true;
    }
    
    // Afișare eroare
    function showError(message) {
        // Creează element de eroare dacă nu există
        let errorElement = document.querySelector('.form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.style.cssText = `
                background-color: #fee;
                color: #c0392b;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 4px;
                font-size: 0.9rem;
                text-align: center;
            `;
            purchaseForm.insertBefore(errorElement, purchaseForm.firstChild);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Ascunde eroarea după 5 secunde
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
        
        // Scroll la eroare
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    function processPurchase() {
        const quantitySelect = document.getElementById('quantity');
        const selectedOption = quantitySelect.options[quantitySelect.selectedIndex];
        const price = selectedOption ? selectedOption.getAttribute('data-price') : '';
        const quantity = document.getElementById('quantity').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        const payload = {
            _subject: `Comandă nouă VV Gold Saffron - ${name}`,
            _replyto: email,
            quantity,
            price: price ? `€${price}` : '',
            name,
            email,
            phone,
            address,
            _timestamp: new Date().toISOString()
        };

        const submitBtn = purchaseForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.querySelector('span')?.textContent : '';
        if (submitBtn) {
            const span = submitBtn.querySelector('span');
            if (span) span.textContent = translations.purchase?.sending || 'Se trimite...';
            submitBtn.disabled = true;
        }

        fetch(ORDER_EMAIL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) throw new Error('Trimitere eșuată');
                purchaseForm.style.display = 'none';
                successMessage.classList.add('show');
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
            .catch(() => {
                showError(translations.purchase?.errorSend || 'Comanda nu a putut fi trimisă. Încercați din nou sau contactați-ne la info@vvgoldsaffron.com.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    const span = submitBtn.querySelector('span');
                    if (span) span.textContent = originalBtnText;
                }
            });
    }
    
    // Reset formular (pentru butonul din mesajul de succes)
    window.resetForm = function() {
        purchaseForm.reset();
        purchaseForm.style.display = 'flex';
        successMessage.classList.remove('show');
        
        // Scroll la formular
        purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    // ============================================
    // PARALLAX EFFECT (subtle)
    // ============================================
    
    // Efect parallax subtil pentru hero section
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');
            
            if (scrolled < window.innerHeight) {
                const parallaxValue = scrolled * 0.5;
                if (heroContent) {
                    heroContent.style.transform = `translateY(${parallaxValue}px)`;
                    heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
                }
            }
        });
    }
    
    // ============================================
    // FORM INPUT ENHANCEMENTS
    // ============================================
    
    // Efecte hover și focus pentru input-uri
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.01)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    
    // Throttle pentru scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimizare scroll events
    const optimizedScrollHandler = throttle(function() {
        // Scroll handling code here
    }, 16); // ~60fps
    
    // ============================================
    // ACCESSIBILITY ENHANCEMENTS
    // ============================================
    
    // Keyboard navigation pentru formular
    purchaseForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const inputs = Array.from(purchaseForm.querySelectorAll('input, select, textarea'));
            const currentIndex = inputs.indexOf(e.target);
            const nextInput = inputs[currentIndex + 1];
            
            if (nextInput) {
                nextInput.focus();
            } else {
                purchaseForm.querySelector('button[type="submit"]').focus();
            }
        }
    });
});

// ============================================
// MOBILE BOOKMARK HANDLER — bară sticky sus + sheet în jos
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const mqMobile = window.matchMedia('(max-width: 768px)');

    const setup = [
        {
            buttonId: 'bookmarkTabMobile',
            panelId: 'mobileAwardsPanel',
            wrapperSelector: '.awards-bookmark-mobile',
            sourceInnerSelector: '#awardsPanel .awards-panel-inner',
            targetInnerId: 'mobileAwardsPanelInner'
        },
        {
            buttonId: 'pressTabMobile',
            panelId: 'mobilePressPanel',
            wrapperSelector: '.press-bookmark-mobile',
            sourceInnerSelector: '#pressPanel .press-panel-inner',
            targetInnerId: 'mobilePressPanelInner'
        },
        {
            buttonId: 'certificatesTabMobile',
            panelId: 'mobileCertificatesPanel',
            wrapperSelector: '.certificates-bookmark-mobile',
            sourceInnerSelector: '#certificatesPanel .certificates-panel-inner',
            targetInnerId: 'mobileCertificatesPanelInner'
        },
    ];

    const keyToSetup = {
        awards: setup[0],
        press: setup[1],
        certificates: setup[2],
    };

    const allPanels = setup
        .map(item => document.getElementById(item.panelId))
        .filter(Boolean);
    const allWrappers = setup
        .map(item => document.querySelector(item.wrapperSelector))
        .filter(Boolean);
    const mobileBookmarksContainer = document.getElementById('mobileBookmarksContainer');
    const rootStyle = document.documentElement.style;

    function syncMobileOverlayOffsets() {
        if (!mqMobile.matches) return;
        const announcement = document.querySelector('.announcement-bar');
        const navbar = document.querySelector('.navbar');

        const announcementHeight = announcement ? announcement.offsetHeight : 0;
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const headerOffset = announcementHeight + navbarHeight;
        const bookmarksHeight = mobileBookmarksContainer ? mobileBookmarksContainer.offsetHeight : 0;
        let overlayTop = headerOffset + bookmarksHeight;

        if (mobileBookmarksContainer) {
            const rect = mobileBookmarksContainer.getBoundingClientRect();
            if (Number.isFinite(rect.bottom) && rect.bottom > 0) {
                overlayTop = Math.max(headerOffset, Math.round(rect.bottom));
            }
        }

        rootStyle.setProperty('--header-offset', `${headerOffset}px`);
        if (bookmarksHeight > 0) {
            rootStyle.setProperty('--mobile-bookmarks-bar-total', `${bookmarksHeight}px`);
        }
        rootStyle.setProperty('--mobile-overlay-top', `${overlayTop}px`);
    }

    function closeAllMobilePanels() {
        allPanels.forEach(panel => panel.classList.remove('open'));
        allWrappers.forEach(wrapper => wrapper.classList.remove('open'));
        document.body.classList.remove('mobile-popup-open');
    }

    function syncPanelContent(item) {
        const sourceInner = document.querySelector(item.sourceInnerSelector);
        const targetInner = document.getElementById(item.targetInnerId);
        if (!sourceInner || !targetInner) return;

        targetInner.innerHTML = '';
        Array.from(sourceInner.children).forEach(child => {
            targetInner.appendChild(child.cloneNode(true));
        });
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    }

    function openPanel(item) {
        if (!mqMobile.matches) return;
        syncMobileOverlayOffsets();
        const panel = document.getElementById(item.panelId);
        const wrapper = document.querySelector(item.wrapperSelector);
        if (!panel || !wrapper) return;

        closeAllMobilePanels();
        syncPanelContent(item);
        panel.classList.add('open');
        wrapper.classList.add('open');
        document.body.classList.add('mobile-popup-open');
    }

    setup.forEach((item) => syncPanelContent(item));
    syncMobileOverlayOffsets();
    window.addEventListener('resize', debounce(syncMobileOverlayOffsets, 80));
    window.addEventListener('load', () => {
        syncMobileOverlayOffsets();
    });

    setup.forEach((item) => {
        const button = document.getElementById(item.buttonId);
        const panel = document.getElementById(item.panelId);
        const wrapper = document.querySelector(item.wrapperSelector);
        if (!button || !panel || !wrapper) return;

        const handleOpen = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const shouldOpen = !panel.classList.contains('open');
            if (shouldOpen) {
                openPanel(item);
            } else {
                closeAllMobilePanels();
            }
        };

        button.addEventListener('click', handleOpen);

        panel.addEventListener('click', function(e) {
            if (e.target.closest('.awards-close, .press-close, .certificates-close')) {
                e.preventDefault();
                closeAllMobilePanels();
                return;
            }

            if (e.target === panel) {
                closeAllMobilePanels();
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!mqMobile.matches) return;
        if (e.target.closest('[data-mobile-bookmark], .mobile-bookmarks-container')) return;
        const clickedInsideControls = setup.some((item) => {
            const wrapper = document.querySelector(item.wrapperSelector);
            const panel = document.getElementById(item.panelId);
            return (wrapper && wrapper.contains(e.target)) || (panel && panel.contains(e.target));
        });
        if (!clickedInsideControls) {
            closeAllMobilePanels();
        }
    });

    window.__mobileBookmarkPanels = {
        openByKey(key) {
            const item = keyToSetup[key];
            if (item) openPanel(item);
        },
        closeAll: closeAllMobilePanels,
    };

    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('[data-mobile-bookmark]');
        if (!trigger || !mqMobile.matches) return;

        const key = trigger.getAttribute('data-mobile-bookmark');
        const item = keyToSetup[key];
        if (!item) return;

        e.preventDefault();
        e.stopPropagation();
        window.__mobileBookmarkPanels.openByKey(key);
    });

    mqMobile.addEventListener('change', () => {
        if (!mqMobile.matches) {
            closeAllMobilePanels();
            return;
        }
        syncMobileOverlayOffsets();
    });

    window.__mobilePanelsInitialized = true;
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function pentru optimizare performanță
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Formatare preț pentru afișare
 */
function formatPrice(amount) {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

/**
 * Selectare variantă produs
 */
function selectVariant(weight, price) {
    selectedWeight = weight;
    selectedPrice = price;
    
    const selectedWeightEl = document.getElementById('selectedWeight');
    const selectedPriceEl = document.getElementById('selectedPrice');
    
    if (selectedWeightEl) {
        selectedWeightEl.textContent = weight === 0.5 ? '0.50g' : weight + 'g';
    }
    if (selectedPriceEl) {
        selectedPriceEl.textContent = '€' + price;
    }
    
    applyTranslations();
    
    // Actualizează cardurile variantelor
    const variantCards = document.querySelectorAll('.variant-card');
    variantCards.forEach(card => {
        const cardWeight = parseFloat(card.getAttribute('data-weight'));
        if (cardWeight === weight) {
            card.classList.add('variant-selected');
        } else {
            card.classList.remove('variant-selected');
        }
    });
    
    // Actualizează formularul
    const quantitySelect = document.getElementById('quantity');
    if (quantitySelect) {
        const weightStr = weight + 'g';
        for (let i = 0; i < quantitySelect.options.length; i++) {
            if (quantitySelect.options[i].value === weightStr) {
                quantitySelect.selectedIndex = i;
                break;
            }
        }
        updateFormPrice(price);
    }
}

/**
 * Scroll la secțiunea de achiziție
 */
function scrollToPurchase() {
    const purchaseSection = document.querySelector('#achizitie');
    if (purchaseSection) {
        const announcement = document.querySelector('.announcement-bar');
        const navbar = document.querySelector('.navbar');
        const headerHeight = (announcement ? announcement.offsetHeight : 0) + (navbar ? navbar.offsetHeight : 0);
        const targetPosition = purchaseSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Focus pe primul input după scroll
        setTimeout(() => {
            const firstInput = purchaseSection.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 800);
    }
}

/**
 * Actualizează prețul în formular
 */
function updateFormPrice(price) {
    const formPriceDisplay = document.getElementById('formPriceDisplay');
    if (formPriceDisplay) {
        formPriceDisplay.textContent = '€' + price;
    }
}

// ============================================
// PHOTO GALLERY — HERO + BANDĂ MINIATURI + LIGHTBOX
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const showcaseRoot = document.getElementById('premiumPhotoGallery');
    const grid = document.getElementById('premiumGalleryGrid');
    const thumbsTrack = document.getElementById('premiumGalleryThumbsTrack');
    const thumbsViewport = document.getElementById('premiumGalleryThumbsViewport');
    const filterButtons = Array.from(document.querySelectorAll('.premium-gallery-showcase__filter[data-gallery-filter]'));
    const heroImg = document.getElementById('premiumGalleryHeroImg');
    const heroCard = document.querySelector('.premium-gallery-showcase__hero-card');
    const expandBtn = document.getElementById('premiumGalleryExpand');
    const stripPrev = document.getElementById('premiumGalleryStripPrev');
    const stripNext = document.getElementById('premiumGalleryStripNext');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    if (!showcaseRoot || !grid || !thumbsTrack || !heroImg || !lightbox || !lightboxImage) return;

    const bootstrapImgs = Array.from(grid.querySelectorAll(':scope > img'));
    if (bootstrapImgs.length === 0) return;

    const allImages = bootstrapImgs.map((img) => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        category: img.getAttribute('data-category') || 'all',
    }));

    bootstrapImgs.forEach((img) => img.remove());
    grid.remove();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /** @type {HTMLButtonElement[]} */
    let thumbButtons = [];

    thumbsViewport?.setAttribute('role', 'listbox');

    let activeCategory = 'all';
    let images = allImages.slice();
    let currentIndex = 0;
    let lightboxIndex = 0;
    let lightboxLaunchFocus = null;

    function renderThumbs() {
        thumbsTrack.innerHTML = '';
        thumbButtons = [];

        images.forEach((item, idx) => {
            const thumb = document.createElement('button');
            thumb.type = 'button';
            thumb.className = 'premium-gallery-showcase__thumb';
            thumb.dataset.photoIndex = String(idx);
            thumb.setAttribute('role', 'option');
            thumb.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

            const im = document.createElement('img');
            im.src = item.src;
            im.alt = item.alt || '';
            im.loading = idx < 12 ? 'eager' : 'lazy';
            im.decoding = 'async';

            thumb.appendChild(im);
            thumbsTrack.appendChild(thumb);
            thumbButtons.push(thumb);

            thumb.addEventListener('click', () => setGalleryIndex(idx));
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setGalleryIndex(idx);
                }
            });
        });

        refreshPremiumGalleryAria();
    }

    function scrollBehavior() {
        return prefersReducedMotion ? 'auto' : 'smooth';
    }

    function scrollThumbRow(delta) {
        if (!thumbsViewport) return;
        const amt = thumbsViewport.clientWidth * 0.82;
        thumbsViewport.scrollBy({ left: delta * amt, behavior: scrollBehavior() });
    }

    function scrollActiveThumbIntoView() {
        const tb = thumbButtons[currentIndex];
        if (!tb) return;
        tb.scrollIntoView({ inline: 'center', block: 'nearest', behavior: scrollBehavior() });
    }

    function syncHero() {
        const item = images[currentIndex];
        if (!item || !heroImg) return;
        heroImg.src = item.src;
        heroImg.alt = item.alt || '';
    }

    function setGalleryIndex(idx) {
        const n = images.length;
        if (n === 0) return;
        currentIndex = (idx % n + n) % n;
        syncHero();
        thumbButtons.forEach((b, i) => {
            const on = i === currentIndex;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        scrollActiveThumbIntoView();
    }

    function setCategory(category) {
        activeCategory = category;
        images =
            activeCategory === 'all'
                ? allImages.slice()
                : allImages.filter((item) => item.category === activeCategory);

        filterButtons.forEach((btn) => {
            const on = btn.dataset.galleryFilter === activeCategory;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        if (images.length === 0) {
            heroImg.removeAttribute('src');
            heroImg.alt = 'Nu există imagini în această categorie';
            thumbsTrack.innerHTML = '';
            thumbButtons = [];
            return;
        }

        renderThumbs();
        setGalleryIndex(0);
    }

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const selectedCategory = btn.dataset.galleryFilter || 'all';
            if (selectedCategory === activeCategory) return;
            setCategory(selectedCategory);
        });
    });

    setCategory('all');

    if (expandBtn) {
        expandBtn.setAttribute('aria-haspopup', 'dialog');
        expandBtn.addEventListener('click', () => openLightbox(currentIndex));
        expandBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(currentIndex);
            }
        });
    }

    stripPrev?.addEventListener('click', () => scrollThumbRow(-1));
    stripNext?.addEventListener('click', () => scrollThumbRow(1));

    if (heroCard) {
        heroCard.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setGalleryIndex(currentIndex + 1);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setGalleryIndex(currentIndex - 1);
            }
            if ((e.key === 'Enter' || e.key === ' ') && !(e.target && e.target.closest('button'))) {
                e.preventDefault();
                openLightbox(currentIndex);
            }
        });

        let hStart = 0;
        heroCard.addEventListener(
            'touchstart',
            (e) => {
                if (e.target && e.target.closest('button')) return;
                hStart = e.changedTouches[0].screenX;
            },
            { passive: true },
        );
        heroCard.addEventListener(
            'touchend',
            (e) => {
                if (e.target && e.target.closest('button')) return;
                const dx = e.changedTouches[0].screenX - hStart;
                if (Math.abs(dx) < 40) return;
                if (dx < 0) setGalleryIndex(currentIndex + 1);
                else setGalleryIndex(currentIndex - 1);
            },
            { passive: true },
        );
    }

    if (thumbsViewport) {
        thumbsViewport.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            if (e.key === 'ArrowRight') setGalleryIndex(currentIndex + 1);
            else setGalleryIndex(currentIndex - 1);
        });
    }

    function updateLightboxImage() {
        const item = images[lightboxIndex];
        if (!item) return;
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt || '';
    }

    function openLightbox(index) {
        lightboxIndex = index;
        if (images.length === 0 || lightboxIndex < 0 || lightboxIndex >= images.length) return;
        setGalleryIndex(lightboxIndex);
        lightboxLaunchFocus = document.activeElement;
        updateLightboxImage();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-modal', 'true');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            lightbox.style.opacity = '1';
            lightboxClose?.focus();
        }, 10);
    }

    function closeLightbox() {
        lightbox.style.opacity = '0';
        lightbox.setAttribute('aria-modal', 'false');
        const returnFocusEl =
            lightboxLaunchFocus && typeof lightboxLaunchFocus.focus === 'function'
                ? lightboxLaunchFocus
                : expandBtn || thumbButtons[lightboxIndex];
        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setGalleryIndex(lightboxIndex);
            returnFocusEl?.focus?.({ preventScroll: true });
            lightboxLaunchFocus = null;
        }, 300);
    }

    function nextLightboxImage() {
        if (images.length === 0) return;
        lightboxIndex = (lightboxIndex + 1) % images.length;
        updateLightboxImage();
    }

    function prevLightboxImage() {
        if (images.length === 0) return;
        lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    let touchLX = 0;
    lightbox.addEventListener(
        'touchstart',
        (e) => {
            if (!lightbox.classList.contains('active')) return;
            touchLX = e.changedTouches[0].screenX;
        },
        { passive: true },
    );
    lightbox.addEventListener(
        'touchend',
        (e) => {
            if (!lightbox.classList.contains('active')) return;
            const dx = e.changedTouches[0].screenX - touchLX;
            if (Math.abs(dx) < 56) return;
            if (dx < 0) nextLightboxImage();
            else prevLightboxImage();
        },
        { passive: true },
    );

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextLightboxImage();
        });
    }
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevLightboxImage();
        });
    }
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextLightboxImage();
                break;
            case 'ArrowLeft':
                prevLightboxImage();
                break;
            default:
                break;
        }
    });
});

// ============================================
// VIDEO SLIDER FUNCTIONALITY
// ============================================

// ============================================
// GALLERY SECTION - GSAP Carousel
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verifică dacă GSAP este disponibil
    if (typeof gsap === 'undefined') {
        console.error('GSAP nu este încărcat');
        return;
    }
    
    const cards = gsap.utils.toArray('.cards li');
    if (cards.length === 0) return;
    
    // Dimensiuni și spacing
    const cardWidth = 300;
    const gap = 20;
    const scaledCardWidth = cardWidth * 0.8; // Cardurile inactive au scale 0.8
    const totalSpacing = scaledCardWidth + gap; // 240 + 20 = 260px
    
    // Obține toate video-urile
    const videos = gsap.utils.toArray('.cards video');
    
    // Indexul cardului activ (centru)
    let currentIndex = Math.floor(cards.length / 2);
    
    // Inițializează video-urile
    videos.forEach((video) => {
        video.muted = true;
        video.currentTime = 0;
        video.pause();
        
        const card = video.closest('li');
        const playPauseBtn = card.querySelector('.play-pause');
        const muteUnmuteBtn = card.querySelector('.mute-unmute');
        const playIcon = card.querySelector('.play-icon');
        const pauseIcon = card.querySelector('.pause-icon');
        const muteIcon = card.querySelector('.mute-icon');
        const unmuteIcon = card.querySelector('.unmute-icon');
        
        // Event listener pentru play/pause
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                } else {
                    video.pause();
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                }
            });
        }
        
        // Event listener pentru mute/unmute
        if (muteUnmuteBtn) {
            muteUnmuteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                if (video.muted) {
                    if (muteIcon) muteIcon.style.display = 'block';
                    if (unmuteIcon) unmuteIcon.style.display = 'none';
                } else {
                    if (muteIcon) muteIcon.style.display = 'none';
                    if (unmuteIcon) unmuteIcon.style.display = 'block';
                }
            });
        }
        
        // Actualizează iconițele la schimbări de stare
        video.addEventListener('play', () => {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        });
        
        video.addEventListener('pause', () => {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        });
        
        // Setează iconițele inițiale
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (muteIcon) muteIcon.style.display = 'block';
        if (unmuteIcon) unmuteIcon.style.display = 'none';
    });
    
    // Poziționează cardurile inițial
    function positionCards() {
        cards.forEach((card, index) => {
            const relativePosition = index - currentIndex;
            const xPosition = relativePosition * totalSpacing;
            
            // Setează poziția inițială folosind x (pixeli) în loc de xPercent
            gsap.set(card, {
                x: xPosition,
                scale: index === currentIndex ? 1 : 0.8,
                opacity: index === currentIndex ? 1 : 0.5,
                zIndex: index === currentIndex ? 100 : 1
            });
        });
    }
    
    // Actualizează starea cardurilor (scale, opacity) bazat pe poziție
    function updateCardStates() {
        cards.forEach((card, index) => {
            const relativePosition = index - currentIndex;
            const absPosition = Math.abs(relativePosition);
            
            let scale, opacity, zIndex;
            
            if (absPosition === 0) {
                // Main player (centru)
                scale = 1;
                opacity = 1;
                zIndex = 100;
            } else if (absPosition === 1) {
                // Carduri complet vizibile (stânga/dreapta)
                scale = 0.8;
                opacity = 0.5;
                zIndex = 1;
            } else {
                // Carduri parțial vizibile (stânga/dreapta extremă)
                scale = 0.8;
                opacity = 0.5;
                zIndex = 1;
            }
            
            gsap.to(card, {
                scale: scale,
                opacity: opacity,
                zIndex: zIndex,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }
    
    // Actualizează video-urile
    function updateVideos() {
        videos.forEach((video) => {
            const card = video.closest('li');
            const cardIndex = cards.indexOf(card);
            const playIcon = card.querySelector('.play-icon');
            const pauseIcon = card.querySelector('.pause-icon');
            
            if (cardIndex === currentIndex) {
                // Video-ul activ - pornește automat
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.log('Autoplay prevented:', e);
                    });
                }
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            } else {
                // Video-urile inactive - oprește
                video.pause();
                video.currentTime = 0;
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        });
    }
    
    // Mută caruselul
    function moveCarousel(direction) {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % cards.length;
        } else {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        }
        
        // Animează cardurile la noile poziții
        cards.forEach((card, index) => {
            const relativePosition = index - currentIndex;
            const xPosition = relativePosition * totalSpacing;
            
            gsap.to(card, {
                x: xPosition,
                duration: 0.5,
                ease: "power3.out"
            });
        });
        
        // Actualizează stările și video-urile
        updateCardStates();
        updateVideos();
    }
    
    // Event listeners pentru butoane
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    
    if (nextBtn) {
        nextBtn.addEventListener("click", () => moveCarousel('next'));
    }
    
    if (prevBtn) {
        prevBtn.addEventListener("click", () => moveCarousel('prev'));
    }
    
    // Inițializează caruselul
    positionCards();
    updateCardStates();
    updateVideos();
});

// ============================================
// AWARDS BOOKMARK FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const awardsBookmark = document.getElementById('awardsBookmark');
    const bookmarkTab = document.getElementById('bookmarkTab');
    const awardsPanel = document.getElementById('awardsPanel');
    const awardsClose = document.getElementById('awardsClose');
    const awardLightbox = document.getElementById('awardLightbox');
    const awardLightboxClose = document.getElementById('awardLightboxClose');
    const awardLightboxImage = document.getElementById('awardLightboxImage');
    const pressBookmark = document.getElementById('pressBookmark');
    const certificatesBookmark = document.getElementById('certificatesBookmark');
    
    // Global functions for closing panels (accessible across all bookmarks)
    function closePressPanel() {
        if (!pressBookmark) return;
        pressBookmark.classList.remove('open');
        setTimeout(function() {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
        }, 500);
    }
    
    function closeCertificatesPanel() {
        if (!certificatesBookmark) return;
        certificatesBookmark.classList.remove('open');
        setTimeout(function() {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
        }, 500);
    }
    
    if (!awardsBookmark || !bookmarkTab) return;
    
    // Toggle panel - Support for both click and touch
    function handleBookmarkToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        if (awardsBookmark.classList.contains('open')) {
            closeAwardsPanel();
        } else {
            // Close other panels if open
            if (pressBookmark && pressBookmark.classList.contains('open')) {
                closePressPanel();
            }
            if (certificatesBookmark && certificatesBookmark.classList.contains('open')) {
                closeCertificatesPanel();
            }
            openAwardsPanel();
        }
    }
    
    bookmarkTab.addEventListener('click', handleBookmarkToggle);
    
    // Mobile bookmark button
    const bookmarkTabMobile = document.getElementById('bookmarkTabMobile');
    const mobileAwardsPanel = document.getElementById('mobileAwardsPanel');
    const mobileAwardsPanelInner = document.getElementById('mobileAwardsPanelInner');
    const awardsBookmarkMobile = bookmarkTabMobile ? bookmarkTabMobile.closest('.awards-bookmark-mobile') : null;
    
    if (bookmarkTabMobile && awardsBookmarkMobile && !window.__mobilePanelsInitialized) {
        // Copy content from desktop panel to mobile panel
        function copyAwardsContent() {
            if (awardsPanel && mobileAwardsPanelInner) {
                const awardsPanelInner = awardsPanel.querySelector('.awards-panel-inner');
                if (awardsPanelInner) {
                    mobileAwardsPanelInner.innerHTML = awardsPanelInner.innerHTML;
                    // Re-apply translations after copying
                    if (typeof applyTranslations === 'function') {
                        applyTranslations();
                    }
                }
            }
        }
        
        // Copy content initially
        copyAwardsContent();
        
        function handleMobileAwardsToggle(e) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = mobileAwardsPanel.classList.contains('open');
            
            // Close all mobile panels
            document.querySelectorAll('.awards-bookmark-mobile, .press-bookmark-mobile, .certificates-bookmark-mobile').forEach(el => {
                el.classList.remove('open');
            });
            document.querySelectorAll('.mobile-panel').forEach(panel => panel.classList.remove('open'));
            
            if (!isOpen) {
                // Copy content before opening (in case it changed)
                copyAwardsContent();
                awardsBookmarkMobile.classList.add('open');
                mobileAwardsPanel.classList.add('open');
            }
        }
        
        bookmarkTabMobile.addEventListener('click', handleMobileAwardsToggle);
        bookmarkTabMobile.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleMobileAwardsToggle(e);
        }, { passive: false });
        
        // Handle close button in mobile panel using event delegation
        if (mobileAwardsPanel) {
            mobileAwardsPanel.addEventListener('click', function(e) {
                e.stopPropagation();
                // Check if close button was clicked
                if (e.target.closest('.awards-close')) {
                    e.preventDefault();
                    awardsBookmarkMobile.classList.remove('open');
                    mobileAwardsPanel.classList.remove('open');
                }
            });
        }
        
        // Close on click outside
        document.addEventListener('click', function(e) {
            if (awardsBookmarkMobile.classList.contains('open')) {
                if (!awardsBookmarkMobile.contains(e.target) && !mobileAwardsPanel.contains(e.target)) {
                    awardsBookmarkMobile.classList.remove('open');
                    mobileAwardsPanel.classList.remove('open');
                }
            }
        });
    }
    
    // Close panel - Support for both click and touch
    if (awardsClose) {
        function handleClose(e) {
            e.preventDefault();
            e.stopPropagation();
            closeAwardsPanel();
        }
        awardsClose.addEventListener('click', handleClose);
    }
    
    // Close on click outside
    document.addEventListener('click', function(e) {
        if (awardsBookmark.classList.contains('open')) {
            if (!awardsBookmark.contains(e.target) && !awardLightbox.contains(e.target) && (!pressBookmark || !pressBookmark.contains(e.target)) && (!certificatesBookmark || !certificatesBookmark.contains(e.target))) {
                closeAwardsPanel();
            }
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (awardLightbox.classList.contains('active')) {
                closeAwardLightbox();
            } else if (awardsBookmark.classList.contains('open')) {
                closeAwardsPanel();
            }
        }
    });
    
    // Store scroll position
    let scrollPosition = 0;
    
    function openAwardsPanel() {
        // Save current scroll position
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        awardsBookmark.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Prevent body scroll and maintain scroll position
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = '100%';
    }
    
    function closeAwardsPanel() {
        // Remove open class to trigger closing animation
        awardsBookmark.classList.remove('open');
        // Wait for animation to complete before resetting body styles
        setTimeout(function() {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
        }, 500);
    }
    
    // Award Lightbox
    window.openAwardLightbox = function(imageSrc, imageAlt) {
        if (awardLightboxImage) {
            awardLightboxImage.src = imageSrc;
            awardLightboxImage.alt = imageAlt || 'Trofee';
        }
        awardLightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    function closeAwardLightbox() {
        awardLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (awardLightboxClose) {
        awardLightboxClose.addEventListener('click', closeAwardLightbox);
    }
    
    if (awardLightbox) {
        awardLightbox.addEventListener('click', function(e) {
            if (e.target === awardLightbox) {
                closeAwardLightbox();
            }
        });
    }
    
    // Prevent panel from closing when clicking inside
    if (awardsPanel) {
        awardsPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // ============================================
    // PRESS BOOKMARK FUNCTIONALITY
    // ============================================
    
    const pressTab = document.getElementById('pressTab');
    const pressPanel = document.getElementById('pressPanel');
    const pressClose = document.getElementById('pressClose');
    
    if (!pressBookmark || !pressTab) {
        // Continue to certificates if press bookmark doesn't exist
    } else {
        // Toggle panel - Support for both click and touch
        function handlePressToggle(e) {
            e.preventDefault();
            e.stopPropagation();
            if (pressBookmark.classList.contains('open')) {
                closePressPanel();
            } else {
                // Close other panels if open
                if (awardsBookmark && awardsBookmark.classList.contains('open')) {
                    closeAwardsPanel();
                }
                if (certificatesBookmark && certificatesBookmark.classList.contains('open')) {
                    closeCertificatesPanel();
                }
                openPressPanel();
            }
        }
    
        pressTab.addEventListener('click', handlePressToggle);
        
        // Mobile press button
        const pressTabMobile = document.getElementById('pressTabMobile');
        const mobilePressPanel = document.getElementById('mobilePressPanel');
        const mobilePressPanelInner = document.getElementById('mobilePressPanelInner');
        const pressBookmarkMobile = pressTabMobile ? pressTabMobile.closest('.press-bookmark-mobile') : null;
        
        if (pressTabMobile && pressBookmarkMobile && !window.__mobilePanelsInitialized) {
            // Copy content from desktop panel to mobile panel
            function copyPressContent() {
                if (pressPanel && mobilePressPanelInner) {
                    const pressPanelInner = pressPanel.querySelector('.press-panel-inner');
                    if (pressPanelInner) {
                        mobilePressPanelInner.innerHTML = pressPanelInner.innerHTML;
                        // Re-apply translations after copying
                        if (typeof applyTranslations === 'function') {
                            applyTranslations();
                        }
                    }
                }
            }
            
            // Copy content initially
            copyPressContent();
            
            function handleMobilePressToggle(e) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = mobilePressPanel.classList.contains('open');
                
                // Close all mobile panels
                document.querySelectorAll('.awards-bookmark-mobile, .press-bookmark-mobile, .certificates-bookmark-mobile').forEach(el => {
                    el.classList.remove('open');
                });
                document.querySelectorAll('.mobile-panel').forEach(panel => panel.classList.remove('open'));
                
                if (!isOpen) {
                    // Copy content before opening (in case it changed)
                    copyPressContent();
                    pressBookmarkMobile.classList.add('open');
                    mobilePressPanel.classList.add('open');
                }
            }
            
            pressTabMobile.addEventListener('click', handleMobilePressToggle);
            pressTabMobile.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleMobilePressToggle(e);
            }, { passive: false });
            
            // Handle close button in mobile panel using event delegation
            if (mobilePressPanel) {
                mobilePressPanel.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Check if close button was clicked
                    if (e.target.closest('.press-close')) {
                        e.preventDefault();
                        pressBookmarkMobile.classList.remove('open');
                        mobilePressPanel.classList.remove('open');
                    }
                });
            }
            
            // Close on click outside
            document.addEventListener('click', function(e) {
                if (pressBookmarkMobile.classList.contains('open')) {
                    if (!pressBookmarkMobile.contains(e.target) && !mobilePressPanel.contains(e.target)) {
                        pressBookmarkMobile.classList.remove('open');
                        mobilePressPanel.classList.remove('open');
                    }
                }
            });
        }
        
        // Close panel - Support for both click and touch
        if (pressClose) {
            function handlePressClose(e) {
                e.preventDefault();
                e.stopPropagation();
                closePressPanel();
            }
            pressClose.addEventListener('click', handlePressClose);
        }
        
        // Close on click outside
        document.addEventListener('click', function(e) {
            if (pressBookmark.classList.contains('open')) {
                if (!pressBookmark.contains(e.target) && !awardLightbox.contains(e.target)) {
                    closePressPanel();
                }
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (pressBookmark.classList.contains('open')) {
                    closePressPanel();
                }
            }
        });
        
        function openPressPanel() {
            // Save current scroll position
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            pressBookmark.classList.add('open');
            document.body.style.overflow = 'hidden';
            // Prevent body scroll and maintain scroll position
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.width = '100%';
        }
        
        
        // Prevent panel from closing when clicking inside
        if (pressPanel) {
            pressPanel.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // ============================================
    // CERTIFICATES BOOKMARK FUNCTIONALITY
    // ============================================
    
    const certificatesTab = document.getElementById('certificatesTab');
    const certificatesPanel = document.getElementById('certificatesPanel');
    const certificatesClose = document.getElementById('certificatesClose');
    
    if (!certificatesBookmark || !certificatesTab) return;
    
    // Toggle panel - Support for both click and touch
    function handleCertificatesToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        if (certificatesBookmark.classList.contains('open')) {
            closeCertificatesPanel();
        } else {
            // Close other panels if open
            if (awardsBookmark && awardsBookmark.classList.contains('open')) {
                closeAwardsPanel();
            }
            if (pressBookmark && pressBookmark.classList.contains('open')) {
                closePressPanel();
            }
            openCertificatesPanel();
        }
    }
    
    certificatesTab.addEventListener('click', handleCertificatesToggle);
    
    // Mobile certificates button
    const certificatesTabMobile = document.getElementById('certificatesTabMobile');
    const mobileCertificatesPanel = document.getElementById('mobileCertificatesPanel');
    const mobileCertificatesPanelInner = document.getElementById('mobileCertificatesPanelInner');
    const certificatesBookmarkMobile = certificatesTabMobile ? certificatesTabMobile.closest('.certificates-bookmark-mobile') : null;
    
    if (certificatesTabMobile && certificatesBookmarkMobile && !window.__mobilePanelsInitialized) {
        // Copy content from desktop panel to mobile panel
        function copyCertificatesContent() {
            if (certificatesPanel && mobileCertificatesPanelInner) {
                const certificatesPanelInner = certificatesPanel.querySelector('.certificates-panel-inner');
                if (certificatesPanelInner && certificatesPanelInner.innerHTML.trim()) {
                    mobileCertificatesPanelInner.innerHTML = certificatesPanelInner.innerHTML;
                    // Re-apply translations after copying
                    if (typeof applyTranslations === 'function') {
                        setTimeout(function() {
                            applyTranslations();
                        }, 10);
                    }
                } else {
                    // Retry if content is not ready yet
                    setTimeout(copyCertificatesContent, 200);
                }
            }
        }
        
        // Copy content initially - with delay to ensure DOM is ready
        setTimeout(copyCertificatesContent, 100);
        
        function handleMobileCertificatesToggle(e) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = mobileCertificatesPanel.classList.contains('open');
            
            // Close all mobile panels
            document.querySelectorAll('.awards-bookmark-mobile, .press-bookmark-mobile, .certificates-bookmark-mobile').forEach(el => {
                el.classList.remove('open');
            });
            document.querySelectorAll('.mobile-panel').forEach(panel => panel.classList.remove('open'));
            
            if (!isOpen) {
                // Copy content before opening (in case it changed)
                copyCertificatesContent();
                certificatesBookmarkMobile.classList.add('open');
                mobileCertificatesPanel.classList.add('open');
            }
        }
        
        certificatesTabMobile.addEventListener('click', handleMobileCertificatesToggle);
        certificatesTabMobile.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleMobileCertificatesToggle(e);
        }, { passive: false });
        
        // Handle close button in mobile panel using event delegation
        if (mobileCertificatesPanel) {
            mobileCertificatesPanel.addEventListener('click', function(e) {
                e.stopPropagation();
                // Check if close button was clicked
                if (e.target.closest('.certificates-close')) {
                    e.preventDefault();
                    certificatesBookmarkMobile.classList.remove('open');
                    mobileCertificatesPanel.classList.remove('open');
                }
            });
        }
        
        // Close on click outside
        document.addEventListener('click', function(e) {
            if (certificatesBookmarkMobile.classList.contains('open')) {
                if (!certificatesBookmarkMobile.contains(e.target) && !mobileCertificatesPanel.contains(e.target)) {
                    certificatesBookmarkMobile.classList.remove('open');
                    mobileCertificatesPanel.classList.remove('open');
                }
            }
        });
    }
    
    // Close panel - Support for both click and touch
    if (certificatesClose) {
        function handleCertificatesClose(e) {
            e.preventDefault();
            e.stopPropagation();
            closeCertificatesPanel();
        }
        certificatesClose.addEventListener('click', handleCertificatesClose);
    }
    
    // Close on click outside
    document.addEventListener('click', function(e) {
        if (certificatesBookmark.classList.contains('open')) {
            if (!certificatesBookmark.contains(e.target) && !awardLightbox.contains(e.target) && (!pressBookmark || !pressBookmark.contains(e.target))) {
                closeCertificatesPanel();
            }
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (certificatesBookmark.classList.contains('open')) {
                closeCertificatesPanel();
            }

        }
    });
    
    function openCertificatesPanel() {
        // Save current scroll position
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        certificatesBookmark.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Prevent body scroll and maintain scroll position
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = '100%';
    }
    
    
    // Prevent panel from closing when clicking inside
    if (certificatesPanel) {
        certificatesPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// Export pentru utilizare în alte module (dacă este necesar)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPrice,
        debounce,
        selectVariant,
        scrollToPurchase,
        updateFormPrice
    };
}

