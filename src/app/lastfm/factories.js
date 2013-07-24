//XXX These are candidates to be commoned

angular.module('lastfm.factories')
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
    angular.extend(this, this.defaults, conf);
    this.data = {};
    this.page = new Paginator(this.page);
    if (this.autoload) {
      this.request({page: 1});
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
      page: that.page.index,
      limit: that.page.limit,
    }, that.params, options);

    return that.resource(params, {
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


