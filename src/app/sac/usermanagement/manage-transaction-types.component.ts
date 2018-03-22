import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { UserManagementService } from '../usermanagement/services/usermanagement.service';
import { Actions, Features, ActivitySource } from '../../shared/constants';
import { IManageTransactionTypesRequest } from '../usermanagement/models/managetransactiontypesrequest';
import { CommonService } from '../../shared/services/common.service';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-transaction-types',
  templateUrl: './manage-transaction-types.component.html',
  styleUrls: ['./manage-transaction-types.component.scss']
})
export class ManageTransactionTypesComponent implements OnInit {

  constructor(private userManagementService: UserManagementService, private commonService: CommonService, private sessionContext: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }

  sessionContextResponse: IUserresponse;
  roles = [];
  availableTxnTypes = [];
  assignedTxnTypes = [];
  submitButtonText: string = 'Assign';
  actionCode: string = Actions[Actions.CREATE];
  assignedCount: number = 0;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  selectedRole: string = "";
  assignedTxnTypesSelected = [];
  availableTxnTypesSelected = [];
  disableButton: boolean;

  ngOnInit() {
this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.MANAGETRANSACTIONTYPES];
    systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    systemActivities.IsViewed = true;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MANAGETRANSACTIONTYPES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    // get roles
    this.commonService.getRoles(systemActivities, userEvents).subscribe(res => this.roles = res);
    // get available transaction types
    this.userManagementService.getTxnTypes().subscribe(res => this.availableTxnTypes = res);
    this.disableButton = !this.commonService.isAllowed(Features[Features.MANAGETRANSACTIONTYPES], Actions[Actions.CREATE], "");
  }

  bindTxnTypesByRoleId() {
    this.assignedTxnTypesSelected = [];
    this.availableTxnTypesSelected = [];
    if (this.selectedRole) {
      this.userManagementService.getTxnTypes().subscribe(res => {
        this.availableTxnTypes = res;
        this.userManagementService.getTxnTypesByRoleId(parseInt(this.selectedRole)).subscribe(res => {
          this.assignedTxnTypes = res;
          console.log(this.assignedTxnTypes);
          if (this.assignedTxnTypes && this.assignedTxnTypes.length > 0) {
            this.assignedCount = this.assignedTxnTypes.length;
            this.submitButtonText = 'Update';
            this.actionCode = Actions[Actions.UPDATE];
            if (this.availableTxnTypes && this.availableTxnTypes.length > 0) {
              this.availableTxnTypes = this.availableTxnTypes.filter(y =>
                this.assignedTxnTypes.every(j => j.TxnTypeId != y.TxnTypeId));
              console.log(this.availableTxnTypes);
            }
          }
          else {
            this.submitButtonText = 'Assign';
            this.actionCode = Actions[Actions.CREATE];
            this.assignedCount = 0;
          }
          this.disableButton = !this.commonService.isAllowed(Features[Features.MANAGETRANSACTIONTYPES], this.actionCode, "");
        });
      });
    }
    else {
      this.submitButtonText = 'Assign';
      this.actionCode = Actions[Actions.CREATE];
      this.assignedCount = 0;
      this.assignedTxnTypes = [];
      this.userManagementService.getTxnTypes().subscribe(res => this.availableTxnTypes = res);
      this.disableButton = !this.commonService.isAllowed(Features[Features.MANAGETRANSACTIONTYPES], this.actionCode, "");
    }
  }

  moveToAssigned() {
    console.log(this.availableTxnTypesSelected);
    for (let i = 0; i < this.availableTxnTypesSelected.length; i++) {
      var filtered = this.availableTxnTypes.filter(x => x.TxnTypeId == this.availableTxnTypesSelected[i])[0];
      if (filtered) {
        this.availableTxnTypes = this.availableTxnTypes.filter(x => x.TxnTypeId != this.availableTxnTypesSelected[i]);
        this.assignedTxnTypes.push(filtered);
      }
    }
    this.assignedTxnTypesSelected = [];
    this.availableTxnTypesSelected = [];
    this.actionCode == Actions[Actions.CREATE];
  }

  moveToAvailable() {
    console.log(this.assignedTxnTypesSelected);
    for (let i = 0; i < this.assignedTxnTypesSelected.length; i++) {
      var filtered = this.assignedTxnTypes.filter(x => x.TxnTypeId == this.assignedTxnTypesSelected[i])[0];
      if (filtered) {
        this.assignedTxnTypes = this.assignedTxnTypes.filter(x => x.TxnTypeId != this.assignedTxnTypesSelected[i]);
        this.availableTxnTypes.push(filtered);
      }
    }
    this.assignedTxnTypesSelected = [];
    this.availableTxnTypesSelected = [];
    this.actionCode == Actions[Actions.UPDATE];
  }

  moveAllToAssigned() {
    this.availableTxnTypes.forEach(ele => {
      this.assignedTxnTypes.push(ele);
    });
    this.availableTxnTypes = [];
    this.assignedTxnTypesSelected = [];
    this.availableTxnTypesSelected = [];
    this.actionCode == Actions[Actions.CREATE];
  }

  moveAllToAvailable() {
    this.assignedTxnTypes.forEach(ele => {
      this.availableTxnTypes.push(ele);
    });
    this.assignedTxnTypes = [];
    this.assignedTxnTypesSelected = [];
    this.availableTxnTypesSelected = [];
    this.actionCode == Actions[Actions.UPDATE];
  }

  insertTxnTypes() {
    if (!this.selectedRole) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select the role';
      return;
    }

    if (this.actionCode == Actions[Actions.CREATE] && this.assignedTxnTypes.length <= 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Assign atleast one Transaction Type';
      return;
    }
    let txnTypeId_CSV: string = this.assignedTxnTypes.map(({ TxnTypeId }) => TxnTypeId).join(',');
    console.log(txnTypeId_CSV);
    let manageTransactionTypesRequest: IManageTransactionTypesRequest = <IManageTransactionTypesRequest>{};
    manageTransactionTypesRequest.ActionCode = this.actionCode;
    manageTransactionTypesRequest.TxnTypeId_CSV = txnTypeId_CSV;
    manageTransactionTypesRequest.RoleId = parseInt(this.selectedRole);
    manageTransactionTypesRequest.UserName = this.sessionContextResponse.userName;
    manageTransactionTypesRequest.LoginId = this.sessionContextResponse.loginId;
    manageTransactionTypesRequest.UserId = this.sessionContextResponse.userId;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MANAGETRANSACTIONTYPES];
    userEvents.ActionName = this.actionCode;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.userManagementService.insertTransactionTypes(manageTransactionTypesRequest, userEvents).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgDesc = this.actionCode == Actions[Actions.CREATE] ? 'TxnType(s) has been assigned successfully' : 'TxnType(s) has been updated successfully';
        this.assignedCount = this.assignedTxnTypes.length;
        if (this.assignedTxnTypes.length > 0) {
          this.actionCode = Actions[Actions.UPDATE];
          this.submitButtonText = 'Update';
        }
        else {
          this.actionCode = Actions[Actions.CREATE];
          this.submitButtonText = 'Assign';
        }
        this.disableButton = !this.commonService.isAllowed(Features[Features.MANAGETRANSACTIONTYPES], this.actionCode, "");
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText;
    });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
