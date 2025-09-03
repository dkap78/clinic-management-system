# Clinic Management System

A comprehensive healthcare management system built with Next.js, React, TypeScript, and Supabase. This system provides complete functionality for managing doctors, patients, appointments, medical records, and consultations with AI-powered features.

## ?? Features

### Core Healthcare Management
- **Patient Management**: Complete patient registration, profiles, and medical history tracking
- **Doctor Management**: Doctor profiles, specializations, and availability scheduling
- **Appointment System**: Online/offline booking, calendar view, rescheduling capabilities
- **Medical Records**: Comprehensive patient history, vitals tracking, lab reports
- **Consultation Tools**: Real-time consultation interface with patient history access

### Advanced Features
- **AI-Powered Diagnosis**: Intelligent diagnostic assistance based on patient history
- **Medicine Compatibility**: AI-powered drug interaction and allergy checking
- **Smart Search**: AI-enhanced search functionality across all medical data
- **Template System**: Customizable diagnosis and prescription templates
- **Admin Dashboard**: Complete system administration and user management

### Security & Authentication
- **Role-Based Access Control**: Secure access based on user roles (Admin, Doctor, Staff)
- **Multi-Doctor Association**: Users can be linked to multiple doctors
- **Row Level Security**: Database-level security policies
- **Session Management**: Secure authentication with token refresh

## ??? Technology Stack

### Frontend
- **Next.js 14.2.25** with App Router
- **React 18.2.0** with TypeScript 5
- **Tailwind CSS 4.1.9** for styling
- **shadcn/ui** component library
- **Radix UI** primitives for accessibility

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Next.js API Routes** and Server Actions

### Additional Libraries
- **React Hook Form** with Zod 3.25.76 validation
- **AI SDK** for intelligent features
- **Recharts** for data visualization
- **date-fns** for date manipulation
- **Lucide React** for icons

## ?? Prerequisites

### Development Environment
- **Node.js** 18.17 or later
- **npm** 9.0 or later (or **yarn** 1.22+)
- **Git** for version control

### Required Accounts & Services
- **Supabase Account** (free tier available)
- **Vercel Account** (for deployment - optional)

### Development Tools (Recommended)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

## ?? Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <your-repository-url>
cd clinic-management-system
\`\`\`

### 2. Install Dependencies

**Important**: If you encounter dependency resolution errors, follow these steps:

\`\`\`bash
# Clear any existing cache
npm cache clean --force

# Install dependencies
npm install

# If you get zod version conflicts, try:
npm install --legacy-peer-deps
\`\`\`

**Common Dependency Issues**:
- **Zod Version Conflict**: The AI SDK requires specific zod versions. The project uses zod@3.25.76 which is compatible with all AI packages.
- **React Version**: Uses React 18.2.0 for compatibility with Next.js 14.2.25.

#### Supabase Integration
1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Environment Variables**:
   The following environment variables are automatically configured when you connect Supabase integration in v0:
   \`\`\`
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

### 4. Database Setup

#### Run SQL Scripts in Order
Execute the following SQL scripts in your Supabase SQL editor or through the v0 interface:

1. **Core Tables**: `scripts/001_create_core_tables.sql`
2. **Medical Records**: `scripts/002_create_medical_records_tables.sql`
3. **Templates & Settings**: `scripts/003_create_templates_and_settings.sql`
4. **Security Policies**: `scripts/004_create_rls_policies.sql`
5. **Functions & Triggers**: `scripts/005_create_functions_and_triggers.sql`
6. **Initial Data**: `scripts/006_seed_initial_data.sql`

#### Database Schema Overview
The system creates the following main tables:
- `users` - System users with roles
- `doctors` - Doctor profiles and specializations
- `patients` - Patient information and demographics
- `appointments` - Appointment scheduling and management
- `medical_records` - Patient medical history
- `vitals` - Patient vital signs tracking
- `lab_reports` - Laboratory test results
- `prescriptions` - Medication prescriptions
- `templates` - Diagnosis and prescription templates

## ????? Running the Application

### Development Mode
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be available at `http://localhost:3000`

