import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerAccountsService } from '../customeraccounts/services/customeraccounts.service';
import { CommonService } from '../../shared/services/common.service';
import { Router } from '@angular/router';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { AddAddressComponent } from '../../shared/address/add-address.component';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { IAddressResponse } from '../../shared/models/addressresponse';
import { CustomerserviceService } from '../customerservice/services/customerservice.service';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { IEmailResponse } from '../../shared/models/emailresponse';
import { IPhoneResponse } from '../../shared/models/phoneresponse';
import { PhoneType, EmailType, CustomerStatus, SourceOfEntry, ActivitySource, SubSystem, AddressTypes, Features, Actions } from '../../shared/constants';
import { ICustomerRequest } from '../../shared/models/customerrequest';
import { AccountStatus } from '../search/constants';
import { NameType } from '../customeraccounts/constants';
import { IPhoneRequest } from '../../shared/models/phonerequest';
import { IAddressRequest } from '../../shared/models/addressrequest';
import { IEmailRequest } from '../../shared/models/emailrequest';
import { RevenueCategory } from '../../payment/constants';
import { ICustomerProfileRequest } from '../../shared/models/customerprofilerequest';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-additional-contacts',
  templateUrl: './additional-contacts.component.html',
  styleUrls: ['./additional-contacts.component.scss']
})
export class AdditionalContactsComponent implements OnInit {
  customerResponse: ICustomerResponse[];
  customerResponseUpdateDelete: ICustomerResponse;
  constructor(
    private customerContextService: CustomerContextService,
    private commonService: CommonService,
    private router: Router,
    private sessionContext: SessionService,
    private customerService: CustomerserviceService,
    private customerAccountsService: CustomerAccountsService,
    private materialscriptService: MaterialscriptService
  ) {
    this.initilizeFormControl();
  }


