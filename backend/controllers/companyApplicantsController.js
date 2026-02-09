const db = require("../db");

// Get all applicants for all company jobs
exports.getAllApplicants = async (req, res) => {
  try {
    const companyId = req.user.id;

    const result = await db.query(
      `SELECT ja.*, jp.job_title, jp.job_type, sp.full_name, sp.profile_photo, s.email
       FROM job_applications ja
       JOIN job_postings jp ON ja.job_id = jp.id
       JOIN students s ON ja.student_id = s.id
       LEFT JOIN student_profiles sp ON s.id = sp.student_id
       WHERE jp.company_id = $1
       ORDER BY ja.applied_at DESC`,
      [companyId]
    );

    res.json({ applicants: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};