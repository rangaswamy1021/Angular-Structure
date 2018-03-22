import { Router } from '@angular/router';
import { IUserEvents } from '../../shared/models/userevents';
import { ICSRRelationsRequest } from '../../shared/models/csrrelationsrequest';
import { CommonService } from '../../shared/services/common.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { Actions, ActivitySource, Features, SubSystem } from '../../shared/constants';
import { ISecurityRequest } from '../customerdetails/models/securityrequest';
import { ICustomerSecurityResponse } from '../../shared/models/customersecurityresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-reset-password-attempts',
  templateUrl: './reset-password-attempts.component.html',
  styleUrls: ['./reset-password-attempts.component.css']
})
export class ResetPasswordAttemptsComponent implements OnInit {

  resetPasswordmForm: FormGroup;
  isShowGrid: boolean;
  customerDetails: ICustomerSecurityResponse[];
  securityRequestObj: ISecurityRequest;
  sessionContextResponse: IUserresponse;
  csrRelationRequest: ICSRRelationsRequest;
  isDisableSearchBtn: Boolean = false;
  isDisableResetlnk: Boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private customerAccountService: CustomerAccountsService, private sessionContext: SessionService,
    private commonService: CommonService, private router: Router, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);

    this.resetPasswordmForm = new FormGroup({
      'accountId': new FormControl('', [Validators.required, Validators.minLength(1)])
    });

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.RESETPASSWORDATTEMPTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents)
      .subscribe(res => {

      });
    !this.commonService.isAllowed(Features[Features.RESETPASSWORDATTEMPTS], Actions[Actions.VIEW], "");
    this.isDisableSearchBtn = !this.commonService.isAllowed(Features[Features.RESETPASSWORDATTEMPTS], Actions[Actions.SEARCH], "");
    this.isDisableResetlnk = !this.commonService.isAllowed(Features[Features.RESETPASSWORDATTEMPTS], Actions[Actions.RESET], "");

  }

  getPasswordAttemptsbasedonCustID(customerId: number) {
    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.RESETPASSWORDATTEMPTS];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.customerAccountService.getPasswordAttempts(customerId, userEvents)
      .subscribe(res => {
        this.customerDetails = res;
        this.isShowGrid = true;
        console.log(res);
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  searchAccountClick() {
    this.resetPasswordmForm.controls["accountId"].markAsTouched({ onlySelf: true });
    if (this.resetPasswordmForm.valid) {
      this.csrRelationRequest = <ICSRRelationsRequest>{};
      this.csrRelationRequest.InternalUserId = this.sessionContextResponse.userId;
      this.csrRelationRequest.CustomerIds = this.resetPasswordmForm.controls['accountId'].value;
      this.csrRelationRequest.TagIds = '';
      this.csrRelationRequest.VehicleNumbers = '';
      this.commonService.csrRelationCheck(this.csrRelationRequest)
        .subscribe(res => {
          if (res) {
            this.showErrorMsg('Access Denied. You do not have privileges to access this account information');
          }
          else {
            this.getPasswordAttemptsbasedonCustID(this.resetPasswordmForm.controls['accountId'].value);
          }
        });
    }
  }

  resetClick() {
    this.isShowGrid = false;
    this.resetPasswordmForm.reset();
  }

  btnYesClick(accountId: number, userName: string) {
    $('#confirm-dialog').modal('hide');
    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.RESETPASSWORDATTEMPTS];
    userEvents.ActionName = Actions[Actions.RESET];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.securityRequestObj = <ISecurityRequest>{};
    this.securityRequestObj.AccountId = accountId;
    this.securityRequestObj.UserName = userName;
    this.securityRequestObj.UpdatedUser = this.sessionContextResponse.userName;
    this.securityRequestObj.ActivitySource = ActivitySource.Internal;
    this.securityRequestObj.SubSystem = SubSystem[SubSystem.CSC];
    this.securityRequestObj.IsActivityRequired = true;
    this.customerAccountService.resetPasswordAttempts(this.securityRequestObj, userEvents)
      .subscribe(res => {
        console.log(res);
        if (res) {
          this.showSucsMsg('Password attempts count has been reset successfully');
          this.getPasswordAttemptsbasedonCustID(accountId);
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  userAction(event) {
    if (event) {
      this.btnYesClick(this.customerDetails[0].AccountId, this.customerDetails[0].UserName)
    }
  }

  alertClick() {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgDesc = 'Are you sure you want to reset the password attempts count ?';
  }

}
