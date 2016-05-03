'use strict';
//var BaseURL = 'http://temigo.pythonanywhere.com/';
var BaseURL = 'http://127.0.0.1:8000/';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('whisperApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    //'ngTouch',
    'ngMaterial',
    'ui.bootstrap',
    'angularFileUpload',
    'ngFileUpload',
    'angular-inview',
    'ngFileSaver',
    'angular-loading-bar',
    'ui.codemirror',
    'd3'])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
    }])
    .config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    })
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    })
    .config(function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    })

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .factory('Graph', function($resource) {
      var urlBase = BaseURL+'graph/graphs/';
      return $resource(urlBase, {}, {'query' : {method: 'GET', isArray: false}});
  })
  .factory('Infection', function($resource) {
      var urlBase = BaseURL+'graph/infections/';
      return $resource(urlBase, {}, {'query' : {method: 'GET', isArray: false}});
  })
  .factory('Algorithm', function($resource) {
      var urlBase = BaseURL+'graph/algorithm/';
      return $resource(urlBase, {}, {'query' : {method: 'POST', isArray: false}});
  })
  .factory('GenerateGraph', function($resource) {
      var urlBase = BaseURL+'graph/generate/';
      return $resource(urlBase, {}, {'query' : {method: 'POST', isArray: false}});
  })
  .factory('SimulateInfection', function($resource) {
      var urlBase = BaseURL+'graph/simulate/';
      return $resource(urlBase, {}, {'query' : {method: 'POST', isArray: false}});
  })
  .factory('Frontier', function($resource) {
      var urlBase = BaseURL+'graph/frontier/';
      return $resource(urlBase, {}, {'query' : {method: 'POST', isArray: false}});
  })
  .factory('ImportGraph', function($resource) {
      var urlBase = BaseURL+'graph/import/graph/';
      return $resource(urlBase, {}, {'update' : {method: 'PUT'}});
  })
  .factory('ViewParameters', function() {
      var params = {'charge': -120, 'linkDistance': 50, 'zoom': false, 'showLabels': false};
      params.set = function(data) {
        params.charge = data.charge;
        params.linkDistance = data.linkDistance;
        params.zoom = data.zoom;
        params.showLabels = data.showLabels;
      };
      return params;
  })
  .factory('ToggleForceLayout', function() {
      return {'on': true};
  })
  .factory('SelectionNodes', ['$rootScope', function($rootScope) {
      var params = {};
      params.instances = [];
      params.current = null;

      params.Instance = function() {
          params.current = params.instances.push(this) - 1;

          this.nodes = [];
          this.on = false;
          this.index = params.current;

          this.add = function(node) {
              var nodes = this.nodes;
              $rootScope.$apply(function(scope) {
                  nodes.push(node.id);
              });
          };

          this.remove = function(node) {
              var removeIndex = this.nodes.indexOf(node.id);
              var nodes = this.nodes;
              $rootScope.$apply(function(scope) {
                  nodes.splice(removeIndex, 1);
              });
          };

          this.set = function(select) {
              this.on = (select == 1);
              if (select == 1) {
                  params.current = this.index;
              }
          };

      };

      params.getCurrent = function() {
          return params.instances[params.current];
      };

      return params;
  }]);

  angular.module('d3', [])
    /*
    d3 Service to inject in directives
    */
      .provider('d3Service', function() {
          function createScript($document, callback, success) {
              var scriptTag = $document.createElement('script');
              scriptTag.type = "text/javascript";
              scriptTag.async = true;
              scriptTag.src = 'http://d3js.org/d3.v3.min.js';
              scriptTag.onreadystatechange = function() {
                  if (this.readyState === 'complete') {
                      callback();
                  }
              };
              scriptTag.onload = callback;
              $document.getElementsByTagName('body')[0].appendChild(scriptTag);
          }

          this.$get = ['$document','$q', '$window', '$rootScope',
              function($document, $q, $window, $rootScope) {
                  var deferred = $q.defer();
                  createScript($document[0], function(callback) {
                      $rootScope.$apply(function()  { deferred.resolve($window.d3); });
                  });
                  return deferred.promise;
              }];
      })
      /*
      d3tooltip from labratrevenge.com
      */
      .provider('d3tipService', function() {
          function createScript($document, callback, success) {
              var scriptTag = $document.createElement('script');
              scriptTag.type = "text/javascript";
              scriptTag.async = true;
              scriptTag.src = 'http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js';
              scriptTag.onreadystatechange = function() {
                  if (this.readyState === 'complete') {
                      callback();
                  }
              };
              scriptTag.onload = callback;
              $document.getElementsByTagName('body')[0].appendChild(scriptTag);
          }

          this.$get = ['$document','$q', '$window', '$rootScope',
              function($document, $q, $window, $rootScope) {
                  var deferred = $q.defer();
                  createScript($document[0], function(callback) {
                      $rootScope.$apply(function()  { deferred.resolve($window.d3.tip); });
                  });
                  return deferred.promise;
              }];
      });
