import { Component, OnInit } from '@angular/core';
import { ICommonResponse, ICommon } from "../../shared/models/commonresponse";
import { CommonService } from './../../shared/services/common.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { AddressTypes, SubSystem, CorrespondenceActionType, Features, Actions, defaultCulture } from '../../shared/constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViolatordetailsService } from './services/violatordetails.service';
import { IAddressResponse } from '../../shared/models/addressresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { Data, Router } from '@angular/router';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { Location } from '@angular/common';
import { IAddressRequest } from '../../shared/models/addressrequest';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-create-correspondence',
  templateUrl: './create-correspondence.component.html',
  styleUrls: ['./create-correspondence.component.scss']
})
export class CreateCorrespondenceComponent implements OnInit {
  invalidDate: boolean = false;
  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };
  disableUpdatetbtn: boolean = false;
  successMessage: string;
  longViolatorId: number;
  correspondenceForm: FormGroup
  states: ICommonResponse[];
  showZip2: boolean;
  showIsValid: boolean;
  addressHistory: IAddressResponse[];
  address: IAddressRequest = <IAddressRequest>{};
  lstAddress: IAddressRequest[] = <IAddressRequest[]>[];
  violationTrasactions: any;
  common: ICommon = <ICommon>{};
  countries: IArray[];
  correspondenceTypes: IArray[];
  actionType: IArray[];
  addressTypes: IArray[];
  addressResponse: IAddressResponse;
  isDisabled: boolean = false;
  zipMinlength: number = 5;
  zipMaxlength: number = 5;
  defaultCountry: string;
  validateNumberPattern = "[0-9]*";
  isCorrespondenceType: boolean = false;
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";
  isAddressTypeDisabled: boolean = false;
  isAddButton: boolean = false;
  moment1: Date = new Date();
  tripIdCSV: string = '';
  redirectURL: string;
  violatorContextResponse: IViolatorContextResponse;
  sessionContextResponse: IUserresponse;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private commonService: CommonService,
    private materialscriptService: MaterialscriptService,
    private sessionContext: SessionService,
    private router: Router,
    private violatordetailsService: ViolatordetailsService,
    private tripContextService: TripsContextService,
    private violatorContext: ViolatorContextService,
    private _location: Location) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.correspondenceForm = new FormGroup({
      actionType: new FormControl('', Validators.required),
      correspondenceTypes: new FormControl('', Validators.required),
      addressType: new FormControl('', Validators.required),
      addressLine1: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      addressLine2: new FormControl('', [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      addressLine3: new FormControl('', [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      city: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      state: new FormControl('', Validators.required),
      zip1: new FormControl('', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)])),
      zip2: new FormControl('', Validators.compose([Validators.pattern(this.validateNumberPattern), Validators.maxLength(4)])),
      country: new FormControl('', Validators.required),
      isPreferred: new FormControl(''),
      effectedDate: new FormControl(''),
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longViolatorId = this.violatorContextResponse.accountId;
    }
    this.bindData();
    this.tripContextService.currentContext.subscribe(res => {
      if (res && res.referenceURL.length > 0) {
        // console.log(res.tripIDs.toString());
        this.tripIdCSV = res.tripIDs.toString();
        this.redirectURL = res.referenceURL;
      } else {
        // TODO: If no trips context
      }
    });
  }

  bindData() {

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CREATECORRESPONDENSE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.getCountries();
    this.getCorrespondenceActionType()
    this.getAddressTypes()
    this.getCorrespondenceTypes();
    this.bindDetailsByAddressType("DmvAddr", userEvents)
    this.getDefaultCountry();
    this.checkRolesandPrivileges();
  }



  checkRolesandPrivileges() {
    this.disableUpdatetbtn = !this.commonService.isAllowed(Features[Features.CREATECORRESPONDENSE], Actions[Actions.UPDATE], "");
  }

  countrySelected(country: string) {
    if (country == "IND") {
      this.showZip2 = false;
    }
    else {
      this.showZip2 = true;
    }
    this.getStateByCountry(country);
    this.changeZipValidations(country);
  }

  getStateByCountry(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common)
      .subscribe(res => {
        this.states = res;
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  getDefaultCountry() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.DefaultCountry).subscribe(res => {
      this.defaultCountry = res;
      this.correspondenceForm.controls["country"].setValue(this.defaultCountry);
      this.changeZipValidations(this.defaultCountry);
      this.getStateByCountry(this.defaultCountry);
    });
  }
  getCountries() {
    this.commonService.getCountries().subscribe(
      res => {
        this.countries = res;
      });
  }
  getCorrespondenceActionType() {
    this.commonService.getCorrespondenceActionType().subscribe(
      res => {
        this.actionType = res;
      });
  }
  getCorrespondenceTypes() {
    this.commonService.getCorrespondenceTypes().subscribe(
      res => {
        this.correspondenceTypes = res.filter(f => f.Key != "PRIVATECOLLECTIONS" && f.Key != "CRT" && f.Key != "COURT");
      });
  }

  getAddressTypes() {
    this.commonService.getAddressTypes().subscribe(res => { this.addressTypes = res; });
    this.correspondenceForm.patchValue({
      addressType: "DmvAddr",
    });
  }

  bindDetailsByAddressType(addressType, userEvents?: IUserEvents) {
    this.violatordetailsService.getDetailsByAddressType(this.longViolatorId, addressType, userEvents).subscribe(
      res => {
        if (addressType == "DmvAddr") {
          this.isDisabled = true;
          this.isAddButton = false;
        }
        else {
          this.isDisabled = false;

        }
        this.addressResponse = res
        if (res) {
          this.isAddButton = false;
          this.getStateByCountry(this.addressResponse.Country)
          this.correspondenceForm.patchValue({
            addressLine1: this.addressResponse.Line1,
            addressLine2: this.addressResponse.Line2,
            addressLine3: this.addressResponse.Line3,
            city: this.addressResponse.City,
            state: this.addressResponse.State,
            zip1: this.addressResponse.Zip1,
            zip2: this.addressResponse.Zip2,
            country: this.addressResponse.Country,
            isPreferred: this.addressResponse.IsPreferred
          });
          this.materialscriptService.material();
        }
        else {
          this.isAddButton = true;
          this.correspondenceForm.patchValue({
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: '',
            state: '',
            zip1: '',
            zip2: '',
            country: this.defaultCountry,
          });
          this.getDefaultCountry();
        }
      });
  }

  changeZipValidations(countryCode: string) {
    const ctrl = this.correspondenceForm.get('zip2');
    switch (countryCode) {
      case "USA":
        this.zipMinlength = 5;
        this.zipMaxlength = 5;
        if (!this.isDisabled) {
          ctrl.enable();
        }
        break;
      default:
        this.zipMinlength = 6;
        this.zipMaxlength = 6;
        if (!this.isDisabled)
          ctrl.disable();
        break;
    }

    this.correspondenceForm.controls["zip1"].setValidators([Validators.required, Validators.minLength(this.zipMinlength), Validators.maxLength(this.zipMaxlength), Validators.pattern(this.validateNumberPattern)]);
    this.correspondenceForm.controls["zip1"].updateValueAndValidity();
    //}
  }
  addressChange() {
    this.correspondenceForm.controls['addressType'].value;
    this.bindDetailsByAddressType(this.correspondenceForm.controls['addressType'].value)
    //this.EnableDisableProperties();
  }
  changeActionType() {
    this.bindDetailsByAddressType("DmvAddr")
    this.correspondenceForm.patchValue({
      addressType: "DmvAddr",
    });
    this.EnableDisableProperties();
  }
  EnableDisableProperties() {
    let actionTypes: string
    actionTypes = this.correspondenceForm.controls['actionType'].value;
    if (actionTypes == "AddressUpdate") {
      this.isCorrespondenceType = true;
      this.correspondenceForm.controls['correspondenceTypes'].clearValidators();
      this.correspondenceForm.controls['correspondenceTypes'].updateValueAndValidity();
      this.addRemoveValidations("Add");
      if (this.correspondenceForm.controls['addressType'].value == "DmvAddr") {
        this.isAddressTypeDisabled = false;
        this.isDisabled = true;
      }
      else {
        this.isAddressTypeDisabled = false;
        this.isDisabled = false;
      }
    }
    else if (actionTypes == "CorrespondenceOnly") {
      this.addRemoveValidations("Remove");

      this.correspondenceForm.controls['correspondenceTypes'].setValidators([Validators.compose([Validators.required])]);
      this.correspondenceForm.controls['correspondenceTypes'].updateValueAndValidity();
      this.isAddressTypeDisabled = true;
      this.isDisabled = true;
      this.isCorrespondenceType = false;
    }
    else {
      this.isCorrespondenceType = false;
      this.correspondenceForm.controls['correspondenceTypes'].setValidators([Validators.compose([Validators.required])]);
      this.correspondenceForm.controls['correspondenceTypes'].updateValueAndValidity();
      if (this.correspondenceForm.controls['addressType'].value == "DmvAddr") {
        this.isAddressTypeDisabled = false;
        this.isDisabled = true;
      }
      else {
        this.isAddressTypeDisabled = false;
        this.isDisabled = false;
      }
    }
  }

  addressAdd() {
    if (!this.correspondenceForm.valid) {
      this.validateAllFormFields(this.correspondenceForm);
      return;
    }
    this.violationTrasactions = <any>{};
    this.getaddressDetails();
    this.violationTrasactions.CitationCSV = this.tripIdCSV;
    this.violationTrasactions.objListAddress = this.lstAddress;
    this.violationTrasactions.ActionType = this.correspondenceForm.controls['actionType'].value;
    this.violationTrasactions.AddressFlag = "ADD";
    this.violationTrasactions.CustomerId = this.longViolatorId;
    this.violationTrasactions.UserName = this.sessionContext.customerContext.userName;
    this.violationTrasactions.TxnDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.violationTrasactions.Citation_Stage = this.correspondenceForm.controls['correspondenceTypes'].value;
    this.violationTrasactions.ICNId = this.sessionContext.customerContext.icnId;
    this.violationTrasactions.LoginId = this.sessionContext.customerContext.loginId;
    this.violationTrasactions.UserId = this.sessionContext.customerContext.userId;

    if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.AddressUpdate])
      this.successMessage = "Address has been Added ";
    else if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.CorrespondenceOnly])
      this.successMessage = "Correspondence has been Updated";
    else if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.Both])
      this.successMessage = "Address and Correspondence has been Updated";
    if (!this.invalidDate)
      this.violatordetailsService.correspondenceAndAddressUpdate(this.violationTrasactions).subscribe(
        res => {
          this.showSucsMsg(this.successMessage);
          return;
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        }
      );
  }

  getaddressDetails() {
    this.lstAddress = <IAddressRequest[]>[];
    this.address = <IAddressRequest>{};
    this.address.Type = this.correspondenceForm.controls['addressType'].value;
    this.address.Line1 = this.correspondenceForm.controls['addressLine1'].value;
    this.address.Line2 = this.correspondenceForm.controls['addressLine2'].value;
    this.address.Line3 = this.correspondenceForm.controls['addressLine3'].value;
    this.address.Country = this.correspondenceForm.controls['country'].value;
    this.address.State = this.correspondenceForm.controls['state'].value;
    this.address.City = this.correspondenceForm.controls['city'].value;
    this.address.Zip1 = this.correspondenceForm.controls['zip1'].value;
    this.address.Zip2 = this.correspondenceForm.controls['zip2'].value;
    this.address.IsPreferred = this.correspondenceForm.controls['isPreferred'].value;
    this.address.CustomerId = this.longViolatorId;
    this.address.UserName = this.sessionContext.customerContext.userName;
    this.address.LoginId = this.sessionContext.customerContext.loginId;
    this.address.UserId = this.sessionContext.customerContext.userId;
    this.address.IsActivityRequired = true;
    this.address.SubSystem = SubSystem[SubSystem.TVC];
    this.lstAddress.push(this.address);
  }

  updateDetails() {
    if (!this.correspondenceForm.valid) {
      this.validateAllFormFields(this.correspondenceForm);
      return;
    }

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CREATECORRESPONDENSE];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.getaddressDetails();
    this.violationTrasactions = <any>{};
    this.violationTrasactions.CitationCSV = this.tripIdCSV;
    this.violationTrasactions.ActionType = this.correspondenceForm.controls['actionType'].value;
    this.violationTrasactions.AddressFlag = "UPDATE";
    this.violationTrasactions.CustomerId = this.longViolatorId;
    this.violationTrasactions.UserName = this.sessionContext.customerContext.userName;
    this.violationTrasactions.TxnDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.violationTrasactions.Citation_Stage = this.correspondenceForm.controls['correspondenceTypes'].value;
    this.violationTrasactions.ICNId = this.sessionContext.customerContext.icnId;
    this.violationTrasactions.LoginId = this.sessionContext.customerContext.loginId;
    this.violationTrasactions.UserId = this.sessionContext.customerContext.userId;
    this.violationTrasactions.objListAddress = this.lstAddress;
    if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.AddressUpdate])
      this.successMessage = "Address";
    else if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.CorrespondenceOnly])
      this.successMessage = "Correspondence";
    else if (this.correspondenceForm.controls['actionType'].value == CorrespondenceActionType[CorrespondenceActionType.Both])
      this.successMessage = "Address and Correspondence";
    if (!this.invalidDate)
      this.violatordetailsService.correspondenceAndAddressUpdate(this.violationTrasactions, userEvents).subscribe(
        res => {
          this.showSucsMsg(this.successMessage + " has been Updated successfully");
          return;
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        }
      );
  }
  addRemoveValidations(value) {
    if (value == "Remove") {
      this.correspondenceForm.controls['addressType'].clearValidators();
      this.correspondenceForm.controls['addressType'].updateValueAndValidity();
      this.correspondenceForm.controls['addressLine1'].clearValidators();
      this.correspondenceForm.controls['addressLine1'].updateValueAndValidity();
      this.correspondenceForm.controls['city'].clearValidators();
      this.correspondenceForm.controls['city'].updateValueAndValidity();
      this.correspondenceForm.controls['state'].clearValidators();
      this.correspondenceForm.controls['state'].updateValueAndValidity();
      this.correspondenceForm.controls['zip1'].clearValidators();
      this.correspondenceForm.controls['zip1'].updateValueAndValidity();
      this.correspondenceForm.controls['country'].clearValidators();
      this.correspondenceForm.controls['country'].updateValueAndValidity();
    }
    else {
      this.correspondenceForm.controls['addressType'].setValidators([Validators.compose([Validators.required])]);
      this.correspondenceForm.controls['addressLine1'].setValidators([Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)])]);
      this.correspondenceForm.controls['addressLine2'].setValidators([Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)])]);
      this.correspondenceForm.controls['addressLine3'].setValidators([Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)])]);
      this.correspondenceForm.controls['city'].setValidators([Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])]);
      this.correspondenceForm.controls['state'].setValidators([Validators.compose([Validators.required])]);
      this.correspondenceForm.controls['country'].setValidators([Validators.compose([Validators.required])]);
      this.correspondenceForm.controls['zip1'].setValidators([Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)])]);
      this.correspondenceForm.controls['zip2'].setValidators([Validators.compose([Validators.pattern(this.validateNumberPattern), Validators.maxLength(4)])]);
    }
  }
  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  resetClick() {
    this.bindDetailsByAddressType("DmvAddr")
    this.getDefaultCountry();
    this.correspondenceForm.patchValue({
      addressType: "DmvAddr",
      actionType: "",
      correspondenceTypes: ""
    });

  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  backClick() {
    if (this.redirectURL !== '') {
      this.router.navigateByUrl(this.redirectURL);
    }
    else {
      let link = ['tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
    }
  }
  onDateChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}
export interface IArray {
  Key: string;
  Value: string;
}
