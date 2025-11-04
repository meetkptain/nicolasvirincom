/**
 * CAPTAINSIMPLE - Landing Page JavaScript
 * Interactions, animations et optimisations
 */

// ==========================================
// NAVIGATION & HEADER
// ==========================================

const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Sticky header on scroll
let lastScroll = 0;

// Fonction pour gérer le style du header
function updateHeaderStyle() {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolled
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
}

// Vérifier la position au chargement
if (header) {
    updateHeaderStyle();
}

window.addEventListener('scroll', () => {
    updateHeaderStyle();
});

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        }
    });
}

// Close mobile menu when link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for links to empty hash
        if (href === '#') return;
        
        // Don't interfere with Smart Finder buttons
        if (this.hasAttribute('data-smart-finder')) return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// FAQ ACCORDION
// ==========================================

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
        question.addEventListener('click', () => {
            // Close other FAQs in the same section
            const parent = item.closest('.faq-container, .faq-section');
            if (parent) {
                parent.querySelectorAll('.faq-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            }
            
            // Toggle current FAQ
            item.classList.toggle('active');
        });
    }
});

// ==========================================
// FORM HANDLING
// ==========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '⏳ Envoi en cours...';
        submitBtn.disabled = true;
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Simulate API call (replace with your actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success
            submitBtn.innerHTML = '✓ Message envoyé !';
            submitBtn.style.background = 'var(--success-color)';
            
            // Show success message
            showNotification('✓ Merci ! Nous vous recontacterons sous 24h.', 'success');
            
            // Reset form
            setTimeout(() => {
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
            
            // In production, replace with:
            /*
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                // Success handling
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
            */
            
        } catch (error) {
            // Error
            submitBtn.innerHTML = '✗ Erreur - Réessayer';
            submitBtn.style.background = 'var(--error-color)';
            
            showNotification('✗ Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Newsletter form
const newsletterForms = document.querySelectorAll('.footer-newsletter-form');

newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');
        const email = input.value;
        
        const originalText = button.innerHTML;
        button.innerHTML = '⏳';
        button.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            button.innerHTML = '✓';
            showNotification('✓ Merci pour votre inscription !', 'success');
            
            setTimeout(() => {
                input.value = '';
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
            
        } catch (error) {
            button.innerHTML = '✗';
            showNotification('✗ Erreur lors de l\'inscription.', 'error');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    });
});

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add notification animations to CSS dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ==========================================
// INTERSECTION OBSERVER - ANIMATIONS
// ==========================================

// Animate elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
const animatedElements = document.querySelectorAll(
    '.value-card, .service-block, .pricing-card, .testimonial-card, .blog-card'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==========================================
// DYNAMIC STATS COUNTER
// ==========================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

// Animate hero stats when visible
const heroStats = document.querySelectorAll('.hero-stats .stat-number');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            
            // Animate each stat
            const stats = entry.target.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const text = stat.textContent;
                const value = parseInt(text.replace(/[^0-9]/g, ''));
                
                if (!isNaN(value)) {
                    stat.textContent = '0';
                    setTimeout(() => {
                        animateCounter(stat, value);
                    }, 300);
                }
            });
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStatsContainer = document.querySelector('.hero-stats');
if (heroStatsContainer) {
    statsObserver.observe(heroStatsContainer);
}

// ==========================================
// FOMO / SOCIAL PROOF NOTIFICATIONS
// ==========================================

// Simulate real-time social proof notifications
const fomoMessages = [
    { icon: '🍽️', name: 'Marc de Lyon', action: 'Bundle Restaurant (3 apps en 1h)', time: '2 min' },
    { icon: '🛒', name: 'Sophie de Paris', action: 'E-Commerce Suite (+28% conversions)', time: '5 min' },
    { icon: '📦', name: 'Emma de Toulouse', action: 'All-in-One (5 apps installées)', time: '12 min' },
    { icon: '⚡', name: 'Alex de Bordeaux', action: 'a testé FOMOWidget (gratuit 14j)', time: '18 min' },
    { icon: '🎓', name: 'Laura de Marseille', action: 'SmartSchool live en 2h chrono', time: '25 min' },
    { icon: '📈', name: 'Thomas de Nantes', action: 'AutoPost actif (3 réseaux sociaux)', time: '32 min' }
];

let fomoIndex = 0;

function showFomoNotification() {
    // Don't show on mobile or if user hasn't scrolled
    if (window.innerWidth < 768 || window.pageYOffset < 500) {
        return;
    }
    
    const message = fomoMessages[fomoIndex];
    fomoIndex = (fomoIndex + 1) % fomoMessages.length;
    
    // Create FOMO notification
    const fomo = document.createElement('div');
    fomo.className = 'fomo-popup';
    fomo.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 350px;
        animation: slideInLeft 0.5s ease;
        cursor: pointer;
    `;
    
    fomo.innerHTML = `
        <div style="font-size: 2rem;">${message.icon}</div>
        <div style="flex: 1;">
            <strong style="display: block; margin-bottom: 0.2rem; color: var(--text-primary);">${message.name}</strong>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">${message.action}</p>
            <span style="font-size: 0.75rem; color: var(--text-light);">Il y a ${message.time}</span>
        </div>
        <button style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: var(--text-light);">×</button>
    `;
    
    document.body.appendChild(fomo);
    
    // Close button
    const closeBtn = fomo.querySelector('button');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFomo(fomo);
    });
    
    // Click to close
    fomo.addEventListener('click', () => {
        removeFomo(fomo);
    });
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (document.body.contains(fomo)) {
            removeFomo(fomo);
        }
    }, 8000);
}

function removeFomo(element) {
    element.style.animation = 'slideOutLeft 0.3s ease';
    setTimeout(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    }, 300);
}

// Add FOMO animation styles
const fomoStyles = document.createElement('style');
fomoStyles.textContent = `
    @keyframes slideInLeft {
        from {
            transform: translateX(-400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutLeft {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(-400px);
            opacity: 0;
        }
    }
    
    .fomo-popup:hover {
        transform: translateY(-5px);
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(fomoStyles);

// Show FOMO notifications periodically (every 15-25 seconds)
let fomoInterval;

function startFomoNotifications() {
    // Show first notification after 10 seconds
    setTimeout(() => {
        showFomoNotification();
        
        // Then show every 15-25 seconds randomly
        fomoInterval = setInterval(() => {
            showFomoNotification();
        }, Math.random() * 10000 + 15000); // 15-25 seconds
    }, 10000);
}

// Start FOMO notifications when page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startFomoNotifications);
} else {
    startFomoNotifications();
}

// ==========================================
// LAZY LOADING IMAGES
// ==========================================

const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

// Debounce function for performance
function debounce(func, wait = 10) {
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

// Throttle function for scroll events
function throttle(func, limit = 16) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==========================================
// ANALYTICS TRACKING (placeholder)
// ==========================================

function trackEvent(category, action, label) {
    // Integrate with your analytics solution
    console.log('Track Event:', { category, action, label });
    
    // Example for Google Analytics:
    /*
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    */
}

// Track CTA clicks
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('CTA', 'Click', btn.textContent.trim());
    });
});

// Track app views
const appObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const appId = entry.target.id;
            if (appId) {
                trackEvent('App', 'View', appId);
            }
            appObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.app-card[id]').forEach(app => {
    appObserver.observe(app);
});

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================

