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
 */

// ============================================
// GLOBAL VARIABLES
// ============================================

let selectedWeight = 1; // Default: 1g
let selectedPrice = 120; // Default: €120

// ============================================
// NAVIGATION & SMOOTH SCROLL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });
        
        // Close menu when clicking on a link
        const navLinkItems = navLinks.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
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
    
    // Smooth scroll pentru link-urile de navigare
    const allNavLinks = document.querySelectorAll('.nav-link');
    
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
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
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
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
            showError('Vă rugăm să selectați o cantitate.');
            return false;
        }
        
        if (!name || name.length < 2) {
            showError('Vă rugăm să introduceți un nume valid.');
            return false;
        }
        
        if (!email || !emailRegex.test(email)) {
            showError('Vă rugăm să introduceți o adresă de email validă.');
            return false;
        }
        
        if (!phone || phone.length < 10) {
            showError('Vă rugăm să introduceți un număr de telefon valid.');
            return false;
        }
        
        if (!address || address.length < 10) {
            showError('Vă rugăm să introduceți o adresă completă de livrare.');
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
    
    // Procesare comandă (simulare)
    function processPurchase() {
        // Ascunde formularul
        purchaseForm.style.display = 'none';
        
        // Afișează mesajul de succes cu animație
        setTimeout(() => {
            successMessage.classList.add('show');
            
            // Scroll la mesajul de succes
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Salvează datele comenzii în localStorage (simulare)
            const orderData = {
                quantity: document.getElementById('quantity').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                timestamp: new Date().toISOString()
            };
            
            // Simulare salvare comandă
            console.log('Comandă procesată:', orderData);
            
            // În producție, aici s-ar face un request către server
            // fetch('/api/orders', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(orderData)
            // });
            
        }, 300);
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
    
    // Actualizează afișarea în secțiunea produs
    const selectedWeightEl = document.getElementById('selectedWeight');
    const selectedPriceEl = document.getElementById('selectedPrice');
    
    if (selectedWeightEl) {
        selectedWeightEl.textContent = weight + 'g';
    }
    if (selectedPriceEl) {
        selectedPriceEl.textContent = '€' + price;
    }
    
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
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = purchaseSection.offsetTop - navHeight;
        
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
// PHOTO GALLERY SLIDER FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const mainPhoto = document.getElementById('mainPhoto');
    const thumbnails = document.querySelectorAll('.photo-thumbnail');
    const prevBtn = document.querySelector('.photo-nav-prev');
    const nextBtn = document.querySelector('.photo-nav-next');
    const thumbnailsContainer = document.querySelector('.photo-thumbnails-container');
    const fullscreenBtn = document.querySelector('.photo-fullscreen-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    if (!mainPhoto || thumbnails.length === 0) return;
    
    // Array cu toate imaginile
    const images = [
        { src: 'img/IMG_8720.jpg', alt: 'Șofran Premium Bio VV Gold Saffron - Produs Principal' },
        { src: 'img/saffron-p.webp', alt: 'Șofran Premium Bio - Calitate Superioară' },
        { src: 'img/saffron-p-removebg-preview.png', alt: 'Șofran Premium Bio Certificat European' },
        { src: 'img/IMG_8720.jpg', alt: 'Șofran Premium Bio - Cules Manual' },
        { src: 'img/saffron-p.webp', alt: 'Șofran Premium Bio - Aromă Intensă' },
        { src: 'img/saffron-p-removebg-preview.png', alt: 'Șofran Premium Bio - Direct de la Fermă' },
        { src: 'img/IMG_8720.jpg', alt: 'Șofran Premium Bio - Procesare Naturală' },
        { src: 'img/saffron-p.webp', alt: 'Șofran Premium Bio - Culoare Vibrantă' },
        { src: 'img/saffron-p-removebg-preview.png', alt: 'Șofran Premium Bio - Calitate Premium' },
        { src: 'img/IMG_8720.jpg', alt: 'Șofran Premium Bio - Tradiție și Calitate' }
    ];
    
    let currentIndex = 0;
    const visibleThumbnails = 5; // Numărul de thumbnails vizibile
    let scrollPosition = 0;
    
    // Actualizează imaginea principală
    function updateMainImage(index) {
        if (index < 0 || index >= images.length) return;
        
        currentIndex = index;
        mainPhoto.style.opacity = '0';
        
        setTimeout(() => {
            mainPhoto.src = images[index].src;
            mainPhoto.alt = images[index].alt;
            mainPhoto.style.opacity = '1';
        }, 150);
        
        // Actualizează thumbnails active
        thumbnails.forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === index);
        });
        
        // Scroll thumbnails pentru a face thumbnail-ul activ vizibil
        updateThumbnailsScroll();
    }
    
    // Actualizează scroll-ul thumbnails
    function updateThumbnailsScroll() {
        if (!thumbnailsContainer || thumbnails.length === 0) return;
        
        // Obține dimensiunile reale (responsive)
        const firstThumb = thumbnails[0];
        const thumbnailWidth = firstThumb.offsetWidth + parseInt(getComputedStyle(thumbnailsContainer).gap) || 16;
        const scrollContainer = thumbnailsContainer.parentElement;
        const containerWidth = scrollContainer.offsetWidth - (prevBtn ? prevBtn.offsetWidth + 16 : 0) - (nextBtn ? nextBtn.offsetWidth + 16 : 0);
        const maxScroll = Math.max(0, (thumbnails.length * thumbnailWidth) - containerWidth);
        
        // Calculează poziția pentru a centra thumbnail-ul activ
        const targetScroll = (currentIndex * thumbnailWidth) - (containerWidth / 2) + (thumbnailWidth / 2);
        scrollPosition = Math.max(0, Math.min(maxScroll, targetScroll));
        
        thumbnailsContainer.style.transform = `translateX(-${scrollPosition}px)`;
    }
    
    // Navigare la imaginea următoare
    function nextImage() {
        const nextIndex = (currentIndex + 1) % images.length;
        updateMainImage(nextIndex);
    }
    
    // Navigare la imaginea anterioară
    function prevImage() {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        updateMainImage(prevIndex);
    }
    
    // Event listeners pentru thumbnails
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            updateMainImage(index);
        });
    });
    
    // Event listeners pentru butoanele de navigare
    if (nextBtn) {
        nextBtn.addEventListener('click', nextImage);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevImage);
    }
    
    // Navigare cu tastatura
    document.addEventListener('keydown', function(e) {
        if (lightbox && lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    });
    
    // Swipe gestures pentru mobile pe imaginea principală
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;
    
    if (mainPhoto) {
        mainPhoto.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        mainPhoto.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                nextImage();
            } else {
                // Swipe right - previous image
                prevImage();
            }
        }
    }
    
    // Lightbox functionality
    if (fullscreenBtn && lightbox) {
        fullscreenBtn.addEventListener('click', function() {
            openLightbox();
        });
    }
    
    function openLightbox() {
        if (lightboxImages.length === 0) return;
        
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
    }
    
    function updateLightboxImage() {
        if (lightboxImage && images[currentIndex]) {
            lightboxImage.src = images[currentIndex].src;
            lightboxImage.alt = images[currentIndex].alt;
        }
    }
    
    function nextLightboxImage() {
        const nextIndex = (currentIndex + 1) % images.length;
        currentIndex = nextIndex;
        updateLightboxImage();
    }
    
    function prevLightboxImage() {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        currentIndex = prevIndex;
        updateLightboxImage();
    }
    
    const lightboxImages = images;
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
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
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextLightboxImage();
                break;
            case 'ArrowLeft':
                prevLightboxImage();
                break;
        }
    });
    
    // Inițializează
    updateMainImage(0);
    
    // Responsive: actualizează scroll la resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateThumbnailsScroll();
        }, 250);
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

