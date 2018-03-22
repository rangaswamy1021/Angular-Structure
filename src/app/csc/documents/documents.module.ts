import { DocumentCustomerdetailsService } from './services/documents.customerdetails.service';
import { SessionService } from './../../shared/services/session.service';
import { DocumentdetailsService } from './services/documents.details.service';
import { SharedModule } from './../../shared/shared.module';
import { DocumentsService } from './services/documents.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeLinkDocumentComponent } from './de-link-document.component';
import { LinkDocumentComponent } from './link-document.component';
import { NgxPaginationModule } from "ngx-pagination/dist/ngx-pagination";
import { HttpModule } from "@angular/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ScannedDocumentComponent } from './scanned-document.component';
import { DocumentCustomerSearchComponent } from './document-customer-search.component';
import { ReceivedDocumentsComponent } from "./received-documents.component";
import { PopoverModule } from "ngx-bootstrap";
import { SentDocumentsComponent } from "./sent-documents.component";
import { KycDocumentsComponent } from './kyc-documents.component';
import { DocumentViolatorSearchComponent } from './document-violator-search.component';
import { CustomerdetailsModule } from '../customerdetails/customerdetails.module';
import { DocumentMessageService } from "./services/documents.message.service";

@NgModule({
  imports: [
    NgxPaginationModule, 
    CommonModule, 
    HttpModule, 
    FormsModule, 
    ReactiveFormsModule, 
    SharedModule,
    PopoverModule.forRoot(),
    CustomerdetailsModule
  ],
  declarations: [
    DeLinkDocumentComponent, 
    LinkDocumentComponent, 
    ScannedDocumentComponent, 
    DocumentCustomerSearchComponent, 
    ReceivedDocumentsComponent,
    SentDocumentsComponent,
    KycDocumentsComponent,
    DocumentViolatorSearchComponent
  ],
  exports: [
    ReceivedDocumentsComponent,
    SentDocumentsComponent    
  ],
  providers: [
    DocumentsService, 
    DocumentdetailsService,
    SessionService,
    DocumentCustomerdetailsService,
    DocumentMessageService    
  ]
})
export class DocumentsModule { }
