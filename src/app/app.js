angular.module('lastfm.directives', []);
angular.module('lastfm.services', [])
angular.module('lastfm.filters', [])
angular.module('lastfm.controllers', ['lastfm.services'])

angular.module( 'lastfm', [
  'lastfm.controllers',
  'lastfm.directives',
  'lastfm.services',
  'lastfm.filters',

  'templates-app',
  'templates-common',

  'ui.state',
  'ui.route',
  'titleService',

  'kit',
  'markdown',
  'fuzzy',

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
            controller: 'LibraryArtistCtrl'
          })
          .state( 'user.library.loved', {
            url: '/loved',
            templateUrl: 'lastfm/user/library/loved.tpl.html',
            controller: 'LibraryLoveCtrl'
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

.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
})

;

