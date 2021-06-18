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
router.get('/tasks', auth, async (req, res) => {
  try {
    // User can only read tasks created by himself
    const tasks = await Task.find({ owner: req.user._id });
    res.send(tasks);
    // // Alternative solution
    // await req.user.populate('tasks').execPopulate();
    // res.send(req.user.tasks);
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
