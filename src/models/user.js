const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// Create a Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Trim leading and ending spaces
    },
    email: {
      type: String,
      unique: true, // Email in database should be unique
      required: true,
      trim: true,
      lowercase: true, // Covert all letters to lowercase
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  },
);

// Create relationship between user and his tasks, virtual is not stored in database
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // Similar to primary key in SQL database
  foreignField: 'owner', // Similar to foreign key in SQL database
});

// Get public information that can be sent back to user, e.g. we don't want to send back password and token
// toJSON will be called when sending back response, so we can customise toJSON to manipulate the response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// Define a function by ourself which can be used in router (methods -> for an instance -> instance method)
// Generate jwt for a user and save it to database
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  // Generate jwt for a user
  // First argument is what needs to be included in jwt
  // Second argument is secrete signing key used to issue and validate jwt
  // Third argument can be a set of options, can include expire in
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  // Save jwt to database
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Define a function by ourself which can be used in router (statics -> for a model -> model method)
// Find a user with given email and check the password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// Mongoose Middleware: Hash the plain text password before saving a user
// Need to use standard function rather than arrow function since we needs 'this' binding
userSchema.pre('save', async function (next) {
  const user = this;

  // Check if the passwrod is modified
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  // When a user is removed, all his tasks will be removed
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
