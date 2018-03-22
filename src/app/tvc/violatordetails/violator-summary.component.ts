import { InvoiceService } from '../../invoices/services/invoices.service';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from '../../shared/models/userevents';
import { RefundContextService } from '../../refunds/services/RefundContextService';
import { IRefundProcess } from '../../refunds/models/RefundProcess';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PaymentMode } from '../../payment/constants';
import { IRefundQueue } from '../../refunds/models/RefundQueue';
import { RefundService } from '../../refunds/services/refund.service';
import { IRefundRequest } from '../../refunds/models/RefundRequest';
import { read } from 'fs';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { Router } from '@angular/router';
import { CustomerDetailsService } from '../../csc/customerdetails/services/customerdetails.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { Actions, ActivitySource, Features, SubSystem, defaultCulture } from '../../shared/constants';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IAccountSummartRequest } from '../../csc/customerdetails/models/accountsummaryrequest';
import { Component, OnInit, OnChanges } from '@angular/core';
import { ViolationSearchService } from '../search/services/violation-search.service';
import { ViolatorSearchContextService } from "../search/services/violation-search-context.service";
import { IViolatorSearchContextResponse } from "../search/models/violatorSearchContextresponse";
import { LoginService } from "../../login/services/login.service";
import { DisputesService } from '../disputes/services/disputes.service';
import { IAffidavitRequest } from '../disputes/models/affidavitrequest';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-violator-summary',
  templateUrl: './violator-summary.component.html',
  styleUrls: ['./violator-summary.component.scss']
})

export class ViolatorSummaryComponent implements OnInit {
  pageIndex: number;

  longAccountId: number = 0;
  accountSummartReq: any;
  systemActivities: ISystemActivities;
  activityRes: any[];
  vehicleRes: any[];
  invoicesRes: any[];
  bsRangeValue: Date;
  parkingTripsRes: any[];
  ferryTripsRes: any[];
  transitTripsRes: any[];
  violationResponse: any[];
  contactDetailsRes: any;
  balanceRes: any;
  paymentdetailsRes: any;
  paymentPLanRes: any;
  viewPath: string;
  sessionContextResponse: IUserresponse;
  violatorContextResponse: IViolatorContextResponse;
  refundRequest: any = <any>{};
  refundQueue: IRefundQueue;
  refundFrom: FormGroup;
  violatorSearchContext: IViolatorSearchContextResponse;
  iRefundProcess: IRefundProcess[] = <IRefundProcess[]>[];
  manualHoldRequest: any;
  manualholddays: number;
  isDisableAccHoldLnk: boolean = false;
  isDisableAccHoldRevLnk: boolean = false;
  isDisableRefundLink: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disputeCount:number=0;
  affidavitRequest: IAffidavitRequest;


  constructor(private violatorDetailsService: ViolatordetailsService,
    private customerDetailsService: CustomerDetailsService,
    private router: Router,
    private violatorContext: ViolatorContextService,
    private sessionContext: SessionService,
    private refundService: RefundService,
    private violatorSearchContextService: ViolatorSearchContextService,
    private loginService: LoginService,
    private refundContextService: RefundContextService,
    private commonService: CommonService,
    private disputeService: DisputesService,
    private invoiceService: InvoiceService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {

    this.sessionContextResponse = this.sessionContext.customerContext;

    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longAccountId = this.violatorContextResponse.accountId;
      this.pageIndex = this.violatorContextResponse.pageIndex;
    }

    this.refundFrom = new FormGroup({
      'refundAmount': new FormControl('', [Validators.required]),
    });

    //User Events
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONSUMMARY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longAccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    !this.commonService.isAllowed(Features[Features.VIOLATIONSUMMARY], Actions[Actions.VIEW], "");
    this.isDisableAccHoldLnk = !this.commonService.isAllowed(Features[Features.VIOLATIONSUMMARY], Actions[Actions.ACCOUNTHOLD], "");
    this.isDisableAccHoldRevLnk = !this.commonService.isAllowed(Features[Features.VIOLATIONSUMMARY], Actions[Actions.ACCOUNTHOLDREMOVE], "");
    this.isDisableRefundLink = !this.commonService.isAllowed(Features[Features.VIOLATIONSUMMARY], Actions[Actions.ADMINHEARINGREQUEST], "");

    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    this.bsRangeValue = new Date(Number(strDateRange[2]) - 5, Number(strDateRange[0]), Number(strDateRange[1]));
    this.getDocumentPath();
    this.getActivities(userEvents);
    this.getVehicles();
    this.getInvoices();
    this.getCustomerViolations();
    this.getTransactionsByCode('PARKING');
    this.getTransactionsByCode('FERRY');
    this.getTransactionsByCode('TRANSIT');
    this.getCustomerDefaultDetails();
    this.getViolatorBillDetails();
    this.getPaymentPlan();
    this.getViolationAmountDetails();
    this.getManualHoldDays();
    this.getDisputeDetails();
    window.scrollTo(0, 0);
  }

