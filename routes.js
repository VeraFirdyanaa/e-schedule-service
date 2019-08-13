module.exports = function (app) {
  app.use('/api/students', require('./api/student'));
  app.use('/api/kelas', require('./api/kelas'));
  app.use('/api/course', require('./api/course'));
  app.use('/api/majors', require('./api/major'));
  app.use('/api/users', require('./api/user'));

  app.route('*')
    .get(function (req, res) {
      res.sendFile('build/index.html');
    });
}