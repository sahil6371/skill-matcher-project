const db = require("../db");

// Get matched jobs for student (based on skills)
exports.getMatchedJobs = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's skills
    const studentSkills = await db.query(
      "SELECT skill_name, proficiency_level FROM student_skills WHERE student_id = $1",
      [studentId]
    );

    if (studentSkills.rows.length === 0) {
      return res.json({ matched_jobs: [] });
    }

    // Get all active jobs with required skills
    const jobs = await db.query(
      `SELECT DISTINCT jp.*, c.company_name, c.logo_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.id
       JOIN job_required_skills jrs ON jp.id = jrs.job_id
       WHERE jp.is_active = TRUE`
    );

    const matchedJobs = [];

    for (const job of jobs.rows) {
      const requiredSkills = await db.query(
        "SELECT skill_name, required_level FROM job_required_skills WHERE job_id = $1",
        [job.id]
      );

      let matchCount = 0;
      let totalRequired = requiredSkills.rows.length;

      for (const reqSkill of requiredSkills.rows) {
        const studentHasSkill = studentSkills.rows.find(
          s => s.skill_name.toLowerCase() === reqSkill.skill_name.toLowerCase()
        );

        if (studentHasSkill) {
          matchCount++;
        }
      }

      const matchPercentage = totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

      if (matchPercentage > 0) {
        matchedJobs.push({
          ...job,
          match_percentage: matchPercentage,
          matched_skills: matchCount,
          total_required: totalRequired
        });
      }
    }

    matchedJobs.sort((a, b) => b.match_percentage - a.match_percentage);

    res.json({ matched_jobs: matchedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get matched students for a job (company view)
// GET MATCHED JOBS FOR STUDENT
exports.getMatchedJobs = async (req, res) => {
  try {
    const studentId = req.user.id;

    const studentSkills = await db.query(
      "SELECT skill_name, proficiency_level FROM student_skills WHERE student_id = $1",
      [studentId]
    );

    if (studentSkills.rows.length === 0) {
      return res.json({ matched_jobs: [] });
    }

    const jobs = await db.query(
      `SELECT DISTINCT jp.*, c.company_name, c.logo_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.id
       JOIN job_required_skills jrs ON jp.id = jrs.job_id
       WHERE jp.is_active = TRUE`
    );

    const matchedJobs = [];

    for (const job of jobs.rows) {
      const requiredSkills = await db.query(
        "SELECT skill_name, required_level FROM job_required_skills WHERE job_id = $1",
        [job.id]
      );

      let matchCount = 0;
      let totalRequired = requiredSkills.rows.length;
      const matchedSkillsList = [];
      const missingSkillsList = [];

      for (const reqSkill of requiredSkills.rows) {
        const studentHasSkill = studentSkills.rows.find(
          s => s.skill_name.toLowerCase().trim() === reqSkill.skill_name.toLowerCase().trim()
        );

        if (studentHasSkill) {
          matchCount++;
          matchedSkillsList.push(reqSkill.skill_name);
        } else {
          missingSkillsList.push(reqSkill.skill_name);
        }
      }

      const matchPercentage = totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

      if (matchPercentage > 0) {
        matchedJobs.push({
          ...job,
          match_percentage: matchPercentage,
          matched_skills: matchCount,
          total_required: totalRequired,
          matched_skills_list: matchedSkillsList,
          missing_skills_list: missingSkillsList
        });
      }
    }

    matchedJobs.sort((a, b) => b.match_percentage - a.match_percentage);

    res.json({ matched_jobs: matchedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MATCHED STUDENTS FOR JOB
exports.getMatchedStudents = async (req, res) => {
  try {
    const { job_id } = req.params;
    const companyId = req.user.id;

    const jobCheck = await db.query(
      "SELECT * FROM job_postings WHERE id = $1 AND company_id = $2",
      [job_id, companyId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const requiredSkills = await db.query(
      "SELECT skill_name, required_level FROM job_required_skills WHERE job_id = $1",
      [job_id]
    );

    if (requiredSkills.rows.length === 0) {
      return res.json({ matched_students: [] });
    }

    const students = await db.query(
      `SELECT s.id, s.email, sp.full_name, sp.profile_photo, sp.mobile, sp.current_location
       FROM students s
       JOIN student_profiles sp ON s.id = sp.student_id`
    );

    const matchedStudents = [];

    for (const student of students.rows) {
      const studentSkills = await db.query(
        "SELECT skill_name, proficiency_level FROM student_skills WHERE student_id = $1",
        [student.id]
      );

      let matchCount = 0;
      let totalRequired = requiredSkills.rows.length;
      const matchedSkillsList = [];
      const missingSkillsList = [];

      for (const reqSkill of requiredSkills.rows) {
        const hasSkill = studentSkills.rows.find(
          s => s.skill_name.toLowerCase().trim() === reqSkill.skill_name.toLowerCase().trim()
        );

        if (hasSkill) {
          matchCount++;
          matchedSkillsList.push(reqSkill.skill_name);
        } else {
          missingSkillsList.push(reqSkill.skill_name);
        }
      }

      const matchPercentage = totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

      if (matchPercentage > 0) {
        matchedStudents.push({
          ...student,
          match_percentage: matchPercentage,
          matched_skills: matchCount,
          total_required: totalRequired,
          matched_skills_list: matchedSkillsList,
          missing_skills_list: missingSkillsList
        });
      }
    }

    matchedStudents.sort((a, b) => b.match_percentage - a.match_percentage);

    res.json({ matched_students: matchedStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};