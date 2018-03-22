import { Component, OnInit } from "@angular/core";
import { ITrailBalanceRequest } from "./models/trialBalanceRequest";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ITrailBalanceResponse } from "./models/trialBalanceResponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { AccountingService } from "./services/accounting.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyDrpOptions } from "mydaterangepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-trail-balance',
  templateUrl: './trail-balance.component.html',
  styleUrls: ['./trail-balance.component.scss']
})
export class TrailBalanceComponent implements OnInit {
  invalidDate: boolean = false;
  disableSearchButton: boolean;
  beginningBal: Array<number> = [];
  debitAmount: Array<number> = [];
  endingBal: Array<number> = [];
  creditAmount: Array<number> = [];
  currentPage: number = 1;
  pageItemNumber: number = 10;
  endItemNumber: number;
  startItemNumber: number = 1;
  trialBalResLength: number;
  // timePeriodValue: Date[];
  sessionContextResponse: IUserresponse;
  trialBalRes: ITrailBalanceResponse[] = <ITrailBalanceResponse[]>{};
  trialBalReq: ITrailBalanceRequest;
  trialBalanceForm: FormGroup;
  begBal: string;
  debAmt: string;
  credAmt: string;
  endBal: string;
  myDateRangePickerOptions: ICalOptions = {
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
    showClearDateRangeBtn: false
  };


  constructor(private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService, private accountingService: AccountingService, private sessionContext: SessionService, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.trialBalanceForm = new FormGroup({
      'timePeriod': new FormControl('', [Validators.required])
    });
    this.dateBind();
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TRIALBALANCE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.TRIALBALANCE], Actions[Actions.SEARCH], "");
    this.getTrialbalance(null);
  }

  dateBind(): void {
    let date = new Date();
    this.trialBalanceForm.patchValue({
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
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  submitTrialBalanceDetails() {
    if (this.trialBalanceForm.valid && this.invalidDate == false) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TRIALBALANCE];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getTrialbalance(userEvents);
      this.clearTotals();
    } else {
      this.validateAllFormFields(this.trialBalanceForm);
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

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.trialBalanceForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  getTrialbalance(userEvents: any): void {
    this.trialBalReq = <ITrailBalanceRequest>{};
    this.trialBalReq.SystemActivities = <ISystemActivities>{};
    this.trialBalReq.User = this.sessionContextResponse.userName;
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.trialBalanceForm.controls['timePeriod'].value);
    this.trialBalReq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    this.trialBalReq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    // this.trialBalReq.StartDate = new Date(new Date(this.timePeriodValue[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    // this.trialBalReq.EndDate = new Date(new Date(this.timePeriodValue[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    this.trialBalReq.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.trialBalReq.SystemActivities.LoginId = this.sessionContextResponse.loginId;
    this.trialBalReq.SystemActivities.UserId = this.sessionContextResponse.userId;
    this.trialBalReq.SystemActivities.IsSearch = true;

    this.accountingService.getTrialbalance(this.trialBalReq, userEvents).subscribe(
      res => {
        this.trialBalRes = res;
        this.trialBalResLength = this.trialBalRes.length;
        this.trialBalRes.forEach(element => {
          this.beginningBal.push(element.OpeningBalance);
          this.debitAmount.push(element.DebitTxnAmount);
          this.creditAmount.push(element.CreditTxnAmount);
          this.endingBal.push(element.EndingBalance);
        });

        this.begBal = this.beginningBal.reduce((a, b) => a + b, 0).toFixed();
        this.debAmt = this.debitAmount.reduce((a, b) => a + b, 0).toFixed();
        this.credAmt = this.creditAmount.reduce((a, b) => a + b, 0).toFixed();
        this.endBal = this.endingBal.reduce((a, b) => a + b, 0).toFixed();
      })
  }

  resetTrialBalance() {
    this.dateBind();
    this.getTrialbalance(null);
    this.clearTotals();
  }

  clearTotals() {
    this.beginningBal = [];
    this.debitAmount = [];
    this.creditAmount = [];
    this.endingBal = [];
  }
}
