module.exports = function (app) {
  app.use('/api/students', require('./api/student'));

  app.route('*')
    .get(function (req, res) {
      res.sendFile('build/index.html');
    });
}