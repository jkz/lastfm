angular.module('lastfm.directives')
.directive('artistGallery', function () {
  return {
    restrict: 'A',
    scope: {
      artists: '=artistGallery'
    },
    templateUrl: 'lastfm/views/user/library/music.gallery.tpl.html',
  }
})

;
