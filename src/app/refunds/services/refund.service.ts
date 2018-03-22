import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from '../../shared/services/http.service';
import { IRefundRequest } from "../models/RefundRequest";
import { IRefundResponse } from "../models/RefundResponse";
import { IBalanceRequest } from '../../csc/customerdetails/models/balancerequest';
import { BalanceTypes } from '../../shared/constants';
import { IBalanceResponse } from '../../csc/customerdetails/models/balanceresponse';
import { IRefundProcess } from '../models/RefundProcess';
import { IUserEvents } from '../../shared/models/userevents';

@Injectable()
export class RefundService {
    constructor(private baseService: HttpService) {
    }

    private _refundUrl = 'Refunds/';

    getRefundRequests(refundRequest: IRefundRequest, userEvents?: IUserEvents): Observable<IRefundResponse[]> {
        let obj = JSON.stringify(refundRequest);
        return this.baseService.postHttpMethod(this._refundUrl + 'GetRefundRequests', obj, userEvents) ;
    }

    postRefundRequests(refund: IRefundRequest, userEvents?: IUserEvents): Observable<IRefundProcess[]> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'PostRefundRequestQueue', obj, userEvents) ;
    }

    getRefundQueue(refund: IRefundRequest, userEvents?: IUserEvents): Observable<IRefundResponse[]> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'getRefundQueue', obj, userEvents) ;
    }

    getBalanceByBalanceType(CustomerId: number, BalanceTypes: string): Observable<IBalanceResponse> {
        var data: any = { 'longCustomerId': CustomerId, 'strBalanceType': BalanceTypes };
        console.log(data);
        return this.baseService.postHttpMethod(this._refundUrl + 'getBalanceByBalanceType', data) ;
    }
    updateBulkRefundQueue(refund: IRefundRequest, userEvents ?:IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'updateBulkRefundQueue', obj, userEvents) ;
    }

    processRefunds(refund: IRefundRequest, userEvents?:IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'processRefunds', obj,userEvents) ;
    }

    RefundRequests_Queue_Update(refund: IRefundRequest, userEvents: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'RefundRequests_Queue_Update', obj, userEvents) ;
    }

    refundRequestCustomers_PrintFormDetails_Get(refund: IRefundRequest): Observable<IRefundProcess[]> {
        let obj = JSON.stringify(refund);
        return this.baseService.postHttpMethod(this._refundUrl + 'RefundRequestCustomers_PrintFormDetails_Get', obj) ;
    }
}
