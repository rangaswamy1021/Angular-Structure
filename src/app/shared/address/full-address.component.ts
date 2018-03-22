import { CustomerDetailsService } from './../../csc/customerdetails/services/customerdetails.service';
import { Router } from '@angular/router';
import { Actions } from './../constants';
import { SessionService } from './../services/session.service';
import { ICommonResponse } from './../../shared/models/commonresponse';
import { IaddAddressInputs } from './../../shared/address/add-address.component';
import { IAddressRequest } from './../../shared/models/addressrequest';
import { ICommon } from './../../tags/models/tagshipmentaddressresponse';
import { CommonService } from './../../shared/services/common.service';
import { element } from 'protractor';
import { IActivityResponse } from './../../shared/models/activitiesresponse';
import { IAddressResponse } from './../../shared/models/addressresponse';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { IPaging } from "../../shared/models/paging";
import { ICustomerContextResponse } from "../models/customercontextresponse";
import { CustomerContextService } from "../services/customer.context.service";
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IUserresponse } from "../models/userresponse";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { Features } from "../constants";
import { IUserEvents } from "../models/userevents";
import { MaterialscriptService } from "../materialscript.service";

declare var $: any;
@Component({
  selector: 'app-full-address',
  templateUrl: './full-address.component.html',
  styleUrls: ['./full-address.component.scss']
})
export class FullAddressComponent implements OnInit {
  isBusiness: any;
  profileResponse: any;
  disabledeletebtn: boolean = false;
  disableHistorybtn: boolean = false;
  disableButton: boolean;
  editClicked: boolean;

  userEvents = <IUserEvents>{};
  @Output() AddressblockListArray: EventEmitter<IBlocklistresponse[]> = new EventEmitter<IBlocklistresponse[]>();
  @Input() AddressblockListStatus;

  addressFormToggle: Boolean = false;
  historyToggle: Boolean = false;
  addressForm: FormGroup;
  phoneForm: FormGroup;
  title: string;
  formType: string;
  paging: IPaging;
  accountId: number;
  countries = [];
  common: ICommon = <ICommon>{};
  buttonType: string = "Update";
  addressResponse: IAddressResponse[];
  preferredAddress: IAddressResponse;
  states: ICommonResponse[];
  showZip2: boolean;
  showIsValid: boolean;
  addressHistory: IAddressResponse[];
  addAddress: IAddressRequest = <IAddressRequest>{};
  addressArray: IAddressRequest[] = <IAddressRequest[]>[];
  UserInputs: IaddAddressInputs = <IaddAddressInputs>{};
  addressHistoryReqObj: IAddressRequest = <IAddressRequest>{};
  zipMinlength: number = 5;
  zipMaxlength: number = 5;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;

  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  blockListAddressDetails: IBlocklistresponse[] = [];

  validateNumberPattern = "[0-9]*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";


  validateExceptAnglePattern = "[^<>]*";

  addressTypes = {
    Primary: "",
    Billing: "",
    Business: "",
    Home: "",
    Mailing: "",
    Other: "",
    Shipping: "",
    Secondary: "",
  };


