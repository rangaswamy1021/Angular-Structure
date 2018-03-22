import { Component, OnInit } from '@angular/core';
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { IAccountSummartRequest } from "./models/accountsummaryrequest";
import { IVehicleResponse } from '../../shared/models/vehicleresponse';
import { ITagRequest } from "./models/TagRequest";
import { ITagResponse } from "../../shared/models/tagresponse";
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { CustomerDetailsService } from "./services/customerdetails.service";
import { IBalanceResponse } from "./models/balanceresponse";
import { IRecentPaymentsResponse } from "./models/recentpaymentsresponse";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { Router } from '@angular/router';
import { IVehicleRequest } from "../../vehicles/models/vehiclecrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { CustomerserviceService } from '../customerservice/services/customerservice.service';
import { Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";

@Component({
  selector: 'app-reopen-accountsummary',
  templateUrl: './reopen-accountsummary.component.html',
  styleUrls: ['./reopen-accountsummary.component.scss']
})
export class ReopenAccountsummaryComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  msgTitle: string;
  vehicle: IVehicleRequest;
  makePaymentRequest: IMakePaymentrequest;
  creditCards: any[];
  accountInfoResponse: IBalanceResponse;
  contactInfoResponse: ICustomerResponse;
  paymentDetailsResponse: IRecentPaymentsResponse;
  customerContext: ICustomerContextResponse;
  customerResponse: ICustomerResponse;
  accountId: number;
  linkSourceName: string = 'internal';
  vehiclesRequest: IAccountSummartRequest;
  vehiclesResponse: IVehicleResponse[];
  tagsRequest: ITagRequest;
  tagsResponse: ITagResponse[];
  accountSummartReq: IAccountSummartRequest;
  sessionContextResponse: IUserresponse;
  reOpenResponse: boolean;
  isDisable: boolean = false;
  manualHold: string = "No";
  rebillType: boolean;
  customerInformationres: ICustomerResponse
  constructor(private customerDetailsService: CustomerDetailsService, private customerContextService: CustomerContextService,
    private router: Router,
    private createAccountService: CreateAccountService, private sessionContext: SessionService,
    private customerServiceService: CustomerserviceService, private commonService: CommonService, ) { }

  ngOnInit() {
    this.customerContextService.currentContext.subscribe(response => { this.customerContext = response; });

    this.sessionContextResponse = this.sessionContext.customerContext;

    if (this.sessionContextResponse.icnId == 0) {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = 'ICN is not assigned to do transactions'
      this.isDisable = true;
    }

    if (this.customerContext && this.customerContext.AccountId > 0) {
      this.accountId = this.customerContext.AccountId;

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.REOPENACCOUNT];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      userEvents.CustomerId = this.accountId;
      this.bindAccountSummaryInformation(userEvents);
      this.isDisable = !this.commonService.isAllowed(Features[Features.REOPENACCOUNT], Actions[Actions.CREATE], '');
    }
  }

  getContactInfo() {
    this.accountSummartReq = <IAccountSummartRequest>{};
    this.accountSummartReq.AccountId = this.accountId;
    this.accountSummartReq.ParentId = this.accountId
    this.customerDetailsService.bindContactInfoBlock(this.accountSummartReq)
      .subscribe(response => {
        this.contactInfoResponse = response;
        if (this.contactInfoResponse.ParentId > 0) {
          this.isDisable = true;
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = 'Secondary Accounts cannot be Reopened'
        }
      });
  }

  bindAccountSummaryInformation(userEvents?: IUserEvents) {
    this.customerDetailsService.bindCustomerInfoDetails(this.accountId, userEvents).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => { }
      , () => {
        this.getContactInfo();
        this.getAccountInfo();
        this.getPaymentDetails();
        this.getVehicles();
        this.getTags();
      });
  }

  getAccountInfo() {
    let isManualHold;
    this.customerDetailsService.getCustomerAllTypesOfBalances(this.accountId)
      .subscribe(response => {
        this.accountInfoResponse = response;
        if (this.accountInfoResponse == null) {
          this.accountInfoResponse = <IBalanceResponse>{};
          this.accountInfoResponse.LastAdjustmentAmount = 0
          this.accountInfoResponse.LastReversalAmount = 0
          this.accountInfoResponse.LastRefundAmount = 0
          this.accountInfoResponse.TollBalance = 0;
          this.accountInfoResponse.TagDepositeBalance = 0
          this.customerDetailsService.bindCustomerInfoDetails(this.accountId)
            .subscribe(res => {
              this.customerResponse = res;
              if (!(this.customerResponse.ParentPlanName.toUpperCase() == "POSTPAID"
                || this.customerResponse.RevenueCategory.toUpperCase() == "NONREVENUE")) {
                this.rebillType = true;
                this.customerServiceService.getCustomerData(this.accountId)
                  .subscribe(res => {
                    if (res != null) {
                      isManualHold = res.IsManualHold;
                      if (isManualHold) {
                        this.manualHold = "Yes";
                      }
                      else {
                        this.manualHold = "No";
                      }
                    }
                    else {
                      this.manualHold = "No";
                    }
                  });
              }
            });
        }
      });
  }

  getPaymentDetails() {
    this.customerDetailsService.getLastPaymentDetails(this.accountId).subscribe(
      res => {
        this.paymentDetailsResponse = res[0];
      }, (err) => {
      }, () => {
        if (this.paymentDetailsResponse.PaymentMode == 'CreditCard') {
          this.paymentDetailsResponse.PaymentMode = 'Credit Card';
        }
        if (this.paymentDetailsResponse.PaymentMode == 'Cheque') {
          this.paymentDetailsResponse.PaymentMode = 'Check';
        }
        if (this.paymentDetailsResponse.PaymentMode == 'MoneyOrder') {
          this.paymentDetailsResponse.PaymentMode = 'Money Order';
        }
        this.customerDetailsService.getCreditCardsByAccountId(this.accountId).subscribe(
          res => {
            this.creditCards = res
          }, (err) => {
          }, () => {
            if (this.creditCards) {
              for (let i = 0; i < this.creditCards.length; i++) {

                if (this.creditCards[i].DefaultFlag) {
                  this.paymentDetailsResponse.PrefixSuffix = 'XXXX_' + this.creditCards[i].prefixsuffix;
                  this.paymentDetailsResponse.ExpDate = this.creditCards[i].ExpDate;;
                  this.paymentDetailsResponse.ExpDate = this.paymentDetailsResponse.ExpDate.toString().substring(4, 6) + '/' + this.paymentDetailsResponse.ExpDate.toString().substring(0, 4);
                  this.paymentDetailsResponse.CardType = this.creditCards[i].CCType;
                  this.paymentDetailsResponse.CCTypeDesc = this.creditCards[i].CCTypeDesc;
                  break;
                }
                else {
                  this.paymentDetailsResponse.PrefixSuffix = "Not Provided";
                  this.paymentDetailsResponse.ExpDate = "Not Provided";
                  this.paymentDetailsResponse.CardType = "Not Provided";
                  this.paymentDetailsResponse.RebillType = "Not Provided";
                }
              }
            }
            else {
              this.paymentDetailsResponse.PrefixSuffix = "Not Provided";
              this.paymentDetailsResponse.ExpDate = "Not Provided";
              this.paymentDetailsResponse.CardType = "Not Provided";
              this.paymentDetailsResponse.RebillType = "Not Provided";
            }
          });
      });
  }

  getVehicles() {
    this.vehiclesRequest = <IAccountSummartRequest>{};
    this.vehiclesRequest.AccountId = this.accountId;
    this.vehiclesRequest.SortColumn = "VEHICLENUMBER";
    this.vehiclesRequest.CurrentDateTime = new Date();
    this.vehiclesRequest.SortDirection = true;
    this.vehiclesRequest.PageSize = 5;
    this.vehiclesRequest.PageNumber = 1;
    this.customerDetailsService.getVehicles(this.vehiclesRequest)
      .subscribe(response => { this.vehiclesResponse = response });
  }

  getTags() {
    this.tagsRequest = <ITagRequest>{};
    this.tagsRequest.CustomerId = this.accountId;
    this.tagsRequest.SortColumn = "SERIALNO";
    this.tagsRequest.CurrentDateTime = new Date();
    this.tagsRequest.SortDirection = true;
    this.tagsRequest.PageSize = 5;
    this.tagsRequest.PageNumber = 1;
    this.tagsRequest.ActivitySource = this.linkSourceName;
    this.customerDetailsService.getTagsByAccount(this.tagsRequest)
      .subscribe(response => { this.tagsResponse = response });
  }

  proceedButtonClick() {
    this.vehicle = <IVehicleRequest>{};
    this.vehicle.AccountId = this.accountId;
    this.vehicle.UserName = this.sessionContextResponse.userName;
    this.customerDetailsService.reOpenAccount(this.vehicle)
      .subscribe(response => { this.reOpenResponse = response; },
      (err) => { },
      () => {
        if (this.reOpenResponse) {
          this.makePaymentRequest = <IMakePaymentrequest>{};
          this.makePaymentRequest.CustomerId = this.accountId;
          this.makePaymentRequest.FeatureName = Features[Features.REOPENACCOUNT];
          this.createAccountService.changeResponse(this.makePaymentRequest);
          let link = ['/csc/customeraccounts/create-account-plan-selection/'];
          this.router.navigate(link);
        }
      });
  }

  backButtonClick() {
    let link = ['/csc/customeraccounts/re-open-account/'];
    this.router.navigate(link);
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
