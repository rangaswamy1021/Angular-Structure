import { IUserEvents } from './../../../shared/models/userevents';
import { IFeeTypesResponse } from './../models/feetypes.response';
import { IFeeTypesRequest } from './../models/feetypes.request';
import { Observable } from "rxjs/Observable";
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";

@Injectable()
export class FeeTypesService {
  constructor(private http: HttpService) { }
  private _feeTypesUrl = 'Fees/';
  private myheaders = new Headers({
    'content-type': 'application/json',
    'Accept': 'application/json'
  })
  feeCodeExists(feecode: string): Observable<boolean> {
    return this.http.getHttpWithParams(this._feeTypesUrl + 'IsFeeCodeExists', "strFeeCode", feecode.toString());
  }
  getFees(objFeeTypes: IFeeTypesRequest, userEvents: IUserEvents): Observable<IFeeTypesResponse[]> {
    let obj = JSON.stringify(objFeeTypes);
    //console.log( this.http.getHttpWithParams(this._feeTypesUrl+'GetFeeTypes',"objFeeTypes",obj) );
    return this.http.getHttpWithParams(this._feeTypesUrl + 'GetFeeTypes', "objFeeTypes", obj, userEvents);
  }

  getFeesById(i: number): Observable<IFeeTypesResponse> {
    //console.log( this.http.getHttpWithParams(this._feeTypesUrl+'GetFeeTypeById',"feeTypeId",i.toString()));
    return this.http.getHttpWithParams(this._feeTypesUrl + 'GetFeeTypeById', "feeTypeId", i.toString());
  }

  addFees(objFeeTypes: IFeeTypesRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objFeeTypes);
    return this.http.postHttpMethod(this._feeTypesUrl + 'CreateFeeTypes', obj, userEvents);
  }
  updateFees(objFeeTypes: IFeeTypesRequest, userEvents?: IUserEvents): Observable<boolean> {
    console.log(objFeeTypes);
    let obj = JSON.stringify(objFeeTypes);
    return this.http.putHttpMethod(this._feeTypesUrl + 'UpdateFeeType', obj, userEvents);
  }
}