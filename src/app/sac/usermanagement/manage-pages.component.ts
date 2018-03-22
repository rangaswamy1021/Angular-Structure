import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { UserManagementService } from "./services/usermanagement.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from "@angular/router";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { SiteHirerachyResponse } from "./models/sitehirerachyreponse";
import { List } from 'linqts/dist/linq';
import { ISiteHierarchyRequest } from "./models/sitehierarchyrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-pages',
  templateUrl: './manage-pages.component.html',
  styleUrls: ['./manage-pages.component.scss']
})
export class ManagePagesComponent implements OnInit {
  isManage: boolean;
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  sessionContext: IUserresponse;
  roles = [];
  roleId: number = 0;
  siteId: number = 0;
  branches = [];
  //items: Array<any> = []//[{ value: String, label: String }];
  siteHirerachyResponse: SiteHirerachyResponse[]
  availablePages = [];
  assignedPages = [];
  selectedAssignedPages: any = [];
  selectedAvailabelPages: any = [];
  prevAssignedPages: string = "";
  assignorupdate: string = "Assign";
  assignedCount: number = 0;
  arraylist: string[] = []
  constructor(private commonService: CommonService, private userManageService: UserManagementService, private renderer: Renderer,
    private router: Router, private sessionService: SessionService, private materialscriptService: MaterialscriptService) { }



  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContext = this.sessionService.customerContext;
    if (this.sessionContext == null || this.sessionContext == undefined) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.getRoles();
    this.getSiteHirerachy();


  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  getRoles() {
    // Checking Previleges 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.WEBPAGES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.roleID);
    userEvents.UserName = this.sessionContext.userName;
    userEvents.LoginId = this.sessionContext.loginId;

    this.commonService.getRoles(this.setSystemActivities(), userEvents).subscribe(res => {
      this.roles = res;
    })

  }

  getSiteHirerachy() {
    this.userManageService.getSiteHirerachy(this.setSystemActivities()).subscribe(res => {
      this.siteHirerachyResponse = res;
      this.branches = this.siteHirerachyResponse.filter(x => x.ContainerType == "BRANCH").sort();
    });
  }

  setSystemActivities() {
    var systemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContext.userId;
    systemActivities.LoginId = this.sessionContext.loginId;
    systemActivities.User = this.sessionContext.userName;
    systemActivities.ActionCode = "VIEW";
    systemActivities.FeaturesCode = "WEBPAGES";
    systemActivities.IsViewed = false;
    systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    return systemActivities;
  }

  getPages() {
    this.availablePages = [];
    this.assignedPages = [];
    if (this.siteId > 0 && this.roleId > 0) {
      this.availablePages = this.getChilds(this.siteId);

      // var lstitems: Array<any> = []

      // this.availablePages.forEach(x => {
      //   lstitems.push(x.SiteDesc);
      //   //this.arraylist.push(x.SiteId.toString());
      // })
      // this.items = lstitems;
      // console.log(this.items);
      this.getWebpagesBySubsytem(this.siteId);
    }
    else if (this.roleId <= 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select the role';
      return;
    }

  }
  removeListItems(assignedPages) {
    if (assignedPages.length > 0) {
      assignedPages.forEach(x => {
        this.availablePages = this.availablePages.filter(y => y.SiteId != x.SiteId);
      })
    }
  }
  getChilds(siteId) {
    const lstParent = new List<SiteHirerachyResponse>(this.siteHirerachyResponse);
    var lstChild = lstParent.Where(x => x.ParentSiteId == siteId).ToList();
    for (var i = 0; i < lstParent.Count(); i++) {
      if (lstChild.Where(y => y.SiteId == lstParent.Skip(i).FirstOrDefault().SiteId).Count() > 0) {
        lstChild = this.mergeListCollections(lstChild.ToArray(), this.getChildLists(lstParent.Skip(i).FirstOrDefault().SiteId).ToArray())
      }
      if (lstChild.Where(y => y.SiteId == lstParent.Skip(i).FirstOrDefault().ParentSiteId).Count() > 0) {
        lstChild = this.mergeListCollections(lstChild.ToArray(), this.getChildLists(lstParent.Skip(i).FirstOrDefault().SiteId).ToArray())
      }
    }
    return lstChild.OrderBy(x => x.SiteDesc).Distinct().ToArray();
  }

  getWebpagesBySubsytem(siteId) {
    this.getSiteHiererchyByRoleId();
  }

  getSiteHiererchyByRoleId() {
    this.userManageService.getSiteHierarchybyRoleId(this.roleId).subscribe(res => {
      if (res != null) {
        const siteHierarchy = new List<SiteHirerachyResponse>(res);
        this.assignedPages = siteHierarchy.Where(x => x.SubsystemId == this.siteId).OrderBy(x => x.SiteDesc).ToArray();
        this.removeListItems(this.assignedPages);
        this.prevAssignedPages = "";
        this.assignedPages.forEach(x => {
          this.prevAssignedPages += x.SiteId + ',';
        })
      }
      this.assignorupdate = this.assignedPages.length > 0 ? "Update" : "Assign";
      if (this.assignedPages.length > 0)
        this.isManage = !this.commonService.isAllowed(Features[Features.WEBPAGES], Actions[Actions.UPDATE], "")
      else
        this.isManage = !this.commonService.isAllowed(Features[Features.WEBPAGES], Actions[Actions.CREATE], "")

      this.assignedCount = this.assignedPages.length;
      //this.prevAssignedPages = this.prevAssignedPages.substring(0, this.prevAssignedPages.length - 1);
    })
  }

