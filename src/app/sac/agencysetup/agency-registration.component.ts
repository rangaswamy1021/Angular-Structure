import { IAddressResponse } from './../../shared/models/addressresponse';
import { ICustomerResponse } from './../../shared/models/customerresponse';
import { RevenueCategory } from './../../payment/constants';
import { debug } from 'util';
import { CommonService } from './../../shared/services/common.service';
import { NameType } from './../../csc/customeraccounts/constants';
import { AddressTypes, ActivitySource, PhoneType, EmailType, AccountStatus, CustomerStatus, SubSystem, SourceOfEntry, LoginStatus, UserType } from './../../shared/constants';
import { IAddressRequest } from '../../shared/models/addressrequest';
import { IEmailRequest } from '../../shared/models/emailrequest';
import { IPhoneRequest } from '../../shared/models/phonerequest';
import { ICustomerRequest } from './../../shared/models/customerrequest';
import { Router, ActivatedRoute } from '@angular/router';
import { IAgencyResponse } from './models/agencyresponse';
import { IAgencyRequest } from './models/agencyrequest';
import { SessionService } from './../../shared/services/session.service';
import { AgencySetupService } from './services/agencysetup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AddAddressComponent } from './../../shared/address/add-address.component';
import { IUserEvents } from '../../shared/models/userevents';
import { Features, Actions } from '../../shared/constants';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-agency-registration',
  templateUrl: './agency-registration.component.html',
  styleUrls: ['./agency-registration.component.scss']
})
export class AgencyRegistrationComponent implements OnInit {
  errorBlock: boolean;
  successBlock: boolean;
  booIssendMail: any;
  isAddShow: boolean;
  isEditShow: boolean;
  isUpdatedClicked: boolean;
  @ViewChild(AddAddressComponent) addressComponent;
  agencyRegistrationForm: FormGroup;
  addRegistrationReq: IAgencyRequest = <IAgencyRequest>{};
  updateRegistrationReq: IAgencyRequest;
  addAgencyReq: IAgencyRequest = <IAgencyRequest>{};
  addRegistrationResp: IAgencyResponse[];
  customerReq: ICustomerRequest = <ICustomerRequest>{};
  updateCustomerReq: ICustomerRequest;
  agencyResp: IAgencyResponse;
  isUserNameExists: boolean;
  isAgencyCodeExists: boolean;
  isPrimaryEmailExists: boolean;
  isInvalidDayPhone: boolean;
  isInvalidMobilePhone: boolean;
  addResponse: IAgencyResponse;
  resAddAgency: string;
  resAgencyId: string;
  agencyId: number;
  acntId: number;
  dayPhonePrevious: string = "";
  mobilePhonePrevious: string = "";
  dayPhoneId: number;
  mobilePhoneId: number;
  userNamePrevious: string = "";
  isSuffixOther: boolean;
  accountId: number;
  contactId: number;
  titles = [];
  suffixes = [];
  genderTypes = [];
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validateNumberPattern = "[0-9]*";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";
  constructor(private agencySetupService: AgencySetupService, private context: SessionService, private router: Router, private route: ActivatedRoute, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.route.queryParams.subscribe(params => {
      this.agencyId = params['id'];
    });
    this.isAddShow = true;
    this.isEditShow = false;
    if (this.agencyId > 0) {
      this.getAgency(this.agencyId);
      this.isEditShow = true;
      this.isAddShow = false;
    }
    this.bindDropdowns();

    this.agencyRegistrationForm = new FormGroup({
      'agencyCode': new FormControl('', [Validators.required]),
      'agencyName': new FormControl('', [Validators.required]),
      'agencyDescription': new FormControl('', [Validators.required]),
      'titleSelected': new FormControl(''),
      'suffixSelected': new FormControl(''),
      'suffixOther': new FormControl(''),
      'firstName': new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      'middleName': new FormControl(''),
      'lastName': new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)]),
      'genderSelected': new FormControl(''),
      'userName': new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validateAlphaNumericsPattern)]),
      'primaryEmail': new FormControl('', [Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)]),
      'mobilePhone': new FormControl('', [Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      'dayPhone': new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),

    });
  }

  bindDropdowns() {

    // Bind Title
    this.commonService.getTitleLookups().subscribe(res => { this.titles = res; });
    // Bind Suffix
    this.commonService.getSuffixLookups().subscribe(res => { this.suffixes = res; });
    // Bind Gender
    this.commonService.getGenderLookups().subscribe(res => { this.genderTypes = res; });
  }


  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.formcontrolname.value;
    //console.log(objId);
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.agencyRegistrationForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      // console.log(phone);
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.agencyRegistrationForm.controls[objId].setValue(phone);
    }
  }

  createCustomerDTO(): ICustomerRequest {
    var customerRequest: ICustomerRequest = <ICustomerRequest>{};
    if (this.isUpdatedClicked) {
      customerRequest.AccountId = this.acntId;
      console.log(this.accountId);
      customerRequest.convertToCustomer = true;
      customerRequest.ContactId = this.contactId;

    } else {
      customerRequest.AccountId = 0;
    }


    customerRequest.AccountStatus = AccountStatus[AccountStatus.NA];
    customerRequest.LoginStatus = LoginStatus[LoginStatus.Active];
    customerRequest.CustomerStatus = CustomerStatus[CustomerStatus.C];
    customerRequest.ParentId = 0;
    customerRequest.RevenueCategory = RevenueCategory[RevenueCategory.Revenue];
    customerRequest.SourceOfEntry = SourceOfEntry[SourceOfEntry.Online];
    customerRequest.FirstName = this.agencyRegistrationForm.value.firstName.trim();
    customerRequest.MiddleName = this.agencyRegistrationForm.value.middleName ? this.agencyRegistrationForm.value.middleName.trim() : "";
    customerRequest.LastName = this.agencyRegistrationForm.value.lastName.trim();
    customerRequest.Gender = this.agencyRegistrationForm.value.genderSelected;
    customerRequest.Suffix = this.agencyRegistrationForm.value.suffixSelected == "Other" ? this.agencyRegistrationForm.value.suffixOther : this.agencyRegistrationForm.value.suffixSelected;
    customerRequest.Title = this.agencyRegistrationForm.value.titleSelected;

    customerRequest.NameType = NameType[NameType.Primary];
    //activity related data 
    customerRequest.SubSystem = SubSystem[SubSystem.SAC];
    customerRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    customerRequest.InitiatedBy = this.context._customerContext.userName;
    customerRequest.UserType = UserType[UserType.Agency];
    //Create Customer address
    customerRequest.AddressList = [];
    customerRequest.AddressList.push(this.createAddress());
    // Creating Email details
    customerRequest.Email = this.createEmailObject();
    // Creating Phone details
    customerRequest.PhoneList = this.createPhoneList();
    //Creating System activities related     
    customerRequest.UserId = this.context._customerContext.userId;
    customerRequest.LoginId = this.context._customerContext.loginId;
    customerRequest.User = this.context._customerContext.userName;
    // Creating login details
    customerRequest.UserName = this.agencyRegistrationForm.value.userName.trim();
    customerRequest.boolActivityRequired = true;
    return customerRequest;
  }
  createAddress(): IAddressRequest {
    var addressRequest: IAddressRequest = <IAddressRequest>{};
    addressRequest.Line1 = this.addressComponent.addAddressForm.value.addressLine1.trim();
    addressRequest.Line2 = this.addressComponent.addAddressForm.value.addressLine2 ? this.addressComponent.addAddressForm.value.addressLine2.trim() : "";
    addressRequest.Line3 = this.addressComponent.addAddressForm.value.addressLine3 ? this.addressComponent.addAddressForm.value.addressLine3.trim() : "";
    addressRequest.City = this.addressComponent.addAddressForm.value.addressCity.trim();
    addressRequest.State = this.addressComponent.addAddressForm.value.addressStateSelected;
    addressRequest.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
    addressRequest.Zip1 = this.addressComponent.addAddressForm.value.addressZip1;
    addressRequest.Zip2 = this.addressComponent.addAddressForm.value.addressZip2;
    addressRequest.Type = AddressTypes[AddressTypes.Business];
    addressRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    addressRequest.SubSystem = SubSystem[SubSystem.SAC];
    addressRequest.UserName = this.context._customerContext.userName;
    addressRequest.IsActive = true;
    addressRequest.IsPreferred = true;
    addressRequest.IsActivityRequired = true;
    addressRequest.IsInvalidAddress = true;
    return addressRequest;
  }


  createEmailObject(): IEmailRequest {
    var emailRequest: IEmailRequest;
    if (this.agencyRegistrationForm.value.primaryEmail) {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.context._customerContext.userName;
      emailRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      emailRequest.SubSystem = SubSystem[SubSystem.SAC];
      emailRequest.EmailAddress = this.agencyRegistrationForm.value.primaryEmail;
      emailRequest.Type = EmailType[EmailType.PrimaryEmail];
      emailRequest.IsPreferred = true;
      emailRequest.IsValid = true;
      emailRequest.IsActivityRequired = false;
    }
    return emailRequest;
  }

  // creating phones list
  createPhoneList(): IPhoneRequest[] {
    var phoneRequestArray: IPhoneRequest[] = [];
    var phoneRequest: IPhoneRequest;

    if (this.agencyRegistrationForm.value.dayPhone || this.dayPhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.context._customerContext.userName;
      phoneRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      phoneRequest.SubSystem = SubSystem[SubSystem.SAC];
      phoneRequest.PhoneNumber = this.agencyRegistrationForm.value.dayPhone;
      phoneRequest.Type = PhoneType[PhoneType.HomePhone];
      phoneRequest.IsCommunication = false;
      phoneRequest.IsActive = true;
      if (!this.agencyRegistrationForm.value.dayPhone) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.dayPhoneId;
      }
      phoneRequestArray.push(phoneRequest);

    }

    if (this.agencyRegistrationForm.value.mobilePhone || this.mobilePhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.context._customerContext.userName;
      phoneRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      phoneRequest.SubSystem = SubSystem[SubSystem.SAC];
      phoneRequest.PhoneNumber = this.agencyRegistrationForm.value.mobilePhone;
      phoneRequest.Type = PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCommunication = true;
      phoneRequest.IsActive = true;
      if (!this.agencyRegistrationForm.value.mobilePhone) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.mobilePhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (phoneRequestArray.length > 0)
      phoneRequestArray[0].IsActivityRequired = false;
    return phoneRequestArray;
  }



  createAgencyRequestDTO() {
    this.addAgencyReq = <IAgencyRequest>{};
    if (this.isUpdatedClicked) {
      this.addAgencyReq.AgencyId = this.agencyId;

    } else {
      this.addAgencyReq.AgencyId = 0;
    }
    this.addAgencyReq.AgencyName = this.agencyRegistrationForm.controls['agencyName'].value;
    this.addAgencyReq.AgencyCode = this.agencyRegistrationForm.controls['agencyCode'].value;
    this.addAgencyReq.AgencyDescription = this.agencyRegistrationForm.controls['agencyDescription'].value;
    this.addAgencyReq.IsActive = true;
    this.addAgencyReq.UserId = this.context._customerContext.userId
    this.addAgencyReq.LoginId = this.context._customerContext.loginId;
    this.addAgencyReq.StartEffectiveDate = new Date();
    this.addAgencyReq.EndEffectiveDate = new Date();
    this.addAgencyReq.EndEffectiveDate.setFullYear(parseInt(this.addAgencyReq.StartEffectiveDate.getUTCFullYear().toString()) + 50);
    this.addAgencyReq.ActivitySource = ActivitySource.Internal;
    this.addAgencyReq.UserType = UserType[UserType.Agency];
    this.addAgencyReq.CreatedDate = new Date();
    this.addAgencyReq.UpdatedDate = new Date();
    this.addAgencyReq.CreatedUser = this.context._customerContext.userName;
    this.addAgencyReq.UpdatedUser = this.context._customerContext.userName;
    this.addAgencyReq.PerformedBy = this.context._customerContext.userName;
    return this.addAgencyReq;
  }

  isUserExists() {
    if (this.agencyRegistrationForm.controls['username'].valid && this.userNamePrevious != this.agencyRegistrationForm.controls['username'].value) {
      this.agencySetupService.isUserNameExist(this.agencyRegistrationForm.controls['username'].value).subscribe(res => {
        if (res)
          this.isUserNameExists = true;
        else
          this.isUserNameExists = false;
        console.log(res);
      });
    }
    else
      this.isUserNameExists = false;
  }



  checkPrimaryEmailExists() {
    if (this.agencyRegistrationForm.controls["primaryEmail"].valid) {
      this.agencySetupService.isEmailExist(this.agencyRegistrationForm.controls["primaryEmail"].value).subscribe(res => {
        if (res)
          this.isPrimaryEmailExists = true;
        else
          this.isPrimaryEmailExists = false;
      });
    }
    else
      this.isPrimaryEmailExists = false;
  }

  validateDayPhoneAllZeros() {
    if (this.agencyRegistrationForm.controls["dayPhone"].valid) {
      if (this.validateAllZerosinPhone(this.agencyRegistrationForm.value.dayPhone))
        this.isInvalidDayPhone = true;
      else
        this.isInvalidDayPhone = false;
    }
    else
      this.isInvalidDayPhone = false;
  }

  validateMobilePhoneAllZeros() {
    if (this.agencyRegistrationForm.controls["mobilePhone"].valid) {
      if (this.validateAllZerosinPhone(this.agencyRegistrationForm.value.mobilePhone))
        this.isInvalidMobilePhone = true;
      else
        this.isInvalidMobilePhone = false;
    }
    else
      this.isInvalidMobilePhone = false;
  }



  validateAllZerosinPhone(phoneNumber: string): boolean {
    var pattern = new RegExp(this.validatePhoneAllZerosPattern);
    var result = pattern.test(phoneNumber);
    return result;
  }
  changeEmailValidation(emailType) {
    if (emailType == "PrimaryEmail") {
      this.agencyRegistrationForm.controls["primaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
    }
    this.agencyRegistrationForm.controls['primaryEmail'].updateValueAndValidity();
  }

  changePhoneValidation(phoneType) {
    this.agencyRegistrationForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    this.agencyRegistrationForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    if (phoneType == "DayPhone")
      this.agencyRegistrationForm.controls["dayPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    else if (phoneType == "MobileNo")
      this.agencyRegistrationForm.controls["mobilePhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.agencyRegistrationForm.controls['dayPhone'].updateValueAndValidity();
    this.agencyRegistrationForm.controls['mobilePhone'].updateValueAndValidity();

  }

  isAgencyCodeExist(customerRequest: ICustomerRequest) {
    if (this.agencyRegistrationForm.controls['agencyCode'].valid) {
      this.agencySetupService.checkAgencyCodeAvailablity(this.agencyRegistrationForm.controls['agencyCode'].value).subscribe(res => {
        if (res) {
          this.isAgencyCodeExists = true;
        } else {
          this.isAgencyCodeExists = false;

        }
      });
    }

  }

  checkUserExist(username: string) {
    this.agencySetupService.isUserExist(username).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "User name already exist";
        return;
      }
    });
  }

  addClick() {
    if (this.agencyRegistrationForm.valid && this.addressComponent.addAddressForm.valid) {
      let uname = this.agencyRegistrationForm.controls["userName"].value;
      this.agencySetupService.isUserExist(uname).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "User name already exist";
          return;
        }
        else {
          this.addRegistrationReq = <IAgencyRequest>{};
          this.customerReq = <ICustomerRequest>{};
          this.addRegistrationReq = this.createAgencyRequestDTO();
          var customerRequest: ICustomerRequest = this.createCustomerDTO();
          let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.AGENCY];
          userEvents.ActionName = Actions[Actions.CREATE];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = 0;
          userEvents.RoleId = parseInt(this.context._customerContext.roleID);
          userEvents.UserName = this.context._customerContext.userName;
          userEvents.LoginId = this.context._customerContext.loginId;
          this.isAgencyCodeExist(customerRequest);
          if (this.isAgencyCodeExist) {
            this.agencySetupService.addAgency(this.addRegistrationReq, customerRequest, userEvents).subscribe(res => {
              this.resAddAgency = res.toString();
              this.router.navigate(['/sac/agencysetup/manage-agency'], { queryParams: { flag: 1 } });
            }, (err) => {
              this.showErrorMsg(err.statusText.toString());

            });
          }
        }
      });
    }
    else {
      this.validateAllFormFields(this.agencyRegistrationForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }

  }

  addContinueClick() {
    if (this.agencyRegistrationForm.valid && this.addressComponent.addAddressForm.valid) {
      let uname = this.agencyRegistrationForm.controls["userName"].value;
      this.agencySetupService.isUserExist(uname).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "User name already exist";
          return;
        }
        else {
          this.addRegistrationReq = <IAgencyRequest>{};
          this.customerReq = <ICustomerRequest>{};
          this.addRegistrationReq = this.createAgencyRequestDTO();
          var customerRequest: ICustomerRequest = this.createCustomerDTO();
          let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.AGENCY];
          userEvents.ActionName = Actions[Actions.CREATE];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = 0;
          userEvents.RoleId = parseInt(this.context._customerContext.roleID);
          userEvents.UserName = this.context._customerContext.userName;
          userEvents.LoginId = this.context._customerContext.loginId;
          if (this.agencyRegistrationForm.valid && this.addressComponent.addAddressForm.valid) {
            this.isAgencyCodeExist(customerRequest);
            if (this.isAgencyCodeExist) {
              this.agencySetupService.addAgency(this.addRegistrationReq, customerRequest, userEvents).subscribe(res => {
                this.resAddAgency = res.toString();

                this.resAgencyId = this.resAddAgency.split('~')[0];
                this.booIssendMail = this.resAddAgency.split('~')[2];
                console.log("AGENCYYYYYY" + this.resAgencyId);
                console.log("EMAIL" + this.booIssendMail);
                this.router.navigate(['/sac/agencysetup/agency-additional'], { queryParams: { id: this.resAgencyId, flag: 3 } });
              }, (err) => {
                this.showErrorMsg(err.statusText.toString());

              });
            }
          }
        }
      }
      );
    } else {
      this.validateAllFormFields(this.agencyRegistrationForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }
  }



  getAgency(agencyId) {
    var addressRequest: IAddressRequest = <IAddressRequest>{};
    this.isEditShow = true;
    this.agencySetupService.getAgencyById(agencyId).subscribe(res => {
      this.agencyResp = res;
      this.showAgencyDetailsById(this.agencyResp);

      this.assignFormValues(this.agencyResp.CustomerDetails);
      this.selectSuffix();
    });
  }


  updateClick() {
    debugger;
    this.isUpdatedClicked = true;
    this.updateRegistrationReq = <IAgencyRequest>{};
    if (this.agencyRegistrationForm.valid && this.addressComponent.addAddressForm.valid) {
      this.updateRegistrationReq = this.createAgencyRequestDTO();
      var customerRequest: ICustomerRequest = this.createCustomerDTO();
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.AGENCY];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.agencySetupService.updateAgency(this.updateRegistrationReq, customerRequest, userEvents).subscribe(res => {
        this.router.navigate(['/sac/agencysetup/manage-agency'], { queryParams: { flag: 2 } });
      });
    }
    else {
      this.validateAllFormFields(this.agencyRegistrationForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }
  }

  updateContinueClick() {
    this.isUpdatedClicked = true;
    this.updateRegistrationReq = <IAgencyRequest>{};
    if (this.agencyRegistrationForm.valid && this.addressComponent.addAddressForm.valid) {
      this.updateRegistrationReq = this.createAgencyRequestDTO();
      var customerRequest: ICustomerRequest = this.createCustomerDTO();
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.AGENCY];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;
      this.agencySetupService.updateAgency(this.updateRegistrationReq, customerRequest, userEvents).subscribe(res => {
        this.router.navigate(['/sac/agencysetup/agency-additional'], { queryParams: { id: this.agencyId, flag: 4 } });
      });
    } else {
      this.validateAllFormFields(this.agencyRegistrationForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }
  }


  showAgencyDetailsById(agencyResp: IAgencyResponse) {
    this.agencyRegistrationForm.controls['agencyName'].setValue(agencyResp.AgencyName);
    this.agencyRegistrationForm.controls['agencyCode'].setValue(agencyResp.AgencyCode);
    this.agencyRegistrationForm.controls['agencyDescription'].setValue(agencyResp.AgencyDescription);
    this.addressComponent.addAddressForm.controls["addressLine1"].setValue(agencyResp.CustomerDetails.Line1);
    this.addressComponent.addAddressForm.controls["addressLine2"].setValue(agencyResp.CustomerDetails.Line2);
    this.addressComponent.addAddressForm.controls["addressLine3"].setValue(agencyResp.CustomerDetails.Line3);
    this.addressComponent.addAddressForm.controls["addressCity"].setValue(agencyResp.CustomerDetails.City);
    this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue(agencyResp.CustomerDetails.Country);
    this.addressComponent.addAddressForm.controls["addressStateSelected"].setValue(agencyResp.CustomerDetails.State);
    this.addressComponent.addAddressForm.controls["addressZip1"].setValue(agencyResp.CustomerDetails.Zip1);
    this.addressComponent.addAddressForm.controls["addressZip2"].setValue(agencyResp.CustomerDetails.Zip2);
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }



  assignFormValues(customerResponse: ICustomerResponse) {
    var primaryEmail: string = "";
    var secondaryEmail: string = "";
    var preferEmail: string = "";
    var preferPhone: string = "";
    if (customerResponse.EmailList != null) {
      let emailList = customerResponse.EmailList.map(x => Object.assign({}, x));
      for (var i = 0; i < emailList.length; i++) {
        if (emailList[i].Type == EmailType[EmailType.PrimaryEmail]) {
          primaryEmail = emailList[i].EmailAddress;
          if (emailList[i].IsPreferred)
            preferEmail = EmailType[EmailType.PrimaryEmail];
        }
        else {
          secondaryEmail = emailList[i].EmailAddress;
          if (emailList[i].IsPreferred)
            preferEmail = EmailType[EmailType.SecondaryEmail];
        }
      }
    }
    else
      preferEmail = EmailType[EmailType.PrimaryEmail];

    if (customerResponse.PhoneList != null) {
      let phoneList = customerResponse.PhoneList.map(x => Object.assign({}, x));
      for (var i = 0; i < phoneList.length; i++) {
        if (phoneList[i].Type == PhoneType[PhoneType.DayPhone]) {
          this.dayPhonePrevious = phoneList[i].PhoneNumber;
          this.dayPhoneId = phoneList[i].PhoneId;
          // this.acntId = phoneList[0].CustomerId;
          console.log(this.dayPhoneId + "acntid");
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.DayPhone];
        }

        else if (phoneList[i].Type == PhoneType[PhoneType.MobileNo]) {
          this.mobilePhonePrevious = phoneList[i].PhoneNumber;
          this.mobilePhoneId = phoneList[i].PhoneId;
          this.acntId = phoneList[i].CustomerId;
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.MobileNo];
        }

      }
    }
    else
      preferPhone = PhoneType[PhoneType.DayPhone];

    let suffixSelect: string = "";
    if (customerResponse.Suffix) {
      suffixSelect = this.suffixes.indexOf(customerResponse.Suffix) < 0 ? "Other" : customerResponse.Suffix
    }
    this.changeEmailValidation(preferEmail);
    this.changePhoneValidation(preferPhone);
    var date = new Date(customerResponse.DOB);
    this.contactId = customerResponse.ContactId;
    this.accountId = this.agencyResp.CustomerDetails.AccountId;
    console.log(this.accountId + "assign form values");
    this.userNamePrevious = customerResponse.UserName;
    this.agencyRegistrationForm.patchValue({
      titleSelected: customerResponse.Title,
      suffixSelected: suffixSelect,
      suffixOther: this.suffixes.indexOf(customerResponse.Suffix) < 0 ? customerResponse.Suffix : "",
      firstName: customerResponse.FirstName ? customerResponse.FirstName.trim() : "",
      middleName: customerResponse.MiddleName ? customerResponse.MiddleName.trim() : "",
      lastName: customerResponse.LastName ? customerResponse.LastName.trim() : "",
      genderSelected: customerResponse.Gender,
      userName: customerResponse.UserName,
      primaryEmail: primaryEmail,
      preferredEmail: preferEmail,
      dayPhone: this.dayPhonePrevious,
      mobilePhone: this.mobilePhonePrevious,
      preferredPhone: preferPhone

    });
  }

  cancelAgency() {
    this.agencyRegistrationForm.reset();
    this.router.navigateByUrl('/sac/agencysetup/manage-agency');
  }

  resetAgency() {

    if (this.agencyId > 0) {
      this.getAgency(this.agencyId);
      this.isEditShow = true;
      this.isAddShow = false;
    }

    this.agencyRegistrationForm.reset();
    this.addressComponent.addAddressForm.reset();
    // this.agencyRegistrationForm.controls["titleSelected"].value("");
    // this.agencyRegistrationForm.controls["suffixSelected"].value("");
    // this.agencyRegistrationForm.controls["genderSelected"].value("");
    // this.agencyRegistrationForm.controls["preferredEmail"].value("PrimaryEmail");
    // this.agencyRegistrationForm.controls["preferredPhone"].value("DayPhone");

    // this.addressComponent.addAddressForm.controls["addressLine1"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressLine2"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressLine3"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressCity"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressZip1"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressZip2"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue("");
    // this.addressComponent.addAddressForm.controls["addressStateSelected"].setValue("");

    // this.dayPhonePrevious = "";
    // this.mobilePhonePrevious = "";
    // this.dayPhoneId = 0;
    // this.mobilePhoneId = 0;
    // this.isUserNameExists = false;
    // this.isPrimaryEmailExists = false;
    // this.isInvalidDayPhone = false;
    // this.isInvalidMobilePhone = false;
    // this.userNamePrevious = "";
  }

  selectSuffix() {
    if (this.agencyRegistrationForm.value.suffixSelected == 'Other') {
      this.agencyRegistrationForm.controls["suffixOther"].setValidators([Validators.required, Validators.maxLength(5), Validators.pattern(this.validateAlphabetsPattern)]);
      this.isSuffixOther = true;
    }
    else {
      this.agencyRegistrationForm.controls["suffixOther"].setValue("");
      this.agencyRegistrationForm.controls["suffixOther"].setValidators([]);
      this.isSuffixOther = false;
    }
    this.agencyRegistrationForm.controls["suffixOther"].updateValueAndValidity();
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

  setOutputFlag(e) {
    this.msgFlag = e;
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

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }

}






