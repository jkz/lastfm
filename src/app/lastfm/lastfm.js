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
          $paginator.transitionTo('404');
      },
      29: function () {
        console.log(29);
      }
    };

    function error(cdataer) {
      return function (code, message) {
        console.log(code, message);
        handlers[code]();
        switch(code) {
        case 7:
            $paginator.transitionTo('404');
            break;
        case 29:
          $timeout(function () {
            cdataer();
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
    templateUrl: 'lastfm/user/badge.tpl.html',
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
.factory('collection', function () {
  function Collection() {
    //get inital et
    //cache some
    //override slice to fetch new data
  }
})
.factory('paginator', function () {
  function defaults() {
    return {
      index: 1,
      limit: 10,
      count: 0,
      data: [],
      getPage: function (page, limit) {}
    };
  }

  function Paginator(conf) {
    angular.extend(this, defaults(), conf);
    console.log(this);
  };

  Paginator.prototype.slice = function (data) {
    // Get the data if necessary here!
    //this.count = Math.ceil(this.data.length / this.limit);
    this.index = this.index % (this.count + 1);
    var offset = this.index * this.limit;
    data = data.slice(offset, offset + this.limit);
    return data;
  }

  Paginator.prototype.jump = function (index) {
    if (this.count > 1) {
      this.index = index;
      return this.update;
    }
  };

  Paginator.prototype.next = function () {
    return this.jump(this.index + 1);
  };

  Paginator.prototype.prev = function () {
    return this.jump(this.index - 1);
  };

  Paginator.prototype.first = function () {
    return this.jump(1);
  };

  Paginator.prototype.last = function () {
    return this.jump(this.count);
  };

  return function (conf) {
    return new Paginator(conf);
  }
})
;
