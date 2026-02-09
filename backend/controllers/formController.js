const db = require("../db");
const nodemailer = require("nodemailer");

exports.handleFormSubmission = async (req, res) => {
    try {
        let { Name, email, skills, location, job_type } = req.body;

        // ---------------- TRIM INPUTS ----------------
        Name = Name?.trim();
        email = email?.trim();
        location = location?.trim();
        job_type = job_type?.trim();
        skills = skills?.trim();

        console.log("After Trim:", { Name, email, skills, location, job_type });

        const skillsArray = skills
            ? skills.split(",").map(s => `%${s.trim()}%`)
            : null;

        // =========================
        // 1️⃣ MATCH BY SKILLS
        // =========================
        const bySkills = await db.query(`
            SELECT DISTINCT jp.id, jp.job_title, jp.job_type, jp.location, c.company_name
            FROM job_postings jp
            JOIN companies c ON jp.company_id = c.id
            WHERE jp.is_active = TRUE
            AND (
                $1::text[] IS NULL
                OR EXISTS (
                    SELECT 1 FROM job_required_skills j
                    WHERE j.job_id = jp.id
                    AND j.skill_name ILIKE ANY($1)
                )
            )
            LIMIT 5
        `, [skillsArray]);

        // =========================
        // 2️⃣ MATCH BY LOCATION
        // =========================
        const byLocation = await db.query(`
            SELECT DISTINCT jp.id, jp.job_title, jp.job_type, jp.location, c.company_name
            FROM job_postings jp
            JOIN companies c ON jp.company_id = c.id
            WHERE jp.is_active = TRUE
            AND ($1 = '' OR TRIM(jp.location) ILIKE '%' || $1 || '%')
            LIMIT 5
        `, [location || ""]);

        // =========================
        // 3️⃣ MATCH BY SKILLS + LOCATION
        // =========================
        const byBoth = await db.query(`
            SELECT DISTINCT jp.id, jp.job_title, jp.job_type, jp.location, c.company_name
            FROM job_postings jp
            JOIN companies c ON jp.company_id = c.id
            WHERE jp.is_active = TRUE
            AND ($1 = '' OR TRIM(jp.location) ILIKE '%' || $1 || '%')
            AND (
                $2::text[] IS NULL
                OR EXISTS (
                    SELECT 1 FROM job_required_skills j
                    WHERE j.job_id = jp.id
                    AND j.skill_name ILIKE ANY($2)
                )
            )
            LIMIT 5
        `, [location || "", skillsArray]);

        console.log("By Skills:", bySkills.rows);
        console.log("By Location:", byLocation.rows);
        console.log("By Both:", byBoth.rows);

        // ---------------- EMAIL SETUP ----------------
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Function to format jobs
        const formatJobs = (jobs) => {
            if (jobs.length === 0) {
                return "<p style='color:gray;'>No matching jobs found.</p>";
            }

            return jobs.map(j => `
                <div style="margin-bottom:15px; padding:12px; border:1px solid #eee; border-radius:8px;">
                    <strong style="font-size:16px;">${j.job_title}</strong> (${j.job_type})<br/>
                    <span>${j.company_name} - ${j.location}</span>
                    <br/><br/>
                    <a href="http://10.121.83.136:5173/login" 
                       style="background:#2563eb; color:white; padding:8px 14px; text-decoration:none; border-radius:5px;">
                       Apply Now
                    </a>
                </div>
            `).join("");
        };

        // ---------------- SEND EMAIL ----------------
        await transporter.sendMail({
            from: `"Skill Matcher" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Personalized Job Matches 🚀",
            html: `
            <div style="font-family:Arial, sans-serif; padding:20px;">
                <h2 style="color:#2563eb;">Hi ${Name},</h2>
                <p>Here are some job opportunities matched for you:</p>

                <h3>🔹 By Skills:</h3>
                ${formatJobs(bySkills.rows)}

                <h3>📍 By Location:</h3>
                ${formatJobs(byLocation.rows)}

                <h3>🎯 By Skills & Location:</h3>
                ${formatJobs(byBoth.rows)}

                <hr style="margin:25px 0;"/>

                <p style="font-size:14px; color:gray;">
                    Want to explore more opportunities?
                </p>

                <a href="http://10.121.83.136:5173/login" 
                   style="background:#16a34a; color:white; padding:10px 18px; text-decoration:none; border-radius:6px; font-weight:bold;">
                   Login & Explore More
                </a>

                <br/><br/>
                <p style="font-size:12px; color:gray;">
                    © 2026 Skill Matcher | All Rights Reserved
                </p>
            </div>
            `
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
