import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { IInvoiceRequest } from './models/invoicesrequest';
import { ISystemActivities } from '../shared/models/systemactivitiesrequest';
import { SessionService } from '../shared/services/session.service';
import { IUserresponse } from '../shared/models/userresponse';
import { InvoiceService } from './services/invoices.service';
import { IInvoiceResponse } from './models/invoicesresponse';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { ActivatedRoute, Router } from '@angular/router';
import { IFeeDetailsResponse } from './models/feedetailsresponse';
import { ITripsContextResponse } from '../shared/models/tripscontextresponse';
import { TripsContextService } from '../shared/services/trips.context.service';
import { IProfileResponse } from "../csc/search/models/ProfileResponse";
import { SubSystem, Features, Actions, defaultCulture } from "../shared/constants";
import { IUserEvents } from "../shared/models/userevents";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydatepicker";
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent implements OnInit {
  extendedDate: Date;
  invalidDate: boolean;
  isExtension: boolean;

  @Input() invoiceStatus: string; // = 'MostRecent';
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  accountId: number;
  invoiceId: number;
  isPayLinkVisible: boolean;
  isViewInvoice: boolean;
  documentPath: string;
  virtualPath: string;
  invoiceResponse: IInvoiceResponse = <IInvoiceResponse>{};
  profileResponse: IProfileResponse = <IProfileResponse>{};
  currentInvoiceResponse: IInvoiceResponse[] = <IInvoiceResponse[]>{};
  systemActivites: ISystemActivities;
  sessionConstextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  feeCount: number;
  tripCount: number;
  paymentCount: number;
  tripContext: ITripsContextResponse;
  successMessage: string;
  invoiceNum: string;
  bothSearch: number;
  private sub: any;
  isDefaultDate: boolean;
  isDownLoadLink: boolean;
  isPayLink: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  minDate = new Date();
  maxDate = new Date();
  myDatePickerOptions: ICalOptions
  dateModel: object = {};



  constructor(private invoiceService: InvoiceService, private cdr: ChangeDetectorRef, private customerService: CustomerAccountsService, private customerContext: CustomerContextService, private route: ActivatedRoute, private sessionContext: SessionService, private router: Router, private tripContextservice: TripsContextService) { }

  ngOnInit() {

    this.successMessage = '';
    this.isPayLinkVisible = false;
    this.route.queryParams.subscribe(params => {
      this.invoiceId = params['invoiceNo'];
      this.accountId = params['customerId'];
      this.invoiceNum = params['invoiceNum'];
      this.bothSearch = params['search'];
    });




    if (this.invoiceId > 0) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.INVOICESSEARCH];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
      userEvents.UserName = this.sessionContext.customerContext.userName;
      userEvents.LoginId = this.sessionContext.customerContext.loginId;
      this.viewInvoiceDetails(this.invoiceId, userEvents);
      this.getCustomerDetails(this.accountId);
    } else {

      this.customerContext.currentContext
        .subscribe(customerContext => {
          this.customerContextResponse = customerContext;
          if (this.customerContextResponse.AccountId > 0) {
            this.accountId = this.customerContextResponse.AccountId;
            this.sessionConstextResponse = this.sessionContext.customerContext;
            this.currentInvoiceDetails(this.accountId);
            this.getCustomerDetails(this.accountId);
          }
        }
        );
      this.tripContextservice.currentContext
        .subscribe(tripContext => {
          if (tripContext) {
            this.tripContext = tripContext;
            if (this.tripContext.successMessage && this.tripContext.successMessage.length > 0) {
              this.showSucsMsg(this.tripContext.successMessage);
            }
          }
        }
        );
    }
  }
  viewInvoiceDetails(invoiceId: number, userEvents: any) {
    this.isViewInvoice = true;
    this.invoiceRequest.PageSize = 10;
    this.invoiceRequest.PageNumber = 1;
    this.invoiceRequest.SortColumn = '';
    this.invoiceRequest.SortDirection = 1;
    this.invoiceRequest.InvoiceOption = this.invoiceStatus; //'MostRecent';
    this.invoiceRequest.InvoiceId = invoiceId;
    this.invoiceRequest.AccountId = this.accountId;
    this.invoiceRequest.SystemUserActivityInd = false;
    this.invoiceRequest.SubSystem = SubSystem[SubSystem.CSC];


    this.invoiceService.viewInvoiceDetails(this.invoiceRequest, userEvents).subscribe(
      res => {
        this.invoiceResponse = res;

      },
      err => {
      },
      () => {
        if (this.invoiceResponse.objFee.length) {
          this.feeCount = this.invoiceResponse.objFee[0].RecCount;
        }
        if (this.invoiceResponse.objPayments.length) {
          this.paymentCount = this.invoiceResponse.objPayments[0].TotalCount;
        }
        if (this.invoiceResponse.objTrips.length) {
          this.tripCount = this.invoiceResponse.objTrips[0].RecCount;
        }
        this.invoiceResponse.AmountPaid = this.invoiceResponse.AmountPaid < 0 ? (-1 * this.invoiceResponse.AmountPaid) : this.invoiceResponse.AmountPaid;
        if (this.invoiceResponse.StartDate.toDateString() === '01 / 01 / 1') {
          this.isDefaultDate = true;
        }

      }
    );

  }

  getCustomerDetails(accountId: number) {
    this.invoiceService.getCustomerDefaultDetails(this.accountId).subscribe(
      res => {
        this.profileResponse = res;
        console.log(res);
      }
    );

  }

  currentInvoiceDetails(accountId: number) {
    if (this.invoiceStatus === 'MostRecent') {
      this.isPayLinkVisible = true;
      this.isDownLoadLink = true;
      this.isPayLink = true;
    } else {
      this.isPayLinkVisible = false;
      this.isDownLoadLink = false;
      this.isPayLink = false;
    }
    this.invoiceRequest.PageSize = 10;
    this.invoiceRequest.PageNumber = 1;
    this.invoiceRequest.SortColumn = '';
    this.invoiceRequest.SortDirection = 1;
    this.invoiceRequest.InvoiceOption = this.invoiceStatus;
    this.invoiceRequest.AccountId = accountId;
    this.invoiceRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.invoiceRequest.SystemUserActivityInd = true;
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;
    this.invoiceRequest.SystemActivity = this.systemActivites;
    this.invoiceService.currentOrLastInvoiceDetails(this.invoiceRequest).subscribe(
      res => {
        this.invoiceResponse = res;

      },
      err => {
      },
      () => {

        if (this.invoiceStatus === 'MostRecent') {
          this.invoiceId = this.invoiceResponse.InvoiceId;
        }

        if (this.invoiceResponse.objFee !== null && this.invoiceResponse.objFee.length) {
          this.feeCount = this.invoiceResponse.objFee[0].RecCount;
        }
        if (this.invoiceResponse.objPayments !== null && this.invoiceResponse.objPayments.length) {
          this.paymentCount = this.invoiceResponse.objPayments[0].TotalCount;
        }
        if (this.invoiceResponse.objTrips !== null && this.invoiceResponse.objTrips.length) {
          this.tripCount = this.invoiceResponse.objTrips[0].RecCount;
        }
        this.invoiceResponse.AmountPaid = this.invoiceResponse.AmountPaid < 0 ? (-1 * this.invoiceResponse.AmountPaid) : this.invoiceResponse.AmountPaid;
        this.documentPath = this.invoiceResponse.DocumentPath;
        console.log(this.documentPath);
        let date = new Date(this.invoiceResponse.StartDate);
        let year = (date.getFullYear());
        if (year <= 1) {
          this.isDefaultDate = true;
          this.isPayLinkVisible = false;
        }
        if (this.documentPath === '') {
          this.isDownLoadLink = false;
        }
        if (this.invoiceResponse.AmountPaid <= 0) {
          this.isPayLink = false;
        }
        this.getVituralPath();
      }
    );

  }

  goToPayment() {

    const link = ['/csc/customerdetails/customer-makepayment'];
    this.router.navigate(link);

  }

  goToComplaint() {

    this.savingData();
    const link = ['/csc/helpdesk/create-complaint'];
    this.router.navigate(link);

  }
  downLoadFile() {
    let strViewPath: string;
    strViewPath = this.virtualPath + '/' + this.documentPath;

    window.open(strViewPath);

  }
  savingData() {
    this.tripContext = <ITripsContextResponse>{};
    this.tripContext.invoiceIDs = [];
    this.tripContext.invoiceIDs.push(this.invoiceId);
    this.tripContext.referenceURL = 'csc/invoices/invoice-summary';
    this.tripContextservice.changeResponse(this.tripContext);
  }
  getVituralPath() {
    this.invoiceService.getVirtualPath().subscribe(
      res => {
        this.virtualPath = res;
      }
    );

  }
  goToSearch() {
    if (this.bothSearch !== undefined) {
      this.router.navigate(['/csc/invoices/invoices-search'], { queryParams: { invoiceNo: this.invoiceId, accountNo: this.accountId, invoiceNum: this.invoiceNum, search: this.bothSearch } });
    } else {
      this.router.navigate(['/csc/invoices/invoice-summary'], { queryParams: { accountNo: this.accountId } });
    }
  }
  viewComplaint(prolemId: number) {
    let url = 'csc/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: prolemId } });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  dueDateExtension() {
    debugger;
    this.isExtension = true;
    this.invoiceRequest.InvoiceId = this.invoiceResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.invoiceResponse.CustomerId;
    this.minDate =new Date(this.invoiceResponse.DueDate);// new Date();
    this.invoiceService.getInvoiceNextScheduleDateDetails(this.invoiceRequest).subscribe(
      res => {
        this.maxDate = new Date(res);
        let maxdate=this.maxDate
        let currentDate = new Date()
        if (maxdate < currentDate ) {
        this.isExtension = false;
          this.showErrorMsg('Due date extension available period has been crossed');
        return;
      }
        // if (this.maxDate.toUTCString() < currentDate.toUTCString()) {
        //   this.isExtension = false;
        //   this.showErrorMsg('Due date extension available period has been crossed');
        //   return;
        // }
        this.dateModel = {
          date: {
            year: this.minDate.getFullYear(),
            month:this.minDate.getMonth() + 1,
            day: this.minDate.getDate()
          }
        };
        this.myDatePickerOptions = {
          dateFormat: 'mm/dd/yyyy',
          firstDayOfWeek: 'mo',
           disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 },
          disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
          sunHighlight: false,
          showClearBtn: false,
          showApplyBtn: false,
          showClearDateBtn: false, inline: false, alignSelectorRight: false, indicateInvalidDate: true
        };
      }
    );

  }
  cancel() {
    this.isExtension = false;
    this.invalidDate=false;

  }
  submit() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICESSEARCH];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId > 0 ? this.customerContextResponse.AccountId : 0;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.invoiceRequest.AccountId = this.accountId;
    this.invoiceRequest.InvoiceId = this.invoiceResponse.InvoiceId;
    this.invoiceRequest.OldInvoiceDueDate =  this.invoiceResponse.DueDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.invoiceRequest.InvoiceDueDate = this.extendedDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.invoiceRequest.UserName = this.sessionConstextResponse.userName;
    this.invoiceRequest.SubSystem = SubSystem[SubSystem.CSC];
    if(!this.invalidDate)
    this.invoiceService.UpdateCustomerInvoiceDueDate(this.invoiceRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.currentInvoiceDetails(this.accountId);
          this.showSucsMsg('Due date extended sucessfully.');
          this.isExtension = false;
          return;

        } else {
          this.showErrorMsg('Error while doing due date extension');
          this.isExtension = false;
          return;
        }
      }
    );
  }
  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    this.extendedDate=new Date(event.value);
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}
