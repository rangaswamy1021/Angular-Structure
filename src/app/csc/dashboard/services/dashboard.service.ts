
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";
import { IDashBoard } from "../models/Dashboardrequest";
import { IPayment } from "../models/paymentamountresponse";
import { Icustomertrending } from "../models/customertrendingresponse";
import { Icsrdashboard } from "../models/csrdashboardrequest";
import { Icsrdashboardresponse } from "../models/csrdashboardresponse";
import { Ichartdataresponse } from "../models/chardataresponse";
import { Icsrchartdataresponse } from "../models/csrchartdataresponse";
import { IsystemActivityrequest } from "../models/systemactivitiesrequest";

@Injectable()
export class DashBoardService {
  constructor(private http: HttpService) { }
  data: any;
  private dashboardUrl = 'dashboard/';

  //Get Csr Activities based on the Datetime
  getCsrActivities(): Observable<IDashBoard> {
    return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetCSRActivities') ;
  }
  csrAmountCollection(): Observable<IPayment> {
    return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetCSRAmountCollection') ;
  }
  customerTrendingCount(userEvents): Observable<Icustomertrending> {
    return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetCustomerTrendingCount',userEvents) ;
  }
  customerPTrendingCount(): Observable<Icustomertrending> {
    return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetpreviousdayCustomerTrendingCount') ;
  }
  getCustomerStatusCount(csrdashboardrequest: Icsrdashboard): Observable<Icsrchartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetCustomerStatusCount', obj)
       ;
  }
  gettopnusersresolvedcount(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetTopNUsersResolvedCount', obj)
       ;
  }
  getrequestedtimespent(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetRequestTimeSpent', obj)
       ;
  }
  getfeaturetimespent(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetFeatureTimeSpent', obj)
       ;
  }
  getpaymentrecieved(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetPaymentReceived', obj)
       ;
  }
  getplanwisetripcount(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetPlanWiseTripCount', obj)
       ;
  }
  gettolltypetripcount(csrdashboardrequest: Icsrdashboard): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(csrdashboardrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'GetTollTypeTripCount', obj)
       ;
  }
  createdviewsystemactivity(systemactivityrequest: IsystemActivityrequest, longAccountId: number): Observable<Ichartdataresponse> {
    let obj = JSON.stringify(systemactivityrequest);
    return this.http.postHttpMethod(this.dashboardUrl + 'CreatedViewSystemActivity', obj)
       ;
  }


}