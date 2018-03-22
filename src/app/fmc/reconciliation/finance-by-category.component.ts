import { Component, OnInit } from '@angular/core';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ReconciliationService } from "./services/reconciliation.service";
import { SessionService } from "../../shared/services/session.service";
import { IFinanceByCategoryReq } from "./models/financebycategoryrequest";
import { IFinanceByCategoryRes } from "./models/financebycategoryresponse";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { Router } from "@angular/router";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-finance-by-category',
  templateUrl: './finance-by-category.component.html',
  styleUrls: ['./finance-by-category.component.scss']
})
export class FinanceByCategoryComponent implements OnInit {
  invalidDate: boolean = false;
  disableSearchButton: boolean;
  sessionContextResponse: any;
  CustomerPattern: any = "[0-9]*";
  tablehide: boolean = false;
  timePeriod: Date[];
  bsRangeValue: any;
  financebycategoryLength: any;
  financebycategoryForm: FormGroup;
  systemActivities: ISystemActivities;
  financebycategoryreq: IFinanceByCategoryReq = <IFinanceByCategoryReq>{};
  financebycatrgoryres: IFinanceByCategoryRes[];
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

  constructor(private reconciliatonService: ReconciliationService, private datePickerFormatService: DatePickerFormatService, private context: SessionService, private router: Router, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    // const startdateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.timePeriod = [new Date(Number(startdateRange[2]), Number(startdateRange[0]) - 1, Number(startdateRange[1])), new Date(Number(startdateRange[2]), Number(startdateRange[0]) - 1, Number(startdateRange[1]))];
    this.financebycategoryForm = new FormGroup({
      "customer": new FormControl('', [Validators.pattern(this.CustomerPattern)]),
      "timePeriod": new FormControl('', [Validators.required]),
    })
    this.dateBind();
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FINANCERECONCILIATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.FINANCERECONCILIATION], Actions[Actions.SEARCH], "");
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
  }
  resetbtn() {
    this.financebycategoryForm.controls['customer'].reset();
    this.dateBind();
    this.tablehide = false;
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.financebycategoryForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }


  dateBind(): void {
    let date = new Date();
    this.financebycategoryForm.patchValue({
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
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.financebycategoryForm.controls['timePeriod'].value);
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  SearchDate() {
    if (this.financebycategoryForm.valid) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.FINANCERECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.tablehide = true;
      let customerId = this.financebycategoryForm.value.customer;
      this.getFinanceByCategory(customerId, userEvents);
    } else {
      this.validateAllFormFields(this.financebycategoryForm);
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

  getFinanceByCategory(customerId, userevents) {
    $('#pageloader').modal('show');
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.financebycategoryForm.controls['timePeriod'].value);
    this.financebycategoryreq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    this.financebycategoryreq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    // this.financebycategoryreq.StartDate = new Date(new Date(this.timePeriod[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    // this.financebycategoryreq.EndDate = new Date(new Date(this.timePeriod[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    this.financebycategoryreq.IsSearch = true;
    if (customerId > 0) {
      this.financebycategoryreq.CustomerId = customerId;
    }
    else {
      this.financebycategoryreq.CustomerId = 0;
    }
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.financebycategoryreq.SystemActivity = this.systemActivities;
    this.reconciliatonService.getFinanceByCategoryService(this.financebycategoryreq, userevents).subscribe(res => {
      $('#pageloader').modal('hide');
      this.financebycatrgoryres = res;
      this.financebycategoryLength = this.financebycatrgoryres.length;
    })
  }
}