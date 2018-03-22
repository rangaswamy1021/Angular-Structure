import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { WorkFlowService } from "./services/workflow.service";
import { IWorkFlowStages } from "./models/WorkFlowStages";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-invoice-aging',
  templateUrl: './invoice-aging.component.html',
  styleUrls: ['./invoice-aging.component.scss']
})
export class InvoiceAgingComponent implements OnInit {
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse;
  workFlowStages: IWorkFlowStages[] = [];
  getFalseItems: IWorkFlowStages[];
  getTrueItems: IWorkFlowStages[];
  selectedAssignedStages: any;
  selectedAvailabelStages: any;
  isDisabledUpdate: boolean = false;
  constructor(private commonService: CommonService,private materialscriptService:MaterialscriptService, private workFlowService: WorkFlowService, private route: ActivatedRoute, private sessionService: SessionService, private router: Router) { }

  ngOnInit() {
     this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.bindDate(true);
    this.route.queryParams.subscribe(param => {
      if (param["flag"] == "1")
        this.showMsg("success", "Parameter value has been updated successfully");
    });
    this.isDisabledUpdate = !this.commonService.isAllowed(Features[Features.AGINGWORKFLOW], Actions[Actions.UPDATE], "");
  }

  bindDate(isFeatureAllowed: boolean) {
    let workFlowRequest = <IWorkFlowStages>{};
    workFlowRequest.UserId = this.sessionContextResponse.userId;
    workFlowRequest.LoginId = this.sessionContextResponse.loginId;
    workFlowRequest.PerformedBy = this.sessionContextResponse.userName;
    workFlowRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    workFlowRequest.FeaturesCode = isFeatureAllowed ? Features[Features.AGINGWORKFLOW] : "";

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGINGWORKFLOW];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.workFlowService.GetPlaza(workFlowRequest, userEvents).subscribe(res => {
      if (res) {
        this.workFlowStages = res;
        this.getFalseItems = this.workFlowStages.filter(x => x.StageIsActive == false);
        this.getTrueItems = this.workFlowStages.filter(x => x.StageIsActive == true);
      }

    });
  }

  leftAssign() {
    this.msgFlag = false;
    if (this.selectedAssignedStages != undefined && this.selectedAssignedStages != null && this.selectedAssignedStages.length > 0) {
      this.selectedAssignedStages.forEach(element => {
        if (!(this.getFalseItems.filter(x => x.StageId == element).length > 0)) {
          this.getFalseItems.push(this.getTrueItems.filter(x => x.StageId == element)[0]);
        }
        this.getTrueItems = this.getTrueItems.filter(x => x.StageId != element);
      });
      this.selectedAssignedStages = [];
      this.selectedAvailabelStages = [];
    }
    else {
      this.showMsg("error", "Select at minimum one assigned stage to move");
    }
  }

  rightAssign() {
    this.msgFlag = false;
    if (this.selectedAvailabelStages != undefined && this.selectedAvailabelStages != null && this.selectedAvailabelStages.length > 0) {
      this.selectedAvailabelStages.forEach(element => {
        if (!(this.getTrueItems.filter(x => x.StageId == element).length > 0)) {
          this.getTrueItems.push(this.getFalseItems.filter(x => x.StageId == element)[0]);
        }
        this.getFalseItems = this.getFalseItems.filter(x => x.StageId != element);
      });
      this.selectedAssignedStages = [];
      this.selectedAvailabelStages = [];
    }
    else {
      this.showMsg("error", "Select at minimum one assigned stage to move");
    }
  }

  allLeftAssign() {
    this.msgFlag = false;
    this.getTrueItems.forEach(element => {
      this.getFalseItems.push(this.getTrueItems.filter(x => x.StageId == element.StageId)[0]);
    });
    this.getTrueItems = [];
    this.selectedAssignedStages = [];
    this.selectedAvailabelStages = [];
  }

  allRightAssign() {
    this.msgFlag = false;
    this.getFalseItems.forEach(element => {
      this.getTrueItems.push(this.getFalseItems.filter(x => x.StageId == element.StageId)[0]);
    });
    this.getFalseItems = [];
    this.selectedAssignedStages = [];
    this.selectedAvailabelStages = [];
  }

  upClick() {
    if (this.getTrueItems != undefined && this.getTrueItems != null && this.getTrueItems.length > 0) {
      if (this.selectedAssignedStages != undefined && this.selectedAssignedStages != null && this.selectedAssignedStages.length > 0) {
        if (this.getTrueItems.length > 0) {
          for (let i = 0; i < this.getTrueItems.length; i++) {

            if (this.selectedAssignedStages.filter(x => x == this.getTrueItems[i].StageId).length > 0)//identify the selected item
            {
              //swap with the top item(move up)
              if (i > 0 && !(this.selectedAssignedStages.filter(x => x == this.getTrueItems[i - 1].StageId).length > 0)) {
                let bottom = this.getTrueItems[i];
                this.getTrueItems.splice(i, 1);
                this.getTrueItems.splice(i - 1, 0, bottom);
              }
            }
          }
        }
      }
    }
    else {
      this.showMsg("error", "No stages to move up");
    }
  }

  downClick() {
    if (this.getTrueItems != undefined && this.getTrueItems != null && this.getTrueItems.length > 0) {
      if (this.selectedAssignedStages != undefined && this.selectedAssignedStages != null && this.selectedAssignedStages.length > 0) {
        if (this.getTrueItems.length > 0) {
          let intStartIndex = this.getTrueItems.length - 1;
          for (let i = intStartIndex; i > -1; i--) {

            if (this.selectedAssignedStages.filter(x => x == this.getTrueItems[i].StageId).length > 0)//identify the selected item
            {
              //swap with the lower item(move down)
              if (i < intStartIndex && !(this.selectedAssignedStages.filter(x => x == this.getTrueItems[i + 1].StageId).length > 0)) {
                let bottom = this.getTrueItems[i];
                this.getTrueItems.splice(i, 1);
                this.getTrueItems.splice(i + 1, 0, bottom);
              }
            }
          }
        }
      }
    }
    else {
      this.showMsg("error", "No stages to move up");
    }
  }

  saveandConfigure(val) {
    if (this.getTrueItems == undefined || this.getTrueItems.length == 0) {
      if (val == 1) {
        this.showMsg("error", "Assign atleast one available stage");
        return;
      }
      else {
        this.showMsg("error", "Assigned stages are not selected");
        return;
      }
    }
    let objWorkFlowStages = <IWorkFlowStages>{};
    objWorkFlowStages.WorkFlowStageName = '';
    objWorkFlowStages.WorkFlowStageOrder = '';
    for (let i = 0; i < this.getTrueItems.length; i++) {
      objWorkFlowStages.WorkFlowStageName += this.getTrueItems[i].StageName.split('(')[0] + ",";
      objWorkFlowStages.WorkFlowStageOrder += i + 1 + ",";
      objWorkFlowStages.StageIsActive = true;
    }
    objWorkFlowStages.LoginId = this.sessionContextResponse.loginId;
    objWorkFlowStages.UserId = this.sessionContextResponse.userId;
    objWorkFlowStages.PerformedBy = this.sessionContextResponse.userName;
    objWorkFlowStages.FeaturesCode = Features[Features.AGINGWORKFLOW];
    objWorkFlowStages.ActivitySource = ActivitySource[ActivitySource.Internal];
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGINGWORKFLOW];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.workFlowService.UpdateWorkFlowStages(objWorkFlowStages, userEvents).subscribe(res => {
      if (res) {
        if (val == 1) {
          this.showMsg("success", "Parameter value has been updated successfully");
        } else {
          let arrayData = [];
          for (let i = 0; i < this.getTrueItems.length; i++) {
            let inputStages = { StageName: '', StageId: '', Source: 'Configure' };
            inputStages.StageName = this.getTrueItems[i].StageName.split('(')[0];
            inputStages.StageId = this.getTrueItems[i].StageId.toString();
            arrayData.push(inputStages);
          }
          this.workFlowService.setAgingWorkFlowValues(arrayData);
          this.router.navigate(["sac/workflow/manage-invoice-aging"]);
        }
      }
    });
  }

  editConfiguration(stageName: string, stageId: number) {
    this.materialscriptService.material();
    let arrayData = [];
    let inputStages = { StageName: stageName, StageId: stageId, Source: 'Edit' };
    arrayData.push(inputStages);
    this.workFlowService.setAgingWorkFlowValues(arrayData);
    this.router.navigate(["sac/workflow/manage-invoice-aging"]);
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }
}
