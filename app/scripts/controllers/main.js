'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('whisperApp')
    .controller('MainCtrl', function ($scope, Graph, Infection) {
      $scope.graph_result = Graph.query();
      $scope.currentIndex = 1;
      //$scope.currentGraph = $scope.graph_result.results[$scope.currentIndex];

      $scope.infection_result = Infection.query();
      $scope.currentInfectionIndex = 1;
    })
    .directive('graph', function() {
        //Constants for the SVG
        var width = 500,
          height = 500;
        //Set up the colour scale
        var color = d3.scale.category20();

        return {
          restrict: 'A',
          scope: {
              val: '=',
              graph_result: '='
          },
          link: function(scope, element, attrs) {
                scope.$watch('graph_result', function(new_graph_result, old_graph_result) {
                if (new_graph_result === old_graph_result) {
                    return;
                }
                else {
                    console.log(new_graph_result);
                    currentGraph = new_graph_result.results[scope.currentIndex];
                    //Set up the force layout
                    var force = d3.layout.force()
                        .charge(-120)
                        .linkDistance(50)
                        .size([width, height]);
                    //Append a SVG to the body of the html page. Assign this SVG as an object to svg
                    var svg = d3.select("#canvas").append("svg")
                        .attr("width", width)
                        .attr("height", height);
                    //Read the data from the mis element
                    //var nodes = {{nodes|safe}};
                    var nodes = currentGraph.nodes;
                    var links = currentGraph.links;
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
                }});

          }
      };
  });
