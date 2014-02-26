module.exports = function () {
  var db = require("./db.js");
  var helper = require("./helper.js");
  var util = require('util');
  var fs = require('fs');
  var path = require('path');
  var router = require('restroute');

  router.delete("/files/:id", function (request, response) {
    var fileid = request.params.id;
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

  });

  router.delete("/files/:id/tags/:tag", function(request, response) {
    var fileid = request.params.id;
    var tag = request.params.tag;

    db.removeTagFromFile(tag, fileid, function (err) {
      if (err) {
        helper.reportServerError(response, err);
        return;
      }
      response.writeHead(204);
      response.end(); 
    });
  });
}
