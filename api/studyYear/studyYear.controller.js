const _ = require('lodash');
const Q = require('q');
const StudyYear = require('./studyYear.model');
const PusherService = require('../../services/pusher.service');
const TeachingPlan = require('../teachingPlan/teachingPlan.model');
const Kelas = require('../kelas/kelas.model');
const Course = require('../course/course.model');
const Room = require('../room/room.model');
const Schedule = require('../schedule/schedule.model');
const BroadCast = require('../tpBroadcast/tpBroadcast.controller');

let classType = [{ key: "/P", value: "reguler" }, { key: "/M", value: "malam" }, { key: "/K", value: "ekstension" }];
let listDay = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
let sksToMinute = 40;

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    StudyYear.count(query).exec(),
    StudyYear.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, studyYears) {
      return res.status(200).json({ total, studyYears });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  StudyYear.find(query).limit(limit).exec(function (err, studyYears) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(studyYears);
  });
};

exports.show = function (req, res) {
  StudyYear.findOne({ _id: req.params.id }).populate('classes').lean().exec(function (err, studyYear) {
    if (err) return res.status(500).send(err);

    if (!studyYear) return res.status(404).json({ message: 'StudyYear Not Found!' });
    let endStage = ['conflict', 'completed'];
    if (endStage.indexOf(studyYear.stage) > -1) {
      Schedule.findOne({ studyYear: studyYear._id }).select('_id').exec(function (err, schedule) {
        if (err) return res.status(500).send(err);
        studyYear.scheduleId = schedule ? schedule._id : null;
        return res.status(200).json(studyYear);
      });
    } else {
      return res.status(200).json(studyYear);
    }
  });
};

exports.create = function (req, res) {
  let body = req.body;
  body.code = "TA " + req.body.startYear + "-" + req.body.endYear;
  StudyYear.count({ status: "active" }).exec(function (err, count) {
    if (err) return res.status(500).send(err);
    if (body.status === 'active' && count > 0) {
      return res.status(422).json({ message: "Saat ini Sistem Masih Memiliki Tahun Ajaran yang aktif, tidak bisa membuat lebih dari 1 Tahun Ajaran Aktif!" })
    }

    StudyYear.create(body, function (err, studyYear) {
      if (err) return res.status(500).send(err);

      return res.status(201).json(studyYear);
    });
  });
};

exports.update = function (req, res) {
  StudyYear.findOne({ status: "active" }).exec(function (err, currentActiveStudy) {
    if (err) return res.status(500).send(err);

    // console.log('study active', req.body, currentActiveStudy, req.params.id, (currentActiveStudy && currentActiveStudy._id.toString() !== req.params.id.toString() && req.body.active === "active"));
    if (currentActiveStudy && currentActiveStudy._id.toString() !== req.params.id && req.body.active === "active") {
      res.status(422).json({ message: "Saat ini Sistem Masih Memiliki Tahun Ajaran yang aktif, tidak bisa membuat lebih dari 1 Tahun Ajaran Aktif!" })
    } else {
      StudyYear.findOne({ _id: req.params.id }).exec(function (err, studyYear) {
        console.log('err', err);
        if (err) return res.status(500).send(err);
        if (!studyYear) return res.status(404).json({ message: 'StudyYear not Found!' });

        req.body.code = "TA " + req.body.startYear + "-" + req.body.endYear;
        let updated = _.merge(studyYear, req.body);
        updated.save(function (err) {
          console.log('err on update', err);
          if (err) return res.status(500).send(err);

          return res.status(200).json(studyYear);
        });
      });
    }
  });
};

exports.destroy = function (req, res) {
  StudyYear.findOne({ _id: req.params.id }).exec(function (err, studyYear) {
    if (err) return res.status(500).send(err);
    if (!studyYear) return res.status(404).json({ message: 'StudyYear Not Found!' });

    studyYear.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json({ message: 'StudyYear Deleted!' });
    });
  });
};

exports.automation = function (req, res) {
  let scheduler = req.query.scheduler ? req.query.scheduler : 'kosong';
  let body = req.body;

  StudyYear.findOne({ _id: req.query.id }).exec(function (err, studyYear) {
    if (err) return res.status(500).send(err);
    if (!studyYear) return res.status(404).json({ message: 'Tahun Ajaran Tidak Ditemukan!' });

    switch (scheduler) {
      // case 'notified':
      //   automationNotifHandler(studyYear, body, function (err, result) {
      //     if (err) return res.status(500).send(err);

      //     res.status(200).json({ message: 'Automation status: Teaching Plan Berhasil Dimulai', result: result });
      //   });
      //   break;
      case 'start':
        automationShedulerHandler(studyYear, body, function (err, result) {
          let schedule = {
            studyYear: studyYear._id,
            publish: false,
            agreedSteps: 0,
            scheduleList: result.schedules ? result.schedules : [],
            conflictList: result.conflicts ? result.conflicts : []
          }
          let ps = new PusherService();

          let stage = result.conflicts.length > 0 ? 'conflict' : 'completed';
          Schedule.create(schedule, function (err, scheduleCreated) {
            StudyYear.update({ _id: studyYear._id }, { $set: { stage: stage } }).exec(function (err, studyYearUpdated) {
              if (err) {
                ps.trigger('automation', 'status', { message: 'Error to Create Schedules', error: err });
              } else {
                ps.trigger('automation', 'status', { message: 'Success creating Schedule', schedule: scheduleCreated, studyYearUpdated: studyYearUpdated });
              }
            });
          });
        });
        res.status(200).json({ message: 'Automation status: Automation Scheduler Berhasil Dimulai' });
        break;
      default:
        res.status(422).json({ message: 'Tipe Scheduler tidak Valid' });
    }
  });
}

