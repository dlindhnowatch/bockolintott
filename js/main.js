/**
 * Bock & Lintott - Main JavaScript (Clean Consolidated Version)
 * Funktioner: Galleri + Lightbox + Modaler + Parallax + Kontaktformulär + Tangentbord
 */

// ---- Global state ----
const CONFIG = { AUTO_SLIDE_INTERVAL: 5000 };
let galleryImages = [];
let currentSlide = 0;
let slideInterval;
let isLightboxOpen = false;
let header, mobileMenuToggle, mobileNav, mobileNavClose, heroBackground,
    gallerySlider, galleryIndicators,
    aboutModal, aboutModalClose, privacyModal, privacyModalClose,
    lightbox, lightboxImage, contactForm;

document.addEventListener('DOMContentLoaded', async () => {
    cacheDom();
    initializeHeader();
    initializeMobileMenu();
    initializeParallax();
    await initializeGallery();
    initializeScrollAnimations();
    initializeAboutModal();
    initializePrivacyModal();
    initializeLightbox();
    initializeContactForm();
    initializeSmoothScroll();
    initializeGlobalKeyboard();
});

// ---- DOM Caching ----
function cacheDom() {
    header = document.querySelector('.header');
    mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    mobileNav = document.querySelector('.mobile-nav');
    mobileNavClose = document.querySelector('.mobile-nav-close');
    heroBackground = document.querySelector('.hero-bg');
    gallerySlider = document.getElementById('gallery-slider');
    galleryIndicators = document.getElementById('gallery-indicators');
    // galleryStatusEl borttagen
    aboutModal = document.getElementById('about-modal');
    aboutModalClose = aboutModal?.querySelector('.modal-close');
    privacyModal = document.getElementById('privacy-modal');
    privacyModalClose = privacyModal?.querySelector('.modal-close');
    lightbox = document.getElementById('lightbox');
    lightboxImage = document.getElementById('lightbox-image');
    contactForm = document.getElementById('contact-form');
}

// ---- Keyboard Navigation ----
function initializeGlobalKeyboard() {
    document.addEventListener('keydown', e => {
        const key = e.key;
        const tag = document.activeElement.tagName.toLowerCase();
        if (['input', 'textarea'].includes(tag)) return; // Skydda formulärinmatning

        if (key === 'Escape') {
            if (isLightboxOpen) { closeLightbox(); return; }
            if (aboutModal?.classList.contains('open')) { closeModal(); return; }
            if (privacyModal?.classList.contains('open')) { closePrivacyModal(); return; }
            if (mobileNav?.classList.contains('open')) { closeMobileMenu(); return; }
        }

        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            e.preventDefault();
            if (isLightboxOpen) {
                key === 'ArrowLeft' ? lightboxPrev() : lightboxNext();
            } else {
                key === 'ArrowLeft' ? prevSlide() : nextSlide();
            }
        }
    });
}

// ---- Header ----
function initializeHeader() {
    window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 100));
}

