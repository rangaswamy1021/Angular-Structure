import { RouterModule } from '@angular/router';
import { CustomerContextService } from './../../shared/services/customer.context.service';
import { UnidentifiedPaymentsService } from './services/unidentified-payments.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdjustmentRequestsComponent } from './adjustment-requests.component';
import { ManageBlocklistComponent } from './manage-blocklist.component';
import { ManageReferralComponent } from './manage-referral.component';
import { MergeAccountsComponent } from './merge-accounts.component';
import { PayByPlateListComponent } from './pay-by-plate-list.component';
import { ReOpenAccountComponent } from './re-open-account.component';
import { ResetPasswordAttemptsComponent } from './reset-password-attempts.component';
import { SplitAccountComponent } from './split-account.component';
import { UnidentifiedPaymentsComponent } from './unidentified-payments.component';
import { CreateAccountPlanSelectionComponent } from './create-account-plan-selection.component';
import { CreateAccountPersonalInformationComponent } from './create-account-personal-information.component';
import { CreateAccountVehicleInformationComponent } from './create-account-vehicle-information.component';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { TabsModule, PopoverModule } from "ngx-bootstrap";
import { DateTimePickerModule } from 'ng-pick-datetime';
import { CustomerPreferencesComponent } from './customer-preferences.component';
import { AmountsSummaryDetailsComponent } from './amounts-summary-details.component';
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { PaymentModule } from "../../payment/payment.module";
import { PaymentModesComponent } from './payment-modes.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VehiclesModule } from '../../vehicles/vehicles.module';
import { customDateFormatPipe } from '../../shared/pipes/convert-date.pipe';
import { VerifyUnidentifiedPaymentComponent } from './verify-unidentified-payment.component';
import { SplitVehiclesComponent } from './split-vehicles.component';
import { SplitPlanSelectionComponent } from './split-plan-selection.component';
import { SplitPaymentComponent } from './split-payment.component';
import { SplitSearchComponent } from './split-search.component';
import { SplitCustomerService } from "./services/splitcustomer.service";
import { AdditionalContactsComponent } from '../customerdetails/additional-contacts.component';
import { SplitVerifyPaymentComponent } from './split-verify-payment.component';
import { SplitThankYouComponent } from './split-thank-you.component';
import { SplitPreviewComponent } from './split-preview.component';
import { PayAAdvanceTollsToCustomerComponent } from './pay-a-advance-tolls-to-customer.component';
import { CreateAccountIntermediateComponent } from './create-account-intermediate.component';
import { TermsConditionsComponent } from './terms-conditions.component';
import { CustomerdetailsModule } from "../customerdetails/customerdetails.module";
import { CurrencycustomPipe } from "../../shared/pipes/convert-currency.pipe";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';




@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MyDateRangePickerModule,
    MyDatePickerModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,
    DateTimePickerModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaymentModule,
    PopoverModule.forRoot(),
    VehiclesModule,
    RouterModule,
    DateTimePickerModule,
    CustomerdetailsModule
  ],
  declarations: [
    AdjustmentRequestsComponent,
    ManageBlocklistComponent,
    ManageReferralComponent,
    MergeAccountsComponent,
    PayByPlateListComponent,
    ReOpenAccountComponent,
    ResetPasswordAttemptsComponent,
    SplitAccountComponent,
    UnidentifiedPaymentsComponent,
    CreateAccountPlanSelectionComponent,
    CreateAccountPersonalInformationComponent,
    CreateAccountVehicleInformationComponent,
    CustomerPreferencesComponent,
    AmountsSummaryDetailsComponent,
    PaymentModesComponent,
    VerifyUnidentifiedPaymentComponent,
    SplitVehiclesComponent,
    SplitPlanSelectionComponent,
    SplitPaymentComponent,
    SplitSearchComponent,
    AdditionalContactsComponent,
    SplitVerifyPaymentComponent,
    SplitThankYouComponent,
    SplitPreviewComponent,
    PayAAdvanceTollsToCustomerComponent,
    CreateAccountIntermediateComponent,
    TermsConditionsComponent
  ],
  providers: [
    CustomerAccountsService,
    CreateAccountService,
    UnidentifiedPaymentsService,
    SplitCustomerService,
    CustomerContextService
  ],
  exports: [AmountsSummaryDetailsComponent]
})
export class CustomeraccountsModule { }
