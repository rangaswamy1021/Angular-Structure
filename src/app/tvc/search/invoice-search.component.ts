import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IInvoiceSearchRequest } from '../../invoices/models/invoicesearchrequest';
import { IPaging } from '../../shared/models/paging';
import { IInvoiceSearchResponse } from '../../invoices/models/invoicesearchresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { InvoiceService } from '../../invoices/services/invoices.service';
import { CommonService } from '../../shared/services/common.service';

import { SessionService } from '../../shared/services/session.service';
import { InvoicesStatus, Features, Actions } from '../../shared/constants';
import { InvoicesContextService } from '../../shared/services/invoices.context.service';
import { IInvoicesContextResponse } from '../../shared/models/invoicescontextresponse';
import { Router, ActivatedRoute } from '@angular/router';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-invoice-search',
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.scss']
})
export class InvoiceSearchComponent implements OnInit {
  disputedInvoices: string;
  dismissedInvs: string;
  gridArrowINVOICESTATUS: boolean;
  gridArrowSTEPDESC: boolean;
  gridArrowINVOICENUMBER: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowDUEDATE: boolean;

  p: number;
  createForm: FormGroup;
  invoiceForm: FormGroup;
  constructor(private tripContextService: TripsContextService, private invoiceService: InvoiceService, private customerContext: CustomerContextService, private commonService: CommonService, private sessionContext: SessionService, private invoiceContextService: InvoicesContextService, private router: Router, private violatorContext: ViolatorContextService, private materialscriptService: MaterialscriptService) { }

  searchRequest: IInvoiceSearchRequest = <IInvoiceSearchRequest>{};
  searchResponse: IInvoiceSearchResponse[];
  systemActivites: ISystemActivities;
  paging: IPaging = <IPaging>{};
  sessionConstextResponse: IUserresponse;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  invoiceId: number;
  accountId: number;
  isVisible: boolean;
  selectInvoiceStatus = [];
  preInvoiceStatus: string;
  invoiceHistoryNo: number;
  isHistoryVisible: boolean;
  selectedInvoiceList: any[] = <any>[];
  isParentSelected: boolean;
  invoiceContextResponse: IInvoicesContextResponse = <IInvoicesContextResponse>{};
  virtualPath: string;
  isSearchFlag: boolean;
  isBeforeSearch: boolean;
  violatorContextResponse: IViolatorContextResponse;
  isPageLoad: boolean;
  isPaging: boolean;
  selectedInvoiceIds: any;
  invoiceResBack: any;
  longViolatorId: number;
  complaintCSV: string;
  tripContext: ITripsContextResponse;
  isRecentTxns: boolean;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  paymentPlanInvoices: string;

  ngOnInit() {
  
    this.materialscriptService.material();
    this.isPageLoad = true;
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.createForm = new FormGroup({
      'AccountNo': new FormControl('', []),
      'InvoiceNo': new FormControl('', []),
      'InvoiceRefNo': new FormControl('', []),
      'PlateNo': new FormControl('', []),
      'invoiceStatus': new FormControl('', []),


    });
    this.invoiceForm = new FormGroup({
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });
    this.getInvoiceStatus();
    this.preInvoiceStatus = '--select--';
    this.getVituralPath();
    this.sessionConstextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;

    this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
     if (this.violatorContextResponse) {
      this.longViolatorId = this.violatorContextResponse.accountId;
      this.createForm.controls['AccountNo'].setValidators([]);
      this.isSearchFlag = true;
      this.isBeforeSearch = false;
      this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
      if (this.invoiceContextResponse) {
        this.createForm.patchValue({
          AccountNo: this.invoiceContextResponse.CustomerId <= 0 ? '' : this.invoiceContextResponse.CustomerId,
          InvoiceNo: this.invoiceContextResponse.InvoiceNumber,
          InvoiceRefNo: this.invoiceContextResponse.InvBatchId,
          PlateNo: this.invoiceContextResponse.PlateNumber,
          invoiceStatus: this.invoiceContextResponse.invoiceStatus,
        });
        if (this.invoiceContextResponse.successMessage && this.invoiceContextResponse.successMessage.length > 0) {
          let successmsg = this.invoiceContextResponse.successMessage;
          this.showSucsMsg(successmsg);
        }
        this.selectedInvoiceIds = this.invoiceContextResponse.invoiceIDs;
        if (this.invoiceContextResponse.invoiceStatus !== '') {
          this.preInvoiceStatus = this.invoiceContextResponse.invoiceStatus.includes(',') ? '--select--' : this.invoiceContextResponse.invoiceStatus;
        }
        if (this.router.url.endsWith('customerdetails/search/invoices-search')) {
          this.invoiceContextService.changeResponse(null);
          this.tripContextService.changeResponse(null);
        }
      }
      userEvents.CustomerId = this.longViolatorId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

      });
      this.disableButton = !this.commonService.isAllowed(Features[Features.VIOLATORINVOICE], Actions[Actions.SEARCH], '');
      this.invoiceSearch(this.p, null);

    } else {

      if (this.router.url.endsWith('search/invoices-search')) {
        this.invoiceContextService.changeResponse(null);
        this.tripContextService.changeResponse(null);
      }
      this.createForm.controls['invoiceStatus'].setValidators([]);
      this.isBeforeSearch = true;
      this.isSearchFlag = false;
      this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
      if (this.invoiceContextResponse) {
        this.createForm.patchValue({
          AccountNo: this.invoiceContextResponse.CustomerId <= 0 ? '' : this.invoiceContextResponse.CustomerId,
          InvoiceNo: this.invoiceContextResponse.InvoiceNumber,
          InvoiceRefNo: this.invoiceContextResponse.InvBatchId,
          PlateNo: this.invoiceContextResponse.PlateNumber,
          invoiceStatus: this.invoiceContextResponse.invoiceStatus,
        });
        this.selectedInvoiceIds = this.invoiceContextResponse.invoiceIDs;
        userEvents.CustomerId = 0;
        this.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;

        this.invoiceSearch(this.p, null);
      }
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {
      });
      this.disableButton = !this.commonService.isAllowed(Features[Features.VIOLATORINVOICE], Actions[Actions.SEARCH], '');
    }

    this.tripContextService.currentContext.
      subscribe(res => {
        if (res != null) {
          if (res.successMessage && res.successMessage.length > 0) {
            this.showSucsMsg(res.successMessage);
          }
        }
      });

  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.invoiceSearch(this.p, null);
  }

  invoiceSearch(pageNumber: number, userEvents: any) {
    this.isHistoryVisible = false;
    if (this.createForm.controls['AccountNo'].value === null || this.createForm.controls['AccountNo'].value === '') {
      this.searchRequest.CustomerId = 0;
    } else {
      this.searchRequest.CustomerId = this.createForm.controls['AccountNo'].value; // 10258206;
    }

    if (this.createForm.controls['InvoiceNo'].value === null || this.createForm.controls['InvoiceNo'].value === '') {
      this.searchRequest.InvoiceNumber = '';
    } else {
      this.searchRequest.InvoiceNumber = this.createForm.controls['InvoiceNo'].value; // 1111;
    }

    if (this.createForm.controls['InvoiceRefNo'].value === null || this.createForm.controls['InvoiceRefNo'].value === '') {
      this.searchRequest.InvoiceBatchId = '';
    } else {
      this.searchRequest.InvoiceBatchId = this.createForm.controls['InvoiceRefNo'].value; // 1111;
    }

    if (this.createForm.controls['PlateNo'].value === null || this.createForm.controls['PlateNo'].value === '') {
      this.searchRequest.PlateNumber = '';
    } else {
      this.searchRequest.PlateNumber = this.createForm.controls['PlateNo'].value; // 1111;
    }

    if (this.createForm.controls['invoiceStatus'].value === null || this.createForm.controls['invoiceStatus'].value === '') {
      this.searchRequest.InvoiceStatus = '';
    } else {
      this.searchRequest.InvoiceStatus = this.createForm.controls['invoiceStatus'].value === '--select--' ? '' : this.createForm.controls['invoiceStatus'].value;
    }
    if (!this.isBeforeSearch) {
      if (this.isPageLoad && this.searchRequest.InvoiceStatus === '') {
        this.searchRequest.InvoiceStatus = InvoicesStatus[InvoicesStatus.INIT] + ',' + InvoicesStatus[InvoicesStatus.PARTIALPAID];
      } else {
        if (this.searchRequest.InvoiceStatus === '') {
          this.searchRequest.InvoiceStatus = InvoicesStatus[InvoicesStatus.INIT] + ',' + InvoicesStatus[InvoicesStatus.PARTIALPAID] + ',' + InvoicesStatus[InvoicesStatus.PAID] + ',' + InvoicesStatus[InvoicesStatus.TRANSFERRED] + ',' + InvoicesStatus[InvoicesStatus.WRITEOFF] + ',' + InvoicesStatus[InvoicesStatus.DISMISSREQUESTED] + ',' + InvoicesStatus[InvoicesStatus.DISMISSED];
        }
      }
    }
    else {
      if (this.searchRequest.InvoiceStatus === '') {
        this.searchRequest.InvoiceStatus = InvoicesStatus[InvoicesStatus.INIT] + ',' + InvoicesStatus[InvoicesStatus.PARTIALPAID] + ',' + InvoicesStatus[InvoicesStatus.PAID] + ',' + InvoicesStatus[InvoicesStatus.TRANSFERRED] + ',' + InvoicesStatus[InvoicesStatus.WRITEOFF] + ',' + InvoicesStatus[InvoicesStatus.DISMISSREQUESTED] + ',' + InvoicesStatus[InvoicesStatus.DISMISSED];;
      }
    }
    if (!this.isBeforeSearch) {
      this.searchRequest.CustomerId = this.violatorContextResponse.accountId;
    }

    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNumber;
    this.searchRequest.SortColumn = this.sortingColumn;
    this.searchRequest.SortDir = this.sortingDirection == true ? 1 : 0;
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;
    this.searchRequest.SystemActivity = this.systemActivites;
    this.searchRequest.IsCustomerInvoice = false;
    this.searchRequest.SearchActivityIndicator = true;
    this.searchRequest.Isviolator = true;
    this.invoiceService.invoiceSearchForViolator(this.searchRequest, userEvents).subscribe(res => {
      if (res) {
        this.searchResponse = res;
        if (this.searchResponse.length > 0) {
          if (this.searchResponse[0].RecCount > 10) {
            this.isPaging = true;
          }
          this.accountId = this.searchResponse[0].CustomerId;
          this.longViolatorId = this.searchResponse[0].CustomerId;
          this.isVisible = true;
          this.totalRecordCount = this.searchResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
          if (this.selectedInvoiceIds && this.selectedInvoiceIds.length) {
            for (let i = 0; i < this.selectedInvoiceIds.length; i++) {
              this.invoiceResBack = <any>{};
              this.invoiceResBack = this.searchResponse.find(x => x.InvoiceId === this.selectedInvoiceIds[i]);
              const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.invoiceResBack.InvoiceId);
              if (index === -1) {
                this.selectedInvoiceList.push(this.invoiceResBack);
              }
            }
          }
          for (let i = 0; i < this.searchResponse.length; i++) {
            if (this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.PAID] || this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
              this.searchResponse[i].isDisableInvoice = true;
            } else {
              this.searchResponse[i].isDisableInvoice = this.searchResponse[i].OutstandingDue <= 0 ? true : false;
            }
          }
          if (this.selectedInvoiceList && this.selectedInvoiceList.length > 0) {
            let count: number = 0;
            for (let i = 0; i < this.searchResponse.length; i++) {
              const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.searchResponse[i].InvoiceId);
              if (index > -1) {
                this.searchResponse[i].isInvoiceSelected = true;
                count++;
              } else {
                this.searchResponse[i].isInvoiceSelected = false;
              }
            }
            if (this.searchResponse.length === count) {
              this.isParentSelected = true;
            } else {
              this.isParentSelected = false;
            }
          }
        }
      }
    });
  }

  onSubmit(): void {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    userEvents.CustomerId = this.longViolatorId > 0 ? this.longViolatorId : 0;;
    this.isPageLoad = false;
    this.selectedInvoiceIds = [];
    this.selectedInvoiceList = [];
    this.searchRequest.InvoiceStatus = '';
    this.p = 1;
    this.startItemNumber = 1;
    if (this.isBeforeSearch) {
      if ((this.createForm.controls['AccountNo'].value !== '' &&
        this.createForm.controls['AccountNo'].value !== null && this.createForm.controls['AccountNo'].value !== undefined) ||
        (this.createForm.controls['InvoiceNo'].value !== '' &&
          this.createForm.controls['InvoiceNo'].value !== null && this.createForm.controls['InvoiceNo'].value !== undefined) || (this.createForm.controls['InvoiceRefNo'].value !== '' &&
            this.createForm.controls['InvoiceRefNo'].value !== null &&  this.createForm.controls['InvoiceRefNo'].value !== undefined) || (this.createForm.controls['PlateNo'].value !== '' &&
              this.createForm.controls['PlateNo'].value !== null && this.createForm.controls['PlateNo'].value !== undefined)) {

        this.invoiceSearch(this.p, userEvents);
      } else {

        this.showErrorMsg('At least 1 field is required');
        return;
      }
    }
    else {
      if ((this.createForm.controls['InvoiceNo'].value !== '' &&
        this.createForm.controls['InvoiceNo'].value !== null) || (this.createForm.controls['InvoiceRefNo'].value !== '' &&
          this.createForm.controls['InvoiceRefNo'].value !== null) || (this.createForm.controls['PlateNo'].value !== '' &&
            this.createForm.controls['PlateNo'].value !== null) || (this.createForm.controls['invoiceStatus'].value !== '--select--' &&
              this.createForm.controls['invoiceStatus'].value !== null)) {

        this.invoiceSearch(this.p, userEvents);
      } else {

        this.showErrorMsg('At least 1 field is required');
        return;
      }


    }

  }



  reset(): void {
    this.getInvoiceStatus();
    this.preInvoiceStatus = '--select--';
    this.isPageLoad = true;
    this.createForm.reset();
    this.isParentSelected = false;
    this.selectedInvoiceIds = [];
    this.selectedInvoiceList = [];
    this.isVisible = false;
    this.searchResponse = null;
    this.isHistoryVisible = false;
    this.isRecentTxns = false;
    this.invoiceContextService.changeResponse(null);
    if (!this.isBeforeSearch) {
      this.invoiceSearch(1, null);
    }
  }

  getInvoiceStatus() {
    this.commonService.getInvoiceStatusLookups().subscribe(res => {
      if (res) {
        this.selectInvoiceStatus = res;

      }
    });
  }
  goToView(invoiceNo: any) {
    this.tripContextService.changeResponse(null);
    this.isHistoryVisible = true;
    this.isRecentTxns = false;
    this.invoiceHistoryNo = invoiceNo;
    let invoiceReq = <IInvoicesContextResponse>{};
    invoiceReq.CustomerId = this.accountId;
    invoiceReq.InvoiceNumber = this.searchRequest.InvoiceNumber;
    invoiceReq.InvBatchId = this.searchRequest.InvoiceBatchId;
    invoiceReq.PlateNumber = this.searchRequest.PlateNumber;
    invoiceReq.invoiceStatus = this.searchRequest.InvoiceStatus;
    invoiceReq.isBeforeSearch = this.isBeforeSearch;
    invoiceReq.AccountId = this.accountId;
    invoiceReq.InvStatus = 'Show';
    //invoiceReq.invoiceIDs = invoiceObject.InvoiceId;
    this.invoiceContextService.changeResponse(invoiceReq);

  }
  goToBatchView(invoiceObject: any) {
    this.tripContextService.changeResponse(null);
    this.isHistoryVisible = false;
    this.isRecentTxns = false;
    let invoiceReq = <IInvoicesContextResponse>{};
    invoiceReq.InvoiceId = invoiceObject.InvoiceId;
    invoiceReq.CustomerId = this.accountId;
    invoiceReq.InvoiceNumber = this.searchRequest.InvoiceNumber;
    invoiceReq.InvBatchId = this.searchRequest.InvoiceBatchId;
    invoiceReq.PlateNumber = this.searchRequest.PlateNumber;
    invoiceReq.invoiceStatus = this.searchRequest.InvoiceStatus;
    invoiceReq.InvStatus = invoiceObject.Status;
    invoiceReq.isBeforeSearch = this.isBeforeSearch;
    invoiceReq.AccountId = this.accountId;
    this.invoiceContextService.changeResponse(invoiceReq);
    if (this.isBeforeSearch) {
      if (invoiceObject.Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || invoiceObject.Status === InvoicesStatus[InvoicesStatus.PAID] || invoiceObject.Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
        this.router.navigate(['/tvc/invoices/view-invoice-details']);
      } else {
        this.router.navigate(['/tvc/invoices/batch-invoice-details']);
      }
    } else {
      if (invoiceObject.Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || invoiceObject.Status === InvoicesStatus[InvoicesStatus.PAID] || invoiceObject.Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
        this.router.navigate(['/tvc/customerdetails/invoices/view-invoice-details']);
      } else {
        this.router.navigate(['/tvc/customerdetails/invoices/batch-invoice-details']);
      }

    }
  }

  checkboxCheckedEvent(object: any, event) {
    const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === object.InvoiceId);
    if (event.target.checked) {
      if (index === -1) {
        if (object.Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || object.Status === InvoicesStatus[InvoicesStatus.PAID] || object.Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
          object.isInvoiceSelected = false;
        }
        else {
          this.selectedInvoiceList.push(object);
          object.isInvoiceSelected = true;
        }
        const result = this.searchResponse.filter(x => x.isInvoiceSelected === true).length;
        if (result === this.searchResponse.length) {
          this.isParentSelected = true;
        }
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedInvoiceList.splice(index, 1);
        object.isInvoiceSelected = false;
      }
    }
    console.log(this.selectedInvoiceList);
  }


  checkAllClick(event) {
    for (let i = 0; i < this.searchResponse.length; i++) {
      const isChecked: boolean = event.target.checked;
      this.searchResponse[i].isInvoiceSelected = isChecked;
      const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.searchResponse[i].InvoiceId);
      if (index > -1 && !isChecked) {
        this.selectedInvoiceList = this.selectedInvoiceList.filter(item => item.InvoiceId !== this.searchResponse[i].InvoiceId);
        this.searchResponse[i].isInvoiceSelected = false;
      }
      else if (isChecked) {
        const indexes = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.searchResponse[i].InvoiceId);
        if (indexes === -1) {
          if (this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.PAID] || this.searchResponse[i].Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
            this.searchResponse[i].isInvoiceSelected = false;
            this.searchResponse[i].isDisableInvoice = true;
          } else {
            if (this.searchResponse[i].OutstandingDue > 0) {
              this.searchResponse[i].isInvoiceSelected = true;
              this.searchResponse[i].isDisableInvoice = false;
              this.selectedInvoiceList.push(this.searchResponse[i]);
            }
            else {
              this.searchResponse[i].isInvoiceSelected = false;
            }
          }
        }
      }
    }
  }

  downLoadFile(documentPath: string) {
    let strViewPath: string;
    if (documentPath !== '') {
      strViewPath = this.virtualPath + documentPath;
      window.open(strViewPath);
    } else {
      this.showErrorMsg('File not found');
      return;
    }


  }
  getVituralPath() {
    this.invoiceService.getVirtualPath().subscribe(
      res => {
        this.virtualPath = res;
      }
    );
  }

  paymentPlanCheck() {
    this.paymentPlanInvoices = '';
    for (var i = 0; i < this.selectedInvoiceList.length; i++) {
      if (this.selectedInvoiceList[i].AgingHoldType.toString().toUpperCase() == 'PAYMENTPLAN') {
        if (this.selectedInvoiceList[i].IsAgingHold)
          this.paymentPlanInvoices += this.selectedInvoiceList[i].InvoiceNumber + ',';
      }
    }
    return this.paymentPlanInvoices;
  }

  dismissCheck() {
    this.dismissedInvs = '';
    for (var i = 0; i < this.selectedInvoiceList.length; i++) {
      if (this.selectedInvoiceList[i].Status.toUpperCase() == 'DISMISSREQUESTED' || this.selectedInvoiceList[i].Status.toUpperCase() == 'DISMISSED') {
        this.dismissedInvs += this.selectedInvoiceList[i].InvoiceNumber + ',';
      }
    }
    return this.dismissedInvs;
  }

  disputeCheck() {
    this.disputedInvoices = '';
    for (var i = 0; i < this.selectedInvoiceList.length; i++) {
      if (this.selectedInvoiceList[i].IsDisputed)
        this.disputedInvoices += this.selectedInvoiceList[i].InvoiceNumber + ',';
    }
    return this.disputedInvoices;
  }

  makePayment() {
    this.savingData(true);
    if (!this.atleaseone()) {
      this.invoiceContextService.changeResponse(null);
      this.showErrorMsg('Select atleast one invoice');
    } else if (this.paymentPlanCheck() != '') {
      let errorMessage = 'Invoice(s) # ' + this.paymentPlanInvoices.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(errorMessage);
    } else {
      let link = ['tvc/paymentdetails/violation-payment'];
      this.router.navigate(link);
    }
  }
  submitInquiryClick() {
    this.tripContextService.changeResponse(null);
    if (!this.atleaseone()) {

      this.showErrorMsg('Select atleast one invoice');
    } else if (this.savingDataForComplaint() !== '') {

      this.showErrorMsg('Complaint(s) already created for Invoice (s) #  ' + this.complaintCSV.slice(0, -1));
    } else {

      let link = ['tvc/helpdesk/create-complaint'];
      this.router.navigate(link);
    }
  }
  viewComplaintDetailsClick(prolemId: number) {
    this.selectedInvoiceIds = [];
    this.selectedInvoiceList = [];
    this.savingData(false);
    let url = 'tvc/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: prolemId, url: this.router.url } });
  }
  savingDataForComplaint(): string {
    this.complaintCSV = '';
    this.tripContext = <ITripsContextResponse>{};
    this.tripContext.invoiceIDs = [];
    this.invoiceContextResponse = <IInvoicesContextResponse>{};
    this.invoiceContextResponse.invoiceIDs = [];
    if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
      for (let i = 0; i < this.selectedInvoiceList.length; i++) {
        if (this.selectedInvoiceList[i].isInvoiceSelected) {
          if (this.selectedInvoiceList[i].ProblemID > 0 && this.selectedInvoiceList[i].ProblemStatus !== 'CLOSED') {
            this.complaintCSV += this.selectedInvoiceList[i].InvoiceNumber + ',';
            continue;
          } else {
            this.invoiceContextResponse.invoiceIDs.push(this.selectedInvoiceList[i].InvoiceId);
            this.tripContext.invoiceIDs.push(this.selectedInvoiceList[i].InvoiceId);
          }
        }

      }
    }
    this.invoiceContextResponse.invoiceStatus = this.searchRequest.InvoiceStatus;
    this.invoiceContextResponse.CustomerId = this.searchRequest.CustomerId;
    this.invoiceContextResponse.PlateNumber = this.searchRequest.PlateNumber;
    this.invoiceContextResponse.InvoiceNumber = this.searchRequest.InvoiceNumber;
    this.invoiceContextResponse.InvBatchId = this.searchRequest.InvoiceBatchId;
    this.invoiceContextResponse.InvStatus = this.searchRequest.InvoiceStatus;
    this.invoiceContextResponse.AccountId = this.accountId;
    this.invoiceContextResponse.isBeforeSearch = this.isBeforeSearch;
    if (this.isBeforeSearch) {
      this.invoiceContextResponse.referenceURL = 'tvc/search/invoice-search';
      this.tripContext.referenceURL = 'tvc/search/invoice-search';
      this.tripContext.accountId = this.longViolatorId;
    } else {
      this.invoiceContextResponse.referenceURL = 'tvc/customerdetails/search/invoice-search';
      this.tripContext.referenceURL = 'tvc/customerdetails/search/invoice-search';
      this.tripContext.accountId = this.longViolatorId;
    }
    if (this.complaintCSV === '') {

      this.invoiceContextService.changeResponse(this.invoiceContextResponse);
      this.tripContextService.changeResponse(this.tripContext);
    }
    return this.complaintCSV;

  }
  goToAdjustment(invoice: any) {
    this.invoiceId = invoice.InvoiceId;
    let link;
    this.savingData(false);
    if (invoice.Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || invoice.Status === InvoicesStatus[InvoicesStatus.PAID] || invoice.Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
      return false;
    } else {
      if (this.isBeforeSearch) {
        link = ['tvc/invoice-adjustments'];
      } else {
        link = ['tvc/violatordetails/invoice-adjustments'];
      }
      this.router.navigate(link);
    }
  }

  atleaseone(): boolean {
    if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
      return true;
    } else {
      return false;
    }
  }

  savingData(isPayment: boolean) {
    this.tripContextService.changeResponse(null);
    this.invoiceContextResponse = <IInvoicesContextResponse>{};
    this.invoiceContextResponse.invoiceIDs = [];
    this.invoiceContextResponse.selectedInvoiceNumbers = [];
    if (isPayment) {
      if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
        for (let i = 0; i < this.selectedInvoiceList.length; i++) {
          if (this.selectedInvoiceList[i].isInvoiceSelected) {
            if (this.selectedInvoiceList[i].Status === InvoicesStatus[InvoicesStatus.TRANSFERRED] || this.selectedInvoiceList[i].Status === InvoicesStatus[InvoicesStatus.PAID] || this.selectedInvoiceList[i].Status === InvoicesStatus[InvoicesStatus.WRITEOFF]) {
              continue;
            }
            else {
              this.invoiceContextResponse.invoiceIDs.push(this.selectedInvoiceList[i].InvoiceId);
              this.invoiceContextResponse.selectedInvoiceNumbers.push(this.selectedInvoiceList[i].InvoiceNumber);
            }
          }
        }
      }
    } else
      this.invoiceContextResponse.invoiceIDs.push(this.invoiceId);
    this.invoiceContextResponse.PlateNumbersForDispute = [];
    if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
      for (let i = 0; i < this.selectedInvoiceList.length; i++) {
        var index = this.invoiceContextResponse.PlateNumbersForDispute.indexOf(this.selectedInvoiceList[i].PlateNumber);
        if (index == -1)
          this.invoiceContextResponse.PlateNumbersForDispute.push(this.selectedInvoiceList[i].PlateNumber);
      }
    }

    this.invoiceContextResponse.invoiceStatus = this.searchRequest.InvoiceStatus;
    this.invoiceContextResponse.CustomerId = this.searchRequest.CustomerId;
    this.invoiceContextResponse.PlateNumber = this.searchRequest.PlateNumber;
    this.invoiceContextResponse.InvoiceNumber = this.searchRequest.InvoiceNumber;
    this.invoiceContextResponse.InvBatchId = this.searchRequest.InvoiceBatchId;
    this.invoiceContextResponse.InvStatus = this.searchRequest.InvoiceStatus;
    this.invoiceContextResponse.AccountId = this.accountId;

    this.invoiceContextResponse.isBeforeSearch = this.isBeforeSearch;
    if (this.isBeforeSearch) {
      this.invoiceContextResponse.referenceURL = 'tvc/search/invoice-search';
    }
    else {
      this.invoiceContextResponse.referenceURL = 'tvc/customerdetails/search/invoice-search';
    }
    this.invoiceContextService.changeResponse(this.invoiceContextResponse);

  }
  exit() {
    this.invoiceContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);

  }
  back() {
    this.invoiceContextService.changeResponse(null);
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);

  }
  goToRecentTxns(invoiceId: number) {
    this.invoiceHistoryNo = invoiceId;
    this.isHistoryVisible = false;
    this.isRecentTxns = true;
    let invoiceReq = <IInvoicesContextResponse>{};
    invoiceReq.CustomerId = this.accountId;
    invoiceReq.InvoiceNumber = this.searchRequest.InvoiceNumber;
    invoiceReq.InvBatchId = this.searchRequest.InvoiceBatchId;
    invoiceReq.PlateNumber = this.searchRequest.PlateNumber;
    invoiceReq.invoiceStatus = this.searchRequest.InvoiceStatus;
    invoiceReq.isBeforeSearch = this.isBeforeSearch;
    invoiceReq.AccountId = this.accountId;
    invoiceReq.InvStatus = 'Show';
    invoiceReq.InvoiceId = invoiceId;
    this.invoiceContextService.changeResponse(invoiceReq);


  }

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

  submitDismiss() {
    this.tripContextService.changeResponse(null);
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one invoice');
    } else if (this.dismissCheck() != '') {
      let errorMessage = 'Invoice(s) # ' + this.dismissedInvs.slice(0, -1) + ' are already dismissed';
      this.showErrorMsg(errorMessage);
    } else {
      for (let i = 0; i < this.selectedInvoiceList.length; i++) {
        this.selectedInvoiceList[i].AccountId = this.longViolatorId;
        this.selectedInvoiceList[i].UserName = this.sessionConstextResponse.userName;
      }
      this.invoiceService.dismissInvoices(this.selectedInvoiceList).subscribe(res => {
        if (res) {
          this.showSucsMsg('Dismiss request has been submitted successfully');
          this.invoiceSearch(this.p, null);
        }
      }, (err) => {
        this.showErrorMsg('Error while submitting dismiss request');
      });
    }
  }

  submitDispute() {
    this.savingData(true);
    if (!this.atleaseone()) {
      this.invoiceContextService.changeResponse(null);
      this.showErrorMsg('Select atleast one invoice');
    } else if (this.paymentPlanCheck() != '') {
      let errorMessage = 'Invoice(s) # ' + this.paymentPlanInvoices.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(errorMessage);
    } else if (this.disputeCheck() != '') {
      let errorMessage = 'Invoice(s) # ' + this.disputedInvoices.slice(0, -1) + ' are already disputed';
      this.showErrorMsg(errorMessage);
    } else {
      let link = ['tvc/disputes/non-liability'];
      this.router.navigate(link);
    }
  }

  sortDirection(SortingColumn) {
    this.gridArrowDUEDATE = false;
    this.gridArrowINVOICENUMBER = false;
    this.gridArrowSTEPDESC = false;
    this.gridArrowINVOICESTATUS = false;
    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "DUEDATE") {
      this.gridArrowDUEDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "INVOICENUMBER") {
      this.gridArrowINVOICENUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "STEPDESC") {
      this.gridArrowSTEPDESC = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "INVOICESTATUS") {
      this.gridArrowINVOICESTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    this.invoiceSearch(this.p, null);
  }

}


