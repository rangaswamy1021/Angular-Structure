import { IdocumentMessageResponse } from './models/documentmessageresponse';
import { DocumentMessageService } from './services/documents.message.service';
import { IdocumentCustomerDetailsResponse } from './models/documentcustomerdetails';
import { DocumentCustomerdetailsService } from './services/documents.customerdetails.service';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { CommonService } from './../../shared/services/common.service';
import { IdocumentDetailsResponse } from './models/documentdetails';
import { DocumentdetailsService } from './services/documents.details.service';
import { DocumentsService } from './services/documents.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IDocumentsRequest } from './models/documentsrequest';
import { Component, OnInit, Input, Renderer } from '@angular/core';
import { Router } from "@angular/router";
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SubSystem, ActivitySource, Features, Actions } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-link-document',
  templateUrl: './link-document.component.html',
  styleUrls: ['./link-document.component.scss']
})
export class LinkDocumentComponent implements OnInit {
  disableLinkButton: boolean;
  documentType: string;
  name: string;
  lastName: string;
  firstName: string;
  customerId: number;
  Documenttobelinked: string;
  errorMessage: any;
  // successMessage: any;
  selectedDocumentName: string;
  documentDetailsResponse: IdocumentDetailsResponse;
  linkDocumentForm: FormGroup;
  selectedDocumentType: string;
  selectedDocumentFolder: string;
  pdfPath: string;
  accountName: string;

  constructor(private router: Router, private documentsSerice: DocumentsService, public renderer: Renderer, private commonService: CommonService,
    private documentdetailsService: DocumentdetailsService, private customerContext: CustomerContextService, private context: SessionService,
    private objDocumentCustomerdetailsService: DocumentCustomerdetailsService, private objDocumentMessageService: DocumentMessageService, private materialscriptService:MaterialscriptService) { }


  linkDocumentsRequest: IDocumentsRequest = <IDocumentsRequest>{};
  objdocumentMessageResponse: IdocumentMessageResponse = <IdocumentMessageResponse>{};

