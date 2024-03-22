require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.DB_URl;

// Connect to MongoDB
mongoose.connect(`${uri}`, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    // Your server code or additional setup can go here
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });