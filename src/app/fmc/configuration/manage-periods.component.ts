import { Component, OnInit } from '@angular/core';
import { IPeriodsRequest } from "./models/periodsrequest";
import { IPeriodsresponse } from "./models/periodsresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ConfigurationService } from "./services/configuration.service";
import { IFicalyearResponse } from "./models/fiscalyearresponse";
import { IFiscalyearRequest } from "./models/fiscalyearrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features } from '../../shared/constants';
import { CommonService } from "../../shared/services/common.service";

@Component({
  selector: 'app-manage-periods',
  templateUrl: './manage-periods.component.html',
  styleUrls: ['./manage-periods.component.scss'],
  providers: [ConfigurationService, SessionService]
})

export class ManagePeriodsComponent implements OnInit {
  disableSubmit: boolean;
  sessionService: any;
  sessionContextResponse: any;
  EndDate1: Date;
  objAddPeriodsRequest: IPeriodsRequest;
  errorMessage: any;
  successMessage: any;
  period: any;
  isPeriodAdded: any;
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
  lstperiodRequest: IPeriodsRequest[] = [];
  periodResponse: IPeriodsresponse[];
  fiscalYearRequest: IFiscalyearRequest = <IFiscalyearRequest>{};
  fiscalYearResponse: IFicalyearResponse[];
  objSystemActivities: ISystemActivities;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  strCreate: string;
  constructor(private objConfigurationService: ConfigurationService, private commonService: CommonService, private context: SessionService, private router: Router) { }

  ngOnInit() {
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PERIODS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableSubmit = !this.commonService.isAllowed(Features[Features.PERIODS], Actions[Actions.UPDATE], "");
    this.PeriodsForm = new FormGroup({
      'dropDownValue': new FormControl('', [Validators.required]),
    });

    this.getFiscalYearDetails();
  }


  FiscalYearSelectedChange(selectedValue) {
    this.selectedFiscalYear = this.fiscalYearResponse.filter(x => x.Period == selectedValue)[0].FiscalYearName;
    this.selectedFisalYearPeriod = selectedValue;
    this.getFiscalPeriodsDetails(this.selectedFisalYearPeriod);
  }

  getFiscalYearDetails(): void {
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.LoginId = this.context.customerContext.loginId;
    this.objSystemActivities.UserId = this.context.customerContext.userId;
    this.objSystemActivities.User = this.context.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objConfigurationService.getFiscalyearDetails(this.objSystemActivities).subscribe(res => {
      if (res) {
        this.fiscalYearResponse = res;
        this.FiscalYearSelectedChange(this.fiscalYearResponse.filter(x => x.IsCurrentYear == true)[0].Period);
      }
    });
  }

  getFiscalPeriodsDetails(fiscalYearPeriod: string): void {
    this.objSystemActivities = <ISystemActivities>{};
    this.periodRequest.FiscalYearId = this.selectedFiscalYear;
    this.periodRequest.FiscalYearPeriod = fiscalYearPeriod;
    this.objSystemActivities.LoginId = this.context.customerContext.loginId;
    this.objSystemActivities.UserId = this.context.customerContext.userId;
    this.objSystemActivities.User = this.context.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.periodRequest.SystemActivities = this.objSystemActivities;

    this.objConfigurationService.getFiscalYearPeriods(this.periodRequest).subscribe(res => {
      this.periodResponse = res;
      this.isPeriodAdded = this.periodResponse.filter(x => x.FiscalYearId == this.selectedFiscalYear)[0].IsPeriodAdded;
    });
  }


  submitPeriods() {
    this.CreateFiscalYearPeriods();
  }

  closeErrorMessage() {
    this.errorMessage = false;

  }
  closeSuccessMessage() {
    this.successMessage = false;
  }

  CreateFiscalYearPeriods(): any {
    this.lstperiodRequest = [];
    for (let period of this.periodResponse) {
      this.objAddPeriodsRequest = <IPeriodsRequest>{};
      this.objSystemActivities = <ISystemActivities>{};
      this.objAddPeriodsRequest.FiscalYearId = period.FiscalYearId;
      this.objAddPeriodsRequest.PeriodName = period.PeriodName;
      this.objAddPeriodsRequest.periodStartDate = period.StartDate;
      this.objAddPeriodsRequest.PeriodEndDate = period.EndDate;
      this.objAddPeriodsRequest.Status = period.Status;
      this.objAddPeriodsRequest.User = this.context.customerContext.userName;
      this.objSystemActivities.LoginId = this.context.customerContext.loginId;
      this.objSystemActivities.UserId = this.context.customerContext.userId;
      this.objSystemActivities.User = this.context.customerContext.userName;
      this.objAddPeriodsRequest.SystemActivities = this.objSystemActivities;
      this.lstperiodRequest.push(this.objAddPeriodsRequest);//adding to array  
    }
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PERIODS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.objConfigurationService.createFiscalYearPeriods(this.lstperiodRequest.map(x => Object.assign({}, x)), userEvents).subscribe(res => {
      if (res) {
        this.successMessageBlock("Periods has been created successfully.");
        this.lstperiodRequest = [];
        this.getFiscalPeriodsDetails(this.selectedFisalYearPeriod)
      }
      else {
        this.errorMessageBlock("Error occured while creating the periods.");
        this.lstperiodRequest = [];
        this.getFiscalPeriodsDetails(this.selectedFisalYearPeriod)
      }
    }
      , err => {
        this.errorMessageBlock(err.statusText.toString());
      }
    );
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}

