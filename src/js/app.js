/* global angular, SITE_URL */


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
          if (angular.equals(event.department[0], department[0])) {
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

var kyukouApp = angular.module('kyukouApp', ['kyukouApp.filters', 'ui.bootstrap', 'LocalStorageModule']);

kyukouApp.factory('eventList', ['$http', '$q', function ($http, $q) {
  var toJapaneseDateString = function (date) {
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日（' + ['日', '月', '火', '水', '木', '金', '土'][date.getDay()] + '）';
  };
  var deferred = $q.defer();
  $http.get(SITE_URL + 'api/1/events/list.json').then(function (result) {
    var date = new Date();
    var today = toJapaneseDateString(date);
    date.setDate(date.getDate() + 1);
    var nextday = toJapaneseDateString(date);
    var eventsObj = {};
    result.data.forEach(function (event) {
      event.raw = event.raw.replace(/\s+/g, ' ');
      // datetime
      event.eventDate = new Date(event.eventDate);
      event.datetime = event.eventDate.toISOString();
      event.dateformatted = toJapaneseDateString(event.eventDate);
      if (event.note || event.campus || event.note) {
        event.hasNote = true;
      }
      if (event.dateformatted === today) {
        event.dateformatted = '今日';
        event.isToday = true;
      }
      if (event.dateformatted === nextday) {
        event.dateformatted = '明日';
      }
      // push to eventsObj
      var time = event.eventDate.getTime();
      if (!eventsObj[time]) {
        eventsObj[time] = [];
      }
      eventsObj[time].push(event);
    });
    var keys = Object.keys(eventsObj).sort();
    var events = [];
    var daysEvent;
    for (var i = 0; i < keys.length; i++) {
      daysEvent = {
        data: eventsObj[keys[i]]
      };
      daysEvent.date = daysEvent.data[0].dateformatted;
      // push
      events[i] = daysEvent;
    }
    deferred.resolve({
      events: events,
      eventsCount: result.data.length
    });
  }, function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}]);

kyukouApp.service('defaults', function () {
  this.departments = ['教育学部', '文学部', '法学部', '理学部', '経済学部'];
  this.abouts = ['休講', '補講', '連絡', '教室変更', 'その他', '公務'];
});

kyukouApp.controller('eventListCtrl', ['$scope', 'eventList', 'defaults', 'localStorageService', function ($scope, eventList, defaults, localStorageService) {
  $scope.toggle = function (item, list) {
    var idx = list.indexOf(item);
    if (idx > -1) list.splice(idx, 1);
    else list.push(item);
  };

  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };

  $scope.isCollapsed = true;

  $scope.ctrlTmpl = 'kyukou-loading';
  $scope.error = null;

  $scope.eventsCount = 0;
  $scope.filteredEvents = [];
  $scope.filteredCount = function () {
    return $scope.filteredEvents.reduce(function (count, el) {
      return count + el.length;
    }, 0);
  };
  eventList.then(function (data) {
    $scope.events = data.events;
    $scope.eventsCount = data.eventsCount;
    $scope.ctrlTmpl = 'kyukou-app';
    $scope.error = null;
  }, function (err) {
    $scope.error = {
      status: err.status
    };
  });

  $scope.departments = defaults.departments;
  if (!localStorageService.get('selectedDepartments') || localStorageService.get('selectedDepartments').length === 0) {
    localStorageService.set('selectedDepartments', defaults.departments);
  }
  localStorageService.bind($scope, 'selectedDepartments');

  $scope.abouts = defaults.abouts;
  if (!localStorageService.get('selectedAbouts') || localStorageService.get('selectedAbouts').length === 0) {
    localStorageService.set('selectedAbouts', defaults.abouts);
  }
  localStorageService.bind($scope, 'selectedAbouts');
}]);
