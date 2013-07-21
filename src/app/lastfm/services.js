angular.module('lastfm.services')

.service('lastfm', function ($http) {

  // This is hardcoded for now, of course it should be configurable elsewhere.
  var apiKey = '96b7891388b19f60761d5cb03fcd88ff',
  //XXX This secret is meh, perhaps I should ask a server to sign my requests.
      apiSecret = '1082aebf524eb701491422ccc096bde8';


  var rateLimited = false;

  //XXX Please disambiguate step 6 of the signature guide in the documentation
  //    It took me far too long to figure out (again...) that 'all parameters'
  //    here means 'only the required parameters'
  function signature(params) {
    var a = [];
    a.push('api_key');
    a.push(apiKey);
    a.push('method');
    a.push(params.method);
    if (params.token) {
        a.push('token');
        a.push(params.token);
    }
    a.push(apiSecret);
    return md5(a.join(''));
  }


  function errorHandler(caller) {
    return function (code, message) {
      console.log('LAST.FM REST API ERROR:', code, message);

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
          //XXX Don't know the appropriate time to wait. Just made something up
          rateLimited = true;
          $timeout(function () {
            rateLimited = false;
            caller();
          }, 60000);
          break;
        default:
          console.log('Did nothing.');
      }
    };
  }

  // Decoratores a callback function with resource specific parsing.
  // Extracts the actual data and applies optional models.
  function handler(resource, callback) {
    return function (data) {


      // Collection resources take callback functions with signature
      // (collection, meta)
      if (resource.collection) {

        // Last.fm collections with a single member are not returned
        // as arrays. (Which I would argue against).
        // The little concat thingy makes sure an array os returned.
        var collection = [].concat(data[resource.collection][resource.entity]),
            // The meta information consists of paging and aggregate data
            // and optionally the provided user name
            meta = data[resource.collection]['@attr'];

        console.log('COLLECTION', collection);

        // If a decorator model is present, map it on the collection
        if (resource.model) {
            collection = collection.map(resource.model);
            console.log('MAPPED', collection);
        }

        return callback(collection, meta);

      // Entity resources take callback functions with signature
      // (entity)
      } else {
        var entity = data[resource.entity];
        console.log('ENTITY', entity);
        if (resource.model) {
          entity = resource.model(data[resource.entity]);
            console.log('MAPPED', entity);
        }

        return callback(entity);
      }
    }
  }

  function request(resource, options, callbacks) {
    var success = callbacks.success || console.log,
        error = callbacks.error || errorHandler;

    // Don't perform any requests when rate limited
    //TODO throw a real error or trigger error handler
    if (rateLimited) {
      return error(29, 'Rate Limit Previously Exceeded - Not issuing any requests for a while.');
    }

    options.method = resource.method;
    options.api_key = apiKey;
    options.format = 'json';

    if (resource.signed) {
        options.api_sig = signature(options);
    }


    console.log('REQUESTING', options);

    $http.get('http://ws.audioscrobbler.com/2.0/', {params: options})
      .error(function (data, status, headers, config) {
          console.log('ERROR', data);
        // Known errors are dispatched to the error handler
        if (data.error) {
          return error(error.code, error.message);
        }

        // Unknown errors scream loud
        console.log('UNKNOWN LAST.FM ERROR!', data, status, headers, config);
        return error(undefined, "Error information logged to console");
      })

      .success(function (data) {
          console.log('SUCCESS', data);
        // Errors without error status are dispatched here
        if (data.error) {
          return error(data)
        }

        return success(data);
      });
  }

  function resource(conf) {
    // Curry the request function with resource configuration
    return function (options, callbacks) {
      // Decorate the success handler
      if (callbacks && callbacks.success) {
        callbacks.success = handler(conf, callbacks.success);
      }
      return request(conf, options, callbacks);
    }
  }

  function image(data, def) {
    def = def || 'http://placekitten.com/g/256';

    if (!data) {
        return;
    }

    return {
      small:      data[0]['#text'] || def,
      medium:     data[1]['#text'] || def,
      large:      data[2]['#text'] || def,
      extralarge: data[3]['#text'] || def,
    }
  }

  function url(data) {
    // Replace the host by a '#' for the ui-router
    return data.replace(/^http:\/\/www.last.fm/, '#');
  }


  var models = {};
  models.user = function (obj) {
    obj.url = url(obj.url);
    obj.image = image(obj.image, 'http://cdn.last.fm/flatness/responsive/2/noimage/default_user_140_g2.png');
    return obj;
  };
  models.artist = function (obj) {
    obj.url = url(obj.url);
    obj.image = image(obj.image, 'http://cdn.last.fm/flatness/responsive/2/noimage/default_user_140_g2.png');
    return obj;
  };
  models.track = function (obj) {
    obj.url = url(obj.url);
    obj.image = image(obj.image, '');
    obj.artist = models.artist(obj.artist);
    return obj;
  };

  var resources = {
    // The service exposes last.fm resources. To obtain the data, they should
    // be called with callback functions.
    //
    // A resource consists of:
    //    method - the endpoint specifier
    //    entity - the name/type of the resource entities
    //    collection (optional) - when presents, implies entity arrays in
    //        responses with given name
    //    model (optional) - decorates response entities for internal convenience
    auth: {
      getSession: resource({
        method: 'auth.getSession',
        entity: 'session',
        signed: true
      })
    },
    user: {
      getInfo: resource({
        method: 'user.getInfo',
        entity: 'user',
        model: models.user
      }),
      getFriends: resource({
        method: 'user.getFriends',
        collection: 'friends',
        entity: 'user',
        model: models.user
      }),
      getRecentTracks: resource({
        method: 'user.getRecentTracks',
        collection: 'recenttracks',
        entity: 'track',
        model: models.track
      }),
      getLovedTracks: resource({
        method: 'user.getLovedTracks',
        collection: 'lovedtracks',
        entity: 'track',
        model: models.track
      }),
      getTopArtists: resource({
        method: 'user.getTopArtists',
        collection: 'topartists',
        entity: 'artist',
        model: models.artist
      }),
      getTopTracks: resource({
        method: 'user.getTopTracks',
        collection: 'toptracks',
        entity: 'track',
        model: models.track
      }),
    },
    library: {
      getArtists: resource({
        method: 'library.getArtists',
        collection: 'artists',
        entity: 'artist',
        model: models.artist
      }),
    }
  };


  function Session(token) {
      this.token = token;
      console.log('getKey()', token);
      this.getKey();
  }

  Session.prototype.getKey = function () {
    var that = this;
    resources.auth.getSession({
        token: this.token
    }, {
        success: function (data) {
          angular.extend(that, data);
          console.log('KEY', data);
          resources.user.getInfo({
              user: that.name
          }, {
              success: function (data) {
                console.log('USER', data);
                angular.extend(that, data);
              }
          });
        }
    });
  };

  resources.apiKey = apiKey;
  resources.Session = Session;

  return resources;
})

