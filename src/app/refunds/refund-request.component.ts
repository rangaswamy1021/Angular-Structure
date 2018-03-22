import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RefundService } from '../refunds/services/refund.service';
import { IRefundRequest } from './models/RefundRequest';
import { IRefundResponse } from './models/RefundResponse';
import { IPaging } from "../shared/models/paging";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IRefundQueue } from './models/RefundQueue';
import { IUserresponse } from '../shared/models/userresponse';
import { SessionService } from '../shared/services/session.service';
import { Router } from '@angular/router';
import { SubSystem, Features, Actions } from '../shared/constants';
import { IRefundProcess } from './models/RefundProcess';
import { RefundContextService } from './services/RefundContextService';
import { CommonService } from '../shared/services/common.service';
import { IUserEvents } from '../shared/models/userevents';
import { MaterialscriptService } from "../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-refund-request',
  templateUrl: './refund-request.component.html',
  styleUrls: ['./refund-request.component.scss']
})
export class RefundRequestComponent implements OnInit {

  constructor(private refundService: RefundService, private router: Router, private commonService: CommonService,
    private sessionContext: SessionService, private refundContextService: RefundContextService, private materialscriptService: MaterialscriptService) {

  }

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  disableButtonSearch: boolean = false;
  disableButtonCheck: boolean = false;
  disableButtonCC: boolean = false;

  iRefundProcess: IRefundProcess[] = <IRefundProcess[]>[];
  refundResponse: IRefundResponse[] = <IRefundResponse[]>[];
  refundRequest: IRefundRequest = <IRefundRequest>{};
  paging: IPaging;
  refundSearchForm: FormGroup;

  currentSubSystem: string;
  refundResponseSelected: IRefundResponse[] = <IRefundResponse[]>[];
  refundQueueList: IRefundQueue[];
  refundQueue: IRefundQueue;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  sessionContextResponse: IUserresponse;
  menuHeading: string = "CSC";
  menuSubSystem: string = "CSC Refunds";
  showCreditCardActive: boolean = true;
  numberPattern="[0-9][0-9]*";
  validateAlphaWhiteSpace = "^[a-zA-Z ]+$";
  validateAlphaHyphenWhiteSpace = "^[a-zA-Z -]+$";