  getDisputeDetails() {
    this.affidavitRequest = <IAffidavitRequest>{};
    this.affidavitRequest.DisputeStatus = "DISPUTEREQUESTED";
    this.affidavitRequest.AffidavitId = 0;
     this.affidavitRequest.FromCustomerId = this.longAccountId;
    this.disputeService.getDisputeDetails(this.affidavitRequest).subscribe(res => {
      let disputeDetails = res;
      if (disputeDetails && disputeDetails.length > 0) {
        this.disputeCount = disputeDetails.length;
      }
    });
  }

  getManualHoldDays() {
    this.customerDetailsService.getApplicationParameterValueByParameterKey("ManualHoldDays").subscribe(
      res => {
        this.manualholddays = res;
      });
  }

  getCustomerDefaultDetails() {
    this.violatorDetailsService.getCustomerDefaultDetails(this.longAccountId)
      .subscribe(res => {
        this.contactDetailsRes = res;
      });
  }

  getViolatorBillDetails() {
    this.violatorDetailsService.getViolatorBillDetails(this.longAccountId)
      .subscribe(res => {
        this.balanceRes = res;
        if (this.balanceRes) {
          if (this.balanceRes.LastPaymentMethod.toUpperCase() == "CHEQUE") {
            this.balanceRes.LastPaymentMethod = "Check";
          }
        }
      });
  }

  getPaymentPlan() {
    this.violatorDetailsService.getPaymentPlan(this.longAccountId)
      .subscribe(res => {
        this.paymentPLanRes = res;
      });
  }

  getViolationAmountDetails() {
    this.violatorDetailsService.getViolationAmountDetails(this.longAccountId)
      .subscribe(res => {
        this.paymentdetailsRes = res;
      });
  }

  getActivities(userEvents?: IUserEvents) {
    this.accountSummartReq = <any>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.accountSummartReq.SystemActivities = this.systemActivities;
    this.accountSummartReq.PerformedBy = this.sessionContextResponse.userName;
    this.accountSummartReq.CustomerId = this.longAccountId;
    this.accountSummartReq.Type = '';
    this.accountSummartReq.Subsystem = SubSystem[SubSystem.TVC];
    this.accountSummartReq.StartDate = this.bsRangeValue;
    this.accountSummartReq.EndDate = new Date();
    this.accountSummartReq.Linkid = 0;
    this.accountSummartReq.PageNumber = 1;
    this.accountSummartReq.PageSize = 5;
    this.accountSummartReq.SortDir = 1;
    this.accountSummartReq.SortColumn = "ACTIVITYDATE";
    this.accountSummartReq.IsSearchEventFired = false;
    this.violatorDetailsService.getActivitiesForViolator(this.accountSummartReq, userEvents)
      .subscribe(res => {
        this.activityRes = res
      });
  }

  getVehicles() {
    this.accountSummartReq = <IAccountSummartRequest>{};
    this.accountSummartReq.AccountId = this.longAccountId;
    this.accountSummartReq.SortColumn = "VEHICLENUMBER";
    this.accountSummartReq.CurrentDateTime = new Date();
    this.accountSummartReq.SortDirection = true;
    this.accountSummartReq.PageSize = 5;
    this.accountSummartReq.PageNumber = 1;
    this.customerDetailsService.getVehicles(this.accountSummartReq)
      .subscribe(res => {
        this.vehicleRes = res
      });
  }

  getCustomerViolations() {
    this.accountSummartReq.ViolatorId = this.longAccountId;
    this.accountSummartReq.StartDate = this.bsRangeValue;
    this.accountSummartReq.EndDate = new Date();
    this.accountSummartReq.TripId = 0;
    this.accountSummartReq.VehicleNumber = '';
    this.accountSummartReq.StatusCode = '';
    this.accountSummartReq.PageNumber = 1;
    this.accountSummartReq.SortDirection = 1;
    this.accountSummartReq.SortColumn = "CITATIONID";
    this.accountSummartReq.PageSize = 5;
    this.accountSummartReq.UserId = this.sessionContextResponse.userId;
    this.accountSummartReq.LoginId = this.sessionContextResponse.loginId;
    this.accountSummartReq.UserName = this.sessionContextResponse.userName;
    this.accountSummartReq.IsPageLoad = true;
    this.accountSummartReq.TransactionTypeCode = "TOLL";
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.accountSummartReq.SystemActivity = this.systemActivities;
    this.violatorDetailsService.violatorTripsSearch(this.accountSummartReq).subscribe(res => {
      this.violationResponse = res;
    });
  }

