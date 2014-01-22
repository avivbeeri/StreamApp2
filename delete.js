var db = require("./db.js");
var helper = require("./helper.js");
var util = require('util');
var fs = require('fs');
var path = require('path');

module.exports.resolve = function (splitURL, request, response) {
  
  //Format /files/:fileid 
  if (splitURL.length === 2) {
    var fileid = splitURL[1];
    console.log("Removing from database...");
    db.removeFile(fileid, function (err, path) {
      if (err) {
        response.writeHead(404, {"content-type" : "text/plain"});
        response.end("File not found"); 
        return;
      }
      console.log("Deleting...");
      
      fs.unlink(path, function (err) {
        if (err) {
          reportServerError(response, err);
          return;
        }

        console.log("Deleted");
        response.writeHead(204);
        response.end(); 
      });
      
    });
    return;
  } else
  //Format /files/:fileid/tags/:tag 
  if (splitURL.length === 4) {
    var fileid = splitURL[1];
    var tag = splitURL[3];

    db.removeTagFromFile(tag, fileid, function (err) {
      if (err) {
        helper.reportServerError(response, err);
        return;
      }
      response.writeHead(204);
      response.end(); 
    });
  } else {
    helper.reportServerError(response, "Invalid endpoint");
  }

}
