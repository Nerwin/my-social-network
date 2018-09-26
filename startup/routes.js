const express = require('express');
const users = require("../routes/api/users");
const profiles = require("../routes/api/profiles");
const posts = require("../routes/api/posts");


module.exports = function(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Uses routes
    app.use('/api/users', users);
    app.use('/api/profiles', profiles);
    app.use('/api/posts', posts);
};