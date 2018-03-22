import { Component, OnInit } from '@angular/core';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ReconciliationService } from "./services/reconciliation.service";
import { SessionService } from "../../shared/services/session.service";
import { ITransactionRevenueRes } from "./models/transactionrevenueresponse";
import { ITransactionRevenueReq } from "./models/transactionrevenuerequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features, defaultCulture } from '../../shared/constants';
import { CommonService } from "../../shared/services/common.service";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
//import { IMyDpOptions } from "mydatepicker";
declare var $: any;

@Component({
  selector: 'app-transaction-revenue',
  templateUrl: './transaction-revenue.component.html',
  styleUrls: ['./transaction-revenue.component.scss']
})
export class TransactionRevenueComponent implements OnInit {
  tollNameDisplay: any;
  tollName: any = 'ALL';
  transType: any;
  invalidDate: boolean = false;
  tablehide: boolean;
  startDate: any;
  endDate: any;
  tollTypes: any[];
  tablebtn: boolean = false;
  selectedTransactionRevenuedrop: any;
  selectedTransactionRevenue: any;
  timePeriod: Date[];
  transactionrevenueLength: any;
  transactionRevenueForm: FormGroup;
  systemActivities: ISystemActivities;
  transactionrevenueres: ITransactionRevenueRes[];
  transactionrevenuereq: ITransactionRevenueReq = <ITransactionRevenueReq>{}
  disableSubmit: boolean;
  sessionContextResponse: IUserresponse;
  myDateRangePickerOptions: ICalOptions =
  {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false,
    showClearDateBtn: false
  };
  dateFormatValidator = "^\\(([0]{2})\\-[ ]([0]{2})[-]([0]{4}))$";
  dateRange;

  constructor(private reconciliationService: ReconciliationService, private datePickerFormatService: DatePickerFormatService, private context: SessionService, private commonService: CommonService, private router: Router) { }
  ngOnInit() {
    this.transactionRevenueForm = new FormGroup({
      "TransactionCategory": new FormControl(''),
      "timePeriod": new FormControl('', [Validators.required]),
    })
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TRANSACTIONREVENUERECONCILIATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.sessionContextResponse = this.context.customerContext;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableSubmit = !this.commonService.isAllowed(Features[Features.TRANSACTIONREVENUERECONCILIATION], Actions[Actions.SEARCH], "");
    this.dateBind();
    this.getDropDown();
    this.transactionRevenueForm.controls['TransactionCategory'].setValue("");
  }

  tollTransType(event) {
    switch (event.target.value) {
      case "TOLL":
        this.transType = event.target[1].index;
        this.tollName = event.target.value;
        break;
      case "PARKING":
        this.transType = event.target[2].index;
        this.tollName = event.target.value;
        break;
      case "FERRY":
        this.transType = event.target[3].index;
        this.tollName = event.target.value;
        break;
      case "TRANSIT":
        this.transType = event.target[4].index;
        this.tollName = event.target.value;
        break;
      default:
        this.transType = event.target[0].index;
        this.tollName = "Transactions";
    }
  }

  getDropDown(): void {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.transactionrevenuereq.SystemActivity = this.systemActivities;
    this.commonService.getTollTypesLookups().subscribe(res => {
      this.tollTypes = res;
    })
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.transactionRevenueForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  searchClick() {
    if (this.transactionRevenueForm.valid) {
      this.tollNameDisplay = this.tollName;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TRANSACTIONREVENUERECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.tablehide = true;
      this.tablebtn = true;
      // let startDate: any = new Date();
      // let endDate: any = new Date();
      // let strDate = this.transactionRevenueForm.value.timePeriod;
      // if (strDate) {
      // let strDateRange = strDate.slice(",");
      // startDate = new Date(new Date(strDateRange[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
      // endDate = new Date(new Date(strDateRange[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
      // }
      this.getTrasactionRevenue(userEvents);
    }
    else {
      this.validateAllFormFields(this.transactionRevenueForm);
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

  dateBind(): void {
    let date = new Date();
    this.transactionRevenueForm.patchValue({
      timePeriod: {
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
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionRevenueForm.controls['timePeriod'].value);
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  resetbtn() {
    this.dateBind();
    this.transactionRevenueForm.controls['TransactionCategory'].setValue("");
    this.tollName = 'ALL';
    this.tablehide = false;
  }

  getTrasactionRevenue(userEvents?: IUserEvents): void {
    $('#pageloader').modal('show');
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionRevenueForm.controls['timePeriod'].value);
    this.transactionrevenuereq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    this.transactionrevenuereq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    // this.transactionrevenuereq.StartDate = startDate;
    // this.transactionrevenuereq.EndDate = endDate;
    this.transactionrevenuereq.CustomerId = 0;
    this.transactionrevenuereq.IsSearch = true;
    this.transactionrevenuereq.TransactionCategory = this.transType;
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.transactionrevenuereq.SystemActivity = this.systemActivities;
    this.reconciliationService.getTransactionRevenueService(this.transactionrevenuereq, userEvents)
      .subscribe(res => {
         $('#pageloader').modal('hide');
        this.transactionrevenueres = res;
        this.transactionrevenueLength = this.transactionrevenueres.length;
      });
  }
}