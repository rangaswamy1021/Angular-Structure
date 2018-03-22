import { IUserEvents } from './../../../shared/models/userevents';
import { HttpService } from './../../../shared/services/http.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs';
import { IInventoryRequest } from "../models/inventoryrequest";
import { IReturnedPOItemRequest } from "../models/returnedpoitemsrequest";
import { ITagSummaryRequest } from "../models/tagummaryrequest";


@Injectable()
export class ImcReportsService {
    private IMCReportsUrl = 'IMCReports/';
    constructor(private http: HttpService) { }

    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    convertToHexTagId(objServiceRequestInventory: IInventoryRequest, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.IMCReportsUrl + 'ConvertToHexTagId', objServiceRequestInventory, userEvents);
    }
    getReturnedPOItems(objTReturnedPOItemsReq: IReturnedPOItemRequest, userevents: IUserEvents) {
        return this.http.postHttpMethod(this.IMCReportsUrl + 'GetReturnedPOItems', objTReturnedPOItemsReq, userevents);
    }
    getTagToExpireCount(objInventoryReq: ITagSummaryRequest, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.IMCReportsUrl + 'GetTagToExpireCount', objInventoryReq, userEvents);
    }

    getInventoryLocations() {
        return this.http.getHttpWithoutParams(this.IMCReportsUrl + 'GetInventoryLocations');
    }
    getAllTagStatuses() {
        return this.http.getHttpWithoutParams(this.IMCReportsUrl + 'GetAllTagStatuses');
    }
    getAllCustomerAccountStatuses() {
        return this.http.getHttpWithoutParams(this.IMCReportsUrl + 'GetAllCustomerAccountStatuses');
    }

    getTagReportSummary(objTagReportSummaryReq, userEvent?: IUserEvents) {
        return this.http.postHttpMethod(this.IMCReportsUrl + 'GetTagReportSummary', objTagReportSummaryReq, userEvent);
    }2

    getWarrantyEndDate(objServiceRequestInventory: IInventoryRequest, userevents?: IUserEvents) {
        return this.http.postHttpMethod(this.IMCReportsUrl + 'GetWarrantyEndDate', objServiceRequestInventory, userevents);
    }
    GetTagHistoryReport(objTagHistoryReportReq, userEvents?: IUserEvents) {

        return this.http.postHttpMethod(this.IMCReportsUrl + 'GetTagHistoryReport', objTagHistoryReportReq, userEvents);//.map(res => res.json());
    }
}