import { Component, OnInit, ViewChild } from '@angular/core';
import { HelpDeskService } from "./services/helpdesk.service";
import { SessionService } from "../shared/services/session.service";
import { Router, ActivatedRoute } from "@angular/router";
import { IGetHistoryRequest } from "./models/gethistoryrequest";
import { IComplaintResponse } from "../shared/models/complaintsresponse";
import { IAttachmentResponse } from "../shared/models/attachmentresponse";
import { IProblemNotesResponse } from "./models/problem-notesresponse";
import { CommonService } from "../shared/services/common.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { LookupTypeCodes, SubSystem, ComplaintStatus, Features, Actions } from "../shared/constants";
import { ISearchRequest } from "./models/searchrequest";
import { INotesRequest } from "./models/notesrequest";
import { IAttachmentRequest } from "../shared/models/attachmentrequest";
import { ICommonResponse } from "../shared/models/commonresponse";
import { ICreatecomplaintrequest } from "../shared/models/createcomplaintrequest";
import { IAssignStatusRequest } from "./models/assignstatusrequest";
import { IProblemStatusResponse } from "./models/problem-statusresponse";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { Location } from '@angular/common';
import { ViolatorContextService } from "../shared/services/violator.context.service";
import { PmPopupComponent } from "./pm-popup.component";
import { IUserEvents } from "../shared/models/userevents";
import { MaterialscriptService } from "../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-view-complaints',
  templateUrl: './view-complaints.component.html',
  styleUrls: ['./view-complaints.component.scss']
})
export class ViewComplaintsComponent implements OnInit {

  problemId: number = 0;
  destPageUrl: string;
  errorAttchMsg: string = '';
  currentSubSystem: string;
  isAfterSearch: boolean;
  customerContextResponse: ICustomerContextResponse;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  cmpHistory: IComplaintResponse[] = [];
  attchments: IAttachmentResponse[] = [];
  activities: IProblemNotesResponse[] = [];
  complaintInfo: IComplaintResponse;
  viewPath: string = '';

  isEditActivity: boolean = false;
  editActivityId: number = 0;
  cmpActivity;

  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  fileMaxSize: number;
  maxFiles: number;
  @ViewChild('cmpFile') cmpFile;
  isAddAttachment: boolean = false;

  isEditComplaint: boolean = false;
  problemTypes: any = [];
  lookuptype: ICommonResponse;
  pmSource: ICommonResponse[];
  pmPriority: ICommonResponse[];
  pmSeverity: ICommonResponse[];
  cmpEditPriority;
  cmpEditSeverity;
  cmpEditSource;
  cmpEditType;
  isChildCmp: boolean;
  cmpStatusMatrix: IProblemStatusResponse;
  userId: number;
  @ViewChild(PmPopupComponent) popupchild;

  showAssignToMasterBtn: boolean;
  showReAssignBtn: boolean;
  showRejectBtn: boolean;
  showResolveBtn: boolean;
  showReopenBtn: boolean;
  showTransferBtn: boolean;
  showOnHoldBtn: boolean;
  showCloseBtn: boolean;
  showAssignBtn: boolean;
  showEditBtn: boolean;
  accountStatus: string;
  contextAccountId: number;
  featureName: string;

  disableRejectButton: boolean = false;
  disableCloseButton: boolean = false;
  disableTransferButton: boolean = false;
  disableReOpenButton: boolean = false;
  disableAssignButton: boolean = false;
  disableAssignToMasterButton: boolean = false;
  disableOnHoldButton: boolean = false;
  disableReAssignButton: boolean = false;
  disableResolveButton: boolean = false;
  disableUpdateButton: boolean = false;

  constructor(private helpDeskService: HelpDeskService, private sessionService: SessionService, private router: Router,
    private commonService: CommonService, private route: ActivatedRoute, private customerContext: CustomerContextService,
    private _location: Location, private violatorContext: ViolatorContextService,
    private materialscriptService: MaterialscriptService) {

    // this.router.events.filter(event => event instanceof NavigationEnd).subscribe(
    //   e => {
    //     console.log(e);
    //   alert(e.toString());
    //   });

  }

  ngOnInit() {
    this.materialscriptService.material();
    // let id = +this._route.snapshot.paramMap.get('id');
    // this.problemId = parseInt(`${id}`);
    $('#pageloader').modal('show');
    this.route.queryParams.subscribe(params => {
      this.problemId = params['id'];
      this.destPageUrl = params['url'];
    });

    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
    }

