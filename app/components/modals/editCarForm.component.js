/**
 * Edit Car Details Modal Component
 * 
 * Modal to edit various car details including pricing options and policy settings
 * Usage: Opens via $uibModal service
 */
myApp.component("editCarPriceModal", {
  template: `
    <div class="modal-header">
      <button type="button" class="close" ng-click="$ctrl.dismiss()" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <h3 class="modal-title">
        <i class="fa fa-car text-success" style="margin-right: 10px;"></i>
        Edit Car Details
      </h3>
    </div>
    
    <div class="modal-body">
      <div class="row">
        <div class="col-md-12">
          <div class="alert alert-info">
            <i class="fa fa-info-circle"></i> 
            Updating these details will affect all future bookings for this car.
          </div>
          
          <form name="carEditForm" novalidate>
            <!-- Car Name -->
            <div class="form-group" ng-class="{'has-error': carEditForm.carName.$invalid && carEditForm.carName.$touched}">
              <label>Car Name</label>
              <input type="text" 
                     name="carName"
                     class="form-control" 
                     ng-model="$ctrl.carName" 
                     ng-init="$ctrl.carName = $ctrl.resolve.car.carName"
                     required
                     maxlength="50"
                     placeholder="Enter car name">
              <span class="help-block" ng-show="carEditForm.carName.$error.required && carEditForm.carName.$touched">
                Car name is required
              </span>
            </div>
            
            <!-- Base Price -->
            <div class="form-group" ng-class="{'has-error': carEditForm.basePrice.$invalid && carEditForm.basePrice.$touched}">
              <label>Base Price Per Day</label>
              <div class="input-group">
                <span class="input-group-addon"><i class="fa fa-inr"></i></span>
                <input type="number" 
                       name="basePrice"
                       class="form-control" 
                       ng-model="$ctrl.basePrice" 
                       ng-init="$ctrl.basePrice = $ctrl.resolve.car.basePrice"
                       min="1"
                       required
                       placeholder="Enter base price per day">
              </div>
              <span class="help-block" ng-show="carEditForm.basePrice.$error.required && carEditForm.basePrice.$touched">
                Base price is required
              </span>
              <span class="help-block" ng-show="carEditForm.basePrice.$error.min && carEditForm.basePrice.$touched">
                Base price must be greater than 0
              </span>
            </div>
            
            <!-- Price Per KM -->
            <div class="form-group" ng-class="{'has-error': carEditForm.pricePerKm.$invalid && carEditForm.pricePerKm.$touched}">
              <label>Price Per KM</label>
              <div class="input-group">
                <span class="input-group-addon"><i class="fa fa-inr"></i></span>
                <input type="number" 
                       name="pricePerKm"
                       class="form-control" 
                       ng-model="$ctrl.pricePerKm" 
                       ng-init="$ctrl.pricePerKm = $ctrl.resolve.car.pricePerKm"
                       min="1"
                       required
                       placeholder="Enter price per km">
              </div>
              <span class="help-block" ng-show="carEditForm.pricePerKm.$error.required && carEditForm.pricePerKm.$touched">
                Price per km is required
              </span>
              <span class="help-block" ng-show="carEditForm.pricePerKm.$error.min && carEditForm.pricePerKm.$touched">
                Price per km must be greater than 0
              </span>
            </div>
            
            <!-- Outstation Price -->
            <div class="form-group" ng-class="{'has-error': carEditForm.outStationPrice.$invalid && carEditForm.outStationPrice.$touched}">
              <label>Outstation Charges</label>
              <div class="input-group">
                <span class="input-group-addon"><i class="fa fa-inr"></i></span>
                <input type="number" 
                       name="outStationPrice"
                       class="form-control" 
                       ng-model="$ctrl.outStationPrice" 
                       ng-init="$ctrl.outStationPrice = $ctrl.resolve.car.outStationCharges"
                       min="1"
                       required
                       placeholder="Enter outstation price per day">
              </div>
              <span class="help-block" ng-show="carEditForm.outStationPrice.$error.required && carEditForm.outStationPrice.$touched">
                Outstation price is required
              </span>
            </div>
            
            <!-- Fine Per Extra Day -->
            <div class="form-group" ng-class="{'has-error': carEditForm.finePercentage.$invalid && carEditForm.finePercentage.$touched}">
              <label>Fine % Per Late Return Day</label>
              <div class="input-group">
                <input type="number" 
                       name="finePercentage"
                       class="form-control" 
                       ng-model="$ctrl.finePercentage" 
                       ng-init="$ctrl.finePercentage = $ctrl.resolve.car.finePercentage || 50"
                       min="0"
                       max="100"
                       required
                       placeholder="Enter fine % per late return day">
                <span class="input-group-addon">%</span>
              </div>
              <span class="help-block" ng-show="carEditForm.finePercentage.$error.required && carEditForm.finePercentage.$touched">
                Fine percentage is required
              </span>
              <span class="help-block" ng-show="carEditForm.finePercentage.$error.min && carEditForm.finePercentage.$touched">
                Fine percentage must be 0 or greater
              </span>
              <span class="help-block" ng-show="carEditForm.finePercentage.$error.max && carEditForm.finePercentage.$touched">
                Fine percentage cannot exceed 100
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">
        <i class="fa fa-times"></i> Cancel
      </button>
      <button type="button" 
              class="btn btn-success" 
              ng-click="$ctrl.close({$value: {
                success: true, 
                updateCar: {
                  carName: $ctrl.carName,
                  basePrice: $ctrl.basePrice,
                  pricePerKm: $ctrl.pricePerKm,
                  outStationCharges: $ctrl.outStationPrice,
                  finePercentage: $ctrl.finePercentage
                }
              }})" 
              ng-disabled="carEditForm.$invalid">
        <i class="fa fa-check"></i> Update Car Details
      </button>
    </div>
  `,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  }
});