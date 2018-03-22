//import { IProfileResponse } from './contracts/ProfileResponse';
import { ICustomerProfileResponse } from './../../shared/models/customerprofileresponse';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { ISearchCustomerRequest } from './models/searchCustomerrequest';
import { Component, OnInit, NgModule } from '@angular/core'
import { CustomerSearchService } from './services/customer.search';
import { IPaging } from "../../shared/models/paging";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SearchDetailsComponent } from './search-details.component';
import { Router } from '@angular/router';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ActivitySource, SubSystem, Features, Actions } from '../../shared/constants';
import { CommonService } from '../../shared/services/common.service';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { LoginService } from "../../login/services/login.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IUserEvents } from '../../shared/models/userevents';
declare var $: any;

@Component({
  selector: 'app-basic-search',
  templateUrl: './basic-search.component.html',
  styleUrls: ['./basic-search.component.css']
})
export class BasicSearchComponent implements OnInit {
  basicSearchForm: FormGroup;
  message: boolean = false;
  blockListDetails: IBlocklistresponse[] = [];
  searchCustomer: ISearchCustomerRequest;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  profileResponse: ICustomerProfileResponse[] = <ICustomerProfileResponse[]>{};
  afterSearch = false;
  customerData: any = [];
  userEventRequest: IUserEvents = <IUserEvents>{};
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  disableButton: boolean = false;

