/**
 * Bock & Lintott - Main JavaScript
 * Professional website functionality
 */

// Configuration
const CONFIG = {
    INSTAGRAM_HANDLE: 'bockolintott',
    CONTACT_EMAIL: 'info@bocklintott.se',
    MAPS_IFRAME_SRC: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2034.9984391806187!2d18.063240816022387!3d59.33415998166139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f763119640bcb%3A0xa80d27d3679d7766!2sStockholm!5e0!3m2!1sen!2sse!4v1639234567890!5m2!1sen!2sse',
    AUTO_SLIDE_INTERVAL: 5000
};

// Gallery images - will be populated dynamically
let galleryImages = [];

// DOM Elements
const header = document.querySelector('.header');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');
const heroBackground = document.querySelector('.hero-bg');
const gallerySlider = document.getElementById('gallery-slider');
const galleryIndicators = document.getElementById('gallery-indicators');
const modal = document.getElementById('about-modal');
const readMoreBtn = document.getElementById('read-more-btn');
const modalClose = document.querySelector('.modal-close');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const contactForm = document.getElementById('contact-form');

// State
let currentSlide = 0;
let slideInterval;
let isLightboxOpen = false;

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', async function() {
    initializeHeader();
    initializeMobileMenu();
    initializeParallax();
    await initializeGallery(); // Wait for gallery images to be discovered
    initializeScrollAnimations();
    initializeModal();
    initializeLightbox();
    initializeContactForm();
    initializeSmoothScroll();
});

/**
 * Header functionality
 */
function initializeHeader() {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Mobile menu functionality
 */
function initializeMobileMenu() {
    mobileMenuToggle.addEventListener('click', function() {
        mobileNav.classList.add('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    });

    mobileNavClose.addEventListener('click', closeMobileMenu);

    // Close on link click
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    mobileNav.classList.remove('open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

/**
 * Parallax effect for hero background
 */
function initializeParallax() {
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }
}

/**
 * Gallery functionality
 */
async function initializeGallery() {
    // Discover available images
    galleryImages = await discoverGalleryImages();
    
    loadGalleryImages();
    createIndicators();
    setupGalleryControls();
    startAutoSlide();
}

/**
 * Discover gallery images dynamically
 */
async function discoverGalleryImages() {
    // List of potential image files to check
    const potentialImages = [
        'image_01.jpg', 'image_02.jpg', 'image_03.jpg', 'image_04.jpg', 'image_05.jpg',
        'image_06.jpg', 'image_07.jpg', 'image_08.jpg', 'image_09.jpg', 'image_10.jpg',
        'image_11.jpg', 'image_12.jpg', 'image_13.jpg', 'image_14.jpg', 'image_15.jpg'
    ];

    const foundImages = [];
    
    for (const filename of potentialImages) {
        try {
            const response = await fetch(`./images/${filename}`, { method: 'HEAD' });
            if (response.ok) {
                foundImages.push({
                    src: `./images/${filename}`,
                    alt: `Klassisk möbel och design från Bock & Lintott - ${filename.replace('.jpg', '').replace('image_', 'Bild ')}`
                });
            }
        } catch (error) {
            // Image doesn't exist, continue to next
            continue;
        }
    }
    
    // Fallback if no images found
    if (foundImages.length === 0) {
        foundImages.push(
            { src: './images/image_01.jpg', alt: 'Elegant klassisk möbel i vardagsrumsmiljö' },
            { src: './images/image_02.jpg', alt: 'Hantverkare arbetar med varsam möbelrestaurering' },
            { src: './images/image_03.jpg', alt: 'Detaljvy av klassisk möbeldesign och hantverk' }
        );
    }
    
    return foundImages;
}

/**
 * Load gallery images into slider
 */
function loadGalleryImages() {
    galleryImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-slide';
        slide.innerHTML = `<img src="${image.src}" alt="${image.alt}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
        slide.addEventListener('click', () => openLightbox(index));
        gallerySlider.appendChild(slide);
    });
}

/**
 * Create gallery indicators
 */
function createIndicators() {
    galleryImages.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `gallery-indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('aria-label', `Gå till bild ${index + 1}`);
        indicator.addEventListener('click', () => goToSlide(index));
        galleryIndicators.appendChild(indicator);
    });
}

/**
 * Setup gallery controls and navigation
 */
function setupGalleryControls() {
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');

    prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
    });

    // Touch/swipe support
    let startX = 0;
    let endX = 0;

    gallerySlider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    gallerySlider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goToSlide(currentSlide + 1);
            } else {
                goToSlide(currentSlide - 1);
            }
            resetAutoSlide();
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isLightboxOpen && (e.target.closest('.gallery-container') || document.activeElement.closest('.gallery-container'))) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSlide(currentSlide - 1);
                resetAutoSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToSlide(currentSlide + 1);
                resetAutoSlide();
            }
        }
    });
}

