import { Component, OnInit } from '@angular/core';
import { AmChart, AmChartsService } from "@amcharts/amcharts3-angular";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IDashBoardResponse } from "./models/fmcdashboardres";
import { IDashBoardRequest } from "./models/fmcdashboardreq";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { FMCDashBoardService } from "./services/dashboard.service";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IMyDpOptions } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
declare var $: any;
@Component({
  selector: 'app-clerk-dashboard',
  templateUrl: './clerk-dashboard.component.html',
  styleUrls: ['./clerk-dashboard.component.scss']
})
export class ClerkDashboardComponent implements OnInit {
  invalidDate: boolean;
  disableSearchButton: boolean;
  tableBalanceSheet: boolean = true;
  errorMessage: boolean = false;
  maxDate = new Date();
  dashBoardForm: FormGroup;
  accountReceivables: AmChart;
  resultAccountReceivables: Array<any> = [];
  resultBalanceSheet: Array<any> = [];
  resultAccountPayables: Array<any> = [];
  resultRevenueTrend: Array<any> = [];
  RevenueTrend: AmChart;
  resultCash: Array<any> = [];
  resultRevenue: Array<any> = [];
  objDashBoardResponse: IDashBoardResponse[];
  objDashBoardRequest: IDashBoardRequest = <IDashBoardRequest>{};
  objSystemActivities: ISystemActivities;
  accountPayables: AmChart;
  cashInflow: AmChart;
  revenueBreakdown: AmChart;
  chart: AmChart;
  // dateValue: Date;
  statusSelectedItem: String;
  myDatePickerOptions: ICalOptions =
  {
    disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 },
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false,
    showClearDateBtn: false

  };
  constructor(private datePickerFormatService: DatePickerFormatService, private AmCharts: AmChartsService, private commonService: CommonService, private objSessionService: SessionService, private dashboardService: FMCDashBoardService, private router: Router) { }

  ngOnInit() {
    this.dashBoardForm = new FormGroup({
      'date': new FormControl('', [Validators.required])
    });
    $('#pageloader').modal('show');
    // this.dateValue = new Date(Date.now());
    let userEvents: IUserEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    let date = new Date();
    this.dashBoardForm.patchValue({
      date: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.getRevenueDetails(userEvents);
    this.getCashFlowDetails();
    this.getAccountPayablesDetails();
    this.getAccountReceivablesDetails();
    this.getBalanceSheetsDetails();
    this.revenueTrend("DAY");
    // this.maxDate = new Date(Date.now());
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.FINANCEDASHBOARD], Actions[Actions.SEARCH], "");
    $('#pageloader').modal('hide');
  }

  onDateFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;

  }

  onsubmit() {
    if (this.invalidDate) {
      return;
    }
    // this.dateValue = this.dashBoardForm.controls.date.value;
    let userEvents: IUserEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.userEventsCalling(userEvents);
    this.getRevenueDetails(userEvents);
    this.getCashFlowDetails();
    this.revenueTrend("DAY");
    this.getAccountPayablesDetails();
    this.getAccountReceivablesDetails();
    this.getBalanceSheetsDetails();
  }

  getCommonDetails() {
    this.objSystemActivities = <ISystemActivities>{};
    this.objDashBoardRequest = <IDashBoardRequest>{};
    let date = this.dashBoardForm.controls.date.value;
    this.objDashBoardRequest.Date = new Date(new Date(this.datePickerFormatService.getFormattedDate(date.date)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
    // this.objDashBoardRequest.Date = new Date(this.dateValue.toLocaleString()).toDateString();
    this.objDashBoardRequest.CurrencySymbol = "$";
    this.objSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
    this.objSystemActivities.UserId = this.objSessionService.customerContext.userId;
    this.objSystemActivities.User = this.objSessionService.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.IsSearch = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objDashBoardRequest.systemactivities = this.objSystemActivities;
  }

  getRevenueDetails(userEvents?: IUserEvents) {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Revenue";
    this.objDashBoardRequest.RollUpLevel = "YEAR";
    this.dashboardService.getRevenue(this.objDashBoardRequest, userEvents).subscribe(res => {
      this.resultRevenue = res;
      this.getRevenueBreakdown();
    });
  }

  getCashFlowDetails() {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Cash Inflow";
    this.objDashBoardRequest.RollUpLevel = "YEAR";
    this.dashboardService.getCash(this.objDashBoardRequest).subscribe(res => {
      this.resultCash = res;
      this.getCashInflow();
    });
  }

  getRevenueTrendDetails(period) {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Revenue Trend";
    this.objDashBoardRequest.RollUpLevel = period;
    this.dashboardService.getRevenueTrend(this.objDashBoardRequest).subscribe(res => {
      this.resultRevenueTrend = res;
      this.getRevenueTrend();
    });
  }

  getAccountPayablesDetails() {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Account Payables";
    this.objDashBoardRequest.RollUpLevel = "YEAR";
    this.dashboardService.getAccountPayables(this.objDashBoardRequest).subscribe(res => {
      this.resultAccountPayables = res;
      this.getAccountPayables();
    });
  }

  getAccountReceivablesDetails() {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Account Receivables";
    this.objDashBoardRequest.RollUpLevel = "YEAR";
    this.dashboardService.getAccountReceivables(this.objDashBoardRequest).subscribe(res => {
      this.resultAccountReceivables = res;
      this.getAccountReceivables();
    });
  }

  getBalanceSheetsDetails() {
    this.getCommonDetails();
    this.objDashBoardRequest.DashBoardTitle = "Balance Sheets";
    this.objDashBoardRequest.RollUpLevel = "YEAR";
    this.dashboardService.getBalanceSheets(this.objDashBoardRequest).subscribe(res => {
      this.resultBalanceSheet = res;
      this.getBalanceSheets();
      if (this.resultBalanceSheet[0].Value != "0.00" || this.resultBalanceSheet[1].Value != "0.00" || this.resultBalanceSheet[2].Value != "0.00") {
        this.AmCharts.updateChart(this.chart, () => {
          this.chart.dataProvider = this.resultBalanceSheet;
        });
        this.errorMessage = false;
      }
      else {
        this.errorMessage = true;
      }
    });
  }

  revenueTrend(rollUp) {
    this.statusSelectedItem = rollUp;
    if (rollUp == "DAY") {
      this.getRevenueTrendDetails("DAY");
    } else if (rollUp == "MONTH") {
      this.getRevenueTrendDetails("MONTH");
    } else if (rollUp == "QUARTER") {
      this.getRevenueTrendDetails("QUARTER");
    } else if (rollUp == "YEAR") {
      this.getRevenueTrendDetails("YEAR");
    }

  }

  getRevenueBreakdown() {
    this.revenueBreakdown = this.AmCharts.makeChart("revenueBreakdown", {
      "type": "serial",
      "theme": "light",
      "hideCredits": true,
      "marginRight": 70,
      "legend": {
        "autoMargins": false,
        "equalWidths": true,
        "horizontalGap": 2,
        "verticalGap": 1,
        "markerSize": 7,
        "useGraphSettings": false,
        "valueAlign": "left",
        "valueWidth": 0,
        "data": this.resultRevenue,
        "marginBottom": 10,
        "marginLeft": 90
      },
      "dataProvider": this.resultRevenue,
      "valueAxes": [{
        "position": "left",
        "axisAlpha": 0,
        "labelFunction": function (value) {
          return "$" + Math.round(value);
        }
      }],
      "startDuration": 0.1,
      "graphs": [{
        "balloonText": "<b>[[category]]:  " + "[[BalloonText]]</b>",
        "labelText": "[[BalloonText]]",
        "colorField": "color",
        "labelPosition": "top",
        "fontSize": 10,
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "Value",
        "columnWidth": 0.3,

        "labelEnable": "true",
        "fixedColumnWidth": 30

      }],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },

      "categoryField": "title",
      "categoryAxis": {
        "labelsEnabled": false,
        "gridPosition": "start",
        "labelRotation": 0,
        "axisAlpha": 0,
      },

      "export": {
        "enabled": true
      }
    });
  }

  getCashInflow() {
    this.cashInflow = this.AmCharts.makeChart("cashInflow", {
      "type": "serial",
      "hideCredits": true,
      "dataProvider": this.resultCash,
      "theme": "light",
      "legend": {
        "autoMargins": false,
        "equalWidths": true,
        "horizontalGap": 2,
        "verticalGap": 1,
        "markerSize": 7,
        "useGraphSettings": false,
        "valueAlign": "left",
        "valueWidth": 0,
        "data": this.resultCash,
        "marginBottom": 10,
        "marginLeft": 70
      },
      "graphs": [{
        "balloonText": "<b>[[category]]:  " + "[[BalloonText]]</b>",
        "labelText": "[[BalloonText]]",
        "colorField": "color",
        "labelPosition": "top",
        "fontSize": 10,
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "Value",
        "columnWidth": 0.3,
        "labelEnable": "true",
        "fixedColumnWidth": 30
      }],
      "valueAxes": [{
        "position": "left",
        "axisAlpha": 0,
        "labelFunction": function (value) {
          return "$" + Math.round(value);
        }
      }],
      "startDuration": 0.1,
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "title",
      "categoryAxis": {
        "labelsEnabled": false,
        "gridPosition": "start",
        "axisAlpha": 0,
        "position": "left",
        "labelRotation": 15
      },
      "export": {
        "enabled": true
      }
    });
  }

  getRevenueTrend() {
    this.RevenueTrend = this.AmCharts.makeChart("RevenueTrend", {
      "type": "serial",
      "theme": "light",
      "hideCredits": true,
      "dataProvider": this.resultRevenueTrend,
      "startDuration": 0.1,
      "graphs": [{
        "balloonText": "[[category]]: " + "[[BalloonText]]",
        "labelText": "[[BalloonText]]",
        "bullet": "round",
        "lineThickness": 2,
        "bulletBorderAlpha": 1,
        "bulletBorderColor": "#FFFFFF",
        "valueField": "Value",
        "lineColor": "#67b7dc",
        "fillAlphas": 0,
        "labelPosition": "top",
      }],
      "valueAxes": [
        {
          "position": "left",
          "axisAlpha": 0,
          "labelFunction": function (value) {
            return "$" + Math.round(value);
          }
        }
      ],
      "chartCursor": {
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "title",
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0.1,
        "fillColor": "#000000",
        "position": "bottom",
        "labelRotation": 0
      },
    });
  }

  getAccountPayables() {
    this.accountPayables = this.AmCharts.makeChart("accountPayables", {
      "type": "serial",
      "theme": "light",
      "hideCredits": true,
      "legend": {
        "autoMargins": false,
        "equalWidths": true,
        "horizontalGap": 2,
        "verticalGap": 1,
        "markerSize": 7,
        "useGraphSettings": false,
        "valueWidth": 0,
        "data": this.resultAccountPayables,
        "marginBottom": 10,
        "marginLeft": 70
      },
      "marginRight": 70,
      "dataProvider": this.resultAccountPayables,
      "valueAxes": [{
        "position": "left",
        "axisAlpha": 0,
        "labelFunction": function (value) {
          return "$" + Math.round(value);
        }
      }],
      "startDuration": 0.1,
      "graphs": [{
        "balloonText": "<b>[[category]]:  " + "[[BalloonText]]</b>",
        "labelText": "[[BalloonText]]",
        "colorField": "color",
        "labelPosition": "top",
        "fontSize": 10,
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "Value",
        "fixedColumnWidth": 30
      }],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "title",
      "categoryAxis": {
        "labelsEnabled": false,
        "gridPosition": "start",
        "axisAlpha": 0,
        "position": "left"

      },
      "export": {
        "enabled": true
      }
    });
  }

  getAccountReceivables() {
    this.accountReceivables = this.AmCharts.makeChart("accountReceivables", {
      "type": "serial",
      "theme": "light",
      "hideCredits": true,
      "legend": {
        "autoMargins": false,
        "equalWidths": true,
        "horizontalGap": 2,
        "verticalGap": 1,
        "markerSize": 7,
        "useGraphSettings": false,
        "valueAlign": "left",
        "valueWidth": 0,
        "data": this.resultAccountReceivables,
        "marginBottom": 10,
        "marginLeft": 70
      },
      "marginRight": 70,
      "dataProvider": this.resultAccountReceivables,
      "valueAxes": [{
        "position": "left",
        "axisAlpha": 0,
        "labelFunction": function (value) {
          return "$" + Math.round(value);
        }
      }],
      "startDuration": 0.1,
      "graphs": [{
        "balloonText": "<b>[[category]]:  " + "[[BalloonText]]</b>",
        "labelText": "[[BalloonText]] ",
        "colorField": "color",
        "labelPosition": "top",
        "fontSize": 10,
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "Value",
        "fixedColumnWidth": 30

      }],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "title",
      "categoryAxis": {
        "gridPosition": "start",
        "labelsEnabled": false,
        "axisAlpha": 0,
        "position": "left",
        "labelRotation": 15,
      },
      "export": {
        "enabled": true
      }
    });
  }

  getBalanceSheets() {
    this.chart = this.AmCharts.makeChart("chart", {
      "type": "pie",
      "theme": "light",
      "hideCredits": true,
      "dataProvider": [],
      "valueField": "Value",
      "titleField": "title",
      //   "radius": "20%",
      "outlineAlpha": 0.8,
      "innerRadius": "60%",
      //     "labelRadius": 5,
      "precision": 2,
      //      "depth3D": 10,
      "labelText": "[[title]]: [[BalloonText]]",
      "balloonText": "[[title]]:<span style='font-size:10px'><b> [[BalloonText]]</b></span>",
      "angle": 0,
      "export": {
        "enabled": true
      }
    });
  }

  userEventsCalling(userEvents) {
    // let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FINANCEDASHBOARD];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.objSessionService.customerContext.roleID);
    userEvents.UserName = this.objSessionService.customerContext.userName;
    userEvents.LoginId = this.objSessionService.customerContext.loginId;
  }
}
