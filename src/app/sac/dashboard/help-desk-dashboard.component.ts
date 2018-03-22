import { SessionService } from './../../shared/services/session.service';
import { IUserresponse } from './../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions } from './../../shared/constants';
import { Features } from '../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { Ichartdataresponse } from './../../csc/dashboard/models/chardataresponse';
import { SacDashBoardService } from './services/models.service';
import { Component, OnInit } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";

@Component({
  selector: 'app-help-desk-dashboard',
  templateUrl: './help-desk-dashboard.component.html',
  styleUrls: ['./help-desk-dashboard.component.scss']
})
export class HelpDeskDashboardComponent implements OnInit {
  problemTypeError: boolean;
  pmSeverityCountError: boolean;
  pmStatusGraphError: boolean;
  topUsernamesError: boolean;
  sessionContextResponse: IUserresponse;
  complaintStatusesError: boolean;
  pmTypeSelectedItem: any;
  severitySelectedItem: any;
  pmSeverityCount: AmChart;
  timePeriodSelectedItem: any;
  problemTypeGraph: AmChart;
  pmStatusGraph: AmChart;
  topUsernamesCounts;
  complaintStatuses;
  rollUpLevel;
  violationSelectedItem;
  constructor(private AmCharts: AmChartsService, private sessionContext: SessionService, private sacDashBoardService: SacDashBoardService, private router: Router) { }

  ngOnInit() {
    this.sessionContextResponse=this.sessionContext.customerContext;
    this.getTotalComplaintStatuses();
    this.getTopUsernamesCount();
    this.getPMStatusCount('WEEKLY');
    this.getPMSeverityCount('WEEKLY');
    this.getPMTypeCount('WEEKLY');
  }



  initializePmStatusGraph() {
    this.pmStatusGraph = this.AmCharts.makeChart("pmStatusGraph", {
      "type": "serial",
      "rotate": false,
      "dataProvider": [],
      "graphs": [{
        "balloonText": "<b>[[category]]:  [[value]]</b>",
        "labelText": "[[value]]",
        "labelPosition": "top",
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
          "integersOnly": true,
          "title": "Total count based on time period"
        }
      ],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "responsive": {
        "enabled": true,
      },
      "categoryField": "Text",
      "startDuration": 1,
      "categoryAxis": {
        "title": "Complaint statuses",
        "gridPosition": "start",
        "axisAlpha": 0,
        "position": "left",
      },
      "amExport": {}
    })
  }

  initializeProblemTypeGraph() {
    this.problemTypeGraph = this.AmCharts.makeChart("problemTypeGraph", {
      "type": "serial",
      "rotate": true,
      "dataProvider": [],
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
          "integersOnly": true,
          "title": "Total count based on time period"

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
      // "labelRotation":-90,
      "startDuration": 1,
      "categoryAxis": {
        "title": "Problem Types",
        "gridPosition": "start",
        "axisAlpha": 0,
        "position": "left",

      },
      "amExport": {}
    })
  }



  initializePmSeverityCount() {
    this.pmSeverityCount = this.AmCharts.makeChart("pmSeverityCount", {
      "type": "pie",
      "theme": "none",
      "legend": {
        "horizontalGap": 10,
        "position": "right",
        "markerSize": 8,
        "switchable": false
      },
      "dataProvider": [],
      "valueField": "Value",
      "titleField": "Text",
      "outlineAlpha": 0.4,
      "depth3D": 15,
      "balloonText": "[[title]]:<span style='font-size:14px'><b> [[value]]</b></span>",
      "angle": 30,
      "export": {
        "enabled": true
      }
    })
  }

  getTotalComplaintStatuses() {
    
let userEvents = <IUserEvents>{};
userEvents.FeatureName = Features[Features.HELPDESKDASHBOARD];
userEvents.SubFeatureName = "";
userEvents.ActionName = Actions[Actions.VIEW];
userEvents.PageName = this.router.url;
userEvents.CustomerId = 0;
userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
userEvents.UserName = this.sessionContextResponse.userName;
userEvents.LoginId = this.sessionContextResponse.loginId;
    this.sacDashBoardService.getTotalComplaintStatuses(userEvents).subscribe(res => {
      if (res) {
        this.complaintStatuses = res;
        console.log(res);
        this.complaintStatusesError = false;
      } else {
        this.complaintStatusesError = true;
      }
    }, (err) => {
      this.complaintStatusesError = true;
    });
  }

  getTopUsernamesCount() {
    this.sacDashBoardService.getTopUsernamesCount().subscribe(res => {
      if (res) {
        this.topUsernamesCounts = res;
        console.log(res);
        this.topUsernamesError = false;
      } else {
        this.topUsernamesError = true;
      }
    }, (err) => {
      this.topUsernamesError = true;
    })
  }

  getPMStatusCount(rollUpLevel) {
    this.timePeriodSelectedItem = rollUpLevel;
    this.sacDashBoardService.getPMStatusCount(rollUpLevel).subscribe(res => {
      this.initializePmStatusGraph();
      this.getPMStatusCountValue(res);
    }, (err) => {
      this.pmStatusGraphError = true;
    })

  }

  getPMStatusCountValue(data) {
    if (data) {
      this.pmStatusGraphError = false;
      data.forEach(element => {
        for (let key in element) {
          if (element[key] == null) {
            element[key] = 0;
          };
        }
      });
      this.AmCharts.updateChart(this.pmStatusGraph, () => {
        this.pmStatusGraph.dataProvider = data;
      });
    }
    else {
      this.pmStatusGraphError = true;
    }
  }

  getPMSeverityCount(rollUpLevel) {
    this.severitySelectedItem = rollUpLevel;
    this.sacDashBoardService.getPMSeverityCount(rollUpLevel).subscribe(res => {
      this.initializePmSeverityCount();
      this.getPMSeverityCountValue(res);
      console.log(res);
    }, (err) => {
      this.pmSeverityCountError = true;
    })

  }

  getPMSeverityCountValue(data) {
    if (data) {
      this.pmSeverityCountError = false;
      data.forEach(element => {
        for (let key in element) {
          if (element[key] == null) {
            element[key] = 0;
          };
        }
      });
      this.AmCharts.updateChart(this.pmSeverityCount, () => {
        this.pmSeverityCount.dataProvider = data;
      });
    }
    else {
      this.pmSeverityCountError = true;
    }
  }


  getPMTypeCount(rollUpLevel) {
    this.pmTypeSelectedItem = rollUpLevel;
    this.sacDashBoardService.getPMTypeCount(rollUpLevel).subscribe(res => {
      this.initializeProblemTypeGraph();
      this.getPMTypeCountValue(res);
      console.log(res);
    }, (err) => {
      this.problemTypeError = true;
    })

  }


  getPMTypeCountValue(data) {

    if (data) {
      this.problemTypeError = false;
      data.forEach(element => {
        for (let key in element) {
          if (element[key] == null) {
            element[key] = 0;
          };
        }
      });
      this.AmCharts.updateChart(this.problemTypeGraph, () => {
        this.problemTypeGraph.dataProvider = data;
      });
    }
    else {
      this.problemTypeError = true;
    }
  }



}
