import { Component, OnInit, ViewChild } from '@angular/core';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { AgencySetupService } from "./services/agencysetup.service";
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { LookupTypeCodes, ActivitySource, Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { IPlazaRequest } from "./models/plazasrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-plaza-registration',
  templateUrl: './plaza-registration.component.html',
  styleUrls: ['./plaza-registration.component.scss']
})
export class PlazaRegistrationComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  agencys: any[];
  locations: any[];
  transactionTypes: any[];
  priceModes: any[];
  transactionFeeModes: any[];
  objPlazaUpdate = <IPlazaRequest>{};
  descCharLeft: number = 250;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  btnText: string = "Add";
  btnTextContinue: string = "Add And Continue";
  plazID: number;
  active: boolean;
  activer: boolean;
  constructor(private route: ActivatedRoute, private commonService: CommonService, private sessionService: SessionService, private router: Router, private agencySetupService: AgencySetupService, private materialscriptService: MaterialscriptService) { }

  plazaForm: FormGroup;
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.BindDropDowns();
    this.loadVioSearchForm();

    this.agencySetupService.GetTransactionTypes().subscribe(res => {
      this.transactionTypes = res;
      this.plazaForm.controls["transactionType"].setValue("1");
      this.route.queryParams.subscribe(param => {
        this.plazID = (Number)(param["plazaId"]);
        this.agencySetupService.GetPlazaById(this.plazID).subscribe(objPlaza => {
          if (objPlaza) {
            this.objPlazaUpdate = objPlaza;
            this.plazaForm.controls["agency"].setValue(this.objPlazaUpdate.AgencyCode);
            this.plazaForm.controls["location"].setValue(this.objPlazaUpdate.LocationCode);
            this.plazaForm.controls["plazaName"].setValue(this.objPlazaUpdate.PlazaName);
            this.plazaForm.controls["plazaCode"].setValue(this.objPlazaUpdate.PlazaCode);
            this.plazaForm.controls["ipAddress"].setValue(this.objPlazaUpdate.IPAddress);
            this.plazaForm.controls["description"].setValue(this.objPlazaUpdate.Description);
            this.plazaForm.controls["priceMode"].setValue(this.objPlazaUpdate.PriceMode);
            this.plazaForm.controls["transFeeMode"].setValue(this.objPlazaUpdate.TransactionFeeMode);
            this.plazaForm.controls["priceMode"].disable(true);
            this.plazaForm.controls["plazaCode"].disable(true);
            this.plazaForm.controls["active"].setValue(this.objPlazaUpdate.isOwned);
            this.plazaForm.controls["activer"].setValue(this.objPlazaUpdate.isNonRevenue);
            this.btnText = "Update";
            this.materialscriptService.material();
            this.btnTextContinue = "Update And Continue";
            let objTransactiontype = this.transactionTypes.filter(x => x.TransactionType == this.objPlazaUpdate.TransctionTypeInPlaza);
            if (objTransactiontype != undefined && objTransactiontype.length >= 1)
              this.plazaForm.controls["transactionType"].setValue(objTransactiontype[0].TransactionTypeId);
            else
              this.plazaForm.controls["transactionType"].setValue(1);
          }
        });
      });
    });
  }

  BindDropDowns() {
    this.agencySetupService.GetAgencies().subscribe(res => {
      this.agencys = res;
    });
    this.agencySetupService.GetLocations().subscribe(res => {
      this.locations = res;
    });

    this.agencySetupService.GetPriceModes().subscribe(res => {
      this.priceModes = res;
    });
    let objLockUpCode = <ICommonResponse>{};
    objLockUpCode.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.TransactionFeeMode].toString();
    this.commonService.getLookUpByParentLookupTypeCode(objLockUpCode).subscribe(res => {
      this.transactionFeeModes = res;
    });
  }

  loadVioSearchForm() {
    this.plazaForm = new FormGroup({
      'agency': new FormControl('', [Validators.required]),
      'location': new FormControl('', [Validators.required]),
      'plazaName': new FormControl('', [Validators.required]),
      'plazaCode': new FormControl('', [Validators.required]),
      'transactionType': new FormControl('', []),
      'ipAddress': new FormControl('', []),
      'description': new FormControl('', [Validators.required]),
      'priceMode': new FormControl('', [Validators.required]),
      'transFeeMode': new FormControl('', [Validators.required]),
      'active': new FormControl(''),
      'activer': new FormControl('')
    });
  }

  descriptionCharCount(txt: string): void {
    this.descCharLeft = 250 - txt.length;
  }

  resetClick() {
    if (this.btnText != "Update") {
      this.plazaForm.reset();
      this.plazaForm.controls["transactionType"].setValue("1");
      this.plazaForm.controls["agency"].setValue("");
      this.plazaForm.controls["location"].setValue("");
      this.plazaForm.controls["priceMode"].setValue("");
      this.plazaForm.controls["transFeeMode"].setValue("");
    }
    else {
      this.plazaForm.controls["agency"].setValue(this.objPlazaUpdate.AgencyCode);
      this.plazaForm.controls["location"].setValue(this.objPlazaUpdate.LocationCode);
      this.plazaForm.controls["plazaName"].setValue(this.objPlazaUpdate.PlazaName);
      this.plazaForm.controls["plazaCode"].setValue(this.objPlazaUpdate.PlazaCode);
      this.plazaForm.controls["transactionType"].setValue(this.transactionTypes.filter(x => x.TransactionType == this.objPlazaUpdate.TransctionTypeInPlaza)[0].TransactionTypeId);
      this.plazaForm.controls["ipAddress"].setValue(this.objPlazaUpdate.IPAddress);
      this.plazaForm.controls["description"].setValue(this.objPlazaUpdate.Description);
      this.plazaForm.controls["priceMode"].setValue(this.objPlazaUpdate.PriceMode);
      this.plazaForm.controls["transFeeMode"].setValue(this.objPlazaUpdate.TransactionFeeMode);
      this.plazaForm.controls["priceMode"].disable(true);
      this.plazaForm.controls["plazaCode"].disable(true);
      this.plazaForm.controls["active"].setValue(this.objPlazaUpdate.isOwned);
      this.plazaForm.controls["activer"].setValue(this.objPlazaUpdate.isNonRevenue);
      this.btnText = "Update";
      this.btnTextContinue = "Update And Continue";
      
    }
  }

  cancelClick() {
    this.router.navigate(["sac/agencysetup/manage-plazas"]);
  }

  checkActive(checked: boolean) {
    this.active = checked;
  }

  checkActive1(checked: boolean) {
    this.activer = checked;
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

  selectedLocation(event) {
    console.log(event)
  }

  Save(input) {
    if (this.plazaForm.valid) {
      if (this.btnText == "Add") {
        this.agencySetupService.IsPlazaCodeExists(this.plazaForm.controls["plazaCode"].value).subscribe(res => {
          if (res > 0) {
            this.showMsg("error", "Plaza Code already exists");
          }
          else {
            this.CraeateUpdatePlazas(input);
          }
        });
      }
      else {
        this.CraeateUpdatePlazas(input);
      }

    }
    else
      this.validateAllFormFields(this.plazaForm);
  }

  CraeateUpdatePlazas(input) {
    let objPlaza = <IPlazaRequest>{};
    objPlaza.LocationName = this.locations.filter(x => x.LocationCode == this.plazaForm.controls["location"].value)[0].LocationName;
    objPlaza.LocationCode = this.plazaForm.controls["location"].value;
    objPlaza.AgencyCode = this.plazaForm.controls["agency"].value;
    objPlaza.PlazaName = this.plazaForm.controls["plazaName"].value;
    objPlaza.PlazaCode = this.plazaForm.controls["plazaCode"].value;
    objPlaza.TransactionTypeInPlazas = this.transactionTypes.filter(x => x.TransactionTypeId == this.plazaForm.controls["transactionType"].value)[0].TransactionType;
    objPlaza.Description = this.plazaForm.controls["description"].value;
    objPlaza.IPAddress = this.plazaForm.controls["ipAddress"].value;
    objPlaza.PriceMode = this.plazaForm.controls["priceMode"].value;
    objPlaza.TransactionFeeMode = this.plazaForm.controls["transFeeMode"].value;
    objPlaza.isOwned = this.plazaForm.controls["active"].value;
    objPlaza.isNonRevenue = this.plazaForm.controls["activer"].value;
    objPlaza.ChartOfAccountID = 0;
    objPlaza.PerformedBy = this.sessionContextResponse.userName;
    objPlaza.UserId = this.sessionContextResponse.userId;
    objPlaza.LoginId = this.sessionContextResponse.loginId;
    objPlaza.ActivitySource = ActivitySource.Internal;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PLAZAS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    if (this.btnText == "Add") {
      let objlst: IPlazaRequest[] = [];
      objlst.push(objPlaza);
      userEvents.ActionName = Actions[Actions.CREATE];
      this.agencySetupService.CreatePlaza(objlst, userEvents).subscribe(res => {
        if (res > 0) {
          if (input == 0) {
            this.router.navigate(["sac/agencysetup/manage-plazas"], { queryParams: { flag: 1 } });
          }
          else {
            this.router.navigate(["sac/agencysetup/plaza-additional-info"], { queryParams: { plazaId: res, plazaCode: objPlaza.PlazaCode, source: this.btnText } });
          }
        }
      },
        err => {
          this.showMsg("error", err.statusText);
        });
    }
    else {
      objPlaza.PlazaId = this.plazID;
      userEvents.ActionName = Actions[Actions.UPDATE];
      this.agencySetupService.UpdatePlaza(objPlaza, userEvents).subscribe(res => {
        if (res) {
          if (input == 0) {
            this.router.navigate(["sac/agencysetup/manage-plazas"], { queryParams: { flag: 2 } });
          }
          else {
            this.router.navigate(["sac/agencysetup/plaza-additional-info"], { queryParams: { plazaId: objPlaza.PlazaId, plazaCode: objPlaza.PlazaCode, source: this.btnText } });
          }
        }
      });
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
