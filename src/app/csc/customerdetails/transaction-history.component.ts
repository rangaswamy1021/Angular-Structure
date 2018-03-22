import { environment } from './../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable } from 'rxjs';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IPaymentHistoryDetailsRequest } from './models/PaymentHistoryDetailsRequest';
import { ISearchPaymentResponse } from './models/SearchPaymentResponse';
import { CustomerDetailsService } from './services/customerdetails.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CommonService } from '../../shared/services/common.service';
import { Features, Actions, defaultCulture } from '../../shared/constants';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyDrpOptions, IMyInputFieldChanged } from 'mydaterangepicker';
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  invalidDate: boolean;

  constructor(private cdr: ChangeDetectorRef, private datePickerFormatService: DatePickerFormatService, private customerService: CustomerDetailsService, private router: Router, private sessionContext: SessionService,
    private commonService: CommonService, private customerContext: CustomerContextService, private materialscriptService: MaterialscriptService) { }
  //  myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };
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
  disableButtonSearch: boolean = false;
  disableButtonPDF: boolean = false;

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  paymentHistoryDetailsRequest: IPaymentHistoryDetailsRequest = <IPaymentHistoryDetailsRequest>{};
  searchPaymentResponse: ISearchPaymentResponse[] = <ISearchPaymentResponse[]>[];
  iSystemActivities: ISystemActivities = <ISystemActivities>{};
  transactionHistoryForm: FormGroup;
  popupHeading: string;
  popupMessage: string;
  longAccountId: number;

  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  activityPopUp: boolean = false;
  menuHeading: string;
  isAfterSearch: boolean = false;



  toDayDate: Date = new Date();
  start = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );

    this.transactionHistoryForm = new FormGroup({
      'timeperiod': new FormControl('', [Validators.required]),
      'accountId': new FormControl('', [])
    });

    this.initializeDate();

    if (this.router.url.indexOf('customeraccounts') > 0) {
      this.longAccountId = 0;
      this.transactionHistoryForm.controls['accountId'].enable();
      this.menuHeading = "Reports";
      this.isAfterSearch = false;
    } else if (this.router.url.indexOf('customerdetails') > 0) {
      if (this.customerContextResponse != null && this.customerContextResponse.AccountId > 0) {
        this.longAccountId = this.customerContextResponse.AccountId;
        this.transactionHistoryForm.controls['accountId'].setValue(this.longAccountId);
        this.transactionHistoryForm.controls['accountId'].disable();
        this.menuHeading = "Statements and Activity";
        this.isAfterSearch = true;
        let rootSele = this;
        setTimeout(function () {
          rootSele.materialscriptService.material();
        }, 0)
      }
      else {
        let link = ['/csc/search/advance-csc-search/'];
        this.router.navigate(link);
      }
    } else {
      let link = ['/csc/search/advance-csc-search/'];
      this.router.navigate(link);
    }

    this.disableButtonSearch = !this.commonService.isAllowed(Features[Features.TRANSACTIONHISTORY], Actions[Actions.SEARCH], "");
    this.disableButtonPDF = !this.commonService.isAllowed(Features[Features.TRANSACTIONHISTORY], Actions[Actions.VIEWPDF], "");

    const strDate = this.transactionHistoryForm.controls['timeperiod'].value;
    if (strDate != "" && strDate != null) {
      let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
      //const strDateRange = strDate.slice(',');
      // const fromDate = new Date(strDateRange[0]);
      // const toDate = new Date(strDateRange[1].getFullYear(), strDateRange[1].getMonth(), strDateRange[1].getDate(), 23, 59, 59, 59);
      const fromDate = new Date(parsedDate[0]);
      const toDate = new Date(parsedDate[1]);
      // toDate.setHours(23,59,59,59);

      let frmDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      let toDateModify = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");

      this.callActivitySearchService(this.longAccountId, frmDate, toDateModify, false, false, Actions[Actions.VIEW]);
    }
    else {

      // var todayDate: Date = new Date();
      // var startDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
      // var endDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 59);
      var startDate = this.start;
      var endDate = this.end;
      this.callActivitySearchService(this.longAccountId, startDate, endDate, false, false, Actions[Actions.VIEW]);
    }
    let a = this;
    setTimeout(function () {
      this.materialscriptService.material();
    }, 100);

  }

  initializeDate() {

    this.patchValue();
    //this.transactionHistoryForm.controls["timeperiod"].setValue([date.beginDate, date.endDate]);
  }

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;

    let lngAccNumber: number = Number(this.transactionHistoryForm.controls['accountId'].value);
    const strDate = this.transactionHistoryForm.controls['timeperiod'].value;
    if (strDate != "" && strDate != null) {
      let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
      // const strDateRange = strDate.slice(',');
      const fromDate = new Date(parsedDate[0]);
      const toDate = new Date(parsedDate[1]);
      //toDate.setHours(23,59,59,59);
      let frmDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      let toDateModify = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.callActivitySearchService(lngAccNumber, frmDate, toDateModify, false, false, "");
    }
    else {

      var startDate = this.start;
      var endDate = this.end;
      this.callActivitySearchService(lngAccNumber, startDate, endDate, false, false, "");
    }

  }

  /* Date picker code */
  minDate = new Date(2017, 5, 10);
  maxDate = new Date(2018, 9, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = new Date(v.setHours(0, 0, 0, 0));
    console.log
  }

  _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }

  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }

  serachActivity() {

    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;

    const strDate = this.transactionHistoryForm.controls['timeperiod'].value;
    let lngAccNumber: number = Number(this.transactionHistoryForm.controls['accountId'].value);

    if (strDate != undefined && strDate != null && strDate != "" && lngAccNumber > 0) {
      let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
      // const strDateRange = strDate.slice(',');
      const fromDate = new Date(parsedDate[0]);
      const toDate = new Date(parsedDate[1]);
      let frmDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      let toDateModify = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");

      this.callActivitySearchService(lngAccNumber, frmDate, toDateModify, true, false, Actions[Actions.SEARCH]);
    }
    else {

      if (lngAccNumber == 0) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Account No. required";
      }

    }

  }

  resetActivity() {

    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;

    if (this.transactionHistoryForm.clearValidators) {
      this.transactionHistoryForm.reset();

      // var todayDate: Date = new Date();
      // var startDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
      // var endDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 59);
      var startDate = this.start;
      var endDate = this.end;

      let lngAccNumber: number = 0;

      if (this.customerContextResponse != null && this.customerContextResponse.AccountId > 0) {
        lngAccNumber = this.customerContextResponse.AccountId;
        this.transactionHistoryForm.controls['accountId'].setValue(lngAccNumber);
        this.transactionHistoryForm.controls['accountId'].disable();
      }
      else {
        lngAccNumber = 0;
        this.transactionHistoryForm.controls['accountId'].enable();
      }
      this.initializeDate();
      this.callActivitySearchService(lngAccNumber, startDate, endDate, false, false, "");
    }
  }

  generateActivityPDF() {
    const strDate = this.transactionHistoryForm.controls['timeperiod'].value;
    let lngAccNumber: number = Number(this.transactionHistoryForm.controls['accountId'].value);
    if (strDate != "" && strDate != null) {
      // const strDateRange = strDate.slice(',');
      let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
      const frmDate = new Date(parsedDate[0]);
      const toDate = new Date(parsedDate[1]);
      let fromDate = new Date(frmDate.getFullYear(), frmDate.getMonth(), frmDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");

      var toDateModify: Date = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59);

      this.callActivityPDFService(lngAccNumber, fromDate, toDateModify);
    }
    else {
      // var todayDate: Date = new Date();
      // var startDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
      // var endDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 59);
      var startDate = this.start;
      var endDate = this.end;
      this.callActivityPDFService(lngAccNumber, startDate, endDate);
    }
  }

  callActivitySearchService(accountId: number, startDate: any, endDate: any, boolLoadActivity: boolean,
    boolSearchActivity: boolean, action: string) {

    this.paymentHistoryDetailsRequest = <IPaymentHistoryDetailsRequest>{};
    this.paymentHistoryDetailsRequest.CustomerID = accountId;
    this.paymentHistoryDetailsRequest.StartDate = startDate;
    this.paymentHistoryDetailsRequest.EndDate = endDate;
    this.paymentHistoryDetailsRequest.PageNumber = this.pageNumber;
    this.paymentHistoryDetailsRequest.PageSize = this.pageItemNumber;
    this.paymentHistoryDetailsRequest.SortColumn = "CUSTTXNID";
    this.paymentHistoryDetailsRequest.SortDirection = true;
    this.paymentHistoryDetailsRequest.PaymentHistoryActivityInd = boolSearchActivity;
    this.paymentHistoryDetailsRequest.PaymentHistoryLoadActivity = boolLoadActivity;
    this.iSystemActivities.UserId = this.sessionContextResponse.userId;;
    this.iSystemActivities.User = this.sessionContextResponse.userName;
    this.iSystemActivities.LoginId = this.sessionContextResponse.loginId;
    this.paymentHistoryDetailsRequest.SystemActivity = this.iSystemActivities;

    let userEvents: IUserEvents;
    if (action) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TRANSACTIONHISTORY];
      userEvents.ActionName = action;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    if (!this.invalidDate)
      this.customerService.getTransactionHistory(this.paymentHistoryDetailsRequest, userEvents).subscribe(
        res => {
          this.searchPaymentResponse = res;
        },
        (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        },
        () => {

          if (this.searchPaymentResponse.length > 0) {
            this.totalRecordCount = this.searchPaymentResponse[0].RecCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
            this.activityPopUp = true;
          }
          else
            this.activityPopUp = false;

        });

    if (this.totalRecordCount < this.pageItemNumber) {
      this.endItemNumber = this.totalRecordCount
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

  }

  callActivityPDFService(accountId: number, startDate: any, endDate: any) {

    var strFilePath: string;

    this.paymentHistoryDetailsRequest = <IPaymentHistoryDetailsRequest>{};
    this.paymentHistoryDetailsRequest.CustomerID = accountId;
    this.paymentHistoryDetailsRequest.StartDate = startDate;
    this.paymentHistoryDetailsRequest.EndDate = endDate;
    this.paymentHistoryDetailsRequest.PageNumber = this.pageNumber;
    this.paymentHistoryDetailsRequest.PageSize = 0;
    this.paymentHistoryDetailsRequest.SortColumn = "CUSTTXNID";
    this.paymentHistoryDetailsRequest.SortDirection = true;
    this.iSystemActivities.UserId = this.sessionContextResponse.userId;;
    this.iSystemActivities.User = this.sessionContextResponse.userName;
    this.iSystemActivities.LoginId = this.sessionContextResponse.userId;
    this.paymentHistoryDetailsRequest.SystemActivity = this.iSystemActivities;

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TRANSACTIONHISTORY];
    userEvents.ActionName = Actions[Actions.VIEWPDF];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.customerService.getTransactionHistoryPDF(this.paymentHistoryDetailsRequest, userEvents).subscribe(
      res => {
        strFilePath = res;

        if (strFilePath != "") {
          window.open(strFilePath);
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Cannot generate PDF";
        }
      },
      (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
      },
      () => {

      });

  }

  backToSummary() {
    const link = ['/csc/customerdetails/account-summary'];
    this.router.navigate(link);
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  patchValue(): void {
    let date = new Date();
    this.transactionHistoryForm.patchValue({
      timeperiod: {
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
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.transactionHistoryForm.controls["timeperiod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

}