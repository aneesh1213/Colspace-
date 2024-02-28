// department.js

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
