import { Component, OnInit, Input } from '@angular/core';
import { InvoiceService } from './services/invoices.service';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { IInvoiceRequest } from './models/invoicesrequest';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-fees',
  templateUrl: './invoice-fees.component.html',
  styleUrls: ['./invoice-fees.component.scss']
})
export class InvoiceFeesComponent implements OnInit {

  constructor(private invoiceService: InvoiceService, private invoiceContextService: InvoicesContextService, private router: Router) { }
  invoiceResponse: any[];
  fp: number;
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  fpageItemNumber: number = 10;
  dataLength: number;
  fstartItemNumber: number = 1;
  fendItemNumber: number;
  ftotalRecordCount: number;
  searchRequest: IInvoiceRequest = <IInvoiceRequest>{};
  invoiceContextResponse: IInvoicesContextResponse;
  @Input() isFlagForBatch: boolean;
  isDisplay: boolean;
  isBeforeSearch:boolean;
  ngOnInit() {
    this.isDisplay = this.isFlagForBatch;
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.invoiceContextResponse.CustomerId;
    this.invoiceRequest.InvStatus = this.invoiceContextResponse.InvStatus;
    this.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;
    this.fp = 1;
    this.fendItemNumber = this.fpageItemNumber;
    this.getInvoiceFeeDetails(this.fp);
  }
  pageChanged(event) {
    this.fp = event;
    this.fstartItemNumber = (((this.fp) - 1) * this.fpageItemNumber) + 1;
    this.fendItemNumber = ((this.fp) * this.fpageItemNumber);
    if (this.fendItemNumber > this.ftotalRecordCount)
      this.fendItemNumber = this.ftotalRecordCount;
    this.getInvoiceFeeDetails(this.fp);
  }

  getInvoiceFeeDetails(pageNo: number) {

    this.searchRequest.InvoiceId = this.invoiceRequest.InvoiceId;
    this.searchRequest.InvStatus = this.invoiceRequest.InvStatus;
    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNo;
    this.searchRequest.SortColumn = '';
    this.searchRequest.SortDirection = 1;
    this.invoiceService.getFeeDetails(this.searchRequest).subscribe(
      res => {
        this.invoiceResponse = res;

        console.log(res);
      }
      ,
      err => {
      },
      () => {
        if (this.invoiceResponse.length) {
          this.ftotalRecordCount = this.invoiceResponse[0].RecCount;
          if (this.ftotalRecordCount < this.fpageItemNumber) {
            this.fendItemNumber = this.ftotalRecordCount;
          }
          console.log('Fee details');

        }

      }
    );


  }
  goToAdjustment() {
    let link;
    this.savingData();
    if (this.isBeforeSearch) {
      link = ['tvc/invoice-adjustments'];
    }
    else {
      link = ['tvc/violatordetails/invoice-adjustments'];
    }
    this.router.navigate(link);

  }
  savingData() {
    this.invoiceContextResponse = <IInvoicesContextResponse>{};
    this.invoiceContextResponse.invoiceIDs = [];
    this.invoiceContextResponse.invoiceIDs.push(this.invoiceRequest.InvoiceId);
    this.invoiceContextResponse.CustomerId = this.invoiceRequest.AccountId;
    this.invoiceContextResponse.InvoiceId = this.invoiceRequest.InvoiceId;
    this.invoiceContextResponse.isBeforeSearch = this.isBeforeSearch;
    if (this.invoiceContextResponse.isBeforeSearch) {
      this.invoiceContextResponse.referenceURL = 'tvc/invoices/batch-invoice-details';
    } else {
      this.invoiceContextResponse.referenceURL = 'tvc/customerdetails/invoices/batch-invoice-details';
    }
    this.invoiceContextService.changeResponse(this.invoiceContextResponse);
  }

}
