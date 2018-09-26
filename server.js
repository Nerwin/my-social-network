const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

// Startup
require('./startup/config')();

// DB config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err))

// Express app
const app = express();

app.get('/', (req, res) => {
    res.send('Hello nerwin');
});

// Uses routes
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));