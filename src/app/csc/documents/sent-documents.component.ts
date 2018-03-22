import { Component, OnInit, Input } from '@angular/core';
import { ILookupResponse } from "./models/lookupresponse";
import { DocumentsService } from "./services/documents.service";
import { IInOrOutBoundRequest } from "./models/inoroutboundrequest";
import { IInOrOutBoundResponse } from "./models/inoroutboundresponse";
import { IPaging } from "../../shared/models/paging";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivitySource, SubSystem, LookupTypeCodes, DocumentTypes, Features, Actions } from "../../shared/constants";
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-sent-documents',
  templateUrl: './sent-documents.component.html',
  styleUrls: ['./sent-documents.component.scss']
})
export class SentDocumentsComponent implements OnInit {
  searchDoc: boolean = false;
  gridArrowCOMMUNICATIONDATE: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowDocumentTypeName: boolean;
  accountStatus: string;
  featureCode: string;
  isSearch: boolean;
  parentId: number;
  boolCSCVisible: boolean;
  selectedDoc: string;
  selected: string;
  bindPath: IInOrOutBoundResponse;
  viewPath: string;
  //objICustomerContextResponse: ICustomerContextResponse;
  userName: string;
  userId: number;
  loginId: number;
  sessionContextResponse: IUserresponse;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.CSC];
  sentDocuments: FormGroup;
  Paging: IPaging;
  customer: IInOrOutBoundRequest;
  searchResponse: IInOrOutBoundResponse[];
  dropDownDataResults: ILookupResponse[];
  lookuptype: ILookupResponse;
  accountId: number;
  p: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  @Input() ViolatorAccountId;
  docStatus: any[] = [
    { key: 'Delivered', value: '1' },
    { key: 'Undelivered', value: '0' }
  ]
  constructor(private commonService: CommonService,
    private customerContextService: CustomerContextService,
    private documnetsService: DocumentsService,
    private sessionContext: SessionService,
    private materialscriptService: MaterialscriptService,
    private router: Router) { }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    if (this.searchDoc) {
      this.getInOutBoundByCustomerID("SEARCH");
    }
    else {
      this.getInOutBoundByCustomerID("VIEW");
    }
  }
  ngOnInit() {
    this.materialscriptService.material();
    this.sortingColumn = "GENERATEDDATE";
    this.p = 1;
    this.endItemNumber = 10;
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
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.sentDocuments = new FormGroup({
      'documentType': new FormControl('', [Validators.required]),
      'docStatus': new FormControl('', [Validators.required])
    });
    this.bindDropdown();
    this.getInOutBoundByCustomerID("VIEW");
    this.selected = "ALL";
  }
  bindDropdown() {
    this.lookuptype = <ILookupResponse>{};
    this.lookuptype.LookUpTypeCode = "DocumentTypes";
    this.documnetsService.getLookUpByParentLookupTypeCode(this.lookuptype)
      .subscribe(res => {
        this.dropDownDataResults = res;
        if (this.dropDownDataResults && this.dropDownDataResults.length > 0) {
          //for CSC subsystem
          if (this.subSystem === SubSystem[SubSystem.CSC]) {
            this.dropDownDataResults = this.dropDownDataResults.filter(element =>
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.LastChance]
            );
          } else {
            this.dropDownDataResults = this.dropDownDataResults.filter(element =>
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.Statement] &&
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.BusinessDocument] &&
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.AdHocStatements] &&
              element.LookUpTypeCode !== DocumentTypes[DocumentTypes.CloseAccRequest]
            );
          }
          this.dropDownDataResults = this.dropDownDataResults.filter(element =>
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.AccActivity] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.CCItem] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.General] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.CloseAccountReq] &&
            element.LookUpTypeCode !== DocumentTypes[DocumentTypes.PurchaseOrderInVoice]
          );
        }
      });
  }
  reset() {
    this.selected = "ALL";
    this.selectedDoc = "ALL";
    this.p = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    this.searchDoc = false;
    this.getInOutBoundByCustomerID("VIEW");
  }
  viewFile(documentPath: IInOrOutBoundResponse) {
    let docType: string;
    // this.bindPath = <IInOrOutBoundResponse>{};
    docType = documentPath.DocumentType.toUpperCase();
    switch (docType) {
      case "PAYMENTRECEIPT":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.CustomerStatements)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "PRINTINTERFACE":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "INVOICES":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.Invoices)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "STATEMENT":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.Statement)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "LASTCHANCE":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.LastChance)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "EMAIL":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.SentEmails)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "ADHOCSTATEMENTS":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.CustomerStatements)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;
      case "DOCUMENTS":
        this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
          .subscribe(res => {
            this.viewPath = res;
            window.open(this.viewPath + '/' + documentPath.DocumentPath);
          });
        break;

    }
  }
  getInOutBoundByCustomerID(ViewFlag: string) {
    this.customer = <IInOrOutBoundRequest>{};
    this.customer.BoundType = "OutBound";
    this.Paging = <IPaging>{};
    this.Paging.SortColumn = this.sortingColumn;
    // this.Paging.SortColumn="GENERATEDDATE"
    this.Paging.PageSize = 10;
    this.Paging.PageNumber = this.p;
    this.Paging.SortDir = this.sortingDirection == true ? 1 : 0;
    // this.Paging.SortDir=1;
    this.customer.Paging = this.Paging;
    this.customer.CreatedUser = this.sessionContextResponse.userName;
    this.customer.UserId = this.sessionContextResponse.userId;
    this.customer.LoginId = this.sessionContextResponse.loginId;
    this.customer.CustomerId = this.accountId;
    this.customer.SearchKeyword = "";
    this.customer.Description = "";
    this.customer.ActivitySource = this.activitySource;
    this.customer.Subsystem = this.subSystem;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureCode;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    // this.customer.DocumentType = "ALL";
    if (ViewFlag == "VIEW") {
      //for subsystem CSC
      if (this.customer.Subsystem == "CSC") {
        this.customer.DocumentType = "Statement" + "," + "Invoices" + "," + "PrintInterface" + "," + "PaymentReceipt" + "," + "AdHocStatements" + "," + "Email";
        //     this.customer.DocumentType = this.sentDocuments.controls['documentType'].value == 'ALL' ? "Statement" + "," + "Invoices" + "," + "PrintInterface" + "," + "PaymentReceipt" + "," + "AdHocStatements" + "," + "Email" : this.sentDocuments.controls['documentType'].value;
        this.customer.DocumentStatus = "ALL";
      }
      else {
        this.customer.DocumentType = "Invoices" + "," + "PrintInterface" + "," + "LastChance" + "," + "PaymentReceipt";
        //  this.customer.DocumentType = this.sentDocuments.controls['documentType'].value == 'ALL' ? "Invoices" + "," + "PrintInterface" + "," + "LastChance" + "," + "PaymentReceipt"  : this.sentDocuments.controls['documentType'].value;
        this.customer.DocumentStatus = "ALL";
      }
      this.customer.ViewFlag = "VIEW";
      userEvents.ActionName = Actions[Actions.VIEW];
    }
    else {
      this.customer.DocumentType = this.sentDocuments.controls['documentType'].value == 'ALL' ? "Statement" + "," + "Invoices" + "," + "PrintInterface" + "," + "PaymentReceipt" + "," + "AdHocStatements" + "," + "Email" : this.sentDocuments.controls['documentType'].value;
      this.customer.DocumentStatus = this.sentDocuments.controls['docStatus'].value;
      this.customer.ViewFlag = "SEARCH";
      userEvents.ActionName = Actions[Actions.SEARCH];
    }

    this.documnetsService.getInOutBoundByCustomerID(this.customer, userEvents)
      .subscribe(res => {
        this.searchResponse = res;
        console.log(res);
        if (this.searchResponse) {
          this.dataLength = this.searchResponse[0].RecordCount;

          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          // else {
          //   this.endItemNumber = this.pageItemNumber;
          // }
        }
      });
  }
  searchDocuments() {
    this.p = 1;
    this.searchDoc = true;
    this.endItemNumber = 10;
    this.startItemNumber=1;
    this.getInOutBoundByCustomerID("SEARCH");
  }

  sortDirection(SortingColumn) {
    this.gridArrowDocumentTypeName = false;
    this.gridArrowCOMMUNICATIONDATE = false;

    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "DocumentTypeName") {
      this.gridArrowDocumentTypeName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "GENERATEDDATE") {
      this.gridArrowCOMMUNICATIONDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    //this.getInOutBoundByCustomerID('VIEW');
    if (this.searchDoc) {
      this.getInOutBoundByCustomerID("SEARCH");
    }
    else {
      this.getInOutBoundByCustomerID("VIEW");
    }
  }
}
