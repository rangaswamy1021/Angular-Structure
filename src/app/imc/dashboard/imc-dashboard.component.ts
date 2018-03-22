import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { IMCDashboardService } from "./services/imc.dashboard.service";
import { SlicePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CommonService } from "../../shared/services/common.service";
import { Router } from "@angular/router";
import { Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { SessionService } from "../../shared/services/session.service";
declare var $: any;
@Component({
  selector: 'app-imc-dashboard',
  templateUrl: './imc-dashboard.component.html',
  styleUrls: ['./imc-dashboard.component.scss']
})
export class ImcDashboardComponent implements OnInit {
  allowView: boolean;
  read: boolean = false;
  alertResponse = [];
  reminderResponse: any;


  weekly: { "Color": any; "Text": string; "Value": string; "Value1": string; "Value2": any; "Value3": any; "Value4": any; "Value5": any; "ReturnValue": any; "title": any; "color": any; }[];

  customerRequestedAndReceivedCountChart: AmChart;
  vendorRequestedAndReceivedItemsCountChart1: AmChart;
  customerTagsCountChart: AmChart;
  totalCutomerTagsCount = [];
  itemStatusCountChartData = [];
  customerRequestedAndReceivedCountChartData = [];
  vendorRequestedAndReceivedItemsCountChart;
  getCountsBasedOnItemTypeResponse: any;
  itemStatusCountChart;
  dataIS = [];
  statusSelectedItem: String;
  monthlyData = [];
  quarterlyData = [];
  yearlyData = [];
  itemCountData = [];
  itemChartCountData = [];
  getRetailerTagCountChart: AmChart;
  customerGridData: boolean = true;
  customerNoRecordsToDisplay: boolean = true;
  iconsShow: boolean;
  retailerGridData: boolean;
  getRetailerItemsPendingCountResponse: any;
  retailerChartData = [];
  customerChartData = [];
  customerTagsCondition: boolean;
  retailerTagsCondition: boolean;
  userEventRequest: IUserEvents = <IUserEvents>{};


  constructor(private AmCharts: AmChartsService, private sessionContext: SessionService, private commonService: CommonService, private router: Router, private dashboardService: IMCDashboardService) { }

  ngOnInit() {
    $('#pageloader').modal('show');
    // this.geItemsCountByPeriod("WEEKLY");   
    this.getItemsStatusCount();
    this.customerRequestedAndReceivedCountWithTime("WEEKLY");
    this.getCountsBasedOnItemType();
    this.getItemsCount();
    this.getItemsOutOfThreshold();
    this.getPendingVendorItemsCount();
    this.getRetailerItemsPendingCount();
    this.getVendorItemsCount();
    this.retailerGridData = true;
    $('#pageloader').modal('hide');
  }
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.IMCDASHBOARD];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  getItemsStatusCount() {
    let userevents = this.userEvents();
    this.dashboardService.getItemsStatusCount(userevents).subscribe(
      res => {
        if (res) {

          this.itemStatusCountChartData = res;
          this.itemStatusCount();

        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }
  getItemsCount() {
    this.dashboardService.getItemsCount().subscribe(
      res => {

        if (res) {

          this.itemChartCountData = res;
          this.itemCountChart();
        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }
  getVendorItemsCount() {
    this.dashboardService.getVendorItemsCount().subscribe(
      res => {
        if (res) {

          this.dataIS = res;
          this.vendorRequestedAndReceivedItemsCount();

        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }


  geItemsCountByPeriod(period) {

    this.dashboardService.geItemsCountByPeriod(period).subscribe(
      res => {
        if (res) {

          this.customerRequestedAndReceivedCount(res);
        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }
  getCountsBasedOnItemType() {
    this.retailerTagsCondition = false;
    this.dashboardService.getCountsBasedOnItemType().subscribe(
      res => {
        this.getCountsBasedOnItemTypeResponse = res;
        if (res == null || res == []) {
          this.customerNoRecordsToDisplay = false;
        }
        else {
          this.customerGridData = true;
        }
        error => {
          return Observable.throw(error);
        }
      });
  }


  getRetailerItemsPendingCount() {
    this.customerTagsCondition = false;
    this.dashboardService.getRetailerItemsPendingCount().subscribe(
      res => {
        this.getRetailerItemsPendingCountResponse = res;

        if (!res) {
          this.iconsShow = false;
        }
        else {
          this.iconsShow = true;
          this.retailerGridData = true;
        }

      },
      error => {
        return Observable.throw(error);
      }
    );
  }

  getPendingVendorItemsCount() {
    this.dashboardService.getPendingVendorItemsCount().subscribe(
      res => {
        if (res) {

          this.reminderResponse = res;

        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }
  getItemsOutOfThreshold() {
    this.dashboardService.getItemsOutOfThreshold().subscribe(
      res => {
        if (res) {
          let response = res.toString();
          this.alertResponse = response.split(',');


        }
      },
      error => {
        return Observable.throw(error);
      }
    );
  }
  ngAfterViewChecked() {
    if (this.customerTagsCondition) {
      if (!this.customerGridData) {
        this.getCountsBasedOnItemTypeChart();
      }
    }
    if (this.retailerTagsCondition) {
      if (!this.retailerGridData) {
        this.retailerResponseChart();
      }
    }
  }

  changeEventCustomerTagsCount() {
    this.customerGridData = false;
    if (this.customerGridData == false) {
      this.getCountsBasedOnItemTypeChart();
      this.customerTagsCondition = true;
      this.retailerTagsCondition = false;
      //this.ngAfterViewChecked();
    }
  }

  changeEventRetailerTagsCount() {
    this.retailerGridData = false;
    if (this.retailerGridData == false) {
      this.retailerResponseChart();
      this.customerTagsCondition = false;
      this.retailerTagsCondition = true;
      // this.ngAfterViewChecked();
    }
  }

  getCountsBasedOnItemTypeChart() {
    let customerTagarray = [];
    this.getCountsBasedOnItemTypeResponse.forEach(function (item) {
      var tagObject = {
        "Protocol": "",
        "Requested": '',
        "FulFilled": '',
        "Pending": '',
        "Mounting": '',
        "CategoryAxisValue": ""
      };
      tagObject.Protocol = item.ReturnValue[0];
      tagObject.Mounting = item.ReturnValue[1];
      tagObject.Requested = item.ReturnValue[2];
      tagObject.FulFilled = item.ReturnValue[3];
      tagObject.Pending = item.ReturnValue[4];
      tagObject.CategoryAxisValue = item.ReturnValue[0] + "\n(" + item.ReturnValue[1] + ")";
      customerTagarray.push(tagObject);

    });
    this.customerChartData = customerTagarray;
    this.customerTagsCountChart = this.AmCharts.makeChart("getCountsBasedOnItemTypeChart", {
      "hideCredits": true,
      "type": "serial",
      "dataProvider": this.customerChartData,
      "valueField": "Value",
      "titleField": "Text",
      "categoryField": "CategoryAxisValue",
      "startDuration": 1,
      "theme": "light",
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0,
        "tickPosition": "start",
        "tickLength": 20,
        "title": "Protocol(Mounting)"
      },
      "trendLines": [],
      "graphs": [
        {
          "balloonText": "Requested:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-1",
          "title": "Requested",
          "type": "column",
          "valueField": "Requested",
        },
        {
          "balloonText": "FulFilled:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-2",
          "title": "FulFilled",
          "type": "column",
          "valueField": "FulFilled"
        },
        {
          "balloonText": "Pending:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-3",
          "title": "Pending",
          "type": "column",
          "valueField": "Pending"
        },
      ],
      "guides": [],
      "valueAxes": [{
        "gridColor": "#FFFFFF",
        "dashLength": 0,
        "title": "Tag Count",
        "id": "ValueAxis-1",
        "axisAlpha": 0,
      }],
      "allLabels": [],
      "balloon": {},
      "legend": {
        "enabled": true,
        "horizontalGap": 12,
        "markerSize": 7,
      },
    }
    );
  }

  retailerResponseChart() {
    let customerTagarray = [];
    this.getRetailerItemsPendingCountResponse.forEach(function (item) {
      var object = {
        "ItemType": "",
        "Requested": '',
        "FulFilled": '',
        "Pending": ''
      };
      object.ItemType = item.ReturnValue[0];

      object.Requested = item.ReturnValue[1];
      object.FulFilled = item.ReturnValue[2];
      object.Pending = item.ReturnValue[3];
      customerTagarray.push(object);
    });
    this.retailerChartData = customerTagarray;
    this.getRetailerTagCountChart = this.AmCharts.makeChart("getRetailerTagsCountChart", {
      "hideCredits": true,
      "type": "serial",
      "dataProvider": this.retailerChartData,
      "valueField": "Value",
      "titleField": "Text",
      "categoryField": "ItemType",
      "startDuration": 1,
      "theme": "light",
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0,
        "tickPosition": "start",
        "tickLength": 20,
        "title": "Item Type"
      },
      "trendLines": [],
      "graphs": [
        {
          "balloonText": "Requested:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-1",
          "title": "Requested",
          "type": "column",
          "valueField": "Requested"
        },
        {
          "balloonText": "FulFilled:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-2",
          "title": "FulFilled",
          "type": "column",
          "valueField": "FulFilled"
        },
        {
          "balloonText": "Pending:[[value]]",
          "fillAlphas": 0.8,
          "lineAlpha": 0.2,
          "id": "AmGraph-3",
          "title": "Pending",
          "type": "column",
          "valueField": "Pending"
        },
      ],
      "guides": [],
      "valueAxes": [{
        "gridColor": "#FFFFFF",
        "dashLength": 0,
        "title": "Tags Count",
        "id": "ValueAxis-1",
        "axisAlpha": 0,
      }],
      "allLabels": [],
      "balloon": {},
      "legend": {
        "enabled": true,
        "horizontalGap": 12,
        "markerSize": 7,
      },

    });

  }


  itemCountChart() {
    this.vendorRequestedAndReceivedItemsCountChart1 = this.AmCharts.makeChart("itemCountChart", {
      "hideCredits": true,
      "type": "pie",
      "theme": "none",
      "legend": {
        "position": "bottom",
        "markerSize": 8,
        "switchable": false,
        "divId": "legandItemCount"
      },
      "dataProvider": this.itemChartCountData,
      "valueField": "Value",
      "titleField": "Text",
      "radius": "30%",
      "innerRadius": "55%",
      "labelRadius": 5,
      "balloonText": "[[title]]:<span style='font-size:14px'><b> [[value]]</b></span>"
    });
  }

  vendorRequestedAndReceivedItemsCount() {
    this.vendorRequestedAndReceivedItemsCountChart = this.AmCharts.makeChart("vendorRequestedAndReceivedItemsCount", {
      "hideCredits": true,
      "type": "serial",
      "categoryField": "Text",
      "rotate": true,
      "legend": {
        "horizontalGap": 10,
        "useGraphSettings": true,
        "markerSize": 8,
        "switchable": false
      },
      "startDuration": 1,
      "categoryAxis": {
        "gridPosition": "start",
        "position": "left",
        "title": "Vendor"

      },
      "trendLines": [],
      "graphs": [
        {
          "balloonText": "Requested: [[Value]]",
          "labelText": "[[value]]",
          "labelPosition": "right",
          "fontSize": 8,
          "fillAlphas": 0.8,
          "lineAlpha": 0.3,
          "id": "AmGraph-1",
          "title": "Requested",
          "type": "column",
          "valueField": "Value",
          "columnWidth": 0.5,
          "colorField": "color"
        },
        {
          "balloonText": "Received: [[Value1]]",
          "labelText": "[[value]]",
          "labelPosition": "right",
          "fontSize": 8,
          "lineAlpha": 0.3,
          "fillAlphas": 1,
          "id": "AmGraph-2",
          "title": "Received",
          "type": "column",
          "valueField": "Value1",
          "columnWidth": 0.5,
          "colorField": "color"
        }
      ],
      "guides": [],
      "valueAxes": [
        {
          "id": "ValueAxis-1",
          "position": "bottom",
          "axisAlpha": 0,
          "title": "Count"
        }
      ],
      "allLabels": [],
      "balloon": {},
      "titles": [],
      "dataProvider": this.dataIS,
      "export": {
        "enabled": true
      }

    });
  }

  itemStatusCount() {

    this.itemStatusCountChart = this.AmCharts.makeChart("itemStatusCountChart", {
      "hideCredits": true,
      "type": "serial",
      "rotate": true,
      "dataProvider": this.itemStatusCountChartData,
      "graphs": [{
        "balloonText": "<b>[[category]]:  [[value]]</b>",
        "labelText": "[[value]]",
        "labelPosition": "right",
        "fontSize": 10,
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "Value",
        "columnWidth": 0.5,
      }],
      "valueAxes": [
        {
          "id": "ValueAxis-1",
          "position": "bottom",
          "axisAlpha": 0,
          "title": "Count"
        }
      ],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "responsive": {
        "enabled": true
      },
      "categoryField": "Text",
      "startDuration": 1,
      "categoryAxis": {
        "title": "Item statuses",
        "gridPosition": "start",
        "axisAlpha": 0,
        "position": "left",
        "labelRotation": 45
      },
      "amExport": {}

    });

  }

  customerRequestedAndReceivedCount(customerRequestedAndReceivedCountChartData) {
    this.customerRequestedAndReceivedCountChart = this.AmCharts.makeChart("customerRequestedAndReceivedCountChart", {
      "hideCredits": true,
      "type": "serial",
      "theme": "light",
      "legend": {
        "useGraphSettings": true,
        "switchable": false
      },
      "dataProvider": customerRequestedAndReceivedCountChartData,
      "valueAxes": [{
        "minimum": 1,
        "reversed": false,
        "axisAlpha": 0,
        "gridCount": 20,
        "position": "left",
        "title": "Count"
      }],
      "startDuration": 0.5,
      "graphs": [{
        "balloonText": "Requested: [[value]]",
        "bullet": "round",
        "title": "Requested",
        "valueField": "Value1",
        "fillAlphas": 0
      }, {
        "balloonText": "Received: [[value]]",
        "bullet": "round",
        "title": "Received",
        "valueField": "Value",
        "fillAlphas": 0
      }],
      "chartCursor": {
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "Text",
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0.1,
        "fillColor": "#000000",
        "position": "bottom"
      },
      "export": {}
    });
  }

  customerRequestedAndReceivedCountWithTime(rollUp) {
    this.statusSelectedItem = rollUp;
    this.customerTagsCondition = false;
    this.retailerTagsCondition = false;
    if (rollUp == "WEEKLY") {
      this.geItemsCountByPeriod("WEEKLY");
    } else if (rollUp == "MONTH") {
      this.geItemsCountByPeriod("MONTHLY");
    } else if (rollUp == "QUARTER") {
      this.geItemsCountByPeriod("QUARTERLY");
    } else if (rollUp == "YEAR") {
      this.geItemsCountByPeriod("YEARLY");
    }

  }




}


