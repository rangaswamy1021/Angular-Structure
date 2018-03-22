import { ILocation } from './../shared/models/locationresponse';

import { Component, OnInit } from '@angular/core';
import { CommonService } from '../shared/services/common.service';
import { TokenInterceptor } from '../shared/services/interceptor';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { User, oAuthGrant } from '../shared/models/user';
import { Injectable } from '@angular/core';
import { Security } from '../shared/models/Security';
import { Observable } from 'rxjs/Rx';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './services/login.service';
import { SessionService } from '../shared/services/session.service';
import { IUserresponse } from '../shared/models/userresponse';
import { ICustomerSecurityResponse } from '../shared/models/customersecurityresponse';
import { ISecurityResponse } from "../shared/models/securityresponse";
import { MaterialscriptService } from "../shared/materialscript.service";
import { JwtHelper } from 'angular2-jwt';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
 // password: string;
 // username: string;
 // rememberMe: any;
  profileResponse: any;
  isPasswordExp: any;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  RoleId: any;
  lastLoginDate: Date;
  resultLogin: any;
  diffDays: number;
  isFirstTimeLogin: boolean;
  passwordWillExpirein: number;
  showNotification: boolean;
  notoficationDays: number;;
  remainingDays: number;
  currentPasswordExpiryDate: Date;
  userResponse: ISecurityResponse;
  afterSearchMenuItemsArray: any = [];
  beforeSearchMenuItemsArray: any = [];
  message: any;
  //secu: Security = <Security>{};
  user: User = <User>{};
  oAuthGrant: oAuthGrant = <oAuthGrant>{};
  Login_form: FormGroup;
  sessionContextResponse: IUserresponse;
  isLogin: boolean = false;
  successBlock: boolean = false;
  successHeading: string;
  successMessage: string;
  errorBlock: boolean = false;
  errorHeading: string;
  menuItemsObj;
  errorMessage: string;
  customerSecurityResponse: ICustomerSecurityResponse[];
  jwtHelper: JwtHelper = new JwtHelper();
  userId: number;
  constructor(public httpget: HttpClient, private sessionContext: SessionService, private loginService: LoginService,
    private commonService: CommonService, private http: Http, private token: TokenInterceptor, private login: CommonService,
    private router: Router, private materialscriptService: MaterialscriptService, private route: ActivatedRoute) { }


  ngOnInit() {
    this.materialscriptService.material();

    this.Login_form = new FormGroup({
      "password": new FormControl('', []),
      "username": new FormControl('', [])
     // "rememberMe": new FormControl('', [])
    })
    console.log("login component ")
    this.isLogin = false;
    this.route.queryParams
      .subscribe(params => {
        if (params.tokenExpired == 'true') {
          this.msgFlag = true;
          this.msgTitle = 'Token Expired';
          this.msgDesc = "Login Again";
          this.msgType = 'error';
        }
      });
    // if (localStorage.getItem('rememberMe') == "true") {
    //   this.username = localStorage.getItem('username');
    //   this.password = localStorage.getItem('password');
    //   this.rememberMe = localStorage.getItem('rememberMe');
    //   let a = this;
    //   setTimeout(function () {
    //     a.materialscriptService.material();
    //   }, 100);
    // } else {
    //   localStorage.removeItem("username");
    //   localStorage.removeItem("password");
    //   localStorage.removeItem("rememberMe");
    // }
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  public getToken(): string {
    return localStorage.getItem('access_token');
  }
  // rememberEvent(event) {
  //   alert(event.target.value);
  // }
  onSubmit(): void {
    // this.loginService.rememberMe = false;
    var response: IResponse;
    this.user.username = this.Login_form.controls["username"].value;
    this.user.password = encodeURIComponent(this.Login_form.controls["password"].value);

    if (this.user.username != "" && this.user.password != "") {

      this.login.Authenticate(this.user.username, this.user.password).subscribe(reslogin => {
        if (reslogin) {
          // if (this.rememberMe) {
          //   localStorage.setItem('username', this.Login_form.controls['username'].value);
          //   localStorage.setItem('password', this.Login_form.controls['password'].value);
          //   localStorage.setItem('rememberMe', "true");
          // }
          // else {
          //   localStorage.removeItem("username");
          //   localStorage.removeItem("password");
          //   localStorage.removeItem("rememberMe");
          // }
          const variable = reslogin;
          localStorage.setItem('access_token', variable.access_token);
          localStorage.setItem('refresh_token', variable.refresh_token);
          var decodedValue = this.jwtHelper.decodeToken(variable.access_token);
          //extract from the claims

          var userData = JSON.parse(decodedValue["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]);
          variable.userId = userData.UserId;
          variable.roleName = decodedValue["role"];
          this.userId = userData.UserId;
          this.login.getIcnId(variable.userId).subscribe(resIcnId => {
            this.login.getLoginId(this.user.username).subscribe(resloginid => {

              const loginId = JSON.parse(resloginid);

              const IcnId = JSON.parse(resIcnId);
              this.login.getRoleId(variable.userId).subscribe(resRoleid => {

                this.RoleId = JSON.parse(resRoleid);
                this.login.getPrivileges(this.RoleId).subscribe(resPrivileges => {

                  const token = localStorage.getItem('access_token');
                  this.sessionContextResponse = <IUserresponse>{};
                  this.sessionContextResponse.userId = variable.userId;
                  this.sessionContextResponse.loginId = loginId;
                  this.sessionContextResponse.rolename = variable.roleName;
                  this.sessionContextResponse.roleID = this.RoleId;
                  this.sessionContextResponse.userName = this.user.username;
                  this.sessionContextResponse.icnId = IcnId;
                  this.sessionContextResponse.privileges = resPrivileges;
                  this.loginService.getProfileByCustomerId(variable.userId).subscribe(res => {
                    this.profileResponse = res;
                    console.log(this.profileResponse);
                    this.sessionContextResponse.FirstName = this.profileResponse.FirstName;
                    this.sessionContextResponse.LastName = this.profileResponse.LastName;

                    this.sessionContext.changeResponse(this.sessionContextResponse);
                  })

                  localStorage.setItem('UserDeatils', this.user.username + "," + variable.userId + "," + variable.RoleID);
                  console.log(this.sessionContextResponse);
                  this.loginService.getInternalUserDetailsByUserName(this.user.username).subscribe(res => {
                    this.userResponse = res;
                    console.log(res);
                    if (res) {
                      this.currentPasswordExpiryDate = this.userResponse.CurrentPasswordExpiryDate;
                      this.diffDays = Math.abs(new Date(this.currentPasswordExpiryDate).getTime() - new Date(Date.now()).getTime());
                      this.remainingDays = Math.ceil(this.diffDays / (1000 * 3600 * 24));
                      console.log("remaining days");
                      console.log(this.remainingDays);
                      let locationObj: ILocation = <ILocation>{};
                      locationObj['locationId'] = this.userResponse['LocationId'];
                      locationObj['locationName'] = this.userResponse['LocationName'];
                      sessionStorage.setItem('locationDetails', JSON.stringify(locationObj));
                      this.loginService.getApplicationParameterValueByParameterKey("PWExpNtfDays").subscribe(res => {
                        if (res) {
                          this.notoficationDays = res;
                          this.showNotification = this.remainingDays <= this.notoficationDays ? true : false;
                          this.passwordWillExpirein = this.remainingDays;
                          let newDate: Date = new Date(Date.now());
                          newDate.setDate(newDate.getDate() + 1);
                          this.isFirstTimeLogin = (new Date(this.userResponse.LastLoginDateTime) > newDate) ? true : false;
                          // alert("is first time login" + this.isFirstTimeLogin);
                          if ((this.passwordWillExpirein <= 0 || this.isFirstTimeLogin) && this.router.url.indexOf('change-password') < 0)//page not contains changepassword && this.router.url.indexOf('change-password') < 0
                          {
                            this.loginService.firstTimeLoginFlag = this.isFirstTimeLogin;
                            this.router.navigate(['change-password']);
                          }
                          else {
                            if (this.showNotification) {
                              this.msgFlag = true;
                              this.msgType = "alert";
                              this.msgTitle = "Password expiration";
                              this.msgDesc = "Your password will going to expire in" + this.passwordWillExpirein + " days." + "Press 'Ok' to change password";
                            }
                            else {
                              this.getMenuByRoleId(this.RoleId, this.userId);
                            }
                          }
                        }
                      })
                    }
                  })
                });
              });
            });
          });

        }
        else {
          this.message = "Invalid Credentials";
        }
      }, (err) => {
        this.successBlock = false;
        this.errorBlock = true;
        this.errorHeading = "Invalid User";
        this.errorMessage = err.statusText;
        this.message = 'Invalid User';
      })
    }
    else {
      this.message = 'Enter Your Credentials';
    }
  }
  userAction(event) {
    if (event) {
      this.loginService.isPasswordExp = true;
      this.router.navigate(['change-password']);
    }
    else {
      this.getMenuByRoleId(this.RoleId, this.userId);
    }
  }

  getMenuByRoleId(roleId, userId: number) {
    this.commonService.menuGenerationByRoleId(roleId, userId).subscribe(res => {
      this.menuItemsObj = res;
      this.loginService.setAfterSearchArray(res);
      console.log(res);
      sessionStorage.setItem('menu', JSON.stringify(this.menuItemsObj));
      let url = this.menuItemsObj.defaulturl[0].defaulturl;

      console.log(url);
      this.router.navigate([url]);
    });

  }
  forgotPassword() {
    this.router.navigate(['forgot-password']);
  }
}

export interface IResponse {
  ResponseString: string,
  userid: string
}
