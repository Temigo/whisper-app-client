'use strict';

/**
 * @ngdoc function
 * @name whisperApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whisperApp
 */
angular.module('whisperApp')
    .controller('MainCtrl', ['$scope', 'Graph', 'Infection', 'GenerateGraph', 'FileUploader', 'Upload', '$timeout', function ($scope, Graph, Infection, GenerateGraph, FileUploader, Upload, $timeout) {
        /*$scope.uploader = new FileUploader({method: 'GET'});
        console.log($scope.uploader);
        $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
            var graph = angular.fromJson(fileItem.url);
            console.log("Hi");
        };
        $scope.upload = {};
        $scope.upload.src = "";
        $scope.run_upload = function(file) {
                console.log(file);
        };*/
            $scope.uploadFiles = function(file, errFiles) {
                $scope.f = file;
                $scope.errFile = errFiles && errFiles[0];
                if (file) {
                    console.log(file);
                    angular.fromJson(file);
                    /*file.upload = Upload.upload({
                        url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                        data: {file: file}
                    });

                    file.upload.then(function (response) {
                        $timeout(function () {
                            file.result = response.data;
                        });
                    }, function (response) {
                        if (response.status > 0)
                            $scope.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        file.progress = Math.min(100, parseInt(100.0 *
                                                 evt.loaded / evt.total));
                    });*/
                }
            };

      //$scope.graphResult = Graph.query();
      $scope.currentIndex = 0;
      $scope.graphList = [];
      $scope.currentGraph = null;

      Graph.query(function(data) {
          $scope.graphList = data.results;
          $scope.currentGraph = data.results[$scope.currentIndex].data;
          //$scope.graph = $scope.graphResult[0].data;
          console.log($scope.graphList);
      });

      /*$scope.watch('currentIndex', function(newVal, oldVal) {
         if (newVal !== oldVal) {
             //if (graphList !== []) {
             $scope.currentIndex = newVal;
             $scope.currentGraph = $scope.graphList[newVal].data;
            //}
         }
     });*/
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
        $scope.currentGraph = $scope.graphList[index].data;
    };

    $scope.setCurrentInfectionIndex = function(index) {
        $scope.currentInfection = $scope.infectionList[index].data;
    };

    $scope.generateGraph = function(index, n, infection=false) {
        GenerateGraph.query({'generateMethod':index, 'n': n}, function (data) {
            if (infection) {
                $scope.currentInfection = data;
            }
            else {
                $scope.currentGraph = data;
            }
        });
    };

    $scope.addNode = function() {
        var graph = angular.fromJson($scope.currentGraph);
        var n = graph.nodes.length;
        graph.nodes.push({"id": n+1});
        $scope.currentGraph = angular.toJson(graph);
        console.log($scope.currentGraph);
    };

    $scope.addEdge = function() {

    };
  }])
    .directive('d3graph', ['d3Service', function(d3Service) {
        //Constants for the SVG
        var width = 500,
          height = 500;

        return {
          restrict: 'EA',
          scope: {
              data: '=graphData',
              infectionData: '=infectionData'
          },
          link: function(scope, element, attrs) {
              d3Service.then(function(d3) {
              //Set up the colour scale
              var color = d3.scale.category20();
              //Set up the force layout
              var force = d3.layout.force()
                  .charge(-120)
                  .linkDistance(50)
                  .size([width, height]);
                  //Append a SVG to the body of the html page. Assign this SVG as an object to svg
                  var svg = d3.select(element[0]).append("svg")
                      //.attr("width", width)
                      .attr("height", height)
                      .call(d3.behavior.zoom().on("zoom", function () {
                          svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                        }))
                      .style("width", "100%");


            scope.$watchGroup(['data', 'infectionData'], function(newData, oldData) {
                svg.selectAll('*').remove();
                if (!newData) { // || newData === oldData
                    return;
                }

                    var currentGraph = angular.fromJson(newData[0]);
                    //var currentGraph = newData[0];
                    //Read the data from the mis element
                    var nodes = currentGraph.nodes;
                    var links = currentGraph.links;
                    //var nodes = [{'id': 1}, {'id': 2}];
                    //var links = [];
                    var infected_nodes = angular.fromJson(newData[1]).nodes;
                    //var infected_nodes = newData[1].nodes;
                    //var infected_nodes = [];
                    //console.log(angular.fromJson(newData[1]).nodes);

                    for (var d in nodes) {
                    	if (d in infected_nodes) { nodes[d].infected = true; } else {nodes[d].infected = false; }
                    }
                    //Creates the graph data structure out of the json data
                    force.nodes(nodes)
                        .links(links)
                        .start();

                        //Create all the line svgs but without locations yet
                        var link = svg.selectAll(".link")
                            .data(links)
                            .enter().append("line")
                            .attr("class", "link")
                            .style("stroke-width", function (d) {
                            return 1;
                        });

                        var highlightNode = function(node) {
                            d3.select(this).style("fill", "red");
                        };

                        //Do the same with the circles for the nodes - no
                        var color_index = 1;
                        var connectedNodes = [];
                        var node = svg.selectAll(".node")
                            .data(nodes)
                            .enter().append("circle")
                            .attr("class", "node")
                            .attr("r", 8)
                            .style("fill", function (d) {
                            if (d.infected) { color_index = 0; } else { color_index = 1; }
                            return color(color_index);
                        })
                            .call(force.drag)
                            .on('click', highlightNode);


                        //Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
                        force.on("tick", function () {
                            link.attr("x1", function (d) {
                                return d.source.x;
                            })
                                .attr("y1", function (d) {
                                return d.source.y;
                            })
                                .attr("x2", function (d) {
                                return d.target.x;
                            })
                                .attr("y2", function (d) {
                                return d.target.y;
                            });

                            node.attr("cx", function (d) {
                                return d.x;
                            })
                                .attr("cy", function (d) {
                                return d.y;
                            });
                        });
                        // End force tick
                    }); // scope watch
                }); // d3Service.then
            } // link
        }; // return
  }])
  .controller('existingGraphCtrl', ['$scope', function($scope) {
      $scope.watch('currentIndex', function(newVal, oldVal) {
         if (newVal !== oldVal) {
             //if (graphList !== []) {
             $scope.currentGraph = $scope.graphList[newVal].data;
            //}
         }
     });
  }]);