  items = [];

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.refundSearchForm = new FormGroup({
      'accountId': new FormControl('', [Validators.pattern(this.numberPattern)]),
      'firstName': new FormControl('', [Validators.pattern(this.validateAlphaWhiteSpace)]),
      'lastName': new FormControl('', [Validators.pattern(this.validateAlphaHyphenWhiteSpace)]),
      'checkAll': new FormControl('', [])
    });

    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = "CSC";
      this.menuSubSystem = "CSC Refunds";
      this.showCreditCardActive = true;
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
      this.menuHeading = "TVC";
      this.menuSubSystem = "TVC Refunds";
      this.showCreditCardActive = false;
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = "CSC";
      this.menuSubSystem = "CSC Refunds";
      this.showCreditCardActive = true;
    }

    if (this.menuHeading == "TVC") {
      this.disableButtonSearch = !this.commonService.isAllowed(Features[Features.TVCREFUNDREQUEST], Actions[Actions.SEARCH], "");
      this.disableButtonCC = !this.commonService.isAllowed(Features[Features.TVCREFUNDREQUEST], Actions[Actions.CREDITCARD], "");
      this.disableButtonCheck = !this.commonService.isAllowed(Features[Features.TVCREFUNDREQUEST], Actions[Actions.CHEQUE], "");
    }
    else {
      this.disableButtonSearch = !this.commonService.isAllowed(Features[Features.REFUNDREQUEST], Actions[Actions.SEARCH], "");
      this.disableButtonCC = !this.commonService.isAllowed(Features[Features.REFUNDREQUEST], Actions[Actions.CREDITCARD], "");
      this.disableButtonCheck = !this.commonService.isAllowed(Features[Features.REFUNDREQUEST], Actions[Actions.CHEQUE], "");
    }

    this.callRefundSearchService(0, "", "", Actions[Actions.VIEW]);
  }

  pageChanged(event) {

    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;

    let strAccountId: number;
    let strFirstName: string;
    let strLastName: string;

    if (this.refundSearchForm.controls['accountId'].value == null)
      strAccountId = 0;
    else
      strAccountId = this.refundSearchForm.controls['accountId'].value;

    if (this.refundSearchForm.controls['firstName'].value == null)
      strFirstName = "";
    else
      strFirstName = this.refundSearchForm.controls['firstName'].value;

    if (this.refundSearchForm.controls['lastName'].value == null)
      strLastName = "";
    else
      strLastName = this.refundSearchForm.controls['lastName'].value;

    this.callRefundSearchService(strAccountId, strFirstName, strLastName, "");

  }
  _keyPress(event: any) {
    const pattern = /[0-9][0-9 ]*/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      event.preventDefault();
    }
  }
  serachRefund() {
    if ((this.refundSearchForm.controls['accountId'].value != '' && this.refundSearchForm.controls['accountId'].value != null) ||
      (this.refundSearchForm.controls['firstName'].value != '' && this.refundSearchForm.controls['firstName'].value != null) ||
      (this.refundSearchForm.controls['lastName'].value != '' && this.refundSearchForm.controls['lastName'].value != null)) {
        if(this.refundSearchForm.valid){

      let strAccountId: number;
      let strFirstName: string;
      let strLastName: string;

      if (this.refundSearchForm.controls['accountId'].value == null)
        strAccountId = 0;
      else
        strAccountId = this.refundSearchForm.controls['accountId'].value;

      if (this.refundSearchForm.controls['firstName'].value == null)
        strFirstName = "";
      else
        strFirstName = this.refundSearchForm.controls['firstName'].value;

      if (this.refundSearchForm.controls['lastName'].value == null)
        strLastName = "";
      else
        strLastName = this.refundSearchForm.controls['lastName'].value;

      this.callRefundSearchService(strAccountId, strFirstName, strLastName, Actions[Actions.SEARCH]);
    }else{
      this.validateAllFormFields(this.refundSearchForm);
    }
      }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "At least 1 field is required";
    }

  }

   validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

  resetRefunds() {
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    if (this.refundSearchForm.clearValidators) {
      this.refundSearchForm.reset();
      this.callRefundSearchService(0, "", "", "");
    }
        this.materialscriptService.material();
  }

  getSelection(refund: IRefundResponse, event: any) {
    let isChecked: boolean = event.target.checked;

    if (isChecked) {
      this.refundResponseSelected.push(refund);
      refund.checked = true;
    }
    else {
      var index = this.refundResponseSelected.indexOf(refund);
      if (index > -1) {
        refund.checked = false;
        this.refundResponseSelected.splice(index, 1);
      }
    }

    if (this.refundResponse.length == this.refundResponseSelected.length) {
      this.refundSearchForm.controls['checkAll'].setValue(true);
    } else {
      this.refundSearchForm.controls['checkAll'].setValue(false);
    }

  }

  getAllSelection(event) {

    let isChecked: boolean = event.target.checked;
    this.refundResponseSelected = <IRefundResponse[]>[];

    if (this.refundResponse != null && this.refundResponse.length > 0) {

      for (var i = 0; i < this.refundResponse.length; i++) {

        if (isChecked) {
          this.refundResponseSelected.push(this.refundResponse[i]);
          this.refundResponse[i].checked = true;
        }
        else
          this.refundResponse[i].checked = false;
      }

      if (!isChecked) {
        this.refundResponseSelected = <IRefundResponse[]>[];
      }

    }

  }

  issueToCreditCard(refundResponseSelected: IRefundResponse[]) {
    if (this.refundResponseSelected.length > 0) {
      this.refundResponseSelected.forEach(IRefundResponse => IRefundResponse.ModeofPayment = "CREDITCARD");
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgTitle = "Issue to Credit Card";
      this.msgDesc = "Are you sure you want to generate Refund Request for selected accounts. ";
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select at least one account";
    }
  }

  issueToCheck(refundResponseSelected: IRefundResponse[]) {
    if (this.refundResponseSelected.length > 0) {
      this.refundResponseSelected.forEach(IRefundResponse => IRefundResponse.ModeofPayment = "CHEQUE");
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgTitle = "Issue to Check";
      this.msgDesc = "Are you sure you want to generate Refund Request for selected accounts. ";
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select at least one account";
    }
  }

  callRefundSearchService(accountId: number, firstName: string, lastName: string, action: string) {
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 100;
    this.paging.ReCount = 0;
    this.paging.SortColumn = "AccountId";
    this.paging.SortDir = 1;

    this.refundRequest = <IRefundRequest>{};
    this.refundRequest.AccountID = accountId;
    this.refundRequest.FirstName = firstName;
    this.refundRequest.LastName = lastName;

    this.refundRequest.SubSystem = this.currentSubSystem == "TVC" ? "TVC" : "CSC";
    this.refundRequest.RefundType = this.currentSubSystem == "TVC" ? "OVERPAYMENT" : "";
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.IsSearchEventFired = false;
    this.refundRequest.PageIndex = this.paging;

    let userEvents: IUserEvents;
    if (action) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.menuHeading == "TVC" ? Features[Features.TVCREFUNDREQUEST] : Features[Features.REFUNDREQUEST];
      userEvents.ActionName = action;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }

    this.refundService.getRefundRequests(this.refundRequest, userEvents).subscribe(
      res => {
        this.refundResponse = res;
      },
      (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
      },
      () => {

        if (this.refundResponse) {
          this.totalRecordCount = this.refundResponse[0].TotalCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }

      });

    if (this.totalRecordCount < this.pageItemNumber) {
      this.endItemNumber = this.totalRecordCount
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  userAction(event) {
    if (event) {
      this.refundContextService.setRefund(null);
      let isSuccess: boolean = false;

      let modeOfPay: string = "";
      this.items = [];
      this.refundRequest = <IRefundRequest>{};
      this.refundResponseSelected.forEach(resp => {
        this.refundRequest.ModeofPayment = resp.ModeofPayment;
        this.refundQueue = <IRefundQueue>{};
        this.refundQueue.AccountID = resp.AccountID;
        this.refundQueue.Amount = resp.Amount;
        this.refundQueue.AccountStatus = resp.AccountStatus;
        this.items.push(this.refundQueue);
        modeOfPay = resp.ModeofPayment;
      });

      this.refundRequest.ActivityType = "ACCTREFUND";
      this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
      this.refundRequest.CreatedUser = this.sessionContextResponse.userName;
      this.refundRequest.ExceptionRRID = 0;
      this.refundRequest.RefundRequestState = "QUEUED";
      this.refundRequest.TxnTypeId = 0;
      this.refundRequest.SubSystem = this.currentSubSystem == "TVC" ? "TVC" : "CSC";
      this.refundRequest.RefundRequestedDate = new Date();
      this.refundRequest.CreatedDate = new Date();
      this.refundRequest.RefundType = this.currentSubSystem == "TVC" ? "OVERPAYMENT" : "RR";
      this.refundRequest.objIlRefundQueue = this.items.map(x => Object.assign({}, x));

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.menuHeading == "TVC" ? Features[Features.TVCREFUNDREQUEST] : Features[Features.REFUNDREQUEST];

      if (modeOfPay == "CHEQUE") {
        userEvents.ActionName = Actions[Actions.CHEQUE];
      } else if (modeOfPay == "CREDITCARD") {
        userEvents.ActionName = Actions[Actions.CREDITCARD];
      }

      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;


      this.refundService.postRefundRequests(this.refundRequest, userEvents).subscribe(
        res => {
          if (res) {

            this.iRefundProcess = res;
            this.refundContextService.setRefund(this.iRefundProcess);

            var strSplitPath = window.location.href.split("#");
            let navigatePath: string = "";

            if (this.currentSubSystem == "TVC") {
              navigatePath = (strSplitPath[0] + "#/tvc/violator-refund-form").toString();
            }
            else {
              navigatePath = (strSplitPath[0] + "#/csc/customer-refund-form").toString();
            }

            if (navigatePath) {
              var newWindow = window.open(navigatePath);
            }

            this.items = [];
            this.refundResponseSelected = <IRefundResponse[]>[];

            this.msgFlag = true;
            this.msgType = 'success';
            this.msgTitle = '';
            this.msgDesc = "Refund successfully submitted";

            this.callRefundSearchService(0, "", "", "");
          } else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = "Error while submitting refunds.";
          }
        },
        (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        },
        () => {
          $('#accountId').val('');
          $('#firstName').val('');
          $('#lastName').val('');
        });
    }
  }

}
