myApp.config([
  "$stateProvider",
  "$urlRouterProvider",
  "$locationProvider", // add this
  function ($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);

    $stateProvider
      .state("auth", {
        url: "/auth",
        templateUrl: "app/views/auth/auth.html",
        controller: "AuthController",
      })
      .state("owner", {
        url: "/owner-dashboard",
        templateUrl: "app/views/owner/owner-dashboard/owner-dashboard.html",
        controller: "OwnerDashboardController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("user", {
        url: "/user-dashboard",
        templateUrl: "app/views/user/user-dashboard/user-dashboard.html",
        controller: "UserController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("addCar", {
        url: "/addCar",
        templateUrl: "app/views/owner/owner-addCar/owner-addCar.html",
        controller: "AddCar",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("carDetails", {
        url: "/car-details/:id",
        templateUrl: "app/views/user/user-car/user-car.html",
        controller: "carController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("userBiddings", {
        url: "/user-biddings",
        templateUrl: "app/views/user/user-bidding/user-bidding.html",
        controller: "userBiddingController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("ownerBiddings", {
        url: "/owner-biddings",
        templateUrl: "app/views/owner/owner-Bidding/owner-bidding.html",
        controller: "ownerBiddingController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("userBooking", {
        url: "/user-bookings",
        templateUrl: "app/views/user/user-bookings/user-bookings.html",
        controller: "userBookingController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("ownerBooking", {
        url: "/owner-bookings",
        templateUrl: "app/views/owner/owner-booking/owner-booking.html",
        controller: "ownerBookingController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("ownerProfile", {
        url: "/owner-profile",
        templateUrl: "app/views/owner/owner-profile/owner-profile.html",
        controller: "ownerProfileController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("userProfile", {
        url: "/user-profile",
        templateUrl: "app/views/user/user-profile/user-profile.html",
        controller: "userProfileController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("userChat", {
        url: "/user-chat",
        templateUrl: "app/views/user/user-chat/user-chat.html",
        controller: "userChatController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("user");
            },
          ],
        },
      })
      .state("ownerChat", {
        url: "/owner-chat",
        templateUrl: "app/views/owner/owner-chat/owner-chat.html",
        controller: "ownerChatController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ],
        },
      })
      .state("ownerAnalysis", {
        url: "/owner-analysis",
        templateUrl: "app/views/owner/owner-Analysis/owner-analysis.html",
        controller: "OwnerAnalysisController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("owner");
            },
          ]
        }
      })
      .state("admin", {
        url: "/super-admin",
        templateUrl: "app/views/super-admin/admin-panel/admin-panel.html",
        controller: "SuperAdminAnalysisController",
        resolve: {
          auth: [
            "AuthService",
            function (AuthService) {
              return AuthService.requireRole("admin");
            },
          ]
        }
      });

    $urlRouterProvider.otherwise("/auth");
  }
]);
