angular.module('story', [])
.controller('StoryCtrl', function ($scope, $timeout, lastfm) {
  lastfm.user.getInfo({user: 'jessethegame'}, {
  success: function (data) {
    $scope.$apply(function () {
      $scope.jesse = data.user;
    });
  }, error: function (code, message) {
  }});

  function endless() {
    $timeout(function () {
      console.log('UPDATE');
      lastfm.user.getInfo({user: 'jessethegame'}, {
      success: function (data) {
        $scope.$apply(function () {
          $scope.jesse = data.user;
        });
      }, error: function (code, message) {
      }});
      endless();
    }, 10000);
  }
  endless();
});
