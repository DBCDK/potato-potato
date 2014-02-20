'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('objectToArray', [function() {
    return function(input) {
      var output = [];
      for(var i in input){
        output.push(input[i]);
      }
      return output;
    }
  }]);
