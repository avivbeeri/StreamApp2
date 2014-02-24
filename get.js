var db = require("./db.js"),
    fs = require('fs'),
    ffmetadata = require('ffmetadata'),
    helper = require('./helper.js');
var parse = require('range-parser');

module.exports.resolve = function (splitURL, request, response) {
  if (splitURL[0] === "files") {
    if (splitURL[1]) {

      if (splitURL[2] && splitURL[2] === "tags") {
        db.getFileTags(splitURL[1], function (err, results) {
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });

      } else if (splitURL[2] && splitURL[2] === "id3") {
        console.log("getting id3 tags");
        db.getFilePath(splitURL[1], function (err, url) {
          if (err) {
            console.error(err);
          } else { 
            ffmetadata.read(url, function(err, data) {

              if (err) {
                helper.reportServerError(response, "Error reading metadata: " + err);
              } else {
                response.writeHead(200, {
                    'content-type': 'application/json', 
                });

                response.end(JSON.stringify({result : data}));

              }
            });

          }
        });
      } else if (splitURL[1] === "recent") {
        db.getRecentFiles(function(err, results) {
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });
      } else if (splitURL[1]) {
        db.getFilePath(splitURL[1], function (err, data) {
          if (err) {
            response.writeHead(404, {
                'content-type': 'application/json', 
            });

            response.end(JSON.stringify({error: "File doesn't exist"}));
          } else { 
            console.log("Getting file");
            helper.getFile(data, response); 
          }
        });
      } else {
        helper.reportServerError(response, "Invalid endpoint");
      }
    } else {
      helper.reportServerError(response, "Invalid endpoint");
      
    }
  } else if (splitURL[0] === "tags") {
      if (splitURL.length == 1) {
        db.getTagList(function (err, results) { 
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });
      } else {
        db.getTagsFiles(splitURL[1], function (err, results) {
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });
      }
  } else if (splitURL[0] === "artists") {
      if (splitURL.length == 1) {
        db.getArtistList(function (err, results) { 
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });
      } else {
        db.getArtistsFiles(splitURL[1], function (err, results) {
          if (err) {
            helper.reportServerError(response, err);
            return;
          }
          var output = new Object();
          output.result = results;
          response.writeHead(200, {
              'content-type': 'application/json', 
          });
          response.end(JSON.stringify(output));
        });
      }
  } else if (splitURL[0] === "upload") {
      
   // show a file upload form
    response.writeHead(200, {'content-type': 'text/html'});
    response.end(
      '<form action="/files" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="title"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    ); 
  } else {
    helper.reportServerError(response, "Invalid endpoint");
  }

}
