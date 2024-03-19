const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const fs = require('fs');
const File = require('./models/file');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const { Types } = require('mongoose');
// Add this line at the top of your app.js
const Department = require('./models/department');
const jwt = require('jsonwebtoken');
const ObjectId = mongoose.Types.ObjectId;
const Subject = require('./models/Subject');
const User = require('./models/user'); // Import the User model
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

// login and authentication stuff over here 
const SECRET = 'SECr3t';

function generateToken(user) {
  return jwt.sign({ id: user._id, name: user.name }, SECRET, { expiresIn: '1h' });
}

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Routes
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});
app.get('/signup', (req, res) => {
  res.render('signup.ejs');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(403).json({ message: 'User already exists' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    // Generate JWT token for the new user
    const token = generateToken(newUser);
    res.json({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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



// getting department by id
app.get('/department/:id', authenticateJwt ,async (req, res) => {
  const departmentId = req.params.id;
  try {
    const departmentData = await Department.findById(departmentId).populate('subjects');
    if (!departmentData) {
      return res.status(404).send("department not found!!");
    }

    const departmentName = departmentData.name;
    console.log(departmentName);

    const subjects = departmentData.subjects || [];
    console.log("subjects from the currecnt department are :", subjects);

    console.log("the data from found department is :", departmentData);
    res.render('department.ejs', { departmentName, departmentId: departmentId, subjects })
  }
  catch (err) {
    console.log("error for catching the department");
  }
});

app.get('/subjects/:departmentId/:subjectId', async(req, res)=>{
  const departmentId = req.params.departmentId;
  res.redirect(`/department/${departmentId}`);
})
// adding subject rendering page 
app.get("/addsubject/:departmentId", async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).send("DEpartment not found");
    }

    const departmentName = department.name;
    res.render('addsubject.ejs', { departmentName, departmentId });
  }
  catch (error) {
    console.error('Error rendering addsubject page:', error);
    res.status(500).send('Internal Server Error');
  }

});


// aadding the subjects to the respective departmemnt
app.post("/addsubject/:departmentId", async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const { subjectName } = req.body;

    // Find the department by ID
    const department = await Department.findById(departmentId).populate('subjects');

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
    res.redirect(`/department/${departmentId}`);
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).send('Internal Server Error');
  }

});

// exploring the content of the subject 
app.get("/explore/:departmentId/:subjectId", async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const subjectId = req.params.subjectId;
    
    // Retrieve the Subject document and populate files
    const subject = await Subject.findById(subjectId).populate('files');
    
    // Check if the subject was found
    if (!subject) {
      console.error('Subject not found');
      return res.status(404).send('Subject not found');
    }
    // Ensure the subject belongs to the specified department
    if (subject.department.toString() !== departmentId) {
      return res.status(404).send('Subject does not belong to the specified department');
    }

    // Construct the filesByCategory object
    const filesByCategory = {
      notes: [],
      assignments: [],
      ppts: [],
      questionPapers: [],
      other: []
    };

    // Categorize files
    subject.files.forEach(file => {
      switch (file.category) {
        case 'notes':
          filesByCategory.notes.push(file);
          break;
        case 'assignments':
          filesByCategory.assignments.push(file);
          break;
        case 'ppts':
          filesByCategory.ppts.push(file);
          break;
        case 'questionPapers':
          filesByCategory.questionPapers.push(file);
          break;
        default:
          filesByCategory.other.push(file);
          break;
      }
    });

    res.render('subjectdetails.ejs', {
      departmentName: subject.department.name,
      subject,
      filesByCategory,
      subjectId,
      departmentId
    });
  } catch (err) {
    console.log('Error exploring subject:', err);
    res.status(500).send('Internal server error');
  }
});



// uploading the file to respective department
app.post("/upload/:departmentId/:subjectId", upload.single('file'), async (req, res) => {
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

    // Create a new File document
    const file = new File({
      title: req.file.originalname,
      category: category,
      fileLink: 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64'),
      subject: new mongoose.Types.ObjectId(subjectId), // Convert subjectId to ObjectId
      department: new mongoose.Types.ObjectId(departmentId), // Convert departmentId to ObjectId
    });

    // Save the file
    await file.save();

    // Update the corresponding subject with the new file
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Push the newly uploaded file to the subject's files array
    subject.files.push(file);
    await subject.save(); // Save the updated subject

    // Redirect or send a response as needed
    const subjectDetailsURL = `/explore/${departmentId}/${subjectId}`;
    res.redirect(subjectDetailsURL);
  } catch (error) {
    console.log("Error occurred while uploading", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});



// Home route
app.get('/' ,async (req, res) => {
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