// Trap focus in mobile menu when open
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

if (navMenu) {
    trapFocus(navMenu);
}

// Keyboard navigation for FAQ
document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('faq-question') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});

// ==========================================
// ROI CALCULATOR
// ==========================================

const calculateBtn = document.getElementById('calculate-roi');
const calculatorResults = document.getElementById('calculator-results');

if (calculateBtn) {
    calculateBtn.addEventListener('click', () => {
        const numApps = parseFloat(document.getElementById('monthly-revenue').value) || 0;
        const projectType = document.getElementById('conversion-rate').value;
        const timeline = document.getElementById('time-spent').value;
        
        if (numApps === 0) {
            alert('Veuillez entrer le nombre d\'apps nécessaires');
            return;
        }
        
        // Calculs économies dev custom vs apps
        let customDevCost, customDevMonths, appsCost;
        
        // Coût dev custom selon complexité
        if (projectType === 'simple') {
            customDevCost = 8000 + (numApps * 3000); // 8K base + 3K par feature
            customDevMonths = 2 + (numApps * 0.5);
        } else if (projectType === 'medium') {
            customDevCost = 15000 + (numApps * 5000);
            customDevMonths = 3 + (numApps * 1);
        } else { // complex
            customDevCost = 25000 + (numApps * 7000);
            customDevMonths = 6 + (numApps * 1.5);
        }
        
        // Coût apps Captainsimple (moyenne 197€/app)
        appsCost = Math.round(numApps * 197);
        
        // Économies
        const savings = customDevCost - (appsCost * 3); // 3 mois d'apps
        const timeToMarket = timeline === 'urgent' ? '1-2 jours' : timeline === 'normal' ? '1 semaine' : '2-4 semaines';
        
        // Afficher les résultats
        document.getElementById('potential-gain').textContent = `€${savings.toLocaleString()}`;
        document.getElementById('time-saved').textContent = `${Math.round(customDevMonths)} mois`;
        document.getElementById('roi-value').textContent = timeToMarket;
        document.getElementById('extra-revenue').textContent = customDevCost.toLocaleString();
        document.getElementById('time-value').textContent = Math.round(customDevMonths);
        document.getElementById('net-gain').textContent = appsCost.toLocaleString();
        
        // Afficher la section résultats
        calculatorResults.style.display = 'block';
        calculatorResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Track event
        trackEvent('Calculator', 'Calculated', `Apps: ${numApps}, Type: ${projectType}`);
    });
}

