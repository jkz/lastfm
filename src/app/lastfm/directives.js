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

        $scope.$watch('paginator.params', function () {
            $scope.paginator.data = {};
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
      console.log('SCOOP');
        $scope.page = $scope.collection.page;

        $scope.$watch('collection.page.index', function (newVal, oldVal) {
          console.log('RAWR', newVal, oldVal);
            //XXX Does not wrap!
            if (newVal == oldVal + 1) {
              $scope.transition = 'next';
            } else if (newVal == oldVal - 1) {
              $scope.transition = 'prev';
            } else {
              $scope.target = newVal;
              $scope.transition = 'jump';
            }

            $timeout(function () {
              $scope.transition = undefined;
              $scope.index = newVal;
            }, 1000);
        });
    }
  };

    return {
        restrict: 'E',
        scope: {
            collection: '='
        },
        link: function ($scope) {
            $scope.idx = 1;

            $scope.update = function (target, name) {
              $timeout(function () {
                $scope.animation = undefined;
              }, options.delay[name+'Delay']);
            }

            $scope.jump = function (target) {
              target %= $scope.data.length;
              $scope.animation = name;
              $scope.target = $scope.data.target
              $timeout(function () {
                $scope.update(target, 'jump');
                $scope.idx = target;
              }, options.delay.prejump);
            }

            $scope.next = function () {
              $scope.update($scope.idx + 1, 'next');
            }

            $scope.prev = function () {
              $scope.update($scope.idx - 1, 'prev');
            }
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
        $scope.collection.params.period = value;
        $scope.collection.request();
      };
    }
  }
})

;

