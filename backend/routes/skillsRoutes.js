const express = require("express");
const router = express.Router();

const {
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill
} = require("../controllers/skillsController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getSkills);
router.post("/", verifyToken, addSkill);
router.put("/:id", verifyToken, updateSkill);
router.delete("/:id", verifyToken, deleteSkill);

module.exports = router;