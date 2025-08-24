#!/usr/bin/env python3
"""
Demo Data Population Script for College Leave Management System
Creates sample users, leave types, and leave applications for hackathon presentation
"""

from datetime import datetime, date, timedelta
import random
from werkzeug.security import generate_password_hash

from app import app, db
from models import User, LeaveType, LeaveApplication, LeaveBalance, AuditLog
from utils import init_leave_balances

# Sample Indian names and departments
INDIAN_NAMES = [
    # Female names
    ('Priya', 'Sharma', 'Female'),
    ('Anita', 'Patel', 'Female'),
    ('Sunita', 'Kumar', 'Female'),
    ('Meera', 'Singh', 'Female'),
    ('Kavya', 'Reddy', 'Female'),
    ('Neha', 'Gupta', 'Female'),
    ('Pooja', 'Joshi', 'Female'),
    ('Ritu', 'Agarwal', 'Female'),
    ('Sonal', 'Mehta', 'Female'),
    ('Divya', 'Verma', 'Female'),
    
    # Male names
    ('Rajesh', 'Kumar', 'Male'),
    ('Amit', 'Singh', 'Male'),
    ('Suresh', 'Patel', 'Male'),
    ('Vikash', 'Sharma', 'Male'),
    ('Arun', 'Gupta', 'Male'),
    ('Manoj', 'Yadav', 'Male'),
    ('Ramesh', 'Mishra', 'Male'),
    ('Sanjay', 'Tiwari', 'Male'),
    ('Deepak', 'Jain', 'Male'),
    ('Prakash', 'Agrawal', 'Male'),
    ('Rohit', 'Bansal', 'Male'),
    ('Nitin', 'Chopra', 'Male'),
    ('Sachin', 'Malhotra', 'Male'),
    ('Ravi', 'Srivastava', 'Male'),
    ('Ashok', 'Pandey', 'Male')
]

DEPARTMENTS = [
    'Computer Science Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English Literature',
    'Business Administration',
    'Commerce',
    'Economics',
    'Library',
    'Administrative Office',
    'Human Resources'
]

POSITIONS = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'HOD',
    'Lecturer',
    'Senior Lecturer',
    'Lab Assistant',
    'Administrative Officer',
    'Librarian',
    'Clerk',
    'Registrar',
    'Dean'
]

LEAVE_REASONS = [
    'Family function and wedding ceremony',
    'Medical treatment and health checkup',
    'Personal work and family emergency',
    'Vacation with family to hometown',
    'Conference and workshop attendance',
    'Research work and academic activities',
    'Son/daughter admission in school',
    'Festival celebration with family',
    'Property related work',
    'Training and skill development program'
]

def create_admin_user():
    """Create admin user with special credentials"""
    admin = User.query.filter_by(employee_id='ADMIN001').first()
    if not admin:
        admin = User(
            employee_id='ADMIN001',
            first_name='System',
            last_name='Administrator',
            email='admin@college.edu',
            phone='9876543210',
            department='Administrative Office',
            designation='System Admin',
            staff_type='non_teaching',
            date_joined=date(2020, 1, 1),
            role='admin',
            is_active=True,
            password_hash=generate_password_hash('admin123')
        )
        db.session.add(admin)
        print("✓ Created admin user: ADMIN001 / admin123")
    else:
        print("✓ Admin user already exists")
    
    return admin

def create_leave_types():
    """Create different types of leaves"""
    leave_types_data = [
        ('Casual Leave', 'Casual leave for personal work', 12, True),
        ('Sick Leave', 'Medical leave for health issues', 10, True),
        ('Earned Leave', 'Annual earned leave', 20, True),
        ('Maternity Leave', 'Maternity leave for female employees', 180, True),
        ('Paternity Leave', 'Paternity leave for male employees', 15, True),
        ('Festival Leave', 'Leave for religious festivals', 5, True),
        ('Study Leave', 'Leave for academic purposes', 30, True),
        ('Emergency Leave', 'Emergency leave for urgent situations', 7, True)
    ]
    
    created_types = []
    for name, description, max_days, is_active in leave_types_data:
        leave_type = LeaveType.query.filter_by(name=name).first()
        if not leave_type:
            leave_type = LeaveType(
                name=name,
                description=description,
                max_days_per_year=max_days,
                is_active=is_active
            )
            db.session.add(leave_type)
            created_types.append(name)
    
    if created_types:
        print(f"✓ Created leave types: {', '.join(created_types)}")
    else:
        print("✓ Leave types already exist")