// ==========================================
// EXIT INTENT POPUP - DÉSACTIVÉ
// ==========================================
// Exit popup désactivé à la demande de l'utilisateur

// ==========================================
// LAUNCH BANNER COUNTDOWN
// ==========================================

function updateCountdown() {
    // Set launch date (7 days from now for example)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 7); // 7 days countdown
    
    const now = new Date();
    const diff = launchDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        const countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) {
            countdownEl.textContent = `${days}j ${hours}h ${minutes}min`;
        }
    }
}

// Update countdown every minute
if (document.getElementById('countdown-timer')) {
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
}

// Close banner
const closeBanner = document.getElementById('close-banner');
if (closeBanner) {
    closeBanner.addEventListener('click', () => {
        document.getElementById('launch-banner').style.display = 'none';
        localStorage.setItem('bannerClosed', 'true');
    });
}

// Check if banner was closed before
if (localStorage.getItem('bannerClosed') === 'true') {
    const banner = document.getElementById('launch-banner');
    if (banner) banner.style.display = 'none';
}

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%c⚓ NicolasVirin.com', 'font-size: 24px; font-weight: bold; color: #0066FF;');
console.log('%cDév / Apps ? Contactez-moi.', 'font-size: 14px; color: #4A5568;');
console.log('%cnicolas@nicolasvirin.com', 'font-size: 12px; color: #718096;');

// ==========================================
// RGPD COOKIE BANNER
// ==========================================

const cookieBanner = document.getElementById('cookieBanner');
const acceptCookies = document.getElementById('acceptCookies');
const refuseCookies = document.getElementById('refuseCookies');

// Vérifier si le choix a déjà été fait
function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        // Afficher le banner après 2 secondes
        setTimeout(() => {
            if (cookieBanner) {
                cookieBanner.classList.add('show');
            }
        }, 2000);
    }
}

