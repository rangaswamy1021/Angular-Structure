import { Component, OnInit, Input } from '@angular/core';
import { InvoiceService } from './services/invoices.service';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { IInvoiceRequest } from './models/invoicesrequest';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';

@Component({
  selector: 'app-invoice-payments',
  templateUrl: './invoice-payments.component.html',
  styleUrls: ['./invoice-payments.component.scss']
})
export class InvoicePaymentsComponent implements OnInit {

  constructor(private invoiceService: InvoiceService, private invoiceContextService: InvoicesContextService) { }
  invoiceResponse: any[];
  pp: number;
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  ppageItemNumber: number = 10;
  dataLength: number;
  pstartItemNumber: number = 1;
  pendItemNumber: number;
  ptotalRecordCount: number;
  searchRequest: IInvoiceRequest = <IInvoiceRequest>{};
  invoiceContextResponse: IInvoicesContextResponse;

  ngOnInit() {
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.invoiceContextResponse.CustomerId;
    this.invoiceRequest.InvStatus = this.invoiceContextResponse.InvStatus;
    this.pp = 1;
    this.pendItemNumber = this.ppageItemNumber;
    this.getInvoicePaymentDetails(this.pp);
  }
  pageChanged(event) {
    this.pp = event;
    this.pstartItemNumber = (((this.pp) - 1) * this.ppageItemNumber) + 1;
    this.pendItemNumber = ((this.pp) * this.ppageItemNumber);
    if (this.pendItemNumber > this.ptotalRecordCount)
      this.pendItemNumber = this.ptotalRecordCount;
    this.getInvoicePaymentDetails(this.pp);
  }

  getInvoicePaymentDetails(pageNo: number) {

    this.searchRequest.InvoiceId = this.invoiceRequest.InvoiceId;
    this.searchRequest.InvStatus = this.invoiceRequest.InvStatus;
    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNo;
    this.searchRequest.SortColumn = '';
    this.searchRequest.SortDirection = 1;
    this.invoiceService.getPaymentDetails(this.searchRequest).subscribe(
      res => {
        this.invoiceResponse = res;

        console.log(res);
      },
      err => {
      },
      () => {
        if (this.invoiceResponse.length > 0) {
          this.ptotalRecordCount = this.invoiceResponse[0].TotalCount;
          if (this.ptotalRecordCount < this.ppageItemNumber) {
            this.pendItemNumber = this.ptotalRecordCount;
          }
          console.log('Payment details');
        }
      }
    );


  }

}
