import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { Router } from '@angular/router';
import { Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { Ichartdataresponse } from './../../csc/dashboard/models/chardataresponse';
import { TvcDashBoardService } from './services/tvc-dashboard.service';

import { Component, OnInit } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { Features } from "../../shared/constants";
@Component({
  selector: 'app-tvc-dashboard',
  templateUrl: './tvc-dashboard.component.html',
  styleUrls: ['./tvc-dashboard.component.scss']
})
export class TvcDashboardComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  othersPaymentError: boolean;
  violationTrendingError: boolean;
  violationError: boolean;
  paymentDetailsError: boolean;
  violationDetails;
  paymentDetails;
  invoiceDetails;
  paymentsData;
  othersPaymentAmount;
  violationSelectedItem = "YEARLY";
  paymentSelectedItem = "YEARLY";
  invoiceSelectedItem = "YEARLY";
  paymentISelectedItem = "YEARLY";
  violatorsTrendingDetails: Ichartdataresponse[];
  paymentError:boolean;
  invoiceError:boolean;
  constructor(private AmCharts: AmChartsService, private dashboardService: TvcDashBoardService,private router:Router, private sessionData:SessionService) { }

  ngOnInit() {
    this.sessionContextResponse=this.sessionData.customerContext;
    this.getViolationTrendingDetails();
    this.getViolationCountByPeriod('WEEKLY')
    this.getOtherPaymentAmount();
    this.getPaymentAmountByPeriod('WEEKLY');
    this.getPaymentCountBasedOnSubSystem('WEEKLY');
    this.getInvoiceCountByPeriod('WEEKLY');
  }


  initialiseViolationDetailsGraph() {
    this.violationDetails = this.AmCharts.makeChart("violationDetails", {
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
        "balloonText": "Toll Bill:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "Toll Bill",
        "valueField": "Value",
        "fillAlphas": 0
      }, {
        "balloonText": "First Notice of Toll Violation:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "First Notice of Toll Violation",
        "valueField": "Value1",
        "fillAlphas": 0
      }, {
        "balloonText": "Second Notice of Toll Violation:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "Second Notice of Toll Violation",
        "valueField": "Value2",
        "fillAlphas": 0
      }, {
        "balloonText": "Final Notice of Toll Violation:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "Final Notice of Toll Violation",
        "valueField": "Value3",
        "fillAlphas": 0
      }, {
        "balloonText": "Active Collections:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "Active Collections",
        "valueField": "Value4",
        "fillAlphas": 0
      }, {
        "balloonText": "Court:<span style='font-size:14px'><b> [[value]]</b></span>",
        "bullet": "round",
        "title": "Court",
        "valueField": "Value5",
        "fillAlphas": 0
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

  initialisePaymentDetailsGraph() {
    this.paymentDetails = this.AmCharts.makeChart("paymentDetails", {
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
      "startDuration": 0.5,
      "graphs": [{
        "balloonText": "<span style='font-size:14px'>Bank: <b>$ [[value]]</b></span>",
        "bullet": "round",
        "title": "Bank",
        "valueField": "Value",
        "precision": 2,
        "fillAlphas": 0
      }, {
        "balloonText": "<span style='font-size:14px'>Cash: <b>$ [[value]]</b></span>",
        "bullet": "round",
        "title": "Cash",
        "valueField": "Value1",
        "precision": 2,
        "fillAlphas": 0
      }, {
        "balloonText": "<span style='font-size:14px'>Check: <b>$ [[value]]</b></span>",
        "bullet": "round",
        "title": "Check",
        "valueField": "Value2",
        "precision": 2,
        "fillAlphas": 0
      }, {
        "balloonText": "<span style='font-size:14px'>Credit Card: <b>$ [[value]]</b></span>",
        "bullet": "round",
        "title": "Credit Card",
        "valueField": "Value3",
        "precision": 2,
        "fillAlphas": 0
      }, {
        "balloonText": "<span style='font-size:14px'>Money Order: <b>$ [[value]]</b></span>",
        "bullet": "round",
        "title": "Money Order",
        "valueField": "Value4",
        "precision": 2,
        "fillAlphas": 0
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
  initialiseInvoiceDetailsGraph() {
    this.invoiceDetails = this.AmCharts.makeChart("invoiceDetails", {
      "type": "serial",
      "legend": {
        "useGraphSettings": true,
        "switchable": false,
        "equalWidths": true,
        "valueAlign": "left",
        "valueWidth": 90,
      },
      "dataProvider": [],
      "valueAxes": [{
        "id": "ValueAxis-1",
        "axisAlpha": 0,
        "gridCount": 20,
        "minimum": 1,
        "position": "bottom",
        "title": "Invoice Paid/Unpaid Count",
        "integersOnly": true,
      }],
      "graphs": [{
        "balloonText": "Invoices Count: [[value]]",
        "fillAlphas": 0.7,
        "lineAlpha": 0.2,
        "legendValueText": "[[value]]",
        "fillColorsField": "blue",
        "title": "Invoices Count",
        "type": "column",
        "valueField": "Value",
        "columnWidth": 0.2,
      }, {
        "balloonText": "Paid Invoices: [[value]]",
        "bullet": "round",
        "title": " Paid Invoices",
        "fillAlphas": 0,
        "valueField": "Value1",
      }, {
        "bullet": "round",
        "balloonText": "Unpaid Invoices : [[value]]",
        "title": "Unpaid Invoices",
        "fillAlphas": 0,
        "valueField": "Value2",
      }],
      "balloon": {
        "fixedPosition": true,
        "maxWidth": 10000
      },
      "chartCursor": {
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "Text",
      "startDuration": 1,
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0.1,
        "position": "left"
      },
      "export": {
        "enabled": true
      }
    });
  }
  initialisePaymentsGraph() {
    this.paymentsData = this.AmCharts.makeChart("paymentsData", {
      "type": "pie",
      "theme": "light",
      "dataProvider": [],
      "titleField": "Text",
      "valueField": "Value",
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
        "valueText":"$ [[value]]"
      },
      
      "balloonText": "[[title]]:<span style='font-size:14px'><b>$ [[value]]</b></span>",
    });
  }
  getViolationTrendingDetails() {
     let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TVCDASHBOARD];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    this.dashboardService.getViolationTrendingDetails(userEvents).subscribe(res => {
      if(res){
      console.log(res);
      this.violatorsTrendingDetails = res
      this.violatorsTrendingDetails.forEach(element => {
          if(element.ReturnValue[0]=='HotListPlate Transactions'){
            let index=this.violatorsTrendingDetails.indexOf(element);
            this.violatorsTrendingDetails.splice(index,1)
          }
      });
      }
      else{
        this.violationTrendingError=true;
      }
    },(err)=>{
      this.violationTrendingError=true;
    });
  }
  getOtherPaymentAmount() {
    this.dashboardService.getOtherPaymentAmounts().subscribe(res => {
      if(res){
      this.othersPaymentAmount = res
      this.othersPaymentAmount.forEach(element => {
        element.ReturnValue[1]=parseFloat(element.ReturnValue[1]).toFixed(2)
        
      });
      this.othersPaymentError=false;  
      }
      else{
      this.othersPaymentError=true;
    }
    },(err)=>{
      this.othersPaymentError=true;
    });
  }
  getViolationCountByPeriod(data) {
    this.violationSelectedItem=data;
    this.dashboardService.getInvoicesStageWiseCountByPeriod(data).subscribe(res => {
      this.initialiseViolationDetailsGraph();
      this.plotViolationDetailsGraph(res);
      console.log(res);
    },(err)=>{
       this.violationError=true;
    })
  }

  plotViolationDetailsGraph(data) {
    if (data) {
       this.violationError=false;
       data.forEach(element => {
          for(let key in element){
            if(element[key]==null){
              element[key]=0;
          };
          }
       });
      this.AmCharts.updateChart(this.violationDetails, () => {
        this.violationDetails.dataProvider = data;
      });
    }
    else{
      this.violationError=true;
    }
  }

  getPaymentAmountByPeriod(data) {
    this.paymentSelectedItem=data;
    this.dashboardService.getPaymentAmountByPeriod(data).subscribe(res => {
      console.log(res);
      this.initialisePaymentDetailsGraph()
      this.plotPaymentAmountByPeriodGraph(res);
    },(err)=>{
      this.paymentDetailsError=true;
    })
  }

  plotPaymentAmountByPeriodGraph(data) {
    if (data) {
      this.paymentDetailsError=false;
      data.forEach(element => {
          for(let key in element){
            if(element[key]==null){
              element[key]=0;
          };
          }
       });
      this.AmCharts.updateChart(this.paymentDetails, () => {
        this.paymentDetails.dataProvider = data;
      });
    }
    else{
      this.paymentDetailsError=true;
    }
  }

  getInvoiceCountByPeriod(data) {
    this.invoiceSelectedItem=data;
    this.dashboardService.getInvoiceCountByPeriod(data).subscribe(res => {
      this.initialiseInvoiceDetailsGraph();
      this.plotInvoiceCountByPeriodGraph(res);
      console.log(res);
    },(err)=>{
      this.invoiceError=true;
    })
  }
  plotInvoiceCountByPeriodGraph(data) {
    if (data) {
      this.invoiceError=false;
      data.forEach(element => {
          for(let key in element){
            if(element[key]==null){
              element[key]=0;
          };
          }
       });
      this.AmCharts.updateChart(this.invoiceDetails, () => {
        this.invoiceDetails.dataProvider = data;
      });
    }
    else{
      this.invoiceError=true;
    }
  }
  getPaymentCountBasedOnSubSystem(data) {
    this.paymentISelectedItem=data;
    this.dashboardService.getPaymentCountBasedOnSubSystem(data).subscribe(res => {
      this.initialisePaymentsGraph();
      this.paymentError=false;
      this.plotPaymentCountBasedOnSubSystem(res);
      
    },(err)=>{
      this.paymentError=true;
    })
  }
  plotPaymentCountBasedOnSubSystem(data) {
    if (data) {
      this.paymentError=false;
      data.forEach(element => {
          for(let key in element){
            if(element[key]==null){
              element[key]=0;
          };
          }
       });
      this.AmCharts.updateChart(this.paymentsData, () => {
        this.paymentsData.dataProvider = data;
      });
    }
    else{
      this.paymentError=true;
    }
  }
}
