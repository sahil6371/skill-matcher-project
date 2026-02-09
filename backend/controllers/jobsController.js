const db = require("../db");

// Get all active jobs (for students)
exports.getAllJobs = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT jp.*, c.company_name, c.logo_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.id
       WHERE jp.is_active = TRUE
       ORDER BY jp.created_at DESC`
    );
    res.json({ jobs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get job details
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await db.query(
      `SELECT jp.*, c.company_name, c.logo_url, c.company_size, c.industry, c.about
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.id
       WHERE jp.id = $1`,
      [id]
    );

    if (job.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const skills = await db.query(
      "SELECT * FROM job_required_skills WHERE job_id = $1",
      [id]
    );

    res.json({ job: job.rows[0], required_skills: skills.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get company's jobs
exports.getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const result = await db.query(
      "SELECT * FROM job_postings WHERE company_id = $1 ORDER BY created_at DESC",
      [companyId]
    );
    res.json({ jobs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create job
exports.createJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const {
      job_title, job_type, job_mode, location, salary_range,
      description, responsibilities, requirements,
      application_deadline, application_link, required_skills
    } = req.body;

    if (!job_title || !job_type || !job_mode || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await db.query(
      `INSERT INTO job_postings 
       (company_id, job_title, job_type, job_mode, location, salary_range,
        description, responsibilities, requirements, application_deadline, application_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [companyId, job_title, job_type, job_mode, location, salary_range,
       description, responsibilities, requirements, application_deadline, application_link]
    );

    const jobId = job.rows[0].id;

    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await db.query(
          "INSERT INTO job_required_skills (job_id, skill_name, required_level) VALUES ($1, $2, $3)",
          [jobId, skill.skill_name, skill.required_level]
        );
      }
    }

    res.status(201).json({ message: "Job posted", job: job.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update job - FIXED VERSION
exports.updateJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { id } = req.params;

    // 1. Check if job exists and belongs to this company
    const check = await db.query(
      "SELECT * FROM job_postings WHERE id = $1 AND company_id = $2",
      [id, companyId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const currentJob = check.rows[0];

    // 2. Fallback logic: Use existing database values if the request doesn't provide them
    const {
      job_title = currentJob.job_title,
      job_type = currentJob.job_type,
      job_mode = currentJob.job_mode,
      location = currentJob.location,
      salary_range = currentJob.salary_range,
      description = currentJob.description,
      responsibilities = currentJob.responsibilities,
      requirements = currentJob.requirements,
      application_deadline = currentJob.application_deadline,
      application_link = currentJob.application_link,
      is_active = currentJob.is_active
    } = req.body;

    // 3. Perform the update (now guaranteed to have no nulls where they aren't allowed)
    await db.query(
      `UPDATE job_postings 
       SET job_title=$1, job_type=$2, job_mode=$3, location=$4, salary_range=$5,
           description=$6, responsibilities=$7, requirements=$8,
           application_deadline=$9, application_link=$10, is_active=$11
       WHERE id=$12 AND company_id=$13`,
      [
        job_title, job_type, job_mode, location, salary_range,
        description, responsibilities, requirements,
        application_deadline, application_link, is_active, id, companyId
      ]
    );

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error while updating job" });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM job_postings WHERE id = $1 AND company_id = $2 RETURNING *",
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};