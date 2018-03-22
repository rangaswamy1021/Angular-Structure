import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { LoginService } from "./services/login.service";
import { ISystemActivities } from "../shared/models/systemactivitiesrequest";
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { Router } from "@angular/router";
import { Actions, Features, ActivitySource, SubFeatures } from "../shared/constants";
import { IUserEvents } from "../shared/models/userevents";
import { CommonService } from "../shared/services/common.service";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  successChangeBlock: boolean = false;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isChange: boolean = false;
  userEvents: IUserEvents;
  recentPasswordCount: any;
  isPasswordExp: boolean;
  isFirstTimeLogin: boolean = false;
  changeResponse: boolean;
  changePasswordInputs: changePasswordInputs;
  systemActivities: ISystemActivities;
  objICustomerContextResponse: ICustomerContextResponse;
  ParameterKey: string;
  isInvalidPassword: boolean;
  strongPass: boolean;
  goodPass: boolean;
  badPass: boolean;
  shortPass: boolean;
  passTooltip: any = "(~!@#$%^&()_+-={}|:;<>?/)";
  emailAddressPattern: any = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  lastNamePattern: any = "[A-Za-z]*";
  profileUpdateForm: FormGroup;
  firstNamePattern: any = "[A-Za-z]*";
  passwordPattern = "^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{7,}|(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}|(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}|(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z]).{7,}|(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{7,}$";
  showAlldata: boolean;
  updatesettings: boolean;
  updatepassword: boolean;
  showProfile: boolean;
  title: string;
  sessionContextResponse: IUserresponse;
  @Output() canclClick: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private materialscriptService: MaterialscriptService, private customerContextService: CustomerContextService, private router: Router,
    private loginService: LoginService, private sessionContext: SessionService, private commonService: CommonService) { }
  ngOnInit() {
    this.materialscriptService.material();
    if (!this.commonService.isAllowed(Features[Features.PROFILE], Actions[Actions.VIEW], "")) {
      //error page
    }
    this.isChange = !this.commonService.isAllowed(Features[Features.PROFILE], Actions[Actions.UPDATE], "");
    this.isFirstTimeLogin = false;
    if (this.loginService.firstTimeLoginFlag || this.loginService.isPasswordExp) {
      this.isFirstTimeLogin = true;
      this.isChange = false;
    }
    this.customerContextService.currentContext
      .subscribe(customerContext => {
        this.objICustomerContextResponse = customerContext;
      }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.profileUpdateForm = new FormGroup({
      'currentPassword': new FormControl("", [Validators.required, Validators.maxLength(20), Validators.minLength(7)]),
      'newPassWord': new FormControl("", [Validators.required, Validators.maxLength(20), Validators.minLength(7), Validators.pattern(this.passwordPattern)]),
      'retypePassWord': new FormControl("", [Validators.required, Validators.maxLength(20), Validators.minLength(7)]),
    })
    this.getApplicationParameterValueByParameterKey();

  }
  getApplicationParameterValueByParameterKey() {
    this.ParameterKey = "RecentPWDCnt";
    this.loginService.getApplicationParameterValueByParameterKey(this.ParameterKey).subscribe(res => {
      console.log(res);
      this.recentPasswordCount = res;
    })
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  changePassword() {
    this.materialscriptService.material();
    if (this.profileUpdateForm.valid) {
      if (this.profileUpdateForm.controls['newPassWord'].valid && this.profileUpdateForm.controls['retypePassWord'].valid) {
        if (this.profileUpdateForm.controls['newPassWord'].value == this.profileUpdateForm.controls['retypePassWord'].value) {
          this.systemActivities = <ISystemActivities>{};
          this.systemActivities.User = this.sessionContextResponse.userName;
          this.systemActivities.UserId = this.sessionContextResponse.userId;
          this.systemActivities.LoginId = this.sessionContextResponse.loginId;
          this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.systemActivities.ActionCode = Actions[Actions.UPDATE];
          this.systemActivities.FeaturesCode = "CHANGEPASSWORD";
          this.changePasswordInputs = <changePasswordInputs>{};
          this.changePasswordInputs.userName = this.sessionContextResponse.userName;
          this.changePasswordInputs.oldPassword = this.profileUpdateForm.controls['currentPassword'].value;
          this.changePasswordInputs.newPassword = this.profileUpdateForm.controls['newPassWord'].value;
          this.changePasswordInputs.systemActivities = this.systemActivities;
          if (this.isFirstTimeLogin) {
            this.userEvents = null;
          }
          else {
            this.userEvents = <IUserEvents>{};
            this.userEvents.FeatureName = Features[Features.PROFILE];
            this.userEvents.SubFeatureName = SubFeatures[SubFeatures.CHANGEPASSWORD];
            this.userEvents.ActionName = Actions[Actions.UPDATE];
            this.userEvents.PageName = this.router.url;
            this.userEvents.CustomerId = 0;
            this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            this.userEvents.UserName = this.sessionContextResponse.userName;
            this.userEvents.LoginId = this.sessionContextResponse.loginId;
          }
          this.loginService.resetPassword(this.changePasswordInputs, this.userEvents).subscribe(res => {
            this.changeResponse = res;
            if (res) {
              if (this.isFirstTimeLogin) {
                this.successChangeBlock = true;
                this.profileUpdateForm.reset();
                this.loginService.firstTimeLoginFlag = false;
              }
              else {
                this.msgFlag = true;
                this.msgType = 'success';
                this.msgTitle = '';
                this.msgDesc = 'Password has been changed successfully';
                this.successChangeBlock = false;
                this.profileUpdateForm.reset();
              }
            } else {
              this.msgFlag = true;
              this.msgType = 'error';
              this.msgTitle = '';
              this.msgDesc = 'Error while updating password';
              this.successChangeBlock = false;
            }
            this.shortPass = false;
            this.badPass = false;
            this.goodPass = false;
            this.strongPass = false;
            this.isInvalidPassword = false;
          }, (err) => {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = err.statusText.toString();
            this.successChangeBlock = false;
          })
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = "New Password and Retype Password should be same";
        }
      }
    }
    else {
      this.validateAllFormFields(this.profileUpdateForm);
    }
  }
  resetPassword() {
    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;
    this.isInvalidPassword = false;
    this.profileUpdateForm.reset();
    this.profileUpdateForm.controls['currentPassword'].setValue("");
    this.profileUpdateForm.controls['newPassWord'].setValue("");
    this.profileUpdateForm.controls['retypePassWord'].setValue("");

  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  cancelBtn() {
    this.updatepassword = false;
    this.canclClick.emit(true);
  }
  reLoggin() {
    this.sessionContext.changeResponse(null);
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
  checkRetypePassword() {
    if (this.profileUpdateForm.controls['newPassWord'].value == "" || this.profileUpdateForm.controls['newPassWord'].value == null) {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }
    this.profileUpdateForm.controls['newPassWord'].setValidators([Validators.required, Validators.maxLength(20), Validators.minLength(7), Validators.pattern(this.passwordPattern)]);
    this.profileUpdateForm.controls['retypePassWord'].setValidators([Validators.required, Validators.maxLength(20), Validators.minLength(7)]);
    // if (this.profileUpdateForm.controls['newPassWord'].valid && this.profileUpdateForm.controls['retypePassWord'].valid) {
    //   if (this.profileUpdateForm.controls['newPassWord'].value == this.profileUpdateForm.controls['retypePassWord'].value) {
    //     this.isInvalidPassword = false;

    //   }
    //   else {
    //     this.isInvalidPassword = true;
    //   }
    // }
    this.passwordStrength();
  }
  passwordStrength() {
    let score = 0;
    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;
    if (this.profileUpdateForm.controls.newPassWord.value.length > 0 || this.profileUpdateForm.controls.newPassWord.value.length != null || this.profileUpdateForm.controls.newPassWord.value.length != "") {
      var password = this.profileUpdateForm.controls.newPassWord.value;
      if (password.length < 7 && password.length != 0) { return this.shortPass = true }
      // if (password.toLowerCase() == newPassWord.toLowerCase()) { return this.badPass = true }
      score += password.length * 4
      score += (this.checkRepetition(1, password).length - password.length) * 1
      score += (this.checkRepetition(2, password).length - password.length) * 1
      score += (this.checkRepetition(3, password).length - password.length) * 1
      score += (this.checkRepetition(4, password).length - password.length) * 1
      //password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score += 5
      }

      //password has 2 sybols
      if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
        score += 5
      }

      //password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score += 10
      }

      //password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score += 10
      }
      //
      //password has number and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) {
        score += 10
      }

      //password has char and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) {
        score += 10
      }

      //password is just a nubers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        score -= 10
      }

      //verifing 0 < score < 100
      if (score < 0) {
        score = 0
      }
      if (score > 100) {
        score = 100

        return this.strongPass = true;
      }

      if (score < 34 && password.length != 0) {
        return this.badPass = true
      }
      if (score < 80 && password.length != 0) {
        return this.goodPass = true
      }
      if (score >= 80 && score <= 100) {

        return this.goodPass = true
      }

      if (password == "" || password == null) {
        this.shortPass = false;
        this.badPass = false;
        this.goodPass = false;
        this.strongPass = false;
      }
    }
    else {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }
  }
  checkRepetition(pLen, str) {
    let res = "";
    for (var i = 0; i < str.length; i++) {
      let repeated = true;
      for (var j = 0; j < pLen && (j + i + pLen) < str.length; j++)
        repeated = repeated && (str.charAt(j + i) == str.charAt(j + i + pLen))
      if (j < pLen) repeated = false
      if (repeated) {
        i += pLen - 1
        repeated = false
      }
      else {
        res += str.charAt(i)
      }
    }
    return res;
  }
}
export class changePasswordInputs {
  userName: string;
  oldPassword: string;
  newPassword: string;
  systemActivities: ISystemActivities;
}