import { IAttachmentCourtResponse } from './../model/attachmentresponse';
import { defaultCulture } from './../../shared/constants';
import { CommonService } from './../../shared/services/common.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { CourtService } from '../services/court.service';
import { ActivitySource, CourtDocuments, LookupTypeCodes } from '../../shared/constants';
import { Subsystem } from '../../sac/constants';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IAttachmentRequest } from '../../shared/models/attachmentrequest';
import { AttachmentContextService } from '../services/attachment.context.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-courtselection',
  templateUrl: './courtselection.component.html',
  styleUrls: ['./courtselection.component.scss']
})
export class CourtselectionComponent implements OnInit {
  ownershipFileName: string;
  evidencePacketAttachId: any;
  selectedAttachId: any;
  updatedAffidavitattachment: IAttachmentCourtResponse;

  updateEvidenceFlag: boolean;
  customerResponseTable: boolean;
  btnDocketCancelbtn: boolean;
  moveToCourt: any;
  isEvidenceAvailable: boolean;
  documentDescription: string;
  fileUploadForm: FormGroup;
  viewUploadPath: string;
  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  fileMaxSize: any;
  affidavitId: any;
  OwnershipID: any;
  summaryComplaintID: any;
  updateEvidencePacketbtn: boolean;
  MoveCourtbtn: boolean;
  evidencePacketBlock: boolean;
  CreateEvidencePacketbtn: boolean;
  EligibleEvidencePacket: boolean;
  isUpdateEvidencePacket: boolean = false;
  isOtherDocuments: boolean;
  isLinksAvailable: boolean;
  isReadyEvidencePacket: boolean;
  viewPath: string;
  boolShowUploadBlock: boolean;
  documentName: string;
  divCancel: boolean;
  displayDocumentsBlock: boolean;
  courtCustomers: any;
  courtSelectionForm: FormGroup;

  collectionReqObject: any;
  collectionResObject: any[];
  longAccountId: number = 0;
  longCollectionId: number = 0;
  longCourtCustId: number = 0;
  IsUpdateEvidence: boolean;
  tripSelectionRequest: any;
  systemActivity: any;

  uploadMandatory: boolean;
  //paging properties for court eligible
  p: number;
  startItemNumber: number = 1;
  pageItemNumber: number = 10;  
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  dataLength: number;


  //customer response
  q: number;
  RestotalRecordCount: number;
  RespageItemNumber: number = 10;
  ResdataLength: number;
  ResstartItemNumber: number = 1;
  ResendItemNumber: number = this.RespageItemNumber;


  courtSelectedCustomer: any;
  PreCourtCustomerReqObjet: any;
  custoermResObject: any[];
  courtAttachments: any;
  courtAttachmentsListRes: any[];


  //summarycomplaint 
  summarycomplaintPath: string;
  affidavitPath: string;
  ownershipPath: string = '';
  accountSummaryPath: string;
  evidencePacketPath: string;
  bfrEvidenceCmptSmry: boolean;
  aftEvidenceCmptSmry: boolean;
  bfrEvidenceOwneshp: boolean;
  afrEvidenceOwneshp: boolean;
  bfrEvidenceAffidavit: boolean;
  afrEvidenceAffidavit: boolean;


  otherDocumentsList: any[];

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  courtAttachmentEvidenceCreation: any;

  updatedComplaintSummary: IAttachmentCourtResponse[];
  updatedCourtContextResponse: IAttachmentCourtResponse[] = [];

  groupStatuses = [];
  @ViewChild('cmpFile') cmpFile;

