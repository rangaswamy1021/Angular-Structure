import { Ichartdataresponse } from './../../../csc/dashboard/models/chardataresponse';
import { IDashBoard } from './../../../csc/dashboard/models/dashboardrequest';

import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";


@Injectable()
export class TvcDashBoardService {
    constructor(private http: HttpService) { }

    private dashboardUrl = 'tvcdashboard/';


    getOtherPaymentAmounts(): Observable<Ichartdataresponse> {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetOtherPaymentAmounts') ;
    }
    getViolationTrendingDetails(userEvents): Observable<Ichartdataresponse[]> {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetViolatorTrendingDetails',userEvents) ;
    }


    getViolationCountByPeriod(period: String): Observable<Ichartdataresponse> {
        var service = { 'strFlag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetViolationTxnCountByPeriod', JSON.stringify(service)) ;
    }


    getInvoicesStageWiseCountByPeriod(period: String): Observable<Ichartdataresponse> {
        var service = { 'strFlag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetInvoicesStageWiseCountByPeriod', JSON.stringify(service)) ;
    }

    getPaymentAmountByPeriod(period: String): Observable<Ichartdataresponse> {
        var service = { 'strFlag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetPaymentAmountByPeriod', JSON.stringify(service)) ;
    }

    getInvoiceCountByPeriod(period: String): Observable<Ichartdataresponse> {
        var service = { 'strFlag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetInvoiceCountByPeriod', JSON.stringify(service)) ;
    }

    getPaymentCountBasedOnSubSystem(period: String): Observable<Ichartdataresponse> {
        var service = { 'strFlag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetPaymentCountBasedOnSubSystem', JSON.stringify(service)) ;
    }
}