const mongoose = require('mongoose');

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true, // Don't want console log the warning
  useFindAndModify: false, // Don't want console log the warning
});