  constructor(private commonService: CommonService, private customerContext: CustomerContextService, private router: Router, private sessionContext: SessionService, private customerDetailsService: CustomerDetailsService, private materialscriptService:MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
     this.addressForm = new FormGroup({
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
      isValid: new FormControl('')
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      , (err) => {
        this.showErrorMsg(err.statusText.toString());
      }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.accountId = this.customerContextResponse.AccountId;

      this.userEvents.FeatureName = Features[Features.CONTACTINFORMATION];
      this.userEvents.ActionName = Actions[Actions.VIEW];
      this.userEvents.PageName = this.router.url;
      this.userEvents.CustomerId = this.accountId;
      this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      this.userEvents.UserName = this.sessionContextResponse.userName;
      this.userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getAllAddresses(this.userEvents);
      this.checkRolesandPrivileges();
      this.getAccountHolderInfo();
    }

  }


  checkRolesandPrivileges() {
    this.disableHistorybtn = !this.commonService.isAllowed(Features[Features.ADDRESS], Actions[Actions.HISTORY], "");
    this.disabledeletebtn = !this.commonService.isAllowed(Features[Features.ADDRESS], Actions[Actions.DELETE], "");

  }


  editDetails(infoType, functionType) {
    this.getCountries();
    this.addressFormToggle = true;
    this.title = functionType + ' ' + infoType;
    this.formType = infoType;
    $('#addressEdit').modal('show');
    this.addressFormGenerate(functionType);
    if (functionType == "Add") {
      this.disableButton = !this.commonService.isAllowed(Features[Features.ADDRESS],
        Actions[Actions.CREATE], "");
      this.buttonType = functionType;
      this.showIsValid = false;
      this.editClicked = false;
      this.addressForm.reset();
    }
    else {
      this.buttonType = "Update";
      this.disableButton = !this.commonService.isAllowed(Features[Features.ADDRESS],
        Actions[Actions.UPDATE], "");
      this.showIsValid = true;
      this.editClicked = true;

    }
    if (this.preferredAddress.Country == "IND") {
      this.showZip2 = false;
    }
    else {
      this.showZip2 = true;
    }
     this.materialscriptService.material();
  }




  addressFormGenerate(functionType) {
   
    if (functionType == "Add") {
      this.buttonType = functionType;
      this.showIsValid = false;
      this.getDefaultCountry();
    }
    else {
      this.buttonType = "Update";
      this.showIsValid = true;
      this.addressForm.patchValue({
        addressType: this.preferredAddress.Type,
        addressLine1: this.preferredAddress.Line1,
        addressLine2: this.preferredAddress.Line2,
        addressLine3: this.preferredAddress.Line3,
        city: this.preferredAddress.City,
        state: this.preferredAddress.State,
        zip1: this.preferredAddress.Zip1,
        zip2: this.preferredAddress.Zip2,
        country: this.preferredAddress.Country,
        isPreferred: this.preferredAddress.IsPreferred,
        isValid: this.preferredAddress.IsValid,
      })
      this.changeZipValidations(this.preferredAddress.Country);
      this.getStateByCountry(this.preferredAddress.Country);
    }
  }

  selectAddressType() {
    let value = this.addressForm.value['addressType'];
    this.showIsValid = this.addressTypes[value].IsPreferred;
    this.addressForm.patchValue({
      addressLine1: this.addressTypes[value].Line1,
      addressLine2: this.addressTypes[value].Line2,
      addressLine3: this.addressTypes[value].Line3,
      city: this.addressTypes[value].City,
      state: this.addressTypes[value].State || '',
      zip1: this.addressTypes[value].Zip1,
      zip2: this.addressTypes[value].Zip2,
      country: this.addressTypes[value].Country || '',
      isPreferred: this.addressTypes[value].IsPreferred,
      isValid: this.addressTypes[value]['IsValid']
    });
    if (this.addressTypes[value]) {
      this.buttonType = "Update";
    }
    else {
      this.buttonType = "Add";
      this.getDefaultCountry();
    }

  }


  // get default country and bind states
  getDefaultCountry() {
    var defaultCountry: string;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.DefaultCountry).subscribe(res => {
      defaultCountry = res;
      this.addressForm.controls["country"].setValue(defaultCountry);
      this.getStateByCountry(defaultCountry);
      this.changeZipValidations(defaultCountry);
    });
  }


  //call this function when block list ok click event.
  ngOnChanges(): void {
    if (this.AddressblockListStatus) {
      this.changeAddress(this.buttonType, false);
    }
  }


  //submit button
  changeAddress(type, isBlockListCheck) {
    if (this.addressForm.valid) {
      this.addAddress.Type = this.addressForm.value.addressType;
      this.addAddress.Line1 = this.addressForm.value.addressLine1;
      this.addAddress.Line2 = this.addressForm.value.addressLine2 === null ? '' : this.addressForm.value.addressLine2;
      this.addAddress.Line3 = this.addressForm.value.addressLine3 === null ? '' : this.addressForm.value.addressLine3;;
      this.addAddress.City = this.addressForm.value.city;
      this.addAddress.State = this.addressForm.value.state;
      this.addAddress.Country = this.addressForm.value.country;
      this.addAddress.Zip1 = this.addressForm.value.zip1;
      this.addAddress.Zip2 = this.addressForm.value.zip2 === null ? '' : this.addressForm.value.zip2;
      this.addAddress.IsPreferred = this.addressForm.value.isPreferred;
      this.addAddress.UserName = this.UserInputs.userName;
      this.addAddress.UserId = this.UserInputs.userId;
      this.addAddress.LoginId = this.UserInputs.loginId;
      this.addAddress.CustomerId = this.accountId;
      this.addAddress.CheckBlockList = isBlockListCheck;
      if (type == 'Add') {
        this.addAddress.IsInvalidAddress = true;
        this.userEvents.FeatureName = Features[Features.ADDRESS];
        this.userEvents.ActionName = Actions[Actions.CREATE];
        this.commonService.createAddress(this.addAddress, this.userEvents).subscribe(res => {
          if (res) {
            this.getAllAddresses();
            this.addressForm.reset();
            this.addressFormToggle = false;
            $('#addressEdit').modal('hide');
            this.showSucsMsg("Address has been added");
          }
        }, (err) => {
          if (err.error) {
            this.blockListAddressDetails = err.error;
            this.AddressblockListArray.emit(this.blockListAddressDetails);
          }
          else {
            this.showErrorMsg(err.statusText.toString());
          }
        }, () => {
        });
      }
      else {
        this.addAddress.IsInvalidAddress = this.addressForm.value.isValid;
        this.userEvents.FeatureName = Features[Features.ADDRESS];
        this.userEvents.ActionName = Actions[Actions.UPDATE];
        this.commonService.updateAddress(this.addAddress, this.userEvents).subscribe(res => {
          if (res) {
            this.getAllAddresses();
            this.addressForm.reset();
            this.addressFormToggle = false;
            $('#addressEdit').modal('hide');
            this.showSucsMsg("Address has been updated");
          }
        }, (err) => {
          if (err.error) {
            this.blockListAddressDetails = err.error;
            this.AddressblockListArray.emit(this.blockListAddressDetails);
          }
          else {
            this.showErrorMsg(err.statusText.toString());
          }
        }
        );
      }
    }
    else {
      this.validateAllFormFields(this.addressForm);
      return;
    }
  }

