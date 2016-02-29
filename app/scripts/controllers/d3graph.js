'use strict';

angular.module('whisperApp')
.directive('d3graph', ['d3Service', function(d3Service) {
    //Constants for the SVG
    var width = 500,
      height = 500;

    return {
      restrict: 'EA',
      scope: {
          data: '@graphData', // One-way data binding
          infectionData: '@infectionData',
          infectMode: '=',
          source: '=',
          infectNode: '&'
      },
      link: function(scope, element, attrs) {
          d3Service.then(function(d3) {
          //Set up the colour scale
          var color = d3.scale.category20().domain(d3.range(0,20));

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

        //console.log(scope.infectionData);
        scope.$watchGroup(['data', 'infectionData', 'source'], function(newData, oldData) {
            svg.selectAll('*').remove();
            if (!newData) { // || newData === oldData
                return;
            }
                var currentGraph = angular.fromJson(newData[0]);

                //Read the data from the mis element
                var nodes = currentGraph.nodes;
                var links = currentGraph.links;
                var infected_nodes = angular.fromJson(newData[1]).nodes;

                for (var d in nodes) {
                    nodes[d].selected = false;
                    if (d in infected_nodes) { nodes[d].infected = true; } else {nodes[d].infected = false; }
                    if (d == scope.source) { nodes[d].source = true; } else {nodes[d].source = false; }
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


                    var standardColor = function(d) {
                        var color_index = 1;
                        if (d.infected) { color_index = 0; }
                        if (d.source) { color_index = 2; }
                        if (d.selected) { color_index = 5; }
                        return color(color_index);
                    };

                    var highlightNode = function(d) {
                        var node = d3.select(this);
                        if (!scope.infectMode) {
                            d.selected = !d.selected;
                        }
                        else { // infectMode
                            scope.infectNode({node: d, infected: d.infected});
                            d.infected = !d.infected;
                        }
                        node.style("fill", standardColor);
                    };

                    //Do the same with the circles for the nodes - no
                    //var color_index = 1;
                    var connectedNodes = [];
                    var node = svg.selectAll(".node")
                        .data(nodes)
                        .enter().append("circle")
                        .attr("class", "node")
                        .attr("r", 8)
                        .style("fill", standardColor)
                        //.style("fill", color(5))
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
}]);
