angular.module('lastfm.services')

.service('lastfm', function ($http) {

    // This is hardcoded for now, of course it should be configurable elsewhere.
    var apiKey = '96b7891388b19f60761d5cb03fcd88ff';

    function errorHandler(caller) {
      return function (code, message) {
        console.log('LAST.FM REST API Error!', code, message);

        switch(code) {
        // 1 : This error does not exist
        // 2 : Invalid service -This service does not exist
        // 3 : Invalid Method - No method with that name in this package
        // 4 : Authentication Failed - You do not have permissions to access the
        //     service
        // 5 : Invalid format - This service doesn't exist in that format
        // 6 : Invalid parameters - Your request is missing a required parameter
        // 7 : Invalid resource specified
        case 7:
            $paginator.transitionTo('404');
            break;
        // 8 : Operation failed - Most likely the backend service failed.
        //     Please try again.
        // 9 : Invalid session key - Please re-authenticate
        // 10 : Invalid API key - You must be granted a valid key by last.fm
        // 11 : Service Offline - This service is temporarily offline. Try again
        //      later.
        // 12 : Subscribers Only - This station is only available to paid
        //      last.fm subscribers
        // 13 : Invalid method signature supplied
        // 14 : Unauthorized Token - This token has not been authorized
        // 15 : This item is not available for streaming.
        // 16 : The service is temporarily unavailable, please try again.
        // 17 : Login: User requires to be logged in
        // 18 : Trial Expired - This user has no free radio plays left.
        //      Subscription required.
        // 19 : This error does not exist
        // 20 : Not Enough Content - There is not enough content to play this
        //      station
        // 21 : Not Enough Members - This group does not have enough members for
        //      radio
        // 22 : Not Enough Fans - This artist does not have enough fans for for
        //      radio
        // 23 : Not Enough Neighbours - There are not enough neighbours for
        //      radio
        // 24 : No Peak Radio - This user is not allowed to listen to radio
        //      during peak usage
        // 25 : Radio Not Found - Radio station not found
        // 26 : API Key Suspended - This application is not allowed to make
        //      requests to the web services
        // 27 : Deprecated - This type of request is no longer supported
        // 29 : Rate Limit Exceded - Your IP has made too many requests
        //      in a short period, exceeding our API guidelines
        case 29:
          $timeout(function () {
            caller();
          }, 60000);
          break;
        default:
            console.log('Did nothing.');
        }
      };
    }

    function handler(endpoint, callback) {
      // Decoratores a callback function with endpoint specific parsing.
      // Extracts the actual data and applies optional models.
      return function (data) {

        // Collection endpoints take callback functions with signature
        // (collection, meta)
        if (endpoint.collection) {

          // Last.fm collections with a single member are not returned
          // as arrays. (Which I would argue against).
          // The little concat thingy makes sure an array os returned.
          var collection = [].concat(data[endpoint.collection][endpoint.entity]),
          // The meta information consists of paging and aggregate data
          // and optionally the provided user name
              meta = data[endpoint.collection]['@attr'];

          // If a decorator is present, map it on the collection
          if (endpoint.decorator) {
            collection = collection.map(endpoint.model);
          }

          return callback(collection, meta);

        // Entity endpoints take callback functions with signature
        // (entity)
        } else {
          var entity = data[endpoint.entity];
          if (endpoint.model) {
            entity = endpoint.model(data[endpoint.entity]);
          }

          return callback(entity);
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
