/* global SITE_URL */

var kyukouApp = angular.module('kyukouApp', ['kyukouApp.filters', 'ui.bootstrap', 'LocalStorageModule']);
kyukouApp.factory('eventList', ['$http', '$q', function ($http, $q) {
  var deferred = $q.defer();
  $q.all([
    $http.get(SITE_URL + 'api/1/events/list.json')
  ]).then(function (results) {
    var data = results[0].data;
    var abouts = [];
    var departments = [];
    for (var i = 0; i < data.length; i++) {
      data[i].raw = data[i].raw.replace(/\s+/g, ' ');
      // datetime
      data[i].eventDate = new Date(data[i].eventDate);
      data[i].datetime = data[i].eventDate.toISOString();
      data[i].dateformatted = data[i].eventDate.getFullYear() + '年' + (data[i].eventDate.getMonth() + 1) + '月' + data[i].eventDate.getDate() + '日（' + ['日', '月', '火', '水', '木', '金', '土'][data[i].eventDate.getDay()] + ')';
      // push to abouts
      if (abouts.indexOf(data[i].about) === -1) {
        abouts.push(data[i].about);
      }
      //push to departments
      if (departments.indexOf(data[i].department.match(/^\S*学部/)[0]) === -1) {
        departments.push(data[i].department.match(/^\S*学部/)[0]);
      }
    }
    deferred.resolve({
      events: data,
      abouts: abouts.sort(),
      departments: departments.sort()
    });
  }, function (error) {
    deferred.reject(error);
  });
  return deferred.promise;
}]);
kyukouApp.controller('eventListCtrl', ['$scope', 'eventList', 'localStorageService', function ($scope, eventList, localStorageService) {
  $scope.isCollapsed = true;

  $scope.ctrlTmpl = 'kyukou-loading';
  $scope.error = null;

  // load
  eventList.then(function (data) {
    $scope.events = data.events;
    $scope.abouts = data.abouts;
    $scope.departments = data.departments;

    $scope.ctrlTmpl = 'kyukou-app';
    $scope.error = null;
  }, function (err) {
    $scope.error = {
      status: err.status
    };
  });

  if (!localStorageService.get('selectedAbouts')) {
    localStorageService.set('selectedAbouts', []);
  }
  localStorageService.bind($scope, 'selectedAbouts');
  $scope.setSelectedAbouts = function () {
    var about = this.about;
    var index = $scope.selectedAbouts.indexOf(about);
    if (index !== -1) {
      $scope.selectedAbouts.splice(index, 1);
    } else {
      $scope.selectedAbouts.push(about);
    }
    //return false;
  };
  $scope.isSelectedAbout = function (about) {
    return ($scope.selectedAbouts.indexOf(about) !== -1);
  };

  if (!localStorageService.get('selectedDepartments')) {
    localStorageService.set('selectedDepartments', []);
  }
  localStorageService.bind($scope, 'selectedDepartments');
  $scope.setSelectedDepartments = function () {
    var department = this.department;
    var index = $scope.selectedDepartments.indexOf(department);
    if (index !== -1) {
      $scope.selectedDepartments.splice(index, 1);
    } else {
      $scope.selectedDepartments.push(department);
    }
    //return false;
  };
  $scope.isSelectedDepartment = function (department) {
    return ($scope.selectedDepartments.indexOf(department) !== -1);
  };

  if (!localStorageService.get('sort')) {
    localStorageService.set('sort', {
      col: 'datetime',
      desc: false
    });
  }
  localStorageService.bind($scope, 'sort');
  $scope.setSorting = function (col) {
    var sort = $scope.sort;
    if (sort.col === col) {
      sort.desc = !sort.desc;
    } else {
      sort.col = col;
      sort.desc = false;
    }
  };
  $scope.isSortedCol = function (col) {
    return ($scope.sort.col === col);
  };
}]);

var kyukouAppFilters = angular.module('kyukouApp.filters', []);
kyukouAppFilters.filter('aboutFilter', [function () {
  return function (events, selectedAbouts) {
    if (!angular.isUndefined(events) && !angular.isUndefined(selectedAbouts) && selectedAbouts.length > 0) {
      var tempEvents = [];
      angular.forEach(selectedAbouts, function (about) {
        angular.forEach(events, function (event) {
          if (angular.equals(event.about, about)) {
            tempEvents.push(event);
          }
        });
      });
      return tempEvents;
    } else {
      return events;
    }
  };
}]);
kyukouAppFilters.filter('departmentFilter', [function () {
  return function (events, selectedDepartments) {
    if (!angular.isUndefined(events) && !angular.isUndefined(selectedDepartments) && selectedDepartments.length > 0) {
      var tempEvents = [];
      angular.forEach(selectedDepartments, function (department) {
        angular.forEach(events, function (event) {
          if (angular.equals(event.department.match(/^\S*学部/)[0], department)) {
            tempEvents.push(event);
          }
        });
      });
      return tempEvents;
    } else {
      return events;
    }
  };
}]);
