/* global angular, SITE_URL */

var kyukouApp = angular.module('kyukouApp', ['kyukouApp.filters', 'ui.bootstrap', 'LocalStorageModule']);
kyukouApp.factory('eventList', ['$http', '$q', function ($http, $q) {
  var toJapaneseDateString = function (date) {
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日（' + ['日', '月', '火', '水', '木', '金', '土'][date.getDay()] + '）';
  };
  var deferred = $q.defer();
  $q.all([
    $http.get(SITE_URL + 'api/1/events/list.json')
  ]).then(function (results) {
    var data = results[0].data;
    var eventsObj = {};
    var abouts = [];
    var departments = [];
    var i;
    var date = new Date();
    var today = toJapaneseDateString(date);
    date.setDate(date.getDate() + 1);
    var nextday = toJapaneseDateString(date);
    for (i = 0; i < data.length; i++) {
      data[i].raw = data[i].raw.replace(/\s+/g, ' ');
      // datetime
      data[i].eventDate = new Date(data[i].eventDate);
      data[i].datetime = data[i].eventDate.toISOString();
      data[i].dateformatted = toJapaneseDateString(data[i].eventDate);
      if (data[i].note || data[i].campus || data[i].note) {
        data[i].hasNote = true;
      }
      if (data[i].dateformatted === today) {
        data[i].dateformatted = '今日';
        data[i].isToday = true;
      }
      if (data[i].dateformatted === nextday) {
        data[i].dateformatted = '明日';
      }
      // push to events
      if (!eventsObj[data[i].eventDate.getTime()]) {
        eventsObj[data[i].eventDate.getTime()] = [];
      }
      eventsObj[data[i].eventDate.getTime()].push(data[i]);
      // push to abouts
      if (abouts.indexOf(data[i].about) === -1) {
        abouts.push(data[i].about);
      }
      //push to departments
      if (departments.indexOf(data[i].department.match(/^\S*学部/)[0]) === -1) {
        departments.push(data[i].department.match(/^\S*学部/)[0]);
      }
    }
    var keys = Object.keys(eventsObj).sort();
    var events = [];
    var daysEvent;
    for (i = 0; i < keys.length; i++) {
      daysEvent = {
        data: eventsObj[keys[i]]
      };
      daysEvent.date = daysEvent.data[0].dateformatted;
      // push
      events[i] = daysEvent;
    }
    deferred.resolve({
      events: events,
      eventsCount: data.length,
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

  $scope.filteredEvents = [];
  $scope.filteredCount = function () {
    var count = 0;
    for (var i = 0; i < $scope.filteredEvents.length; i++) {
      count += $scope.filteredEvents[i].length;
    }
    return count;
  };
  // load
  eventList.then(function (data) {
    $scope.events = data.events;
    $scope.eventsCount = data.eventsCount;
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
