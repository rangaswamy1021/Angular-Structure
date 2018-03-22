import { Component, OnInit } from '@angular/core';
import { ICommonResponse } from "../../shared/models/commonresponse";
import { CommonService } from "../../shared/services/common.service";
import { IPaymentPlanConfigRequest } from "./models/paymentplanconfigrequest";
import { ConfigurationService } from "./services/configuration.service";
import { IPaymentPlanConfigResponse } from "./models/paymentplanconfigresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-payment-plan-configurations',
  templateUrl: './payment-plan-configurations.component.html',
  styleUrls: ['./payment-plan-configurations.component.scss']
})
export class PaymentPlanConfigurationsComponent implements OnInit {
  termSearchErrors: boolean = false;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isSearch: boolean = false;
  isUpdated: boolean = false;
  isCreate: boolean = false;
  dropDown: string;
  paymentPlan: IPaymentPlanConfigRequest;
  updateConfigData: IPaymentPlanConfigRequest;
  planId: number;
  isAdd: boolean = true;
  isUpdate: boolean = false;
  opName: string;
  termSearch: any;
  maxNoOfTerms = [];
  insertResponse: number;
  addResponse: boolean;
  sessionContextResponse: IUserresponse;
  addConfigData: IPaymentPlanConfigRequest;
  configForm: FormGroup;
  confDetailsResult: IPaymentPlanConfigResponse[];
  confDetails: IPaymentPlanConfigRequest;
  termResponse: ICommonResponse[];
  lookupType: ICommonResponse;
  addConfig: boolean;
  constructor(private commonService: CommonService, private configurationService: ConfigurationService,
    private sessionContext: SessionService, private router: Router, private materialscriptService: MaterialscriptService ) { }

