/**
 * College Leave Management System
 * Dashboard JavaScript File
 * Handles dashboard-specific functionality and real-time updates
 */

// Dashboard configuration
const DASHBOARD_CONFIG = {
    refreshInterval: 30000, // 30 seconds
    chartColors: {
        primary: '#007bff',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    },
    animations: {
        countUp: 2000,
        chartDraw: 1500,
        cardFlip: 600
    }
};

// Dashboard state
let dashboardState = {
    lastUpdate: null,
    autoRefresh: false,
    charts: {},
    counters: {},
    notifications: []
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDashboardEventListeners();
    initializeCharts();
    setupRealTimeUpdates();
    initializeDashboardAnimations();
    setupStatisticsCards();
});

/**
 * Initialize dashboard functionality
 */
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Detect dashboard type
    const dashboardType = detectDashboardType();
    console.log('Dashboard type:', dashboardType);
    
    // Initialize based on dashboard type
    switch (dashboardType) {
        case 'staff':
            initializeStaffDashboard();
            break;
        case 'admin':
            initializeAdminDashboard();
            break;
        default:
            console.warn('Unknown dashboard type');
    }
    
    // Setup common dashboard features
    setupQuickActions();
    initializeNotifications();
    setupSearchFunctionality();
    initializeCalendarIntegration();
    
    // Mark dashboard as initialized
    document.body.setAttribute('data-dashboard-initialized', 'true');
    
    console.log('Dashboard initialized successfully');
}

/**
 * Detect dashboard type
 */
function detectDashboardType() {
    if (document.querySelector('.page-header h1').textContent.includes('Admin')) {
        return 'admin';
    } else if (document.querySelector('.stat-card')) {
        return 'staff';
    }
    return 'unknown';
}

/**
 * Initialize staff dashboard
 */
function initializeStaffDashboard() {
    console.log('Setting up staff dashboard...');
    
    // Initialize leave balance charts
    initializeLeaveBalanceCharts();
    
    // Setup upcoming leaves timeline
    setupUpcomingLeavesTimeline();
    
    // Initialize application status tracking
    initializeApplicationStatusTracking();
    
    // Setup quick apply functionality
    setupQuickApply();
}

/**
 * Initialize admin dashboard
 */
function initializeAdminDashboard() {
    console.log('Setting up admin dashboard...');
    
    // Initialize admin statistics
    initializeAdminStatistics();
    
    // Setup pending approvals management
    setupPendingApprovalsManagement();
    
    // Initialize system overview charts
    initializeSystemOverviewCharts();
    
    // Setup bulk actions
    setupBulkActions();
    
    // Initialize activity monitoring
    initializeActivityMonitoring();
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Refresh button
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="refresh"]')) {
            e.preventDefault();
            refreshDashboard();
        }
    });
    
    // Auto-refresh toggle
    document.addEventListener('change', function(e) {
        if (e.target.matches('[data-toggle="auto-refresh"]')) {
            toggleAutoRefresh(e.target.checked);
        }
    });
    
    // Quick action buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-quick-action]')) {
            e.preventDefault();
            handleQuickAction(e.target.getAttribute('data-quick-action'));
        }
    });
    
    // Statistics card interactions
    document.addEventListener('click', function(e) {
        const statCard = e.target.closest('.stat-card');
        if (statCard) {
            handleStatCardClick(statCard);
        }
    });
}

/**
 * Initialize charts
 */
function initializeCharts() {
    // Leave balance donut chart
    initializeLeaveBalanceChart();
    
    // Application trends line chart
    initializeApplicationTrendsChart();
    
    // Department statistics bar chart
    initializeDepartmentChart();
    
    // Status distribution pie chart
    initializeStatusDistributionChart();
}

/**
 * Initialize leave balance chart
 */
function initializeLeaveBalanceChart() {
    const chartContainer = document.getElementById('leaveBalanceChart');
    if (!chartContainer) return;
    
    // Create chart using CSS and animations instead of external libraries
    const chartData = extractLeaveBalanceData();
    createDonutChart(chartContainer, chartData);
}

/**
 * Create donut chart with CSS
 */
