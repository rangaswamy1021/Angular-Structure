import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { IPhoneRequest } from './../../shared/models/phonerequest';
import { PhoneType, AddressTypes, SubSystem, EmailType, SubFeatures } from './../../shared/constants';
import { ActivitySource, Actions, Features } from '../../shared/constants';
import { ICreateViolatorRequest } from './models/createviolatorrequest';
import { AddAddressComponent } from './../../shared/address/add-address.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserresponse } from './../../shared/models/userresponse';
import { DisputesService } from './services/disputes.service';
import { SessionService } from './../../shared/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from './../../shared/services/common.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IEmailRequest } from '../../shared/models/emailrequest';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { Location } from '@angular/common';
import { IUserEvents } from "../../shared/models/userevents";
import { DisputeContextService } from "./services/dispute.context.service";
import { IAffidavitRequest } from "./models/affidavitrequest";
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-create-violator',
  templateUrl: './create-violator.component.html',
  styleUrls: ['./create-violator.component.scss']
})
export class CreateViolatorComponent implements OnInit {

  constructor(private disputeService: DisputesService, private commonService: CommonService, private router: Router,
    private route: ActivatedRoute, private sessionContext: SessionService, private materialscriptService: MaterialscriptService, private violatorContext: ViolatorContextService, private _location: Location,
    private disputecontext: DisputeContextService) { }
  sessionContextResponse: IUserresponse;
  loginUserName: string;
  userId: number;
  loginId: number;
  accountId: number;
  titles = [];
  suffixes = [];
  genderTypes = [];
  createViolatorForm: FormGroup;
  validateNumberPattern = "[0-9]*";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";
  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.TVC];
  dayPhoneId: number;
  eveningPhoneId: number;
  mobilePhoneId: number;
  workPhoneId: number;
  extensionId: number;
  faxId: number;
  icnId: number;
  addDays: number;
  vehicleNumber: string;
  startEffectiveDate: Date;
  endEffectiveDate: Date;
  affidavitType: string;
  fileName: string;
  beforeTripIds: string;
  affdavitComments: string;
  disableButton: boolean;
  isSuffixOther: boolean;
  isPrimaryEmailExists: boolean;
  isSecondaryEmailExists: boolean;
  isSecondaryEmailError: boolean;
  secondaryEmailErrorMessage: string = "";

  isInvalidDayPhone: boolean;
  isInvalidEveningPhone: boolean;
  isInvalidMobilePhone: boolean;
  isInvalidWorkPhone: boolean;
  isInvalidFax: boolean;
  affdavitRequestId: number;
  objAffidavitsRequest: IAffidavitRequest;
  @ViewChild(AddAddressComponent) addressComponent;
  common: ICommon = <ICommon>{};

  ngOnInit() {
         this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (!this.sessionContextResponse) {
      let link = ['/'];
      this.router.navigate(link);
    }
    else {
      this.loginUserName = this.sessionContextResponse.userName;
      this.userId = this.sessionContextResponse.userId;
      this.loginId = this.sessionContextResponse.loginId;
      this.icnId = this.sessionContextResponse.icnId;
    }
    this.violatorContext.currentContext.subscribe(cntxt => {
      if (cntxt) {
        this.accountId = cntxt.accountId;
      }
    });

    this.route.queryParams.subscribe(params => {
      this.affdavitRequestId = params['affdavitRequestId']
      this.vehicleNumber = params['VehicleNumber'];
    });
    console.log(this.beforeTripIds);
    console.log(this.fileName);
    console.log(this.affidavitType);
    console.log(this.affdavitComments);
    console.log(this.startEffectiveDate);
    console.log(this.endEffectiveDate);
    console.log(this.vehicleNumber);
    this.disputecontext.currentContext.subscribe(disputecontext => this.objAffidavitsRequest = disputecontext);


    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => res);
    this.disableButton = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.CREATEVIOLATOR], "");

    this.bindDropdowns();
    this.initialFormValues();
  }

  bindDropdowns() {
    this.commonService.getTitleLookups().subscribe(res => { this.titles = res; });
    this.commonService.getSuffixLookups().subscribe(res => { this.suffixes = res; });
    this.commonService.getGenderLookups().subscribe(res => { this.genderTypes = res; });
  }

  initialFormValues() {
    this.createViolatorForm = new FormGroup({
      titleSelected: new FormControl(''),
      suffixSelected: new FormControl(''),
      suffixOther: new FormControl(''),
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      middleName: new FormControl('', [Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)]),
      genderSelected: new FormControl(''),
      primaryEmail: new FormControl('', [Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)]),
      secondaryEmail: new FormControl('', [Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]),
      preferredEmail: new FormControl(''),
      dayPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      eveningPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      mobilePhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      workPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      ext: new FormControl('', [Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)]),
      fax: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      preferredPhone: new FormControl('')

    });
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.createViolatorForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.createViolatorForm.controls[objId].setValue(phone);
    }
  }

  validateDayPhoneAllZeros() {
    if (this.createViolatorForm.controls["dayPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createViolatorForm.value.dayPhone))
        this.isInvalidDayPhone = true;
      else
        this.isInvalidDayPhone = false;
    }
    else
      this.isInvalidDayPhone = false;
  }

  validateEveningPhoneAllZeros() {
    if (this.createViolatorForm.controls["eveningPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createViolatorForm.value.eveningPhone))
        this.isInvalidEveningPhone = true;
      else
        this.isInvalidEveningPhone = false;
    }
    else
      this.isInvalidEveningPhone = false;
  }

  validateMobilePhoneAllZeros() {
    if (this.createViolatorForm.controls["mobilePhone"].valid) {
      if (this.validateAllZerosinPhone(this.createViolatorForm.value.mobilePhone))
        this.isInvalidMobilePhone = true;
      else
        this.isInvalidMobilePhone = false;
    }
    else
      this.isInvalidMobilePhone = false;
  }

  validateWorkPhoneAllZeros() {
    if (this.createViolatorForm.controls["workPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createViolatorForm.value.workPhone))
        this.isInvalidWorkPhone = true;
      else
        this.isInvalidWorkPhone = false;
    }
    else
      this.isInvalidWorkPhone = false;
  }

  validateFaxAllZeros() {
    if (this.createViolatorForm.controls["fax"].valid) {
      if (this.validateAllZerosinPhone(this.createViolatorForm.value.fax))
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

  changePhoneValidation(phoneType) {
    this.createViolatorForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createViolatorForm.controls["eveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createViolatorForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    if (this.createViolatorForm.controls["ext"].value)
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    if (phoneType == "DayPhone")
      this.createViolatorForm.controls["dayPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "EveningPhone")
      this.createViolatorForm.controls["eveningPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "MobileNo")
      this.createViolatorForm.controls["mobilePhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createViolatorForm.controls['dayPhone'].updateValueAndValidity();
    this.createViolatorForm.controls["eveningPhone"].updateValueAndValidity();
    this.createViolatorForm.controls['mobilePhone'].updateValueAndValidity();
    this.createViolatorForm.controls["workPhone"].updateValueAndValidity();
  }

  changeExtension() {
    if (this.createViolatorForm.controls["ext"].value)
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else {
      if (this.createViolatorForm.controls["workPhone"].value) {
        if (this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone]) {
          this.createViolatorForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
        }
        else
          this.createViolatorForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      } else
        this.createViolatorForm.controls["workPhone"].setValidators([]);
    }
    this.createViolatorForm.controls["workPhone"].updateValueAndValidity();
  }

  changeEmailValidation(emailType) {
    if (emailType == "PrimaryEmail") {
      this.createViolatorForm.controls["primaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      this.createViolatorForm.controls["secondaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
    }
    else {
      this.createViolatorForm.controls["primaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      this.createViolatorForm.controls["secondaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);

    }
    this.createViolatorForm.controls['primaryEmail'].updateValueAndValidity();
    this.createViolatorForm.controls["secondaryEmail"].updateValueAndValidity();
  }

  createPhoneList(): IPhoneRequest[] {
    var phoneRequestArray: IPhoneRequest[] = [];
    var phoneRequest: IPhoneRequest;

    if (this.createViolatorForm.value.dayPhone) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createViolatorForm.value.dayPhone;
      phoneRequest.Type = PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCommunication = this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.DayPhone];
      phoneRequestArray.push(phoneRequest);
    }
    if (this.createViolatorForm.value.eveningPhone) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createViolatorForm.value.eveningPhone;
      phoneRequest.Type = PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCommunication = this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone];
      phoneRequestArray.push(phoneRequest);
    }
    if (this.createViolatorForm.value.mobilePhone) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createViolatorForm.value.mobilePhone;
      phoneRequest.Type = PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCommunication = this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.MobileNo];
      phoneRequestArray.push(phoneRequest);
    }
    if (this.createViolatorForm.value.workPhone) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createViolatorForm.value.workPhone;
      phoneRequest.Type = PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCommunication = this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone];
      phoneRequest.Extension = this.createViolatorForm.value.ext;
      phoneRequestArray.push(phoneRequest);
    }
    if (this.createViolatorForm.value.fax) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createViolatorForm.value.fax;
      phoneRequest.Type = PhoneType[PhoneType.Fax];
      phoneRequest.IsCommunication = false;
      phoneRequestArray.push(phoneRequest);
    }
    if (phoneRequestArray.length > 0)
      phoneRequestArray[0].IsActivityRequired = true;
    return phoneRequestArray;
  }

  createEmailList(): IEmailRequest[] {
    var emailRequestArray: IEmailRequest[] = [];
    var emailRequest: IEmailRequest;
    if (this.createViolatorForm.value.primaryEmail) {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.loginUserName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.createViolatorForm.value.primaryEmail;
      emailRequest.Type = EmailType[EmailType.PrimaryEmail];
      emailRequest.IsPreferred = this.createViolatorForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }

    if (this.createViolatorForm.value.secondaryEmail) {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.loginUserName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.createViolatorForm.value.secondaryEmail;
      emailRequest.Type = EmailType[EmailType.SecondaryEmail];
      emailRequest.IsPreferred = this.createViolatorForm.value.preferredEmail == EmailType[EmailType.SecondaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }
    if (emailRequestArray.length > 0)
      emailRequestArray[0].IsActivityRequired = true;
    return emailRequestArray;
  }

  selectSuffix() {
    if (this.createViolatorForm.value.suffixSelected == 'Other') {
      this.createViolatorForm.controls["suffixOther"].setValidators([Validators.required, Validators.maxLength(5), Validators.pattern(this.validateAlphabetsPattern)]);
      this.isSuffixOther = true;
    }
    else {
      this.createViolatorForm.controls["suffixOther"].setValue("");
      this.createViolatorForm.controls["suffixOther"].setValidators([]);
      this.isSuffixOther = false;
    }
    this.createViolatorForm.controls["suffixOther"].updateValueAndValidity();
  }

  createViolator() {
    var violatorRequest: ICreateViolatorRequest = <ICreateViolatorRequest>{};
    if (this.icnId == 0) {
      this.errorMessageBlock("ICN is not assigned.");
      return false;
    }
    else {
      //this.errorMessageBlock("");
      this.addorRemoveValidators();
      if (!this.secondaryEmailErrorMessage && !this.isPrimaryEmailExists) {
        if (this.createViolatorForm.valid && this.addressComponent.addAddressForm.valid) {
          if (this.isInvalidDayPhone || this.isInvalidEveningPhone || this.isInvalidMobilePhone || this.isInvalidWorkPhone || this.isInvalidFax) {
            this.errorMessageBlock("Invalid phone number");
            return;
          }
           if (this.objAffidavitsRequest != null) {
            violatorRequest.ICNId = this.icnId;
            violatorRequest.LoginId = this.loginId;
            violatorRequest.UserId = this.userId;
            violatorRequest.CreatedUser = this.loginUserName;
            violatorRequest.CustomerId = this.accountId;
            if (this.createViolatorForm.value.dayPhone != null && this.createViolatorForm.value.dayPhone != '') {
              violatorRequest.PhoneNumber = this.createViolatorForm.value.dayPhone;
              violatorRequest.PhoneType = PhoneType[PhoneType.DayPhone];
            }
            if (this.createViolatorForm.value.eveningPhone != null && this.createViolatorForm.value.eveningPhone != '') {
              violatorRequest.PhoneNumber = this.createViolatorForm.value.eveningPhone;
              violatorRequest.PhoneType = PhoneType[PhoneType.EveningPhone];
            }
            if (this.createViolatorForm.value.mobilePhone != null && this.createViolatorForm.value.mobilePhone != '') {
              violatorRequest.PhoneNumber = this.createViolatorForm.value.mobilePhone;
              violatorRequest.PhoneType = PhoneType[PhoneType.MobileNo];
            }
            if (this.createViolatorForm.value.workPhone != null && this.createViolatorForm.value.workPhone != '') {
              violatorRequest.PhoneNumber = this.createViolatorForm.value.workPhone;
              violatorRequest.PhoneType = PhoneType[PhoneType.WorkPhone];
            }
            if (this.createViolatorForm.value.fax != null && this.createViolatorForm.value.fax != '') {
              violatorRequest.PhoneNumber = this.createViolatorForm.value.fax;
              violatorRequest.PhoneType = PhoneType[PhoneType.Fax];
            }
            violatorRequest.IsCommunication = true;
            violatorRequest.Extension = this.createViolatorForm.value.ext;
            //Address realted
            violatorRequest.Line1 = this.addressComponent.addAddressForm.value.addressLine1.trim();
            violatorRequest.Line2 = this.addressComponent.addAddressForm.value.addressLine2 ? this.addressComponent.addAddressForm.value.addressLine2.trim() : "";
            violatorRequest.Line3 = this.addressComponent.addAddressForm.value.addressLine3 ? this.addressComponent.addAddressForm.value.addressLine3.trim() : "";
            violatorRequest.City = this.addressComponent.addAddressForm.value.addressCity.trim();
            violatorRequest.State = this.addressComponent.addAddressForm.value.addressStateSelected;
            violatorRequest.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
            violatorRequest.Zip1 = this.addressComponent.addAddressForm.value.addressZip1;
            violatorRequest.Zip2 = this.addressComponent.addAddressForm.value.addressZip2;
            violatorRequest.AddressType = AddressTypes[AddressTypes.DmvAddr];
            violatorRequest.ActivitySource = this.activitySource;
            violatorRequest.SubSystem = this.subSystem;
            violatorRequest.UserName = this.loginUserName;
            violatorRequest.IsActive = true;
            violatorRequest.IsPreferred = true;
            // Creating Phone details
            violatorRequest.PhoneList = this.createPhoneList();
            // Creating Email details
            violatorRequest.EmailList = this.createEmailList();
            violatorRequest.FirstName = this.createViolatorForm.value.firstName;
            violatorRequest.MiddleName = this.createViolatorForm.value.middleName;
            violatorRequest.LastName = this.createViolatorForm.value.lastName;
            violatorRequest.Gender = this.createViolatorForm.value.genderSelected;
            violatorRequest.Title = this.createViolatorForm.value.title;
            violatorRequest.TxnDate = new Date();// DateTime.Now;
            violatorRequest.Suffix = this.createViolatorForm.value.suffixSelected == "Other" ? this.createViolatorForm.value.suffixOther : this.createViolatorForm.value.suffixSelected;
            violatorRequest.CitationCSV = this.beforeTripIds;

            let userEvents = <IUserEvents>{};
            userEvents.ActionName = Actions[Actions.TRANSFER];
            this.userEventsCalling(userEvents);
            $('#pageloader').modal('show');
            this.disableButton = true;
            this.disputeService.createViolator(violatorRequest, userEvents).subscribe(res => {
              $('#pageloader').modal('hide');
              this.disableButton = false;
              if (res > 0) {
                let transferedViolatorId = res;

                if (this.objAffidavitsRequest != null) {
                  this.objAffidavitsRequest.ToCustomerId = transferedViolatorId;
                }
                this.router.navigate(['tvc/disputes/non-liability', this.objAffidavitsRequest.AffidavitId]);
              }
              else {
                this.disableButton = false;
                this.errorMessageBlock("Error while creating violator");
              }
            }, err => {
              this.disableButton = false;
              $('#pageloader').modal('hide');
              this.errorMessageBlock(err.statusText);
            });
          }
          else {
            this.disableButton = false;
            this.errorMessageBlock("Unable to get the routing values.");
          }
        }
        else {
          this.validateAllFormFields(this.createViolatorForm);
          this.validateAllFormFields(this.addressComponent.addAddressForm);
        }
      }
    }
  }

  clearFields(): void {
    this.createViolatorForm.reset();
    this.createViolatorForm.controls["titleSelected"].setValue("");
    this.createViolatorForm.controls["suffixSelected"].setValue("");
    this.createViolatorForm.controls["genderSelected"].setValue("");
    this.createViolatorForm.controls["preferredEmail"].setValue("");
    this.createViolatorForm.controls["preferredPhone"].setValue("");
    this.addressComponent.addAddressForm.reset();
    //  this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue("");

    this.getDefaultCountry();
    this.addressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
    this.isInvalidDayPhone = false;
    this.isInvalidEveningPhone = false;
    this.isInvalidMobilePhone = false;
    this.isInvalidWorkPhone = false;
    this.isInvalidFax = false;
  }

  // get default country and bind states
  getDefaultCountry() {
    var defaultCountry: string;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.DefaultCountry).subscribe(res => {
      defaultCountry = res;
      this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue(defaultCountry);
      this.changeZipValidations(defaultCountry);
      this.getStatesByCountry(defaultCountry);
    });
  }

  //Method to get states based on the Country code passed
  getStatesByCountry(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.addressComponent.addressStates = res;
    });

  }

  changeZipValidations(countryCode: string) {
    const ctrl = this.addressComponent.addAddressForm.get('addressZip2');
    switch (countryCode) {
      case "USA":
        this.addressComponent.zipMinlength = 5;
        this.addressComponent.zipMaxlength = 5;
        if (!this.addressComponent.isEnable) {
          ctrl.enable();
        }
        break;
      default:
        this.addressComponent.zipMinlength = 6;
        this.addressComponent.zipMaxlength = 6;
        if (!this.addressComponent.isEnable)
          ctrl.disable();
        break;
    }
    if (!this.addressComponent.isEnable) {
      this.addressComponent.addAddressForm.controls["addressZip1"].setValidators([Validators.required, Validators.minLength(this.addressComponent.zipMinlength), Validators.maxLength(this.addressComponent.zipMaxlength), Validators.pattern(this.validateNumberPattern)]);
      this.addressComponent.addAddressForm.controls["addressZip1"].updateValueAndValidity();
    }
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

  checkPrimaryEmailExists() {
    if (this.createViolatorForm.controls["primaryEmail"].valid) {
      if (this.createViolatorForm.controls["secondaryEmail"].valid) {
        this.secondaryEmailErrorMessage = "";
        if (this.createViolatorForm.value.primaryEmail == this.createViolatorForm.value.secondaryEmail) {
          if (this.secondaryEmailErrorMessage != "")
            this.secondaryEmailErrorMessage += ", ";
          this.secondaryEmailErrorMessage += "Both emails should not be same";
        }
        if (this.secondaryEmailErrorMessage == "")
          this.isSecondaryEmailError = false;
        else
          this.isSecondaryEmailError = true;
      }
    }
    else
      this.isPrimaryEmailExists = false;
  }

  checkSecondaryEmailExists() {
    if (this.createViolatorForm.controls["secondaryEmail"].valid) {
      this.secondaryEmailErrorMessage = "";
      if (this.createViolatorForm.controls["primaryEmail"].valid) {
        if (this.createViolatorForm.value.primaryEmail == this.createViolatorForm.value.secondaryEmail) {
          if (this.secondaryEmailErrorMessage != "")
            this.secondaryEmailErrorMessage += ", ";
          this.secondaryEmailErrorMessage += "Both emails should not be same";
        }
      }
      if (this.secondaryEmailErrorMessage == "")
        this.isSecondaryEmailError = false;
      else
        this.isSecondaryEmailError = true;
    }
    else
      this.isSecondaryEmailError = false;
  }

  addorRemoveValidators() {
    // personal details block
    if (this.createViolatorForm.value.middleName)
      this.createViolatorForm.controls["middleName"].setValidators([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]);
    else
      this.createViolatorForm.controls["middleName"].setValidators([]);
    this.createViolatorForm.controls["workPhone"].updateValueAndValidity();

    // email block
    if (this.createViolatorForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail]) {
      this.createViolatorForm.controls["primaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      if (this.createViolatorForm.value.secondaryEmail) {
        this.createViolatorForm.controls["secondaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      }
      else
        this.createViolatorForm.controls["secondaryEmail"].setValidators([]);
    }
    else {
      this.createViolatorForm.controls["secondaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      if (this.createViolatorForm.value.primaryEmail) {
        this.createViolatorForm.controls["primaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      }
      else
        this.createViolatorForm.controls["primaryEmail"].setValidators([]);
    }
    this.createViolatorForm.controls['primaryEmail'].updateValueAndValidity();
    this.createViolatorForm.controls["secondaryEmail"].updateValueAndValidity();

    // phone block
    if (this.createViolatorForm.value.dayPhone)
      this.createViolatorForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["dayPhone"].setValidators([]);
    if (this.createViolatorForm.value.eveningPhone)
      this.createViolatorForm.controls["eveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["eveningPhone"].setValidators([]);
    if (this.createViolatorForm.value.mobilePhone)
      this.createViolatorForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["mobilePhone"].setValidators([]);
    if (this.createViolatorForm.value.workPhone)
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else {
      if (this.createViolatorForm.controls["ext"].value)
        this.createViolatorForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      else
        this.createViolatorForm.controls["workPhone"].setValidators([]);
    }

    if (this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.DayPhone])
      this.createViolatorForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone])
      this.createViolatorForm.controls["eveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (this.createViolatorForm.value.preferredPhone == PhoneType[PhoneType.MobileNo])
      this.createViolatorForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createViolatorForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    if (this.createViolatorForm.value.primaryEmail != '' && this.createViolatorForm.value.secondaryEmail != '') {
      this.createViolatorForm.value.preferredEmail = 'PrimaryEmail';
      this.createViolatorForm.controls["preferredEmail"].setValidators([Validators.required]);
      this.createViolatorForm.controls['preferredEmail'].updateValueAndValidity();
    }
    if (this.createViolatorForm.value.dayPhone != '' && this.createViolatorForm.value.eveningPhone != '' && this.createViolatorForm.value.MobileNo != '' && this.createViolatorForm.value.workPhone != '') {
      this.createViolatorForm.value.preferredPhone = PhoneType[PhoneType.DayPhone];
      this.createViolatorForm.controls["preferredPhone"].setValidators([Validators.required]);
      this.createViolatorForm.controls['preferredPhone'].updateValueAndValidity();
    }
    this.createViolatorForm.controls['dayPhone'].updateValueAndValidity();
    this.createViolatorForm.controls["eveningPhone"].updateValueAndValidity();
    this.createViolatorForm.controls['mobilePhone'].updateValueAndValidity();
    this.createViolatorForm.controls["workPhone"].updateValueAndValidity();
  }

  backClick() {
    this._location.back();
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.CREATEVIOLATOR];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}

export interface ICommon {
  LookUpTypeCode: string,
  CountryCode: string
}
