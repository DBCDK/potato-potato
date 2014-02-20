(function(solr, callback) {
  var lukeUrl = function(solr) {
    return 'http://' + solr + '/admin/luke?wt=json';
  };

  $http.get(lukeUrl(solr)).then(function(request) {
    var fields = {}, metadata = {};
    var fieldIDs = _.keys(request.data['fields']);
    fieldIDs.forEach(function(fieldId) {
      fields[fieldId] = request.data['fields'][fieldId]['docs'];
    });
    metadata = request.data['index'];
    delete metadata['directory'];
    callback('fields', fields);
    callback('metadata', metadata);
  });
})