import { User } from './../../shared/models/User';
import { FormGroup, FormControl } from '@angular/forms';
import { element } from 'protractor';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerDetailsService } from './services/customerdetails.service';
import { CommonService } from '../../shared/services/common.service';
import { AccountStatus, BalanceType, TollType, Features, Actions } from '../../shared/constants';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CurrencyPipe } from '@angular/common';
import { AccountInfoComponent } from "../../shared/accountprimaryinfo/account-info.component";
import { IUserEvents } from '../../shared/models/userevents';
import { Router } from '@angular/router';


@Component({
  selector: 'app-nsf-adjustments',
  templateUrl: './nsf-adjustments.component.html',
  styleUrls: ['./nsf-adjustments.component.css']
})
export class NsfAdjustmentsComponent implements OnInit {
  disableSubmitButton: boolean = false;

  longAccountId: number;
  icnId: number;
  customerStatus: string = '';
  customerInformationres: any;
  customerParentPlan: string = '';
  chequePayment: any;
  SystemActivity: any;
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
  systemActivity: any;
  chequeObject: any;
  chequeNumber: number;
 
  chequePaymentId: any;
  paymentId: number = 0;
  boolShowHide: boolean;
  sessionContextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  @ViewChild(AccountInfoComponent) accountSummaryComp;



