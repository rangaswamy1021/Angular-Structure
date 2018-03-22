import { Component, OnInit, Renderer } from '@angular/core';
import { ICommonResponse, ICommon } from '../../shared/models/commonresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { IAddressRequest } from '../../shared/models/addressrequest';
import { IAddressResponse } from '../../shared/models/addressresponse';
import { ActivitySource, SubSystem, PhoneType, Features, Actions } from '../../shared/constants';
import { IUserresponse } from '../../shared/models/userresponse';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { IPaging } from '../../shared/models/paging';
import { IPhoneResponse } from '../../shared/models/phoneresponse';
import { List } from 'linqts';
import { IPhoneRequest } from '../../shared/models/phonerequest';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-update-contact-details',
  templateUrl: './update-contact-details.component.html',
  styleUrls: ['./update-contact-details.component.scss']
})
export class UpdateContactDetailsComponent implements OnInit {

  countries: any[];
  states: ICommonResponse[];
  addTypes = [];
  common: ICommon = <ICommon>{};
  addressRequest: IAddressRequest = <IAddressRequest>{};
  addressResponse: IAddressResponse[];
  selectedAddress: IAddressResponse;
  accountId: number = 0;
  sessionContextResponse: IUserresponse;
  iviolatorContextResponse: IViolatorContextResponse;
  empty: string = "";
  isNeedToaddAddress: boolean = false;
  submitButtonTitle: string = "Add";
  paging: IPaging;
  blockListDetails: IBlocklistresponse[] = [];
  country: string = "USA";
  isDmvAddress: boolean = false;
  selectedAddressType: string = this.empty;

  // Contact
  iPhoneResponse: IPhoneResponse[];
  iPhoneResponseGridView: IPhoneResponse[];
  iPhoneResponseDayPhone: IPhoneResponse = <IPhoneResponse>{};
  iPhoneResponseEveningPhone: IPhoneResponse = <IPhoneResponse>{};
  iPhoneResponseMobilePhone: IPhoneResponse = <IPhoneResponse>{};
  iPhoneResponseWorkPhone: IPhoneResponse = <IPhoneResponse>{};
  iPhoneResponseExt: IPhoneResponse = <IPhoneResponse>{}
  iPhoneResponseFax: IPhoneResponse = <IPhoneResponse>{}
  contactButtonTitle: string = "Add";
  preferredPhone: string;
  phoneObject: IPhoneRequest = <IPhoneRequest>{};
  phoneHistoryReqObj: IPhoneRequest = <IPhoneRequest>{};
  //Validation Pattern
  validateNumberPattern = "[0-9]*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";
  zipMinlength: number = 5;
  zipMaxlength: number = 5;


  isInvalidDayPhone: boolean = false;
  isInvalidEveningPhone: boolean = false;
  isInvalidMobilePhone: boolean = false;
  isInvalidWorkPhone: boolean = false;
  isInvalidFax: boolean = false;
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";
  resPhoneArray;
  phoneArray: IPhoneRequest[] = [];
  checkPhoneChanges = ["DayPhone", "EveningPhone", "MobileNo", "WorkPhone", "Fax"];
  phoneIdConfirmed: any;
  phoneTypes = {
    DayPhone: "",
    EveningPhone: "",
    MobileNo: "",
    WorkPhone: "",
    Fax: "",
  };

