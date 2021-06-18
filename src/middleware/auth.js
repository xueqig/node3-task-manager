const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Define a middleware function, new request -> middleware -> run route handler
const auth = async (req, res, next) => {
  try {
    // Get jwt from request header
    const token = req.header('Authorization').replace('Bearer ', '');
    // Verify jwt and decode it, user _id is embeded in jwt
    const decoded = jwt.verify(token, 'northremembers');
    // Find the user by _id (jwt is in user's tokens array)
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    // Store token and user in request
    req.token = token;
    req.user = user;

    // Must call next() to go to next step
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
