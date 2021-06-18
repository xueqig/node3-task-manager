const mongoose = require('mongoose');

// Connect to your MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true, // Don't want console log the warning
  useFindAndModify: false, // Don't want console log the warning
});
