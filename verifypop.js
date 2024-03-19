const mongoose = require('mongoose');
const Subject = require('./models/Subject'); // Adjust the path as per your project structure

async function findSubjectIdByName(subjectName) {
    try {
        // Connect to the MongoDB database
        await mongoose.connect('mongodb+srv://aneeshkulkarni007:583683@cluster1.ntnjyms.mongodb.net/mern', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Query the Subject collection by name
        const subject = await Subject.findOne({ name: subjectName });
        
        // Check if the subject was found
        if (!subject) {
            console.error(`Subject "${subjectName}" not found`);
            return null;
        }
        
        // Log the ObjectId of the found subject
        console.log('Subject ID:', subject._id);
        return subject._id;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Call the function to find the ObjectId of the subject by name
findSubjectIdByName('Analog Digital Electronics'); // Replace with the subject name you want to query
