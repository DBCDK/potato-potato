(function(solr, query, callback) {
  var queryUrl = function(solr) {
    return 'http://' + solr + '/select';
  }

  console.log("quering " + solr + " for " + query);
  $http.get(queryUrl(solr), {params: {wt: 'json', defType: 'edismax', q: query}}).then(function(response) {
    callback('queries', response['data']['response']['numFound']);
  });
})