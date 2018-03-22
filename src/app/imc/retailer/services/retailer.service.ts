import { Injectable } from '@angular/core';
import { Http, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { IretailerRequest } from "../models/retailerrequest";
import { IRetailerLoginRequest } from "../models/retailerloginrequest";
import { ICommonResponse } from "../../../shared/models/commonresponse";
import { IPOSOutletItems } from "../models/retaileruserrequest";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class RetailerService {

    constructor(private http: HttpService) { }
    private retailerUrl = 'Retailer/';
    private communication = 'Communication/';
    private inventoryUrl = 'Inventory/';
    private commonUrl = 'Common/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getRetailerSearchDetails(objRetailer, userevents?: IUserEvents) {
        return this.http.postHttpMethod(this.retailerUrl + 'GetRetailerBySearch', objRetailer, userevents);
    }
    getLookups() {
        return this.http.getHttpWithoutParams(this.retailerUrl + 'GetLookups');
    }
    getFulfilledItemsbyRetailerId(retailerId, userevents?: IUserEvents) {
        var retailerID = { 'retailerId': retailerId }
        return this.http.postHttpMethod(this.retailerUrl + 'GetFulfilledItemsbyRetailerId', JSON.stringify(retailerID), userevents);
    }
    CreateRetailerUserAndLogin(objRetailerUser, userevents?: IUserEvents) {
        return this.http.postHttpMethod(this.retailerUrl + 'CreateRetailerUserAndLogin', objRetailerUser, userevents);
    }
    updateRetailerUser(objRetailerUser, userevents?: IUserEvents) {
        return this.http.putHttpMethod(this.retailerUrl + 'UpdateRetailerUser', objRetailerUser, userevents);
    }
    getRetailerUserDetails(objRetailerUserServiceReq, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.retailerUrl + 'GetRetailerUsers', objRetailerUserServiceReq, userEvents);
    }
    isEmailExist(strEmailAddress: string): Observable<boolean> {
        var obj = { 'emailAddress': strEmailAddress }
        return this.http.postHttpMethod(this.communication + 'IsEmailExists', JSON.stringify(obj));
    }
    isExistsRetailerUser(userName: string): Observable<boolean> {
        var obj = { 'userName': userName }
        return this.http.postHttpMethod(this.retailerUrl + 'IsExistsRetailerUser', JSON.stringify(obj));
    }
    makePayment(objServicePaymentReq, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.retailerUrl + 'MakePayment', objServicePaymentReq, userEvents);
    }
    deleteretailerData(objReqCustomer: IretailerRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.putHttpMethod(this.retailerUrl + 'UpdateAccountStatus', objReqCustomer, userEvents);
    }
    retailerResetPassword(retailerId) {
        var retailerID = { 'retailerId': retailerId }
        return this.http.postHttpMethod(this.retailerUrl + 'GetRetailerAdminByCustomerId', JSON.stringify(retailerID));
    }
    updateRetailerRandomPassword(objRetailerReq: IRetailerLoginRequest): Observable<boolean> {
        return this.http.putHttpMethod(this.retailerUrl + 'UpdateRetailerRandomPassword', objRetailerReq);
    }
    getActiveRetailers() {
        return this.http.getHttpWithoutParams(this.retailerUrl + 'GetActiveRetailers');
    }
    getInventryProtocol(userEvents?: IUserEvents): Observable<any> {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetLookUps', userEvents);
    }
    getInventryMounting(protocol: string): Observable<ICommonResponse[]> {
        var obj = { 'protocol': protocol }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetMountingbasedOnProtocol', JSON.stringify(obj));
    }
    getPOSOutletFulfillment(POSOutlet: IPOSOutletItems, userevents?: IUserEvents) {
        var obj = { 'objPOSOutletItemsReq': POSOutlet, }
        return this.http.postHttpMethod(this.retailerUrl + 'POSOutletFulfillment', JSON.stringify(obj), userevents);
    }
    getApplicationParameterValueByParameterKey(ParameterKey: string) {
        return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParameterValueByParameterKey', 'strKey', ParameterKey);
    }







}