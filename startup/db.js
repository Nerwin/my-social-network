const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    // DB config
    const db = config.get('mongoURI');

    // Connect to MongoDB
    mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.info('MongoDB connected...'))
    .catch(err => console.error(err))
};
