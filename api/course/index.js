const express = require('express');
const router = express.Router();
const controller = require('./course.controller');
const auth = require('../../auth/auth.service');

router.get('/', controller.index);
router.get('/search', controller.search);
router.get('/get-my-courses', auth.isAuthenticated, controller.getLectureCourses);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;