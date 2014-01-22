var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'), 
    readline = require('readline'),
    helper = require('./helper.js'),
    get = require('./get.js'),
    put = require('./put.js'),
    del = require('./delete.js'),
    post = require('./post.js');
//Initialisation and Configuration
var db = require("./db.js").connect("tags.db");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//Start the server
var server = http.createServer(function(request, response) {
    //Set up socket responses.

    response.on("error", function (err) {
          
      helper.reportServerError(response, "Error: " + err);
    });

    var reqURL = url.parse(request.url, true).pathname;
    var splitURL = reqURL.split('/');
    splitURL.shift();
    if (splitURL[splitURL.length-1] === "") {
      splitURL.pop();
    }
    var dirname = path.dirname(reqURL); 
    console.log(request.method + " requesting: " + splitURL);
    if (request.method === "GET") {
      get.resolve(splitURL, response);
    } else if (request.method === "POST") {
      post.resolve(splitURL, request, response);
    } else if (request.method === "PUT") {
      put.resolve(splitURL, request, response);
    } else if (request.method === "DELETE") {
      del.resolve(splitURL, request, response);
    } else {
      helper.reportServerError(response, "");
    }
});
//Start the server
server.listen(2000);

//Allow program to quit gracefully
rl.question("Press any key to exit.\n", function(answer) {
  server.close();
  db.close();
  
  rl.close();
  process.exit(0);
});
