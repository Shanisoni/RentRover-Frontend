myApp.controller("ownerProfileController", [
  "$scope",
  "AuthService",
  "ToastService",
  "$q",
  function ($scope, AuthService, ToastService,$q) {

    /**
     * Initialize owner profile
     */
    $scope.init = function() {
      getUserProfile()
        .then(function(user) {
          $scope.owner = user;
        })
        .catch(function(err) {
          ToastService.error("Error fetching user profile");
        });
    };

    let getUserProfile =function () {
      let deferred= $q.defer();
      AuthService.userProfile()
        .then(function (user) {
          deferred.resolve(user);
        })
        .catch(function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    /**
     * @description - Remove session data and redirect owner to auth page
     */
    $scope.logout = function () {
      AuthService.logout();
    };
  }
]);