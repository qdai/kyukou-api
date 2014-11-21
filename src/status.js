var logApp = angular.module('statusApp', ['ui.bootstrap']);
logApp.factory('logList', ['$http', '$q', function ($http, $q) {
  var deferred = $q.defer();
  $q.all([
    $http.get('//$$SITE_URL$$/api/1/logs/task.json'),
    $http.get('//$$SITE_URL$$/api/1/logs/twit_new.json'),
    $http.get('//$$SITE_URL$$/api/1/logs/twit_tomorrow.json'),
    $http.get('//$$SITE_URL$$/api/1/logs/delete.json')
  ]).then(function (results) {
    var temp = [];
    for (var i = 0; i < results.length; i++) {
      results[i].data.time = new Date(results[i].data.time).toString();
      results[i].data.level = [, 'success', 'info', 'warning', 'danger'][results[i].data.level];
      temp.push(results[i].data);
    }
    deferred.resolve(temp);
  }, function (error) {
    deferred.reject(error);
  });
  return deferred.promise;
}]);
logApp.controller('logListCtrl', ['logList', function (logList) {
  this.ctrlTmpl = 'log-app-loading';
  this.oneAtATime = true;
  this.logs = null;
  this.error = null;

  var self = this;
  logList.then(function (data) {
    self.logs = data;
    self.ctrlTmpl = 'log-app';
    self.error = null;
  }, function (err) {
    self.error = err;
  });
}]);
