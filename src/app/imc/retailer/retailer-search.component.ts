import { IUserEvents } from './../../shared/models/userevents';
import { Component, OnInit } from '@angular/core';
import { IretailerRequest } from "./models/retailerrequest";
import { RetailerService } from "./services/retailer.service";
import { IretailerResponse } from "./models/retailerresponse";
import { SessionService } from "../../shared/services/session.service";
import { Actions, AccountStatus } from "../../shared/constants";
import { IPaging } from "../../shared/models/paging";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SubSystem, ActivitySource, Features } from "../../shared/constants";
import { RetailerStatus } from "../constants";
import { IRetailerLoginResponse } from "./models/retailerloginresponse";
import { IRetailerLoginRequest } from "./models/retailerloginrequest";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-retailer-search',
  templateUrl: './retailer-search.component.html',
  styleUrls: ['./retailer-search.component.scss']
})
export class RetailerSearchComponent implements OnInit {
  disableUserOrderrbtn: boolean;
  disableUserRetailerbtn: boolean;
  disableDeleteRetailerbtn: boolean;
  disableAddNewRetailerbtn: boolean;
  disableSearchbtn: boolean;
  isSearch: boolean;
  AccountId: number;
  retailerStatus: string;
  loginId: any;
  userId: any;
  userName: any;
  retailDeleteStatus: string;
  getLookupsResponse: any;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  retailerSearchForm: FormGroup;
  retailerRequest: IretailerRequest = <IretailerRequest>{};
  retailerLoginRequest: IRetailerLoginRequest = <IRetailerLoginRequest>{}
  userEventRequest: IUserEvents = <IUserEvents>{};
  objPaging: IPaging;
  retailerResponse: IretailerResponse[];
  retailerLoginResponse: IRetailerLoginResponse[];
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  IntailSpacesPattren = "[a-zA-Z][a-zA-Z ]*";

  constructor(private _retailerService: RetailerService, private sessionContext: SessionService,
    private sessioncontext: SessionService, private _router: Router,
    private commonService: CommonService, private materialscriptService:MaterialscriptService
  ) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = 10;
    this.retailerSearchForm = new FormGroup({
      'firstName': new FormControl('', [Validators.pattern(this.IntailSpacesPattren)]),
      'lastName': new FormControl('', [Validators.pattern(this.IntailSpacesPattren)]),
      'status': new FormControl('', []),
    });
    this.disableSearchbtn = !this.commonService.isAllowed(Features[Features.RETAILER], Actions[Actions.SEARCH], "");
    this.disableAddNewRetailerbtn = !this.commonService.isAllowed(Features[Features.RETAILER], Actions[Actions.CREATE], "");
    this.disableDeleteRetailerbtn = !this.commonService.isAllowed(Features[Features.RETAILER], Actions[Actions.DELETE], "");
    this.disableUserRetailerbtn = !this.commonService.isAllowed(Features[Features.RETAILERUSER], Actions[Actions.VIEW], "");
    this.disableUserOrderrbtn = !this.commonService.isAllowed(Features[Features.RETAILERORDER], Actions[Actions.VIEW], "");

