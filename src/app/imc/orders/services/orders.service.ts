import { HttpService } from './../../../shared/services/http.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs';
//import { IOrdersResponse } from "../models/ordersresponse";
import { IPurchaseOrderSearchRequest } from "../models/purchaseorderseacrhrequest";
import { IPurchaseOrderDetailRequest } from "../models/purchaseorderdetailsrequest";
import { IPurchaseOrderSearchResponse } from "../models/purchaseorderseacrhresponse";
import { IContractRequest } from "../../contract/models/contractrequest";
import { IPurchaseOrderDetailResponse } from "../models/purchaseorderdetailsresponse";
import { IUserEvents } from "../../../shared/models/userevents";
@Injectable()
export class OrdersService {
    dataFromSearch
    purchaseOrderSearchDetails;
    purchaseOrderReturnSerachDetails;
    public _dataFromService: IPurchaseOrderSearchResponse;
    public _dataReturnFromService: IPurchaseOrderSearchResponse;
    private purchaseOrderUrl = 'purchaseorder/';
    constructor(private http: HttpService) { }
    private uploadUrl = '/CustomerAccounts/';
    private vendorUrl = 'Vendor/';
    private warrantyUrl = 'warranty/'
    private contractUrl = 'Contract/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });


    public dataFromService() {
        return this._dataFromService;
    }
    public dataReturnFromService() {
        return this._dataReturnFromService;
    }
    private setDataFromService(purchaseOrder: IPurchaseOrderSearchResponse) {
        this._dataFromService = purchaseOrder;
    }
    private setDataReturnFromService(purchaseOrder: IPurchaseOrderSearchResponse) {
        this._dataReturnFromService = purchaseOrder;
    }
    savePurchaseOrderDetails(purchaseOrder: IPurchaseOrderSearchResponse) {
        this.setDataFromService(purchaseOrder);
    }
    saveReturnPurchaseOrderDetails(purchaseOrder: IPurchaseOrderSearchResponse) {
        this.setDataReturnFromService(purchaseOrder);
    }

    createPurchaseOrder(contractRequest: IPurchaseOrderDetailRequest, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'CreatePurchaseorder', contractRequest, userEvents);
    }
    cancelPurchaseOrder(objPODetailsReq: IPurchaseOrderDetailRequest, userEvents?: IUserEvents) {


        return this.http.postHttpMethod(this.purchaseOrderUrl + 'CancelPurchaseOrder', objPODetailsReq, userEvents);
    }
    getPurchaseOrderDetailstoGrid(itemDetailsRequest: IPurchaseOrderDetailRequest, userEvents?: IUserEvents) {

        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetPurchaseOrderDetailsView', itemDetailsRequest, userEvents);
    }
    getPurchaseOrderDetails(contractRequest: IPurchaseOrderSearchRequest, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'SearchPurchaseOrder', contractRequest, userEvents);
    }

    getPurchaseOrderStatuses() {
        return this.http.getHttpWithoutParams(this.purchaseOrderUrl + 'GetPurchaseOrderStatuses');
    }

    getContractName(contractRequest: any) {
        var data = { 'vendorId': contractRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetContractDetailsByVendorID', JSON.stringify(data));
    }
    getWarrantyName(contractRequest: any) {
        var data = { 'contractId': contractRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetWarrantyDetailsByContractId', JSON.stringify(data));
    }

    getWarrantyItems(contractRequest: any) {
        var data = { 'vendorId': contractRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetVendorItems', JSON.stringify(data));
    }
    checkItemQuantity(itemRequest: any) {
        var data = { 'itemId': itemRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'CheckMinOrderMaxOrderbyItemId', JSON.stringify(data));
    }
    getPurchaseItemDetails(itemRequest: any) {
        var data = { 'itemId': itemRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetItemDetailsByItemId', JSON.stringify(data));
    }
    getVendorSupplierDetails(itemRequest: any) {
        var data = { 'vendorId': itemRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'CheckForVendorSupplierCode', JSON.stringify(data));
    }
    POUniquenessCheck(itemRequest: any) {
        var data = { 'poNumber': itemRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'POUniquenessCheck', JSON.stringify(data));
    }


    getInvoiceItemDetails(poNumber: any) {

        var data = { 'poNumber': poNumber }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetInvoiceItemDetails', JSON.stringify(data));
    }


    //for Return Purchase to details
    getReturnPurchaseOrderDetailstoGrid(itemDetailsRequest: IPurchaseOrderDetailRequest, userEvents: IUserEvents) {

        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetPurchaseOrderDetailsView', itemDetailsRequest, userEvents);
    }




    //return purchase order grid and search
    getReturnPurchaseOrderDetailsView(returnPurchaseRequest: IPurchaseOrderSearchRequest, userEvents: IUserEvents) {
        var data = { 'objPOSearchReq': returnPurchaseRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'SearchReturnPurchaseOrder', JSON.stringify(data), userEvents);
    }

    //return purchase order Vendor names
    getVendorNames() {
        return this.http.getHttpWithoutParams(this.vendorUrl + 'GetVendorNames');
    }

    // to get all drop down
    getPOInfoByPONumberToReturn(poNumber): Observable<IPurchaseOrderDetailResponse> {
        var data = { 'oldPurchaseNo': poNumber }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'GetPOInfoByPONumberToReturn', JSON.stringify(data));

    }

    generateReturnPurchaseOrder(objPurchaseOrderReqDC: IPurchaseOrderDetailRequest, userEvents: IUserEvents) {
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'CreatePO', objPurchaseOrderReqDC, userEvents);
    }

    //delete for return
    deletePurchaseOrder(objPODetailsReq: IPurchaseOrderDetailRequest, userEvents: IUserEvents) {

        return this.http.postHttpMethod(this.purchaseOrderUrl + 'DeletePurchaseOrder', objPODetailsReq, userEvents);
    }

    oldPOUniquenessCheck(itemRequest: any) {
        var data = { 'poNumber': itemRequest }
        return this.http.postHttpMethod(this.purchaseOrderUrl + 'POUniquenessCheck', JSON.stringify(data));
    }

}