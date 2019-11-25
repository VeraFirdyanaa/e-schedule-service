var BroadCast = require('./tpBroadcast.model');
var StudyYear = require('../studyYear/studyYear.model');
var axios = require('axios');
var Config = require('../../config');

exports.index = function (req, res) {
  BroadCast.find().sort('-start').populate('studyYear').limit(5).exec(function (err, broadcasts) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(broadcasts);
  });
};

exports.create = function (req, res) {
  BroadCast.count({ studyYear: req.body.studyYear }).exec(function (err, count) {
    if (err) return res.status(500).send(err);

    StudyYear.update({ _id: req.body.studyYear }, { $set: { stage: 'notified', endTeachingPlan: req.body.end } }, function (err, result) {
      if (err) return res.status(500).send(err);

      let body = {
        contents: { en: 'Ayo Isi Rencana Mengajarmu sebelum berakhir!' },
        headings: { en: 'STMIK Bani Saleh Scheduler' },
      }
      let resultBroadcast = broadCastNotification(body);
      if (count > 0) {
        res.status(422).json({ message: "Broadcast Sudah Terbuat" });
      } else {
        BroadCast.create(req.body, function (err, broadcast) {
          if (err) return res.status(500).send(err);

          res.status(201).json({ broadcast: broadcast, message: 'Broadcast Telah Berhasil Dibuat!' });
        });
      }
    });
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

        let body = {
          contents: { en: 'Yahh, Pengisian Rencana Mengajar Sudah berakhir :(' },
          headings: { en: 'STMIK Bani Saleh Scheduler' },
        };
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

exports.reBroadcast = function (req, res) {
  let body = {
    contents: { en: req.body.message || 'Yuk Cek Status mu Sekarang' },
    headings: { en: req.body.title || 'STMIK Bani Saleh Scheduler' },
  }
  let result = broadCastNotification(body);
  res.status(200).json({ message: 'Broadcast berhasil di Mulai!' })
}

function isSameDate(firstDate, secondDate) {
  let first = new Date(firstDate);
  let second = new Date(secondDate);

  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() && second.getDate();
}

function broadCastNotification(body) {
  axios.post('https://onesignal.com/api/v1/notifications', {
    app_id: Config.ONESIGNAL_APP_ID,
    android_channel_id: Config.ONESIGNAL_CHANNEL_ID,
    included_segments: ["All"],
    android_visibility: 1,
    priority: 10,
    ...body
  }, {
    headers: {
      Authorization: "Basic " + Config.ONESIGNAL_REST_KEY,
      "Content-Type": "application/json; charset=utf-8",
    }
  })
}