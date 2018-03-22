import { Component, OnInit, ViewChild } from '@angular/core';
import { IUserresponse } from "../../shared/models/userresponse";
import { IPaymentResponse } from "../../payment/models/paymentresponse";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { PaymentService } from "../../payment/services/payment.service";
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { SessionService } from "../../shared/services/session.service";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { Router } from '@angular/router';
import { PaymentMode } from "../../payment/constants";
import { ICreditcardpaymentrequest } from "../../payment/models/creditcardpaymentrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions, SubFeatures } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-customer-verify-payment',
  templateUrl: './customer-verify-payment.component.html',
  styleUrls: ['./customer-verify-payment.component.scss']
})
export class CustomerVerifyPaymentComponent implements OnInit {
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse;
  objPaymentRequest: IMakePaymentrequest;
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  paymentmode: string;
  paymentDate: Date;

  constructor(  private materialscriptService: MaterialscriptService,private paymentService: PaymentService, private paymentResponseService: PaymentResponseService, private router: Router, private sessionService: SessionService, private createAccountService: CreateAccountService) { }

  ngOnInit() {
     this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.createAccountService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.CustomerId == 0) {
          //let link = ['/csc/customerdetails/accountsummary'];
          //this.router.navigate(link);
        }
        else {
          this.objPaymentRequest = customerContext;
          this.paymentmode = PaymentMode[this.objPaymentRequest.PaymentMode];
          if (this.objPaymentRequest.PaymentProcess == "OldCreditCard") {
            this.paymentService.GetCreditCardByPK(this.objPaymentRequest.CustomerCCorBankAccountId.toString()).subscribe(res => {
              this.objPaymentRequest.CreditCardPayment = <ICreditcardpaymentrequest>{};
              this.objPaymentRequest.CreditCardPayment.NameOnCard = res.NameOnCard;
              this.objPaymentRequest.CreditCardPayment.CreditCardType = res.CCType;
              this.objPaymentRequest.CreditCardPayment.CreditCardNumber = res.CCNumber;
              this.objPaymentRequest.CreditCardPayment.CCSuffix4 = res.prefixsuffix.toString();
            });
          }
          else if (this.objPaymentRequest.PaymentProcess == "OldBankAccount") {
            this.paymentService.GetBankByPK(this.objPaymentRequest.CustomerCCorBankAccountId.toString()).subscribe(res => {
              this.objPaymentRequest.BankName = res.BankName;
              this.objPaymentRequest.AccoutName = res.AccName;
              this.objPaymentRequest.AccountNumber = res.Accnumber;
            });
          }
          else if (this.objPaymentRequest.PaymentMode == PaymentMode.Cheque) {
            this.paymentmode = "Check";
          }
          else if (this.objPaymentRequest.PaymentMode == PaymentMode.MoneyOrder) {
            this.paymentmode = "Money Order";
          }
          else if (this.objPaymentRequest.PaymentMode == PaymentMode.CreditCard) {
            this.paymentmode = "Credit Card";
            this.objPaymentRequest.CreditCardPayment.CCSuffix4 = this.objPaymentRequest.CreditCardPayment.CreditCardNumber.substring(this.objPaymentRequest.CreditCardPayment.CreditCardNumber.length - 4);
          }

          this.paymentDate = new Date();
        }
      }
      );

  }

  previous() {
    this.router.navigate(['/csc/customerdetails/customer-make-payment']);
  let a=this;
   setTimeout(function() {
     a.materialscriptService.material();
   }, 100);
  }

  cancelClick(val) {
    if (val == 0) {
      this.showMsg("alert", "Your Information no longer exists, if you cancel make payment.<br/>Are you sure you want to Cancel?");
    }
    else {
      this.router.navigate(['/csc/customerdetails/account-summary']);
      this.createAccountService.changeResponse(null);
    }
  }

  MakePayment() {
    $('#pageloader').modal('show');
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENT];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    userEvents.ActionName = this.getAction(this.objPaymentRequest.PaymentMode);
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.objPaymentRequest.CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.paymentService.MakePayment(this.objPaymentRequest, userEvents).subscribe(res => {
      if (res) {
        $('#pageloader').modal('hide');
        this.paymentResponse = res;
        this.paymentResponseService.changeResponse(this.paymentResponse);
        this.paymentResponse.UpdatedUser = this.objPaymentRequest.UserName;
        this.createAccountService.changeResponse(null);
        this.router.navigate(['/csc/customerdetails/customer-payment-confirmation']);
      }
    },
      err => {
        $('#pageloader').modal('hide');
        this.showMsg("error", err.statusText);
      });
  }

  getAction(paymentMode: PaymentMode): string {
    switch (paymentMode) {
      case PaymentMode.CreditCard:
        return Actions[Actions.CC];
      case PaymentMode.Bank:
        return Actions[Actions.BANK];
      case PaymentMode.Cheque:
        return Actions[Actions.CHEQUE];

      case PaymentMode.MoneyOrder:
        return Actions[Actions.MO];

      case PaymentMode.Cash:
        return Actions[Actions.CASH];

      case PaymentMode.Promo:
        return Actions[Actions.PROMO];
    }
  }

  userAction(event) {
    if (event) {
      this.cancelClick(1);
    }
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
