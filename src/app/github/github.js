angular.module('github', [])
.service('github', function ($http) {
    function api(url, params, status, error) {
        return $http({method: 'GET', url: 'https://api.github.com' + url, params: params});
    }

    return {
        commits: function (name, repo, params) {
            var url = '/repos/' + name + '/' + repo + '/commits';
            return api(url, params)
                .success(function (data, status, headers, config) {
                    console.log('commits success', data);
                })
                .error(function (data, status, headers, config) {
                    console.log('commits success', data);
                });
        },
        repos: function (name, params) {
            var url = '/repos/' + name;
            return api(url, params);
        },
        activities: function (name, params) {
            var url = '/users/' + name + '/events';
            return api(url, params);
        }
    };
})
.directive('githubActivities', function (github) {
  return {
    restrict: 'AE',
    scope: {
      user: '='
    },
    templateUrl: 'github/activities.tpl.html',
    link: function ($scope) {
        console.log(github);
        github.activities($scope.user).success(function (data) {
            $scope.activities = data.slice(0, 10);
        });
    }
  };
})
.controller('GitHubCtrl', function ($scope, github, $http) {
    //github.commits('jessethegame', 'application-lastfm');
    //github.repos('jessethegame', 'application-lastfm');
})
;
