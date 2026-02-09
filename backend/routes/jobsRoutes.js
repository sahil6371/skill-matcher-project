const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  getCompanyJobs,
  createJob,
  updateJob,
  deleteJob
} = require("../controllers/jobsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Company routes (protected)
router.get("/company/my-jobs", verifyToken, getCompanyJobs);
router.post("/", verifyToken, createJob);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);

module.exports = router;