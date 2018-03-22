import { Component, OnInit, Renderer } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { ActivitySource, Features, Actions } from '../../shared/constants';
import { IManageRolesResponse } from './models/rolesresponse';
import { IManageRolesRequest } from './models/rolesrequest';
import { UserManagementService } from './services/usermanagement.service';
import { IPrivilegesResponse, IPrivilegeWrapper, Action, IFeature } from './models/privilegesresponse';
import { List } from 'linqts';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-privileges',
  templateUrl: './manage-privileges.component.html',
  styleUrls: ['./manage-privileges.component.scss']
})
export class ManagePrivilegesComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  systemActivities: ISystemActivities;
  statusMessage: string;
  manageRolesResponse: IManageRolesResponse[];
  manageRolesRequest: IManageRolesRequest[];

  privilegeWrapper: IPrivilegeWrapper[];
  privilegeWrapperForReset: IPrivilegeWrapper[];

  selectedRoleID: number;
  checkAll: boolean = false;

  isUpdatePrivileges: boolean = false;
  contextSource: BehaviorSubject<IPrivilegeWrapper[]>;
  privilegeWrapperList: IPrivilegeWrapper[];
  currentContext: any;

  // errorBlock: boolean = false;
  // successBlock: boolean = false;

  // successMessage: string;
  // errorMessage: string;
  // errorHeading: string;
  // successHeading: string;

  userEvents: IUserEvents;
  isAddAllowed: boolean;
  isUpdateAllowed: boolean;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  constructor(private sessionService: SessionService, public renderer: Renderer,
    private router: Router
    , private commonService: CommonService, private userManagementService: UserManagementService, private materialscriptService: MaterialscriptService
  ) {

  }

  ngOnInit() {
     this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.contextSource = new BehaviorSubject<IPrivilegeWrapper[]>(this.privilegeWrapperList);
    this.currentContext = this.contextSource.asObservable();
    this.setUserActionObject();
    this.bindRoles();
    this.isAddAllowed = !this.commonService.isAllowed(Features[Features.PRIVILEGES], Actions[Actions.CREATE], "");
    this.isUpdateAllowed = !this.commonService.isAllowed(Features[Features.PRIVILEGES], Actions[Actions.UPDATE], "");
  }
  changeResponse(context: IPrivilegeWrapper[]) {
    this.contextSource.next(context)
  }
  bindRoles() {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;//11425
    this.systemActivities.UserId = this.sessionContextResponse.userId;//10000001
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivities.FeaturesCode = "PRIVILEGES";
    this.systemActivities.ActionCode = "VIEW";
    this.userManagementService.getAllRoles(this.systemActivities,this.userEvents).subscribe(res => {
      if (res) {
        this.manageRolesResponse = res;
      }
      else {
    
      }
    }
      , Error => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = 'Error while getting the roles detail.';
      });
  }

  bindRolesPrivileges(role) {
    this.selectedRoleID = role;
    //console.log("this.selectedRoleID" + this.selectedRoleID);
    this.getPrivilegsByRole();
    //  this.getPrivilegesbyRoleId();
  }



  getPrivilegsByRole() {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivities.FeaturesCode = "PRIVILEGES";
    this.systemActivities.ActionCode = "VIEW";
    this.systemActivities.User = this.selectedRoleID.toString();
    this.privilegeWrapper = [];
    this.userManagementService.getPrivilegesbyRole(this.systemActivities).subscribe(res => {
      if (res) {
        this.changeResponse(res);
        this.currentContext
          .subscribe(customerContext => {
            this.privilegeWrapper = this.privilegeWrapperForReset = customerContext;

            // //console.log(JSON.stringify(this.privilegeWrapper));
          }
          );
        this.checkAll = false;
        this.privilegeWrapper.forEach(elememt => {
          if (elememt.Features.IsAllActionAvailable) {
            this.checkAll = true;
          }
        });

        let temp = this.checkAll;
        if (!temp) { this.isUpdatePrivileges = false; }
        else { this.isUpdatePrivileges = true; }
      }

      else {

      }
    })
  }

  getCheckedValues(currentRowNo, featureID, actionID, checked) {
    this.privilegeWrapper.forEach(elememt => {
      if (elememt.Features.FeatureId == featureID) {
        elememt.Features.Actions.forEach(yy => {
          if (yy.ActionId == actionID)
            yy.IsActionAssigned = !checked;
          //console.log("checked" + yy.IsActionAssigned);
        });
        elememt.Features.Actions.forEach(yy => {
          if (yy.IsActionAssigned) {
            elememt.Features.IsAllActionAvailable = true;
          }
          else {
            elememt.Features.IsAllActionAvailable = false;
          }
        });
      }
    });
    this.changeResponse(this.privilegeWrapper);
    // ////console.log(JSON.stringify(this.privilegeWrapper));
  }
  createThePrivileges() {
    this.privilegeWrapper[0].ActionCode = Actions[Actions.CREATE];
    this.privilegeWrapper[0].LoginId = this.sessionContextResponse.loginId;
    this.privilegeWrapper[0].UserId = this.sessionContextResponse.userId;
    this.privilegeWrapper[0].User = this.sessionContextResponse.userName;;
    this.privilegeWrapper[0].RoleId = this.selectedRoleID;
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.CREATE];
    this.userManagementService.createPrivileges(this.privilegeWrapper,this.userEvents).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgDesc = 'Privileges assigned to the role.';
        this.getPrivilegsByRole()
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = 'error while creating privileges.';
      }
    })
  }

  updateThePrivileges() {
    this.privilegeWrapper[0].ActionCode = Actions[Actions.UPDATE];
    this.privilegeWrapper[0].LoginId = this.sessionContextResponse.loginId;
    this.privilegeWrapper[0].UserId = this.sessionContextResponse.userId;
    this.privilegeWrapper[0].User = this.sessionContextResponse.userName;;
    this.privilegeWrapper[0].RoleId = this.selectedRoleID;
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.UPDATE];
    this.userManagementService.createPrivileges(this.privilegeWrapper,this.userEvents).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgDesc = 'Privileges assigned to the role.';
        this.getPrivilegsByRole();
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = 'Error while updating privileges.';
      }
    })
  }
  resetThePrivileges() {
    this.getPrivilegsByRole();
  }
  getAllCheckedValues(currentRowNo, featureID, checked) {
    this.privilegeWrapper.forEach(elememt => {
      if (elememt.Features.FeatureId == featureID) {
        elememt.Features.IsAllActionAvailable = !checked;
        elememt.Features.Actions.forEach(yy => {
          yy.IsActionAssigned = !checked;
          //console.log("checked" + yy.IsActionAssigned);
        });
      }
    });

    this.changeResponse(this.privilegeWrapper);
    //console.log(JSON.stringify(this.privilegeWrapper));
  }

  checkedAllValues(checked) {
    this.checkAll = !checked;
    this.privilegeWrapper.forEach(elememt => {
      elememt.Features.IsAllActionAvailable = !checked;
      elememt.Features.Actions.forEach(yy => {
        yy.IsActionAssigned = !checked;
        //console.log("checked" + yy.IsActionAssigned);
      });
    });
  }
  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.PRIVILEGES];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.sessionContextResponse.userId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
