/**
 * Alert Modal Component
 * 
 * Simple modal to confirm car deletion with warning
 * Usage: Opens via $uibModal service
 */
myApp.component("deleteAlertModal", {
  template: `
    <div class="modal-header bg-danger">
      <button type="button" class="close" ng-click="$ctrl.dismiss()" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <h3 class="modal-title text-white">
        <i class="fa fa-exclamation-triangle" style="margin-right: 10px;"></i>
        Confirm Disable
      </h3>
    </div>
    
    <div class="modal-body text-center">
      <i class="fa fa-trash fa-4x text-danger" style="margin: 20px 0;"></i>
      
      <h4>Are you sure you want to disable this car?</h4>
      <p class="text-danger"><strong>{{$ctrl.resolve.car.name}}</strong></p>
      
      <div class="alert alert-warning">
        <i class="fa fa-warning"></i>
        This action cannot be undone. All bookings associated with this car will remain in the system.
      </div>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-danger" ng-click="$ctrl.close({$value: {confirmed: true}})">
        <i class="fa fa-trash"></i> Disable Car
      </button>
    </div>
  `,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  }
});