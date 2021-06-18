require('../src/db/mongoose');
const User = require('../src/models/user');

// User.findByIdAndUpdate('60c991c83b9c8f3e04287755', { age: 1 })
//   .then((user) => {
//     console.log(user);
//     return User.countDocuments({ age: 0 });
//   })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// Async and await
const updateAgeAndCount = async (id, age) => {
  // Can only use await in async function
  // Await will return a promise
  const user = await User.findByIdAndUpdate(id, { age });

  // Count the number of user whose age is 'age'
  const count = await User.countDocuments({ age });
  return count;
};

// Promise chaining
updateAgeAndCount('60c991c83b9c8f3e04287755', 2)
  // Only runs when things are going well
  .then((count) => {
    console.log(count);
  })
  // Only runs when things are going wrong
  .catch((e) => {
    console.log(e);
  });
