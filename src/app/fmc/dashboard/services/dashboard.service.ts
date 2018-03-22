import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs/Observable";
import { IDashBoardRequest } from "../models/fmcdashboardreq";
import { IDashBoardResponse } from "../models/fmcdashboardres";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class FMCDashBoardService {
    constructor(private http: HttpService) { }
    private dashboardurl = 'FmcDashboard/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });
   getRevenue(objDashBoardsreq: IDashBoardRequest,userEvents?: IUserEvents): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetRevenue', JSON.stringify(objDashBoardsreq),userEvents);
    }
    getCash(objDashBoardsreq: IDashBoardRequest): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetCashInFlow', JSON.stringify(objDashBoardsreq));
    }
    getRevenueTrend(objDashBoardsreq: IDashBoardRequest): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetRevenueTrending', JSON.stringify(objDashBoardsreq));
    }
    getAccountPayables(objDashBoardsreq: IDashBoardRequest): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetAccountPayables', JSON.stringify(objDashBoardsreq));
    }
     getAccountReceivables(objDashBoardsreq: IDashBoardRequest): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetAccountReceivables', JSON.stringify(objDashBoardsreq));
    }
    getBalanceSheets(objDashBoardsreq: IDashBoardRequest): Observable<IDashBoardResponse[]> {
        return this.http.postHttpMethod(this.dashboardurl + 'GetBalanceSheet', JSON.stringify(objDashBoardsreq));
    }


}