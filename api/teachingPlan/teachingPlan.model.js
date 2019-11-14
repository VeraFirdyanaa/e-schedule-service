const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeachingPlanSchema = new Schema({
  studyYear: { type: Schema.Types.ObjectId, ref: 'StudyYear' },
  lecture: { type: Schema.Types.ObjectId, ref: 'Lecture' },
  courses: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: 'Course' },
      timePlans: [
        {
          day: { type: String, enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] },
          timeType: { type: String, enum: ["pagi", "malam", "ekstension"] },
          time: { type: Date }
        }
      ]
    }
  ],
  publish: { type: Boolean, default: false }
});

module.exports = mongoose.model('TeachingPlan', TeachingPlanSchema);