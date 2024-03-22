require('dotenv').config();
const mongoose = require('mongoose');


// Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9xsuxf.mongodb.net/SaidursToDo`)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Your server code or additional setup can go here
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });