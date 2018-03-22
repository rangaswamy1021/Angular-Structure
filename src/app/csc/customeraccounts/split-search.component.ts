import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { Router } from "@angular/router";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { SessionService } from "../../shared/services/session.service";
import { SplitCustomerService } from "./services/splitcustomer.service";
import { ISearchCustomerRequest } from "../search/models/searchcustomerRequest";
import { AdvanceSearchComponent } from "../../shared/search/advance-search.component";
import { IPaging } from "../../shared/models/paging";
import { IProfileResponse } from "../search/models/ProfileResponse";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { ICSRRelationsRequest } from "../../shared/models/csrrelationsrequest";
import { CommonService } from "../../shared/services/common.service";
import { ISplitRequest } from "./models/splitrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-split-search',
  templateUrl: './split-search.component.html',
  styleUrls: ['./split-search.component.scss']
})
export class SplitSearchComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  totalRecordCount: any;
  viewButton: any;
  profileResponse: any;
  currentPage: number = 1;
  splitSearchCustomer: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  searchResponse: ICustomerResponse[] = <ICustomerResponse[]>{};
  afterSearch: boolean = false;
  dataLength: number
  pageItemNumber: number = 10;
  endItemNumber: number
  startItemNumber: number = 1;
  customerId: number
  accountStatus: string
  constructor(private splitService: SplitCustomerService, private router: Router, public renderer: Renderer,
    private commonService: CommonService, private customerContext: CustomerContextService, private context: SessionService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    if (this.context.customerContext == null) {
      let link = ['/login'];
      this.router.navigate(link);
    }
  }
  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  onCustomerSelected(customerid: number, accountStatus: string) {
    this.customerId = customerid;
    this.accountStatus = accountStatus;
  }
  splitSearch() {
    if (this.advanceSearchchild.createForm.valid) {
      //this.errorBlock = false;
      if (!this.advanceSearchchild.createForm.controls['AccountNo'].value &&
        !this.advanceSearchchild.createForm.controls['SerialNo'].value &&
        !this.advanceSearchchild.createForm.controls['PlateNo'].value &&
        !this.advanceSearchchild.createForm.controls['Fname'].value &&
        !this.advanceSearchchild.createForm.controls['Lastname'].value &&
        !this.advanceSearchchild.createForm.controls['PhoneNo'].value &&
        !this.advanceSearchchild.createForm.controls['EmailAdd'].value &&
        !this.advanceSearchchild.createForm.controls['Address'].value &&
        !this.advanceSearchchild.createForm.controls['CCSuffix'].value) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Enter atleast 1 field.";
        return;
      }
      else {
        if (this.advanceSearchchild.createForm.controls['AccountNo'].value == "") {
          this.splitSearchCustomer.AccountId = 0;
        }
        else {
          this.splitSearchCustomer.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value;
        }

        this.splitSearchCustomer.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
        this.splitSearchCustomer.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
        this.splitSearchCustomer.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
        this.splitSearchCustomer.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
        this.splitSearchCustomer.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
        this.splitSearchCustomer.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;
        this.splitSearchCustomer.Address = this.advanceSearchchild.createForm.controls['Address'].value;
        if (this.advanceSearchchild.createForm.controls['CCSuffix'].value == "" || this.advanceSearchchild.createForm.controls['CCSuffix'].value == null) {
          this.splitSearchCustomer.CCSuffix = -1;
        }
        else {
          this.splitSearchCustomer.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value;
        }

        this.splitSearchCustomer.LoginId = this.context.customerContext.loginId;
        this.splitSearchCustomer.LoggedUserID = this.context.customerContext.userId;
        this.splitSearchCustomer.LoggedUserName = this.context.customerContext.userName;
        this.splitSearchCustomer.IsSearchEventFired = true;
        this.splitSearchCustomer.ActivitySource = "Internal";

        this.splitSearchCustomer.PageIndex = <IPaging>{};
        this.splitSearchCustomer.PageIndex.PageNumber = 1;
        this.splitSearchCustomer.PageIndex.PageSize = 10000;
        this.splitSearchCustomer.PageIndex.SortColumn = "";
        this.splitSearchCustomer.PageIndex.SortDir = 1;

        // Checking Previleges 
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.context.customerContext.roleID);
        userEvents.UserName = this.context.customerContext.userName;
        userEvents.LoginId = this.context.customerContext.loginId;

        this.splitService.splitCustomerSearch(this.splitSearchCustomer, userEvents).subscribe(res => {
          this.searchResponse = res;
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
          if (this.searchResponse.length == 1) {
            this.customerId = this.searchResponse[0].AccountId;
            this.accountStatus = this.searchResponse[0].AccountStatus;
            this.onSplitClicked();
          }
          this.afterSearch = true;
          this.dataLength = this.searchResponse.length;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        });
      }
    }
  }

  onSplitClicked() {
    if (!(this.customerId > 0)) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select atleast one customer";
      return;
    }
    var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
    csrRelationReq.CustomerIds = this.customerId.toString();
    csrRelationReq.VehicleNumbers = "";
    csrRelationReq.TagIds = "";
    csrRelationReq.InternalUserId = this.context.customerContext.userId;

    this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Access Denied. You do not have privileges to access this account information";
        return;
      }
      var splitReq = null;
      this.splitService.changeResponse(splitReq);

      var customerContextResponse: ICustomerContextResponse = <ICustomerContextResponse>{};
      customerContextResponse.AccountId = this.customerId;
      customerContextResponse.IsSplitCustomer = true;
      customerContextResponse.AccountSummaryUserActivity = true;
      customerContextResponse.AccountStatus = this.accountStatus;
      this.customerContext.changeResponse(customerContextResponse);
      let link = ['/csc/customerdetails/account-summary'];
      this.router.navigate(link);
    })
  }

  splitSearchReset() {
    this.advanceSearchchild.createForm.reset();
    this.afterSearch = false;
  }

   setOutputFlag(e) {
    this.msgFlag = e.flag;
    this.msgType = e.type;
  }
}
