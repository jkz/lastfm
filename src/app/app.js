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
  ;
  $urlRouterProvider.otherwise( '/' );
})

.run( function run ( titleService ) {
  titleService.setSuffix( ' | Title' );
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $timeout, lastfm) {
  $scope.username = 'jessethegame';

  function update_user() {
      lastfm.user.getInfo({user: $scope.username}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.user = data.user;
        });
      }, error: function (code, message) {
      }});
  }

  function update_recent() {
      lastfm.user.getRecentTracks({user: $scope.username, extended: 1}, {
      success: function (data) {
          console.log('RECENT' ,data);
        $scope.$apply(function () {
          $scope.recent = data.recenttracks.track;
        });
      }, error: function (code, message) {
      }});
  }

  function endless() {
    update_user();
    update_recent();
    $timeout(function () {
      endless();
    }, 10000);
  }
  endless();
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

