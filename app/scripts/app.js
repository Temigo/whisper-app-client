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
    'ngTouch',
    'ngMaterial',
    'ui.bootstrap',
    //'angularFileUpload',
    //'ngFileUpload',
    'ngFileSaver',
    'd3'])
    .config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    })
/*
The cleanest solution to circumvent this, is by using the verbatim tag,
which became available in Django 1.5.
A less clean solution, is to change the syntax of the AngularJS template tags.
Just add the following statement during module instantiation:

    .config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    })
*/
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
      return $resource(urlBase, {}, {'query' : {method: 'GET', isArray: false}});
  })
  .factory('GenerateGraph', function($resource) {
      var urlBase = BaseURL+'graph/generate/';
      return $resource(urlBase, {}, {'query' : {method: 'GET', isArray: false}});
  })
  .factory('ViewParameters', function() {
      var params = {'charge': -120, 'linkDistance': 50, 'zoom': false};
      params.set = function(data) {
        params.charge = data.charge;
        params.linkDistance = data.linkDistance;
        params.zoom = data.zoom;
      };
      return params;
  });

  angular.module('d3', [])
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
      });
