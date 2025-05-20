myApp.directive('strongPassword', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      // Registration validation function
      ngModel.$validators.hasUpperCase = function(value) {
        return /[A-Z]/.test(value || '');
      };
      
      ngModel.$validators.hasLowerCase = function(value) {
        return /[a-z]/.test(value || '');
      };
      
      ngModel.$validators.hasNumber = function(value) {
        return /[0-9]/.test(value || '');
      };
      
      ngModel.$validators.hasSpecial = function(value) {
        return /[!@#$%^&*(),.?":{}|<>]/.test(value || '');
      };
      
      ngModel.$validators.minlength = function(value) {
        return (value || '').length >= 8;
      };
    }
  };
});