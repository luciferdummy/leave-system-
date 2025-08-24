/**
 * College Leave Management System
 * Animations JavaScript File
 * Handles all animation-related functionality
 */

// Animation configuration
const ANIMATION_CONFIG = {
    duration: {
        fast: 300,
        normal: 500,
        slow: 800
    },
    easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    delays: {
        stagger: 100,
        hover: 150
    }
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePageAnimations();
    setupHoverAnimations();
    setupClickAnimations();
    setupScrollTriggers();
    initializeParticleEffects();
    setupModalAnimations();
    initializeTypewriter();
    setupFloatingElements();
});

/**
 * Initialize page-wide animations
 */
function initializePageAnimations() {
    // Page load animation
    animatePageLoad();
    
    // Stagger animate cards and elements
    staggerAnimateElements('.stat-card', 'animate__fadeInUp');
    staggerAnimateElements('.feature-box', 'animate__fadeInUp');
    staggerAnimateElements('.leave-type-card', 'animate__fadeInLeft');
    staggerAnimateElements('.application-row', 'animate__fadeInLeft');
    staggerAnimateElements('.user-row', 'animate__fadeInLeft');
    
    // Animate navigation
    animateNavigation();
    
    // Setup reduced motion preferences
    handleReducedMotion();
}

/**
 * Animate page load
 */
function animatePageLoad() {
    const body = document.body;
    body.style.opacity = '0';
    
    setTimeout(() => {
        body.style.transition = 'opacity 0.5s ease-in-out';
        body.style.opacity = '1';
    }, 100);
    
    // Animate main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.transform = 'translateY(20px)';
        mainContent.style.opacity = '0';
        
        setTimeout(() => {
            mainContent.style.transition = 'all 0.8s ease-out';
            mainContent.style.transform = 'translateY(0)';
            mainContent.style.opacity = '1';
        }, 200);
    }
}

/**
 * Animate navigation
 */
function animateNavigation() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Add slide-down animation
    navbar.style.transform = 'translateY(-100%)';
    navbar.style.transition = 'transform 0.6s ease-out';
    
    setTimeout(() => {
        navbar.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate nav items
    const navItems = navbar.querySelectorAll('.nav-link');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.style.transition = 'all 0.4s ease-out';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 300 + (index * 50));
    });
}

/**
 * Stagger animate elements
 */
function staggerAnimateElements(selector, animationClass, delay = ANIMATION_CONFIG.delays.stagger) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('animate__animated', animationClass);
        }, index * delay);
    });
}

/**
 * Setup hover animations
 */
function setupHoverAnimations() {
    // Card hover animations
    setupCardHoverAnimations();
    
    // Button hover animations
    setupButtonHoverAnimations();
    
    // Icon hover animations
    setupIconHoverAnimations();
    
    // Image hover animations
    setupImageHoverAnimations();
}

/**
 * Setup card hover animations
 */
