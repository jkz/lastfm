angular.module('lastfm.directives')
.directive('paginatorDropdown', function () {
  return {
    restrict: 'AE',
    templateUrl: 'lastfm/directives/paginator.dropdown.tpl.html',
    scope: {
      paginator: '=',
    },
    link: function ($scope) {
        $scope.jumpTarget = 0;
    }
  };
})
.directive('paginatorEllipsis', function () {
  return {
    restrict: 'AE',
    templateUrl: 'lastfm/directives/paginator.ellipsis.tpl.html',
    scope: {
      paginator: '=',
    },
  };
})
.directive('paginator', function () {
  return {
    restrict: 'A',
    scope: {
      paginator: '=',
    },
    link: function ($scope) {
        $scope.page = $scope.paginator.page;

        $scope.$watch('page.index', function () {
            $scope.paginator.update();
        });
    }
  };
})

.directive('pageSlider', function ($timeout) {
    var defaults = {
        prevDelay: 0.3,
        nextDelay: 0.3,
        jumpDelay: 0.3,
    }

  return {
    restrict: 'E',
    scope: {
      collection: '=',
    },
    link: function ($scope) {
        $scope.page = $scope.collection.page;

        $scope.$watch('collection.page.index', function (newVal, oldVal) {
            if ((newVal + $scope.page.count) % $scope.page.count  == oldVal + 1) {
              $scope.transition = 'next';
            } else if ((newVal + $scope.page.count) % $scope.page.count  == oldVal - 1) {
              $scope.transition = 'prev';
            } else {
              $scope.target = newVal;
              $scope.transition = 'jump';
            }

            $timeout(function () {
              $scope.transition = undefined;
              $scope.index = newVal;
            }, 620);
        });
    }
  };
})

.directive('periodStipulator', function () {
  return {
    restrict: 'A',
    scope: {
      collection: '=periodStipulator'
    },
    templateUrl: 'lastfm/directives/stipulator.period.tpl.html',
    link: function ($scope) {
      $scope.stipulate = function (value) {
        if (value) {
          $scope.collection.params.period = value;
        } else {
          delete $scope.collection.params.period;
        }
        $scope.collection.request();
      };
    }
  }
})

.directive('paramsWatcher', function () {
  return {
    restrict: 'A',
    scope: {
      collection: '=paramsWatcher',
    },
    link: function ($scope) {
        /*
        $scope.params = $scope.collection.params;

        $scope.del = function (key) {
            delete $scope.params[key];
            //delete $scope.collection.params[key];
        };

        $scope.set = function (params) {
            angular.extend($scope.params, params || {});
            //angular.extend($scope.collection.params, params || {});
        }
        */

        $scope.$watch('collection.params', function (nw, od) {
            console.log('CHANGED!', nw, od);
            $scope.collection.reset();
        });
    }
  }
});

;