function createDonutChart(container, data) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    container.innerHTML = '';
    container.className = 'donut-chart';
    container.style.cssText = `
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto;
    `;
    
    data.forEach((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        
        const segment = document.createElement('div');
        segment.className = 'chart-segment';
        segment.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                ${item.color} 0deg ${angle}deg,
                transparent ${angle}deg 360deg
            );
            transform: rotate(${currentAngle}deg);
            transition: all 0.8s ease-in-out;
        `;
        
        container.appendChild(segment);
        currentAngle += angle;
        
        // Animate segment
        setTimeout(() => {
            segment.style.opacity = '1';
            segment.style.transform = `rotate(${currentAngle - angle}deg) scale(1)`;
        }, index * 200);
    });
    
    // Add center circle
    const center = document.createElement('div');
    center.className = 'chart-center';
    center.style.cssText = `
        position: absolute;
        top: 25%;
        left: 25%;
        width: 50%;
        height: 50%;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--primary-color);
    `;
    center.textContent = total;
    container.appendChild(center);
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.style.cssText = `
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    `;
    
    data.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
            width: 16px;
            height: 16px;
            background: ${item.color};
            border-radius: 2px;
        `;
        
        const label = document.createElement('span');
        label.textContent = `${item.label} (${item.value})`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    container.appendChild(legend);
}

/**
 * Extract leave balance data from DOM
 */
function extractLeaveBalanceData() {
    const data = [];
    const balanceItems = document.querySelectorAll('.leave-balance-item');
    
    balanceItems.forEach(item => {
        const typeElement = item.querySelector('h6');
        const badgeElement = item.querySelector('.badge');
        const progressElement = item.querySelector('.progress-bar');
        
        if (typeElement && badgeElement && progressElement) {
            const label = typeElement.textContent.trim();
            const values = badgeElement.textContent.match(/(\d+)\/(\d+)/);
            const color = progressElement.style.backgroundColor || 
                         getComputedStyle(progressElement).backgroundColor ||
                         DASHBOARD_CONFIG.chartColors.primary;
            
            if (values) {
                data.push({
                    label: label,
                    value: parseInt(values[1]) - parseInt(values[2]), // available
                    color: color
                });
            }
        }
    });
    
    return data;
}

/**
 * Initialize application trends chart
 */
function initializeApplicationTrendsChart() {
    const chartContainer = document.getElementById('applicationTrendsChart');
    if (!chartContainer) return;
    
    // Create line chart with CSS animations
    const trendData = generateMockTrendData();
    createLineChart(chartContainer, trendData);
}

/**
 * Create line chart with CSS
 */
