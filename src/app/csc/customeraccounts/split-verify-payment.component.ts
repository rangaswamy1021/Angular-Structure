import { SessionService } from './../../shared/services/session.service';
import { SubFeatures, Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { HttpService } from './../../shared/services/http.service';
import { Router } from '@angular/router';
import { CreditCardInformationComponent } from './../../payment/credit-card-information.component';
import { BalanceTransfer } from './split-payment.component';
import { PaymentMode } from './../../payment/constants';
import { ISplitRequest } from './models/splitrequest';
import { SplitCustomerService } from './services/splitcustomer.service';
import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Features } from '../../shared/constants';

declare var $: any;
@Component({
  selector: 'app-split-verify-payment',
  templateUrl: './split-verify-payment.component.html',
  styleUrls: ['./split-verify-payment.component.scss']
})
export class SplitVerifyPaymentComponent implements OnInit {
  splitReq: ISplitRequest;
  creditCard: string;
  serviceTax: string;
  balTran: string;
  amntToPay: string;
  sixcTags: string;
  isBalTran: boolean;
  bankAccNum: string;
  isCreditCard: boolean = false;
  isBankPayment: boolean = false;
  isChequePayment: boolean = false;
  isMoPayment: boolean = false;
  //tmpRes: ISplitRequest;  
  failureMessage: string
  successMessage: string;
  ccTax: string;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  fee: fees[] = [];
  fees: fees;
  displayFees: boolean = false;
  constructor(private splitService: SplitCustomerService, private router: Router, private http: HttpService, public renderer: Renderer, private sessionService: SessionService) { }

  ngOnInit() {
    this.splitReq = this.splitService.splitContext();
    console.log(this.splitReq);
    this.bindFeesBasedOnPlanId(this.splitReq.CustAttrib.PlanId);
    if (this.splitReq.Payment.CreditCardPayment != null && this.splitReq.Payment.CreditCardPayment != undefined) {
      this.isCreditCard = true;
      this.creditCard = "XXXX_" + this.splitReq.Payment.CreditCardPayment.CreditCardNumber.toString().substring(12);
      this.splitService.getServiceTax().subscribe(res => {
        this.splitReq.Payment.CreditCardServiceTax = parseFloat(res);
        this.ccTax = ((this.splitReq.payingAmount / 100) * this.splitReq.Payment.CreditCardServiceTax).toString();
        this.ccTax = parseFloat(this.ccTax).toFixed(2);
        this.splitReq.Payment.CreditCardServiceTax = parseFloat(this.ccTax);
        this.splitReq.payingAmount += this.splitReq.Payment.CreditCardServiceTax;
        ///((this.splitReq.payingAmount / 100) * this.splitReq.Payment.CreditCardServiceTax);
        this.splitReq.payingAmount = parseFloat(this.splitReq.payingAmount.toFixed(2));
      });
    }
    else if (this.splitReq.Payment.BankName != null) {
      this.isBankPayment = true;
      this.bankAccNum = this.splitReq.Payment.AccountNumber;
      //this.bankAccNum = "XXXX_"+ (parseInt(this.bankAccNum)/1000).toString();
    }
    else if (this.splitReq.Payment.ChequeNumber != null) {
      this.isChequePayment = true;
    }
    else if (this.splitReq.Payment.MONumber != null) {
      this.isMoPayment = true;
    }

    this.isBalTran = this.splitReq.isBalTran;
  }

  goBack() {
    const link = ['/csc/customeraccounts/split-payment/'];
    this.router.navigate(link);
  }
  cancelPayment() {
    let link = ['/csc/customeraccounts/split-account/'];
    this.router.navigate(link);
  }

  bindFeesBasedOnPlanId(id) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.splitReq.CustInfo.AccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.splitService.getFeesByPlanId(id, userEvents).subscribe(
      res => {
        this.fee = res;
        if (this.fee.length > 0) {
          this.displayFees = true;
          this.fees = this.fee[0];
        }
      }
    );
  }

  makePayment() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.splitReq.CustInfo.AccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;
    $('#pageloader').modal('show');
    this.splitService.createXML(this.splitReq, userEvents).subscribe(ress => {
      if (ress) {
        // this.tmpRes = ress;
        this.splitReq.ReferenceNo = ress.VoucherNo;
        this.splitReq.TxnDateTime = ress.TransactionDate;
        this.splitReq.NewAccountId = ress.CustomerId;
        this.splitService.changeResponse(this.splitReq);
        this.splitService.changeSplitResponse(ress);
        console.log(this.splitService);
        this.router.navigate(['/csc/customeraccounts/split-thank-you/']);
      }
    }, err => {
      console.log(err);
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText;
      this.msgTitle = '';
    }
    );
    $('#pageloader').modal('hide');
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

export interface fees {
  FeeName: string;
  Amount: number;
}
