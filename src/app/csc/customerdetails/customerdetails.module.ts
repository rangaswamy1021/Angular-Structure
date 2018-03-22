import { TagsModule } from './../../tags/tags.module';
import { SharedModule } from './../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerDetailsService } from './services/customerdetails.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxGalleryModule } from 'ngx-gallery';
import { AccountSummaryComponent } from './account-summary.component';
import { RecentActivityComponent } from './recent-activity.component';
import { RequestStatementComponent } from './request-statement.component';
import { TransactionHistoryComponent } from './transaction-history.component';
import { TransactionAcitivitiesComponent } from './transaction-acitivities.component';
import { AccountAdjustmentsComponent } from './account-adjustments.component';
import { NsfAdjustmentsComponent } from './nsf-adjustments.component';
import { InvoiceDetailsComponent } from './invoice-details.component';
import { ManageAutoPayComponent } from './manage-auto-pay.component';
import { RedeemRewardsComponent } from './redeem-rewards.component';
import { ContactInformationComponent } from './contact-information.component';
import { SecuritySettingsComponent } from './security-settings.component';
import { SentDocumentsComponent } from './sent-documents.component';
import { RepleshActivitiesComponent } from './replesh-activities.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DateTimePickerModule } from 'ng-pick-datetime';
import { ReopenAccountsummaryComponent } from "./reopen-accountsummary.component";
import { BsDatepickerModule, PopoverModule } from "ngx-bootstrap";
import { DisplayNotProvidedPipe } from '../../shared/pipes/convert-to-not-provided.pipe';
import { TransactionsModule } from "../../transactions/transactions.module";
import { TransactionTransferComponent } from './transaction-transfer.component';
import { ManageVehiclesComponent } from './manage-vehicles.component';
import { ReferralProgramComponent } from './referral-program.component';
import { CustomerMakePaymentComponent } from './customer-make-payment.component';
import { PaymentModule } from "../../payment/payment.module";
import { CustomerVerifyPaymentComponent } from "./customer-verify-payment.component";
import { CustomerPaymentConfirmationComponent } from "./customer-payment-confirmation.component";
import { TransactionActivityDetailsComponent } from './transaction-activity-details.component';
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { TagService } from "../../tags/services/tags.service";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { PaymentHistoryDetailsComponent } from './payment-history-details.component';
import { ManageTagsComponent } from './manage-tags.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';
import { DisputeTransactionComponent } from './dispute-transaction.component';
import { UnbilledTransactionsComponent } from './unbilled-transactions.component';
import { DisputesService } from "../../tvc/disputes/services/disputes.service";




@NgModule({
  imports: [
    MyDatePickerModule,
    CommonModule,
    MyDateRangePickerModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    PopoverModule,
    SharedModule,
    TransactionsModule,
    PopoverModule.forRoot(),
    PaymentModule,
    TagsModule,
    NgxGalleryModule,
    MyDatePickerModule
  ],
  declarations: [AccountSummaryComponent,
    ReopenAccountsummaryComponent,
    RecentActivityComponent,
    RequestStatementComponent,
    TransactionHistoryComponent,
    TransactionAcitivitiesComponent,
    AccountAdjustmentsComponent,
    NsfAdjustmentsComponent,
    InvoiceDetailsComponent,
    ManageAutoPayComponent,
    RedeemRewardsComponent,
    ContactInformationComponent,
    SecuritySettingsComponent,
    SentDocumentsComponent,
    RepleshActivitiesComponent,
    DisplayNotProvidedPipe,
    TransactionTransferComponent, TransactionAcitivitiesComponent,
    ManageVehiclesComponent,
    ReferralProgramComponent,
    CustomerMakePaymentComponent,
    CustomerVerifyPaymentComponent,
    CustomerPaymentConfirmationComponent,
    TransactionActivityDetailsComponent,
    PaymentHistoryDetailsComponent,
    ManageTagsComponent,
    DisputeTransactionComponent,
    UnbilledTransactionsComponent
    ],
    providers:[
      CustomerDetailsService,
      TripsContextService,
      PaymentResponseService,
      TagService,
      DisputesService
    ],
    exports:[]
})
export class CustomerdetailsModule { }
