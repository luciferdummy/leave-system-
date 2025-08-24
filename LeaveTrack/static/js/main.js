/**
 * College Leave Management System
 * Main JavaScript File
 * Handles core functionality and interactions
 */

// Global variables
let isLoading = false;
let notificationTimeout;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeAnimations();
    setupFormValidation();
    initializeTooltips();
    setupScrollAnimations();
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing College Leave Management System...');
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('footer .text-muted');
    if (footerYear) {
        footerYear.textContent = footerYear.textContent.replace('2024', currentYear);
    }
    
    // Initialize loading overlay
    setupLoadingOverlay();
    
    // Setup CSRF token for AJAX requests
    setupCSRFToken();
    
    // Initialize theme
    initializeTheme();
    
    console.log('Application initialized successfully');
}

/**
 * Show loading overlay
 */
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        isLoading = true;
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        isLoading = false;
    }
}

/**
 * Start auto refresh functionality
 */
function startAutoRefresh() {
    console.log('Auto refresh functionality started');
}

/**
 * Stop auto refresh functionality
 */
function stopAutoRefresh() {
    console.log('Auto refresh functionality stopped');
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Global form submission handling
    document.addEventListener('submit', handleFormSubmission);
    
    // Global button click handling
    document.addEventListener('click', handleButtonClicks);
    
    // Global input focus/blur handling
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Window resize handling
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // Back to top button
    setupBackToTop();
    
    // Print functionality
    setupPrintHandling();
}

/**
 * Handle form submissions globally
 */
function handleFormSubmission(event) {
    const form = event.target;
    
    if (!form.matches('form')) return;
    
    // Skip if form has data-no-validation attribute
    if (form.hasAttribute('data-no-validation')) return;
    
    // Add was-validated class for Bootstrap validation
    form.classList.add('was-validated');
    
    // If form is invalid, prevent submission and show animation
    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        
        // Add shake animation to invalid form
        form.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => {
            form.classList.remove('animate__animated', 'animate__shakeX');
        }, 1000);
        
        // Focus first invalid field
        const firstInvalidField = form.querySelector(':invalid');
        if (firstInvalidField) {
            firstInvalidField.focus();
            scrollToElement(firstInvalidField);
        }
        
        showNotification('Please correct the errors in the form', 'error');
        return false;
    }
    
    // Show loading state for submit buttons
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        setButtonLoading(submitButton, true);
    }
}

/**
 * Handle button clicks globally
 */
function handleButtonClicks(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    // Handle loading states
    if (button.classList.contains('animate-btn') && !button.disabled) {
        button.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            button.classList.remove('animate__animated', 'animate__pulse');
        }, 600);
    }
    
    // Handle confirmation buttons
    if (button.hasAttribute('data-confirm')) {
        const message = button.getAttribute('data-confirm');
        if (!confirm(message)) {
            event.preventDefault();
            return false;
        }
    }
    
    // Handle tooltip buttons
    if (button.hasAttribute('title') || button.hasAttribute('data-bs-original-title')) {
        // Hide tooltip after click
        const tooltip = bootstrap.Tooltip.getInstance(button);
        if (tooltip) {
            tooltip.hide();
        }
    }
}

/**
 * Handle input focus events
 */
function handleInputFocus(event) {
    const input = event.target;
    
    if (input.matches('input, select, textarea')) {
        // Add focused class to parent form-floating
        const formFloating = input.closest('.form-floating');
        if (formFloating) {
            formFloating.classList.add('focused');
        }
        
        // Add focus animation
        input.parentElement.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            input.parentElement.classList.remove('animate__animated', 'animate__pulse');
        }, 600);
    }
}

/**
 * Handle input blur events
 */
function handleInputBlur(event) {
    const input = event.target;
    
    if (input.matches('input, select, textarea')) {
        // Remove focused class from parent form-floating if input is empty
        const formFloating = input.closest('.form-floating');
        if (formFloating && !input.value) {
            formFloating.classList.remove('focused');
        }
        
        // Validate field
        validateField(input);
    }
}

/**
 * Validate individual form field
 */
