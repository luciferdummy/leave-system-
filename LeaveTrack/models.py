from datetime import datetime, date
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    staff_type = db.Column(db.String(20), nullable=False)  # 'teaching' or 'non_teaching'
    role = db.Column(db.String(20), default='staff')  # 'staff' or 'admin'
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    date_joined = db.Column(db.Date, default=date.today)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    leave_applications = db.relationship('LeaveApplication', backref='applicant', lazy=True, foreign_keys='LeaveApplication.user_id')
    approved_leaves = db.relationship('LeaveApplication', backref='approver', lazy=True, foreign_keys='LeaveApplication.approved_by')
    leave_balances = db.relationship('LeaveBalance', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f'<User {self.employee_id}: {self.full_name}>'

class LeaveType(db.Model):
    __tablename__ = 'leave_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    max_days_per_year = db.Column(db.Integer, default=0)
    requires_medical_certificate = db.Column(db.Boolean, default=False)
    applicable_to_teaching = db.Column(db.Boolean, default=True)
    applicable_to_non_teaching = db.Column(db.Boolean, default=True)
    color_code = db.Column(db.String(7), default='#007bff')  # Hex color code
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    leave_applications = db.relationship('LeaveApplication', backref='leave_type', lazy=True)
    leave_balances = db.relationship('LeaveBalance', backref='leave_type', lazy=True)
    
    def __repr__(self):
        return f'<LeaveType {self.name}>'

class LeaveApplication(db.Model):
    __tablename__ = 'leave_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    leave_type_id = db.Column(db.Integer, db.ForeignKey('leave_types.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    total_days = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    contact_during_leave = db.Column(db.String(15))
    emergency_contact = db.Column(db.String(100))
    medical_certificate_provided = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'cancelled'
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<LeaveApplication {self.id}: {self.applicant.full_name} - {self.status}>'
    
    @property
    def status_color(self):
        colors = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'cancelled': 'secondary'
        }
        return colors.get(self.status, 'primary')

class LeaveBalance(db.Model):
    __tablename__ = 'leave_balances'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    leave_type_id = db.Column(db.Integer, db.ForeignKey('leave_types.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    allocated_days = db.Column(db.Integer, default=0)
    used_days = db.Column(db.Integer, default=0)
    pending_days = db.Column(db.Integer, default=0)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'leave_type_id', 'year'),)
    
    @property
    def available_days(self):
        return self.allocated_days - self.used_days - self.pending_days
    
    def __repr__(self):
        return f'<LeaveBalance {self.user.full_name} - {self.leave_type.name} - {self.year}>'

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    old_values = db.Column(db.Text)
    new_values = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    
    user = db.relationship('User', backref='audit_logs')
    
    def __repr__(self):
        return f'<AuditLog {self.action} by {self.user.full_name}>'
