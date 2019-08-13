const _ = require('lodash');
const Q = require('q');
const Student = require('./student.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Student.count(query).exec(),
    Student.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, students) {
      return res.status(200).json({ total, students });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Student.find(query).limit(limit).exec(function (err, students) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(students);
  });
};

exports.show = function (req, res) {
  Student.findOne({ _id: req.params.id }).populate('classes').exec(function (err, student) {
    if (err) return res.status(500).send(err);

    if (!student) return res.status(404).json({ message: 'Student Not Found!' });
    return res.status(200).json(student);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Student.create(body, function (err, student) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(student);
  });
};

exports.update = function (req, res) {
  Student.findOne({ _id: req.params.id }).exec(function (err, student) {
    if (err) return res.status(500).send(500);
    if (!student) return res.status(404).json({ message: 'Student not Found!' });

    let updated = _.merge(student, req.body);
    updated.markModified('classes');
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(student);
    });
  });
};

exports.destroy = function (req, res) {
  Student.findOne({ _id: req.params.id }).exec(function (err, student) {
    if (err) return res.status(500).send(err);
    if (!student) return res.status(404).json({ message: 'Student Not Found!' });

    student.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};