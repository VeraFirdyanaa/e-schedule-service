const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  code: { type: String, trim: true },
  name: { type: String, trim: true, required: true },
  sks: { type: Number, default: 1 },
  status: { type: Number, enum: ['active', 'inactive'], default: 'active' },
  lectures: [{ type: Schema.Types.ObjectId }]
});

module.exports = mongoose.model('Course', CourseSchema);