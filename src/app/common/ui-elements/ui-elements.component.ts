
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
@Component({
  selector: 'app-ui-elements',
  templateUrl: './ui-elements.component.html',
  styleUrls: ['./ui-elements.component.scss']
})
export class UiElementsComponent implements OnInit {

   dataProvider: any=[];
  /* Pagination  Code */
  p: number = 1;
  moment2;
  maxSelectableDate=new Date(Date.now());
  tableData:any=[{
    cname:"Baker Davis",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  },{
    cname:"dsfsdf",
    ano:"10002550",
    pno:"AP311234",
    sno:"0000000001070",
    phno:" (202) 555-0109	",
    email:"	bakerfdavis@tollplus.com",
    address:"1007 Lucky Duck Drive Pittsburgh"
  }];
  chart:AmChart;
  chart1:AmChart;
   pageItemNumber:number=6;
   dataLength:number=this.tableData.length;
   startItemNumber:number=1;
   endItemNumber:number;
   moment1:Date;
   moment3:Date;
   moment4:Date

    constructor(private AmCharts: AmChartsService) { }
    
    msgFlag: boolean=false;
    errorMsg;
    successMsg;
    alertMsg;
    msgType;
    msgDesc;
    msgTitle;

    successClick() {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgTitle = 'Success Message'
      this.msgDesc = 'Success Message Success Message Success Message Success Message'
    }


    errorClick() {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgTitle = 'Error Message'
      this.msgDesc = 'Error Message Error Message Error Message Error Message Error Message'
    }

    alertClick() {
      this.msgFlag = true;
      this.msgType = 'alert'
      this.msgTitle = 'Alert Message'
      this.msgDesc = 'Alert Message Alert Message Alert Message Alert Message'
    }
  setOutputFlag(e) {
    this.msgFlag = e.flag;
    this.msgType = e.type;
  }

  ngAfterViewInit() {
    this.chart = this.AmCharts.makeChart("chartdiv", {
  "type": "pie",
  "theme": "light",
  "dataProvider": [ {
    "title": "New",
    "value": 4852
  }, {
    "title": "Returning",
    "value": 9899
  } ],
  "titleField": "title",
  "valueField": "value",
  "labelRadius": 5,

  "radius": "42%",
  "innerRadius": "80%",
  "labelText": "[[title]]",
  "export": {
    "enabled": true
  },
   "legend": {
    "backgroundColor":"#FFFFFF"
  }
} );

for (let year = 1950; year <= 2005; ++year) {
      this.dataProvider.push({
        year: "" + year,
        value: Math.floor(Math.random() * 100) - 50
      });
    }
 this.chart1 = this.AmCharts.makeChart("chartdiv1", {
  "type": "serial",
  "theme": "light",
  "dataProvider":[{
    "year":2016,
    "value":20
  },{
    "year":2017,
    "value":30
  },
  {
    "year":2018,
    "value":20
  },{
    "year":2019,
    "value":40
  }],
   "valueAxes": [{
        "axisAlpha": 0,
        "position": "left"
      }],
      "graphs": [{
        "id": "g1",
        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
        "bullet": "circle",
        "bulletSize": 10,
        "bulletBorderColor":"#8a5b41",
        "bulletColor":"#999",
        "bulletBorderAlpha":1,
        "bulletBorderThickness":2,
        "lineColor": "#8a5b41",
        "lineThickness": 2,
        "negativeLineColor": "#637bb6",
        "type": "line",
        "valueField": "value"
      }],
 
      "dataDateFormat": "YYYY",
      "categoryField": "year",
      "categoryAxis": {
        "minPeriod": "YYYY",
        "parseDates": true,
        "minorGridAlpha": 0.1,
        "minorGridEnabled": false
      },
      "export": {
        "enabled": true
      }
} );
  }

  // ngOnDestroy() {
  //   if (this.chart) {
  //     this.AmCharts.destroyChart(this.chart);
  //   }
  //   if (this.chart1) {
  //     this.AmCharts.destroyChart(this.chart1);
  //   }
  // }

   pageChanged(event){
     this.p=event;
     this.startItemNumber=(((this.p)-1) * this.pageItemNumber)+1;
     this.endItemNumber=((this.p) * this.pageItemNumber);
     if(this.endItemNumber>this.dataLength)
      this.endItemNumber=this.dataLength;
   }
 ngOnInit() {
  if(this.dataLength < this.pageItemNumber){
    this.endItemNumber=this.dataLength
   }
   else{
     this.endItemNumber= this.pageItemNumber;
   }
  }
      
    /* Date picker code */
  minDate = new Date(2017, 5, 10);
  maxDate = new Date(2018, 9, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
 
  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = new Date(v.setHours(0,0,0,0));
    
  }
 
  _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }
 
  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }
 
  log(v: any) {console.log(v);}
 
   
}

