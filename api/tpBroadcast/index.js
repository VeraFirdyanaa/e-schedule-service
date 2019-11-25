const express = require('express');
const router = express.Router();
const controller = require('./tpBroadcast.controller');

router.get('/', controller.index);
router.get('/expired', controller.checkExpired);
router.post('/', controller.create);
router.post('/refresh-broadcast', controller.reBroadcast);

module.exports = router;