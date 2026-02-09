const express = require("express");
const router = express.Router();
const { getCertifications, addCertification, updateCertification, deleteCertification } = require("../controllers/certificationsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getCertifications);
router.post("/", verifyToken, addCertification);
router.put("/:id", verifyToken, updateCertification);
router.delete("/:id", verifyToken, deleteCertification);

module.exports = router;