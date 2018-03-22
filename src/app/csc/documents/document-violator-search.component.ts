import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IViolatorSearchRequest } from '../../tvc/search/models/violatorsearchrequest';
import { SessionService } from '../../shared/services/session.service';
import { LoginService } from '../../login/services/login.service';
import { ViolatorSearchContextService } from '../../tvc/search/services/violation-search-context.service';
import { Router } from '@angular/router';
import { IUserresponse } from '../../shared/models/userresponse';
import { CustomerAccountsService } from '../customeraccounts/services/customeraccounts.service';
import { IViolatorSearchResponse } from '../../tvc/search/models/violatorsearchresponse';
import { IdocumentCustomerDetailsResponse } from './models/documentcustomerdetails';
import { DocumentCustomerdetailsService } from './services/documents.customerdetails.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-document-violator-search',
  templateUrl: './document-violator-search.component.html',
  styleUrls: ['./document-violator-search.component.scss']
})
export class DocumentViolatorSearchComponent implements OnInit {

  constructor(private sessionContext: SessionService,    
    private customerAccountService: CustomerAccountsService,
    private router: Router,
    private documentCustomerDetailsService: DocumentCustomerdetailsService,
    private materialscriptService:MaterialscriptService  ) { 
    this.sessionContextResponse = this.sessionContext.customerContext;
    }

  violatorSearchForm: FormGroup;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = 10;
  totalRecordCount: number;
  errorMessage: string;
  errorBlock: boolean;
  errorHeading: string;
  sessionContextResponse: IUserresponse;
  violatorSearchResponse: IViolatorSearchResponse[];
  violatorSearchRequest: IViolatorSearchRequest = <IViolatorSearchRequest>{};
  objdocumentCustomerDetailsResponse: IdocumentCustomerDetailsResponse;

  ngOnInit() {
    this.materialscriptService.material();
    this.violatorSearchForm = new FormGroup({
      'InvoiceNo': new FormControl(''),
      'InvoiceRefNo': new FormControl(''),
      'TripNo': new FormControl(''),
      'AccountNo': new FormControl(''),
      'Fname': new FormControl(''),
      'Lastname': new FormControl(''),
      'PlateNo': new FormControl(''),
      'Address': new FormControl(''),
    });
  }


  onSubmit() {
    
     this.p = 1;
     this.pageItemNumber = 10;
     this.startItemNumber = 1;
     this.endItemNumber = 10;
     if (!this.noSearchParameter()) {
       if (this.violatorSearchForm.valid) {
         this.searchViolator(this.p);
        
        // this.violatorSearchContextService.changeResponse(this.violatorSearchContext);
       }
     }
     else {
       this.errorBlock = true;
       this.errorHeading = "Invalid search";
       this.errorMessage = "At least 1 field is required";
       return;
     }
   }

