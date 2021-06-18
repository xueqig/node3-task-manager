const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create task
router.post('/tasks', auth, async (req, res) => {
  // Add user id field in the new task
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Read tasks
// GET /tasks?completed=false
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    // 1: sort as ascending order, -1: sort as descending order
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // Will only return tasks that are created by the user and match certain criteria
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit), // limits the number of tasks returned
          skip: parseInt(req.query.skip), // skips the first n number of tasks
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);

    // // Alternative solution
    // const tasks = await Task.find({ owner: req.user._id });
    // res.send(tasks);
  } catch (e) {
    res.status(500).send();
  }
});

// Read task
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // User can only read task created by himself
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.send.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update task
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // User can only update task created by himself
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // User can only delete task created by himself
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
