import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerDetailsService } from './services/customerdetails.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ISecurityRequest } from './models/securityrequest';
import { SubSystem, ActivitySource, Features, Actions } from '../../shared/constants';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { ICustomerAttributeRequest } from '../../shared/models/customerattributerequest';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { Security } from '../../shared/models/Security';
import { CommonService } from '../../shared/services/common.service';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { IUserEvents } from '../../shared/models/userevents';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.css']
})
export class SecuritySettingsComponent implements OnInit {
  disableResetPin: boolean = false;
  disableResetPassword: boolean = false;;
  disableForgotUserName: boolean = false;;

  //variable declaration
  longAccountId: number = 0; //  10002804;
  customerContextResponse: ICustomerContextResponse;
  securityQuestionsAnswers: any[];
  childCustomerDetails: any[];
  securityRequest: ISecurityRequest;
  sysytemActivities: ISystemActivities;
  customerAttributeRequest: ICustomerAttributeRequest;
  customerInformationres: ICustomerResponse;
  isHavingChildCustomer: boolean = false;
  strUserName: string;
  strUserNameStar: string = "";
  showUser: boolean = false;
  childUsername: string = "";
  securityReq: Security = <Security>{};
  strQuestion: string = "";
  sessionContextResponse: IUserresponse;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  // Form group 
  generatePassUser: FormGroup;
  generatePin: FormGroup;

  //Input from other module 
  UserInputs: IAddUserInputs = <IAddUserInputs>{};

  constructor(private customerDetailsService: CustomerDetailsService,
    private customerContext: CustomerContextService,
    private sessionContext: SessionService,
    private commonService: CommonService,
    private router: Router) {
    this.sessionContextResponse = this.sessionContext.customerContext;
    //login user inputs
    this.UserInputs.LoginId = this.sessionContextResponse.loginId;
    this.UserInputs.UserId = this.sessionContextResponse.userId;
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.UserInputs.AccountId = this.sessionContextResponse.userId;
  }

