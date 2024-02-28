const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb'); 
const axios = require('axios');
const fs = require('fs');
const File = require('./models/file');
const path = require('path');
const multer = require('multer');
const { Types } = require('mongoose');
// Add this line at the top of your app.js
const Department  = require('./models/department');

const ObjectId = mongoose.Types.ObjectId;

const Subject  = require('./models/subject');

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));  // Serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});



mongoose.connect('mongodb+srv://aneeshkulkarni007:583683@cluster1.ntnjyms.mongodb.net/mern', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true
});


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
  try {
    // Check if there are no departments
    const existingDepartments = await Department.countDocuments();
    
    if (existingDepartments === 0) {
      // Insert initial departments
      const computerScience = new Department({
        name: 'Computer Science',
        description: 'Explore the world of algorithms, programming languages, and cutting-edge technologies',
      });
      await computerScience.save();

      const itDepartment = new Department({
        name: 'IT',
        description: 'Navigate the realms of information systems, networks, and data management',
      });
      await itDepartment.save();

      const eAndTcDepartment = new Department({
        name: 'E & TC',
        description: 'Dive into the world of electronics, communications, and signal processing',
      });
      await eAndTcDepartment.save();

      const aiAndDsDepartment = new Department({
        name: 'AI & DS',
        description: 'Unlock the potential of Artificial Intelligence and Data Science to solve complex problems',
      });
      await aiAndDsDepartment.save();

      const mechanicalDepartment = new Department({
        name: 'Mechanical',
        description: 'Unleash your creativity in designing and analyzing mechanical systems',
      });
      await mechanicalDepartment.save();

      const civilDepartment = new Department({
        name: 'Civil',
        description: 'Build the foundation for a sustainable future by exploring Civil Engineering',
      });
      await civilDepartment.save();

      console.log('Initial data inserted.');
    } else {
      console.log('Departments already exist. Skipping initial data insertion.');
    }

    // Fetch and log all departments
    const departments = await Department.find();
    console.log('Departments:', departments);
  } catch (error) {
    console.error('Error:', error);
  }
});



// route for file upload


// route for downloading files by iid

