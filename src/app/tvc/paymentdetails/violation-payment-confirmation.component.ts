import { Component, OnInit, ViewChild } from '@angular/core';
import { PaymentResponseService } from "../../shared/services/payment.response.service";
import { IPaymentResponse } from "../../payment/models/paymentresponse";
import { PaymentDetailService } from "./services/paymentdetails.service";
import { PaymentContextService } from "./services/payment.context.service";
import { IViolationPaymentrequest } from "../../payment/models/violationpaymentrequest";
import { PaymentMode, CreditCardType } from "../../payment/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { InvoicesContextService } from "../../shared/services/invoices.context.service";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IUserEvents } from '../../shared/models/userevents';
import { Features, Actions } from '../../shared/constants';
import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-violation-payment-confirmation',
  templateUrl: './violation-payment-confirmation.component.html',
  styleUrls: ['./violation-payment-confirmation.component.scss']
})
export class ViolationPaymentConfirmationComponent implements OnInit {
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  paymentReceiptPath: string;
  paymentmode: string;
  ccMode: string;
  sessionContextResponse: IUserresponse;
  accountId: number;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disableReceipt: boolean = true;
  constructor(private violatorContext: ViolatorContextService, private router: Router, private sessionService: SessionService, private paymentResponseService: PaymentResponseService,
    private paymentDetailService: PaymentDetailService, private vioPaymentContextService: PaymentContextService, private commonService: CommonService) { }

  ngOnInit() {

    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.paymentResponseService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.VoucherNo == '' || customerContext.VoucherNo == undefined) {
          //let link = ['/csc/customerAccounts/create-account/'];
          //this.router.navigate(link);
        }
        else {
          this.paymentResponse = customerContext;
        }
      });

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    if (this.paymentResponse.ViolationProcess == "PaymentPlan") {
      userEvents.FeatureName = Features[Features.PAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.CREATE];
    } else if (this.paymentResponse.ViolationProcess == "TermPayment") {
      userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.PAYMENT];
    }
    else {
      userEvents.FeatureName = Features[Features.TVCPAYMENT];  // Violation Make Payment need to take care
      userEvents.ActionName = this.getAction(this.paymentResponse.PaymentMode);
    }

    userEvents.SubFeatureName = "";
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.paymentResponse.CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });

    this.accountId = this.paymentResponse.CustomerId;
    this.ccMode = CreditCardType[this.paymentResponse.CardType];
    if (this.paymentResponse.PaymentMode == PaymentMode.Cheque)
      this.paymentmode = "Check";
    else if (this.paymentResponse.PaymentMode == PaymentMode.MoneyOrder)
      this.paymentmode = "Money Order";
    else if (this.paymentResponse.PaymentMode == PaymentMode.CreditCard)
      this.paymentmode = "Credit Card";
    else
      this.paymentmode = PaymentMode[this.paymentResponse.PaymentMode];
    this.paymentDetailService.generatePaymentReciept(this.paymentResponse, this.sessionContextResponse.userId, this.sessionContextResponse.loginId).subscribe(res => {
      if (res) {
        this.disableReceipt = false;
        this.paymentReceiptPath = res;
        this.vioPaymentContextService.changeResponse(null);
        this.paymentResponseService.changeResponse(null);
      }
    });

    this.showMsg("success", "Payment has been done successfully");
  }

  ShowReceipt() {
    window.open(this.paymentReceiptPath);
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

  backClick() {
    let vioContext: any;
    this.violatorContext.currentContext.subscribe(res => {
      vioContext = res;
    });
    if (vioContext == null || vioContext == undefined)
      this.router.navigate(["/tvc/search/violation-search"]);
    else
      this.router.navigate(["/tvc/violatordetails/violator-summary"]);
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
