'use strict';

/**
 * @ngdoc function
 * @name whisperApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whisperApp
 */
angular.module('whisperApp')
    .controller('MainCtrl', [
        '$scope',
        '$compile',
        '$mdSidenav',
        '$window',
        'Graph',
        'Infection',
        'Algorithm',
        'GenerateGraph',
        'SimulateInfection',
        '$timeout',
        'FileSaver',
        'Blob',
        function ($scope, $compile, $mdSidenav, $window, Graph, Infection, Algorithm, GenerateGraph, SimulateInfection, $timeout, FileSaver, Blob) {
      $scope.currentIndex = 0;
      $scope.graphList = [];
      $scope.currentGraph = null;
      $scope.source = [];
      $scope.timeElapsed = 0;

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

    /*
    Generation methods (cf NetworkX documentation)
    */
    $scope.generateMethods = [{id: 1, name: "Complete graph", group: "Classic", description: "Return the complete graph K_n with n nodes.", params: [{name: "n", value: undefined}]},
                            {id: 2, name: "Cycle graph", group: "Classic", description: "Return the cycle graph C_n over n nodes.", params: [{name: "n", value: 0}]},
                            {"id": 3, "name": "Circular ladder graph", group: "Classic", description: "Return the circular ladder graph CL_n of length n.", params: [{name: "n", value: 0}]},
                            {"id": 4, "name": "Dorogovtsev_goltsev_mendes graph", group: "Classic", description: "Return the hierarchically constructed Dorogovtsev-Goltsev-Mendes graph.", params: [{name: "n", value: 0}]},
                            {"id": 5, "name": "Empty graph", group: "Classic", description: "Return the empty graph with n nodes and zero edges.", params: [{name: "n", value: 0}]},
                            {"id": 6, "name": "Hypercube graph", group: "Classic", description: "Return the n-dimensional hypercube.", params: [{name: "n", value: 0}]},
                            {"id": 7, "name": "Ladder graph", group: "Classic", description: "Return the Ladder graph of length n.", params: [{name: "n", value: 0}]},
                            {"id": 8, "name": "Path graph", group: "Classic", description: "Return the Path graph P_n of n nodes linearly connected by n-1 edges.", params: [{name: "n", value: 0}]},
                            {"id": 9, "name": "Star graph", group: "Classic", description: "Return the Star graph with n+1 nodes: one center node, connected to n outer nodes.", params: [{name: "n", value: 0}]},
                            {id: 10, name: "Wheel graph", group: "Classic", description: "Return the wheel graph: a single hub node connected to each node of the (n-1)-node cycle graph.", params: [{name: "n", value: 0}]},
                            {id: 11, name: "Balanced tree", group: "Classic", description: "Return the perfectly balanced r-tree of height h.", params: [{name: "r", value: 0}, {name: "h", value: 0}]},
                            {id: 12, name: "Barbell graph", group: "Classic", description: "Return the Barbell Graph: two complete graphs of m1 nodes connected by a path of m2 nodes.", params: [{name: "m1", value: 0}, {name: "m2", value: 0}]},
                            {id: 13, name: "2D Grid Graph", group: "Classic", description: "Return the 2d grid graph of mxn nodes, each connected to its nearest neighbors.", params: [{name: "m", value: 0}, {name: "n", value: 0}]},
                            {id: 14, name: "Lollipop Graph", group: "Classic", description: "Return the Lollipop Graph; K_m connected to P_n.", params: [{name: "m", value: 0}, {name: "n", value: 0}]},
                            {id: 15, name: "Margulis-Gabber-Galil", group: "Expanders", description: "Return the Margulis-Gabber-Galil undirected MultiGraph on n^2 nodes.", params: [{name: "n", value: 0}]},
                            {id: 16, name: "Chordal cycle graph", group: "Expanders", description: "Return the chordal cycle graph on p nodes.", params: [{name: "p", value: 0}]},
                            {id: 17, name: "Bull graph", group: "Small", description: "Return the Bull graph.", params: []},
                            {id: 18, name: "Chvátal graph", group: "Small", description: "Return the Chvátal graph.", params: []},
                            {id: 19, name: "Moebius-Kantor graph", group: "Small", description: "Return the Moebius-Kantor graph.", params: []},
                            {id: 20, name: "Karate Club graph", group: "Social Networks", description: "Return Zachary’s Karate Club graph.", params: []},
                            {id: 21, name: "Davis Southern", group: "Social Networks", description: "Return Davis Southern women social network.", params: []},
                            {id: 22, name: "Florentine families graph", group: "Social Networks", description: "Return Florentine families graph.", params: []},
                            {id: 23, name: "Caveman graph", group: "Community", description: "Returns a caveman graph of l cliques of size k.", params: [{name: "l", value: 0}, {name: "k", value: 0}]},
                            {id: 24, name: "Erdős-Rényi graph", group: "Random Graphs", description: "Returns a G_{n,p} random graph, also known as an Erdős-Rényi graph or a binomial graph.", params: [{name: "n", value: 0}, {name: "p", value: 0, float: true}]},
                            {id: 25, name: "Newman–Watts–Strogatz graph", group: "Random Graphs", description: "Return a Newman–Watts–Strogatz small-world graph.", params: [{name: "n", value: 0}, {name: "k", value: 0}, {name: "p", value: 0, float: true}]},
                            {id: 26, name: "Barabási–Albert graph", group: "Random Graphs", description: "Returns a random graph according to the Barabási–Albert preferential attachment model.", params: [{name: "n", value: 0}, {name: "m", value: 0}]}];
    // Default value
    $scope.generationMethod =   $scope.generateMethods[0];
    $scope.generateGraph = function(generateMethod, infection) {
        infection = typeof(infection) !== 'undefined' ? infection : false;
        GenerateGraph.query({'generateMethod':generateMethod}, function (data) {
            if (infection) {
                $scope.currentInfection = data;
            }
            else {
                $scope.currentGraph = data;
                $scope.reinitializeInfection();
            }
        });
    };

    $scope.reinitializeInfection = function() {
        var infection = angular.fromJson($scope.currentInfection);
        infection.nodes = [];
        $scope.currentInfection = angular.toJson(infection);
        $scope.source = [];
        $scope.timeElapsed = 0;
    };

    // [{name: "Source of BFS tree", value: null, help: "Infected node"}]
    $scope.algorithmMethods = [{id: 1, name: "Shah and Zaman", params: []},
                                {id: 2, name: "Netsleuth", params: []},
                                {id: 3, name: "Pinto", params: [{name: "Observers", value: [], selectNodes: true}, {name: "Mean", value: 0, float: true}, {name: "Variance", value: 1, float: true}]}];
    $scope.algorithmMethod = $scope.algorithmMethods[0];
    $scope.multiple = {};
    $scope.applyAlgorithm = function(algorithmMethod, multiple) {
        if (!multiple.enabled) { multiple.times = 1; }
        var params = {'algorithmMethod': algorithmMethod, 'currentGraph': $scope.currentGraph, 'currentInfection': $scope.currentInfection};
        $scope.source = [];
        $scope.timeElapsed = 0;
        
        for (var i = 0; i < multiple.times ; i++) {
            Algorithm.query(params, function (data) {
                for (var j = 0; j < data.source.length; j++) {
                    var source = data.source[j];
                    if ($scope.source.indexOf(source) == -1) {
                        $scope.source.push(source);
                    }
                }
                console.log(data.timeElapsed);
                $scope.timeElapsed = $scope.timeElapsed + data.timeElapsed;
            });
        }

        $scope.timeElapsed = $scope.timeElapsed / multiple.times;
    };

    $scope.seeds = [];
    $scope.selectSeeds = 1;
    $scope.simulateInfection = function(seeds, ratio, proba) {
        console.log(seeds);
        SimulateInfection.query({'currentGraph': $scope.currentGraph, 'seeds': {"data": seeds}, 'ratio': ratio, 'proba': proba}, function(data) {
            $scope.currentInfection = data.infectionGraph;
        });
    };

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

    $scope.infectMode = false;
    $scope.updateInfectMode = function() {
        $scope.infectMode = !$scope.infectMode;
    };

    // Export Graph or Infection - using FileSaver
    $scope.export = function(data) {
        var pretty_data = JSON.stringify(angular.fromJson(data), null, "    ");
        FileSaver.saveAs(new Blob([pretty_data], {type: "application/json"}), "graph.json");
    };

    /* Upload */
    $scope.uploadInfection = function($fileContent){
        $scope.currentInfection = $fileContent;
    };
    $scope.uploadGraph = function($fileContent){
        $scope.currentGraph = $fileContent;
    };

    /*
    View parameters
    Sidenav
    */
    $scope.toggleSide = buildToggler('right');
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            console.debug("toggle " + navID + " is done");
          });
      };
    }
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
  .controller('SidenavCtrl', function ($scope, $timeout, $mdSidenav, ViewParameters) {
    $scope.params = ViewParameters;

    console.log($scope.params);
    $scope.$watch('params', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            ViewParameters.set(newValue);
        }
    }, true);

    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          console.debug("close RIGHT is done");
        });
    };
  })
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
})
.directive('selectNodes', ['SelectionNodes', function (SelectionNodes) {
  return {
      restrict: 'EA',
      scope: {
          'nodes': '=',
          'select': '='
      },
      templateUrl: 'views/selectNodes.html',
      link: function(scope, element, attrs) {
          scope.p = SelectionNodes;
          scope.select = scope.p.on;

          scope.$watch('p.nodes', function(newValue, oldValue) {
              if (!newValue) {
                  return;
              }
              scope.nodes = newValue;
          }, true);

          /*scope.$watch('p', function(newValue, oldValue) {
              if (!newValue) return;
              console.log("selectNodes");
              console.log(newValue);
              scope.p = newValue;
              scope.nodes = scope.p.nodes;
              console.log(scope.nodes);
          }, true);*/

          scope.$watch('select', function(newValue, oldValue) {
              if (newValue === oldValue) { return; }
              console.log("select");
              scope.p.set(newValue);
              scope.select = newValue;
          });
      }
  };
}]);
