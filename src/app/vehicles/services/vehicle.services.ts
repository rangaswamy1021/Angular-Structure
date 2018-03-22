import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map'
import { Http, RequestOptions, Headers, URLSearchParams } from "@angular/http";
import { IVehicleResponse, ICommon, ICommonResponse } from "../models/vehicleresponse";
import { IVehicleRequest, ISearchVehicle } from "../models/vehiclecrequest";
import { HttpService } from '../../shared/services/http.service';
import { IUserEvents } from '../../shared/models/userevents';


@Injectable()
export class VehicleService {
  constructor(private http: HttpService) { }
  //private _vehicleUrl = 'http://localhost:49563/api/Vehicle/';
  private _vehicleUrl = 'vehicle/';
  private _commonUrl = 'common/';

  private myheaders = new Headers({
    'content-type': 'application/json',
    'Accept': 'application/json'
  });

  getVehiclebyPK(vehicleId: string): Observable<IVehicleResponse> {
    return this.http.getHttpWithParams(this._vehicleUrl + 'GetVehiclebyPK', "longVehicleId", vehicleId);
  }

  getVehicleColor(countryCode: ICommon): Observable<ICommonResponse[]> {
    let obj = JSON.stringify(countryCode);
    let myParams = new URLSearchParams();
    myParams.set('VehicleColors', obj);
    let options = new RequestOptions({ search: myParams });
    return this.http.getHttpWithParams(this._commonUrl + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj);
  }


  getVehicles(searchVeh: ISearchVehicle, userEvents?: IUserEvents): Observable<IVehicleResponse[]> {
    let obj = JSON.stringify(searchVeh);
    return this.http.getHttpWithParams(this._vehicleUrl + 'SearchVehicles', "objSearchVehicle", obj, userEvents);
  }

  getVehicleHistory(searchVeh: ISearchVehicle, userevents?: IUserEvents): Observable<IVehicleResponse[]> {
    let obj = JSON.stringify(searchVeh);
    return this.http.getHttpWithParams(this._vehicleUrl + 'GetHistoryByVehicleId', "objSearchVehicle", obj, userevents);
  }
  createVehicle(vehicle: IVehicleRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(vehicle);
    return this.http.postHttpMethod(this._vehicleUrl + 'CreateVehicle', obj, userEvents);
  }

  updateVehicle(vehicle: IVehicleRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(vehicle);
    return this.http.putHttpMethod(this._vehicleUrl + 'UpdateVehicle', obj, userEvents);
  }

  deactivateVehicle(vehicle: ISearchVehicle, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(vehicle);
    return this.http.deleteHttpMethodWithParams(this._vehicleUrl + 'DeactivateVehicle', "objVehicle", obj, userEvents);
  }

  getVehicleClass(): Observable<any> {
    return this.http.getHttpWithoutParams(this._vehicleUrl + 'GetAllVehicleClasses');
  }

  getVehicleAttributes(): Observable<any> {
    return this.http.getHttpWithoutParams(this._vehicleUrl + 'GetAllVehicleAttributes');
  }

  getYears(): Observable<any> {
    return this.http.getHttpWithoutParams(this._commonUrl + 'GetYears');
  }

  getContractualType(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this._vehicleUrl + 'BindVehicleContractualType');
  }

  removeVehicle(vehicle: ISearchVehicle): Observable<boolean> {
    let obj = JSON.stringify(vehicle);
    return this.http.deleteHttpMethodWithParams(this._vehicleUrl + 'RemoveVehicle', "objVehicle", obj);
  }

  uploadVehicles(formData: FormData): Observable<boolean> {
    return this.http.postHttpMethodwithoutOptions(this._vehicleUrl + 'UploadFile', formData);
  }

  getVehicleTemplate(): Observable<any> {
    return this.http.getHttpWithoutParams(this._vehicleUrl + 'GetVehicleTemplate');
  }

  getVehicleAssociatedTagCount(vehicleId: string): Observable<number> {
    return this.http.getHttpWithParams(this._vehicleUrl + 'GetVehicleAssociatedTagCount', "longVehicleId", vehicleId);
  }
}
