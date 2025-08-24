from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, TextAreaField, DateField, IntegerField, BooleanField, HiddenField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError, NumberRange
from wtforms.widgets import TextArea
from datetime import date, datetime
from models import User, LeaveType

class LoginForm(FlaskForm):
    employee_id = StringField('Employee ID', validators=[DataRequired(), Length(min=3, max=20)])
    password = PasswordField('Password', validators=[DataRequired()])

class RegistrationForm(FlaskForm):
    employee_id = StringField('Employee ID', validators=[DataRequired(), Length(min=3, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=2, max=50)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    department = StringField('Department', validators=[DataRequired(), Length(max=100)])
    designation = StringField('Designation', validators=[DataRequired(), Length(max=100)])
    staff_type = SelectField('Staff Type', choices=[('teaching', 'Teaching Staff'), ('non_teaching', 'Non-Teaching Staff')], validators=[DataRequired()])
    phone = StringField('Phone Number', validators=[Length(max=15)])
    address = TextAreaField('Address')
    
    def validate_employee_id(self, employee_id):
        user = User.query.filter_by(employee_id=employee_id.data).first()
        if user:
            raise ValidationError('Employee ID already exists. Please choose a different one.')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use a different email address.')

class LeaveApplicationForm(FlaskForm):
    leave_type_id = SelectField('Leave Type', coerce=int, validators=[DataRequired()])
    start_date = DateField('Start Date', validators=[DataRequired()])
    end_date = DateField('End Date', validators=[DataRequired()])
    reason = TextAreaField('Reason for Leave', validators=[DataRequired(), Length(min=10, max=500)], widget=TextArea())
    contact_during_leave = StringField('Contact Number During Leave', validators=[Length(max=15)])
    emergency_contact = StringField('Emergency Contact', validators=[Length(max=100)])
    medical_certificate_provided = BooleanField('Medical Certificate Provided (if applicable)')
    
    def __init__(self, user=None, *args, **kwargs):
        super(LeaveApplicationForm, self).__init__(*args, **kwargs)
        if user:
            # Filter leave types based on staff type
            leave_types = LeaveType.query.filter(LeaveType.is_active == True)
            if user.staff_type == 'teaching':
                leave_types = leave_types.filter(LeaveType.applicable_to_teaching == True)
            else:
                leave_types = leave_types.filter(LeaveType.applicable_to_non_teaching == True)
            
            self.leave_type_id.choices = [(lt.id, lt.name) for lt in leave_types.all()]
    
    def validate_start_date(self, start_date):
        if start_date.data < date.today():
            raise ValidationError('Start date cannot be in the past.')
    
    def validate_end_date(self, end_date):
        if self.start_date.data and end_date.data < self.start_date.data:
            raise ValidationError('End date must be after start date.')

class LeaveApprovalForm(FlaskForm):
    status = SelectField('Status', choices=[('approved', 'Approve'), ('rejected', 'Reject')], validators=[DataRequired()])
    comments = TextAreaField('Comments', validators=[Length(max=500)])
    rejection_reason = TextAreaField('Rejection Reason (required if rejecting)', validators=[Length(max=500)])
    
    def validate_rejection_reason(self, rejection_reason):
        if self.status.data == 'rejected' and not rejection_reason.data:
            raise ValidationError('Rejection reason is required when rejecting a leave application.')

class ProfileUpdateForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=2, max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Phone Number', validators=[Length(max=15)])
    address = TextAreaField('Address')
    
    def __init__(self, user=None, *args, **kwargs):
        super(ProfileUpdateForm, self).__init__(*args, **kwargs)
        self.user = user
    
    def validate_email(self, email):
        if self.user and email.data != self.user.email:
            user = User.query.filter_by(email=email.data).first()
            if user:
                raise ValidationError('Email already registered. Please use a different email address.')

class PasswordChangeForm(FlaskForm):
    current_password = PasswordField('Current Password', validators=[DataRequired()])
    new_password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
    new_password2 = PasswordField('Confirm New Password', validators=[DataRequired(), EqualTo('new_password')])
    
    def __init__(self, user=None, *args, **kwargs):
        super(PasswordChangeForm, self).__init__(*args, **kwargs)
        self.user = user
    
    def validate_current_password(self, current_password):
        if self.user and not self.user.check_password(current_password.data):
            raise ValidationError('Current password is incorrect.')

class LeaveTypeForm(FlaskForm):
    name = StringField('Leave Type Name', validators=[DataRequired(), Length(min=2, max=50)])
    description = TextAreaField('Description')
    max_days_per_year = IntegerField('Maximum Days Per Year', validators=[NumberRange(min=0, max=365)])
    requires_medical_certificate = BooleanField('Requires Medical Certificate')
    applicable_to_teaching = BooleanField('Applicable to Teaching Staff', default=True)
    applicable_to_non_teaching = BooleanField('Applicable to Non-Teaching Staff', default=True)
    color_code = StringField('Color Code', validators=[Length(min=7, max=7)], default='#007bff')
