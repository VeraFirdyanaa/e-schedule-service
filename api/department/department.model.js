const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  name: { type: String, trim: true, required: 'true' },
  head: { type: String, trim: true }
});

module.exports = mongoose.model('Department', DepartmentSchema);