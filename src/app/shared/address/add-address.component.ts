import { Component, OnInit, Renderer, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { ICommonResponse, ICommon } from "../models/commonresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IAddressRequest } from "../models/addressrequest";
import { ActivitySource, SubSystem, AddressTypes } from '../constants';
import { IAddressResponse } from '../models/addressresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IUserresponse } from '../models/userresponse';
import { SessionService } from './../services/session.service'
import { MaterialscriptService } from "../materialscript.service";
//import { IAddressCreditCardResponse } from "../models/addresscreditcardresponse";
import { AddressCreditcardService } from "../services/addresscreditcarddetails.context.service";

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss']
})
export class AddAddressComponent implements OnInit {
  // addressType: string;
  addressRes: Array<any>;
  addressStates: ICommonResponse[];
  addressCountries: ICommonResponse[];
  common: ICommon = <ICommon>{};
  zipMinlength: number = 5;
  zipMaxlength: number = 5;

  @Input() customerID: number; //Customer ID for store address
  @Input() addressValue: string; // Type to identify address type
  @Input() addressType: string;
  @Input("IsAddressButton") isAddressButton: boolean; // Type to identify address type
  @Input() addressID: number; //Customer ID for store address
  //Address flag can be 'add'/'update',
  //if 'add' then address will be added 
  //if 'update' then address will be updated other wise form will be loaded 
  @Input() addressFlag: string;
  @Input() isEnable: boolean;
  @Input() addressObject: IAddressResponse;

  //Validation Pattern
  validateNumberPattern = "[0-9]*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";

  sessionContextResponse: IUserresponse;

  // Form group 
  addAddressForm: FormGroup;
  addAddress: IAddressRequest = <IAddressRequest>{};
  addressResponse: IAddressResponse;
  //addrType: string = AddressTypes.Business.toString();

  //Logger User Info
  userName: string
  userId: number
  loginId: number
  //Create status message 
  message: string;
  status: boolean;

  //Input from other module 
  userInputs: IaddAddressInputs = <IaddAddressInputs>{};

