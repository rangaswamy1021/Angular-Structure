import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ITagDepositReq } from "./models/tagdepositrequest";
import { ITagDepositRes } from "./models/tagdepositresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { ReconciliationService } from "./services/reconciliation.service";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-tag-deposit',
  templateUrl: './tag-deposit.component.html',
  styleUrls: ['./tag-deposit.component.scss']
})

export class TagDepositComponent implements OnInit {
  invalidDate: boolean = false;
  pageReconcileClick: boolean = false;
  pageUnReconcileClick: boolean = false;
  unReconileClick: boolean = false;
  toDate: any;
  fromDate: any;
  customerId: any;
  requestedCustomerId: any;
  reconcileClick: boolean = false;
  btnName: string;
  disableSearchButton: boolean;
  sessionContextResponse: IUserresponse;
  tagdepositTransactionLength: number;
  tableHide: boolean;
  systemActivities: ISystemActivities;
  OnlyNumbers: any = "[0-9]*";
  timePeriod: Date[];
  tagdepositForm: FormGroup;
  tagdepositreq: ITagDepositReq = <ITagDepositReq>{};
  tagdepositres: ITagDepositRes[];
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  bsRangeValue: any;
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
    showClearDateBtn: false,
  };
  dateFormatValidator = "^\\(([0]{2})\\-[ ]([0]{2})[-]([0]{4}))$";
  dateRange;
  constructor(private reconciliatonService: ReconciliationService, private datePickerFormatService: DatePickerFormatService, private context: SessionService, private router: Router, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.tagdepositForm = new FormGroup({
      'customer': new FormControl('', [Validators.pattern(this.OnlyNumbers)]),
      "timePeriod": new FormControl('', [Validators.required]),
    })
    this.dateBind();
    // const startdateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.timePeriod = [new Date(Number(startdateRange[2]), Number(startdateRange[0]) - 1, Number(startdateRange[1])), new Date(Number(startdateRange[2]), Number(startdateRange[0]) - 1, Number(startdateRange[1]))];
    // this.tagdepositForm = new FormGroup({
    //   'customer': new FormControl('', [Validators.pattern(this.OnlyNumbers)]),
    //   'timePeriod': new FormControl('', []),
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TAGVSFINANCERECONCILIATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.TAGVSFINANCERECONCILIATION], Actions[Actions.SEARCH], "");
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.pageUnReconcileClick) {
      this.showUnreconciledItems(this.p);
      this.reconcileClick = false;
    }
    else {
      this.showReconciledItems(this.p);
      this.unReconileClick = false;
    }
  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  showUnreconciled() {
    if (this.tagdepositForm.valid) {
      this.pageUnReconcileClick = true;
      this.pageReconcileClick = false;
      this.unReconileClick = true;
      this.pageChanged(1);
      this.endItemNumber = 10;
    }
    else {
      this.validateAllFormFields(this.tagdepositForm);
    }
  }

  showUnreconciledItems(p: number) {
    $('#pageloader').modal('show');
    this.btnName = "Unreconciled";
    this.tableHide = true;
    if (this.unReconileClick) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TAGVSFINANCERECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.tagdepositForm.controls['timePeriod'].value);
      this.tagdepositreq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.tagdepositreq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.requestedCustomerId = this.tagdepositForm.value.customer;
      this.fromDate = this.tagdepositreq.StartDate;
      this.toDate = this.tagdepositreq.EndDate;
      this.customerId = this.requestedCustomerId;
      this.unReconileClick = false;
      this.getTagVsFinanceReconciliation(true, this.requestedCustomerId, p, userEvents);
    } else {
      this.tagdepositreq.StartDate = this.fromDate;
      this.tagdepositreq.EndDate = this.toDate;
      this.requestedCustomerId = this.customerId;
      this.getTagVsFinanceReconciliation(true, this.requestedCustomerId, p);
    }
  }

  showReconciled() {
    if (this.tagdepositForm.valid) {
      this.pageReconcileClick = true;
      this.pageUnReconcileClick = false;
      this.reconcileClick = true;
      this.pageChanged(1);
      this.endItemNumber = 10;
    }
    else {
      this.validateAllFormFields(this.tagdepositForm);
    }
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.tagdepositForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  showReconciledItems(p: number) {
    $('#pageloader').modal('show');
    this.btnName = "Reconciled";
    this.tableHide = true;
    if (this.reconcileClick) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TAGVSFINANCERECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      // this.tagdepositreq.StartDate = new Date(new Date(this.timePeriod[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      // this.tagdepositreq.EndDate = new Date(new Date(this.timePeriod[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      console.log(this.tagdepositForm.controls['timePeriod'].value);
      let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.tagdepositForm.controls['timePeriod'].value);
      this.tagdepositreq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.tagdepositreq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.requestedCustomerId = this.tagdepositForm.value.customer;
      this.customerId = this.requestedCustomerId;
      this.fromDate = this.tagdepositreq.StartDate;
      this.toDate = this.tagdepositreq.EndDate;
      this.reconcileClick = false;
      this.getTagVsFinanceReconciliation(false, this.requestedCustomerId, p, userEvents);
    } else {
      this.tagdepositreq.StartDate = this.fromDate;
      this.tagdepositreq.EndDate = this.toDate;
      this.requestedCustomerId = this.customerId;
      this.getTagVsFinanceReconciliation(false, this.requestedCustomerId, p);
    }
  }

  getTagVsFinanceReconciliation(isVariance, customerId, p, userEvents?: IUserEvents) {
    this.tagdepositreq.IsSearch = true;
    if (customerId > 0) {
      this.tagdepositreq.CustomerId = customerId;
    }
    else {
      this.tagdepositreq.CustomerId = 0;
    }
    if (!isVariance) {
      this.tagdepositreq.IsVariance = 0;
    }
    else {
      this.tagdepositreq.IsVariance = 1;
    }
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.tagdepositreq.PageNumber = this.p;
    this.tagdepositreq.PageSize = 10;
    this.tagdepositreq.User = this.context.customerContext.userName;
    this.tagdepositreq.SortColumn = "CustomerId";
    this.tagdepositreq.SortDir = "";
    this.tagdepositreq.SystemActivity = this.systemActivities;
    this.reconciliatonService.getTagVsFinanceReconciliation(this.tagdepositreq, userEvents).subscribe(res => {
      this.tagdepositres = res;
      $('#pageloader').modal('hide');
      this.tagdepositTransactionLength = this.tagdepositres.length;
      if (this.tagdepositres && this.tagdepositres.length > 0) {
        this.totalRecordCount = this.tagdepositres[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
        else {
          this.validateAllFormFields(this.tagdepositForm);
        }
      }
    })
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  dateBind(): void {
    let date = new Date();
    this.tagdepositForm.patchValue({
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
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.tagdepositForm.controls['timePeriod'].value);
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  onResetClick() {
    this.pageReconcileClick = false;
    this.pageUnReconcileClick = false;
    this.unReconileClick = false;
    this.reconcileClick = false;
    this.tableHide = false;
    this.dateBind();
    this.tagdepositForm.controls['customer'].reset();
    let customerId = this.tagdepositForm.value.customerId;
    let isVariance: boolean;
    this.getTagVsFinanceReconciliation(true, customerId, null);
  }
}