import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IReconcilitionReq } from "./models/transactiosbyaccountrequest";
import { IReconciliationRes } from "./models/transactionsbyaccountresponse";
import { ReconciliationService } from "./services/reconciliation.service";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
//import { IMyDpOptions } from "mydatepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-transactions-by-account',
  templateUrl: './transactions-by-account.component.html',
  styleUrls: ['./transactions-by-account.component.scss']
})
export class TransactionsByAccountComponent implements OnInit {
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowCustomerId: boolean;
  invalidDate: boolean = false;
  pageUnReconcileClick: any = false;
  pageReconcileClick: any = false;
  requsetedCustomerId: any;
  customerId: any;
  btnName: string;
  toDate: any;
  fromDate: any;
  unReconileClick: boolean = false;
  reconcileClick: boolean = false;
  disableSubmit: boolean;
  disableViewButton: boolean;
  sessionContextResponse: IUserresponse;
  disableSearchButton: boolean;
  Homepage: any = true;
  tablehide: boolean = false;
  total: any;
  CustomerPattern: any = "[0-9]*";
  systemActivities: ISystemActivities;
  transactionActivitiesForm: FormGroup;
  reconciliationReq: IReconcilitionReq = <IReconcilitionReq>{};
  transactionres: IReconciliationRes[];
  timePeriod: Date[];
  transactionLength: any;
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
  constructor(private reconciliationServices: ReconciliationService, private datePickerFormatService: DatePickerFormatService, private context: SessionService, private router: Router, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.transactionActivitiesForm = new FormGroup({
      "timePeriod": new FormControl('', [Validators.required]),
      "customer": new FormControl('', [Validators.maxLength(10), Validators.pattern(this.CustomerPattern)])
    });
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TRIPVSFINANCERECONCILIATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.dateBind();
    this.sessionContextResponse = this.context.customerContext;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableSubmit = !this.commonService.isAllowed(Features[Features.TRIPVSFINANCERECONCILIATION], Actions[Actions.SEARCH], "");
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
  }

  dateBind(): void {
    let date = new Date();
    this.transactionActivitiesForm.patchValue({
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
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitiesForm.controls['timePeriod'].value);
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.transactionActivitiesForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }


  searchClick() {
    this.pageReconcileClick = true;
    this.pageUnReconcileClick = false;
    this.btnName = "Reconciled";
    this.reconcileClick = true;
    this.pageChanged(1);
    this.endItemNumber = 10;
  }

  searchClicked(p: number) {
    if (this.transactionActivitiesForm.valid) {
      let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitiesForm.controls['timePeriod'].value);
      this.reconciliationReq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.reconciliationReq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.tablehide = true;
      let startDate: any = new Date();
      let endDate: any = new Date();
      let strDate = this.transactionActivitiesForm.value.timePeriod;
      let isVariance: boolean;
      if (this.reconcileClick) {
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.TRIPVSFINANCERECONCILIATION];
        userEvents.ActionName = Actions[Actions.SEARCH];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitiesForm.controls['timePeriod'].value);
        this.reconciliationReq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
        this.reconciliationReq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
        // this.reconciliationReq.StartDate = new Date(new Date(this.timePeriod[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
        // this.reconciliationReq.EndDate = new Date(new Date(this.timePeriod[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
        this.requsetedCustomerId = this.transactionActivitiesForm.value.customer;
        this.customerId = this.requsetedCustomerId;
        this.fromDate = this.reconciliationReq.StartDate;
        this.toDate = this.reconciliationReq.EndDate;
        this.reconcileClick = false;
        this.getTransactionByAccount(false, this.requsetedCustomerId, p, userEvents);
      } else {
        this.reconciliationReq.StartDate = this.fromDate;
        this.reconciliationReq.EndDate = this.toDate;
        this.requsetedCustomerId = this.customerId;
        this.getTransactionByAccount(false, this.requsetedCustomerId, p);
      }
    }
    else {
      this.validateAllFormFields(this.transactionActivitiesForm);
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


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.pageUnReconcileClick) {
      this.unReconsiled(this.p);
      this.reconcileClick = false;
    }
    else {
      this.searchClicked(this.p);
      this.unReconileClick = false;
    }
  }

  unReconsile() {
    if (this.transactionActivitiesForm.valid) {
      this.unReconileClick = true;
      this.pageUnReconcileClick = true;
      this.pageReconcileClick = false;
      this.pageChanged(1);
      this.endItemNumber = 10;
    }
    else {
      this.validateAllFormFields(this.transactionActivitiesForm);
    }
  }

  unReconsiled(p: any) {

    this.btnName = "Unreconciled";
    this.tablehide = true;
    let startDate: any = new Date();
    let endDate: any = new Date();
    let isVariance: boolean;
    if (this.unReconileClick) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TRIPVSFINANCERECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitiesForm.controls['timePeriod'].value);
      this.reconciliationReq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.reconciliationReq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      // this.reconciliationReq.StartDate = new Date(new Date(this.timePeriod[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
      // this.reconciliationReq.EndDate = new Date(new Date(this.timePeriod[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
      this.requsetedCustomerId = this.transactionActivitiesForm.value.customer;
      this.customerId = this.requsetedCustomerId;
      this.fromDate = this.reconciliationReq.StartDate;
      this.toDate = this.reconciliationReq.EndDate;
      this.unReconileClick = false;
      this.getTransactionByAccount(true, this.requsetedCustomerId, p, userEvents);
    } else {
      this.reconciliationReq.StartDate = this.fromDate;
      this.reconciliationReq.EndDate = this.toDate;
      this.requsetedCustomerId = this.customerId;
      this.getTransactionByAccount(true, this.requsetedCustomerId, p);
    }
  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  resetbtn() {
    this.pageReconcileClick = false;
    this.pageUnReconcileClick = false;
    this.customerId = "";
    this.reconcileClick = false;
    this.unReconileClick = false;
    this.transactionActivitiesForm.controls['customer'].reset();
    this.dateBind();
    this.tablehide = false;
  }

  getTransactionByAccount(isVariance, CustomerId, p: number, userEvents?: IUserEvents): void {
    $('#pageloader').modal('show');
    this.reconciliationReq.IsSearch = true;
    if (CustomerId > 0) {
      this.reconciliationReq.CustomerId = CustomerId;
    }
    else {
      this.reconciliationReq.CustomerId = 0;
    }
    if (!isVariance) {
      this.reconciliationReq.IsVariance = 0;
    }
    else {
      this.reconciliationReq.IsVariance = 1;
    }
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.reconciliationReq.PageNumber = p;
    this.reconciliationReq.PageSize = 10;
    this.reconciliationReq.User = "RAJA";
    this.reconciliationReq.SortColumn = "CustomerId";
    this.reconciliationReq.SortDir = 1;
    this.reconciliationReq.SystemActivity = this.systemActivities;
    this.reconciliationServices.getTransactionByAccountService(this.reconciliationReq, userEvents).subscribe(res => {
      this.transactionres = res;
      $('#pageloader').modal('hide');
      this.transactionLength = this.transactionres.length;
      if (this.transactionres && this.transactionres.length > 0) {
        this.totalRecordCount = this.transactionres[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    })
  }

  // sortDirection(SortingColumn) {
  //   this.gridArrowCustomerId = false;

  //   this.sortingColumn = SortingColumn;
  //   if (this.sortingColumn == "CustomerId") {
  //     this.gridArrowCustomerId = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   }

  //   this.getTransactionByAccount(true, this.requsetedCustomerId, this.p);
  // }




}