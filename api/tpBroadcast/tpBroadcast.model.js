var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BroadcastSchema = new Schema({
  studyYear: { type: Schema.Types.ObjectId, ref: 'StudyYear' },
  start: { type: Date, default: new Date() },
  end: { type: Date },
  status: { type: String, enum: ["started", "expired"] },
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Lecture' }]
});

module.exports = mongoose.model('Broadcast', BroadcastSchema);