import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IGeneralLedgerRequest } from "./models/generalledgerrequest";
import { IGeneralLedgerResponse } from "./models/generalledgerresponse";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IsystemActivityrequest } from "../../csc/dashboard/models/systemactivitiesrequest";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IUserresponse } from "../../shared/models/userresponse";
import { AccountingService } from "./services/accounting.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyDrpOptions } from "mydaterangepicker";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-general-ledger',
  templateUrl: './general-ledger.component.html',
  styleUrls: ['./general-ledger.component.scss']
})
export class GeneralLedgerComponent implements OnInit {
  invalidDate: boolean = false;
  disableSearchButton: boolean;
  chartOfAcntId: any;
  selectedValue: any;
  errorBlock: boolean = false;
  successBlock: boolean = false;
  errorMessage: string;
  searchCheck: boolean = false;
  // timePeriodValue: Date[];
  totDebitAmount: number;
  totCreditAmount: number;;
  sessionContextResponse: IUserresponse;
  genAccountsDropdown: any[];
  generalLedgerRequest: IGeneralLedgerRequest;
  generalLedgerResponse: IGeneralLedgerResponse[];
  generalLedgerForm: FormGroup;
  systemActivities: ISystemActivities;
  public value: any = {};
  public items: any[];
  getChartOfActs: Array<any> = [];
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

  constructor(private sessionContext: SessionService, private accountingService: AccountingService, private router: Router, private commonService: CommonService, private datePickerFormatService: DatePickerFormatService) { }
  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.generalLedgerForm = new FormGroup({
      'gLAccount': new FormControl('', [Validators.required]),
      'dateRange': new FormControl('', [Validators.required])
    });

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.GENERALLEDGER];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => res);

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.GENERALLEDGER], Actions[Actions.SEARCH], "");
    this.getChartofAccountsDropDown();
    this.dateBind();
  }

  dateBind(): void {
    let date = new Date();
    this.generalLedgerForm.patchValue({
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
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }
  public selected(value: any) {
    this.selectedValue = value.text;
    this.chartOfAcntId = value.id;
  }

  getChartofAccountsDropDown(): void {
    this.accountingService.getChartOfAccountsDropDown().subscribe(
      res => {
        this.genAccountsDropdown = res;
        this.genAccountsDropdown.forEach(element => {
          this.getChartOfActs.push({ "id": element.ChartOfAccountId, "text": element.AccountDescription });
          this.items = this.getChartOfActs;
        });
      });
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.generalLedgerForm.controls["dateRange"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  search() {
    this.successBlock = true;
    this.searchGeneralLedger();
    this.errorBlock = false;
    this.totDebitAmount = 0;
    this.totCreditAmount = 0;
  }
  searchGeneralLedger(): void {
    if (this.invalidDate == false && this.generalLedgerForm.controls['gLAccount'].value != null && this.generalLedgerForm.controls['gLAccount'].value != '' && this.generalLedgerForm.controls['dateRange'].valid) {
      this.systemActivities = <ISystemActivities>{};
      this.generalLedgerRequest = <IGeneralLedgerRequest>{};
      this.systemActivities.LoginId = this.sessionContextResponse.loginId;
      this.systemActivities.UserId = this.sessionContextResponse.userId;
      this.systemActivities.User = this.sessionContextResponse.userName;
      this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
      let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.generalLedgerForm.controls['dateRange'].value);
      this.generalLedgerRequest.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      this.generalLedgerRequest.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      // this.generalLedgerRequest.StartDate = new Date(new Date(this.timePeriodValue[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      // this.generalLedgerRequest.EndDate = new Date(new Date(this.timePeriodValue[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      this.generalLedgerRequest.ChartOfAccountId = this.chartOfAcntId;
      this.generalLedgerRequest.SystemActivity = this.systemActivities;
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.GENERALLEDGER];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.accountingService.getGeneralLedgerDetails(this.generalLedgerRequest, userEvents).subscribe(
        res => {
          if (res) {
            this.generalLedgerResponse = res;
            this.generalLedgerResponse.forEach(element => {
              this.totDebitAmount += element.DebitAmount;
              this.totCreditAmount += element.CreditAmount;
            });
            this.searchCheck = false;
          }
          else {
            this.searchCheck = true;
          }
        });
    } else {
      this.successBlock = false;
      this.validateAllFormFields(this.generalLedgerForm);
    }
  }
  resetData() {
    this.generalLedgerForm.reset();
    this.dateBind();
    this.errorBlock = false;
    this.successBlock = false;
    this.generalLedgerResponse = [];
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

}