  ngOnInit() {
    this.generatePassUser = new FormGroup({
      'user': new FormControl('', [Validators.required]),
    })

    this.generatePin = new FormGroup({
      'userpin': new FormControl('', [Validators.required]),
    });

    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.longAccountId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ChildCustomerId : this.customerContextResponse.AccountId;
     // this.longAccountId = this.customerContextResponse.AccountId;
    }

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTSECURITY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longAccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.getChildCustomersByParentAccountId(userEvents);
    this.bindAccountSummaryInformation(this.longAccountId);
    this.getSecurityQuestions();
    this.checkRolesandPrivileges();
  }

  private strEncryptedString = "";

  getDecriptString(plainText: string, saltValue: string, index: number): string {
    this.securityReq.plainText = plainText;
    this.securityReq.saltValue = saltValue;
    this.securityReq.encryptText = null;
    this.securityReq.isEncrypted = "false";
    this.securityReq.SecurityType = "Other";
    this.commonService.decrypt(this.securityReq).subscribe(respass => {
      if (respass) {
        this.strEncryptedString = respass;
      }
    }, (err) => { }, () => {
      if (this.securityQuestionsAnswers.length > 0) {
        this.securityQuestionsAnswers[index].Answer = this.strEncryptedString;
      }
    })
    return this.strEncryptedString;
  }

  checkRolesandPrivileges() {
    this.disableForgotUserName = !this.commonService.isAllowed(Features[Features.ACCOUNTSECURITY], Actions[Actions.FORGOTUSERNAME], "");
    this.disableResetPassword = !this.commonService.isAllowed(Features[Features.ACCOUNTSECURITY], Actions[Actions.RESETPASSWORD], "");
    this.disableResetPin = !this.commonService.isAllowed(Features[Features.ACCOUNTSECURITY], Actions[Actions.RESETPIN], "");
  }



  getChildCustomersByParentAccountId(userEvents?: IUserEvents) {
    this.customerDetailsService.getChildCustomersByParentAccountId(this.longAccountId, userEvents)
      .subscribe(res => {
        this.childCustomerDetails = res
        if (this.childCustomerDetails.length > 1) {
          this.isHavingChildCustomer = true;
        }
        else {
          this.generatePassUser.removeControl('user');
          this.generatePin.removeControl('userpin');
        }
      });
  }

  bindAccountSummaryInformation(longAccountId): string {
    this.customerDetailsService.bindCustomerInfoDetails(this.longAccountId).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => { }
      , () => {
        this.strUserName = this.customerInformationres.UserName;
        if (this.strUserName.length > 0) {
          for (let i = 0; i < this.strUserName.length; i++) {
            this.strUserNameStar += '*';
          }
        }
      })
    return this.strUserName;
  }

  getSecurityQuestions() {
    this.customerDetailsService.getSecurityQuestions(this.longAccountId)
      .subscribe(res => {
        this.securityQuestionsAnswers = res
      }, (err) => { },
      () => {
        if (this.securityQuestionsAnswers.length > 0) {
          for (let i = 0; i < this.securityQuestionsAnswers.length; i++) {
            this.strQuestion = this.getEnumDescription(this.securityQuestionsAnswers[i].Question, i);
            this.getDecriptString(this.securityQuestionsAnswers[i].Answer, this.securityQuestionsAnswers[i].Question, i);
          }
        }
        else {
          this.securityQuestionsAnswers = [];
        }

      });
  }

  private strEnumDescription: string = "";

  getEnumDescription(strEnumtext: string, index: number): string {
    this.customerDetailsService.getEnumDescriptionByEnum(strEnumtext).subscribe(
      res => {
        this.strEnumDescription = res;
        ;
      }, (err) => { },
      () => {
        if (this.securityQuestionsAnswers.length > 0) {
          this.securityQuestionsAnswers[index].Question = this.strEnumDescription;
        }
      });
    return this.strEnumDescription;
  }
  private longchildAccountId: number;

  updateGeneratePassword() {
    if (this.generatePassUser.valid) {

      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTSECURITY];
      userEvents.ActionName = Actions[Actions.RESETPASSWORD];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longAccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;


      this.tempAccountId = this.getChildAccountId(this.generatePassUser, 'user');
      // if (this.tempAccountId > 0) {
      //   this.childUsername = this.bindAccountSummaryInformation(this.tempAccountId);
      // }
      // else {
      //   this.childUsername = this.strUserName;
      // }
      this.securityRequest = <ISecurityRequest>{};
      this.securityRequest.UserName = this.childUsername;
      this.securityRequest.UpdatedUser = this.UserInputs.UserName;
      this.securityRequest.AccountId = this.tempAccountId > 0 ? this.tempAccountId : this.longAccountId;
      this.securityRequest.ParentId = this.longAccountId;
      this.securityRequest.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
      this.securityRequest.SubSystem = SubSystem[SubSystem.CSC];
      //For system activitites
      this.sysytemActivities = <ISystemActivities>{};
      this.sysytemActivities.LoginId = this.UserInputs.LoginId;
      this.sysytemActivities.UserId = this.UserInputs.UserId;
      this.securityRequest.SystemActivity = this.sysytemActivities;
      this.customerDetailsService.updateGeneratePassword(this.securityRequest, userEvents)
        .subscribe(res => {
          if (res) {
            this.showSucsMsg('Password has been generated successfully and it will be send to the email address: ' + res);
          }
          else {
            this.showErrorMsg('Error while generating the password');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString())
        });
    }
  }

  getChildAccountId(strFormName: FormGroup, strControlId: string): number {
    this.longchildAccountId = 0;
    if (this.isHavingChildCustomer) {
      this.longchildAccountId = strFormName.controls[strControlId].value;
    }
    return this.longchildAccountId;
  }

  private tempAccountId: number;

  updateUsername() {
    if (this.generatePassUser.valid) {


      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTSECURITY];
      userEvents.ActionName = Actions[Actions.FORGOTUSERNAME];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longAccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.securityRequest = <ISecurityRequest>{};
      this.tempAccountId = this.getChildAccountId(this.generatePassUser, 'user');
      if (this.tempAccountId > 0) {
        //  this.childUsername = this.bindAccountSummaryInformation(this.tempAccountId);
        this.securityRequest.AccountId = this.tempAccountId;
        this.securityRequest.ParentId = this.longAccountId;
      }
      else {
        // this.childUsername = this.strUserName;
        this.securityRequest.AccountId = this.longAccountId;
        this.securityRequest.ParentId = this.longAccountId; // no child exist
      }

      // this.securityRequest.UserName = this.childUsername; // customer username
      this.securityRequest.ActivitySource = ActivitySource.Internal;
      this.securityRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.securityRequest.UpdatedUser = this.UserInputs.UserName;
      //For system activitites
      this.sysytemActivities = <ISystemActivities>{};
      this.sysytemActivities.LoginId = this.UserInputs.LoginId;
      this.sysytemActivities.UserId = this.UserInputs.UserId;
      this.securityRequest.SystemActivity = this.sysytemActivities;
      this.customerDetailsService.updateUsername(this.securityRequest, userEvents)
        .subscribe(res => {
          this.showSucsMsg('Username has been successfully sent to the email address');
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        });
    }
  }


  updateGeneratePin() {
    if (this.generatePin.valid) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTSECURITY];
      userEvents.ActionName = Actions[Actions.RESETPIN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longAccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.customerAttributeRequest = <ICustomerAttributeRequest>{};
      this.tempAccountId = this.getChildAccountId(this.generatePin, 'userpin');
      if (this.tempAccountId > 0) {
        this.customerAttributeRequest.AccountId = this.tempAccountId;
        this.customerAttributeRequest.parentId = this.longAccountId
      }
      else {
        this.customerAttributeRequest.parentId = this.longAccountId;
        this.customerAttributeRequest.AccountId = this.longAccountId;
      }

      this.customerAttributeRequest.AccountId = this.tempAccountId;
      this.customerAttributeRequest.ActivitySource = ActivitySource.Internal.toString();
      this.customerAttributeRequest.SubSystem = SubSystem.CSC.toString();
      this.customerAttributeRequest.UserId = this.UserInputs.LoginId;
      this.customerAttributeRequest.LoginId = this.UserInputs.LoginId;
      //For system activitites
      this.customerAttributeRequest.UpdatedUser = this.UserInputs.UserName;
      this.customerDetailsService.updateGeneratedPin(this.customerAttributeRequest, userEvents)
        .subscribe(res => {
          if (res) {
            this.showSucsMsg('Pin has been generated successfully and it will be send to the email address: ' + res);
          }
          else {
            this.showErrorMsg('Error while generating the pin');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        });
    }
  }


  toggleUsername(): void {
    this.showUser = !this.showUser;
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

}

export interface IAddUserInputs {
  UserName: string
  LoginId: number
  UserId: number
  AccountId: number
}
