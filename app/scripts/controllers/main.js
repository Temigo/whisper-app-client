'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('whisperApp')
  .controller('MainCtrl', function ($scope, Graph) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.graphs = Graph.query(); //Graph.query();
    console.log($scope.graphs.count);
    $scope.hello = 'Hi everyone !';
  });
