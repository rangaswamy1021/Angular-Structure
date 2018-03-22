import { ActivitySource, Actions, Features } from "./../../shared/constants";
import { SessionService } from "./../../shared/services/session.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IAccountGroupsRequest } from "./models/accountgroupsresquest";
import { IAccountGroupsresponse } from "./models/accountgroupsresponse";
import { ConfigurationService } from "./services/configuration.service";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {
  msgDesc: string;
  msgFlag: boolean;
  status: string;
  msgType: string;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  sessionContextResponse: IUserresponse;
  locations = [];
  description: any;
  closebtn: boolean;
  accountgroupid: any;
  AccountGroupId: any;
  updateCancel: boolean;
  updateAdd: boolean;
  Updateerror: string;
  updatemessage: string;
  validateExceptAnglePattern: any;
  Codepattern: any = "[A-Za-z]*";
  errorMessage: any;
  successMessage: any;
  accountGroupReq: IAccountGroupsRequest = <IAccountGroupsRequest>{};
  accountGroupRes: IAccountGroupsresponse[];
  getAccountGroups: any;
  addNewAccountGroupFrom: FormGroup;
  enterNewAccountDetails: boolean;
  addNewAccountGroupDetails: boolean = true;
  systemActivities: ISystemActivities;
  accountGroupLength: number;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  constructor(private configurationService: ConfigurationService, private router: Router, private commonService: CommonService, private context: SessionService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    this.p = 1;
    this.addNewAccountGroupFrom = new FormGroup({
      'code': new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern(this.Codepattern)]),
      'description': new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern(this.validateExceptAnglePattern)])
    });
    this.getAccountGroupsDetails(this.p);
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.ACCOUNTGROUPS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.ACCOUNTGROUPS], Actions[Actions.UPDATE], "");
  }
  cancelNewAccount() {
    this.enterNewAccountDetails = false;
    this.addNewAccountGroupDetails = true;
    this.updateAdd = false;
    this.updateCancel = false;
    this.addNewAccountGroupFrom.reset();
  }
  addNewAccountGroup() {
    this.status = "Add";
    this.enterNewAccountDetails = true;
    this.addNewAccountGroupDetails = false;
    this.updateAdd = true;
    this.updateCancel = false;
    this.successMessage = "";
    this.errorMessage = "";
    this.addNewAccountGroupFrom.reset();
    this.addNewAccountGroupFrom.get("code").enable();
    this.materialscriptService.material();

  }
  close() {
    this.errorMessage = false;
    this.successMessage = false;
  }
  getAccountGroupsDetails(pageNumber: number): void {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.configurationService.getAccountGroups(this.systemActivities, userEvents).subscribe(
      res => {
        this.accountGroupRes = res;
        this.totalRecordCount = this.accountGroupRes.length;
        if (this.accountGroupRes) {
          this.totalRecordCount = this.accountGroupRes.length;
        }
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        } else {
          this.endItemNumber = ((this.p) * this.pageItemNumber);
          if (this.endItemNumber > this.totalRecordCount) {
            this.endItemNumber = this.totalRecordCount
          }
        }
      }
    )
    this.addNewAccountGroupFrom.reset();
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getAccountGroupsDetails(this.p);
  }
  createAccountGroups() {
    this.successMessage = "";
    this.errorMessage = "";
    this.enterNewAccountDetails = true;
    this.addNewAccountGroupDetails = false;
    if (this.addNewAccountGroupFrom.valid) {
      this.accountGroupReq.accountgroupcode = this.addNewAccountGroupFrom.controls['code'].value;
      this.accountGroupReq.accountgroupdesc = this.addNewAccountGroupFrom.controls['description'].value;
      this.accountGroupReq.User = this.context.customerContext.userName;
      this.systemActivities.LoginId = this.context.customerContext.loginId;
      this.systemActivities.UserId = this.context.customerContext.userId;
      this.systemActivities.User = this.context.customerContext.userName;
      this.systemActivities.IsViewed = true;
      this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
      this.accountGroupReq.SystemActivities = this.systemActivities;
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.CREATE];
      this.userEventsCalling(userEvents);
      this.configurationService.addAccountGroupDetails(this.accountGroupReq, userEvents).subscribe(
        res => {
          if (res) {
            this.cancelNewAccount();
            this.getAccountGroupsDetails(this.p);
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = 'Account Groups has been created successfully.'
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = err.statusText.toString();
        });
      this.addNewAccountGroupFrom.reset();
    }
    else {
      this.addNewAccountGroupFrom.controls["code"].markAsTouched({ onlySelf: true });
      this.addNewAccountGroupFrom.controls["description"].markAsTouched({ onlySelf: true });
    }
  }
  editAccountGroup(accountGroup) {
    this.status = "Update";
    this.successMessage = "";
    this.errorMessage = "";
    this.description = accountGroup.AccountGroupDesc;
    this.addNewAccountGroupDetails = false;
    this.enterNewAccountDetails = true;
    this.updateCancel = true;
    this.updateAdd = false;
    this.addNewAccountGroupFrom.get("code").disable();
    this.accountgroupid = accountGroup.AccountGroupId;
    this.addNewAccountGroupFrom.controls['code'].setValue(accountGroup.AccountGroupCode);
    this.addNewAccountGroupFrom.controls['description'].setValue(accountGroup.AccountGroupDesc);
    this.materialscriptService.material();
  }

  update() {
    if (this.addNewAccountGroupFrom.controls['description'].value == "") {
      this.addNewAccountGroupFrom.controls["description"].markAsTouched({ onlySelf: true });
    }
    else if (this.addNewAccountGroupFrom.controls['description'].value == this.description) {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = 'No changes to update.'
    }
    else {
      this.updateDetails();
    }
  }
  updateDetails() {
    this.errorMessage = "";
    this.enterNewAccountDetails = false;
    this.addNewAccountGroupDetails = true;
    this.updateAdd = false;
    this.updateCancel = true;
    this.accountGroupReq.accountgroupid = this.accountgroupid;
    this.accountGroupReq.accountgroupcode = this.addNewAccountGroupFrom.controls['code'].value;
    this.accountGroupReq.accountgroupdesc = this.addNewAccountGroupFrom.controls['description'].value;
    this.accountGroupReq.User = this.context.customerContext.userName;
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.accountGroupReq.SystemActivities = this.systemActivities;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    this.configurationService.updateAccountGroupDetails(this.accountGroupReq, userEvents).subscribe(
      res => {
        if (res) {
          this.getAccountGroupsDetails(this.p);
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Account Groups has been update successfully.'
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = 'Error while update the Account Groups.'
        }
      });
  }
  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.ACCOUNTGROUPS];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) { this.msgFlag = e; }
}
