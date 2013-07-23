angular.module('lastfm.directives', []);
angular.module('lastfm.services', [])
angular.module('lastfm.filters', [])
angular.module('lastfm.factories', [])
angular.module('lastfm.controllers', ['lastfm.services'])

angular.module( 'lastfm', [
  'lastfm.controllers',
  'lastfm.directives',
  'lastfm.services',
  'lastfm.filters',
  'lastfm.factories',

  'templates-app',
  'templates-common',

  'ui.state',
  'ui.route',
  'ui.event',
  'ui.keypress',

  'ngCookies',
  'titleService',
  'urlencode-POST',

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

/*
.config(function (lastfm) {
  //XXX This secret is meh, I should actually ask a server to sign requests
  lastfm.key = '96b7891388b19f60761d5cb03fcd88ff';
  lastfm.secret = '1082aebf524eb701491422ccc096bde8';
})
*/

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider
    .otherwise( '/404' );

  $stateProvider
  .state( 'content', {
    url: '',
    abstract: true,
    template: '<markdown src=$state.current.templateUrl></markdown>',
    onEnter: function($state, $rootScope, $window, $location, lastfm, $cookies) {
        var promise = lastfm.callback();
        if (promise) {
          promise.then(function () {
            $window.location.href = 'http://lastfm.pewpew.nl';
          });
        }
        var token = $location.search().token;
        if (token) {
          lastfm.callback(token).then(function () {
            $window.location.href = 'http://lastfm.pewpew.nl';
          });
        }
    },
  })
  .state( 'content.intro', {
    url: '',
    templateUrl: '/assets/content/intro.md',
    onEnter: function(titleService) {
        titleService.setTitle('Intro - Last.fm');
    },
  })
  .state( 'content.jesse', {
    url: '/bio',
    templateUrl: '/assets/content/bio.md',
    onEnter: function(titleService) {
        titleService.setTitle('Bio - Last.fm');
    },
  })
  .state( 'content.thegame', {
    url: '/thegame',
    templateUrl: '/assets/content/thegame.md',
    onEnter: function(titleService) {
        titleService.setTitle('The Game - Last.fm');
    },
  })
  .state( 'content.cv', {
    url: '/cv',
    templateUrl: '/assets/content/cv.md',
    onEnter: function(titleService) {
        titleService.setTitle('CV - Last.fm');
    },
  })
  .state( 'content.code', {
    url: '/code',
    templateUrl: '/assets/content/code.md',
    onEnter: function(titleService) {
        titleService.setTitle('Code - Last.fm');
    },
  })
  .state( 'content.help', {
    url: '/help',
    templateUrl: '/assets/content/help.md',
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
  .state( 'music', {
    pageHack: true,
    responsive: true,

    url: '/music/:artist',
    controller: 'ArtistCtrl',
    //abstract: true,
    templateUrl: 'lastfm/views/music/tpl.html',
    onEnter: function ($stateParams) {
      $stateParams.artist = $stateParams.artist.replace(/\+/, ' ');
    }
  })
  /*
      .state( 'artist.profile', {
        onEnter: function(titleService, $stateParams) {
            titleService.setTitle($stateParams.artist + "- Discover music, concerts, stats and pictures at Last.fm.");
        },
        url: 'REMOVEME',
        views: {
            '': {
                templateUrl: 'lastfm/views/music/profile/tpl.html',
            },
        }
      })
      */
  .state( 'user', {
    url: '/user/:user',
    controller: 'UserCtrl',
    abstract: true,
    templateUrl: 'lastfm/views/user/tpl.html',
  })
      .state( 'user.profile', {
        onEnter: function(titleService, $stateParams) {
            titleService.setTitle($stateParams.user + "’s Music Profile - Users at Last.fm");
        },
        url: '',
        views: {
            '': {
                templateUrl: 'lastfm/views/user/profile/tpl.html',
            },
            'scrobbles@user.profile': {
                templateUrl: 'lastfm/views/user/profile/scrobbles.tpl.html',
                controller: 'ScrobbleCtrl',
            },
            'badge@user.profile': {
                templateUrl: 'lastfm/views/user/profile/badge.tpl.html',
            },
            'taste@user.profile': {
                templateUrl: 'lastfm/views/user/profile/taste.tpl.html'
            },
            'friends@user.profile': {
                templateUrl: 'lastfm/views/user/profile/friends.tpl.html',
                controller: 'FriendCtrl'
            },
            'topArtists@user.profile': {
                templateUrl: 'lastfm/views/user/profile/top.artists.tpl.html',
                controller: 'UserTopArtistCtrl'
            },
            'topTracks@user.profile': {
                templateUrl: 'lastfm/views/user/profile/top.tracks.tpl.html',
                controller: 'UserTopTrackCtrl'
            }
        }
      })
      .state( 'user.library', {
        url: '/library',
        abstract: true,
        views: {
          '': {
              templateUrl: 'lastfm/views/user/library/tpl.html',
          }
        }
      })
          .state( 'user.library.music', {
            url: '',
            templateUrl: 'lastfm/views/user/library/music/tpl.html',
            controller: 'LibraryArtistCtrl'
          })
          .state( 'user.library.loved', {
            url: '/loved',
            templateUrl: 'lastfm/views/user/library/loved/tpl.html',
            controller: 'LibraryLoveCtrl'
          })
      .state( 'user.friends', {
        url: '/friends',
        templateUrl: 'lastfm/views/user/friends/tpl.html',
        controller: 'FriendCtrl'
      })
      .state( 'user.tracks', {
        url: '/tracks',
        templateUrl: 'lastfm/views/user/tracks.tpl.html',
        controller: 'TrackCtrl'
      })
  ;
})

/*
.run( function run ( titleService ) {
  titleService.setSuffix( ' | Title' );
})
*/

.run(function ($rootScope, $state, $stateParams, lastfm, $cookies, $window) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.user = $stateParams;

    $rootScope.lastfm = lastfm;

    function randint(min, max) {
      return Math.floor(Math.random() * (max - min) + 0.5) + min;
    };
    $rootScope.$watch('$state.current', function () {
        $rootScope.promo = randint(1, 2);
    })
})

.controller( 'AppCtrl', function AppCtrl ($scope, $rootScope, $cookies) {
  $scope.skinColor = $cookies.skinColor || 'red'

  $scope.paintIt = function (color) {
    $cookies.skinColor = color;
    $scope.skinColor = color;
  };
})

;

