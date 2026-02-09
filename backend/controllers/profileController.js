const db = require("../db");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      "SELECT * FROM student_profiles WHERE student_id = $1",
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }

    res.json({ profile: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// CREATE OR UPDATE PROFILE
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      profile_photo,
      full_name,
      gender,
      date_of_birth,
      mobile,
      current_location,
      country,
      hometown
    } = req.body;

    // STRONG VALIDATIONS
    if (
      !profile_photo ||
      !full_name ||
      !gender ||
      !date_of_birth ||
      !mobile ||
      !current_location ||
      !country ||
      !hometown
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Validate mobile - exactly 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Mobile must be exactly 10 digits" });
    }

    // Validate full name - at least 2 characters
    if (full_name.trim().length < 2) {
      return res.status(400).json({ message: "Full name must be at least 2 characters" });
    }

    // Validate date of birth - must be at least 10 years old
    const dob = new Date(date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 10) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const existing = await db.query(
      "SELECT * FROM student_profiles WHERE student_id = $1",
      [studentId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        `UPDATE student_profiles 
         SET profile_photo=$1, full_name=$2, gender=$3, date_of_birth=$4,
             mobile=$5, current_location=$6, country=$7, hometown=$8
         WHERE student_id=$9`,
        [
          profile_photo,
          full_name.trim(),
          gender,
          date_of_birth,
          mobile,
          current_location.trim(),
          country.trim(),
          hometown.trim(),
          studentId
        ]
      );

      return res.json({ message: "Profile updated" });
    }

    await db.query(
      `INSERT INTO student_profiles
       (student_id, profile_photo, full_name, gender, date_of_birth,
        mobile, current_location, country, hometown)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        studentId,
        profile_photo,
        full_name.trim(),
        gender,
        date_of_birth,
        mobile,
        current_location.trim(),
        country.trim(),
        hometown.trim()
      ]
    );

    res.json({ message: "Profile created" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};