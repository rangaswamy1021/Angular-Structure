import { Component, OnInit } from '@angular/core';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ConfigurationService } from "../configuration/services/configuration.service";
import { IFicalyearResponse } from "../configuration/models/fiscalyearresponse";
import { IcloseFiscalyearRequest } from "./models/closefiscalyearrequest";
import { ICloseFiscalYearResponse } from "./models/closefiscalyearresponse";
import { AccountingService } from "./services/accounting.service";
import { IFiscalyearRequest } from "../configuration/models/fiscalyearrequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { IUserEvents } from "../../shared/models/userevents";
import { Actions, LookupTypeCodes, ActivitySource, Features } from '../../shared/constants';
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-close-fiscal-year',
  templateUrl: './close-fiscal-year.component.html',
  styleUrls: ['./close-fiscal-year.component.scss']
})
export class CloseFiscalYearComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  isClosed: boolean;
  closingFiscalYear: boolean;
  systemActivities: ISystemActivities;
  closeFiscalYearForm: FormGroup;
  selectedValue: number;
  selectedFiscalYear: any;
  selectedFisalYearPeriod: any;
  //Trail Balance
  totalEndingBalance: number = 0;
  totalCreditTxnAmount: number = 0;
  totalDebitTxnAmount: number = 0;
  totalOpeningBalance: number = 0;
  //Balance Sheets
  totalAssets: number = 0;
  totalLiabilities: number = 0;
  //Income Summary
  totalNetting: number = 0;
  totalCredit: number = 0;
  totalDebit: number = 0;
  //Revenue and Expenditure
  totalExpenditure: number = 0;
  totalRevenue: number = 0;
  //fiscalyear
  objFiscalYearResponse: IFicalyearResponse[];
  objSystemActivities: ISystemActivities;
  //closeFiscalYear--GetDetails
  closeFiscalYearRequest: IcloseFiscalyearRequest;
  closeFiscalYearRes: ICloseFiscalYearResponse[];
  closeFiscalYearRevenueRes: ICloseFiscalYearResponse[];
  closeFiscalYearTrailBalanceRes: ICloseFiscalYearResponse[];
  closeFiscalYearIncomeSummaryRes: ICloseFiscalYearResponse[];
  closeFiscalYearBalanceSheetRes: ICloseFiscalYearResponse[];

  sessionContextResponse: IUserresponse;
  disableCloseButton: boolean;
  constructor(private materialscriptService: MaterialscriptService, private objSessionService: SessionService, private configService: ConfigurationService, private accountingService: AccountingService, private router: Router, private commonService: CommonService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.closeFiscalYearForm = new FormGroup({
      fiscalYearDropdown: new FormControl()
    });
    this.sessionContextResponse = this.objSessionService.customerContext;
    this.getFiscalYearDetails();

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FISCALYEAR];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableCloseButton = !this.commonService.isAllowed(Features[Features.FISCALYEAR], Actions[Actions.CLOSE], "");
  }
  closeFiscalYearbtn() {
    this.closeFiscalYearBalance();
  }
  //To select A value in dropdown and to get a particular id data
  onFiscalYearSelected(selectedValue) {
    this.isClosed = this.objFiscalYearResponse.filter(x => x.FiscalYearId == selectedValue)[0].Isclosed;
    this.selectedFiscalYear = selectedValue;
    this.selectedFisalYearPeriod = selectedValue;
    this.getProfitRevenueDetails();
    this.getTrialBalanceDetails();
    this.getIncomeSummaryDetails();
    this.getBalanceSheetDetails();
    this.totalOpeningBalance = 0;
    this.totalDebitTxnAmount = 0;
    this.totalCreditTxnAmount = 0;
    this.totalEndingBalance = 0;
    this.totalExpenditure = 0;
    this.totalRevenue = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totalNetting = 0;
    this.totalLiabilities = 0;
    this.totalAssets = 0;
  }
  //To bind Dropdown Values of Fiscal Year
  getFiscalYearDetails(): void {
    let selectedYear;
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
    this.objSystemActivities.UserId = this.objSessionService.customerContext.userId;
    this.objSystemActivities.User = this.objSessionService.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configService.getFiscalyearDetails(this.objSystemActivities).subscribe(res => {
      this.objFiscalYearResponse = res;
      this.onFiscalYearSelected(this.objFiscalYearResponse.filter(x => x.IsCurrentYear == true)[0].FiscalYearId);
      selectedYear = this.objFiscalYearResponse.filter(x => x.IsCurrentYear == true)[0].FiscalYearId;

      this.selectedFiscalYear = selectedYear;
      this.closeFiscalYearForm.patchValue({ fiscalYearDropdown: selectedYear });
    });
  }
  //To Get TrailBalance Details
  getTrialBalanceDetails() {
    this.closeFiscalYearRequest = <IcloseFiscalyearRequest>{};
    this.closeFiscalYearRequest.FiscalYearId = this.selectedFiscalYear;
    this.accountingService.getTrialBalanceDetails(this.closeFiscalYearRequest.FiscalYearId).subscribe(
      res => {
        this.closeFiscalYearTrailBalanceRes = res;
        this.closeFiscalYearTrailBalanceRes.forEach(element => {
          this.totalOpeningBalance += element.OpeningBalance;
          this.totalDebitTxnAmount += element.DebitTxnAmount;
          this.totalCreditTxnAmount += element.CreditTxnAmount;
          this.totalEndingBalance += element.EndingBalance;
        });
      });
  }
  //To Get Profit Revenue Details 
  getProfitRevenueDetails() {
    this.closeFiscalYearRequest = <IcloseFiscalyearRequest>{};
    this.closeFiscalYearRequest.FiscalYearId = this.selectedFiscalYear;
    this.accountingService.getProfitRevenueDetails(this.closeFiscalYearRequest.FiscalYearId).subscribe(
      res => {
        this.closeFiscalYearRevenueRes = res;
        this.closeFiscalYearRevenueRes.forEach(element => {
          this.totalExpenditure += element.Expenditure;
          this.totalRevenue += element.Revenue;
        });
      });
  }
  //To Get IncomeSummary Details
  getIncomeSummaryDetails() {
    this.closeFiscalYearRequest = <IcloseFiscalyearRequest>{};
    this.closeFiscalYearRequest.FiscalYearId = this.selectedFiscalYear;
    this.accountingService.getIncomeSummaryDetails(this.closeFiscalYearRequest.FiscalYearId).subscribe(
      res => {
        this.closeFiscalYearIncomeSummaryRes = res;
        this.closeFiscalYearIncomeSummaryRes.forEach(element => {
          this.totalCredit += element.CreditTxnAmount;
          this.totalDebit += element.DebitTxnAmount;
          this.totalNetting += element.Netting;
        });
      });
  }
  //To Get Balance Sheet Details
  getBalanceSheetDetails(): void {
    this.closeFiscalYearRequest = <IcloseFiscalyearRequest>{};
    this.closeFiscalYearRequest.FiscalYearId = this.selectedFiscalYear;
    this.accountingService.getBalanceSheetDetails(this.closeFiscalYearRequest.FiscalYearId).subscribe(
      res => {
        if (res) {
          this.closeFiscalYearBalanceSheetRes = res;
          this.closeFiscalYearBalanceSheetRes.forEach(element => {
            this.totalLiabilities += element.Liabilities;
            this.totalAssets += element.Assets;
          });
        }
      });
  }
  //To close fiscal year
  closeFiscalYearBalance(): void {
    this.closeFiscalYearRequest = <IcloseFiscalyearRequest>{};
    this.closeFiscalYearRequest.FiscalYearId = this.selectedFiscalYear;
    this.closeFiscalYearRequest.user = "ravi";
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.objSessionService.customerContext.loginId;
    this.systemActivities.UserId = this.objSessionService.customerContext.userId;
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.closeFiscalYearRequest.SystemActivity = this.systemActivities;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FISCALYEAR];
    userEvents.ActionName = Actions[Actions.CLOSE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.accountingService.closeFiscalYearBalances(this.closeFiscalYearRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Fiscal year closed successfully.'
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText;
      }
    )
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}