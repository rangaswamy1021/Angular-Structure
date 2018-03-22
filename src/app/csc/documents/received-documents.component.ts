import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { ILookupResponse } from "./models/lookupresponse";
import { DocumentsService } from "./services/documents.service";
import { CustomerDetailsService } from "../customerdetails/services/customerdetails.service";
import { IInOrOutBoundRequest } from "./models/inoroutboundrequest";
import { IInOrOutBoundResponse } from "./models/inoroutboundresponse";
import { CustomerAccountsService } from "../customeraccounts/services/customeraccounts.service";
import { ActivitySource, SubSystem, LookupTypeCodes, DocumentTypes, Features, Actions } from "../../shared/constants";
import { IPaging } from "../../shared/models/paging";
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-received-documents',
  templateUrl: './received-documents.component.html',
  styleUrls: ['./received-documents.component.scss']
})
export class ReceivedDocumentsComponent implements OnInit {
  searchDoc: boolean = false;
  gridArrowGENERATEDDATE: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowDOCUMENTTYPE: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  featureCode: string;
  accountStatus: string;
  isSearch: boolean = false;
  isCreate: boolean = false;
  parentId: number;
  boolCSCVisible: boolean;
  isUploaded: boolean = true;
  selectedValue: string;
  maxFiles: number;
  p: number;
  Paging: IPaging;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.CSC];
  fileFullPath: string;
  isFileUploaded: boolean = false;
  idFileuploadedPath: string;
  search: IInOrOutBoundRequest;
  create: IInOrOutBoundRequest;
  documentListObject: IInOrOutBoundRequest[] = [];
  searchResponse: IInOrOutBoundResponse[];
  createResponse: boolean;
  submitted: boolean;
  parameterValue: any;
  dropDownDataResults: ILookupResponse[];
  lookuptype: ILookupResponse;
  receivedDocuments: FormGroup;
  searchesDocuments: FormGroup;
  viewPath: string = "";
  customerStatus: ICustomerResponse;
  sessionContextResponse: IUserresponse;
  accountId: number;
  @Input() ViolatorAccountId;
  constructor(private commonService: CommonService,
    private customerContextService: CustomerContextService,
    private customerAccountsService: CustomerAccountsService,
    private documnetsService: DocumentsService,
    private customerdetailsservice: CustomerDetailsService,
    private router: Router,
    private materialscriptService: MaterialscriptService,
    private sessionContext: SessionService) {
    this.receivedDocuments = new FormGroup({
      'documentType': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
      'fileAttachment': new FormControl('', [Validators.required])
    });
    this.searchesDocuments = new FormGroup({
      'keyword': new FormControl('', []),
      'description': new FormControl('', [])
    });
  }
  @ViewChild('fileAttachment') fileAttachment;
  //paging
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  //
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    if (this.searchDoc) {
      this.getInBoundSearchByKeyword("SEARCH");
    }
    else {
      this.getInBoundSearchByKeyword("VIEW");
    }
  }

  ngOnInit() {
    this.p = 1;
    this.endItemNumber = 10;
    this.gridArrowGENERATEDDATE = true;
    this.sortingColumn = "GENERATEDDATE";
    this.materialscriptService.material();
    if (this.router.url.indexOf('csc') > 0) {
      this.subSystem = SubSystem[SubSystem.CSC];
      this.boolCSCVisible = true;
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.subSystem = SubSystem[SubSystem.TVC];
    } else {
      this.subSystem = SubSystem[SubSystem.CSC];
      this.boolCSCVisible = true;
    }

    if (this.subSystem == SubSystem[SubSystem.TVC]) {
      this.accountId = this.ViolatorAccountId;
      this.featureCode = Features[Features.TVCRECEIVEDDOCUMENTS];
    }
    else {
      this.customerContextService.currentContext
        .subscribe(custContext => {
          console.log(custContext);
          this.accountStatus = custContext.AccountStatus;
          this.featureCode = Features[Features.CUSTOMERRECEIVEDDOCUMENTS];
          this.parentId = custContext.ParentId;
          if (this.parentId > 0) {
            this.accountId = custContext.ParentId;
          }
          else {
            this.accountId = custContext.AccountId;
          }
        });
    }

    if (this.dataLength < this.pageItemNumber) {
      this.endItemNumber = this.dataLength
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.bindDropdown();
    this.getInBoundSearchByKeyword("VIEW");
    this.customerdetailsservice.getApplicationParameterValueByParameterKey("MaxFileSize").subscribe(
      res => {
        this.parameterValue = res;
      });
    this.getDocumentPath();
    if (!this.commonService.isAllowed(this.featureCode, Actions[Actions.VIEW], "")) {
      //error page;
    }
    this.isCreate = !this.commonService.isAllowed(this.featureCode, Actions[Actions.CREATE], this.accountStatus ? this.accountStatus : '');
    this.isSearch = !this.commonService.isAllowed(this.featureCode, Actions[Actions.SEARCH], this.accountStatus ? this.accountStatus : '');

  }
  getDocumentPath() {
    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
      .subscribe(res => { this.viewPath = res; });
  }
  uploadClickFile() {
    if (this.fileAttachment.nativeElement.files[0]) {
      let file: File = this.fileAttachment.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));
      if ([".gif", ".jpg", ".jpeg", ".txt", ".xls", ".docx", ".pdf", ".doc", ".png", ".xlsx"].indexOf(type.toLowerCase()) > 0) {
        if (file.size / 1048576 < this.parameterValue) {
          let formData = new FormData();
          formData.append('upload', file);
          this.documnetsService.uploadFile(formData)
            .subscribe(
            data => {
              this.idFileuploadedPath = data;
              this.isFileUploaded = true;
              this.isUploaded = false;
              this.fileFullPath = this.viewPath + this.idFileuploadedPath;
              this.receivedDocuments.controls['fileAttachment'].disable();
            });
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = 'File upload';
          this.msgDesc = 'File should be less than 1Mb';
        }
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = 'File upload';
        this.msgDesc = 'Attach files of type  jpg, jpeg, txt, gif, docx, pdf, doc, png, xlsx, xls only.';
      }
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = 'File upload';
      this.msgDesc = 'Select file to upload';
    }
  }

  viewFile(documentPath) {

    let strViewPath: string;
    strViewPath = this.viewPath + '/' + documentPath;
    window.open(strViewPath);

  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  reset() {
    this.isUploaded = true;
    this.isFileUploaded = false;
    this.receivedDocuments.controls['fileAttachment'].enable();
    this.receivedDocuments.reset();
    this.bindDropdown();
    this.getInBoundSearchByKeyword("VIEW");
  }
  searchReset() {
    this.startItemNumber = 1;
    this.p = 1;
    this.endItemNumber = 10;
    this.searchDoc = false;
    this.searchesDocuments.reset();
    this.searchesDocuments.patchValue({
      "keyword": "",
      "description": ""
    })
    this.bindDropdown();
    this.getInBoundSearchByKeyword("VIEW");
  }
  deleteFile(fileFullPath) {
    this.isFileUploaded = false;
    this.idFileuploadedPath = "";
    this.isUploaded = true;
    this.receivedDocuments.controls['fileAttachment'].enable();
    this.receivedDocuments.controls["fileAttachment"].reset();
    this.receivedDocuments.controls["fileAttachment"].setValidators([Validators.required]);
    this.receivedDocuments.controls["fileAttachment"].updateValueAndValidity();
  }
  getInBoundSearchByKeyword(searchFlag: string) {
    this.search = <IInOrOutBoundRequest>{};
    this.search.CustomerId = this.accountId;
    this.search.BoundType = "InBound";
    this.Paging = <IPaging>{};
    this.Paging.SortColumn = this.sortingColumn;
    this.Paging.PageSize = 10;
    this.Paging.PageNumber = this.p;
    this.Paging.SortDir = this.sortingDirection == true ? 1 : 0;
    this.search.Paging = this.Paging;
    this.search.CreatedUser = "";
    this.search.UserId = this.sessionContextResponse.userId;
    this.search.LoginId = this.sessionContextResponse.loginId;
    this.search.Subsystem = this.subSystem;
    this.search.ActivitySource = this.activitySource;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureCode;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    if (searchFlag == "VIEW") {
      this.search.SearchKeyword = "";
      this.search.Description = "";
      this.search.SearchFlag = "VIEW";
      userEvents.ActionName = Actions[Actions.VIEW];
    }
    else {
      this.search.SearchKeyword = this.searchesDocuments.controls['keyword'].value.trim();
      this.search.Description = this.searchesDocuments.controls['description'].value.trim();
      this.search.SearchFlag = "SEARCH";
      userEvents.ActionName = Actions[Actions.SEARCH];
    }
    this.documnetsService.getInBoundSearchByKeyword(this.search, userEvents)
      .subscribe(res => {
        this.searchResponse = res;
        this.dataLength = this.searchResponse[0].RecordCount;
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength
        }
      });
  }
  getCreateInboundDocument() {
    if (this.receivedDocuments.valid && !this.isUploaded) {
      this.documentListObject = [];
      this.create = <IInOrOutBoundRequest>{};
      this.create.CustomerId = this.accountId;
      this.create.Description = this.receivedDocuments.controls['description'].value;
      this.create.DocumentType = this.receivedDocuments.controls['documentType'].value;
      this.create.DocumentPath = this.idFileuploadedPath;
      this.create.InitiatedBy = this.sessionContextResponse.userName;
      this.create.CreatedUser = this.sessionContextResponse.userName;
      this.create.QueueId = 0;
      this.create.Subsystem = this.subSystem;
      this.create.ActivitySource = this.activitySource;
      this.create.IsActivityRequired = true;
      this.create.UserId = this.sessionContextResponse.userId;
      this.create.LoginId = this.sessionContextResponse.loginId;
      this.documentListObject.push(this.create);
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureCode;
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.documnetsService.getCreateInboundDocument(this.documentListObject, userEvents)
        .subscribe(res => {
          this.isUploaded = true;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = 'Document has been submitted successfully';
          this.idFileuploadedPath = "";
          this.receivedDocuments.controls['fileAttachment'].enable();
          this.receivedDocuments.controls["fileAttachment"].setValidators([Validators.required]);
          this.receivedDocuments.reset();
          this.searchesDocuments.reset();
          this.bindDropdown();
          this.getInBoundSearchByKeyword("VIEW");
          this.isFileUploaded = false;
        });
    }
    else {
      this.validateAllFormFields(this.receivedDocuments);
    }
  }

  bindDropdown() {
    this.lookuptype = <ILookupResponse>{};
    this.lookuptype.LookUpTypeCode = "DocumentTypes";
    this.documnetsService.getLookUpByParentLookupTypeCode(this.lookuptype)
      .subscribe(res => {
        this.dropDownDataResults = res;
        if (this.dropDownDataResults && this.dropDownDataResults.length > 0) {
          if (this.subSystem === SubSystem[SubSystem.TVC]) {
            this.dropDownDataResults = this.dropDownDataResults.filter(element =>
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.CloseAccRequest] &&
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.Statement]
            );
          }
          this.dropDownDataResults = this.dropDownDataResults.filter(element =>
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.Invoices] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.PurchaseOrderInVoice] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.BusinessDocument] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.AdHocStatements] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.PrintInterface] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.CCItem] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.LastChance]
          );
        }
      });
  }
  searchDocuments() {
    this.searchDoc = true;
    this.p = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    var keyword = this.searchesDocuments.controls['keyword'].value;
    var description = this.searchesDocuments.controls['description'].value;
    if (keyword != '' && keyword != null) {
      var keyword = this.searchesDocuments.controls['keyword'].value.trim();
    }
    if (description != '' && description != null) {
      var description = this.searchesDocuments.controls['description'].value.trim();
    }

    // if ((this.searchesDocuments.controls['keyword'].value != '' && this.searchesDocuments.controls['keyword'].value != " " && this.searchesDocuments.controls['keyword'].value != null) ||
    // (this.searchesDocuments.controls['description'].value != '' && this.searchesDocuments.controls['description'].value != " " && this.searchesDocuments.controls['description'].value != null)) {
    if (keyword || description) {
      this.getInBoundSearchByKeyword("SEARCH");
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'At least 1 field required.';
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        if (controlName == "fileAttachment" && this.isUploaded) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Please upload a file.';
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  sortDirection(SortingColumn) {
    this.gridArrowDOCUMENTTYPE = false;
    this.gridArrowGENERATEDDATE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "DOCUMENTTYPE") {
      this.gridArrowDOCUMENTTYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "GENERATEDDATE") {
      this.gridArrowGENERATEDDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    //this.getInBoundSearchByKeyword("VIEW");
    if (this.searchDoc) {
      this.getInBoundSearchByKeyword("SEARCH");
    }
    else {
      this.getInBoundSearchByKeyword("VIEW");
    }
  }
}
