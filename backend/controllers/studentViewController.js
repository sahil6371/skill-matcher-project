const db = require("../db");

// Get student profile (for company view)
exports.getStudentProfile = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON sp.student_id = s.id
       WHERE sp.student_id = $1`,
      [student_id]
    );

    res.json({ profile: result.rows.length > 0 ? result.rows[0] : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student education
exports.getStudentEducation = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_education WHERE student_id = $1 ORDER BY start_year DESC",
      [student_id]
    );

    res.json({ education: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student skills
exports.getStudentSkills = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_skills WHERE student_id = $1 ORDER BY created_at DESC",
      [student_id]
    );

    res.json({ skills: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student languages
exports.getStudentLanguages = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_languages WHERE student_id = $1",
      [student_id]
    );

    res.json({ languages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student experience
exports.getStudentExperience = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_experience WHERE student_id = $1 ORDER BY start_date DESC",
      [student_id]
    );

    res.json({ experience: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student projects
exports.getStudentProjects = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_projects WHERE student_id = $1 ORDER BY start_date DESC",
      [student_id]
    );

    res.json({ projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student certifications
exports.getStudentCertifications = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await db.query(
      "SELECT * FROM student_certifications WHERE student_id = $1 ORDER BY issue_date DESC",
      [student_id]
    );

    res.json({ certifications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};