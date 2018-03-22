import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { IUserEvents } from "../models/userevents";


@Injectable()
export class HttpService {

  url = environment.apiUrl;
  oAuthurl = environment.oAuthurl;
  constructor(private http: HttpClient) {
  }

  getHttpWithoutParams(relativePath: string, userEvents?: IUserEvents): Observable<any> {
    return this.http.get(this.url + relativePath, {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'featureAction': userEvents ? JSON.stringify(userEvents) : ''
        })
    });
  }

  getHttpWithParams(relativePath: string, paramname: string, paramvalue: string, userEvents?: IUserEvents): Observable<any> {
    return this.http.get(this.url + relativePath, {
      params:
      new HttpParams().set(paramname, paramvalue), headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'featureAction': userEvents ? JSON.stringify(userEvents) : ''
        })
    });
  }

  postHttpMethod(relativePath: string, inputObject, userEvents?: IUserEvents): Observable<any> {
    console.log(this.url);
    return this.http.post(this.url + relativePath, inputObject, {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'featureAction': userEvents ? JSON.stringify(userEvents) : ''
        })
    });
  }
  putHttpMethod(relativePath: string, inputObject, userEvents?: IUserEvents): Observable<any> {
    return this.http.put(this.url + relativePath, inputObject, {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'featureAction': userEvents ? JSON.stringify(userEvents) : ''
        })
      });
    }

  oAuthpostHttpMethod(relativePath: string, inputObject): Observable<any> {
    let input='';
    for(let key in inputObject){
      if(input==''){
        input=key+"="+inputObject[key]
      }
      else
      input+='&'+key+"="+inputObject[key]
    }
  //  inputObject= "grant_type=password&username=" + inputObject.username + "&password=" + inputObject.password;
    return this.http.post(this.oAuthurl + relativePath, input,
      {headers:  new HttpHeaders(
      {
        'Accept': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/x-www-form-urlencoded'}
    )}
  );
}

private encodeParams(params: any): string {  
        let body: string = "";  
        for (let key in params) {  
            if (body.length) {  
                body += "&";  
            }  
            body += key + "=";  
            body += encodeURIComponent(params[key]);  
        }  
        return body;  
    }  

  deleteHttpMethodWithoutParams(relativePath: string): Observable<any> {
    return this.http.delete(this.url + relativePath, {headers:  new HttpHeaders(
      {'Content-Type': 'application/json',
      'Accept': 'application/json'})
  });
  }
  // deleteHttpMethodWithoutParams(relativePath: string): Observable<any> {
  //   return this.http.delete(this.url + relativePath, {
  //     headers: new HttpHeaders(
  //       {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       })
  //   });
  // }

  deleteHttpMethodWithParams(relativePath: string, paramname: string, paramvalue: string, userEvents?: IUserEvents): Observable<any> {
    return this.http.delete(this.url + relativePath, {
      params: new HttpParams().set(paramname, paramvalue), headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'featureAction': userEvents ? JSON.stringify(userEvents) : ''
        })
    });
  }

  postHttpMethodwithoutOptions(relativePath: string, inputObject: FormData): Observable<any> {
    return this.http.post(this.url + relativePath, inputObject);
  }
}
