'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('CompareCtrl', ['$scope', '$routeParams', '$http', '$timeout', function($scope, $routeParams, $http, $timeout) {

  $scope.loaded = false;

  $scope.loadables = {};

  $scope.doneLoading = function() {
    if (_.keys($scope.loadables).length === 0) {
      return false;
    }

    _.keys($scope.loadables, function(loadable) {
      if ($scope.loadables[loadable] == false) {
        $scope.loaded = false;
        return false
      }
    });

    $scope.loaded = true;
    return true;
  }

  $scope.toJson = function(object) {
    return JSON.stringify(object, null, 2);
  }

  $scope.servers = [];
  $scope.sections = {};
  $scope.onlyDiffs = true;
  $scope.highlight = true;
  var pendingQueries = {};
  var queryDelay = 500; // [ms]

  var addSection = function(sectionId, opts) {
    opts = opts || {};
    var type = opts.type ? opts.type : 'static';
    var script = opts.script ? opts.script : null;
    if ($scope.sections[sectionId] === undefined) {
      $scope.sections[sectionId] = {id: sectionId, type: type, fields: [], script: script};
    }
  }

  var addFields = function(sectionId, fields) {
    $scope.sections[sectionId]['fields'] = $scope.sections[sectionId]['fields'] || [];
    $scope.sections[sectionId]['fields'] = _.union($scope.sections[sectionId]['fields'], fields);
  }

  $scope.updateSections = function() {
    _.keys($scope.sections).forEach(function(sectionId) {
      var fields = [];
      $scope.servers.forEach(function(server) {
        fields = _.union(fields, _.keys(server.sections[sectionId]));
      });

      $scope.sections[sectionId]['fields'] = fields;
    });
  }

  var callScript = function(probe, server) {
    console.log("Calling " + probe.origin);
    probe.fn(server.id, function(sectionId, data) {
      server.sections[sectionId] = data;
      addSection(sectionId, {type: 'static', script: probe.script});
      addFields(sectionId, _.keys(data));
    });
  };

  var callScriptQuery = function(probe, server, query) {
    console.log("Calling " + probe.origin);
    probe.fn(server.id, query, function(sectionId, data) {
      server.sections[sectionId] = server.sections[sectionId] || {};
      server.sections[sectionId][query] = data;
      console.log("query: " + query + " =  " + data + " hits");
      addSection(sectionId, {type: 'query', script: probe.script});
      addFields(sectionId, [query]);
    });
  };

  $scope.updateScriptQuery = function(script, query, id) {
    id = script + "-" + id;
    var probe = $scope.module.probes[script];
    var runnable = function() {
      //console.log("script=" + script + " query='" + query + "' id=" + id);
      if (query != null && query.length > 0) {
        $scope.servers.forEach(function(server) {
          console.log("querying " + server.id + " for " + query);
          callScriptQuery(probe, server, query);
        });
      }
    };

    if (id != null) {
      pendingQueries[id] = query;
      $timeout(function() {
        if (query === pendingQueries[id]) {
          console.log("delayed query");
          runnable();
          delete pendingQueries[id];
        }
      }, queryDelay);
    } else {
      console.log("instant query");
      runnable();
    }
  };

  $scope.addServer = function(serverId) {
    delete $scope.newServer;
    delete $scope.newServerSelect;
    console.log("adding server: " + serverId);
    var server = {id: serverId, sections: {}};
    console.log("running " + _.keys($scope.module.probes).length + " probes");
    _.keys($scope.module.probes).forEach(function(probeId) {
      var probe = $scope.module.probes[probeId];
      var fn = probe.fn;

      switch(fn.length) {
        case 2:
          callScript(probe, server);
          break;
        case 3:
          probe.queries.forEach(function(query) {
            probe.queries.forEach(function(query) {
              callScriptQuery(probe, server, query);
            });
          });
          break;
        default: console.log("Unknown function arity found in " + probe.origin);
      }
    });
    $scope.servers.push(server);
  };

  $scope.removeServer = function(index) {
    if ($scope.servers[index] === $scope.reference) {
      delete $scope.reference;
    }
    $scope.servers.splice(index, 1);
    $scope.updateSections();
  };

  $scope.removeQuery = function(sectionId, queryIndex) {
    $scope.sections[sectionId].fields.splice(queryIndex, 1);
  }

  $scope.toggleDiffs = function() {
    $scope.onlyDiffs = !$scope.onlyDiffs;
  };

  $scope.toggleHighlight = function() {
    $scope.highlight = !$scope.highlight;
  };

  $scope.setReference = function(server) {
    $scope.reference = server;
  };

  $scope.compare = function(a, b) {
    if (_.isNumber(a) && _.isNumber(b)) {
      var val = a-b;
      var result = $scope.onlyDiffs ? val : val + ' (=' + a + ')';
      if (val >= 0) {
        return '+' + result;
      } else {
        return result;
      }
    } else {
      if (a === b) {
        return a;
      }
      a = JSON.stringify(a, null, 2);
      b = JSON.stringify(b, null, 2);
      return '' + b + ' \u21D2 ' + a;
    }
    return a-b;
  };

  $scope.getSectionRank = function(section) {
    var rank = $scope.module && $scope.module.config && $scope.module.config.sectionOrder && $scope.module.config.sectionOrder[section.id] ? $scope.module.config.sectionOrder[section.id] : 0;
    return rank;
  }

  //--

  var initialServers = $routeParams['server'];
  if (! _.isArray(initialServers)) {
    initialServers = initialServers != null ? [initialServers] : [];
  }

  var booter = function() {
    if ($scope.doneLoading()) {
      console.log("done loading!");
      initialServers.forEach(function(serverId) {
        $scope.addServer(serverId);
      });
    } else {
      $timeout(function(){
        booter();
      }, 100);
    }
  }

  var loadModule = function(moduleId) {
    console.log("Loading module width id=" + moduleId);

    $http.get('modules/' + moduleId + '.json').then(function (request) {
      $scope.module = {id: moduleId, config: request.data.config, probes: {}};

      var scripts = request.data.scripts || {};

      _.keys(scripts).forEach(function(script) {
        $scope.loadables[script] = false;
      });

      _.keys(scripts).forEach(function(script) {
        var probe = {origin: script};
        if (_.isArray(scripts[script])) {
          probe['queries'] = scripts[script];
        }
        $http.get(script).then(function (scriptRequest) {
          probe['fn'] = eval(scriptRequest.data);
          probe['script'] = script;
          $scope.module.probes[script] = probe;
          $scope.loadables[script] = true;
        })
      });
    });
  }

  booter();
  loadModule($routeParams.module);
}])
.controller('ModuleListCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('modules.json').then(function(request) {
    $scope.modules = request.data;
    console.log(JSON.stringify(request.data, null, 2));
  });
}]);