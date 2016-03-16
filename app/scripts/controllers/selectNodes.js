'use strict';

angular.module('whisperApp')
.directive('selectNodes', ['SelectionNodes', function (SelectionNodes) {
  return {
      restrict: 'EA',
      scope: {
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
      }
  };
}]);