  constructor(private sessionService: SessionService, private addressCreditcardService: AddressCreditcardService, private commonService: CommonService, public renderer: Renderer, private router: Router, private materialscriptService: MaterialscriptService) {

  }
  ngOnInit() {
    //  console.log("isAddressButton in address : ", this.isAddressButton);
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.userInputs.loginId = this.sessionContextResponse.loginId;
    this.userInputs.userId = this.sessionContextResponse.userId;
    this.userInputs.userName = this.sessionContextResponse.userName;
    this.userInputs.accountId = this.customerID;
    this.addAddressForm = new FormGroup({
      'addressLine1': new FormControl({ value: '', disabled: this.isEnable }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      'addressLine2': new FormControl({ value: '', disabled: this.isEnable }, [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      'addressLine3': new FormControl({ value: '', disabled: this.isEnable }, [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      'addressStateSelected': new FormControl({ value: '', disabled: this.isEnable }, [Validators.required]),
      'addressZip1': new FormControl({ value: '', disabled: this.isEnable }, [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]),
      'addressZip2': new FormControl({ value: '', disabled: this.isEnable }, [Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]),
      'addressCountrySelected': new FormControl({ value: '', disabled: this.isEnable }, [Validators.required]),
      'addressCity': new FormControl({ value: '', disabled: this.isEnable }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])
    });

    // Call Countries method to bind all countries 
    this.getCountry();
    let addressContext: IAddressResponse = <IAddressResponse>{};
    this.addressCreditcardService.currentContext.subscribe(customerContext => addressContext = customerContext);
    if (addressContext) {
      if (this.addressValue == "exist") {
        this.addressObject = addressContext;
      }
    }

    if (this.addressObject != null) {
      this.addressResponse = this.addressObject;
      this.bindAddressDetails();
    }
    else {
      if (this.addressFlag == "" || this.addressFlag == null) {
        if (this.customerID > 0 && this.customerID != null) {
          //get address based on the address type
          if (this.router.url.endsWith('/add-credit-card-details') && this.addressValue === "exist") {
            this.addressType = null;
          }
          if (this.addressType != null && this.addressType != "") {
            this.commonService.getAddressByTypeCustomer(this.addressType, this.customerID.toString()).subscribe(res => {
              if (res) {
                this.addressResponse = res;
                console.log("addressResponse 2: ", this.addressResponse);
                this.bindAddressDetails();
              }
              else {
                this.getDefaultCountry();
              }
            });
          }
          else // get default address
          {
            this.commonService.getDefaultAddress(this.customerID.toString()).subscribe(res => {
              this.addressResponse = res;
              this.bindAddressDetails();
            });
          }
        }
        else
          this.getDefaultCountry();
      }
      else //add or updated address
      {
        if (this.addressFlag == "add")//create Address 
        {
          this.createAddress();
          this.getDefaultCountry();
        }
        else if (this.addressFlag == "update") //update Address 
        {
          this.updateAddress();
        }
        else {
          this.getDefaultCountry();
        }
      }
    }
  }

  //Get all countries 
  getCountry() {
    this.commonService.getCountries().subscribe(res => this.addressCountries = res);
  }

  changeCountry(countryCode: string) {
    this.addAddressForm.controls["addressStateSelected"].setValue("");
    this.addAddressForm.controls["addressZip1"].setValue("");
    this.addAddressForm.controls["addressZip2"].setValue("");
    this.changeZipValidations(countryCode);
    this.getStatesByCountry(countryCode);
  }

  //Method to get states based on the Country code passed
  getStatesByCountry(countryCode: string) {
    this.common.CountryCode = countryCode;
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.addressStates = res;
    });

  }

  //Creating Address
  createAddress() {
    if (this.addAddressForm.valid) {
      this.storeAddressDetails();
      this.commonService.createAddress(this.addAddress).subscribe(res => {
        if (res) {
          this.message = "Address Created SuccessFully";
          this.addAddressForm.reset();
        }
        else
          this.message = "Error occured while creating address";
      });
    }
  }

  //Creating Address
  updateAddress() {
    if (this.addAddressForm.valid) {
      this.storeAddressDetails();
      this.commonService.updateAddress(this.addAddress).subscribe(res => {
        if (res) {
          this.message = "Address Updated SuccessFully";
          this.addAddressForm.reset();
        }
        else
          this.message = "Error occured while creating address";
      });
    }
  }

  //common method for add or update address details
  private storeAddressDetails() {
    this.addAddress.CustomerId = this.userInputs.accountId;
    this.addAddress.Type = this.addressType;
    this.addAddress.Line1 = this.addAddressForm.value.addressLine1;
    this.addAddress.Line2 = this.addAddressForm.value.addressLine2;
    this.addAddress.Line3 = this.addAddressForm.value.addressLine3;
    this.addAddress.City = this.addAddressForm.value.addressCity;
    this.addAddress.State = this.addAddressForm.value.addressStateSelected;
    this.addAddress.Country = this.addAddressForm.value.addressCountrySelected;
    this.addAddress.Zip1 = this.addAddressForm.value.addressZip1;
    this.addAddress.Zip2 = this.addAddressForm.value.addressZip2;
    this.addAddress.IsPreferred = true;
    this.addAddress.UserName = this.userInputs.userName;
    this.addAddress.IsActive = true;
    this.addAddress.SubSystem = SubSystem.CSC.toString();
    this.addAddress.ActivitySource = ActivitySource.Internal.toString();
    this.addAddress.UserId = this.userInputs.userId;
    this.addAddress.LoginId = this.userInputs.loginId;
  }

  // get default country and bind states
  getDefaultCountry() {
    var defaultCountry: string;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.DefaultCountry).subscribe(res => {
      defaultCountry = res;
      this.addAddressForm.controls["addressCountrySelected"].setValue(defaultCountry);
      this.changeZipValidations(defaultCountry);
      this.getStatesByCountry(defaultCountry);
    });
  }

  private bindAddressDetails() {
    if (this.addressResponse.Country != "") {
      this.addAddressForm.patchValue({
        addressCountrySelected: this.addressResponse.Country
      });
      this.getStatesByCountry(this.addressResponse.Country);
      this.changeZipValidations(this.addressResponse.Country);

    }
    if (this.addressResponse.Line1 != null) {
      this.addAddressForm.patchValue({
        addressLine1: this.addressResponse.Line1 ? this.addressResponse.Line1.trim() : ""
      });
    }
    if (this.addressResponse.Line2 != null) {
      this.addAddressForm.patchValue({
        addressLine2: this.addressResponse.Line2 ? this.addressResponse.Line2.trim() : ""
      });
    }
    if (this.addressResponse.Line3 != null) {
      this.addAddressForm.patchValue({
        addressLine3: this.addressResponse.Line3 ? this.addressResponse.Line3.trim() : ""
      });
    }
    if (this.addressResponse.City != "") {
      this.addAddressForm.patchValue({
        addressCity: this.addressResponse.City ? this.addressResponse.City.trim() : ""
      });
    }
    if (this.addressResponse.State != "") {
      this.addAddressForm.patchValue({
        addressStateSelected: this.addressResponse.State
      });
    }
    if (this.addressResponse.Zip1 != "") {
      this.addAddressForm.patchValue({
        addressZip1: this.addressResponse.Zip1
      });
    }
    if (this.addressResponse.Zip2 != "") {
      this.addAddressForm.patchValue({
        addressZip2: this.addressResponse.Zip2
      });
    }
    this.materialscriptService.material();
  }

  changeZipValidations(countryCode: string) {
    const ctrl = this.addAddressForm.get('addressZip2');
    switch (countryCode) {
      case "USA":
        this.zipMinlength = 5;
        this.zipMaxlength = 5;
        if (!this.isEnable) {
          ctrl.enable();
        }
        break;
      default:
        this.zipMinlength = 6;
        this.zipMaxlength = 6;
        if (!this.isEnable)
          ctrl.disable();
        break;
    }
    if (!this.isEnable) {
      this.addAddressForm.controls["addressZip1"].setValidators([Validators.required, Validators.minLength(this.zipMinlength), Validators.maxLength(this.zipMaxlength), Validators.pattern(this.validateNumberPattern)]);
      this.addAddressForm.controls["addressZip1"].updateValueAndValidity();
    }
  }
}

export interface IaddAddressInputs {
  userName: string
  loginId: number
  userId: number
  accountId: number
}

