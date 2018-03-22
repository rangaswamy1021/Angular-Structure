import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { IScannedDocumentsResponse } from './models/scanneddocumentsresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';


import { DocumentsService } from "./services/documents.service";
import { IDocumentsRequest } from "./models/documentsrequest";
import { IDocumentsResponse } from "./models/documentsresponse";
import { IPaging } from "../../shared/models/paging";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SubSystem, ActivitySource, LookupTypeCodes, Features, Actions } from "../../shared/constants";
import { DocumentTypes } from "./constants";
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { DocumentdetailsService } from './services/documents.details.service';
import { IdocumentDetailsResponse } from "./models/documentdetails";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;


@Component({
  selector: 'app-de-link-document',
  templateUrl: './de-link-document.component.html',
  styleUrls: ['./de-link-document.component.scss']
})
export class DeLinkDocumentComponent implements OnInit {

  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;

  scannedDocumentTypes = [];
  delinkDocumentForm: FormGroup;
  afterSearch: boolean = false;
  documentTobeLinked: string;
  documentLinked: string;
  selectedDocumentFolder: string;
  disableSearchButton: boolean = false;
  disableDlink: boolean = false;
  disableViewPDF: boolean = false;


  strComments: string;

  //User log in details 
  sessionContextResponse: IUserresponse
  validateNumberPattern = "[0-9]*";
  validateExceptAnglePattern = "[^<> ][^<>]*";

  constructor(private documentService: DocumentsService, private router: Router,
   private documentdetailsService: DocumentdetailsService, public renderer: Renderer, 
   private customerContext: CustomerContextService, private context: SessionService,
    private commonService: CommonService,private materialscriptService:MaterialscriptService) {

    this.delinkDocumentForm = new FormGroup({
      'DocumentFolder': new FormControl('', [Validators.required]),
      'AccountNo': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
      'Keyword': new FormControl('', ),
      'NoticeNo': new FormControl('', ),
      'Comments': new FormControl('', [Validators.required, Validators.pattern(this.validateExceptAnglePattern)]),
    });

  }

  ScannedDocumentsResponse: IScannedDocumentsResponse[] = <IScannedDocumentsResponse[]>[];
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  selectedDocumentName: string;
  pdfPath: string;

