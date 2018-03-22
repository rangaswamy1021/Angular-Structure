import { AdvanceCscSearchComponent } from './../search/advance-csc-search.component';
import { SessionService } from './../../shared/services/session.service';
import { IdocumentCustomerDetailsResponse } from './models/documentcustomerdetails';
import { DocumentCustomerdetailsService } from './services/documents.customerdetails.service';
import { CustomerContextService } from './../../shared/services/customer.context.service';
import { ICustomerContextResponse } from './../../shared/models/customercontextresponse';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ISearchCustomerRequest } from '../search/models/searchcustomerRequest';
import { IPaging } from '../../shared/models/paging';
import { ISearchCustomerResponse } from '../search/models/searchcustomerresponse';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { FormGroup, FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerAccountsService } from '../customeraccounts/services/customeraccounts.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-document-customer-search',
  templateUrl: './document-customer-search.component.html',
  styleUrls: ['./document-customer-search.component.scss']
})

export class DocumentCustomerSearchComponent implements OnInit {
  user: any;
  p: number = 1;
  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  createForm: FormGroup;
  name: string;
  accountId: string;
  firstName: string;
  lastName: string;
  searchRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  searchInRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  searchResponse: ISearchCustomerResponse[];
  Paging: IPaging = <IPaging>{};
  constructor(private customerAccountService: CustomerAccountsService,private materialscriptService: MaterialscriptService, private router: Router, private customerContext: CustomerContextService, private documentCustomerDetailsService: DocumentCustomerdetailsService, private context: SessionService) {
  }
  errorBlock: boolean;
  errorHeading: string;
  errorMessage: string;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  customerContextResponse: ICustomerContextResponse;
  objdocumentCustomerDetailsResponse: IdocumentCustomerDetailsResponse;


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  ngOnInit() {
    this.materialscriptService.material();
    this.errorBlock = false;
  }

  Search() {

    if (this.advanceSearchchild.createForm.controls['AccountNo'].value === null || this.advanceSearchchild.createForm.controls['AccountNo'].value === '') {
      this.searchRequest.AccountId = 0;
    } else {
      this.searchRequest.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value; // 10258206;
    }
    if (this.advanceSearchchild.createForm.controls['CCSuffix'].value === null || this.advanceSearchchild.createForm.controls['CCSuffix'].value === '') {
      this.searchRequest.CCSuffix = -1;
    } else {
      this.searchRequest.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value; // 1111;
    }
    this.searchRequest.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
    this.searchRequest.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
    this.searchRequest.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
    this.searchRequest.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
    this.searchRequest.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
    this.searchRequest.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;

    this.searchRequest.Address = this.advanceSearchchild.createForm.controls['Address'].value;
    this.searchRequest.ActivitySource = 'Internal';
    this.searchRequest.LoginId = this.context.customerContext.loginId;
    this.searchRequest.LoggedUserID = this.context.customerContext.userId;
    this.Paging.PageSize = 1000;
    this.Paging.PageNumber = 1;
    this.Paging.SortColumn = 'CUSTOMERID';
    this.Paging.SortDir = 1;
    this.searchRequest.PageIndex = this.Paging;
    this.customerAccountService.getAdvancedSearch(this.searchRequest).subscribe(res => {
      if (res) {
        this.searchResponse = res;
        this.dataLength = this.searchResponse.length;
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength;
        } else {
          this.endItemNumber = this.pageItemNumber;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.advanceSearchchild.createForm.valid) {
      this.errorBlock = false;
      if ((this.advanceSearchchild.createForm.controls['AccountNo'].value !== '' &&
        this.advanceSearchchild.createForm.controls['AccountNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['SerialNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['SerialNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PlateNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PlateNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Fname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Fname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Lastname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Lastname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PhoneNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PhoneNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['EmailAdd'].value !== '' &&
          this.advanceSearchchild.createForm.controls['EmailAdd'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Address'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Address'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['CCSuffix'].value !== '' &&
          this.advanceSearchchild.createForm.controls['CCSuffix'].value !== null)) {

        this.Search();
      } else {
        this.errorBlock = true;
        this.errorHeading = 'Invalid search';
        this.errorMessage = 'At least 1 field is required';
        return;
      }
    }
  }

  Reset(): void {
    this.advanceSearchchild.createForm.reset();
    this.searchResponse = null;
    this.errorBlock = false;
  }

  BackToLinkPage(): void {
    const link = ['/csc/documents/link-document/'];
    this.router.navigate(link);
  }

  ViewButton(selectedRow) {
    const link = ['/csc/documents/link-document/'];
    this.objdocumentCustomerDetailsResponse = <IdocumentCustomerDetailsResponse>{};
    this.objdocumentCustomerDetailsResponse.customerid = selectedRow.AccountId;
    this.objdocumentCustomerDetailsResponse.firstname = selectedRow.FirstName;
    this.objdocumentCustomerDetailsResponse.lastname = selectedRow.LastName;
    this.objdocumentCustomerDetailsResponse.type = "Customer";
    this.documentCustomerDetailsService.changedDetails(this.objdocumentCustomerDetailsResponse);
    this.router.navigate(link);
    let rootSele = this;
        setTimeout(function () {
            rootSele.materialscriptService.material();
        }, 0)


  }
}



