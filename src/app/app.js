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
    templateUrl: 'lastfm/user/404.tpl.html'
  })
  .state( 'user', {
    url: '/user/:uid',
    controller: 'UserCtrl',
    abstract: true,
    templateUrl: 'lastfm/user/tpl.html'
  })
      .state( 'user.profile', {
        url: '',
        templateUrl: 'lastfm/user/profile.tpl.html',
      })
      .state( 'user.library', {
        url: '/library',
        abstract: true,
        templateUrl: 'lastfm/user/library/tpl.html',
      })
          .state( 'user.library.music', {
            url: '',
            templateUrl: 'lastfm/user/library/music.tpl.html',
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
                        $scope.library = [].concat(data.artists.artist);
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
          .state( 'user.library.loved', {
            url: '/loved',
            templateUrl: 'lastfm/user/library/loved.tpl.html',
            controller: function ($scope, $stateParams, lastfm) {
              $scope.params = {
                  user: $stateParams.uid,
                  sortBy: 'plays',
                  sortOrder: 'desc',
                  page: 1,
                  limit: 18
              }
              $scope.tracks = [];
              $scope.meta = {};

              function update() {
                lastfm.api.user.getLovedTracks($scope.params, {
                    success: function (data) {
                      $scope.$apply(function () {
                        $scope.meta = data.lovedtracks['@attr'];
                        $scope.tracks = [].concat(data.lovedtracks.track);
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
      .state( 'user.friends', {
        url: '/friends',
        templateUrl: 'lastfm/user/friends.tpl.html',
        controller: function ($scope, $stateParams, lastfm, paginator, collection, $timeout) {
          //$scope.page = new paginator({limit: 10});
          $scope.friends = collection(lastfm.user.friends, {
              $scope: $scope,
              params: {
                user: $stateParams.uid,
                recenttracks: 1
              }
          });

          //$scope.friends.watch($scope);


          //$scope.friends.request();

          /*
          function fetch(params) {
            lastfm.api.user.getFriends(params, {
                success: function (data) {
                  $scope.$apply(function () {
                    console.log(data);
                    var meta = data.friends['@attr'];
                    $scope.page.count = meta.totalPages;
                    $scope.friends[meta.page || 1] = [].concat(data.friends.user);
                  });
                }
            });
          };

          function defaults() {
            return {
                user: $stateParams.uid,
                page: $scope.page.index,
                limit: $scope.page.limit,
                recenttracks: true
            };
          }

          function update() {
              var i,
                  params = defaults();
              for (i = $scope.page.index - 2; i < $scope.page.index + 2; i++) {
                console.log('FOR', i);
                if (i >= 1 && !$scope.friends[i]) {
                    console.log('FETCH', params);
                    params.page = i;
                    fetch(params);
                }
              }
          }

          $scope.$watch('page.index', function () {
            update();
          })

        update();
        */
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

  /*
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
          $scope.recent = [].concat(data.recenttracks.track);
        });
        //update_friends();
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
  */
})

.filter('gender', function () {
    return function (g) {
        return {m: 'Male', f: 'Female'}[g] || g;
    };
})

.filter('country', function () {
    return function (code) {
        return {
          NL: 'Netherlands',
          US: 'United States',
          UK: 'United Kingdom'
        }[code] || code;
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

