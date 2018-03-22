import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,HttpErrorResponse,
  HttpInterceptor
} from '@angular/common/http';
import { CommonService } from './common.service';
import { tokenNotExpired } from 'angular2-jwt';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/retry';
import { Router} from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;

  commonService: CommonService;
    route: Router;
    constructor(private router: Router, injector: Injector) {
      this.route = router;
      setTimeout(() => this.commonService = injector.get(CommonService));
    }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage != null)
     var token = localStorage.getItem('access_token');
    if (token && !tokenNotExpired('access_token')) {
     return this.forwardRequest(request, next, token);
    }
    else {
      return this.forwardRequest(request, next, token);
    }

  }

  forwardRequest(request, next, token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(request).catch((err: HttpErrorResponse) => {
      if (err.status == 401 || err.status == 403) {
        if (!tokenNotExpired('access_token')) {
          // if token is expired
          this.commonService.Refresh(localStorage.getItem('refresh_token')).subscribe(reslogin => {
            if (reslogin) {
              localStorage.setItem('access_token', null);
              localStorage.setItem('access_token', reslogin.access_token);
              localStorage.setItem('refresh_token', reslogin.refresh_token);
              console.log('got new tokens');
              this.msgDesc = "Aplologies, your request was not completed. Please try again.";
              this.msgType = "error";
              this.msgFlag = true;
            }
          }, (err) => {
            this.router.navigate(['/login'], { queryParams: { tokenExpired: true } });
          })
        }
        else {
          // if not authenticated redirect to unauthorized component
          this.route.navigate(['unauthorized']);
        }
      }
      return Observable.throw(err);
    });

  }

}