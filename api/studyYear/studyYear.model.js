const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyYearSchema = new Schema({
  code: { type: String, trim: true },
  startYear: { type: String, trim: true, required: true },
  endYear: { type: String, trim: true, required: true },
  semester: { type: String, enum: ["ganjil", "genap"] },
  stage: { type: String, enum: ["init", "notified", "ready", "running", "conflict", "completed"], default: "init" },
  endTeachingPlan: { type: Date },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" }
});

module.exports = mongoose.model('StudyYear', StudyYearSchema);