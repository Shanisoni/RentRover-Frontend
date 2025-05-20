/**
 * @description Authentication Controller - Manages user authentication flows
 * Handles user login, registration, and related form validations
 */
myApp.controller("AuthController", [
  "$scope",
  "$state",
  "ToastService",
  "UserFactory",
  "AuthService",
  function (
    $scope,
    $state,
    ToastService,
    UserFactory,
    AuthService
  ) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {number}
     * @description Current active tab index (0 for login, 1 for register)
     */
    $scope.activeTab = 0;

    /**
     * @type {Object}
     * @description Login form data
     */
    $scope.loginData = {};

    /**
     * @type {Object}
     * @description Registration form data with default role
     */
    $scope.user = { role: "user" };

    // ==========================================
    // Authentication Operations
    // ==========================================
    
    /**
     * @description Handle user login
     * Validates login credentials and authenticates user
     * On success, redirects to appropriate dashboard based on role
     */
    $scope.login = function() {
      // Validate login credentials
      const validationResult = UserFactory.validateLogin($scope.loginData);
      
      if (!validationResult.isValid) {
        ToastService.error(validationResult.message, 3000);
        return;
      }
      
      // Proceed with login
      AuthService.loginUser($scope.loginData)
        .then((response) => {
          // Store the JWT token in sessionStorage
          sessionStorage.setItem('token', response.auth.token);
          
          // Initialize socket connection
          // UserFactory.connectSocket(response.user);
          
          // Redirect to appropriate dashboard based on user role
          $state.go(response.user.role);
        })
        .catch((error) => {
          ToastService.error(error.data?.message || "Error logging in!", 3000);
        });
    };

    /**
     * @description Handle user registration
     * Validates registration data and creates new user account
     * On success, automatically logs in the user
     */
    $scope.register = function() {
      // Prepare and validate registration data
      const result = UserFactory.prepareForSignup($scope.user);
      
      if (!result.isValid) {
        ToastService.error(result.message, 3000);
        return;
      }
      
      // Proceed with registration
      AuthService.registerUser(result.user)
        .then((response) => {
          ToastService.success("Registration successful!", 3000);
          
          // Auto-login after successful registration
          $scope.loginData.email = $scope.user.email;
          $scope.loginData.password = $scope.user.password;
          $scope.login();
        })
        .catch((error) => {
          ToastService.error(error.data?.message || "Error registering user!", 3000);
        });
    };
  },
]);