  getInvoices() {
    this.accountSummartReq = <any>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.accountSummartReq.SystemActivity = this.systemActivities;
    this.accountSummartReq.CustomerId = this.longAccountId;
    this.accountSummartReq.PageNumber = 1;
    this.accountSummartReq.PageSize = 5;
    this.accountSummartReq.SortDir = 1;
    this.accountSummartReq.SortColumn = "INVBATCHID";
    this.accountSummartReq.IsSearchEventFired = false;
    this.accountSummartReq.InvoiceNumber = '';
    this.accountSummartReq.PlateNumber = '';
    this.accountSummartReq.IsCustomerInvoice = true;
    this.accountSummartReq.SearchActivityIndicator = false;
    this.accountSummartReq.InvoiceStatus = 'INIT' + "," + 'PARTIALPAID';
    this.accountSummartReq.Isviolator = true;
    this.violatorDetailsService.invoiceSearchForViolator(this.accountSummartReq)
      .subscribe(res => {
        this.invoicesRes = res;
      });
  }


  getTransactionsByCode(transactionCode: string) {
    this.accountSummartReq = <any>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.accountSummartReq.SystemActivity = this.systemActivities;
    this.accountSummartReq.ViolatorId = this.longAccountId;
    this.accountSummartReq.TopN = 5;
    this.accountSummartReq.UserId = this.sessionContextResponse.userId;
    this.accountSummartReq.LoginId = this.sessionContextResponse.loginId;
    this.accountSummartReq.UserName = this.sessionContextResponse.userName;
    this.accountSummartReq.IsPageLoad = true;
    this.accountSummartReq.TransactionTypeCode = transactionCode;
    this.violatorDetailsService.getTransactionsByTransctionTypeCode(this.accountSummartReq)
      .subscribe(res => {
        if (transactionCode == 'PARKING') {
          this.parkingTripsRes = res;
        } else if (transactionCode == 'FERRY') {
          this.ferryTripsRes = res;
        } else if (transactionCode == 'TRANSIT') {
          this.transitTripsRes = res;
        }
        console.log(this.ferryTripsRes);
      });
  }

  getDocumentPath() {
    // this.customerDetailsService.getDoumentPath().subscribe(
    //   res => {
    //     if (res) {
    //       this.viewPath = res;
    //     }
    //   });

       this.invoiceService.getVirtualPath().subscribe(
      res => {
        this.viewPath = res;
      }
    );
  }

  viewPDF(documentPath) {
    let strViewPath: string;
    strViewPath = this.viewPath + documentPath;
    window.open(strViewPath);
  }

