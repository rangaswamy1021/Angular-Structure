import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerVehiclesListComponent } from './customer-vehicles-list.component';
import { IcnHistoryComponent } from './icn-history.component';
import { AccountStatusChangesComponent } from './account-status-changes.component';
import { CustomerTagListComponent } from './customer-tag-list.component';
import { ClerkReconciliationReportComponent } from './clerk-reconciliation-report.component';
import { EzPassOutboundTransactionsCorrectionsComponent } from './ez-pass-outbound-transactions-corrections.component';
import { ClerkCloseOutReportComponent } from './clerk-close-out-report.component';
import { IcnHistoryReportComponent } from './icn-history-report.component';
import { CscPaymentDetailsComponent } from './csc-payment-details.component';
import { DailyAdjustmentsComponent } from './daily-adjustments.component';
import { PaymentReversalsComponent } from './payment-reversals.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDatepickerModule, PopoverModule, AlertModule } from "ngx-bootstrap";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { CSCReportsService } from './services/reports.service';
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    DateTimePickerModule,
    FormsModule,
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,    
    AlertModule.forRoot(),
    SharedModule,
    MyDateRangePickerModule,
    MyDatePickerModule
  ],
  declarations: [CustomerVehiclesListComponent, IcnHistoryComponent, AccountStatusChangesComponent, CustomerTagListComponent, ClerkReconciliationReportComponent, EzPassOutboundTransactionsCorrectionsComponent, ClerkCloseOutReportComponent, IcnHistoryReportComponent, CscPaymentDetailsComponent, DailyAdjustmentsComponent, PaymentReversalsComponent],
  providers:[CSCReportsService]
  
})
export class ReportsModule { }
