import { HttpService } from "./../../../shared/services/http.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IaddCashDetailsResponse } from "../models/addcashdetailsresponse";
import { IaddCashDetailsRequest } from "../models/addcashdetailsrequest";
import { IcashManagementReportResponse } from "../models/cashmanagementreportsresponse";
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class CashManagementService {
    constructor(private http: HttpService) { }
    private searchUrl = 'ICN/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });


    getBeginAmountForCashManagement(): Observable<IaddCashDetailsResponse> {
        return this.http.getHttpWithoutParams(this.searchUrl + 'GetBeginAmountForCashManagement');
    }
    assignChangeFund(objData: IaddCashDetailsRequest,userEvents: IUserEvents): Observable<IaddCashDetailsResponse> {
        return this.http.postHttpMethod(this.searchUrl + 'AssignChangeFund', JSON.stringify(objData),userEvents);
    }
    getChangeFundDetails(objData: IaddCashDetailsRequest,userEvents?: IUserEvents): Observable<IaddCashDetailsResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetChangeFundDetails', JSON.stringify(objData),userEvents);
    }
    getChangeFundDenominationDetails(objChangeFund: IaddCashDetailsRequest): Observable<IcashManagementReportResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetChangeFundDenominationDetails', JSON.stringify(objChangeFund));
    }
}