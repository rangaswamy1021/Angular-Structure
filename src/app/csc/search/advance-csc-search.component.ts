import { ActivatedRoute } from '@angular/router';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { LoginService } from './../../login/services/login.service';
import { ICustomerProfileResponse } from './../../shared/models/customerprofileresponse';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchDetailsComponent } from './search-details.component';
import { FormGroup, FormControl } from '@angular/forms';
//import { IProfileResponse } from './../customerdetails/models/profileresponse';
import { ISearchCustomerRequest } from './models/searchcustomerrequest';
import { IPaging } from "../../shared/models/paging";
import { CustomerSearchService } from './services/customer.search';
import { IProfileRequest } from '../customerdetails/models/profilerequest';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { RouterModule, Router } from '@angular/router';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ActivitySource, SubSystem, Features, Actions } from '../../shared/constants';
import { AccountStatus } from './constants';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-advance-csc-search',
  templateUrl: './advance-csc-search.component.html',
  styleUrls: ['./advance-csc-search.component.scss']
})
export class AdvanceCscSearchComponent implements OnInit, AfterViewInit {
  gridArrowEmailAddress: boolean;
  gridArrowPhoneNumber: boolean;
  gridArrowLastName: boolean;
  gridArrowFirstName: boolean;
  gridArrowCUSTOMERID: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowAccountType: boolean;
  isParamsPresent: boolean;
  p: number = 1;
  afterSearch: boolean = false;
  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  createForm: FormGroup;
  advancedSearchForm: FormGroup;
  advancedSearchCustomer: ISearchCustomerRequest;
  selectedRowData: any;
  blockListDetails: IBlocklistresponse[] = [];
  customerData: any = [];
  profileResponse: ICustomerProfileResponse[] = <ICustomerProfileResponse[]>[];
  constructor(private customerSearchService: CustomerSearchService, private router: Router,
    private customerContext: CustomerContextService, private route: ActivatedRoute, private context: SessionService, private commonService: CommonService, private loginService: LoginService, private materialscriptService: MaterialscriptService) { }
  popupHeading: string;
  popupMessage: string;