    this.getLookups();
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.VIEW];
    this.gridBinding(this.p, userEvents);
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.isSearch == false) {
      this.gridBinding(this.p, null);
    }
    else {
      this.searchRetailer(this.p, null);
    }

  }

  gridBinding(pageNumber: number, userEvents: IUserEvents) {
    this.isSearch = false;
    this.objPaging = <IPaging>{};
    this.objPaging.PageNumber = pageNumber;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = "CustomerId";
    this.objPaging.SortDir = 1;
    let retailerRequest: IretailerRequest = <IretailerRequest>{};
    retailerRequest.Paging = this.objPaging;
    retailerRequest.UserId = this.sessioncontext.customerContext.userId;
    retailerRequest.LoginId = this.sessioncontext.customerContext.loginId;
    retailerRequest.SearchFlag = Actions[Actions.VIEW];
    retailerRequest.PerformedBy = this.sessioncontext.customerContext.userName;
    retailerRequest.UserName = this.sessioncontext.customerContext.userName;
    this._retailerService.getRetailerSearchDetails(retailerRequest, userEvents).subscribe(
      res => {
        if (res != null) {
          this.retailerResponse = res;
          this.totalRecordCount = this.retailerResponse[0].RecordsCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }
      , err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      }
    );
  }
  searchRetailerClick() {
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.searchRetailer(1, userEvents);
  }
  searchRetailer(p, userEvents: IUserEvents) {
    this.isSearch = true;
    // this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.retailerSearchForm.controls["firstName"].clearValidators();
    this.retailerSearchForm.controls["firstName"].updateValueAndValidity();
    let firstName = this.retailerSearchForm.controls['firstName'].value;
    let lastName = this.retailerSearchForm.controls['lastName'].value;
    let accountStatusCode = this.retailerSearchForm.controls['status'].value;
    if ((firstName == "" || firstName == null) && (lastName == "" || lastName == null) && (accountStatusCode == "" || accountStatusCode == null)) {
      this.retailerSearchForm.controls["firstName"].setValidators([Validators.required, Validators.pattern(this.IntailSpacesPattren)]);
      this.retailerSearchForm.controls["firstName"].updateValueAndValidity();
      // this.errorBlock = true;
      // this.errorMessage = "At Least One Field is Required.";
      this.validateAllFormFields(this.retailerSearchForm);

    }
    else {
      this.retailerSearchForm.controls["firstName"].clearValidators();
      this.retailerSearchForm.controls["firstName"].setValidators([Validators.pattern(this.IntailSpacesPattren)]);
      this.retailerSearchForm.controls["firstName"].updateValueAndValidity();
      if (this.retailerSearchForm.valid) {
        let retailerRequest: IretailerRequest = <IretailerRequest>{};
        this.objPaging = <IPaging>{};
        this.objPaging.PageNumber = p// this.p;
        this.objPaging.PageSize = 10;
        this.objPaging.SortColumn = "CustomerId";
        this.objPaging.SortDir = 1;
        retailerRequest.Paging = this.objPaging;
        retailerRequest.UserId = this.sessioncontext.customerContext.userId;
        retailerRequest.LoginId = this.sessioncontext.customerContext.loginId;
        retailerRequest.PerformedBy = this.sessioncontext.customerContext.userName;
        retailerRequest.UserName = this.sessioncontext.customerContext.userName;
        retailerRequest.FirstName = firstName;
        retailerRequest.LastName = lastName;
        retailerRequest.AccountStatusCode = accountStatusCode;
        retailerRequest.SearchFlag = Actions[Actions.SEARCH];
        this._retailerService.getRetailerSearchDetails(retailerRequest, userEvents).subscribe(
          res => {
            if (res != null && res.length > 0) {
              this.retailerResponse = res;
              this.totalRecordCount = this.retailerResponse[0].RecordsCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount;
              }
            }
            else {
              this.retailerResponse = res;
            }
          }
          , err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = ''
            return;
          }
        );
      } else {
        this.validateAllFormFields(this.retailerSearchForm);
      }
    }
  }

  getStatus(id) {
    let statusCode = AccountStatus[id]
    for (var i = 0; i < this.retailerResponse.length; i++) {
      if (statusCode == AccountStatus[this.retailerResponse[i].AccountStatus]) {
        if (statusCode == "AC") {
          statusCode = "ACTIVE";
        } if (statusCode == "IN") {
          statusCode = "INACTIVE";
        } if (statusCode == "NA") {
          statusCode = "NEW ACCOUNT";
        }
        return statusCode;
      }
    }
  }

  //DropDown Values Binding..
  getLookups() {
    this._retailerService.getLookups().subscribe(
      res => {
        this.getLookupsResponse = res;
        this.getLookupsResponse = res.filter(x => x.Key == AccountStatus[AccountStatus.AC] || x.Key == AccountStatus[AccountStatus.IN] || x.Key == AccountStatus[AccountStatus.NA]);
      }
      , err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      }
    );
  }

  resetClick() {
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.retailerSearchForm.controls["firstName"].reset();
    this.retailerSearchForm.controls["lastName"].setValue("");
    this.retailerSearchForm.controls["status"].setValue("");
    this.gridBinding(this.p, null);
  }

  retailerDetails(retailerID) {
    this._router.navigate(['imc/retailer/retailer-order-details/' + retailerID]);
  }
  userClick(retailerID) {
    this._router.navigate(['imc/retailer/retailer-users-search/' + retailerID]);
  }
  addNewRetailer() {
  }

  retailerDelete(CustomerId, AccountStatus) {
    this.AccountId = CustomerId;
    this.retailerStatus = AccountStatus;
    if (AccountStatus == "ACTIVE") {
      this.msgType = 'alert';
      this.msgFlag = true;
      this.msgDesc = "Are you sure you want to Deactivate Retailer ?";
      this.msgTitle = '';
      this.retailDeleteStatus = "Deactivate";
    }
    else {
      this.msgType = 'alert';
      this.msgFlag = true;
      this.msgDesc = "Are you sure you want to Activate Retailer ?";
      this.msgTitle = '';
      this.retailDeleteStatus = "Activate";
    }
  }
  btnYesClick(event) {
    if (event) {
      this.retailerRequest.AccountId = this.AccountId;
      this.retailerRequest.AccountStatus = this.retailerStatus == RetailerStatus[RetailerStatus.ACTIVE] ? AccountStatus[AccountStatus.IN] : AccountStatus[AccountStatus.AC];
      this.retailerRequest.UserName = this.sessioncontext.customerContext.userName;
      this.retailerRequest.SubSystem = SubSystem[SubSystem.IMC];
      this.retailerRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.retailerRequest.User = this.sessioncontext.customerContext.userName;
      this.retailerRequest.UserId = this.sessioncontext.customerContext.userId;
      this.retailerRequest.LoginId = this.sessioncontext.customerContext.loginId;
      let userEvents = this.userEvents();
      userEvents.ActionName = this.retailerStatus==Actions[Actions.ACTIVE]?Actions[Actions.DEACTIVE]:Actions[Actions.ACTIVE];            //Actions[Actions.DELETE];
      this._retailerService.deleteretailerData(this.retailerRequest, userEvents).subscribe(
        data => {
          if (data) {
            this.gridBinding(this.p, null);
            if (this.retailerStatus == "ACTIVE") {
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = 'Retailer has been deactivated successfully';
              this.msgTitle = '';
            }
            else {
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = 'Retailer has been activated successfully';
              this.msgTitle = '';
            }
            this.retailerStatus = "";

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
      this.msgFlag = false;
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  retailerResetPassword(CustomerId) {
    this._retailerService.retailerResetPassword(CustomerId).subscribe(
      data => {
        // if (data) {
        this.retailerLoginResponse = data;
        this.updateRetailerRandomPassword();
        // }
      }, err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      }
    );

  }
  updateRetailerRandomPassword() {
    if (this.retailerLoginResponse != null) {
      this.retailerLoginRequest.AccountId = this.retailerLoginResponse['CustomerId'];
      this.retailerLoginRequest.Password = this.retailerLoginResponse['Password'];
      //this.retailerLoginRequest.PerformedBy = this.retailerLoginResponse['PerformedBy'];
      this.retailerLoginRequest.PerformedBy = this.sessioncontext.customerContext.userName;
      this.retailerLoginRequest.EmailAddress = this.retailerLoginResponse['EmailAddress'];
      this.retailerLoginRequest.UserName = this.retailerLoginResponse['RetailerUserName'];
    }
    this._retailerService.updateRetailerRandomPassword(this.retailerLoginRequest).subscribe(
      data => {
        if (data) {
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgDesc = 'Password has been updated successfully.'
          this.msgTitle = '';
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = 'Error while updating the Password.'
          this.msgTitle = '';
        }
      }, err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      });

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
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.RETAILER];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this._router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

}