angular.module('lastfm.controllers')

.controller( 'FriendCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.friends = new Collection({
    resource: lastfm.user.getFriends,
    page: {
      limit: 20
    },
    params: {
      user: $stateParams.user,
      recenttracks: 1
    }
  });
})

.controller( 'ScrobbleCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.tracks = new Collection({
    resource: lastfm.user.getRecentTracks,
    page: {limit: 20},
    params: {
      user: $stateParams.user,
      extended: 1
    }
  });
})

.controller( 'UserCtrl', function UserCtrl ( $scope, $state, $stateParams, lastfm) {
  $scope.user = {name: $stateParams.user};
  lastfm.user.getInfo({
      user: $stateParams.user,
  }, {
      success: function (data) {
          $scope.user = data;
      }
  });

  $scope.secondaryNav = [
    {
      slug: 'library',
      name: 'Library',
    },
    {
      slug: 'friends',
      name: 'Friends',
    },
    {
      slug: 'tracks',
      name: 'Tracks',
    },
  ]

  $scope.isUserState = function (name) {
    return $state.includes('user.' + name);
  }
})

.controller( 'LibraryArtistCtrl', function ($scope, $stateParams, lastfm, Collection) {
    $scope.artists = new Collection({
        resource: lastfm.library.getArtists,
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

.controller( 'LibraryLoveCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.scrobbles = new Collection({
      resource: lastfm.user.getLovedTracks,
      page: {
        limit: 50,
      },
      params: {
          user: $stateParams.user,

          //Sadly, these paramters are not available in the public api.
          sortBy: 'plays',
          sortOrder: 'desc'
      }
  });

  // This watcher resets the Collection whenever query parameters change.
  $scope.$watch('tracks.params', function () {
      //$scope.tracks.reset();
  }, true);

})

.controller( 'TopArtistCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.artists = new Collection({
      resource: lastfm.user.getTopArtists,
      page: {
        limit: 15
      },
      params: {
          user: $stateParams.user,
          period: 'overall'
      }
  });
})

.controller( 'TopTrackCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.tracks = new Collection({
      resource: lastfm.user.getTopTracks,
      page: {
        limit: 15
      },
      params: {
          user: $stateParams.user,
          period: 'overall'
      }
  });
})

.controller( 'TrackCtrl', function ($scope, $stateParams, lastfm, Collection) {
  $scope.tracks = new Collection({
      resource: lastfm.user.getRecentTracks,
      page: {
        limit: 50
      },
      params: {
          user: $stateParams.user,
          extended: 1
      }
  });
})

;

