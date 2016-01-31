
/*
Thanks to mbostock
and to Coppelia
http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
*/
/*
var canvas = d3.select('#canvas');
//Constants for the SVG
var width = 500,
    height = 500;

//Set up the colour scale
var color = d3.scale.category20();

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
var nodes = {{currentGraph.nodes}};
var links = {{links|safe}};
var infected_nodes = {{infected_nodes|safe}};

for (d in nodes) {
	if (d in infected_nodes) { nodes[d].infected = true; } else {nodes[d].infected = false; }
}

//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});
//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}
function connectedNodes() {
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }
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
*/
