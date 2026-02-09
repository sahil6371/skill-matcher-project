const express = require("express");
const router = express.Router();

const {
  getProfile,
  createOrUpdateProfile
} = require("../controllers/profileController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getProfile);
router.post("/", verifyToken, createOrUpdateProfile);

module.exports = router;