  pageItemNumber: number = 10;
  totalRecordCount: number;
  dataLength: number = this.profileResponse.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.advancedSearch(this.p, false);
  }

  ngOnInit() {
    this.gridArrowCUSTOMERID = true;
    this.sortingColumn = "CUSTOMERID";
    this.materialscriptService.material();
    this.materialscriptService.selectMaterial();
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.advancedSearchCustomer = <ISearchCustomerRequest>{};
    this.advancedSearchForm = new FormGroup({
      'PreferredLanguage': new FormControl(''),
      'HearingImpairment': new FormControl(''),
      'FrequentCaller': new FormControl(''),
      'Supervisor': new FormControl('')
    });
    this.customerContext.currentContext
      .subscribe(customerContext => {
        this.customerContextResponse = customerContext;
      });
    if (!this.commonService.isAllowed(Features[Features.ADVANCESEARCH], Actions[Actions.VIEW], "")) {
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.ADVANCESEARCH], Actions[Actions.SEARCH], "");
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ADVANCESEARCH];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context.customerContext.roleID);
    userEvents.UserName = this.context.customerContext.userName;
    userEvents.LoginId = this.context.customerContext.loginId;

    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
    this.route.queryParams
      .filter(params => params.fromSearch)
      .subscribe(params => {
        if (params.fromSearch) {
          this.profileResponse = this.customerSearchService.searchResults;
          if (this.customerSearchService.searchData) {
            this.totalRecordCount = this.customerSearchService.totalCount;
            this.p = this.customerSearchService.pageIndex;

            this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
            this.endItemNumber = ((this.p) * this.pageItemNumber);
            if (this.endItemNumber > this.totalRecordCount)
              this.endItemNumber = this.totalRecordCount;
          }
        }
      });
  }

  ngAfterViewInit() {
    this.route.queryParams
      .filter(params => params.fromSearch)
      .subscribe(params => {
        if (params.fromSearch) {

          this.isParamsPresent = true;
          if (this.customerSearchService.searchData) {
            this.advanceSearchchild.createForm.patchValue({

              'SerialNo': this.customerSearchService.searchData.TransponderNumber,
              'PlateNo': this.customerSearchService.searchData.VehicleNumber,
              'Fname': this.customerSearchService.searchData.FirstName,
              'Lastname': this.customerSearchService.searchData.LastName,
              'EmailAdd': this.customerSearchService.searchData.EmailAddress,
              'PhoneNo': this.customerSearchService.searchData.Phone,
              'Address': this.customerSearchService.searchData.Address,
            });
            let a = this;
            setTimeout(function () {
              a.materialscriptService.material();
            }, 1000);

            if (this.customerSearchService.searchData.AccountId > 0) {
              this.advanceSearchchild.createForm.controls['AccountNo'].setValue(this.customerSearchService.searchData.AccountId);
            }
            if (this.customerSearchService.searchData.CCSuffix > 0) {
              this.advanceSearchchild.createForm.controls['CCSuffix'].setValue(this.customerSearchService.searchData.CCSuffix);
            }
            this.advancedSearch(this.p, false);
          }
        }

      });
  }

  advancedSearch(pageNumber: number, isSearch: boolean) {
    if (this.advancedSearchForm.valid && this.advanceSearchchild.createForm.valid) {
      if (this.advanceSearchchild.createForm.controls['AccountNo'].value == "" &&
        this.advanceSearchchild.createForm.controls['SerialNo'].value == "" &&
        this.advanceSearchchild.createForm.controls['PlateNo'].value == "" &&
        this.advanceSearchchild.createForm.controls['Fname'].value == "" &&
        this.advanceSearchchild.createForm.controls['Lastname'].value == "" &&
        this.advanceSearchchild.createForm.controls['PhoneNo'].value == "" &&
        this.advanceSearchchild.createForm.controls['EmailAdd'].value == "" &&
        this.advanceSearchchild.createForm.controls['Address'].value == "" &&
        this.advanceSearchchild.createForm.controls['CCSuffix'].value == "" &&
        this.advancedSearchForm.controls['PreferredLanguage'].value == "" &&
        this.advancedSearchForm.controls['HearingImpairment'].value == "" &&
        this.advancedSearchForm.controls['FrequentCaller'].value == "" &&
        this.advancedSearchForm.controls['Supervisor'].value == "") {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Please fill at-least one field";
        this.msgTitle = 'Invalid search';
        this.profileResponse = <ICustomerProfileResponse[]>[];
        this.afterSearch = false;
        return;
      }
      else if (this.advanceSearchchild.createForm.controls['AccountNo'].value == null &&
        this.advanceSearchchild.createForm.controls['SerialNo'].value == null &&
        this.advanceSearchchild.createForm.controls['PlateNo'].value == null &&
        this.advanceSearchchild.createForm.controls['Fname'].value == null &&
        this.advanceSearchchild.createForm.controls['Lastname'].value == null &&
        this.advanceSearchchild.createForm.controls['PhoneNo'].value == null &&
        this.advanceSearchchild.createForm.controls['EmailAdd'].value == null &&
        this.advanceSearchchild.createForm.controls['Address'].value == null &&
        this.advanceSearchchild.createForm.controls['CCSuffix'].value == null &&
        this.advancedSearchForm.controls['PreferredLanguage'].value == null &&
        this.advancedSearchForm.controls['HearingImpairment'].value == null &&
        this.advancedSearchForm.controls['FrequentCaller'].value == null &&
        this.advancedSearchForm.controls['Supervisor'].value == null) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Please fill at-least one field";
        this.msgTitle = 'Invalid search';
        this.profileResponse = <ICustomerProfileResponse[]>[];
        this.afterSearch = false;
        return;
      }
      else {
        if (this.advanceSearchchild.createForm.controls['AccountNo'].value == "") {
          this.advancedSearchCustomer.AccountId = 0;
        }
        else {
          this.advancedSearchCustomer.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value;
        }
        this.advancedSearchCustomer.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
        this.advancedSearchCustomer.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
        this.advancedSearchCustomer.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
        this.advancedSearchCustomer.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
        this.advancedSearchCustomer.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
        this.advancedSearchCustomer.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;
        this.advancedSearchCustomer.Address = this.advanceSearchchild.createForm.controls['Address'].value;
        if (this.advanceSearchchild.createForm.controls['CCSuffix'].value == "" ||
          this.advanceSearchchild.createForm.controls['CCSuffix'].value == null) {
          this.advancedSearchCustomer.CCSuffix = -1;
        }
        else {
          this.advancedSearchCustomer.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value;
        }
        this.advancedSearchCustomer.PreferredLanguage = this.advancedSearchForm.controls['PreferredLanguage'].value;
        console.log(this.advancedSearchForm.controls['HearingImpairment'].value);
        if (this.advancedSearchForm.controls['HearingImpairment'].value == true) {
          this.advancedSearchCustomer.HearingImpairment = "1";
        }
        else {
          this.advancedSearchCustomer.HearingImpairment = "0";
        }
        if (this.advancedSearchForm.controls['FrequentCaller'].value == true) {
          this.advancedSearchCustomer.FrequentCaller = "1";
        }
        else {
          this.advancedSearchCustomer.FrequentCaller = "0";
        }
        if (this.advancedSearchForm.controls['Supervisor'].value == true) {
          this.advancedSearchCustomer.Supervisor = "1";
        }
        else {
          this.advancedSearchCustomer.Supervisor = "0";
        }
        this.advancedSearchCustomer.LoginId = this.context.customerContext.loginId;
        this.advancedSearchCustomer.LoggedUserID = this.context.customerContext.userId;
        this.advancedSearchCustomer.LoggedUserName = this.context.customerContext.userName;
        this.advancedSearchCustomer.IsSearchEventFired = true;
        this.advancedSearchCustomer.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.advancedSearchCustomer.PageIndex = <IPaging>{};
        this.advancedSearchCustomer.PageIndex.PageNumber = pageNumber;
        this.advancedSearchCustomer.PageIndex.PageSize = 10;
        this.advancedSearchCustomer.PageIndex.SortColumn = this.sortingColumn;
        this.advancedSearchCustomer.PageIndex.SortDir = this.sortingDirection == false ? 1 : 0;
        let userEvent = null;
        if (isSearch) {
          userEvent = this.userEvents();
          userEvent.ActionName = Actions[Actions.SEARCH];
        }
        this.customerSearchService.getAdvancedSearch(this.advancedSearchCustomer, userEvent).subscribe(res => {
          this.profileResponse = res;
          this.afterSearch = true;
          //result is one and it should be page 1.
          if (this.profileResponse.length == 1 && this.startItemNumber == 1) {
            if (isSearch) {
              this.viewButton(this.profileResponse[0]);
            }
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
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        });
      }
    }
  }

  advancedSearchReset() {
    this.advancedSearchForm.reset();
    this.customerSearchService.saveSearchData(null, null, 1);
    this.advanceSearchchild.createForm.reset();
    this.profileResponse = [];
    this.afterSearch = false;
  }

  viewButton(selectedRow) {
    this.selectedRowData = selectedRow;
    this.bindCustomerInfoBlock(selectedRow.AccountId)
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

  bindCustomerInfoBlock(longAccountId: number) {
    this.customerSearchService.bindCustomerInfoBlock(longAccountId).subscribe(respose => {
      if (respose)
        this.customerData = respose;
    },
      err => {
      },
      () => {
        if (this.customerData) {
          this.checkForBlockList(this.selectedRowData.AccountId);
        }
      }
    );
  }

  goToSummary() {
    var timeSpentId = 0;
    this.customerSearchService.InsertTimeSpentEvents(this.selectedRowData.AccountId, this.context.customerContext.userName).subscribe(res => {
      timeSpentId = res;
    },err=>{},()=>{
      this.customerContextResponse = <ICustomerContextResponse>{};
      if (this.customerData.ParentId > 0) {
        this.customerContextResponse.ChildCustomerId = this.selectedRowData.AccountId;
        this.customerContextResponse.ParentId = this.selectedRowData.ParentId;
      }
      else {
        this.customerContextResponse.ParentId = 0;
        this.customerContextResponse.ChildCustomerId = 0;
      }
      this.customerContextResponse.AccountId = this.selectedRowData.AccountId;
      this.customerContextResponse.UserName = this.selectedRowData.CreatedUser;
      this.customerContextResponse.AccountStatus = this.selectedRowData.AccountStatus;
      this.customerContextResponse.AccountSummaryUserActivity = true;
      this.customerContextResponse.AccountType = this.selectedRowData.AccountType;
      this.customerContextResponse.AdditionalContactUserId = this.customerData.ParentId > 0 ? this.selectedRowData.AccountId : this.selectedRowData.ParentId;
      this.customerContextResponse.IsTagRequired = this.customerData.IsTagRequired
      this.customerContextResponse.CustomerParentPlan = this.customerData.ParentPlanName;
      this.customerContextResponse.CustomerPlan = this.customerData.PlanName;
      this.customerContextResponse.IsSearched = true;
      this.customerContextResponse.IsSplitCustomer = false;
      this.customerContextResponse.RevenueCategory = this.customerData.RevenueCategory;
      this.customerContextResponse.isNavigateFromSearch = true;
      this.customerContextResponse.TimeSpentId = timeSpentId;
      this.customerContext.changeResponse(this.customerContextResponse);
      this.loginService.setCustomerContext(this.customerContextResponse);
      this.loginService.setViolatorContext(null);
      this.customerSearchService.saveSearchData(this.profileResponse, this.advancedSearchCustomer, this.p, this.totalRecordCount)
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ADVANCESEARCH];
      userEvents.ActionName = Actions[Actions.ACCOUNTSUMMARY];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.profileResponse[0].AccountId;
      userEvents.RoleId = parseInt(this.context.customerContext.roleID);
      userEvents.UserName = this.context.customerContext.userName;
      userEvents.LoginId = this.context.customerContext.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
      let link = ['/csc/customerdetails/account-summary'];
      this.router.navigate(link);
    });
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.ADVANCESEARCH];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }

  // setOutputFlag(e) {
  //   this.msgFlag = e.flag;
  //   this.msgType = e.type;
  // }

  setOutputFlag(e) {
    this.msgFlag = e;
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

  sortDirection(SortingColumn) {
    this.gridArrowAccountType = false;
    this.gridArrowCUSTOMERID = false;
    this.gridArrowFirstName = false;
    this.gridArrowLastName = false;
    this.gridArrowPhoneNumber = false;
    this.gridArrowEmailAddress = false;



    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "AccountType") {
      this.gridArrowAccountType = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "CUSTOMERID") {
      this.gridArrowCUSTOMERID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "FirstName") {
      this.gridArrowFirstName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "LastName") {
      this.gridArrowLastName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "PhoneNumber") {
      this.gridArrowPhoneNumber = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "EmailAddress") {
      this.gridArrowEmailAddress = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.advancedSearch(this.p, false);
  }
}
