const express = require("express");
const router = express.Router();
const { getMatchedJobs, getMatchedStudents } = require("../controllers/matchingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/jobs", verifyToken, getMatchedJobs);
router.get("/students/:job_id", verifyToken, getMatchedStudents);

module.exports = router;