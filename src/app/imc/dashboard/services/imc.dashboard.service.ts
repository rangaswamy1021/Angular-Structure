import { HttpService } from './../../../shared/services/http.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs';
import { IUserEvents } from "../../../shared/models/userevents";
@Injectable()
export class IMCDashboardService {
    private dashboardUrl = 'IMCDashBoard/';
    constructor(private http: HttpService) { }
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });
    getItemsCount() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetItemsCount');
    }
    getItemsStatusCount(userevents?: IUserEvents) {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetItemsStatusCount', userevents);
    }
    getVendorItemsCount() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetVendorItemsCount');
    }
    geItemsCountByPeriod(period) {    //,
        var obj = { 'flag': period }
        return this.http.postHttpMethod(this.dashboardUrl + 'GeItemsCountByPeriod', JSON.stringify(obj));

    }
    getCountsBasedOnItemType() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetCountsBasedOnItemType');
    }
    getRetailerItemsPendingCount() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetRetailerItemsPendingCount');
    }
    getPendingVendorItemsCount() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetPendingVendorItemsCount');
    }
    getItemsOutOfThreshold() {
        return this.http.getHttpWithoutParams(this.dashboardUrl + 'GetItemsOutOfThreshold');
    }


}