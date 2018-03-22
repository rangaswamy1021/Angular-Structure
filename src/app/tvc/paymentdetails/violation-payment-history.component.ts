
import { IUserEvents } from '../../shared/models/userevents';
import { Component, OnInit, Renderer, ElementRef, ViewChild, NgModule, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { Actions, ActivitySource, Features, SubSystem, TxnTypeCategories, defaultCulture } from '../../shared/constants';
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { PaymentDetailService } from './services/paymentdetails.service';
import { CommonService } from '../../shared/services/common.service';
import { IPaymentHistoryDetailsRequest } from '../../csc/customerdetails/models/PaymentHistoryDetailsRequest';
import { PaymentMode, ParentPaymentMode, PaymentStatus, AccountStatus, PaymentFor } from '../../payment/constants';
import { ISearchPaymentResponse } from '../../csc/customerdetails/models/SearchPaymentResponse';
import { isSuccess } from '@angular/http/src/http_utils';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IMyDrpOptions, IMyInputFieldChanged, IMyInputFocusBlur } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-payment-history',
  templateUrl: './violation-payment-history.component.html',
  styleUrls: ['./violation-payment-history.component.scss']
})
export class ViolationPaymentHistoryComponent implements OnInit {
  gridArrowVoucherNo: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowCreatedDate: boolean;
  invalidDateRange: boolean;

  constructor(private paymentService: PaymentDetailService,
    private context: SessionService,
    private commonService: CommonService,
    private violatorContext: ViolatorContextService,
    private _location: Location, private router: Router,
    private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService) { }

