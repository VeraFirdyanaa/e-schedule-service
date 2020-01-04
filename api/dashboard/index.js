const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');

router.get('/analytics', controller.analytics);

module.exports = router;