  constructor(private customerDetailsService: CustomerDetailsService, 
    private commonService: CommonService,
    private sessionContext: SessionService, 
    private customerContext: CustomerContextService,
    private currencyPipe: CurrencyPipe,
    private router: Router) {
    this.sessionContextResponse = this.sessionContext.customerContext;
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

    if(this.icnId == 0){
      this.showErrorMsg('ICN is not assigned to do transactions');
    }
    else{
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.longAccountId = this.customerContextResponse.AccountId;
    }
    this.bindCustomerInfo();
    this.checkRolesandPrivileges();
  }
  }


  checkRolesandPrivileges(){
    this.disableSubmitButton = !this.commonService.isAllowed(Features[Features.CUSTOMERNSFADJUSTMENTS], Actions[Actions.UPDATE], "");
 }

  bindCustomerInfo() {

   //prepare audit log for view.
   let userEvents: IUserEvents;
   userEvents = <IUserEvents>{};
   userEvents.FeatureName = Features[Features.CUSTOMERNSFADJUSTMENTS];
   userEvents.ActionName = Actions[Actions.VIEW];
   userEvents.PageName = this.router.url;
   userEvents.CustomerId = this.longAccountId;
   userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
   userEvents.UserName = this.sessionContextResponse.userName;
   userEvents.LoginId = this.sessionContextResponse.loginId;

    this.customerDetailsService.bindCustomerInfoDetails(this.longAccountId, userEvents).subscribe(
      res => {
        this.customerInformationres = res;
        console.log(this.customerInformationres);
      }, (err) => { }
      , () => {
        if (this.customerInformationres) {
          this.customerStatus = this.customerInformationres.AccountStatus;
          this.customerParentPlan = this.customerInformationres.ParentPlanName;
          //  this.revenueCategory = this.customerInformationres.RevenueCategory;
          this.bindChequePayments();
        }

      }
    )
  }

  bindChequePayments() {
    this.checkPaymentsddl = [];
    this.resetValues();
    this.chequePayment = <any>{};
    this.chequePayment.CustomerId = this.longAccountId;
    if (this.customerStatus.toUpperCase() == AccountStatus[AccountStatus.CO.toString()] || this.customerStatus.toUpperCase() == AccountStatus[AccountStatus.COPD.toString()]) {
      this.chequePayment.BalanceType = BalanceType.CollBal.toString();
    }
    else {
      this.chequePayment.BalanceType = (this.customerParentPlan.toUpperCase() == TollType[TollType.POSTPAID.toString().toUpperCase()]) ? BalanceType[BalanceType.PostBal.toString()] : BalanceType[BalanceType.TollBal.toString()];
    }
    this.SystemActivity = <any>{};
    this.SystemActivity.LoginId = this.UserInputs.LoginId;
    this.SystemActivity.UserId = this.UserInputs.UserId;
    this.chequePayment.SystemActivity = this.SystemActivity;

    this.customerDetailsService.getChequePayments(this.chequePayment).subscribe(
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
          this.nsfAdjustmentForm.patchValue({
            ddlChequePayments:0
          })
          // this.checkPaymentsddl.push(element.ChequeNumber 
          //   + " - " + element.TransactionDate.getMonth().toString()
          //   + " "+ element.TransactionDate.getFullYear().toString() 
          //   + " - " + element.ToltalAmountPaid.toString() , element.PaymentId.ToString())
         // console.log(this.checkPaymentsddl);
        }
        else{
          this.checkPaymentsddl = [];
          this.resetValues();
         // this.errorMessage = "No Check details available to reversals";
        }

      });
  }

  tempNewBalance: number = 0;
  selectedCheque(event) {
    if (event != 0) {
      this.boolShowHide = true;
      let list: string[] = event.split('-');
      this.accountBalance = this.currentBalance;
      this.paymentId = parseInt(list[0].trim())
      this.chequeNumber = parseInt(list[1].trim());
      this.reversalAmount = parseFloat(list[3].trim());

      this.commonService.getApplicationParameterValue(ApplicationParameterkey.NSFFee).
        subscribe(res => {
          if (res) {
            this.nsfFee = res
            if (this.customerParentPlan.toString().toUpperCase() == TollType[TollType.POSTPAID.toString()] && !(this.customerStatus.toString().toUpperCase() == AccountStatus[AccountStatus.CO.toString()] || this.customerStatus.toString().toUpperCase() == AccountStatus[AccountStatus.COPD.toString()])) {
              this.accountBalance = this.currentBalance < 0 ? (-1 * this.currentBalance) : this.currentBalance;
            }
            this.tempNewBalance = (this.customerParentPlan.toString().toUpperCase() == TollType[TollType.POSTPAID.toString()] && this.currentBalance > 0) 
            ? parseFloat(this.accountBalance.toString()) + (parseFloat(list[3].trim()) + parseFloat(this.nsfFee.toString())) 
            : this.accountBalance - (parseFloat(list[3].trim()) + parseFloat(this.nsfFee.toString()))

            if (this.customerParentPlan.toString().toUpperCase() == TollType[TollType.POSTPAID.toString()] && (this.customerStatus.toString().toUpperCase() == AccountStatus[AccountStatus.CO.toString()] || this.customerStatus.toUpperCase() == AccountStatus[AccountStatus.COPD.toString()] && this.currentBalance > 0)) {
              this.tempNewBalance = parseFloat(this.accountBalance.toString()) - (parseFloat(list[3].trim()) + parseFloat(this.nsfFee.toString()));
            }
            this.newBalance = this.tempNewBalance;
          }
        }
        );
    }
    else {
      this.resetValues();
    }
  }

  resetValues() {
    this.chequeNumber = 0;
    this.accountBalance = 0;
    this.reversalAmount = 0;
    this.nsfFee = 0;
    this.newBalance = 0;
    this.boolShowHide = false;
  }

  applyAdjustment() {
   

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CUSTOMERNSFADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longAccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    let boolResult: boolean = false;
    this.adjustmentObject = <any>{};
    this.systemActivity = <any>{};
    this.chequeObject = <any>{};

    this.adjustmentObject.AccountStatus = AccountStatus[this.customerStatus.toUpperCase()]
    this.adjustmentObject.PartialPaymentReason = this.customerParentPlan;
    this.adjustmentObject.TxnAmount = this.reversalAmount;
    this.adjustmentObject.PaymentId = this.paymentId;
    this.adjustmentObject.CustomerId = this.longAccountId;
    this.adjustmentObject.NSFAmount = this.nsfFee;
    this.adjustmentObject.ICNId = this.icnId;
    this.adjustmentObject.UserName = this.UserInputs.UserName;
    this.systemActivity.LoginId = this.UserInputs.LoginId;
    this.systemActivity.User = this.UserInputs.UserName;
    this.systemActivity.CustomerId = this.UserInputs.UserId;
    this.adjustmentObject.SystemActivity = this.systemActivity;
    this.chequeObject.ChequeNumber = this.chequeNumber.toString();
    this.adjustmentObject.ChequePayments = this.chequeObject;
    this.customerDetailsService.insertChequeAdjustment(this.adjustmentObject,userEvents).subscribe(
      res => {
        if (res) {
          this.showSucsMsg('NSF Adjustment has been done successfully');
        }
        else {
          this.showErrorMsg('error while applying the NSF Adjustment');
        }
       // this.resetValues();
       
      }, (err) => {  this.showErrorMsg(err.statusText.toString()); }
       ,()=>{
        this.bindChequePayments();
          //refresh customer info block.
          this.accountSummaryComp.refreshAccountInformation();
          this.accountSummaryComp.refreshPaymentAmountDetails();
          
       } );
  }

 

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }


 setOutputFlag(e) {
    this.msgFlag = e;
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
