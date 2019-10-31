const _ = require('lodash');
const Q = require('q');
const Lecture = require('./lecture.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Lecture.count(query).exec(),
    Lecture.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, lectures) {
      return res.status(200).json({ total, lectures });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Lecture.find(query).limit(limit).exec(function (err, lectures) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(lectures);
  });
};

exports.show = function (req, res) {
  Lecture.findOne({ _id: req.params.id }).populate('classes').exec(function (err, lecture) {
    if (err) return res.status(500).send(err);

    if (!lecture) return res.status(404).json({ message: 'Lecture Not Found!' });
    return res.status(200).json(lecture);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Lecture.create(body, function (err, lecture) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(lecture);
  });
};

exports.update = function (req, res) {
  Lecture.findOne({ _id: req.params.id }).exec(function (err, lecture) {
    if (err) return res.status(500).send(500);
    if (!lecture) return res.status(404).json({ message: 'Lecture not Found!' });

    let updated = _.merge(lecture, req.body);
    updated.markModified('classes');
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(lecture);
    });
  });
};

exports.destroy = function (req, res) {
  Lecture.findOne({ _id: req.params.id }).exec(function (err, lecture) {
    if (err) return res.status(500).send(err);
    if (!lecture) return res.status(404).json({ message: 'Lecture Not Found!' });

    lecture.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};