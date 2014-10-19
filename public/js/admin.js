var adminApp = angular.module('adminApp', ['ui.bootstrap']);
adminApp.controller('adminCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.events = [];

  $scope.loadEvents = function () {
    $http.get('/admin/list.json').success(function(data) {
      $scope.events = data;
    }).error(function (data, status) {
      console.error('load error: %s: %s', status, data);
    });
  };

  // list tab
  $scope.loadEvents();

  // add tab
  $scope.addAlerts = [];
  $scope.addEvent = function (data) {
    $http({
      method : 'POST',
      url : '/admin/add',
      data: data
    }).success(function(data) {
      var alert = {}
      if (data.error) {
        alert.type = 'danger';
        alert.message = 'Error: ' + data.error.message;
      } else {
        alert.type = 'success';
        alert.message = 'Success: ' + data.success.message;
      }
      $scope.addAlerts.push(alert);
      // reload
      $scope.loadEvents();
    }).error(function(data, status) {
      $scope.addAlerts.push({
        type: 'danger',
        message: 'Load error:' + status
      });
    });
  };
  $scope.closeaddAlert = function(index) {
    $scope.addAlerts.splice(index, 1);
  };

  // edit tab
  $scope.editAlerts = [];
  $scope.editEvent = function (data) {
    $http({
      method : 'POST',
      url : '/admin/edit',
      data: data
    }).success(function(data) {
      var alert = {}
      if (data.error) {
        alert.type = 'danger';
        alert.message = 'Error: ' + data.error.message;
      } else {
        alert.type = 'success';
        alert.message = 'Success: ' + data.success.message;
      }
      $scope.editAlerts.push(alert);
      // reload
      $scope.loadEvents();
    }).error(function(data, status) {
      $scope.editAlerts.push({
        type: 'danger',
        message: 'Load error:' + status
      });
    });
  };
  $scope.closeEditAlert = function(index) {
    $scope.editAlerts.splice(index, 1);
  };

  // delete tab
  $scope.deleteAlerts = [];
  $scope.deleteEvent = function (data) {
    $http({
      method : 'POST',
      url : '/admin/delete',
      data: data
    }).success(function(data) {
      var alert = {}
      if (data.error) {
        alert.type = 'danger';
        alert.message = 'Error: ' + data.error.message;
      } else {
        alert.type = 'success';
        alert.message = 'Success: ' + data.success.message;
      }
      $scope.deleteAlerts.push(alert);
      // reload
      $scope.loadEvents();
    }).error(function(data, status) {
      $scope.deleteAlerts.push({
        type: 'danger',
        message: 'Load error:' + status
      });
    });
  };
  $scope.closeDeleteAlert = function(index) {
    $scope.deleteAlerts.splice(index, 1);
  };
}]);