  constructor(private customerSearchService: CustomerSearchService,
    private router: Router, private customerContext: CustomerContextService, private context: SessionService,
    private commonService: CommonService, private loginService: LoginService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.searchCustomer = <ISearchCustomerRequest>{};
    this.basicSearchForm = new FormGroup({
      'AccountId': new FormControl(''),
      'TransponderNumber': new FormControl(''),
      'VehicleNumber': new FormControl('')
    });
    if (!this.commonService.isAllowed(Features[Features.BASICSEARCH], Actions[Actions.VIEW], "")) {
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.BASICSEARCH], Actions[Actions.SEARCH], "");
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.BASICSEARCH];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context.customerContext.roleID);
    userEvents.UserName = this.context.customerContext.userName;
    userEvents.LoginId = this.context.customerContext.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
  }

  basicSearchCustomer(): void {
    if (this.basicSearchForm.controls['AccountId'].value == "" &&
      this.basicSearchForm.controls['TransponderNumber'].value == "" &&
      this.basicSearchForm.controls['VehicleNumber'].value == "") {
      this.profileResponse = <ICustomerProfileResponse[]>[];
      this.afterSearch = false;
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Please fill at-least one field";
      this.msgTitle = 'Invalid search';
      return;
    }
    else if (this.basicSearchForm.controls['AccountId'].value == null &&
      this.basicSearchForm.controls['TransponderNumber'].value == null &&
      this.basicSearchForm.controls['VehicleNumber'].value == null) {
      this.profileResponse = <ICustomerProfileResponse[]>[];
      this.afterSearch = false;
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Please fill at-least one field";
      this.msgTitle = 'Invalid search';
      return;
    }
    else {
      if (this.basicSearchForm.controls['AccountId'].value == "")
        this.searchCustomer.AccountId = 0;
      else
        this.searchCustomer.AccountId = this.basicSearchForm.controls['AccountId'].value;
      this.searchCustomer.TransponderNumber = this.basicSearchForm.controls['TransponderNumber'].value;
      this.searchCustomer.VehicleNumber = this.basicSearchForm.controls['VehicleNumber'].value;
      this.searchCustomer.LoginId = this.context.customerContext.loginId;
      this.searchCustomer.LoggedUserID = this.context.customerContext.userId;
      this.searchCustomer.LoggedUserName = this.context.customerContext.userName;
      this.searchCustomer.IsSearchEventFired = true;
      this.searchCustomer.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.searchCustomer.PageIndex = <IPaging>{};
      this.searchCustomer.PageIndex.PageNumber = 1;
      this.searchCustomer.PageIndex.PageSize = 10;
      this.searchCustomer.PageIndex.SortColumn = "";
      this.searchCustomer.PageIndex.SortDir = 1;
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.BASICSEARCH];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context.customerContext.roleID);
      userEvents.UserName = this.context.customerContext.userName;
      userEvents.LoginId = this.context.customerContext.loginId;
      this.customerSearchService.getBasicSearch(this.searchCustomer, userEvents).subscribe(res => {
        this.profileResponse = res;
        this.afterSearch = true;
        this.bindCustomerInfoBlock(this.searchCustomer.AccountId)
        this.checkForBlockList(this.searchCustomer.AccountId);

      });
    }
  }

  bindCustomerInfoBlock(longAccountId: number) {
    this.customerSearchService.bindCustomerInfoBlock(longAccountId).subscribe(respose => {
      if (respose)
        this.customerData = respose;
    },
      err => {
      },
      () => {
        if (this.customerData.length) { }
      }
    );
  }

  basicSearchReset() {
    if (this.basicSearchForm.clearValidators) {
      this.basicSearchForm.reset();
      this.basicSearchForm.controls['AccountId'].setValue("");
      this.basicSearchForm.controls['TransponderNumber'].setValue("");
      this.basicSearchForm.controls['VehicleNumber'].setValue("");
      //this.basicSearchCustomer();
    }
    this.profileResponse = null;
    this.afterSearch = false;
  }

  checkForBlockList(longAccountId: number) {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(res => {
      if (res) {
        this.commonService.checkBlockListByAccountId(longAccountId).subscribe(respose => {
          if (respose) {
            this.blockListDetails = respose;
            $('#blocklist-dialog').modal('show');
          } else {
            this.goToSummary();
          }
        });

      } else {
        this.goToSummary();
      }
    });
  }
  goToSummary() {
    var timeSpentId = 0;
    this.customerSearchService.InsertTimeSpentEvents(this.profileResponse[0].AccountId, this.context.customerContext.userName).subscribe(res => {
      timeSpentId = res;
    }, err => { }, () => {
      this.customerContextResponse = <ICustomerContextResponse>{};
      if (this.profileResponse[0].ParentId > 0) {
        this.customerContextResponse.ChildCustomerId = this.profileResponse[0].AccountId;
        this.customerContextResponse.ParentId = this.profileResponse[0].ParentId;
      }
      else {
        this.customerContextResponse.ChildCustomerId = 0;
        this.customerContextResponse.ParentId = 0;
      }
      this.customerContextResponse.AccountId = this.profileResponse[0].AccountId;
      this.customerContextResponse.UserName = this.profileResponse[0].CreatedUser;
      this.customerContextResponse.AccountStatus = this.profileResponse[0].AccountStatus;
      this.customerContextResponse.AccountStatusDesc = this.profileResponse[0].AccountStatusDesc;
      this.customerContextResponse.AccountSummaryUserActivity = true;
      this.customerContextResponse.AccountType = this.profileResponse[0].AccountType;
      this.customerContextResponse.AdditionalContactUserId = this.customerData.ParentId > 0 ? this.profileResponse[0].AccountId : this.profileResponse[0].ParentId;
      this.customerContextResponse.IsTagRequired = this.customerData.IsTagRequired
      this.customerContextResponse.CustomerParentPlan = this.customerData.ParentPlanName;
      this.customerContextResponse.CustomerPlan = this.customerData.PlanName;
      this.customerContextResponse.IsSearched = true;
      this.customerContextResponse.IsSplitCustomer = false;
      this.customerContextResponse.RevenueCategory = this.customerData.RevenueCategory;
      this.customerContextResponse.TimeSpentId = timeSpentId;
      this.customerContextResponse.isNavigateFromSearch = true;
      this.customerContext.changeResponse(this.customerContextResponse);

      //prepare audit log for view.
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.BASICSEARCH];
      userEvents.ActionName = Actions[Actions.ACCOUNTSUMMARY];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.profileResponse[0].AccountId;
      userEvents.RoleId = parseInt(this.context.customerContext.roleID);
      userEvents.UserName = this.context.customerContext.userName;
      userEvents.LoginId = this.context.customerContext.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
      this.loginService.setCustomerContext(this.customerContextResponse.AccountId);
      let link = ['/csc/customerdetails/account-summary'];
      this.router.navigate(link);
    });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

