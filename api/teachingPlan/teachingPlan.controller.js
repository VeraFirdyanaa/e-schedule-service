const _ = require('lodash');
const Q = require('q');
const TeachingPlan = require('./teachingPlan.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    TeachingPlan.count(query).exec(),
    TeachingPlan.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, teachingPlans) {
      return res.status(200).json({ total, teachingPlans });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  TeachingPlan.find(query).limit(limit).exec(function (err, teachingPlans) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(teachingPlans);
  });
};

exports.show = function (req, res) {
  TeachingPlan.findOne({ _id: req.params.id }).populate('classes').exec(function (err, teachingPlan) {
    if (err) return res.status(500).send(err);

    if (!teachingPlan) return res.status(404).json({ message: 'TeachingPlan Not Found!' });
    return res.status(200).json(teachingPlan);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  TeachingPlan.create(body, function (err, teachingPlan) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(teachingPlan);
  });
};

exports.update = function (req, res) {
  TeachingPlan.findOne({ _id: req.params.id }).exec(function (err, teachingPlan) {
    if (err) return res.status(500).send(500);
    if (!teachingPlan) return res.status(404).json({ message: 'TeachingPlan not Found!' });

    let updated = _.merge(teachingPlan, req.body);
    updated.markModified('classes');
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(teachingPlan);
    });
  });
};

exports.destroy = function (req, res) {
  TeachingPlan.findOne({ _id: req.params.id }).exec(function (err, teachingPlan) {
    if (err) return res.status(500).send(err);
    if (!teachingPlan) return res.status(404).json({ message: 'TeachingPlan Not Found!' });

    teachingPlan.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: 'TeachingPlan Deleted!' });
    });
  });
};