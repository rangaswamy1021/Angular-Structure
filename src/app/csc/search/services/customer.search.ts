import { ICustomerProfileResponse } from './../../../shared/models/customerprofileresponse';
import { IPayAdvanceTollResponse } from './../models/payadvancetollsresponse';
import { IPayAdvanceTollRequest } from './../models/payadvancetollsrequest';
import { ISearchCustomerResponse } from './../models/searchcustomerresponse';
import { ISearchCustomerRequest } from './../models/searchcustomerrequest';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from '../../../shared/services/http.service';
import { ICustomerActivitesRequest } from '../../customerdetails/models/customeractivitiesrequest';
import { ICustomerActivitesResponse } from '../../customerdetails/models/customeractivitesresponse';
import { IProfileResponse } from '../models/ProfileResponse';
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class CustomerSearchService {
    totalCount: any;
    pageIndex: any;
    searchResults: any;
    searchData: any;
    constructor(private http: HttpService) { }
    private searchUrl = 'Search/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getBasicSearch(searchCustomer: ISearchCustomerRequest, userEvents?: IUserEvents): Observable<ICustomerProfileResponse[]> {
        let obj = JSON.stringify(searchCustomer);
        return this.http.postHttpMethod(this.searchUrl + 'BasicCustomerSearch', obj, userEvents);
    }

    getAdvancedSearch(searchCustomer: ISearchCustomerRequest, userEvents?: IUserEvents): Observable<ICustomerProfileResponse[]> {
        let obj = JSON.stringify(searchCustomer);
        return this.http.postHttpMethod(this.searchUrl + 'AdvancedCustomerSearch', obj, userEvents);
    }

    bindCustomerInfoBlock(longAccountId: number): Observable<any> {
        var data: any = { 'longAccountId': longAccountId };
        return this.http.postHttpMethod(this.searchUrl + 'bindCustomerInfoBlock', data);
    }

    getCustomerActivites(objCustActivityReq: ICustomerActivitesRequest, userEvents?: IUserEvents): Observable<ICustomerActivitesResponse[]> {
        let obj = JSON.stringify(objCustActivityReq);
        return this.http.postHttpMethod(this.searchUrl + 'GetNotes', obj, userEvents);

    }

    getRecentActivities(objCustActivityReq: ICustomerActivitesRequest, userEvents?: IUserEvents): Observable<ICustomerActivitesResponse[]> {
        let obj = JSON.stringify(objCustActivityReq);
        return this.http.postHttpMethod(this.searchUrl + 'GetRecentActivities', obj, userEvents);

    }

    getOneTimeTollCustomers(advanceTollObj: IPayAdvanceTollRequest, userEvents): Observable<IPayAdvanceTollResponse[]> {
        let obj = JSON.stringify(advanceTollObj);
        return this.http.postHttpMethod(this.searchUrl + 'GetOneTimeTollCustomers', obj, userEvents);

    }

    getOneTimeTollTransactions(custId: number) {
        return this.http.postHttpMethod(this.searchUrl + 'GetOneTimeTollTransactions', custId);

    }
    getCovertOTTCustomers(custId: number, userEvents?) {
        return this.http.postHttpMethod(this.searchUrl + 'GetCovertOTTCustomers', custId, userEvents);
    }
    getCustomerBalancesbyAccountId(custId: number) {
        return this.http.postHttpMethod(this.searchUrl + 'GetCustomerBalancesbyAccountId', custId);
    }
    convertOTTMakePayment(paymentObj: any, userEvents) {
        var obj = JSON.stringify(paymentObj);
        return this.http.postHttpMethod(this.searchUrl + 'ConvertOTTMakePayment', obj, userEvents);
    }
   InsertTimeSpentEvents(customerId: number, strUserName: string): Observable<number> {
        var data = { 'customerId': customerId, 'userName': strUserName }
        return this.http.postHttpMethod(this.searchUrl + 'InsertTimeSpentEvents', JSON.stringify(data));
    }
    saveSearchData(searchResults, searchInput, pageIndex, totalCount?) {
        this.searchResults = searchResults;
        this.searchData = searchInput;
        this.pageIndex = pageIndex
        this.totalCount = totalCount;
    }
}
