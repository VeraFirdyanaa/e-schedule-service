const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('User', UserSchema);