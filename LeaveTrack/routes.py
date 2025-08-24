from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, abort
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime, date, timedelta
from sqlalchemy import and_, or_, extract, func
from werkzeug.security import generate_password_hash
import calendar

from app import db
from models import User, LeaveApplication, LeaveType, LeaveBalance, AuditLog
from forms import (LoginForm, RegistrationForm, LeaveApplicationForm, LeaveApprovalForm, 
                  ProfileUpdateForm, PasswordChangeForm, LeaveTypeForm)
from utils import calculate_working_days, get_leave_statistics, check_leave_conflict, init_leave_balances

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
main_bp = Blueprint('main', __name__)
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')
leave_bp = Blueprint('leave', __name__, url_prefix='/leave')
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Main routes
@main_bp.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('dashboard.admin'))
        else:
            return redirect(url_for('dashboard.staff'))
    return render_template('index.html')

# Authentication routes
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(employee_id=form.employee_id.data).first()
        if user and user.check_password(form.password.data) and user.is_active:
            login_user(user)
            flash('Login successful!', 'success')
            
            # Log the login
            log = AuditLog(user_id=user.id, action='Login', entity_type='User', 
                          entity_id=user.id, ip_address=request.remote_addr)
            db.session.add(log)
            db.session.commit()
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('main.index'))
        else:
            flash('Invalid employee ID or password.', 'error')
    
    return render_template('auth/login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(
            employee_id=form.employee_id.data,
            email=form.email.data,
            first_name=form.first_name.data,
            last_name=form.last_name.data,
            department=form.department.data,
            designation=form.designation.data,
            staff_type=form.staff_type.data,
            phone=form.phone.data,
            address=form.address.data
        )
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        # Initialize leave balances for the new user
        init_leave_balances(user)
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    # Log the logout
    log = AuditLog(user_id=current_user.id, action='Logout', entity_type='User', 
                  entity_id=current_user.id, ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

# Dashboard routes
@dashboard_bp.route('/staff')
@login_required
def staff():
    if current_user.role == 'admin':
        return redirect(url_for('dashboard.admin'))
    
    # Get current year leave statistics
    current_year = datetime.now().year
    stats = get_leave_statistics(current_user.id, current_year)
    
    # Get recent leave applications
    recent_applications = LeaveApplication.query.filter_by(user_id=current_user.id)\
        .order_by(LeaveApplication.applied_at.desc()).limit(5).all()
    
    # Get upcoming leaves
    upcoming_leaves = LeaveApplication.query.filter(
        and_(
            LeaveApplication.user_id == current_user.id,
            LeaveApplication.status == 'approved',
            LeaveApplication.start_date >= date.today()
        )
    ).order_by(LeaveApplication.start_date).limit(3).all()
    
    return render_template('dashboard/staff.html', 
                         stats=stats, 
                         recent_applications=recent_applications,
                         upcoming_leaves=upcoming_leaves)

@dashboard_bp.route('/admin')
@login_required
def admin():
    if current_user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard.staff'))
    
    # Get pending applications
    pending_applications = LeaveApplication.query.filter_by(status='pending')\
        .order_by(LeaveApplication.applied_at.desc()).all()
    
    # Get overall statistics
    total_staff = User.query.filter_by(role='staff', is_active=True).count()
    teaching_staff = User.query.filter_by(staff_type='teaching', is_active=True).count()
    non_teaching_staff = User.query.filter_by(staff_type='non_teaching', is_active=True).count()
    
    current_year = datetime.now().year
    total_applications = LeaveApplication.query.filter(
        extract('year', LeaveApplication.applied_at) == current_year
    ).count()
    
    approved_applications = LeaveApplication.query.filter(
        and_(
            LeaveApplication.status == 'approved',
            extract('year', LeaveApplication.applied_at) == current_year
        )
    ).count()
    
    # Get recent activities
    recent_activities = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(10).all()
    
    stats = {
        'total_staff': total_staff,
        'teaching_staff': teaching_staff,
        'non_teaching_staff': non_teaching_staff,
        'total_applications': total_applications,
        'approved_applications': approved_applications,
        'pending_applications': len(pending_applications)
    }
    
    return render_template('dashboard/admin.html', 
                         stats=stats, 
                         pending_applications=pending_applications,
                         recent_activities=recent_activities)

# Leave management routes
@leave_bp.route('/apply', methods=['GET', 'POST'])
@login_required
def apply():
    form = LeaveApplicationForm(user=current_user)
    
    if form.validate_on_submit():
        # Check for leave conflicts
        conflict = check_leave_conflict(current_user.id, form.start_date.data, form.end_date.data)
        if conflict:
            flash('You have overlapping leave applications for the selected dates.', 'error')
            return render_template('leave/apply.html', form=form)
        
        # Calculate working days
        total_days = calculate_working_days(form.start_date.data, form.end_date.data)
        
        application = LeaveApplication(
            user_id=current_user.id,
            leave_type_id=form.leave_type_id.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
            total_days=total_days,
            reason=form.reason.data,
            contact_during_leave=form.contact_during_leave.data,
            emergency_contact=form.emergency_contact.data,
            medical_certificate_provided=form.medical_certificate_provided.data
        )
        
        db.session.add(application)
        db.session.commit()
        
        # Update pending days in leave balance
        current_year = form.start_date.data.year
        balance = LeaveBalance.query.filter_by(
            user_id=current_user.id,
            leave_type_id=form.leave_type_id.data,
            year=current_year
        ).first()
        
        if balance:
            balance.pending_days += total_days
            db.session.commit()
        
        # Log the action
        log = AuditLog(user_id=current_user.id, action='Leave Application Submitted', 
                      entity_type='LeaveApplication', entity_id=application.id,
                      ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
        
        flash('Leave application submitted successfully!', 'success')
        return redirect(url_for('leave.history'))
    
    return render_template('leave/apply.html', form=form)

@leave_bp.route('/history')
@login_required
def history():
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', 'all')
    
    query = LeaveApplication.query.filter_by(user_id=current_user.id)
    
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    applications = query.order_by(LeaveApplication.applied_at.desc())\
        .paginate(page=page, per_page=10, error_out=False)
    
    return render_template('leave/history.html', 
                         applications=applications, 
                         status_filter=status_filter)

@leave_bp.route('/approve/<int:application_id>', methods=['GET', 'POST'])
@login_required
def approve(application_id):
    if current_user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard.staff'))
    
    application = LeaveApplication.query.get_or_404(application_id)
    
    if application.status != 'pending':
        flash('This application has already been processed.', 'error')
        return redirect(url_for('dashboard.admin'))
    
    form = LeaveApprovalForm()
    
    if form.validate_on_submit():
        old_status = application.status
        application.status = form.status.data
        application.approved_by = current_user.id
        application.approved_at = datetime.utcnow()
        application.comments = form.comments.data
        
        if form.status.data == 'rejected':
            application.rejection_reason = form.rejection_reason.data
        
        # Update leave balance
        balance = LeaveBalance.query.filter_by(
            user_id=application.user_id,
            leave_type_id=application.leave_type_id,
            year=application.start_date.year
        ).first()
        
        if balance:
            balance.pending_days -= application.total_days
            if form.status.data == 'approved':
                balance.used_days += application.total_days
        
        db.session.commit()
        
        # Log the action
        log = AuditLog(user_id=current_user.id, 
                      action=f'Leave Application {form.status.data.title()}', 
                      entity_type='LeaveApplication', entity_id=application.id,
                      old_values=old_status, new_values=form.status.data,
                      ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
        
        flash(f'Leave application {form.status.data} successfully!', 'success')
        return redirect(url_for('dashboard.admin'))
    
    return render_template('leave/approve.html', application=application, form=form)

@leave_bp.route('/cancel/<int:application_id>')
@login_required
def cancel(application_id):
    application = LeaveApplication.query.get_or_404(application_id)
    
    if application.user_id != current_user.id:
        flash('You can only cancel your own applications.', 'error')
        return redirect(url_for('leave.history'))
    
    if application.status != 'pending':
        flash('You can only cancel pending applications.', 'error')
        return redirect(url_for('leave.history'))
    
    old_status = application.status
    application.status = 'cancelled'
    
    # Update leave balance
    balance = LeaveBalance.query.filter_by(
        user_id=current_user.id,
        leave_type_id=application.leave_type_id,
        year=application.start_date.year
    ).first()
    
    if balance:
        balance.pending_days -= application.total_days
    
    db.session.commit()
    
    # Log the action
    log = AuditLog(user_id=current_user.id, action='Leave Application Cancelled', 
                  entity_type='LeaveApplication', entity_id=application.id,
                  old_values=old_status, new_values='cancelled',
                  ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    flash('Leave application cancelled successfully!', 'info')
    return redirect(url_for('leave.history'))

@leave_bp.route('/calendar')
@login_required
def calendar_view():
    year = request.args.get('year', datetime.now().year, type=int)
    month = request.args.get('month', datetime.now().month, type=int)
    
    # Get leaves for the month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    if current_user.role == 'admin':
        # Admin can see all approved leaves
        leaves = LeaveApplication.query.filter(
            and_(
                LeaveApplication.status == 'approved',
                or_(
                    and_(LeaveApplication.start_date <= end_date, LeaveApplication.end_date >= start_date)
                )
            )
        ).all()
    else:
        # Staff can see only their own leaves
        leaves = LeaveApplication.query.filter(
            and_(
                LeaveApplication.user_id == current_user.id,
                LeaveApplication.status.in_(['approved', 'pending']),
                or_(
                    and_(LeaveApplication.start_date <= end_date, LeaveApplication.end_date >= start_date)
                )
            )
        ).all()
    
    # Create calendar data
    cal = calendar.monthcalendar(year, month)
    month_name = calendar.month_name[month]
    
    # Process leaves for calendar display
    leave_data = {}
    for leave in leaves:
        current_date = leave.start_date
        while current_date <= leave.end_date:
            if start_date <= current_date <= end_date:
                if current_date not in leave_data:
                    leave_data[current_date] = []
                leave_data[current_date].append({
                    'application': leave,
                    'type': leave.leave_type.name,
                    'color': leave.leave_type.color_code,
                    'staff': leave.applicant.full_name if current_user.role == 'admin' else None
                })
            current_date += timedelta(days=1)
    
    return render_template('leave/calendar.html', 
                         calendar=cal, 
                         year=year, 
                         month=month, 
                         month_name=month_name,
                         leave_data=leave_data)

# Admin routes
@admin_bp.route('/users')
@login_required
def users():
    if current_user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard.staff'))
    
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    staff_type = request.args.get('staff_type', 'all')
    
    query = User.query.filter_by(is_active=True)
    
    if search:
        query = query.filter(
            or_(
                User.first_name.contains(search),
                User.last_name.contains(search),
                User.employee_id.contains(search),
                User.email.contains(search)
            )
        )
    
    if staff_type != 'all':
        query = query.filter_by(staff_type=staff_type)
    
    users = query.order_by(User.first_name, User.last_name)\
        .paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/users.html', 
                         users=users, 
                         search=search, 
                         staff_type=staff_type)

@admin_bp.route('/leave_types', methods=['GET', 'POST'])
@login_required
def leave_types():
    if current_user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard.staff'))
    
    form = LeaveTypeForm()
    
    if form.validate_on_submit():
        leave_type = LeaveType(
            name=form.name.data,
            description=form.description.data,
            max_days_per_year=form.max_days_per_year.data,
            requires_medical_certificate=form.requires_medical_certificate.data,
            applicable_to_teaching=form.applicable_to_teaching.data,
            applicable_to_non_teaching=form.applicable_to_non_teaching.data,
            color_code=form.color_code.data
        )
        
        db.session.add(leave_type)
        db.session.commit()
        
        flash('Leave type created successfully!', 'success')
        return redirect(url_for('admin.leave_types'))
    
    leave_types = LeaveType.query.filter_by(is_active=True).all()
    return render_template('admin/leave_types.html', form=form, leave_types=leave_types)

def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(leave_bp)
    app.register_blueprint(admin_bp)
