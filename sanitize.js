module.exports = function (string) {
    /*
      Sanitize the input strings where needed.
      Strip out forwardslashes and replace with the URL encoding
      Turn URL spaces and underscores into real spaces
    */
    var sanitized = string
                    .replace(/\//gi,"%2F")
                    .replace(/_|%20/gi," ");

    return sanitized;
  }
