angular.module('github', [])
.service('github', function ($http) {
    return {
        commits: function (name, repo) {
            var url = '/repos/' + name + '/' + repo + '/commits';
            $http.get(url, function (data) {
                console.log('success', data);
            }, function (data) {
                console.log('error', data);
            }
        }
    };
})
.directive('recentCommits', function () {
  return {
    restrict: 'AE',
    scope: {
      commits: '='
    },
    templateUrl: 'github/recent-commits.tpl.html'
  };
})
;
