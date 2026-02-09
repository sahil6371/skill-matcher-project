const db = require("../db");

// GET ALL CERTIFICATIONS
exports.getCertifications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_certifications WHERE student_id = $1 ORDER BY issue_date DESC",
      [studentId]
    );

    res.json({ certifications: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD CERTIFICATION
exports.addCertification = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      certification_name,
      issuing_organization,
      issue_date,
      expiry_date,
      credential_id,
      credential_url
    } = req.body;

    if (!certification_name || !issuing_organization || !issue_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO student_certifications 
       (student_id, certification_name, issuing_organization, issue_date,
        expiry_date, credential_id, credential_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        studentId,
        certification_name,
        issuing_organization,
        issue_date,
        expiry_date || null,
        credential_id || null,
        credential_url || null
      ]
    );

    res.status(201).json({
      message: "Certification added",
      certification: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CERTIFICATION
exports.updateCertification = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const {
      certification_name,
      issuing_organization,
      issue_date,
      expiry_date,
      credential_id,
      credential_url
    } = req.body;

    const check = await db.query(
      "SELECT * FROM student_certifications WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Certification not found" });
    }

    const result = await db.query(
      `UPDATE student_certifications 
       SET certification_name=$1, issuing_organization=$2, issue_date=$3,
           expiry_date=$4, credential_id=$5, credential_url=$6
       WHERE id=$7 AND student_id=$8 RETURNING *`,
      [
        certification_name,
        issuing_organization,
        issue_date,
        expiry_date,
        credential_id,
        credential_url,
        id,
        studentId
      ]
    );

    res.json({
      message: "Certification updated",
      certification: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE CERTIFICATION
exports.deleteCertification = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM student_certifications WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Certification not found" });
    }

    res.json({ message: "Certification deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};