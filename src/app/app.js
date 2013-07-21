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

  'ngCookies',
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
  $urlRouterProvider.otherwise( '/404' );

  $stateProvider
  .state( 'content', {
    url: '',
    abstract: true,
    template: '<markdown src="template($state.current.name)"></markdown>',
    controller: function ($scope, $state) {
        $scope.template = function (name) {
            if (name) {
                return '/assets/content/' + name + '.md';
            }
        }
    }
  })
  .state( 'content.intro', {
    url: '/home',
    onEnter: function(titleService) {
        titleService.setTitle('Intro - Last.fm');
    },
  })
  .state( 'content.jesse', {
    url: '/jesse',
    onEnter: function(titleService) {
        titleService.setTitle('Jesse - Last.fm');
    },
  })
  .state( 'content.thegame', {
    url: '/thegame',
    onEnter: function(titleService) {
        titleService.setTitle('The Game - Last.fm');
    },
  })
  .state( 'content.resume', {
    url: '/resume',
    onEnter: function(titleService) {
        titleService.setTitle('Resume - Last.fm');
    },
  })
  .state( 'content.code', {
    url: '/code',
    onEnter: function(titleService) {
        titleService.setTitle('Code - Last.fm');
    },
  })
  .state( 'content.help', {
    url: '/help',
    onEnter: function(titleService) {
        titleService.setTitle('Help - Last.fm');
    },
  })
  .state( '404', {
    url: '/404',
    templateUrl: '404.tpl.html'
  })
  .state( 'user404', {
    url: '/user404',
    templateUrl: 'lastfm/views/user/404.tpl.html'
  })
  .state( 'user', {
    url: '/user/:user',
    controller: 'UserCtrl',
    abstract: true,
    templateUrl: 'lastfm/views/user/profile/tpl.html',
  })
      .state( 'user.profile', {
        onEnter: function(titleService, $stateParams) {
            titleService.setTitle($stateParams.user + "’s Music Profile - Users at Last.fm");
        },
        url: '',
        views: {
            'scrobbles': {
                templateUrl: 'lastfm/views/user/profile/scrobbles.tpl.html'
            },
            'badge': {
                templateUrl: 'lastfm/views/user/profile/badge.tpl.html'
            },
            'taste': {
                templateUrl: 'lastfm/views/user/profile/taste.tpl.html'
            },
            'friends': {
                templateUrl: 'lastfm/views/user/profile/friends.tpl.html'
            },
            'topArtists': {
                templateUrl: 'lastfm/views/user/profile/top.artists.tpl.html'
            },
            'topTracks': {
                templateUrl: 'lastfm/views/user/profile/top.tracks.tpl.html'
            }
        }
      })
      .state( 'user.library', {
        url: '/library',
        abstract: true,
        views: {
          '@': {
              templateUrl: 'lastfm/views/user/library/tpl.html',
          }
        }
      })
          .state( 'user.library.music', {
            url: '',
            templateUrl: 'lastfm/views/user/library/music.tpl.html',
            controller: 'LibraryArtistCtrl'
          })
          .state( 'user.library.loved', {
            url: '/loved',
            templateUrl: 'lastfm/views/user/library/loved.tpl.html',
            controller: 'LibraryLoveCtrl'
          })
      .state( 'user.friends', {
        url: '/friends',
        templateUrl: 'lastfm/views/user/friends.tpl.html',
        controller: 'FriendCtrl'
      })
  ;
})

/*
.run( function run ( titleService ) {
  titleService.setSuffix( ' | Title' );
})
*/

.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.user = $stateParams;

    $rootScope.$watch('user.name', function () {
        console.log('CHANGE!');
    })
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $cookies) {
  $scope.skinColor = $cookies.skinColor || 'red'

    console.log('COOK', $cookies);

  $scope.paintIt = function (color) {
    $cookies.skinColor = color;
    $scope.skinColor = color;
  };
  $scope.randint = function (min, max) {
    return Math.floor(Math.random() * (max - min) + 0.5) + min;
  };
})

;