  backClick() {
    this.violatorContext.changeResponse(null);
    this.violatorSearchContextService.currentContext.
      subscribe(res => {
        this.violatorSearchContext = res;
      });
    if (this.violatorSearchContext) {
       this.violatorSearchContext.pageIndex = this.pageIndex;
      this.violatorSearchContext.IsNavigatedFromAccountSummary = true;
    }
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 100);
  }

  exitClick() {
    this.violatorContext.changeResponse(null);
    this.loginService.setViolatorContext(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  refundCLick() {
    this.refundFrom.patchValue({ refundAmount: '' });
    this.violatorDetailsService.getRefundStatusByAccountId(this.longAccountId)
      .subscribe(res => {
        if (res && (res.toString().toUpperCase() == "QUEUED" || res.toString().toUpperCase() == "INCOMPLETE")) {
          $('#confirm-dialog').modal('hide');
          this.showErrorMsg('Administrative hearing refund request is in process.');
        }
        else {
          $('#confirm-dialog').modal('show');
        }
      });
  }

  processRefunds() {
    this.refundFrom.controls["refundAmount"].markAsTouched({ onlySelf: true });
    if (this.refundFrom.valid) {
      if (this.refundFrom.value.refundAmount > this.paymentdetailsRes.AdminHearingDeposit) {
        alert('Amount should not be greater than admin hearing deposit amount !');
        return false;
      }
      let items = [];
      this.violatorDetailsService.getRefundStatusByAccountId(this.longAccountId)
        .subscribe(res => {
          if (res && (res.toString().toUpperCase() == "QUEUED" || res.toString().toUpperCase() == "INCOMPLETE")) {
            this.showErrorMsg('Administrative hearing refund request is in process.');
            $('#confirm-dialog').modal('hide');
          }
          else {
            //User Events
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.VIOLATIONSUMMARY];
            userEvents.ActionName = Actions[Actions.ADMINHEARINGREQUEST];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = this.longAccountId;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;

            this.refundRequest = <any>{};
            this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.Cheque];
            this.refundQueue = <IRefundQueue>{};
            this.refundQueue.AccountID = this.longAccountId
            this.refundQueue.Amount = this.refundFrom.value.refundAmount;
            items.push(this.refundQueue);
            this.refundRequest.ActivityType = "ACCTREFUND";
            this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
            this.refundRequest.CreatedUser = this.sessionContextResponse.userName;
            this.refundRequest.ExceptionRRID = 0;
            this.refundRequest.RefundRequestState = "QUEUED";
            this.refundRequest.TxnTypeId = 0;
            this.refundRequest.SubSystem = SubSystem[SubSystem.TVC];
            this.refundRequest.RefundRequestedDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
            this.refundRequest.CreatedDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
            this.refundRequest.RefundType = "ADMINHEARING";
            this.refundRequest.objIlRefundQueue = items.map(x => Object.assign({}, x));
            this.refundService.postRefundRequests(this.refundRequest, userEvents).subscribe(
              res => {
                if (res) {
                  $('#confirm-dialog').modal('hide');
                  this.getViolationAmountDetails();
                  this.showSucsMsg("Administrative Hearing Deposit Amount for refund has been requested successfully.");

                  this.iRefundProcess = res;
                  this.refundContextService.setRefund(this.iRefundProcess);

                  var strSplitPath = window.location.href.split("#");
                  let navigatePath: string = "";

                  navigatePath = (strSplitPath[0] + "#/tvc/violator-refund-form").toString();

                  if (navigatePath) {
                    var newWindow = window.open(navigatePath);
                  }

                } else {
                  $('#confirm-dialog').modal('hide');
                  this.showErrorMsg("Error while submitting refunds.");
                }
              },
              (err) => {
                $('#confirm-dialog').modal('hide');
                this.showErrorMsg(err.statusText);
              }, () => {
              });
          }
        });
    }
  }

  putOnHold() {
    this.violatorDetailsService.isExistsPaymentplanPromisetopay(this.longAccountId)
      .subscribe(res => {
        if (res && res.PaymentPlan) {
          this.showErrorMsg("Payment plan exists for this customer");
        } else if (res && res.PropmisetoPay) {
          this.showErrorMsg("Promise to pay exists for this customer");
        } else if (!res.PaymentPlan && !res.PropmisetoPay) {
          //User Events
          let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.VIOLATIONSUMMARY];
          userEvents.ActionName = Actions[Actions.ACCOUNTHOLD];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.longAccountId;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;

          this.manualHoldRequest = <any>{};
          this.manualHoldRequest.AccountId = this.longAccountId;
          this.manualHoldRequest.Rebill_Hold_StartEffectiveDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
          var todayDate = new Date();
          todayDate.setDate(todayDate.getDate() + parseInt(this.manualholddays.toString()));
          this.manualHoldRequest.Rebill_Hold_EndEffectiveDate = todayDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
          this.manualHoldRequest.UpdatedUser = this.sessionContextResponse.userName;
          this.violatorDetailsService.createManualHold(this.manualHoldRequest, userEvents)
            .subscribe(res => {
              if (res) {
                this.getPaymentPlan();
                this.showSucsMsg("Manual Hold successfully created for this customer");
              }
            }, (err) => {
              this.showErrorMsg("Error while creating Manual Hold for this customer");
            });
        }
      });
  }

  removeHold() {
    //User Events
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONSUMMARY];
    userEvents.ActionName = Actions[Actions.ACCOUNTHOLDREMOVE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longAccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.manualHoldRequest = <any>{};
    this.manualHoldRequest.AccountId = this.longAccountId;
    this.manualHoldRequest.Rebill_Hold_EndEffectiveDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.manualHoldRequest.UpdatedUser = this.sessionContextResponse.userName;
    this.violatorDetailsService.removeManualHold(this.manualHoldRequest, userEvents)
      .subscribe(res => {
        if (res) {
          this.getPaymentPlan();
          this.showSucsMsg("Successfully released from Manual Hold");
        }
      }, (err) => {
        this.showErrorMsg("Error while releasing from Manual Hold");
      });
  }

  alertClick() {
    this.msgFlag = true;
    this.msgType = 'alert';
    if (this.paymentPLanRes && this.paymentPLanRes.ManualHold == "1")
      this.msgDesc = 'Are you sure, you want to remove the hold?';
    else
      this.msgDesc = 'Are you sure, you want to hold the account?';
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

  userAction(event) {
    if (event) {
      if (this.paymentPLanRes && this.paymentPLanRes.ManualHold == "1") {
        this.removeHold();
      } else {
        this.putOnHold();
      }
    }
  }


  viewDisputes(){
    let link = ['tvc/disputes/view-disputes'];
    this.router.navigate(link);
  }

}
