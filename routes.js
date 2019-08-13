module.exports = function (app) {
  app.use('/api/students', require('./api/student'));
  app.use('/api/kelas', require('./api/kelas'));
  app.use('/api/course', require('./api/course'));
  app.use('/api/majors', requrie('./api/major'));

  app.route('*')
    .get(function (req, res) {
      res.sendFile('build/index.html');
    });
}