# College Leave Management System

## Overview

A comprehensive Flask-based web application designed for educational institutions to streamline leave application and approval processes. The system provides role-based access for staff members and administrators, featuring a modern responsive interface with real-time dashboards, calendar views, and automated workflow management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 with Flask for server-side rendering
- **UI Framework**: Bootstrap 5 for responsive design and components
- **Animation Library**: Animate.css for smooth page transitions and element animations
- **Icon System**: Font Awesome for consistent iconography
- **JavaScript Architecture**: Vanilla JavaScript with modular design patterns, organized into separate files for dashboard, animations, and main functionality
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts

### Backend Architecture
- **Web Framework**: Flask with blueprint-based route organization
- **Authentication**: Flask-Login with session-based user management
- **Form Handling**: WTForms with CSRF protection and server-side validation
- **Database ORM**: SQLAlchemy with declarative base model pattern
- **Security**: Password hashing with Werkzeug, proxy fix middleware for production deployment
- **Route Organization**: Modular blueprints (auth, dashboard, leave, admin, main)

### Data Storage Solutions
- **Primary Database**: SQLAlchemy ORM with configurable database backends (SQLite for development, supports PostgreSQL for production)
- **Connection Pooling**: Built-in SQLAlchemy connection pool with ping and recycle settings
- **Model Architecture**: User, LeaveApplication, LeaveType, LeaveBalance, and AuditLog models with proper relationships
- **Data Integrity**: Foreign key constraints and cascade relationships

### Authentication and Authorization
- **User Authentication**: Employee ID and password-based login system
- **Session Management**: Flask-Login for user session handling
- **Role-Based Access**: Two-tier system (staff/admin) with route-level protection
- **Password Security**: Werkzeug password hashing with salt
- **Session Security**: Configurable secret key with environment variable support

### Core Features
- **Leave Application Workflow**: Multi-step application process with approval chain
- **Calendar Integration**: Visual leave calendar with month/year navigation
- **Dashboard Analytics**: Real-time statistics and charts for both staff and admin views
- **Leave Balance Tracking**: Automated calculation of allocated, used, and remaining leave days
- **Audit Trail**: Comprehensive logging of all system actions and changes
- **Responsive Design**: Mobile-optimized interface with progressive enhancement

## External Dependencies

### Frontend Libraries
- **Bootstrap 5**: UI component framework and responsive grid system
- **Font Awesome 6**: Icon library for consistent visual elements
- **Animate.css**: CSS animation library for smooth transitions
- **Custom CSS**: Extensive styling with CSS variables and modern design patterns

### Backend Dependencies
- **Flask**: Core web framework with extension ecosystem
- **Flask-SQLAlchemy**: Database ORM integration
- **Flask-Login**: User session and authentication management
- **Flask-WTF**: Form handling and CSRF protection
- **WTForms**: Form validation and rendering
- **Werkzeug**: WSGI utilities and security functions

### Database Support
- **SQLite**: Default development database (file-based)
- **PostgreSQL**: Production database support (configurable via DATABASE_URL)
- **Connection Pooling**: SQLAlchemy engine options for production scalability

### Deployment Infrastructure
- **Environment Configuration**: Environment variable support for sensitive settings
- **Proxy Support**: ProxyFix middleware for reverse proxy deployments
- **Logging**: Python logging module with configurable levels
- **Static File Serving**: Flask static file handling with CDN fallback support

### Development Tools
- **Debug Mode**: Flask development server with auto-reload
- **Database Migrations**: SQLAlchemy table creation and schema management
- **Form Validation**: Client-side and server-side validation patterns
- **Error Handling**: Comprehensive error pages and logging