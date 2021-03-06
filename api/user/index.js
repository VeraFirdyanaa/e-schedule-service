const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');

router.get('/', controller.index);
router.get('/search', controller.search);
router.get('/me', auth.isAuthenticated, controller.me);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/login', controller.authenticate);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;