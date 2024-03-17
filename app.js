const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('./models/user.model');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./config/passportJwt');
require('dotenv').config();
require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());


//home Route

app.get('/', (req, res) => {
    res.send('This is my To Do App Server');
})


app.post('/register', async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).send({
                status: 400,
                message: 'User already exists'
            })
        }

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            const newUser = new User({
                name: name,
                username: username,
                password: hash
            })

            await newUser.save();
            res.status(200).send({
                status: 200,
                success: true,
                message: 'User created successfully'
            })
        });

    }
    catch (err) {
        res.status(500).send({
            status: 500,
            message: 'Server Error'
        })
        console.log(err)
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({
                status: 400,
                message: 'User does not exist'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send({
                status: 400,
                message: 'Incorrect password'
            })
        }

        const secretKey = process.env.SECRET_KEY;
        const payload = {
            id: user._id,
            username: user.username
        }

        const token = jwt.sign(payload, secretKey, {
            expiresIn: '2d'
        })
        return res.status(200).send({
            status: 200,
            success: true,
            message: 'Login successful',
            token: "Bearer " + token
        })
    }
    catch (err) {
        res.status(500).send({
            status: 500,
            message: 'Server Error'
        })
    }

})

app.get('/profile', passport.authenticate('jwt', { session: false }),
    function (req, res) {
        return res.status(200).send({
            status: 200,
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                name: req.user.name
            }
        })

    }
);



//Route Not Found

app.use((req, res, next) => {
    res.status(404).send({
        status: 404,
        message: 'Route Not Found'
    })
})

//Server Error

app.use((err, req, res, next) => {
    res.status(500).send({
        status: 500,
        message: 'Server Error'
    })
})




module.exports = app;