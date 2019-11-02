const _ = require('lodash');
const Q = require('q');
const Kelas = require('./kelas.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Kelas.count(query).exec(),
    Kelas.find(query).populate('major', 'name').skip(skip).limit(limit).exec()
  ])
    .spread(function (total, kelass) {
      return res.status(200).json({ total, kelass });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Kelas.find(query).limit(limit).exec(function (err, kelass) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(kelass);
  });
};

exports.show = function (req, res) {
  Kelas.findOne({ _id: req.params.id }).populate('classes').exec(function (err, kelas) {
    if (err) return res.status(500).send(err);

    if (!kelas) return res.status(404).json({ message: 'Kelas Not Found!' });
    return res.status(200).json(kelas);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Kelas.create(body, function (err, kelas) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(kelas);
  });
};

exports.update = function (req, res) {
  Kelas.findOne({ _id: req.params.id }).exec(function (err, kelas) {
    if (err) return res.status(500).send(500);
    if (!kelas) return res.status(404).json({ message: 'Kelas not Found!' });

    let updated = _.merge(kelas, req.body);
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(kelas);
    });
  });
};

exports.destroy = function (req, res) {
  Kelas.findOne({ _id: req.params.id }).exec(function (err, kelas) {
    if (err) return res.status(500).send(err);
    if (!kelas) return res.status(404).json({ message: 'Kelas Not Found!' });

    kelas.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};