  mergeListCollections(childList: any[], subChildList: any[]) {
    var items = [];
    for (var i = 0; i < childList.length; i++) {
      if (items.filter(x => x.SiteId == childList[i].SiteId).length < 1) {
        items.push(childList[i]);
      }
    }
    if (subChildList.length > 0) {
      for (var i = 0; i < subChildList.length; i++) {
        if (items.filter(x => x.SiteId == subChildList[i].SiteId).length < 1) {
          items.push(subChildList[i]);
        }
      }
    }
    return new List<SiteHirerachyResponse>(items).ToList();
  }

  getChildLists(siteId) {
    return new List<SiteHirerachyResponse>(this.siteHirerachyResponse).Where(x => x.ParentSiteId == siteId);
  }

  leftAssign() {

    this.selectedAvailabelPages.forEach(element => {
      if (!(this.assignedPages.filter(x => x.SiteId == element).length > 0)) {
        this.assignedPages.push(this.availablePages.filter(x => x.SiteId == element)[0]);
      }
      this.availablePages = this.availablePages.filter(x => x.SiteId != element);
      var obj = this.getChilds(element)
      if (obj.length > 0) {
        obj.forEach(x => {
          if (!(this.assignedPages.filter(y => y.SiteId == x.SiteId).length > 0)) {
            this.assignedPages.push(x);
          }
          this.availablePages = this.availablePages.filter(y => y.SiteId != x.SiteId);
        })
      }
    });
    this.selectedAssignedPages = [];
    this.selectedAvailabelPages = [];
    this.assignedPages = new List<SiteHirerachyResponse>(this.assignedPages).OrderBy(x => x.SiteDesc).ToArray();
  }
  rightAssign() {
    this.selectedAssignedPages.forEach(element => {
      if (!(this.availablePages.filter(x => x.SiteId == element).length > 0)) {
        this.availablePages.push(this.assignedPages.filter(x => x.SiteId == element)[0]);
      }
      this.assignedPages = this.assignedPages.filter(x => x.SiteId != element);
      var obj = this.getChilds(element)
      if (obj.length > 0) {
        obj.forEach(x => {
          if (!(this.availablePages.filter(y => y.SiteId == x.SiteId).length > 0)) {
            this.availablePages.push(x);
          }
          this.assignedPages = this.assignedPages.filter(y => y.SiteId != x.SiteId);
        })
      }
    });
    this.selectedAvailabelPages = [];
    this.selectedAssignedPages = [];
    this.availablePages = new List<SiteHirerachyResponse>(this.availablePages).OrderBy(x => x.SiteDesc).ToArray();
  }
  allLeftAssign() {
    this.availablePages.forEach(element => {
      this.assignedPages.push(this.availablePages.filter(x => x.SiteId == element.SiteId)[0]);
    });
    this.availablePages = [];
    this.selectedAvailabelPages = [];
    this.selectedAssignedPages = [];
    this.assignedPages = new List<SiteHirerachyResponse>(this.assignedPages).OrderBy(x => x.SiteDesc).ToArray();
  }

  allRightAssign() {
    this.assignedPages.forEach(element => {
      this.availablePages.push(this.assignedPages.filter(x => x.SiteId == element.SiteId)[0]);
    });
    this.assignedPages = [];
    this.selectedAvailabelPages = [];
    this.selectedAssignedPages = [];
    this.availablePages = new List<SiteHirerachyResponse>(this.availablePages).OrderBy(x => x.SiteDesc).ToArray();
  }


  updatePages() {
    if (this.roleId <= 0 || this.siteId <= 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select the role and subsystem';
      return;
    }
    if (this.assignedCount == 0 && this.assignedPages.length <= 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select and assign page(s) from the available pages ';
      return;
    }
    var siteHierarchyReq = <ISiteHierarchyRequest>{};
    siteHierarchyReq.ActionCode = this.assignorupdate.toUpperCase() == "UPDATE" ? this.assignorupdate.toUpperCase() : "CREATE";
    siteHierarchyReq.SiteIdCSV = "";
    this.assignedPages.forEach(x => {
      if (x.SiteId > 0)
        siteHierarchyReq.SiteIdCSV += x.SiteId + ',';
    })
    // if (this.prevAssignedPages.length > 0 && siteHierarchyReq.SiteIdCSV.length > 0) {
    if (this.prevAssignedPages == siteHierarchyReq.SiteIdCSV && this.availablePages.length == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'There is no avaliable pages to assign';
      return;
    }
    else if (this.prevAssignedPages == siteHierarchyReq.SiteIdCSV) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select and assign page(s) from the available pages';
      return;
    }
    // }

    siteHierarchyReq.IsAllowed = 0;
    siteHierarchyReq.IsDefault = false;
    siteHierarchyReq.UpdatedUser = this.sessionContext.userName;
    siteHierarchyReq.LoginId = this.sessionContext.loginId;
    siteHierarchyReq.UserId = this.sessionContext.userId;
    siteHierarchyReq.SiteId = this.siteId;

    // Checking Previleges 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.WEBPAGES];
    userEvents.ActionName = this.assignorupdate.toUpperCase() == "UPDATE" ? Actions[Actions.UPDATE] : Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.roleID);
    userEvents.UserName = this.sessionContext.userName;
    userEvents.LoginId = this.sessionContext.loginId;
    this.userManageService.CreateWebPages(this.roleId, siteHierarchyReq, userEvents).subscribe(res => {
      if (res) {
        if (this.assignorupdate.toUpperCase() == "UPDATE") {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = 'Page(s) updated successfully';
        } else {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = 'Page(s) assigned successfully';
        }
        this.assignorupdate = "Update";
        this.prevAssignedPages = siteHierarchyReq.SiteIdCSV;
        this.assignedCount = siteHierarchyReq.SiteIdCSV.split(',').length - 1;
        return;
      }
    },
      err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
        return;
      }
    )
  }
}


