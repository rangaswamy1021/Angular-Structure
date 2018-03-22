import { Component, OnInit, ViewChild } from '@angular/core';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { ISearchCustomerRequest } from '../search/models/searchcustomerRequest';
import { IPaging } from "../../shared/models/paging";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from '@angular/router';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-merge-accounts',
  templateUrl: './merge-accounts.component.html',
  styleUrls: ['./merge-accounts.component.css']
})
export class MergeAccountsComponent implements OnInit {
  closeMessage: any;
  dataLength: any;
  profileResponse: any;
  viewButton: any;
  afterSearch: boolean = false;
  disableButton: boolean = false;

  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  constructor(private customerAccountsService: CustomerAccountsService, private commonService: CommonService, private router: Router, private sessionContext: SessionService, private materialscriptService:MaterialscriptService) { }

  customerResponseArray: ICustomerResponse[] = [];
  mergeCustomerResponseArray: ICustomerResponse[] = [];
  isDisplaySearchDetails: boolean = false;
  isDisplayMergeDetails: boolean = false;
  sessionContextResponse: IUserresponse;
  maxMergeAccountsCount: number = 0;
  parentAccountId: number = 0;
  isParentCheck: boolean = false;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  blockListDetails: IBlocklistresponse[] = [];

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MERGECUSTOMERS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MergeCustomerCount, userEvents).subscribe(res => this.maxMergeAccountsCount = res);

    this.disableButton = !this.commonService.isAllowed(Features[Features.MERGECUSTOMERS], Actions[Actions.CREATE], "");
  }

  pageChanged(event) {
    this.isParentCheck = false;
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getCustomers(false);

  }

  searchCustomers() {
    this.isDisplaySearchDetails = true;
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.getCustomers(true);
  }

  getCustomers(isSearch: boolean) {
    if (this.advanceSearchchild.createForm.valid) {
      if (!this.advanceSearchchild.createForm.controls['AccountNo'].value &&
        !this.advanceSearchchild.createForm.controls['SerialNo'].value &&
        !this.advanceSearchchild.createForm.controls['PlateNo'].value &&
        !this.advanceSearchchild.createForm.controls['Fname'].value &&
        !this.advanceSearchchild.createForm.controls['Lastname'].value &&
        !this.advanceSearchchild.createForm.controls['PhoneNo'].value &&
        !this.advanceSearchchild.createForm.controls['EmailAdd'].value &&
        !this.advanceSearchchild.createForm.controls['Address'].value &&
        !this.advanceSearchchild.createForm.controls['CCSuffix'].value
      ) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "At least 1 field is required";
        this.isDisplaySearchDetails = false;
        return;
      }
      else {
        let searchCustomerRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
        if (this.advanceSearchchild.createForm.controls['AccountNo'].value) {
          searchCustomerRequest.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value;
        }
        else {
          searchCustomerRequest.AccountId = 0;
        }

        searchCustomerRequest.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
        searchCustomerRequest.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
        searchCustomerRequest.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
        searchCustomerRequest.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
        searchCustomerRequest.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
        searchCustomerRequest.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;
        searchCustomerRequest.Address = this.advanceSearchchild.createForm.controls['Address'].value;
        if (this.advanceSearchchild.createForm.controls['CCSuffix'].value) {
          searchCustomerRequest.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value;
        }
        else {
          searchCustomerRequest.CCSuffix = -1;
        }

        searchCustomerRequest.PageIndex = <IPaging>{};
        searchCustomerRequest.PageIndex.PageNumber = this.pageNumber;
        searchCustomerRequest.PageIndex.PageSize = this.pageItemNumber;
        searchCustomerRequest.PageIndex.SortColumn = "CUSTOMERID";
        searchCustomerRequest.PageIndex.SortDir = 1;

        searchCustomerRequest.LoginId = this.sessionContextResponse.loginId;
        searchCustomerRequest.LoggedUserID = this.sessionContextResponse.userId;
        searchCustomerRequest.LoggedUserName = this.sessionContextResponse.userName;
        searchCustomerRequest.IsSearchEventFired = isSearch;
        searchCustomerRequest.ActivitySource = ActivitySource[ActivitySource.Internal];

        this.customerAccountsService.mergeCustomerSearch(searchCustomerRequest).subscribe(res => {
          this.customerResponseArray = res;
          this.profileResponse = res;
          this.afterSearch = true;
          //result is one and it should be page 1.
          if (this.profileResponse.length == 1 && this.startItemNumber == 1) {
            this.viewButton(this.profileResponse[0]);

          }
          else {
            this.dataLength = this.profileResponse.length;
            //  let element=document.getElementById('dataPanel');
            // element.scrollIntoView()
            setTimeout(function () { window.scrollTo(0, document.body.scrollHeight) }, 100);
            if (this.profileResponse && this.profileResponse.length > 0) {
              this.totalRecordCount = this.profileResponse[0].RecordCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount;
              }
            }
          }
          if (this.customerResponseArray && this.customerResponseArray.length > 0) {
            this.totalRecordCount = this.customerResponseArray[0].RecordCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }

            if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length > 0) {
              let count: number = 0;
              for (var i = 0; i < this.customerResponseArray.length; i++) {
                var index = this.mergeCustomerResponseArray.findIndex(x => x.AccountId == this.customerResponseArray[i].AccountId);
                if (index > -1) {
                  this.customerResponseArray[i].isMergeAccountCheck = true;
                  count++;
                }
                else
                  this.customerResponseArray[i].isMergeAccountCheck = false;
              }
              if (this.customerResponseArray.length == count) {
                this.isParentCheck = true;
              }
              else
                this.isParentCheck = false;
            }
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Error while fetching customer details";
          return;
        });
      }
    }
  }

  searchReset() {
    this.advanceSearchchild.createForm.reset();
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.customerResponseArray = [];
    this.afterSearch = false;
    this.closeMessage();
  }

  checkandUncheckAllAccounts(event: any) {
    let isChecked: boolean = event.target.checked;
    if (this.customerResponseArray && this.customerResponseArray.length > 0) {

      if (isChecked) {
        let count: number = 0;
        for (var i = 0; i < this.customerResponseArray.length; i++) {
          var index = this.mergeCustomerResponseArray.findIndex(x => x.AccountId == this.customerResponseArray[i].AccountId);
          if (index < 0) {
            count++;
          }
        }
        if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length + count > this.maxMergeAccountsCount) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Maximum " + this.maxMergeAccountsCount.toString() + " accounts can be merged";
          event.target.checked = false;
          return;
        }
      }

      for (var i = 0; i < this.customerResponseArray.length; i++) {
        this.customerResponseArray[i].isMergeAccountCheck = isChecked;
        var index = this.mergeCustomerResponseArray.findIndex(x => x.AccountId == this.customerResponseArray[i].AccountId);
        if (index > -1 && !isChecked) {
          this.mergeCustomerResponseArray = this.mergeCustomerResponseArray.filter(item => item.AccountId != this.customerResponseArray[i].AccountId);
          this.customerResponseArray[i].isMergeAccountCheck = false;
        }
        else if (isChecked && index < 0) {
          this.mergeCustomerResponseArray.push(this.customerResponseArray[i]);
          this.customerResponseArray[i].isMergeAccountCheck = true;
        }
      }

      if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length > 0) {
        this.isDisplayMergeDetails = true;
      }
      else
        this.isDisplayMergeDetails = false;
    }
  }

  checkorUncheckCustomer(customerResponse: ICustomerResponse, event: any) {
    let isChecked: boolean = event.target.checked;
    if (isChecked) {
      if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length >= this.maxMergeAccountsCount) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Maximum " + this.maxMergeAccountsCount.toString() + " accounts can be merged";
        customerResponse.isMergeAccountCheck = false;
        return;
      }
      else {
        this.mergeCustomerResponseArray.push(customerResponse);
        customerResponse.isMergeAccountCheck = true;
        var result = this.customerResponseArray.filter(x => x.isMergeAccountCheck == true).length;
        if (result == this.customerResponseArray.length)
          this.isParentCheck = true;
      }
    }
    else {
      this.isParentCheck = false;
      //this.mergeCustomerResponseArray = this.mergeCustomerResponseArray.slice(index);
      this.mergeCustomerResponseArray = this.mergeCustomerResponseArray.filter(item => item.AccountId != customerResponse.AccountId);
      customerResponse.isMergeAccountCheck = false;
    }
    if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length > 0) {
      this.isDisplayMergeDetails = true;
    }
    else
      this.isDisplayMergeDetails = false;
  }

  deleteCustomer(customerResponse: ICustomerResponse) {
    this.mergeCustomerResponseArray = this.mergeCustomerResponseArray.filter(item => item.AccountId != customerResponse.AccountId);
    customerResponse.isMergeAccountCheck = false;
    this.isParentCheck = false;
    if (this.parentAccountId = customerResponse.AccountId)
      this.parentAccountId = 0;
    if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length > 0) {
      this.isDisplayMergeDetails = true;
    }
    else
      this.isDisplayMergeDetails = false;
  }

  selectParentCustomer(accountId: number) {
    this.parentAccountId = accountId;
  }

  mergecustomersClick() {
    this.mergeCustomers(true);
  }

  mergeCustomersPop() {
    this.mergeCustomers(false);
  }

  mergeCustomers(checkBlockList: boolean) {
    if (this.mergeCustomerResponseArray && this.mergeCustomerResponseArray.length > 1 && this.parentAccountId > 0) {
      let objSystemActivities: ISystemActivities = <ISystemActivities>{};
      objSystemActivities.LoginId = this.sessionContextResponse.loginId;
      objSystemActivities.UserId = this.sessionContextResponse.userId;
      objSystemActivities.User = this.sessionContextResponse.userName;

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.MERGECUSTOMERS];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      $('#pageloader').modal('show');
      this.customerAccountsService.mergAccounts(this.parentAccountId, this.mergeCustomerResponseArray, this.sessionContextResponse.userName, objSystemActivities, checkBlockList, userEvents)
        .subscribe(res => {
          $('#pageloader').modal('hide');
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = res;
          this.mergeCustomerResponseArray = [];
          this.parentAccountId = 0;
          this.isDisplayMergeDetails = false;
          this.getCustomers(false);
        }, err => {
          $('#pageloader').modal('hide');
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
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select atleast two accounts to merge and select one as parent account";
      return;
    }
  }

  cancelMergeCustomers() {
    this.mergeCustomerResponseArray = [];
    this.isDisplayMergeDetails = false;
    this.isParentCheck = false;
    this.parentAccountId = 0;
    //uncheck the list of customers in the search results 
    if (this.customerResponseArray && this.customerResponseArray.length > 0) {
      for (var i = 0; i < this.customerResponseArray.length; i++) {
        this.customerResponseArray[i].isMergeAccountCheck = false;
      }
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
