import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { isSuccess } from '@angular/http/src/http_utils';
import { IPaymentResponse } from './../../payment/models/paymentresponse';
import { PaymentMode } from './../../payment/constants';
import { Router } from '@angular/router';
import { IMakePaymentrequest } from './../../payment/models/makepaymentrequest';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { UnidentifiedPaymentsService } from './services/unidentified-payments.service';
import { Component, OnInit } from '@angular/core';
import { Features, Actions, SubFeatures } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";

declare var $: any;
@Component({
  selector: 'app-verify-unidentified-payment',
  templateUrl: './verify-unidentified-payment.component.html',
  styleUrls: ['./verify-unidentified-payment.component.scss']
})
export class VerifyUnidentifiedPaymentComponent implements OnInit {
  paymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{};
  userId: number = 0;
  loginId: number = 0;
  customerId: number = 0;
  isPayment: boolean;
  paymentMode: string;
  disable: boolean = false;
  paymentResponse: IPaymentResponse;
  lstPaymentResponse: IPaymentResponse[];
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  viewPath: string = "";
  filePath: string = "";
  printPDF: boolean;
  userName: string = '';
  constructor(private customerAccountService: CustomerAccountsService, private unidentifiedService: UnidentifiedPaymentsService, private router: Router, private sessionContext: SessionService) { }
  sessionContextResponse: IUserresponse;

  ngOnInit() {
    this.disable = false;
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.unidentifiedService.currentContext.subscribe(context => {
      this.paymentRequest = context;
      if (this.paymentRequest != null) {
        this.isPayment = this.paymentRequest.IsPayment;
        this.customerId = this.paymentRequest.CustomerId;
        this.userId = this.paymentRequest.UserId;
        this.loginId = this.paymentRequest.LoginId;
        this.userName = this.paymentRequest.UserName;
        if (this.paymentRequest.PaymentMode != null)
          this.paymentMode = PaymentMode[this.paymentRequest.PaymentMode].toUpperCase();
        if (this.paymentMode == 'CHEQUE')
          this.paymentMode = 'Check';
        else
          this.paymentMode = 'MoneyOrder';
      }
    })
  }
  makePayment() {
    //let responsevalue: boolean;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.PAYMENT];
    this.userEventsCalling(userEvents);
    this.disable = true;
    if (this.paymentRequest.TxnAmount > 0) {
      $('#pageloader').modal('show');
      this.customerAccountService.makeAnonymousPayment(this.paymentRequest, userEvents).subscribe(res => {
        this.paymentResponse = res;
        if (this.paymentResponse) {
          this.unidentifiedService.changeResponse(null);
          this.customerAccountService.setResponseValue(this.paymentResponse);
          this.successMessageBlock("Unidentified payment has been done successfully.");
        }
        else {
          this.errorMessageBlock("Error while doing Unidentified payments");
          return;
        }
        $('#pageloader').modal('hide');
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
          $('#pageloader').modal('hide');
          return;
        },
        () => {
        });
    }
    else {
      this.errorMessageBlock("Invalid amount");
      return;
    }
  }
  cancelPayment(): void {
    this.router.navigate(['csc/customeraccounts/unidentified-payments']);
  }

  paymentPrevious(): void {
    this.router.navigate(['csc/customeraccounts/unidentified-payments']);
  }

  transferPayment() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.TRANSFER];
    this.userEventsCalling(userEvents);
    this.disable = true;
    if (this.paymentRequest.TxnAmount > 0) {
      $('#pageloader').modal('show');
      this.customerAccountService.transferAnonymousPayments(this.paymentRequest, userEvents).subscribe(res => {
        this.paymentResponse = res;
        if (this.paymentResponse) {
          this.unidentifiedService.changeResponse(null);
          this.customerAccountService.setResponseValue(this.paymentResponse);
          this.userId = this.sessionContextResponse.userId;
          let items = [];
          this.paymentResponse = this.customerAccountService.getResponseValue();
          items.push(this.paymentResponse);
          this.lstPaymentResponse = items.map(x => Object.assign({}, x));;
          // var strViewPath: string;
          this.generatePaymentReciept();
          this.successMessageBlock("Unidentified payment has been done successfully.");
          $('#pageloader').modal('hide');
        }
        else {
          this.errorMessageBlock("Error while doing Unidentified payments");
          $('#pageloader').modal('hide');
          return;
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
          $('#pageloader').modal('hide');
          return;
        },
        () => {
        });
    }
  }

  cancelTransfer(): void {
    this.router.navigate(['csc/customeraccounts/unidentified-payments']);
  }

  generatePaymentReciept() {
    this.customerAccountService.generatePaymentReciept(this.lstPaymentResponse, this.userId, this.loginId).subscribe(res => {
      if (res) {
        this.viewPath = res[0];
        this.filePath = res[1];
        this.printPDF = true;
      }
      else {
        this.printPDF = false;
      }
    });
  }

  transferPrevious(): void {
    this.router.navigate(['csc/customeraccounts/unidentified-payments']);
  }
  clickToNavigatePayment(): void {
    this.router.navigate(['csc/customeraccounts/unidentified-payments']);
  }

  printReciept() {
    window.open(this.viewPath + this.filePath);
  }
  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.UNIDENTIFIEDPAYMENTS];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.userName;
    userEvents.LoginId = this.loginId;
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}