  constructor(private loginContext: SessionService,
    private courtService: CourtService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private AttachmentContextService: AttachmentContextService, 
    private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.longAccountId = +this.route.snapshot.paramMap.get('customerid');
    this.longCourtCustId = +this.route.snapshot.paramMap.get('courtid');
    this.longCollectionId = +this.route.snapshot.paramMap.get('collectionId');

    if (this.longAccountId > 0 && this.longCourtCustId > 0) {
      //create account summary and affidavit documents.
      this.CreateAffidavitandAccountSummaryTemplates(true);
    }

    this.courtSelectionForm = new FormGroup({
      'AccountId': new FormControl('', []),
      'group': new FormControl('', []),
    });

    this.fileUploadForm = new FormGroup({
      'cmpFile': new FormControl('')
    });

    this.bindGroupStatusDropdown();
    this.bindCourtSelectionCustomers(1, true, false);
    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.CourtDocuments, LookupTypeCodes.EvidencePacket)
      .subscribe(res => {
        this.viewPath = res;
      });
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
      .subscribe(res => { this.fileMaxSize = res; });
    // this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
    // .subscribe(res => { this.viewUploadPath = res; });
  }


  bindGroupStatusDropdown() {
    // Bind Group Status
    this.commonService.getCourtGroupStatus().subscribe(res => { this.groupStatuses = res; });
  }

  CreateAffidavitandAccountSummaryTemplates(isSummaryComplaintCreated: boolean) {

    this.AttachmentContextService.currentContext.subscribe(attachCourtContext => this.updatedComplaintSummary = attachCourtContext);
    if (this.updatedComplaintSummary != null) {
      this.updateEvidenceFlag = true;
      this.updatedCourtContextResponse = this.updatedComplaintSummary;
    }


    this.courtAttachments = <any>{};
    this.courtAttachments.CourtCustId = this.longCourtCustId;
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.IsViewed = true;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
    this.courtAttachments.SystemActivity = this.systemActivity;
    this.courtService.getEvidenceDocuments(this.courtAttachments).subscribe(
      res => {
        this.courtAttachmentsListRes = res;
      }, (err) => { }
      , () => {
        
        if (this.courtAttachmentsListRes != null && this.courtAttachmentsListRes.length > 0) {
          if (this.longCourtCustId > 0) {
            var varSummaryComplaintindex = this.courtAttachmentsListRes.findIndex(x => x.DocumentType.toUpperCase() == "COMPLAINTSUMMARY");
            if (varSummaryComplaintindex == -1) {
              this.router.navigate(['/court/court/summarycomplaint', this.longAccountId, this.longCollectionId, 0, false]);
            }

            var varAffidavit = this.courtAttachmentsListRes.findIndex(x => x.DocumentType.toUpperCase() == "AFFIDAVIT");
            if (varAffidavit == -1) {
              //create affidavit document.
              let boolResult = false;
              this.courtCustomers = <any>{};
              this.courtCustomers.CustomerId = this.longAccountId;
              this.courtCustomers.CourtCustId = this.longCourtCustId;
              this.courtCustomers.UserName = this.loginContext.customerContext.userName;
              this.courtCustomers.SystemActivity = this.systemActivity;

              this.courtService.createAffidavitDocument(this.courtCustomers).subscribe(
                res => {
                  boolResult = res;
                }, (err) => { }
                , () => {
                  var varAccountSummary = this.courtAttachmentsListRes.findIndex(x => x.DocumentType.toUpperCase() == "ACCOUNTSUMMARY");
                  if (varAccountSummary == -1) {
                    this.courtService.createAccountSummaryDocument(this.courtCustomers).subscribe(
                      res => {
                        boolResult = res;
                      }, (err) => { }
                      , () => {
                        // call getdocuments method 
                        this.bindEvidenceDocuments();
                      });
                  }
                  else {
                    // call getdocuments method 
                    this.bindEvidenceDocuments();
                  }
                  if (isSummaryComplaintCreated) {
                    //display success message
                    this.showSucsMsg("Summary Complaint has been created for Account #" + this.longAccountId);
                  }
                });
            }
            else {
              //Summary of complaint is updated then need to Affidavit document
              if (this.updatedCourtContextResponse != null && this.updatedCourtContextResponse.length > 0) {
                var varupdatedComplaintSummary = this.updatedCourtContextResponse.findIndex(x => x.DocumentType.toUpperCase() == "COMPLAINTSUMMARY");
                if (varAffidavit > -1) {
                  this.courtCustomers = <any>{};
                  this.courtCustomers.CustomerId = this.longAccountId;
                  this.courtCustomers.CourtCustId = this.longCourtCustId;
                  this.courtCustomers.UserName = this.loginContext.customerContext.userName;
                  this.courtCustomers.SystemActivity = this.systemActivity;
                  this.courtCustomers.IsEvidenceUpdate = true;
                  this.updatedAffidavitattachment = <IAttachmentCourtResponse>{};
                  this.courtService.createAffidavitDocument(this.courtCustomers).subscribe(
                    res => {
                      this.updatedAffidavitattachment = res;

                    }, (err) => { }
                    , () => {
                      if (this.updatedAffidavitattachment != null && this.updatedAffidavitattachment != undefined) {
                        this.updatedCourtContextResponse.push(this.updatedAffidavitattachment);
                      }
                      this.bindEvidenceDocuments();
                    });
                }
              }
              else {
                this.bindEvidenceDocuments();
              }

            }
          }
        }
        else {
          //navigate to summary complaint page.
        }

      })
  }

  bindEvidenceDocuments() {
    this.otherDocumentsList=[];
    this.courtAttachmentsListRes = [];
    this.courtAttachments = <any>{};
    this.courtAttachments.CourtCustId = this.longCourtCustId;
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.IsViewed = true;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
    this.courtAttachments.SystemActivity = this.systemActivity;
    this.courtService.getEvidenceDocuments(this.courtAttachments).subscribe(
      res => {
        this.courtAttachmentsListRes = res;
      }, (err) => { }
      , () => {
        this.displayDocumentsBlock = true;
        this.divCancel = true;
        if (this.courtAttachmentsListRes && this.courtAttachmentsListRes.length > 0) {

          if (this.longCourtCustId > 0) {
            var varSummaryComplaintindex = this.courtAttachmentsListRes.findIndex(x => x.DocumentType.toUpperCase() == "COMPLAINTSUMMARY");
            if (varSummaryComplaintindex == -1) {
              this.router.navigate(['/court/court/summarycomplaint', this.longAccountId, this.longCollectionId, 0, false]);
            }
            var objLstResponseEvidencePacket = this.courtAttachmentsListRes.findIndex(x => x.DocumentType.toUpperCase() == "EVIDENCEPACKET");
            //check evidence packet document created.
            if (objLstResponseEvidencePacket > -1) {
             
              this.isEvidenceAvailable = true;
              //this.isLinksAvailable = false;
              // lnkEvidencePacket.CommandName = objLstResponseEvidencePacket[0].FileName.ToString();
              this.evidencePacketPath = this.courtAttachmentsListRes[objLstResponseEvidencePacket].Path;
              this.evidencePacketAttachId = this.courtAttachmentsListRes[objLstResponseEvidencePacket].AttachmentId;

            }
            //removing evidence packet from the list.
            this.courtAttachmentsListRes = this.courtAttachmentsListRes.filter(item => item.DocumentType.toUpperCase() != CourtDocuments[CourtDocuments.EvidencePacket.toString()].toUpperCase());
            let intDocumentCount = 0;
            this.courtAttachmentsListRes.forEach(element => {
             
              let docType: string;
              // this.bindPath = <IInOrOutBoundResponse>{};
              docType = element.DocumentType.toUpperCase();
             
              switch (docType) {
                case "COMPLAINTSUMMARY":
                  if (this.updatedCourtContextResponse && this.updatedCourtContextResponse.length > 0) {
                    var index = this.updatedCourtContextResponse.findIndex(x => x.DocumentType.toUpperCase() == "COMPLAINTSUMMARY");
                    if (index > -1) {
                      this.updatedCourtContextResponse[index].AttachmentId = element.AttachmentId.toString();
                      this.updatedCourtContextResponse[index].OldFileName = element.FileName;
                      this.summarycomplaintPath = this.updatedCourtContextResponse[index].Path;
                      this.aftEvidenceCmptSmry = true;
                      this.bfrEvidenceCmptSmry = false;
                    }
                    else {
                      this.summarycomplaintPath = element.Path;
                      this.summaryComplaintID = element.AttachmentId.toString();
                    }
                  }
                  else {
                    if (this.updateEvidenceFlag) {
                      this.aftEvidenceCmptSmry = false;
                      this.bfrEvidenceCmptSmry = true;
                    }
                    else {
                      this.aftEvidenceCmptSmry = true;
                      this.bfrEvidenceCmptSmry = false;
                    }
                    this.summarycomplaintPath = element.Path;
                    this.summaryComplaintID = element.AttachmentId.toString();
                  }
                  intDocumentCount++;
                  break;
                case "AFFIDAVIT":
                 
                  if (this.updatedCourtContextResponse && this.updatedCourtContextResponse.length > 0) {
                    var index = this.updatedCourtContextResponse.findIndex(x => x.DocumentType.toUpperCase() == "AFFIDAVIT");
                    if (index > -1) {
                      this.updatedCourtContextResponse[index].AttachmentId = element.AttachmentId.toString();
                      this.updatedCourtContextResponse[index].OldFileName = element.FileName;
                      this.affidavitPath = this.updatedCourtContextResponse[index].Path;
                      this.afrEvidenceAffidavit = true;
                      this.bfrEvidenceAffidavit = false;
                    }
                    else {
                      this.affidavitPath = element.Path;
                      this.affidavitId = element.AttachmentId.toString();
                    }
                  }
                  else {
                    this.affidavitPath = element.Path;
                    this.affidavitId = element.AttachmentId.toString();
                  }
                  intDocumentCount++;
                  break;
                case "OWNERSHIPPROOF":
                  if (this.updatedCourtContextResponse && this.updatedCourtContextResponse.length > 0) {
                    var index = this.updatedCourtContextResponse.findIndex(x => x.DocumentType.toUpperCase() == "OWNERSHIPPROOF");
                    if (index > -1) {
                      this.updatedCourtContextResponse[index].AttachmentId = element.AttachmentId.toString();
                      this.updatedCourtContextResponse[index].OldFileName = element.FileName;
                      this.ownershipPath = this.updatedCourtContextResponse[index].Path;
                      this.ownershipFileName = this.updatedCourtContextResponse[index].FileName;
                      this.afrEvidenceOwneshp = true;
                      this.bfrEvidenceOwneshp = false;
                    }
                    else {
                      this.afrEvidenceOwneshp = false;
                      this.bfrEvidenceOwneshp = true;
                      this.ownershipPath = element.Path;
                      this.ownershipFileName = element.FileName;
                      this.OwnershipID = element.AttachmentId.toString();
                    }
                  }
                  else {
                    this.ownershipPath = element.Path;
                    this.OwnershipID = element.AttachmentId.toString();
                    this.ownershipFileName = element.FileName;
                    if (this.updateEvidenceFlag) {
                      this.afrEvidenceOwneshp = false;
                      this.bfrEvidenceOwneshp = true;
                    }
                    else {
                      this.aftEvidenceCmptSmry = true;
                      this.bfrEvidenceCmptSmry = false;
                    }
                  }
                  intDocumentCount++;
                  break;
                case "ACCOUNTSUMMARY":
                  this.accountSummaryPath = element.Path;
                  intDocumentCount++;
                  break;
                default:
                  element.DocumentDesc = "OTHERDOCUMENT";
              }
            });

          
            this.otherDocumentsList = this.courtAttachmentsListRes.filter(item => item.DocumentDesc.toUpperCase() == "OTHERDOCUMENT");

            // remove other documents from the list if delete other document after evidence creation



            if (this.updateEvidenceFlag && this.updatedCourtContextResponse && this.updatedCourtContextResponse.length > 0) {

              

              this.updatedCourtContextResponse.forEach(element => {
                if (element.DocumentType.toUpperCase() == "OTHERDOCUMENT") {
                  var otherAddedAttachments = <any>{};
                  otherAddedAttachments.FileName = element.FileName;
                  otherAddedAttachments.Path = element.Path;
                  otherAddedAttachments.Action = element.Action;
                  otherAddedAttachments.AttachmentId = element.AttachmentId;
                  this.otherDocumentsList.push(otherAddedAttachments);
                }
              });
             
              let varDeleteItems;
              varDeleteItems = this.updatedCourtContextResponse.filter(item => item.Action !=null 
                && item.Action != '' && item.Action == "DELETE");

              if(varDeleteItems !=undefined){
                  varDeleteItems.forEach(element => {
                   this.otherDocumentsList = this.otherDocumentsList.filter(x=>x.FileName != element.FileName);
              })
            }
            }
            if (intDocumentCount >= 4) {
              //enable merge documents button
              this.CreateEvidencePacketbtn = true;
            }
            else {
              this.CreateEvidencePacketbtn = false;
              this.MoveCourtbtn = false;
            }

            if (objLstResponseEvidencePacket > -1) {
              if (!this.updateEvidenceFlag) {
                this.evidencePacketBlock = true;
                this.CreateEvidencePacketbtn = false;
                this.isLinksAvailable = false;
                this.isOtherDocuments = false;
                this.MoveCourtbtn = true;
              }
              else {
                this.evidencePacketBlock = false;
                this.CreateEvidencePacketbtn = false;
                this.isLinksAvailable = true;
                this.isOtherDocuments = true;
                this.MoveCourtbtn = false;
                this.updateEvidencePacketbtn = true;
              }
            }
            else {
              this.isLinksAvailable = true;
              this.isOtherDocuments = true;
            }
            this.btnDocketCancelbtn = true;
            this.customerResponseTable = false;
          }
        }
      });
  }


  DeleteDocumentType(attachId: number, documentType: string, documentFilePath: string, fileName: string) {
   
    if (this.updateEvidenceFlag) {
      if (this.updatedCourtContextResponse != null && this.updatedCourtContextResponse.length > 0) {
        if (documentType.toUpperCase() == "OTHERDOCUMENT") {
          if(attachId > 0){
            this.courtAttachmentEvidenceCreation = <any>{};
            this.courtAttachmentEvidenceCreation.DocumentType = "OtherDocument";
            this.courtAttachmentEvidenceCreation.FileName = fileName;
            this.courtAttachmentEvidenceCreation.Action = "DELETE";
            this.courtAttachmentEvidenceCreation.AttachmentId = attachId;
            this.courtAttachmentEvidenceCreation.UserName = this.loginContext.customerContext.userName;
            let updateevidenceContextDocuments = <any>[];
            this.AttachmentContextService.currentContext.subscribe(attachCourtContext => updateevidenceContextDocuments = attachCourtContext);
            if (updateevidenceContextDocuments != null && updateevidenceContextDocuments.length > 0) {
              this.updatedCourtContextResponse.push(updateevidenceContextDocuments);
            }
            else {
              this.AttachmentContextService.changeResponse(this.courtAttachmentEvidenceCreation);
              this.updatedCourtContextResponse.push(this.courtAttachmentEvidenceCreation);
            }
          }
          else{
          this.updatedCourtContextResponse = this.updatedCourtContextResponse.filter(x => x.FileName != fileName);
          }
        }
        else{
          this.updatedCourtContextResponse = this.updatedCourtContextResponse.filter(x => x.DocumentType.toUpperCase() != documentType.toUpperCase());
        }
        if (documentType.toUpperCase() == "COMPLAINTSUMMARY") {
          this.updatedCourtContextResponse = this.updatedCourtContextResponse.filter(x => x.DocumentType.toUpperCase() != "AFFIDAVIT");
        }
      }
      else {
        if (attachId > 0) {
          this.courtAttachmentEvidenceCreation = <any>{};
          this.courtAttachmentEvidenceCreation.DocumentType = "OtherDocument";
          this.courtAttachmentEvidenceCreation.FileName = fileName;
          this.courtAttachmentEvidenceCreation.Action = "DELETE";
          this.courtAttachmentEvidenceCreation.AttachmentId = attachId;
          this.courtAttachmentEvidenceCreation.UserName = this.loginContext.customerContext.userName;
          let updateevidenceContextDocuments = <any>[];
          this.AttachmentContextService.currentContext.subscribe(attachCourtContext => updateevidenceContextDocuments = attachCourtContext);
          if (updateevidenceContextDocuments != null && updateevidenceContextDocuments.length > 0) {
            this.updatedCourtContextResponse.push(updateevidenceContextDocuments);
          }
          else {
            this.AttachmentContextService.changeResponse(this.courtAttachmentEvidenceCreation);
            this.updatedCourtContextResponse.push(this.courtAttachmentEvidenceCreation);
          }
        }
      }
      this.bindEvidenceDocuments();
    }
    else {
      this.courtAttachments = <any>{};
      this.courtAttachments.AttachmentId = attachId;
      this.courtAttachments.CourtCustId = this.longCourtCustId;
      this.courtAttachments.DocumentType = documentType;
      this.courtAttachments.Path = documentFilePath;

      let activityDesc = "";
      if (this.courtAttachments.DocumentType.toString().toUpperCase() == "COMPLAINTSUMMARY") {
        activityDesc = "summary of complaint deleted for the Account #: "
      }
      if (this.courtAttachments.DocumentType.toString().toUpperCase() == "OTHERDOCUMENT") {
        activityDesc = "Other document deleted for the Account #: "
      }
      this.systemActivity = <any>{};
      this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
      this.systemActivity.UserId = this.loginContext.customerContext.userId;
      this.systemActivity.User = this.loginContext.customerContext.userName;
      this.systemActivity.IsViewed = true;
      this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
      this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];;
      this.systemActivity.ActivityTypeDescription = activityDesc + this.longAccountId;
      this.courtAttachments.SystemActivity = this.systemActivity;

      let boolResult = false;
      this.courtService.deleteDocumentType(this.courtAttachments).subscribe(
        res => {
          boolResult = res;
        }, (err) => { }
        , () => {
        
          if (boolResult) {
            if (this.courtAttachments.DocumentType.toString().toUpperCase() == "COMPLAINTSUMMARY") {
              //delete Affidavit document also.
              this.courtAttachments = <any>{};
              this.courtAttachments.AttachmentId = this.affidavitId;
              this.courtAttachments.CourtCustId = this.longCourtCustId;
              this.courtAttachments.DocumentType = "Affidavit";
              this.courtAttachments.Path = this.affidavitPath;
              this.systemActivity.ActivityTypeDescription = "Affidavit deleted for the Account #: " + this.longAccountId;
              this.courtAttachments.SystemActivity = this.systemActivity;
              let boolAffidavitResult = false;
              this.courtService.deleteDocumentType(this.courtAttachments).subscribe(
                res => {
                  boolAffidavitResult = res;
                }, (err) => {
                }, () => {
                  this.bindEvidenceDocuments();
                });
            }
            else {
              if (boolResult) {
                if (this.courtAttachments.DocumentType.toString().toUpperCase() == "COMPLAINTSUMMARY") {
                  this.summarycomplaintPath = '';
                  this.affidavitPath = '';
                }
                else if (this.courtAttachments.DocumentType.toString().toUpperCase() == "OWNERSHIPPROOF") {
                  this.ownershipPath = '';
                  this.showErrorMsg('Proof of Ownership document deleted for the Account #:' + this.longAccountId);
                }
                if (this.courtAttachments.DocumentType.toString().toUpperCase() == "OTHERDOCUMENT") {
                  this.showErrorMsg('Other document deleted for the Account #:' + this.longAccountId);
                }
              }
              this.bindEvidenceDocuments();
            }
          }
        });
    }
  }

  UpdateEvidenceDocuments() {
    
    if (this.updatedCourtContextResponse != null && this.updatedCourtContextResponse.length > 0) {
      this.courtAttachmentEvidenceCreation = <any>{};
      this.courtAttachmentEvidenceCreation.AttachmentId = this.evidencePacketAttachId;
      this.courtAttachmentEvidenceCreation.CourtCustId = this.longCourtCustId;
      this.courtAttachmentEvidenceCreation.DocumentType = "EvidencePacket";
      this.courtAttachmentEvidenceCreation.Path = this.longCourtCustId + "/" + "EvidencePacket.pdf";
      this.courtAttachmentEvidenceCreation.FileName = "EvidencePacket.pdf";
      this.courtAttachmentEvidenceCreation.CustomerId = this.longAccountId;
      this.courtAttachmentEvidenceCreation.Action = "UPDATE";
      this.courtAttachmentEvidenceCreation.UserName = this.loginContext.customerContext.userName;
      this.updatedCourtContextResponse.push(this.courtAttachmentEvidenceCreation);
      // this.systemActivity = <any>{};
      // this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
      // this.systemActivity.UserId = this.loginContext.customerContext.userId;
      // this.systemActivity.User = this.loginContext.customerContext.userName;
      // this.courtAttachmentEvidenceCreation.SystemActivity = this.systemActivity;
      let strMessageSuccess;
      this.courtService.updateEvidencePacket(this.updatedCourtContextResponse)
        .subscribe(
        result => {
          if (result) {
            this.updateEvidenceFlag = false;
            this.AttachmentContextService.changeResponse(null);
            this.updatedCourtContextResponse = [];
            this.updateEvidencePacketbtn=false;
            this.bindEvidenceDocuments();
            this.showSucsMsg('Evidence Packet document updated for the Account :' + this.longAccountId);
          }
        }, (err) => {
          this.AttachmentContextService.changeResponse(null);
          this.updatedCourtContextResponse = [];
          this.showErrorMsg(err.statusText.toString());
        },
        () => {

        })


    }
    else{
      this.showErrorMsg('no changes to update the evidence');

    }
  }


  VieworUploadDocument(documentType: string) {
   
    if (documentType == "OwnershipProof") {
      if (this.ownershipPath == "") {
        this.documentName = "OwnershipProof";
        this.documentDescription = "Proof of Ownership";
        this.boolShowUploadBlock = true;
      }
      else {
        //add view path.
        window.open(this.viewPath + this.ownershipPath);
      }
    }

    if (documentType == "OtherDocument") {
      this.documentName = "OtherDocument";
      this.documentDescription = "Other Document";
      this.boolShowUploadBlock = true;
    }

  }




  //upload file
  uploadFile() {
    
    if (this.cmpFile.nativeElement.files[0]) {
      let file: File = this.cmpFile.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));

      // if ([".pdf"].indexOf(type.toLowerCase()) > 0) {
      if (type.toUpperCase() == ".PDF") {
        if (file.size / 1048576 < this.fileMaxSize) {
          let formData = new FormData();
          formData.append('upload', file);
          formData.append('courtcustid', this.longCourtCustId.toString());
          if (this.updateEvidenceFlag == undefined) {
            this.updateEvidenceFlag = false;
          }
          formData.append('isEvidencePacket', this.updateEvidenceFlag.toString())
          this.courtService.uploadEvidenceFile(formData)
            .subscribe(
            data => {
           
              if (data != null && data !== '' && data.Result) {
                let pathParts: string[] = data.FilePath.split('/');
                this.attachment = <IAttachmentRequest>{};
                this.attachment.FileName = pathParts[pathParts.length - 1];
                this.attachment.Path = data.FilePath;
                this.attachment.Size = file.size;
                this.attachment.FileType = type;
                this.attachmentsList.push(this.attachment);
                this.fileUploadForm.controls['cmpFile'].disable();
                this.uploadMandatory = true;

              } else {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = 'Error while uploading file';
                this.cmpFile.nativeElement.value = '';
              }
            });
        } else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = 'File size should not exceed more than ' + this.fileMaxSize + 'MB';
        }
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = 'Attach files of type pdf only.';
      }
    } else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select file to upload';
    }
  }
  deleteFile(fileName: string) {

    this.courtAttachments = <any>{};
    this.courtAttachments.CourtCustId = this.longCourtCustId;
    this.courtAttachments.FileName = fileName;

    this.courtService.deleteFile(this.courtAttachments)
      .subscribe(
      data => {
      
        if (data) {
          this.attachmentsList = this.attachmentsList.filter((f: IAttachmentRequest) => f.Path !== fileName);
          this.cmpFile.nativeElement.value = '';
          this.attachmentsList = [];
          this.fileUploadForm.controls['cmpFile'].enable();
        } else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = 'Error while deleting file';
        }
      });
    this.uploadMandatory = false;
  }

  submitFile() {
    
    if (this.cmpFile.nativeElement.files[0]) {
      if (this.attachmentsList.length) {
        let docType = this.documentName.toUpperCase();
       
        switch (docType) {
          case "COMPLAINTSUMMARY":
            break;
          case "AFFIDAVIT":
            break;
          case "OWNERSHIPPROOF":
            break;
          case "ACCOUNTSUMMARY":
            break;
          default:
        }

        this.courtAttachments = <any>{};
        this.courtAttachments.CourtCustId = this.longCourtCustId;
        this.courtAttachments.CustomerId = this.longAccountId;
        this.courtAttachments.FileName = this.attachmentsList[0].FileName;
        this.courtAttachments.Path = this.attachmentsList[0].Path;
        this.courtAttachments.DocumentType = this.documentName;
        this.courtAttachments.UserName = this.loginContext.customerContext.userName;

        this.systemActivity = <any>{};
        this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
        this.systemActivity.UserId = this.loginContext.customerContext.userId;
        this.systemActivity.User = this.loginContext.customerContext.userName;
        this.systemActivity.IsViewed = true;
        this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
        this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];;
        this.systemActivity.ActivityTypeDescription = this.documentDescription + " document created for the Account : " + this.longAccountId;
        this.courtAttachments.SystemActivity = this.systemActivity;

        if (this.updateEvidenceFlag) {

          if (docType == "OTHERDOCUMENT") {
            this.courtAttachments.Action = "ADD"
          }
          else {
            this.courtAttachments.Action = "UPDATE"
            this.courtAttachments.AttachmentId = this.summaryComplaintID;
          }

          this.AttachmentContextService.currentContext.subscribe(attachCourtContext => this.updatedComplaintSummary = attachCourtContext);
          if (this.updatedComplaintSummary == null) {
            // this.updateEvidenceFlag = true;
            this.AttachmentContextService.changeResponse(this.courtAttachments);
            this.updatedCourtContextResponse.push(this.courtAttachments);
          }
          else {
            this.updatedCourtContextResponse.push(this.courtAttachments);
          }
          this.cmpFile.nativeElement.value = '';
          this.attachmentsList = [];
          this.fileUploadForm.controls['cmpFile'].enable();
          this.boolShowUploadBlock = false;
          this.bindEvidenceDocuments();
          this.showSucsMsg(this.documentDescription + ' has been created for Account # :' + this.longAccountId);
        }
        else {
          this.courtService.insertCourtDocuments(this.courtAttachments)
            .subscribe(
            result => {
              if (result) {
                // this.attachmentsList = this.attachmentsList.filter((f: IAttachmentRequest) => f.Path !== fileName);
                this.cmpFile.nativeElement.value = '';
                this.attachmentsList = [];
                this.fileUploadForm.controls['cmpFile'].enable();
                this.boolShowUploadBlock = false;
                this.showSucsMsg(this.documentDescription + ' has been created for Account # :' + this.longAccountId);
              }
              else {
                //show error message.
              }
            }, (err) => {
            }, () => {
              this.bindEvidenceDocuments();
            });
        }
      }
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select file to upload';
    }
  }


  cancelUploadFile() {
    this.cmpFile.nativeElement.value = '';
    this.attachmentsList = [];
    this.fileUploadForm.controls['cmpFile'].enable();
    this.boolShowUploadBlock = false;
  }

  docketCancel() {

    this.AttachmentContextService.changeResponse(null);
    this.boolShowUploadBlock = false;
    this.isEvidenceAvailable = false;
    this.isLinksAvailable = false;
    this.isOtherDocuments = false;
    this.updateEvidenceFlag = false;
    this.displayDocumentsBlock = false;
    this.btnDocketCancelbtn = false;
    this.MoveCourtbtn = false;
    this.CreateEvidencePacketbtn=false;
    this.updateEvidencePacketbtn = false;
    this.longAccountId=0;
    this.bindCourtSelectionCustomers(1, false, false);

  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) { }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  bindCourtSelectionCustomers(pageNumber: number, isViewed: boolean, isSearch: boolean) {
   
    this.collectionReqObject = <any>{};
    this.collectionReqObject.CustomerId = this.courtSelectionForm.controls['AccountId'].value == "" ? 0 : this.courtSelectionForm.controls['AccountId'].value;
    this.collectionReqObject.GroupStatus = this.courtSelectionForm.controls['group'].value == '' ? '' : this.courtSelectionForm.controls['group'].value;
    this.collectionReqObject.PageNumber = pageNumber;
    this.collectionReqObject.PageSize = 10;
    this.collectionReqObject.SortDir = 1;
    this.collectionReqObject.SortColumn = "CUSTOMERID";
    this.collectionReqObject.IsSearch = isSearch;
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.IsViewed = isViewed;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
    this.collectionReqObject.SystemActivity = this.systemActivity;

    this.courtService.getCourtEligibleCustomers(this.collectionReqObject).subscribe(
      res => {
        this.collectionResObject = res;
        if (this.collectionResObject && this.collectionResObject.length > 0) {
          this.totalRecordCount = this.collectionResObject[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      });
  }


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bindCourtSelectionCustomers(this.p, false, false);
  }

  resPageChanged(event) {
    this.q = event;
    this.ResstartItemNumber = (((this.q) - 1) * this.RespageItemNumber) + 1;
    this.ResendItemNumber = ((this.q) * this.RespageItemNumber);
    if (this.ResendItemNumber > this.RestotalRecordCount)
      this.ResendItemNumber = this.RestotalRecordCount;
    this.viewResponseHistory(this.courtSelectedCustomer, this.q);
  }

  resetclick() {
    this.p = 1;
    this.startItemNumber = 1;
    this.pageItemNumber = 10;
    this.endItemNumber = 10;
    this.courtSelectionForm.reset();
    this.courtSelectionForm.value.group = '';
    this.bindGroupStatusDropdown();
    this.collectionResObject = null;
    this.bindCourtSelectionCustomers(this.p, false, false);
  }


  viewResponseHistory(courtobject: any, pageNumber: number) {
    this.courtSelectedCustomer = courtobject;
    this.PreCourtCustomerReqObjet = <any>{};
    this.PreCourtCustomerReqObjet.CollectionCustId = courtobject.CollectionCustId;
    this.PreCourtCustomerReqObjet.PageNumber = pageNumber;
    this.PreCourtCustomerReqObjet.PageSize = 10;
    this.PreCourtCustomerReqObjet.SortDir = 1;
    this.PreCourtCustomerReqObjet.SortColumn = "CUSTOMERID";

    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.IsViewed = true;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
    this.PreCourtCustomerReqObjet.SystemActivity = this.systemActivity;

    this.courtService.getActiveCollectionResponseHistoryByCollectionCustId(this.PreCourtCustomerReqObjet).subscribe(
      res => {
        this.customerResponseTable = true;
        this.custoermResObject = res;
        if (this.custoermResObject && this.custoermResObject.length > 0) {
          this.RestotalRecordCount = this.custoermResObject[0].Recount;
          if (this.RestotalRecordCount < this.RespageItemNumber) {
            this.ResendItemNumber = this.RestotalRecordCount;
          }
        }
        //Recount
      });
  }



  createEvidencePacket(courtCustomer: any) {
 
    this.longAccountId = courtCustomer.CustomerId;
    this.longCollectionId = courtCustomer.CollectionCustId;
    let courtCustId = 0;
    this.router.navigate(['/court/court/summarycomplaint', this.longAccountId, this.longCollectionId, courtCustId, false]);
  }


  editEvidencePacket(courtobject: any) {

    this.AttachmentContextService.changeResponse(null);
    this.boolShowUploadBlock = false;
    this.isEvidenceAvailable = false;
    this.isLinksAvailable = false;
    this.isOtherDocuments = false;
    if (courtobject != undefined && courtobject != null) {

      this.longAccountId = courtobject.CustomerId;
      this.longCourtCustId = courtobject.CourtCustId;
      this.longCollectionId = courtobject.CollectionCustId;
      //create account summary and affidavit documents.
      this.CreateAffidavitandAccountSummaryTemplates(true);
    }

  }

  updateEvidencePacket() {
    this.updateEvidenceFlag = true;
    this.bfrEvidenceCmptSmry = true;
    this.aftEvidenceCmptSmry = false;
    this.afrEvidenceAffidavit = false;
    this.bfrEvidenceAffidavit = true;
    this.afrEvidenceOwneshp = false;
    this.bfrEvidenceOwneshp = true;
    this.bindEvidenceDocuments();

  }

  updateDocuments(documentType: string) {
    
    if (documentType.toUpperCase() == "COMPLAINTSUMMARY") {
      this.router.navigate(['/court/court/summarycomplaint', this.longAccountId, this.longCollectionId, this.longCourtCustId, this.updateEvidenceFlag]);
    }
    if (documentType.toUpperCase() == "OWNERSHIPPROOF") {
      this.documentName = "OwnershipProof";
      this.documentDescription = "Proof of Ownership";
      this.selectedAttachId = this.summaryComplaintID
      this.boolShowUploadBlock = true;
    }
    if (documentType.toUpperCase() == "OTHERDOCUMENT") {
      this.documentName = "OtherDocument";
      this.documentDescription = "Other Document";
      this.boolShowUploadBlock = true;
    }
  }


  MergeDocuments() {
    this.courtAttachmentEvidenceCreation = <any>{};
    this.courtAttachmentEvidenceCreation.CourtCustId = this.longCourtCustId;
    this.courtAttachmentEvidenceCreation.CustomerId = this.longAccountId;
    this.courtAttachmentEvidenceCreation.Action = "CREATE";
    this.courtAttachmentEvidenceCreation.UserName = this.loginContext.customerContext.userName;

    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.courtAttachmentEvidenceCreation.SystemActivity = this.systemActivity;
    let strMessageSuccess;
    this.courtService.mergeDocuments(this.courtAttachmentEvidenceCreation)
      .subscribe(
      result => {
        if (result) {
          if (this.courtAttachmentEvidenceCreation.Action == "CREATE")
            strMessageSuccess = "Evidence Packet document has been created for Account # : " + this.longAccountId;
          else
            strMessageSuccess = "Evidence Packet document updated for the Account : " + this.longAccountId;
          this.showSucsMsg(strMessageSuccess);
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString())
      }
      , () => {
        this.bindEvidenceDocuments();
      });
  }

  moveToCustomer() {
    this.moveToCourt = <any>{};
    this.moveToCourt.CourtCustId = this.longCourtCustId;
    this.moveToCourt.Date = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
    this.moveToCourt.UserName = this.loginContext.customerContext.userName;
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.IsViewed = false;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
    this.moveToCourt.SystemActivity = this.systemActivity;

    this.courtService.moveToCourt(this.moveToCourt)
      .subscribe(
      result => {
        if (result) {
            this.showSucsMsg('Account #' +this.longAccountId + ' has been moved to court sucessfully.');
            this.MoveCourtbtn =false;
            this.btnDocketCancelbtn = false;
            this.displayDocumentsBlock = false;
            this.isEvidenceAvailable = false;
            this.bindCourtSelectionCustomers(1, true, false);       
           }
      },
      (err)=>{
            this.showErrorMsg(err.statusText.toString());
      });
  }


  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
