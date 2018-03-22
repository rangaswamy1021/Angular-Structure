import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHistoryComponent } from './payment-history.component';
import { PaymentDetailsComponent } from './payment-details.component';
import { NsfCheckDetailsComponent } from './nsf-check-details.component';
import { PaymentPlanComponent } from './payment-plan.component';
import { ViewPaymentPlanDetailsComponent } from './view-payment-plan-details.component';
import { PaymentModule } from '../../payment/payment.module';
import { ViolationPaymentComponent } from './violation-payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PopoverModule } from 'ngx-bootstrap';
import { PaymentDetailService } from "./services/paymentdetails.service";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxPaginationModule } from 'ngx-pagination';
import { VerifyViolationPaymentComponent } from './verify-violation-payment.component';
import { ViolationPaymentConfirmationComponent } from './violation-payment-confirmation.component';
import { PaymentContextService } from "./services/payment.context.service";
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { ViolationPaymentHistoryComponent } from './violation-payment-history.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    PaymentModule,
    ReactiveFormsModule,
    SharedModule,
    PopoverModule.forRoot(),
    FormsModule,
    BsDatepickerModule,
    NgxPaginationModule,
    RouterModule,
    MyDateRangePickerModule,
    MyDatePickerModule
  ],
  entryComponents: [ViolationPaymentHistoryComponent],
  declarations: [PaymentHistoryComponent, PaymentDetailsComponent, NsfCheckDetailsComponent, PaymentPlanComponent, ViewPaymentPlanDetailsComponent, ViolationPaymentComponent, VerifyViolationPaymentComponent, ViolationPaymentConfirmationComponent, ViolationPaymentHistoryComponent],
  providers: [PaymentDetailService, PaymentContextService, PaymentResponseService]
})
export class PaymentdetailsModule { }
