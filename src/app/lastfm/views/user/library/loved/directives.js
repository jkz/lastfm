angular.module('lastfm.directives')
.directive('loveList', function () {
  return {
    restrict: 'A',
    scope: {
      tracks: '=loveList'
    },
    templateUrl: 'lastfm/views/user/library/loved/list.tpl.html'
  }
})
;
