import { Component, OnInit, Input } from '@angular/core';
import { IInvoiceRequest } from './models/invoicesrequest';
import { IInvoiceResponse } from './models/invoicesresponse';
import { ISystemActivities } from '../shared/models/systemactivitiesrequest';
import { IUserresponse } from '../shared/models/userresponse';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { SessionService } from '../shared/services/session.service';
import { InvoiceService } from './services/invoices.service';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { IViolatorContextResponse } from '../shared/models/violatorcontextresponse';
import { ViolatorContextService } from '../shared/services/violator.context.service';
import { IProfileResponse } from "../csc/search/models/ProfileResponse";
import { IUserEvents } from "../shared/models/userevents";
import { Features, Actions } from "../shared/constants";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-view-invoice-details',
  templateUrl: './view-invoice-details.component.html',
  styleUrls: ['./view-invoice-details.component.scss']
})
export class ViewInvoiceDetailsComponent implements OnInit {


  invoiceStatus: string; // = 'MostRecent';
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  accountId: number;
  invoiceId: number;
  isPayLinkVisible: boolean;
  isViewInvoice: boolean;
  documentPath: string;
  virtualPath: string;
  outStandingAmount: number;
  invoiceResponse: IInvoiceResponse = <IInvoiceResponse>{};
  profileResponse: IProfileResponse = <IProfileResponse>{};
  currentInvoiceResponse: IInvoiceResponse[] = <IInvoiceResponse[]>{};
  systemActivites: ISystemActivities;
  sessionConstextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  invoiceContextResponse: IInvoicesContextResponse;
  isFlagForBatchInv: boolean;
  invoiceIdForHistory: number;
  invStatus: string;
  isBeforeSearch:boolean;
  violatorId: number = 0;
  private sub: any;
  violatorContextResponse: IViolatorContextResponse;

  constructor( private materialscriptService:MaterialscriptService,private invoiceService: InvoiceService, private customerService: CustomerAccountsService, private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router, private invoiceContextService: InvoicesContextService,private violatorContext: ViolatorContextService) { }

  ngOnInit() {


    this.isFlagForBatchInv = false;
     this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.isPayLinkVisible = false;
     if (this.violatorContextResponse) {
      this.violatorId = this.violatorContextResponse.accountId;
    }
    this.sessionConstextResponse = this.sessionContext.customerContext;
    this.customerContextResponse = this.customerContext.customerContext;
    this.accountId = this.invoiceContextResponse.CustomerId;
    this.invoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceStatus = this.invoiceContextResponse.invoiceStatus;
    this.invStatus = this.invoiceContextResponse.InvStatus;
    this.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;
      let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorId;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    // this.customerContextResponse.AccountId;
    this.getCustomerDetails(this.accountId, userEvents);
    this.getInvoiceDetails(this.invoiceId);
    this.getVituralPath();




  }
  getInvoiceDetails(invoiceId: number) {
    this.invoiceIdForHistory = invoiceId;
    this.isViewInvoice = true;
    this.invoiceRequest.PageSize = 10;
    this.invoiceRequest.PageNumber = 1;
    this.invoiceRequest.SortColumn = '';
    this.invoiceRequest.SortDirection = 1;
    this.invoiceRequest.InvoiceOption = this.invStatus;
    this.invoiceRequest.InvoiceId = this.invoiceId;
    this.invoiceRequest.AccountId = this.accountId;
    this.invoiceRequest.InvStatus = this.invStatus;
    this.invoiceRequest.SystemUserActivityInd = false;
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;
    this.invoiceRequest.SystemActivity = this.systemActivites;
    this.invoiceService.viewInvoiceDetails(this.invoiceRequest, null).subscribe(
      res => {
        this.invoiceResponse = res;
        console.log(res);
      }
    );

  }

  getCustomerDetails(accountId: number, userEvents: any) {
    this.invoiceService.getCustomerDefaultDetails(this.accountId, userEvents).subscribe(
      res => {
        this.profileResponse = res;
        console.log(res);
      }
    );

  }



  goToPayment() {

    const link = ['/helpdesk/complaintmanagement/create/'];
    this.router.navigate(link);

  }

  goToComplaint() {

    const link = ['csc/helpdesk/create-complaint'];
    this.router.navigate(link);

  }
  downLoadFile() {
    let strViewPath: string;
    strViewPath = this.virtualPath + '/' + this.documentPath;
    window.open(strViewPath);

  }
  getVituralPath() {
    this.invoiceService.getVirtualPath().subscribe(
      res => {
        this.virtualPath = res;
      }
    );

  }
  goToSearch() {
    // this.router.navigate(['/csc/search/invoice'], { queryParams: { invoiceNo: this.invoiceId , accountNo: this.accountId } });
  }
  backToSearch() {
    if (this.invoiceContextResponse.isBeforeSearch) {
      this.router.navigate(['/tvc/search/invoice-search']);
    } else {
      this.router.navigate(['/tvc/customerdetails/search/invoice-search']);
    }
let a=this;
   setTimeout(function() {
     a.materialscriptService.material();
   }, 100);
  }
  exit() {
    this.invoiceContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    if (!this.isBeforeSearch) {
    this.router.navigate(['tvc/search/violation-search']);
  } else {
    this.router.navigate(['/tvc/search/invoice-search']);
  }

  }

}
