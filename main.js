var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var router = require('restroute');
var config = {};
try {
  config = require('./config.js');
} catch (err) {
  console.log("Using default configuration");
}
var db = require("./db.js").connect(config.dbPath || path.join(__dirname, "tags.db"));
var helper = require('./helper.js');
var get = require('./get.js');
//var put = require('./put.js');
var del = require('./delete.js');
var post = require('./post.js');

require('./shutdown.js');

router.onError(function (req, res) {
  helper.reportServerError(res, "Invalid endpoint");
});
get();
del();
post();


//Start the server
var server = http.createServer(function(request, response) {
    //Set up socket responses.

    console.log(JSON.stringify(request.headers));
    router.go(request, response);
});

//Start the server
server.listen(2000);
function closeProgram() {
  console.log("Closing gracefully...");
  server.close();
  db.close();
  process.exit(0);
}
//Allow program to quit gracefully
process.on("SIGTERM", closeProgram);

process.on("SIGINT", closeProgram);