function validateField(field) {
    if (field.checkValidity()) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        // Add success animation
        field.parentElement.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            field.parentElement.classList.remove('animate__animated', 'animate__pulse');
        }, 600);
    } else {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        // Add error animation
        field.parentElement.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => {
            field.parentElement.classList.remove('animate__animated', 'animate__shakeX');
        }, 1000);
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(event) {
    // Escape key handling
    if (event.key === 'Escape') {
        // Close modals
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const modalInstance = bootstrap.Modal.getInstance(openModal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
        
        // Close dropdowns
        const openDropdown = document.querySelector('.dropdown-menu.show');
        if (openDropdown) {
            const dropdownInstance = bootstrap.Dropdown.getInstance(openDropdown.previousElementSibling);
            if (dropdownInstance) {
                dropdownInstance.hide();
            }
        }
    }
    
    // Enter key handling for buttons
    if (event.key === 'Enter' && event.target.matches('button:not([type="submit"])')) {
        event.target.click();
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    // Recalculate calendar layout if on calendar page
    if (document.querySelector('.calendar-container')) {
        recalculateCalendarLayout();
    }
    
    // Adjust mobile navigation
    if (window.innerWidth < 992) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

/**
 * Setup loading overlay
 */
function setupLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    // Show loading overlay
    window.showLoading = function(message = 'Loading...') {
        if (isLoading) return;
        
        isLoading = true;
        const spinner = overlay.querySelector('.loading-spinner p');
        if (spinner) {
            spinner.textContent = message;
        }
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    
    // Hide loading overlay
    window.hideLoading = function() {
        if (!isLoading) return;
        
        isLoading = false;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    };
    
    // Auto-hide loading after 10 seconds (failsafe)
    const autoHideLoading = () => {
        setTimeout(() => {
            if (isLoading) {
                hideLoading();
            }
        }, 10000);
    };
    
    // Listen for loading events
    document.addEventListener('showLoading', (e) => {
        showLoading(e.detail?.message);
        autoHideLoading();
    });
    
    document.addEventListener('hideLoading', hideLoading);
}

/**
 * Setup CSRF token for AJAX requests
 */
function setupCSRFToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        // Set default headers for fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            options.headers = options.headers || {};
            options.headers['X-CSRFToken'] = csrfToken.getAttribute('content');
            return originalFetch(url, options);
        };
    }
}

/**
 * Initialize theme handling
 */
function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Listen for theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Real-time validation for specific fields
    document.addEventListener('input', function(event) {
        const input = event.target;
        
        if (input.matches('input[type="email"]')) {
            validateEmail(input);
        } else if (input.matches('input[type="password"]')) {
            validatePassword(input);
        } else if (input.matches('input[type="date"]')) {
            validateDate(input);
        }
    });
}

/**
 * Validate email field
 */
function validateEmail(input) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(input.value);
    
    if (input.value && !isValid) {
        input.setCustomValidity('Please enter a valid email address');
    } else {
        input.setCustomValidity('');
    }
}

/**
 * Validate password field
 */
function validatePassword(input) {
    const password = input.value;
    const minLength = 6;
    
    let strength = 0;
    let feedback = [];
    
    if (password.length < minLength) {
        feedback.push(`At least ${minLength} characters`);
    } else {
        strength++;
    }
    
    if (!/[a-z]/.test(password)) {
        feedback.push('One lowercase letter');
    } else {
        strength++;
    }
    
    if (!/[A-Z]/.test(password)) {
        feedback.push('One uppercase letter');
    } else {
        strength++;
    }
    
    if (!/\d/.test(password)) {
        feedback.push('One number');
    } else {
        strength++;
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        feedback.push('One special character');
    } else {
        strength++;
    }
    
    // Update password strength indicator if exists
    const strengthIndicator = input.parentElement.querySelector('.password-strength');
    if (strengthIndicator) {
        updatePasswordStrength(strengthIndicator, strength, feedback);
    }
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(indicator, strength, feedback) {
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    
    const level = Math.min(strength, 4);
    indicator.textContent = `Strength: ${strengthLevels[level]}`;
    indicator.style.color = strengthColors[level];
    
    if (feedback.length > 0) {
        indicator.title = 'Missing: ' + feedback.join(', ');
    } else {
        indicator.title = 'Strong password!';
    }
}

/**
 * Validate date field
 */
function validateDate(input) {
    const selectedDate = new Date(input.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (input.hasAttribute('data-min-date') && selectedDate < today) {
        input.setCustomValidity('Date cannot be in the past');
    } else {
        input.setCustomValidity('');
    }
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus',
            delay: { show: 500, hide: 100 }
        });
    });
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Setup back to top button
 */
