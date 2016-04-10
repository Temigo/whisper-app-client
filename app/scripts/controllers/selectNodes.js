'use strict';

angular.module('whisperApp')
.directive('selectNodes', ['SelectionNodes', function (SelectionNodes) {
  return {
      restrict: 'EA',
      scope: {
          'currentNodes': '@',
          'nodes': '=',
          'select': '='
      },
      templateUrl: 'views/selectNodes.html',
      link: function(scope, element, attrs) {
          scope.p = new SelectionNodes.Instance();
          scope.select = scope.p.on;

          scope.$watch('p.nodes', function(newValue, oldValue) {
              if (!newValue) {
                  return;
              }
              scope.nodes = newValue;
          }, true);

          scope.$watch('select', function(newValue, oldValue) {
              if (newValue === oldValue) { return; }
              scope.p.set(newValue);
              scope.select = newValue;
          });

          // Functions for autocomplete
          // scope.currentNodes = scope.currentNodes.map(function(item) { return item.id; });
          scope.$watch('currentNodes', function(newValue, oldValue) {
             if (newValue === oldValue) { return; }
             scope.currentNodes = newValue;
         }, true);
         scope.querySearch = function(query) {
             var nodes = angular.fromJson(scope.currentNodes);
           return query ? nodes.filter(scope.createFilterFor(query)) : [];
         };
         scope.createFilterFor = function(query) {
             var lowerCaseQuery = angular.lowercase(query);
             return function filterFn(node) {
                return node.id.toString().indexOf(lowerCaseQuery) === 0;
             };
         };
         scope.transformChip = function(chip) {
             if (angular.isObject(chip)) {
                 return chip;
             }
             return {"id": chip};
         };

      }
  };
}]);