### Production Build
\`\`\`bash
npm run build
npm run start
# or
yarn build
yarn start
\`\`\`

### Linting
\`\`\`bash
npm run lint
# or
yarn lint
\`\`\`

## ?? Login & Access

### Initial Setup
After running the database scripts, the system includes seed data with sample users and doctors.

### Login Process
1. **Navigate to Login**: Go to `/auth/login`
2. **Enter Credentials**: Use email and password
3. **Select Doctor**: Choose which doctor's data you want to access
4. **Access Dashboard**: You'll be redirected to the main dashboard

### Sample Login Credentials
The seed data includes sample users for testing:

#### Admin User
- **Email**: `admin@clinic.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Access**: Full system access

#### Doctor User
- **Email**: `doctor@clinic.com`
- **Password**: `doctor123`
- **Role**: Doctor
- **Access**: Patient records, appointments, consultations

#### Staff User
- **Email**: `staff@clinic.com`
- **Password**: `staff123`
- **Role**: Staff
- **Access**: Limited to appointments and basic patient info

### User Roles & Permissions

#### Administrator
- Complete system access
- User and doctor management
- System settings and templates
- All patient and medical records
- Analytics and reporting

#### Doctor
- Patient medical records and history
- Appointment management
- Consultation tools and templates
- AI-powered diagnosis assistance
- Prescription and lab report management

#### Staff
- Appointment scheduling
- Basic patient information
- Limited medical record access

## ?? Application Structure

### Main Navigation Areas

#### Dashboard (`/dashboard`)
- System overview and quick stats
- Recent appointments and activities
- Quick access to main features

#### Doctors (`/doctors`)
- Doctor profile management
- Availability scheduling
- Specialization settings

#### Patients (`/patients`)
- Patient registration and profiles
- Medical history overview
- Contact information management

#### Appointments (`/appointments`)
- Appointment booking and management
- Calendar view with availability
- Rescheduling and cancellation

#### Medical Records (`/medical-records`)
- Comprehensive patient history
- Vitals tracking and trends
- Lab reports and results

#### Consultation (`/consultation`)
- Real-time consultation interface
- Patient history during visits
- Template-based diagnosis and prescriptions

#### AI Features (`/ai`)
- AI-powered diagnosis assistance
- Smart search functionality
- Medicine compatibility checking

#### Admin (`/admin`)
- User management and roles
- System settings and configuration
- Analytics and reporting

## ?? Development Guidelines

### Code Structure
- **Components**: Reusable UI components in `/components`
- **Pages**: Next.js app router pages in `/app`
- **Utilities**: Helper functions in `/lib`
- **Types**: TypeScript definitions throughout
- **Styles**: Tailwind CSS with custom components

### Database Operations
- All database operations use Supabase client
- Row Level Security (RLS) enforced on all tables
- Server-side operations for sensitive data
- Client-side operations for UI interactions

### Authentication Flow
- Supabase Auth for user management
- Middleware for session handling
- Role-based access control
- Multi-doctor association support

## ?? Deployment

### Vercel Deployment (Recommended)
1. **Connect Repository**: Link your Git repository to Vercel
2. **Configure Environment**: Add Supabase environment variables
3. **Deploy**: Automatic deployment on push to main branch

### Environment Variables for Production
Ensure all Supabase environment variables are configured in your deployment platform.

## ?? Troubleshooting

### Common Issues

#### Dependency Resolution Errors
**Problem**: npm shows peer dependency conflicts with zod or React versions
**Solution**:
\`\`\`bash
# Delete node_modules and package-lock.json if they exist
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
\`\`\`

#### React Version Conflicts
**Problem**: Next.js 14.2.25 requires React 18, not React 19
**Solution**: The project uses React 18.2.0 for compatibility. Do not upgrade to React 19.

#### AI SDK Integration Issues
**Problem**: @ai-sdk packages require specific zod versions
**Solution**: The project uses zod@3.25.76 which satisfies all AI SDK requirements.

#### Database Connection Errors
- Verify Supabase environment variables
- Check if database scripts have been executed
- Ensure RLS policies are properly configured

#### Authentication Issues
- Confirm email verification is complete
- Check user roles and permissions
- Verify middleware configuration

#### Missing Features
- Ensure all SQL scripts have been executed in order
- Check if seed data has been loaded
- Verify user has appropriate role permissions

### Getting Help
- Check the console for error messages
- Review Supabase logs for database issues
- Ensure all dependencies are installed correctly

## ?? License

This project is licensed under the MIT License - see the LICENSE file for details.

## ?? Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ?? Support

For technical support or questions:
- Check the troubleshooting section above
- Review the Supabase documentation
- Open an issue in the repository

---

**Built with ?? using Next.js, React, TypeScript, and Supabase**
