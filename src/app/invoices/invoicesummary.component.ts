import { Component, OnInit } from '@angular/core';
import { IUserresponse } from '../shared/models/userresponse';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { IInvoiceResponse } from './models/invoicesresponse';
import { ISystemActivities } from '../shared/models/systemactivitiesrequest';
import { IInvoiceRequest } from './models/invoicesrequest';
import { InvoiceService } from './services/invoices.service';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { SessionService } from '../shared/services/session.service';
import { Router } from '@angular/router';
import { SubSystem, Features, Actions } from "../shared/constants";
import { IUserEvents } from "../shared/models/userevents";

@Component({
  selector: 'app-invoicesummary',
  templateUrl: './invoicesummary.component.html',
  styleUrls: ['./invoicesummary.component.scss']
})
export class InvoicesummaryComponent implements OnInit {

  invoiceResponse: IInvoiceResponse[] = <IInvoiceResponse[]>{};
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  accountId: number;
  systemActivites: ISystemActivities;
  sessionConstextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  isPrevious: boolean;
  isInvoiceDisplay: boolean;
  constructor(private invoiceService: InvoiceService, private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router) { }

  ngOnInit() {
    this.isInvoiceDisplay = false;
    this.customerContext.currentContext
      .subscribe(customerContext => {
        this.customerContextResponse = customerContext;
        if (this.customerContextResponse.AccountId > 0) {
          if ((this.customerContextResponse.AccountType != null && this.customerContextResponse.AccountType.toString().toUpperCase() === 'POSTPAID')) {
            this.isInvoiceDisplay = true;
            this.sessionConstextResponse = this.sessionContext.customerContext;
            this.accountId = this.customerContextResponse.AccountId;
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.INVOICESSEARCH];
            userEvents.ActionName = Actions[Actions.INVOICESUMMARY];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = this.customerContextResponse.AccountId ;
            userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
            userEvents.UserName = this.sessionConstextResponse.userName;
            userEvents.LoginId = this.sessionConstextResponse.loginId;
            this.previousInvoiceDetails(this.accountId, userEvents);
          }
        } else {

        }
      }
      );

  }

  previousInvoiceDetails(accountId: number, userEvents: any) {
    this.isPrevious = true;
    this.invoiceRequest.PageSize = 10;
    this.invoiceRequest.PageNumber = 1;
    this.invoiceRequest.SortColumn = '';
    this.invoiceRequest.SortDirection = 1;
    this.invoiceRequest.InvoiceOption = 'Previous';
    this.invoiceRequest.AccountId = accountId;
    this.invoiceRequest.SystemUserActivityInd = true;
    this.invoiceRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;

    this.invoiceRequest.SystemActivity = this.systemActivites;
    this.invoiceService.previousInvoiceDetails(this.invoiceRequest, userEvents).subscribe(
      res => {
        this.invoiceResponse = res;
        console.log('previous');
        console.log(res);
      }
    );

  }
  goToView(object: any) {
    // const link = ['/csc/invoices/invoice-details'];
    this.router.navigate(['csc/invoices/invoice-details'], { queryParams: { invoiceNo: object.InvoiceId, customerId: this.accountId } });
  }

  backToSummary() {
    const link = ['/csc/customerdetails/account-summary'];
    this.router.navigate(link);
  }



}
