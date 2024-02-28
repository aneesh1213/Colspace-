// file.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Notes', 'Assignments', 'PPTs', 'Question Papers', 'Other'],
  },
  fileLink: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
