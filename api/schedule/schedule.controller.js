const _ = require('lodash');
const Q = require('q');
const Schedule = require('./schedule.model');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    Schedule.count(query).exec(),
    Schedule.find(query).populate('studyYear').skip(skip).limit(limit).exec()
  ])
    .spread(function (total, schedules) {
      return res.status(200).json({ total, schedules });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  Schedule.find(query).limit(limit).exec(function (err, schedules) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(schedules);
  });
};

exports.show = function (req, res) {
  Schedule.findOne({ _id: req.params.id }).populate('studyYear scheduleList.course scheduleList.kelas scheduleList.lecture conflictList.course conflictList.kelas conflictList.lecture').exec(function (err, schedule) {
    if (err) return res.status(500).send(err);

    if (!schedule) return res.status(404).json({ message: 'Schedule Not Found!' });
    return res.status(200).json(schedule);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  Schedule.create(body, function (err, schedule) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(schedule);
  });
};

exports.update = function (req, res) {
  Schedule.findOne({ _id: req.params.id }).exec(function (err, schedule) {
    if (err) return res.status(500).send(500);
    if (!schedule) return res.status(404).json({ message: 'Schedule not Found!' });

    let updated = _.merge(schedule, req.body);
    updated.save(function (err) {
      console.log('err', err);
      if (err) return res.status(500).send(err);

      return res.status(200).json(schedule);
    });
  });
};

exports.destroy = function (req, res) {
  Schedule.findOne({ _id: req.params.id }).exec(function (err, schedule) {
    if (err) return res.status(500).send(err);
    if (!schedule) return res.status(404).json({ message: 'Schedule Not Found!' });

    schedule.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: "Schedule Deleted!" });
    });
  });
};