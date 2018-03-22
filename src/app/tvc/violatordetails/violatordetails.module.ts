import { SharedModule } from '../../shared/shared.module';
import { CreateViolatorComponent } from './../violatoraccounts/create-violator.component';
import { ViolationTransferComponent } from './../disputes/violation-transfer.component';
import { InvoiceSearchComponent } from './../search/invoice-search.component';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViolatorSummaryComponent } from './violator-summary.component';
import { TransactionActivitiesComponent } from './transaction-activities.component';
import { ManageVehiclesComponent } from './manage-vehicles.component';
import { InvoiceSearchDetailsComponent } from './invoice-search-details.component';
import { ActivityDetailsComponent } from './activity-details.component';
import { ConvertToCustomerComponent } from './convert-to-customer.component';
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverPaymentTransferComponent } from "./over-payment-transfer.component";
import { TransactionStatusUpdateComponent } from './transaction-status-update.component';
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { RouterModule } from '@angular/router';
import { CreateCorrespondenceComponent } from './create-correspondence.component';
import { InvoiceAdjustmentsComponent } from './invoice-adjustments.component';
import { UpdateContactDetailsComponent } from './update-contact-details.component';
import { AdminHearingComponent } from './admin-hearing.component';
import { SstHistoryComponent } from './sst-history.component';
import { TripHistoryComponent } from './trip-history.component';
import { ViewCorrespondenceComponent } from './view-correspondence.component';
import { ViolationTransferToCustomerComponent } from './violation-transfer-to-customer.component';
import { ViolationTripHistoryComponent } from './violation-trip-history.component';
import { TripAdjustmentsComponent } from './trip-adjustments.component';
import { AddActivityDetailsComponent } from './add-activity-details.component';
import { InvoiceOverpaymentTransferComponent } from './invoice-overpayment-transfer.component';
import { CustomerSearchService } from '../../csc/search/services/customer.search';
import { NgxGalleryModule } from 'ngx-gallery';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    DateTimePickerModule,
    PopoverModule,
    FormsModule,
    RouterModule,
    NgxGalleryModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    MyDateRangePickerModule,
    MyDatePickerModule,
    // RouterModule.forRoot([
    //   { path: 'account-summary', component: ViolatorSummaryComponent },
    //   { path: 'view-complaint/:id', component: TransactionActivitiesComponent },
    //   { path: 'view-trip/:id', component: TransactionActivitiesComponent },
    // ]),
    SharedModule
  ],
  providers: [ViolatordetailsService, TripsContextService,CustomerSearchService],
  declarations: [ViolatorSummaryComponent, TransactionActivitiesComponent, CreateViolatorComponent, 
    ViolationTransferComponent, ManageVehiclesComponent, InvoiceSearchDetailsComponent, ActivityDetailsComponent, 
    ConvertToCustomerComponent, OverPaymentTransferComponent, TransactionStatusUpdateComponent, 
    CreateCorrespondenceComponent, InvoiceAdjustmentsComponent, UpdateContactDetailsComponent, AdminHearingComponent, 
    SstHistoryComponent, TripHistoryComponent, ViewCorrespondenceComponent, ViolationTransferToCustomerComponent, 
    ViolationTripHistoryComponent,AddActivityDetailsComponent,TripAdjustmentsComponent, InvoiceOverpaymentTransferComponent]
})
export class ViolatordetailsModule { }
