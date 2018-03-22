import { SessionService } from './../../shared/services/session.service';
import { Router } from '@angular/router';
import { Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { IPayment } from './models/paymentamountresponse';
import { IDashBoard } from './models/dashboardrequest';
import { Icustomertrending } from './models/customertrendingresponse';
import { element } from 'protractor';
import { Ichartdataresponse } from './models/chardataresponse';
import { Icsrchartdataresponse } from './models/csrchartdataresponse';
import { Icsrdashboard } from './models/csrdashboardrequest';
import { DashBoardService } from './services/dashboard.service';
import { Component, OnInit } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { Features } from "../../shared/constants";
@Component({
  selector: 'app-csc-dashboard',
  templateUrl: './csc-dashboard.component.html',
  styleUrls: ['./csc-dashboard.component.scss']
})
export class CscDashboardComponent implements OnInit {
  sessionContextResponse: any;
  topFiveUsers: AmChart;
  customerStatusGraph: AmChart;
  customersAttendedGraphOption;
  tripsForPlanGraph;
  customersAttended;
  customerTrending: Icustomertrending = <Icustomertrending>{};
  customerTrendingDby: Icustomertrending = <Icustomertrending>{};
  tollTypeTripGraph;
  attendedCustomersCount: IDashBoard = <IDashBoard>{};
  paymentAndAdjustment: IPayment = <IPayment>{};
  tripsForPlanGraphData;
  tripsForPlanGraphDataArray;
  requestTimeSpentData;
  featureTimeSpentData;
  amountReceivedGraph;
  amountObject;
  reolvedComplaintCount;
  tripSelectedItem: String;
  statusSelectedItem: String;
  tripPlanSelectedItem: String;
  amountArray = [];
  tollTypeTripError: boolean;
  amountReceivedError: boolean;
  customerStatusError: boolean;
  activityError:boolean;
  featureByTimeError: boolean;
  tripsForPlanError: boolean;
  requestByTimeError: boolean;
  paymentError: boolean =true;
  resolvedComplaintCountError: boolean;
  customerTrendingError: boolean;
  responseData: Icsrdashboard = <Icsrdashboard>{};
  yesterday=new Date();
  getPaymentRecievedSelectedItem;
  dayBeforeYesterday=new Date();
  customerTrendingComparisonArray=["ViolatorsAsCustomers","CustomersInNegativeBalance","CustomerAutoRenewals","ManualRenewals","NewAccountCreations","AccountsClosed","TransactionDisputes","PostPaidAccounts", "CustomerComplaints", "RequestedStatements", "ReopenAccounts"];
  constructor(private AmCharts: AmChartsService, private dashboardService: DashBoardService, private router:Router,private sessionData:SessionService ) { }

  ngOnInit() {
    this.sessionContextResponse=this.sessionData.customerContext;
    this.yesterday.setDate(this.yesterday.getDate()-1);
    this.dayBeforeYesterday.setDate(this.yesterday.getDate()-2);
    this.getCustomerTrendingCount();
    this.getAttendedCustomersCount();
    this.getTollTypeTripCount("YESTERDAY");
    this.getFeatureTimeSpent();
    this.getRequestTimeSpent();
    this.getAmountReceived();
    this.getPaymentRecieved("YESTERDAY");
    this.getCustomerStatusTrending("YESTERDAY");
    this.getPlanWiseTripcount("YESTERDAY");
    this.getresolvedComplaintCount();
  }



  initialiseCustomerStatusGraph() {
    this.customerStatusGraph = this.AmCharts.makeChart("customerStatusGraph", {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 40,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled": true,
      "dataDateFormat": "MMMM",
      "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth": true
      }],
      "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
      },
      "graphs": [{
        "balloonText": "Active: [[value]]",
        "bullet": "round",
        "title": "Active",
        "valueField": "Value",
        "fillAlphas": 0,
        "lineColor": "#04D215"
      }, {
        "balloonText": "New Account: [[value]]",
        "bullet": "round",
        "title": "New Account",
        "valueField": "Value1",
        "fillAlphas": 0,
        "lineColor": "#FF0F00"
      },
      {
        "balloonText": "Inactive: [[value]]",
        "bullet": "round",
        "title": "Inactive",
        "valueField": "Value2",
        "fillAlphas": 0,
        "lineColor": "#FF6600"
      },
      {
        "balloonText": "Pending Closed: [[value]]",
        "bullet": "round",
        "title": "Pending Closed",
        "valueField": "Value3",
        "fillAlphas": 0,
        "lineColor": "#FF9E01"
      },
      {
        "balloonText": "Write Off: [[value]]",
        "bullet": "round",
        "title": "Write Off",
        "valueField": "Value4",
        "fillAlphas": 0,
        "lineColor": "#FCD202"
      },
      {
        "balloonText": "Refund Requested: [[value]]",
        "bullet": "round",
        "title": "Refund Requested",
        "valueField": "Value5",
        "fillAlphas": 0,
        "lineColor": "#B0DE09"
      },
      {
        "balloonText": "Closed: [[value]]",
        "bullet": "round",
        "title": "Closed",
        "valueField": "Value6",
        "fillAlphas": 0,
        "lineColor": "#0D8ECF"
      },

      {
        "balloonText": "Pending Negative: [[value]]",
        "bullet": "round",
        "title": "Pending Negative",
        "valueField": "Value7",
        "fillAlphas": 0,
        "lineColor": "#0D52D1"
      },


      {
        "balloonText": "Collection Pending: [[value]]",
        "bullet": "round",
        "title": "Collection Pending",
        "valueField": "Value8",
        "fillAlphas": 0,
        "lineColor": "#8A0CCF"
      }, {
        "balloonText": "Collections: [[value]]",
        "bullet": "round",
        "title": "Collections",
        "valueField": "Value9",
        "fillAlphas": 0,
        "lineColor": "#F8FF01"
      },

      {
        "balloonText": "Collection Write-Off: [[value]]",
        "bullet": "round",
        "title": "Collection Write-Off",
        "valueField": "Value10",
        "fillAlphas": 0,
        "lineColor": "#CD0D74"
      },

      {
        "balloonText": "Collection Closed: [[value]]",
        "bullet": "round",
        "title": "Collection Closed",
        "valueField": "Value11",
        "fillAlphas": 0,
        "lineColor": "#660066"
      },
      {
        "balloonText": "Collection Paid: [[value]]",
        "bullet": "round",
        "title": "Collection Paid",
        "valueField": "Value12",
        "fillAlphas": 0,
        "lineColor": "#FF33FF"
      },
      {
        "balloonText": "Collection Refund Request: [[value]]",
        "bullet": "round",
        "title": "Collection Refund Request",
        "valueField": "Value13",
        "fillAlphas": 0,
        "lineColor": "#3399FF"
      }],
      "legend": {
        "position": "bottom",
        "useGraphSettings": true,
        "switchable": false
      },
      "chartCursor": {
        "pan": true,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "cursorAlpha": 1,
        "cursorColor": "#258cbb",
        "limitToGraph": "g1",
        "valueLineAlpha": 0.2,
        "valueZoomable": true
      },
      "valueScrollbar": {
        "oppositeAxis": false,
        "offset": 50,
        "scrollbarHeight": 10
      },
      "categoryField": "Text",
      "categoryAxis": {
        "dashLength": 1,
        "minorGridEnabled": true
      },
      "export": {
        "enabled": true
      },
      "dataProvider": []
    });
  }

  initialiseTollTypeTripCount() {
    this.tollTypeTripGraph = this.AmCharts.makeChart("tollTypeTripGraph", {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 40,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled": true,
      "dataDateFormat": "MMMM",
      "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth": true
      }],
      "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
      },
      "graphs": [{
        "balloonText": "Postpaid: [[value]]",
        "bullet": "round",
        "title": "Postpaid",
        "valueField": "Value1",
        "fillAlphas": 0
      }, {
        "balloonText": "Prepaid: [[value]]",
        "bullet": "round",
        "title": "Prepaid",
        "valueField": "Value",
        "fillAlphas": 0
      }],
      "legend": {
        "position": "right",
        "useGraphSettings": true,
        "switchable": false
      },
      "chartCursor": {
        "pan": true,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "cursorAlpha": 1,
        "cursorColor": "#258cbb",
        "limitToGraph": "g1",
        "valueLineAlpha": 0.2,
        "valueZoomable": true
      },
      "valueScrollbar": {
        "oppositeAxis": false,
        "offset": 50,
        "scrollbarHeight": 10
      },
      "categoryField": "Text",
      "categoryAxis": {
        "dashLength": 1,
        "minorGridEnabled": true
      },
      "export": {
        "enabled": true
      },
      "dataProvider": []
    });
  }

  initialiseAmountRecievedGraph() {
    this.amountReceivedGraph = this.AmCharts.makeChart("amountReceivedGraph", {
      "type": "pie",
      "theme": "light",
      "dataProvider": this.amountArray,
      "titleField": "Text",
      "valueField": "Value",
      "labelRadius": 5,
"precision": 2,
      "radius": "0%",
      "innerRadius": "0%",
      "labelText": "[[title]]",
      "export": {
        "enabled": true
      },
      "legend": {
        "backgroundColor": "#FFFFFF",
        "position": "right",
        "valueText":"$ [[value]]",
        "switchable": false,
      }
    });
  }

  initialiseTripsForPlanGraph() {
    this.tripsForPlanGraph = this.AmCharts.makeChart("tripsForPlanGraph", {
      "type": "pie",
      "theme": "light",
      "dataProvider": [],
      "titleField": "title",
      "valueField": "value",
      "labelRadius": 5,

      "radius": "0%",
      "innerRadius": "0%",
      "labelText": "[[title]]",
      "export": {
        "enabled": true
      },
      "legend": {
        "backgroundColor": "#FFFFFF",
        "position": "right",
        "switchable": false,
      }
    });
  }

  getCustomerTrendingCount() {
   let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.CSCDASHBOARD];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    this.dashboardService.customerTrendingCount(userEvents).subscribe(res => {
       if (res) {
      this.customerTrending = res;
      this.customerTrendingError = false;
      this.getDayBeforeYesterdayCount(res);
       }
       else
        this.customerTrendingError = true
      
      }, (err) => { this.customerTrendingError = true });
    

  }
  
  getDayBeforeYesterdayCount(prevData){
      this.dashboardService.customerPTrendingCount().subscribe(res => {
        if (res) {
        this.customerTrendingDby = res;
        this.getTrendStatus(prevData,res);
        this.customerTrendingError = false; 
        }
        }, (err) => { this.customerTrendingError = true });
  }

  getTrendStatus(prevData,dPrevData){
      this.customerTrendingComparisonArray.forEach(element => {
        let index= this.customerTrendingComparisonArray.indexOf(element);
        console.log(this.customerTrending[element],this.customerTrendingDby[element])
        if(this.customerTrending[element]>this.customerTrendingDby[element]){
            this.customerTrendingComparisonArray[index]="high";
        }
        else{
            this.customerTrendingComparisonArray[index]="low";
        }
      });
      console.log(this.customerTrendingComparisonArray)
  }

  getAttendedCustomersCount() {
    this.dashboardService.getCsrActivities().subscribe(res => {
      if(res){
      this.attendedCustomersCount = res;
       this.activityError=false;
       console.log(res);
    }
      else{
        this.activityError=true;
      }
    });
  }

  getTollTypeTripCount(rollUp) {
    this.tripSelectedItem = rollUp;
    this.responseData.RollUp = rollUp;
    this.dashboardService.gettolltypetripcount(this.responseData).subscribe(res => {
      if(res){
      this.initialiseTollTypeTripCount();
      this.plotTollTypeGraph(res)
      console.log(res);
       this.tollTypeTripError = false;
    }
    else{
       this.tollTypeTripError = true;
    }
    },(err)=>{
       this.tollTypeTripError = true;
    });
  }

  plotTollTypeGraph(data) {
    if (data) {
      this.tollTypeTripError = false;
      this.AmCharts.updateChart(this.tollTypeTripGraph, () => {
        this.tollTypeTripGraph.dataProvider = data;
      });
    }
    else {
      this.tollTypeTripError = true;
    }
  }

  getPlanWiseTripcount(rollUp) {
    this.tripPlanSelectedItem = rollUp;
    this.responseData.RollUp = rollUp;
    this.dashboardService.getplanwisetripcount(this.responseData).subscribe(res => {
      if(res){
      this.initialiseTripsForPlanGraph();
      this.plotTripsForPlanGraph(res);
      this.tripsForPlanError = false;
    }
    else{
      this.tripsForPlanError = true;
    }
    },err=>{
       this.tripsForPlanError = true;
    });
  }

  plotTripsForPlanGraph(data) {
    this.tripsForPlanGraphDataArray = [];
    if (data) {
      this.tripsForPlanError = false;
      data.forEach(element => {
        this.tripsForPlanGraphData = { title: '', value: 0 };
        this.tripsForPlanGraphData.title = element.Text;
        this.tripsForPlanGraphData.value = element.Value;
        this.tripsForPlanGraphDataArray.push(this.tripsForPlanGraphData);
      });
      this.AmCharts.updateChart(this.tripsForPlanGraph, () => {
        this.tripsForPlanGraph.dataProvider = this.tripsForPlanGraphDataArray;
      });
    }
    else {
      this.tripsForPlanError = true;
    }
  }

  getPaymentRecieved(rollUp) {
    this.getPaymentRecievedSelectedItem=rollUp
    this.responseData.RollUp = rollUp;
    this.dashboardService.getpaymentrecieved(this.responseData).subscribe(res => {
      if (res) {
      this.initialiseAmountRecievedGraph();
      this.plotAmountRecievedGraph(res);
      this.amountReceivedError = false;
    }
    else{
      this.amountReceivedError = true;
    }
    },(err)=>{
      this.amountReceivedError = true;
    });
  }

  getAmountReceived() {
    this.dashboardService.csrAmountCollection().subscribe(res => {
    
       if (res) {
      this.paymentAndAdjustment = res;
      this.paymentError = false;
       }
      else{
        this.paymentError = true;
      }
    }, (err) => {
      this.paymentError = true;
    })
  }

  plotAmountRecievedGraph(data) {
    if (data) {
      data.forEach(element => {
        element.Value=parseFloat(element.Value).toFixed(2);
      });
      console.log(data);
      this.amountReceivedError = false;
      this.AmCharts.updateChart(this.amountReceivedGraph, () => {
        this.amountReceivedGraph.dataProvider = data;
      });
    }
    else {
      this.amountReceivedError = true;
    }
  }

  getCustomerStatusTrending(rollUp) {
    this.statusSelectedItem = rollUp;
    this.responseData.RollUp = rollUp;
    this.dashboardService.getCustomerStatusCount(this.responseData).subscribe(res => {
      if(res){
      this.initialiseCustomerStatusGraph();
      this.plotCustomerStatusGraph(res);
      this.customerStatusError = false;
    }
    else{
      this.customerStatusError = true;
    }
    },(err) =>{
      this.customerStatusError = true;
    });

  }

  plotCustomerStatusGraph(data) {

    if (data) {
      this.customerStatusError = false;
      this.AmCharts.updateChart(this.customerStatusGraph, () => {
        this.customerStatusGraph.dataProvider = data;
      });

    }
    else {
      this.customerStatusError = true;
    }
  }

  getRequestTimeSpent() {

    this.responseData.IsTxnDate = false;
    this.responseData.TopN = 5;
    this.dashboardService.getrequestedtimespent(this.responseData).subscribe(res => {
      console.log(res);
       if (res) {
      this.requestTimeSpentData = res;
      this.requestByTimeError = false;
       }
      else{
        this.requestByTimeError = true;
      }
    }, (err) => { this.requestByTimeError = true; });
  }

  getFeatureTimeSpent() {
    this.responseData.IsTxnDate = false;
    this.responseData.TopN = 5;
    this.dashboardService.getfeaturetimespent(this.responseData).subscribe(res => {
       if (res) {
      this.featureTimeSpentData = res;
      this.featureByTimeError = false;
       }
      else{
        this.featureByTimeError = true
      }
    }, (err) => { this.featureByTimeError = true; });
  }

  getresolvedComplaintCount() {
    this.responseData.IsTxnDate = false;
    this.responseData.TopN = 5;
    this.dashboardService.gettopnusersresolvedcount(this.responseData).subscribe(res => {
       if (res) {
      console.log(res);
      this.reolvedComplaintCount=res;
      this.resolvedComplaintCountError = false;
       }
      else {
        this.resolvedComplaintCountError = true;
      }
    }, (err) => {
      this.resolvedComplaintCountError = true;
    })
  }
}
