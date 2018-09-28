const mongoose = require('mongoose');
const Joi = require('joi');

// Create Schema
const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  handle: {
    type: String,
    required: true,
    max: 40,
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
  },
  githubusername: {
    type: String,
  },
  experiences: [
    {
      title: {
        type: String,
        required: true,
        max: 100,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        max: 2000,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
        max: 100,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldofstudy: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        max: 2000,
      },
    },
  ],
  social: {
    youtube: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

function validateProfileInput(profile) {
  const schema = {
    handle: Joi.string().min(2).max(40).required(),
    status: Joi.string().required(),
    skills: Joi.string().required(),
    company: Joi.string(),
    location: Joi.string(),
    bio: Joi.string(),
    githubusername: Joi.string(),
    website: Joi.string().uri(),
    youtube: Joi.string().uri(),
    facebook: Joi.string().uri(),
    linkedin: Joi.string().uri(),
    instagram: Joi.string().uri(),
  };

  return Joi.validate(profile, schema, { abortEarly: false });
}

function validateExperienceInput(exp) {
  const schema = {
    title: Joi.string().required().max(100),
    company: Joi.string().required(),
    location: Joi.string(),
    from: Joi.date().required(),
    to: Joi.date(),
    current: Joi.boolean(),
    description: Joi.string().max(2000),
  };

  return Joi.validate(exp, schema, { abortEarly: false });
}

function validateEducationInput(educ) {
  const schema = {
    school: Joi.string().required().max(100),
    degree: Joi.string().required(),
    fieldofstudy: Joi.string().required(),
    from: Joi.date().required(),
    to: Joi.date(),
    current: Joi.boolean(),
    description: Joi.string().max(2000),
  };

  return Joi.validate(educ, schema, { abortEarly: false });
}

exports.Profile = mongoose.model('profile', ProfileSchema);
exports.validateProfile = validateProfileInput;
exports.validateExperience = validateExperienceInput;
exports.validateEducation = validateEducationInput;
