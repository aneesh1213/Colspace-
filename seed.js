const mongoose = require('mongoose');
const Department = require('./models/department'); // Adjust the path accordingly

mongoose.connect('mongodb://localhost:27017/colspace', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    // Insert sample data
    const sampleData = [
        {
            name: 'COMPUTER',
            description: 'Brief description of Computer Department. Add more details as needed.',
            notes: [{ title: 'Note 1', downloadLink: '/download/note1.pdf' }],
            assignments: [{ title: 'Assignment 1', downloadLink: '/download/assignment1.docx' }],
            ppts: [{ title: 'PPT 1', downloadLink: '/download/ppt1.pptx' }],
            questionPapers: [{ title: 'Question Paper 1', downloadLink: '/download/question_paper1.pdf' }],
        },
        // Add more departments as needed
    ];

    try {
        await Department.insertMany(sampleData);
        console.log('Sample data inserted successfully');
    } catch (err) {
        console.error('Error inserting sample data:', err);
    } finally {
        mongoose.connection.close();
    }
});
