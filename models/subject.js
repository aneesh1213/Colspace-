const mongoose = require('mongoose')
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  }],
});

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
