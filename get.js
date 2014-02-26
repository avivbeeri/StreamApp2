
module.exports = function() {
  var router = require('restroute');
  var fs = require('fs');
  var ffmetadata = require('ffmetadata');
  var db = require("./db.js");
  var helper = require('./helper.js');
  
  router.get("/files/recent", function (req, res) {
    db.getRecentFiles(function(err, results) {
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });
  });

  router.get("/files/:id", function (req, res) {
    db.getFilePath(req.params.id, function (err, data) {
      if (err) {
        res.writeHead(404, {
            'content-type': 'application/json', 
        });

        res.end(JSON.stringify({error: "File doesn't exist"}));
      } else { 
        console.log("Getting file");
        helper.getFile(data, res); 
      }
    });

  });

  router.get("/files/:id/tags/", function (req, res) {
    db.getFileTags(req.params.id, function (err, results) {
      if (err) {
        helper.reportServerError(res, err);
        return;
      }
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });

  });

  router.get("/files/:id/id3", function (req, res) {
    console.log("getting id3 tags");
    db.getFilePath(req.params.id, function (err, url) {
      if (err) {
        console.error(err);
      } else { 
        ffmetadata.read(url, function(err, data) {

          if (err) {
            helper.reportServerError(res, "Error reading metadata: " + err);
          } else {
            res.writeHead(200, {
                'content-type': 'application/json', 
            });

            res.end(JSON.stringify({result : data}));

          }
        });

      }
    });
  });

  router.get("/tags", function (req, res) {
    db.getTagList(function (err, results) { 
      if (err) {
        helper.reportServerError(res, err);
        return;
      }
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });
  });

  router.get("/tags/:tag", function (req, res) {
    db.getTagsFiles(req.params.tag, function (err, results) {
      if (err) {
        helper.reportServerError(res, err);
        return;
      }
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });

  });

  router.get("/artists", function (req, res) {
    db.getArtistList(function (err, results) { 
      if (err) {
        helper.reportServerError(res, err);
        return;
      }
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });
  });

  router.get("/artists/:artist", function (req, res) {
    db.getArtistsFiles(req.params.artist, function (err, results) {
      if (err) {
        helper.reportServerError(res, err);
        return;
      }
      var output = new Object();
      output.result = results;
      res.writeHead(200, {
          'content-type': 'application/json', 
      });
      res.end(JSON.stringify(output));
    });

  });

  router.get("/upload", function(req, res) {
     // show a file upload form
      res.writeHead(200, {'content-type': 'text/html'});
      res.end(
        '<form action="/files" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
      ); 

  });

}
