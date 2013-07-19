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
            controller: function ($scope, $stateParams, lastfm, collection) {
              $scope.artists = collection({
                  endpoint: lastfm.user.artists,
                  $scope: $scope,
                  page: {
                    limit: 18,
                  },
                  params: {
                      user: $stateParams.uid,
                      sortBy: 'plays',
                      sortOrder: 'desc'
                  }
              });
            }
          })
          .state( 'user.library.loved', {
            url: '/loved',
            templateUrl: 'lastfm/user/library/loved.tpl.html',
            controller: function ($scope, $stateParams, lastfm, collection) {
              $scope.tracks = collection({
                  endpoint: lastfm.user.loved,
                  $scope: $scope,
                  page: {
                    limit: 18,
                  },
                  params: {
                      user: $stateParams.uid,
                      sortBy: 'plays',
                      sortOrder: 'desc'
                  }
              });
            }
          })
      .state( 'user.friends', {
        url: '/friends',
        templateUrl: 'lastfm/user/friends.tpl.html',
        controller: 'FriendCtrl'
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

.controller( 'FriendCtrl', function ($scope, $stateParams, lastfm, collection) {
  $scope.friends = collection({
    endpoint: lastfm.user.friends,
    $scope: $scope,
    params: {
      user: $stateParams.uid,
      recenttracks: 1
    }
  });
})

.controller( 'ScrobbleCtrl', function ($scope, $stateParams, lastfm, collection) {
  $scope.tracks = collection({
    endpoint: lastfm.user.scrobbles,
    $scope: $scope,
    params: {
      user: $stateParams.uid,
      extended: 1
    }
  });
})

.controller( 'UserCtrl', function UserCtrl ( $scope, $location, $timeout, $state, $stateParams, lastfm) {
  lastfm.user.info({
      user: $stateParams.uid,
  }, {
      success: function (data) {
        $scope.$apply(function () {
            $scope.user = data;
        });
      }
  });
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
    $rootScope.range = function(min, max, step){
      step = (step == undefined) ? 1 : step;
      var input = [];
      for (var i=min; i<=max; i+=step) input.push(i);
      return input;
    };
})


;