function createLineChart(container, data) {
    container.innerHTML = '';
    container.className = 'line-chart';
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 300px;
        background: linear-gradient(to top, rgba(0, 123, 255, 0.1) 0%, transparent 50%);
        border-radius: 0.5rem;
        padding: 1rem;
    `;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const chartWidth = container.offsetWidth - 32; // Minus padding
    const chartHeight = 250;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
        position: absolute;
        top: 1rem;
        left: 1rem;
        width: ${chartWidth}px;
        height: ${chartHeight}px;
        overflow: visible;
    `;
    
    // Create path
    let pathData = '';
    data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - (point.value / maxValue) * chartHeight;
        
        if (index === 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', DASHBOARD_CONFIG.chartColors.primary);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.style.strokeDasharray = '1000';
    path.style.strokeDashoffset = '1000';
    path.style.animation = 'draw-line 2s ease-out forwards';
    
    svg.appendChild(path);
    container.appendChild(svg);
    
    // Add draw animation
    if (!document.querySelector('#line-chart-animation')) {
        const style = document.createElement('style');
        style.id = 'line-chart-animation';
        style.textContent = `
            @keyframes draw-line {
                to {
                    stroke-dashoffset: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Generate mock trend data (replace with real data)
 */
function generateMockTrendData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
        label: month,
        value: Math.floor(Math.random() * 50) + 10
    }));
}

/**
 * Setup real-time updates
 */
function setupRealTimeUpdates() {
    // Auto-refresh functionality
    let refreshInterval;
    
    window.startAutoRefresh = function() {
        if (refreshInterval) return;
        
        refreshInterval = setInterval(() => {
            refreshDashboardData();
        }, DASHBOARD_CONFIG.refreshInterval);
        
        dashboardState.autoRefresh = true;
        console.log('Auto-refresh started');
    };
    
    window.stopAutoRefresh = function() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        
        dashboardState.autoRefresh = false;
        console.log('Auto-refresh stopped');
    };
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoRefresh();
        } else if (dashboardState.autoRefresh) {
            startAutoRefresh();
        }
    });
}

/**
 * Toggle auto-refresh
 */
function toggleAutoRefresh(enabled) {
    if (enabled) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
}

/**
 * Refresh dashboard data
 */
function refreshDashboardData() {
    console.log('Refreshing dashboard data...');
    
    // Show loading indicator
    const refreshButton = document.querySelector('[data-action="refresh"]');
    if (refreshButton) {
        const icon = refreshButton.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sync-alt fa-spin';
        }
    }
    
    // Simulate data refresh (replace with actual API calls)
    setTimeout(() => {
        // Update statistics
        updateStatisticsCards();
        
        // Update charts
        updateCharts();
        
        // Update notifications
        updateNotifications();
        
        // Update timestamp
        dashboardState.lastUpdate = new Date();
        updateLastRefreshTime();
        
        // Reset refresh button
        if (refreshButton) {
            const icon = refreshButton.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sync-alt';
            }
        }
        
        console.log('Dashboard data refreshed');
    }, 1000);
}

/**
 * Update statistics cards with animation
 */
function updateStatisticsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        const numberElement = card.querySelector('.stat-number');
        if (!numberElement) return;
        
        // Simulate new data (replace with actual data)
        const currentValue = parseInt(numberElement.textContent);
        const newValue = currentValue + Math.floor(Math.random() * 5) - 2;
        
        // Animate counter
        animateNumber(numberElement, currentValue, Math.max(0, newValue), 1000);
        
        // Add update animation to card
        setTimeout(() => {
            card.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }, index * 200);
    });
}

/**
 * Animate number change
 */
function animateNumber(element, start, end, duration) {
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
 * Update charts
 */
function updateCharts() {
    // Update leave balance chart
    const leaveBalanceChart = document.getElementById('leaveBalanceChart');
    if (leaveBalanceChart) {
        const newData = extractLeaveBalanceData();
        createDonutChart(leaveBalanceChart, newData);
    }
    
    // Update other charts as needed
    Object.keys(dashboardState.charts).forEach(chartId => {
        const chart = dashboardState.charts[chartId];
        if (chart && chart.update) {
            chart.update();
        }
    });
}

/**
 * Initialize dashboard animations
 */
function initializeDashboardAnimations() {
    // Animate statistics cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Animate counters
    animateStatCounters();
    
    // Animate progress bars
    animateProgressBars();
}

/**
 * Animate statistic counters
 */
function animateStatCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                const element = entry.target;
                const targetValue = parseInt(element.textContent);
                
                // Start from 0 and animate to target
                animateNumber(element, 0, targetValue, DASHBOARD_CONFIG.animations.countUp);
                element.setAttribute('data-animated', 'true');
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animate progress bars
 */
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                const progressBar = entry.target;
                const targetWidth = progressBar.style.width || '0%';
                
                progressBar.style.width = '0%';
                progressBar.style.transition = 'width 1.5s ease-out';
                
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 100);
                
                progressBar.setAttribute('data-animated', 'true');
                observer.unobserve(progressBar);
            }
        });
    });
    
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

/**
 * Setup quick actions
 */
function setupQuickActions() {
    const quickActionButtons = document.querySelectorAll('[data-quick-action]');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.classList.remove('animate__animated', 'animate__pulse');
            }, 600);
        });
    });
}

/**
 * Handle quick action
 */
function handleQuickAction(action) {
    switch (action) {
        case 'apply-leave':
            window.location.href = '/leave/apply';
            break;
        case 'view-calendar':
            window.location.href = '/leave/calendar';
            break;
        case 'view-history':
            window.location.href = '/leave/history';
            break;
        case 'manage-users':
            window.location.href = '/admin/users';
            break;
        case 'leave-types':
            window.location.href = '/admin/leave_types';
            break;
        default:
            console.warn('Unknown quick action:', action);
    }
}

/**
 * Handle stat card click
 */
function handleStatCardClick(card) {
    // Add flip animation
    card.style.transform = 'rotateY(180deg)';
    card.style.transition = 'transform 0.6s';
    
    setTimeout(() => {
        card.style.transform = 'rotateY(0deg)';
    }, 600);
    
    // Navigate based on card type (could be enhanced)
    const statLabel = card.querySelector('.stat-label');
    if (statLabel) {
        const label = statLabel.textContent.toLowerCase();
        if (label.includes('pending')) {
            // Navigate to pending applications
            console.log('Navigate to pending applications');
        } else if (label.includes('approved')) {
            // Navigate to approved applications
            console.log('Navigate to approved applications');
        }
    }
}

/**
 * Setup statistics cards interactions
 */
function setupStatisticsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // Add click effects
        card.addEventListener('click', function() {
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.classList.remove('animate__animated', 'animate__pulse');
            }, 600);
        });
    });
}

/**
 * Initialize notifications
 */
function initializeNotifications() {
    // Setup notification polling
    setInterval(checkForNotifications, 60000); // Check every minute
    
    // Initial notification check
    checkForNotifications();
}

/**
 * Check for new notifications
 */
function checkForNotifications() {
    // Simulate notification checking (replace with actual API call)
    const notifications = [
        {
            type: 'info',
            message: 'Your leave application has been approved',
            timestamp: new Date(),
            read: false
        }
    ];
    
    notifications.forEach(notification => {
        if (!notification.read) {
            showNotification(notification.message, notification.type);
        }
    });
}

/**
 * Update notifications
 */
function updateNotifications() {
    // Update notification indicators
    const notificationBadges = document.querySelectorAll('.notification-badge');
    notificationBadges.forEach(badge => {
        // Simulate new notification count
        const count = Math.floor(Math.random() * 5);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    });
}

/**
 * Setup search functionality
 */
function setupSearchFunctionality() {
    const searchInputs = document.querySelectorAll('[data-search]');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.toLowerCase();
            const target = this.getAttribute('data-search');
            
            searchTimeout = setTimeout(() => {
                performSearch(query, target);
            }, 300);
        });
    });
}

/**
 * Perform search
 */
function performSearch(query, target) {
    const searchableElements = document.querySelectorAll(`[data-searchable="${target}"]`);
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        const matches = text.includes(query);
        
        element.style.display = matches || query === '' ? '' : 'none';
        
        if (matches && query !== '') {
            element.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                element.classList.remove('animate__animated', 'animate__pulse');
            }, 600);
        }
    });
}

/**
 * Initialize calendar integration
 */
function initializeCalendarIntegration() {
    // Add calendar event handlers if calendar exists
    const calendar = document.querySelector('.calendar-container');
    if (calendar) {
        setupCalendarInteractions();
    }
}

/**
 * Setup calendar interactions
 */
function setupCalendarInteractions() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Highlight selected day
            calendarDays.forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            
            // Add selection animation
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.classList.remove('animate__animated', 'animate__pulse');
            }, 600);
        });
        
        day.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.zIndex = '10';
        });
        
        day.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '';
        });
    });
}

/**
 * Update last refresh time
 */
function updateLastRefreshTime() {
    const timestampElements = document.querySelectorAll('[data-last-refresh]');
    
    timestampElements.forEach(element => {
        const now = new Date();
        element.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    });
}

/**
 * Refresh entire dashboard
 */
function refreshDashboard() {
    console.log('Refreshing entire dashboard...');
    
    // Show loading
    if (window.showLoading) {
        showLoading('Refreshing dashboard...');
    }
    
    // Refresh all components
    Promise.all([
        refreshDashboardData(),
        updateCharts(),
        updateNotifications()
    ]).then(() => {
        if (window.hideLoading) {
            hideLoading();
        }
        
        // Show success notification
        if (window.LeaveManagement && window.LeaveManagement.showNotification) {
            window.LeaveManagement.showNotification('Dashboard refreshed successfully!', 'success');
        }
    }).catch(error => {
        console.error('Dashboard refresh failed:', error);
        
        if (window.hideLoading) {
            hideLoading();
        }
        
        if (window.LeaveManagement && window.LeaveManagement.showNotification) {
            window.LeaveManagement.showNotification('Failed to refresh dashboard', 'error');
        }
    });
}

// Export dashboard functions for global use
window.Dashboard = {
    refresh: refreshDashboard,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    updateStatisticsCards,
    animateNumber,
    createDonutChart,
    createLineChart
};

console.log('Dashboard.js loaded successfully');
