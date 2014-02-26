var db = require("./db.js");
var helper = require("./helper.js");
var formidable = require('formidable');
var util = require('util');
var path = require('path');

module.exports = function () {
  var db = require("./db.js");
  var helper = require("./helper.js");
  var formidable = require('formidable');
  var util = require('util');
  var path = require('path');
  var router = require('restroute');

  router.post("/files", function (request, response) {
    var form = new formidable.IncomingForm();
    form.hash = "md5";
    form.parse(request, function(err, fields, files) {
        helper.storeFile({
          path: files.upload.path,
          filename: files.upload.name,
          hash: files.upload.hash
        }
        , [], function (err, result) {
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          response.writeHead(201, {'Location': 'files/' + result});
          response.end("SUCCESS!"); 
          
        });
    });
    form.on('file', function(field, file) {
      console.log("File: " + file.name);
    });


  });

  router.post("/files/:id/tags/:tag", function (request, response) {
    var fileid = request.params.id;
    var tag = request.params.tag;

    db.addTagToFile(tag, fileid, function (err) {
      if (err) {
        helper.reportServerError(response, err);
        return;
      }
        response.writeHead(201, {'Location': path.join("files/", fileid, "tags", tag)});
        response.write(path.join("files/", fileid, "tags", tag));
        response.end("\nSUCCESS!"); 
    });


  });

}
