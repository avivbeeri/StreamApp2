var Reminder = require('reminder');
var remind = new Reminder();

console.log("Shutdown setup.");
remind.at("00:25", function () {
  process.kill(process.pid, 'SIGTERM');
}
);
