const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  code: { type: String, trim: true },
  name: { type: String, trim: true, required: true },
  sks: { type: Number, default: 1 },
  semester: { type: String, enum: ["ganjil", "genap"], required: true },
  angkaKelas: { type: Number, required: true },
  jenisPembelajaran: { type: String, enum: ["teori", "praktikum"] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lectures: [{ type: Schema.Types.ObjectId, ref: 'Lecture' }]
});

module.exports = mongoose.model('Course', CourseSchema);