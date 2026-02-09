const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/google-submit', formController.handleFormSubmission);

module.exports = router;