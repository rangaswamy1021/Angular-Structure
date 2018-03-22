import { Router } from '@angular/router';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { AddAddressComponent } from './../../shared/address/add-address.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { IPaging } from './../../shared/models/paging';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IBlocklistresponse } from './models/blocklistresponse';
import { IBlocklistRequest } from './models/blocklistrequest';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IAddressRequest } from "../../shared/models/addressrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-blocklist',
  templateUrl: './manage-blocklist.component.html',
  styleUrls: ['./manage-blocklist.component.css']
})
export class ManageBlocklistComponent implements OnInit {
  renderer: any;
  paging: IPaging;
  getBlockListResp: IBlocklistresponse[];
  addBlockList: IBlocklistRequest = <IBlocklistRequest>{};
  blocklistResponse: IBlocklistresponse;
  @ViewChild(AddAddressComponent) addAddressComponent;
  blockListForm: FormGroup;
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validateExceptAnglePattern = "[^<>]*";
  validateNumberPattern = "[0-9]*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  IsUpdate = false;
  IsDeactivate = false;
  IsSubmit = false;
  IsReset = false;
  IsCancel = false;
  blockListId: number;
  descLength: number = 255;
  isUpdateReset = false;
  isEditable = false;
  addressRequest: IAddressRequest = <IAddressRequest>{};
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  p: number;
  pageItemNumber: number = 10;
  //dataLength: number = this.getBlockListResp.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  zipMinlength: number = 5;
  zipMaxlength: number = 5;
  sessionContextResponse: IUserresponse;
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  disableDeleteButton: boolean = false;
  disableAddButton: boolean = false;
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    let userEvents = null;
    this.getBlockListData(this.p, userEvents);
  }

  constructor(private customerAccService: CustomerAccountsService,
    private Context: SessionService, private commonService: CommonService, private router: Router, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    if (!this.commonService.isAllowed(Features[Features.BLOCKLIST], Actions[Actions.VIEW], "")) {

    }
    this.disableAddButton = !this.commonService.isAllowed(Features[Features.BLOCKLIST], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.BLOCKLIST], Actions[Actions.UPDATE], "");
    this.disableDeleteButton = !this.commonService.isAllowed(Features[Features.BLOCKLIST], Actions[Actions.DEACTIVATE], "");
    this.p = 1;
    this.endItemNumber = 10;
    let userEvents = this.userEvents();
    this.getBlockListData(this.p, userEvents);
    this.initialFormValues();
    this.IsDeactivate = false;
    this.IsUpdate = false;
    this.IsReset = true;
    this.IsSubmit = true;
    this.isUpdateReset = false;
  }

  getBlockListData(pageNumber: number, userEvents: IUserEvents) {
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortDir = 1;
    this.paging.SortColumn = "CUSTOMERID";
    this.customerAccService.getBlockListData(this.paging, userEvents).subscribe(res => {
      if (res) {
        this.getBlockListResp = res;
        this.totalRecordCount = this.getBlockListResp[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Error while getting the block list details";
        this.msgTitle = '';
      }
    }, err => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText;
      this.msgTitle = '';
      return;
    });
  }

  addBlockLists() {
    this.addorRemoveValidation();
    if (this.blockListForm.valid && this.addAddressComponent.addAddressForm.valid) {
      this.setValues();
      this.addBlockList.CreatedDateTime = new Date();
      this.addBlockList.CreatedUser = this.Context.customerContext.userName;
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.CREATE];
      this.customerAccService.addBlockList(this.addBlockList, userEvents).subscribe(
        res => {
          if (res) {
            let userEvents = null;
            this.getBlockListData(this.p, userEvents);
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = 'Blocklist details inserted successfully';
            this.msgTitle = '';
            this.blockListForm.reset();
            this.addAddressComponent.addAddressForm.reset();
            this.addAddressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
            this.addAddressComponent.addAddressFormm.controls["addressCountrySelected"].setValue("USA");
            this.descLength = 255;
            this.IsDeactivate = false;
            this.IsUpdate = false;
            this.IsReset = true;
            this.IsSubmit = true;
            this.isUpdateReset = false;
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while insering the Blocklist details.";
            this.msgTitle = '';
          }
        },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
    }
  }

  setValues() {
    this.addBlockList.CustomerId = this.blockListForm.value.account;
    this.addBlockList.FirstName = this.blockListForm.value.firstName;
    this.addBlockList.LastName = this.blockListForm.value.lastName;
    this.addBlockList.MiddleName = this.blockListForm.value.middleName;
    this.addBlockList.Line1 = this.addAddressComponent.addAddressForm.value.addressLine1;
    this.addBlockList.Line2 = this.addAddressComponent.addAddressForm.value.addressLine2;
    this.addBlockList.Line3 = this.addAddressComponent.addAddressForm.value.addressLine3;
    this.addBlockList.Zip1 = this.addAddressComponent.addAddressForm.value.addressZip1;
    this.addBlockList.Zip2 = this.addAddressComponent.addAddressForm.value.addressZip2;
    this.addBlockList.State = this.addAddressComponent.addAddressForm.value.addressStateSelected;
    this.addBlockList.Country = this.addAddressComponent.addAddressForm.value.addressCountrySelected;
    this.addBlockList.City = this.addAddressComponent.addAddressForm.value.addressCity;
    this.addBlockList.EmailAddress = this.blockListForm.value.email;
    this.addBlockList.PhoneNumber = this.blockListForm.value.phone;
    this.addBlockList.VehicleNumber = this.blockListForm.value.plate;
    this.addBlockList.CCNumber = this.blockListForm.value.creditCard;
    this.addBlockList.FlagReason = this.blockListForm.value.description;
    this.addBlockList.FlagIndicator = true;
  }

  updateBlockLists() {
    this.setValues();
    this.addorRemoveValidation();
    if (this.blockListForm.valid && this.addAddressComponent.addAddressForm.valid) {
      this.addBlockList.BlockListId = this.blockListId;
      this.addBlockList.UpdatedUser = this.Context.customerContext.userName;
      this.addBlockList.UpdatedDateTime = new Date();
      this.addBlockList.CreatedUser = this.Context.customerContext.userName;
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.UPDATE];
      this.customerAccService.updateBlockList(this.addBlockList, userEvents).subscribe(
        res => {
          if (res) {
            let userEvents = null;
            this.getBlockListData(this.p, userEvents);
            this.blockListForm.reset();
            this.enableFeilds();
            this.addAddressComponent.addAddressForm.reset();
            this.addAddressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
            this.addAddressComponent.addAddressForm.controls["addressCountrySelected"].setValue("USA");
            this.IsDeactivate = false;
            this.IsUpdate = false;
            this.IsReset = true;
            this.isUpdateReset = false;
            this.IsSubmit = true;
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = 'Blocklist details updated successfully.';
            this.msgTitle = '';
            this.descLength = 255;
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while updating the Blocklist details.";
            this.msgTitle = '';
          }
        },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
    }
  }

  deleteBlockLists() {
    this.addBlockList = <IBlocklistRequest>{};
    this.addBlockList.BlockListId = this.blockListId;
    this.addBlockList.UpdatedUser = this.Context.customerContext.userName;
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.DEACTIVATE];
    this.customerAccService.deleteBlockList(this.addBlockList, userEvents).subscribe(
      res => {
        if (res) {
          this.enableFeilds();
          let userEvents = null;
          this.getBlockListData(this.p, userEvents);
          this.blockListForm.reset();
          this.addAddressComponent.addAddressForm.reset();
          this.addAddressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
          this.addAddressComponent.addAddressForm.controls["addressCountrySelected"].setValue("USA");
          this.IsDeactivate = false;
          this.IsUpdate = false;
          this.IsReset = true;
          this.isUpdateReset = false;
          this.IsSubmit = true;
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgDesc = 'Blocklist details deactivated successfully.';
          this.msgTitle = '';
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = 'Error while deactivating the Blocklist details.';
          this.msgTitle = '';
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  getBlockListById(blockListId: number) {
    this.blockListId = blockListId;
    this.customerAccService.getBlockListById(blockListId).subscribe(
      res => {
        if (res) {
          this.blocklistResponse = res;
          this.bindAddressDetail();
          this.addorRemoveValidation();
          this.changeZipValidations(this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].value, this.IsDeactivate)
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while getting the block list details";
          this.msgTitle = '';
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  bindAddressDetail() {
    this.blockListForm.patchValue({
      account: this.blocklistResponse.CustomerId == 0 ? "" : this.blocklistResponse.CustomerId,
      firstName: this.blocklistResponse.FirstName,
      middleName: this.blocklistResponse.MiddleName,
      lastName: this.blocklistResponse.LastName,
      email: this.blocklistResponse.EmailAddress,
      phone: this.blocklistResponse.PhoneNumber,
      creditCard: this.blocklistResponse.CCSuffix,
      description: this.blocklistResponse.FlagReason,
      plate: this.blocklistResponse.VehicleNumber
    });

    this.addAddressComponent.addAddressForm.patchValue({
      addressCountrySelected: this.blocklistResponse.Country,
      addressLine1: this.blocklistResponse.Line1,
      addressLine2: this.blocklistResponse.Line2,
      addressLine3: this.blocklistResponse.Line3,
      addressZip1: this.blocklistResponse.Zip1,
      addressZip2: this.blocklistResponse.Zip2,
      addressStateSelected: this.blocklistResponse.State,
      addressCity: this.blocklistResponse.City
    });

    this.addressRequest.Line1 = this.blocklistResponse.Line1;
    this.addressRequest.Line2 = this.blocklistResponse.Line2;
    this.addressRequest.Line3 = this.blocklistResponse.Line3;
    this.addressRequest.Zip1 = this.blocklistResponse.Zip1;
    this.addressRequest.Zip2 = this.blocklistResponse.Zip2;
    this.addressRequest.State = this.blocklistResponse.State;
    this.addressRequest.Country = this.blocklistResponse.Country;
    this.addressRequest.City = this.blocklistResponse.City;

    if (this.blockListForm.controls['creditCard'].value)
      this.blockListForm.get('creditCard').disable();
    let str = this.blockListForm.controls['description'].value;
    this.descLength = 255 - str.length;
    this.isEditable = true;
  }

  initialFormValues() {
    this.blockListForm = new FormGroup({
      account: new FormControl('', [Validators.required, Validators.pattern(this.validateNumberPattern)]),
      firstName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)])),
      middleName: new FormControl('', Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)])),
      lastName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      phone: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      plate: new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      creditCard: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(16), Validators.pattern(this.validateNumberPattern)])),
      description: new FormControl('', Validators.compose([Validators.required]))
    });
  }

  addorRemoveValidation() {
    if ((this.blockListForm.value.account == "" || this.blockListForm.value.account == null) && (this.blockListForm.value.firstName == "" || this.blockListForm.value.firstName == null) &&
      (this.blockListForm.value.middleName == "" || this.blockListForm.value.middleName == null) && (this.blockListForm.value.lastName == "" || this.blockListForm.value.lastName == null) &&
      (this.blockListForm.value.email == "" || this.blockListForm.value.email == null) && (this.blockListForm.value.phone == "" || this.blockListForm.value.phone == null) &&
      (this.blockListForm.get('creditCard').value == "" || this.blockListForm.get('creditCard').value == null) && (this.blockListForm.value.plate == "" || this.blockListForm.value.plate == null) &&
      (this.addAddressComponent.addAddressForm.value.addressLine1 == "" || this.addAddressComponent.addAddressForm.value.addressLine1 == null) && (this.addAddressComponent.addAddressForm.value.addressLine2 == "" || this.addAddressComponent.addAddressForm.value.addressLine2 == null)
      && (this.addAddressComponent.addAddressForm.value.addressLine3 == "" || this.addAddressComponent.addAddressForm.value.addressLine3 == null) && (this.addAddressComponent.addAddressForm.value.addressZip1 == "" || this.addAddressComponent.addAddressForm.value.addressZip1 == null)
      && (this.addAddressComponent.addAddressForm.value.addressZip2 == "" || this.addAddressComponent.addAddressForm.value.addressZip2 == null)
      && (this.addAddressComponent.addAddressForm.value.addressStateSelected == "" || this.addAddressComponent.addAddressForm.value.addressStateSelected == null) &&
      (this.addAddressComponent.addAddressForm.value.addressCity == "" || this.addAddressComponent.addAddressForm.value.addressCity == null)) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Please enter mandotory details";
      this.msgTitle = '';
    }
    else {
      // to check the account block
      if (this.blockListForm.value.account) {
        this.blockListForm.controls['account'].setValidators([Validators.required, Validators.pattern(this.validateNumberPattern)]);
        this.blockListForm.controls['account'].updateValueAndValidity();
      }
      else {
        this.blockListForm.controls['account'].setValidators([]);
        this.blockListForm.controls['account'].updateValueAndValidity();
      }

      // to check the name block
      if (this.blockListForm.value.firstName || this.blockListForm.value.lastName ||
        this.blockListForm.value.middleName) {
        if (this.blockListForm.value.firstName) {
          this.blockListForm.controls["firstName"].setValidators(Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]));
          this.blockListForm.controls['firstName'].updateValueAndValidity();
        }
        else {
          this.blockListForm.controls["firstName"].setValidators(Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]));
          this.blockListForm.controls['firstName'].updateValueAndValidity();
        }
        if (this.blockListForm.value.middleName) {
          this.blockListForm.controls["middleName"].setValidators(Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]));
          this.blockListForm.controls['middleName'].updateValueAndValidity();
        }
        else {
          this.blockListForm.controls["middleName"].setValidators(Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]));
          this.blockListForm.controls['middleName'].updateValueAndValidity();
        }
        if (this.blockListForm.value.lastName) {
          this.blockListForm.controls["lastName"].setValidators(Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)]));
          this.blockListForm.controls['lastName'].updateValueAndValidity();
        }
        else {
          this.blockListForm.controls["lastName"].setValidators(Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)]));
          this.blockListForm.controls['lastName'].updateValueAndValidity();
        }
      }
      else {
        this.blockListForm.controls["firstName"].setValidators([]);
        this.blockListForm.controls['firstName'].updateValueAndValidity();
        this.blockListForm.controls["middleName"].setValidators([]);
        this.blockListForm.controls['middleName'].updateValueAndValidity();
        this.blockListForm.controls["lastName"].setValidators([]);
        this.blockListForm.controls['lastName'].updateValueAndValidity();
      }

      if (this.addAddressComponent.addAddressForm.value.addressLine1 || this.addAddressComponent.addAddressForm.value.addressLine2 ||
        this.addAddressComponent.addAddressForm.value.addressLine3 || this.addAddressComponent.addAddressForm.valueaddressZip1 ||
        this.addAddressComponent.addAddressForm.value.addressZip2 || this.addAddressComponent.addAddressForm.value.addressStateSelected ||
        this.addAddressComponent.addAddressForm.value.addressCity) {
        if (this.addAddressComponent.addAddressForm.value.addressLine1) {
          this.addAddressComponent.addAddressForm.controls["addressLine1"].setValidators(Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine1'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls["addressLine1"].setValidators(Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine1'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressLine2) {
          this.addAddressComponent.addAddressForm.controls['addressLine2'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine2'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressLine2'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine2'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressLine3) {
          this.addAddressComponent.addAddressForm.controls['addressLine3'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine3'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressLine3'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressLine3'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressZip1) {
          this.addAddressComponent.addAddressForm.controls['addressZip1'].setValidators(Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]));
          this.addAddressComponent.addAddressForm.controls['addressZip1'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressZip1'].setValidators(Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]));
          this.addAddressComponent.addAddressForm.controls['addressZip1'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressZip2) {
          this.addAddressComponent.addAddressForm.controls['addressZip2'].setValidators(Validators.compose([Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]));
          this.addAddressComponent.addAddressForm.controls['addressZip2'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressZip2'].setValidators(Validators.compose([Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]));
          this.addAddressComponent.addAddressForm.controls['addressZip2'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressCity) {
          this.addAddressComponent.addAddressForm.controls['addressCity'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressCity'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressCity'].setValidators(Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)]));
          this.addAddressComponent.addAddressForm.controls['addressCity'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressStateSelected) {
          this.addAddressComponent.addAddressForm.controls['addressStateSelected'].setValidators(Validators.compose([Validators.required]));
          this.addAddressComponent.addAddressForm.controls['addressStateSelected'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressStateSelected'].setValidators(Validators.compose([Validators.required]));
          this.addAddressComponent.addAddressForm.controls['addressStateSelected'].updateValueAndValidity();
        }
        if (this.addAddressComponent.addAddressForm.value.addressCountrySelected) {
          this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].setValidators(Validators.compose([Validators.required]));
          this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].updateValueAndValidity();
        }
        else {
          this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].setValidators(Validators.compose([Validators.required]));
          this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].updateValueAndValidity();
        }
      }
      else {
        this.addAddressComponent.addAddressForm.controls['addressLine1'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressLine2'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressLine3'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressZip1'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressZip2'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressCity'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressStateSelected'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].setValidators([]);
        this.addAddressComponent.addAddressForm.controls['addressLine1'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressLine2'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressLine3'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressZip1'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressZip2'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressCity'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressStateSelected'].updateValueAndValidity();
        this.addAddressComponent.addAddressForm.controls['addressCountrySelected'].updateValueAndValidity();
      }

      // to check the email block
      if (this.blockListForm.value.email) {
        this.blockListForm.controls["email"].setValidators(Validators.compose([Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)]));
        this.blockListForm.controls['email'].updateValueAndValidity();
      }
      else {
        this.blockListForm.controls["email"].setValidators([]);
        this.blockListForm.controls['email'].updateValueAndValidity();
      }

      // to check the phone block
      if (this.blockListForm.value.phone) {
        this.blockListForm.controls["phone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
        this.blockListForm.controls['phone'].updateValueAndValidity();
      }
      else {
        this.blockListForm.controls["phone"].setValidators([]);
        this.blockListForm.controls['phone'].updateValueAndValidity();
      }

      // to check the credit card block
      if (this.blockListForm.value.creditCard) {
        this.blockListForm.controls["creditCard"].setValidators(Validators.compose([Validators.required, Validators.minLength(15), Validators.maxLength(16), Validators.pattern(this.validateNumberPattern)]));
        this.blockListForm.controls['creditCard'].updateValueAndValidity();
      }
      else {
        this.blockListForm.controls["creditCard"].setValidators([]);
        this.blockListForm.controls['creditCard'].updateValueAndValidity();
      }

      // to check the plate block
      if (this.blockListForm.value.plate) {
        this.blockListForm.controls["plate"].setValidators(Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateAlphNemericsandSpacePattern)]));
        this.blockListForm.controls['plate'].updateValueAndValidity();
      }
      else {
        this.blockListForm.controls["plate"].setValidators([]);
        this.blockListForm.controls['plate'].updateValueAndValidity();
      }
      this.validateAllFormFields(this.addAddressComponent.addAddressForm);
      this.validateAllFormFields(this.blockListForm);
    }
  }

  deleteBlockList(blkList) {
    this.getBlockListById(blkList.BlockListId);
    this.IsUpdate = false;
    this.IsSubmit = false;
    this.IsDeactivate = true;
    this.IsReset = false;
    this.isUpdateReset = false;
    this.disableFeilds();
  }

  editBlockList(blkList) {
    this.IsUpdate = true;
    this.IsSubmit = false;
    this.IsDeactivate = true;
    this.IsReset = false;
    this.isUpdateReset = true;
    this.getBlockListById(blkList.BlockListId);
    this.enableFeilds();
  }

  disableFeilds() {
    this.blockListForm.get('account').disable();
    this.blockListForm.get('firstName').disable();
    this.blockListForm.get('middleName').disable();
    this.blockListForm.get('lastName').disable();
    this.blockListForm.get('email').disable();
    this.blockListForm.get('phone').disable();
    this.blockListForm.get('plate').disable();
    this.blockListForm.get('creditCard').disable();
    this.blockListForm.get('description').disable();
    this.addAddressComponent.addAddressForm.get('addressLine1').disable();
    this.addAddressComponent.addAddressForm.get('addressLine2').disable();
    this.addAddressComponent.addAddressForm.get('addressLine3').disable();
    this.addAddressComponent.addAddressForm.get('addressZip1').disable();
    this.addAddressComponent.addAddressForm.get('addressZip2').disable();
    this.addAddressComponent.addAddressForm.get('addressStateSelected').disable();
    this.addAddressComponent.addAddressForm.get('addressCountrySelected').disable();
    this.addAddressComponent.addAddressForm.get('addressCity').disable();
    this.IsDeactivate = true;
    this.IsUpdate = false;
    this.IsReset = false;
    this.isUpdateReset = false;
    this.IsSubmit = false;
  }

  enableFeilds() {
    this.blockListForm.get('account').enable();
    this.blockListForm.get('firstName').enable();
    this.blockListForm.get('middleName').enable();
    this.blockListForm.get('lastName').enable();
    this.blockListForm.get('email').enable();
    this.blockListForm.get('phone').enable();
    this.blockListForm.get('plate').enable();
    this.blockListForm.get('creditCard').enable();
    this.blockListForm.get('description').enable();
    this.addAddressComponent.addAddressForm.get('addressLine1').enable();
    this.addAddressComponent.addAddressForm.get('addressLine2').enable();
    this.addAddressComponent.addAddressForm.get('addressLine3').enable();
    this.addAddressComponent.addAddressForm.get('addressZip1').enable();
    this.addAddressComponent.addAddressForm.get('addressZip2').enable();
    this.addAddressComponent.addAddressForm.get('addressStateSelected').enable();
    this.addAddressComponent.addAddressForm.get('addressCountrySelected').enable();
    this.addAddressComponent.addAddressForm.get('addressCity').enable();
    this.IsDeactivate = false;
    this.IsUpdate = true;
    this.IsReset = false;
    this.isUpdateReset = true;
    this.IsSubmit = false;
  }

  // to show the how many characters are left for plan description
  descEvent(event: any) {
    this.descLength = 255 - event.target.value.length
  }

  reset() {
    this.enableFeilds();
    this.blockListForm.reset();
    this.addAddressComponent.addAddressForm.reset();
    this.addAddressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
    this.addAddressComponent.addAddressForm.controls["addressCountrySelected"].setValue("USA");
    this.descLength = 255;
    this.IsDeactivate = false;
    this.IsUpdate = false;
    this.IsReset = true;
    this.IsSubmit = true;
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.formcontrolname.value;
    //console.log(objId);
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.blockListForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      // console.log(phone);
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.blockListForm.controls[objId].setValue(phone);
    }
  }

  changeZipValidations(countryCode: string, isDeactivate: boolean) {
    const ctrl = this.addAddressComponent.addAddressForm.get('addressZip2');
    switch (countryCode) {
      case "USA":
        this.zipMinlength = 5;
        this.zipMaxlength = 5;
        if (isDeactivate)
          ctrl.disable();
        else
          ctrl.enable();
        break;
      default:
        this.zipMinlength = 6;
        this.zipMaxlength = 6;
        ctrl.disable();
        break;
    }
  }

  validateAllFeilds() {
    this.blockListForm.controls["account"].markAsTouched({ onlySelf: true });
    this.blockListForm.controls["description"].markAsTouched({ onlySelf: true });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  updateReset() {
    this.getBlockListById(this.blockListId);
    this.addorRemoveValidation();
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.BLOCKLIST];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.Context.customerContext.roleID);
    this.userEventRequest.UserName = this.Context.customerContext.userName;
    this.userEventRequest.LoginId = this.Context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