  systemactivites: ISystemActivities = <ISystemActivities>{};
  ngOnInit() {
    this.materialscriptService.material();
    this.linkDocumentForm = new FormGroup({
      'documentType': new FormControl('', [Validators.required,]),
      'accountId': new FormControl('', [Validators.required, Validators.maxLength(15)]),
      'accountName': new FormControl('', ),
      'noticeNumber': new FormControl('', ),
      'keywords': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required])
    });
    this.disableLinkButton = !this.commonService.isAllowed(Features[Features.DOCUMENTS], Actions[Actions.LINK], "");
    let documentCustomerDetailsResponse: IdocumentCustomerDetailsResponse;
    this.objDocumentCustomerdetailsService.currentDetails.subscribe(objDocumentCustomerdetailsService => {
      documentCustomerDetailsResponse = objDocumentCustomerdetailsService;
    });

    if (documentCustomerDetailsResponse) {
      this.linkDocumentForm.controls["documentType"].setValue(documentCustomerDetailsResponse.type);
      this.documentType = documentCustomerDetailsResponse.type;
      this.linkDocumentForm.patchValue({
        documentType: this.documentType
      });
      this.linkDocumentForm.controls["accountId"].setValue(documentCustomerDetailsResponse.customerid);
      this.accountName = documentCustomerDetailsResponse.firstname + " " + documentCustomerDetailsResponse.lastname;
    }
    else {
      this.linkDocumentForm.patchValue({
        documentType: 'Customer'
      });
    }
    this.documentdetailsService.currentDetails.subscribe(documentdetailsService => {
      this.documentDetailsResponse = documentdetailsService
      this.selectedDocumentFolder = this.documentDetailsResponse.documentFolder;
      this.selectedDocumentName = this.documentDetailsResponse.documentName;

      this.commonService.getApplicationParameterValue(ApplicationParameterkey.ViewPath).subscribe(res => {
        this.Documenttobelinked = res;
        this.pdfPath = this.Documenttobelinked + "DocumentsToBeLinked/" + this.selectedDocumentFolder + "/" + this.selectedDocumentName;
      });
    });
  }

  searchButton() {

    // this.changedDetails.currentDetails = null;
    this.objDocumentCustomerdetailsService.changedDetails(null);
    let link;
    if (this.linkDocumentForm.controls['documentType'].value == 'Violator') {
      link = ['/csc/documents/document-violator-search'];
    }
    else {
      link = ['/csc/documents/document-customer-search'];

    }
    this.router.navigate(link);
  }

  cancelLinking() {

    if (this.documentDetailsResponse) {
      this.documentDetailsResponse.isComingFromPage = true;
      // this.documentdetailsService.changedDetails(this.documentDetailsResponse);
    }
    let link = ['/csc/documents/scanned-document'];
    this.router.navigate(link);
  }

  // close() {
  //   this.errorMessage = false;
  //   this.successMessage = false;
  // }

  documentTypeSelectionChange(selectedValue: string) {
    this.selectedDocumentType = selectedValue;
    this.objDocumentCustomerdetailsService.changedDetails(null);
    this.linkDocumentForm.controls['accountId'].setValue("");
    this.linkDocumentForm.controls['noticeNumber'].setValue("");
    this.linkDocumentForm.controls['keywords'].setValue("");
    this.linkDocumentForm.controls['description'].setValue("");
    this.accountName = '';
  };

  linkCustomerDocuments() {
    if (this.selectedDocumentType != "") {
      this.linkDocumentsRequest.documentType = this.linkDocumentForm.controls['documentType'].value;;
    }
    else if (this.selectedDocumentType == "" || this.selectedDocumentType === undefined || this.selectedDocumentType === null) {
      this.linkDocumentsRequest.documentType = this.selectedDocumentType;
    }
    else {
      this.linkDocumentsRequest.documentType = this.selectedDocumentType;
    }
    if (this.linkDocumentForm.valid) {
      this.errorMessage = '';
      this.linkDocumentsRequest.CustomerId = this.linkDocumentForm.controls['accountId'].value;
      this.linkDocumentsRequest.customerName = this.accountName;
      this.linkDocumentsRequest.NoticeNumber = this.linkDocumentForm.controls['noticeNumber'].value;
      this.linkDocumentsRequest.Keywords = this.linkDocumentForm.controls['keywords'].value;
      this.linkDocumentsRequest.description = this.linkDocumentForm.controls['description'].value;
      this.linkDocumentsRequest.CreatedUser = this.context.customerContext.userName;
      this.linkDocumentsRequest.documentFolder = this.selectedDocumentFolder;
      this.linkDocumentsRequest.documentName = this.selectedDocumentName;
      this.linkDocumentsRequest.role = this.context.customerContext.rolename;
      this.linkDocumentsRequest.LoginId = this.context.customerContext.loginId;
      this.linkDocumentsRequest.UserId = this.context.customerContext.userId;
      this.systemactivites.SubSystem = SubSystem.CSC.toString();
      this.systemactivites.ActivitySource = ActivitySource.Internal.toString();
      this.linkDocumentsRequest.SystemActivities = this.systemactivites;
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DOCUMENTS];
      userEvents.ActionName = Actions[Actions.LINK];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context.customerContext.roleID);
      userEvents.UserName = this.context.customerContext.userName;
      userEvents.LoginId = this.context.customerContext.loginId;
      this.documentsSerice.linkCustomerDocuments(this.linkDocumentsRequest, userEvents).subscribe(res => {
        if (res) {
          //this.successMessage = "Document has been linked successfully.";
          //this.navigateToScannerInterface();
          this.linkDocumentForm.reset();
          this.linkDocumentForm.controls['documentType'].setValue("");
          this.linkDocumentForm.controls['accountId'].setValue("");
          this.accountName = '';
          this.objdocumentMessageResponse.successMessage = "Document has been linked successfully.";
          this.objdocumentMessageResponse.failureMessage = "";
          this.objDocumentMessageService.changedDetails(this.objdocumentMessageResponse);
          console.log("documentMessageResponse", this.objdocumentMessageResponse);
          // this.objDocumentCustomerdetailsService.changedDetails(null);
          // this.documentdetailsService.changedDetails(null);
          this.navigateToScannerInterface();


        }
        else {
          // this.errorMessage = "Error while linking the document.";
          this.navigateToScannerInterface();
          this.linkDocumentForm.reset();
          this.linkDocumentForm.controls['documentType'].setValue("");
          this.linkDocumentForm.controls['accountId'].setValue("");
          this.accountName = '';
          this.objdocumentMessageResponse.failureMessage = "Error while linking the document.";
          this.objdocumentMessageResponse.successMessage = "";
          this.objDocumentMessageService.changedDetails(this.objdocumentMessageResponse);
          this.navigateToScannerInterface();
        }
      }, err => {
        //this.errorMessage = err.statusText;
        this.linkDocumentForm.reset();
        this.linkDocumentForm.controls['documentType'].setValue("");
        this.linkDocumentForm.controls['accountId'].setValue("");
        this.accountName = '';
        this.objdocumentMessageResponse.failureMessage = err.statusText;
        this.objdocumentMessageResponse.successMessage = "";
        this.objDocumentMessageService.changedDetails(this.objdocumentMessageResponse);
        this.navigateToScannerInterface();
      })
    }
    else {
      this.errorMessage = '';
      this.linkDocumentForm.controls["documentType"].markAsTouched({ onlySelf: true });
      this.linkDocumentForm.controls["accountId"].markAsTouched({ onlySelf: true });
      this.linkDocumentForm.controls["keywords"].markAsTouched({ onlySelf: true });
      this.linkDocumentForm.controls["description"].markAsTouched({ onlySelf: true });
      this.linkDocumentForm.controls["link"].disable({ onlySelf: true });
      this.errorMessage = "Enter all mandatory feilds.";
      this.navigateToScannerInterface();
    }
  }
  navigateToScannerInterface() {
    let link = ['/csc/documents/scanned-document'];
    this.router.navigate(link);
  }
}