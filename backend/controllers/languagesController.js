const db = require("../db");

// GET ALL LANGUAGES
exports.getLanguages = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_languages WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );

    res.json({ languages: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD LANGUAGE
exports.addLanguage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { language_name, proficiency_level, can_speak, can_read, can_write } = req.body;

    if (!language_name || !proficiency_level) {
      return res.status(400).json({ message: "Language name and proficiency level required" });
    }

    // Check duplicate
    const existing = await db.query(
      "SELECT * FROM student_languages WHERE student_id = $1 AND language_name = $2",
      [studentId, language_name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Language already added" });
    }

    const result = await db.query(
      "INSERT INTO student_languages (student_id, language_name, proficiency_level, can_speak, can_read, can_write) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [studentId, language_name, proficiency_level, can_speak || false, can_read || false, can_write || false]
    );

    res.status(201).json({
      message: "Language added",
      language: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE LANGUAGE
exports.updateLanguage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { language_name, proficiency_level, can_speak, can_read, can_write } = req.body;

    const check = await db.query(
      "SELECT * FROM student_languages WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Language not found" });
    }

    const result = await db.query(
      "UPDATE student_languages SET language_name=$1, proficiency_level=$2, can_speak=$3, can_read=$4, can_write=$5 WHERE id=$6 AND student_id=$7 RETURNING *",
      [language_name, proficiency_level, can_speak, can_read, can_write, id, studentId]
    );

    res.json({
      message: "Language updated",
      language: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE LANGUAGE
exports.deleteLanguage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_languages WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Language not found" });
    }

    res.json({ message: "Language deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};