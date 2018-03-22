import { defaultCulture } from './../../shared/constants';
import { Router } from '@angular/router';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { IPlanRequest } from '../../sac/plans/models/plansrequest';
import { IUserresponse } from '../../shared/models/userresponse';
import { Actions, ActivitySource, Features, SubSystem } from '../../shared/constants';
import { ICustomerAttributeRequest, IAccountAdjustmentsRequest } from '../../shared/models/customerattributerequest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerserviceService } from '../customerservice/services/customerservice.service';
import { ICustomerAttributeResponse } from '../../shared/models/customerattributeresponse';
import { IPaging } from '../../shared/models/paging';
import { SessionService } from '../../shared/services/session.service';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-referral',
  templateUrl: './manage-referral.component.html',
  styleUrls: ['./manage-referral.component.css']
})
export class ManageReferralComponent implements OnInit {

  manageReferralFrom: FormGroup;
  pagingRequest: IPaging;
  customerAttributesRequest: ICustomerAttributeRequest;
  custAttributesResponse: ICustomerAttributeResponse[];
  selectedAccountList: ICustomerAttributeResponse[] = <ICustomerAttributeResponse[]>[];
  accountAdjustmentRequest: IAccountAdjustmentsRequest;
  sessionContextResponse: IUserresponse;
  planRequest: IPlanRequest;
  strTollType: string;
  isPOstPaidCustomer: boolean;
  accountAdjustmentRequestArray: IAccountAdjustmentsRequest[] = <IAccountAdjustmentsRequest[]>[];
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  successMessage: string = '';
  checkIndCheckBox: boolean;
  isParentSelected: boolean;
  isDisableSubmitBtn: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private customerAccountService: CustomerAccountsService, private sessionContext: SessionService,
    private customerService: CustomerserviceService, private commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg('ICN is not assigned to do transactions');
      this.isDisableSubmitBtn = true;
    }

    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.manageReferralFrom = new FormGroup({
      'ststusDropDown': new FormControl('', [Validators.required]),
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.REFERRAL];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    !this.commonService.isAllowed(Features[Features.REFERRAL], Actions[Actions.VIEW], "");
    this.isDisableSubmitBtn = !this.commonService.isAllowed(Features[Features.REFERRAL], Actions[Actions.UPDATE], "");
    this.getRefferalCustomers(this.p, userEvents);
  }
  dropDownList: lookUps[] =
  [
    { "LookUpTypeCode": "Approved", "LookUpTypeCodeDesc": "Approved" },
    { "LookUpTypeCode": "Pending", "LookUpTypeCodeDesc": "Pending" },
    { "LookUpTypeCode": "Rejected", "LookUpTypeCodeDesc": "Rejected" }
  ];

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getRefferalCustomers(this.p);
  }

  getRefferalCustomers(pageNumber: number, userEvents?) {
    this.pagingRequest = <IPaging>{};
    this.pagingRequest.PageNumber = pageNumber;
    this.pagingRequest.PageSize = 10;
    this.pagingRequest.SortColumn = '';
    this.pagingRequest.SortDir = 1;
    this.customerAccountService.getRefferalCustomers(this.pagingRequest, userEvents)
      .subscribe(res => {
        this.custAttributesResponse = res;
        this.totalRecordCount = this.custAttributesResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
        if (this.selectedAccountList && this.selectedAccountList.length > 0) {
          let count: number = 0;
          for (var i = 0; i < this.custAttributesResponse.length; i++) {
            var index = this.selectedAccountList.findIndex(x => x.AccountId == this.custAttributesResponse[i].AccountId);
            if (index > -1) {
              this.custAttributesResponse[i].isReferralAccountSelected = true;
              this.custAttributesResponse[i].RequestStatus = this.selectedAccountList[index].RequestStatus;
              count++;
            }
            else
              this.custAttributesResponse[i].isReferralAccountSelected = false;
          }
          if (this.custAttributesResponse.length == count) {
            this.isParentSelected = true;
          }
          else {
            this.isParentSelected = false;
          }
        }

      });
  }

  checkboxCheckedEvent(object: ICustomerAttributeResponse, event) {
   
    var index = this.selectedAccountList.findIndex(x => x.AccountId == object.AccountId);
    if (event.target.checked) {
      if (index == -1) {
        this.selectedAccountList.push(object);
        object.isReferralAccountSelected = true;
        var result = this.custAttributesResponse.filter(x => x.isReferralAccountSelected == true).length;
        if (result == this.custAttributesResponse.length)
          this.isParentSelected = true;
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedAccountList.splice(index, 1);
        object.isReferralAccountSelected = false;
      }
    }
  }

  submitManageReferralRequest() {
  
    if (this.selectedAccountList.length > 0) {
      //User Events 
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.REFERRAL];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      //Pending check
      var pendingCustIDs: string = '';
      var approvedCustIds = '';
      var rejectedCustIds = '';
      for (var i = 0; i < this.selectedAccountList.length; i++) {
        if (this.selectedAccountList[i].RequestStatus.toUpperCase() == "PENDING") {
          pendingCustIDs += this.selectedAccountList[i].ReferralCustomerId.toString() + ',';
        }
        if (this.selectedAccountList[i].RequestStatus.toUpperCase() == "APPROVED") {
          approvedCustIds += this.selectedAccountList[i].ReferralCustomerId.toString() + ',';
        }
        if (this.selectedAccountList[i].RequestStatus.toUpperCase() == "REJECTED") {
          rejectedCustIds += this.selectedAccountList[i].ReferralCustomerId.toString() + ',';
        }
      }
      if (pendingCustIDs.length > 0) {
        pendingCustIDs = pendingCustIDs.slice(0, -1);
        this.showErrorMsg('Change the status of Referral Account(s) #' + pendingCustIDs);
      }
      else {
        for (var i = 0; i < this.selectedAccountList.length; i++) {
          this.accountAdjustmentRequest = <IAccountAdjustmentsRequest>{};
          this.accountAdjustmentRequest.RefPkId = this.selectedAccountList[i].RefPkId;
          //Passing Referral customer as customer and customerid as refferral customerid
          this.accountAdjustmentRequest.CustomerId = this.selectedAccountList[i].ReferralCustomerId;
          this.accountAdjustmentRequest.ReferralCustomerId = this.selectedAccountList[i].AccountId;
          this.accountAdjustmentRequest.AccStatusCode = this.selectedAccountList[i].AccountStatus;
          this.accountAdjustmentRequest.AdjustmentCategory = 'PrePaid';
          this.accountAdjustmentRequest.DrCr_Flag = 'C';
          this.accountAdjustmentRequest.TxnType = 'FRIEREFERALACCT';
          this.accountAdjustmentRequest.User = this.sessionContextResponse.userName;
          // this.accountAdjustmentRequest.IsPostpaidCustomer = this.getPlanofCustomer(this.accountAdjustmentRequest.CustomerId);
          // this.accountAdjustmentRequest.AppTxnTypeCode = this.accountAdjustmentRequest.IsPostpaidCustomer ? "ADJPOSTREFERRAL" : "ADJREFERRAL";
          this.accountAdjustmentRequest.ICNId = this.sessionContextResponse.icnId;
          this.accountAdjustmentRequest.IsApproved = this.selectedAccountList[i].RequestStatus;
          this.accountAdjustmentRequest.AdjustmentDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");;
          this.accountAdjustmentRequest.TxnCategory = 'ADJUSTMENT';
          this.accountAdjustmentRequest.ActivityType = 'ADJREFERRAL';
          this.accountAdjustmentRequestArray.push(this.accountAdjustmentRequest);
        }
        this.customerAttributesRequest = <ICustomerAttributeRequest>{};
        this.customerAttributesRequest.AccountAdjustments = this.accountAdjustmentRequestArray;
        this.customerAttributesRequest.LoginId = this.sessionContextResponse.loginId;
        this.customerAttributesRequest.UserId = this.sessionContextResponse.userId;
        this.customerAttributesRequest.ActionCode = Actions[Actions.UPDATE];
        this.customerAttributesRequest.ActivitySource = ActivitySource[ActivitySource.Internal]
        this.customerAttributesRequest.SubSystem = SubSystem[SubSystem.CSC];
        this.customerAccountService.updateReferralCustomer(this.customerAttributesRequest, userEvents)
          .subscribe(res => {
            if (res) {
              if (approvedCustIds.length > 0) {
                approvedCustIds = approvedCustIds.slice(0, -1);
                this.successMessage = 'Approved Referral Account(s) :' + approvedCustIds;
                this.selectedAccountList = [];
                this.accountAdjustmentRequestArray = [];
                approvedCustIds='';
              }
              if (rejectedCustIds.length > 0) {
                rejectedCustIds = rejectedCustIds.slice(0, -1);
                this.successMessage += 'Rejected Referral Account(s) :' + rejectedCustIds;
                this.selectedAccountList = [];
                this.accountAdjustmentRequestArray = [];
                rejectedCustIds='';
              }
              this.showSucsMsg(this.successMessage);
              this.getRefferalCustomers(this.p);
            }
          });
      }
    } else {
      this.showErrorMsg('Select atleast one Account #');
    }
  }

  getPlanofCustomer(customerId: number): boolean {
    this.planRequest = <IPlanRequest>{};
    this.planRequest.AccountId = customerId;
    this.customerService.getPlan(this.planRequest)
      .subscribe(res => {
        this.strTollType = res[0].ParentPlanName;
        if (this.strTollType.toUpperCase() == "POSTPAID")
          this.isPOstPaidCustomer = true;
        else
          this.isPOstPaidCustomer = false;
      });
    return this.isPOstPaidCustomer;
  }

  resetClick() {
    this.checkIndCheckBox = false;
    this.selectedAccountList = [];
    this.p = 1;
    this.getRefferalCustomers(1);
  }

  checkAllClick(event) {
    for (var i = 0; i < this.custAttributesResponse.length; i++) {
      let isChecked: boolean = event.target.checked;
      this.custAttributesResponse[i].isReferralAccountSelected = isChecked;
      var index = this.selectedAccountList.findIndex(x => x.AccountId == this.custAttributesResponse[i].AccountId);
      if (index > -1 && !isChecked) {
        this.selectedAccountList = this.selectedAccountList.filter(item => item.AccountId != this.custAttributesResponse[i].AccountId);
        this.custAttributesResponse[i].isReferralAccountSelected = false;
      }
      else if (isChecked) {
        var index = this.selectedAccountList.findIndex(x => x.AccountId == this.custAttributesResponse[i].AccountId);
        if (index === -1) {
          this.selectedAccountList.push(this.custAttributesResponse[i]);
          this.custAttributesResponse[i].isReferralAccountSelected = true;
        }
      }
    }
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

    setOutputFlag(e) {
    this.msgFlag = e;
  }
}

export class lookUps {
  LookUpTypeCode: string
  LookUpTypeCodeDesc: string
};
