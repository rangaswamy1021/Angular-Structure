import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { WorkFlowService } from "./services/workflow.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { LookupTypeCodes, ActivitySource, Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IWorkFlowStages } from "./models/WorkFlowStages";
import { IPaging } from "../../shared/models/paging";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-manage-invoice-aging',
  templateUrl: './manage-invoice-aging.component.html',
  styleUrls: ['./manage-invoice-aging.component.scss']
})
export class ManageInvoiceAgingComponent implements OnInit {
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  feeTypes: any[];
  feesAppliedFor: any[];
  sessionContextResponse: IUserresponse;
  invoiceAgingForm: FormGroup;
  arrayStageData: any[];
  stageName: string;
  showPanel: boolean = false;
  lstWorkFlowStages: IWorkFlowStages[];
  workFlowStages: IWorkFlowStages = <IWorkFlowStages>{};
  lblButtonText: string = "ADD";
  stageID: number;
  stageDesc: string;
  isNextBtnVisible: boolean = true;
  msgAvailable: string = '';
  isDisabledAdd: boolean = false;
  isDisabledUpdate: boolean = false;
  isDisabledActivate: boolean = false;
  isDisabledDeActivate: boolean = false;
  index: number = 0;
  constructor(private commonService: CommonService, private materialscriptService: MaterialscriptService, private workFlowService: WorkFlowService, private route: ActivatedRoute, private sessionService: SessionService, private router: Router) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.arrayStageData = this.workFlowService.getAgingWorkFlowValues();
    if (this.arrayStageData != undefined && this.arrayStageData.length > 0) {
      let strsource = this.arrayStageData[0].Source;
      this.loadInvoiceForm('Add', null);
      this.bindDropDowns();
      this.bindData(this.arrayStageData[this.index].StageId, this.arrayStageData[this.index].StageName);
      if (this.arrayStageData.length == 1 && strsource == "Edit")
        this.isNextBtnVisible = false;
    }
    else {
      this.router.navigate(["sac/workflow/invoice-aging"]);
    }
    this.isDisabledAdd = !this.commonService.isAllowed(Features[Features.INVOICEAGING], Actions[Actions.CREATE], "");
    this.isDisabledUpdate = !this.commonService.isAllowed(Features[Features.INVOICEAGING], Actions[Actions.UPDATE], "");
    this.isDisabledActivate = !this.commonService.isAllowed(Features[Features.INVOICEAGING], Actions[Actions.ACTIVATE], "");
    this.isDisabledDeActivate = !this.commonService.isAllowed(Features[Features.INVOICEAGING], Actions[Actions.DEACTIVATE], "");
  }

  bindDropDowns() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICEAGING];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.workFlowService.GetWorkFlowFeeTypes(userEvents).subscribe(res => {
      this.feeTypes = res;
    });

    let objLockUpCode = <ICommonResponse>{};
    objLockUpCode.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.FeesAppliedfor].toString();
    this.commonService.getLookUpByParentLookupTypeCode(objLockUpCode).subscribe(res => {
      this.feesAppliedFor = res;
    });
  }

  loadInvoiceForm(Source: string, workFlowStages: IWorkFlowStages) {
    this.invoiceAgingForm = new FormGroup({
      'stageCode': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.StageStepCode), disabled: false }, [Validators.required]),
      'stageDesc': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.StepDesc), disabled: false }, [Validators.required]),
      'agingDays': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.AgingPeriodDays), disabled: false }, [Validators.required]),
      'feeType': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.FeeCode), disabled: false }, [Validators.required]),
      'feeAmount': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.Amount), disabled: false }, [Validators.required]),
      'gracePeriod': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.GracePeriodDays), disabled: false }, [Validators.required]),
      'thresholdAmount': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.ThresholdAmount), disabled: false }, [Validators.required]),
      'applicationFor': new FormControl({ value: (Source == "Add" ? '' : workFlowStages.AppliedFor), disabled: false }, )

    });
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  checkAvailabilityCheck(event) {
    if (this.lblButtonText == "ADD") {
      this.workFlowService.IsExistStageStepCode(event.target.value).subscribe(res => {
        if (!res)
          this.msgAvailable = "Not Available";
        else
          this.msgAvailable = "";
      });
    }
  }

  onEditClick(workFlowStages: IWorkFlowStages) {
    this.msgFlag = false;
    this.showPanel = true;
    this.workFlowStages = workFlowStages;
    this.invoiceAgingForm.reset();
    this.loadInvoiceForm("Edit", workFlowStages);
    this.invoiceAgingForm.controls["stageCode"].disable(true);
    this.lblButtonText = "Update";
  }

  onDeactivateClick(workFlowStages: IWorkFlowStages) {
    this.msgFlag = false;
    this.showPanel = true;
    this.workFlowStages = workFlowStages;
    this.invoiceAgingForm.reset();
    this.loadInvoiceForm("Edit", workFlowStages);
    //this.invoiceAgingForm.disable(true);
    this.lblButtonText = "Deactivate";
  }

  onActivateClick(workFlowStages: IWorkFlowStages) {
    this.msgFlag = false;
    this.showPanel = true;
    this.workFlowStages = workFlowStages;
    this.invoiceAgingForm.reset();
    this.loadInvoiceForm("Edit", workFlowStages);
    //this.invoiceAgingForm.disable(true);
    this.lblButtonText = "Activate";
  }

  showAddPanel() {
    this.msgFlag = false;
    this.loadInvoiceForm("Add", null);
    this.lblButtonText = "ADD";
    this.showPanel = true;
    this.invoiceAgingForm.reset();
    this.materialscriptService.material();
  }

  resetClick() {
    this.msgFlag = false;
    if (this.lblButtonText == "Update") {
      this.loadInvoiceForm("Edit", this.workFlowStages);
    }
    else
      this.loadInvoiceForm("Add", null);
  }

  cancelClick() {
    this.showPanel = false;
    this.loadInvoiceForm("Add", null);
    this.invoiceAgingForm.reset();
  }

  addConfigurationClick(confirm) {
    this.msgFlag = false;
    if (this.invoiceAgingForm.valid || this.invoiceAgingForm.disabled) {
      if (confirm == 1 && (this.lblButtonText == "Deactivate" || this.lblButtonText == "Activate")) {
        this.showMsg("alert", "Are you sure you want to Activate/Deactivate?");

        return;
      }
      else if (this.lblButtonText == "ADD") {
        this.workFlowService.IsExistStageStepCode(this.invoiceAgingForm.controls["stageCode"].value).subscribe(res => {
          if (!res) {
            this.showMsg("error", "Stage step code already exist");
            return;
          }
          else {
            this.doOperations();
          }
        });
      }
      else
        this.doOperations();
    }
    else
      this.validateAllFormFields(this.invoiceAgingForm);
  }

  doOperations() {
    let objWorkFlowStagesRequest = <IWorkFlowStages>{};
    objWorkFlowStagesRequest.LoginId = this.sessionContextResponse.loginId;
    objWorkFlowStagesRequest.UserId = this.sessionContextResponse.userId;
    objWorkFlowStagesRequest.StageId = this.stageID;
    objWorkFlowStagesRequest.StepDesc = this.invoiceAgingForm.controls["stageDesc"].value;
    objWorkFlowStagesRequest.AgingPeriodDays = this.invoiceAgingForm.controls["agingDays"].value;
    objWorkFlowStagesRequest.FeeAlias = this.invoiceAgingForm.controls["feeType"].value;
    objWorkFlowStagesRequest.Amount = this.invoiceAgingForm.controls["feeAmount"].value;
    objWorkFlowStagesRequest.StageStepFeeIsActive = true;
    objWorkFlowStagesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    objWorkFlowStagesRequest.PerformedBy = this.sessionContextResponse.userName;
    objWorkFlowStagesRequest.FeaturesCode = Features[Features.INVOICECONFIGURATIONS];
    objWorkFlowStagesRequest.StageStepCode = this.invoiceAgingForm.controls["stageCode"].value;
    objWorkFlowStagesRequest.ThresholdAmount = this.invoiceAgingForm.controls["thresholdAmount"].value;
    objWorkFlowStagesRequest.GracePeriodDays = this.invoiceAgingForm.controls["gracePeriod"].value;
    objWorkFlowStagesRequest.AppliedFor = this.invoiceAgingForm.controls["applicationFor"].value;
    let userEvents = <IUserEvents>{};
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.FeatureName = Features[Features.INVOICEAGING];
    if (this.lblButtonText == "ADD") {
      userEvents.ActionName = Actions[Actions.CREATE];
      this.workFlowService.CreateWorkFlowStageStepsAndFeesByStageID(objWorkFlowStagesRequest, userEvents).subscribe(res => {
        if (res) {
          this.showMsg("success", '"' + objWorkFlowStagesRequest.StepDesc + '" ' + "has been created successfully");
          this.showPanel = false;
          this.bindData(this.stageID, this.stageDesc);
        }
      },
        err => {
          this.showMsg("error", err.statusText);
        });
    }
    else if (this.lblButtonText == "Update") {
      userEvents.ActionName = Actions[Actions.UPDATE];
      objWorkFlowStagesRequest.StageStepId = this.workFlowStages.StageStepId;
      objWorkFlowStagesRequest.StageStepFeeId = this.workFlowStages.StageStepFeeId;
      this.workFlowService.UpdateWorkFlowStageStepsAndFeesByStageID(objWorkFlowStagesRequest, userEvents).subscribe(res => {
        if (res) {
          this.showMsg("success", '"' + objWorkFlowStagesRequest.StepDesc + '" ' + "has been updated successfully");
          this.showPanel = false;
          this.bindData(this.stageID, this.stageDesc);
        }
      },
        err => {
          this.showMsg("error", err.statusText);
        });
    }
    else {
      objWorkFlowStagesRequest.LoginId = this.sessionContextResponse.loginId;
      objWorkFlowStagesRequest.UserId = this.sessionContextResponse.userId;
      objWorkFlowStagesRequest.StageId = this.stageID;
      objWorkFlowStagesRequest.StageStepId = this.workFlowStages.StageStepId;
      objWorkFlowStagesRequest.StageStepFeeId = this.workFlowStages.StageStepFeeId;
      objWorkFlowStagesRequest.StageStepFeeIsActive = this.lblButtonText == "Deactivate" ? false : true;
      if (objWorkFlowStagesRequest.StageStepFeeIsActive)
        userEvents.ActionName = Actions[Actions.ACTIVATE];
      else
        userEvents.ActionName = Actions[Actions.DEACTIVATE];
      this.workFlowService.DeleteWorkFlowStageStepsAndFeesByStageID(objWorkFlowStagesRequest, userEvents).subscribe(res => {
        if (res) {
          this.showMsg("success", '"' + objWorkFlowStagesRequest.StepDesc + '" ' + "has been " + (objWorkFlowStagesRequest.StageStepFeeIsActive ? "activated" : "deactivated") + " successfully");
          this.showPanel = false;
          this.bindData(this.stageID, this.stageDesc);
        }
      },
        err => {
          this.showMsg("error", err.statusText);
        });
    }
  }

  validateAllFormFields(formGroup: FormGroup) { //{1}
    Object.keys(formGroup.controls).forEach(controlName => { //{2}
      const control = formGroup.get(controlName); //{3}
      if (control instanceof FormControl) { //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) { //{5}
        this.validateAllFormFields(control); //{6}
      }
    });
  }

  bindData(stageId: number, stageName: string) {
    this.stageID = stageId;
    let objWorkFlowStage = <IWorkFlowStages>{};
    objWorkFlowStage.StageId = stageId;
    objWorkFlowStage.StageStepId = 0;
    objWorkFlowStage.UserId = this.sessionContextResponse.userId;
    objWorkFlowStage.LoginId = this.sessionContextResponse.loginId;
    objWorkFlowStage.PerformedBy = this.sessionContextResponse.userName;
    objWorkFlowStage.ActivitySource = ActivitySource[ActivitySource.Internal];
    objWorkFlowStage.FeaturesCode = Features[Features.INVOICECONFIGURATIONS];
    objWorkFlowStage.ViewStatus = Actions[Actions.VIEW];

    objWorkFlowStage.Paging = <IPaging>{};
    objWorkFlowStage.Paging.SortColumn = "AGINGDAYS";
    objWorkFlowStage.Paging.PageNumber = 1;
    objWorkFlowStage.Paging.PageSize = 10;
    objWorkFlowStage.Paging.SortDir = 0;
    this.workFlowService.GetWorkFlowStagesStepsFeesByStageId(objWorkFlowStage).subscribe(res => {
      if (res) {
        this.lstWorkFlowStages = res;
      }
    });
    this.stageDesc = stageName;
    this.stageName = stageName.split('(')[0] + " Configuration";
    //this.arrayStageData.splice(0, 1);    
  }

  backClick() {
    this.index--;
    this.msgFlag = false;
    this.showPanel = false;
    this.invoiceAgingForm.reset();
    this.loadInvoiceForm('Add', null);
    if (this.arrayStageData != undefined && this.index >= 0) {
      this.bindData(this.arrayStageData[this.index].StageId, this.arrayStageData[this.index].StageName);
    }
    else {
      this.router.navigate(["sac/workflow/invoice-aging"]);
    }
  }

  nextClick() {
    this.index++;
    this.msgFlag = false;
    this.showPanel = false;
    this.invoiceAgingForm.reset();
    this.loadInvoiceForm('Add', null);
    if (this.arrayStageData != undefined && this.arrayStageData.length > this.index) {
      this.bindData(this.arrayStageData[this.index].StageId, this.arrayStageData[this.index].StageName);
    }
    else {
      this.router.navigate(["sac/workflow/invoice-aging"], { queryParams: { flag: 1 } });
    }
  }

  userAction(event) {
    if (event) {
      this.addConfigurationClick(0);
    }
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
