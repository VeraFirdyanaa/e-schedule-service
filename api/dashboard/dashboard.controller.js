var Q = require('q');
var Student = require('../student/student.model');
var Lecture = require('../lecture/lecture.model');
var Course = require('../course/course.model');
var Major = require('../major/major.model');
var Kelas = require('../kelas/kelas.model');
var Room = require('../room/room.model');

exports.analytics = function (req, res) {
  Q.all([
    Student.count(),
    Lecture.count(),
    Course.count(),
    Major.count(),
    Kelas.count(),
    Room.count()
  ]).spread(function (students, lectures, courses, majors, kelas, rooms) {
    res.status(200).json({ students, lectures, courses, majors, kelas, rooms })
  }).catch(function (err) {
    res.status(500).send(err);
  });
}