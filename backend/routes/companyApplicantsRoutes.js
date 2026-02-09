const express = require("express");
const router = express.Router();
const { getAllApplicants } = require("../controllers/companyApplicantsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/all-applicants", verifyToken, getAllApplicants);

module.exports = router;