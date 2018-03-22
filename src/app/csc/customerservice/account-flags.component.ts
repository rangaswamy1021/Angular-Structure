import { Router } from '@angular/router';
import { IUserEvents } from '../../shared/models/userevents';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { Actions, ActivitySource, Features, SubSystem } from '../../shared/constants';
import { IAccountFlagsRequest } from './models/accountflagsrequest';
import { CommonService } from '../../shared/services/common.service';
import { ICommonResponse } from '../../shared/models/commonresponse';
import { CustomerDetailsService } from '../customerdetails/services/customerdetails.service';
import { IAccountFlagsResponse } from './models/accountflagsresponse';
import { CustomerserviceService } from './services/customerservice.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-account-flags',
  templateUrl: './account-flags.component.html',
  styleUrls: ['./account-flags.component.scss']
})
export class AccountFlagsComponent implements OnInit {
  longCustomerid: number;
  accountFlagsResponse: IAccountFlagsResponse;
  accountFlagsForm: FormGroup;
  dropDownDataResults: ICommonResponse[];
  lookuptype: ICommonResponse;
  accountFlagsRequest: IAccountFlagsRequest;
  isFrequentCaller: boolean;
  isHearingImpirement: boolean;
  isSupervisor: boolean;
  isTagInStatusFile: boolean;
  preferedLanguange: string;
  customerContextResponse: ICustomerContextResponse;
  customerInformationres: ICustomerResponse;
  sessionContextResponse: IUserresponse;
  isAdminRole: boolean;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;


  constructor(private customerService: CustomerserviceService, private customerDetailsService: CustomerDetailsService,
    private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router,
     private commonService: CommonService, private materialscriptService: MaterialscriptService) {
  }

  ngOnInit() {
   this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);
    if (this.sessionContext.customerContext.rolename.toUpperCase() == 'ADMIN') {
      this.isAdminRole = true;
    }
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.longCustomerid = this.customerContextResponse.AccountId;
    }
    if (this.customerContextResponse.ParentId > 0) {
      this.longCustomerid = this.customerContextResponse.ParentId;
    }
    this.accountFlagsForm = new FormGroup({
      'languagePreference': new FormControl(''),
      'hearingImpairment': new FormControl(''),
      'frequentCaller': new FormControl(''),
      'specialHandling': new FormControl(''),
      'tagInStatusFile': new FormControl(''),
    });

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTFLAGS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longCustomerid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    !this.commonService.isAllowed(Features[Features.ACCOUNTFLAGS], Actions[Actions.VIEW], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.ACCOUNTFLAGS], Actions[Actions.UPDATE], "");
    this.bindDropdown();
    this.bindAccountSummaryInformation();
    this.getAccountFlags(userEvents);

  }

  bindAccountSummaryInformation() {
    this.customerDetailsService.bindCustomerInfoDetails(this.longCustomerid).subscribe(
      res => {
        this.customerInformationres = res;
      });
  }

  getAccountFlags(userEvents?) {
    this.customerService.getAccountFlags(this.longCustomerid, userEvents)
      .subscribe(res => {
        this.accountFlagsResponse = res;
        this.isFrequentCaller = this.accountFlagsResponse.ISFrequentCaller;
        this.isHearingImpirement = this.accountFlagsResponse.IsHearingImpirement;
        this.isSupervisor = this.accountFlagsResponse.IsSupervisor;
        this.isTagInStatusFile = this.accountFlagsResponse.IsTagInStatusFile;
        this.preferedLanguange = this.accountFlagsResponse.PreferedLanguange;
      });
  }
  bindDropdown() {
    this.lookuptype = <ICommonResponse>{};
    this.lookuptype.LookUpTypeCode = "Languages";
    this.customerService.getLookUpByParentLookupTypeCode(this.lookuptype)
      .subscribe(res => {
        this.dropDownDataResults = res;
      });

  }

  saveAccountFlags() {
    if (this.accountFlagsResponse && this.accountFlagsResponse.PreferedLanguange == this.accountFlagsForm.value.languagePreference
      && this.accountFlagsResponse.ISFrequentCaller == this.accountFlagsForm.value.frequentCaller
      && this.accountFlagsResponse.IsHearingImpirement == this.accountFlagsForm.value.hearingImpairment
      && this.accountFlagsResponse.IsSupervisor == this.accountFlagsForm.value.specialHandling
      && this.accountFlagsResponse.IsTagInStatusFile == this.accountFlagsForm.value.tagInStatusFile) {
      this.showErrorMsg("No account flag has been changed");
    }
    else {
      //User Events 
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTFLAGS];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longCustomerid;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.accountFlagsRequest = <IAccountFlagsRequest>{};
      this.accountFlagsRequest.PreferedLanguange = this.accountFlagsForm.value.languagePreference;
      this.accountFlagsRequest.ISFrequentCaller = this.accountFlagsForm.value.frequentCaller;
      this.accountFlagsRequest.IsHearingImpirement = this.accountFlagsForm.value.hearingImpairment;
      this.accountFlagsRequest.IsSupervisor = this.accountFlagsForm.value.specialHandling;
      this.accountFlagsRequest.IsTagInStatusFile = this.accountFlagsForm.value.tagInStatusFile;
      this.accountFlagsRequest.CustomerId = this.longCustomerid;
      this.accountFlagsRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.accountFlagsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.accountFlagsRequest.PerformBy = this.sessionContextResponse.userName;
      this.accountFlagsRequest.IsCreateAccountUserActivity = true;
      this.customerService.updateAccountFlags(this.accountFlagsRequest, userEvents)
        .subscribe(res => {
          console.log(res);
          this.showSucsMsg("Account Flag details have been updated successfully");
          this.getAccountFlags();
        },
        (err) => {
          this.showErrorMsg(err.statusText.toString());
        });
    }
  }

  restCLick() {
    this.getAccountFlags();
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

