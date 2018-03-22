import { Component, OnInit, Input } from '@angular/core';
import { InvoiceService } from './services/invoices.service';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { IInvoiceRequest } from './models/invoicesrequest';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { FormGroup, FormControl } from '@angular/forms';
import { ITripsContextResponse } from '../shared/models/tripscontextresponse';
import { Router } from '@angular/router';
import { TripsContextService } from '../shared/services/trips.context.service';


@Component({
  selector: 'app-invoice-trips',
  templateUrl: './invoice-trips.component.html',
  styleUrls: ['./invoice-trips.component.scss']
})
export class InvoiceTripsComponent implements OnInit {
  constructor(private invoiceService: InvoiceService, private invoiceContextService: InvoicesContextService, private router: Router, private tripContextService: TripsContextService) { }
  invoiceResponse: any[];
  @Input() isFlagForBatch: boolean;
  tp: number;
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  tpageItemNumber: number = 10;
  dataLength: number;
  tstartItemNumber: number = 1;
  tendItemNumber: number;
  ttotalRecordCount: number;
  searchRequest: IInvoiceRequest = <IInvoiceRequest>{};
  invoiceContextResponse: IInvoicesContextResponse;
  tripContextResponse: ITripsContextResponse;
  isDisplay: boolean;
  selectedTripList: any[] = <any>[];
  isParentSelected: boolean;
  tripIds: any;
  tripResponse: any;
  invoiceForm: FormGroup;
  isBeforeSearch: boolean;
  outStandingAmount: number= 0;
  errorBlock: boolean;
  errorMessage: string;


  ngOnInit() {
    this.invoiceForm = new FormGroup({
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });
    this.isDisplay = this.isFlagForBatch;
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.invoiceContextResponse.CustomerId;
    this.invoiceRequest.InvStatus = this.invoiceContextResponse.InvStatus;
    this.invoiceRequest.InvoiceStatus = this.invoiceContextResponse.invoiceStatus;
    this.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;
    this.tp = 1;
    this.tendItemNumber = this.tpageItemNumber;
    this.getInvoiceTripDetails(this.tp);
  }
  pageChanged(event) {
    this.tp = event;
    this.tstartItemNumber = (((this.tp) - 1) * this.tpageItemNumber) + 1;
    this.tendItemNumber = ((this.tp) * this.tpageItemNumber);
    if (this.tendItemNumber > this.ttotalRecordCount)
      this.tendItemNumber = this.ttotalRecordCount;
    this.getInvoiceTripDetails(this.tp);
  }

