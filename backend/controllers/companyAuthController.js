const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// COMPANY SIGNUP
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await db.query(
      "SELECT * FROM companies WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = await db.query(
      "INSERT INTO companies (email, password, role) VALUES ($1, $2, 'company') RETURNING id, email",
      [email, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful",
      company: newCompany.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// COMPANY LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM companies WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const company = result.rows[0];
    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Company OTP:", otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "INSERT INTO otp_verifications (student_id, otp_code, expires_at) VALUES ($1, $2, $3)",
      [company.id, otp, expiresAt]
    );

    res.json({ message: "OTP sent", otp: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY COMPANY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await db.query("SELECT * FROM companies WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Company not found" });
    }

    const company = result.rows[0];

    const otpResult = await db.query(
      `SELECT * FROM otp_verifications
       WHERE student_id = $1 AND otp_code = $2 AND used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [company.id, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const otpRecord = otpResult.rows[0];
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await db.query("UPDATE otp_verifications SET used = TRUE WHERE id = $1", [otpRecord.id]);

    const token = jwt.sign(
      { id: company.id, email: company.email, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};