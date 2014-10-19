var kyukouApp = angular.module('kyukouApp', ['kyukouApp.filters', 'ui.bootstrap']);
kyukouApp.controller('eventListCtrl', ['$scope', '$http', '$window', function ($scope, $http, $window) {
  $scope.isCollapsed = true;

  $scope.ctrlTmpl = 'kyukou-loading';
  $scope.loading = {
    err: false
  };

  $scope.events = [];
  $scope.abouts = [];
  $scope.departments = [];

  // get events(, abouts, departments)
  $http.get('./api/list.json').success(function(data) {
    for (var i = 0; i < data.length; i++) {
      data[i].raw = '別のタブで開く: ' + data[i].raw.replace(/\s+/g, ' ');
      // datetime
      data[i].eventDate = new Date(data[i].eventDate);
      data[i].datetime = data[i].eventDate.toISOString();
      data[i].dateformatted = data[i].eventDate.getFullYear() + '年' + (data[i].eventDate.getMonth() + 1) + '月' + data[i].eventDate.getDate() + '日（' + ['日','月','火','水','木','金','土'][data[i].eventDate.getDay()] + ')';
      // push to events
      $scope.events.push(data[i]);
      // push to abouts
      if ($scope.abouts.indexOf(data[i].about) === -1) {
        $scope.abouts.push(data[i].about);
      }
      //push to departments
      if ($scope.departments.indexOf(data[i].department.match(/^\S*学部/)[0]) === -1) {
        $scope.departments.push(data[i].department.match(/^\S*学部/)[0]);
      }
    }
    $scope.abouts.sort();
    $scope.departments.sort();

    // show
    $scope.ctrlTmpl = 'kyukou-app';
    $scope.looading = {
      err: false
    };
  }).error(function (err, status) {
    console.error('load error: %s: %s', status, err);
    $scope.loading = {
      status: status,
      err: true
    }
  });

  $scope.viewResource = function (url) {
    $window.open(url);
  }

  $scope.selectedAbouts = [];
  //$scope.selectedAbouts = $scope.abouts.concat();
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

  $scope.selectedDepartments = [];
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

  $scope.sort = {
    col: 'datetime',
    desc: false
  }
  $scope.setSorting = function (col) {
    var sort = $scope.sort;
    if (sort.col === col) {
      sort.desc = !sort.desc;
    } else {
      sort.col = col;
      sort.desc = false;
    }
  }
  $scope.isSortedCol = function (col) {
    return ($scope.sort.col === col);
  }
}]);

var kyukouAppFilters = angular.module('kyukouApp.filters', [])
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
