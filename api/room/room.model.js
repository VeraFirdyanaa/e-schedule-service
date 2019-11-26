const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: { type: String, required: true },
  building: { type: String, enum: ["A", "B"], required: true },
  jenisPembelajaran: { type: String, enum: ["teori", "praktikum"] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

module.exports = mongoose.model('Room', RoomSchema);