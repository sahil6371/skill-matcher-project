const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/companyProfileController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getProfile);
router.post("/", verifyToken, updateProfile);

module.exports = router;