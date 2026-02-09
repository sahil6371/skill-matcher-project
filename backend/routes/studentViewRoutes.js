const express = require("express");
const router = express.Router();
const {
  getStudentProfile,
  getStudentEducation,
  getStudentSkills,
  getStudentLanguages,
  getStudentExperience,
  getStudentProjects,
  getStudentCertifications
} = require("../controllers/studentViewController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/profile/:student_id", verifyToken, getStudentProfile);
router.get("/education/:student_id", verifyToken, getStudentEducation);
router.get("/skills/:student_id", verifyToken, getStudentSkills);
router.get("/languages/:student_id", verifyToken, getStudentLanguages);
router.get("/experience/:student_id", verifyToken, getStudentExperience);
router.get("/projects/:student_id", verifyToken, getStudentProjects);
router.get("/certifications/:student_id", verifyToken, getStudentCertifications);

module.exports = router;