  getDelinkDocumentsRequest: IDocumentsRequest;
  getDelinkDocumentsResponse: IDocumentsResponse[];
  paging: IPaging;
  systemactivites: ISystemActivities;
  documentRequest: IDocumentsRequest;
  documentDetailsResponse: IdocumentDetailsResponse;


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getDocumentDetailsByStatus(this.p, "reLoad");
  }


  ngOnInit() {
this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.DLINKDOCUMENTS], Actions[Actions.SEARCH], "");
    this.disableDlink = this.commonService.isAllowed(Features[Features.DLINKDOCUMENTS], Actions[Actions.DLINK], "");
    this.disableViewPDF = this.commonService.isAllowed(Features[Features.DLINKDOCUMENTS], Actions[Actions.VIEWPDF], "");

    this.p = 1;
    this.endItemNumber = 10;

    //For dropdown binding
    this.documentTypesBinding('onLoad');

    this.documentdetailsService.currentDetails.subscribe(documentdetailsService => {
      this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
        .subscribe(res => { this.documentLinked = res; });
    });

  }

  documentTypesBinding(event) {

    //user events start

    let userEvents = <IUserEvents>{};
    if (event == "onLoad") {
      userEvents.FeatureName = Features[Features.DLINKDOCUMENTS];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    else {
      userEvents = null;
    }
    //user events end



    this.scannedDocumentTypes = [];
    this.documentService.getDocumentTypes(userEvents).subscribe(
      res => {
        for (let key in res) {
          if ((key == DocumentTypes[DocumentTypes.Emailed]) || (key == DocumentTypes[DocumentTypes.Written]) || (key == DocumentTypes[DocumentTypes.Printed]) || (key == DocumentTypes[DocumentTypes.Delinked]) || (key == DocumentTypes[DocumentTypes.Typed]))
            this.scannedDocumentTypes.push(key);
        }
      }
    )
  }

  // To bind the grid
  getDocumentDetailsByStatus(pageNumber: number, pageLoad: string) {
    let userEvents = <IUserEvents>{};


    if (pageNumber == 1) {
      this.p = 1;
      this.startItemNumber = 1;
      this.pageItemNumber = 10;
      this.endItemNumber = 10;
    }
    if (pageLoad == "onLoad") {

      userEvents.FeatureName = Features[Features.DLINKDOCUMENTS];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    else {
      userEvents = null;
    }
    this.getDelinkDocumentsRequest = <IDocumentsRequest>{};
    if (this.delinkDocumentForm.get("AccountNo").value === "" &&
      (this.delinkDocumentForm.get("DocumentFolder").value === "" || this.delinkDocumentForm.get("DocumentFolder").value === "--Select--") &&
      this.delinkDocumentForm.get("NoticeNo").value === "" &&
      this.delinkDocumentForm.get("Keyword").value === ""
    ) {

      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'At least 1 field is required';
    }
    else if (this.delinkDocumentForm.get("AccountNo").value === null &&
      this.delinkDocumentForm.get("DocumentFolder").value === null &&
      this.delinkDocumentForm.get("NoticeNo").value === null &&
      this.delinkDocumentForm.get("Keyword").value == null) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'At least 1 field is required';
    }
    else {

      let intCustomerID: number;
      if (this.delinkDocumentForm.get("AccountNo").value === null || this.delinkDocumentForm.get("AccountNo").value === '')
        intCustomerID = 0;
      else
        intCustomerID = this.delinkDocumentForm.get("AccountNo").value;
      this.getDelinkDocumentsRequest.CustomerId = intCustomerID;
      this.getDelinkDocumentsRequest.DocumentType = this.delinkDocumentForm.get("DocumentFolder").value;
      this.getDelinkDocumentsRequest.NoticeNumber = this.delinkDocumentForm.get("NoticeNo").value;
      this.getDelinkDocumentsRequest.Keywords = this.delinkDocumentForm.get("Keyword").value;
      this.getDelinkDocumentsRequest.Status = DocumentTypes[DocumentTypes.Link];
      this.getDelinkDocumentsRequest.InterfaceSource = this.delinkDocumentForm.get("DocumentFolder").value;
      this.paging = <IPaging>{};
      this.paging.PageNumber = pageNumber;
      this.paging.PageSize = 10;
      this.paging.SortColumn = "CURRENT_CUSTOMER_ID";
      this.paging.SortDir = 0;
      this.getDelinkDocumentsRequest.Paging = this.paging;
      this.systemactivites = <ISystemActivities>{};
      this.systemactivites.LoginId = this.context.customerContext.loginId;
      this.systemactivites.UserId = this.context.customerContext.userId;
      this.systemactivites.SubSystem = SubSystem[SubSystem.CSC];
      this.systemactivites.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.getDelinkDocumentsRequest.SystemActivities = this.systemactivites;
      this.documentService.getDelinkDocuments(this.getDelinkDocumentsRequest, userEvents).subscribe(
        res => {
          this.getDelinkDocumentsResponse = res;
          if (this.getDelinkDocumentsResponse && this.getDelinkDocumentsResponse.length > 0) {
            this.totalRecordCount = this.getDelinkDocumentsResponse[0].RecordCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
          this.afterSearch = true;
        }
        , err => {
          this.getDelinkDocumentsResponse = <IDocumentsResponse[]>[];
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        });

    }

  }
  documentdetailsReset() {
    this.p = 1;
    this.startItemNumber = 1;
    this.pageItemNumber = 10;
    this.endItemNumber = 10;
    this.delinkDocumentForm.reset();
    this.documentTypesBinding('reLoad');
    this.getDelinkDocumentsResponse = [];
    this.afterSearch = false;

  }


  delikDocument() {
    if (this.delinkDocumentForm.get("Comments").value === null || this.delinkDocumentForm.get("Comments").value === "") {
      this.delinkDocumentForm.controls['Comments'].markAsTouched({ onlySelf: true });
    }

    if (this.delinkDocumentForm.valid) {
      this.getDelinkDocumentsRequest.InterfaceId = this.documentRequest.InterfaceId;
      this.getDelinkDocumentsRequest.Notes = this.delinkDocumentForm.get("Comments").value;
      this.getDelinkDocumentsRequest.Status = DocumentTypes[DocumentTypes.Delink];
      this.getDelinkDocumentsRequest.CustomerId = this.documentRequest.CustomerId;
      this.getDelinkDocumentsRequest.UpdatedUser = this.context.customerContext.userName;
      this.getDelinkDocumentsRequest.DocumentName = this.documentRequest.DocumentName;
      this.getDelinkDocumentsRequest.DocumentLocation = this.documentRequest.DocumentLocation;
       $('#pageloader').modal('show');
      this.systemactivites = <ISystemActivities>{};
      this.systemactivites.LoginId = this.context.customerContext.loginId;
      this.systemactivites.UserId = this.context.customerContext.userId;
      this.systemactivites.SubSystem = SubSystem[SubSystem.CSC];
      this.systemactivites.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.getDelinkDocumentsRequest.SystemActivities = this.systemactivites;


      this.documentService.delinkDocument(this.getDelinkDocumentsRequest).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = 'Document Delinked SuccessFully';
            $('#pageloader').modal('hide');
          this.getDocumentDetailsByStatus(this.p, "reLoad");
         
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = "Error occured while Delinking Document";
           $('#pageloader').modal('hide');
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = "Error occured while Delinking Document";
         $('#pageloader').modal('hide');
      });
      $('#comments').modal('hide');
    }


  }



  enterComments(selectedRowData) {
    this.documentRequest = selectedRowData;
    this.delinkDocumentForm.controls["Comments"].reset();
    $('#comments').modal('show');
  }

  viewPDF(selectedRowData) {
    window.open(this.documentLinked + selectedRowData.DocumentLocation);
  }

  documentFolderSelectionChange(documentFolder: string) {
    this.selectedDocumentFolder = documentFolder + "/";

  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }


}