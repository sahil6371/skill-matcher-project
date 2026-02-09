const express = require("express");
const router = express.Router();
const { getLanguages, addLanguage, updateLanguage, deleteLanguage } = require("../controllers/languagesController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getLanguages);
router.post("/", verifyToken, addLanguage);
router.put("/:id", verifyToken, updateLanguage);
router.delete("/:id", verifyToken, deleteLanguage);

module.exports = router;