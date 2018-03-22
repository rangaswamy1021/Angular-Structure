import { User } from './../../shared/models/User';
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from './../../shared/constants';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IAccountGroupsresponse } from "./models/accountgroupsresponse";
import { IAccountsubgroupsrequest } from "./models/accountsubgrouprequest";
import { IAccountsubgroupsresponse } from "./models/accountsubgroupresponse";
import { ConfigurationService } from "./services/configuration.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { Router } from '@angular/router';
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-account-sub-groups',
  templateUrl: './account-sub-groups.component.html',
  styleUrls: ['./account-sub-groups.component.scss']
})
export class AccountSubGroupsComponent implements OnInit {
  status: string;
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  createButton: boolean;
  updateButton: boolean;
  sessionContextResponse: IUserresponse;
  accountGroupLength: number;
  accountsubgroup: string;
  accountGroupselected: string;
  codePattern: any = "^[a-zA-Z_ ]*$";
  errorMessage: string;
  successMessage: string;
  accountGroupRes: IAccountGroupsresponse[];
  addNewAccountSubGroupFrom: FormGroup;
  systemActivities: ISystemActivities;
  subgrouprequest: IAccountsubgroupsrequest;
  subgroupresponse: IAccountsubgroupsresponse[];
  addNewAccountSubGroupDetails: boolean = true;
  enterNewAccountSubGroupDetails: boolean = false;
  showAdd: boolean = false;
  showUpdate: boolean = false;
  p: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  dupdescription: any;
  @ViewChild('description', { read: name }) elementRef: ElementRef;
  constructor(private configurationService: ConfigurationService, private commonService: CommonService, private sessionContext: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTSUBGROUPS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.updateButton = !this.commonService.isAllowed(Features[Features.ACCOUNTSUBGROUPS], Actions[Actions.UPDATE], "");
    this.createButton = !this.commonService.isAllowed(Features[Features.ACCOUNTSUBGROUPS], Actions[Actions.CREATE], "");
    this.addNewAccountSubGroupDetails = true;
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.addNewAccountSubGroupFrom = new FormGroup({
      'AccountGroupCode': new FormControl('', [Validators.required]),
      'name': new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(this.codePattern)]),
      'description': new FormControl('', [Validators.required, Validators.maxLength(500)])
    });
    this.addsubgroupDropdown();
    this.getAccountSubGroupsDetails(this.p);

  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getAccountSubGroupsDetails(this.p);

  }
  addNewAccountGroup() {
    this.materialscriptService.material();
    this.status = "Add";
    this.successMessage = "";
    this.errorMessage = "";
    this.addNewAccountSubGroupDetails = false;
    this.enterNewAccountSubGroupDetails = true;
    this.showAdd = true;
    this.showUpdate = false;
    this.addNewAccountSubGroupFrom.controls["AccountGroupCode"].enable();
    this.addNewAccountSubGroupFrom.controls["AccountGroupCode"].setValue("");
    this.addNewAccountSubGroupFrom.controls["name"].enable();
  }
  cancelNewAccount() {
    this.addNewAccountSubGroupDetails = true;
    this.enterNewAccountSubGroupDetails = false;
    this.addNewAccountSubGroupFrom.reset();
    this.errorMessage = "";
    this.successMessage = "";
  }
  getAccountSubGroupsDetails(pageNumber: number): void {
    this.subgrouprequest = <IAccountsubgroupsrequest>{};
    this.subgrouprequest.SystemActivities = <ISystemActivities>{};
    this.subgrouprequest.PageNumber = this.p;
    this.subgrouprequest.PageSize = 10;
    this.subgrouprequest.IsPaging = 1;
    this.subgrouprequest.SortColumn = "AGCODE";
    this.subgrouprequest.SortDir = 0;
    this.subgrouprequest.user = this.sessionContext.customerContext.userName;
    this.subgrouprequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.subgrouprequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.subgrouprequest.SystemActivities.IsViewed = true;
    this.subgrouprequest.SystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getSubGroups(this.subgrouprequest).subscribe(
      res => {
        this.subgroupresponse = res;
        this.accountGroupLength = this.subgroupresponse.length;
        this.totalRecordCount = this.subgroupresponse[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      })
  }

  addsubgroupDropdown() {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.systemActivities.UserId = this.sessionContext.customerContext.userId;
    this.systemActivities.User = this.sessionContext.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.configurationService.getAccountGroups(this.systemActivities).subscribe(
      res => {
        this.accountGroupRes = res;
        console.log("account Group response: ", this.accountGroupRes);
      }
    );
  }

  accountGroupSelectedChange(accountGroupCode: string) {
    this.accountGroupselected = accountGroupCode;
  }

  createAccountGroups() {
    if (this.addNewAccountSubGroupFrom.valid) {
      this.subgrouprequest = <IAccountsubgroupsrequest>{};
      this.subgrouprequest.SystemActivities = <ISystemActivities>{};
      this.subgrouprequest.AccountGroupCode = this.accountGroupselected;
      this.subgrouprequest.AccountSubGroupCode = this.addNewAccountSubGroupFrom.controls['name'].value;
      this.subgrouprequest.Description = this.addNewAccountSubGroupFrom.controls['description'].value;
      this.subgrouprequest.user = this.sessionContext.customerContext.userName;
      this.subgrouprequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
      this.subgrouprequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
      this.subgrouprequest.SystemActivities.User = this.sessionContext.customerContext.userName;
      this.subgrouprequest.SystemActivities.IsViewed = true;
      this.subgrouprequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
      this.sessionContextResponse = this.sessionContext.customerContext;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTSUBGROUPS];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      userEvents.ActionName = Actions[Actions.CREATE];
      this.configurationService.addAccountSubGroupDetails(this.subgrouprequest, userEvents).subscribe(
        res => {
          if (res) {
            this.successMessageBlock("Account Sub Group has been created successfully");
            this.getAccountSubGroupsDetails(this.p);

            this.addNewAccountSubGroupFrom.reset();
            this.addNewAccountSubGroupDetails = true;
            this.enterNewAccountSubGroupDetails = false;
          }
        }, (err) => {

          this.errorMessageBlock(err.statusText.toString());
        });
    }
    else {
      this.addNewAccountSubGroupFrom.controls["AccountGroupCode"].markAsTouched({ onlySelf: true });
      this.addNewAccountSubGroupFrom.controls["name"].markAsTouched({ onlySelf: true });
      this.addNewAccountSubGroupFrom.controls["description"].markAsTouched({ onlySelf: true });
    }
  }

  editAccountGroup(edit) {
    this.status = "Update";
    this.dupdescription = edit.Description;
    this.addNewAccountSubGroupFrom.controls["AccountGroupCode"].disable();
    this.addNewAccountSubGroupFrom.controls["name"].disable();
    this.showAdd = false;
    this.showUpdate = true;
    this.addNewAccountSubGroupDetails = false;
    this.enterNewAccountSubGroupDetails = true;
    this.addNewAccountSubGroupFrom.controls["AccountGroupCode"].setValue(edit.AccountGroupCode);
    this.addNewAccountSubGroupFrom.controls['name'].setValue(edit.AccountSubGroupCode);
    this.addNewAccountSubGroupFrom.controls['description'].setValue(edit.Description);
    this.materialscriptService.material();
  }

  update() {
    if (this.addNewAccountSubGroupFrom.controls['description'].value == "") {
      this.addNewAccountSubGroupFrom.controls["description"].markAsTouched({ onlySelf: true });
    }
    else if (this.addNewAccountSubGroupFrom.controls['description'].value == this.dupdescription) 
    {
      this.errorMessageBlock("No changes to update");
    }
    else {
      this.updateAccountSubGroups();
    }
  }

  updateAccountSubGroups() {
    this.subgrouprequest = <IAccountsubgroupsrequest>{};
    this.subgrouprequest.SystemActivities = <ISystemActivities>{};
    this.subgrouprequest.AccountGroupCode = this.addNewAccountSubGroupFrom.controls['AccountGroupCode'].value;
    this.subgrouprequest.AccountSubGroupCode = this.addNewAccountSubGroupFrom.controls['name'].value;
    this.subgrouprequest.Description = this.addNewAccountSubGroupFrom.controls['description'].value;
    this.subgrouprequest.user = this.sessionContext.customerContext.userName;
    this.subgrouprequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.subgrouprequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.subgrouprequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTSUBGROUPS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.ActionName = Actions[Actions.UPDATE];

    this.configurationService.updateAccountSubGroupDetails(this.subgrouprequest, userEvents).subscribe(
      res => {

        this.successMessageBlock("Account Sub Group has been updated successfully")
        this.getAccountSubGroupsDetails(this.p);
        this.addNewAccountSubGroupFrom.reset();
      });
    this.enterNewAccountSubGroupDetails = false;
    this.addNewAccountSubGroupDetails = true;
  }

  setOutputFlag(e) { this.msgFlag = e; }

  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }

  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
}
