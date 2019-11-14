const _ = require('lodash');
const Q = require('q');
const Room = require('./room.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Room.count(query).exec(),
    Room.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, rooms) {
      return res.status(200).json({ total, rooms });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Room.find(query).limit(limit).exec(function (err, rooms) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(rooms);
  });
};

exports.show = function (req, res) {
  Room.findOne({ _id: req.params.id }).populate('classes').exec(function (err, room) {
    if (err) return res.status(500).send(err);

    if (!room) return res.status(404).json({ message: 'Room Not Found!' });
    return res.status(200).json(room);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  body.name = body.name + body.building;
  Room.create(body, function (err, room) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(room);
  });
};

exports.update = function (req, res) {
  Room.findOne({ _id: req.params.id }).exec(function (err, room) {
    if (err) return res.status(500).send(500);
    if (!room) return res.status(404).json({ message: 'Room not Found!' });

    let updated = _.merge(room, req.body);
    updated.save(function (err) {
      console.log('err', err);
      if (err) return res.status(500).send(err);

      return res.status(200).json(room);
    });
  });
};

exports.destroy = function (req, res) {
  Room.findOne({ _id: req.params.id }).exec(function (err, room) {
    if (err) return res.status(500).send(err);
    if (!room) return res.status(404).json({ message: 'Room Not Found!' });

    room.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: "Room Deleted!" });
    });
  });
};