  longViolatorId: number;
  p: number = 1;
  AfterSearch: boolean = false;
  activityType = 0;
  paymentHistoryForm: FormGroup;
  paymentRequest: any;
  systemactivites: ISystemActivities;
  boolSubmit: boolean = true;
  bsRangeValue: any;
  activityTypes: any[];
  paymentHistoryRequest: any;
  paymentHistoryResponse: ISearchPaymentResponse[] = <ISearchPaymentResponse[]>[];
  selected: string = 'AllTransaction';
  MaxReversalDays: number;
  //User log in details
  sessionContextResponse: IUserresponse
  violatorContextResponse: IViolatorContextResponse;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  disableSearchButton: boolean = false;
  disableReverseButton: boolean = false;

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.paymentHistorySearch(this.currentPage);
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.gridArrowVoucherNo = true;
    this.sortingColumn = "VoucherNo";
    this.p = 1;
    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longViolatorId = this.violatorContextResponse.accountId;
    }
    this.paymentHistoryForm = new FormGroup({
      bsRangeValue: new FormControl('', [Validators.required]),
      ActivityType: new FormControl(''),
    });
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.setDateRange();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg("ICN is not assigned to do transactions.");
    }

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORPAYMENTHISTORY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.VIOLATORPAYMENTHISTORY], Actions[Actions.SEARCH], "");
    this.disableReverseButton = !this.commonService.isAllowed(Features[Features.VIOLATORPAYMENTHISTORY], Actions[Actions.REVERSE], "");
    this.getActivityTypes();
    this.paymentHistorySearch(this.p, userEvents);
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setDateRange(): void {
    // Set date range (today) using the patchValue function
    let date = new Date();
    this.paymentHistoryForm.patchValue({
      bsRangeValue: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

  getActivityTypes(): void {
    this.commonService.getPaymentModes().subscribe(
      res => {
        this.activityTypes = res.filter(f => f.Key != "Adjustment" && f.Key != "Other");
        this.selected = "AllTransaction";
        this.paymentHistoryForm.patchValue({
          ActivityType: "AllTransaction",
        });
      }
    );
  }

  resetclick() {
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.paymentHistoryForm.patchValue({
      ActivityType: "AllTransaction",
      // bsRangeValue: this.bsRangeValue,
    });
    this.setDateRange();
    this.p = 1;
    this.paymentHistorySearch(1);
  }

  searchClick(pageNumber) {
    //User Events 
    if (!this.invalidDateRange && this.paymentHistoryForm.valid) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIOLATORPAYMENTHISTORY];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longViolatorId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.paymentHistorySearch(1, userEvents)
    }
  }

  paymentHistorySearch(pageNumber, userEvents?: IUserEvents): void {
    this.paymentHistoryResponse = [];
    this.paymentHistoryRequest = <IPaymentHistoryDetailsRequest>{};
    this.paymentHistoryForm
    if (this.paymentHistoryForm.valid) {
      let strDate;
      if (this.paymentHistoryForm.controls['bsRangeValue'].value == '') {
        strDate = this.bsRangeValue;
      }
      else {
        strDate = this.paymentHistoryForm.controls['bsRangeValue'].value;
      }
      // let strDateRange = strDate.slice(","); 
      // let fromDate = new Date(strDateRange[0]);
      // let toDate = new Date(strDateRange[1]);
      let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
      let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
      this.paymentHistoryRequest.CustomerID = this.longViolatorId;
      this.AfterSearch = false;
      if (this.paymentHistoryForm.controls['ActivityType'].value == ParentPaymentMode[ParentPaymentMode.OnlinePmt])
        this.paymentHistoryRequest.ActivityCategoryType = ParentPaymentMode[ParentPaymentMode.OnlinePmt].toString();
      else if (this.paymentHistoryForm.controls['ActivityType'].value == ParentPaymentMode[ParentPaymentMode.OfflinePmt].toString())
        this.paymentHistoryRequest.ActivityCategoryType = ParentPaymentMode[ParentPaymentMode.OfflinePmt].toString();
      else if (this.paymentHistoryForm.controls['ActivityType'].value == ParentPaymentMode[ParentPaymentMode.Reversal])
        this.paymentHistoryRequest.ActivityCategoryType = ParentPaymentMode[ParentPaymentMode.Reversal].toString();
      else
        this.paymentHistoryRequest.ActivityCategoryType = '';

      this.paymentHistoryRequest.IsSearchEventFired = true;

      var nextScheduleDate = toDate;
      nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);
      this.paymentHistoryRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.paymentHistoryRequest.EndDate = nextScheduleDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.paymentHistoryRequest.PerformedBy = this.sessionContextResponse.userName;
      this.paymentHistoryRequest.PageNumber = pageNumber;
      this.paymentHistoryRequest.PageSize = this.pageItemNumber;
      this.paymentHistoryRequest.SortColumn = this.sortingColumn;
      this.paymentHistoryRequest.SortDirection = this.sortingDirection == true ? true : false;
      this.paymentHistoryRequest.SubSystem = SubSystem[SubSystem.TVC].toString();

      this.systemactivites = <ISystemActivities>{};
      this.systemactivites.LoginId = this.sessionContextResponse.loginId;
      this.systemactivites.UserId = this.sessionContextResponse.userId;
      this.systemactivites.SubSystem = SubSystem.CSC.toString();
      this.systemactivites.ActivitySource = ActivitySource.Internal.toString();
      this.paymentHistoryRequest.SystemActivity = this.systemactivites;

      this.paymentService.getPaymentHistoryDetails(this.paymentHistoryRequest, userEvents).subscribe(
        res => {
          this.paymentHistoryResponse = res;
        },
        err => {

        },
        () => {
          if (this.paymentHistoryResponse && this.paymentHistoryResponse.length) {
            for (let i = 0; i < this.paymentHistoryResponse.length; i++) {
              if (this.paymentHistoryResponse[i].PaymentStatus != ''
                && this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() == PaymentStatus[PaymentStatus.Success].toString().toUpperCase()
                && (PaymentMode[PaymentMode.Bank].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                  || PaymentMode[PaymentMode.Cash].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                  || PaymentMode[PaymentMode.Cheque].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                  || PaymentMode[PaymentMode.CreditCard].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                  || PaymentMode[PaymentMode.MoneyOrder].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase())
                && ParentPaymentMode[ParentPaymentMode.Reversal].toString().toUpperCase() != this.paymentHistoryResponse[i].ParentPaymentMode.toUpperCase()) {
                this.paymentHistoryResponse[i].isReversed = true;
              }
              if (this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() == PaymentStatus[PaymentStatus.Success].toUpperCase())
                this.paymentHistoryResponse[i].PaymentStatus = "Approved";
              if (this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() == PaymentStatus[PaymentStatus.Reversal].toUpperCase())
                this.paymentHistoryResponse[i].PaymentStatus = "Reversed";
              if (this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() == PaymentStatus[PaymentStatus.Failed].toUpperCase())
                this.paymentHistoryResponse[i].PaymentStatus = "Declined";
            }
            this.AfterSearch = true;
            if (this.paymentHistoryResponse && this.paymentHistoryResponse.length > 0) {
              this.totalRecordCount = this.paymentHistoryResponse[0].RecCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount
              }
            }
          }
        }
      );
    }
  }
  processReversal(paymentHistoryResponse) {
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg("ICN is not assigned to do transactions.");
    }
    else {
      //#region date difference is greate than max reversal config date , should not allow to do the reversals
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxReversalDays).subscribe(
        res => {
          this.MaxReversalDays = res;
          let date1: string = new Date().toString();
          let diffInMs: number = Date.parse(date1) - Date.parse(paymentHistoryResponse.Date);
          let diffInDays: number = Math.ceil(diffInMs / 1000 / 60 / 60 / 24);
          if (diffInDays > this.MaxReversalDays) {
            this.showErrorMsg("After " + this.MaxReversalDays + " days Reversal cannot be done.");
          }
          else {

            //User Events 
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.VIOLATORPAYMENTHISTORY];
            userEvents.ActionName = Actions[Actions.REVERSE];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = this.longViolatorId;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;

            this.paymentRequest = <any>{};
            this.paymentRequest.TxnAmount = paymentHistoryResponse.TxnAmount;
            this.paymentRequest.PaymentMode = PaymentMode[paymentHistoryResponse.PaymentMode];
            this.paymentRequest.PaymentId = paymentHistoryResponse.PaymentId;
            this.paymentRequest.TxnCategory = TxnTypeCategories[TxnTypeCategories.Reversal].toString();
            this.paymentRequest.LoginId = this.sessionContextResponse.loginId;
            this.paymentRequest.LoggedUserID = this.sessionContextResponse.userId;
            this.paymentRequest.LoggedUserName = this.sessionContextResponse.userName;
            this.paymentRequest.SubSystem = SubSystem[SubSystem.TVC].toString();
            this.paymentRequest.ICNId = this.sessionContextResponse.icnId;
            this.paymentRequest.Description = "ReversalPayment";
            this.paymentRequest.PaymentDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.paymentRequest.CustomerId = this.longViolatorId;
            this.paymentRequest.PaymentStatus = PaymentStatus[PaymentStatus.InProcess].toString();
            this.paymentRequest.UserName = this.paymentRequest.IntiatedBy = this.sessionContextResponse.userName;
            this.paymentRequest.AccountStatus = AccountStatus[AccountStatus.VIO].toString();
            this.paymentRequest.PaymentFor = paymentHistoryResponse.Description;
            this.paymentService.doReversalPayment(this.paymentRequest, userEvents).subscribe(
              res => {
                if (res) {
                  this.showSucsMsg("Payment has been reversed successfully.");
                  this.paymentHistorySearch(1);

                } else {
                  this.showErrorMsg("Error occured while revering the payment.");
                }
              },
              (err) => {
                this.showErrorMsg(err.statusText);
              });

          }
        });
    }
  }
  exit() {
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);

  }

  backClick() {
    this.router.navigate(["/tvc/violatordetails/violator-summary"]);
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
    //return false;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  onInputFieldRangeChanged(event: IMyInputFieldChanged) {

    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

  }
  onInputFocusBlur(event: IMyInputFocusBlur): void {
    if (event.value == "")
      this.invalidDateRange = false;
  }

  sortDirection(SortingColumn) {
    this.gridArrowCreatedDate = false;
    this.gridArrowVoucherNo = false;



    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "CreatedDate") {
      this.gridArrowCreatedDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "VoucherNo") {
      this.gridArrowVoucherNo = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    this.paymentHistorySearch(this.p);
  }

}