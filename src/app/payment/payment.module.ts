import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MakePaymentComponent } from './make-payment.component';
import { PaymentHistoryComponent } from './payment-history.component';
import { CreditCardInformationComponent } from './credit-card-information.component';
import { BankInformationComponent } from './bank-information.component';
import { MoneyOrderComponent } from './money-order.component';
import { ChequeComponent } from './cheque.component';
import { HttpService } from "../shared/services/http.service";
import { PaymentService } from "./services/payment.service";
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentGiftcertificateComponent } from './payment-giftcertificate.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VerifyMakepaymentComponent } from './verify-makepayment.component';
import { PaymentConfirmationComponent } from './payment-confirmation.component';
import { AddCreditcardComponent } from './add-creditcard.component';
import { AddBankinformationComponent } from './add-bankinformation.component';
import { PopoverModule } from "ngx-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { NgxPaginationModule } from "ngx-pagination";
import { PaymentContextService } from "../tvc/paymentdetails/services/payment.context.service";
import { PaymentResponseService } from "../shared/services/payment.response.service";
import { RouterModule } from '@angular/router';
import { paymentChildren } from "./payment.route";
import { CreateAccountService } from "../shared/services/createaccount.service";
import { CustomerdetailsModule } from '../csc/customerdetails/customerdetails.module';
import { MyDatePickerModule } from "mydatepicker";
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { AddressCreditcardService } from "../shared/services/addresscreditcarddetails.context.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyDateRangePickerModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    RouterModule.forChild(paymentChildren),
    NgxPaginationModule,
    MyDatePickerModule
  ],
  exports: [MoneyOrderComponent, CreditCardInformationComponent, BankInformationComponent, ChequeComponent, MakePaymentComponent, PaymentHistoryComponent, AddCreditcardComponent, AddBankinformationComponent],
  providers: [PaymentService, HttpService, PaymentContextService, CreateAccountService, AddressCreditcardService],
  declarations: [MakePaymentComponent, PaymentHistoryComponent, CreditCardInformationComponent, BankInformationComponent, MoneyOrderComponent, ChequeComponent, PaymentGiftcertificateComponent, VerifyMakepaymentComponent, PaymentConfirmationComponent, AddCreditcardComponent, AddBankinformationComponent]
})
export class PaymentModule { }
