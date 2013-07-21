angular.module('lastfm.services')
.service('lastfm', function ($http) {
    var apiKey = '96b7891388b19f60761d5cb03fcd88ff';

    var handlers = {
      7: function () {
          console.log(7);
          $paginator.transitionTo('404');
      },
      29: function () {
          console.log(29);
      }
    };

    function errorHandler(caller) {
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
            error = callbacks.error || errorHandler;
        options.method = endpoint.method;
        options.api_key = apiKey;
        options.format = 'json';
        $http.get('http://ws.audioscrobbler.com/2.0/', {params: options})
          .error(function (data, status, headers, config) {
            if (data.error) {
              return error(data);
            }
            console.log('ERROR!', data, status, headers, config);
          })
          .success(function (data, status, headers, config) {
              if (data.error) {
                return error(data)
              }
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
           });
    }

    function endpoint(conf) {
        return function (options, callbacks) {
            return request(conf, options, callbacks);
        }
    }

    return {
      user: {
          info: endpoint({
            method: 'user.getInfo',
            entity: 'user',
          }),
          friends: endpoint({
            method: 'user.getFriends',
            collection: 'friends',
            entity: 'user'
          }),
          scrobbles: endpoint({
              method: 'user.getRecentTracks',
              collection: 'recenttracks',
              entity: 'track'
          }),
          loved: endpoint({
              method: 'user.getLovedTracks',
              collection: 'lovedtracks',
              entity: 'track'
          }),
          artists: endpoint({
              method: 'library.getArtists',
              collection: 'artists',
              entity: 'artist'
          }),
          top: {
              artists: endpoint({
                  method: 'user.getTopArtists',
                  collection: 'topartists',
                  entity: 'artist'
              }),
              tracks: endpoint({
                  method: 'user.getTopTracks',
                  collection: 'toptracks',
                  entity: 'track'
              })
          }
      }
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
    var offset = this.index * this.limit;
    data = data.slice(offset, offset + this.limit);
    return data;
  }

  Paginator.prototype.jump = function (index) {
    if (typeof index === 'string') {
        index = parseInt(index);
    }
    if (this.count > 1) {
      this.index = (index + this.count - 1) % this.count + 1;
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
  /*
   * conf includes:
   *    endpoint
   *    params
   *    page
   *    $scope
   */
  function Collection(conf) {
      conf = conf || {};
      angular.extend(this, conf);
      this.data = {};
      this.page = paginator(this.page);
      this.update();
  }

  Collection.prototype.callback = function (data, meta) {
    this.page.count = parseInt(meta.totalPages);
    this.count = parseInt(meta.total);
    this.data[meta.page || 1] = [].concat(data);
    //this.$scope.$digest();
  };

  Collection.prototype.request = function (options, success, error) {
    var params = angular.extend({
        page: this.page.index,
        limit: this.page.limit,
      }, this.params, options),
      that = this;
    console.log('PARAMS', params, this.params);
    return this.endpoint(params, {
        success: function (data, meta) {
          console.log('SUCCESS', data, meta);
          that.callback(data, meta);
        },
        error: error,
    });
  };

  Collection.prototype.update = function (options) {
    var i,
        params = options || {};
    params.page = 1;
    for (i = this.page.index - 2; i < this.page.index + 2; i++) {
      if (i > 0 && i <= (this.page.count || 1) && !this.data[i]) {
          params.page = i;
          this.request(params);
      }
    }
  };

  Collection.prototype.reset = function () {
    this.data = {};
    this.page.index = 1;
    this.update();
  }

  Collection.prototype.sort = function (value) {
      console.log("O_o");
      this.params.sortBy = value;
      this.reset();
      //this.$scope.digest();
  };

  Collection.prototype.order = function (value) {
      console.log("o_O");
      this.params.sortOrder = value;
      this.reset();
  };


  Collection.prototype.current = function () {
    return this.data[this.page.index];
  }

  return function (options) {
    return new Collection(options);
  };
})
;
