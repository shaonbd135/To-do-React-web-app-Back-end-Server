const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URl)
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.log(err);
    })