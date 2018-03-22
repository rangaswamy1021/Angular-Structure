import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { SessionService } from "../../shared/services/session.service";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { PaymentDetailService } from "./services/paymentdetails.service";
import { BalanceType, Features, Actions, SubSystem } from "../../shared/constants";
import { CurrencyPipe } from "@angular/common";
import { Router } from '@angular/router';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-nsf-check-details',
  templateUrl: './nsf-check-details.component.html',
  styleUrls: ['./nsf-check-details.component.scss']
})
export class NsfCheckDetailsComponent implements OnInit {
  maxReversalDays: number;
  longAccountId: number;
  icnId: number;
  chequePayment: any;
  systemActivity: any;
  UserInputs: IAddUserInputs = <IAddUserInputs>{};
  paymentResponse: any[];
  currentBalance: number;
  checkPaymentsddl: any[] = [];
  nsfAdjustmentForm: FormGroup;
  accountBalance: number = 0;
  reversalAmount: number = 0;
  nsfFee: number = 0;
  newBalance: number = 0;
  adjustmentObject: any;
  chequeObject: any;
  chequeNumber: number;
  chequePaymentId: any;
  paymentId: number = 0;
  boolShowHide: boolean;
  sessionContextResponse: IUserresponse;
  violatorContextResponse: IViolatorContextResponse;
  isValueSelected: boolean = false;
  paymentFor: string;
  PaymentDate: Date;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  isDisabledSubmit: boolean = false;
  constructor(private router: Router, private currencyPipe: CurrencyPipe, private paymentDetailService: PaymentDetailService, private commonService: CommonService,
    private sessionContext: SessionService, private violatorContext: ViolatorContextService) { 

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    //login user inputs
    this.UserInputs.LoginId = this.sessionContextResponse.loginId;
    this.UserInputs.UserId = this.sessionContextResponse.userId;
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.UserInputs.AccountId = this.sessionContextResponse.userId;
    this.icnId = this.sessionContextResponse.icnId;
  }

