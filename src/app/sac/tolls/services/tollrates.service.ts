import { IVEPTariffsResponse } from './../models/veptariffsresponse';
import { IVEPTariffsRequest } from './../models/veptariffsrequest';
import { Observable } from "rxjs/Observable";
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { ITollRatesRequest } from "../models/tollratesrequest";
import { ITollRatesResponse } from "../models/tollratesresponse";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class TollRatesService {
    constructor(private http: HttpService) { }
    private tollRatesUrl = 'Tolls/';
    private myheaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    bindTollRateDetails(objTollTypes: ITollRatesRequest, userEvents?: IUserEvents): Observable<ITollRatesResponse[]> {
        var obj = { 'objTollRates': objTollTypes }
        //let obj = JSON.stringify(objTollTypes);//objTollRates
        return this.http.postHttpMethod(this.tollRatesUrl + 'BindTollRateDetails', JSON.stringify(obj), userEvents) ;
    }

    createTollRateDetails(objTollTypes: ITollRatesRequest, userEvents?: IUserEvents): Observable<ITollRatesResponse[]> {
        var obj = { 'objTollRates': objTollTypes }
        //let obj = JSON.stringify(objTollTypes);//objTollRates
        return this.http.postHttpMethod(this.tollRatesUrl + 'CreateTollRateDetails', JSON.stringify(obj), userEvents) ;
    }

    updateTollRateDetails(objTollTypes: ITollRatesRequest, userEvents?: IUserEvents): Observable<ITollRatesResponse[]> {
        var obj = { 'objTollRates': objTollTypes }
        //let obj = JSON.stringify(objTollTypes);//objTollRates
        return this.http.postHttpMethod(this.tollRatesUrl + 'UpdateTollRateDetails', JSON.stringify(obj), userEvents) ;
    }

    deleteTollRateDetails(objTollTypes: ITollRatesRequest, userEvents?: IUserEvents): Observable<ITollRatesResponse[]> {
        var obj = { 'objTollRates': objTollTypes }
        //let obj = JSON.stringify(objTollTypes);//objTollRates
        return this.http.postHttpMethod(this.tollRatesUrl + 'DeleteTollRateDetails', JSON.stringify(obj), userEvents) ;
    }

    getVepPasses(objReqVEPTariffs: IVEPTariffsRequest, userEvent: IUserEvents): Observable<IVEPTariffsResponse[]> {
        return this.http.postHttpMethod(this.tollRatesUrl + 'GetVepPasses', objReqVEPTariffs, userEvent);
    }

    deleteVEPTariffs(objReqVEPTariffs: IVEPTariffsRequest, userEvent: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.tollRatesUrl + 'DeleteVEPTariffs', objReqVEPTariffs, userEvent);
    }

    getPassTypes(): Observable<any> {
        return this.http.getHttpWithoutParams(this.tollRatesUrl + 'GetPassTypes');
    }

    vehicleClasses(): Observable<any> {
        return this.http.getHttpWithoutParams(this.tollRatesUrl + 'VehicleClasses');
    }

    IsTariffExists(objReqVEPTariffs: IVEPTariffsRequest): Observable<string> {
        return this.http.postHttpMethod(this.tollRatesUrl + 'IsTariffExists', objReqVEPTariffs);
    }

    CreateVepPasses(objReqVEPTariffs: IVEPTariffsRequest, userEvent: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.tollRatesUrl + 'CreateVepPasses', objReqVEPTariffs, userEvent);
    }
}

