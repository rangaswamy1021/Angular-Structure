import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IaddCashDetailsRequest } from "./models/addcashdetailsrequest";
import { IcreatedUserRequest } from "./models/objchangefundRequest";
import { IPaging } from "../../shared/models/paging";
import { SessionService } from "../../shared/services/session.service";
import { CashManagementService } from "./services/cashmanagement.service";
import { IaddCashDetailsResponse } from "./models/addcashdetailsresponse";
import { IcashManagementReportResponse } from "./models/cashmanagementreportsresponse";
import { IcashDenominationRequest } from "./models/objcashdenominationrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features, defaultCulture } from '../../shared/constants';
import { CommonService } from "../../shared/services/common.service";
import { IMyDrpOptions, IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-cash-details-report',
  templateUrl: './cash-details-report.component.html',
  styleUrls: ['./cash-details-report.component.scss']
})
export class CashDetailsReportComponent implements OnInit {
  invalidDate: boolean = false;
  objCashDenomination: any;
  subReportVisible: boolean = false;
  totalReceivedAmount: number = 0;
  totalFloatAmount: number = 0;
  receivedDenominationArray: Array<any> = [];
  floatDenominationArray: Array<any> = [];
  getChangeFundDenominationDetailsResponse: IcashManagementReportResponse[] = [];
  p: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  getChangeFundDetailsResponse: IaddCashDetailsResponse[] = [];
  objPaging: IPaging;
  objcreatedUser: IcreatedUserRequest;
  objAddCashDetailsRequest: any;
  cashreport: FormGroup;
  dateRangeValue: Date[];
  constructor(private sessionService: SessionService, private datePickerFormatService: DatePickerFormatService, private objcashManagement: CashManagementService, private commonService: CommonService, private router: Router) { }
  disableSubmit: boolean;
  CustomerPattern: any = "[0-9]*";
  sessionContextResponse: IUserresponse;
  myDateRangePickerOptions: ICalOptions =
  {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo',
    sunHighlight: true, height: '34px', width: '260px',
    inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  dateFormatValidator = "^\\(([0]{2})\\-[ ]([0]{2})[-]([0]{4}))$";
  dateRange;

  ngOnInit() {
    this.cashreport = new FormGroup({
      "dropDownValue": new FormControl('', [Validators.pattern(this.CustomerPattern)]),
      "dateRange": new FormControl('', [Validators.required]),
    })
    this.dateBind();
    this.endItemNumber = 10;
    this.GetChangeFundDetails(1);
    this.sessionContextResponse = this.sessionService.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CASHMANAGEMENT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.sessionContextResponse = this.sessionService.customerContext;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableSubmit = !this.commonService.isAllowed(Features[Features.CASHMANAGEMENT], Actions[Actions.SEARCH], "");
  }

  dateBind(): void {
    let date = new Date();
    this.cashreport.patchValue({
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
    let dateRangeArray = this.datePickerFormatService.getFormattedDateRange(this.cashreport.controls['dateRange'].value);
    let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    this.dateRange = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  search() {
    if (this.cashreport.valid) {
      this.endItemNumber = 10;
      this.p = 1;
      this.subReportVisible = false;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.CASHMANAGEMENT];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.GetChangeFundDetails(this.p, userEvents);
      // this.pageChanged(1, userEvents);
    } else {
      this.validateAllFormFields(this.cashreport);
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  GetChangeFundDetails(p: number, userEvents?: IUserEvents): void {
    let dateRangeArray = this.datePickerFormatService.getFormattedDateRange(this.cashreport.controls['dateRange'].value);
    this.objcreatedUser = <IcreatedUserRequest>{};
    this.objcreatedUser.StartDate = new Date(new Date(dateRangeArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    this.objcreatedUser.EndDate = new Date(new Date(dateRangeArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    this.objAddCashDetailsRequest = <IaddCashDetailsRequest>{};
    this.objPaging = <IPaging>{};
    this.objcreatedUser.LoginId = this.sessionService.customerContext.loginId;
    this.objcreatedUser.UserId = this.sessionService.customerContext.userId;
    this.objcreatedUser.PerformedBy = this.sessionService.customerContext.userName;
    this.objcreatedUser.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objcreatedUser.ViewFlag = "SEARCH";
    this.objcreatedUser.CustomerID = this.sessionService.customerContext.userId;
    this.objcreatedUser.CreatedUser = this.sessionService.customerContext.userName;
    this.objPaging.PageNumber = p;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = "FUNDDATE";
    this.objPaging.SortDir = 0;
    this.objAddCashDetailsRequest.objChangeFund = this.objcreatedUser;
    this.objAddCashDetailsRequest.objPaging = this.objPaging;
    this.sessionContextResponse = this.sessionService.customerContext;
    this.objcashManagement.getChangeFundDetails(this.objAddCashDetailsRequest, userEvents).subscribe(
      res => {
        this.getChangeFundDetailsResponse = res;
        if (res.length > 0) {
          this.totalRecordCount = this.getChangeFundDetailsResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      });
  }

  getChangeFundDenominationDetails(date: any): void {
    this.subReportVisible = true;
    this.totalReceivedAmount = 0;
    this.totalFloatAmount = 0;
    this.objAddCashDetailsRequest = <any>{};
    this.objAddCashDetailsRequest.Date = date.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.objcashManagement.getChangeFundDenominationDetails(this.objAddCashDetailsRequest).subscribe(
      res => {
        this.getChangeFundDenominationDetailsResponse = res;
        this.getChangeFundDenominationDetailsResponse.forEach(element => {
          this.floatDenominationArray = this.getChangeFundDenominationDetailsResponse[0].FloatDenomination;
          this.receivedDenominationArray = this.getChangeFundDenominationDetailsResponse[0].ReceivedDenomination;
        });
        this.floatDenominationArray.forEach(element => {
          this.totalFloatAmount += element.FloatTotalAmount;
        });
        this.receivedDenominationArray.forEach(element => {
          this.totalReceivedAmount += element.ReceivedTotalAmount;
        });
      });
  }

  amountReset() {
    this.dateBind();
    this.GetChangeFundDetails(1);
    this.subReportVisible = false;
  }

  pageChanged(event, userEvents?: IUserEvents) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.GetChangeFundDetails(this.p, userEvents);
  }

}
