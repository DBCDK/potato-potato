(function(fedora, query, callback) {
  var queryUrl = function(fedora) {
    return 'http://' + fedora + '/objects';
  }

  console.log("quering " + fedora + " for " + query);
  $http.get(queryUrl(fedora), {params: {title: true, maxResults: 0, resultFormat: 'xml', terms: query}}).then(function(response) {
    console.log(response);
    var doc = $.parseXML(response.data);
    var locator = $(doc);
    var hitCount = locator.find('completeListSize').text() || 0;
    callback('queries', hitCount);
  });
})