  // Pagination 
  // Paging start for Address History
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  userEvents: IUserEvents;
  isAddAllowed: boolean;
  isUpdateAllowed: boolean;
  isHistoryAllowed: boolean;
  isDeleteAllowed: boolean;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getAddressesHistory(this.p);
  }


  // Paging start for Contact History
  pContact: number;
  pageContactItemNumber: number = 10;
  starContacttItemNumber: number = 1;
  endContactItemNumber: number;
  totalContactRecordCount: number;

  pageContactChanged(event) {
    this.pContact = event;
    this.starContacttItemNumber = (((this.pContact) - 1) * this.pageContactItemNumber) + 1;
    this.endContactItemNumber = ((this.pContact) * this.pageContactItemNumber);
    if (this.endContactItemNumber > this.totalContactRecordCount)
      this.endContactItemNumber = this.totalContactRecordCount;
    this.viewContactHistory(this.pContact);
  }
  addressTypes = {
    Billing: "",
    Business: "",
    Primary: "",
    DmvAddr: "",
    Home: "",
    Mailing: "",
    Other: "",
    Secondary: "",
    Shipping: "",
  };

  isAddressHistoryClicked: boolean = false;
  constructor(public renderer: Renderer, private router: Router, private commonService: CommonService,
    private sessionService: SessionService, private violatordetailsService: ViolatordetailsService, private violatorContextService: ViolatorContextService, private materialscriptService: MaterialscriptService) {
  }

  updateAddresssForm: FormGroup;
  updateContactForm: FormGroup;

  ngOnInit() {
    this.materialscriptService.material();
    this.p = this.pContact = 1;
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.violatorContextService.currentContext
      .subscribe(customerContext => { this.iviolatorContextResponse = customerContext; }
      );
    if (this.iviolatorContextResponse && this.iviolatorContextResponse.accountId > 0) {
      this.accountId = this.iviolatorContextResponse.accountId;
    }
    if (this.accountId == 0) {
      let link = ['tvc/search/violation-search'];
      this.router.navigate(link);
    }

    this.bindFormControl();
    this.bindContactForm();
    this.setUserActionObject();
    this.getCountry();
    this.getCountryBystate(this.country);
    this.getAddressTypes();
    this.getAddressTypeDetails("DmvAddr");
    // this.getAllAddresses();
    // Contact related methods
    this.getAllPhonesById();
    this.isAddAllowed = !this.commonService.isAllowed(Features[Features.VIOLATORADDRESS], Actions[Actions.CREATE], "");
    this.isUpdateAllowed = !this.commonService.isAllowed(Features[Features.VIOLATORADDRESS], Actions[Actions.UPDATE], "");
    this.isDeleteAllowed = !this.commonService.isAllowed(Features[Features.VIOLATORADDRESS], Actions[Actions.DELETE], "");
    this.isHistoryAllowed = !this.commonService.isAllowed(Features[Features.VIOLATORADDRESS], Actions[Actions.HISTORY], "");
  }

  bindFormControl() {
    this.updateAddresssForm = new FormGroup({
      addressType: new FormControl(''),
      addressLine1:
      new FormControl('', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(this.validateExceptAnglePattern)]
      ),
      addressLine2:
      new FormControl('', [Validators.maxLength(50),
      Validators.pattern(this.validateExceptAnglePattern)]),

      addressLine3: new FormControl('', [Validators.maxLength(50),
      Validators.pattern(this.validateExceptAnglePattern)]),

      city: new FormControl('', [Validators.required, Validators.maxLength(50),
      Validators.pattern(this.validateAlphNemericsandSpacePattern)]),

      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      zip1: new FormControl('', [Validators.required, Validators.minLength(5),
      Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]),
      zip2: new FormControl('', [Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]),
      isPrimary: new FormControl('')
    });
  }
  bindContactForm() {
    this.updateContactForm = new FormGroup({
      DayPhone: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      EveningPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      MobileNo: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      WorkPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      ext: new FormControl('', [Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)]),
      Fax: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      preferredPhone: new FormControl(''),
    });
  }
  getCountry() {
    this.commonService.getCountries(this.userEvents).subscribe(res => this.countries = res);

  }
  getCountryBystate(countryCode: string) {
    this.updateAddresssForm.controls["state"].setValue("");
    this.updateAddresssForm.controls["zip1"].setValue("");
    this.updateAddresssForm.controls["zip2"].setValue("");
    this.changeZipValidations(countryCode);
    this.common.CountryCode = countryCode.trim();
    console.log(countryCode);
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.states = res;
      console.log(res);
    });

  }

  getAddressTypes() {
    this.commonService.getAddressTypes().subscribe(res => {
      this.addTypes = res;
      console.log(this.addTypes + "--this.addressTypes");
    }
    );
  }
  getAddressTypeDetails(type) {
    this.selectedAddressType = type;
    if (type == "DmvAddr") { this.disableControls(); this.isDmvAddress = true; }
    else { this.enableControls(); this.isDmvAddress = false; }
    this.selectedAddress = null;
    this.commonService.getAddressByTypeCustomer(type, this.accountId.toString())
      .subscribe(res => {
        if (res) {
          this.selectedAddress = res;
          this.patchAddressValue();
          this.isNeedToaddAddress = false;
          this.submitButtonTitle = "Update";
        }
        else {
          this.patchEmptyAddressValue();
          this.isNeedToaddAddress = true;
          this.submitButtonTitle = "Add";
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText.toString();
        this.patchEmptyAddressValue();
      }
      );
       let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 1000);
  }
  patchAddressValue() {
    this.getCountryBystate(this.selectedAddress.Country);
    this.updateAddresssForm.patchValue({
      addressType: this.selectedAddress.Type,
      addressLine1: this.selectedAddress.Line1,
      addressLine2: this.selectedAddress.Line2,
      addressLine3: this.selectedAddress.Line3,
      city: this.selectedAddress.City,
      state: this.selectedAddress.State,
      zip1: this.selectedAddress.Zip1,
      zip2: this.selectedAddress.Zip2,
      country: this.selectedAddress.Country,
      isPrimary: this.selectedAddress.IsPreferred,
    })
  }

  patchEmptyAddressValue() {
    this.updateAddresssForm.patchValue({
      addressLine1: this.empty,
      addressLine2: this.empty,
      addressLine3: this.empty,
      city: this.empty,
      state: this.empty,
      zip1: this.empty,
      zip2: this.empty,
      isPrimary: this.empty,
      country: "USA"
    })
    this.userEvents = null;
    this.getCountry();
    this.getCountryBystate(this.country);
    return false;
  }

  addUpdateClick() {
    this.addUpdateAddress(true);
  }
  createUpdateAddressPopup() {
    this.addUpdateAddress(false);
  }
  addUpdateAddress(isBlockListCheck: boolean) {
    if (this.updateAddresssForm.valid) {
      this.addressRequest.Type = this.updateAddresssForm.value.addressType;
      this.addressRequest.Line1 = this.updateAddresssForm.value.addressLine1;
      this.addressRequest.Line2 = this.updateAddresssForm.value.addressLine2 === null ? '' : this.updateAddresssForm.value.addressLine2;
      this.addressRequest.Line3 = this.updateAddresssForm.value.addressLine3 === null ? '' : this.updateAddresssForm.value.addressLine3;;
      this.addressRequest.City = this.updateAddresssForm.value.city;
      this.addressRequest.State = this.updateAddresssForm.value.state;
      this.addressRequest.Country = this.updateAddresssForm.value.country;
      this.addressRequest.Zip1 = this.updateAddresssForm.value.zip1;
      this.addressRequest.Zip2 = this.updateAddresssForm.value.zip2 === null ? '' : this.updateAddresssForm.value.zip2;
      this.addressRequest.IsPreferred = this.updateAddresssForm.value.isPrimary;
      this.addressRequest.CustomerId = this.accountId;
      this.addressRequest.UserName = this.sessionContextResponse.userName;
      this.addressRequest.LoginId = this.sessionContextResponse.loginId;
      this.addressRequest.UserId = this.accountId;
      this.addressRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.addressRequest.IsActivityRequired = true;
      this.addressRequest.SubSystem = SubSystem[SubSystem.TVC];
      this.addressRequest.CheckBlockList = isBlockListCheck;
      if (this.isNeedToaddAddress) {
        this.setUserActionObject();
        this.userEvents.ActionName = Actions[Actions.CREATE];
        this.commonService.createAddress(this.addressRequest,this.userEvents).subscribe(res => {
          if (res) {
            // this.addressForm.reset();
            //  this.addressFormToggle = false;
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = "Address has been added successfully.";
            this.getAddressTypeDetails(this.addressRequest.Type);
          }
        }, (err) => {
          if (err._body) {
            this.blockListDetails = err.json();
            $('#blocklist-dialog').modal('show');
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText.toString();
          }
        }, () => {
        });
      }
      else {
        this.setUserActionObject();
        this.userEvents.ActionName = Actions[Actions.UPDATE];
        this.commonService.updateAddress(this.addressRequest, this.userEvents).subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = "Address has been updated successfully";
            this.getAddressTypeDetails(this.addressRequest.Type);
          }
        }, (err) => {
          if (err._body) {
            this.blockListDetails = err.json();
            $('#blocklist-dialog').modal('show');
            // this.AddressblockListArray.emit(this.blockListAddressDetails);
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText.toString();
          }
        }
        );
      }
    }
    else {
      this.validateAllFormFields(this.updateAddresssForm);
    }
  }

  resetAddress() {
    this.getAddressTypeDetails(this.selectedAddressType);
    this.iPhoneResponseGridView = [];
    this.addressResponse = [];
  }
  viewAddressHistory() {
    this.getAddressesHistory(this.p);
  }
  getAddressesHistory(pageNumber: number) {
    this.isAddressHistoryClicked = true;
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = "";
    this.paging.SortDir = 1;
    this.addressRequest.CustomerId = this.accountId;
    this.addressRequest.UserName = this.sessionContextResponse.userName;
    this.addressRequest.LoginId = this.sessionContextResponse.loginId;
    this.addressRequest.UserId = this.accountId;
    this.addressRequest.Paging = this.paging;
    this.commonService.getAddressHistoryByAccountId(this.addressRequest)
      .subscribe(res => {
        this.addressResponse = res;
        if (this.addressResponse.length > 0) {
          console.log(res);
          this.totalRecordCount = this.addressResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
           }
           // else {
          //   this.endItemNumber = this.pageItemNumber;
          // }
          // console.log(this.accountAdjustmentDetails);
          // this.dataLength = this.addressResponse.length
        }
      }
      , (err) => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText.toString();;
      });
  }

  disableControls() {
    this.updateAddresssForm.get('addressLine1').disable();
    this.updateAddresssForm.get('addressLine2').disable();
    this.updateAddresssForm.get('addressLine3').disable();
    this.updateAddresssForm.get('city').disable();
    this.updateAddresssForm.get('state').disable();
    this.updateAddresssForm.get('zip1').disable();
    this.updateAddresssForm.get('zip2').disable();
    this.updateAddresssForm.get('isPrimary').disable();
    this.updateAddresssForm.get('country').disable();
  }

  enableControls() {
    this.updateAddresssForm.get('addressLine1').enable();
    this.updateAddresssForm.get('addressLine2').enable();
    this.updateAddresssForm.get('addressLine3').enable();
    this.updateAddresssForm.get('city').enable();
    this.updateAddresssForm.get('state').enable();
    this.updateAddresssForm.get('zip1').enable();
    this.updateAddresssForm.get('zip2').enable();
    this.updateAddresssForm.get('isPrimary').enable();
    this.updateAddresssForm.get('country').enable();
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        if (control.invalid) {
          //console.log(controlName);
          //console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  changeZipValidations(countryCode: string) {
    const ctrl = this.updateAddresssForm.get('zip2');
    switch (countryCode) {
      case "USA":
        this.zipMinlength = 5;
        this.zipMaxlength = 5;
        ctrl.enable();
        break;
      default:
        this.zipMinlength = 6;
        this.zipMaxlength = 6;
        ctrl.disable();
        break;
    }
    this.updateAddresssForm.controls["zip1"].setValidators([Validators.required, Validators.minLength(this.zipMinlength), Validators.maxLength(this.zipMaxlength), Validators.pattern(this.validateNumberPattern)]);
    this.updateAddresssForm.controls["zip1"].updateValueAndValidity();
  }


  /* Contact Related methods */


  changeExtension() {
    if (this.updateContactForm.controls["ext"].value)
      this.updateContactForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else {
      if (this.updateContactForm.controls["WorkPhone"].value) {
        if (this.updateContactForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone]) {
          this.updateContactForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
        }
        else
          this.updateContactForm.controls["WorkPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      } else
        this.updateContactForm.controls["WorkPhone"].setValidators([]);
    }
    this.updateContactForm.controls["WorkPhone"].updateValueAndValidity();
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.updateContactForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.updateContactForm.controls[objId].setValue(phone);
    }
  }

  changePhoneValidation(phoneType) {
    this.updateContactForm.controls["DayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.updateContactForm.controls["EveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.updateContactForm.controls["MobileNo"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    if (this.updateContactForm.controls["ext"].value)
      this.updateContactForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.updateContactForm.controls["WorkPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    if (phoneType == "DayPhone")
      this.updateContactForm.controls["DayPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "EveningPhone")
      this.updateContactForm.controls["EveningPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "MobileNo")
      this.updateContactForm.controls["MobileNo"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.updateContactForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    this.updateContactForm.controls['DayPhone'].updateValueAndValidity();
    this.updateContactForm.controls["EveningPhone"].updateValueAndValidity();
    this.updateContactForm.controls['MobileNo'].updateValueAndValidity();
    this.updateContactForm.controls["WorkPhone"].updateValueAndValidity();
  }

  validateDayPhoneAllZeros() {
    if (this.updateContactForm.controls["DayPhone"].valid) {
      if (this.validateAllZerosinPhone(this.updateContactForm.value.dayPhone))
        this.isInvalidDayPhone = true;
      else
        this.isInvalidDayPhone = false;
    }
    else
      this.isInvalidDayPhone = false;
  }

  validateEveningPhoneAllZeros() {
    if (this.updateContactForm.controls["EveningPhone"].valid) {
      if (this.validateAllZerosinPhone(this.updateContactForm.value.eveningPhone))
        this.isInvalidEveningPhone = true;
      else
        this.isInvalidEveningPhone = false;
    }
    else
      this.isInvalidEveningPhone = false;
  }

  validateMobilePhoneAllZeros() {
    if (this.updateContactForm.controls["MobileNo"].valid) {
      if (this.validateAllZerosinPhone(this.updateContactForm.value.mobilePhone))
        this.isInvalidMobilePhone = true;
      else
        this.isInvalidMobilePhone = false;
    }
    else
      this.isInvalidMobilePhone = false;
  }

  validateWorkPhoneAllZeros() {
    if (this.updateContactForm.controls["WorkPhone"].valid) {
      if (this.validateAllZerosinPhone(this.updateContactForm.value.workPhone))
        this.isInvalidWorkPhone = true;
      else
        this.isInvalidWorkPhone = false;
    }
    else
      this.isInvalidWorkPhone = false;
  }

  validateFaxAllZeros() {
    if (this.updateContactForm.controls["Fax"].valid) {
      if (this.validateAllZerosinPhone(this.updateContactForm.value.fax))
        this.isInvalidFax = true;
      else
        this.isInvalidFax = false;
    }
    else
      this.isInvalidFax = false;
  }

  validateAllZerosinPhone(phoneNumber: string): boolean {
    var pattern = new RegExp(this.validatePhoneAllZerosPattern);
    var result = pattern.test(phoneNumber);
    return result;
  }

  getAllPhonesById() {
    this.commonService.getAllPhonesByCustomerId(this.accountId).subscribe(res => {
      ////console.log(res); 
      if (res) {
        this.iPhoneResponse = null;
        this.bindContactForm();
        this.parsePhone(res);
        this.iPhoneResponse = res;
        //console.log("iPhoneResponse--" + this.iPhoneResponse);
        this.patchContactValue();
        this.contactButtonTitle = "Update";
      }
      else {
        this.patchContactEmptyValue();
        this.contactButtonTitle = "Add";
      }
    }
      , (err) => {
        this.patchContactEmptyValue();
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText.toString();
      });
  }

  patchContactValue() {
    this.iPhoneResponseDayPhone = <IPhoneResponse>{};
    this.iPhoneResponseEveningPhone = <IPhoneResponse>{};
    this.iPhoneResponseMobilePhone = <IPhoneResponse>{};
    this.iPhoneResponseWorkPhone = <IPhoneResponse>{};
    this.iPhoneResponseFax = <IPhoneResponse>{};
    this.iPhoneResponseDayPhone.IsCommunication = true;
    this.iPhoneResponseEveningPhone.IsCommunication = true;
    this.iPhoneResponseMobilePhone.IsCommunication = true;
    this.iPhoneResponseWorkPhone.IsCommunication = true;
    this.iPhoneResponseFax.IsCommunication = true;
    let phoneList = new List<IPhoneResponse>(this.newFunction());
    phoneList.ForEach(element => {

      if (element.IsCommunication) {
        this.preferredPhone = element.Type;
        this.changePhoneValidation(element.Type);
      }
      ////console.log("this.preferredPhone --" + this.preferredPhone);
      if (element.Type == PhoneType[PhoneType.DayPhone] && element.IsActive) {
        this.iPhoneResponseDayPhone.PhoneId = element.PhoneId;
        this.iPhoneResponseDayPhone.PhoneNumber = element.PhoneNumber;
        this.iPhoneResponseDayPhone.IsCommunication = element.IsCommunication;
      }
      else if (element.Type == PhoneType[PhoneType.EveningPhone] && element.IsActive) {
        this.iPhoneResponseEveningPhone.PhoneId = element.PhoneId;
        this.iPhoneResponseEveningPhone.PhoneNumber = element.PhoneNumber;
        this.iPhoneResponseEveningPhone.IsCommunication = element.IsCommunication;
      }
      else if (element.Type == PhoneType[PhoneType.MobileNo] && element.IsActive) {
        this.iPhoneResponseMobilePhone.PhoneId = element.PhoneId;
        this.iPhoneResponseMobilePhone.PhoneNumber = element.PhoneNumber;
        this.iPhoneResponseMobilePhone.IsCommunication = element.IsCommunication;
      }
      else if (element.Type == PhoneType[PhoneType.WorkPhone] && element.IsActive) {
        this.iPhoneResponseWorkPhone.PhoneId = element.PhoneId;
        this.iPhoneResponseWorkPhone.PhoneNumber = element.PhoneNumber;
        this.iPhoneResponseWorkPhone.Extension = element.Extension;
        this.iPhoneResponseWorkPhone.IsCommunication = element.IsCommunication;
      }
      else if (element.Type == PhoneType[PhoneType.Fax] && element.IsActive) {
        this.iPhoneResponseFax.PhoneId = element.PhoneId;
        this.iPhoneResponseFax.PhoneNumber = element.PhoneNumber;
        this.iPhoneResponseFax.IsCommunication = element.IsCommunication;
      }


    });

    this.updateContactForm.patchValue({
      DayPhone: this.iPhoneResponseDayPhone.PhoneNumber,
      EveningPhone: this.iPhoneResponseEveningPhone.PhoneNumber,
      MobileNo: this.iPhoneResponseMobilePhone.PhoneNumber,
      WorkPhone: this.iPhoneResponseWorkPhone.PhoneNumber,
      ext: this.iPhoneResponseWorkPhone.Extension,
      Fax: this.iPhoneResponseFax.PhoneNumber,
      preferredPhone: this.preferredPhone,
    })
  }

  patchContactEmptyValue() {
    this.iPhoneResponseDayPhone = <IPhoneResponse>{};
    this.iPhoneResponseEveningPhone = <IPhoneResponse>{};
    this.iPhoneResponseMobilePhone = <IPhoneResponse>{};
    this.iPhoneResponseWorkPhone = <IPhoneResponse>{};
    this.iPhoneResponseFax = <IPhoneResponse>{};
    this.iPhoneResponseDayPhone.IsCommunication = true;
    this.iPhoneResponseEveningPhone.IsCommunication = true;
    this.iPhoneResponseMobilePhone.IsCommunication = true;
    this.iPhoneResponseWorkPhone.IsCommunication = true;
    this.iPhoneResponseFax.IsCommunication = true;
    this.updateContactForm.patchValue({
      DayPhone: this.empty,
      EveningPhone: this.empty,
      MobileNo: this.empty,
      WorkPhone: this.empty,
      ext: this.empty,
      Fax: this.empty,
      preferredPhone: PhoneType[PhoneType.DayPhone],
    })
  }
  private newFunction(): IPhoneResponse[] {
    return this.iPhoneResponse;
  }

  addUpdateContactClick() {
    if (this.contactButtonTitle == "Update") {
      this.updateContact(false);
    } if (this.contactButtonTitle == "Add") {
      this.addContact(false);
    }
  }
  addUpdateContactPopup() {
    if (this.contactButtonTitle == "Update") {
      this.updateContact(false);
    }
    else if (this.contactButtonTitle == "Update") {
      this.updateContact(false);
    }
  }

  parsePhone(phone) {
    this.phoneTypes = {
      DayPhone: "",
      EveningPhone: "",
      MobileNo: "",
      WorkPhone: "",
      Fax: "",
    };
    phone.forEach(element => {
      this.phoneTypes[element.Type] = element;

      if (element.IsCommunication) {
        this.preferredPhone = element.IsCommunication;
      }
    });
  }
  updateContact(checkblockList: boolean) {
    this.phoneArray = [];
    let oldVal = this.resPhoneArray;
    if (this.updateContactForm.valid) {
      for (var i = 0; i < this.checkPhoneChanges.length; i++) {
        if (this.phoneTypes[this.checkPhoneChanges[i]]) {
          if (this.phoneTypes[this.checkPhoneChanges[i]].PhoneNumber != this.updateContactForm.controls[this.phoneTypes[this.checkPhoneChanges[i]].Type].value
            || this.preferredPhone != this.updateContactForm.controls["preferredPhone"].value) {
            this.phoneTypes[this.checkPhoneChanges[i]].PhoneNumber = this.updateContactForm.controls[this.phoneTypes[this.checkPhoneChanges[i]].Type].value;
            this.phoneTypes[this.checkPhoneChanges[i]]["IsPhoneNumberChanged"] = true;
            this.phoneTypes[this.checkPhoneChanges[i]]["CheckBlockList"] = checkblockList;
            if (this.checkPhoneChanges[i] == "WorkPhone") {
              this.phoneTypes[this.checkPhoneChanges[i]]["Extension"] = this.updateContactForm.controls["ext"].value;
            }
            if (this.phoneTypes[this.checkPhoneChanges[i]]["Type"] != this.updateContactForm.controls['preferredPhone'].value) {
              this.phoneTypes[this.checkPhoneChanges[i]]["IsCommunication"] = false;
            }
            else {
              this.phoneTypes[this.preferredPhone]["IsCommunication"] = false;
              this.phoneTypes[this.checkPhoneChanges[i]]["IsCommunication"] = true;
            }
            this.phoneTypes[this.checkPhoneChanges[i]]["IsActive"] = true;
            this.phoneTypes[this.checkPhoneChanges[i]]["UserName"] = this.sessionContextResponse.userName;
            this.phoneTypes[this.checkPhoneChanges[i]]["CustomerId"] = this.accountId;
            this.phoneTypes[this.checkPhoneChanges[i]]["UserId"] = this.sessionContextResponse.userId;
            this.phoneTypes[this.checkPhoneChanges[i]]["ActivitySource"] = ActivitySource[ActivitySource.Internal];
            this.phoneTypes[this.checkPhoneChanges[i]]["IsActivityRequired"] = true;
            this.phoneTypes[this.checkPhoneChanges[i]]["SubSystem"] = SubSystem[SubSystem.TVC];
            this.phoneTypes[this.checkPhoneChanges[i]]["LoginId"] = this.sessionContextResponse.loginId;
            this.phoneTypes[this.checkPhoneChanges[i]]["UpdatedUser"] = this.sessionContextResponse.userName;
            this.phoneArray.push(this.phoneTypes[this.checkPhoneChanges[i]]);

          } //phone number modified 
        }
        else {
          //add new phone
          if (this.updateContactForm.controls[this.checkPhoneChanges[i]].value) {
            this.phoneObject.UserName = this.sessionContextResponse.userName;
            this.phoneObject.CustomerId = this.accountId;
            this.phoneObject.UserId = this.sessionContextResponse.userId;
            this.phoneObject.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.phoneObject.IsActivityRequired = true;
            this.phoneObject.SubSystem = SubSystem[SubSystem.TVC];
            this.phoneObject.LoginId = this.sessionContextResponse.loginId;

            this.phoneObject.PhoneId = 0;
            this.phoneObject.PhoneNumber = this.updateContactForm.controls[this.checkPhoneChanges[i]].value;
            this.phoneObject.CustomerId = this.accountId;
            this.phoneObject.Type = this.checkPhoneChanges[i];
            if (this.checkPhoneChanges[i] == "WorkPhone") {
              this.phoneObject.Extension = this.updateContactForm.controls["ext"].value;
            }

            if (this.phoneObject.Type != this.updateContactForm.controls['preferredPhone'].value) {
              this.phoneObject.IsCommunication = false;

            }
            else {
              this.phoneObject.IsCommunication = true;
            }

            //  this.phoneObject.CheckBlockList = true;
            this.phoneArray.push(this.phoneObject);
          }
        }
      }
      if (this.phoneArray.length > 0) {
        this.setUserActionObject();
        this.userEvents.ActionName = Actions[Actions.UPDATE];
        this.commonService.updatePhone(this.phoneArray, this.userEvents).subscribe(res => {
          // //console.log(res);
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = 'Phone(s) details has been updated successfully';
          }
          $('#phoneEdit').modal('hide'); this.getAllPhonesById()
        }, (err) => {
          if (err._body) {
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText.toString()
          }
          this.phoneTypes = {
            DayPhone: "",
            EveningPhone: "",
            MobileNo: "",
            WorkPhone: "",
            Fax: "",
          };
          this.getAllPhonesById()
        });
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = "No modifications are done to update the Contact Information";
      }
    }
    else {
      this.validateAllFormFields(this.updateContactForm);
    }
  }
  addContact(checkblockList: boolean) {
    this.phoneArray = [];
    let oldVal = this.resPhoneArray;
    if (this.updateContactForm.valid) {
      for (var i = 0; i < this.checkPhoneChanges.length; i++) {
        if (this.updateContactForm.controls[this.checkPhoneChanges[i]].value) {
          this.phoneObject = <IPhoneRequest>{};
          this.phoneObject.UserName = this.sessionContextResponse.userName;
          this.phoneObject.CustomerId = this.accountId;
          this.phoneObject.UserId = this.sessionContextResponse.userId;
          this.phoneObject.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.phoneObject.IsActivityRequired = true;
          this.phoneObject.SubSystem = SubSystem[SubSystem.TVC];
          this.phoneObject.LoginId = this.sessionContextResponse.loginId;

          this.phoneObject.PhoneId = 0;
          this.phoneObject.PhoneNumber = this.updateContactForm.controls[this.checkPhoneChanges[i]].value;
          this.phoneObject.Type = this.checkPhoneChanges[i];
          if (this.checkPhoneChanges[i] == PhoneType[PhoneType.WorkPhone]) {
            this.phoneObject.Extension = this.updateContactForm.controls["ext"].value;
          }
          if (this.phoneObject.Type != this.updateContactForm.controls['preferredPhone'].value) {
            this.phoneObject.IsCommunication = false;
          }
          else {
            this.phoneObject.IsCommunication = true;
          }

          //  this.phoneObject.CheckBlockList = true;
          this.phoneArray.push(this.phoneObject);
        }
      }
      if (this.phoneArray.length > 0) {
        this.setUserActionObject();
        this.userEvents.ActionName = Actions[Actions.CREATE];
        this.commonService.createPhone(this.phoneArray, this.userEvents).subscribe(res => {
          // console.log(res);
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = 'Phone(s) details has been added successfully';
          }
          $('#phoneEdit').modal('hide'); this.getAllPhonesById()
        }, (err) => {
          if (err._body) {
            // console.log(err._body);
            //this.blockListPhoneDetails = err.json();
            // console.log(this.blockListPhoneDetails);
            //  this.PhoneblockListArray.emit(this.blockListPhoneDetails);
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText.toString();
          }
          this.phoneTypes = {
            DayPhone: "",
            EveningPhone: "",
            MobileNo: "",
            WorkPhone: "",
            Fax: "",
          };
          this.getAllPhonesById()
        });
      }
    }
    else {
      this.validateAllFormFields(this.updateContactForm);
    }

  }

  viewContactHistoryClick() {
    this.viewContactHistory(this.pContact);
  }
  viewContactHistory(pageNumber: number) {
    this.isAddressHistoryClicked = false;
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = "";
    this.paging.SortDir = 1;
    this.phoneHistoryReqObj.CustomerId = this.accountId;
    this.phoneHistoryReqObj.Paging = this.paging;
    this.commonService.getPhoneHistoryByAccountId(this.phoneHistoryReqObj)
      .subscribe(res => {
        this.iPhoneResponseGridView = res;
        if (this.iPhoneResponseGridView.length > 0) {
          this.totalContactRecordCount = this.iPhoneResponseGridView[0].RecordCount;
          if (this.totalContactRecordCount < this.pageContactItemNumber) {
            this.endContactItemNumber = this.totalContactRecordCount;
          } 
          // else {
          //   this.endContactItemNumber = this.pageContactItemNumber;
          // }
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText.toString();
      });
  }

  resetContactInfo() {
    this.getAllPhonesById();
    this.iPhoneResponseGridView = [];
    this.addressResponse = [];
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 100);
  }

  deletePhone(event) {
    if (event) {
      // $('#confirm-dialog-delete').modal('hide');
      this.phoneObject.UserName = this.sessionContextResponse.userName;
      this.phoneObject.CustomerId = this.accountId;
      this.phoneObject.UserId = this.sessionContextResponse.userId;
      this.phoneObject.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.phoneObject.IsActivityRequired = false;
      this.phoneObject.SubSystem = SubSystem[SubSystem.TVC];
      this.phoneObject.LoginId = this.sessionContextResponse.loginId;
      this.phoneObject.PhoneId = this.phoneIdConfirmed;// get from pop up
      this.setUserActionObject();
      this.userEvents.ActionName = Actions[Actions.DELETE];
      this.commonService.deletePhone(this.phoneObject, this.userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Phone has been deleted successfully.';
          this.phoneTypes = {
            DayPhone: "",
            EveningPhone: "",
            MobileNo: "",
            WorkPhone: "",
            Fax: "",
          };
          this.getAllPhonesById();
        }
      }, (err) => {
        // this.msgFlag = true;
        // this.msgType = 'error'
        // this.msgDesc = err.statusText.toString();
      })
    }
    else {
      this.msgFlag = false;
    }

  }


  deletePhoneConfirm(PhoneId) {
    this.msgFlag = true;
    this.msgType = 'alert'
    this.msgDesc = "Are you sure you want to delete this Phone ?";
    this.phoneIdConfirmed = PhoneId;
  }

  exit() {
    this.violatorContextService.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }
  goToAccountSummary() {
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.VIOLATORADDRESS];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.accountId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
