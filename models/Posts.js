const mongoose = require('mongoose');
const Joi = require('joi'); 

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true,
        max: 1000
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true,
                max: 700
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

function validatePostInput(post) {
    const schema = {
        text: Joi.string().max(1000).required(),
        name: Joi.string().required(),
        avatar: Joi.string().required(),
    };

    return Joi.validate(post, schema, { abortEarly: false });
}

function validateCommentInput(post) {
    const schema = {
        text: Joi.string().max(700).required(),
        name: Joi.string().required(),
        avatar: Joi.string().required(),
    };

    return Joi.validate(post, schema, { abortEarly: false });
}

exports.Post = Post = mongoose.model('post', PostSchema);
exports.validatePost = validatePostInput;
exports.validateComment = validateCommentInput;