angular.module('lastfm.api', [])
.service('lastfm', function () {
    /* Create a cache object */
    var cache = new LastFMCache();

    /* Create a LastFM object */
    var lastfm = new LastFM({
            apiKey    : '96b7891388b19f60761d5cb03fcd88ff',
            apiSecret : '1082aebf524eb701491422ccc096bde8',
            cache     : cache
    });

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
      };
    }

    return {
      api: lastfm,
      error: error
    }
})
.directive('userBadge', function () {
  return {
    restrict: 'AE',
    scope: {
      user: '='
    },
    templateUrl: 'assets/templates/lastfm/user-badge.html',
    link: function ($scope) {
    }
  };
})
.directive('recentTracks', function () {
  return {
    restrict: 'AE',
    scope: {
      tracks: '='
    },
    templateUrl: 'assets/templates/lastfm/recent.html'
  };
})
.directive('friends', function () {
  return {
    restrict: 'AE',
    scope: {
      users: '='
    },
    templateUrl: 'assets/templates/lastfm/friends.html'
  };
})
.directive('story', function () {
  return {
    restrict: 'AE',
    scope: {
      users: '='
    },
    templateUrl: 'assets/templates/lastfm/story.html'
  };
})
;
