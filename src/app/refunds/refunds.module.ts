import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueRefundComponent } from './issue-refund.component';
import { RefundRequestComponent } from './refund-request.component';
import { RefundQueueComponent } from './refund-queue.component';
import { RefundService } from './services/refund.service';
import { HttpService } from '../shared/services/http.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaymentModule } from '../payment/payment.module';
import { SharedModule } from '../shared/shared.module';
import { ViolatorRefundFormComponent } from './violator-refund-form.component';
import { CustomerRefundFormComponent } from './customer-refund-form.component';
import { RefundContextService } from './services/RefundContextService';
import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, BsDatepickerModule.forRoot(), PaymentModule, SharedModule, MyDateRangePickerModule
  ],
  declarations: [IssueRefundComponent, RefundRequestComponent, RefundQueueComponent, ViolatorRefundFormComponent, CustomerRefundFormComponent],
  providers: [RefundService, HttpService, RefundContextService]
})
export class RefundsModule { }
