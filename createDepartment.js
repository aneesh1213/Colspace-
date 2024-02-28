// createDepartments.js

const mongoose = require('mongoose');
const Department = require('./models/department');

mongoose.connect('mongodb://localhost:27017/colspace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Array of departments to be added
  const departments = [
    { name: 'Computer Science' },
    { name: 'Information Technology' },
    { name: 'Electronics' },
    { name: 'Artificial Intelligence' },
    { name: 'Mechanical' },
    { name: 'Civil' },
  ];

  try {
    // Insert departments into the database
    const result = await Department.insertMany(departments);
    console.log(`${result.length} departments added successfully.`);
  } catch (error) {
    console.error('Error adding departments:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
});
