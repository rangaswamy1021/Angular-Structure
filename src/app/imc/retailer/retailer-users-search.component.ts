import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { RetailerService } from "./services/retailer.service";
import { IRetailerUserResponse } from "./models/retaileruserresponse";
import { IRetailerUserRequest } from "./models/retaileruserrequest";
import { IRetailerLoginRequest } from "./models/retailerloginrequest";
import { SubSystem, ActivitySource, Actions, VendorStatus, AccountStatus, Features } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IPaging } from "../../shared/models/paging";
import { List } from "linqts/dist/linq";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-retailer-users-search',
  templateUrl: './retailer-users-search.component.html',
  styleUrls: ['./retailer-users-search.component.scss']
})
export class RetailerUsersSearchComponent implements OnInit {


  sortingColumn: any;
  private _toEditRetailerId: number;

  addRetailerUserForm: FormGroup;
  retailerUserSearchForm: FormGroup;

  //Response's & Request's
  userEventRequest: IUserEvents = <IUserEvents>{};
  sessionContextResponse: IUserresponse;
  retailerUserResponse: IRetailerUserResponse[];
  objReatilerRequest: IRetailerUserRequest;
  retailerUserRequest: IRetailerUserRequest = <IRetailerUserRequest>{};
  retailerUserResponseItem: any;
  getLookupsResponse: any;
  objPaging: IPaging;

  status: boolean = false;
  divNewRetailerUser: boolean;
  isSearch: boolean;
  isAddUpdateButtonEnabled: boolean;
  isAddNewRetailerUser: boolean;
  isStatusEnabled: boolean;
  isPasswordEnabled: boolean;
  isInvalidMobile: boolean;
  isInvalidEmail: boolean;
  isInvalidUserName: boolean;
  isInvalidPassword: boolean;
  sortingDirection: boolean;
  shortPass: boolean
  badPass: boolean
  goodPass: boolean
  strongPass: boolean
  // gridArrowPHONENUMBER: boolean;
  // gridArrowLASTNAME: boolean;
  // gridArrowFIRSTNAME: boolean;
  // gridArrowRETAILERUSERNAME: boolean;
  // gridArrowRETAILERID: boolean //= true;


  message: string;
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  // pagination
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  //disableing buttons
  disableSearchbtn: boolean;
  disableCreatebtn: boolean;
  disableEditRetailerbtn: boolean;
  disableDeleteRetailerbtn: boolean;
  //pattrens
  firstNamePattern = "[a-zA-Z-][a-zA-Z- ]*"; // "[a-zA-Z][a-zA-Z ]+[a-zA-Z]$";
  lastNamePattern = "[a-zA-Z-][a-zA-Z- ]*";
  miPattern = "[a-zA-Z]*$";
  mobilePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  emailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  userPattern = "[a-zA-Z0-9]*$";
  validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";;
  passwordPattern = "^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{7,}|(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}|(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}|(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z]).{7,}|(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{7,}$";
  IntailSpacesPattren = "[a-zA-Z ][a-zA-Z ]*";

