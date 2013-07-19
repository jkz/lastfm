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

    function error(caller) {
      return function (code, message) {
        console.log(code, message);
        handlers[code]();
        switch(code) {
        case 7:
            $paginator.transitionTo('404');
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

    function handler(endpoint, callback) {
        return function (data) {
            if (endpoint.collection) {
                return callback(
                    data[endpoint.collection][endpoint.entity],
                    data[endpoint.collection]['@attr']
                )
            } else {
                return callback(
                    data[endpoint.entity]
                )
            }
        }
    }

    function request(endpoint, options, callbacks) {
        var success = callbacks.success || console.log,
            error = callbacks.error || error;

        endpoint.method(options, {
            error: error,
            success: function (data) {
console.log('CALLBACK', data);
                if (endpoint.collection) {
                    return success(
                        data[endpoint.collection][endpoint.entity],
                        data[endpoint.collection]['@attr']
                    )
                } else {
                    return success(
                        data[endpoint.entity]
                    )
                }
            }
        })
    }

    function endpoint(conf) {
        return function (options, callbacks) {
            return request(conf, options, callbacks);
        }
    }

    return {
      user: {
          info: endpoint({
            method: lastfm.user.getInfo,
            entity: 'user',
          }),
          friends: endpoint({
            method: lastfm.user.getFriends,
            collection: 'friends',
            entity: 'user'
          }),
          scrobbles: endpoint({
              method: lastfm.user.getRecentTracks,
              collection: 'recenttracks',
              entity: 'track'
          }),
          loved: endpoint({
              method: lastfm.user.getLovedTracks,
              collection: 'lovedtracks',
              entity: 'track'
          })
      }
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
    templateUrl: 'lastfm/recent.tpl.html'
  };
})
.directive('friends', function () {
  return {
    restrict: 'AE',
    scope: {
      users: '='
    },
    templateUrl: 'lastfm/friends.tpl.html'
  };
})
.directive('story', function () {
  return {
    restrict: 'AE',
    scope: {
      users: '='
    },
    templateUrl: 'lastfm/story.tpl.html'
  };
})
.directive('paginator', function () {
  return {
    restrict: 'AE',
    scope: {
      page: '=',
      collection: '='
    },
    templateUrl: 'lastfm/paginator.tpl.html',
    link: function ($scope) {
        $scope.$watch('page.index', function () {
            $scope.collection.update();
        });
    }
  };
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
.factory('collection', function (paginator) {
  function Collection(endpoint, conf) {
      conf = conf || {};
      angular.extend(this, conf);
      this.endpoint = endpoint;
      this.data = {};
      this.page = paginator(this.page);
      //this.update();
  }

  Collection.prototype.callback = function (data, meta) {
    this.page.count = meta.totalPages;
    console.log('poei', this, this.data);
    this.data[meta.page || 1] = [].concat(data);
    this.$scope.$digest();
  };

  Collection.prototype.request = function (options, success, error) {
console.log('REQUEST', options, success, error);
    var params = angular.extend({
        page: this.page.index,
        limit: this.page.limit,
      }, this.params, options),
      that = this;
    return this.endpoint(params, {
        success: function (data, meta) {
            that.callback(data, meta);
        },
        error: error,
    });
  };

  Collection.prototype.update = function (options) {
console.log('UPDATE', options);
    var i,
        params = options || {};
    params.page = 1;
    for (i = this.page.index - 2; i < this.page.index + 2; i++) {
      if (i > 0 && i < Math.max(2, this.page.count) && !this.data[i]) {
          params.page = i;
          this.request(params);
      }
    }
  };

  Collection.prototype.current = function () {
    return this.data[this.page.index];
  }

  return function (endpoint, options) {
    return new Collection(endpoint, options);
  };
})
;
