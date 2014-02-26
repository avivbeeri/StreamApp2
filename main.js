var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var router = require('restroute');
var config = require('./config.js');
var db = require("./db.js").connect(config.dbPath || "./tags.db");
var helper = require('./helper.js');
var get = require('./get.js');
//var put = require('./put.js');
var del = require('./delete.js');
var post = require('./post.js');


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
    /*
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
      get.resolve(splitURL, request, response);
    } else if (request.method === "POST") {
      post.resolve(splitURL, request, response);
    } else if (request.method === "PUT") {
      put.resolve(splitURL, request, response);
    } else if (request.method === "DELETE") {
      del.resolve(splitURL, request, response);
    } else {
      helper.reportServerError(response, "");
    }
    */
});
//Start the server
server.listen(2000);

//Allow program to quit gracefully
process.on("SIGTERM", function() {
  server.close();
  db.close();
});

process.on("SIGINT", function() {
  server.close();
  db.close();
});
