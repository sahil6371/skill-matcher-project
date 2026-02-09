const db = require("../db");

// GET ALL EXPERIENCE
exports.getExperience = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_experience WHERE student_id = $1 ORDER BY start_date DESC",
      [studentId]
    );

    res.json({ experience: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD EXPERIENCE
exports.addExperience = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      job_title,
      company_name,
      employment_type,
      location,
      start_date,
      end_date,
      currently_working,
      description
    } = req.body;

    if (!job_title || !company_name || !employment_type || !start_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO student_experience 
       (student_id, job_title, company_name, employment_type, location, 
        start_date, end_date, currently_working, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        studentId,
        job_title,
        company_name,
        employment_type,
        location || null,
        start_date,
        currently_working ? null : end_date,
        currently_working || false,
        description || null
      ]
    );

    res.status(201).json({
      message: "Experience added",
      experience: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EXPERIENCE
exports.updateExperience = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const {
      job_title,
      company_name,
      employment_type,
      location,
      start_date,
      end_date,
      currently_working,
      description
    } = req.body;

    const check = await db.query(
      "SELECT * FROM student_experience WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const result = await db.query(
      `UPDATE student_experience 
       SET job_title=$1, company_name=$2, employment_type=$3, location=$4,
           start_date=$5, end_date=$6, currently_working=$7, description=$8
       WHERE id=$9 AND student_id=$10 RETURNING *`,
      [
        job_title,
        company_name,
        employment_type,
        location,
        start_date,
        currently_working ? null : end_date,
        currently_working,
        description,
        id,
        studentId
      ]
    );

    res.json({
      message: "Experience updated",
      experience: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EXPERIENCE
exports.deleteExperience = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_experience WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json({ message: "Experience deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};