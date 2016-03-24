'use strict';

angular.module('whisperApp')
.directive('d3graph', ['d3Service', 'd3tipService', 'ViewParameters', 'SelectionNodes', 'ToggleForceLayout', function(d3Service, d3tipService, ViewParameters, SelectionNodes, ToggleForceLayout) {
    //Constants for the SVG
    var width = 500,
        radius = 8,
        height = 500;
    var MAX_NODES_LAYOUT = 100;

    return {
      restrict: 'EA',
      scope: {
          data: '@graphData', // One-way data binding
          infectionData: '@infectionData',
          infectMode: '=',
          source: '@',
          infectNode: '&',
          selectSeeds: '@',
          seeds: '=',
          frontier: '@'
      },
      link: function(scope, element, attrs) {
          scope.params = ViewParameters;
          scope.s = SelectionNodes;
          scope.layout = ToggleForceLayout;
          scope.selectionNodes = SelectionNodes.getCurrent();
          scope.$watch('s.current', function(newValue, oldValue) {
              if (newValue !== oldValue) {
                  scope.selectionNodes = SelectionNodes.getCurrent();
              }
          });

          d3Service.then(function(d3) {
          d3tipService.then(function(d3tip) {
          //Set up the colour scale
          var color = d3.scale.category20().domain(d3.range(0,20));

          //Set up the force layout
          var force = d3.layout.force()
              .charge(scope.params.charge)
              .linkDistance(scope.params.linkDistance)
              .size([width, height]);

          //Append a SVG to the body of the html page. Assign this SVG as an object to svg
          var svg = d3.select(element[0]).append("svg")
              //.attr("width", width)
              .attr("height", height)
              .style("width", "100%");

          //Set up tooltip
          var tip = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function (d) {
                  return  d.id;
                });
          svg.call(tip);

        // Don't compute again everything in force layout
        // when view parameters change
          scope.$watch('params', function(newValue, oldValue) {
              if (newValue !== oldValue) {
                  scope.params = newValue;
                  force.charge(scope.params.charge).linkDistance(scope.params.linkDistance).start();
                  if (scope.params.zoom) {
                      svg.call(d3.behavior.zoom().on("zoom", function () {
                          svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                      }));
                  }
                  else {
                      svg.call(d3.behavior.zoom().on("zoom", function () {}));
                  }

              }
          }, true);

        scope.$watchGroup(['data', 'infectionData', 'source', 'params.showLabels', 'frontier', 'layout.on'], function(newData, oldData) {
            svg.selectAll('*').remove();
            if (!newData) { // || newData === oldData
                return;
            }
                //var FORCE_ON = (nodes.length < MAX_NODES_LAYOUT);
                var FORCE_ON = scope.layout.on;

                var currentGraph = angular.fromJson(newData[0]);
                scope.params.showLabels = newData[3];
                scope.source = angular.fromJson(newData[2]);
                scope.frontier = angular.fromJson(newData[4]);
                scope.layout.on = newData[5];
                
                //Read the data from the mis element
                var nodes = currentGraph.nodes;
                var links = currentGraph.links;
                var infected_nodes = angular.fromJson(newData[1]).nodes;

                for (var d in nodes) { // typeof(d) = int
                    nodes[d].selected = false;
                    nodes[d].infected = (infected_nodes.map(function(item) { return item.id; }).indexOf(nodes[d].id) != -1);
                    nodes[d].source = (scope.source.indexOf(nodes[d].id) !== -1);
                    nodes[d].in_frontier = (scope.frontier.indexOf(nodes[d].id) !== -1);

                }

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
                        if (d.in_frontier) { color_index = 6; }
                        return color(color_index);
                    };

                    var highlightNode = function(d) {
                        var node = d3.select(this);

                        if (!scope.infectMode) {
                            if (scope.selectionNodes.on) {
                                if (d.selected) {
                                    scope.selectionNodes.remove(d);
                                }
                                else {
                                    scope.selectionNodes.add(d);
                                }
                            }
                            console.log(scope.selectionNodes);
                            d.selected = !d.selected;
                            /*if (scope.selectSeeds) {
                                scope.seeds.push(d);
                            }*/
                        }
                        else { // infectMode
                            scope.infectNode({node: d, infected: d.infected});
                            d.infected = !d.infected;
                        }
                        node.style("fill", standardColor);
                    };

                    //Do the same with the circles for the nodes - no
                    if (scope.params.showLabels) {
                        var node_g = svg.selectAll(".node")
                            .data(nodes)
                            .enter().append("g")
                            .attr("class", "node")
                            .call(force.drag);
                        node_g.append("circle")
                            .attr("r", radius)
                            .style("fill", standardColor)
                            .on('click', highlightNode);
                        node_g.append("text")
                            .attr("dx", 10)
                            .attr("dy", "0.35em")
                            .text(function(d) { return d.id; })
                            .style("stroke", "gray");
                        var node = d3.selectAll("circle");
                    }
                    else {
                        var node = svg.selectAll(".node")
                            .data(nodes)
                            .enter().append("circle")
                            .attr("class", "node")
                            .attr("r", radius)
                            .style("fill", standardColor)
                            .call(force.drag)
                            .on('click', highlightNode);
                        // Tooltip on node
                        node.on('mouseover', tip.show)
                            .on('mouseout', tip.hide);
                    }


                    //Creates the graph data structure out of the json data
                    force.nodes(nodes)
                        .links(links);

                    // Now we are giving the SVGs co-ordinates -
                    // the force layout is generating the co-ordinates
                    // which this code is using to update the attributes
                    // of the SVG elements
                    scope.updatePositions = function() {
                        link.attr("x1", function (d) { return d.source.x; })
                            .attr("y1", function (d) { return d.source.y; })
                            .attr("x2", function (d) { return d.target.x; })
                            .attr("y2", function (d) { return d.target.y; });
                        if (scope.params.showLabels) {
                            d3.selectAll("text")
                                .attr("x", function (d) { return d.x; })
                                .attr("y", function (d) { return d.y; });
                        }
                        node.attr("cx", function (d) { return d.x; })
                            .attr("cy", function (d) { return d.y; });
                    };

                    force.on("tick", scope.updatePositions);

                    if (FORCE_ON) {
                        force.start();
                    }
                    else {
                        for (var d in nodes) {
                            if (nodes[d].x == undefined && nodes[d].y == undefined) {
                                nodes[d].x = Math.random() * (width-radius); // FIXME : which width ?
                                nodes[d].y = Math.random() * (height-radius);
                            }
                            else {
                                nodes[d].x = nodes[d].x * width;
                                nodes[d].y = nodes[d].y * height;
                            }
                            nodes[d].fixed = true;
                        }
                        force.start();
                        force.tick();
                        force.stop();
                        //scope.updatePositions();
                        //node.call(drag);
                    }

                    // End force tick
                }); // scope watch
            });
            }); // d3Service.then
        } // link
    }; // return
}]);
