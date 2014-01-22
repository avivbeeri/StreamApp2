var fs = require('fs'),
    sqlite3 = require("sqlite3").verbose();

module.exports = new Database();

function Database () {}

Database.prototype.isConnected = function () {
  if (this.db) {
    console.log("connected");
  } else {
    console.log("not connected yet"); 
  }
  return this.db;
}

Database.prototype.connect = function (dbFile) {
  
  var exists = fs.existsSync(dbFile);

  var db = new sqlite3.Database(dbFile);
  db.serialize(function() {
    if(!exists) {
      db.run("CREATE TABLE files (id TEXT PRIMARY KEY, title TEXT, filePath TEXT, dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP)");
      db.run("CREATE TABLE tags (tag TEXT, file_id TEXT, FOREIGN KEY(file_id) REFERENCES Files(id))");
    }
  });
  this.db = db;
  return this;
}

Database.prototype.getFilePath = function (id, callback) {
  if (!this.db) {
    callback("Not Connected");
  }
  try {
    this.db.get("SELECT filePath FROM files WHERE id = ?",id , function (err, row) {
      if (err) {
        callback(err);
        return;
      }
      if (row === undefined) {
        callback("Error: No rows returned.");
        return;
      }
      callback(null, row.filePath);
      
    });
  } catch (err) {
    callback(err);
  }
}

Database.prototype.getFileTags = function (id, callback) {
  if (!this.db) {
    callback("Not Connected");
    return;
  } 
  var results = new Array(); 
  this.db.each("SELECT tag FROM tags WHERE file_id = ?", id , 
  function (err, row) {
    if (err) {
      callback(err);
    } else {
      results.push(row.tag);
    }
  }, 
  function (err, count) {
    if (err) {
      callback(err);
    } else {
      callback(null, results);  
    } 
  });
}

Database.prototype.getRecentFiles = function (callback) {
  if (!this.db) {
    callback("Not Connected");
    return;
  } 

  var results = new Array(); 
  this.db.each("SELECT id, title FROM files WHERE (julianday('now') - julianday(dateAdded)) < 8;",[],
  function (err, row) {
    if (err) {
      callback(err);
    } else {
      results.push(row);
    }
  }, 
  function (err, count) {
    
    if (err) {
      callback(err);
    } else {
      callback(null, results);  
    } 
  });
}

Database.prototype.getTagList = function (callback) {
  if (!this.db) {
    callback("Not Connected");
    return;
  } 
  var results = new Array(); 
  this.db.each("SELECT DISTINCT tag FROM tags",[],
  function (err, row) {
    if (err) {
      callback(err);
    } else {
      results.push(row.tag);
    }
  }, 
  function (err, count) {
    
    if (err) {
      callback(err);
    } else {
      callback(null, results);  
    } 
  });
}

Database.prototype.getTagsFiles = function (tag, callback) {
  if (!this.db) {
    callback("Not Connected");
    return;
  } 
  var results = new Array(); 
  tag = tag.toUpperCase();
  tag = tag.replace(/_|%20/gi," ");
  this.db.each("SELECT file_id, files.title FROM tags JOIN files ON tags.file_id = files.id WHERE UPPER(tag) = ?", tag,
  function (err, row) {
    if (err) {
      callback(err);
    } else {
      results.push(row);
    }
  }, 
  function (err, count) {
    
    if (err) {
      callback(err);
    } else {
      callback(null, results);  
    } 
  });
}

Database.prototype.addFile = function (fileData, callback) {
  if (!this.db) {
    callback("Error: Not Connected");
    return;
  }

  this.db.run("INSERT INTO files (id, filePath, title) VALUES (?, ?, ?)",
         [fileData.hash, fileData.path, fileData.title], function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });  
}

Database.prototype.addTagToFile = function (tag, fileid, callback) {
  if (!this.db) {
    callback("Error: Not Connected");
    return;
  }
  tag = tag.replace(/_|%20/gi," ");


  this.db.run("INSERT INTO tags (tag, file_id) VALUES (?, ?)",
         [tag, fileid], function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });  
}

Database.prototype.removeTagFromFile = function (tag, fileid, callback) {
  if (!this.db) {
    callback("Error: Not Connected");
    return;
  }
  var db = this.db;
  tag = tag.replace(/_|%20/gi," ");
  tag = tag.toUpperCase();
  db.run("DELETE FROM tags WHERE UPPER(tag) = ? AND file_id = ?",
         [tag, fileid], function (err) {
    if (err) {
      callback(err);
      return;
    }
    if (this.changes == 0) {
      callback("Error: Tag doesn't exist");
      return;
    }
    callback(null);

  });  
  

  
    

}
Database.prototype.removeFile = function (fileid, callback) {
  if (!this.db) {
    callback("Error: Not Connected");
    return;
  }
  var db = this.db;
  this.getFilePath(fileid, function(err, path) {
    var finished = 0;
    function returnWhen(total, result) {
      finished++;
      if (finished >= total) {
        callback(null, result);
      }
    }
    db.parallelize(function () {
      db.run("DELETE FROM tags WHERE file_id = ?",
             fileid, function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes == 0) {
          callback("Error: File doesn't exist");
          return;
        }

        returnWhen(2, path);
      });  
      
      db.run("DELETE FROM files WHERE id = ?",
             fileid, function (err) {
        console.log(this.changes);
        if (err) {
          callback(err);
          return;
        }
        if (this.changes == 0) {
          callback("Error: File doesn't exist");
          return;
        }

        returnWhen(2, path);
      });  

    });
    
  });

}

Database.prototype.close = function () {
  if (!this.db) {
    callback("Not Connected");
  } 
  this.db.close();
}
