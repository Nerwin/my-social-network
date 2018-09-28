const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User model
const { User, validateUser, validateLogin } = require('../../models/User');

/** ********* */
/**  USER  * */
/** ********* */

// @route   POST api/users/register
// @desc    Register users route
// @access  Public
router.post('/register', (req, res) => {
  // Validation
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details.map(detail => detail.message));

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ email: 'User already registered with this email' });
      }
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm', // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.error(err));
        });
      });
    });
});

// @route   POST api/users/login
// @desc    Login users route / returning JWT token
// @access  Public
router.post('/login', (req, res) => {
  // Validation
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  // Find user by email
  User.findOne({ email })
    .then((user) => {
      // Check for user
      if (!user) {
        return res.status(404).json({ email: 'User not found' });
      }

      // Check password
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            const token = user.generateAuthToken();
            res.json({
              success: true,
              token: `Bearer ${token}`,
            });
          } else {
            return res.status(400).json({ password: 'Password incorrect' });
          }
        });
    });
});

// @route   GET api/users/profile
// @desc    Return profile of current user
// @access  Private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  const {
    id, name, email, avatar,
  } = req.user;
  res.json({
    id, name, email, avatar,
  });
});

module.exports = router;
