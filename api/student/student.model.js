const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  npm: { type: String, required: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true },
  pob: { type: String, trim: true },
  dob: { type: Date },
  gender: { type: String, trim: true, required: true, enum: ['pria', 'wanita'] },
  photo: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  classes: [{ type: Schema.Types.ObjectId, ref: 'Kelas' }]
});

module.exports = mongoose.model('Student', StudentSchema);