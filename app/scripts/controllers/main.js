'use strict';
var BaseURL = 'http://temigo.pythonanywhere.com/';
//var BaseURL = 'http://127.0.0.1:8000/';

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
        '$log',
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
        'Frontier',
        'ImportGraph',
        'FileUploader',
        'Upload',
        'ToggleForceLayout',
        function ($scope, $log, $compile, $mdSidenav, $window, Graph, Infection, Algorithm, GenerateGraph, SimulateInfection, $timeout, FileSaver, Blob, Frontier, ImportGraph, FileUploader, Upload, ToggleForceLayout) {
      /* Error Options */
      $scope.error = "";
      $scope.closeAlert = function() {
        $scope.error = "";
      };

      /* Code Mirror Options */
      $scope.customAlgorithm = "\
import networkx as nx\n\
import numpy as np\n\
\n\
class CustomAlgorithm():\n\
    def run(self, graph, i_graph):\n\
        sources = []\n\
        # Compute sources here\n\
        \n\
        return sources";
      $scope.codeMirrorOptions = {
          theme:'vibrant-ink',
          mode:{name: 'python', version: 3, singleLineStringErrors: false},
          matchBrackets: true,
          autoCloseBrackets: true,
          showTrailingSpace: true,
          styleActiveLine: true,
          indentUnit: 4,
          lineNumbers: true,
          autofocus: true};

      $scope.currentIndex = 0;
      $scope.graphList = [];
      $scope.currentGraph = null;
      $scope.source = [];
      $scope.timeElapsed = 0;

      Graph.query(function(data) {
          $scope.graphList = data.results;
          $scope.currentGraph = angular.fromJson(data.results[$scope.currentIndex].data);
      });

     $scope.infectionList = [];
     $scope.currentInfection = null;
     $scope.currentInfectionIndex = 1;

     Infection.query(function(data) {
          $scope.infectionList = data.results;
          $scope.currentInfection = angular.fromJson(data.results[$scope.currentInfectionIndex].data);
      });

    $scope.parseInt = function(number) {
        return parseInt(number, 10);
    };


    $scope.setCurrentIndex = function(index) {
        $scope.currentIndex = index;
        $scope.currentGraph = angular.fromJson($scope.graphList[index].data);
    };

    $scope.setCurrentInfectionIndex = function(index) {
        $scope.currentInfection = angular.fromJson($scope.infectionList[index].data);
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
    $scope.positions = {};
    $scope.generateGraph = function(generateMethod, infection) {
        infection = typeof(infection) !== 'undefined' ? infection : false;
        GenerateGraph.query({'generateMethod':generateMethod}, function (data) {
            if (infection) {
                $scope.currentInfection = data.graph;
            }
            else {
                $scope.currentGraph = data.graph;
                $scope.positions = data.positions;
                $scope.reinitializeInfection();
            }
        });
    };
    /*
    Clean graph/infection : delete every old attribute
    */
    $scope.reinitializeInfection = function() {
        var infection = angular.fromJson($scope.currentInfection);
        infection.nodes = [];
        infection.links = [];
        $scope.currentInfection = angular.toJson(infection);
        $scope.source = [];
        $scope.seeds = [];
        $scope.timeElapsed = 0;
        $scope.convexHull = [];
    };

    $scope.algorithmMethods = [{id: 1, name: "Shah and Zaman", params: []},
                                {id: 2, name: "Netsleuth", params: [{name: "Probability of infection", value: $scope.proba, float: true}]},
                                {id: 3, name: "Pinto", params: [{name: "Observers", nodes: [], selectNodes: true}, {name: "Mean", value: 0, float: true}, {name: "Variance", value: 1, float: true}]},
                                {id: 4, name: "Fioriti and Chinnici", params: []},
                                {id: 5, name: "The faster, the guiltier", params: []},
                                {id: 6, name: "The faster, the guiltier (modified version)", params: []},
                                {id: 7, name: "Outside-in", params: [{name: "Probability of infection", value: $scope.proba, float: true}]}];
    $scope.algorithmMethod = $scope.algorithmMethods[0];
    $scope.multiple = {};

    $scope.sourceFrequencies = {};
    $scope.timeElapsedList = [];
    $scope.sourceDistances = {};
    $scope.mean = 0;
    $scope.variance = 0;
    $scope.detailed_study = {};
    $scope.no_source = false;
    $scope.diameter = -1;
    $scope.source_order = function(s) { return $scope.sourceFrequencies[s]; };
    $scope.applyAlgorithm = function(algorithmMethod, multiple, customAlgorithm) {
        if (!multiple.enabled) { multiple.times = 1; }
        if (multiple.average === undefined) { multiple.average = 20; }
        if (multiple.detailed === undefined) { multiple.detailed = false; }
        if (multiple.measure === undefined) { multiple.measure = false; }
        var params = {'algorithmMethod': algorithmMethod, 'algo': customAlgorithm, 'currentGraph': $scope.currentGraph, 'currentInfection': $scope.currentInfection, 'times': multiple.times, 'average': multiple.average, 'detailed': multiple.detailed, 'measure': multiple.measure, 'seeds': $scope.seeds, 'ratio': $scope.ratio, 'proba': $scope.proba};
        $scope.source = [];
        $scope.timeElapsed = 0;
        Algorithm.query(params, function (data) {
            if (!multiple.detailed) {
                $scope.mean = data.mean;
                $scope.variance = data.variance;
                $scope.error = data.error;
                for (var j = 0; j < data.source.length; j++) {
                    var source = data.source[j];
                    $scope.sourceDistances[source] = {};

                    angular.forEach(data.distances[source], function(value, key) {
                        $scope.sourceDistances[source][key] = value;
                    });
                    if ($scope.source.indexOf(source) == -1) {
                        $scope.source.push(source);
                        $scope.sourceFrequencies[source] = 1;
                    }
                    else {
                        $scope.sourceFrequencies[source]++;
                    }
                }
                $scope.diameter = data.diameter;
                $scope.no_source = (data.source == -1);
                $scope.timeElapsedList = data.timeElapsed;
                $scope.timeElapsed = $scope.timeElapsedList.reduce(function(a, b){return a+b;}) / multiple.times;
            }
            else {
                // Detailed study
                $scope.detailed_study = data.data;
                var blob = new Blob([data.data], {type: 'text/csv'});
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = (window.URL || window.webkitURL).createObjectURL( blob );
                a.download = "detailed.csv";
                a.click();
            }
        }, function(error) {
            $scope.error = "Error "+ error.status + " : " + error.statusText + "\n" + $scope.error;
        });

    };

    $scope.seeds = [];
    $scope.ratio = 0;
    $scope.proba = 0;
    $scope.simulateInfection = function(seeds, ratio, proba) {
        $scope.seeds = seeds;
        $scope.ratio = ratio;
        $scope.proba = proba;
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
        var graph = angular.fromJson($scope.currentGraph);
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

    $scope.convexHull = [];
    $scope.findFrontier = function() {
        Frontier.query({'currentInfection': $scope.currentInfection}, function(data) {
            $scope.convexHull = data.convexHull;
        });
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
    $scope.graphUploader = new FileUploader();
    $scope.graphUploader.url = BaseURL + 'graph/import/graph/';
    $scope.graphUploader.method = 'POST';
    $scope.graphUploader.withCredentials = true;
    $scope.graphUploader.autoUpload = true;
    $scope.uploadGraph = function($fileContent, infection){
        if (infection == undefined) { infection = false; }
        Upload.upload({
            url: BaseURL + 'graph/import/graph/',
            data: {file: $fileContent}
        }).then(function(data) {
            $log.debug(data);
            if (infection) {
                $scope.currentInfection = data.data;
            }
            else {
                $scope.currentGraph = data.data;
            }
        });
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

    $scope.layout = ToggleForceLayout;
    $scope.toggleForceLayout = function() {
        $scope.layout.on = !$scope.layout.on;
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
  .controller('SidenavCtrl', function ($scope, $timeout, $mdSidenav, ViewParameters) {
    $scope.params = ViewParameters;

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
.directive('colorNode', ['d3Service', function(d3Service) {
    return {
      restrict: 'EA',
      scope: {
          color: '@'
      },
      link: function(scope, element, attrs) {
        d3Service.then(function(d3) {

            var color = d3.scale.category20().domain(d3.range(0,20));
            var svg = d3.select(element[0]).append("svg")
                .attr("height", 30)
                .attr("width", 30);
            var circle = svg.append("circle")
                .attr("cx", 15)
                .attr("cy", 15)
                .attr("r", 10)
                .style("fill", scope.color);
        });
      }
  };
}]);
