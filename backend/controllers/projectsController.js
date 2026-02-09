const db = require("../db");

// GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_projects WHERE student_id = $1 ORDER BY start_date DESC",
      [studentId]
    );

    res.json({ projects: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD PROJECT
exports.addProject = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      project_title,
      project_type,
      description,
      technologies_used,
      start_date,
      end_date,
      project_url
    } = req.body;

    if (!project_title || !project_type || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO student_projects 
       (student_id, project_title, project_type, description, 
        technologies_used, start_date, end_date, project_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        studentId,
        project_title,
        project_type,
        description,
        technologies_used || null,
        start_date || null,
        end_date || null,
        project_url || null
      ]
    );

    res.status(201).json({
      message: "Project added",
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const {
      project_title,
      project_type,
      description,
      technologies_used,
      start_date,
      end_date,
      project_url
    } = req.body;

    const check = await db.query(
      "SELECT * FROM student_projects WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const result = await db.query(
      `UPDATE student_projects 
       SET project_title=$1, project_type=$2, description=$3,
           technologies_used=$4, start_date=$5, end_date=$6, project_url=$7
       WHERE id=$8 AND student_id=$9 RETURNING *`,
      [
        project_title,
        project_type,
        description,
        technologies_used,
        start_date,
        end_date,
        project_url,
        id,
        studentId
      ]
    );

    res.json({
      message: "Project updated",
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_projects WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};