function setupCardHoverAnimations() {
    const cards = document.querySelectorAll('.card, .stat-card, .dashboard-card, .form-card, .feature-box');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Animate child icons
            const icon = this.querySelector('.stat-icon, .feature-icon, .feature-icon-large');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease-out';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
            
            // Reset child icons
            const icon = this.querySelector('.stat-icon, .feature-icon, .feature-icon-large');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

/**
 * Setup button hover animations
 */
function setupButtonHoverAnimations() {
    const buttons = document.querySelectorAll('.animate-btn, .btn');
    
    buttons.forEach(button => {
        // Ripple effect
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                pointer-events: none;
                animation: ripple 0.6s linear;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Hover animations
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'all 0.2s ease-out';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Setup icon hover animations
 */
function setupIconHoverAnimations() {
    const icons = document.querySelectorAll('.fas, .far, .fab');
    
    icons.forEach(icon => {
        const parent = icon.closest('button, a, .clickable');
        if (!parent) return;
        
        parent.addEventListener('mouseenter', function() {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.transition = 'transform 0.3s ease-out';
        });
        
        parent.addEventListener('mouseleave', function() {
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

/**
 * Setup image hover animations
 */
function setupImageHoverAnimations() {
    const images = document.querySelectorAll('img');
    
    images.forEach(image => {
        image.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease-out';
        });
        
        image.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * Setup click animations
 */
function setupClickAnimations() {
    // Generic click animation for interactive elements
    document.addEventListener('click', function(e) {
        const clickableElements = ['button', 'a', '.clickable', '.nav-link', '.dropdown-item'];
        const target = e.target.closest(clickableElements.join(', '));
        
        if (target && !target.disabled) {
            // Add pulse animation
            target.classList.add('animate__animated', 'animate__pulse');
            
            setTimeout(() => {
                target.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    });
    
    // Form submission animation
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (!form.checkValidity()) return;
        
        form.classList.add('animate__animated', 'animate__pulse');
        
        // Animate form fields
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach((field, index) => {
            setTimeout(() => {
                field.style.transform = 'scale(1.02)';
                field.style.transition = 'transform 0.1s ease-out';
                
                setTimeout(() => {
                    field.style.transform = 'scale(1)';
                }, 100);
            }, index * 50);
        });
    });
}

/**
 * Setup scroll triggers
 */
function setupScrollTriggers() {
    // Enhanced intersection observer for scroll animations
    const observerOptions = {
        threshold: [0.1, 0.3, 0.5],
        rootMargin: '0px 0px -10% 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.getAttribute('data-scroll-animation') || 'fadeInUp';
                
                element.classList.add('animate__animated', `animate__${animationType}`);
                
                // Add custom delay based on position
                const delay = element.getAttribute('data-scroll-delay') || '0';
                element.style.animationDelay = delay + 'ms';
                
                scrollObserver.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements with scroll animation attributes
    document.querySelectorAll('[data-scroll-animation]').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Default scroll animations for common elements
    const defaultScrollElements = document.querySelectorAll(`
        .animate-on-scroll,
        .feature-box:not([data-scroll-animation]),
        .stat-card:not([data-scroll-animation]),
        .leave-type-card:not([data-scroll-animation])
    `);
    
    defaultScrollElements.forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Parallax scroll effect for hero section
    setupParallaxScroll();
}

/**
 * Setup parallax scroll effect
 */
function setupParallaxScroll() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    const parallaxElements = heroSection.querySelectorAll('.feature-card');
    
    const handleScroll = throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.2);
            element.style.transform = `translateY(${rate * speed}px)`;
        });
    }, 16);
    
    window.addEventListener('scroll', handleScroll);
}

/**
 * Initialize particle effects
 */
function initializeParticleEffects() {
    // Add floating particles to hero section
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    createFloatingParticles(heroSection, 20);
}

/**
 * Create floating particles
 */
function createFloatingParticles(container, count = 15) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        
        container.style.position = 'relative';
        container.appendChild(particle);
        particles.push(particle);
        
        animateParticle(particle, container);
    }
}

/**
 * Animate individual particle
 */
function animateParticle(particle, container) {
    const containerRect = container.getBoundingClientRect();
    
    // Random starting position
    particle.style.left = Math.random() * containerRect.width + 'px';
    particle.style.top = Math.random() * containerRect.height + 'px';
    
    // Animation properties
    const duration = Math.random() * 10000 + 10000; // 10-20 seconds
    const deltaX = (Math.random() - 0.5) * 200; // -100 to 100px
    const deltaY = (Math.random() - 0.5) * 200; // -100 to 100px
    
    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear',
        iterations: Infinity,
        direction: 'alternate'
    });
}

/**
 * Setup modal animations
 */
function setupModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function() {
            const modalDialog = this.querySelector('.modal-dialog');
            modalDialog.style.transform = 'scale(0.7) translateY(-50px)';
            modalDialog.style.opacity = '0';
            modalDialog.style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                modalDialog.style.transform = 'scale(1) translateY(0)';
                modalDialog.style.opacity = '1';
            }, 10);
        });
        
        modal.addEventListener('hide.bs.modal', function() {
            const modalDialog = this.querySelector('.modal-dialog');
            modalDialog.style.transform = 'scale(0.7) translateY(-50px)';
            modalDialog.style.opacity = '0';
        });
    });
}

/**
 * Initialize typewriter effect
 */
function initializeTypewriter() {
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    
    typewriterElements.forEach(element => {
        const text = element.getAttribute('data-typewriter');
        const speed = parseInt(element.getAttribute('data-typewriter-speed')) || 100;
        
        typewriterEffect(element, text, speed);
    });
}

/**
 * Typewriter effect
 */
