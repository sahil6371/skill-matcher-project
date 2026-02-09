const express = require("express");
const router = express.Router();
const { getProjects, addProject, updateProject, deleteProject } = require("../controllers/projectsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getProjects);
router.post("/", verifyToken, addProject);
router.put("/:id", verifyToken, updateProject);
router.delete("/:id", verifyToken, deleteProject);

module.exports = router;