// Accepter les cookies
if (acceptCookies) {
    acceptCookies.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        
        // Activer analytics si accepté
        // if (typeof gtag !== 'undefined') {
        //     gtag('consent', 'update', {
        //         'analytics_storage': 'granted'
        //     });
        // }
    });
}

// Refuser les cookies
if (refuseCookies) {
    refuseCookies.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'refused');
        cookieBanner.classList.remove('show');
        
        // Désactiver analytics si refusé
        // if (typeof gtag !== 'undefined') {
        //     gtag('consent', 'update', {
        //         'analytics_storage': 'denied'
        //     });
        // }
    });
}

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Captainsimple loaded successfully');
    
    // Add loaded class for CSS transitions
    document.body.classList.add('loaded');
    
    // Check cookie consent
    checkCookieConsent();
});

// ==========================================
// SERVICE WORKER (optional, for PWA)
// ==========================================

/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
*/

// ==========================================
// CTA MOBILE FIXE - Apparaît en scrollant vers le haut
// ==========================================

const mobileCtaFixed = document.getElementById('mobileCtaFixed');
let lastScrollTop = 0;
let scrollThreshold = 200; // Afficher après avoir scrollé de 200px
let isScrollingUp = false;

if (mobileCtaFixed) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Détecter si on scroll vers le haut
        isScrollingUp = scrollTop < lastScrollTop;
        
        // Afficher le CTA si :
        // 1. On a scrollé au moins 200px vers le bas
        // 2. On scroll maintenant vers le haut
        // 3. On n'est pas tout en haut de la page
        // 4. On n'est pas tout en bas de la page
        if (scrollTop > scrollThreshold && 
            isScrollingUp && 
            scrollTop > 50 && 
            scrollTop + windowHeight < documentHeight - 100) {
            mobileCtaFixed.classList.add('show');
        } else {
            // Cacher si on est tout en haut, tout en bas, ou si on scroll vers le bas
            if (scrollTop <= scrollThreshold || 
                scrollTop + windowHeight >= documentHeight - 50 || 
                !isScrollingUp) {
                mobileCtaFixed.classList.remove('show');
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
}



// ==========================================
// APPS POPULAIRES & CATALOGUE COMPLET - Solution UX
// ==========================================

// Configuration des apps populaires (SmartSchool uniquement)
const popularAppsConfig = [
    { name: 'SmartSchool Vitrine Indépendant', category: 'education' },
    { name: 'SmartSchool Vitrine Centre', category: 'education' },
    { name: 'SmartSchool LMS', category: 'education' },
    { name: 'SmartSchool App LMS', category: 'education' }
];

// Injecter les apps populaires
function initPopularApps() {
    const popularGrid = document.getElementById('popularAppsGrid');
    if (!popularGrid) {
        console.warn('popularAppsGrid not found');
        return;
    }
    
    // Vider la grille populaire d'abord
    popularGrid.innerHTML = '';
    
    // Chercher toutes les cartes, même dans le catalogue masqué
    // Utiliser querySelectorAll sur tout le document pour être sûr
    const allAppCards = document.querySelectorAll('.app-card');
    
    if (allAppCards.length === 0) {
        console.warn('No app cards found');
        return;
    }
    
    console.log(`Found ${allAppCards.length} app cards`);
    console.log('Looking for popular apps:', popularAppsConfig.map(a => a.name));
    
    popularAppsConfig.forEach(config => {
        let found = false;
        // Trouver la carte d'app correspondante
        allAppCards.forEach(card => {
            const appNameElement = card.querySelector('.app-name');
            if (!appNameElement) return;
            
            const appName = appNameElement.textContent.trim();
            // Comparaison insensible à la casse et aux espaces
            if (appName === config.name) {
                found = true;
                // Cloner la carte
                const clonedCard = card.cloneNode(true);
                clonedCard.classList.add('popular-app-card');
                // Retirer la classe app-card du clone pour éviter les doublons
                clonedCard.classList.remove('app-card');
                popularGrid.appendChild(clonedCard);
                console.log(`✅ Added ${config.name} to popular apps`);
                return; // Sortir de la boucle une fois trouvé
            }
        });
        
        if (!found) {
            console.warn(`⚠️ App "${config.name}" not found in catalog`);
            // Afficher les noms trouvés pour debug
            const foundNames = Array.from(allAppCards).map(card => {
                const nameEl = card.querySelector('.app-name');
                return nameEl ? nameEl.textContent.trim() : 'No name';
            }).filter(name => name.toLowerCase().includes('smartschool'));
            if (foundNames.length > 0) {
                console.log('Found SmartSchool apps:', foundNames);
            }
        }
    });
}

// Gérer le bouton "Voir tout" dans la section populaire
const showAllBtn = document.getElementById('showAllAppsBtn');
const fullCatalog = document.getElementById('fullCatalog');
const catalogFilters = document.getElementById('catalogFilters');
const popularSection = document.getElementById('popularApps');

if (showAllBtn && fullCatalog && catalogFilters) {
    showAllBtn.addEventListener('click', function() {
        // Simuler un clic sur le bouton "Toutes" des filtres
        const allFilterBtn = catalogFilters.querySelector('.filter-btn[data-category="all"]');
        if (allFilterBtn) {
            allFilterBtn.click();
        }
    });
}

// Initialiser les apps populaires au chargement
function initCatalog() {
    initPopularApps();
    
    // S'assurer que le catalogue complet est caché par défaut
    const fullCatalog = document.getElementById('fullCatalog');
    if (fullCatalog) {
        fullCatalog.style.display = 'none';
    }
    
    // S'assurer que la section populaire est visible par défaut
    const popularSection = document.getElementById('popularApps');
    if (popularSection) {
        popularSection.style.display = 'block';
    }
}

// Initialiser au chargement avec délai pour être sûr que tout est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initCatalog();
            initPopularApps(); // Appel direct aussi
        }, 200);
    });
} else {
    setTimeout(() => {
        initCatalog();
        initPopularApps(); // Appel direct aussi
    }, 200);
}

