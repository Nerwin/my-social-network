const express = require('express');

const router = express.Router();
const passport = require('passport');
const _ = require('lodash');

// Load models
const {
  Profile, validateProfile, validateExperience, validateEducation,
} = require('../../models/Profile');
const { User } = require('../../models/User');


/** ************ */
/**  PROFILE  * */
/** ************ */

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .select({ user: true, handle: true, location: true })
    .then((profiles) => {
      if (!profiles) {
        return res.status(404).json('There are no profiles for now');
      }
      return res.json(profiles);
    })
    .catch(err => res.status(404).json('There are no profiles for now'));
});

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        return res.status(404).json('There is no profile for this user');
      }
      return res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile from handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        return res.status(404).json('There is no profile for this handle');
      }
      return res.json(profile);
    })
    .catch(err => res.status(404).json('There is no profile for this handle'));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile from user_id
// @access  Public
router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        return res.status(404).json('There is no profile for this id');
      }
      return res.json(profile);
    })
    .catch(err => res.status(404).json('There is no profile for this id'));
});


// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validation
  const { error } = validateProfile(req.body);
  if (error) return res.status(400).send(error.details.map(detail => detail.message));

  // Get fields
  const profileFields = {};
  profileFields.social = {};

  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;

  // Get all the fields from the request
  _.forEach(req.body, (item, key) => {
    // Skills - Split into an array
    if (key === 'skills') {
      profileFields[key] = item.split(',');
    } else if (key === 'youtube' || key === 'facebook' || key === 'linkedin' || key === 'instagram') { // Socials
      profileFields.social[key] = item;
    } else {
      profileFields[key] = item;
    }
  });

  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exist
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            res.status(400).json('That handle already exist');
          }

          // Save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
});

// @route   DELETE api/profile/
// @desc    Delete profile and user
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
});

/** **************** */
/**  EXPERIENCES  * */
/** **************** */

// @route   POST api/profile/experience
// @desc    Add experience profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validation
  const { error } = validateExperience(req.body);
  if (error) return res.status(400).send(error.details.map(detail => detail.message));

  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const {
        title, company, location, from, to, current, description,
      } = req.body;
      const newExp = {
        title, company, location, from, to, current, description,
      };

      profile.experiences.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(400).json(err));
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const removeIndex = profile.experiences.map(item => item.id).indexOf(req.params.exp_id);
      profile.experiences.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

/** ************** */
/**  EDUCATION  * */
/** ************** */

// @route   POST api/profile/education
// @desc    Add experience profile
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validation
  const { error } = validateEducation(req.body);
  if (error) return res.status(400).send(error.details.map(detail => detail.message));

  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const {
        school, degree, fieldofstudy, from, to, current, description,
      } = req.body;
      const newEduc = {
        school, degree, fieldofstudy, from, to, current, description,
      };

      profile.education.unshift(newEduc);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(400).json(err));
});

// @route   DELETE api/profile/education/:educ_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:educ_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const removeIndex = profile.education.map(item => item.id).indexOf(req.params.educ_id);
      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

module.exports = router;
