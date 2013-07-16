angular.module( 'lastfm', [
  'templates-app',
  'templates-common',
  'ui.state',
  'ui.route',
  'kit',
  'markdown',
  'titleService',
  'lastfm.api',
  'story'
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
    templateUrl: 'user.404.tpl.html'
  })
  .state( 'user', {
    url: '/user/:uid',
    controller: 'UserCtrl',
    templateUrl: 'user.tpl.html'
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

  var handlers = {
    7: function () {
        console.log(7);
        $state.transitionTo('404');
    },
    29: function () {
      console.log(29);
    }
  };

  function error(caller) {
    return function (code, message) {
      console.log(code, message);
      handlers[code]();
      switch(code) {
      case 7:
          $state.transitionTo('404');
          break;
      case 29:
        $timeout(function () {
          caller();
        }, 60000);
        break;
      default:
          console.log('NOOP');
      }
    }
  }

  function update_user() {
      lastfm.user.getInfo({user: $scope.username}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.user = data.user;
        });
        update_recent();
      }, error: error(update_user)});
  }

  function update_recent() {
      lastfm.user.getRecentTracks({user: $scope.username, extended: 1}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.recent = data.recenttracks.track;
        });
        update_friends();
      }, error: error(update_recent)});
  }

  function update_friends() {
      lastfm.user.getFriends({user: $scope.username}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.friends = data.friends.user;
        });
        $timeout(function () {
          update_user();
        }, 10000);
      }, error: error(update_friends)});
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