function setupBackToTop() {
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTop.className = 'btn btn-primary back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        transition: var(--transition-base);
    `;
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTop);
    
    // Show/hide on scroll
    window.addEventListener('scroll', debounce(() => {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
            backToTop.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            backToTop.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                backToTop.style.display = 'none';
                backToTop.classList.remove('animate__animated', 'animate__fadeOut', 'animate__fadeIn');
            }, 300);
        }
    }, 100));
}

/**
 * Setup print handling
 */
function setupPrintHandling() {
    document.addEventListener('click', function(event) {
        if (event.target.matches('[data-print]') || event.target.closest('[data-print]')) {
            event.preventDefault();
            const selector = event.target.getAttribute('data-print') || event.target.closest('[data-print]').getAttribute('data-print');
            printElement(selector);
        }
    });
    
    // Add print-specific classes before printing
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('printing');
    });
    
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
    });
}

/**
 * Print specific element
 */
function printElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.error('Element not found for printing:', selector);
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const styles = Array.from(document.stylesheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                return '';
            }
        })
        .join('\n');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print</title>
            <style>${styles}</style>
        </head>
        <body>
            ${element.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        
        if (button.querySelector('.btn-text') && button.querySelector('.btn-loading')) {
            button.querySelector('.btn-text').classList.add('d-none');
            button.querySelector('.btn-loading').classList.remove('d-none');
        } else {
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Loading...
            `;
        }
    } else {
        button.disabled = false;
        
        if (button.querySelector('.btn-text') && button.querySelector('.btn-loading')) {
            button.querySelector('.btn-text').classList.remove('d-none');
            button.querySelector('.btn-loading').classList.add('d-none');
        } else {
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 5000) {
    clearTimeout(notificationTimeout);
    
    // Remove existing notifications
    document.querySelectorAll('.notification-alert').forEach(alert => {
        alert.remove();
    });
    
    const alertTypes = {
        'error': 'danger',
        'success': 'success',
        'warning': 'warning',
        'info': 'info'
    };
    
    const alertClass = alertTypes[type] || 'info';
    const iconClass = {
        'danger': 'exclamation-triangle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${alertClass} alert-dismissible fade show notification-alert animate__animated animate__fadeInDown`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        z-index: 2000;
        min-width: 300px;
        box-shadow: var(--shadow-lg);
    `;
    
    alert.innerHTML = `
        <i class="fas fa-${iconClass[alertClass]} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-hide after duration
    notificationTimeout = setTimeout(() => {
        alert.classList.add('animate__fadeOutUp');
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, duration);
}

/**
 * Scroll to element smoothly
 */
function scrollToElement(element, offset = 100) {
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementTop - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Debounce function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format date for display
 */
function formatDate(date, format = 'short') {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }
    };
    
    return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Calculate working days between two dates
 */
function calculateWorkingDays(startDate, endDate) {
    if (!(startDate instanceof Date)) startDate = new Date(startDate);
    if (!(endDate instanceof Date)) endDate = new Date(endDate);
    
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
}

/**
 * Recalculate calendar layout (placeholder for calendar-specific functionality)
 */
function recalculateCalendarLayout() {
    // This would be implemented for calendar-specific layout adjustments
    console.log('Recalculating calendar layout...');
}

/**
 * Initialize animations
 */
function initializeAnimations() {
    // Stagger animations for cards
    const cards = document.querySelectorAll('.stat-card, .feature-box, .leave-type-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Initialize counter animations
    initializeCounters();
    
    // Initialize progress bar animations
    initializeProgressBars();
}

/**
 * Initialize counter animations
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            counter.textContent = Math.floor(current);
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

/**
 * Initialize progress bar animations
 */
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.style.width || progressBar.getAttribute('aria-valuenow') + '%';
                
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.transition = 'width 1.5s ease-in-out';
                    progressBar.style.width = width;
                }, 100);
                
                observer.unobserve(progressBar);
            }
        });
    });
    
    progressBars.forEach(bar => observer.observe(bar));
}

// Export functions for global use
window.LeaveManagement = {
    showLoading,
    hideLoading,
    showNotification,
    setButtonLoading,
    validateField,
    formatDate,
    calculateWorkingDays,
    scrollToElement,
    debounce,
    throttle
};

console.log('Main.js loaded successfully');
