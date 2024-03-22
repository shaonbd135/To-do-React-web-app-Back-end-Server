const mongoose = require('mongoose');
require('dotenv').config();

// mongoose.connect(process.env.DB_URl)
//     .then(() => {
//         console.log('Database connected');
//     })
//     .catch((err) => {
//         console.log(err);
//         process.exit(1);
//     })

const uri = process.env.DB_URl;

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Your server code or additional setup can go here
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });