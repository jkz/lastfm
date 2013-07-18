angular.module( 'lastfm', [
  'templates-app',
  'templates-common',
  'ui.state',
  'ui.route',
  'kit',
  'markdown',
  'fuzzy',
  'titleService',
  'lastfm.api',
  'github'
])

// This is for Angular < 1.1
// for more info see:
// http://stackoverflow.com/questions/16661032/http-get-is-not-allowed-by-access-control-allow-origin-but-ajax-is
.config(function($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $stateProvider
  .state( 'intro', {
    url: '/',
    //controller: 'AppCtrl',
    templateUrl: 'index.tpl.html'
  })
  .state( '404', {
    url: '/404',
    templateUrl: '404.tpl.html'
  })
  .state( 'user404', {
    url: '/user404',
    templateUrl: 'lastfm/user.404.tpl.html'
  })
  .state( 'user', {
    url: '/user/:uid',
    controller: 'UserCtrl',
    abstract: true,
    templateUrl: 'lastfm/user.tpl.html'
  })
      .state( 'user.profile', {
        url: '',
        templateUrl: 'lastfm/user.profile.tpl.html',
      })
      .state( 'user.library', {
        url: '/library',
        abstract: true,
        templateUrl: 'lastfm/user.library.tpl.html',
      })
          .state( 'user.library.music', {
            url: '',
            templateUrl: 'lastfm/user.library.music.tpl.html',
            controller: function ($scope, $stateParams, lastfm) {
              $scope.params = {
                  user: $stateParams.uid,
                  sortBy: 'plays',
                  sortOrder: 'desc',
                  page: 1,
                  limit: 18
              }
              $scope.library = [];
              $scope.meta = {};

              function update() {
                lastfm.api.library.getArtists($scope.params, {
                    success: function (data) {
                      $scope.$apply(function () {
                        $scope.library = data.artists.artist;
                        $scope.meta = data.artists['@attr'];
                      });
                    }
                });
              }

              $scope.prevPage = function () {
                $scope.params.page -= 1;
                update();
              }

              $scope.nextPage = function () {
                $scope.params.page += 1;
                update();
              }

              $scope.setSort = function (sort) {
                $scope.params.sortBy = sort;
                update();
              };

              $scope.setOrder = function (order) {
                $scope.params.sortOrder = order;
                update();
              };

              update();
            }
          })
  ;
  $urlRouterProvider.otherwise( '/404' );
})

.run( function run ( titleService ) {
  titleService.setSuffix( ' | Title' );
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $timeout) {
  $scope.skinColor = 'red';
  $scope.paintIt = function (color) {
    $scope.skinColor = color;
  };

})

.controller( 'UserCtrl', function UserCtrl ( $scope, $location, $timeout, $state, $stateParams, lastfm) {
  $scope.username = $stateParams.uid;

  function update_user() {
      lastfm.api.user.getInfo({user: $scope.username}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.user = data.user;
        });
        update_recent();
      }, error: lastfm.error(update_user)});
  }

  function update_recent() {
      lastfm.api.user.getRecentTracks({user: $scope.username, extended: 1}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.recent = data.recenttracks.track;
        });
        update_friends();
      }, error: lastfm.error(update_recent)});
  }

  function update_friends() {
      lastfm.api.user.getFriends({user: $scope.username}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.friends = data.friends.user;
        });
        $timeout(function () {
          update_user();
        }, 10000);
      }, error: lastfm.error(update_friends)});
  }

  update_user();
})

.filter('gender', function () {
    return function (g) {
        return {m: 'Male', f: 'Female'}[g] || '–';
    };
})

.filter('country', function () {
    return function (code) {
        return {
          NL: 'Netherlands',
          US: 'United States',
          UK: 'United Kingdom'
        }[code];
    };
})

.filter('flipping', function () {
    return function (num) {
        var result = '',
            text = (num || 0).toString();
        angular.forEach(text.toString().split(''), function (c) {
            result += '<span class=flip>' + c + '</span>';
        });
        return result;
    };
})

.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

