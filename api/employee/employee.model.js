const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  nik: { type: String, required: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true },
  pob: { type: String, trim: true },
  dob: { type: Date },
  gender: { type: String, trim: true, required: true, enum: ['pria', 'wanita'] },
  photo: { type: String },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Employee', EmployeeSchema);