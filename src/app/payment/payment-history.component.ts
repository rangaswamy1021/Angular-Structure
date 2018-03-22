import { Component, OnInit, Renderer, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { IPaging } from '../shared/models/paging';
import { ISystemActivities } from '../shared/models/systemactivitiesrequest';
import { IUserresponse } from '../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { DatePipe } from '@angular/common';
import { PaymentService } from './services/payment.service';
import { IParentPaymentModesResponse, IPaymentActivities } from './models/parentpaymentmodesresponse';
import { IParentPaymentModes } from './models/parentpaymentmodesrequest';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { SubSystem, AccountStatus, Features, Actions, defaultCulture } from '../shared/constants';
import { IPaymentReversals } from './models/paymentreversalsrequest';
import { IPaymentResponse } from './models/paymentresponse';
import { ParentPaymentMode } from './constants';
import { IUserEvents } from '../shared/models/userevents';
import { CommonService } from '../shared/services/common.service';
import { ApplicationParameterkey } from '../shared/applicationparameter';
import { IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  gridArrowVoucherNo: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowCreatedDate: boolean;
  invalidDate: boolean;
  paymentHistoryForm: FormGroup;
  paging: IPaging;
  systemactivites: ISystemActivities;
  boolSubmit: boolean = true;
  doPaymentReversalsRequest: IPaymentReversals;
  doPaymentReversalResponse: IPaymentResponse;
  parentPaymentModesRequest: IParentPaymentModes;
  parentPaymentActivityTypes: IPaymentActivities[];
  parentpaymentmodesresponse: IParentPaymentModesResponse[];
  userInputs: IparentPaymentHistoryInputs = <IparentPaymentHistoryInputs>{};
  sysActivities: ISystemActivities;
  maxReversalDays: number = 0;
  //User log in details
  sessionContextResponse: IUserresponse
  customerContextResponse: ICustomerContextResponse;

  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  disableReversalButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  startDate: any;
  endDate: any;

  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear());
  toDayDate: Date = new Date();
  start = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.parentPaymentModesSearch(false, true, this.p, false);
  }

  constructor(private paymentService: PaymentService,private materialscriptService:MaterialscriptService, private commonService: CommonService, public renderer: Renderer, private router: Router,
    public datepipe: DatePipe, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private customerContext: CustomerContextService, private context: SessionService) { }

  ngOnInit() {
    this.gridArrowCreatedDate = true;
    this.sortingColumn = "CreatedDate";
    this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null || this.sessionContextResponse == undefined) {
      let link = ['/'];
      this.router.navigate(link);
    };
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse == null || this.customerContextResponse == undefined) {
      let link = ['csc/search/advance-csc-search'];
      this.router.navigate(link);
    };
    if (this.customerContextResponse.AccountId != null && this.customerContextResponse.AccountId != undefined) {
      if (this.customerContextResponse.AccountId > 0) {
        this.userInputs.accountId = this.customerContextResponse.AccountId;
      }
    }
    this.p = 1;
    this.paymentHistoryForm = new FormGroup({
      'paymentParentActivitiesSelected': new FormControl('', [Validators.required]),
      'dateRange': new FormControl('', [Validators.required]),
    });

    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (!this.commonService.isAllowed(Features[Features.PAYMENTHISTORY], Actions[Actions.VIEW],
      this.customerContextResponse.AccountStatus)) {

    }
    this.disableReversalButton = !this.commonService.isAllowed(Features[Features.PAYMENTHISTORY], Actions[Actions.REVERSE],
      this.customerContextResponse.AccountStatus);
    this.userInputs.loginId = this.sessionContextResponse.loginId;
    this.userInputs.userId = this.sessionContextResponse.userId;
    this.userInputs.userName = this.sessionContextResponse.userName;

    // var todayDate: Date = new Date();
    // let startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.paymentHistoryForm.controls['dateRange'].setValue([startDate, startDate]);
    let date = new Date();
    this.paymentHistoryForm.patchValue({
      dateRange: {
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

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENTHISTORY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;


    this.getPaymentParentActivityTypes(userEvents);
    this.parentPaymentModesSearch(true, false, this.p, false)
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxReversalDays).subscribe(
      res =>
        this.maxReversalDays = res);
  }


  bindParentPaymentDetailsByPaymentModes() {
    if (this.paymentHistoryForm.valid) {
      this.parentPaymentModesSearch(false, true, this.p, true);
    }
    else {
      this.validateAllFormFields(this.paymentHistoryForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  parentPaymentModesSearch(boolLoadActivity: boolean, boolSearchActivity: boolean, pageNumber: number, isSearch: boolean): void {
    // let startDate = new Date();
    // let enddate = new Date();

    this.parentPaymentModesRequest = <IParentPaymentModes>{};
    this.sysActivities = <ISystemActivities>{};
    this.parentPaymentModesRequest.CustomerID = this.userInputs.accountId;
    this.sysActivities.LoginId = this.userInputs.loginId;
    this.sysActivities.UserId = this.userInputs.userId;
    this.sysActivities.User = this.userInputs.userName;
    this.sysActivities.SubSystem = SubSystem.CSC.toString();

    this.parentPaymentModesRequest.SystemActivity = this.sysActivities;
    this.parentPaymentModesRequest.PageNumber = pageNumber;
    this.parentPaymentModesRequest.PageSize = this.pageItemNumber;
    this.parentPaymentModesRequest.SortColumn = this.sortingColumn;
    this.parentPaymentModesRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    this.parentPaymentModesRequest.PaymentHistoryActivityInd = boolSearchActivity;
    this.parentPaymentModesRequest.PaymentHistoryLoadActivity = boolLoadActivity;

    if (boolSearchActivity == true) {
      let strDate = this.paymentHistoryForm.controls['dateRange'].value;
      if (strDate) {
        // let strDateRange = strDate.slice(",");
        // startDate = new Date(strDateRange[0]);
        // enddate = new Date(strDateRange[1]);
        let date = this.datePickerFormat.getFormattedDateRange(this.paymentHistoryForm.controls['dateRange'].value)
        let firstDate = date[0];
        let lastDate = date[1];
        this.startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      }
      else {
        let strDate = this.paymentHistoryForm.controls['dateRange'].value;
        this.startDate = this.start;
        this.endDate = this.end;
      }
    }
    else {
      this.startDate = this.start;
      this.endDate = this.end;
    }
    this.parentPaymentModesRequest.StartDate = this.startDate;
    this.parentPaymentModesRequest.EndDate = this.endDate;
    //this.parentPaymentModesRequest.EndDate.setHours(23, 59, 59, 997);
    if (this.paymentHistoryForm.value.paymentParentActivitiesSelected == "AllTransaction") {
      this.parentPaymentModesRequest.ActivityCategoryType = "All Transactions";
    }
    else {
      this.parentPaymentModesRequest.ActivityCategoryType = this.paymentHistoryForm.value.paymentParentActivitiesSelected;
    }
    this.parentPaymentModesRequest.Subsystem = SubSystem.CSC.toString();
    this.parentPaymentModesRequest.TxnTypeCategory = this.paymentHistoryForm.value.paymentParentActivitiesSelected;

    let userEvents: IUserEvents;
    if (isSearch) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.PAYMENTHISTORY];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.customerContextResponse.AccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    if (!(this.invalidDate)) {
      this.paymentService.getParentPaymentDetailsByPaymentModes(this.parentPaymentModesRequest, userEvents).subscribe(
        res => {
          this.parentpaymentmodesresponse = res;
          if (res != null && res.length > 0) {
            this.parentpaymentmodesresponse.forEach((event) => {
              if (event.PaymentStatus == "Success" && ParentPaymentMode[ParentPaymentMode.Reversal].toUpperCase() != event.ParentPaymentMode.toUpperCase()) {
                event.isAllowReverse = true;
              }
              else {
                event.isAllowReverse = false;
              }
              if (event.PaymentMode.toUpperCase() == "PURCHASED") {
                event.isAllowReverse = false;
              }
                if (event.PaymentMode.toUpperCase() == "PROMO") {
                event.isAllowReverse = false;
              }
            })
            this.totalRecordCount = this.parentpaymentmodesresponse[0].RecCount;

            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }

          }
        },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
        });
    }
    else {

    }
  }

  //Get Payment Parent Activity Types
  getPaymentParentActivityTypes(userEvents: IUserEvents) {
    this.paymentService.getParentPaymentModesLookUps(userEvents).subscribe(res => {
      this.parentPaymentActivityTypes = res;
      if (this.parentPaymentActivityTypes && this.parentPaymentActivityTypes.length > 0)
        this.paymentHistoryForm.controls["paymentParentActivitiesSelected"].setValue(this.parentPaymentActivityTypes[0].Key);
    });
  }

  resetForm() {
    this.paymentHistoryForm.controls["paymentParentActivitiesSelected"].setValue("AllTransaction");
    let date = new Date();
    this.paymentHistoryForm.patchValue({
      dateRange: {
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
    //this.parentPaymentModesSearch(false, false, this.p, false);
    //this.getPaymentParentActivityTypes();
    // var todayDate: Date = new Date();
    // let startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.paymentHistoryForm.controls['dateRange'].setValue([startDate, startDate]);
    this.parentPaymentModesSearch(true, false, this.p, false)
  }

  reversePaymentTransaction(event) {
    if (event) {
      this.paymentService.doPaymentReversal(this.doPaymentReversalsRequest).subscribe(res => {
        this.doPaymentReversalResponse = res
        if (this.doPaymentReversalResponse != null) {
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgDesc = "Reference # " + this.doPaymentReversalsRequest.VoucherNumber + " reversed successfully";
          this.msgTitle = '';
          this.parentPaymentModesSearch(true, false, this.p, false)
          //Reference # #voucher reversed successfully
        }
      },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
        });
    }
    else {
      this.msgFlag = false;
    }
    //this.parentPaymentModesSearch(false, true, this.p);
  }

  days: any;
  currentDate: any;
  date: any;
  reversePaymentTransactionConfirm(paymentId: number, txnAmount: number, payMode: string, voucherNo: string, parentPaymentID: number, parentPaymentMode, paymentDate: string) {
    if (this.sessionContextResponse.icnId == 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "ICN # should be numeric and should not be zero";
      this.msgTitle = '';
    }
    else {
      if (this.commonService.isAllowed(Features[Features.PAYMENTHISTORY], Actions[Actions.REVERSE],
        this.customerContextResponse.AccountStatus)) {
        this.currentDate = new Date();
        this.date = new Date(paymentDate);
        var timeDiff = Math.abs(this.currentDate.getTime() - this.date.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays < this.maxReversalDays) {
          let accountStatusArray: string[] = [AccountStatus[AccountStatus.COWO],
          AccountStatus[AccountStatus.COCL],
          AccountStatus[AccountStatus.RR],
          AccountStatus[AccountStatus.WO],
          AccountStatus[AccountStatus.CL]];
          if (accountStatusArray.indexOf(this.customerContextResponse.AccountStatus) > -1) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "The account status is not in Active. You are not allowed to do this operation";
            this.msgTitle = '';
            return;
          }
          this.doPaymentReversalsRequest = <IPaymentReversals>{};
          this.doPaymentReversalsRequest.PaymentId = paymentId;
          this.doPaymentReversalsRequest.ParentPaymentId = parentPaymentID;
          this.doPaymentReversalsRequest.PaymentMode = payMode;
          this.doPaymentReversalsRequest.ParentPaymentMode = "Reversal";
          this.doPaymentReversalsRequest.VoucherNumber = voucherNo;
          this.doPaymentReversalsRequest.SubSystem = SubSystem.CSC.toString();
          this.doPaymentReversalsRequest.CustomerId = this.userInputs.accountId;
          this.doPaymentReversalsRequest.LoggedUserId = this.userInputs.loginId;
          this.doPaymentReversalsRequest.UserName = this.userInputs.userName;
          this.doPaymentReversalsRequest.TxnAmount = txnAmount;
          this.doPaymentReversalsRequest.TxnCategory = this.paymentHistoryForm.value.paymentParentActivitiesSelected;
          this.doPaymentReversalsRequest.ICNId = this.sessionContextResponse.icnId;
          this.doPaymentReversalsRequest.LoginId = this.userInputs.loginId;
          this.doPaymentReversalsRequest.IsPostpaidCustomer = this.customerContextResponse.AccountType == "PREPAID" ? false : true;
          this.parentPaymentModesSearch(false, true, this.p, false);
          this.msgType = 'alert';
          this.msgFlag = true;
          this.msgDesc = "Are you sure you want to reverse this Payment Transaction?";
          this.msgTitle = 'Alert';
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Greater than " + this.maxReversalDays + " days payment transaction cannot be reversed";
          this.msgTitle = '';
        }
      }
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
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


    this.parentPaymentModesSearch(false, true, this.p, false);
  }

}

export interface IparentPaymentHistoryInputs {
  userName: string
  loginId: number
  userId: number
  accountId: number
}