// ==========================================
// FILTRES CATALOGUE APPS - Solution UX
// ==========================================

function updateResultsCounter(category) {
    const counterNumber = document.getElementById('counterNumber');
    if (!counterNumber) return;
    
    let totalApps = 0;
    
    // Si c'est "popular", compter les apps populaires
    if (category === 'popular') {
        const popularCards = document.querySelectorAll('.popular-app-card');
        totalApps = popularCards.length;
    } 
    // Si c'est "all", compter toutes les apps du catalogue complet
    else if (category === 'all') {
        const allAppCards = document.querySelectorAll('.app-card:not(.popular-app-card)');
        totalApps = allAppCards.length;
    }
    // Sinon, compter les apps de la catégorie visible
    else {
        const visibleBlocks = document.querySelectorAll('.category-block[data-category]:not(.hidden)');
        visibleBlocks.forEach(block => {
            const appsInBlock = block.querySelectorAll('.app-card');
            totalApps += appsInBlock.length;
        });
    }
    
    // Animation simple du compteur
    const currentCount = parseInt(counterNumber.textContent) || 0;
    if (currentCount !== totalApps) {
        counterNumber.style.opacity = '0.5';
        setTimeout(() => {
            counterNumber.textContent = totalApps;
            counterNumber.style.opacity = '1';
        }, 150);
    } else {
        counterNumber.textContent = totalApps;
    }
}

