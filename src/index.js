// Create express app
const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
// If no port, use 3000
const port = process.env.PORT || 3000;

// // This middleware can be used when you need to temporarily shut down your server, e.g. when update your database
// app.use((req, res, next) => {
//   res.status(503).send('Site is under maintenance. Check back soon!');
// });

app.use(express.json());
// Create separete router files for user and task, then register them in index.js
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