// ---- Mobile Menu ----
function initializeMobileMenu() {
    if (!mobileMenuToggle || !mobileNav) return;
    mobileMenuToggle.addEventListener('click', openMobileMenu);
    mobileNavClose?.addEventListener('click', closeMobileMenu);
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
}
function openMobileMenu() {
    mobileNav.classList.add('open');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
    mobileNav.classList.remove('open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// ---- Parallax ----
function initializeParallax() {
    if (!heroBackground) return;
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    window.addEventListener('scroll', () => {
        heroBackground.style.transform = `translateY(${window.pageYOffset * -0.5}px)`;
    });
}

// ---- Gallery ----
async function initializeGallery() {
    galleryImages = await discoverGalleryImages();
    loadGalleryImages();
    createIndicators();
    setupGalleryControls();
    startAutoSlide();
    goToSlide(0);
}
async function discoverGalleryImages() {
    const potential = Array.from({ length: 15 }, (_, i) => `image_${String(i + 1).padStart(2, '0')}.jpg`);
    const found = [];
    for (const f of potential) {
        try {
            const r = await fetch(`./images/${f}`, { method: 'HEAD' });
            if (r.ok) {
                found.push({
                    src: `./images/${f}`,
                    alt: `Klassisk möbel och design - Bild ${f.replace('image_', '').replace('.jpg', '')}`
                });
            }
        } catch (_) { /* Ignorera fel */ }
    }
    if (!found.length) {
        return [
            { src: './images/image_01.jpg', alt: 'Elegant klassisk möbel i vardagsrumsmiljö' },
            { src: './images/image_02.jpg', alt: 'Hantverkare vid restaurering' },
            { src: './images/image_03.jpg', alt: 'Detalj av klassiskt hantverk' }
        ];
    }
    return found;
}
function loadGalleryImages() {
    if (!gallerySlider) return;
    galleryImages.forEach((img, i) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-slide';
        slide.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="${i === 0 ? 'eager' : 'lazy'}">`;
        slide.addEventListener('click', () => openLightbox(i));
        gallerySlider.appendChild(slide);
    });
}
function createIndicators() {
    if (!galleryIndicators) return;
    galleryImages.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = `gallery-indicator ${i === 0 ? 'active' : ''}`;
        btn.setAttribute('aria-label', `Gå till bild ${i + 1}`);
        btn.addEventListener('click', () => { goToSlide(i); resetAutoSlide(); });
        galleryIndicators.appendChild(btn);
    });
}
function setupGalleryControls() {
    const prev = document.querySelector('.gallery-prev');
    const next = document.querySelector('.gallery-next');
    prev?.addEventListener('click', () => prevSlide());
    next?.addEventListener('click', () => nextSlide());
    let startX = 0;
    gallerySlider?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    gallerySlider?.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
    });
}
function goToSlide(index) {
    if (!galleryImages.length || !gallerySlider) return;
    currentSlide = ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
    gallerySlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.gallery-indicator').forEach((el, i) => el.classList.toggle('active', i === currentSlide));
    if (isLightboxOpen) updateLightboxImage();
}
function prevSlide() { goToSlide(currentSlide - 1); resetAutoSlide(); }
function nextSlide() { goToSlide(currentSlide + 1); resetAutoSlide(); }
function startAutoSlide() { slideInterval = setInterval(() => { goToSlide(currentSlide + 1); }, CONFIG.AUTO_SLIDE_INTERVAL); }
function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }
// updateGalleryStatus borttagen (önskad borttagning av status)

// ---- Scroll Animations ----
function initializeScrollAnimations() {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ---- About Modal ----
function initializeAboutModal() {
    if (!aboutModal) return;
    document.querySelectorAll('[onclick="openModal()"]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal(); }));
    aboutModalClose?.addEventListener('click', () => closeModal());
    aboutModal.addEventListener('click', e => { if (e.target === aboutModal) closeModal(); });
}
function openModal() { aboutModal?.classList.add('open'); document.body.style.overflow = 'hidden'; aboutModalClose?.focus(); }
function closeModal() { aboutModal?.classList.remove('open'); document.body.style.overflow = ''; }

// ---- Privacy Modal ----
function initializePrivacyModal() {
    if (!privacyModal) return;
    document.querySelectorAll('[onclick="openPrivacyModal()"]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openPrivacyModal(); }));
    privacyModalClose?.addEventListener('click', () => closePrivacyModal());
    privacyModal.addEventListener('click', e => { if (e.target === privacyModal) closePrivacyModal(); });
}
function openPrivacyModal() { privacyModal?.classList.add('open'); document.body.style.overflow = 'hidden'; privacyModalClose?.focus(); }
function closePrivacyModal() { privacyModal?.classList.remove('open'); document.body.style.overflow = ''; }

// ---- Lightbox ----
function initializeLightbox() {
    if (!lightbox) return;
    const lbClose = lightbox.querySelector('.lightbox-close');
    const lbPrev = lightbox.querySelector('.lightbox-prev');
    const lbNext = lightbox.querySelector('.lightbox-next');
    lbClose?.addEventListener('click', () => closeLightbox());
    lbPrev?.addEventListener('click', () => lightboxPrev());
    lbNext?.addEventListener('click', () => lightboxNext());
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
}
function openLightbox(index) { isLightboxOpen = true; goToSlide(index); lightbox?.classList.add('open'); document.body.style.overflow = 'hidden'; lightbox?.querySelector('.lightbox-close')?.focus(); }
function closeLightbox() { isLightboxOpen = false; lightbox?.classList.remove('open'); document.body.style.overflow = ''; }
function updateLightboxImage() { if (!lightboxImage || !galleryImages.length) return; const img = galleryImages[currentSlide]; lightboxImage.src = img.src; lightboxImage.alt = img.alt; }
function lightboxPrev() { if (isLightboxOpen) goToSlide(currentSlide - 1); }
function lightboxNext() { if (isLightboxOpen) goToSlide(currentSlide + 1); }

// ---- Contact Form ----
function initializeContactForm() { if (contactForm) contactForm.addEventListener('submit', handleFormSubmit); }
function submitForm(e) { handleFormSubmit(e); }
async function handleFormSubmit(e) {
    e.preventDefault();
    if (!contactForm) return;
    clearFormErrors();
    const data = new FormData(contactForm);
    const errors = validateForm(data);
    if (Object.keys(errors).length) { displayFormErrors(errors); return; }
    try {
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Skickar...';
        btn.disabled = true;
        await new Promise(r => setTimeout(r, 900));
        const fs = document.getElementById('form-success');
        if (fs) fs.style.display = 'block';
        contactForm.reset();
        btn.textContent = original;
        btn.disabled = false;
        setTimeout(() => { if (fs) fs.style.display = 'none'; }, 5000);
    } catch (err) {
        console.error('Form error', err);
        alert('Ett fel uppstod. Försök igen.');
    }
}
function validateForm(data) {
    const errors = {};
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim();
    const message = (data.get('message') || '').trim();
    const consent = data.get('consent');
    if (!name) errors.name = 'Namn är obligatoriskt.';
    if (!email) errors.email = 'E-post är obligatoriskt.'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ogiltig e-postadress.';
    if (!message) errors.message = 'Meddelande är obligatoriskt.'; else if (message.length < 10) errors.message = 'Minst 10 tecken.';
    if (!consent) errors.consent = 'Kräver godkännande.';
    return errors;
}
function displayFormErrors(errors) {
    Object.entries(errors).forEach(([field, msg]) => {
        const errEl = document.getElementById(`${field}-error`);
        if (errEl) errEl.textContent = msg;
        const input = document.getElementById(field);
        if (input) input.style.borderColor = '#dc3545';
    });
}
function clearFormErrors() {
    if (!contactForm) return;
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    contactForm.querySelectorAll('input, textarea').forEach(el => el.style.borderColor = '#e5e5e5');
}

// ---- Smooth Scroll ----
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (!id || id === '#' || id.startsWith('http')) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = header?.offsetHeight || 0;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });
}

// ---- Other (lifecycle) ----
document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(slideInterval); else resetAutoSlide();
});
window.addEventListener('resize', () => { goToSlide(currentSlide); });

// ---- Exports ----
if (typeof window !== 'undefined') {
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openPrivacyModal = openPrivacyModal;
    window.closePrivacyModal = closePrivacyModal;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.lightboxPrev = lightboxPrev;
    window.lightboxNext = lightboxNext;
    window.prevSlide = prevSlide;
    window.nextSlide = nextSlide;
    window.goToSlide = goToSlide;
    window.submitForm = submitForm;
    window.BockLintott = { CONFIG };
}

