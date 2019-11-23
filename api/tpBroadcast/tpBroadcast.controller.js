var BroadCast = require('./tpBroadcast.model');
var StudyYear = require('../studyYear/studyYear.model');
exports.index = function (req, res) {
  BroadCast.find().sort('-start').populate('studyYear').limit(5).exec(function (err, broadcasts) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(broadcasts);
  });
};

exports.create = function (req, res) {
  BroadCast.count({ studyYear: req.body.studyYear }).exec(function (err, count) {
    if (err) return res.status(500).send(err);

    if (count > 0) {
      res.status(422).json({ message: "Broadcast Sudah Terbuat" });
    } else {
      BroadCast.create(req.body, function (err, broadcast) {
        if (err) return res.status(500).send(err);

        res.status(201).json({ broadcast: broadcast, message: 'Broadcast Telah Berhasil Dibuat!' });
      });
    }
  });
}

exports.checkExpired = function (req, res) {
  let now = new Date();
  BroadCast.findOne({ status: 'started' }).exec(function (err, broadcast) {
    if (err) return res.status(500).send(err);

    if (!broadcast) return res.status(200).json({ message: 'No Broadcast Started!' });
    let brDate = new Date(broadcast.start);
    if (isSameDate(brDate, now)) {
      broadcast.status = 'expired';
      broadcast.save(function (err) {
        if (err) return res.status(500).send(err);

        StudyYear.update({ _id: broadcast.studyYear }, { $set: { stage: 'ready', endTeachingPlan: new Date() } }).exec(function (err, result) {
          if (err) return res.status(500).send(err);

          return res.status(200).json({ message: 'Study Year Was Updated to Expired', broadcast: broadcast });
        });
      });
    } else {
      return res.status(200).json({ message: 'No Broadcast Expired!' });
    }
  });
}

function isSameDate(firstDate, secondDate) {
  let first = new Date(firstDate);
  let second = new Date(secondDate);

  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() && second.getDate();
}