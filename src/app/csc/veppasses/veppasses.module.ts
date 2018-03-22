import { SharedModule } from './../../shared/shared.module';
import { BsDatepickerModule, PopoverModule } from 'ngx-bootstrap';
import { VepContextService } from './services/vepcontext.service';
import { VepPassesService } from './services/veppasses.service';
import { PaymentModule } from './../../payment/payment.module';
import { CreditCardInformationComponent } from './../../payment/credit-card-information.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VepPassDetailsComponent } from './vep-pass-details.component';
import { VepPassVerifyMakePaymentComponent } from './vep-pass-verify-make-payment.component';
import { VepPassThankYouComponent } from './vep-pass-thank-you.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { MyDatePickerModule } from 'mydatepicker';
@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule,
    ReactiveFormsModule,
    MyDatePickerModule ,
    PaymentModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
  ],  
  declarations: [VepPassDetailsComponent,  VepPassVerifyMakePaymentComponent, VepPassThankYouComponent],
  providers:[VepPassesService,VepContextService],
})
export class VeppassesModule { }
