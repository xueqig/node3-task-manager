require('../src/db/mongoose');
const Task = require('../src/models/task');

// Task.findByIdAndDelete('60c9953e263c6d3e721a8190')
//   .then((task) => {
//     console.log(task);
//     return Task.countDocuments({ completed: false });
//   })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// Async and await
const deleteTaskAndCount = async (id) => {
  // Can only use await in async function
  // Await will return a promise
  const task = await Task.findByIdAndDelete(id);

  // Count the number of uncompleted tasks
  const count = await Task.countDocuments({ completed: false });

  return count;
};

// Promise chaining
deleteTaskAndCount('60c9cd7c9d4bdf433b476ce6', false)
  // Only runs when things are going well
  .then((count) => {
    console.log(count);
  })
  // Only runs when things are going wrong
  .catch((e) => {
    console.log(e);
  });
