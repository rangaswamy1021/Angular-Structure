import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";

import { ITagConfigurationRequest } from "../models/tags-configurationsrequest";
import { ITagConfigurationResponse } from "../models/tags-configurationsresponse";



@Injectable()
export class TagsConfigurationService {

  constructor(private http: HttpService, private _http: Http) { }
  private _planUrl = 'Tags/';
  private myheaders = new Headers({
    'content-type': 'application/json',
    'Accept': 'application/json'
  });

  SearchTagConfigs(objTagConfig: ITagConfigurationRequest): Observable<ITagConfigurationResponse[]>{
    let obj = JSON.stringify(objTagConfig);
    return this.http.getHttpWithParams(this._planUrl + 'SearchTagConfigs', "objTagConfig", obj) ;
  }
  UpdateTagConfigurations(vehicle: ITagConfigurationRequest): Observable<boolean> {
    let obj = JSON.stringify(vehicle);
    return this.http.putHttpMethod(this._planUrl + 'UpdateTagConfigurations', obj) ;
  }
}
