/* global angular, SITE_URL */

var adminApp = angular.module('adminApp', ['ui.bootstrap']);
adminApp.controller('adminCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.events = [];

  $scope.loadEvents = function () {
    $http.get(SITE_URL + 'admin/list.json').success(function (data) {
      $scope.events = data;
    }).error(function (data, status) {
      console.error('load error: %s: %s', status, data);
    });
  };

  $scope.loadEvents();
}]);
adminApp.controller('addCtrl', ['$scope', '$http', adminMethod('add')]);
adminApp.controller('editCtrl', ['$scope', '$http', adminMethod('edit')]);
adminApp.controller('deleteCtrl', ['$scope', '$http', adminMethod('delete')]);

function adminMethod(method) {
  return function ($scope, $http) {
    this.alerts = [];
    var self = this;
    this.post = function (data) {
      $http({
        method: 'POST',
        url: SITE_URL + 'admin/' + method,
        data: data
      }).success(function (data) {
        var alert = {};
        if (data.error) {
          alert.type = 'danger';
          alert.message = 'Error: ' + data.error.message;
        } else {
          alert.type = 'success';
          alert.message = 'Success: ' + data.success.message;
        }
        self.alerts.push(alert);
        // reload
        $scope.loadEvents();
      }).error(function (data, status) {
        self.alerts.push({
          type: 'danger',
          message: 'Load error:' + status + ' ' + data.error.message
        });
      });
    };
    this.closeAlert = function (index) {
      this.alerts.splice(index, 1);
    };
  };
}
