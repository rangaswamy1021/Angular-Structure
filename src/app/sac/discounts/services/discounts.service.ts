import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import 'rxjs/add/operator/map';
import { IDiscountRequest } from "../models/discountsrequest";
import { IDiscountResponse } from "../models/discountsresponse";
import { IDesignationsResponse } from "../models/designationsresponse";
import { IUserEvents } from "../../../shared/models/userevents";
import { IDiscountTypeResponse } from "../models/discounttyperesponse";
import { IDiscountFactorResponse } from "../models/discountfactorresponse";
import { ICriteriasResponse } from "../models/criteriaresponse";

@Injectable()
export class DiscountsService {
    private discountsUrl = 'Discounts/';

    constructor(private http: HttpService) { }

    getDiscounts(objReqDiscount: IDiscountRequest, userEvents?: IUserEvents): Observable<IDiscountResponse[]> {
        return this.http.postHttpMethod(this.discountsUrl + 'GetDiscounts', JSON.stringify(objReqDiscount), userEvents);
    }

    getDesignations(): Observable<IDesignationsResponse[]> {
        return this.http.getHttpWithoutParams(this.discountsUrl + 'GetDesignations');
    }

    // getDiscountTypes(): Observable<any> {
    //     return this.http.getHttpWithoutParams(this.discountsUrl + 'GetDiscountTypes');
    // }

    getFeesFactors(): Observable<any> {
        return this.http.getHttpWithoutParams(this.discountsUrl + 'GetFeesFactors');
    }

    getDiscountByDiscountId(strDiscountId: string): Observable<IDiscountResponse> {
        return this.http.getHttpWithParams(this.discountsUrl + 'GetDiscountByDiscountId', 'strDiscountId', strDiscountId);
    }

    createDiscount(objReqDiscount: IDiscountRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.discountsUrl + 'CreateDiscount', JSON.stringify(objReqDiscount), userEvents);
    }

    updateDiscount(objReqDiscount: IDiscountRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.discountsUrl + 'UpdateDiscount', JSON.stringify(objReqDiscount), userEvents);
    }

    // get Discount Types
    getDiscountTypes(): Observable<IDiscountTypeResponse[]> {
        return this.http.getHttpWithoutParams(this.discountsUrl + 'GetDiscountTypes');
    }

    // get Discount Factor
    getDiscountFactor(): Observable<IDiscountFactorResponse[]> {
        return this.http.getHttpWithoutParams(this.discountsUrl + 'GetDiscountFactor');
    }

    // get Criteria
    getCriteria(): Observable<ICriteriasResponse[]> {
        return this.http.getHttpWithoutParams(this.discountsUrl + 'GetCriteria');
    }
}