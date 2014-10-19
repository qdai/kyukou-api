var logApp = angular.module('statusApp', ['ui.bootstrap']);
logApp.controller('logListCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.oneAtATime = true;
  $scope.ctrlTmpl = 'log-app';

  $scope.logs = [];

  // get logs
  $http.get('./api/log/task.json').success(function(data) {
    data.time = new Date(data.time).toString();
    if (data.log.match(/err:/) && data.log.match(/msg: ValidationError/)) {
      data.level = 'success';
    } else if (data.log.match(/err:/)) {
      data.level = 'danger';
    } else {
      data.level = 'success';
    }
    $scope.logs.push(data);
  }).error(function (err, status) {
    console.error('load error: %s: %s', status, err);
  });
  $http.get('./api/log/twit_new.json').success(function(data) {
    data.time = new Date(data.time).toString();
    if (data.log.match(/err:/)) {
      data.level = 'danger';
    } else {
      data.level = 'success';
    }
    $scope.logs.push(data);
  }).error(function (err, status) {
    console.error('load error: %s: %s', status, err);
  });
  $http.get('./api/log/twit_tomorrow.json').success(function(data) {
    data.time = new Date(data.time).toString();
    if (data.log.match(/err:/)) {
      data.level = 'danger';
    } else {
      data.level = 'success';
    }
    $scope.logs.push(data);
  }).error(function (err, status) {
    console.error('load error: %s: %s', status, err);
  });
  $http.get('./api/log/delete.json').success(function(data) {
    data.time = new Date(data.time).toString();
    if (data.log.match(/err:/)) {
      data.level = 'danger';
    } else {
      data.level = 'success';
    }
    $scope.logs.push(data);
  }).error(function (err, status) {
    console.error('load error: %s: %s', status, err);
  });
}]);
