import { Component, OnInit, ViewChild } from '@angular/core';
import { IPaymentResponse } from "../../payment/models/paymentresponse";
import { IEmailRequest } from "../../payment/models/emailrequest";
import { IUserresponse } from "../../shared/models/userresponse";
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { PaymentService } from "../../payment/services/payment.service";
import { SessionService } from "../../shared/services/session.service";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { Router } from '@angular/router';
import { CreditCardType, PaymentMode } from "../../payment/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
@Component({
  selector: 'app-customer-payment-confirmation',
  templateUrl: './customer-payment-confirmation.component.html',
  styleUrls: ['./customer-payment-confirmation.component.scss']
})
export class CustomerPaymentConfirmationComponent implements OnInit {

  paymentResponse: IPaymentResponse;
  lstPaymentResponse: IPaymentResponse[];
  emailRequest: IEmailRequest = <IEmailRequest>{};
  message: string;
  ccMode: string;
  userId: number;
  customerId: number;
  sessionContextResponse: IUserresponse;
  viewPath: string = "";
  filePath: string = "";
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  paymentMode: string;
  disableReceipt: boolean = true;
  // apiUrl = 'http://localhost:49563/'; // Need to move to Config
  // downloadPath = 'pdf/'; // Need to move to Config and Need to populate from virtual Path

  constructor(private paymentResponseService: PaymentResponseService, private paymentService: PaymentService, private router: Router, private createAccountService: CreateAccountService, private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.userId = this.sessionContextResponse.userId;
    let items = [];
    this.paymentResponseService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.CustomerId == 0) {
          //let link = ['/csc/customerdetails/accountsummary'];
          //this.router.navigate(link);
        }
        else {
          this.paymentResponse = customerContext;
          this.customerId = this.paymentResponse.CustomerId;
          if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.Cheque]) {
            this.paymentMode = "Check";
          }
          else if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.MoneyOrder]) {
            this.paymentMode = "Money Order";
          }
          else if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.CreditCard]) {
            this.paymentMode = "Credit Card";
          }
          else {
            this.paymentMode = this.paymentResponse.PaymentMode.toString();
          }
        }
      }
      );

    items.push(this.paymentResponse);

    this.lstPaymentResponse = items.map(x => Object.assign({}, x));;
    var strViewPath: string;
    this.ccMode = CreditCardType[this.paymentResponse.CardType];
    this.GeneratePaymentReciept();
    this.showMsg("success", "Payment has been done successfully");
  }

  getAction(paymentMode: string): string {
    switch (paymentMode) {
      case PaymentMode[PaymentMode.CreditCard]:
        return Actions[Actions.CC];
      case PaymentMode[PaymentMode.Bank]:
        return Actions[Actions.BANK];
      case PaymentMode[PaymentMode.Cheque]:
        return Actions[Actions.CHEQUE];

      case PaymentMode[PaymentMode.MoneyOrder]:
        return Actions[Actions.MO];

      case PaymentMode[PaymentMode.Cash]:
        return Actions[Actions.CASH];

      case PaymentMode[PaymentMode.Promo]:
        return Actions[Actions.PROMO];
    }
  }

  GeneratePaymentReciept() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENT];
    userEvents.ActionName = this.getAction(this.lstPaymentResponse[0].PaymentMode.toString());
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.lstPaymentResponse[0].CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.paymentService.GeneratePaymentReciept(this.lstPaymentResponse, this.userId, this.sessionContextResponse.loginId, 'Payment', userEvents).subscribe(res => {
      if (res) {
        this.disableReceipt = false;
        this.viewPath = res[0];
        this.filePath = res[1];
        //console.log(this.viewPath);
        this.paymentEmail(0);
        this.paymentResponseService.changeResponse(null);
      }
    });

  }

  printReceipt() {
    //console.log(this.viewPath + this.filePath);
    window.open(this.viewPath + this.filePath);

  }

  paymentEmail(status) {

    this.emailRequest.CustomerId = this.customerId;
    this.emailRequest.EmailSubject = "Payment Receipt";
    this.emailRequest.CreatedUser = this.sessionContextResponse.userName;
    this.emailRequest.CreatedDate = new Date();
    this.emailRequest.EmailInterface = "PAYMENTRECEIPT";
    this.emailRequest.Attachement = this.filePath;

    this.paymentService.InsertPaymentReciptEmail(this.emailRequest).subscribe(res => {
      if (res) {
        if (status == 1)
          this.showMsg("success", "Successfully Payment receipt Send to Customer Email Address");
      }
      else {
        this.showMsg("error", "Error while sending email");
      }
    }, (err) => {
      this.showMsg("success", err.statusText);
    });

  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }
}