   noSearchParameter(): boolean {
    return (this.violatorSearchForm.controls['InvoiceNo'].value === null || this.violatorSearchForm.controls['InvoiceNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['InvoiceRefNo'].value === null || this.violatorSearchForm.controls['InvoiceRefNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['TripNo'].value === null || this.violatorSearchForm.controls['TripNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['AccountNo'].value === null || this.violatorSearchForm.controls['AccountNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['Fname'].value === null || this.violatorSearchForm.controls['Fname'].value.trim() === '')
      && (this.violatorSearchForm.controls['Lastname'].value === null || this.violatorSearchForm.controls['Lastname'].value.trim() === '')
      && (this.violatorSearchForm.controls['PlateNo'].value === null || this.violatorSearchForm.controls['PlateNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['Address'].value === null || this.violatorSearchForm.controls['Address'].value.trim() === '')
  }
 
   searchViolator(pageNumber: number) {
    // $('#pageloader').modal('show');
     this.violatorSearchRequest = <IViolatorSearchRequest>{};
     this.violatorSearchRequest.InvoiceNumber = this.violatorSearchForm.controls['InvoiceNo'].value;
     this.violatorSearchRequest.InvoiceBatchId = this.violatorSearchForm.controls['InvoiceRefNo'].value;
     this.violatorSearchRequest.TripId = this.violatorSearchForm.controls['TripNo'].value;
     this.violatorSearchRequest.ViolatorID = this.violatorSearchForm.controls['AccountNo'].value;
     this.violatorSearchRequest.ViolatorFirstName = this.violatorSearchForm.controls['Fname'].value;
     this.violatorSearchRequest.ViolatorSecondName = this.violatorSearchForm.controls['Lastname'].value;
     this.violatorSearchRequest.LicensePlate = this.violatorSearchForm.controls['PlateNo'].value;
     this.violatorSearchRequest.Address = this.violatorSearchForm.controls['Address'].value;
     this.violatorSearchRequest.Soundex = 0;
     this.violatorSearchRequest.IsViolation = true;
     this.violatorSearchRequest.PageSize = this.pageItemNumber;
     this.violatorSearchRequest.PageNumber = pageNumber;
     this.violatorSearchRequest.SortColumn = 'CUSTOMERID';
     this.violatorSearchRequest.SortDir = true;
     this.violatorSearchRequest.IsSearch = true;
     this.violatorSearchRequest.LoginId = this.sessionContextResponse.loginId;
     this.violatorSearchRequest.LoggedUserId = this.sessionContextResponse.userId;
     this.violatorSearchRequest.UserName = this.sessionContextResponse.userName;
 
     this.customerAccountService.getViolatorsBySearchRequest(this.violatorSearchRequest)
       .subscribe(res => {
         this.violatorSearchResponse = res;
         this.totalRecordCount = this.violatorSearchResponse[0].ReCount;
         if (this.endItemNumber > this.totalRecordCount) {
           this.endItemNumber = this.totalRecordCount;
         }
        // this.afterSearch = true;
        // $('#pageloader').modal('hide');
       },
       (err) => {
        // $('#pageloader').modal('hide');
       },
       () => {
        //  if (this.violatorSearchResponse && this.violatorSearchResponse.length > 0) {
        //    if (this.violatorSearchResponse.length == 1 && this.startItemNumber==1 && !this.violatorSearchContext.IsNavigatedFromAccountSummary)
        //      this.viewAccount(this.violatorSearchResponse[0]);
        //    this.totalRecordCount = this.violatorSearchResponse[0].ReCount;
        //    if (this.endItemNumber > this.totalRecordCount) {
        //      this.endItemNumber = this.totalRecordCount;
        //    }
        //  }
        //  this.violatorSearchContext.IsNavigatedFromAccountSummary =false;
        //  this.errorBlock = false;
       //  $('#pageloader').modal('hide');
       });
   }
 
   pageChanged(event) {
     this.p = event;
     this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
     this.endItemNumber = ((this.p) * this.pageItemNumber);
     if (this.endItemNumber > this.totalRecordCount)
       this.endItemNumber = this.totalRecordCount;
     this.searchViolator(this.p);
   }
 
   resetSearch() {
     this.violatorSearchForm.reset();
    // this.violatorSearchContextService.changeResponse(null);
     this.violatorSearchResponse = null;
     this.errorBlock = false;
     //this.afterSearch = false;
   }

    BackToLinkPage(): void {
    const link = ['/csc/documents/link-document/'];
    this.router.navigate(link);
  }

   ViewButton(selectedRow) {
    const link = ['/csc/documents/link-document/'];
    this.objdocumentCustomerDetailsResponse = <IdocumentCustomerDetailsResponse>{};
    this.objdocumentCustomerDetailsResponse.customerid = selectedRow.ViolatorID;
    this.objdocumentCustomerDetailsResponse.firstname = selectedRow.ViolatorFirstName;
    this.objdocumentCustomerDetailsResponse.lastname = selectedRow.ViolatorSecondName;
    this.objdocumentCustomerDetailsResponse.type = "Violator";
    this.documentCustomerDetailsService.changedDetails(this.objdocumentCustomerDetailsResponse);
    this.router.navigate(link);
    let rootSele = this;
        setTimeout(function () {
            rootSele.materialscriptService.material();
        }, 0)

  }

  

}
