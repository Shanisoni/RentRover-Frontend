/**
 * Invoice Component
 * Simple display-only component that can be used in UI Bootstrap modal
 * All calculations and data must be provided from the parent/controller
 */
myApp.component('invoiceModal', {
  // Component bindings - data and functions passed from parent
  bindings: {
    resolve: '<',     // For UI Bootstrap modal (contains booking data)
    close: '&',       // Function to close modal with result
    dismiss: '&'      // Function to dismiss modal without result
  },
  
  // Template-only component - no calculations
  template: `
    <div class="modal-header">
      <h3 class="modal-title">
        <i class="fa fa-file-text-o"></i> Trip Invoice
        <button type="button" class="close" ng-click="$ctrl.dismiss()" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </h3>
    </div>
    <div class="modal-body">
      <!-- Invoice Content -->
      <div class="panel panel-default">
        <div class="panel-heading">
          <div class="row">
            <div class="col-xs-6">
              <h4>Car Rental Invoice</h4>
            </div>
            <div class="col-xs-6 text-right">
              <p class="text-muted">
                <i class="fa fa-calendar"></i> Invoice Date: {{ $ctrl.resolve.invoiceDate | date:'dd-MM-yyyy' }}
              </p>
            </div>
          </div>
        </div>
        <div class="panel-body">
          <!-- Car Details Section -->
          <div class="row">
            <div class="col-md-6">
              <div class="media">
                <div class="media-left">
                  <img class="media-object img-thumbnail" 
                       ng-src="{{ $ctrl.resolve.booking.car.image || 'assets/images/car-placeholder.png' }}" 
                       alt="{{ $ctrl.resolve.booking.car.name }}" style="width: 100px;">
                </div>
                <div class="media-body">
                  <h4 class="media-heading">{{ $ctrl.resolve.booking.car.name }}</h4>
                  <p class="text-muted">{{ $ctrl.resolve.booking.car.category }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <ul class="list-group">
                <li class="list-group-item">
                  <i class="fa fa-calendar-o"></i> Start Date:
                  <span class="pull-right">{{ $ctrl.resolve.booking.car.startDate | date:'dd-MM-yyyy' }}</span>
                </li>
                <li class="list-group-item">
                  <i class="fa fa-calendar-check-o"></i> End Date:
                  <span class="pull-right">{{ $ctrl.resolve.booking.car.endDate | date:'dd-MM-yyyy' }}</span>
                </li>
                <li class="list-group-item">
                  <i class="fa fa-clock-o"></i> Duration:
                  <span class="pull-right">{{ $ctrl.resolve.duration }} days</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Cost Breakdown -->
          <div class="table-responsive" style="margin-top: 20px;">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Base Rental Fee</strong><br>
                    <small class="text-muted">
                      {{ $ctrl.resolve.booking.car.basePrice | currency:"₹" }} × 
                      {{ $ctrl.resolve.duration }} days
                    </small>
                  </td>
                  <td class="text-right">
                    {{ $ctrl.resolve.baseAmount | currency:"₹" }}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Distance Charge</strong><br>
                    <small class="text-muted">
                      {{ $ctrl.resolve.booking.distanceTravelled || 0 }} km × 
                      {{ $ctrl.resolve.booking.car.pricePerKm | currency:"₹" }} per km
                    </small>
                  </td>
                  <td class="text-right">
                    {{ $ctrl.resolve.distanceAmount | currency:"₹" }}
                  </td>
                </tr>
                <tr ng-if="$ctrl.resolve.booking.additionalCharges">
                  <td>
                    <strong>Additional Charges</strong><br>
                    <small class="text-muted">Extra services or fees</small>
                  </td>
                  <td class="text-right">
                    {{ $ctrl.resolve.booking.additionalCharges | currency:"₹" }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>Subtotal</th>
                  <th class="text-right">{{ $ctrl.resolve.subtotal | currency:"₹" }}</th>
                </tr>
                <tr>
                  <td>Hidden Charges</td>
                  <td class="text-right">₹0</td>
                </tr>
                <tr class="active">
                  <th>Total Amount</th>
                  <th class="text-right">{{ $ctrl.resolve.totalAmount | currency:"₹" }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <!-- Payment Status -->
          <div class="alert" ng-class="{'alert-success': $ctrl.resolve.booking.paymentStatus, 'alert-warning': !$ctrl.resolve.booking.paymentStatus}">
            <div class="row">
              <div class="col-xs-2 text-center">
                <i class="fa fa-2x" 
                   ng-class="{'fa-check-circle': $ctrl.resolve.booking.paymentStatus, 'fa-exclamation-circle': !$ctrl.resolve.booking.paymentStatus}">
                </i>
              </div>
              <div class="col-xs-10">
                <h4 ng-if="$ctrl.resolve.booking.paymentStatus">Payment Completed</h4>
                <h4 ng-if="!$ctrl.resolve.booking.paymentStatus">Payment Pending</h4>
                <p ng-if="!$ctrl.resolve.booking.paymentStatus">Please collect payment from the customer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-default" ng-click="$ctrl.dismiss()">
        <i class="fa fa-times"></i> Close
      </button>
    </div>
  `
});