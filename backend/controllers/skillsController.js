const db = require("../db");

// GET ALL SKILLS
exports.getSkills = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_skills WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );

    res.json({ skills: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD NEW SKILL
exports.addSkill = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { skill_name, proficiency_level } = req.body;

    if (!skill_name || !proficiency_level) {
      return res.status(400).json({ message: "Skill name and proficiency required" });
    }

    // Check duplicate (case-insensitive)
    const existing = await db.query(
      "SELECT * FROM student_skills WHERE student_id = $1 AND LOWER(skill_name) = LOWER($2)",
      [studentId, skill_name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Skill already added" });
    }

    const result = await db.query(
      "INSERT INTO student_skills (student_id, skill_name, proficiency_level) VALUES ($1, $2, $3) RETURNING *",
      [studentId, skill_name.trim(), proficiency_level]
    );

    res.status(201).json({
      message: "Skill added",
      skill: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// UPDATE SKILL
exports.updateSkill = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { skill_name, proficiency_level } = req.body;

    // Check ownership
    const check = await db.query(
      "SELECT * FROM student_skills WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const result = await db.query(
      "UPDATE student_skills SET skill_name = $1, proficiency_level = $2 WHERE id = $3 AND student_id = $4 RETURNING *",
      [skill_name, proficiency_level, id, studentId]
    );

    res.json({
      message: "Skill updated",
      skill: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE SKILL
exports.deleteSkill = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_skills WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.json({ message: "Skill deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};