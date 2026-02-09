const express = require("express");
const router = express.Router();
const { getExperience, addExperience, updateExperience, deleteExperience } = require("../controllers/experienceController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getExperience);
router.post("/", verifyToken, addExperience);
router.put("/:id", verifyToken, updateExperience);
router.delete("/:id", verifyToken, deleteExperience);

module.exports = router;