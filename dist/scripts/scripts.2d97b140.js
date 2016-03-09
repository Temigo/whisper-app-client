"use strict";var BaseURL="http://temigo.pythonanywhere.com/";angular.module("whisperApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngMaterial","ui.bootstrap","ngFileSaver","d3"]).config(["$httpProvider",function(a){a.defaults.headers.common["X-Requested-With"]="XMLHttpRequest"}]).config(["$resourceProvider",function(a){a.defaults.stripTrailingSlashes=!1}]).config(["$httpProvider",function(a){a.defaults.xsrfCookieName="csrftoken",a.defaults.xsrfHeaderName="X-CSRFToken"}]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).otherwise({redirectTo:"/"})}]).factory("Graph",["$resource",function(a){var b=BaseURL+"graph/graphs/";return a(b,{},{query:{method:"GET",isArray:!1}})}]).factory("Infection",["$resource",function(a){var b=BaseURL+"graph/infections/";return a(b,{},{query:{method:"GET",isArray:!1}})}]).factory("Algorithm",["$resource",function(a){var b=BaseURL+"graph/algorithm/";return a(b,{},{query:{method:"GET",isArray:!1}})}]).factory("GenerateGraph",["$resource",function(a){var b=BaseURL+"graph/generate/";return a(b,{},{query:{method:"GET",isArray:!1}})}]).factory("SimulateInfection",["$resource",function(a){var b=BaseURL+"graph/simulate/";return a(b,{},{query:{method:"GET",isArray:!1}})}]).factory("ViewParameters",function(){var a={charge:-120,linkDistance:50,zoom:!1,showLabels:!1};return a.set=function(b){a.charge=b.charge,a.linkDistance=b.linkDistance,a.zoom=b.zoom,a.showLabels=b.showLabels},a}).factory("SelectionNodes",function(){var a={};return a.nodes=[],a.on=!1,a.add=function(b){a.nodes.push(b.id)},a.remove=function(b){var c=a.nodes.indexOf(b.id);a.nodes.splice(c,1)},a.set=function(b){a.on=1==b},a}),angular.module("d3",[]).provider("d3Service",function(){function a(a,b,c){var d=a.createElement("script");d.type="text/javascript",d.async=!0,d.src="http://d3js.org/d3.v3.min.js",d.onreadystatechange=function(){"complete"===this.readyState&&b()},d.onload=b,a.getElementsByTagName("body")[0].appendChild(d)}this.$get=["$document","$q","$window","$rootScope",function(b,c,d,e){var f=c.defer();return a(b[0],function(a){e.$apply(function(){f.resolve(d.d3)})}),f.promise}]}).provider("d3tipService",function(){function a(a,b,c){var d=a.createElement("script");d.type="text/javascript",d.async=!0,d.src="http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js",d.onreadystatechange=function(){"complete"===this.readyState&&b()},d.onload=b,a.getElementsByTagName("body")[0].appendChild(d)}this.$get=["$document","$q","$window","$rootScope",function(b,c,d,e){var f=c.defer();return a(b[0],function(a){e.$apply(function(){f.resolve(d.d3.tip)})}),f.promise}]}),angular.module("whisperApp").controller("MainCtrl",["$scope","$compile","$mdSidenav","$window","Graph","Infection","Algorithm","GenerateGraph","SimulateInfection","$timeout","FileSaver","Blob",function(a,b,c,d,e,f,g,h,i,j,k,l){function m(a){return function(){c(a).toggle().then(function(){console.debug("toggle "+a+" is done")})}}a.currentIndex=0,a.graphList=[],a.currentGraph=null,e.query(function(b){a.graphList=b.results,a.currentGraph=b.results[a.currentIndex].data}),a.infectionList=[],a.currentInfection=null,a.currentInfectionIndex=1,f.query(function(b){a.infectionList=b.results,a.currentInfection=b.results[a.currentInfectionIndex].data}),a.parseInt=function(a){return parseInt(a,10)},a.setCurrentIndex=function(b){a.currentIndex=b,a.currentGraph=a.graphList[b].data},a.setCurrentInfectionIndex=function(b){console.log(a.infectionList),a.currentInfection=a.infectionList[b].data},a.generateMethods=[{id:1,name:"Complete graph",group:"Classic",description:"Return the complete graph K_n with n nodes.",params:[{name:"n",value:void 0}]},{id:2,name:"Cycle graph",group:"Classic",description:"Return the cycle graph C_n over n nodes.",params:[{name:"n",value:0}]},{id:3,name:"Circular ladder graph",group:"Classic",description:"Return the circular ladder graph CL_n of length n.",params:[{name:"n",value:0}]},{id:4,name:"Dorogovtsev_goltsev_mendes graph",group:"Classic",description:"Return the hierarchically constructed Dorogovtsev-Goltsev-Mendes graph.",params:[{name:"n",value:0}]},{id:5,name:"Empty graph",group:"Classic",description:"Return the empty graph with n nodes and zero edges.",params:[{name:"n",value:0}]},{id:6,name:"Hypercube graph",group:"Classic",description:"Return the n-dimensional hypercube.",params:[{name:"n",value:0}]},{id:7,name:"Ladder graph",group:"Classic",description:"Return the Ladder graph of length n.",params:[{name:"n",value:0}]},{id:8,name:"Path graph",group:"Classic",description:"Return the Path graph P_n of n nodes linearly connected by n-1 edges.",params:[{name:"n",value:0}]},{id:9,name:"Star graph",group:"Classic",description:"Return the Star graph with n+1 nodes: one center node, connected to n outer nodes.",params:[{name:"n",value:0}]},{id:10,name:"Wheel graph",group:"Classic",description:"Return the wheel graph: a single hub node connected to each node of the (n-1)-node cycle graph.",params:[{name:"n",value:0}]},{id:11,name:"Balanced tree",group:"Classic",description:"Return the perfectly balanced r-tree of height h.",params:[{name:"r",value:0},{name:"h",value:0}]},{id:12,name:"Barbell graph",group:"Classic",description:"Return the Barbell Graph: two complete graphs of m1 nodes connected by a path of m2 nodes.",params:[{name:"m1",value:0},{name:"m2",value:0}]},{id:13,name:"2D Grid Graph",group:"Classic",description:"Return the 2d grid graph of mxn nodes, each connected to its nearest neighbors.",params:[{name:"m",value:0},{name:"n",value:0}]},{id:14,name:"Lollipop Graph",group:"Classic",description:"Return the Lollipop Graph; K_m connected to P_n.",params:[{name:"m",value:0},{name:"n",value:0}]},{id:15,name:"Margulis-Gabber-Galil",group:"Expanders",description:"Return the Margulis-Gabber-Galil undirected MultiGraph on n^2 nodes.",params:[{name:"n",value:0}]},{id:16,name:"Chordal cycle graph",group:"Expanders",description:"Return the chordal cycle graph on p nodes.",params:[{name:"p",value:0}]},{id:17,name:"Bull graph",group:"Small",description:"Return the Bull graph.",params:[]},{id:18,name:"Chvátal graph",group:"Small",description:"Return the Chvátal graph.",params:[]},{id:19,name:"Moebius-Kantor graph",group:"Small",description:"Return the Moebius-Kantor graph.",params:[]},{id:20,name:"Karate Club graph",group:"Social Networks",description:"Return Zachary’s Karate Club graph.",params:[]},{id:21,name:"Davis Southern",group:"Social Networks",description:"Return Davis Southern women social network.",params:[]},{id:22,name:"Florentine families graph",group:"Social Networks",description:"Return Florentine families graph.",params:[]},{id:23,name:"Caveman graph",group:"Community",description:"Returns a caveman graph of l cliques of size k.",params:[{name:"l",value:0},{name:"k",value:0}]},{id:24,name:"Erdős-Rényi graph",group:"Random Graphs",description:"Returns a G_{n,p} random graph, also known as an Erdős-Rényi graph or a binomial graph.",params:[{name:"n",value:0},{name:"p",value:0,"float":!0}]},{id:25,name:"Newman–Watts–Strogatz graph",group:"Random Graphs",description:"Return a Newman–Watts–Strogatz small-world graph.",params:[{name:"n",value:0},{name:"k",value:0},{name:"p",value:0,"float":!0}]},{id:26,name:"Barabási–Albert graph",group:"Random Graphs",description:"Returns a random graph according to the Barabási–Albert preferential attachment model.",params:[{name:"n",value:0},{name:"m",value:0}]}],a.generationMethod=a.generateMethods[0],a.generateGraph=function(b,c){c="undefined"!=typeof c?c:!1,h.query({generateMethod:b},function(b){c?a.currentInfection=b:(a.currentGraph=b,a.reinitializeInfection())})},a.reinitializeInfection=function(){var b=angular.fromJson(a.currentInfection);b.nodes=[],a.currentInfection=angular.toJson(b)},a.algorithmMethods=[{id:1,name:"Shah and Zaman",params:[]},{id:2,name:"Netsleuth",params:[]},{id:3,name:"Pinto",params:[{name:"Observers",value:[],selectNodes:!0},{name:"Mean",value:0,"float":!0},{name:"Variance",value:1,"float":!0}]}],a.algorithmMethod=a.algorithmMethods[0],a.applyAlgorithm=function(b){var c={algorithmMethod:b,currentGraph:a.currentGraph,currentInfection:a.currentInfection};g.query(c,function(b){a.source=b.source,a.timeElapsed=b.timeElapsed})},a.seeds=[],a.selectSeeds=1,a.simulateInfection=function(b,c,d){console.log(b),i.query({currentGraph:a.currentGraph,seeds:{data:b},ratio:c,proba:d},function(b){a.currentInfection=b.infectionGraph})},a.addNode=function(){var b=angular.fromJson(a.currentGraph),c=b.nodes.length;b.nodes.push({id:c+1}),a.currentGraph=angular.toJson(b)},a.infectNode=function(b,c){var d=angular.fromJson(a.currentInfection);if(c){var e=d.nodes.map(function(a){return a.id}).indexOf(b.id);d.nodes.splice(e,1)}else d.nodes.push({id:b.id});a.currentInfection=angular.toJson(d)},a.addEdge=function(){},a.infectMode=!1,a.updateInfectMode=function(){a.infectMode=!a.infectMode},a["export"]=function(a){var b=JSON.stringify(angular.fromJson(a),null,"    ");k.saveAs(new l([b],{type:"application/json"}),"graph.json")},a.uploadInfection=function(b){a.currentInfection=b},a.uploadGraph=function(b){a.currentGraph=b},a.toggleSide=m("right")}]).controller("existingGraphCtrl",["$scope",function(a){a.watch("currentIndex",function(b,c){b!==c&&(a.currentGraph=a.graphList[b].data)})}]).controller("SidenavCtrl",["$scope","$timeout","$mdSidenav","ViewParameters",function(a,b,c,d){a.params=d,console.log(a.params),a.$watch("params",function(a,b){a!==b&&d.set(a)},!0),a.close=function(){c("right").close().then(function(){console.debug("close RIGHT is done")})}}]).directive("onReadFile",["$parse",function(a){return{restrict:"A",scope:!1,link:function(b,c,d){var e=a(d.onReadFile);c.on("change",function(a){var c=new FileReader;c.onload=function(a){b.$apply(function(){e(b,{$fileContent:a.target.result})})},c.readAsText((a.srcElement||a.target).files[0])})}}}]).directive("selectNodes",["SelectionNodes",function(a){return{restrict:"EA",scope:{nodes:"=",select:"="},templateUrl:"views/selectNodes.html",link:function(b,c,d){b.p=a,b.select=b.p.on,b.$watch("p.nodes",function(a,c){a&&(b.nodes=a)},!0),b.$watch("select",function(a,c){a!==c&&(console.log("select"),b.p.set(a),b.select=a)})}}}]),angular.module("whisperApp").directive("d3graph",["d3Service","d3tipService","ViewParameters","SelectionNodes",function(a,b,c,d){var e=500,f=500;return{restrict:"EA",scope:{data:"@graphData",infectionData:"@infectionData",infectMode:"=",source:"=",infectNode:"&",selectSeeds:"@",seeds:"="},link:function(g,h,i){g.params=c,g.selectionNodes=d,a.then(function(a){b.then(function(b){var c=a.scale.category20().domain(a.range(0,20)),d=a.layout.force().charge(g.params.charge).linkDistance(g.params.linkDistance).size([e,f]),i=a.select(h[0]).append("svg").attr("height",f).style("width","100%"),j=b().attr("class","d3-tip").offset([-10,0]).html(function(a){return a.id+""});i.call(j),g.$watch("params",function(b,c){b!==c&&(g.params=b,d.charge(g.params.charge).linkDistance(g.params.linkDistance).start(),g.params.zoom?i.call(a.behavior.zoom().on("zoom",function(){i.attr("transform","translate("+a.event.translate+") scale("+a.event.scale+")")})):i.call(a.behavior.zoom().on("zoom",function(){})))},!0),g.$watchGroup(["data","infectionData","source","params.showLabels"],function(b,e){if(i.selectAll("*").remove(),b){var f=angular.fromJson(b[0]);g.params.showLabels=b[3];var h=f.nodes,k=f.links,l=angular.fromJson(b[1]).nodes;for(var m in h)h[m].selected=!1,m in l?h[m].infected=!0:h[m].infected=!1,m==g.source?h[m].source=!0:h[m].source=!1;d.nodes(h).links(k).start();var n=i.selectAll(".link").data(k).enter().append("line").attr("class","link").style("stroke-width",function(a){return 1}),o=function(a){var b=1;return a.infected&&(b=0),a.source&&(b=2),a.selected&&(b=5),c(b)},p=function(b){var c=a.select(this);g.infectMode?(g.infectNode({node:b,infected:b.infected}),b.infected=!b.infected):(g.selectionNodes.on&&(b.selected?g.selectionNodes.remove(b):g.selectionNodes.add(b)),console.log(g.selectionNodes),b.selected=!b.selected),c.style("fill",o)};if(g.params.showLabels){var q=i.selectAll(".node").data(h).enter().append("g").attr("class","node").call(d.drag);q.append("circle").attr("r",8).style("fill",o).on("click",p),q.append("text").attr("dx",10).attr("dy","0.35em").text(function(a){return a.id}).style("stroke","gray");var r=a.selectAll("circle")}else{var r=i.selectAll(".node").data(h).enter().append("circle").attr("class","node").attr("r",8).style("fill",o).call(d.drag).on("click",p);r.on("mouseover",j.show).on("mouseout",j.hide)}d.on("tick",function(){n.attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y}),g.params.showLabels&&a.selectAll("text").attr("x",function(a){return a.x}).attr("y",function(a){return a.y}),r.attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y})})}})})})}}}]),angular.module("whisperApp").run(["$templateCache",function(a){a.put("views/algorithm.html",'<!--<form class="form-horizontal" method="post" action="/graph/import/algorithm/" enctype="multipart/form-data">\n	<div class="form-actions">\n		<input type="file" name="import_algorithm" accept="application/*"/>\n		<button type="submit" class="btn btn-primary">\n			<span class="glyphicon glyphicon-download" aria-hidden="true"></span>\n			Import Algorithm (*.py)\n		</button>\n	</div>\n</form>--> <form class="form-horizontal" ng-submit="applyAlgorithm(algorithmMethod)"> <select class="form-control" name="algorithm_method" ng-model="algorithmMethod" ng-options="method.name for method in algorithmMethods track by method.id"> </select> <h4 class="md-title" ng-show="algorithmMethod.params.length">Paramètres de l\'algorithme</h4> <div class="input-group" ng-repeat="param in algorithmMethod.params" ng-if="param.selectNodes == undefined"> {{param.selectNodes}} <span class="input-group-addon" id="siz-addon">{{param.name}}</span> <input ng-model="param.value" type="number" ng-attr-step="{{param.float ? 0.01 : 1}}" class="form-control" aria-describedby="siz-addon" placeholder="{{param.help}}"> </div> <div class="input-group" ng-repeat="param in algorithmMethod.params" ng-if="param.selectNodes != undefined"> {{param.name}} <select-nodes nodes="param.nodes" select="param.selectNodes"></select-nodes> </div> <div class="text-center"> <button class="btn btn-default" type="submit">Apply algorithm</button> </div> </form>'),a.put("views/canvas.html",'<!--<uib-alert ng-if="source!==undefined" type="success"><md-icon>info</md-icon> Source is {{ source }}</uib-alert>--> <md-fab-speed-dial class="md-fling md-fab-top-right" md-direction="left"> <md-fab-trigger> <md-button class="md-fab md-primary"> <md-tooltip md-direction="top">Settings</md-tooltip> <md-icon>settings</md-icon> </md-button> </md-fab-trigger> <!--<md-toolbar>--> <md-fab-actions> <md-button class="md-fab md-raised md-mini" ng-click="toggleSide()"> <md-tooltip md-direction="top">Parameters of view</md-tooltip> <md-icon>build</md-icon> </md-button> <md-button class="md-fab md-raised md-mini" ng-click="addNode()"> <md-tooltip md-direction="top">Add a node</md-tooltip> <md-icon>add</md-icon> </md-button> <!--<md-button class="md-fab md-raised md-mini" ng-click="addEdge()">\n                <md-tooltip md-direction="top">Add an edge</md-tooltip>\n                <md-icon>timeline</md-icon>\n            </md-button>--> <md-button class="md-fab md-raised md-mini" ng-click="updateInfectMode()" ng-class="{\'md-primary\': infectMode}"> <md-tooltip md-direction="top">Infection mode</md-tooltip> <md-icon>settings_input_antenna</md-icon> </md-button> <md-button class="md-fab md-raised md-mini" ng-click="reinitializeInfection()"> <md-tooltip md-direction="top">Delete infection</md-tooltip> <md-icon>cached</md-icon> </md-button> </md-fab-actions> <!--</md-toolbar>--> </md-fab-speed-dial> <md-sidenav class="md-sidenav-right md-whiteframe-z2" md-component-id="right" md-is-locked-open="$mdMedia(\'gt-md\')"> <md-toolbar class="md-theme-light"> <h1 class="md-toolbar-tools">Parameters of view</h1> </md-toolbar> <md-content layout-padding ng-controller="SidenavCtrl"> <div layout> <div flex="40" layout layout-align="center center"> <span class="md-body-1">Charge</span> </div> <md-slider flex min="-200" max="0" ng-model="params.charge" class="md-primary" aria-label="charge" id="charge-slider"> </md-slider> <div flex="20" layout layout-align="center center"> <input flex type="number" ng-model="params.charge" aria-label="charge" aria-controls="charge-slider"> </div> </div> <div layout> <div flex="40" layout layout-align="center center"> <span class="md-body-1">Link distance</span> </div> <md-slider flex min="0" max="100" ng-model="params.linkDistance" class="md-primary" aria-label="linkDistance" id="linkDistance-slider"> </md-slider> <div flex="20" layout layout-align="center center"> <input flex type="number" ng-model="params.linkDistance" aria-label="linkDistance" aria-controls="linkDistance-slider"> </div> </div> <div layout> <div flex="40" layout layout-align="center center"> <span class="md-body-1">Zoom & Pan</span> </div> <md-switch ng-model="params.zoom" aria-label="zoom-switch"> </md-switch> </div> <div layout> <div flex="40" layout layout-align="center center"> <span class="md-body-1">Show labels</span> </div> <md-switch ng-model="params.showLabels" aria-label="showLabels-switch"> </md-switch> </div> <md-button ng-click="close()" class="md-primary" hide-gt-md> <md-icon>close</md-icon> Close </md-button> </md-content> </md-sidenav> <d3graph graph-data="{{currentGraph}}" infection-data="{{currentInfection}}" infect-mode="infectMode" source="source" infect-node="infectNode(node, infected)" selectseeds="{{selectSeeds}}" seeds="seeds"></d3graph> <md-toolbar> <div ng-if="source!==undefined" class="md-toolbar-tools"> Time : {{timeElapsed}} s <span flex></span> Source : {{source}} </div> <div ng-if="source === undefined" class="md-toolbar-tools"> No algorithm applied </div> </md-toolbar>'),a.put("views/graph.html",'<h1 class="md-title">Graph : {{ graphList[currentIndex].name }}</h1> <uib-accordion close-others="oneAtATime"> <uib-accordion-group is-open="status.open3"> <uib-accordion-heading> <h4 class="panel-title"> <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree"> <span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span> Existant </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open3, \'glyphicon-chevron-right\': !status.open3}"></i> </h4> </uib-accordion-heading> <form class="form-horizontal"> <div class="form-group"> <label for="graph_id" class="col-sm-2 control-label">Graph</label> <div class="col-sm-10"> <select class="form-control" name="graph_id" ng-model="currentIndex" ng-options="parseInt(index) as graph.name for (index, graph) in graphList" ng-change="setCurrentIndex(currentIndex)"> <!--<option value="">Choisir</option>--> </select> <p ng-if="graphList === []">No graphs are available.</p> </div> </div> </form> </uib-accordion-group> <uib-accordion-group is-open="status.open"> <uib-accordion-heading> <h4 class="panel-title"> <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne"> <span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span> Importer </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open, \'glyphicon-chevron-right\': !status.open}"></i> </h4> </uib-accordion-heading> <input type="file" on-read-file="uploadGraph($fileContent)" accept="application/json"> <!--<uib-progressbar value=""></uib-progressbar>--> </uib-accordion-group> <uib-accordion-group is-open="status.open2"> <uib-accordion-heading> <h4 class="panel-title"> <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo"> <span class="glyphicon glyphicon-cog" aria-hidden="true"></span> Générer </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open2, \'glyphicon-chevron-right\': !status.open2}"></i> </h4> </uib-accordion-heading> <form class="form-horizontal" ng-submit="generateGraph(generationMethod)"> <md-content layout-padding layout-gt-sm="column"> <md-input-container> <select class="form-control" name="generate_method" ng-model="generationMethod" ng-options="method.name group by method.group for method in generateMethods track by method.id"> </select> Description : {{generationMethod.description}} </md-input-container> <md-input-container class="md-block" ng-repeat="param in generationMethod.params"> <label>{{param.name}}</label> <!--<input ng-model="generateN" id="generate_n" name="generate_n" type="number" class="form-control" aria-describedby="sizing-addon"/>--> <input ng-model="param.value" type="number" ng-attr-step="{{param.float ? 0.01 : 1}}"> </md-input-container> <md-button class="md-primary md-raised" type="submit">OK</md-button> </md-content> </form> </uib-accordion-group> </uib-accordion> <div class="text-center"> <button class="btn btn-primary" ng-click="export(currentGraph)"><span class="glyphicon glyphicon-cloud-download" aria-hidden="true"></span> Export Graph (JSON)</button> </div>'),a.put("views/infection.html",'<h1 class="md-title">Infection {{currentInfectionIndex}} for {{graphList[currentIndex].name}}</h1> <uib-accordion> <uib-accordion-group is-open="status.open7"> <uib-accordion-heading> <h4 class="panel-title"> <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree"> <span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span> Existant </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open7, \'glyphicon-chevron-right\': !status.open7}"></i> </h4> </uib-accordion-heading> <form class="form-horizontal"> <div class="form-group"> <label for="infection_id" class="col-sm-2 control-label">Infection</label> <div class="col-sm-10"> <select class="form-control" name="infection_id" ng-model="currentInfectionIndex" ng-options="parseInt(index) as infection.name for (index, infection) in infectionList" ng-change="setCurrentInfectionIndex(currentInfectionIndex)"> <!--<option value="">Choisir</option>--> </select> <p ng-if="infectionList === []">No infection graphs are available.</p> </div> </div> </form> </uib-accordion-group> <uib-accordion-group is-open="status.open4"> <uib-accordion-heading> <h4 class="panel-title"> <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOneInfection" aria-expanded="true" aria-controls="collapseOneInfection"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span> Importer</a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open4, \'glyphicon-chevron-right\': !status.open4}"></i> </h4> </uib-accordion-heading> <input type="file" on-read-file="uploadInfection($fileContent)" accept="application/json"> </uib-accordion-group> <uib-accordion-group is-open="status.open5"> <uib-accordion-heading> <h4 class="panel-title"> <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo"> <span class="glyphicon glyphicon-cog" aria-hidden="true"></span> Générer </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open5, \'glyphicon-chevron-right\': !status.open5}"></i> </h4> </uib-accordion-heading> <form class="form-horizontal" ng-submit="generateGraph(generationMethod, true)"> <div class="input-group"> <select class="form-control" name="generate_method" ng-model="generationMethod" ng-options="method.name group by method.group for method in generateMethods track by method.id"> </select> Description : {{generationMethod.description}} </div> <div class="input-group" ng-repeat="param in generationMethod.params"> <span class="input-group-addon" id="sizing-addon">{{param.name}}</span> <!--<input ng-model="generateN" id="generate_n" name="generate_n" type="number" class="form-control" aria-describedby="sizing-addon"/>--> <input ng-model="param.value" type="number" ng-attr-step="{{param.float ? 0.01 : 1}}" class="form-control" aria-describedby="sizing-addon"> </div> <button class="btn btn-default" type="submit">OK</button> </form> </uib-accordion-group> <uib-accordion-group is-open="status.open6"> <uib-accordion-heading> <h4 class="panel-title"> <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree"> <span class="glyphicon glyphicon-signal" aria-hidden="true"></span> Simuler </a> <i class="glyphicon pull-right" ng-class="{\'glyphicon-chevron-down\': status.open6, \'glyphicon-chevron-right\': !status.open6}"></i> </h4> </uib-accordion-heading> <form class="form-horizontal" ng-submit="simulateInfection(seeds, ratio, proba)"> <div class="input-group"> <select-nodes nodes="seeds" select="selectSeeds"></select-nodes> </div> <md-content md-theme="docs-dark" layout-gt-sm="row" layout-padding> <md-input-container> <label>Ratio</label> <input ng-model="ratio" type="number" step="0.01"> </md-input-container> <md-input-container> <label>Probability</label> <input ng-model="proba" type="number" step="0.01"> </md-input-container> </md-content> <md-button class="md-primary md-raised" type="submit">OK</md-button> </form> </uib-accordion-group> </uib-accordion> <!-- Export infection --> <div class="text-center"> <button class="btn btn-primary" ng-click="export(currentInfection)"><span class="glyphicon glyphicon-cloud-download" aria-hidden="true"></span> Export Infection (JSON)</button> </div>'),a.put("views/main.html",'<div class="col-md-4"> <md-tabs md-dynamic-height md-border-bottom> <!-- Graph --> <md-tab label="graph"> <md-content class="md-padding"> <ng-include src="\'views/graph.html\'"></ng-include> </md-content> </md-tab> <!-- Infection --> <md-tab label="infection"> <md-content class="md-padding"> <ng-include src="\'views/infection.html\'"></ng-include> </md-content> </md-tab> <!-- Algorithm --> <md-tab label="algorithm"> <md-content class="md-padding"> <ng-include src="\'views/algorithm.html\'"></ng-include> </md-content> </md-tab> </md-tabs> </div> <!-- Canvas with graph drawing --> <div class="col-md-7" ng-include src="\'views/canvas.html\'"> </div> '),a.put("views/selectNodes.html",'<!--<button type="button" class="btn btn-primary" ng-model="select" uib-btn-checkbox btn-checkbox-true="1" btn-checkbox-false="0">\n    <span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span>\n    Select nodes\n</button>--> <md-content layout-padding layout-align="center center"> <md-switch ng-model="select"> Select nodes </md-switch> <md-chips ng-model="nodes" ng-attr-readonly="true"></md-chips> </md-content>')}]);