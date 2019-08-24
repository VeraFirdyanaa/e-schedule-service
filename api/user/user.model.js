const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nomor_induk: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, enum: ["Lecture", "Student", "Operational"], required: true, trim: true }
});

module.exports = mongoose.model('User', UserSchema);