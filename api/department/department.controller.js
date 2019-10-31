const _ = require('lodash');
const Q = require('q');
const Department = require('./department.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Department.count(query).exec(),
    Department.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, departments) {
      return res.status(200).json({ total, departments });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Department.find(query).limit(limit).exec(function (err, departments) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(departments);
  });
};

exports.show = function (req, res) {
  Department.findOne({ _id: req.params.id }).populate('classes').exec(function (err, department) {
    if (err) return res.status(500).send(err);

    if (!department) return res.status(404).json({ message: 'Department Not Found!' });
    return res.status(200).json(department);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Department.create(body, function (err, department) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(department);
  });
};

exports.update = function (req, res) {
  Department.findOne({ _id: req.params.id }).exec(function (err, department) {
    if (err) return res.status(500).send(500);
    if (!department) return res.status(404).json({ message: 'Department not Found!' });

    let updated = _.merge(department, req.body);
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(department);
    });
  });
};

exports.destroy = function (req, res) {
  Department.findOne({ _id: req.params.id }).exec(function (err, department) {
    if (err) return res.status(500).send(err);
    if (!department) return res.status(404).json({ message: 'Department Not Found!' });

    department.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};