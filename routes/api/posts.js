const express = require('express');

const router = express.Router();
const passport = require('passport');
const formatJoiError = require('../../utils/formatError');

// Load model
const { Post, validatePost, validateComment } = require('../../models/Posts');
const { Profile } = require('../../models/Profile');

/** *********** */
/**  POSTS  * */
/** ********** */

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json('No posts found'));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json('No post found with that id'));
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validation
  const { error } = validatePost(req.body);
  if (error) return res.status(400).send(formatJoiError(error));

  const { text, name, avatar } = req.body;
  const user = req.user.id;
  const newPost = new Post({
    text, name, avatar, user,
  });

  newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts/:id
// @desc    Delete post by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ id: req.user.id })
    .then(() => {
      Post.findById(req.params.id)
        .then((post) => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'User not authorized' });
          }

          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json('No post found with that id'));
    });
});

/** ********** */
/**  LIKES  * */
/** ********** */

// @route   POST api/posts/like/:id
// @desc    Add or remove like to a post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(() => {
      Post.findById(req.params.id)
        .then((post) => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            post.likes.splice(removeIndex, 1);
          } else {
            post.likes.push({ user: req.user.id });
          }
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json('No post found with that id'));
    });
});

/** ************* */
/**  COMMENTS  * */
/** ************* */

// @route   POST api/posts/comment/:id
// @desc    Add a comment to the post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validation
  const { error } = validateComment(req.body);
  if (error) return res.status(400).send(formatJoiError(error));

  Post.findById(req.params.id)
    .then((post) => {
      const { text, name, avatar } = req.body;
      const user = req.user.id;
      const newComment = {
        text, name, avatar, user,
      };

      post.comments.unshift(newComment);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json('No post found with that id'));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment by id
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post.comments
        .filter(comment => comment.id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json('Comment does not exist');
      }

      const removeIndex = post.comments
        .map(item => item.id.toString())
        .indexOf(req.params.comment_id);
      post.comments.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json('No post found with that id'));
});

module.exports = router;
