angular.module('lastfm.controllers')

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $timeout) {
  $scope.skinColor = 'red';
  $scope.paintIt = function (color) {
    $scope.skinColor = color;
  };
  $scope.randint = function (min, max) {
    return Math.floor(Math.random() * (max - min) + 0.5) + min;
  }
})

.controller( 'FriendCtrl', function ($scope, $stateParams, lastfm, collection) {
  $scope.friends = collection({
    endpoint: lastfm.user.friends,
    $scope: $scope,
    params: {
      user: $stateParams.user,
      recenttracks: 1
    }
  });
})

.controller( 'ScrobbleCtrl', function ($scope, $stateParams, lastfm, collection) {
  $scope.tracks = collection({
    endpoint: lastfm.user.scrobbles,
    $scope: $scope,
    params: {
      user: $stateParams.user,
      extended: 1
    }
  });
})

.controller( 'UserCtrl', function UserCtrl ( $scope, $stateParams, lastfm) {
    $scope.user = {name: $stateParams.user};
  /*
  lastfm.user.info({
      user: $stateParams.user,
  }, {
      success: function (data) {
        $scope.$apply(function () {
            $scope.user = data;
        });
      }
  });
  */

  console.log('USER???');
  lastfm.user.info({
      user: $stateParams.user,
  }, {
      success: function (data) {
          console.log('SUCCESS USER', data);
          $scope.user = data;
      }
  });
})

.controller( 'LibraryArtistCtrl', function ($scope, $stateParams, lastfm, collection) {
    $scope.artists = collection({
        endpoint: lastfm.user.artists,
        $scope: $scope,
        page: {
            limit: 18,
        },
        params: {
            user: $stateParams.user,
            sortBy: 'plays',
            sortOrder: 'desc'
        }
    });
    console.log('ARTIST', $scope);
})

.controller( 'LibraryLoveCtrl', function ($scope, $stateParams, lastfm, collection) {
  $scope.tracks = collection({
      endpoint: lastfm.user.loved,
      $scope: $scope,
      page: {
        limit: 18,
      },
      params: {
          user: $stateParams.user,
          sortBy: 'plays',
          sortOrder: 'desc'
      }
  });
})

;

