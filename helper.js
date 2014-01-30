var fs = require('fs'),
    mv = require('mv'),
    db = require("./db.js"),
    path = require('path'),
    ffmetadata = require('ffmetadata');



module.exports = {

  reportServerError : function (response, error) {
    response.writeHead(500);
    response.end("Error Occurred, see console.");
    console.log(error);
  },

  getFile : function (filePath, response) {
    
    var stat = fs.statSync(filePath);
    fs.exists(filePath, function (exists) {

      if (!exists) {
        response.writeHead(404);
        response.end("Error");
        return;
      }

      
      response.writeHead(200, {
          'content-type': 'audio/mpeg', 
          'content-length': stat.size
      });
      
      var readStream = fs.createReadStream(filePath);
      // We replaced all the event handlers with a simple call to util.pump()
      readStream.pipe(response);
    });
  },
  
  storeFile : function (fileData, tags, callback) {
   
    if (!tags) {
      tags = new Array();
    }
    //get id3 tags so we can determine the artist
    ffmetadata.read(fileData.path, function (err, data) {
      if (err) {
        callback(err);
      } else {
        if (!data.artist) {
          data.artist = "Unsorted";
        } 
        if (!data.title) {
          var pos = fileData.filename.lastIndexOf(".");

          data.title = fileData.filename.substring(0, pos);
        }
        fileData.title = data.title;
        fileData.artist = data.artist;
        tags.push(data.artist);
        console.log("File Data: " + JSON.stringify(fileData));
        var dest = path.join(__dirname, "files", data.artist);
        var finalPath = dest + "/" + fileData.filename;
        mv(fileData.path, finalPath, {mkdirp: true}, function (err) {
          if (err) {
            console.error("mv: " + err);
            callback(err);
            return;
          }
          fileData.path = finalPath; 
          db.addFile(fileData, function (err) {
            if (err) {
              callback(err);
              return;
            }
            //SUCCESS
            if (tags.length > 0) {
              function addTag(i) {
                if (i < tags.length) {
                  db.addTagToFile(tags[i], fileData.hash, function (err) {
                    if (err) {
                      throw err;
                    }
                    addTag(i+1);
                  });
                }
              }
              addTag(0);
            }
            callback(null, fileData.hash);
          });
        });
      }
    });
  }
}
