angular.module('lastfm.directives')
.directive('userBadge', function () {
  return {
    restrict: 'AE',
    scope: {
      user: '='
    },
    templateUrl: 'lastfm/user/badge.tpl.html',
    link: function ($scope) {
    }
  };
})
.directive('recentTracks', function () {
  return {
    restrict: 'AE',
    templateUrl: 'lastfm/recent.tpl.html'
  };
})
.directive('friends', function () {
  return {
    restrict: 'AE',
    templateUrl: 'lastfm/friends.tpl.html'
  };
})
.directive('story', function () {
  return {
    restrict: 'AE',
    scope: {
      users: '='
    },
    templateUrl: 'lastfm/story.tpl.html'
  };
})
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
        console.log('PAGINATR', $scope);
        $scope.page = $scope.paginator.page;
        $scope.$watch('page.index', function () {
console.log($scope.paginator);
            $scope.paginator.update();
        });
    }
  };
})
;

