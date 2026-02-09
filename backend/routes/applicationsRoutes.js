const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getStudentApplications,
  getJobApplicants,
  updateApplicationStatus
} = require("../controllers/applicationsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/apply", verifyToken, applyToJob);
router.get("/my-applications", verifyToken, getStudentApplications);
router.get("/job/:job_id", verifyToken, getJobApplicants);
router.put("/:id/status", verifyToken, updateApplicationStatus);

module.exports = router;