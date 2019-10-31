const _ = require('lodash');
const Q = require('q');
const Employee = require('./employee.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Employee.count(query).exec(),
    Employee.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, employees) {
      return res.status(200).json({ total, employees });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Employee.find(query).limit(limit).exec(function (err, employees) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(employees);
  });
};

exports.show = function (req, res) {
  Employee.findOne({ _id: req.params.id }).populate('classes').exec(function (err, employee) {
    if (err) return res.status(500).send(err);

    if (!employee) return res.status(404).json({ message: 'Employee Not Found!' });
    return res.status(200).json(employee);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Employee.create(body, function (err, employee) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(employee);
  });
};

exports.update = function (req, res) {
  Employee.findOne({ _id: req.params.id }).exec(function (err, employee) {
    if (err) return res.status(500).send(500);
    if (!employee) return res.status(404).json({ message: 'Employee not Found!' });

    let updated = _.merge(employee, req.body);
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(employee);
    });
  });
};

exports.destroy = function (req, res) {
  Employee.findOne({ _id: req.params.id }).exec(function (err, employee) {
    if (err) return res.status(500).send(err);
    if (!employee) return res.status(404).json({ message: 'Employee Not Found!' });

    employee.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};