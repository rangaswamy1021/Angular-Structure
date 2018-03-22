import { IItemRequest } from './../models/itemrequest';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { IItemResponse } from "../models/itemresponse";
import { ICommonResponse } from "../../../shared/models/commonresponse";
import { ITagRequest } from "../models/tagrequest";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class InventoryService {
    dataFromService;
    viewTagsFromService;
    goToBulkManage: boolean;
    viewItemsFromService;
    constructor(private http: HttpService) { }
    private inventoryUrl = 'Inventory/';
    private commonUrl = 'Common/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    searchInventoryItems(tagRequestSearch: ITagRequest, userEvents: IUserEvents) {
        return this.http.postHttpMethod(this.inventoryUrl + 'SearchItems', tagRequestSearch, userEvents);
    }

    getItemsTagTypes(iItemRequest: IItemRequest, userEvents: IUserEvents) {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetItemsTagTypes', userEvents);
    }
    getTagHistory(tagRequest: ITagRequest, userevents: IUserEvents) {
        return this.http.postHttpMethod(this.inventoryUrl + 'GetHistoryByTagId', tagRequest, userevents);
    }
    updateStatus(tagUpdate: ITagRequest, userEvents: IUserEvents) {
        var obj = { 'objTagRequest': tagUpdate, 'userEvents': userEvents }
        return this.http.postHttpMethod(this.inventoryUrl + 'ManageTagStatus', JSON.stringify(obj));
    }
    bulkTagUpdateStatus(tagUpdate: ITagRequest[], userEvents: IUserEvents) {
        var obj = { 'objTagRequest': tagUpdate }
        return this.http.postHttpMethod(this.inventoryUrl + 'BulkManageTagStatus', JSON.stringify(obj), userEvents);
    }

    searchBulkItems(objTagRequestObject: ITagRequest, userEvents: IUserEvents) {
        return this.http.postHttpMethod(this.inventoryUrl + 'BulkTagSearch', objTagRequestObject, userEvents);

    }

    getAllStatus(iItemRequest: IItemRequest, userEvents?: IUserEvents) {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetAllTagStatuses', userEvents);
    }
    getItemDetails(iItemRequest: IItemRequest, userEvents: IUserEvents) {
        var obj = { 'itemReq': iItemRequest }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetItemDetails', JSON.stringify(obj), userEvents);
    }

    addVendorItems(iItemRequest: IItemRequest, itemRequestList: IItemRequest[], userEvents: IUserEvents): Observable<number> {
        var obj = { 'itemReq': iItemRequest, 'itemReqList': itemRequestList }
        return this.http.postHttpMethod(this.inventoryUrl + 'CreateVendorItems', obj, userEvents);
    }
    updateInventoryItems(iItemRequest: IItemRequest, itemRequestList: IItemRequest[], userEvents: IUserEvents): Observable<number> {
        var obj = { 'itemReq': iItemRequest, 'itemReqList': itemRequestList }
        return this.http.putHttpMethod(this.inventoryUrl + 'UpdateVendorItems', obj, userEvents);
    }
    deleteItemsByItemId(iItemRequest: IItemRequest, userEvents: IUserEvents): Observable<boolean> {
        var obj = { 'itemReq': iItemRequest }
        return this.http.postHttpMethod(this.inventoryUrl + 'DeleteItemsByItemId', JSON.stringify(obj), userEvents);
    }

    getInventryItemTypes(): Observable<any> {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetItemsTypes');
    }

    getInventryProtocol(): Observable<any> {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetLookUps');
    }

    getInventryMounting(protocol: string): Observable<ICommonResponse[]> {
        var obj = { 'protocol': protocol }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetMountingbasedOnProtocol', JSON.stringify(obj));
    }

    getVendors(): Observable<any> {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetVendorNames');
    }
    getVendorsByItemId(itemId: number): Observable<any[]> {
        var obj = { 'itemId': itemId }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetVendorsByItemId', JSON.stringify(obj));
    }


    editVendorsByItemId(iItemRequest: IItemRequest) {
        var obj = { 'itemId': iItemRequest }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetVendorsByItemId', JSON.stringify(obj));
    }

    checkInventoryItemName(itemName: string) {
        var obj = { 'itemName': itemName }
        return this.http.postHttpMethod(this.inventoryUrl + 'CheckItemName', JSON.stringify(obj));
    }

    checkInventoryItemCode(itemCode: string) {
        var obj = { 'itemCode': itemCode }
        return this.http.postHttpMethod(this.inventoryUrl + 'CheckItemCode', JSON.stringify(obj));
    }

    checkInventoryItemPrice(itemPrice: string) {
        var obj = { 'itemPrice': itemPrice }
        return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParameterValueByParameterKey', "strKey", itemPrice);
    }
    getInventoryLocations(itemRequest: IItemRequest) {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetInventoryLocations');
    }
  
    getTagStatusbyMatrix(tagStatus: string) {
        var obj = { 'tagStatus': tagStatus }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetTagStatusbyMatrix', JSON.stringify(obj));
    }


    getPlanDetail(accountId) {
        var obj = { 'accountId': accountId }
        return this.http.postHttpMethod(this.inventoryUrl + 'GetPlanDetailsByCustomerId', JSON.stringify(obj));
    }
    getVehicleTags(tagStatus: string) {
        return this.http.getHttpWithParams(this.commonUrl + 'getApplicationParameterValueByParameterKey', "strKey", tagStatus.toString());
    }

}