const db = require("../db");

exports.getProfile = async (req, res) => {
  try {
    const companyId = req.user.id;

    const result = await db.query(
      "SELECT id, email, company_name, industry, website_url, location, company_size, about, logo_url FROM companies WHERE id = $1",
      [companyId]
    );

    res.json({ profile: result.rows.length > 0 ? result.rows[0] : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { company_name, industry, website_url, location, company_size, about, logo_url } = req.body;

    if (!company_name || !industry || !location || !company_size) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.query(
      `UPDATE companies 
       SET company_name=$1, industry=$2, website_url=$3, location=$4,
           company_size=$5, about=$6, logo_url=$7
       WHERE id=$8`,
      [company_name, industry, website_url, location, company_size, about, logo_url, companyId]
    );

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};