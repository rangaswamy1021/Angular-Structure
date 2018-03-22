import { Router } from '@angular/router';
import { componentName } from './../../route-mappings';
import { Injectable } from "@angular/core";

import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { tokenNotExpired } from 'angular2-jwt';

import { Securityrequest } from "../models/securityrequest";
import { Userrequest } from "../models/userrequest";
import { HttpService } from "../../shared/services/http.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { forgotPasswordInputs } from "../forgot-password.component";
import { IUserRequest } from "../../shared/models/userrequest";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { ISecurityResponse } from "../../shared/models/securityresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IManageUserRequest } from "../../sac/usermanagement/models/manageuser.request";
import { IManageUserResponse } from "../../sac/usermanagement/models/manageuser.response";



@Injectable()
export class LoginService {
  data: any;
  constructor(private http: HttpService, private _http: Http, private router: Router) { }
  private commonUrl = 'common/';
  private userManagementUrl = 'UserManagement/';
  afterSearchArray;
  menuItemsObj;
  ccontext;
  vcontext;
  accessUrlsArray = [];
  accessUrlsObj = {
    urls: []
  }
  firstTimeLoginFlag: boolean;
  isPasswordExp: boolean;
  setCustomerContext(data) {
    this.ccontext = data;
  }
  setViolatorContext(data) {
    this.vcontext = data;
  }
  setAfterSearchArray(menuItemsObj) {
    if (sessionStorage.getItem('menu'))
      this.menuItemsObj = JSON.parse(sessionStorage.getItem('menu'));
    else
      this.menuItemsObj = menuItemsObj;
    this.afterSearchArray = [];
    if (this.menuItemsObj) {
      this.menuItemsObj['aftersearch'].forEach(module => {
        if (module.links) {
          module.links.forEach(mainLink => {
            if (mainLink.links) {
              mainLink.links.forEach(element => {
                this.afterSearchArray.push(element.url);
                 if(element.links){
                   element.links.forEach(item => {
                      this.afterSearchArray.push(item.url)
                   });
                 } 
              });
              if(mainLink.url){
              this.afterSearchArray.push(mainLink.url);
            }
            }
            
            else {
              if (mainLink.url) {
                this.afterSearchArray.push(mainLink.url);
              }
            }
          });
        }
        else {
          if (module.url) {
            this.afterSearchArray.push(module.url);
          }
        }
      });
      this.setAccessUrls();

    }

  }
  setAccessUrls() {
    this.accessUrlsArray = [];
    for (var key in this.menuItemsObj) {
      this.menuItemsObj[key].forEach(module => {
        if (module.links) {
          module.links.forEach(mainLink => {
            if (mainLink.links) {
              if (mainLink.url) {
                this.accessUrlsArray.push(mainLink.url);
              }
              mainLink.links.forEach(element => {
                this.accessUrlsArray.push(element.url);
                if (element.links) {
                  element.links.forEach(item => {
                    this.accessUrlsArray.push(item.url);
                  });
                }
              });
            }
            else {
              if (mainLink.url) {
                this.accessUrlsArray.push(mainLink.url);
              }
            }
          });
        }
        else {
          if (module.url) {
            this.accessUrlsArray.push(module.url);
          }
        }
      });
    }
    this.accessUrlsObj.urls = this.accessUrlsArray
    sessionStorage.setItem('access', JSON.stringify(this.accessUrlsObj));
  }

  getAfterSearchArray() {
    return this.afterSearchArray;
  }
  public getToken(): string {
    return localStorage.getItem('access_token');
  }
  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();
    // return a boolean reflecting 
    // whether or not the token is expired
    return tokenNotExpired(null, token);
  }
  
  getLoginDetailsByCustomerId(customerId: number): Observable<IUserresponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetLoginInfo', "longAccountId", customerId.toString());
  }
  forgotPassword(forgotPassword: forgotPasswordInputs): Observable<any> {
    return this.http.postHttpMethod(this.commonUrl + 'ForgotPassword', forgotPassword);
  }
  getApplicationParameterValueByParameterKey(ParameterKey: string) {
    return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParameterValueByParameterKey', 'strKey', ParameterKey);
  }
  resetPassword(resetPassword: any,userEvents: IUserEvents): Observable<boolean>{
        return this.http.postHttpMethod(this.commonUrl + 'ResetPassword',resetPassword,userEvents);
  }
  getProfileByCustomerId(longAccountId: number,userEvents?: IUserEvents):Observable<any>{
        return this.http.getHttpWithParams(this.commonUrl + 'GetProfile',"longAccountId",longAccountId.toString(),userEvents);
  }
  getLocations(reqUser: IManageUserRequest): Observable<IManageUserResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetLocations',JSON.stringify(reqUser));
    }
  updateProfileService(objRequestUser: IUserRequest,userEvents?: IUserEvents):Observable<boolean>{
     let obj = JSON.stringify(objRequestUser);
        return this.http.postHttpMethod(this.commonUrl + 'UpdateProfile',obj,userEvents);
  }
   getGlobalizationServices(longAccountId: number,userEvents?: IUserEvents): Observable<any>{ 
    return this.http.getHttpWithParams(this.commonUrl + 'GetGlobalization', "longAccountId", longAccountId.toString(),userEvents) ;
  }
    getLookUpByParentLookupTypeCodeServices(lookuptypecode: ICommonResponse,userEvents?: IUserEvents): Observable<ICommonResponse[]> {    
    return this.http.getHttpWithParams(this.commonUrl + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", JSON.stringify(lookuptypecode),userEvents);
  }
updateGlobalization(service: any,userEvents?: IUserEvents): Observable<boolean> {    
    return this.http.postHttpMethod(this.commonUrl + 'UpdateGlobalization', JSON.stringify(service),userEvents);
  }
  getInternalUserDetailsByUserName(strUser: string): Observable<ISecurityResponse> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetInternalUserDetailsByUserName', "strUserName", strUser.toString());
  }
}