.factory('Paginator', function () {
  // A Paginator provides convient paging of resources.
  // The Paginator is 1-indexed.
  function Paginator(conf) {
    angular.extend(this, this.defaults, conf);
  };

  Paginator.prototype.defaults = {
    // The collection cursor indicating the currently viewed page
    index: 1,
    // The maximum number of objects in a response, or, the page size
    limit: 10,
    // The total number of pages for this resource
    count: 0,
    // Determines whether the page index wraps around or not
    circular: true
  }

  // Convert a given index to its wrapped version. Or returns undefined
  // if the index is out of bounds and the paginator is not circular.
  Paginator.prototype.convert = function (index) {
    // Some input (e.g. the paging data from lastfm api...) is given as string
    // in stead of integer. We take care of that here.
    console.log('INDEX', index);
    if (typeof index === 'string') {
      index = parseInt(index);
    }
    // Invalid types
    if (typeof index !== 'number'
        // Negative pages without count or circularity
        || (!(this.count && this.circular) && index < 1)
        // Non-circular out of bounds
        || (this.count && !this.circular && index > this.count)) {
      // Are not invited
      return;
    } else if (this.circular && this.count) {
      return (index + this.count - 1) % this.count + 1;
    } else {
      return index;
    }
  }

  // Set index to given value, possibly wrapped
  Paginator.prototype.jump = function (index) {
    index = this.convert(index);

    // Check for a valid index
    if (index === undefined) {
      return;
    }

    this.index = index;
    //XXX Check if this is needed
    //this.update()
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

  return Paginator;
})

.factory('Collection', function (Paginator) {
  //
  // Collection service provides a convenient interface to collection
  // resources.
  //
  //    resource - a lastfm resource function that fetches the data
  //    params (optional) - query parameters sent with each request
  //    page (optional) - parameters for the paginator
  //
  function Collection(conf) {
    conf = conf || {};
    angular.extend(this, conf);
    this.data = {};
    this.page = new Paginator(this.page);
    if (this.autoload) {
      this.fetch({page: 1});
    }
  }

  Collection.prototype.defaults = {
    // When on, the collection automatically fetches the first page on when
    // created.
    autoload: true
  };

  // The callback function passed to resource requests.
  Collection.prototype.callback = function (data, meta) {
    // Store the fetched page as the corresponding page number
    this.data[meta.page || 1] = data;

    // Store the page and object counts
    this.count = parseInt(meta.total);
    this.page.count = parseInt(meta.totalPages);
  };

  // A wrapper around the resource function
  Collection.prototype.request = function (options) {
    var that = this,

    // Setup the query parameters
        params = angular.extend({
          page: this.page.index,
          limit: this.page.limit,
        }, this.params, options);

    return this.resource(params, {
      // Wrap the callback call, for the right 'this'
      success: function (data, meta) {
        that.callback(data, meta);
      }
    });
  };

  // Fetch the current and the 4 surrounding pages.
  Collection.prototype.update = function (options) {
    var i,
        params = options || {};
    for (i = this.page.index - 2; i < this.page.index + 2; i++) {
      params.page = this.page.convert(i);

      // Check whether the index is valid and if the page is not yet cached
      if (params.page !== undefined && !this.data[params.page]) {
        this.request(params);
      }
    }
  };

  // Empty the cache and reset the index, then update
  Collection.prototype.reset = function () {
    this.data = {};
    this.page.index = 1;
    this.update();
  }

  //XXX Looks like these should be automatically handled by watchers
  Collection.prototype.sort = function (value) {
    if (this.params.sortBy != value) {
      this.params.sortBy = value;
      this.reset();
    }
  };
  Collection.prototype.order = function (value) {
    if (this.params.sortOrder != value) {
      this.params.sortOrder = value;
      this.reset();
    }
  };

  // Shortcut to get the current page
  Collection.prototype.current = function () {
    return this.data[this.page.index];
  }

  return Collection;
})
;
