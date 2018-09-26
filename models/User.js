const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

// Create Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

UserSchema.methods.generateAuthToken = function() { 
    const payload = { id: this.id, name: this.name, avatar: this.avatar }; // Create JWT payload
    return jwt.sign(payload, config.get('jwtKey'), { expiresIn: 3600 });
  };

function validateUser(user) {
    const schema = {
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(50).required(),
        password2: Joi.string().valid(Joi.ref('password')).required().options({
            language: {
              any: {
                allowOnly: 'must match password',
              }
            } 
          })
      };
    
    return Joi.validate(user, schema, { abortEarly: false });
}

function validateLogin(login) {
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required()
      };
    
    return Joi.validate(login, schema, { abortEarly: false });
}

exports.User = User = mongoose.model('users', UserSchema);
exports.validateUser = validateUser;
exports.validateLogin = validateLogin;