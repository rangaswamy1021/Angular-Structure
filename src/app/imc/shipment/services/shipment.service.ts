import { IUserEvents } from './../../../shared/models/userevents';
import { IShipmentSearchRequest } from './../models/shipmentsearchrequest';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { ICommonResponse } from "../../../shared/models/commonresponse";
import { IItemDetailsRequest } from "../models/itemdetailsrequest";
import { IShipmentSearchResponse } from "../models/shipmentsearchresponse";
import { IShipmentDetailsResponse } from "../models/shipmentdetailsresponse";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IShipmentDetailsrequest } from "../models/shipmentdetailsrequest";

@Injectable()
export class ShipmentService {
    public _shipmentDetails: IShipmentDetailsrequest = null;
    shipmentContext: IShipmentDetailsrequest;
    dataFromService;
    rangeSerialNum = [];
    viewItemsFromService;
    batchDataFromService;
    receivedQty;
    purchaseOrderDetails;
    private contextSource = new BehaviorSubject<IShipmentDetailsrequest>(this.shipmentContext);
    currentContext = this.contextSource.asObservable();

    constructor(private http: HttpService) { }
    private shipmentUrl = 'Shipment/';
    private vendorUrl = 'Vendor/';
    private inventoryUrl = 'Inventory/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });
    public shipmentDetails() {
        return this._shipmentDetails;
    }

    private setShipmentDetails(shipmentDetails: IShipmentDetailsrequest) {
        this._shipmentDetails = shipmentDetails;
    }

    saveShipmentDetails(shipmentDetails: IShipmentDetailsrequest) {
        this.setShipmentDetails(shipmentDetails);
    }

    getShipmentStatuses(): Observable<any> {
        return this.http.getHttpWithoutParams(this.shipmentUrl + 'GetShipmentStatuses');
    }

    getShipmentInformation(shipmentRequest: IShipmentSearchRequest, userEvents?: IUserEvents) {
        var obj = { 'shipmentId': shipmentRequest }
        return this.http.postHttpMethod(this.shipmentUrl + 'ShipmentSearch', JSON.stringify(obj), userEvents);
    }
    //shipment Details Div
    getShipmentDetails(shipmentId: number) {
        var obj = { 'shipmentId': shipmentId }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetShipmentDetailsByShipmentId', obj);
    }

    //shipment details grid
    getItemDetailsByShipmentId(objShipmentRequest: IItemDetailsRequest, userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this.shipmentUrl + 'GetItemDetailsByShipmentId', objShipmentRequest, userEvents);
    }
    //Vendor Details in shipment Details Div
    getAddressTypeByVendorId(vendorId: number, addressType: string) {
        var obj = { 'vendorId': vendorId, 'addressType': addressType }
        return this.http.postHttpMethod(this.vendorUrl + 'GetVendorDetailsByVendorId', JSON.stringify(obj));
    }

    //Purchase Order DropDown in batch Information
    purchaseOrderDropdownsData(userevents?:IUserEvents) {
        return this.http.getHttpWithoutParams(this.shipmentUrl + 'GetPurchaseOrderByStatus',userevents);
    }
    //shipment-batch-information
    getOrderDetailsBasedOnPurchaseOrderNum(shipmentPurchaseNumber: string) {
        var obj = { 'purchaseNumber': shipmentPurchaseNumber }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetOrderDetailsBasedOnOrderNum', JSON.stringify(obj));
    }

    //shipment batch item dropdown
    getItemDetailsByOrderId(shipmentPurchaseNumber: any) {
        var obj = { 'purchaseNumber': shipmentPurchaseNumber }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetItemsByOrderId', JSON.stringify(obj));
    }

    //shipment batch values based on iten dropdown
    getMountingByItemId(itemId: any) {
        var obj = { 'itemId': itemId }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetMountingByItemId', JSON.stringify(obj));
    }
    changeResponse(context: IShipmentDetailsrequest) {
        this.contextSource.next(context)
    }

    // *** to bind the Tag type to dropdown  ******************************
    getTagtypes() {
        return this.http.getHttpWithoutParams(this.inventoryUrl + 'GetLookups')

    }
    // get Agency by protocol type (to bind agency code to dropdown)
    //when Tag Type is EZPASS-TDM
    getAgencyByProtocolType(agencyCode: any) {
        var obj = { 'protocol': agencyCode }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetAgencyByProtocolType', JSON.stringify(obj))
            ;
    }

    // to bind the grid and need to pass some details from prevois page
    getPOItemsByOrderNumber(purchaseOrderNumber: any, itemId: string) {
        var obj = { 'purchaseOrderNumber': purchaseOrderNumber, 'itemId': itemId }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetPOItemsByOrderNumber', JSON.stringify(obj))
            ;
    }

    // *****
    // to get config key values and need to call this method in pageload
    getConfigKeyValue(keyValue: any) {
        var obj = { 'keyValue': keyValue }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetConfigKeyValue', JSON.stringify(obj))
            ;
    }

    //while validating the *first 6 digits* ( FacilityCode )
    getItemFacilityCodeRanagesBacedOnAgencies(agencyCode: string) {
        var obj = { 'agencyCode': agencyCode }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetItemFacilityCodeRanagesBacedOnAgencies', JSON.stringify(obj))
            ;
    }

    //to get available tag serial numbers in database
    getAvailableSerialNumbersList(startRange: number, endRange: number) {
        var obj = { 'startRange': startRange, 'endRange': endRange }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetAvailableSerialNumbersList', JSON.stringify(obj))
            ;
    }

    // to check the serial number is valid or not
    checkSerialNumber(startRange: number, applicationParam: any, tagSupplierID: any) {
        var obj = { 'startRange': startRange, 'applicationParam': applicationParam, 'tagSupplierID': tagSupplierID }
        return this.http.postHttpMethod(this.shipmentUrl + 'CheckSerialNumber', JSON.stringify(obj))
            ;
    }

    // to get the end range
    endRangeCalcuation(startRange: number, tagType: string, quantity: number) {
        var obj = { 'startRange': startRange, 'tagType': tagType, 'quantity': quantity }
        return this.http.postHttpMethod(this.shipmentUrl + 'EndRangeCalcuation', JSON.stringify(obj))
            ;
    }

    // to get shipped quantity fron config 
    getMaxShipmentQuantity() { // ( this method is not available in backend) ????

    }

    // in sacn scenario 
    checkSerialNumberAvilability(startRange: number) {
        var obj = { 'startRange': startRange }
        return this.http.postHttpMethod(this.shipmentUrl + 'CheckSerialNumberAvilability', JSON.stringify(obj))
            ;
    }
    getAgencyByProtocol(startRange: any) {
        var obj = { 'protocol': startRange }
        return this.http.postHttpMethod(this.shipmentUrl + 'GetAgencyByProtocolType', JSON.stringify(obj))
            ;
    }
    insertShipmentDetails(inventoryItems: String[], shipmentDetails, userEvents?: IUserEvents) {
        var obj = { 'inventoryDetails': inventoryItems, 'objShipmentRequest': shipmentDetails }
        return this.http.postHttpMethod(this.shipmentUrl + 'InsertShipmentDetails', JSON.stringify(obj), userEvents)
            ;
    }


}