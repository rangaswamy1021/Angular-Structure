import { IUserEvents } from './../../../shared/models/userevents';
import { Observable } from 'rxjs';
import { IVepVehicleContextResponse } from './../models/vepvehiclescontext';
import { IVEPPassResponse } from './../models/veppasses.resonse';
import { IVEPPassesRequest } from './../models/veppasses.request';
import { IPlazas } from './../models/plazas';
import { HttpService } from './../../../shared/services/http.service';
import { ILocations } from './../models/locations';
import { Injectable } from '@angular/core';

@Injectable()
export class VepPassesService {

    constructor(private http: HttpService) { }
    private vepPasses = 'CustomerAccounts/';
    getLocationDetails(userEvent?: IUserEvents): Observable<ILocations[]> {
        return this.http.getHttpWithoutParams(this.vepPasses + 'GetLocations', userEvent);
    }
    getPlazaDetails(locationCode: string): Observable<IPlazas[]> {
        return this.http.getHttpWithParams(this.vepPasses + 'GetPlazas', "locationCode", locationCode);
    }
    getVehicleClass(vepReq: IVEPPassesRequest): Observable<IVEPPassResponse[]> {
        var obj = JSON.stringify(vepReq);
        return this.http.postHttpMethod(this.vepPasses + 'GetVehicleClass', obj);
    }
    getServiceTax(): Observable<string> {
        return this.http.getHttpWithoutParams(this.vepPasses + 'ServiceTax');
    }

    doVEPPayment(vepReq: IVepVehicleContextResponse): Observable<any> {
        var obj = JSON.stringify(vepReq);
        return this.http.postHttpMethod(this.vepPasses + 'DoVEPVehiclePayment', obj);
    }

    generateVEPPaymentReciept(vepReq: IVepVehicleContextResponse, paymentTxnId: number, customerId: number): Observable<string> {
        var obj = { 'objVepPassReq': vepReq, 'PaymentTxnId': paymentTxnId, 'CustomerId': customerId }
        return this.http.postHttpMethod(this.vepPasses + 'GenerateVEPPaymentReciept', JSON.stringify(obj));
    }

    getAmount(vepReq: IVEPPassesRequest): Observable<IVEPPassResponse[]> {
        var obj = JSON.stringify(vepReq);
        return this.http.postHttpMethod(this.vepPasses + 'GetVehicleClass', obj);
    }

    isPassExist(vepReq: IVEPPassesRequest):Observable<boolean>{
        var obj = JSON.stringify(vepReq);
        return this.http.postHttpMethod(this.vepPasses + 'IsVepPassExist', obj);
    }

    isCustomerVehicleExist(strVehicleNumber:string):Observable<boolean>{ 
        var obj = JSON.stringify({'vehNum':strVehicleNumber});       
        return this.http.postHttpMethod(this.vepPasses + 'IsCustomerVehicleExist', obj);
    }
}