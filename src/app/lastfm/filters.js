angular.module('lastfm.filters')
.filter('gender', function () {
    return function (g) {
        return {m: 'Male', f: 'Female'}[g] || g || '–';
    };
})

.filter('country', function () {
    return function (code) {
        return {
          NL: 'Netherlands',
          US: 'United States',
          UK: 'United Kingdom'
        }[code] || code || '–';
    };
})

.filter('flipping', function () {
    return function (num) {
        var result = '',
            text = (num || 0).toString();
        angular.forEach(text.toString().split(''), function (c) {
            result += '<span class=flip>' + c + '</span>';
        });
        return result;
    };
})

.filter('range', function () {
    return function (args) {
      var min = args[0] || 0,
          max = args[1] || 0,
          step = args[2] || 1;
          input = [];
      for (var i=min; i<=max; i+=step) {
          input.push(i);
      }
      return input;
    };
})

.filter('sep1000', function () {
    return function (original, separator) {
        var number,
            result = '',
            separator = separator === undefined ? ',' : separator;
        if (typeof original === 'number') {
            number = number.toString();
        } else if (typeof number === 'string') {
            number = parseInt(number);
            if (number === undefined) {
                return original
            }
        } else {
            return original;
        }

        //TODO the actual separation
        return original
    };
})

;
