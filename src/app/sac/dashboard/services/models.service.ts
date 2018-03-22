import { IUserEvents } from './../../../shared/models/userevents';
import { Ichartdataresponse } from './../../../csc/dashboard/models/chardataresponse';
import { IDashBoard } from './../../../csc/dashboard/models/dashboardrequest';

import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";

@Injectable()
export class SacDashBoardService {
    constructor(private http: HttpService) { }

    private dashboardUrl = "helpdesk/"

    getTotalComplaintStatuses(userEvents?:IUserEvents): Observable<Ichartdataresponse> {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetTotalComplaintStatuses', userEvents) ;
    }
    getTopUsernamesCount(): Observable<Ichartdataresponse> {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetTopUsernamesCount') ;
    }

    getPMStatusCount(rollUpLevel: String): Observable<Ichartdataresponse> {
        var service = { 'rollUpLevel': rollUpLevel }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetPMStatusCount', JSON.stringify(service)) ;
    }

    getPMSeverityCount(rollUpLevel: String): Observable<Ichartdataresponse> {
        var service = { 'rollUpLevel': rollUpLevel }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetPMSeverityCount', JSON.stringify(service)) ;
    }

    
    getPMTypeCount(rollUpLevel: String): Observable<Ichartdataresponse> {
        var service = { 'rollUpLevel': rollUpLevel }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetPMTypeCount', JSON.stringify(service)) ;
    }




    
}