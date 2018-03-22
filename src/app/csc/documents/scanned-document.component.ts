import { IdocumentMessageResponse } from './models/documentmessageresponse';
import { DocumentMessageService } from './services/documents.message.service';
import { DocumentCustomerdetailsService } from './services/documents.customerdetails.service';
import { IdocumentCustomerDetailsResponse } from './models/documentcustomerdetails';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { CommonService } from './../../shared/services/common.service';
import { DocumentsModule } from './documents.module';
import { IdocumentDetailsResponse } from './models/documentdetails';
import { DocumentdetailsService } from './services/documents.details.service';
import { Router } from '@angular/router';
import { IScannedDocumentsResponse } from './models/scanneddocumentsresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DocumentsService } from "./services/documents.service";
import { DocumentTypes } from "./constants";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-scanned-document',
  templateUrl: './scanned-document.component.html',
  styleUrls: ['./scanned-document.component.scss']
})
export class ScannedDocumentComponent implements OnInit {
  msgDesc: any;
  msgFlag: boolean;
  msgType: string;
  disableLinkButton: boolean;
  disableViewButton: boolean;
  noDataToDisplay: boolean;
  // successMessage: any;
  errorMessage: any;
  failureMessage: string;
  // successsMessage: string;
  // errorBlock: boolean;
  // successBlock: boolean;
  selectedFolder: string;
  pdfPath: string;
  Documenttobelinked: string;
  selectedDocumentFolder: string;
  scannedDocumentTypes = [];
  scannedDocumentForm: FormGroup;
  documentsResponse: IdocumentDetailsResponse;
  documentCustomerDetailsResponse: IdocumentCustomerDetailsResponse;
  constructor(private documentService: DocumentsService, private router: Router,
    private documentDetailsService: DocumentdetailsService, private commonService: CommonService,
    private documentCustomerDetailsService: DocumentCustomerdetailsService, private objDocumentMessageService: DocumentMessageService, private context: SessionService,private materialscriptService:MaterialscriptService) { }
  scannedDocumentsResponse: IScannedDocumentsResponse[] = <IScannedDocumentsResponse[]>[];
  p: number;
  pageItemNumber: number = 10;
  totalRecordCount: number;//= this.scannedDocumentsResponse.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  documentDetailsResponse: IdocumentDetailsResponse;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
  }
  ngOnInit() {
    this.materialscriptService.material();
    this.scannedDocumentForm = new FormGroup({
      'DocumentFolder': new FormControl('', Validators.required)
    });


    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DOCUMENTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context.customerContext.roleID);
    userEvents.UserName = this.context.customerContext.userName;
    userEvents.LoginId = this.context.customerContext.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableViewButton = !this.commonService.isAllowed(Features[Features.DOCUMENTS], Actions[Actions.SCAN], "");
    this.disableLinkButton = !this.commonService.isAllowed(Features[Features.DOCUMENTS], Actions[Actions.LINK], "");

    this.noDataToDisplay = false;
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    let objdocumentMessageResponse: IdocumentMessageResponse;
    this.objDocumentMessageService.currentDetails.subscribe(objDocumentMessageService => {
      objdocumentMessageResponse = objDocumentMessageService;
    });

    if (objdocumentMessageResponse) {
      if (objdocumentMessageResponse.successMessage != "") {
        // this.successBlock = true;
        // this.errorBlock = false;
        // this.successsMessage = objdocumentMessageResponse.successMessage;
        this.successMessageBlock(objdocumentMessageResponse.successMessage);
        this.objDocumentMessageService.changedDetails(null);
      }
      else {
        // this.errorBlock = true;
        // this.successBlock = false;
        // this.errorMessage = objdocumentMessageResponse.failureMessage;
        this.errorMessageBlock(objdocumentMessageResponse.failureMessage);
        this.objDocumentMessageService.changedDetails(null);
      }
    }

    //For dropdown binding
    this.documentService.getDocumentTypes().subscribe(
      res => {
        for (let key in res) {
          if ((key == DocumentTypes[DocumentTypes.Emailed]) || (key == DocumentTypes[DocumentTypes.Written]) || (key == DocumentTypes[DocumentTypes.Printed]) || (key == DocumentTypes[DocumentTypes.Delinked]) || (key == DocumentTypes[DocumentTypes.Typed]))
            this.scannedDocumentTypes.push(key);
        }
      }, (err) => { }
      , () => {
        if (this.scannedDocumentTypes.length > 0) {
          this.documentDetailsService.currentDetails.subscribe(documentdetailsService => {
            if (documentdetailsService && documentdetailsService.isComingFromPage) {
              this.documentDetailsResponse = documentdetailsService
              this.selectedDocumentFolder = this.documentDetailsResponse.documentFolder;
              documentdetailsService.isComingFromPage = false;
              //this.documentDetailsService.changedDetails()
              this.scannedDocumentForm.patchValue({ DocumentFolder: this.selectedDocumentFolder });
              // this.selectedFolder=this.selectedDocumentFolder;
              //this.scannedDocumentForm.controls["DocumentFolder"].setValue(this.selectedDocumentFolder);
              this.getDocumentdetails();
            }
          })
        }
      }
    )
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ViewPath).subscribe(res => {
      this.Documenttobelinked = res;
      this.Documenttobelinked = this.Documenttobelinked + "DocumentsToBeLinked/";
    });
  }
  // To bind the grid
  getDocumentdetails() {
    if (this.scannedDocumentForm.valid) {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DOCUMENTS];
      userEvents.ActionName = Actions[Actions.SCAN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context.customerContext.roleID);
      userEvents.UserName = this.context.customerContext.userName;
      userEvents.LoginId = this.context.customerContext.loginId;
      this.documentService.getFileNames(this.scannedDocumentForm.get('DocumentFolder').value, userEvents).subscribe(
        res => {
          this.scannedDocumentsResponse = res;
          if (this.scannedDocumentsResponse && this.scannedDocumentsResponse.length > 0) {
            this.noDataToDisplay = false;
            this.totalRecordCount = this.scannedDocumentsResponse.length;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          } else {
            this.noDataToDisplay = true;
          }
          // if (this.totalRecordCount < this.pageItemNumber) {
          //   this.endItemNumber = this.totalRecordCount
          // }
          // else {
          //   this.endItemNumber = this.pageItemNumber;
          // }
        });
    } else {
      this.scannedDocumentForm.controls["DocumentFolder"].markAsTouched({ onlySelf: true });
      this.noDataToDisplay = false;
    }
  }
  documentdetailsReset() {
    this.scannedDocumentForm.reset();
    this.scannedDocumentForm.controls["DocumentFolder"].setValue("");
    this.documentsResponse = null;
    this.noDataToDisplay = false;
    this.scannedDocumentsResponse.length = 0;
    // this.getDocumentdetails();
  }
  documentFolderSelectionChange(documentFolder: string) {
    this.selectedDocumentFolder = documentFolder;
  }

  ViewButton(SelectedRow: IScannedDocumentsResponse) {
    let link = ['/csc/documents/link-document'];
    this.router.navigate(link);
    this.documentsResponse = <IdocumentDetailsResponse>{};
    this.documentsResponse.documentName = SelectedRow.Filename;
    this.documentsResponse.documentFolder = this.selectedDocumentFolder;
    this.documentDetailsService.changedDetails(this.documentsResponse);
    this.documentCustomerDetailsService.changedDetails(this.documentCustomerDetailsResponse);
  }

  // close() {
  //   this.errorBlock = false;
  //   this.successBlock = false;
  // }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }

  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }

  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }

}
