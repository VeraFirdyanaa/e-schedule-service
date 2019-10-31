const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LectureSchema = new Schema({
  nid: { type: String, required: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true },
  pob: { type: String, trim: true },
  dob: { type: Date },
  gender: { type: String, trim: true, required: true, enum: ['pria', 'wanita'] },
  photo: { type: String },
  educations: [
    {
      institute: { type: String, trim: true },
      startPeriode: { type: String, trim: true },
      endPeriode: { type: String, trim: true },
      degree: { type: String, enum: ["S1", "S2", "S3", "D3", "D2", "D1"] },
      major: { type: String, trim: true },
      gpa: { type: Number, default: 0 }
    }
  ],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Lecture', LectureSchema);