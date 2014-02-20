(function(opensearch, query, callback) {
  var queryUrl = function(opensearch) {
    return 'http://' + opensearch;
  };

  var wrapQuery = function(query) {
    return '<?xml version="1.0" encoding="UTF-8"?>\
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://oss.dbc.dk/ns/opensearch">\
  <SOAP-ENV:Body>\
    <ns1:searchRequest>\
      <ns1:query>' + query + '</ns1:query>\
      <ns1:agency>100200</ns1:agency>\
      <ns1:profile>test</ns1:profile>\
      <ns1:start>1</ns1:start>\
      <ns1:stepValue>10</ns1:stepValue>\
    </ns1:searchRequest>\
  </SOAP-ENV:Body>\
</SOAP-ENV:Envelope>';
  };

  var soapQuery = wrapQuery(query);

  console.log("quering " + opensearch + " for " + query);
  $http.post(queryUrl(opensearch), soapQuery, {params: {no: 0}}).then(function(response) {
    var doc = $.parseXML(response.data);
    var locator = $(doc);
    var hitCount = locator.find('hitCount').text() || 0;
    callback('queries', hitCount);
  });
})