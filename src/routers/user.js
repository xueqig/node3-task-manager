const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create user
router.post('/users', async (req, res) => {
  // Get new user information from request body
  const user = new User(req.body);

  try {
    // Save a new user in the database
    await user.save();

    // Generate a jwt for the new user
    const token = await user.generateAuthToken();

    // Set status code to 201 - Success Created
    // Use res.send to send the newly added user and his token as a response
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login user
router.post('/users/login', async (req, res) => {
  try {
    // Find the user with given email and password
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );
    // Generate jwt for the user
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// Logout user
router.post('/users/logout', auth, async (req, res) => {
  try {
    // Remove the token from tokens array
    req.user.tokens = req.user.tokens.filter((token) => {
      token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Logout all accounts (user may login from phone, tablet or laptop)
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    // Remove all tokens in tokens array
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Read user profile
// The second argument is auth middleware, the third argument is route handler
// Middleware will run before the route handler
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// // Read user
// router.get('/users/:id', async (req, res) => {
//   try {
//     // Get user id from url params
//     const user = await User.findById(req.params.id);
//     // If user is not found, return 404 - Not Found
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

// Update user profile
router.patch('/users/me', auth, async (req, res) => {
  // Fields user want to update
  const updates = Object.keys(req.body);
  // Fields that are allowed to update
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  // Check if every element in updates array is included in allowedUpdates array
  // Returns true is everything is true, otherwise returns false
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // Update given fields
    updates.forEach((update) => (req.user[update] = req.body[update]));
    // Update the existing user
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// Upload user profile picture
const upload = multer({
  limits: {
    fileSize: 1000000, // Size of the file should less than 1MB
  },
  // file is the file being uploaded, cb is callback
  fileFilter(req, file, cb) {
    // Only accept file extension of jpg, jpeg and png
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true); // true means accept file upload
  },
});
// Arguments: path, check authentication, validate and accept upload, send back success message
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    // Resize all images and convert them to png
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  // Send back error as a json object
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  },
);

// Delete user profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Get profile picture for a user
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    // Set response header to tell client what type of data is sending back
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
