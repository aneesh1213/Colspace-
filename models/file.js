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
    enum: ['notes', 'assignments', 'ppts', 'questionPapers', 'other'],
  },
  fileLink: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    validate: {
      validator: async function (value) {
        const subject = await mongoose.model('Subject').findOne({ _id: value });
        return subject !== null;
      },
      message: 'Invalid subject specified.',
    },
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