  ngOnInit() {

    this.nsfAdjustmentForm = new FormGroup({
      'ddlChequePayments': new FormControl('')
    });


    if (this.icnId == 0) {
      this.showMsg("error", "ICN is not assigned to do transactions");
    }
    else {
      this.violatorContext.currentContext
        .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
        );
      if (this.violatorContextResponse.accountId > 0) {
        this.longAccountId = this.violatorContextResponse.accountId;
      }

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIOLATORNSFADJUSTMENTS];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.UserInputs.AccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.NSFFee, userEvents).
        subscribe(res => {
          if (res) {
            this.nsfFee = res
          }
        });
      this.bindChequePayments();
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxReversalDays).subscribe(res => this.maxReversalDays = res);
    }
    this.isDisabledSubmit = !this.commonService.isAllowed(Features[Features.VIOLATORNSFADJUSTMENTS], Actions[Actions.UPDATE], "");
  }

  bindChequePayments() {

    this.chequePayment = <any>{};
    this.chequePayment.CustomerId = this.longAccountId;
    this.chequePayment.BalanceType = BalanceType[BalanceType.VioBal].toString();

    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.UserInputs.LoginId;
    this.systemActivity.UserId = this.UserInputs.UserId;
    this.systemActivity.LoginId = this.UserInputs.LoginId;
    this.systemActivity.SubSystem = SubSystem[SubSystem.TVC];
    this.chequePayment.SystemActivity = this.systemActivity;
    this.checkPaymentsddl = [];
    this.resetValues();
    this.nsfAdjustmentForm.controls["ddlChequePayments"].setValue("");
    this.paymentDetailService.getChequePayments(this.chequePayment).subscribe(
      res => {
        this.paymentResponse = res;
        if (this.paymentResponse.length > 0) {
          this.currentBalance = this.paymentResponse[0].ThresholdAmount;
          this.paymentResponse.forEach(element => {
            this.chequePaymentId = { name: '', id: 0 }
            element.TransactionDate = formatDate(new Date(element.TransactionDate));
            this.chequePaymentId.name = element.ChequeNumber + " - " + element.TransactionDate.toString()
              + " - " + this.currencyPipe.transform(element.ToltalAmountPaid.toString(), 'USD', true, '1.2-2');
            this.chequePaymentId.id = element.PaymentId + " - " + element.ChequeNumber + " - " + element.TransactionDate.toString()
              + " - " + element.ToltalAmountPaid.toString();
            this.checkPaymentsddl.push(this.chequePaymentId)
          })
        }
        else {
          this.checkPaymentsddl = [];
          this.resetValues();
        }
      });
  }

  tempNewBalance: number = 0;
  selectedCheque(event) {
    console.log(event)
    if (event != '') {
      this.isValueSelected = true;
      this.boolShowHide = true;
      let list: string[] = event.split('-');
      this.accountBalance = this.currentBalance;
      this.paymentId = parseInt(list[0].trim())
      this.chequeNumber = parseInt(list[1].trim());
      this.reversalAmount = parseFloat(list[3].trim());
      this.tempNewBalance = parseFloat(this.currentBalance.toString()) + (parseFloat(list[3].trim()) + parseFloat(this.nsfFee.toString()));
      this.newBalance = this.tempNewBalance;

      let paymnetObj = this.paymentResponse.filter(x => x.PaymentId = this.paymentId)[0];
      this.paymentFor = paymnetObj.PaymentFor;
      this.PaymentDate = paymnetObj.PaymentDate;
    }
    else {
      this.resetValues();
    }
  }

  cancelClick() {
    this.resetValues();
    this.nsfAdjustmentForm.controls["ddlChequePayments"].setValue("");
  }

  resetValues() {
    this.chequeNumber = 0;
    this.accountBalance = 0;
    this.reversalAmount = 0;
    this.isValueSelected = false;
    this.newBalance = 0;
    this.boolShowHide = false;
    this.paymentFor = "";
  }

  applyAdjustment() {

    let date: Date = new Date(this.PaymentDate);
    let daysDiff = new Date().getDate() - date.getDate();
    if (daysDiff > this.maxReversalDays) {
      this.showMsg("error", "After " + this.maxReversalDays + " days Nsf Reversal cannot be done.");
      return;
    }
    $('#pageloader').modal('show');
    this.chequeObject = <any>{};
    this.adjustmentObject = <any>{};
    this.adjustmentObject.CustomerId = this.longAccountId;
    this.adjustmentObject.IntiatedBy = this.UserInputs.UserName;
    this.adjustmentObject.LoggedUserId = this.UserInputs.UserId;
    this.adjustmentObject.ICNId = this.icnId;
    this.adjustmentObject.PaymentId = this.paymentId;
    this.adjustmentObject.Description = "NSFReversal";
    this.adjustmentObject.UserName = this.UserInputs.UserName;
    this.adjustmentObject.TxnAmount = this.reversalAmount;
    this.adjustmentObject.PaymentFor = this.paymentFor;
    this.adjustmentObject.NSFAmount = this.nsfFee;
    this.chequeObject.ChequeNumber = this.chequeNumber.toString();
    this.adjustmentObject.ChequePayments = this.chequeObject;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORNSFADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.UserInputs.AccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.paymentDetailService.doNSFPaymentReversal(this.adjustmentObject, userEvents).subscribe(
      res => {
        if (res) {
          let paymentResponse = res;
          if (paymentResponse && paymentResponse.VoucherNo != undefined && paymentResponse.VoucherNo != "") {
            this.showMsg("success", "NSF Adjustment has been done successfully");
          }
          else {
            this.showMsg("error", "error while applying the NSF Adjustment");
          }
          $('#pageloader').modal('hide');
          this.bindChequePayments();
        }
      }, (err) => {
        this.showMsg("error", err.statusText);
      });
  }

  exitClick() {
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  backClick() {
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
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

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return monthNames[monthIndex] + ' ' + day + ' ' + year;
}



export interface IAddUserInputs {
  UserName: string
  LoginId: number
  UserId: number
  AccountId: number
}

