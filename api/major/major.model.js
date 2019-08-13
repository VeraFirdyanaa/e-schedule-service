const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MajorSchema = new Schema({
  code: { type: String, trim: true },
  name: { type: String, trim: true, required: true },
  level: { type: String, enum: ['S2', 'S1', 'D3', 'D2', 'D1'], required: true },
  head: { type: String, trim: true },
  status: { type: Number, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Major', MajorSchema);