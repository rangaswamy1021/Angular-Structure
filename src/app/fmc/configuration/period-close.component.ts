import { Component, OnInit, TemplateRef, AfterViewInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { ConfigurationService } from "./services/configuration.service";
import { SessionService } from "../../shared/services/session.service";
import { IPeriodsresponse } from "./models/periodsresponse";
import { Validators, FormControl, FormGroup } from "@angular/forms";
import { IPeriodsRequest } from "./models/periodsrequest";
import { IFiscalyearRequest } from "./models/fiscalyearrequest";
import { IFicalyearResponse } from "./models/fiscalyearresponse";
import { IFiscalyearRequestStatus } from "./models/fiscalyearrequeststatus";
import { BsModalRef } from "ngx-bootstrap";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";

@Component({
  selector: 'app-period-close',
  templateUrl: './period-close.component.html',
  styleUrls: ['./period-close.component.scss']
})
export class PeriodCloseComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  periodResponseLength: number;
  currentFiscalsYear: string;
  popUpModel: boolean;
  fiscalyrName: string;
  selectedValue: string;
  periodIdsStatus: Array<any> = [];
  periodIdStrings: Array<any> = [];
  currentFiscalYear: string;
  currentMonth: string;
  startDateYear: string;
  startDateMonth: string;
  startDateString: string;
  isSubmitEnable: boolean;
  currentYear: string;
  endDate: any;
  startDate: any;
  selectedFiscalPeriod: any;
  FiscalYearPeriod: any;
  selectedFiscalYearId: any;
  selectedFiscalYearPeriod: any;
  selectedFiscalYear: any;
  selectedFisalYearPeriod: string;
  PeriodsForm: FormGroup;
  periodRequest: IPeriodsRequest = <IPeriodsRequest>{};
  periodResponse: IPeriodsresponse[];
  fiscalYearRequest: IFiscalyearRequest = <IFiscalyearRequest>{};
  fiscalYearResponse: IFicalyearResponse[];
  gridData: IPeriodsresponse[];
  objSystemActivities: ISystemActivities;
  fiscalYrStatusRequest: IFiscalyearRequestStatus;
  strCreate: string;

  constructor(private objConfigurationService: ConfigurationService, private context: SessionService, private router: Router, private commonService: CommonService, ) { }

  ngOnInit() {
    this.sessionContextResponse = this.context.customerContext;
    this.PeriodsForm = new FormGroup({
      'dropDownValue': new FormControl('', [Validators.required]),
    });
    this.getFiscalYearDetails();
    this.popUpModel = false;


  }

  FiscalYearSelectedChange(selectedValue) {
    this.selectedFiscalYear = this.fiscalYearResponse.filter(x => x.Period == selectedValue)[0].FiscalYearName;
    this.selectedFisalYearPeriod = selectedValue;
    this.getFiscalPeriodsDetails(this.selectedFisalYearPeriod);
  }

  getFiscalYearDetails(): void {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.LoginId = this.context.customerContext.loginId;
    this.objSystemActivities.UserId = this.context.customerContext.userId;
    this.objSystemActivities.User = this.context.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objConfigurationService.getFiscalyearDetails(this.objSystemActivities, userEvents).subscribe(res => {
      if (res) {
        this.fiscalYearResponse = res;
        // console.log("fiscalYearResponse: ", this.fiscalYearResponse);
        this.FiscalYearSelectedChange(this.fiscalYearResponse.filter(x => x.IsCurrentYear == true)[0].Period);
      }
    });
  }

  getFiscalPeriodsDetails(year: string): void {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.currentFiscalsYear = year;
    this.objSystemActivities = <ISystemActivities>{};
    this.periodRequest.FiscalYearId = this.selectedFiscalYear;
    this.periodRequest.FiscalYearPeriod = year;
    this.objSystemActivities.LoginId = this.context.customerContext.loginId;
    this.objSystemActivities.UserId = this.context.customerContext.userId;
    this.objSystemActivities.User = this.context.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.periodRequest.SystemActivities = this.objSystemActivities;
    this.objConfigurationService.getFiscalYearPeriodsClosing(this.periodRequest, userEvents).subscribe(res => {
      if (res) {
        this.periodResponse = res;
        this.periodResponseLength = this.periodResponse.length;
        this.periodResponse.forEach(element => {
          if (element.Status === "CLOSED") {
            element.isChecked = true;
            this.isSubmitEnable = true;
          } else {
            this.isSubmitEnable = false;
          }
        });
      }
    });
  }

  periodChange(period, i, event) {
    let removedIndex = this.periodIdStrings.indexOf(period.PeriodId);
    if (i == 0 && period.Status === "OPEN" && period.isChecked && event.target.checked) {
      this.periodResponse.forEach(element => {
        if (element.isChecked === undefined && period.Status === "OPEN") {
          return true;
        }
        this.periodIdStrings.push(element.PeriodId);
        //console.log("periodIdStrings", this.periodIdStrings);
      });
    }
    else if (i == 0 && period.Status === "OPEN" && !period.isChecked && !event.target.checked) {
      // alert("You cannot open this period as it`s next period is not closed");
      this.msgFlag = true;
      this.msgType = 'info'
      this.msgTitle = ''
      this.msgDesc = "You cannot open this period as it`s next period is not closed";
      period.isChecked = true;
      event.target.checked = true;
    }
    else if (i != 0 && period.isChecked && event.target.checked) {
      this.currentYear = new Date().getFullYear().toString();
      this.currentMonth = (new Date().getMonth() + 1).toString();
      if (this.currentMonth.length == 1) {
        this.currentMonth = "0" + this.currentMonth;
      } else {
        this.currentMonth = this.currentMonth;
      }
      console.log("this.currentMonth: ", this.currentMonth);
      this.startDateYear = this.periodResponse[i].PeriodStartDate.toString().split("-")[0];
      this.startDateMonth = this.periodResponse[i].PeriodStartDate.toString().split("T")[0].split("-")[1];
      console.log("this.currentMonth: ", this.startDateMonth);
      this.periodIdStrings.push(this.periodResponse[i].PeriodId);
      console.log("periodIdStrings", this.periodIdStrings);
      if (this.periodResponse[i].isChecked == true && event.target.checked && (this.periodResponse[i - 1].isChecked == false || this.periodResponse[i - 1].isChecked == undefined)) {
        // alert("You cannot close this period as it`s previous period is not closed");
        this.msgFlag = true;
        this.msgType = 'info'
        this.msgTitle = ''
        this.msgDesc = "You cannot close this period as it`s previous period is not closed";
        period.isChecked = false;
        event.target.checked = false;
        this.periodIdStrings.splice(removedIndex, 1);
        console.log("periodIdStrings", this.periodIdStrings);

      } else if ((this.startDateMonth == this.currentMonth) && (this.startDateYear == this.currentYear)) {
        this.periodIdStrings.splice(removedIndex, 1);
        // alert("You cannot close this period as it`s a current period");
        this.msgFlag = true;
        this.msgType = 'info'
        this.msgTitle = ''
        this.msgDesc = "You cannot close this period as it`s a current period";
        period.isChecked = false;
        event.target.checked = false;
        console.log("periodIdStrings", this.periodIdStrings);
        return true;
      }
    }
    else if (i == 13 && period.Status === "CLOSED" && !period.isChecked && !event.target.checked) {
      if (this.periodResponse[0].IsCurrentYearClosed == true) {
        // alert("You cannot open this period as fiscal year is already closed");
        this.msgFlag = true;
        this.msgType = 'info'
        this.msgTitle = ''
        this.msgDesc = "You cannot open this period as fiscal year is already closed";
        this.periodResponse[i].isChecked = true;
        event.target.checked = true;
      } else {
        this.isSubmitEnable = false;
        this.periodIdStrings.push(period.PeriodId);
        // period.Status = "OPEN";
        console.log("periodIdStrings : ", this.periodIdStrings);
        return true;
      }
    }
    else if (i != 13 && period.Status === "CLOSED" && !period.isChecked && !event.target.checked) {
      this.currentYear = new Date().getFullYear().toString();
      this.currentMonth = (new Date().getMonth() + 1).toString();
      this.startDateYear = this.periodResponse[i].PeriodStartDate.toString().split("-")[0];
      this.startDateMonth = this.periodResponse[i].PeriodStartDate.toString().split("T")[0].split("-")[1];
      this.isSubmitEnable = false;
      if (this.periodResponse[i].isChecked == false && !event.target.checked && (this.periodResponse[i + 1].isChecked == true)) {
        // alert("You cannot open this period as it`s previous period is not opened");
        this.msgFlag = true;
        this.msgType = 'info'
        this.msgTitle = ''
        this.msgDesc = "You cannot open this period as it`s previous period is not opened";
        period.isChecked = true;
        event.target.checked = true;
      } else if (this.periodResponse[i].isChecked == false && !event.target.checked) {
        // this.periodIdStrings.splice(i, 1);
        this.periodIdsStatus = [];
        this.periodIdStrings.push(period.PeriodId);
        this.isSubmitEnable = false;
        // this.periodIdsStatus.push(period.Status = "OPEN");
      }
    }
    else if (i != 13 && period.Status === "OPEN" || period.Status === "CLOSED" && !period.isChecked && !event.target.checked) {
      if (this.periodResponse[i].isChecked == undefined || this.periodResponse[i].isChecked == false && !event.target.checked && (this.periodResponse[i - 1].isChecked == true)) {
        // alert("You cannot open this period as it`s next period is not closed");
        this.msgFlag = true;
        this.msgType = 'info'
        this.msgTitle = ''
        this.msgDesc = "You cannot open this period as it`s next period is not closed";
        period.isChecked = true;
        event.target.checked = true;
        this.isSubmitEnable = false;
      }
    }
  }

  btnSubmit() {
    let userEvents = <IUserEvents>{};


    this.objSystemActivities = <ISystemActivities>{};
    this.fiscalYrStatusRequest = <IFiscalyearRequestStatus>{};
    this.objSystemActivities.LoginId = this.context.customerContext.loginId;
    this.objSystemActivities.UserId = this.context.customerContext.userId;
    this.objSystemActivities.User = this.context.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.fiscalYrStatusRequest.systemActivities = this.objSystemActivities;
    this.fiscalYrStatusRequest.FiscalYearId = this.selectedFiscalYear;
    this.fiscalYrStatusRequest.PeriodIdsString = this.periodIdStrings.toString();
    this.fiscalYrStatusRequest.User = this.context.customerContext.userName;
    this.periodResponse.forEach(element => {
      if (element.Status === "OPEN" && element.isChecked === true) {
        userEvents.ActionName = Actions[Actions.CLOSED];
        this.periodIdsStatus.push(element.Status = "CLOSED");
      }
      else if (element.Status === "OPEN" && element.isChecked === false) {
        userEvents.ActionName = Actions[Actions.OPEN];
        this.periodIdsStatus.push(element.Status = "OPEN");
      }
      else if (element.Status === "CLOSED" && element.isChecked === false) {
        userEvents.ActionName = Actions[Actions.OPEN];
        this.periodIdsStatus.push(element.Status = "OPEN");
      }
      // else if (element.Status === "CLOSED" && element.isChecked === true) {
      //   this.periodIdsStatus.push(element.Status = "OPEN");
      //   //console.log("PeriodIds Status: ", this.periodIdsStatus);
      // }
      this.userEventsCalling(userEvents);
    });
    this.fiscalYrStatusRequest.Status = this.periodIdsStatus.toString();
    if (this.fiscalYrStatusRequest.Status != "") {
      this.objConfigurationService.updateFiscalYearPeriods(this.fiscalYrStatusRequest, userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgTitle = ''
          this.msgDesc = "Fiscal Period(s) has been updated successfully";
          this.getFiscalPeriodsDetails(this.currentFiscalsYear);
          this.periodIdStrings = [];
          this.periodIdsStatus = [];
        }
      },
        err => {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgTitle = ''
          this.msgDesc = err.statusText.split("<br/>")[0] + " & " + err.statusText.split("<br/>")[1];
        }
      )

    } else if (this.fiscalYrStatusRequest.Status == "") {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgTitle = ''
      this.msgDesc = "No changes to update!!";
    }
  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.PERIODCLOSING];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
}