function automationNotifHandler(studyYear, body, callback) {
  BroadCast.count({ studyYear: req.body.studyYear }).exec(function (err, count) {
    if (err) {
      callback(err, null);
    } else {
      if (count > 0) {
        StudyYear.update({ _id: studyYear._id }, { $set: { stage: 'notified', endTeachingPlan: body.endTeachingPlan } }, function (err, result) {
          callback(err, result);
        });
      } else {
        BroadCast.create(body, function (err, broadcast) {
          if (err) {
            callback(err, null);
          } else {
            StudyYear.update({ _id: studyYear._id }, { $set: { stage: 'notified', endTeachingPlan: body.endTeachingPlan } }, function (err, result) {
              callback(null, result);
            });
          }
        });
      }
    }
  });
}


function automationShedulerHandler(studyYear, body, callback) {
  let listKelas = [];
  Q.all([
    TeachingPlan.find({ studyYear: studyYear._id, publish: true }).populate('courses.course_id').exec(),
    Kelas.find({ semester: studyYear.semester, status: 'active' }).exec(),
    Course.find({ semester: studyYear.semester, status: 'active' }).exec(),
    Room.find().exec()
  ]).spread(function (teachingPlans, kelas, courses, rooms) {

    filterTeachingPlans(kelas, listKelas, teachingPlans, courses)
      .then(function (newListKelas) {
        callback(null, newListKelas);
      })
      .catch(function (err) {
        callback(err, null);
      });
  })
    .catch(function (err) {
      callback(err, null);
    });
}

function filterTeachingPlans(kelas, schedules, teachingPlans, courses) {
  return new Promise(function (resolve, reject) {
    let conflicts = [];
    kelas.map(function (kls) {
      let jenisKelas = kls.classType;

      teachingPlans.map(function (tp) {
        let possibleTeaching = tp.courses.filter(function (crs) {
          return crs.course_id && crs.course_id.angkaKelas === kls.angkaKelas;
        });

        let possibleTeachingFilterJenisKelas = [];
        possibleTeaching.map(function (pt) {
          possibleTeachingFilterJenisKelas = pt.timePlans.filter(function (tPlan) {
            return tPlan.timeType === filterJenisKelas(jenisKelas);
          });

          possibleTeachingFilterJenisKelas.map(function (ptf) {
            let isConflict = schedules.findIndex(function (sch) {
              let maxTime = pt.course_id.sks * sksToMinute;
              return sch.day === ptf.day && (checkIfTimeConflict({ start: sch.startTime, end: sch.endTime }, ptf.time) <= maxTime) && sch.lecture === tp.lecture
            });

            if (isConflict > -1) {
              conflicts.push({
                // course: {
                //   _id: pt.course_id._id,
                //   name: pt.course_id.name,
                //   sks: pt.course_id.sks
                // },
                course: pt.course_id._id,
                // kelas: {
                //   _id: kls._id,
                //   name: kls.code,
                //   classType: kls.classType
                // },
                kelas: kls._id,
                room: null,
                lecture: tp.lecture,
                classType: ptf.timeType,
                startTime: ptf.time,
                endTime: null,
                day: ptf.day
              });
            } else {
              schedules.push({
                // course: {
                //   _id: pt.course_id._id,
                //   name: pt.course_id.name,
                //   sks: pt.course_id.sks
                // },
                course: pt.course_id._id,
                // kelas: {
                //   _id: kls._id,
                //   name: kls.code,
                //   classType: kls.classType
                // },
                kelas: kls._id,
                room: null,
                lecture: tp.lecture,
                classType: ptf.timeType,
                startTime: ptf.time,
                endTime: null,
                day: ptf.day
              });
            }
          });
        });
      });
    });

    resolve({ schedules, conflicts });
  });
}

function filterJenisKelas(classType) {
  switch (classType) {
    case 'reguler':
      return 'pagi';
    default:
      return classType;
  }
}

// let sksTime = 
function checkIfTimeConflict(sameTeachingTime, planTime) {
  let currentTime = new Date(sameTeachingTime.start);
  let plan = new Date(planTime);

  let currentComparation = new Date().setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
  let planComparation = new Date().setHours(plan.getHours(), plan.getMinutes(), plan.getSeconds());
  return Math.abs(Math.round(planComparation - currentComparation) / 1000 / 60);
}