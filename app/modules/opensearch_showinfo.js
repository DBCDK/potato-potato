(function(location, callback) {
  var showInfoUrl = function(location) {
    return 'http://' + location + '?ShowInfo';
  };

  $http.get(showInfoUrl(location)).then(function(request) {
    var data = request.data.trim();
    data = data.replace(/^<pre>/g, "");
    data = data.replace(/<\/pre>$/g, "");
    data = data.trim();
    var lines = data.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);

    var settings = {};

    var indent = 0;
    var prefix = [];

    lines.forEach(function(line) {
      // indent = 

      var splitPoint = line.indexOf(':');

      if (splitPoint !== -1) {
        var key = line.slice(0, splitPoint).trim();
        var value = line.slice(splitPoint+1).trim();
        settings[key] = value;
      }
    });

    callback('ShowInfo', settings);
  });
})