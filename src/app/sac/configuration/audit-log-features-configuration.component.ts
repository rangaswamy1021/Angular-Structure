import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from "@angular/forms";
import { UserManagementService } from "../usermanagement/services/usermanagement.service";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from "@angular/router";
import { SiteHirerachyResponse } from "../usermanagement/models/sitehirerachyreponse";
import { IPrivilegeWrapper, IPrivilegesResponse } from "../usermanagement/models/privilegesresponse";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ConfigurationService } from "./services/configuration.service";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";

@Component({
  selector: 'app-audit-log-features-configuration',
  templateUrl: './audit-log-features-configuration.component.html',
  styleUrls: ['./audit-log-features-configuration.component.scss']
})
export class AuditLogFeaturesConfigurationComponent implements OnInit {
  disableUpdateButton: boolean;
  userEvents: IUserEvents;
  featureListsLength: number;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  // privileges: Array<any> = [];
  privileges: IPrivilegesResponse[] = [];
  privilegeWrapperList: IPrivilegeWrapper[];
  auditLevelValue: any;
  userRole: any;
  selectedValue: any;
  auditLevel: any;
  subSystemValue: string;
  selectedAll: boolean = false;
  featureLists: Array<any> = [];
  checkAll: boolean;
  currentContext: any;
  privilegeWrapperForReset: any;
  privilegeWrapper: any[];
  branches: any[];
  siteHirerachyResponse: SiteHirerachyResponse[];
  sessionContext: IUserresponse;
  searchByAccessLevels: FormGroup;
  accessLevels: {
    key: number;
    value: string;
  }[];
  contextSource: BehaviorSubject<IPrivilegeWrapper[]>;

  constructor(private commonService: CommonService, private userManageService: UserManagementService, private sessionService: SessionService, private router: Router, private confService: ConfigurationService) { }

  ngOnInit() {
    this.subSystemValue = "All";
    this.auditLevel = 'User';
    this.contextSource = new BehaviorSubject<IPrivilegeWrapper[]>(this.privilegeWrapperList);
    this.currentContext = this.contextSource.asObservable();
    this.sessionContext = this.sessionService.customerContext;
    if (this.sessionContext == null || this.sessionContext == undefined) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.accessLevels = [
      {
        key: 0,
        value: 'User'
      },
      {
        key: 1,
        value: 'System'
      }
    ];
    this.searchByAccessLevels = new FormGroup({
      'searchByRadio': new FormControl(''),
      'subSystem': new FormControl('')
    });
    this.setUserActionObject();
    this.getSiteHirerachy();
    this.getAuditFeatures(this.auditLevel, this.subSystemValue);
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.AuditLog], Actions[Actions.UPDATE], "");

  }

  onSelectionAccessLevel(level) {
    this.auditLevel = level.value;
    this.getAuditFeatures(this.auditLevel, this.subSystemValue);
  }

  checkIfAllTransSelected(item) {
    this.selectedAll = this.featureLists.every(function (item: any) {
      return item.IsAllowAudit == true;
    });
    if (this.privileges.filter(x => x.FeatureName == item.FeatureName)[0] != undefined && this.privileges.filter(x => x.FeatureName == item.FeatureName)[0] != null) {
      this.privileges.filter(x => x.FeatureId == item.FeatureId)[0].IsAllowAudit = item.IsAllowAudit;
      this.privileges.filter(x => x.FeatureId == item.FeatureId)[0].FeatureId = item.FeatureId;
    }
  }

  selectAllTransActivity() {
    for (var i = 0; i < this.privileges.length; i++) {
      this.featureLists[i].IsAllowAudit = this.selectedAll;
    }
  }

  getSiteHirerachy() {
    let systemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContext.userId;
    systemActivities.LoginId = this.sessionContext.loginId;
    systemActivities.User = this.sessionContext.userName;
    systemActivities.ActionCode = "VIEW";
    systemActivities.FeaturesCode = "WEBPAGES";
    systemActivities.IsViewed = false;
    systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AuditLog];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.roleID);
    userEvents.UserName = this.sessionContext.userName;
    userEvents.LoginId = this.sessionContext.loginId;

    this.userManageService.getSiteHirerachy(systemActivities, userEvents).subscribe(res => {
      this.siteHirerachyResponse = res;
      this.branches = this.siteHirerachyResponse.filter(x => x.ContainerType == "BRANCH").sort();
    });
  }

  getAuditFeatures(auditLevel, subSystemValue) {
    this.setUserActionObject();
    let systemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContext.userId;
    systemActivities.LoginId = this.sessionContext.loginId;
    systemActivities.User = this.sessionContext.userName;
    systemActivities.ActionCode = "VIEW";
    systemActivities.FeaturesCode = "AuditLog";
    systemActivities.IsViewed = false;
    let objData = {
      subsystem: subSystemValue,
      auditLevel: auditLevel
    };
    this.confService.getAuditFeatures(objData, this.userEvents).subscribe(res => {
      this.featureLists = res;
      this.privileges = res;
      if (this.privileges) {
        this.privileges.forEach(x => { x.CreatedUser = "tpsuperuser" });
      }
      this.selectedAll = true;
      this.featureLists.forEach(element => {
        if( !element.IsAllowAudit)
          {
            this.selectedAll = false;
            return;
          }
      });
    })
  }

  changeSubSystem(event) {
    this.subSystemValue = event.target.value;
    this.getAuditFeatures(this.auditLevel, this.subSystemValue);
  }

  updateAuditLog() {
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.UPDATE];
    this.confService.updateFeaturesList(this.privileges, this.userEvents).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgTitle = ''
        this.msgDesc = "Success!"
      } else {
        this.msgFlag = false;
        this.msgType = 'error'
        this.msgTitle = ''
        this.msgDesc = "error!"
      }
    });
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.AuditLog];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.sessionContext.userId;
    this.userEvents.RoleId = parseInt(this.sessionContext.roleID);
    this.userEvents.UserName = this.sessionContext.userName;
    this.userEvents.LoginId = this.sessionContext.loginId;
  }

  resetAuditLog() {
    this.getAuditFeatures(this.auditLevel, this.subSystemValue);
    this.selectedAll = false;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

