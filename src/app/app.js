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
    //XXX This secret is meh, I should actually ask a server to sign requests
.value('lastfmKey', '96b7891388b19f60761d5cb03fcd88ff')
.value('lastfmSecret', '1082aebf524eb701491422ccc096bde8')
.value('email', 'jesse@jessethegame.net')


// This is for Angular < 1.1
// for more info see:
// http://stackoverflow.com/questions/16661032/http-get-is-not-allowed-by-access-control-allow-origin-but-ajax-is
.config(function($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  // All non matching paths are redirected to /404.
  $urlRouterProvider
    .otherwise( '/404' );

  $stateProvider
  .state( '404', {
    url: '/404',
    templateUrl: 'lastfm/404.tpl.html'
  })

  //
  // BEGIN MARKDOWN STATES
  //
  //
  // The content state is the root for all markdown content I've added to the
  // site. The child states provide the link to the markdown file as their
  // templateUrl.
  .state( 'content', {
    abstract: true,
    url: '',
    templateUrl: 'lastfm/views/content/tpl.html',
    // Lastfm authentication redirects to the root url. As this url is also
    // the base for content, we need to extract the callback token here.
    //XXX I would refactor this probably to 'base' and have a 'base.callback'
    onEnter: function($window, $location, lastfm, $cookieStore) {
      var token = $location.search().token;

      if (token) {
        $cookieStore.put('token', token);
        $window.location.href = 'http://lastfm.pewpew.nl';
      } else {
        token = $cookieStore.get('token');
        $cookieStore.remove('token')
      }

      lastfm.auth.callback(token);
    },
    controller: function ($scope, lastfm) {
      lastfm.user.getInfo({
        user: 'jessethegame',
      }, {
        success: function (data) {
          $scope.jesse = data;
        }
      });

      $scope.secondaryNav = [
        {
          url: '#',
          name: 'Intro',
        },
        {
          url: '#/bio',
          name: 'Bio',
        },
        {
          url: '#/cv',
          name: 'CV',
        },
        {
          url: '#/code',
          name: 'Code',
        },
        {
          url: '#/thegame',
          name: 'The Game',
        },
      ];
    }
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
  //
  // END OF MARKDOWN STATES
  //


  .state( 'music', {
    // These parameters are used in the template to flag classes.
    pageHack: true,
    responsive: true,

    url: '/music/:artist',
    controller: 'ArtistCtrl',
    templateUrl: 'lastfm/views/music/tpl.html',
    onEnter: function ($stateParams) {
      // The `artist` parameter is used directly in resource requests. Spaces
      // in artist links are converted to '+', while the api takes ' ' for em.
      // The '+'s are replaced by ' ' to neglect this issue.
      $stateParams.artist = $stateParams.artist.replace(/\+/, ' ');
    }
  })


  //
  // BEGIN USER STATES
  //
  .state( 'user', {
    abstract: true,
    url: '/user/:user',
    controller: 'UserCtrl',
    templateUrl: 'lastfm/views/user/tpl.html',
  })

  .state( 'user.profile', {
    onEnter: function(titleService, $stateParams) {
      titleService.setTitle($stateParams.user + "’s Music Profile - Users at Last.fm");
    },
    url: '',
    //XXX It might be better to merge the controllers in a single controller,
    //    to enable cross references (this seems useful for friends count in
    //    the badge). It does feel bloaty and unsubtle though.
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

.run(function ($rootScope, $state, $stateParams, lastfm, $cookies, $window, $location, email) {
    // Expose the lastfm api to the scope
    $rootScope.lastfm = lastfm;

    // Expose state parameters to the scope
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    //$rootScope.user = $stateParams;
    $rootScope.email = email;

    // min/max are inclusive
    function randint(min, max) {
      return Math.floor(Math.random() * (max - min) + 0.5) + min;
    };

    // A random quote and promo message index is selected for every state change
    $rootScope.$watch('$state.current', function () {
        $rootScope.promo = randint(1, 3);
        $rootScope.quote = [
          "Let me take you down with my lasergun.",
          "Don't call me a player.",
          "Look at these graphics.",
          "Ready for another round?"
        ][randint(0,3)];
    })
})

.controller( 'AppCtrl', function AppCtrl ($scope, $rootScope, $cookies) {
  // Load the skincolor from the cookie or set the default
  $scope.skinColor = $cookies.skinColor || 'red'

  // Update the skincolor both on the scope and the cookie
  $scope.paintIt = function (color) {
    $cookies.skinColor = color;
    $scope.skinColor = color;
  };
})

;

