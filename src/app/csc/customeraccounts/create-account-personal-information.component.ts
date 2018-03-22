import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { CommonService } from '../../shared/services/common.service';
import { ICommon, ICommonResponse } from '../../shared/models/commonresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IEmailResponse } from '../../shared/models/emailresponse';
import { IPhoneResponse } from '../../shared/models/phoneresponse';
import { IKYCDocumentResponse } from '../customerdetails/models/kycdocumentsresponse';
import { ICustomerRequest } from '../../shared/models/customerrequest';
import { PhoneType, EmailType, AppSettings, SubSystem, ActivitySource, CustomerStatus, SourceOfEntry, UserType, AddressTypes, LookupTypeCodes, Features, Actions, SubFeatures } from '../../shared/constants';
import { IAddressRequest } from '../../shared/models/addressrequest';
import { AccountStatus } from '../search/constants';
import { NameType } from './constants';
import { KYCStatus, ProofTypes, DocumentStatus } from '../customerdetails/constants';
import { IEmailRequest } from '../../shared/models/emailrequest';
import { IPhoneRequest } from '../../shared/models/phonerequest';
import { IKYCDocumentRequest } from '../customerdetails/models/kycdocumentsrequest';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { AddAddressComponent } from '../../shared/address/add-address.component';
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

declare var $: any;
@Component({
  selector: 'app-create-account-personal-information',
  templateUrl: './create-account-personal-information.component.html',
  styleUrls: ['./create-account-personal-information.component.css']
})
export class CreateAccountPersonalInformationComponent implements OnInit {
  invalidDate: boolean = false;
  maxSelectableDate = new Date(Date.now());
  constructor(private customerAccountsService: CustomerAccountsService, private commonService: CommonService, private router: Router, private createAccountService: CreateAccountService, private sessionContext: SessionService, private route: ActivatedRoute, private materialscriptService: MaterialscriptService) { }

  createAccountForm: FormGroup;
  isConvertToCustomer: boolean = false;

  userTypes = [];
  accountCategories = [];
  titles = [];
  suffixes = [];
  genderTypes = [];
  idProofs = [];
  idProofBusinesses = [];
  addressProofs = [];
  addressProofBusinesses = [];
  accountId: number;
  contactId: number;

  showBusinessName = false;
  isOtherIdProof = false;
  isOtherAddressProof = false;
  isSuffixOther = false;

