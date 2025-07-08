const express = require('express');
const router = express.Router();
const { convertTextToSpeech } = require('../controllers/ttsController');

router.post('/', convertTextToSpeech);

module.exports = router;
