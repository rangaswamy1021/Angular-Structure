import { IUserEvents } from './../../../shared/models/userevents';
import { HttpService } from './../../../shared/services/http.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs';
import { IContractRequest } from "../models/contractrequest";
import { IContractResponse } from "../models/contractresponse";
@Injectable()
export class ContractService {
    private contractUrl = 'Contract/';
    constructor(private http: HttpService) { }
    private uploadUrl ='/CustomerAccounts/';
    private vendorUrl='Vendor/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getContractDetails(contractRequest: IContractRequest,userEvents?:IUserEvents) {
        var obj = { 'objContractReq': contractRequest }
        return this.http.postHttpMethod(this.contractUrl + 'SearchContract', JSON.stringify(obj),userEvents) ;
    }

    getVendorNames() {
        return this.http.getHttpWithoutParams(this.vendorUrl + 'GetVendorNames') ;
    }

    uploadFile(formData: FormData): Observable<string> {
        return this.http.postHttpMethodwithoutOptions(this.uploadUrl + 'UploadFile', formData) ;
    }
    addContractDetails(contractRequest: IContractRequest,userEvents?:IUserEvents) {
        var obj = { 'objContractReq': contractRequest }
        return this.http.postHttpMethod(this.contractUrl + 'AddContract', JSON.stringify(obj),userEvents) ;
    }
    deleteContractData(contractRequest: IContractRequest,userEvents?:IUserEvents): Observable<boolean> {
    var data = { 'objContractReq': contractRequest }
    return this.http.postHttpMethod(this.contractUrl + 'DeleteContract', JSON.stringify(data),userEvents) ;
      }
    updateContractData(contractRequest: IContractRequest,userEvents?:IUserEvents): Observable<boolean> {
    var data = { 'objContractReq': contractRequest }
    return this.http.putHttpMethod(this.contractUrl + 'UpdateContract', JSON.stringify(data),userEvents) ;
      }
    checkContractName(contractRequest: String): Observable<boolean> {
     console.log(contractRequest);
     var data = { 'contractNumber': contractRequest }
     return this.http.postHttpMethod(this.contractUrl + 'CheckContract', JSON.stringify(data)) ;
    }
    getActivePos(contractRequest: number): Observable<number> {
        console.log("service:"+contractRequest);
         var data = { 'contractId': contractRequest }
        return this.http.postHttpMethod(this.contractUrl + 'Getactivepos', JSON.stringify(data)) ;
      }
    getWarrantyDetails(contractRequest: number) {
        console.log("service:"+contractRequest);
         var data = { 'contractId': contractRequest }
        return this.http.postHttpMethod(this.contractUrl + 'GetWarrantyDetailsByContractId', JSON.stringify(data)) ;
      }
}