
import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { IPromosRequest } from '../models/promosrequest';
import { IPromosResponse } from '../models/promoresponse';
import { IUserEvents } from '../../../shared/models/userevents';


@Injectable()
export class PromoService {

    constructor(private http: HttpService, _http: Http) { }
    private _promosUrl = 'Promos/';
    private myheaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getPromos(userEvents?: IUserEvents): Observable<any[]> {
        return this.http.getHttpWithoutParams(this._promosUrl + 'GetPromoFactor',userEvents) ;
    }

    createPromos(promosRequest: IPromosRequest,userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this._promosUrl + 'CreatePromos', promosRequest,userEvents)
             ;
    }
    searchPromos(promosRequest: IPromosRequest,userEvents?: IUserEvents): Observable<IPromosResponse[]> {
        let obj = JSON.stringify(promosRequest);
        return this.http.getHttpWithParams(this._promosUrl + 'SearchPromos', "objRequestPromos", obj,userEvents)
             ;
    }
    //

    updatePromos(promosRequest: IPromosRequest,userEvents?: IUserEvents) {
        return this.http.postHttpMethod(this._promosUrl + 'UpdatePromos', promosRequest,userEvents)
             ;
    }
}
