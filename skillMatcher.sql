-- 1️⃣ STUDENTS TABLE
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 3️⃣ OTP VERIFICATIONS TABLE
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE REFERENCES students(id) ON DELETE CASCADE,

    profile_photo TEXT NOT NULL,

    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male','Female','Other')),
    date_of_birth DATE NOT NULL,
    mobile VARCHAR(15) NOT NULL,

    current_location VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    hometown VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from otp_verifications;
select * from students;
select * from student_profiles;










-- ===============================================
-- COMPLETE DATABASE SCHEMA - SKILL MATCHER
-- Run this entire script at once
-- ===============================================

-- Drop existing tables if you want fresh start (CAREFUL!)
-- DROP TABLE IF EXISTS job_applications CASCADE;
-- DROP TABLE IF EXISTS job_required_skills CASCADE;
-- DROP TABLE IF EXISTS job_postings CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS student_certifications CASCADE;
-- DROP TABLE IF EXISTS student_projects CASCADE;
-- DROP TABLE IF EXISTS student_experience CASCADE;
-- DROP TABLE IF EXISTS student_languages CASCADE;
-- DROP TABLE IF EXISTS student_skills CASCADE;
-- DROP TABLE IF EXISTS student_education CASCADE;

-- ===============================================
-- STUDENT EXTENDED PROFILE TABLES
-- ===============================================

-- 1. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS student_education (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    degree_type VARCHAR(50) NOT NULL CHECK (degree_type IN 
        ('10th', '12th', 'Diploma', 'Bachelor', 'Master', 'PhD')),
    
    field_of_study VARCHAR(100) NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    university_name VARCHAR(200),
    
    start_year INT NOT NULL,
    end_year INT,
    grade_percentage DECIMAL(5,2),
    currently_studying BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SKILLS TABLE
CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN 
        ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LANGUAGES TABLE
CREATE TABLE IF NOT EXISTS student_languages (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    language_name VARCHAR(50) NOT NULL,
    can_speak BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS student_experience (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    job_title VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) CHECK (employment_type IN 
        ('Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract')),
    
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    currently_working BOOLEAN DEFAULT FALSE,
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS student_projects (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    project_title VARCHAR(150) NOT NULL,
    project_type VARCHAR(50) CHECK (project_type IN 
        ('Academic', 'Personal', 'Freelance', 'Open Source', 'Hackathon')),
    
    description TEXT NOT NULL,
    technologies_used TEXT,
    
    start_date DATE,
    end_date DATE,
    
    project_url VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS student_certifications (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    certification_name VARCHAR(150) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    credential_id VARCHAR(100),
    credential_url VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- COMPANY & JOBS TABLES
-- ===============================================

-- 7. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    website_url VARCHAR(255),
    location VARCHAR(100) NOT NULL,
    
    company_size VARCHAR(50) CHECK (company_size IN 
        ('1-10', '11-50', '51-200', '201-500', '500+')),
    
    about TEXT,
    logo_url TEXT,
    
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'company',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. JOB POSTINGS TABLE
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    
    job_title VARCHAR(150) NOT NULL,
    job_type VARCHAR(50) CHECK (job_type IN 
        ('Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract')),
    
    job_mode VARCHAR(50) CHECK (job_mode IN 
        ('Remote', 'On-site', 'Hybrid')),
    
    location VARCHAR(100),
    salary_range VARCHAR(50),
    
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    
    application_deadline DATE,
    application_link VARCHAR(255),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. JOB REQUIRED SKILLS TABLE
CREATE TABLE IF NOT EXISTS job_required_skills (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES job_postings(id) ON DELETE CASCADE,
    
    skill_name VARCHAR(100) NOT NULL,
    required_level VARCHAR(20) CHECK (required_level IN 
        ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES job_postings(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    
    resume_url TEXT,
    cover_letter TEXT,
    
    status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN 
        ('Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted')),
    
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(job_id, student_id)
);

-- ===============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_student_education_student_id ON student_education(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_languages_student_id ON student_languages(student_id);
CREATE INDEX IF NOT EXISTS idx_student_experience_student_id ON student_experience(student_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_student_id ON student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_certifications_student_id ON student_certifications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_required_skills_job_id ON job_required_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON job_applications(student_id);

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count rows in each table (should be 0 initially)
SELECT 
    'student_education' as table_name, COUNT(*) as rows FROM student_education
UNION ALL SELECT 'student_skills', COUNT(*) FROM student_skills
UNION ALL SELECT 'student_languages', COUNT(*) FROM student_languages
UNION ALL SELECT 'student_experience', COUNT(*) FROM student_experience
UNION ALL SELECT 'student_projects', COUNT(*) FROM student_projects
UNION ALL SELECT 'student_certifications', COUNT(*) FROM student_certifications
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'job_postings', COUNT(*) FROM job_postings
UNION ALL SELECT 'job_required_skills', COUNT(*) FROM job_required_skills
UNION ALL SELECT 'job_applications', COUNT(*) FROM job_applications;




-- Add proficiency_level column to student_languages table
ALTER TABLE student_languages 
ADD COLUMN proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('Native', 'Fluent', 'Basic'));





-- Company OTP table (same as students)
CREATE TABLE IF NOT EXISTS company_otp_verifications (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);









