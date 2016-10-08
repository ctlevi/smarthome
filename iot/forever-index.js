const forever = require('forever-monitor');

const child = new (forever.Monitor)('index.js', {
  // More config can go here: https://github.com/foreverjs/forever-monitor
});

child.start();