// route for rendering department page
// Route for rendering department page
app.get('/department/:id', async (req, res) => {
  const departmentId = req.params.id;

  try {
    const departmentData = await Department.findById(departmentId);

    if (!departmentData) {
      return res.status(404).send('Department not found');
    }

    const departmentName = departmentData.name;
    const subjects = departmentData.subjects || [];

    const files = await File.find({ department: departmentId });

    const filesByCategory = subjects.reduce((result, subject) => {
      result[subject._id] = {
        notes: subject.notes || [],
        assignments: subject.assignments || [],
        ppts: subject.ppts || [],
        questionPapers: subject.questionPapers || [],
        other: subject.other || [],
      };
      return result;
    }, {});

    res.render('department.ejs', {
      departmentName,
      subjects,
      files,
      filesByCategory,
      departmentId: departmentId, // Add this line to pass departmentId
    });
  } catch (error) {
    console.error('Error rendering department page:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/subjects/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    // Fetch department data based on departmentId
    const department = await Department.findById(departmentId).populate('subjects');

    if (!department) {
      return res.status(404).send('Department not found');
    }

    // Extract necessary data (e.g., subjects) from the department
    const subjects = department.subjects || [];

    // Render the department.ejs template with departmentId and subjects
    res.render('department.ejs', { departmentName: department.name, subjects, departmentId });
  } catch (error) {
    console.error('Error rendering department page:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route for rendering the content of a specific subject
// Route for rendering the content of a specific subject
// Modify the route for rendering the subject details
// Route for rendering the content of a specific subject
app.get('/explore/:departmentId/:subjectId', async (req, res) => {
  try {
    // Add the following lines to obtain subjectId and departmentId
    const subjectId = req.params.subjectId;
    const departmentId = req.params.departmentId;
    console.log('Received departmentId:', departmentId);
    console.log('Received subjectId:', subjectId);

    // Adjust the query criteria based on your data model
    const department = await Department.findById(departmentId);
    
    console.log('Fetched department:', department); // Add this line for debugging

    if (!department) {
      return res.status(404).send('Department not found');
    }

    if (!subjectId) {
      return res.status(404).send('Subject ID is missing');
    }

    // Find the subject in the department
    const subject = department.subjects.find(s => s && s._id && s._id.equals(subjectId));

    if (!subject) {
      return res.status(404).send('Subject not found');
    }

    const filesByCategory = {
      notes: subject.notes || [],
      assignments: subject.assignments || [],
      ppts: subject.ppts || [],
      questionPapers: subject.questionPapers || [],
      other: subject.other || [],
    };

    // Pass subjectId and departmentId to the template
    res.render('subjectdetails.ejs', { departmentName: department.name, subject, filesByCategory, subjectId, departmentId });
  } catch (error) {
    console.error('Error exploring subject:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/addsubject/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    // Fetch the department data based on departmentId
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).send('Department not found');
    }

    const departmentName = department.name;

    res.render('addsubject.ejs', { departmentName, departmentId });
  } catch (error) {
    console.error('Error rendering addsubject page:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route for processing the form submission when adding a subject
// Route for processing the form submission when adding a subject
app.post('/addsubject/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const { subjectName } = req.body;

    // Find the department by ID
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).send('Department not found');
    }

    // Create the subject in the required format
    const subject = new Subject({
      name: subjectName,
      department: department._id,
    });

    // Save the subject to the subjects collection
    await subject.save();

    // Update the department's subjects array
    department.subjects.push(subject._id);
    
    // Save the updated department
    await department.save();

    // Redirect or send response as needed
    res.redirect(`/subjects/${departmentId}`);
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/:category/:departmentId/:subjectId', async (req, res) => {
  try {
    const { category, departmentName, subjectId, departmentId } = req.params;

    // Find the department
    const department = await Department.findOne({ name: departmentId });

    if (!department) {
      return res.status(404).send('Department not found');
    }

    // Find the subject in the department
    const subject = department.subjects.id(subjectId);

    if (!subject) {
      return res.status(404).send('Subject not found');
    }

    // Fetch files or perform other actions related to the category
    // For example, fetch notes, ppts, assignments based on the category

    const files = subject[category.toLowerCase()] || [];

    // Render the template with the category data
    res.render('subjectdetails.ejs', { departmentId, subject, category, files });
  } catch (error) {
    console.error('Error exploring subject:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route for rendering subject page
// Route for rendering subject page
app.get('/subjects/:departmentId/:subjectId', async (req, res) => {
  const departmentId = req.params.departmentId;
  const subjectId = req.params.subjectId;
  const departmentName = req.params.departmentName;
  try {
    const selectedSubject = await Subject.findById(subjectId);
    if (!selectedSubject) {
      return res.redirect(`/subjects/${departmentId}`);
    }

    const filesByCategory = {
      notes: selectedSubject.notes || [],
      assignments: selectedSubject.assignments || [],
      ppts: selectedSubject.ppts || [],
      questionPapers: selectedSubject.questionPapers || [],
      other: selectedSubject.other || [],
    };

    const subjects = []; // Add logic to retrieve subjects if needed

    // Pass the departmentName variable to the template
    res.render('department.ejs', {
      departmentName: selectedSubject.name,  // Use the subject name or any other relevant value
      subjects: subjects,
      selectedSubject: selectedSubject,
      filesByCategory: filesByCategory,
      departmentName:departmentName,
      departmentId: departmentId, // Add this line to pass departmentId
    });
  } catch (error) {
    console.error('Error rendering subject page:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route for handling file uploads
app.post('/upload/:departmentId/:subjectId', upload.single('file'), async (req, res) => {
  try {
    const { category } = req.body;
    const subjectId = req.params.subjectId;
    const departmentId = req.params.departmentId;

    // Validate subjectId and departmentId if needed
    if (!category || !subjectId || !departmentId || departmentId.trim() === '') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Validate departmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ error: 'Invalid departmentId format' });
    }

    // Your existing code for creating and saving the File document
    const file = new File({
      title: req.file.originalname,
      category: category,
      fileLink: 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64'),
      department: new mongoose.Types.ObjectId(departmentId), // Use mongoose.Types.ObjectId
    });

    // Save the file
    await file.save();

    // Update the corresponding subject with the new file
    const department = await Department.findById(departmentId);

console.log('Received departmentId:', departmentId);
console.log('Fetched department:', department);

if (!department) {
  return res.status(404).json({ error: 'Department not found' });
}


    const subject = department.subjects.find(s => s._id.equals(subjectId));

    // Check if the subject is found
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Ensure subject.files is an array
    if (!subject.files) {
      subject.files = [];
    }

    subject.files.push(file);
    await department.save(); // Save the updated department

    // Redirect or send a response as needed
    const subjectDetailsURL = `/explore/${departmentId}/${subjectId}`;
    res.redirect(subjectDetailsURL);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
});




app.get('/download/:departmentId/:subjectId/:category/:fileId', async (req, res) => {
  try {
      const { departmentName, subjectId, category, fileId, departmentId } = req.params;

      // Find the department
      const department = await Department.findOne({ name: departmentId });

      if (!department) {
          return res.status(404).send('Department not found');
      }

      // Find the subject in the department
      const subject = department.subjects.id(subjectId);

      if (!subject) {
          return res.status(404).send('Subject not found');
      }

      // Find the file in the subject
      const file = subject[category.toLowerCase()].id(fileId);

      if (!file) {
          return res.status(404).send('File not found');
      }

      // Set appropriate headers and send the file
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', `attachment; filename="${file.title}"`);
      res.send(Buffer.from(file.fileLink.split(',')[1], 'base64'));
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


// Define the route to render the main page
// Update the route for rendering the main page
// Example logging in the main route
app.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    console.log('Departments:', departments); // Add this line for debugging
    res.render('index.ejs', { departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).send('Internal Server Error');
  }
});

  

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