  countrySelected(country: string) {
    if (country == "IND") {
      this.showZip2 = false;
    }
    else {
      this.showZip2 = true;
    }
    this.changeZipValidations(country);
    this.getStateByCountry(country);
  }



  changeZipValidations(countryCode: string) {
    // console.log(countryCode);
    switch (countryCode) {
      case "USA":
        this.zipMinlength = 5;
        this.zipMaxlength = 5;
        break;
      default:
        this.zipMinlength = 6;
        this.zipMaxlength = 6;
        break;
    }
    this.addressForm.controls["zip1"].setValidators([Validators.required, Validators.minLength(this.zipMinlength), Validators.maxLength(this.zipMaxlength), Validators.pattern(this.validateNumberPattern)]);
    this.addressForm.controls["zip1"].updateValueAndValidity();
  }


  parseAddress(address: IAddressResponse[]) {
    this.addressTypes = {
      Primary: "",
      Billing: "",
      Business: "",
      Home: "",
      Mailing: "",
      Other: "",
      Shipping: "",
      Secondary: "",
    };

    //console.log(address);
    address.forEach(element => {
      this.addressTypes[element.Type] = element;
      // console.log(this.addressTypes);
      if (element.IsPreferred) {
        this.preferredAddress = element;
      }
    });
  }

  showAddressHistory() {
    this.p = 1;
    this.getAddressesHistory(this.p);
    $('#addressHistory').modal('show');
  }

  getAllAddresses(userEvents?: IUserEvents) {
    this.commonService.getAllAddressesByCustomerId(this.accountId, userEvents)
      .subscribe(res => {
        this.parseAddress(res);
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      }
      );
  }

  getAddressesHistory(pageNumber: number) {
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = "";
    this.paging.SortDir = 1;
    this.addressHistoryReqObj.CustomerId = this.accountId;
    this.addressHistoryReqObj.UserId = this.UserInputs.userId;
    this.addressHistoryReqObj.LoginId = this.UserInputs.loginId;
    this.addressHistoryReqObj.UserName = this.UserInputs.userName;;
    this.addressHistoryReqObj.Paging = this.paging;
    this.userEvents.FeatureName = Features[Features.ADDRESS];
    this.userEvents.ActionName = Actions[Actions.HISTORY];
    this.commonService.getAddressHistoryByAccountId(this.addressHistoryReqObj, this.userEvents)
      .subscribe(res => {
        this.addressHistory = res;
        if (this.addressHistory.length > 0) {
          // console.log(res);
          this.totalRecordCount = this.addressHistory[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          } else {
            this.endItemNumber = this.pageItemNumber;
          }
          // console.log(this.accountAdjustmentDetails);
          this.dataLength = this.addressHistory.length
        }
      }
      , (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.getAddressesHistory(this.p);
  }
  getCountries() {
    this.commonService.getCountries().subscribe(res => { this.countries = res; });
  }

  getStateByCountry(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common)
      .subscribe(res => { // console.log(res);
        this.states = res;
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
  }

  deleteAddress(AddressDetails) {
    AddressDetails.UpdatedUser = this.UserInputs.userName;
    AddressDetails.UserName = this.UserInputs.userName;
    AddressDetails.IsActivityRequired = true;
    this.userEvents.FeatureName = Features[Features.ADDRESS];
    this.userEvents.ActionName = Actions[Actions.DELETE];
    this.commonService.deleteAddress(AddressDetails, this.userEvents).subscribe(res => {
      if (res) {
        this.showSucsMsg("Address has beed deleted");
        this.getAllAddresses();
      }
    }
      , (err) => { this.showErrorMsg(err.statusText.toString()); }
      , () => {

      }
    )
  }

  blockListPopup(type, isBlockListCheck) {
    this.changeAddress(type, isBlockListCheck)
  }


  resetAddress(buttonType) {
    if (this.editClicked) {
      this.addressForm.patchValue({
        addressType: this.preferredAddress.Type,
        addressLine1: this.preferredAddress.Line1,
        addressLine2: this.preferredAddress.Line2,
        addressLine3: this.preferredAddress.Line3,
        city: this.preferredAddress.City,
        state: this.preferredAddress.State,
        zip1: this.preferredAddress.Zip1,
        zip2: this.preferredAddress.Zip2,
        country: this.preferredAddress.Country,
        isPreferred: this.preferredAddress.IsPreferred,
        isValid: this.preferredAddress.IsValid,
      })
    }
    else {
      this.addressForm.reset();
      this.addressForm.patchValue({
        addressType: "",
        state: "",
        country: "",
      })
    }
     this.materialscriptService.material();
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

  getAccountHolderInfo() {
    this.customerDetailsService.getProfileByCustomerId(this.accountId)
      .subscribe(res => {
        this.profileResponse = res;
        if (this.profileResponse.OrganisationName != '') {
          this.isBusiness = this.profileResponse.OrganisationName;
        }
      })
  }
}
