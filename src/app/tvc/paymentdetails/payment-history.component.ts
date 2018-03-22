import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common'
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SubSystem, ActivitySource, TxnTypeCategories, defaultCulture } from '../../shared/constants';
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
import { IMyDrpOptions, IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  constructor(private paymentService: PaymentDetailService,
    public datepipe: DatePipe, private context: SessionService,
    private commonService: CommonService,
    private violatorContext: ViolatorContextService,
    private _location: Location) { }
  longViolatorId: number;
  p: number = 1;
  AfterSearch: boolean = false;
  invalidDate: boolean = false;
  activityType = 0;
  paymentHistoryForm: FormGroup;
  paymentRequest: any;
  successBlock: boolean = false;
  successHeading: string;
  successMessage: string;
  errorBlock: boolean = false;
  errorHeading: string;
  errorMessage: string;
  systemactivites: ISystemActivities;
  boolSubmit: boolean = true;
  bsRangeValue: any;
  activityTypes: any[];
  paymentHistoryRequest: IPaymentHistoryDetailsRequest;
  paymentHistoryResponse: ISearchPaymentResponse[] = <ISearchPaymentResponse[]>[];
  selected: string = 'AllTransaction';
  MaxReversalDays: number;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false,
    showClearDateBtn: false


  };
  //User log in details
  sessionContextResponse: IUserresponse
  violatorContextResponse: IViolatorContextResponse;

  pageItemNumber: number = 6;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }

  ngOnInit() {

    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longViolatorId = this.violatorContextResponse.accountId;
    }
    this.paymentHistoryForm = new FormGroup({
      bsRangeValue: new FormControl(''),
      ActivityType: new FormControl(''),
    });
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.setDateRange();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse.icnId == 0) {
      this.errorBlock = true;
      this.successBlock = false;
      this.errorHeading = "Refunds Submit";
      this.errorMessage = "ICN is not assigned to do transactions.";
    }
    this.getActivityTypes();
    this.paymentHistorySearch();
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
    let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.paymentHistoryForm.patchValue({
      ActivityType: "AllTransaction",
      bsRangeValue: this.bsRangeValue,
    });
  }

  paymentHistorySearch(): void {
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
      this.paymentHistoryRequest.StartDate = fromDate;
      this.paymentHistoryRequest.EndDate = toDate;
      this.paymentHistoryRequest.PerformedBy = this.context.customerContext.userName;
      this.paymentHistoryRequest.PageNumber = 1;
      this.paymentHistoryRequest.PageSize = 10;
      this.paymentHistoryRequest.SortColumn = "";
      this.paymentHistoryRequest.SortDirection = true;
      this.paymentHistoryRequest.SubSystem = SubSystem[SubSystem.TVC].toString();

      this.systemactivites = <ISystemActivities>{};
      this.systemactivites.LoginId = this.context.customerContext.loginId;
      this.systemactivites.UserId = this.context.customerContext.userId;
      this.systemactivites.SubSystem = SubSystem.CSC.toString();
      this.systemactivites.ActivitySource = ActivitySource.Internal.toString();
      this.paymentHistoryRequest.SystemActivity = this.systemactivites;

      this.paymentService.getPaymentHistoryDetails(this.paymentHistoryRequest).subscribe(
        res => {
          this.paymentHistoryResponse = res;
          for (let i = 0; i < this.paymentHistoryResponse.length; i++) {
            this.paymentHistoryResponse[i].PaymentStatus = PaymentStatus[this.paymentHistoryResponse[i].PaymentStatus];
            this.paymentHistoryResponse[i].ParentPaymentMode = ParentPaymentMode[this.paymentHistoryResponse[i].ParentPaymentMode];
            this.paymentHistoryResponse[i].PaymentMode = PaymentMode[this.paymentHistoryResponse[i].PaymentMode];
            if (this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() != ''
              && this.paymentHistoryResponse[i].PaymentStatus.toUpperCase() == PaymentStatus[PaymentStatus.Success].toString().toUpperCase()
              && (PaymentMode[PaymentMode.Bank].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                || PaymentMode[PaymentMode.Cash].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                || PaymentMode[PaymentMode.Cheque].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                || PaymentMode[PaymentMode.CreditCard].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase()
                || PaymentMode[PaymentMode.MoneyOrder].toString().toUpperCase() == this.paymentHistoryResponse[i].PaymentMode.toUpperCase())
              && ParentPaymentMode[ParentPaymentMode.Reversal].toString().toUpperCase() != this.paymentHistoryResponse[i].ParentPaymentMode) {
              this.paymentHistoryResponse[i].isReversed = true;
            }
          }
          this.AfterSearch = true;
          this.dataLength = this.paymentHistoryResponse.length;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
      );

    }
  }
  processReversal(paymentHistoryResponse) {
    if (this.sessionContextResponse.icnId == 0) {
      this.errorBlock = true;
      this.successBlock = false;
      this.errorHeading = "Refunds Submit";
      this.errorMessage = "ICN is not assigned to do transactions.";
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
            this.errorBlock = true;
            this.errorHeading = "Refunds Submit";
            this.errorMessage = "After " + this.MaxReversalDays + " days Reversal cannot be done.";
          }
          else {
            this.paymentRequest = <any>{};
            this.paymentRequest.TxnAmount = paymentHistoryResponse.TxnAmount;
            this.paymentRequest.PaymentMode = PaymentMode[paymentHistoryResponse.PaymentMode];
            this.paymentRequest.PaymentId = paymentHistoryResponse.PaymentId;
            this.paymentRequest.TxnCategory = TxnTypeCategories[TxnTypeCategories.Reversal].toString();
            this.paymentRequest.PaymentDate = new Date();
            this.paymentRequest.LoginId = this.sessionContextResponse.loginId;
            this.paymentRequest.LoggedUserID = this.sessionContextResponse.userId;
            this.paymentRequest.LoggedUserName = this.sessionContextResponse.userName;
            this.paymentRequest.SubSystem = SubSystem[SubSystem.TVC].toString();
            this.paymentRequest.ICNId = this.sessionContextResponse.icnId;
            this.paymentRequest.Description = "ReversalPayment";
            this.paymentRequest.PaymentDate = new Date();
            this.paymentRequest.CustomerId = this.longViolatorId;
            this.paymentRequest.PaymentStatus = PaymentStatus[PaymentStatus.InProcess].toString();
            this.paymentRequest.UserName = this.paymentRequest.IntiatedBy = this.sessionContextResponse.userName;
            this.paymentRequest.AccountStatus = AccountStatus[AccountStatus.VIO].toString();
            if (paymentHistoryResponse.Description == "violation Admin Hearing Fee")
              this.paymentRequest.PaymentFor = PaymentFor[PaymentFor.Adminhearing].toString();
            else if (paymentHistoryResponse.Description == "Down Payment for PaymentPlan")
              this.paymentRequest.PaymentFor = PaymentFor[PaymentFor.PaymentPlanDownPayment].toString();
            else
              this.paymentRequest.PaymentFor = PaymentFor[PaymentFor.Violation].toString();
            this.paymentService.doReversalPayment(this.paymentRequest).subscribe(
              res => {
                if (res) {
                  this.successBlock = true;
                  this.errorBlock = false;
                  this.successHeading = "Payment reversal";
                  this.successMessage = "Payment has been reversed successfully.";
                  this.paymentHistorySearch();

                } else {
                  this.errorBlock = true;
                  this.successBlock = false;
                  this.errorHeading = "Refunds Submit";
                  this.errorMessage = "Error occured while revering the payment.";
                }
              },
              (err) => {
                this.successBlock = false;
                this.errorBlock = true;
                this.errorHeading = "Internal Server Error";
                this.errorMessage = err.statusText;
              });

          }
        });
    }
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.paymentHistoryForm.controls["dateRange"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
}
