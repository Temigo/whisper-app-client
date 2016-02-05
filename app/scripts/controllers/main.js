'use strict';

/**
 * @ngdoc function
 * @name whisperApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whisperApp
 */
angular.module('whisperApp')
    .controller('MainCtrl', ['$scope', 'Graph', 'Infection', function ($scope, Graph, Infection) {
      //$scope.graphResult = Graph.query();
      Graph.query(function(data) {
          $scope.graphList = data.results;
          $scope.currentGraph = data.results[0].data;
          //$scope.graph = $scope.graphResult[0].data;
      });

      $scope.currentIndex = 1;

      Infection.query(function(data) {
          $scope.infectionResult = data;
      });

      $scope.currentInfectionIndex = 1;
  }])
    .directive('d3graph', ['d3Service', function(d3Service) {
        //Constants for the SVG
        var width = 500,
          height = 500;

        return {
          restrict: 'EA',
          scope: {
              data: '=graphData'
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
                      .style("width", "100%");

            scope.$watch('data', function(newData, oldData) {
                svg.selectAll('*').remove();
                if (!newData) { // || newData === oldData
                    return;
                }
                //else {
                    // TODO scope.currentIndex
                    var currentGraph = angular.fromJson(newData);
                    //Read the data from the mis element
                    var nodes = currentGraph.nodes;
                    var links = currentGraph.links;
                    //var nodes = [{'id': 1}, {'id': 2}];
                    //var links = [];
                    var infected_nodes = [];


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
                            .on('dblclick', connectedNodes);


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

                //}
            });
        //});//
          });
      }
      };
  }]);