  loginUserName: string;
  userId: number;
  loginId: number;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.CSC];

  isKYC: boolean = true;
  maxSize: number;
  idProofuploadedPath: string;
  addressProofuploadedPath: string;
  idProofPrevious: string = "";
  addressProofPrevious: string = "";
  isIdProofFileUploaded: boolean = false;
  isAddressProofFileUploaded: boolean = false;
  viewPath: string = "";

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
  userNamePrevious: string = "";
  toDayDate = new Date();
  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };

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

  makePaymentRequest: IMakePaymentrequest;
  sessionContextResponse: IUserresponse;

  @ViewChild('idProofFileUpload') idProofFileUpload;
  @ViewChild('addressProofFileUpload') addressProofFileUpload;
  @ViewChild(AddAddressComponent) addressComponent;
  isUserNameExists: boolean = false;
  isPrimaryEmailExists: boolean = false;
  isSecondaryEmailExists: boolean = false;
  isSecondaryEmailError: boolean = false;
  secondaryEmailErrorMessage: string = "";
  isIdproofAllZeros: boolean = false;

  isInvalidDayPhone: boolean = false;
  isInvalidEveningPhone: boolean = false;
  isInvalidMobilePhone: boolean = false;
  isInvalidWorkPhone: boolean = false;
  isInvalidFax: boolean = false;

  blockListDetails: IBlocklistresponse[] = [];
  disableButton: boolean = false;
  featureName: string;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  date;

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.loginUserName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;

    this.route.queryParams.subscribe(params => {
      this.accountId = params['customerId'];
      if (this.accountId > 0)
        this.isConvertToCustomer = true;
    });
    if (!this.accountId || this.accountId <= 0) {
      this.createAccountService.currentContext.subscribe(customerContext => this.makePaymentRequest = customerContext);
      if (this.makePaymentRequest) {
        this.accountId = this.makePaymentRequest.CustomerId;
        this.featureName = this.makePaymentRequest.FeatureName;
      }
      else {
        this.accountId = 0;
        this.featureName = Features[Features.CREATEACCOUNT];
      }
    }

    let userEvents: IUserEvents;
    if (this.isConvertToCustomer || this.accountId == 0) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.CREATEACCOUNT];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.featureName = Features[Features.CREATEACCOUNT];
    }

    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked, userEvents)
      .subscribe(res => { this.viewPath = res; console.log(this.viewPath) });

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize).subscribe(res => this.maxSize = res);
    this.bindDropdowns();
    this.initialFormValues();
    this.commonService.getKYCKey().subscribe(
      res => {
        this.isKYC = res
      },
      (err) => { }
      , () => {
        if (this.accountId > 0) {
          this.populateCustomerDetails();
        }
        else
          this.bindKYCDropdowns(UserType[UserType.Individual]);
        this.disableButton = !this.commonService.isAllowed(Features[Features.CREATEACCOUNT], Actions[Actions.CREATE], "");

        if (!this.sessionContextResponse.icnId || this.sessionContextResponse.icnId == 0) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "ICN is not assigned to do transactions";
          this.disableButton = true;
        }
      });
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

  bindKYCDropdowns(userType: string) {
    if (this.isKYC) {
      if (userType == UserType[UserType.Business]) {
        // Bind ID and Address Proofs for business customer
        this.commonService.getBusinessIDProofLookups().subscribe(res => { this.idProofs = res; });
        this.commonService.getBusinessAddressProofLookups().subscribe(res => { this.addressProofs = res; });
      }
      else {
        // Bind ID and address Proofs for individual customer
        this.commonService.getIndividualIDProofLookups().subscribe(res => { this.idProofs = res; });
        this.commonService.getIndividualAddressProofLookups().subscribe(res => { this.addressProofs = res; });
      }
    }
  }

  populateCustomerDetails() {
    var customerResponse: ICustomerResponse;
    // getting customer details
    this.customerAccountsService.getAccountDetailsById(this.accountId).subscribe(res => {
      customerResponse = res;
      console.log(customerResponse);
      if (res) {
        this.assignFormValues(customerResponse);
        this.selectSuffix();
        this.customerTypeChanged(false);
        // getting and binding KYC documents
        var kycResponseArray: IKYCDocumentResponse[];
        this.customerAccountsService.getListOfDocumentsByAccountId(this.accountId).subscribe(res => {
          kycResponseArray = res;
          console.log(kycResponseArray);
          if (res) {
            this.populateKYCInformation(kycResponseArray)
          }
        });
      }
    });
  }

  customerTypeChanged(isUIChanged: boolean) {
    if (isUIChanged) {
      this.createAccountForm.controls["idProofTypeSelected"].setValue("");
      this.selectIdProofType();
      this.idProofuploadedPath = "";
      this.isIdProofFileUploaded = false;
    }
    if (this.createAccountForm.value.userTypeSelected == UserType[UserType.Business]) {
      this.createAccountForm.controls["businessName"].setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]);
      this.showBusinessName = true;
      this.bindKYCDropdowns(UserType[UserType.Business]);
    }
    else {
      this.createAccountForm.controls["businessName"].setValue("");
      this.createAccountForm.controls["businessName"].setValidators([]);
      this.showBusinessName = false;
      this.bindKYCDropdowns(UserType[UserType.Individual]);
    }
    this.createAccountForm.controls["businessName"].updateValueAndValidity();
  }

  selectIdProofType() {
    if (this.createAccountForm.value.idProofTypeSelected == 'Other') {
      this.createAccountForm.controls["idProofOther"].setValidators([Validators.required, Validators.pattern(this.validateAlphabetsandSpacePattern)]);
      this.isOtherIdProof = true;
    }
    else {
      this.createAccountForm.controls["idProofOther"].setValue("");
      this.createAccountForm.controls["idProofOther"].setValidators([]);
      this.isOtherIdProof = false;
    }
    this.createAccountForm.controls["idProofOther"].updateValueAndValidity();
  }

  selectAddressProofType() {
    if (this.createAccountForm.value.addressProofSelected == 'Other') {
      this.createAccountForm.controls["addressProofOther"].setValidators([Validators.required, Validators.pattern(this.validateAlphabetsandSpacePattern)]);
      this.isOtherAddressProof = true;
    }
    else {
      this.createAccountForm.controls["addressProofOther"].setValue("");
      this.createAccountForm.controls["addressProofOther"].setValidators([]);
      this.isOtherAddressProof = false;
    }
    this.createAccountForm.controls["addressProofOther"].updateValueAndValidity();
  }

  selectSuffix() {
    if (this.createAccountForm.value.suffixSelected == 'Other') {
      this.createAccountForm.controls["suffixOther"].setValidators([Validators.required, Validators.maxLength(5), Validators.pattern(this.validateAlphabetsPattern)]);
      this.isSuffixOther = true;
    }
    else {
      this.createAccountForm.controls["suffixOther"].setValue("");
      this.createAccountForm.controls["suffixOther"].setValidators([]);
      this.isSuffixOther = false;
    }
    this.createAccountForm.controls["suffixOther"].updateValueAndValidity();
  }

  isUserExists() {
    if (this.createAccountForm.controls["userName"].valid && this.userNamePrevious != this.createAccountForm.value.userName) {
      this.customerAccountsService.isUserNameExist(this.createAccountForm.value.userName).subscribe(res => {
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
    if (this.createAccountForm.controls["primaryEmail"].valid) {
      this.customerAccountsService.isEmailExist(this.createAccountForm.value.primaryEmail).subscribe(res => {
        if (res)
          this.isPrimaryEmailExists = true;
        else
          this.isPrimaryEmailExists = false;
        if (this.createAccountForm.controls["secondaryEmail"].valid) {
          this.secondaryEmailErrorMessage = "";
          if (this.isSecondaryEmailExists)
            this.secondaryEmailErrorMessage = "Email already exists";
          else {
            this.secondaryEmailErrorMessage = "";
          }
          if (this.createAccountForm.value.primaryEmail == this.createAccountForm.value.secondaryEmail) {
            if (this.secondaryEmailErrorMessage != "")
              this.secondaryEmailErrorMessage += ", ";
            this.secondaryEmailErrorMessage += "Both emails should not be same";
          }
          if (this.secondaryEmailErrorMessage == "")
            this.isSecondaryEmailError = false;
          else
            this.isSecondaryEmailError = true;
        }
      });
    }
    else
      this.isPrimaryEmailExists = false;
  }

  checkSecondaryEmailExists() {
    if (this.createAccountForm.controls["secondaryEmail"].valid) {
      this.secondaryEmailErrorMessage = "";
      this.customerAccountsService.isEmailExist(this.createAccountForm.value.secondaryEmail).subscribe(res => {
        if (res) {
          this.isSecondaryEmailExists = true;
          this.secondaryEmailErrorMessage = "Email already exists";
        }
        else {
          this.isSecondaryEmailExists = false;
          this.secondaryEmailErrorMessage = "";
        }
        if (this.createAccountForm.controls["primaryEmail"].valid) {
          if (this.createAccountForm.value.primaryEmail == this.createAccountForm.value.secondaryEmail) {
            if (this.secondaryEmailErrorMessage != "")
              this.secondaryEmailErrorMessage += ", ";
            this.secondaryEmailErrorMessage += "Both emails should not be same";
          }
        }
        if (this.secondaryEmailErrorMessage == "")
          this.isSecondaryEmailError = false;
        else
          this.isSecondaryEmailError = true;
      });
    }
    else
      this.isSecondaryEmailError = false;
  }

  validateAllZeros() {
    if (this.createAccountForm.controls["idProofNo"].valid) {
      var pattern = new RegExp("^[0-9]+$");
      var result = pattern.test(this.createAccountForm.value.idProofNo);
      if (result) {
        let convertnumber: number = this.createAccountForm.value.idProofNo;
        if (convertnumber == 0)
          this.isIdproofAllZeros = true;
        else
          this.isIdproofAllZeros = false;
      }
      else
        this.isIdproofAllZeros = false;
    }
    else
      this.isIdproofAllZeros = false;
  }

  initialFormValues() {
    this.createAccountForm = new FormGroup({
      userTypeSelected: new FormControl('', Validators.required),
      businessName: new FormControl(''),
      accountCategorySelected: new FormControl('', Validators.required),
      titleSelected: new FormControl(''),
      suffixSelected: new FormControl(''),
      suffixOther: new FormControl(''),
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      middleName: new FormControl('', [Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)]),
      genderSelected: new FormControl(''),
      dateOfBirth: new FormControl(''),
      userName: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(this.validateAlphaNumericsPattern)]),
      primaryEmail: new FormControl('', [Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)]),
      secondaryEmail: new FormControl('', [Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]),
      preferredEmail: new FormControl('PrimaryEmail'),
      dayPhone: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      eveningPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      mobilePhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      workPhone: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      ext: new FormControl('', [Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)]),
      fax: new FormControl('', [Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      preferredPhone: new FormControl('DayPhone'),
      idProofTypeSelected: new FormControl('', Validators.required),
      idProofNo: new FormControl('', [Validators.required, Validators.pattern(this.validateAlphaNumericsPattern)]),
      idProofOther: new FormControl(''),
      idProofFileDrop: new FormControl(''),
      addressProofSelected: new FormControl('', Validators.required),
      addressProofOther: new FormControl(''),
      addressProofFileDrop: new FormControl(''),
      subscribeAlerts: new FormControl(''),
      agreeTermsAndConditions: new FormControl('', Validators.required),
    });
  }

  assignFormValues(customerResponse: ICustomerResponse) {
    debugger;
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
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.DayPhone];
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.EveningPhone]) {
          this.eveningPhonePrevious = phoneList[i].PhoneNumber;
          this.eveningPhoneId = phoneList[i].PhoneId;
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.EveningPhone];
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.MobileNo]) {
          this.mobilePhonePrevious = phoneList[i].PhoneNumber;
          this.mobilePhoneId = phoneList[i].PhoneId;
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.MobileNo];
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.WorkPhone]) {
          this.workPhonePrevious = phoneList[i].PhoneNumber;
          this.extensionPrevious = phoneList[i].Extension;
          this.workPhoneId = phoneList[i].PhoneId;
          if (phoneList[i].IsCommunication)
            preferPhone = PhoneType[PhoneType.WorkPhone];
        }
        else {
          this.faxPrevious = phoneList[i].PhoneNumber;
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
    this.userNamePrevious = customerResponse.UserName;
    this.createAccountForm.patchValue({
      userTypeSelected: this.isConvertToCustomer ? "" : customerResponse.UserType,
      businessName: customerResponse.OrganizationName,
      accountCategorySelected: customerResponse.RevenueCategory,
      titleSelected: customerResponse.Title,
      suffixSelected: suffixSelect,
      suffixOther: this.suffixes.indexOf(customerResponse.Suffix) < 0 ? customerResponse.Suffix : "",
      firstName: customerResponse.FirstName ? customerResponse.FirstName.trim() : "",
      middleName: customerResponse.MiddleName ? customerResponse.MiddleName.trim() : "",
      lastName: customerResponse.LastName ? customerResponse.LastName.trim() : "",
      genderSelected: customerResponse.Gender,
      //dateOfBirth: date <= new Date(1, 0, 1) ? "" : customerResponse.DOB,
      dateOfBirth: date <= new Date(1, 0, 1) ? "" : {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate() + 1
        }
      },

      userName: customerResponse.UserName,
      primaryEmail: primaryEmail,
      secondaryEmail: secondaryEmail,
      preferredEmail: preferEmail,
      dayPhone: this.dayPhonePrevious,
      eveningPhone: this.eveningPhonePrevious,
      mobilePhone: this.mobilePhonePrevious,
      workPhone: this.workPhonePrevious,
      ext: this.extensionPrevious,
      fax: this.faxPrevious,
      preferredPhone: preferPhone,
      subscribeAlerts: customerResponse.Alerts,
      agreeTermsAndConditions: '',

    });

  }


  populateKYCInformation(kycResponseArray: IKYCDocumentResponse[]) {
    for (var i = 0; i < kycResponseArray.length; i++) {
      if ((kycResponseArray[i].DocumentCategory == ProofTypes[ProofTypes.IDProofBusiness]) || (kycResponseArray[i].DocumentCategory == ProofTypes[ProofTypes.IDProof])) {
        this.createAccountForm.controls["idProofTypeSelected"].setValue(kycResponseArray[i].DocumentType);
        this.selectIdProofType();
        this.createAccountForm.controls["idProofNo"].setValue(kycResponseArray[i].DocumentNumber);
        console.log(kycResponseArray[i].DocumentType);
        this.idProofPrevious = kycResponseArray[i].DocumentType;
        if (kycResponseArray[i].DocumentType.toUpperCase() == "OTHER") {
          this.idProofPrevious = kycResponseArray[i].Description;
          this.createAccountForm.controls["idProofOther"].setValue(kycResponseArray[i].Description);
          this.isOtherIdProof = true;
        }
        else {
          this.isOtherIdProof = false;
        }

        if (kycResponseArray[i].DocumentPath) {
          this.idProofuploadedPath = kycResponseArray[i].DocumentPath;
          this.isIdProofFileUploaded = true;
        }
        else {
          this.idProofuploadedPath = "";
          this.isIdProofFileUploaded = false;
        }
      }
      else if ((kycResponseArray[i].DocumentCategory == ProofTypes[ProofTypes.AddressProof]) || (kycResponseArray[i].DocumentCategory == ProofTypes[ProofTypes.AddressProofBusiness])) {
        this.createAccountForm.controls["addressProofSelected"].setValue(kycResponseArray[i].DocumentType);
        this.selectAddressProofType();
        this.addressProofPrevious = kycResponseArray[i].DocumentType;
        if (kycResponseArray[i].DocumentType.toUpperCase() == "OTHER") {
          this.createAccountForm.controls["addressProofOther"].setValue(kycResponseArray[i].Description);
          this.addressProofPrevious = kycResponseArray[i].Description;
          this.isOtherAddressProof = true;
        }
        else {
          this.isOtherAddressProof = false;
        }

        if (kycResponseArray[i].DocumentPath) {
          this.addressProofuploadedPath = kycResponseArray[i].DocumentPath;
          this.isAddressProofFileUploaded = true;
        }
        else {
          this.addressProofuploadedPath = "";
          this.isAddressProofFileUploaded = false;
        }
      }
    }
  }

  createAccountClick() {
    this.createAccount(true);
  }

  createAccountPopup() {
    this.createAccount(false);
  }

  createAccount(checkBlockList: boolean) {
    this.blockListDetails = [];
    this.addorRemoveValidators();
    if (this.createAccountForm.valid && this.addressComponent.addAddressForm.valid) {
      if (this.createAccountForm.value.userTypeSelected == UserType[UserType.Business] && this.createAccountForm.value.businessName) {
        if (this.createAccountForm.value.businessName.indexOf(' ') == 0) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Initial space(s) not allowed for business name";
          return;
        }
      }

      if (this.isUserNameExists) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "User Name already exists";
        return;
      }
      if (this.isIdproofAllZeros) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "ID Proof No. should not be zero";
        return;
      }
      if (this.isInvalidDayPhone || this.isInvalidEveningPhone || this.isInvalidMobilePhone || this.isInvalidWorkPhone || this.isInvalidFax) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Invalid phone number";
        return;
      }
      var customerRequest: ICustomerRequest = this.createCustomerDTO(checkBlockList);
      console.log(customerRequest);

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureName;
      userEvents.SubFeatureName = SubFeatures[SubFeatures.ACCOUNTINFORMATION];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.disableButton = true;
      $('#pageloader').modal('show');
      this.customerAccountsService.createCustomer(customerRequest, userEvents).subscribe(res => {
        $('#pageloader').modal('hide');
        this.disableButton = false;
        if (res > 0) {
          this.makePaymentRequest = <IMakePaymentrequest>{};
          this.makePaymentRequest.CustomerId = res;
          this.makePaymentRequest.FeatureName = this.featureName;
          this.createAccountService.changeResponse(this.makePaymentRequest);
          if (!this.invalidDate)
            this.router.navigate(['/csc/customeraccounts/create-account-plan-selection']);

        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Error while creating customer";
        }
      }, err => {
        this.disableButton = false;
        $('#pageloader').modal('hide');
        console.log(err);
        if (err.error) {
          this.blockListDetails = err.error;
          $('#blocklist-dialog').modal('show');
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        }
      });
    }
    else {
      $('#collapseOne,#collapseTwo,#collapseThree,#collapseFour').addClass('in');
      $('.panel-title > a').removeClass('collapsed');
      $('#collapseOne,#collapseTwo,#collapseThree,#collapseFour').css('height', '');
      this.validateAllFormFields(this.createAccountForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }
  }

  addorRemoveValidators() {
    // personal details block
    if (this.createAccountForm.value.middleName)
      this.createAccountForm.controls["middleName"].setValidators([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)]);
    else
      this.createAccountForm.controls["middleName"].setValidators([]);
    this.createAccountForm.controls["workPhone"].updateValueAndValidity();

    // email block
    if (this.createAccountForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail]) {
      this.createAccountForm.controls["primaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      if (this.createAccountForm.value.secondaryEmail) {
        this.createAccountForm.controls["secondaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      }
      else
        this.createAccountForm.controls["secondaryEmail"].setValidators([]);
    }
    else {
      this.createAccountForm.controls["secondaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      if (this.createAccountForm.value.primaryEmail) {
        this.createAccountForm.controls["primaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      }
      else
        this.createAccountForm.controls["primaryEmail"].setValidators([]);
    }
    this.createAccountForm.controls['primaryEmail'].updateValueAndValidity();
    this.createAccountForm.controls["secondaryEmail"].updateValueAndValidity();

    // phone block
    if (this.createAccountForm.value.dayPhone)
      this.createAccountForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["dayPhone"].setValidators([]);
    if (this.createAccountForm.value.eveningPhone)
      this.createAccountForm.controls["eveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["eveningPhone"].setValidators([]);
    if (this.createAccountForm.value.mobilePhone)
      this.createAccountForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["mobilePhone"].setValidators([]);
    if (this.createAccountForm.value.workPhone)
      this.createAccountForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else {
      if (this.createAccountForm.controls["ext"].value)
        this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      else
        this.createAccountForm.controls["workPhone"].setValidators([]);
    }

    if (this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.DayPhone])
      this.createAccountForm.controls["dayPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone])
      this.createAccountForm.controls["eveningPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.MobileNo])
      this.createAccountForm.controls["mobilePhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);

    this.createAccountForm.controls['dayPhone'].updateValueAndValidity();
    this.createAccountForm.controls["eveningPhone"].updateValueAndValidity();
    this.createAccountForm.controls['mobilePhone'].updateValueAndValidity();
    this.createAccountForm.controls["workPhone"].updateValueAndValidity();

    // agree terms
    if (this.createAccountForm.value.agreeTermsAndConditions == true)
      this.createAccountForm.controls["agreeTermsAndConditions"].setValidators([]);
    else {
      this.createAccountForm.controls["agreeTermsAndConditions"].setValue("");
      this.createAccountForm.controls["agreeTermsAndConditions"].setValidators(Validators.required);
    }
    this.createAccountForm.controls["agreeTermsAndConditions"].updateValueAndValidity();

    //kyc block
    if (this.isKYC) {
      if (this.idProofuploadedPath)
        this.createAccountForm.controls["idProofFileDrop"].setValidators([]);
      else {
        this.createAccountForm.controls["idProofFileDrop"].setValidators(Validators.required);
      }
      this.createAccountForm.controls["idProofFileDrop"].updateValueAndValidity();

      if (this.addressProofuploadedPath)
        this.createAccountForm.controls["addressProofFileDrop"].setValidators([]);
      else {
        this.createAccountForm.controls["addressProofFileDrop"].setValidators(Validators.required);
      }
      this.createAccountForm.controls["addressProofFileDrop"].updateValueAndValidity();
    }
    else {
      this.createAccountForm.controls["idProofNo"].setValidators([]);
      this.createAccountForm.controls["idProofTypeSelected"].setValidators([]);
      this.createAccountForm.controls["addressProofSelected"].setValidators([]);
      this.createAccountForm.controls["idProofNo"].updateValueAndValidity();
      this.createAccountForm.controls["idProofTypeSelected"].updateValueAndValidity();
      this.createAccountForm.controls["addressProofSelected"].updateValueAndValidity();
    }
  }

  createCustomerDTO(checkBlockList: boolean): ICustomerRequest {

    var customerRequest: ICustomerRequest = <ICustomerRequest>{};
    customerRequest.AccountId = this.accountId;
    customerRequest.AccountStatus = AccountStatus[AccountStatus.NA];
    customerRequest.UserType = this.createAccountForm.value.userTypeSelected;
    customerRequest.CustomerStatus = CustomerStatus[CustomerStatus.C];
    customerRequest.OrganizationName = this.createAccountForm.value.businessName ? this.createAccountForm.value.businessName.trim() : "";
    customerRequest.RevenueCategory = this.createAccountForm.value.accountCategorySelected;
    customerRequest.SourceOfEntry = SourceOfEntry[SourceOfEntry.Online];
    customerRequest.FirstName = this.createAccountForm.value.firstName.trim();
    customerRequest.MiddleName = this.createAccountForm.value.middleName ? this.createAccountForm.value.middleName.trim() : "";
    customerRequest.LastName = this.createAccountForm.value.lastName.trim();
    customerRequest.Gender = this.createAccountForm.value.genderSelected;
    customerRequest.Suffix = this.createAccountForm.value.suffixSelected == "Other" ? this.createAccountForm.value.suffixOther : this.createAccountForm.value.suffixSelected;
    customerRequest.Title = this.createAccountForm.value.titleSelected;
    customerRequest.Alerts = this.createAccountForm.value.subscribeAlerts;
    let dobValue = this.createAccountForm.value.dateOfBirth;
    if (this.createAccountForm.value.dateOfBirth) {
      let dob = new Date(dobValue.date.year, dobValue.date.month - 1, dobValue.date.day);
      customerRequest.DOB = dob;
    }

    if (this.isConvertToCustomer) {
      customerRequest.IsPrimary = true;
      customerRequest.convertToCustomer = true;
    }
    customerRequest.NameType = NameType[NameType.Primary];
    //activity related data 
    customerRequest.SubSystem = this.subSystem;
    customerRequest.ActivitySource = this.activitySource;
    customerRequest.InitiatedBy = this.loginUserName;

    //Create Customer address
    customerRequest.AddressList = [];
    customerRequest.AddressList.push(this.createAddress());
    // Creating Email details
    customerRequest.EmailList = this.createEmailList();
    // Creating Phone details
    customerRequest.PhoneList = this.createPhoneList();
    //Creating System activities related     
    customerRequest.UserId = this.userId;
    customerRequest.LoginId = this.loginId;
    customerRequest.User = this.loginUserName;
    // Creating login details
    customerRequest.UserName = this.createAccountForm.value.userName.trim();

    customerRequest.boolActivityRequired = true;
    customerRequest.ContactId = this.contactId;

    if (this.isKYC) {
      customerRequest.KYCRequired = true;
      customerRequest.KYCStatus = KYCStatus[KYCStatus.Received];
      customerRequest.AddKYCDocument = this.createKYCList();
    }
    else
      customerRequest.KYCRequired = false;
    customerRequest.CheckBlockList = checkBlockList;
    return customerRequest;
  }


  // creating address object
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
    addressRequest.Type = AddressTypes[AddressTypes.Primary];
    addressRequest.ActivitySource = this.activitySource;
    addressRequest.SubSystem = this.subSystem;
    addressRequest.UserName = this.loginUserName;
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
    if (this.createAccountForm.value.primaryEmail) {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.loginUserName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.createAccountForm.value.primaryEmail;
      emailRequest.Type = EmailType[EmailType.PrimaryEmail];
      emailRequest.IsPreferred = this.createAccountForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }

    if (this.createAccountForm.value.secondaryEmail) {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.loginUserName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.createAccountForm.value.secondaryEmail;
      emailRequest.Type = EmailType[EmailType.SecondaryEmail];
      emailRequest.IsPreferred = this.createAccountForm.value.preferredEmail == EmailType[EmailType.SecondaryEmail];
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

    if (this.createAccountForm.value.dayPhone || this.dayPhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createAccountForm.value.dayPhone;
      phoneRequest.Type = PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCommunication = this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCreateAccount = true;
      if (!this.createAccountForm.value.dayPhone) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.dayPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.createAccountForm.value.eveningPhone || this.eveningPhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createAccountForm.value.eveningPhone;
      phoneRequest.Type = PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCommunication = this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCreateAccount = true;
      if (this.createAccountForm.value.eveningPhone == "") {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.eveningPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.createAccountForm.value.mobilePhone || this.mobilePhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createAccountForm.value.mobilePhone;
      phoneRequest.Type = PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCommunication = this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCreateAccount = true;
      if (!this.createAccountForm.value.mobilePhone) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.mobilePhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.createAccountForm.value.workPhone || this.workPhonePrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createAccountForm.value.workPhone;
      phoneRequest.Type = PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCommunication = this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCreateAccount = true;
      phoneRequest.Extension = this.createAccountForm.value.ext;
      if (!this.createAccountForm.value.workPhone) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.workPhoneId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.createAccountForm.value.fax || this.faxPrevious) {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.loginUserName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.createAccountForm.value.fax;
      phoneRequest.Type = PhoneType[PhoneType.Fax];
      phoneRequest.IsCommunication = false;
      phoneRequest.IsCreateAccount = true;
      if (!this.createAccountForm.value.fax) {
        phoneRequest.IsPhoneNumberChanged = true;
        phoneRequest.PhoneId = this.faxId;
      }
      phoneRequestArray.push(phoneRequest);
    }

    if (phoneRequestArray.length > 0)
      phoneRequestArray[0].IsActivityRequired = true;
    return phoneRequestArray;
  }

  // creating kyc documents list
  createKYCList(): IKYCDocumentRequest[] {
    var kycDocumentRequestArray: IKYCDocumentRequest[] = [];
    var kycDocumentRequest: IKYCDocumentRequest = <IKYCDocumentRequest>{};

    kycDocumentRequest.ActivitySource = this.activitySource;
    kycDocumentRequest.CreatedUser = this.loginUserName;
    kycDocumentRequest.SubSystem = this.subSystem;
    kycDocumentRequest.DocumentCategory = this.createAccountForm.value.UserType == UserType[UserType.Business] ? ProofTypes[ProofTypes.IDProofBusiness] : ProofTypes[ProofTypes.IDProof];
    kycDocumentRequest.DocumentCategoryDesc = "ID Proof";
    kycDocumentRequest.DocumentNumber = this.createAccountForm.value.idProofNo.trim();
    kycDocumentRequest.DocumentPath = this.idProofuploadedPath;
    kycDocumentRequest.DocumentStatus = DocumentStatus[DocumentStatus.Received];
    kycDocumentRequest.DocumentType = this.createAccountForm.value.idProofTypeSelected;

    if (this.createAccountForm.value.idProofTypeSelected.toUpperCase() == "OTHER") {
      kycDocumentRequest.Description = this.createAccountForm.value.idProofOther.trim();
      if (this.idProofPrevious != kycDocumentRequest.Description)
        kycDocumentRequest.IsDocumentProofChanged = true;
    }
    else {
      kycDocumentRequest.Description = this.createAccountForm.value.idProofTypeSelected;
      if (this.idProofPrevious != kycDocumentRequest.DocumentType)
        kycDocumentRequest.IsDocumentProofChanged = true;
    }
    kycDocumentRequest.IsReceived = true;
    kycDocumentRequest.IsUploaded = true;
    kycDocumentRequest.LoginId = this.loginId;
    kycDocumentRequest.UpdatedUser = this.loginUserName;
    kycDocumentRequest.UploadedBy = this.userId;
    kycDocumentRequest.User = this.loginUserName;
    kycDocumentRequest.UserId = this.userId;
    kycDocumentRequestArray.push(kycDocumentRequest);

    kycDocumentRequest = <IKYCDocumentRequest>{};
    kycDocumentRequest.ActivitySource = this.activitySource;
    kycDocumentRequest.CreatedUser = this.loginUserName;
    kycDocumentRequest.SubSystem = this.subSystem;
    kycDocumentRequest.DocumentCategory = this.createAccountForm.value.UserType == UserType[UserType.Business] ? ProofTypes[ProofTypes.AddressProofBusiness] : ProofTypes[ProofTypes.AddressProof];
    kycDocumentRequest.DocumentCategoryDesc = "Address Proof";
    kycDocumentRequest.DocumentType = this.createAccountForm.value.addressProofSelected;
    if (this.createAccountForm.value.addressProofSelected.toUpperCase() == "OTHER") {
      kycDocumentRequest.Description = this.createAccountForm.value.addressProofOther.trim();
      if (this.addressProofPrevious != kycDocumentRequest.Description)
        kycDocumentRequest.IsDocumentProofChanged = true;
    }
    else {
      kycDocumentRequest.Description = this.createAccountForm.value.addressProofSelected;
      if (this.addressProofPrevious != kycDocumentRequest.DocumentType)
        kycDocumentRequest.IsDocumentProofChanged = true;
    }

    kycDocumentRequest.DocumentPath = this.addressProofuploadedPath;
    kycDocumentRequest.DocumentStatus = DocumentStatus[DocumentStatus.Received];
    kycDocumentRequest.IsReceived = true;
    kycDocumentRequest.IsUploaded = true;
    kycDocumentRequest.LoginId = this.loginId;
    kycDocumentRequest.UpdatedUser = this.loginUserName;
    kycDocumentRequest.UploadedBy = this.userId;
    kycDocumentRequest.User = this.loginUserName;
    kycDocumentRequest.UserId = this.userId;
    kycDocumentRequestArray.push(kycDocumentRequest);
    return kycDocumentRequestArray;
  }

  uploadClickIDProof() {
    if (this.idProofFileUpload.nativeElement.files[0]) {
      let file: File = this.idProofFileUpload.nativeElement.files[0];
      let formData = new FormData();
      formData.append('upload', file);
      this.customerAccountsService.uploadFile(formData)
        .subscribe(
        data => {
          this.idProofuploadedPath = data;
          this.isIdProofFileUploaded = true;
          console.log(this.idProofuploadedPath);
          this.createAccountForm.controls["idProofFileDrop"].setValidators([]);
          this.createAccountForm.controls["idProofFileDrop"].updateValueAndValidity();
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        });
    }
  }

  uploadClickAddressProof() {
    if (this.addressProofFileUpload.nativeElement.files[0]) {
      let file: File = this.addressProofFileUpload.nativeElement.files[0];
      let formData = new FormData();
      formData.append('upload', file);
      this.customerAccountsService.uploadFile(formData)
        .subscribe(
        data => {
          this.addressProofuploadedPath = data;
          this.isAddressProofFileUploaded = true;
          console.log(this.addressProofuploadedPath);
          this.createAccountForm.controls["addressProofFileDrop"].setValidators([]);
          this.createAccountForm.controls["addressProofFileDrop"].updateValueAndValidity();
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        });
    }
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.createAccountForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.createAccountForm.controls[objId].setValue(phone);
    }
  }

  validateDayPhoneAllZeros() {
    if (this.createAccountForm.controls["dayPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createAccountForm.value.dayPhone))
        this.isInvalidDayPhone = true;
      else
        this.isInvalidDayPhone = false;
    }
    else
      this.isInvalidDayPhone = false;
  }

  validateEveningPhoneAllZeros() {
    if (this.createAccountForm.controls["eveningPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createAccountForm.value.eveningPhone))
        this.isInvalidEveningPhone = true;
      else
        this.isInvalidEveningPhone = false;
    }
    else
      this.isInvalidEveningPhone = false;
  }

  validateMobilePhoneAllZeros() {
    if (this.createAccountForm.controls["mobilePhone"].valid) {
      if (this.validateAllZerosinPhone(this.createAccountForm.value.mobilePhone))
        this.isInvalidMobilePhone = true;
      else
        this.isInvalidMobilePhone = false;
    }
    else
      this.isInvalidMobilePhone = false;
  }

  validateWorkPhoneAllZeros() {
    if (this.createAccountForm.controls["workPhone"].valid) {
      if (this.validateAllZerosinPhone(this.createAccountForm.value.workPhone))
        this.isInvalidWorkPhone = true;
      else
        this.isInvalidWorkPhone = false;
    }
    else
      this.isInvalidWorkPhone = false;
  }

  validateFaxAllZeros() {
    if (this.createAccountForm.controls["fax"].valid) {
      if (this.validateAllZerosinPhone(this.createAccountForm.value.fax))
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
    this.createAccountForm.controls["dayPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createAccountForm.controls["eveningPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createAccountForm.controls["mobilePhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    if (this.createAccountForm.controls["ext"].value)
      this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    if (phoneType == "DayPhone")
      this.createAccountForm.controls["dayPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "EveningPhone")
      this.createAccountForm.controls["eveningPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else if (phoneType == "MobileNo")
      this.createAccountForm.controls["mobilePhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else
      this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    this.createAccountForm.controls['dayPhone'].updateValueAndValidity();
    this.createAccountForm.controls["eveningPhone"].updateValueAndValidity();
    this.createAccountForm.controls['mobilePhone'].updateValueAndValidity();
    this.createAccountForm.controls["workPhone"].updateValueAndValidity();
  }

  changeExtension() {
    if (this.createAccountForm.controls["ext"].value)
      this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
    else {
      if (this.createAccountForm.controls["workPhone"].value) {
        if (this.createAccountForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone]) {
          this.createAccountForm.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
        }
        else
          this.createAccountForm.controls["workPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      } else
        this.createAccountForm.controls["workPhone"].setValidators([]);
    }
    this.createAccountForm.controls["workPhone"].updateValueAndValidity();
  }

  changeEmailValidation(emailType) {
    if (emailType == "PrimaryEmail") {
      this.createAccountForm.controls["primaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      this.createAccountForm.controls["secondaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
    }
    else {
      this.createAccountForm.controls["primaryEmail"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      this.createAccountForm.controls["secondaryEmail"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);

    }
    this.createAccountForm.controls['primaryEmail'].updateValueAndValidity();
    this.createAccountForm.controls["secondaryEmail"].updateValueAndValidity();
  }

  removeIDProof() {
    this.isIdProofFileUploaded = false;
    this.idProofuploadedPath = "";
    this.createAccountForm.controls["idProofFileDrop"].setValidators(Validators.required);
    this.createAccountForm.controls["idProofFileDrop"].updateValueAndValidity();
  }

  removeAddressProof() {
    this.isAddressProofFileUploaded = false;
    this.addressProofuploadedPath = "";
    this.createAccountForm.controls["addressProofFileDrop"].setValidators(Validators.required);
    this.createAccountForm.controls["addressProofFileDrop"].updateValueAndValidity();
  }

  cancelAccount() {
    this.msgType = "alert";
    this.msgFlag = true;
    this.msgDesc = "Your Information no longer exists, if you cancel your application. Are you sure you want to Cancel?";
  }

  userAction(event) {
    if (event) {
      this.makePaymentRequest = <IMakePaymentrequest>{};
      this.makePaymentRequest.CustomerId = 0;
      this.createAccountService.changeResponse(this.makePaymentRequest);
      this.createAccountForm.reset();
      this.createAccountForm.controls["userTypeSelected"].setValue("");
      this.createAccountForm.controls["accountCategorySelected"].setValue("");
      this.createAccountForm.controls["titleSelected"].setValue("");
      this.createAccountForm.controls["suffixSelected"].setValue("");
      this.createAccountForm.controls["genderSelected"].setValue("");

      this.createAccountForm.controls["idProofTypeSelected"].setValue("");
      this.createAccountForm.controls["addressProofSelected"].setValue("");

      this.createAccountForm.controls["preferredEmail"].setValue("PrimaryEmail");
      this.createAccountForm.controls["preferredPhone"].setValue("DayPhone");

      this.addressComponent.addAddressForm.reset();
      this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue("");
      this.addressComponent.addAddressForm.controls["addressStateSelected"].setValue("");

      this.removeIDProof();
      this.removeAddressProof();

      this.idProofPrevious = "";
      this.addressProofPrevious = "";
      this.isIdProofFileUploaded = false;
      this.isAddressProofFileUploaded = false;

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
      this.blockListDetails = [];

      this.isUserNameExists = false;
      this.isPrimaryEmailExists = false;
      this.isSecondaryEmailExists = false;
      this.isSecondaryEmailError = false;
      this.secondaryEmailErrorMessage = "";

      this.isIdproofAllZeros = false;

      this.isInvalidDayPhone = false;
      this.isInvalidEveningPhone = false;
      this.isInvalidMobilePhone = false;
      this.isInvalidWorkPhone = false;
      this.isInvalidFax = false;
      this.userNamePrevious = "";
    }
    else {
      this.msgFlag = false;
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
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
  onDateChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}