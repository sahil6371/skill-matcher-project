const db = require("../db");

// GET ALL EDUCATION ENTRIES
exports.getEducation = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_education WHERE student_id = $1 ORDER BY start_year DESC",
      [studentId]
    );

    res.json({ education: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD NEW EDUCATION
exports.addEducation = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      degree_type,
      field_of_study,
      institution_name,
      university_name,
      start_year,
      end_year,
      grade_percentage,
      currently_studying
    } = req.body;

    // Validation
    if (!degree_type || !field_of_study || !institution_name || !start_year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO student_education 
       (student_id, degree_type, field_of_study, institution_name, 
        university_name, start_year, end_year, grade_percentage, currently_studying)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        studentId,
        degree_type,
        field_of_study,
        institution_name,
        university_name || null,
        start_year,
        currently_studying ? null : end_year,
        grade_percentage || null,
        currently_studying || false
      ]
    );

    res.status(201).json({
      message: "Education added",
      education: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EDUCATION
exports.updateEducation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const {
      degree_type,
      field_of_study,
      institution_name,
      university_name,
      start_year,
      end_year,
      grade_percentage,
      currently_studying
    } = req.body;

    // Check ownership
    const check = await db.query(
      "SELECT * FROM student_education WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Education not found" });
    }

    const result = await db.query(
      `UPDATE student_education 
       SET degree_type=$1, field_of_study=$2, institution_name=$3,
           university_name=$4, start_year=$5, end_year=$6,
           grade_percentage=$7, currently_studying=$8
       WHERE id=$9 AND student_id=$10
       RETURNING *`,
      [
        degree_type,
        field_of_study,
        institution_name,
        university_name || null,
        start_year,
        currently_studying ? null : end_year,
        grade_percentage || null,
        currently_studying || false,
        id,
        studentId
      ]
    );

    res.json({
      message: "Education updated",
      education: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EDUCATION
exports.deleteEducation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_education WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.json({ message: "Education deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};