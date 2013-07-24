angular.module('lastfm.services')

/*
 * To configure lastfm, do:

.value('lastfmKey', 'KEYKEYKEYK')
.value('lastfmSecret', 'SECRETSECR')

*/

.service('lastfm', function ($http, $cookieStore, $window, lastfmKey, lastfmSecret) {
  var lastfm = {

    key: lastfmKey,
    secret: lastfmSecret,

    // When lastfm notifies us of exceeding the rate limit, this flag turns on
    // and disables requesting for a while.
    //XXX it could be an idea to turn to cache and/or store a queue of pending
    //    requests.
    throttled: false,

    // When not undefined, urls returned by the api have 'http://www.last.fm'
    // replaces by this
    urlprefix: '#',

    // When this flag is on, the service will automatically fetch additional
    // user data when fetching a session key
    autoidentify: true

  }

  //XXX Please disambiguate step 6 of the signature guide in the documentation
  //    It took me far too long to figure out (again...) that 'all parameters'
  //    here means 'only the required parameters'
  //XXX I wasted more time on this, finding out that only the 'format' parameter
  //    needs to be excluded!
  function signature(params) {
    var a = [];
    angular.forEach(Object.keys(params).sort(), function (key) {
      a.push(key);
      a.push(params[key]);
    });
    a.push(lastfm.secret);
    // requires an md5 function
    return md5(a.join(''));
  }


  function errorHandler(code, message) {
    console.log('LAST.FM REST API ERROR:', code, message);

    switch(code) {
      // 1 : This error does not exist
      // 2 : Invalid service -This service does not exist
      // 3 : Invalid Method - No method with that name in this package
      // 4 : Authentication Failed - You do not have permissions to access the
      //     service
      case 4:
          alert('Your session has expired, please login again');
          break;
      // 5 : Invalid format - This service doesn't exist in that format
      // 6 : Invalid parameters - Your request is missing a required parameter
      // 7 : Invalid resource specified
      case 7:
        $paginator.transitionTo('404');
        break;
      // 8 : Operation failed - Most likely the backend service failed.
      //     Please try again.
      // 9 : Invalid session key - Please re-authenticate
      case 9:
          alert('Your session has expired, please login again');
          break;
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
        lastfm.throttled = true;
        $timeout(function () {
          lastfm.throttled = false;
          caller();
        }, 60000);
        break;
      default:
        console.log('Did nothing.');
    }
  }

  // Decoratores a callback function with resource specific parsing.
  // Extracts the actual data and applies optional models.
  function successHandler(resource, callback) {
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

        // If a decorator model is present, map it on the collection
        if (resource.model) {
            collection = collection.map(resource.model);
        }
        return callback(collection, meta);

      // Entity resources take callback functions with signature
      // (entity)
      } else {
        var entity = data[resource.entity];
        if (resource.model) {
          entity = resource.model(data[resource.entity]);
        }
        return callback(entity);
      }
    }
  }

  // Sends a request to the lastfm server. The request is described by the
  // `resource` parameter. The request is customized by `args`, the handlers
  // can be passed as `success` and `error` members on `callbacks`
  function request(resource, args, callbacks) {
    // Merely here to smooth out th next 2 lines
    var callbacks = callbacks || {},
        args = args || {};

        // Use console.log as the default handler
        success = callbacks.success || console.log,
        error = callbacks.error || errorHandler,
        config = {url: 'http://ws.audioscrobbler.com/2.0/'};

    // Don't perform any requests when rate limited
    //TODO throw a real error or trigger error handler
    if (lastfm.throttled) {
      return error(29, 'Rate Limit Previously Exceeded - Not issuing any requests for a while.');
    }

    // Add the required parameters
    args.method = resource.method;
    args.api_key = lastfm.key;

    if (lastfm.session) {
        args.sk = lastfm.session.key;
    }

    // ALL write operations and SOME read operations require a signature
    if (resource.write || resource.signed) {
        args.api_sig = signature(args);
    }

    // Add format AFTER signature, cause it needs to be excluded
    args.format = 'json';

    // Write operations require the POST verb and parmas as data body
    if (resource.write) {
        config.method = 'POST';
        config.data = args;
    } else {
        config.method = 'GET';
        config.params = args;
    }

    console.log('HTTP', resource, config, lastfm);
    $http(config)
      .error(function (data, status, headers, config) {
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
          return error(data);
        }

        return success(data);
      });
  }

  function resource(conf) {
    // Curry the request function with resource configuration
    return function (args, callbacks) {
      // Decorate the success handler
      if ((callbacks && callbacks.success)) {// || conf.success) {
        callbacks.success = successHandler(conf, callbacks.success);// || conf.success);
      }
      return request(conf, args, callbacks);
    }
  }

  // An action is a POST request to the api.
  function action(conf) {
    conf.write = true;
    return function () {
      // An action configuration may provide a signature, which prepares the
      // input for the request.
      var args = conf.signature ?
        conf.signature.apply(undefined, arguments) :
        arguments;
      return request(conf, args);
    }
  }

  lastfm.fields = {
    // Makes sure an object has 5 image sizes
    image: function (data, options) {
      var def;
      if (typeof options == 'string') {
        def = options;
        options = {};
      } else {
        options = options || {};
      }

      // Meow.
      var small = 'http://placekitten.com/g/32',
          medium = 'http://placekitten.com/g/64',
          large = 'http://placekitten.com/g/128',
          extralarge = 'http://placekitten.com/g/256',
          mega = 'http://placekitten.com/g/512';

      if (!data) {
          return;
      }

      return {
        small:      data[0]['#text'] || options.small || def ||small,
        medium:     data[1]['#text'] || options.medium ||def || medium,
        large:      data[2]['#text'] || options.large || def || large,
        extralarge: data[3]['#text'] || options.extralarge || def || extralarge,
        mega:      (data[4] && data[4]['#text'] || {}).mega || options.mega || def || mega,
      }
    },

    // This function rebuild urls by replacing the hsot 'http://www.last.fm'
    url: function (data) {
      if (lastfm.urlprefix == 'undefined') {
        return data;
      }

      return data.replace(/^http:\/\/www.last.fm/, lastfm.urlprefix);
    }
  }

  // Models decorate response data
  lastfm.models = {
      tag: function (obj) {
        obj.url = lastfm.fields.url(obj.url);
        return obj;
      },
      user: function (obj) {
        obj.url = lastfm.fields.url(obj.url);
        obj.image = lastfm.fields.image(obj.image, 'http://cdn.last.fm/flatness/responsive/2/noimage/default_user_140_g2.png');
        return obj;
      },
      artist: function (obj) {
        obj.url = lastfm.fields.url(obj.url);
        //XXX The user.getRecentTracks?extended=1 endpoint has artists names as url
        if (obj.url == obj.name) {
            obj.url = '#/music/' + obj.name;
        }
        obj.image = image(obj.image, 'http://cdn.last.fm/flatness/responsive/2/noimage/default_user_140_g2.png');
        if (obj.similar) {
            obj.similar = obj.similar.artist.map(lastfm.models.artist);
        }
        if (obj.playcount) {
            obj.playcount = parseInt(obj.playcount);
        }
        if (obj.listeners) {
            obj.listeners = parseInt(obj.listeners);
        }
        if (obj.ontour) {
            obj.ontour = obj.ontour == '1';
        }
        if (obj.tags) {
            obj.tags = obj.tags.tag.map(lastfm.models.tag);
        }
        if (obj['@attr']) {
            if (obj['@attr'].rank) {
                obj.rank = parseInt(obj['@attr'].rank);
            }
        }
        return obj;
      },
      track: function (obj) {
        obj.url = lastfm.fields.url(obj.url);
        obj.image = lastfm.fields.image(obj.image, '');
        obj.artist = lastfm.models.artist(obj.artist);
        if (obj['@attr']) {
            if (obj['@attr'].rank) {
                obj.rank = parseInt(obj['@attr'].rank);
            }
            if (obj['@attr'].nowplaying) {
                obj.nowplaying = obj['@attr'].nowplaying == 'true';
            }
        }
        if (obj.streamable) {
          obj.streamable = obj.streamable['#text'] == '1';
        }
        //TODO loved
        return obj;
      }
  }

  lastfm.api = {
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
        signed: true,
        model: function (obj) {
          // Update the session on the lastfm object
          lastfm.session = obj;

          // Update the session in the cookies
          $cookieStore.put('lastfmSession', obj);

          // Fetch additional userinfo if autoidentify is enabled.
          // This extends the session object with the response data.
          if (lastfm.autoidentify) {
            lastfm.auth.identify();
          }

          return obj;
        }
      })
    },
    artist: {
      getInfo: resource({
        method: 'artist.getInfo',
        entity: 'artist',
        model: lastfm.models.artist
      }),
      getTopTracks: resource({
        method: 'artist.getTopTracks',
        collection: 'toptracks',
        entity: 'track',
        model: lastfm.models.track
      })
    },
    track: {
      love: action({
        method: 'track.love',
        // The artist parameter is optional and should only be
        // used when providing 2 strings
        signature: function (track, artist) {
          if (artist) {
            return {track: track, artist: artist};
          } else {
            return {track: track.name, artist: track.artist.name};
          }
        }
      })
    },
    user: {
      getInfo: resource({
        method: 'user.getInfo',
        entity: 'user',
        model: lastfm.models.user
      }),
      getFriends: resource({
        method: 'user.getFriends',
        collection: 'friends',
        entity: 'user',
        model: lastfm.models.user
      }),
      getRecentTracks: resource({
        method: 'user.getRecentTracks',
        collection: 'recenttracks',
        entity: 'track',
        model: lastfm.models.track
      }),
      getLovedTracks: resource({
        method: 'user.getLovedTracks',
        collection: 'lovedtracks',
        entity: 'track',
        model: lastfm.models.track
      }),
      getTopArtists: resource({
        method: 'user.getTopArtists',
        collection: 'topartists',
        entity: 'artist',
        model: lastfm.models.artist
      }),
      getTopTracks: resource({
        method: 'user.getTopTracks',
        collection: 'toptracks',
        entity: 'track',
        model: lastfm.models.track
      }),
    },
    library: {
      getArtists: resource({
        method: 'library.getArtists',
        collection: 'artists',
        entity: 'artist',
        model: lastfm.models.artist
      }),
    }
  };

  lastfm.auth = {
    // Send the user to the authentiation flow initialization endpoint
    login: function () {
      if (lastfm.session) {
        alert('Already logged in, please logout first!');
        return;
      }
      $window.location.href = 'http://www.last.fm/api/auth/?api_key=' + lastfm.key;
    },

    // Remove all session data from lastfm service and cookies
    logout: function () {
      delete lastfm.session;
      $cookieStore.remove('lastfmSession');
    },

    // Check for a 'token' query parameter and fetch a session with it when
    // present. Callbacks takes 'success' and 'error' properties.
    callback: function (token) {
      if (token) {
        if (!lastfm.session) {
          return lastfm.api.auth.getSession({token: token});
        }
        alert('Already logged in, please logout first!');
      }
    },

    // Get the information of authenticated user and store it in the session
    identify: function () {
      lastfm.api.user.getInfo({}, {
        success: function (data) {
          angular.extend(lastfm.session, data);
        }
      });
    }
  }

  return lastfm;
})

// Load an active session from cookies, if present
// To get additional info, call lastfm.user.getInfo without arguments
.run(function (lastfm, $cookieStore) {
  var session = $cookieStore.get('lastfmSession');
  if (session) {
    lastfm.session = session;
    lastfm.auth.identify();
  }
})
;
