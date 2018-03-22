import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ISearchCustomerRequest } from '../search/models/searchcustomerRequest';
import { IPaging } from '../../shared/models/paging';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { ISearchCustomerResponse } from '../search/models/searchcustomerresponse';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { FormGroup, FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ActivitySource, Features, Actions } from '../../shared/constants';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-re-open-account',
  templateUrl: './re-open-account.component.html',
  styleUrls: ['./re-open-account.component.css'],
})
export class ReOpenAccountComponent implements OnInit {
  profileResponse: any;
  advancedSearchForm: any;
  afterSearch: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  createForm: FormGroup;
  p: number = 1;
  @ViewChild(AdvanceSearchComponent) advanceSearchchild;

  name: string;
  searchRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  searchInRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  searchResponse: ISearchCustomerResponse[];
  paging: IPaging = <IPaging>{};
  customerContextResponse: ICustomerContextResponse;
  sessionConstextResponse: IUserresponse;
  constructor(private customerAccountService: CustomerAccountsService, private router: Router, private customerContext: CustomerContextService, private sessionContext: SessionService, private commonService: CommonService, private materialscriptService:MaterialscriptService) { }
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  blockListDetails: IBlocklistresponse[] = [];
  selectedRowData: any;
  isDisplay: boolean;
  disableButton: boolean;


  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = 10;
    this.sessionConstextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.REOPENACCOUNT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {
    });
    this.disableButton = !this.commonService.isAllowed(Features[Features.REOPENACCOUNT], Actions[Actions.SEARCH], '');
  }

  pageChanged(event) {
    this.p = event;

    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.search(this.p, null);
  }

  search(pageNumber: number, userEvents: any) {
    this.isDisplay = false;

    if (this.advanceSearchchild.createForm.controls['AccountNo'].value === null || this.advanceSearchchild.createForm.controls['AccountNo'].value === '') {
      this.searchRequest.AccountId = 0;
    } else {
      this.searchRequest.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value; // 10258206;
    }
    if (this.advanceSearchchild.createForm.controls['CCSuffix'].value === null || this.advanceSearchchild.createForm.controls['CCSuffix'].value === '') {
      this.searchRequest.CCSuffix = -1;
    } else {
      this.searchRequest.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value; // 1111;
    }
    this.searchRequest.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
    this.searchRequest.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
    this.searchRequest.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
    this.searchRequest.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
    this.searchRequest.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
    this.searchRequest.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;

    this.searchRequest.Address = this.advanceSearchchild.createForm.controls['Address'].value;
    this.searchRequest.ActivitySource = ActivitySource.Internal.toString();
    this.searchRequest.LoginId = this.sessionConstextResponse.loginId;
    this.searchRequest.LoggedUserID = this.sessionConstextResponse.userId;
    this.paging.PageSize = 10;
    this.paging.PageNumber = pageNumber;
    this.paging.SortColumn = 'CUSTOMERID';
    this.paging.SortDir = 1;
    this.searchRequest.PageIndex = this.paging;
    this.customerAccountService.searchReopenAccount(this.searchRequest, userEvents).subscribe(res => {
      this.profileResponse = res;
      this.afterSearch = true;
      //result is one and it should be page 1.
      if (this.profileResponse.length == 1 && this.startItemNumber == 1) {
        this.viewButton(this.profileResponse[0]);

      }
      else {
        this.dataLength = this.profileResponse.length;
        setTimeout(function () { window.scrollTo(0, document.body.scrollHeight) }, 100);
        if (this.profileResponse && this.profileResponse.length > 0) {
          this.totalRecordCount = this.profileResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }
      if (res) {
        this.searchResponse = res;
        if (this.searchResponse[0].RecordCount > 0) {
          this.isDisplay = true;
          this.totalRecordCount = this.searchResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }
    });
  }

  advancedSearchReset() {
    this.advancedSearchForm.reset();
    this.advanceSearchchild.createForm.reset();
    this.profileResponse = null;
    this.afterSearch = false;
    //this.advancedSearch(this.p);
  }

  onSubmit(): void {
    if (this.advanceSearchchild.createForm.valid) {
      if ((this.advanceSearchchild.createForm.controls['AccountNo'].value !== '' &&
        this.advanceSearchchild.createForm.controls['AccountNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['SerialNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['SerialNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PlateNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PlateNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Fname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Fname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Lastname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Lastname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PhoneNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PhoneNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['EmailAdd'].value !== '' &&
          this.advanceSearchchild.createForm.controls['EmailAdd'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Address'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Address'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['CCSuffix'].value !== '' &&
          this.advanceSearchchild.createForm.controls['CCSuffix'].value !== null)) {
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.REOPENACCOUNT];
        userEvents.ActionName = Actions[Actions.SEARCH];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
        userEvents.UserName = this.sessionConstextResponse.userName;
        userEvents.LoginId = this.sessionConstextResponse.loginId;

        this.search(this.p, userEvents);
      } else {
        this.showErrorMsg('At least 1 field is required');
        return;
      }
    }

  }

  reset(): void {
    this.advanceSearchchild.createForm.reset();
    this.searchResponse = null;
  }

  viewButton(selectedRow) {
    this.selectedRowData = selectedRow;
    this.checkForBlockList(selectedRow.AccountId);
  }

  checkForBlockList(longAccountId: number) {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(res => {
      if (res) {
        this.commonService.checkBlockListByAccountId(longAccountId).subscribe(respose => {
          if (respose) {
            this.blockListDetails = respose;
            $('#blocklist-dialog').modal('show');
          } else {
            this.goToSummary();
          }
        });

      } else {
        this.goToSummary();
      }
    });
  }

  goToSummary() {
    const link = ['../../csc/customerdetails/reopen-accountsummary/'];
    this.customerContextResponse = <ICustomerContextResponse>{};
    this.customerContextResponse.AccountId = this.selectedRowData.AccountId;
    this.customerContextResponse.UserName = this.selectedRowData.CreatedUser;
    this.customerContextResponse.AccountStatus = this.selectedRowData.AccountStatus;
    this.customerContextResponse.AccountSummaryUserActivity = true;
    this.customerContextResponse.AccountType = this.selectedRowData.AccountType;
    this.customerContextResponse.AdditionalContactUserId = 100003;
    this.customerContextResponse.boolIsTagRequired = 'Tag Required';
    this.customerContextResponse.CustomerParentPlan = this.selectedRowData.CreatedUser;
    this.customerContextResponse.CustomerPlan = 'Video Plan';
    this.customerContextResponse.IsSearched = true;
    this.customerContextResponse.IsSplitCustomer = false;
    this.customerContextResponse.RevenueCategory = this.selectedRowData.RevenueCategory;
    this.customerContext.changeResponse(this.customerContextResponse);
    this.router.navigate(link);
  }

  
  setOutputFlag(e) {
    this.msgFlag = e.flag;
    this.msgType = e.type;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;

  }

}