if (catalogFilters) {
    const filterButtons = catalogFilters.querySelectorAll('.filter-btn');
    const categoryBlocks = document.querySelectorAll('.category-block[data-category]');
    const popularSection = document.getElementById('popularApps');
    const fullCatalog = document.getElementById('fullCatalog');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Mettre à jour les boutons actifs
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (category === 'popular') {
                // Afficher uniquement les apps populaires
                if (popularSection) popularSection.style.display = 'block';
                if (fullCatalog) fullCatalog.style.display = 'none';
                
                // Mettre à jour le compteur
                updateResultsCounter('popular');
                
                // Scroll vers les populaires
                setTimeout(() => {
                    if (popularSection) {
                        popularSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
            else if (category === 'all') {
                // Afficher TOUT le catalogue
                if (popularSection) popularSection.style.display = 'none';
                if (fullCatalog) fullCatalog.style.display = 'block';
                setTimeout(() => {
                    if (fullCatalog) {
                        fullCatalog.style.opacity = '1';
                        fullCatalog.style.transform = 'translateY(0)';
                    }
                }, 50);
                
                // Afficher toutes les catégories
                categoryBlocks.forEach(block => {
                    block.classList.remove('hidden');
                    block.style.display = '';
                    setTimeout(() => {
                        block.classList.add('fade-in');
                        block.classList.remove('fade-out');
                    }, 10);
                });
                
                // Mettre à jour le compteur
                setTimeout(() => {
                    updateResultsCounter('all');
                }, 350);
                
                // Scroll vers la première app du catalogue
                setTimeout(() => {
                    const firstBlock = categoryBlocks[0];
                    if (firstBlock) {
                        const firstAppCard = firstBlock.querySelector('.app-card');
                        if (firstAppCard) {
                            const headerHeight = 80;
                            const offsetTop = firstAppCard.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        } else {
                            const catalogSection = document.getElementById('apps-catalog');
                            if (catalogSection) {
                                const offsetTop = catalogSection.offsetTop - 100;
                                window.scrollTo({
                                    top: offsetTop,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }
                }, 400);
            }
            else {
                // Filtrer par catégorie spécifique
                if (popularSection) popularSection.style.display = 'none';
                if (fullCatalog) fullCatalog.style.display = 'block';
                setTimeout(() => {
                    if (fullCatalog) {
                        fullCatalog.style.opacity = '1';
                        fullCatalog.style.transform = 'translateY(0)';
                    }
                }, 50);
                
                // Filtrer les catégories
                let firstVisibleBlock = null;
                categoryBlocks.forEach(block => {
                    const blockCategory = block.getAttribute('data-category');
                    
                    if (blockCategory === category) {
                        block.classList.remove('hidden');
                        block.style.display = '';
                        if (!firstVisibleBlock) {
                            firstVisibleBlock = block;
                        }
                        setTimeout(() => {
                            block.classList.add('fade-in');
                            block.classList.remove('fade-out');
                        }, 10);
                    } else {
                        block.classList.add('fade-out');
                        block.classList.remove('fade-in');
                        setTimeout(() => {
                            block.classList.add('hidden');
                            block.style.display = 'none';
                        }, 300);
                    }
                });
                
                // Mettre à jour le compteur
                setTimeout(() => {
                    updateResultsCounter(category);
                }, 350);
                
                // Scroll vers la première app de la catégorie filtrée
                setTimeout(() => {
                    if (firstVisibleBlock) {
                        // Trouver la première carte d'app dans ce bloc
                        const firstAppCard = firstVisibleBlock.querySelector('.app-card');
                        if (firstAppCard) {
                            const headerHeight = 80;
                            const offsetTop = firstAppCard.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        } else {
                            // Fallback : scroll vers le bloc de catégorie
                            const offsetTop = firstVisibleBlock.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        // Fallback : scroll vers le catalogue
                        const catalogSection = document.getElementById('apps-catalog');
                        if (catalogSection) {
                            const offsetTop = catalogSection.offsetTop - 100;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        }
                    }
                }, 400);
            }
        });
    });
    
    // Initialiser le compteur avec "popular" par défaut
    updateResultsCounter('popular');
}