  // Paging start
  p: number;
  pageItemNumber: number = 10;
  // dataLength: number ;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    //this.getCustomerStatements(this.p);
    this.bindCustomerGridview(this.p)
    this.isDelete = false;
    this.isUpdate = false;
    this.isCreate = true;
  }

  // end 
  @ViewChild(AddAddressComponent) addressComponent;

  //array 
  titles = [];
  suffixes = [];
  genderTypes = [];

  // Local variable 
  userName: string;
  userId: number;
  loginId: number;
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
  contactId: number;
  createButtonName: string = "";
  isDisabledOnDelete: boolean = false;
  isDisableUserName: boolean = false;

  // buttons flag
  isCreate: boolean;
  isDelete: boolean;
  isUpdate: boolean;

  // form deatails
  additionalContactForm: FormGroup;

  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.CSC];

  // class object 
  sessionContextResponse: IUserresponse;
  objICustomerContextResponse: ICustomerContextResponse;
  addressResponse: IAddressResponse;
  icustomerProfileRequest: ICustomerProfileRequest = <ICustomerProfileRequest>{};
  isystemActivities: ISystemActivities = <ISystemActivities>{};



  isSuffixOther: boolean = false;
  //isErrorBlock: boolean = false;
  // failureMessage: string = "";
  isUserNameExists: boolean = false;
  isPrimaryEmailExists: boolean = false;
  isSecondaryEmailExists: boolean = false;
  isddContacts: boolean = false;
  isSecondaryEmailError: boolean = false;
  secondaryEmailErrorMessage: string = "";


  // Patteren
  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";


  secondaryAccountId: number;
  parentAccountId: number;
  accountIdContext: number;
  blockListDetails: IBlocklistresponse[] = [];
  userEvents: IUserEvents;
  isAddAllowed: boolean;
  isUpdateAllowed: boolean;
  isDeleteAllowed: boolean;

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  isDeatilsAvailable: boolean = false;
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    // //console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.customerContextService.currentContext
      .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
      );
    if (this.objICustomerContextResponse == null) {
      ////console.log('no context');
      let link = ['csc/search/advanced'];
      this.router.navigate(link);
      return;
    }
    else {
      // if (this.objICustomerContextResponse.ParentId > 0)
      //   this.parentAccountId = this.objICustomerContextResponse.ParentId;
      // else
      this.parentAccountId = this.objICustomerContextResponse.AccountId;
    }

    this.isDelete = false;
    this.isUpdate = false;
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;

    this.setUserActionObject();
    this.bindDropdowns();
    this.bindCustomerGridview(this.p);
    this.initilizeFormControl();

    this.isAddAllowed = !this.commonService.isAllowed(Features[Features.ADDITIONALACCOUNTCONTACTS], Actions[Actions.CREATE], this.objICustomerContextResponse.AccountStatus);
    this.isUpdateAllowed = !this.commonService.isAllowed(Features[Features.ADDITIONALACCOUNTCONTACTS], Actions[Actions.UPDATE], this.objICustomerContextResponse.AccountStatus);
    this.isDeleteAllowed = !this.commonService.isAllowed(Features[Features.ADDITIONALACCOUNTCONTACTS], Actions[Actions.DELETE], this.objICustomerContextResponse.AccountStatus);
  }


  bindDropdowns() {
    // Bind Title
    this.commonService.getTitleLookups(this.userEvents).subscribe(res => {
      this.titles = res;
      this.titles.filter(xx => xx.Value != 'Title');
    });
    // Bind Suffix
    this.commonService.getSuffixLookups().subscribe(res => {
      this.suffixes = res;
      this.suffixes.filter(y => y.Value != 'Suffix')
    });
    // Bind Gender
    this.commonService.getGenderLookups().subscribe(res => {
      this.genderTypes = res;
      this.genderTypes.filter(y => y.Value != 'Gender');
    });
  }

  selectSuffix() {
    if (this.additionalContactForm.value.suffixSelected == 'Other') {
      this.additionalContactForm.addControl('suffixOther', new FormControl('', [Validators.compose([Validators.required, Validators.maxLength(5), Validators.pattern('[a-zA-Z]*')])]));
      this.isSuffixOther = true;
    }
    else {
      this.additionalContactForm.removeControl('suffixOther');
      this.isSuffixOther = false;
    }
  }

  changeEmailValidation(emailType) {
    if (emailType == "PrimaryEmail") {
      this.additionalContactForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      this.additionalContactForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
    }
    else {
      this.additionalContactForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      this.additionalContactForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));

    }
    this.additionalContactForm.controls['primaryEmail'].updateValueAndValidity();
    this.additionalContactForm.controls["secondaryEmail"].updateValueAndValidity();
  }

  changePhoneValidation(phoneType) {
    this.additionalContactForm.controls["dayPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.additionalContactForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.additionalContactForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.additionalContactForm.controls["workPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    if (phoneType == "DayPhone")
      this.additionalContactForm.controls["dayPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (phoneType == "EveningPhone")
      this.additionalContactForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (phoneType == "MobileNo")
      this.additionalContactForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.additionalContactForm.controls["workPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));

    this.additionalContactForm.controls['dayPhone'].updateValueAndValidity();
    this.additionalContactForm.controls["eveningPhone"].updateValueAndValidity();
    this.additionalContactForm.controls['mobilePhone'].updateValueAndValidity();
    this.additionalContactForm.controls["workPhone"].updateValueAndValidity();
  }

  getDefaultAddress() {
    this.customerService.getDefaultAddress(this.parentAccountId).subscribe(
      result => {
        this.addressResponse = result;
        // //console.log(result);
      });
  }


  populateCustomerDetails(accountId: number) {
    var customerResponse: ICustomerResponse;
    // getting customer details
    this.customerAccountsService.getAccountDetail(accountId).subscribe(res => {
      this.customerResponseUpdateDelete = res;
      // console.log(customerResponse);
      if (res) {
        this.assignFormValues(this.customerResponseUpdateDelete);
        this.selectSuffix();
      }
    });
    this.materialscriptService.material();
  }

  assignFormValues(customerResponse: ICustomerResponse) {
    var emailList: IEmailResponse[] = <IEmailResponse[]>{};
    var phoneList: IPhoneResponse[] = <IPhoneResponse[]>{};
    emailList = customerResponse.EmailList.map(x => Object.assign({}, x));
    phoneList = customerResponse.PhoneList.map(x => Object.assign({}, x));
    var primaryEmail: string = "";
    var secondaryEmail: string = "";
    var preferredEmail: string = "";
    var preferredPhone: string = "";

    if (emailList != null) {
      for (var i = 0; i < emailList.length; i++) {
        if (emailList[i].Type == EmailType[EmailType.PrimaryEmail]) {
          primaryEmail = emailList[i].EmailAddress;
          preferredEmail = emailList[i].IsPreferred ? EmailType[EmailType.PrimaryEmail] : "";
        }
        else {
          secondaryEmail = emailList[i].EmailAddress;
          preferredEmail = emailList[i].IsPreferred ? EmailType[EmailType.SecondaryEmail] : "";
        }
      }
    }

    if (phoneList != null) {
      for (var i = 0; i < phoneList.length; i++) {
        if (phoneList[i].Type == PhoneType[PhoneType.DayPhone]) {
          this.dayPhonePrevious = phoneList[i].PhoneNumber;
          this.dayPhoneId = phoneList[i].PhoneId;
          preferredPhone = phoneList[i].IsCommunication ? PhoneType[PhoneType.DayPhone] : "";
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.EveningPhone]) {
          this.eveningPhonePrevious = phoneList[i].PhoneNumber;
          this.eveningPhoneId = phoneList[i].PhoneId;
          preferredPhone = phoneList[i].IsCommunication ? PhoneType[PhoneType.EveningPhone] : "";
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.MobileNo]) {
          this.mobilePhonePrevious = phoneList[i].PhoneNumber;
          this.mobilePhoneId = phoneList[i].PhoneId;
          preferredPhone = phoneList[i].IsCommunication ? PhoneType[PhoneType.MobileNo] : "";
        }
        else if (phoneList[i].Type == PhoneType[PhoneType.WorkPhone]) {
          this.workPhonePrevious = phoneList[i].PhoneNumber;
          this.extensionPrevious = phoneList[i].Extension;
          this.workPhoneId = phoneList[i].PhoneId;
          preferredPhone = phoneList[i].IsCommunication ? PhoneType[PhoneType.WorkPhone] : "";
        }
        else {
          this.faxPrevious = phoneList[i].PhoneNumber;
        }
      }
    }
    this.changeEmailValidation(preferredEmail);
    this.changePhoneValidation(preferredPhone);
    // var date = new Date(customerResponse.DOB);
    let temp;
    this.suffixes.forEach(element => {
      if (element.Key == customerResponse.Suffix)
        temp = true;
    })
    this.contactId = customerResponse.ContactId;
    this.additionalContactForm.patchValue({
      titleSelected: customerResponse.Title,
      suffixSelected: temp ? customerResponse.Suffix : "Other",
      suffixOther: temp ? customerResponse.Suffix : customerResponse.Suffix,
      firstName: customerResponse.FirstName,
      lastName: customerResponse.LastName,
      genderSelected: customerResponse.Gender,
      userName: customerResponse.UserName,
      primaryEmail: primaryEmail,
      secondaryEmail: secondaryEmail,
      // preferredEmail: preferredEmail,
      dayPhone: this.dayPhonePrevious,
      eveningPhone: this.eveningPhonePrevious,
      mobilePhone: this.mobilePhonePrevious,
      workPhone: this.workPhonePrevious,
      fax: this.faxPrevious,
      mi: customerResponse.MiddleName,
      subscribetoNews: customerResponse.Alerts,
    });
    this.materialscriptService.material();
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.additionalContactForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.additionalContactForm.controls[objId].setValue(phone);
    }
  }

  checkSecondaryEmailExists() {
    if (this.additionalContactForm.controls["secondaryEmail"].valid)
      this.customerAccountsService.isEmailExist(this.additionalContactForm.value.secondaryEmail).subscribe(res => {
        if (res)
          this.isSecondaryEmailExists = true;
        else
          this.isSecondaryEmailExists = false;
        //////console.log(res);
      });
  }

  checkPrimaryEmailExists() {
    if (this.additionalContactForm.controls["primaryEmail"].valid) {
      this.customerAccountsService.isEmailExist(this.additionalContactForm.value.primaryEmail).subscribe(res => {
        if (res)
          this.isPrimaryEmailExists = true;
        else
          this.isPrimaryEmailExists = false;
        if (this.additionalContactForm.controls["secondaryEmail"].valid) {
          this.secondaryEmailErrorMessage = "";
          if (this.isSecondaryEmailExists)
            this.secondaryEmailErrorMessage = "Email already exists";
          else {
            this.secondaryEmailErrorMessage = "";
          }
          if (this.additionalContactForm.value.primaryEmail == this.additionalContactForm.value.secondaryEmail) {
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

  isUserExists() {
    if (this.additionalContactForm.controls["userName"].valid)
      this.customerAccountsService.isUserNameExist(this.additionalContactForm.value.userName).subscribe(res => {
        if (res)
          this.isUserNameExists = true;
        else
          this.isUserNameExists = false;
        ////console.log(res);
      });
  }
  createContactClick() {
    // this.initilizeFormControl();
    this.createContact(true);
  }
  createContactPopup() {
    // this.initilizeFormControl();

    this.createContact(false);
  }
  // Create the conatct 
  createContact(checkblocklist: boolean) {
    if (this.isUserNameExists || this.isPrimaryEmailExists)
      return;
    this.dayPhonePrevious = "";
    this.eveningPhonePrevious = "";
    this.mobilePhonePrevious = "";
    this.workPhonePrevious = "";
    this.faxPrevious = "";
    this.isSuffixOther = false;
    this.addorRemoveValidators();
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.CREATE];
    if (this.additionalContactForm.valid && this.addressComponent.addAddressForm.valid) {
      var customerRequest: ICustomerRequest = this.createCustomerDTO(checkblocklist, false);
      ////console.log(customerRequest);
      this.customerAccountsService.createCustomer(customerRequest, this.userEvents).subscribe(res => {
        if (res > 0) {
          //  ////console.log("Additional Account Contact created successfully");
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Additional Account Contact created successfully';
          this.bindCustomerGridview(this.p);
          this.isddContacts = false;
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = 'Error while creating Additional Account Contact ';
          this.isddContacts = false;
        }
      },
        err => {
          this.isddContacts = false;
          this.isddContacts = false;
          if (err._body) {
            this.blockListDetails = err.json();
            $('#blocklist-dialog').modal('show');
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText;
          }
        }

      );
    }
    else {
      this.validateAllFormFields(this.additionalContactForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
      //alert('Please enter all mandatory fields');
    }
  }

  deleteContact() {
    var customerRequest: ICustomerRequest = <ICustomerRequest>{};
    customerRequest.ParentId = this.parentAccountId;
    customerRequest.AccountId = this.accountIdContext;
    customerRequest.AccountStatus = AccountStatus[AccountStatus.IN];
    customerRequest.SubSystem = this.subSystem;
    customerRequest.ActivitySource = this.activitySource;
    customerRequest.InitiatedBy = this.userName;
    customerRequest.UserId = this.userId;
    customerRequest.LoginId = this.loginId;
    customerRequest.User = this.userName;
    ////console.log(customerRequest);
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.DELETE];
    this.customerAccountsService.updateAccountStatus(customerRequest, this.userEvents).subscribe(res => {
      if (res > 0) {
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgDesc = 'Additional Account Contact deleted successfully';
        this.bindCustomerGridview(this.p);
        this.isddContacts = false;
        this.isDelete = false;
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = 'Error while deleting Additional Account';
        this.isddContacts = false;
      }
    },
      (err) => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = 'Error while deleting Additional Account';
        this.isddContacts = false;
      });

  }

  updateContactPopup() {
    this.updateContact(false);
  }
  updateContactClick() {
    this.updateContact(true);
    this.materialscriptService.material();
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)

  }

  updateContact(checkblocklist: boolean) {
    this.addorRemoveValidators();
    if (this.additionalContactForm.valid && this.addressComponent.addAddressForm.valid) {
      var customerRequest: ICustomerRequest = this.createCustomerDTO(checkblocklist, true);
      //console.log("this.accountIdContext" + this.accountIdContext);
      customerRequest.AccountId = this.accountIdContext;
      customerRequest.ContactId = this.contactId
      this.setUserActionObject();
      this.userEvents.ActionName = Actions[Actions.UPDATE];
      this.customerAccountsService.createCustomer(customerRequest, this.userEvents).subscribe(res => {
        if (res > 0) {
          //  //console.log("Additional Account Contact created successfully");
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Additional Account Contact updated successfully';
          this.bindCustomerGridview(this.p);
          this.isddContacts = false;
          this.isUpdate = false;
          let rootSele = this;
          setTimeout(function () {
            rootSele.materialscriptService.material();
          }, 0)
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = 'Error while updating Additional Account Contact details';
          this.isddContacts = false;
        }
      },
        err => {
          if (err._body) {
            this.blockListDetails = err.json();
            $('#blocklist-dialog').modal('show');
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText;
          }
        }
      );
    }
    else {
      this.validateAllFormFields(this.additionalContactForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
      //alert('Please enter all mandatory fields');
    }
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

  addorRemoveValidators() {
    this.additionalContactForm.controls["dayPhone"].setValidators([Validators.pattern(this.validatePhonePattern)]);
    this.additionalContactForm.controls["workPhone"].updateValueAndValidity();
    // email block
    if (this.additionalContactForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail]) {
      this.additionalContactForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      if (this.additionalContactForm.value.secondaryEmail) {
        this.additionalContactForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      }
      else
        this.additionalContactForm.controls["secondaryEmail"].setValidators([]);
    }
    else {
      this.additionalContactForm.controls["secondaryEmail"].setValidators(Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      if (this.additionalContactForm.value.primaryEmail) {
        this.additionalContactForm.controls["primaryEmail"].setValidators(Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]));
      }
      else
        this.additionalContactForm.controls["primaryEmail"].setValidators([]);
    }
    this.additionalContactForm.controls['primaryEmail'].updateValueAndValidity();
    this.additionalContactForm.controls["secondaryEmail"].updateValueAndValidity();

    // phone block
    if (this.additionalContactForm.value.dayPhone)
      this.additionalContactForm.controls["dayPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.additionalContactForm.controls["dayPhone"].setValidators([]);
    if (this.additionalContactForm.value.eveningPhone)
      this.additionalContactForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.additionalContactForm.controls["eveningPhone"].setValidators([]);
    if (this.additionalContactForm.value.mobilePhone)
      this.additionalContactForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.additionalContactForm.controls["mobilePhone"].setValidators([]);
    if (this.additionalContactForm.value.workPhone)
      this.additionalContactForm.controls["workPhone"].setValidators(Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));

    if (this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.DayPhone])
      this.additionalContactForm.controls["dayPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone])
      this.additionalContactForm.controls["eveningPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else if (this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.MobileNo])
      this.additionalContactForm.controls["mobilePhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    else
      this.additionalContactForm.controls["workPhone"].setValidators(Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]));
    this.additionalContactForm.controls['dayPhone'].updateValueAndValidity();
    this.additionalContactForm.controls["eveningPhone"].updateValueAndValidity();
    this.additionalContactForm.controls['mobilePhone'].updateValueAndValidity();
    this.additionalContactForm.controls["workPhone"].updateValueAndValidity();

  }

  createCustomerDTO(checkblocklist: boolean, update: boolean): ICustomerRequest {

    var customerRequest: ICustomerRequest = <ICustomerRequest>{};
    customerRequest.ParentId = this.parentAccountId;
    customerRequest.AccountId = 0;//this.accountId;
    customerRequest.AccountStatus = AccountStatus[AccountStatus.AC];
    customerRequest.NameType = NameType[NameType.Secondary];
    //customerRequest.UserType = this.additionalContactForm.value.userTypeSelected;
    customerRequest.CustomerStatus = CustomerStatus[CustomerStatus.C];
    // customerRequest.OrganizationName = this.additionalContactForm.value.businessName ? this.additionalContactForm.value.businessName.trim() : "";
    customerRequest.RevenueCategory = RevenueCategory[RevenueCategory.Revenue];
    //customerRequest.SourceOfEntry = SourceOfEntry[SourceOfEntry.Online];
    customerRequest.FirstName = this.additionalContactForm.value.firstName.trim();
    customerRequest.MiddleName = this.additionalContactForm.value.middleName ? this.additionalContactForm.value.middleName.trim() : "";
    customerRequest.LastName = this.additionalContactForm.value.lastName.trim();
    customerRequest.Gender = this.additionalContactForm.value.genderSelected;
    customerRequest.Suffix = this.additionalContactForm.value.suffixSelected == "Other" ? this.additionalContactForm.value.suffixOther : this.additionalContactForm.value.suffixSelected;
    customerRequest.Title = this.additionalContactForm.value.titleSelected;
    customerRequest.Alerts = this.additionalContactForm.value.subscribetoNews;
    // customerRequest.DOB = this.additionalContactForm.value.dateOfBirth == "" ? new Date(1, 1, 1) : this.additionalContactForm.value.dateOfBirth;
    customerRequest.MiddleName = this.additionalContactForm.value.mi;
    // customerRequest.IsPrimary = false;
    // customerRequest.convertToCustomer = false;

    //activity related data 
    customerRequest.SubSystem = this.subSystem;
    customerRequest.ActivitySource = this.activitySource;
    customerRequest.InitiatedBy = this.userName;

    //Create Customer address
    customerRequest.AddressList = [];
    customerRequest.AddressList.push(this.createAddress());
    // Creating Email details
    customerRequest.EmailList = (this.createEmailList());
    // Creating Phone details
    customerRequest.PhoneList = this.createPhoneList();
    //Creating System activities related     
    customerRequest.UserId = this.userId;
    customerRequest.LoginId = this.loginId;
    customerRequest.User = this.userName;
    // Creating login details
    if (!update)
      customerRequest.UserName = this.additionalContactForm.value.userName.trim();

    customerRequest.CheckBlockList = checkblocklist;
    customerRequest.boolActivityRequired = true;
    customerRequest.ContactId = this.contactId;

    return customerRequest;
  }

  // creating address object
  createAddress(): IAddressRequest {
    var addressRequest: IAddressRequest = <IAddressRequest>{};
    addressRequest.Line1 = this.addressComponent.addAddressForm.value.addressLine1.trim();
    addressRequest.Line2 = this.addressComponent.addAddressForm.value.addressLine2.trim();
    addressRequest.Line3 = this.addressComponent.addAddressForm.value.addressLine3.trim();
    addressRequest.City = this.addressComponent.addAddressForm.value.addressCity.trim();
    addressRequest.State = this.addressComponent.addAddressForm.value.addressStateSelected;
    addressRequest.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
    addressRequest.Zip1 = this.addressComponent.addAddressForm.value.addressZip1.trim();
    if (this.addressComponent.addAddressForm.value.addressCountrySelected == "USA")
      addressRequest.Zip2 = this.addressComponent.addAddressForm.value.addressZip2.trim();
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
    if (this.additionalContactForm.value.primaryEmail.trim() != "") {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.userName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.additionalContactForm.value.primaryEmail;
      emailRequest.Type = EmailType[EmailType.PrimaryEmail];
      emailRequest.IsPreferred = this.additionalContactForm.value.preferredEmail == EmailType[EmailType.PrimaryEmail];
      emailRequest.IsValid = true;
      emailRequestArray.push(emailRequest);
    }

    if (this.additionalContactForm.value.secondaryEmail.trim() != "") {
      emailRequest = <IEmailRequest>{};
      emailRequest.UserName = this.userName;
      emailRequest.ActivitySource = this.activitySource;
      emailRequest.SubSystem = this.subSystem;
      emailRequest.EmailAddress = this.additionalContactForm.value.secondaryEmail;
      emailRequest.Type = EmailType[EmailType.SecondaryEmail];
      emailRequest.IsPreferred = this.additionalContactForm.value.preferredEmail == EmailType[EmailType.SecondaryEmail];
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

    if (this.additionalContactForm.value.dayPhone != "" || this.dayPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.additionalContactForm.value.dayPhone;
      phoneRequest.Type = PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCommunication = this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.DayPhone];
      phoneRequest.IsCreateAccount = true;
      // if (this.additionalContactForm.value.dayPhone == "") {
      //   phoneRequest.IsPhoneNumberChanged = true;
      //   phoneRequest.PhoneId = this.dayPhoneId;
      // }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.additionalContactForm.value.eveningPhone != "" || this.eveningPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.additionalContactForm.value.eveningPhone;
      phoneRequest.Type = PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCommunication = this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.EveningPhone];
      phoneRequest.IsCreateAccount = true;
      // if (this.additionalContactForm.value.eveningPhone == "") {
      //   phoneRequest.IsPhoneNumberChanged = true;
      //   phoneRequest.PhoneId = this.eveningPhoneId;
      // }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.additionalContactForm.value.mobilePhone != "" || this.mobilePhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.additionalContactForm.value.mobilePhone;
      phoneRequest.Type = PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCommunication = this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.MobileNo];
      phoneRequest.IsCreateAccount = true;
      // if (this.additionalContactForm.value.mobilePhone == "") {
      //   phoneRequest.IsPhoneNumberChanged = true;
      //   phoneRequest.PhoneId = this.mobilePhoneId;
      // }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.additionalContactForm.value.workPhone != "" || this.workPhonePrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.additionalContactForm.value.workPhone;
      phoneRequest.Type = PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCommunication = this.additionalContactForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone];
      phoneRequest.IsCreateAccount = true;
      phoneRequest.Extension = this.additionalContactForm.value.ext;
      // if (this.additionalContactForm.value.mobilePhone == "") {
      //   phoneRequest.IsPhoneNumberChanged = true;
      //   phoneRequest.PhoneId = this.workPhoneId;
      // }
      phoneRequestArray.push(phoneRequest);
    }

    if (this.additionalContactForm.value.fax != "" || this.faxPrevious != "") {
      phoneRequest = <IPhoneRequest>{};
      phoneRequest.UserName = this.userName;
      phoneRequest.ActivitySource = this.activitySource;
      phoneRequest.SubSystem = this.subSystem;
      phoneRequest.PhoneNumber = this.additionalContactForm.value.fax;
      phoneRequest.Type = PhoneType[PhoneType.Fax];
      phoneRequest.IsCommunication = false;
      phoneRequest.IsCreateAccount = true;
      // if (this.additionalContactForm.value.mobilePhone == "") {
      //   phoneRequest.IsPhoneNumberChanged = true;
      //   phoneRequest.PhoneId = this.faxId;
      // }
      phoneRequestArray.push(phoneRequest);
    }

    if (phoneRequestArray.length > 0)
      phoneRequestArray[0].IsActivityRequired = true;
    return phoneRequestArray;
  }

  addButtonclick() {
    this.isCreate = true;
    this.isDelete = false;
    this.isUpdate = false;

    this.isDisableUserName = false;
    this.isddContacts = true;
    this.additionalContactForm.get('userName').enable();
    this.userEvents = null;
    this.bindDropdowns();
    this.initilizeFormControl();
    this.additionalContactForm.patchValue({
      firstName: "",
      lastName: "",
      genderSelected: "",
      userName: "",
      primaryEmail: "",
      secondaryEmail: "",
      // preferredEmail: preferredEmail,
      dayPhone: "",
      eveningPhone: "",
      mobilePhone: "",
      workPhone: "",
      fax: "",
      // preferredPhone: preferredPhone,
      subscribeAlerts: "",
    });
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 1000)
    return true;
  }

  cancelContact() {
    this.isddContacts = false;
    this.isDelete = false;
    this.isUpdate = false;
    this.initilizeFormControl();
    this.additionalContactForm.get('userName').enable();
    this.enableControls();
    return false;
  }

  populateUpdateContact(accountid: number) {
    this.isCreate = false;
    this.isDelete = false;
    this.isUpdate = true;
    this.isddContacts = true;
    this.accountIdContext = accountid;
    this.populateCustomerDetails(accountid);
    this.initilizeFormControl();
    this.enableControls();
    this.additionalContactForm.get('userName').disable();
    return false;
  }
  populateDeleteContact(accountid: number) {
    this.isCreate = false;
    this.isDelete = true;
    this.isUpdate = false;
    this.isddContacts = true;
    this.accountIdContext = accountid;
    // alert(this.additionalContactForm);
    //@ViewChild(AddAddressComponent) addressComponent;
    //alert(this.addressComponent);

    this.populateCustomerDetails(accountid);
    // this.initilizeFormControl();
    this.disableControls();
    return false;

  }

  bindCustomerGridview(PageNumber: number) {
    this.isystemActivities.CustomerId = this.parentAccountId;
    this.isystemActivities.User = this.userName;
    this.isystemActivities.LoginId = this.loginId;
    this.isystemActivities.FeaturesCode = Features[Features.ADDITIONALACCOUNTCONTACTS];
    this.isystemActivities.ActionCode = Actions[Actions.VIEW];
    this.isystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.isystemActivities.KeyValue = this.parentAccountId.toString();

    this.icustomerProfileRequest.AccountId = this.parentAccountId;
    this.icustomerProfileRequest.PageNumber = 1;
    this.icustomerProfileRequest.PageNumber = 1;
    this.icustomerProfileRequest.SortColumn = "CUSTOMERID";
    this.icustomerProfileRequest.SortDirection = true;
    this.icustomerProfileRequest.SystemActivities = this.isystemActivities;
    this.icustomerProfileRequest.PageSize = 10;

    // getting customer details
    this.customerAccountsService.getAdditionalContactsByParentAccountId(this.icustomerProfileRequest).subscribe(res => {
      this.customerResponse = res;
      console.log("this.customerResponse", this.customerResponse);
      if (res) {
        console.log("this.customerResponse+", this.customerResponse.length);
        if (this.customerResponse.length > 0) this.isDeatilsAvailable = true; else this.isDeatilsAvailable = false;
        this.totalRecordCount = this.customerResponse.length;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        } else {
          this.endItemNumber = this.pageItemNumber;
        }
      }
    });
    // //console.log(this.customerResponse + "sdfffds");
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
    this.materialscriptService.material();
  }

  disableControls() {
    this.additionalContactForm.get('titleSelected').disable();
    this.additionalContactForm.get('suffixSelected').disable();
    this.additionalContactForm.get('suffixOther').disable();
    this.additionalContactForm.get('firstName').disable();
    this.additionalContactForm.get('lastName').disable();
    this.additionalContactForm.get('genderSelected').disable();
    this.additionalContactForm.get('userName').disable();
    this.additionalContactForm.get('primaryEmail').disable();
    this.additionalContactForm.get('secondaryEmail').disable();
    this.additionalContactForm.get('dayPhone').disable();
    this.additionalContactForm.get('eveningPhone').disable();
    this.additionalContactForm.get('mobilePhone').disable();
    this.additionalContactForm.get('workPhone').disable();
    this.additionalContactForm.get('fax').disable();
    this.additionalContactForm.get('mi').disable();

  }

  enableControls() {

    this.additionalContactForm.get('titleSelected').enable();
    this.additionalContactForm.get('suffixSelected').enable();
    this.additionalContactForm.get('suffixOther').enable();
    this.additionalContactForm.get('firstName').enable();
    this.additionalContactForm.get('lastName').enable();
    this.additionalContactForm.get('genderSelected').enable();
    this.additionalContactForm.get('mi').enable();
    this.additionalContactForm.get('primaryEmail').enable();
    this.additionalContactForm.get('secondaryEmail').enable();
    this.additionalContactForm.get('dayPhone').enable();
    this.additionalContactForm.get('eveningPhone').enable();
    this.additionalContactForm.get('mobilePhone').enable();
    this.additionalContactForm.get('workPhone').enable();
    this.additionalContactForm.get('fax').enable();

  }

  initilizeFormControl() {
    this.additionalContactForm = new FormGroup({
      titleSelected: new FormControl(''),
      suffixSelected: new FormControl('Jr.'),
      firstName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)])),
      mi: new FormControl(''),
      lastName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)])),
      genderSelected: new FormControl(''),
      primaryEmail: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      secondaryEmail: new FormControl('', Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)])),
      subscribetoNews: new FormControl(''),
      dayPhone: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      eveningPhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      mobilePhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      workPhone: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      fax: new FormControl('', Validators.compose([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      userName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(5), Validators.pattern(this.validateAlphaNumericsPattern)])),
      suffixOther: new FormControl(''),
      preferredEmail: new FormControl('PrimaryEmail'),
      preferredPhone: new FormControl('DayPhone'),
    });
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.ADDITIONALACCOUNTCONTACTS];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.parentAccountId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
