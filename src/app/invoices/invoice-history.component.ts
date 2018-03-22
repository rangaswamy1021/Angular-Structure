import { Component, OnInit, Input } from '@angular/core';
import { InvoiceService } from './services/invoices.service';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { Router } from '@angular/router';
import { IInvoiceRequest } from './models/invoicesrequest';
@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss']
})
export class InvoiceHistoryComponent implements OnInit {

  @Input() invoiceId: number;
  invoiceResponse: any[];
  invoiceContextResponse: IInvoicesContextResponse = <IInvoicesContextResponse>{};
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  isVisibleViewLink: boolean;
  virtualPath: string;
  errorMessage: string;
  errorBlock: boolean;
  constructor(private invoiceService: InvoiceService, private invoiceContextService: InvoicesContextService, private router: Router) { }

  ngOnInit() {

  }

  ngOnChanges(): void {
    this.getVituralPath();
    this.isVisibleViewLink = false;
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    if (this.invoiceContextResponse != null) {

      this.invoiceRequest.AccountId = this.invoiceContextResponse.CustomerId;
      this.invoiceRequest.InvoiceNumber = this.invoiceContextResponse.InvoiceNumber;
      this.invoiceRequest.InvBatchId = this.invoiceContextResponse.InvBatchId;
      this.invoiceRequest.PlateNumber = this.invoiceContextResponse.PlateNumber;
      this.invoiceRequest.InvoiceStatus = this.invoiceContextResponse.invoiceStatus;
      this.invoiceRequest.InvStatus = this.invoiceContextResponse.InvStatus;
      this.invoiceRequest.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;


    }
    if ((this.invoiceRequest.InvStatus === 'Show')) {
      this.isVisibleViewLink = true;
    } else {
      this.isVisibleViewLink = false;
    }
    if (this.invoiceId > 0) {
      this.getInvoiceHistoryDetails(this.invoiceId);

    }

  }

  getInvoiceHistoryDetails(invoiceId: number) {
    this.invoiceService.getInvoiceHistory(invoiceId).subscribe(
      res => {
        this.invoiceResponse = res;
        console.log('history details');
        console.log(res);
      }
    );


  }
  goToView(invoiceObject: any) {
    let invoiceReq = <IInvoicesContextResponse>{};
    invoiceReq.InvoiceId = invoiceObject.InvoiceId;
    invoiceReq.InvStatus = invoiceObject.Status;
    invoiceReq.CustomerId = this.invoiceRequest.AccountId;
    invoiceReq.InvoiceNumber = this.invoiceRequest.InvoiceNumber;
    invoiceReq.InvBatchId = this.invoiceRequest.InvBatchId;
    invoiceReq.PlateNumber = this.invoiceRequest.PlateNumber;
    invoiceReq.invoiceStatus = this.invoiceContextResponse.invoiceStatus;
    invoiceReq.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;
    this.invoiceContextService.changeResponse(invoiceReq);
    if (invoiceReq.isBeforeSearch) {
      this.router.navigate(['/tvc/invoices/view-invoice-details']);
    }else {
        this.router.navigate(['/tvc/customerdetails/invoices/view-invoice-details']);
    }
  }
  downLoadFile(documentPath: string) {
    let strViewPath: string;
    if (documentPath !== '') {
    strViewPath = this.virtualPath + documentPath;
    window.open(strViewPath);
  }else {
      this.errorBlock = true;
      this.errorMessage = 'File not found';
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
}
