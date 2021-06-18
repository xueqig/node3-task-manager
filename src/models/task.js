const mongoose = require('mongoose');

// Create a Mongoose model
const Task = mongoose.model('Task', {
  description: {
    type: String,
    required: true,
    trim: true, // Trim leading and ending spaces
  },
  completed: {
    type: Boolean,
    default: false, // If completed is not provides, set it to the default value
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Create relationship between Task owner and User schema
  },
});

module.exports = Task;
