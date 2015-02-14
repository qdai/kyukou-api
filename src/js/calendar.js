/* global angular */

var calendarApp = angular.module('calendarApp', []);
calendarApp.controller('calendarCtrl', ['$scope', function ($scope) {
  $scope.departments = [
    { key: 'edu', text: '教育学部' },
    { key: 'lit', text: '文学部' },
    { key: 'law', text: '法学部' },
    { key: 'sci', text: '理学部' },
    { key: 'econ', text: '経済学部' }
  ];
  $scope.selectedDepartments = [];
  $scope.setSelectedDepartments = function () {
    var department = this.department;
    var index = $scope.selectedDepartments.indexOf(department);
    if (index !== -1) {
      $scope.selectedDepartments.splice(index, 1);
    } else {
      $scope.selectedDepartments.push(department);
    }
  };
  $scope.isSelectedDepartment = function (department) {
    return ($scope.selectedDepartments.indexOf(department) !== -1);
  };
  $scope.query = function () {
    var q = '';
    $scope.selectedDepartments.forEach(function (elem) {
      q += elem.key + ',';
    });
    return ($scope.selectedDepartments.length === 0) ? '' : '?department=' + q.slice(0, -1);
  };
}]);
