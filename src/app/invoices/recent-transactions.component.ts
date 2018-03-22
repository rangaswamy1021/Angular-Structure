import { Component, OnInit, Input } from '@angular/core';
import { InvoiceService } from './services/invoices.service';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { IInvoiceRequest } from './models/invoicesrequest';
import { InvoicesContextService } from '../shared/services/invoices.context.service';

@Component({
  selector: 'app-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.scss']
})
export class RecentTransactionsComponent implements OnInit {
  constructor(private invoiceService: InvoiceService, private invoiceContextService: InvoicesContextService) { }
  invoiceResponse: any[];
  @Input() invoiceId: number;
  p: number;
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  searchRequest: IInvoiceRequest = <IInvoiceRequest>{};
  invoiceContextResponse: IInvoicesContextResponse;

  ngOnInit() {

  }
  ngOnChanges(): void {
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.invoiceContextResponse.CustomerId;
    this.invoiceRequest.InvStatus = this.invoiceContextResponse.InvStatus;
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.getInvoiceRecentDetails(this.p);

  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.invoiceId > 0) {
      this.getInvoiceRecentDetails(this.p);
    }
  }

  getInvoiceRecentDetails(pageNo: number) {

    this.searchRequest.InvoiceId = this.invoiceRequest.InvoiceId;
    this.searchRequest.InvStatus = this.invoiceRequest.InvStatus;
    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNo;
    this.searchRequest.SortColumn = '';
    this.searchRequest.SortDirection = 1;
    this.invoiceService.getRecentTransactions(this.searchRequest).subscribe(
      res => {
        this.invoiceResponse = res;

      },
      err => {
      },
      () => {
        if (this.invoiceResponse.length) {
          this.totalRecordCount = this.invoiceResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
          console.log('recent transaction details');
        }
      }
    );


  }

}
