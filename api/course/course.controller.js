const _ = require('lodash');
const Q = require('q');
const Course = require('./course.model');
const ObjectId = require('mongoose').Types.ObjectId;

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Course.count(query).exec(),
    Course.find(query).populate('lectures').skip(skip).limit(limit).exec()
  ])
    .spread(function (total, courses) {
      return res.status(200).json({ total, courses });
    })
    .catch(function (err) {
      console.log('err', err);
      if (err) return res.status(500).send(err);
    });
};

exports.getLectureCourses = function (req, res) {
  var query = {
    // "lectures": { $in: ["5dc697c838d7c1140a4d86db"] },
    semester: "ganjil"
  };

  console.log('query you set', query);
  Course.find(query).exec(function (err, courses) {
    if (err) return res.status(500).send(err);

    let myCourses = courses.filter(course => course.lectures.indexOf(req.user.lecture_id) > -1);
    res.status(200).json(myCourses);
  });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Course.find(query).limit(limit).exec(function (err, courses) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(courses);
  });
};

exports.show = function (req, res) {
  Course.findOne({ _id: req.params.id }).populate('lectures').exec(function (err, course) {
    if (err) return res.status(500).send(err);

    if (!course) return res.status(404).json({ message: 'Course Not Found!' });
    return res.status(200).json(course);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Course.create(body, function (err, course) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(course);
  });
};

exports.update = function (req, res) {
  Course.findOne({ _id: req.params.id }).exec(function (err, course) {
    if (err) return res.status(500).send(500);
    if (!course) return res.status(404).json({ message: 'Course not Found!' });

    let updated = _.merge(course, req.body);
    updated.markModified('lectures');
    updated.save(function (err) {
      console.log('err', err);
      if (err) return res.status(500).send(err);

      return res.status(200).json(course);
    });
  });
};

exports.destroy = function (req, res) {
  Course.findOne({ _id: req.params.id }).exec(function (err, course) {
    if (err) return res.status(500).send(err);
    if (!course) return res.status(404).json({ message: 'Course Not Found!' });

    course.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: "Course Deleted!" });
    });
  });
};