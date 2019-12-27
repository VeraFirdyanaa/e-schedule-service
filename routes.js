module.exports = function (app) {
  app.use('/api/students', require('./api/student'));
  app.use('/api/kelass', require('./api/kelas'));
  app.use('/api/course', require('./api/course'));
  app.use('/api/majors', require('./api/major'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/employees', require('./api/employee'));
  app.use('/api/departments', require('./api/department'));
  app.use('/api/lectures', require('./api/lecture'));
  app.use('/api/courses', require('./api/course'));
  app.use('/api/teachingPlans', require('./api/teachingPlan'));
  app.use('/api/studyYears', require('./api/studyYear'));
  app.use('/api/schedules', require('./api/schedule'));
  app.use('/api/rooms', require('./api/room'));
  app.use('/api/broadcasts', require('./api/tpBroadcast'));

  // app.route('*')
  //   .get(function (req, res) {
  //     res.sendFile('build/index.html');
  //   });
}