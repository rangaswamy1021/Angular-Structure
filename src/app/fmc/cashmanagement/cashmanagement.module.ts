import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCashDetailsComponent } from './add-cash-details.component';
import { CashDetailsReportComponent } from './cash-details-report.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDatepickerModule } from "ngx-bootstrap";
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { CashManagementService } from "./services/cashmanagement.service";
import { SharedModule } from "../../shared/shared.module";
import { MyDateRangePickerModule } from "mydaterangepicker";
import { DateTimePickerModule } from "ng-pick-datetime/picker.module";
import { BankDepositRequestsHistoryComponent } from './bank-deposit-requests-history.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    NgxPaginationModule,
    SharedModule,
    DateTimePickerModule,
    MyDateRangePickerModule

  ],
  declarations: [AddCashDetailsComponent, CashDetailsReportComponent, BankDepositRequestsHistoryComponent],
  providers: [CashManagementService]
})
export class CashmanagementModule { }
