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

    /* Load some artist info. */
    lastfm.artist.getInfo({artist: 'Jesse the Game'}, {success: function(data){
        console.log(data);
    }, error: function(code, message){
        console.log(code, message);
        /* Show error message. */
    }});

    return lastfm;
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
