import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { PaymentContextService } from "./services/payment.context.service";
import { IViolationPaymentrequest } from "../../payment/models/violationpaymentrequest";
import { PaymentDetailService } from "./services/paymentdetails.service";
import { IPaymentResponse } from "../../payment/models/paymentresponse";
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { PaymentMode } from "../../payment/constants";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { InvoicesContextService } from "../../shared/services/invoices.context.service";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IUserEvents } from '../../shared/models/userevents';
import { Features, Actions, SubFeatures } from '../../shared/constants';
declare var $: any;
@Component({
  selector: 'app-verify-violation-payment',
  templateUrl: './verify-violation-payment.component.html',
  styleUrls: ['./verify-violation-payment.component.scss']
})
export class VerifyViolationPaymentComponent implements OnInit {
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse;
  objPaymentRequest: IViolationPaymentrequest;
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  paymentmode: string;

  constructor(private violatorContext: ViolatorContextService, private invoicesContextService: InvoicesContextService, private tripContextService: TripsContextService, private paymentDetailService: PaymentDetailService, private paymentResponseService: PaymentResponseService, private router: Router, private sessionService: SessionService, private vioPaymentContextService: PaymentContextService) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.vioPaymentContextService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.CustomerId == 0) {
          //let link = ['/csc/customerAccounts/create-account/'];
          //this.router.navigate(link);
        }
        else {
          this.objPaymentRequest = customerContext;
          if (this.objPaymentRequest.PaymentMode == PaymentMode.Cheque) {
            this.paymentmode = "Check";
          }
          else if (this.objPaymentRequest.PaymentMode == PaymentMode.MoneyOrder) {
            this.paymentmode = "Money Order";
          }
          else if (this.objPaymentRequest.PaymentMode == PaymentMode.CreditCard) {
            this.paymentmode = "Credit Card";
          }
          else
            this.paymentmode = PaymentMode[this.objPaymentRequest.PaymentMode];
          this.objPaymentRequest.PaymentDate = new Date();
        }
      }
      );

  }

  previous() {

    if (this.objPaymentRequest.NavProcess == "PaymentPlan") {
      this.router.navigate(['tvc/paymentdetails/payment-plan-details']);
    } else if (this.objPaymentRequest.NavProcess == "TermPayment") {
      this.router.navigate(['tvc/paymentdetails/view-payment-plan-details']);
    }
    else {
      this.router.navigate(['tvc/paymentdetails/violation-payment']);
    }

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

  MakePayment() {
    $('#pageloader').modal('show');

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    if (this.objPaymentRequest.ViolationProcess == "PaymentPlan") {
      userEvents.FeatureName = Features[Features.PAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    } else if (this.objPaymentRequest.ViolationProcess == "TermPayment") {
      userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.PAYMENT];
      userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    }
    else {
      userEvents.FeatureName = Features[Features.TVCPAYMENT]; // Violation Make Payment need to take care
      userEvents.ActionName = this.getAction(this.objPaymentRequest.PaymentMode);
      userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    }

    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.objPaymentRequest.CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.paymentDetailService.makePayment(this.objPaymentRequest, userEvents).subscribe(res => {
      if (res) {
        $('#pageloader').modal('hide');
        this.paymentResponse = res;
        this.paymentResponse.CustomerId = this.objPaymentRequest.CustomerId;
        this.paymentResponse.PaymentDate = this.objPaymentRequest.PaymentDate;
        this.paymentResponse.ToltalAmountPaid = this.objPaymentRequest.TxnAmount + this.objPaymentRequest.CreditCardServiceTax;
        this.paymentResponse.PaymentMode = this.objPaymentRequest.PaymentMode;
        if (this.objPaymentRequest.PaymentMode == PaymentMode.CreditCard) {
          this.paymentResponse.CCSuffix4 = this.objPaymentRequest.CreditCardPayment.CreditCardNumber.substring(this.objPaymentRequest.CreditCardPayment.CreditCardNumber.length - 4);
        }
        else if (this.objPaymentRequest.PaymentMode == PaymentMode.MoneyOrder) {
          this.paymentResponse.MoneyOrderNumber = this.objPaymentRequest.MONumber;
        }
        else if (this.objPaymentRequest.PaymentMode == PaymentMode.Bank) {
          this.paymentResponse.BankAccountNumber = this.objPaymentRequest.AccountNumber.toString().substring(this.objPaymentRequest.AccountNumber.toString().length - 4);
        }
        else if (this.objPaymentRequest.PaymentMode == PaymentMode.Cheque) {
          this.paymentResponse.ChequeNumber = this.objPaymentRequest.ChequeNumber;
        }
        this.paymentResponse.UpdatedUser = this.objPaymentRequest.UserName;
        this.paymentResponseService.changeResponse(this.paymentResponse);
        this.invoicesContextService.changeResponse(null);
        this.tripContextService.changeResponse(null);
        this.router.navigate(['/tvc/paymentdetails/violation-payment-confirmation']);
      }
    },
      err => {
        $('#pageloader').modal('hide');
        this.showMsg("error", err.statusText);
      });
  }

  cancelClcik(val) {
    if (val == 0) {
      this.showMsg("alert", "Your Information no longer exists, if you cancel your application.<br/>Are you sure you want to Cancel?");

    }
    else {
      let vioContext: any;
      let tripContext: any;
      this.violatorContext.currentContext.subscribe(res => {
        vioContext = res;
      });
      if (vioContext == null || vioContext == undefined) {
        this.tripContextService.currentContext.subscribe(res => {
          tripContext = res;
        });
        if (tripContext != null && tripContext && tripContext.referenceURL.length > 0) {
          this.router.navigate(["/tvc/search/violation-search"]);
        }
        else
          this.router.navigate(["/tvc/search/invoices-search"]);
      }
      else
        this.router.navigate(["/tvc/violatordetails/violator-summary"]);
      this.tripContextService.changeResponse(null);
      this.invoicesContextService.changeResponse(null);
      this.vioPaymentContextService.changeResponse(null);
    }
  }

  userAction(event) {
    if (event) {
      this.cancelClcik(1);
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