function typewriterEffect(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.animation = 'blink 1s infinite';
    cursor.style.fontWeight = 'lighter';
    
    element.appendChild(cursor);
    
    const timer = setInterval(() => {
        element.textContent = text.slice(0, i);
        element.appendChild(cursor);
        i++;
        
        if (i > text.length) {
            clearInterval(timer);
            setTimeout(() => {
                cursor.remove();
            }, 2000);
        }
    }, speed);
    
    // Add blink animation for cursor
    if (!document.querySelector('#cursor-blink')) {
        const style = document.createElement('style');
        style.id = 'cursor-blink';
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Setup floating elements
 */
function setupFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating, [data-float]');
    
    floatingElements.forEach((element, index) => {
        const duration = 3000 + (Math.random() * 2000); // 3-5 seconds
        const delay = index * 500; // Stagger the animations
        const distance = parseInt(element.getAttribute('data-float-distance')) || 20;
        
        element.style.animation = `float ${duration}ms ease-in-out infinite`;
        element.style.animationDelay = delay + 'ms';
        element.style.setProperty('--float-distance', distance + 'px');
    });
    
    // Add floating keyframes if not exists
    if (!document.querySelector('#floating-animation')) {
        const style = document.createElement('style');
        style.id = 'floating-animation';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(calc(var(--float-distance, -20px))); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Handle reduced motion preferences
 */
function handleReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable or reduce animations
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
        
        // Remove floating animations
        const floatingElements = document.querySelectorAll('.floating, [data-float]');
        floatingElements.forEach(element => {
            element.style.animation = 'none';
        });
        
        // Reduce particle count
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach((particle, index) => {
            if (index % 3 !== 0) {
                particle.remove();
            }
        });
        
        console.log('Reduced motion mode activated');
    }
}

/**
 * Animate number counter
 */
function animateCounter(element, start = 0, end = null, duration = 2000) {
    if (end === null) {
        end = parseInt(element.getAttribute('data-target')) || parseInt(element.textContent);
    }
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.round(current);
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
            clearInterval(timer);
        }
    }, 16);
}

/**
 * Animate progress bar
 */
function animateProgressBar(progressBar, targetWidth, duration = 1500) {
    progressBar.style.width = '0%';
    progressBar.style.transition = `width ${duration}ms ease-in-out`;
    
    setTimeout(() => {
        progressBar.style.width = targetWidth;
    }, 100);
}

/**
 * Create and animate loading skeleton
 */
function createLoadingSkeleton(container, config = {}) {
    const defaults = {
        lines: 3,
        width: '100%',
        height: '1rem',
        borderRadius: '0.25rem',
        backgroundColor: '#f8f9fa',
        animationDuration: '1.5s'
    };
    
    const settings = { ...defaults, ...config };
    
    container.innerHTML = '';
    
    for (let i = 0; i < settings.lines; i++) {
        const skeleton = document.createElement('div');
        skeleton.style.cssText = `
            width: ${Array.isArray(settings.width) ? settings.width[i] || '100%' : settings.width};
            height: ${settings.height};
            background: linear-gradient(90deg, ${settings.backgroundColor} 25%, #e9ecef 50%, ${settings.backgroundColor} 75%);
            background-size: 200% 100%;
            border-radius: ${settings.borderRadius};
            margin-bottom: 0.5rem;
            animation: skeleton-loading ${settings.animationDuration} infinite;
        `;
        container.appendChild(skeleton);
    }
    
    // Add skeleton loading keyframes if not exists
    if (!document.querySelector('#skeleton-loading')) {
        const style = document.createElement('style');
        style.id = 'skeleton-loading';
        style.textContent = `
            @keyframes skeleton-loading {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Throttle function for performance
 */
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Export animation functions for global use
window.Animations = {
    animateCounter,
    animateProgressBar,
    createLoadingSkeleton,
    typewriterEffect,
    staggerAnimateElements,
    createFloatingParticles
};

// Add CSS custom properties for animation control
document.documentElement.style.setProperty('--animation-duration-fast', ANIMATION_CONFIG.duration.fast + 'ms');
document.documentElement.style.setProperty('--animation-duration-normal', ANIMATION_CONFIG.duration.normal + 'ms');
document.documentElement.style.setProperty('--animation-duration-slow', ANIMATION_CONFIG.duration.slow + 'ms');

console.log('Animations.js loaded successfully');
