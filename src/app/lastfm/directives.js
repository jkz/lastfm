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
        console.log('PAGINATR', $scope);
        $scope.page = $scope.paginator.page;
        $scope.$watch('page.index', function () {
            $scope.paginator.update();
        });

        $scope.$watch('paginator.params', function () {
            console.log('AAAH CHANGE');
            $scope.paginator.data = {};
            $scope.paginator.update();
        });
    }
  };
})
;

