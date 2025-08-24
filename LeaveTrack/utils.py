from datetime import date, timedelta, datetime
from sqlalchemy import and_, or_, extract
from app import db
from models import LeaveApplication, LeaveBalance, LeaveType, User, AuditLog

def calculate_working_days(start_date, end_date):
    """Calculate working days between two dates (excluding weekends)"""
    working_days = 0
    current_date = start_date
    
    while current_date <= end_date:
        # Monday = 0, Sunday = 6
        if current_date.weekday() < 5:  # Monday to Friday
            working_days += 1
        current_date += timedelta(days=1)
    
    return working_days

def check_leave_conflict(user_id, start_date, end_date, exclude_application_id=None):
    """Check if there are any conflicting leave applications"""
    query = LeaveApplication.query.filter(
        and_(
            LeaveApplication.user_id == user_id,
            LeaveApplication.status.in_(['pending', 'approved']),
            or_(
                and_(LeaveApplication.start_date <= end_date, LeaveApplication.end_date >= start_date)
            )
        )
    )
    
    if exclude_application_id:
        query = query.filter(LeaveApplication.id != exclude_application_id)
    
    return query.first() is not None

def get_leave_statistics(user_id, year):
    """Get leave statistics for a user for a specific year"""
    balances = LeaveBalance.query.filter_by(user_id=user_id, year=year).all()
    
    stats = {
        'total_allocated': 0,
        'total_used': 0,
        'total_pending': 0,
        'total_available': 0,
        'by_type': {}
    }
    
    for balance in balances:
        stats['total_allocated'] += balance.allocated_days
        stats['total_used'] += balance.used_days
        stats['total_pending'] += balance.pending_days
        stats['total_available'] += balance.available_days
        
        stats['by_type'][balance.leave_type.name] = {
            'allocated': balance.allocated_days,
            'used': balance.used_days,
            'pending': balance.pending_days,
            'available': balance.available_days,
            'color': balance.leave_type.color_code
        }
    
    return stats

def init_leave_balances(user):
    """Initialize leave balances for a new user"""
    current_year = datetime.now().year
    leave_types = LeaveType.query.filter_by(is_active=True).all()
    
    for leave_type in leave_types:
        # Check if applicable to user's staff type
        if ((user.staff_type == 'teaching' and leave_type.applicable_to_teaching) or
            (user.staff_type == 'non_teaching' and leave_type.applicable_to_non_teaching)):
            
            balance = LeaveBalance(
                user_id=user.id,
                leave_type_id=leave_type.id,
                year=current_year,
                allocated_days=leave_type.max_days_per_year
            )
            db.session.add(balance)
    
    db.session.commit()

def get_monthly_leave_data(year, month):
    """Get leave data for calendar view"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    leaves = LeaveApplication.query.filter(
        and_(
            LeaveApplication.status == 'approved',
            or_(
                and_(LeaveApplication.start_date <= end_date, LeaveApplication.end_date >= start_date)
            )
        )
    ).all()
    
    return leaves

def send_leave_notification(application, action):
    """Send email notification for leave status update"""
    # This would integrate with an email service
    # For now, we'll just log the notification
    print(f"Email notification: Leave application {application.id} has been {action}")

def generate_leave_report(user_id=None, start_date=None, end_date=None, leave_type_id=None):
    """Generate leave report based on filters"""
    query = LeaveApplication.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(LeaveApplication.start_date >= start_date)
    
    if end_date:
        query = query.filter(LeaveApplication.end_date <= end_date)
    
    if leave_type_id:
        query = query.filter_by(leave_type_id=leave_type_id)
    
    return query.order_by(LeaveApplication.applied_at.desc()).all()

def get_dashboard_stats():
    """Get dashboard statistics for admin"""
    current_year = datetime.now().year
    
    total_applications = LeaveApplication.query.filter(
        extract('year', LeaveApplication.applied_at) == current_year
    ).count()
    
    pending_applications = LeaveApplication.query.filter_by(status='pending').count()
    
    approved_applications = LeaveApplication.query.filter(
        and_(
            LeaveApplication.status == 'approved',
            extract('year', LeaveApplication.applied_at) == current_year
        )
    ).count()
    
    rejected_applications = LeaveApplication.query.filter(
        and_(
            LeaveApplication.status == 'rejected',
            extract('year', LeaveApplication.applied_at) == current_year
        )
    ).count()
    
    return {
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'approved_applications': approved_applications,
        'rejected_applications': rejected_applications
    }
