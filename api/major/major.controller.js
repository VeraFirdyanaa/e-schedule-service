const _ = require('lodash');
const Q = require('q');
const Major = require('./major.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Major.count(query).exec(),
    Major.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, majors) {
      return res.status(200).json({ total, majors });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.all = function (req, res) {
  Major.find().select('_id name level').exec(function (err, majors) {
    if (err) return res.status(500).send(err);

    res.status(200).json(majors);
  });
}

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Major.find(query).limit(limit).exec(function (err, majors) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(majors);
  });
};

exports.show = function (req, res) {
  Major.findOne({ _id: req.params.id }).populate('classes').exec(function (err, major) {
    if (err) return res.status(500).send(err);

    if (!major) return res.status(404).json({ message: 'Major Not Found!' });
    return res.status(200).json(major);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Major.create(body, function (err, major) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(major);
  });
};

exports.update = function (req, res) {
  Major.findOne({ _id: req.params.id }).exec(function (err, major) {
    if (err) return res.status(500).send(500);
    if (!major) return res.status(404).json({ message: 'Major not Found!' });

    let updated = _.merge(major, req.body);
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(major);
    });
  });
};

exports.destroy = function (req, res) {
  Major.findOne({ _id: req.params.id }).exec(function (err, major) {
    if (err) return res.status(500).send(err);
    if (!major) return res.status(404).json({ message: 'Major Not Found!' });

    major.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: 'Major Deleted!' });
    });
  });
};