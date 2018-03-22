import { Component, OnInit } from '@angular/core';
import { LoginService } from "./services/login.service";
import { ISystemActivities } from "../shared/models/systemactivitiesrequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  userNamePattern: any = "[A-Za-z0-9]*";
   emailAddressPattern: any = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  successMessage: string;
  successBlock: boolean;
  errorMessage: any;
  errorBlock: boolean;
  forgotPasswordResult: any;
  forgotPasswordInput: forgotPasswordInputs;
  forgotPasswordForm: FormGroup;
  systemActivities: ISystemActivities;
  constructor(private loginService: LoginService, private router: Router, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.forgotPasswordForm = new FormGroup({
      'username': new FormControl('', [Validators.pattern(this.userNamePattern)]),
      'email': new FormControl('', [Validators.pattern(this.emailAddressPattern)])
    });

  }
  getPassword() {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.IsViewed = false;
    this.systemActivities.SubSystem = "";
    this.forgotPasswordInput = <forgotPasswordInputs>{};
    this.forgotPasswordInput.userName = this.forgotPasswordForm.controls['username'].value == undefined ? '' : this.forgotPasswordForm.controls['username'].value;
    this.forgotPasswordInput.emailAddress = this.forgotPasswordForm.controls['email'].value == undefined ? '' : this.forgotPasswordForm.controls['email'].value;
    this.forgotPasswordInput.systemActivities = this.systemActivities;
    if (this.forgotPasswordInput.userName == '' && this.forgotPasswordInput.emailAddress == '') {
      this.errorBlock = true;
      this.errorMessage = "Username (or) email address atleast one field is required";
    }
    else {
      this.loginService.forgotPassword(this.forgotPasswordInput).subscribe(res => {
        this.forgotPasswordResult = res;
        console.log(res);
        if (res) {
          this.successBlock = true;
          this.successMessage = "Password has been sent to your email address, if you do not get it please contact administrator.";
          this.errorBlock = false;
          this.errorMessage = '';
        }
      }, (err) => {
        this.errorBlock = true;
        this.errorMessage = err.statusText.toString();
        this.successBlock = false;
        this.successMessage = '';
      });

    }
  }
  login() {
    this.router.navigate(['login']);
  }
}
export class forgotPasswordInputs {
  userName: string;
  emailAddress: string;
  systemActivities: ISystemActivities;
}