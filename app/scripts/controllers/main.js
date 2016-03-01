'use strict';

/**
 * @ngdoc function
 * @name whisperApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whisperApp
 */
angular.module('whisperApp')
    .controller('MainCtrl', ['$scope', '$window', 'Graph', 'Infection', 'Algorithm', 'GenerateGraph', '$timeout', 'FileSaver', 'Blob', function ($scope, $window, Graph, Infection, Algorithm, GenerateGraph, $timeout, FileSaver, Blob) {
      //$scope.graphResult = Graph.query();
      $scope.currentIndex = 0;
      $scope.graphList = [];
      $scope.currentGraph = null;

      Graph.query(function(data) {
          $scope.graphList = data.results;
          $scope.currentGraph = data.results[$scope.currentIndex].data;
      });

     $scope.infectionList = [];
     $scope.currentInfection = null;
     $scope.currentInfectionIndex = 1;

     Infection.query(function(data) {
          $scope.infectionList = data.results;
          $scope.currentInfection = data.results[$scope.currentInfectionIndex].data;
      });

      $scope.parseInt = function(number) {
        return parseInt(number, 10);
    };


    $scope.setCurrentIndex = function(index) {
        $scope.currentIndex = index;
        $scope.currentGraph = $scope.graphList[index].data;
    };

    $scope.setCurrentInfectionIndex = function(index) {
        console.log($scope.infectionList);
        $scope.currentInfection = $scope.infectionList[index].data;
    };

    $scope.generateGraph = function(index, n, infection) {
        infection = typeof(infection) !== 'undefined' ? infection : false;
        GenerateGraph.query({'generateMethod':index, 'n': n}, function (data) {
            if (infection) {
                $scope.currentInfection = data;
            }
            else {
                $scope.currentGraph = data;
            }
        });
    };

    //$scope.source = 1;
    //$scope.sourceHyp = 1;
    $scope.applyAlgorithm = function(index, source) {
        if (index == 1) {
            Algorithm.query({'algorithmMethod': index, 'currentGraph': $scope.currentGraph, 'currentInfection': $scope.currentInfection, 'v': source}, function (data) {
                $scope.source = data['source'];
            });
        }
        else {
            Algorithm.query({'algorithmMethod': index, 'currentGraph': $scope.currentGraph, 'currentInfection': $scope.currentInfection}, function (data) {
                $scope.source = data['source'];
            });
        }
    };

    $scope.infectMode = false;
    $scope.addNode = function() {
        var graph = angular.fromJson($scope.currentGraph);
        var n = graph.nodes.length;
        graph.nodes.push({"id": n+1});
        $scope.currentGraph = angular.toJson(graph);
        //console.log($scope.currentGraph);
    };

    $scope.infectNode = function(node, infected) {
        var infected_graph = angular.fromJson($scope.currentInfection);
        if (!infected) {
            infected_graph.nodes.push({"id": node.id});
        }
        else {
            var removeIndex = infected_graph.nodes.map(function(item) { return item.id; }).indexOf(node.id);
            infected_graph.nodes.splice(removeIndex, 1);
        }
        $scope.currentInfection = angular.toJson(infected_graph);
    };

    $scope.addEdge = function() {

    };


    $scope.updateInfectMode = function() {
        $scope.infectMode = !$scope.infectMode;
    };

    // Export Graph or Infection - using FileSaver
    $scope.export = function(data) {
        var pretty_data = JSON.stringify(angular.fromJson(data), null, "    ");
        FileSaver.saveAs(new Blob([pretty_data], {type: "application/json"}), "graph.json");
    };

    $scope.uploadInfection = function($fileContent){
        $scope.currentInfection = $fileContent;
    };
    $scope.uploadGraph = function($fileContent){
        $scope.currentGraph = $fileContent;
    };

  }])
  .controller('existingGraphCtrl', ['$scope', function($scope) {
      $scope.watch('currentIndex', function(newVal, oldVal) {
         if (newVal !== oldVal) {
             //if (graphList !== []) {
             $scope.currentGraph = $scope.graphList[newVal].data;
            //}
         }
     });
  }])
  .directive('onReadFile', function ($parse) {
 	return {
 		restrict: 'A',
 		scope: false,
 		link: function(scope, element, attrs) {
             var fn = $parse(attrs.onReadFile);

 			element.on('change', function(onChangeEvent) {
 				var reader = new FileReader();

 				reader.onload = function(onLoadEvent) {
 					scope.$apply(function() {
 						fn(scope, {$fileContent:onLoadEvent.target.result});
 					});
 				};

 				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
 			});
 		}
 	};
});
