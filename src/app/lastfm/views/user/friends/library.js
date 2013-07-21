angular.module('lastfm.directives')
.directive('friendGallery', function () {
  return {
    restrict: 'A',
    scope: {
      friends: '=friendGallery'
    },
    templateUrl: 'lastfm/views/user/friends/gallery.tpl.html',
  }
})
;
