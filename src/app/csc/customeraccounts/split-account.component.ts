import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { CommonService } from '../../shared/services/common.service';
import { ICommon, ICommonResponse } from '../../shared/models/commonresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IEmailResponse } from '../../shared/models/emailresponse';
import { IPhoneResponse } from '../../shared/models/phoneresponse';
import { ICustomerRequest } from '../../shared/models/customerrequest';
import { PhoneType, EmailType, AppSettings, SubSystem, ActivitySource, CustomerStatus, SourceOfEntry, UserType, AddressTypes, LookupTypeCodes } from '../../shared/constants';
import { IAddressRequest } from '../../shared/models/addressrequest';

import { AccountStatus } from '../search/constants';
import { NameType } from './constants';
import { IEmailRequest } from '../../shared/models/emailrequest';
import { IPhoneRequest } from '../../shared/models/phonerequest';
import { Router } from '@angular/router';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { AddAddressComponent } from '../../shared/address/add-address.component';
import { SplitCustomerService } from './services/splitcustomer.service';
import { ISplitRequest } from './models/splitrequest';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { IAddressResponse } from '../../shared/models/addressresponse';
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";

declare var $: any;
@Component({
  selector: 'app-split-account',
  templateUrl: './split-account.component.html',
  styleUrls: ['./split-account.component.css']
})
export class SplitAccountComponent implements OnInit {
  showAddressTypeError: boolean=false;
  editAddressFlag: boolean;
  hideCopy: boolean;
  defaultPreferredItem: number;
  btnType: any;
  hideDelete: boolean;
  disableCheck: boolean;
  actionType: string = "Copy";
  movedItemsArray: IAddressRequest[] = [];
  moveListArray: any = [];
  customerAddressArray: any[];
  invalidDate: boolean = false;

  constructor(private customerObjContextService: CustomerContextService, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private splitCustomerService: SplitCustomerService, private customerAccountsService: CustomerAccountsService, private commonService: CommonService, private router: Router, private createAccountService: CreateAccountService, private sessionContext: SessionService) { }

  splitAccountForm: FormGroup;
  isConvertCustomer: number = 0;
  splitRequest: ISplitRequest = <ISplitRequest>{};
  userTypes = [];
  accountCategories = [];
  titles = [];
  suffixes = [];
  genderTypes = [];
  accountId: number;
  contactId: number;
  isGetDefaultAddress: boolean;
  isInitialPageLoad: boolean;

