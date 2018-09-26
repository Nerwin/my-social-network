const config = require('config');

module.exports = function() {
  if (!config.get('mongoURI')) {
    throw new Error('FATAL ERROR: mongoURI is not defined.');
  }
}