  getInvoiceTripDetails(pageNo: number) {

    this.searchRequest.InvoiceId = this.invoiceRequest.InvoiceId;
    this.searchRequest.InvStatus = this.invoiceRequest.InvStatus;
    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNo;
    this.searchRequest.SortColumn = '';
    this.searchRequest.SortDirection = 1;
    this.invoiceService.getTripDetails(this.searchRequest).subscribe(
      res => {
        this.invoiceResponse = res;
      },
      err => {
      },
      () => {
        if (this.invoiceResponse.length > 0) {
          this.ttotalRecordCount = this.invoiceResponse[0].RecCount;
          if (this.ttotalRecordCount < this.tpageItemNumber) {
            this.tendItemNumber = this.ttotalRecordCount;
          }

          if (this.tripIds && this.tripIds.length) {
            for (let i = 0; i < this.tripIds.length; i++) {
              this.tripResponse = <any>{};
              this.tripResponse = this.invoiceResponse.find(x => x.CitationId === this.tripIds[i]);
              if (this.tripResponse) {
                let index = this.selectedTripList.findIndex(x => x.CitationId === this.tripResponse.CitationId);
                if (index === -1) {
                  this.selectedTripList.push(this.tripResponse);
                }
              }
            }
          }
          for (let i = 0; i < this.invoiceResponse.length; i++) {

              this.invoiceResponse[i].isDisableTrip = this.invoiceResponse[i].OutstandingAmount <= 0 ? true : false;

          }

          if (this.selectedTripList && this.selectedTripList.length > 0) {
            let count: number = 0;
            for (let i = 0; i < this.tripResponse.length; i++) {
              let index = this.selectedTripList.findIndex(x => x.CitationId === this.tripResponse[i].CitationId);
              if (index > -1) {
                this.tripResponse[i].istripSelected = true;
                count++;
              } else {
                this.tripResponse[i].istripSelected = false;
              }
            }
            if (this.tripResponse.length === count) {
              this.isParentSelected = true;
            } else {
              this.isParentSelected = false;
            }
          }
          console.log('trip details');
        }
      }

    );


  }
  checkboxCheckedEvent(object: any, event) {
    const index = this.selectedTripList.findIndex(x => x.CitationId === object.CitationId);
    if (event.target.checked) {
      if (index === -1) {
        this.selectedTripList.push(object);
        object.isTripSelected = true;
        const result = this.invoiceResponse.filter(x => x.isTripSelected === true).length;
        if (result === this.invoiceResponse.length) {
          this.isParentSelected = true;
        }
      } else {
        this.isParentSelected = false;
        if (index > -1) {
          this.selectedTripList.splice(index, 1);
          object.isTripSelected = false;
        }
      }

    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedTripList.splice(index, 1);
        object.istripSelected = false;
      }
    }
    console.log(this.selectedTripList);
  }


  checkAllClick(event) {
    for (let i = 0; i < this.invoiceResponse.length; i++) {
      const isChecked: boolean = event.target.checked;
      this.invoiceResponse[i].isTripSelected = isChecked;
      const index = this.selectedTripList.findIndex(x => x.CitationId === this.invoiceResponse[i].CitationId);
      if (index > -1 && !isChecked) {
        this.selectedTripList = this.selectedTripList.filter(item => item.CitationId !== this.invoiceResponse[i].CitationId);
        this.invoiceResponse[i].isTripSelected = false;
      }
      else if (isChecked) {
        const indexes = this.selectedTripList.findIndex(x => x.CitationId === this.invoiceResponse[i].CitationId);
        if (indexes === -1) {
        //   this.invoiceResponse[i].isTripSelected = true;
        //   this.invoiceResponse[i].isDisableTrip = false;
        //   this.selectedTripList.push(this.invoiceResponse[i]);
        //  else {
            if (this.invoiceResponse[i].OutstandingAmount > 0) {
              this.invoiceResponse[i].isTripSelected = true;
              this.invoiceResponse[i].isDisableTrip = false;
              this.selectedTripList.push(this.invoiceResponse[i]);
            }else {
              this.invoiceResponse[i].isTripSelected = false;
              this.invoiceResponse[i].isDisableTrip = true;
            }
          // }
        }
      }
      console.log(this.selectedTripList);
    }
  }
  goToAdjustment() {
    let link;
    this.savingData();
    if (!this.atleaseone()) {
      this.errorBlock = true;
      this.errorMessage = 'Select atleast one trip';
    } else if (this.isBeforeSearch) {
      link = ['tvc/violatordetails/trip-adjustments'];
    } else {
      link = ['tvc/violatordetails/trip-adjustments'];
    }
    this.router.navigate(link);

  }
  savingData() {
    this.tripContextResponse = <ITripsContextResponse>{};
    this.tripContextResponse.tripIDs = [];
    this.tripContextResponse.accountId = this.invoiceRequest.AccountId;
    this.tripContextResponse.isBeforeSearch = this.isBeforeSearch;
    this.tripContextResponse.isFromInvoiceSearch = true;
    // this.tripContextResponse.InvoiceId = this.invoiceRequest.InvoiceId;
    // this.tripContextResponse.InvStatus = this.invoiceRequest.InvStatus;
    // this.tripContextResponse.invoiceStatus = this.invoiceRequest.InvoiceStatus;

    for (let i = 0; i < this.selectedTripList.length; i++) {
      this.tripContextResponse.tripIDs.push(this.selectedTripList[i].CitationId);
      this.outStandingAmount = this.outStandingAmount + this.selectedTripList[i].OutstandingAmount;
    }
    if (this.invoiceContextResponse.isBeforeSearch) {
      this.tripContextResponse.referenceURL = 'tvc/invoices/batch-invoice-details';
    } else {
      this.tripContextResponse.referenceURL = 'tvc/customerdetails/invoices/batch-invoice-details';
    }
    this.tripContextResponse.selectedTripsOutstandingAmount = this.outStandingAmount;
    this.tripContextService.changeResponse(this.tripContextResponse);
  }
  atleaseone(): boolean {
    if (this.selectedTripList && this.selectedTripList.length) {
      return true;
    }
    else {
      return false;
    }

  }
  removeVal() {
    this.errorBlock = false;
    this.errorMessage = '';
  }
}