/**
 * Navigate to specific slide
 */
function goToSlide(index) {
    currentSlide = ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
    
    gallerySlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    document.querySelectorAll('.gallery-indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentSlide);
    });
}

/**
 * Start automatic slideshow
 */
function startAutoSlide() {
    slideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, CONFIG.AUTO_SLIDE_INTERVAL);
}

/**
 * Reset automatic slideshow timer
 */
function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

/**
 * Initialize scroll animations
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Modal functionality
 */
function initializeModal() {
    readMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    readMoreBtn.focus();
}

/**
 * Lightbox functionality
 */
function initializeLightbox() {
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        updateLightboxImage();
    });
    lightboxNext.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        updateLightboxImage();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (isLightboxOpen) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSlide(currentSlide - 1);
                updateLightboxImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToSlide(currentSlide + 1);
                updateLightboxImage();
            }
        }
    });
}

function openLightbox(index) {
    currentSlide = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    isLightboxOpen = true;
    
    // Focus trap
    document.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    isLightboxOpen = false;
}

function updateLightboxImage() {
    const image = galleryImages[currentSlide];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
}

/**
 * Contact form functionality
 */
function initializeContactForm() {
    contactForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Reset previous errors
    clearFormErrors();
    
    // Validate form
    const formData = new FormData(contactForm);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors);
        return;
    }
    
    // Simulate form submission (replace with actual endpoint)
    try {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Skickar...';
        submitBtn.disabled = true;
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        document.getElementById('form-success').style.display = 'block';
        contactForm.reset();
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById('form-success').style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Ett fel uppstod. Vänligen försök igen.');
    }
}

/**
 * Form validation
 */
function validateForm(formData) {
    const errors = {};
    
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    const consent = formData.get('consent');
    
    if (!name) {
        errors.name = 'Namn är obligatoriskt.';
    }
    
    if (!email) {
        errors.email = 'E-post är obligatoriskt.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Ange en giltig e-postadress.';
    }
    
    if (!message) {
        errors.message = 'Meddelande är obligatoriskt.';
    } else if (message.length < 10) {
        errors.message = 'Meddelandet måste vara minst 10 tecken långt.';
    }
    
    if (!consent) {
        errors.consent = 'Du måste godkänna behandlingen av personuppgifter.';
    }
    
    return errors;
}

/**
 * Display form validation errors
 */
function displayFormErrors(errors) {
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.style.color = '#dc3545';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
        }
        
        const inputElement = document.getElementById(field);
        if (inputElement) {
            inputElement.style.borderColor = '#dc3545';
        }
    });
}

/**
 * Clear form validation errors
 */
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
    });
    
    const inputElements = contactForm.querySelectorAll('input, textarea');
    inputElements.forEach(el => {
        el.style.borderColor = '#e5e5e5';
    });
}

/**
 * Smooth scrolling navigation
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Performance optimizations
 */

// Pause auto-slide when page is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(slideInterval);
    } else {
        resetAutoSlide();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate gallery position
    goToSlide(currentSlide);
});

// Preload next gallery image
function preloadNextImage() {
    if (galleryImages.length > 1) {
        const nextIndex = (currentSlide + 1) % galleryImages.length;
        const nextImage = new Image();
        nextImage.src = galleryImages[nextIndex].src;
    }
}

// Export functions for debugging (development only)
if (typeof window !== 'undefined') {
    window.BockLintott = {
        goToSlide,
        openLightbox,
        CONFIG
    };
}