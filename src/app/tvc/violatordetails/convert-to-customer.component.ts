import { DisputesService } from '../disputes/services/disputes.service';
import { Component, OnInit } from '@angular/core';
import { IUserresponse } from "../../shared/models/userresponse";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { SessionService } from "../../shared/services/session.service";
import { ViolatordetailsService } from "./services/violatordetails.service";
import { IBalanceResponse } from "./models/balancesresponse";
import { IBalanceRequest } from "./models/balancerequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { CurrencyPipe } from "@angular/common";
import { Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
@Component({
  selector: 'app-convert-to-customer',
  templateUrl: './convert-to-customer.component.html',
  styleUrls: ['./convert-to-customer.component.scss']
})
export class ConvertToCustomerComponent implements OnInit {
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  vioalatorId: number;
  statusMessage: string;
  isPayment: boolean;
  isConvert: boolean;
  isEmiDue: boolean;
  customerAccountStatus: string;
  accountResponse: ICustomerResponse;
  convertCustomer: FormGroup;
  overPayment: number;
  outStanding: number;
  emiDue: number;
  isOutstandingInvoice: any;
  vehicleId: number;
  vioDepBal: IBalanceRequest;
  getViolatorBalanceResponse: IBalanceResponse;
  getVioDepBalanceResponse: IBalanceResponse;
  sessionContextResponse: IUserresponse;
  violatorContext: IViolatorContextResponse;
  stolenAccount: number;
  constructor(private commonService: CommonService, private currencyPipe: CurrencyPipe, private sessionContext: SessionService, private violatorContextService: ViolatorContextService,
    private violatorDetailsService: ViolatordetailsService, private createAccountService: CreateAccountService, private router: Router, private disputesService: DisputesService) { }

  ngOnInit() {

    this.convertCustomer = new FormGroup({
      'makePayment': new FormControl('', ),
      'convertToCustomer': new FormControl('', )
    });
    this.violatorContextService.currentContext
      .subscribe(violatorContext => {
        this.violatorContext = violatorContext;
        this.vioalatorId = this.violatorContext.accountId;
      }
      );

    this.disputesService.getStolenAccount().subscribe(
      resStolen => {
        this.stolenAccount = resStolen;
      });

    this.sessionContextResponse = this.sessionContext.customerContext;
    this.getViolatorBalances();
    this.getViolationDepositBalance();
    this.getOutstandingInvoices();
    if (!this.commonService.isAllowed(Features[Features.CONVERTTOCUSTOMERFROMVIOLATOR], Actions[Actions.VIEW], "")) {
      //error page;
    }
    this.isConvert = !this.commonService.isAllowed(Features[Features.CONVERTTOCUSTOMERFROMVIOLATOR], Actions[Actions.CONVERT], "");
  }

  getViolatorBalances() {
    this.violatorDetailsService.getViolatorBalances(this.violatorContext.accountId).subscribe(res => {
      this.getViolatorBalanceResponse = res;
      if (this.getViolatorBalanceResponse.ViolationBalance <= 0 && this.getViolatorBalanceResponse.EMIBalance > 0) {
        this.isEmiDue = true;
        this.isConvert = true;
        this.statusMessage = "Clear the amount before converting this account to customer";
        this.emiDue = this.getViolatorBalanceResponse.EMIBalance;
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Your EMI due amount is:' + this.currencyPipe.transform(this.emiDue.toString(), 'USD', true, '1.2-2') + this.statusMessage;
      }
      else if (this.getViolatorBalanceResponse.EMIBalance <= 0 && this.getViolatorBalanceResponse.ViolationBalance > 0) {
        this.isConvert = true;
        this.outStanding = this.getViolatorBalanceResponse.ViolationBalance;
        this.statusMessage = "Pay the amount before converting this account to customer";
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Your outstanding amount is:' + this.currencyPipe.transform(this.outStanding.toString(), 'USD', true, '1.2-2') + '.' + this.statusMessage;
      }
      else if (this.getViolatorBalanceResponse.EMIBalance > 0 && this.getViolatorBalanceResponse.ViolationBalance > 0) {
        this.isConvert = true;
        this.isEmiDue = true;
        this.statusMessage = "Pay the amount before converting this account to customer";
        this.outStanding = this.getViolatorBalanceResponse.ViolationBalance;
        this.emiDue = this.getViolatorBalanceResponse.EMIBalance;
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Your outstanding amount is:' + this.currencyPipe.transform(this.outStanding.toString(), 'USD', true, '1.2-2') + ' ' + 'and your EMI due amount is:' + this.currencyPipe.transform(this.emiDue.toString(), 'USD', true, '1.2-2') + this.statusMessage;
      }
      else {
        this.outStanding = 0;
      }
      // if (this.outStanding == 0) {
      //   this.getAccountDetailsById(); 
      // }
    })
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  getViolationDepositBalance() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CONVERTTOCUSTOMERFROMVIOLATOR];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.vioDepBal = <IBalanceRequest>{};
    this.vioDepBal.CustomerId = this.violatorContext.accountId;
    this.vioDepBal.BalanceType = "VioDepBal";
    this.violatorDetailsService.getVioDepBalance(this.vioDepBal, userEvents).subscribe(res => {
      if (res) {
        this.getVioDepBalanceResponse = res;
        this.overPayment = this.getVioDepBalanceResponse.ViolationDepositBalance;
      }
    }, (err) => {
      this.overPayment = 0;
    });
  }
  getOutstandingInvoices() {
    this.vehicleId = 0;
    this.violatorDetailsService.getOutstandingInvoices(this.violatorContext.accountId, this.vehicleId).subscribe(res => {
      this.isOutstandingInvoice = res;
    })
  }
  getAccountDetailsById() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CONVERTTOCUSTOMERFROMVIOLATOR];
    userEvents.ActionName = Actions[Actions.CONVERT];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.violatorDetailsService.getAccountDetailsById(this.violatorContext.accountId, userEvents).subscribe(res => {
      this.accountResponse = res;
      this.customerAccountStatus = this.accountResponse.CustomerStatus;
      if (this.customerAccountStatus == 'C') {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'This account is already registered as Customer';
        this.isConvert = true;
        this.isPayment = true;
      }
      else {
        this.isConvert = false;
        this.router.navigate(['csc/customeraccounts/create-account-personal-information'],
          {
            queryParams: {
              customerId: this.violatorContext.accountId
            }
          });
      }
    });
  }
  makePayment() {
    if (this.isOutstandingInvoice != null && this.isOutstandingInvoice.length > 0) {
      let link = ['/tvc/paymentdetails/violation-payment'];
      this.router.navigate(link);
    }
    else {
      let link = ['/tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
    }
  }

  convertToCustomer() {
    if (this.vioalatorId == this.stolenAccount) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = "Temporary account can't be converted to customer";
    } else {
      this.getAccountDetailsById();
    }
  }

  back() {
    this.router.navigate(["/tvc/violatordetails/violator-summary"]);
  }

  exit() {
    this.violatorContextService.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }
}
