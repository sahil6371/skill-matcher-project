const express = require("express");
const router = express.Router();

const {
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation
} = require("../controllers/educationController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getEducation);
router.post("/", verifyToken, addEducation);
router.put("/:id", verifyToken, updateEducation);
router.delete("/:id", verifyToken, deleteEducation);

module.exports = router;