  constructor(private router: Router,
    private retailerService: RetailerService,
    private routerParameter: ActivatedRoute,
    private context: SessionService,
    private commonService: CommonService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.disableSearchbtn = !this.commonService.isAllowed(Features[Features.RETAILERUSER], Actions[Actions.SEARCH], "")
    this.disableCreatebtn = !this.commonService.isAllowed(Features[Features.RETAILERUSER], Actions[Actions.CREATE], "")
    this.disableEditRetailerbtn = !this.commonService.isAllowed(Features[Features.RETAILERUSER], Actions[Actions.UPDATE], "")
    this.sortingDirection == false ? 1 : 0;
    this.sortingColumn = "RETAILERID";
    this.retailerUserResponseItem = null;
    this.p = 1;
    this.endItemNumber = 10;
    this._toEditRetailerId = this.routerParameter.snapshot.params["retailerID"]; //Geting value From Route Url From before Page.
    this.retailerUserSearchForm = new FormGroup({
      'firstName': new FormControl('', [Validators.required, Validators.pattern(this.IntailSpacesPattren)]),
      'lastName': new FormControl('', [Validators.pattern(this.IntailSpacesPattren)]),
      'status': new FormControl('', []),
    });
    this.addRetailerUserForm = new FormGroup({
      'firstName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.firstNamePattern), Validators.minLength(2), Validators.maxLength(50)])),
      'mi': new FormControl('', Validators.compose([Validators.pattern(this.miPattern), Validators.minLength(1), Validators.maxLength(2)])),
      'lastName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.lastNamePattern), Validators.minLength(2), Validators.maxLength(50)])),
      'mobile': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.mobilePattern)])),
      'email': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.emailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      'userName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.userPattern), Validators.minLength(5), Validators.maxLength(50)])),
      'password': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)])),
      'reTypePassword': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)])),
      'status': new FormControl('', ),
    });
    this.addRetailerUserForm.controls["password"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    this.addRetailerUserForm.controls["reTypePassword"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    let userEvent = this.userEvents();
    this.getRetailerUserDetails(this.p, userEvent);
    this.getLookups();
  }
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.RETAILERUSER];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEventRequest.UserName = this.sessionContextResponse.userName;
    this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
    return this.userEventRequest;
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;

    if (this.isSearch == false) {
      this.getRetailerUserDetails(this.p, null);
    }
    else {
      this.searchRetailerUser(this.p, null);
    }
  }
  getRetailerUserDetails(p: number, userEvents: IUserEvents) {
    this.isSearch = false;
    let retailerUserRequest: IRetailerUserRequest = <IRetailerUserRequest>{};
    this.objPaging = <IPaging>{};
    this.objPaging.PageNumber = p;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = this.sortingColumn;
    this.objPaging.SortDir = this.sortingDirection == false ? 1 : 0;
    retailerUserRequest.RoleFlag = 0;
    retailerUserRequest.Paging = this.objPaging;
    retailerUserRequest.SearchFlag = Actions[Actions.VIEW];
    retailerUserRequest.SubSystem = SubSystem[SubSystem.IMC];
    retailerUserRequest.CustomerId = this._toEditRetailerId;     //this.retailerUserRequest.CustomerId = this._retailerService.dataFromService;
    retailerUserRequest.UserId = this.context.customerContext.userId;
    retailerUserRequest.PerformedBy = this.context.customerContext.userName;
    retailerUserRequest.LoginId = this.context.customerContext.loginId;
    retailerUserRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.retailerService.getRetailerUserDetails(retailerUserRequest, userEvents).subscribe(
      res => {
        if (res != null) {
          res.forEach(x => {
            x.RetailerUserName = x.RetailerUserName.toUpperCase();
          })
          this.retailerUserResponse = res;
          this.totalRecordCount = this.retailerUserResponse[0].RecordsCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
        else {
          this.retailerUserResponse = res;
        }

      }, err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      }
    );
  }
  searchRetailer() {
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.searchRetailerUser(1, userEvents);
  }


  searchRetailerUser(p: number, userEvent: IUserEvents) {

    this.objPaging = <IPaging>{};
    this.objPaging.PageNumber = p;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = this.sortingColumn;
    this.objPaging.SortDir = this.sortingDirection == false ? 1 : 0;

    this.endItemNumber = 10;
    let retailerUserRequest: IRetailerUserRequest = <IRetailerUserRequest>{};
    retailerUserRequest.Paging = this.objPaging;
    var firstName = (this.retailerUserSearchForm.controls['firstName'].value);
    var lastName = (this.retailerUserSearchForm.controls['lastName'].value);
    if (firstName != null && firstName != "")
      firstName = firstName.trim();
    if (lastName != null && lastName != "")
      lastName = lastName.trim();
    let accountStatusCode = this.retailerUserSearchForm.controls['status'].value;
    this.retailerUserSearchForm.controls.firstName.setValidators([Validators.required, Validators.pattern(this.IntailSpacesPattren)]);

    if ((firstName == "" || firstName == null) && (lastName == "" || lastName == null) && (accountStatusCode == "" || accountStatusCode == null)) {

      this.validateAllFormFields(this.retailerUserSearchForm);
    }
    else {

      if ((firstName == "" || firstName == null)) {
        this.retailerUserSearchForm.controls.firstName.reset();
        this.retailerUserSearchForm.controls["firstName"].setValue("");
        this.retailerUserSearchForm.controls["firstName"].clearValidators();
        this.retailerUserSearchForm.controls["firstName"].setValidators([Validators.pattern(this.IntailSpacesPattren)]);
        this.retailerUserSearchForm.controls["firstName"].updateValueAndValidity();
      }
      if (this.retailerUserSearchForm.valid) {
        this.isSearch = true;
        retailerUserRequest.Paging = this.objPaging;
        retailerUserRequest.RoleFlag = 0;
        retailerUserRequest.FirstName = firstName;
        retailerUserRequest.LastName = lastName;
        retailerUserRequest.Status = accountStatusCode;
        retailerUserRequest.SearchFlag = "SEARCH"  //Actions[Actions.SEARCH];
        retailerUserRequest.CustomerId = this._toEditRetailerId;
        retailerUserRequest.UserId = this.context.customerContext.userId;
        retailerUserRequest.PerformedBy = this.context.customerContext.userName;
        retailerUserRequest.LoginId = this.context.customerContext.loginId;
        retailerUserRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
        retailerUserRequest.SubSystem = SubSystem[SubSystem.IMC];
        this.retailerService.getRetailerUserDetails(retailerUserRequest, userEvent).subscribe(
          res => {
            if (res != null) {
              res.forEach(x => {
                x.RetailerUserName = x.RetailerUserName.toUpperCase();
              });
              this.retailerUserResponse = res;
              this.totalRecordCount = this.retailerUserResponse[0].RecordsCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount;
              }
            }
            else {
              this.retailerUserResponse = res;
            }

          }, err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = ''
            return;
          }
        );
      } else {
        this.validateAllFormFields(this.retailerUserSearchForm);
      }
    }
  }
  //Add New Button Click
  addNewRetailerUser() {
    this.message = "Add"
    this.divNewRetailerUser = true;
    this.isAddNewRetailerUser = true;
    this.isPasswordEnabled = false;
    this.isInvalidPassword = false;
    this.isInvalidUserName = false;
    this.isInvalidMobile = false;
  }
  //Cancel 
  cancelAddNewRetilerUser() {
    this.retailerUserResponseItem = null;
    this.divNewRetailerUser = false;
    this.isAddNewRetailerUser = false;
    this.isAddUpdateButtonEnabled = false;
    this.isStatusEnabled = false;
    this.isPasswordEnabled = false;
    this.isInvalidPassword = false;

    this.addRetailerUserForm.controls["userName"].enable();
    this.addRetailerUserForm.controls["password"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    this.addRetailerUserForm.controls["reTypePassword"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);

    this.addNewRetilerUserReset();
  }
  addNewRetilerUserReset() {
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.isAddUpdateButtonEnabled = false;
    this.isStatusEnabled = false;
    this.isPasswordEnabled = false;
    this.isInvalidPassword = false;
    this.isInvalidUserName = false;
    this.isInvalidEmail = false;
    this.addRetailerUserForm.reset();
    this.addRetailerUserForm.controls["firstName"].setValue("");
    let mi = this.addRetailerUserForm.controls["mi"].setValue("");
    let lastName = this.addRetailerUserForm.controls["lastName"].setValue("");
    let mobile = this.addRetailerUserForm.controls["mobile"].setValue("");
    let email = this.addRetailerUserForm.controls["email"].setValue("");
    let userName = this.addRetailerUserForm.controls["userName"].setValue("");
    let password = this.addRetailerUserForm.controls["password"].setValue("");
    let reTypePassword = this.addRetailerUserForm.controls["reTypePassword"].setValue("");
    //this.addRetailerUserForm.controls.password.value.length = 0;
    // this.addRetailerUserForm.controls.password.setValue("");
    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;

    if (this.retailerUserResponseItem != null) {
      this.populateTheData(this.retailerUserResponseItem);
    }
  }
  resetClick() {
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.retailerUserSearchForm.controls["firstName"].setValue("");
    this.retailerUserSearchForm.controls["lastName"].setValue("");
    this.retailerUserSearchForm.controls["status"].setValue("");
    this.getRetailerUserDetails(this.p, null);
  }
  goToRetailerSearch() {
    this.router.navigate(['imc/retailer/retailer-search/']);
  }
  //Edit Click Active Inactive Status....
  statusChange(event) {
    this.status = event.target.value;
  }
  //Email Is Exist Or Not Checking
  checkEmailExists() {
    if (this.addRetailerUserForm.controls["email"].valid) {
      this.retailerService.isEmailExist(this.addRetailerUserForm.value.email).subscribe
        (res => {
          if (res) { this.isInvalidEmail = true }
          else { this.isInvalidEmail = false; }
        });
    }
  }
  //User Name Is Exist Or No Checking
  checkUserNameExist() {
    if (this.addRetailerUserForm.controls["userName"].valid) {
      this.retailerService.isExistsRetailerUser(this.addRetailerUserForm.value.userName).subscribe(res => {
        if (res) { this.isInvalidUserName = true }
        else { this.isInvalidUserName = false; }
      });
    }
  }

  //Checking Password And retype Password Match
  checkRetypePassword() {
    if (this.addRetailerUserForm.controls["password"].value == "" || this.addRetailerUserForm.controls["password"].value == null) {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }
    this.addRetailerUserForm.controls["password"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    this.addRetailerUserForm.controls["reTypePassword"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    if (this.addRetailerUserForm.controls["password"].valid && this.addRetailerUserForm.controls["reTypePassword"].valid) {
      if (this.addRetailerUserForm.controls["password"].value == this.addRetailerUserForm.controls["reTypePassword"].value) {
        this.isInvalidPassword = false;
      }
      else {
        this.isInvalidPassword = true;
      }
    }
    this.passwordStrength();
  }
  //adding New Retailer user
  addRetilerUser() {
    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;
    this.addRetailerUserForm.controls["status"].clearValidators();
    this.addRetailerUserForm.controls["status"].updateValueAndValidity();
    this.addRetailerUserForm.controls["password"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    this.addRetailerUserForm.controls["reTypePassword"].setValidators([Validators.required, Validators.pattern(this.passwordPattern), Validators.minLength(7), Validators.maxLength(20)]);
    this.addRetailerUserForm.controls["password"].updateValueAndValidity();
    this.addRetailerUserForm.controls["reTypePassword"].updateValueAndValidity();
    if (this.addRetailerUserForm.valid) {
      if (this.isInvalidMobile) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Invalid Mobile Number";
        this.msgTitle = '';
        return;
      }
      if (this.isInvalidUserName) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = this.addRetailerUserForm.value.userName + " already exist";
        this.msgTitle = '';

        this.addRetailerUserForm.controls["password"].reset();
        this.addRetailerUserForm.controls["reTypePassword"].reset();
        return;
      }
      if (this.isInvalidEmail) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = this.addRetailerUserForm.value.email + " already exist";
        this.msgTitle = '';

        this.addRetailerUserForm.controls["password"].reset();
        this.addRetailerUserForm.controls["reTypePassword"].reset();
        return;
      }
      if (this.isInvalidPassword) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Password and Retype Password Must Be same";
        this.msgTitle = '';
        return;
      }
      else {
        let firstName = this.addRetailerUserForm.controls["firstName"].value;
        let mi = this.addRetailerUserForm.controls["mi"].value == null ? "" : this.addRetailerUserForm.controls["mi"].value;
        let lastName = this.addRetailerUserForm.controls["lastName"].value;
        let mobile = this.addRetailerUserForm.controls["mobile"].value;
        let email = this.addRetailerUserForm.controls["email"].value;
        let userName = this.addRetailerUserForm.controls["userName"].value;
        let password = this.addRetailerUserForm.controls["password"].value;
        let reTypePassword = this.addRetailerUserForm.controls["reTypePassword"].value;

        this.retailerUserRequest.RetailerLogin = <IRetailerLoginRequest>{};
        this.retailerUserRequest.RetailerLogin.AccountId = this._toEditRetailerId;
        this.retailerUserRequest.RetailerLogin.UserName = userName;
        this.retailerUserRequest.RetailerLogin.Password = password;
        this.retailerUserRequest.RetailerLogin.RetypePassword = reTypePassword;
        this.retailerUserRequest.RetailerLogin.CheckPassword = true;
        this.retailerUserRequest.RetailerLogin.PerformedBy = this.context.customerContext.userName;
        this.retailerUserRequest.CustomerId = this._toEditRetailerId
        this.retailerUserRequest.RetailerUserName = userName;
        this.retailerUserRequest.RoleName = "USER";
        this.retailerUserRequest.FirstName = firstName;
        this.retailerUserRequest.LastName = lastName;
        this.retailerUserRequest.MiddleName = mi;
        this.retailerUserRequest.EmailAddress = email;
        this.retailerUserRequest.PhoneNumber = mobile;
        this.retailerUserRequest.PerformedBy = this.context.customerContext.userName;
        this.retailerUserRequest.ActivitySource = ActivitySource[ActivitySource.RetailerWeb];
        this.retailerUserRequest.SubSystem = SubSystem[SubSystem.IMC];
        $('#pageloader').modal('show');
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.CREATE];
        this.retailerService.CreateRetailerUserAndLogin(this.retailerUserRequest, userEvents).subscribe(
          res => {
            $('#pageloader').modal('hide');
            if (res) {
              this.getRetailerUserDetails(this.p, null);
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Retailer user has been added successfully";
              this.msgTitle = '';
              this.divNewRetailerUser = false;
              this.isAddNewRetailerUser = false;
              this.addRetailerUserForm.reset();
            }
          }, err => {
            $('#pageloader').modal('hide');
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = '';
            return;
          }
        );
      }
    }
    else {
      this.validateAllFormFields(this.addRetailerUserForm);
    }
  }
  //updating new retailer user
  updateNewRetilerUser() {
    if (this.addRetailerUserForm.valid) {
      if (this.isInvalidMobile) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Invalid Mobile Number";
        this.msgTitle = '';
        return;
      }
      if (this.isInvalidEmail) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = this.addRetailerUserForm.value.email + "already exist";
        this.msgTitle = '';
        return;
      }
      else {
        let firstName = this.addRetailerUserForm.controls["firstName"].value;
        let mi = this.addRetailerUserForm.controls["mi"].value == null ? "" : this.addRetailerUserForm.controls["mi"].value;
        let lastName = this.addRetailerUserForm.controls["lastName"].value;
        let mobile = this.addRetailerUserForm.controls["mobile"].value;
        let email = this.addRetailerUserForm.controls["email"].value;
        let userName = this.addRetailerUserForm.controls["userName"].value;
        let status = this.status //this.addRetailerUserForm.controls["status"].value;

        this.retailerUserRequest.RetailerLogin = <IRetailerLoginRequest>{};
        this.retailerUserRequest.RetailerLogin.AccountId = this._toEditRetailerId;
        this.retailerUserRequest.RetailerLogin.UserName = userName;
        this.retailerUserRequest.RetailerLogin.CheckPassword = true;
        this.retailerUserRequest.RetailerLogin.Password = "";
        this.retailerUserRequest.RetailerLogin.RetypePassword = "";
        this.retailerUserRequest.RetailerLogin.PerformedBy = this.context.customerContext.userName;

        this.retailerUserRequest.CustomerId = this._toEditRetailerId
        this.retailerUserRequest.RetailerUserName = userName;
        this.retailerUserRequest.RoleName = "USER";
        this.retailerUserRequest.FirstName = firstName;
        this.retailerUserRequest.LastName = lastName;
        this.retailerUserRequest.MiddleName = mi;
        this.retailerUserRequest.EmailAddress = email;
        this.retailerUserRequest.PhoneNumber = mobile;
        this.retailerUserRequest.PerformedBy = this.context.customerContext.userName;
        this.retailerUserRequest.ActivitySource = ActivitySource[ActivitySource.RetailerWeb];
        this.retailerUserRequest.SubSystem = SubSystem[SubSystem.IMC];
        this.retailerUserRequest.IsActive = status;
        this.retailerUserRequest.IsEmailCheck = false;
        this.retailerUserRequest.RetailerUserId = this.retailerUserResponseItem.RetailerUserId;
        this.retailerUserRequest.RetailerLoginId = this.retailerUserResponseItem.RetailerLoginId;
        this.retailerUserRequest.Status = this.retailerUserResponseItem.Status;
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.UPDATE];
        this.retailerService.updateRetailerUser(this.retailerUserRequest, userEvents).subscribe(
          res => {
            if (res) {
              this.getRetailerUserDetails(this.p, null);
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Retailer user has been Updated successfully";
              this.msgTitle = '';
              this.divNewRetailerUser = false;
              this.isAddNewRetailerUser = false;
              this.isAddUpdateButtonEnabled = false
              this.isStatusEnabled = false;
              this.isPasswordEnabled = false;
              this.addRetailerUserForm.controls["userName"].enable();
              this.addRetailerUserForm.reset();
              this.retailerUserResponseItem = null;
            }
          });
      }
    }
  }

  //Patch The Values on Edit Click ......
  populateTheData(retailerUserResponseItem) {
    this.message = "Update";

    this.isStatusEnabled = true;
    this.isPasswordEnabled = true;
    this.divNewRetailerUser = true;
    this.isAddNewRetailerUser = true;
    this.isAddUpdateButtonEnabled = true;

    this.retailerUserResponseItem = retailerUserResponseItem;
    this.addRetailerUserForm.controls["userName"].disable();
    this.addRetailerUserForm.controls["status"].setValidators([Validators.required]);
    this.addRetailerUserForm.controls["password"].clearValidators();
    this.addRetailerUserForm.controls["reTypePassword"].clearValidators();
    this.addRetailerUserForm.controls["password"].updateValueAndValidity();
    this.addRetailerUserForm.controls["reTypePassword"].updateValueAndValidity();

    this.addRetailerUserForm.patchValue({
      'firstName': retailerUserResponseItem.FirstName,
      'mi': retailerUserResponseItem.MiddleName,
      'lastName': retailerUserResponseItem.LastName,
      'mobile': retailerUserResponseItem.PhoneNumber,
      'email': retailerUserResponseItem.EmailAddress,
      'userName': retailerUserResponseItem.RetailerUserName,
      'status': retailerUserResponseItem.IsActive,
    });
    this.status = this.addRetailerUserForm.controls.status.value;
    let rootSelector = this;
    setTimeout(function () {
      rootSelector.materialscriptService.material();
    }, 0)
  }

  //Phone method   Phone Format Like (111)-111-111
  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.formcontrolname.value;

    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.addRetailerUserForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {

      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.addRetailerUserForm.controls[objId].setValue(phone);
    }
  }
  validateAllZerosinPhone(phoneNumber: string): boolean {
    var pattern = new RegExp(this.validatePhoneAllZerosPattern);
    var result = pattern.test(phoneNumber);
    return result;
  }
  validateMobileAllZeros() {
    if (this.addRetailerUserForm.controls["mobile"].valid) {
      if (this.validateAllZerosinPhone(this.addRetailerUserForm.value.mobile))
        this.isInvalidMobile = true;
      else
        this.isInvalidMobile = false;
    }
    else
      this.isInvalidMobile = false;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {

        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  //DropDown Values Binding..
  getLookups() {
    this.retailerService.getLookups().subscribe(
      res => {

        this.getLookupsResponse = res.filter(x => x.Key == AccountStatus[AccountStatus.AC] || x.Key == AccountStatus[AccountStatus.IN]);
      }
      , err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      }
    );
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  // private newFunction(): any {
  //   return this.getLookupsResponse;
  // }
  passwordStrength() {
    let score = 0

    this.shortPass = false;
    this.badPass = false;
    this.goodPass = false;
    this.strongPass = false;
    if (this.addRetailerUserForm.controls.password.value.length > 0 || this.addRetailerUserForm.controls.password.value != null || this.addRetailerUserForm.controls.password.value != "") {
      var password = this.addRetailerUserForm.controls.password.value;
      let username = this.addRetailerUserForm.controls.userName.value;
      if (password.length < 7 && password.length != 0) { return this.shortPass = true }

      //password == username
      if (username.valid) {
        if (password.toLowerCase() == username.toLowerCase()) { return this.badPass = true }
      }
      //password length
      score += password.length * 4
      score += (this.checkRepetition(1, password).length - password.length) * 1
      score += (this.checkRepetition(2, password).length - password.length) * 1
      score += (this.checkRepetition(3, password).length - password.length) * 1
      score += (this.checkRepetition(4, password).length - password.length) * 1

      //password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score += 5
      }

      //password has 2 sybols
      if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
        score += 5
      }

      //password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score += 10
      }

      //password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score += 10
      }
      //
      //password has number and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) {
        score += 10
      }

      //password has char and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) {
        score += 10
      }

      //password is just a nubers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        score -= 10
      }

      //verifing 0 < score < 100
      if (score < 0) {
        score = 0
      }
      if (score > 100) {
        score = 100

        return this.strongPass = true;
      }

      if (score < 34 && password.length != 0) {
        return this.badPass = true
      }
      if (score < 80 && password.length != 0) {
        return this.goodPass = true
      }
      if (score >= 80 && score <= 100) {

        return this.goodPass = true
      }

      if (password == "" || password == null) {
        this.shortPass = false;
        this.badPass = false;
        this.goodPass = false;
        this.strongPass = false;
      }
    }
    else {
      this.shortPass = false;
      this.badPass = false;
      this.goodPass = false;
      this.strongPass = false;
    }
  }
  // checkRepetition(1,'aaaaaaabcbc')   = 'abcbc'
  // checkRepetition(2,'aaaaaaabcbc')   = 'aabc'
  // checkRepetition(2,'aaaaaaabcdbcd') = 'aabcd'
  checkRepetition(pLen, str) {
    let res = "";
    for (var i = 0; i < str.length; i++) {
      let repeated = true;
      for (var j = 0; j < pLen && (j + i + pLen) < str.length; j++)
        repeated = repeated && (str.charAt(j + i) == str.charAt(j + i + pLen))
      if (j < pLen) repeated = false
      if (repeated) {
        i += pLen - 1
        repeated = false
      }
      else {
        res += str.charAt(i)
      }
    }
    return res;
  }




  //Sorting the Grid 
  //Dont Remove any one If Sorting is Required we can use this one..
  // sortDirection(SortingColumn) {
  //   this.gridArrowRETAILERID = false;
  //   this.gridArrowRETAILERUSERNAME = false;
  //   this.gridArrowFIRSTNAME = false;
  //   this.gridArrowLASTNAME = false;
  //   this.gridArrowPHONENUMBER = false;

  //   this.sortingColumn = SortingColumn;
  //   if (this.sortingColumn == "RETAILERID") {
  //     this.gridArrowRETAILERID = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   }
  //   else if (this.sortingColumn == "RETAILERUSERNAME") {
  //     this.gridArrowRETAILERUSERNAME = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   } else if (this.sortingColumn == "FIRSTNAME") {
  //     this.gridArrowFIRSTNAME = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   } else if (this.sortingColumn == "LASTNAME") {
  //     this.gridArrowLASTNAME = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   } else if (this.sortingColumn == "PHONENUMBER") {
  //     this.gridArrowPHONENUMBER = true;
  //     if (this.sortingDirection == true) {
  //       this.sortingDirection = false;
  //     }
  //     else {
  //       this.sortingDirection = true;
  //     }
  //   }
  //   this.getRetailerUserDetails(this.p);
  // }




}