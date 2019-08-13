const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KelasSchema = new Schema({
  code: { type: String, trim: true, required: true },
  major: { type: Schema.Types.ObjectId, ref: 'Major' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Kelas', KelasSchema);