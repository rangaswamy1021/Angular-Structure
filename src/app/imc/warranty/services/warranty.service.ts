import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { IWarrantRequest } from "../models/warrantyrequest";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class WarrantyService {
    constructor(private http: HttpService) { }
    private warrantyUrl = 'Warranty/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getWarrantyDetails(warrantyRequest: IWarrantRequest,userEvents?: IUserEvents) {
        var obj = { 'warrantyReq': warrantyRequest}
        return this.http.postHttpMethod(this.warrantyUrl + 'GetWarranty', JSON.stringify(obj),userEvents) ;
    }

    warrantyTypeDropdownsData() {
        return this.http.getHttpWithoutParams(this.warrantyUrl + 'GetLookups') ;
    }
    contractDropdown(warrantyRequest: IWarrantRequest) {
        var obj = { 'objContractReq': warrantyRequest }
        return this.http.postHttpMethod(this.warrantyUrl + 'SearchContract', JSON.stringify(obj)) ;
    }

    checkWarrantyExists(warrantyName: string){
        var objCheck= { 'warrantyName': warrantyName}
        return this.http.postHttpMethod(this.warrantyUrl + 'CheckWarranty', JSON.stringify(objCheck)) ;
    }


    addWarrantyDetails(addWarrantyRequest: IWarrantRequest,userEvents?: IUserEvents) {
        var obj = { 'objWarrantyReq': addWarrantyRequest}
        return this.http.postHttpMethod(this.warrantyUrl + 'AddWarranty', JSON.stringify(obj),userEvents) ;
    }

    editWarrantyDetailsPopulate(contractId:number){
        var obj = { 'contractId': contractId }
        return this.http.postHttpMethod(this.warrantyUrl + 'GetWarrantyDetailsByContractId', JSON.stringify(obj)) ;
    }

    updateWarrantyDetails(warrantyRequest:IWarrantRequest,userEvents?: IUserEvents){
        var updateObj={'objWarrantyReq':warrantyRequest}
        return this.http.putHttpMethod(this.warrantyUrl+'UpdateWarranty',JSON.stringify(updateObj),userEvents) ;
    }
    deleteWarrantyDetails(warrantyrequest: IWarrantRequest,userEvents?: IUserEvents) {
        var obj = { 'objWarrantyReq': warrantyrequest }  
        return this.http.postHttpMethod(this.warrantyUrl + 'DeleteWarranty', JSON.stringify(obj),userEvents) ;
    }
}