  showBusinessName = false;
  isSuffixOther = false;
  toDayDate = new Date();
  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };


  userName: string;
  userId: number;
  loginId: number;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.CSC];
  addAddress: boolean;
  dayPhonePrevious: string = "";
  eveningPhonePrevious: string = "";
  mobilePhonePrevious: string = "";
  workPhonePrevious: string = "";
  extensionPrevious: string = "";
  faxPrevious: string = "";
  dayPhoneId: number;
  eveningPhoneId: number;
  mobilePhoneId: number;
  workPhoneId: number;
  extensionId: number;
  faxId: number;

  // makePaymentRequest: IMakePaymentrequest;
  sessionContextResponse: IUserresponse;
  customerInfoRequest: ICustomerRequest;
  customerContext: ICustomerResponse;
  customerObjContextResponse: ICustomerContextResponse;
  addressResponse: IAddressResponse = <IAddressResponse>{};
  addressRequest: IAddressRequest;

  @ViewChild(AddAddressComponent) addressComponent;
  isErrorBlock: boolean = false;
  failureMessage: string = "";
  isUserNameExists: boolean = false;
  isPrimaryEmailExists: boolean = false;
  isSecondaryEmailExists: boolean = false;
  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validateNumberPattern = "[0-9]*";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";






  ngOnInit() {
    console.log(new Date(1, 1, 1));
    console.log(new Date(1, 0, 1));
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.customerObjContextService.currentContext.subscribe(customerContext => { this.customerObjContextResponse = customerContext; }
    );
    if (this.customerObjContextResponse.AccountId > 0) {
      this.accountId = this.customerObjContextResponse.AccountId;
    }
    this.isInitialPageLoad = true;
    this.bindDropdowns();
    this.initialFormValues();
    this.showAllAddresses();
    this.splitRequest = this.splitCustomerService.splitContext();
    if (this.splitRequest != null) {
      this.isGetDefaultAddress = false;
      this.assignFormValues(this.splitRequest);
      this.isInitialPageLoad = false;
    }
    // else
    // {
    //   this.isGetDefaultAddress=true;
    // }
  }

  bindDropdowns() {
    // Bind Customer UserTypes
    this.commonService.getCustomerUserTypesLookups().subscribe(res => { this.userTypes = res; });
    // Bind Account Categories
    this.commonService.getAccountCategoriesLookups().subscribe(res => { this.accountCategories = res; });
    // Bind Title
    this.commonService.getTitleLookups().subscribe(res => { this.titles = res; });
    // Bind Suffix
    this.commonService.getSuffixLookups().subscribe(res => { this.suffixes = res; });
    // Bind Gender
    this.commonService.getGenderLookups().subscribe(res => { this.genderTypes = res; });
  }

  //Populating default address based on the split customer ID
  populateAddressDetails(checkboxValue: boolean) {
    if (checkboxValue == true) {
      console.log(checkboxValue);
      this.isGetDefaultAddress = true;
      this.isInitialPageLoad = false;
      if (this.customerObjContextResponse.AccountId > 0) {
        this.accountId = this.customerObjContextResponse.AccountId;
      }
    }
    else {
      console.log(checkboxValue);
      this.isGetDefaultAddress = false;
      this.isInitialPageLoad = false;
      this.splitRequest = this.splitCustomerService.splitContext();
      if (this.splitRequest != null) {
        this.addressRequest = this.splitRequest.CustInfo.AddressList[0];
      }
      //this.addressRequest=this.splitRequest.CustInfo.AddressList[0];
    }
  }

  storeValuesToService() {

    this.splitRequest = this.createCustomerDTO();
    console.log(this.splitRequest);
    this.splitCustomerService.changeResponse(this.splitRequest);
    if (this.splitAccountForm.valid) {
      if (!this.invalidDate)
        this.router.navigate(['/csc/customeraccounts/split-plan-selection/']);
    }

    else {
      $('#collapseOne,#collapseTwo,#collapseThree').addClass('in');
      $('.panel-title > a').removeClass('collapsed');
      $('#collapseOne,#collapseTwo,#collapseThree').css('height', '');
      this.validateAllFormFields(this.addressComponent.addAddressForm);
      this.validateAllFormFields(this.splitAccountForm);
    }
  }
  //Populating default address based on the split customer ID


  customerTypeChanged() {
    if (this.splitAccountForm.value.userTypeSelected == UserType[UserType.Business]) {
      this.splitAccountForm.addControl('businessName', new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]));
      this.showBusinessName = true;
    }
    else {
      this.splitAccountForm.removeControl('businessName');
      this.showBusinessName = false;
    }
  }

  selectSuffix() {
    if (this.splitAccountForm.value.suffixSelected == 'Other') {
      this.splitAccountForm.addControl('suffixOther', new FormControl('', [Validators.compose([Validators.required, Validators.maxLength(5), Validators.pattern('[a-zA-Z]*')])]));
      this.isSuffixOther = true;
    }
    else {
      this.splitAccountForm.removeControl('suffixOther');
      this.isSuffixOther = false;
    }
  }

  isUserExists() {
    if (this.splitAccountForm.controls["userName"].valid)
      this.customerAccountsService.isUserNameExist(this.splitAccountForm.value.userName).subscribe(res => {
        if (res)
          this.isUserNameExists = true;
        else
          this.isUserNameExists = false;
        console.log(res);
      });
  }

  checkPrimaryEmailExists() {
    if (this.splitAccountForm.controls["primaryEmail"].valid)
      this.customerAccountsService.isEmailExist(this.splitAccountForm.value.primaryEmail).subscribe(res => {
        if (res)
          this.isPrimaryEmailExists = true;
        else
          this.isPrimaryEmailExists = false;
        console.log(res);
      });
  }

  checkSecondaryEmailExists() {
    if (this.splitAccountForm.controls["secondaryEmail"].valid)
      this.customerAccountsService.isEmailExist(this.splitAccountForm.value.secondaryEmail).subscribe(res => {
        if (res)
          this.isSecondaryEmailExists = true;
        else
          this.isSecondaryEmailExists = false;
        console.log(res);
      });
  }

  initialFormValues() {
    this.splitAccountForm = new FormGroup({
      userTypeSelected: new FormControl('', Validators.required),
      businessName: new FormControl(''),
      accountCategorySelected: new FormControl('', Validators.required),
      titleSelected: new FormControl(''),
      suffixSelected: new FormControl(''),
      suffixOther: new FormControl(''),
      firstName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)])),
      middleName: new FormControl('', Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)])),
      lastName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)])),
      genderSelected: new FormControl(''),
      dateOfBirth: new FormControl(''),
      userName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(5), Validators.pattern(this.validateAlphaNumericsPattern)])),
      primaryEmail: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      secondaryEmail: new FormControl('', Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)])),
      preferredEmail: new FormControl('PrimaryEmail'),
      dayPhone: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      eveningPhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      mobilePhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      workPhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      ext: new FormControl('', Validators.compose([Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)])),
      fax: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      preferredPhone: new FormControl('DayPhone'),
      subscribeAlerts: new FormControl(''),
      agreeTermsAndConditions: new FormControl('', Validators.required),
      copyAddress: new FormControl(''),
      addressType: new FormControl(''),
      preferred: new FormControl('')
    });
  }

  assignFormValues(splitRequest: ISplitRequest) {

    this.changeEmailValidation(splitRequest.EmailPreferred);
    this.changePhoneValidation(splitRequest.PhonePreferrred);
    var date = new Date(splitRequest.CustInfo.DOB);
    this.splitAccountForm.patchValue({
      userTypeSelected: splitRequest.CustInfo.UserType,
      businessName: splitRequest.CustInfo.OrganizationName,
      accountCategorySelected: splitRequest.CustInfo.RevenueCategory,
      titleSelected: splitRequest.CustInfo.Title,
      suffixSelected: this.suffixes.indexOf(splitRequest.CustInfo.Suffix) < 0 ? "Other" : splitRequest.CustInfo.Suffix,
      suffixOther: this.suffixes.indexOf(splitRequest.CustInfo.Suffix) < 0 ? splitRequest.CustInfo.Suffix : "",
      firstName: splitRequest.CustInfo.FirstName,
      middleName: splitRequest.CustInfo.MiddleName,
      lastName: splitRequest.CustInfo.LastName,
      genderSelected: splitRequest.CustInfo.Gender,

      //dateOfBirth: date <= new Date(1, 1, 1) ? "" : splitRequest.CustInfo.DOB,
      dateOfBirth: date <= new Date(1, 1, 1) ? "" : {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      },
      userName: splitRequest.CustInfo.UserName,
      primaryEmail: splitRequest.PrimaryEmail,
      secondaryEmail: splitRequest.SecondaryEmail,
      preferredEmail: splitRequest.EmailPreferred,
      dayPhone: splitRequest.DayPhone,
      eveningPhone: splitRequest.EveningPhone,
      mobilePhone: splitRequest.MobileNo,
      workPhone: splitRequest.WorkPhone,
      ext: splitRequest.WorkPhoneExt,
      fax: splitRequest.Fax,
      preferredPhone: splitRequest.PhonePreferrred,
      subscribeAlerts: splitRequest.CustInfo.Alerts,
      agreeTermsAndConditions: '',
    });
    this.addressRequest = splitRequest.CustInfo.AddressList[0];
  }
  // dateOfBirthPathching() {
  //     var date = new Date(this.splitRequest.CustInfo.DOB);
  //     this.splitAccountForm.patchValue({
  //         dateOfBirth: {
  //             date: {
  //                 year: date.getFullYear(),
  //                 month: date.getMonth() + 1,
  //                 day: date.getDate()
  //             }
  //         }
  //     });
  // }

  addorRemoveValidators() {
    this.splitAccountForm.controls["dayPhone"].setValidators([Validators.pattern(this.validatePhonePattern)]);
    // personal details block
    if (this.splitAccountForm.value.middleName)
      this.splitAccountForm.controls["middleName"].setValidators(Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]));
    else
      this.splitAccountForm.controls["middleName"].setValidators([]);
    this.splitAccountForm.controls["workPhone"].updateValueAndValidity();

    // email block
    if (this.splitAccountForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail]) {
      this.splitAccountForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      if (this.splitAccountForm.value.secondaryEmail) {
        this.splitAccountForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      }
      else
        this.splitAccountForm.controls["secondaryEmail"].setValidators([]);
    }
    else {
      this.splitAccountForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      if (this.splitAccountForm.value.primaryEmail) {
        this.splitAccountForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      }
      else
        this.splitAccountForm.controls["primaryEmail"].setValidators([]);
    }
    this.splitAccountForm.controls['primaryEmail'].updateValueAndValidity();
    this.splitAccountForm.controls["secondaryEmail"].updateValueAndValidity();

    // phone block
    if (this.splitAccountForm.value.dayPhone)
      this.splitAccountForm.controls["dayPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["dayPhone"].setValidators([]);
    if (this.splitAccountForm.value.eveningPhone)
      this.splitAccountForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["eveningPhone"].setValidators([]);
    if (this.splitAccountForm.value.mobilePhone)
      this.splitAccountForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["mobilePhone"].setValidators([]);
    if (this.splitAccountForm.value.workPhone)
      this.splitAccountForm.controls["workPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["workPhone"].setValidators([]);

    if (this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.DayPhone])
      this.splitAccountForm.controls["dayPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone])
      this.splitAccountForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.MobileNo])
      this.splitAccountForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["workPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));

    this.splitAccountForm.controls['dayPhone'].updateValueAndValidity();
    this.splitAccountForm.controls["eveningPhone"].updateValueAndValidity();
    this.splitAccountForm.controls['mobilePhone'].updateValueAndValidity();
    this.splitAccountForm.controls["workPhone"].updateValueAndValidity();

    // agree terms
    if (this.splitAccountForm.value.agreeTermsAndConditions == true)
      this.splitAccountForm.controls["agreeTermsAndConditions"].setValidators([]);
    else {
      this.splitAccountForm.controls["agreeTermsAndConditions"].setValue("");
      this.splitAccountForm.controls["agreeTermsAndConditions"].setValidators(Validators.required);
    }
    this.splitAccountForm.controls["agreeTermsAndConditions"].updateValueAndValidity();
  }

  createCustomerDTO(): ISplitRequest {
    var splitRequest: ISplitRequest = <ISplitRequest>{};
    splitRequest.CustInfo = <ICustomerRequest>{};
    splitRequest.CustInfo.AccountId = this.accountId;
    splitRequest.CustInfo.AccountStatus = AccountStatus[AccountStatus.NA];
    splitRequest.CustInfo.UserType = this.splitAccountForm.value.userTypeSelected;
    splitRequest.CustInfo.CustomerStatus = CustomerStatus[CustomerStatus.C];
    splitRequest.CustInfo.OrganizationName = this.splitAccountForm.value.businessName ? this.splitAccountForm.value.businessName : "";
    splitRequest.CustInfo.RevenueCategory = this.splitAccountForm.value.accountCategorySelected; //Enums.CustomerAttributes.RevenueCategory.Revenue.ToString();
    splitRequest.CustInfo.SourceOfEntry = SourceOfEntry[SourceOfEntry.Online];
    splitRequest.CustInfo.FirstName = this.splitAccountForm.value.firstName;
    splitRequest.CustInfo.MiddleName = this.splitAccountForm.value.middleName ? this.splitAccountForm.value.middleName : "";
    splitRequest.CustInfo.LastName = this.splitAccountForm.value.lastName;
    splitRequest.CustInfo.Gender = this.splitAccountForm.value.genderSelected;
    splitRequest.CustInfo.Suffix = this.splitAccountForm.value.suffixSelected == "Other" ? this.splitAccountForm.value.suffixOther : this.splitAccountForm.value.suffixSelected;
    splitRequest.CustInfo.Title = this.splitAccountForm.value.titleSelected;
    splitRequest.CustInfo.Alerts = this.splitAccountForm.value.subscribeAlerts;

    let dobValue = this.splitAccountForm.value.dateOfBirth;
    if (dobValue != null && dobValue != "") {
      let dob = new Date(dobValue.date.year, dobValue.date.month - 1, dobValue.date.day);
      //splitRequest.CustInfo.DOB = this.splitAccountForm.value.dateOfBirth == "" ? new Date(1, 1, 1) : dob;
      splitRequest.CustInfo.DOB = dob;
    }
    else {
      splitRequest.CustInfo.DOB = new Date(1, 1, 1);
    }
    //= this.splitAccountForm.value.dateOfBirth == "" ?  : dob;


    splitRequest.CustInfo.NameType = NameType[NameType.Primary];
    //activity related data
    splitRequest.CustInfo.SubSystem = this.subSystem;
    splitRequest.CustInfo.ActivitySource = this.activitySource;
    splitRequest.CustInfo.InitiatedBy = this.userName;

    // Creating Email 

    //Email
    splitRequest.PrimaryEmail = this.splitAccountForm.value.primaryEmail;
    splitRequest.SecondaryEmail = this.splitAccountForm.value.secondaryEmail;
    splitRequest.EmailPreferred = this.splitAccountForm.value.preferredEmail;
    splitRequest.EmailAlert = false;
    //Phone
    splitRequest.DayPhone = this.splitAccountForm.value.dayPhone;
    splitRequest.EveningPhone = this.splitAccountForm.value.eveningPhone;
    splitRequest.MobileNo = this.splitAccountForm.value.mobilePhone;
    splitRequest.WorkPhone = this.splitAccountForm.value.workPhone;
    splitRequest.WorkPhoneExt = this.splitAccountForm.value.ext;
    splitRequest.Fax = this.splitAccountForm.value.fax;
    splitRequest.PhonePreferrred = this.splitAccountForm.value.preferredPhone;

    //Creating System activities related
    splitRequest.CustInfo.UserId = this.userId;
    splitRequest.CustInfo.LoginId = this.loginId;
    splitRequest.CustInfo.User = this.userName;
    // Creating login details
    splitRequest.CustInfo.UserName = this.splitAccountForm.value.userName;

    splitRequest.CustInfo.boolActivityRequired = true;

    //Create Customer address
    splitRequest.CustInfo.AddressList = [];
    splitRequest.CustInfo.AddressList = this.movedItemsArray;
    // Creating Email details
    splitRequest.CustInfo.CheckBlockList = false;
    return splitRequest;

  }

  // creating address object
  createAddress(): IAddressRequest {
    var addressRequest: IAddressRequest = <IAddressRequest>{};
    addressRequest.Line1 = this.addressComponent.addAddressForm.value.addressLine1;
    addressRequest.Line2 = this.addressComponent.addAddressForm.value.addressLine2;
    addressRequest.Line3 = this.addressComponent.addAddressForm.value.addressLine3;
    addressRequest.City = this.addressComponent.addAddressForm.value.addressCity;
    addressRequest.State = this.addressComponent.addAddressForm.value.addressStateSelected;
    addressRequest.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
    addressRequest.Zip1 = this.addressComponent.addAddressForm.value.addressZip1;
    addressRequest.Zip2 = this.addressComponent.addAddressForm.value.addressZip2;
    addressRequest.Type = AddressTypes[AddressTypes.Primary];
    addressRequest.ActivitySource = this.activitySource;
    addressRequest.SubSystem = this.subSystem;
    addressRequest.UserName = this.userName;
    addressRequest.IsActive = true;
    addressRequest.IsPreferred = true;
    addressRequest.IsActivityRequired = true;
    addressRequest.IsInvalidAddress = true;
    return addressRequest;
  }

  // creating emails list
  createEmailList(): IEmailRequest[] {
    var emailRequestArray: IEmailRequest[] = [];
    var emailRequest: IEmailRequest;
    if (this.splitAccountForm.value.primaryEmail != "") {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.userName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.splitAccountForm.value.primaryEmail;
      emailRequest.Type = EmailType[EmailType.PrimaryEmail];
      emailRequest.IsPreferred = this.splitAccountForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }

    if (this.splitAccountForm.value.secondaryEmail != "") {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.userName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.splitAccountForm.value.secondaryEmail;
      emailRequest.Type = EmailType[EmailType.SecondaryEmail];
      emailRequest.IsPreferred = this.splitAccountForm.value.preferredEmail == EmailType[EmailType.SecondaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }
    if (emailRequestArray.length > 0)
      emailRequestArray[0].IsActivityRequired = true;
    return emailRequestArray;
  }

  // creating phones list
  createPhoneList(): IPhoneRequest[] {
    var phoneRequestArray: IPhoneRequest[] = [];
    var phoneRequest: IPhoneRequest;

    if (this.splitAccountForm.value.dayPhone != "" || this.dayPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.splitAccountForm.value.dayPhone;
      phoneRequest.Type = PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCommunication = this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCreateAccount = true;
      if (this.splitAccountForm.value.dayPhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.dayPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.splitAccountForm.value.eveningPhone != "" || this.eveningPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.splitAccountForm.value.eveningPhone;
      phoneRequest.Type = PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCommunication = this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCreateAccount = true;
      if (this.splitAccountForm.value.eveningPhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.eveningPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.splitAccountForm.value.mobilePhone != "" || this.mobilePhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.splitAccountForm.value.mobilePhone;
      phoneRequest.Type = PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCommunication = this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCreateAccount = true;
      if (this.splitAccountForm.value.mobilePhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.mobilePhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.splitAccountForm.value.workPhone != "" || this.workPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.splitAccountForm.value.workPhone;
      phoneRequest.Type = PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCommunication = this.splitAccountForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCreateAccount = true;
      phoneRequest.Extension = this.splitAccountForm.value.ext;
      if (this.splitAccountForm.value.mobilePhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.workPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.splitAccountForm.value.fax != "" || this.faxPrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.splitAccountForm.value.fax;
      phoneRequest.Type = PhoneType[PhoneType.Fax];
      phoneRequest.IsCommunication = false;
      phoneRequest.IsCreateAccount = true;
      if (this.splitAccountForm.value.mobilePhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.faxId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (phoneRequestArray.length > 0)
      phoneRequestArray[0].IsActivityRequired = true;
    return phoneRequestArray;
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.splitAccountForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.splitAccountForm.controls[objId].setValue(phone);
    }
  }

  changePhoneValidation(phoneType) {
    this.splitAccountForm.controls["dayPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.splitAccountForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.splitAccountForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.splitAccountForm.controls["workPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    if (phoneType == "DayPhone")
      this.splitAccountForm.controls["dayPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (phoneType == "EveningPhone")
      this.splitAccountForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (phoneType == "MobileNo")
      this.splitAccountForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.splitAccountForm.controls["workPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.splitAccountForm.controls['dayPhone'].updateValueAndValidity();
    this.splitAccountForm.controls["eveningPhone"].updateValueAndValidity();
    this.splitAccountForm.controls['mobilePhone'].updateValueAndValidity();
    this.splitAccountForm.controls["workPhone"].updateValueAndValidity();
  }

  changeEmailValidation(emailType) {
    if (emailType == "PrimaryEmail") {
      this.splitAccountForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      this.splitAccountForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
    }
    else {
      this.splitAccountForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      this.splitAccountForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));

    }
    this.splitAccountForm.controls['primaryEmail'].updateValueAndValidity();
    this.splitAccountForm.controls["secondaryEmail"].updateValueAndValidity();
  }

  cancelAccount() {
    this.splitAccountForm.reset();
    this.splitAccountForm.controls["userTypeSelected"].setValue("");
    this.splitAccountForm.controls["accountCategorySelected"].setValue("");
    this.splitAccountForm.controls["titleSelected"].setValue("");
    this.splitAccountForm.controls["suffixSelected"].setValue("");
    this.splitAccountForm.controls["genderSelected"].setValue("");

    this.splitAccountForm.controls["countrySelected"].setValue("");
    this.splitAccountForm.controls["stateSelected"].setValue("");

    this.dayPhonePrevious = "";
    this.eveningPhonePrevious = "";
    this.mobilePhonePrevious = "";
    this.workPhonePrevious = "";
    this.extensionPrevious = "";
    this.faxPrevious = "";
    this.dayPhoneId = 0;
    this.eveningPhoneId = 0;
    this.mobilePhoneId = 0;
    this.workPhoneId = 0;
    this.extensionId = 0;
    this.faxId = 0;
    this.router.navigate(['/csc/customeraccounts/split-search/']);
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }


  onDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.splitAccountForm.controls["dateOfBirth"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else {
      this.invalidDate = false;
    }

  }

  showAllAddresses() {
    this.commonService.getAllAddressesByCustomerId(this.accountId).subscribe(res => {
      this.customerAddressArray = res;
      console.log(res);
      if (res.length > 1) {
        this.actionType = "Move";
      }
      else {
        this.disableCheck = true;
      }
      console.log(res);
    })
  }

  addToMoveList(item, event) {
    if (event.target.checked) {
      this.moveListArray.push(item);
      item.IsChecked = true;
    }
    else {
      let index = this.moveListArray.indexOf(item);
      this.moveListArray.splice(index, 1);
    }
  }

  deleteItem(item) {
    let index = this.movedItemsArray.indexOf(item);
    let deletingObj = this.moveListArray.filter(x => x.AddressId == item.AddressId)[0];
    let dIndex = this.movedItemsArray.indexOf(deletingObj);

    item.IsChecked = false;
    this.movedItemsArray.splice(index, 1);
    if (dIndex >= 0) {
      this.customerAddressArray.push(item)
    }
    this.moveListArray.splice(dIndex, 1);
  }

  moveItems(actionType, items) {
    if (items.length > 0) {
      items.forEach(element => {
        if (this.movedItemsArray.indexOf(element) < 0)
          this.movedItemsArray.push(element)
        let eleIndex = this.customerAddressArray.indexOf(element);
        if (eleIndex >= 0) {
          this.customerAddressArray.splice(eleIndex, 1);
        }
      });
    }

    if (actionType == 'Move') {
      if (items.length == 1) {
        this.hideDelete = true;
      }
      this.movedItemsArray[0].IsPreferred = true;
      this.defaultPreferredItem = this.movedItemsArray[0]['AddressId']
    }
    else {
      this.hideCopy = true;
      if (this.movedItemsArray.indexOf(this.customerAddressArray[0]) < 0)
        this.movedItemsArray.push(this.customerAddressArray[0]);
      this.movedItemsArray[0]['AddressId'] = 0;
      this.defaultPreferredItem = this.movedItemsArray[0]['AddressId']
    }

  }

  formReset() {
    this.addressComponent.addAddressForm.reset();
    this.splitAccountForm.reset();
  }

  editAddress(item) {
    this.toggleAddress("Edit");
    this.splitAccountForm.controls['addressType'].setValue(item.Type);
    this.splitAccountForm.controls['preferred'].setValue(item.IsPreferred);
    this.addressRequest = item;

  }

  toggleAddress(type) {
    $('#addressEdit').modal('show');
    this.addAddress = true;
    this.btnType = type;
    if (type == 'Add') {
      this.addressComponent.addAddressForm.reset();
      this.splitAccountForm.controls['addressType'].reset();
      this.splitAccountForm.controls['preferred'].reset();
      this.editAddressFlag = false;
    }
    else {
      this.editAddressFlag = true;
    }
  }

  addToList(type, item) {
    if (this.addressComponent.addAddressForm.valid && this.splitAccountForm.controls['addressType'].value) {
      let addressObj: IAddressRequest = <IAddressRequest>{};
      addressObj.Type = this.splitAccountForm.controls['addressType'].value;
      addressObj.CustomerId = this.accountId;
      addressObj.Line1 = this.addressComponent.addAddressForm.controls['addressLine1'].value;
      addressObj.Line2 = this.addressComponent.addAddressForm.controls['addressLine2'].value;
      addressObj.Line3 = this.addressComponent.addAddressForm.controls['addressLine3'].value;
      addressObj.City = this.addressComponent.addAddressForm.controls['addressCity'].value;
      addressObj.State = this.addressComponent.addAddressForm.controls['addressStateSelected'].value;
      addressObj.Country = this.addressComponent.addAddressForm.controls['addressCountrySelected'].value;
      addressObj.Zip1 = this.addressComponent.addAddressForm.controls['addressZip1'].value;
      addressObj.Zip2 = this.addressComponent.addAddressForm.controls['addressZip2'].value;
      addressObj.IsPreferred = this.splitAccountForm.controls['preferred'].value;

      if (addressObj.IsPreferred) {

        let filteredArr = this.movedItemsArray.filter(x => x.IsPreferred == true);
        if (filteredArr.length > 0) {
          filteredArr[0].IsPreferred = false;
        }
        console.log(this.movedItemsArray);

      }
      else {
        addressObj.IsPreferred = false;
        if (this.movedItemsArray.filter(x => x['AddressId'] == this.defaultPreferredItem).length > 0) {
          this.movedItemsArray.filter(x => x['AddressId'] == this.defaultPreferredItem)[0].IsPreferred = true;
        }
        console.log(this.movedItemsArray);
      }
      if (type == 'Add') {
        this.movedItemsArray.push(addressObj);
        $('#addressEdit').modal('hide');
        if (this.actionType == 'Copy') {
          this.hideCopy = true;
        }
      }
      else {
        let index = this.movedItemsArray.indexOf(item);
        $('#addressEdit').modal('hide');
        let editedObj = this.movedItemsArray[index]
        for (var key in editedObj) {
          if (editedObj[key] != addressObj[key]) {
            if (addressObj[key] != undefined || addressObj[key] != null) {
              editedObj[key] = addressObj[key];
            }
          }
        };
        this.addressRequest = addressObj;
      }
    }

    else {
      if(!this.splitAccountForm.controls['addressType'].value){
         this.validateAllFormFields(this.addressComponent.addAddressForm)
         this.showAddressTypeError=true;
      }
      this.validateAllFormFields(this.addressComponent.addAddressForm)
    }
  }

}

