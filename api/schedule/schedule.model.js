const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  studyYear: { type: Schema.Types.ObjectId, ref: 'StudyYear' },
  publish: { type: Boolean, default: false },
  agreedSteps: { type: Number, default: 0 },
  scheduleList: [
    {
      course: { type: Schema.Types.ObjectId, ref: 'Course' },
      kelas: { type: Schema.Types.ObjectId, ref: 'Kelas' },
      room: { type: Schema.Types.ObjectId, ref: 'Room' },
      lecture: { type: Schema.Types.ObjectId, ref: 'Lecture' },
      classType: { type: String, enum: ["pagi", "malam", "ekstension"] },
      startTime: { type: Date },
      // endTime: { type: Date },
      day: { type: String, enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] }
    }
  ],
  conflictList: [
    {
      course: { type: Schema.Types.ObjectId, ref: 'Course' },
      kelas: { type: Schema.Types.ObjectId, ref: 'Kelas' },
      room: { type: Schema.Types.ObjectId, ref: 'Room' },
      lecture: { type: Schema.Types.ObjectId, ref: 'Lecture' },
      classType: { type: String, enum: ["pagi", "malam", "ekstension"] },
      startTime: { type: Date },
      // endTime: { type: Date },
      day: { type: String, enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] }
    }
  ]
});

module.exports = mongoose.model('Schedule', ScheduleSchema);