  ngOnInit() {
          this.materialscriptService.material();
    this.termSearch = '';
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.configForm = new FormGroup({
      'termType': new FormControl('', [Validators.required]),
      'minAmount': new FormControl('', [Validators.required]),
      'maxAmount': new FormControl('', [Validators.required]),
      'noOfTerms': new FormControl('', [Validators.required])
    });
    this.getLookUpByParentLookupTypeCode();
    this.bindConfigurationDetailsGrid("VIEW");
    this.maxTerms();
    if (!this.commonService.isAllowed(Features[Features.PAYMENTPLANCONFIG], Actions[Actions.VIEW], "")) {
      //error page;

    }
    this.isCreate = !this.commonService.isAllowed(Features[Features.PAYMENTPLANCONFIG], Actions[Actions.CREATE], "");
    this.isUpdated = !this.commonService.isAllowed(Features[Features.PAYMENTPLANCONFIG], Actions[Actions.UPDATE], "");
    this.isSearch = !this.commonService.isAllowed(Features[Features.PAYMENTPLANCONFIG], Actions[Actions.SEARCH], "");
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  showAddConfig() {
      
    this.termSearchErrors=false;
    this.opName = "Add";
    this.addConfig = true;
    this.configForm.patchValue({
      termType: "",
      minAmount: "",
      maxAmount: "",
      noOfTerms: ""
    });
    this.configForm.controls['termType'].enable();
    this.configForm.controls['minAmount'].enable();
    this.configForm.controls['maxAmount'].enable();
    //this.configForm.reset();
    this.materialscriptService.material();
    
  }
  cancelConfig() {
    this.addConfig = false;
    this.configForm.patchValue({
      termType: "",
      minAmount: "",
      maxAmount: "",
      noOfTerms: ""
    });
    this.isAdd = true;
    this.isUpdate = false;
    this.configForm.reset();
  }
  maxTerms() {
    for (var i = 2; i <= 26; i++) {
      this.maxNoOfTerms.push(i);
    }
  }
  changeRange() {
    if (this.configForm.controls['termType'].value == "Monthly") {
      this.maxNoOfTerms = [];
      for (var i = 1; i <= 12; i++)
        this.maxNoOfTerms.push(i);
    }
    if (this.configForm.controls['termType'].value == "BiWeekly") {
      this.maxNoOfTerms = [];
      for (var i = 2; i <= 26; i++)
        this.maxNoOfTerms.push(i);
    }
  }
  searchByTerm() {
    if (this.termSearch == '') {
      this.termSearchErrors = true;
    }
    else {
      this.termSearchErrors = false;
      this.addConfig = false;
      this.bindConfigurationDetailsGrid("SEARCH");
    }
  }
  getLookUpByParentLookupTypeCode() {
    this.lookupType = <ICommonResponse>{};
    this.lookupType.LookUpTypeCode = "TermType";
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType).subscribe(
      res => {
        res = res.filter((c: ICommonResponse) => c.LookUpTypeCode !== 'OutofCountry');
        this.termResponse = res;

      }
    )
  }
  bindConfigurationDetailsGrid(keyWord: string) {
    this.confDetails = <IPaymentPlanConfigRequest>{};
    this.confDetails.PageNumber = 0;
    this.confDetails.PageSize = 0;
    this.confDetails.SortColumn = "";
    this.confDetails.SortDirection = 1;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENTPLANCONFIG];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    if (keyWord == "VIEW") {
      this.confDetails.TermType = "";//TermType
      userEvents.ActionName = Actions[Actions.VIEW];
    }
    else {
      this.confDetails.TermType = this.termSearch;
      userEvents.ActionName = Actions[Actions.SEARCH];
    }
    this.configurationService.getPaymentPlanMasterData(this.confDetails, userEvents).subscribe(res => {
      this.confDetailsResult = res;
      // console.log(this.confDetailsResult);

    })
  }
  addConfigDetails() {
    this.termSearchErrors = false;
    if (this.configForm.valid ) {
      this.addConfigData = <IPaymentPlanConfigRequest>{};
      this.addConfigData.TermType = this.configForm.controls['termType'].value;
      this.addConfigData.MinAmount = this.configForm.controls['minAmount'].value;
      this.addConfigData.MaxAmount = this.configForm.controls['maxAmount'].value;
      if (parseInt(this.configForm.controls['maxAmount'].value) >= parseInt(this.configForm.controls['minAmount'].value)) {
        this.addConfigData.MinAmount = this.configForm.controls['minAmount'].value;
        this.addConfigData.MaxAmount = this.configForm.controls['maxAmount'].value;
        this.addConfigData.MaxTerm = this.configForm.controls['noOfTerms'].value;
        this.addConfigData.Updateduser = this.sessionContextResponse.userName;
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.PAYMENTPLANCONFIG];
        userEvents.ActionName = Actions[Actions.CREATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.configurationService.isExistsPaymentPlan(this.addConfigData, userEvents).subscribe(res => {
          this.addResponse = res;
          console.log("addresponse" + this.addResponse);
          if (res) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = 'Configuration Already Exists';
          }
          else {
            this.configurationService.insertPaymentPlanMasterData(this.addConfigData).subscribe(result => {
              this.insertResponse = result;
              if (result) {
                this.msgFlag = true;
                this.msgType = 'success';
                this.msgTitle = '';
                this.msgDesc = 'Configuration added successfully';
                this.addConfig = false;
                this.bindConfigurationDetailsGrid("VIEW");
                this.reset();
                // this.configForm.controls['termType'].setValidators([]);
                // this.configForm.controls['minAmount'].setValidators([]);
                // this.configForm.controls['maxAmount'].setValidators([]);
                // this.configForm.controls['noOfTerms'].setValidators([]);
              }
            }, (err) => {
              this.msgFlag = true;
              this.msgType = 'error';
              this.msgTitle = '';
              this.msgDesc = err.statusText.toString();
            })
          }
        })
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Miniumum amount should be less than Maximum amount';
      }
    }
    else {
      this.validateAllFormFields(this.configForm);
    }
  }
  reset() {
    if (this.isUpdate) {
      this.termSearchErrors = false;
      this.populateEdit(this.paymentPlan);
    }
    else {
      this.termSearchErrors = false;
      this.configForm.reset();
      this.configForm.patchValue({
      termType: "",
      minAmount: "",
      maxAmount: "",
      noOfTerms: ""
    });
      // this.configForm.controls['termType'].setValue("");
      // this.configForm.controls['minAmount'].setValue("");
      // this.configForm.controls['maxAmount'].setValue("");
      // this.configForm.controls['noOfTerms'].setValue("");
    }
  }
  resetSearch() {
    this.termSearchErrors = false;
    this.termSearch = '';
    this.bindConfigurationDetailsGrid("VIEW");
  }
  onEditClick(editTermType: IPaymentPlanConfigRequest) {
 
    this.termSearchErrors = false;
    this.paymentPlan = editTermType;
    this.populateEdit(editTermType);
          this.materialscriptService.material();
  }
  populateEdit(editTermType) {
    this.opName = "Update";
    this.addConfig = true;
    this.isUpdate = true;
    this.isAdd = false;
    this.planId = editTermType.PaymentPlanID;
    this.configForm.controls['termType'].setValue(editTermType.TermType);
    this.configForm.controls['termType'].disable();
    if (this.configForm.controls['termType'].value == "Monthly") {
      this.maxNoOfTerms = [];
      for (var i = 1; i <= 12; i++)
        this.maxNoOfTerms.push(i);
    }
    if (this.configForm.controls['termType'].value == "BiWeekly") {
      this.maxNoOfTerms = [];
      for (var i = 2; i <= 26; i++)
        this.maxNoOfTerms.push(i);
    }
    this.configForm.controls['minAmount'].setValue(editTermType.MinAmount);
    this.configForm.controls['minAmount'].disable();
    this.configForm.controls['maxAmount'].setValue(editTermType.MaxAmount);
    this.configForm.controls['maxAmount'].disable();
    this.configForm.controls['noOfTerms'].setValue(editTermType.MaxTerm);
  }
  updateConfigDetails() {
    this.termSearchErrors = false;
    if(this.configForm.controls['noOfTerms'].value==''){
      this.validateAllFormFields(this.configForm);
    }
    else{
    this.updateConfigData = <IPaymentPlanConfigRequest>{};
    this.updateConfigData.PaymentPlanID = this.planId;
    if (this.configForm.controls['noOfTerms'].value) {
      this.updateConfigData.MaxTerm = this.configForm.controls['noOfTerms'].value;
    }
    else {
      this.updateConfigData.MaxTerm = this.configForm.controls['noOfTerms'].value;
    }
    this.updateConfigData.Updateduser = this.sessionContextResponse.userName;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENTPLANCONFIG];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.configurationService.updatePaymentPlanMasterData(this.updateConfigData, userEvents).subscribe(res => {
      if (res) {
        this.addConfig = false;
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgTitle = '';
        this.msgDesc = 'Configuration updated successfully';
        this.bindConfigurationDetailsGrid("VIEW");
        this.isAdd = true;
        this.isUpdate = false;
      }
    })
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
