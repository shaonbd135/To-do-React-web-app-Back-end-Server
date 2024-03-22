require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('./models/user.model');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Task = require('./models/task.model');
const mongoose = require('mongoose');
require('./config/database');
require('./config/passportJwt');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());


//home Route

app.get('/', (req, res) => {
    res.send('This is Saidurs To Do App Server');
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

app.post('/create-task', passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const { taskName, description, dueDate, username } = req.body;
        try {
            const userMatch = await User.findOne({ username });
            if (!userMatch) {
                return res.status(400).send({
                    status: 400,
                    success: false,
                    message: 'User does not exist'
                })
            }
            const newTask = new Task({
                username: userMatch.username,
                taskName: taskName,
                description: description,
                dueDate: dueDate
            });

            await newTask.save();
            res.status(200).send({
                status: 200,
                success: true,
                message: 'Task created successfully'
            })

        }
        catch (err) {
            res.status(500).send({
                status: 500,
                success: false,
                message: 'Server Error'
            })
        }
    }
)

app.get('/tasks', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const username = req.user.username;
        try {
            const tasks = await Task.find({ username: username });
            return res.status(200).send({
                status: 200,
                success: true,
                tasks: tasks
            })

        }
        catch (err) {
            return res.status(500).send({
                status: 500,
                success: false,
                message: 'Server Error'
            })
        }

    })

app.patch('/update-task', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const { id, isDone } = req.body;
    try {
        const task = await Task.findOne({ _id: id });
        if (!task) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: 'Task does not exist'
            })
        }
        task.isDone = isDone;
        await task.save();
        return res.status(200).send({
            status: 200,
            success: true,
            message: 'Task updated successfully'
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({
            status: 500,
            success: false,
            message: 'Server Error'
        })

    }
})

app.patch('/edit-task', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const { id, taskName, description, dueDate } = req.body;

    try {
        const task = await Task.findOne({ _id: id });
        if (!task) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: 'Task does not exist'
            })
        }
        if (taskName) {
            task.taskName = taskName
        }
        if (description) {
            task.description = description
        }
        if (dueDate) {
            task.dueDate = dueDate
        }
        await task.save();
        return res.status(200).send({
            status: 200,
            success: true,
            message: 'Task updated successfully'
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({
            status: 500,
            success: false,
            message: 'Server Error'
        })

    }
})

app.delete('/delete-task/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id } = req.params;
    const username = req.user.username; // Get authenticated user's username

    try {
        const task = await Task.findOne({ _id: id, username: username });
        if (!task) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Task not found or does not belong to this user'
            });
        }

        await task.deleteOne({ _id: id });

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Server Error'
        });
    }
});

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

app.patch('/update-profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id, currentUsername, name } = req.body;
    const rawNewUsername = req.body.newUsername;
    try {
        const user = await User.findOne({ username: currentUsername });
        if (!user) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: 'User does not exist'
            })
        }
        if (name) {
            user.name = name
        }
        if (rawNewUsername) {
            const newUsername = rawNewUsername.trim();
            const userExists = await User.findOne({ username: newUsername })
            if (userExists) {
                if (userExists._id.toString() !== id) {
                    return res.status(400).send({
                        status: 400,
                        success: false,
                        message: 'Username already exists'
                    })
                }
            }
            const findPreviousTask = await Task.find({ username: currentUsername });
            if (findPreviousTask) {
                const updatePriviousTask = await Task.updateMany({ username: currentUsername }, { $set: { username: newUsername } });
                if (!updatePriviousTask) {
                    return res.status(400).send({
                        status: 400,
                        success: false,
                        message: 'Something went wrong, please try again later'
                    })
                }
            }

            user.username = newUsername

        }
        await user.save();
        return res.status(200).send({
            status: 200,
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                name: user.name
            }
        })

    }
    catch (err) {
        res.status(500).send({
            status: 500,
            success: false,
            message: 'Server Error'
        }
        )
    }
})

app.patch('/update-password', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const { username, currentPassword, newPassword } = req.body;

    try {

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: 'User does not exist'
            })
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: 'Incorrect password'
            })
        }

        const newPass = await bcrypt.hash(newPassword, saltRounds);
        if (newPass) {
            user.password = newPass
        }
        await user.save();
        return res.status(200).send({
            status: 200,
            success: true,
            message: 'Password updated successfully'
        })
    }
    catch (err) {

        return res.status(500).send({
            status: 500,
            success: false,
            message: 'Server Error'
        })
    }
})



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