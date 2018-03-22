import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { IvendorRequest } from "../models/vendorrequest";
import { IAddressResponse } from "../../../shared/models/addressresponse";
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class VendorService {
    constructor(private http: HttpService) { }
    private vendorUrl = 'Vendor/';
    private commonUrl = 'common/';
    private communication = 'Communication/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getVendorSearchData(companyName: string): Observable<string> {
        return this.http.getHttpWithParams(this.vendorUrl + 'GetVehiclebyPK', "longVehicleId", companyName);
    }

    //Delete Vendor Means Changing the Status into active or Inactive
    deleteVendorData(vendorRequest: IvendorRequest, userEvents?: IUserEvents): Observable<boolean> {
        var data = { 'objVendorRequest': vendorRequest }
        return this.http.putHttpMethod(this.vendorUrl + 'ChangeVendorStatus', JSON.stringify(data), userEvents);
    }

    //This method is used to get the data    
    getVendorDetails(vendorRequest: IvendorRequest, userEvents?: IUserEvents) {
        var obj = { 'objVendorRequest': vendorRequest }
        return this.http.postHttpMethod(this.vendorUrl + 'GetVendorDetails', JSON.stringify(obj), userEvents);
    }

    //Populate data 
    GetVendorCompanyInformation(vendorId) {
        var obj = { 'vendorId': vendorId }
        return this.http.postHttpMethod(this.vendorUrl + 'GetVendorCompanyInformation', JSON.stringify(obj));
    }

    GetDetailsOfVendor(vendorId, addressType) {
        var obj = { 'vendorId': vendorId, 'addressType': addressType }
        return this.http.postHttpMethod(this.vendorUrl + 'GetDetailsOfVendor', JSON.stringify(obj));
    }

    //This method is used to search the data
    getVendoSearchDetails(vendorRequest: IvendorRequest, userEvents: IUserEvents) {
        var obj = { 'objVendorRequest': vendorRequest, }
        return this.http.postHttpMethod(this.vendorUrl + 'GetVendorDetails', JSON.stringify(obj), userEvents);
    }


    //Add customer ful address
    CreateVendor(objVendorRequest: IvendorRequest, userEvents?: IUserEvents) {
        //var obj = { 'objVendorRequest': objVendorRequest }
        return this.http.postHttpMethod(this.vendorUrl + 'CreateVendor', objVendorRequest, userEvents);
    }

    UpdateVendor(objVendorRequest: IvendorRequest, userevents?: IUserEvents) {
        // var obj = { 'objVendorRequest': objVendorRequest }
        return this.http.postHttpMethod(this.vendorUrl + 'UpdateVendor', objVendorRequest, userevents);
    }

    checkVendorCompanyName(companyName: IvendorRequest) {
        var obj = { 'companyName': companyName }
        return this.http.postHttpMethod(this.vendorUrl + 'CheckCompanyName', JSON.stringify(obj));
    }

    //get address by type and customer id
    getAddressByTypeByCustomer(vendorId: number, addressType: string): Observable<IAddressResponse> {
        var obj = { 'vendorId': vendorId, 'addressType': addressType }
        return this.http.postHttpMethod(this.vendorUrl + 'GetDetailsOfVendor', JSON.stringify(obj));
    }
    //Checking Items associated with this vendor,or Not
    getContractDetailsByVendorID(vendorId) {
        var obj = { 'vendorId': vendorId }
        return this.http.postHttpMethod(this.vendorUrl + 'GetContractDetailsByVendorID', JSON.stringify(obj));

    }
    //Checking Emails Is EXist Are Not
    isEmailExist(strEmailAddress: string): Observable<boolean> {
        var obj = { 'emailAddress': strEmailAddress }
        return this.http.postHttpMethod(this.communication + 'IsEmailExists', JSON.stringify(obj));
    }

    //IsTagByAgency
    getApplicationParameterValueByParameterKey(IsTagByAgency: string, userEvents?: IUserEvents) {
        return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParameterValueByParameterKey', 'strKey', IsTagByAgency, userEvents);

    }

    //Check Suplier ID
    CheckVendorSupplierID(supplierId) {
        var obj = { 'supplierId': supplierId }
        return this.http.postHttpMethod(this.vendorUrl + 'CheckVendorSupplierID', JSON.stringify(obj));

    }


}