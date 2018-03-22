import { tokenNotExpired } from 'angular2-jwt';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../shared/services/common.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';

@Injectable()
export class AuthGuard implements CanActivate {
  a;
  constructor(private router:Router, private commonService:CommonService ){
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
   
    if(sessionStorage.getItem('access')){
    let permissionsString = JSON.parse(sessionStorage.getItem('access'));
    let permissions = permissionsString.urls;
    //if token expired get a new token
    if(!tokenNotExpired('access_token')){
  
    return this.commonService.Refresh(localStorage.getItem('refresh_token')).map(reslogin => {
        if (reslogin) {
          localStorage.setItem('access_token', reslogin.access_token);
          localStorage.setItem('refresh_token', reslogin.refresh_token);
         return this.grantAccess(state,permissions)
      }}).catch(err=>
       Observable.throw(this.handleError(err)))
      
  }

    else{
       return this.grantAccess(state,permissions)
    }

    
  }
}

handleError(err){
 this.router.navigate(['/login'],{ queryParams: { tokenExpired: true } });
 return false;
}
grantAccess(state,permissions){
   let authorizeFlag=false; 
      state.url = state.url.substr(1).split('?')[0];
    for (var i = 0; i < permissions.length; i++) {
      if (state.url.indexOf(permissions[i])>=0) {
        authorizeFlag=true;
        return true;
      }
    }
    if(!authorizeFlag){
      this.router.navigate(['/unauthorized']);
    } 
}
}