def create_sample_users():
    """Create sample teaching and non-teaching staff"""
    created_users = []
    
    for i, (first_name, last_name, gender) in enumerate(INDIAN_NAMES, 1):
        employee_id = f"EMP{str(i).zfill(3)}"
        
        # Check if user already exists
        if User.query.filter_by(employee_id=employee_id).first():
            continue
            
        # Generate email
        email = f"{first_name.lower()}.{last_name.lower()}@college.edu"
        
        # Random department and designation
        department = random.choice(DEPARTMENTS)
        designation = random.choice(POSITIONS)
        
        # Determine staff type based on department
        staff_type = 'teaching' if any(word in department.lower() for word in ['engineering', 'mathematics', 'physics', 'chemistry', 'english', 'commerce', 'economics']) else 'non_teaching'
        
        # Random joining date in last 5 years
        joining_date = date.today() - timedelta(days=random.randint(30, 1825))
        
        # Generate phone number
        phone = f"9{random.randint(100000000, 999999999)}"
        
        user = User(
            employee_id=employee_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            department=department,
            designation=designation,
            staff_type=staff_type,
            date_joined=joining_date,
            role='staff',
            is_active=True,
            password_hash=generate_password_hash('password123')
        )
        
        db.session.add(user)
        created_users.append(f"{first_name} {last_name} ({employee_id})")
    
    if created_users:
        print(f"✓ Created {len(created_users)} sample users")
        for user in created_users[:5]:  # Show first 5
            print(f"  - {user}")
        if len(created_users) > 5:
            print(f"  ... and {len(created_users) - 5} more users")
    else:
        print("✓ Sample users already exist")

def create_sample_leave_applications():
    """Create sample leave applications for demo"""
    users = User.query.filter_by(role='staff').all()
    leave_types = LeaveType.query.all()
    
    if not users or not leave_types:
        print("! No users or leave types found. Cannot create applications.")
        return
    
    created_applications = 0
    statuses = ['pending', 'approved', 'rejected']
    
    # Create applications for last 6 months
    for _ in range(30):  # Create 30 sample applications
        user = random.choice(users)
        leave_type = random.choice(leave_types)
        
        # Random date in last 6 months
        start_date = date.today() - timedelta(days=random.randint(0, 180))
        duration = random.randint(1, 7)  # 1-7 days leave
        end_date = start_date + timedelta(days=duration - 1)
        
        # Skip if application already exists for this user and dates
        existing = LeaveApplication.query.filter_by(
            user_id=user.id,
            start_date=start_date,
            end_date=end_date
        ).first()
        
        if existing:
            continue
        
        status = random.choice(statuses)
        reason = random.choice(LEAVE_REASONS)
        
        application = LeaveApplication(
            user_id=user.id,
            leave_type_id=leave_type.id,
            start_date=start_date,
            end_date=end_date,
            total_days=duration,
            reason=reason,
            contact_during_leave=user.phone,
            emergency_contact=f"9{random.randint(100000000, 999999999)}",
            medical_certificate_provided=(leave_type.name == 'Sick Leave'),
            status=status,
            applied_at=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        
        # If approved or rejected, set admin as approver
        if status != 'pending':
            admin = User.query.filter_by(role='admin').first()
            if admin:
                application.approved_by = admin.id
                application.approved_at = application.applied_at + timedelta(days=random.randint(1, 5))
        
        db.session.add(application)
        created_applications += 1
    
    print(f"✓ Created {created_applications} sample leave applications")

def initialize_leave_balances():
    """Initialize leave balances for all users"""
    users = User.query.filter_by(role='staff').all()
    for user in users:
        init_leave_balances(user)  # Pass user object instead of user.id
    print(f"✓ Initialized leave balances for {len(users)} users")

def create_sample_audit_logs():
    """Create sample audit logs for system activity"""
    users = User.query.all()
    actions = [
        'User Login',
        'Profile Updated',
        'Leave Application Submitted',
        'Leave Application Approved',
        'Leave Application Rejected',
        'Password Changed'
    ]
    
    created_logs = 0
    for _ in range(50):  # Create 50 sample logs
        user = random.choice(users)
        action = random.choice(actions)
        timestamp = datetime.now() - timedelta(days=random.randint(0, 30))
        
        log = AuditLog(
            user_id=user.id,
            action=action,
            entity_type='User',  # Required field
            entity_id=user.id,
            timestamp=timestamp,
            ip_address=f"192.168.1.{random.randint(1, 254)}"
        )
        
        db.session.add(log)
        created_logs += 1
    
    print(f"✓ Created {created_logs} sample audit logs")

def main():
    """Main function to populate demo data"""
    print("🚀 Starting demo data population for College Leave Management System...")
    print("=" * 70)
    
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            
            # Create admin user
            create_admin_user()
            
            # Create leave types
            create_leave_types()
            
            # Create sample users
            create_sample_users()
            
            # Commit user creation
            db.session.commit()
            
            # Initialize leave balances (skip if already done)
            # initialize_leave_balances()
            
            # Create sample applications
            create_sample_leave_applications()
            
            # Create audit logs
            create_sample_audit_logs()
            
            # Final commit
            db.session.commit()
            
            print("=" * 70)
            print("✅ Demo data population completed successfully!")
            print("\n🔑 ADMIN CREDENTIALS FOR HACKATHON:")
            print("   Employee ID: ADMIN001")
            print("   Password: admin123")
            print("\n👥 SAMPLE STAFF CREDENTIALS:")
            print("   Employee ID: EMP001, EMP002, EMP003, etc.")
            print("   Password: password123")
            print("\n🎯 Ready for hackathon presentation!")
            
        except Exception as e:
            print(f"❌ Error during data population: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    main()