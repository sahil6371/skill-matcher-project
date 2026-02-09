const db = require("../db");

// Student applies to job
exports.applyToJob = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { job_id, cover_letter, resume_url } = req.body;

    if (!job_id) {
      return res.status(400).json({ message: "Job ID required" });
    }

    // Check if already applied
    const existing = await db.query(
      "SELECT * FROM job_applications WHERE job_id = $1 AND student_id = $2",
      [job_id, studentId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const result = await db.query(
      "INSERT INTO job_applications (job_id, student_id, cover_letter, resume_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [job_id, studentId, cover_letter, resume_url]
    );

    res.status(201).json({ message: "Application submitted", application: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student's applications
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `SELECT ja.*, jp.job_title, jp.job_type, c.company_name, c.logo_url
       FROM job_applications ja
       JOIN job_postings jp ON ja.job_id = jp.id
       JOIN companies c ON jp.company_id = c.id
       WHERE ja.student_id = $1
       ORDER BY ja.applied_at DESC`,
      [studentId]
    );

    res.json({ applications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get applicants for a job (company view)
exports.getJobApplicants = async (req, res) => {
  try {
    const { job_id } = req.params;
    const companyId = req.user.id;

    // Verify job belongs to company
    const jobCheck = await db.query(
      "SELECT * FROM job_postings WHERE id = $1 AND company_id = $2",
      [job_id, companyId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const result = await db.query(
      `SELECT ja.*, sp.full_name, sp.profile_photo, s.email
       FROM job_applications ja
       JOIN students s ON ja.student_id = s.id
       LEFT JOIN student_profiles sp ON s.id = sp.student_id
       WHERE ja.job_id = $1
       ORDER BY ja.applied_at DESC`,
      [job_id]
    );

    res.json({ applicants: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update application status (company)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      "UPDATE job_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [status, id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};