    if (this.currentSubSystem === SubSystem[SubSystem.CSC]) {
      this.customerContext.currentContext
        .subscribe(customerContext => {
          if (customerContext && customerContext.AccountId > 0) {
            this.isAfterSearch = true;
            this.accountStatus = customerContext.AccountStatus;
            this.contextAccountId = customerContext.ParentId > 0 ? customerContext.ParentId : customerContext.AccountId;
            this.featureName = Features[Features.CSCTRACKCOMPLAINT];
          } else {
            this.isAfterSearch = false;
            this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
          }
        });
    } else if (this.currentSubSystem === SubSystem[SubSystem.TVC]) {
      this.violatorContext.currentContext.subscribe(cntxt => {
        if (cntxt && cntxt.accountId > 0) {
          this.isAfterSearch = true;
          this.contextAccountId = cntxt.accountId;
          this.featureName = Features[Features.TVCTRACKCOMPLAINT];
        } else {
          this.isAfterSearch = false;
          this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
        }
      });
    }

    this.userId = this.sessionService.customerContext.userId;

    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.Complaints)
      .subscribe(res => { this.viewPath = res; });

    this.loadComplaintInfo();
    this.loadActivities();
    this.loadAttachments();
    this.loadHistory();

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
      .subscribe(res => { this.fileMaxSize = res; });

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxAttachments)
      .subscribe(res => { this.maxFiles = res; });

    this.bindDropDowns();

  }


  loadHistory() {
    let historyRequest: IGetHistoryRequest = <IGetHistoryRequest>{};
    historyRequest.ProblemId = this.problemId;
    historyRequest.SortColumn = '';
    historyRequest.SortDirection = 1;
    historyRequest.PageSize = 10;
    historyRequest.PageNumber = 1;

    this.helpDeskService.getHistoryByComplaintID(historyRequest).subscribe(
      res => { this.cmpHistory = res; $('#pageloader').modal('hide'); }
    );
  }

  loadAttachments() {
    this.helpDeskService.getAttachmentsByProblemId(this.problemId.toString()).subscribe(
      res => { this.attchments = res; }
    );
  }

  loadActivities() {
    this.helpDeskService.getNotesByProblemId(this.problemId.toString()).subscribe(
      res => { console.log(res); this.activities = res; }
    );
  }

  loadComplaintInfo() {
    let searchRequest: ISearchRequest = <ISearchRequest>{};
    searchRequest.ProblemId = this.problemId;
    searchRequest.LoginId = this.sessionService._customerContext.loginId;
    searchRequest.CustomerId = 0;
    searchRequest.IsInternal = true;
    searchRequest.IsPageLoad = true;
    searchRequest.UserId = this.sessionService._customerContext.userId;
    searchRequest.UserName = this.sessionService._customerContext.userName;

    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEWCOMPLAINT];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.helpDeskService.getByComplaintId(searchRequest, userEvents).subscribe(
      res => {
        if (res) {
          console.log(res); this.complaintInfo = res;
          // if (this.complaintInfo.RootCauseDate && this.complaintInfo.RootCauseDate.getFullYear() < 1753) {
          //   this.complaintInfo.RootCauseDate = null;
          // }

          if (this.complaintInfo.TransformationProblemId > 0) {
            this.isChildCmp = true;
          } else {
            this.isChildCmp = false;
          }

          if (this.complaintInfo.TransformationEventTypeId !== '') {
            this.showAssignToMasterBtn = false;
          } else {
            this.showAssignToMasterBtn = true;
          }

          if (this.complaintInfo.Status.toUpperCase() === ComplaintStatus[ComplaintStatus.CLOSED]) {
            this.showEditBtn = false;
          } else {
            this.showEditBtn = true;
          }

          if (this.currentSubSystem === this.complaintInfo.SubSystem.toUpperCase() ||
            (this.currentSubSystem === SubSystem[SubSystem.CSC] &&
              this.complaintInfo.SubSystem.toUpperCase() === SubSystem[SubSystem.RTL])) {
            if (!this.isAfterSearch && !this.isChildCmp) {
              if (!(this.destPageUrl && this.destPageUrl.indexOf('invoices-search') > -1)) {
                this.loadStatusMatrix(this.complaintInfo.Status, this.complaintInfo.ProblemType);
                this.loadFeatureActions();
              }
            }
          }
        }
      });
  }

  saveActivities() {
    if (!this.cmpActivity || this.cmpActivity.toString().trim() === '') {
      this.showErrorMsg('Activity is required');
      return;
    }

    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    if (this.editActivityId > 0) {
      let requestNotes: INotesRequest = <INotesRequest>{};
      requestNotes.LogDescription = this.cmpActivity.toString().trim();
      requestNotes.UserName = this.sessionService._customerContext.userName;
      requestNotes.NoteId = this.editActivityId;

      this.helpDeskService.updateProblemNotes(requestNotes, userEvents).subscribe(
        res => {
          if (res) {
            this.isEditActivity = false;
            this.showSucsMsg('Activity has been updated successfully');
            this.cmpActivity = '';
            this.editActivityId = 0;
            this.loadActivities();
          } else {
            this.showErrorMsg('Error while updating activity');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText);
        }
      );
    } else {
      let requestNotes: INotesRequest = <INotesRequest>{};
      requestNotes.LogDescription = this.cmpActivity;
      requestNotes.ProblemId = this.problemId;
      requestNotes.LogType = 'Notes';
      requestNotes.UserName = this.sessionService._customerContext.userName;
      requestNotes.LoginId = this.sessionService._customerContext.loginId;
      requestNotes.UserId = this.sessionService._customerContext.userId;
      requestNotes.WebDisplay = true;

      this.helpDeskService.createProblemNotes(requestNotes, userEvents).subscribe(
        res => {
          if (res) {
            this.isEditActivity = false;
            this.showSucsMsg('Activity has been added successfully');
            this.loadActivities();
            this.cmpActivity = '';
          } else {
            this.showErrorMsg('Error while adding activity');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText);
        }
      );
    }
  }

  saveActivityCancelClick() {
    this.isEditActivity = false;
    this.editActivityId = 0;
    this.cmpActivity = '';
    this.closeAlert();
  }

  uploadFile() {
    if (this.cmpFile.nativeElement.files[0]) {
      let file: File = this.cmpFile.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));

      if ((this.attachmentsList.length + this.attchments.length) < this.maxFiles) {
        if ([".gif", ".jpg", ".jpeg", ".txt", ".xls", ".docx", ".pdf", ".doc", ".png", ".xlsx"].indexOf(type.toLowerCase()) > 0) {
          if (file.size / 1048576 < this.fileMaxSize) {
            let formData = new FormData();
            formData.append('upload', file);
            this.helpDeskService.uploadFile(formData)
              .subscribe(
              data => {
                if (data != null && data !== '' && data.Result) {

                  let pathParts: string[] = data.FilePath.split('/');
                  this.attachment = <IAttachmentRequest>{};
                  this.attachment.FileName = pathParts[pathParts.length - 1];
                  this.attachment.Path = data.FilePath;
                  this.attachment.Size = file.size;
                  this.attachment.FileType = type;
                  this.attachment.ProblemId = this.problemId;
                  this.attachment.UserName = this.sessionService._customerContext.userName;
                  this.attachmentsList.push(this.attachment);
                  this.cmpFile.nativeElement.value = '';
                  this.closeAlertAttch();
                } else {
                  this.showAttchErrMsg('Error while uploading file');
                }
              });
          } else {
            this.showAttchErrMsg('File size should not exceed more than ' + this.fileMaxSize + 'MB');
          }
        } else {
          this.showAttchErrMsg('Attach files of type  jpg, jpeg, txt, gif, docx, pdf, doc, png, xlsx, xls only.');
        }
      } else {
        this.showAttchErrMsg('You can attach maximum of  ' + this.maxFiles + ' attachments');
      }
    } else {
      this.showAttchErrMsg('select file to upload');
    }
  }

  deleteFile(fileName: string) {
    this.helpDeskService.deleteFile(fileName)
      .subscribe(
      data => {
        if (data) {
          this.attachmentsList = this.attachmentsList.filter((f: IAttachmentRequest) => f.Path !== fileName);
        } else {
          this.showAttchErrMsg('Error while deleting file');
        }
      });
  }

  addAttachemnts() {
    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    if (this.attachmentsList && this.attachmentsList.length > 0) {
      this.helpDeskService.addAttachment(this.attachmentsList, userEvents).subscribe(
        res => {
          if (res) {
            this.isAddAttachment = false;
            this.showSucsMsg('Attachment has been added successfully');
            this.attachmentsList = [];
            this.loadAttachments();
          } else {
            this.showErrorMsg('Error while adding attachment');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText);
        }
      );
    } else {
      this.showErrorMsg('There are no attachments to add. Select a file to attach.');
    }
  }

  addAttachemntsCancelClick() {
    this.isAddAttachment = false;
    this.attachmentsList = [];
    this.closeAlert();
  }

  editComplaint(obj: IComplaintResponse) {
    this.cmpEditPriority = obj.Priority;
    this.cmpEditSeverity = obj.Severity;
    this.cmpEditSource = obj.ProblemSource;
    this.cmpEditType = obj.ProblemType;
    this.isEditComplaint = true;
  }

  editActivity(obj: IProblemNotesResponse) {
    this.cmpActivity = obj.LogDesc;
    this.editActivityId = parseInt(obj.NoteId);
    this.isEditActivity = true;
  }

  cancelUpdateClick() {
    this.isEditComplaint = false;
    this.closeAlert();
  }

  bindDropDowns() {
    this.helpDeskService.getProblemTypeLookups().subscribe(
      res => { this.problemTypes = res; }
    );

    this.lookuptype = <ICommonResponse>{};
    this.lookuptype.LookUpTypeCode = "PM_Source";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => {
        res = res.filter((c: ICommonResponse) => c.LookUpTypeCode !== 'Facebook' && c.LookUpTypeCode !== 'Twitter');
        this.pmSource = res;
      });

    this.lookuptype.LookUpTypeCode = "PM_Severity";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => {
        this.pmSeverity = res;
      });

    this.lookuptype.LookUpTypeCode = "PM_Priority";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => { this.pmPriority = res; });
  }

  updateComplaint(objRes: IComplaintResponse) {

    if (objRes.ProblemType == this.cmpEditType &&
      objRes.ProblemSource == this.cmpEditSource &&
      objRes.Priority == this.cmpEditPriority &&
      objRes.Severity == this.cmpEditSeverity) {
      this.showErrorMsg('No modifications are done to update the complaint');
      return;
    }

    let obj: ICreatecomplaintrequest = <ICreatecomplaintrequest>{};
    obj.ProblemId = this.problemId;
    obj.ProblemType = this.cmpEditType;
    obj.ProblemSource = this.cmpEditSource;
    obj.Priority = this.cmpEditPriority;
    obj.Severity = this.cmpEditSeverity;
    obj.UserName = this.sessionService._customerContext.userName;
    obj.LoginId = this.sessionService._customerContext.loginId;
    obj.UserId = this.sessionService._customerContext.userId;
    obj.UserName = this.sessionService._customerContext.userName;

    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.helpDeskService.updateProblemInfo(obj, userEvents).subscribe(
      res => {
        if (res) {
          this.loadComplaintInfo();
          this.showSucsMsg('Complaint Updated Successfully ');
          this.isEditComplaint = false;
          this.cmpEditPriority = '';
          this.cmpEditSeverity = '';
          this.cmpEditSource = '';
          this.cmpEditType = '';
        } else {
          this.showErrorMsg('Error while updating complaint');
        }
      }, (err) => {
        this.showErrorMsg(err.statusText);
      }
    );
  }

  loadStatusMatrix(status: string, problemType: string) {
    const objAssignStatus: IAssignStatusRequest = <IAssignStatusRequest>{};
    objAssignStatus.Status = status;
    objAssignStatus.ProblemType = problemType;
    objAssignStatus.UserId = this.sessionService._customerContext.userId;
    objAssignStatus.SubSystem = this.currentSubSystem;

    this.helpDeskService.getStatusMatrix(objAssignStatus).subscribe(
      res => {
        console.log(res);
        this.cmpStatusMatrix = res;

        this.showAssignBtn = this.cmpStatusMatrix.Assigned === 'True';
        this.showRejectBtn = this.cmpStatusMatrix.Rejected === 'True';
        this.showResolveBtn = this.cmpStatusMatrix.Resolved === 'True';
        this.showReAssignBtn = this.cmpStatusMatrix.Reassigned === 'True';
        this.showReopenBtn = this.cmpStatusMatrix.Reopened === 'True';
        this.showTransferBtn = this.cmpStatusMatrix.Transferred === 'True';
        this.showAssignToMasterBtn = this.cmpStatusMatrix.Merge === 'True';

        if (this.destPageUrl && this.destPageUrl.indexOf('front-desk') > -1) {
          this.showTransferBtn = false;
          this.showAssignBtn = false;
          this.showReAssignBtn = false;
          this.showReopenBtn = false;
          this.showEditBtn = false;
          this.showAssignToMasterBtn = false;
        } else {
          this.showTransferBtn = this.cmpStatusMatrix.Transferred === 'True';
          this.showAssignBtn = this.cmpStatusMatrix.Assigned === 'True';
          this.showReAssignBtn = this.cmpStatusMatrix.Reassigned === 'True';
          this.showReopenBtn = this.cmpStatusMatrix.Reopened === 'True';
          this.showAssignToMasterBtn = this.cmpStatusMatrix.Merge === 'True';
        }

        this.showOnHoldBtn = this.cmpStatusMatrix.Onhold === 'True';

        if (status.toUpperCase() === ComplaintStatus[ComplaintStatus.RESOLVED]) {
          if (this.cmpStatusMatrix.secondReviewRequired === 'True') {
            if (this.cmpStatusMatrix.DesignationId > 3) {
              this.showCloseBtn = this.cmpStatusMatrix.secondReviewRequired === 'True';
            } else if (this.cmpStatusMatrix.DesignationId <= 3) {
              this.showCloseBtn = false;
            }
          } else {
            this.showCloseBtn = true;
          }
        } else {
          this.showCloseBtn = this.cmpStatusMatrix.Closed === 'True';
        }
      }
    );

  }

  AssignMaster() {

    let selectedComplaintList: IComplaintResponse[] = <IComplaintResponse[]>[];
    let compRes = <IComplaintResponse>{};
    compRes.ProblemId = this.complaintInfo.ProblemId;
    compRes.TicketId = this.complaintInfo.TicketId;
    selectedComplaintList.push(compRes);

    console.log(selectedComplaintList);
    this.helpDeskService.changeResponse(selectedComplaintList);
    this.router.navigateByUrl(this.currentSubSystem.toLowerCase() + '/helpdesk/assign-to-master-complaints');

  }

  backClick() {
    // this.router.navigateByUrl(this.currentSubSystem.toLowerCase() + '/manage-complaints');
    if (this.destPageUrl && this.destPageUrl.indexOf('csc/customerdetails/transaction-activities') > -1) {
      this.router.navigate(["/csc/customerdetails/transaction-activities/"], { queryParams: { fromSearch: true } });
    } else {
      this._location.back();
    }
  }

  closeAlert(): void {
    this.msgFlag = false;
  }

  closeAlertAttch(): void {
    this.msgFlag = false;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showAttchErrMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  addAttchPnlClick(): void {
    this.isAddAttachment = true;
    this.msgFlag = false;
  }

  onholdClick() {
    this.popupchild.accessContext("ONHOLD");
    this.createCmplContxt();
    $('#onhold-dialog').modal('show');
  }

  reopenClick() {
    this.popupchild.accessContext("REOPENED");
    this.createCmplContxt();
    $('#reopen-dialog').modal('show');
  }

  transferClick() {
    this.popupchild.accessContext("TRANSFERRED");
    this.createCmplContxt();
    $('#transfer-dialog').modal('show');
  }

  assignClick() {
    this.popupchild.accessContext("ASSIGNED");
    this.createCmplContxt();
    $('#assign-dialog').modal('show');
  }

  reassignClick() {
    this.popupchild.accessContext("REASSIGNED");
    this.createCmplContxt();
    $('#reassign-dialog').modal('show');
  }

  resolveClick() {
    this.popupchild.accessContext("RESOLVED");
    this.createCmplContxt();
    $('#resolve-dialog').modal('show');
  }

  rejectClick() {
    this.popupchild.accessContext("REJECTED");
    this.createCmplContxt();
    $('#reject-dialog').modal('show');
  }

  closeClick() {
    this.popupchild.accessContext("CLOSED");
    this.createCmplContxt();
    $('#close-dialog').modal('show');
  }

  createCmplContxt() {
    let obj: IComplaintResponse = <IComplaintResponse>{};
    obj = this.complaintInfo;
    obj.ProblemId = this.problemId;

    const cmpResList: IComplaintResponse[] = [];
    cmpResList.push(obj);
    this.helpDeskService.changeResponse(cmpResList);
  }

  onStatusChange(msg: string): void {
    this.showSucsMsg(msg);
    this.loadComplaintInfo();
  }

  loadFeatureActions(): void {
    this.disableAssignToMasterButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ASSIGNTOMASTER], this.accountStatus);
    this.disableOnHoldButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ONHOLD], this.accountStatus);
    this.disableReOpenButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REOPEN], this.accountStatus);
    this.disableTransferButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.TRANSFER], this.accountStatus);
    this.disableAssignButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ASSIGN], this.accountStatus);
    this.disableReAssignButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REASSIGN], this.accountStatus);
    this.disableResolveButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.RESOLVE], this.accountStatus);
    this.disableRejectButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REJECT], this.accountStatus);
    this.disableCloseButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.CLOSE], this.accountStatus);
    this.disableUpdateButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.UPDATE], this.accountStatus);
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
