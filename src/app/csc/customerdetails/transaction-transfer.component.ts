import { Component, OnInit, ViewChild } from '@angular/core';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { SessionService } from '../../shared/services/session.service';
import { IPaging } from '../../shared/models/paging';
import { ActivitySource, SubSystem, AccountStatus, Features, Actions } from '../../shared/constants';
import { IUserresponse } from '../../shared/models/userresponse';
import { ISearchCustomerRequest } from '../search/models/searchcustomerRequest';
import { CustomerSearchService } from '../search/services/customer.search';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { CommonService } from '../../shared/services/common.service';
import { Router } from '@angular/router';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { CustomerDetailsService } from './services/customerdetails.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IAccountAdjustmentRequest } from './models/accountadjustmentrequest';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { ICustomerProfileResponse } from '../../shared/models/customerprofileresponse';
import { IUserEvents } from "../../shared/models/userevents";

declare var $: any;
@Component({
  selector: 'app-transaction-transfer',
  templateUrl: './transaction-transfer.component.html',
  styleUrls: ['./transaction-transfer.component.scss']
})
export class TransactionTransferComponent implements OnInit {

  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  constructor(private customerSearchService: CustomerSearchService, private commonService: CommonService, private customerDetailsService: CustomerDetailsService, private router: Router, private tripsContextService: TripsContextService, private customerContextService: CustomerContextService, private sessionContext: SessionService) { }

  sessionContextResponse: IUserresponse;
  profileResponseArray: ICustomerProfileResponse[] = [];
  tripContextResponse: ITripsContextResponse;
  isDisplaySearchDetails: boolean = false;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  checkBlocklist: boolean = false;
  blockListDetails: IBlocklistresponse[] = [];
  accountId: number = 0;
  transferCustomerId: number = 0;
  customerTripIds: string = "";
  transactionactivitieslink = ['/csc/customerdetails/transaction-activities/'];
  accountStatus: string;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.customerContextService.currentContext
      .subscribe(customerContext => {
        if (customerContext) {
          this.accountId = customerContext.AccountId;
          this.accountStatus = customerContext.AccountStatus;
        }
        else {
          let link = ['/csc/search/advance-csc-search/'];
          this.router.navigate(link);
        }
      });
    this.tripsContextService.currentContext.subscribe(customerContext => this.tripContextResponse = customerContext);
    if (this.tripContextResponse) {
      if (!this.tripContextResponse.tripIDs || this.tripContextResponse.tripIDs.length <= 0)
        this.router.navigate(this.transactionactivitieslink);
    }
    else
      this.router.navigate(this.transactionactivitieslink);
    for (let i = 0; i < this.tripContextResponse.tripIDs.length; i++) {
      this.customerTripIds = this.customerTripIds.concat(this.tripContextResponse.tripIDs[i].toString());
      if (i < this.tripContextResponse.tripIDs.length - 1)
        this.customerTripIds = this.customerTripIds.concat(",");
    }
    console.log(this.customerTripIds);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MergeCustomerCount).subscribe(res => this.checkBlocklist = res);
    this.disableButton = !this.commonService.isAllowed(Features[Features.CUSTOMERTRANSACTIONACTIVITIES], Actions[Actions.TRANSFER], this.accountStatus);
  }

  searchCustomers() {
    this.isDisplaySearchDetails = true;
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.getCustomers(true);
  }

  searchReset() {
    this.advanceSearchchild.createForm.reset();
    this.profileResponseArray = [];
    this.transferCustomerId = 0;
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
  }

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getCustomers(false);
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
        this.msgDesc = "Please fill at-least one field";
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
        this.customerSearchService.getAdvancedSearch(searchCustomerRequest).subscribe(res => {
          this.profileResponseArray = res;
          if (this.profileResponseArray && this.profileResponseArray.length > 0) {
            this.totalRecordCount = this.profileResponseArray[0].RecordCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
        });
      }
    }
  }

  selectCustomer(customerId: number) {
    this.transferCustomerId = customerId;
  }

  transferTransactionClick() {
    if (this.transferCustomerId > 0) {
      if (this.checkBlocklist) {
        this.commonService.checkBlockListByAccountId(this.transferCustomerId).subscribe(res => {
          if (res) {
            this.blockListDetails = res;
            $('#blocklist-dialog').modal('show');
          } else {
            this.vehicleProcess();
          }
        });
      }
      else
        this.vehicleProcess();
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select atleast one customer to transfer trip";
    }
  }

  transferTransactionPopup() {
    this.vehicleProcess();
  }

  vehicleProcess() {
    this.customerDetailsService.checkCustomerVehicleByCustTripIdCSV(this.accountId, this.customerTripIds).subscribe(res => {
      if (res) {
        $('#transfervehicle-dialog').modal('show');
      }
      else
        this.transferTransaction(false);
    });
  }

  vehicleTransferYesPopup() {
    $('#transfervehicle-dialog').modal('hide');
    this.transferTransaction(true);
  }

  vehicleTransferNoPopup() {
    $('#transfervehicle-dialog').modal('hide');
    this.transferTransaction(false);
  }

  transferTransaction(isVehilceTransfer: boolean) {
    let accountAdjustmentRequest: IAccountAdjustmentRequest = <IAccountAdjustmentRequest>{};
    accountAdjustmentRequest.CustTripIdCSV = this.customerTripIds;
    accountAdjustmentRequest.IsVehicleTransfered = isVehilceTransfer;
    accountAdjustmentRequest.TransferCustomerId = this.transferCustomerId;
    accountAdjustmentRequest.CustomerId = this.accountId;
    accountAdjustmentRequest.User = this.sessionContextResponse.userName;
    accountAdjustmentRequest.AccStatusCode = AccountStatus[AccountStatus.AC];
    accountAdjustmentRequest.ICNId = this.sessionContextResponse.icnId;
    accountAdjustmentRequest.SubSystem = SubSystem[SubSystem.CSC];
    accountAdjustmentRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    //System Related activities
    let objSystemActivities: ISystemActivities = <ISystemActivities>{};
    objSystemActivities.LoginId = this.sessionContextResponse.loginId;
    objSystemActivities.UserId = this.sessionContextResponse.userId;
    objSystemActivities.User = this.sessionContextResponse.userName;
    accountAdjustmentRequest.SystemActivity = objSystemActivities;
    accountAdjustmentRequest.IsTripTransfer = true;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CUSTOMERTRANSACTIONACTIVITIES];
    userEvents.ActionName = Actions[Actions.TRANSFER];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.customerDetailsService.transactionTransfer(accountAdjustmentRequest, userEvents).subscribe(res => {
      if (res) {
        this.tripContextResponse.successMessage = "Transaction(s) has been transferred successfully";
        this.tripContextResponse.tripIDs = [];
        this.tripsContextService.changeResponse(this.tripContextResponse);
        this.router.navigate(this.transactionactivitieslink, { queryParams: { fromSearch: true } });
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Error while transferring trip";
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText;
    });
  }

  cancelTransfer() {
    this.tripContextResponse = <ITripsContextResponse>{};
    this.tripsContextService.changeResponse(this.tripContextResponse);
    this.router.navigate(this.transactionactivitieslink, { queryParams: { fromSearch: true } });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
