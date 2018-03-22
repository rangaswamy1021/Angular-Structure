import { IRefundQueue } from './../refunds/models/RefundQueue';
import { Router, ActivatedRoute } from '@angular/router';
import { ISystemActivities } from './../shared/models/systemactivitiesrequest';
import { IAssignStatusRequest } from './models/assignstatusrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HelpDeskService } from './services/helpdesk.service';
import { IUserresponse } from './../shared/models/userresponse';
import { SessionService } from './../shared/services/session.service';
import { Component, OnInit, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ICommonResponse } from '../shared/models/commonresponse';
import { ISearchRequest } from './models/searchrequest';
import { IComplaintResponse } from '../shared/models/complaintsresponse';
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { IPaging } from "../shared/models/paging";
import { SubSystem, ComplaintStatus, Features, Actions, defaultCulture } from "../shared/constants";
import { PmPopupComponent } from "./pm-popup.component";
import { debug } from 'util';
import { IUserEvents } from '../shared/models/userevents';
import { CommonService } from '../shared/services/common.service';
import { ViolatorContextService } from '../shared/services/violator.context.service';
import { IMyDrpOptions, IMyInputFieldChanged, IMyInputFocusBlur } from "mydaterangepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-manage-complaints',
  templateUrl: './manage-complaints.component.html',
  styleUrls: ['./manage-complaints.component.scss']
})
export class ManageComplaintsComponent implements OnInit {
  invalidDateRange: boolean;
  selectedSearchList: FormGroup;
  reqAssignStatus: ICustomerContextResponse;
  customerContextResponse: ICustomerContextResponse;
  users: any;
  internalUsers: IInternalUsers[] = [];
  subSystem: string = SubSystem[SubSystem.CSC];

  isParentSelected: boolean;
  selectedCheckboxsCountperPage: any;
  errorMessage: string;
  successMessage: string;
  selectedComplaintList: IComplaintResponse[] = <IComplaintResponse[]>[];
  selectedRow: number;
  selected: boolean = false;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  statusTypes: any[];
  Paging: IPaging;
  problemid: number;
  objICustomerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  pmPriority: ICommonResponse[];
  pmSeverity: ICommonResponse[];
  pmStatus: ICommonResponse[];
  timePeriodValue: Date[];
  lookuptype: ICommonResponse;
  problemTypes: any;
  searchComplaint: ISearchRequest;
  search: IComplaintResponse[];
  childSearch: IComplaintResponse[];
  manageComplaints: FormGroup;
  complaintResp: IComplaintResponse;
  currentSubSystem: string;
  selectedStatusType;
  featureName: string;
  accountStatus: string;
  contextAccountId: number;
  checkactive: string;

  disableCreateButton: boolean = false;
  disableRejectButton: boolean = false;
  disableCloseButton: boolean = false;
  disableTransferButton: boolean = false;
  disableReOpenButton: boolean = false;
  disableAssignButton: boolean = false;
  disableAssignToMasterButton: boolean = false;
  disableOnHoldButton: boolean = false;
  disableReAssignButton: boolean = false;
  disableResolveButton: boolean = false;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;


  @ViewChild(PmPopupComponent) popupchild;

  constructor(private helpService: HelpDeskService,private route: ActivatedRoute, private commonService: CommonService, private context: SessionService, private router: Router,
    private customerContext: CustomerContextService, private violatorContext: ViolatorContextService, private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService) {
  }
  //@Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();
  //paging
  p: number;
  pageItemNumber: number = 10;
  dataLength: number;
  currentPage: number = 1;
  endItemNumber: number;
  startItemNumber: number = 1;
  //

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    // this.dateBind();

    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
    }

    console.log('currentSubSystem:' + this.currentSubSystem);
    if (this.currentSubSystem === SubSystem[SubSystem.CSC]) {
      this.customerContext.currentContext
        .subscribe(customerContext => {
          if (customerContext && customerContext.AccountId > 0) {
            this.accountStatus = customerContext.AccountStatus;
            this.contextAccountId = customerContext.AccountId;
            this.featureName = Features[Features.CSCCREATECOMPLAINT];
            console.log(customerContext);
          } else {
            this.contextAccountId = 0;
            this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
          }
        });
    } else if (this.currentSubSystem === SubSystem[SubSystem.TVC]) {
      this.violatorContext.currentContext.subscribe(cntxt => {
        if (cntxt && cntxt.accountId > 0) {
          this.contextAccountId = cntxt.accountId;
          this.featureName = Features[Features.TVCCREATECOMPLAINT];
        } else {
          this.contextAccountId = 0;
          this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
        }
      });
    }

    if (this.dataLength < this.pageItemNumber) {
      this.endItemNumber = this.dataLength
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

    this.manageComplaints = new FormGroup({
      'ticketid': new FormControl(''),
      'CmpStatus': new FormControl(''),
      'CmpType': new FormControl(''),
      'timePeriod': new FormControl('', [Validators.required]),
      'CmpSeverity': new FormControl(''),
      'CmpPriority': new FormControl(''),
      'keyword': new FormControl(''),
      'selectedSearchList': new FormControl(''),
      'checkactive': new FormControl('')
    });
    this.setDateRange();
    this.bindDropDowns();
    this.managesearch(false, true, "", this.p);

    this.disableCreateButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.CREATE], this.accountStatus);
    this.disableAssignToMasterButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ASSIGNTOMASTER], this.accountStatus);
    this.disableOnHoldButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ONHOLD], this.accountStatus);
    this.disableReOpenButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REOPEN], this.accountStatus);
    this.disableTransferButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.TRANSFER], this.accountStatus);
    this.disableAssignButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ASSIGN], this.accountStatus);
    this.disableReAssignButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REASSIGN], this.accountStatus);
    this.disableResolveButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.RESOLVE], this.accountStatus);
    this.disableRejectButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REJECT], this.accountStatus);
    this.disableCloseButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.CLOSE], this.accountStatus);


    this.route.queryParams.subscribe(param => {
      if (param["flag"] == "1")
        this.showSucsMsg("Complaint(s) has been assigned to master successfully");
    });

  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setDateRange(): void {
    // Set date range (today) using the patchValue function
    let date = new Date();
    this.manageComplaints.patchValue({
      timePeriod: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  bindDropDowns() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.helpService.getProblemTypeLookups().subscribe(
      res => {
        this.problemTypes = res;

      }
    );

    this.lookuptype = <ICommonResponse>{};
    this.lookuptype.LookUpTypeCode = 'PM_Severity';
    this.helpService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => {
        this.pmSeverity = res;
      });
    this.lookuptype.LookUpTypeCode = 'PM_Status';
    this.helpService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => {
        this.pmStatus = res;
      });
    this.lookuptype.LookUpTypeCode = 'PM_Priority';
    this.helpService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => { this.pmPriority = res; });
  }

  onSelectionStatusTypeChange(statusType, event) {
    if (event.target.checked) {
      if (statusType != "") {
        this.selectedStatusType = statusType;
        console.log("selectedTransTypeValue: ", this.selectedStatusType.value);
        this.checksearch(true, false, this.selectedStatusType);
      } else {
        this.selectedStatusType = null;
        //this.checksearch(false, true, this.selectedStatusType);
        this.managesearch(false, true, "", this.p);
      }
    }
    else {
      this.selectedStatusType = "";
      //this.checksearch(false, true, this.selectedStatusType);
      this.managesearch(true, false, "", this.p);
    }
  }


  checksearch(isSearch: boolean, isPageLoad: boolean, selectedStatusType) {
    console.log(this.manageComplaints.controls['CmpStatus'].value);
    let strDate = this.manageComplaints.controls['timePeriod'].value;
    this.searchComplaint = <ISearchRequest>{};
    this.searchComplaint.TicketId = this.manageComplaints.controls['ticketid'].value;
    this.searchComplaint.ProblemType = this.manageComplaints.controls['CmpType'].value;
    this.searchComplaint.Priority = this.manageComplaints.controls['CmpPriority'].value;
    this.searchComplaint.Severity = this.manageComplaints.controls['CmpSeverity'].value;
    this.searchComplaint.Keyword = this.manageComplaints.controls['keyword'].value;
    this.searchComplaint.SortColumn = 'TICKETID';
    this.searchComplaint.SortDirection = 1;
    this.searchComplaint.PageSize = 100;
    this.searchComplaint.PageNumber = 1;
    this.searchComplaint.LoginId = this.context._customerContext.loginId;
    this.searchComplaint.UserName = this.context._customerContext.userName;
    this.searchComplaint.UserId = this.context._customerContext.userId;
    this.searchComplaint.IsFlag = true;
    this.searchComplaint.IsInternal = true;
    this.searchComplaint.IsParent = false;
    this.searchComplaint.IsAssigned = false;
    this.searchComplaint.status = selectedStatusType;
    console.log(selectedStatusType);
    this.searchComplaint.OwnerId = this.context._customerContext.userId;

    if (isPageLoad) {
      const dt: Date = new Date();
      const starttDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const endDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
      this.searchComplaint.startEffectiveDate = starttDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.endEffectiveDate = endDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.IsPageLoad = true;
      this.searchComplaint.IsSearch = false
    }
    else if (isSearch) {
      let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
      let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
      this.searchComplaint.startEffectiveDate = new Date(fromDate).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.endEffectiveDate = new Date(toDate).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.IsPageLoad = false;
      this.searchComplaint.IsSearch = true;
    }
    this.searchComplaint.SubSystem = this.currentSubSystem;
    this.searchComplaint.ActivitySource = 'Internal';
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.helpService.search(this.searchComplaint, userEvents).subscribe(
      res => {
        this.search = res;
        if (this.search) {
          this.dataLength = this.search[0].RecCount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
      });
  }

  searchClick() {
    if (this.manageComplaints.valid) {
      this.managesearch(true, false, "", this.p);
    }
  }

  managesearch(isSearch: boolean, isPageLoad: boolean, selectedStatusType, pageNumber: number) {
    this.searchComplaint = <ISearchRequest>{};
    var ticketid = this.manageComplaints.controls['ticketid'].value;
    if (ticketid != "" && ticketid != null)
          var ticketid = (this.manageComplaints.controls['ticketid'].value).trim();
    this.searchComplaint.TicketId = ticketid;
    //this.searchComplaint.TicketId = this.manageComplaints.controls['ticketid'].value;
    this.searchComplaint.ProblemType = this.manageComplaints.controls['CmpType'].value;
    this.searchComplaint.status = this.manageComplaints.controls['CmpStatus'].value;
    this.searchComplaint.Priority = this.manageComplaints.controls['CmpPriority'].value;
    this.searchComplaint.Severity = this.manageComplaints.controls['CmpSeverity'].value;
    this.searchComplaint.Keyword = this.manageComplaints.controls['keyword'].value;
    this.searchComplaint.SortColumn = 'TICKETID';
    this.searchComplaint.SortDirection = 1;
    this.searchComplaint.PageSize = 10000;
    this.searchComplaint.PageNumber = pageNumber;
    this.searchComplaint.LoginId = this.context._customerContext.loginId;
    this.searchComplaint.UserName = this.context._customerContext.userName;
    this.searchComplaint.UserId = this.context._customerContext.userId;
    this.searchComplaint.IsFlag = true;
    this.searchComplaint.IsInternal = true;
    this.searchComplaint.IsParent = false;
    this.searchComplaint.IsAssigned = false;
    this.searchComplaint.OwnerId = 0;

    if (isPageLoad) {
      const dt: Date = new Date();
      const starttDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const endDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
      this.searchComplaint.startEffectiveDate = starttDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.endEffectiveDate = endDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.IsPageLoad = true;
      this.searchComplaint.IsSearch = false;
    }
    else if (isSearch) {
       let strDate=this.manageComplaints.controls['timePeriod'].value;
       if(strDate!=null || strDate!=""){
         let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
           let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
       
      this.searchComplaint.startEffectiveDate = new Date(fromDate).toLocaleString(defaultCulture).replace(/\u200E/g,"");
       }
      //this.searchComplaint.startEffectiveDate = new Date(this.timePeriodValue[0]).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      const dt: Date = new Date();
      const endDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
      let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year).setHours(23,59,59,59);
      
      this.searchComplaint.endEffectiveDate = new Date(toDate).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.searchComplaint.IsPageLoad = false;
      this.searchComplaint.IsSearch = true;
    }
    this.searchComplaint.SubSystem = this.currentSubSystem;
    this.searchComplaint.ActivitySource = 'Internal';
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.helpService.search(this.searchComplaint, userEvents).subscribe(
      res => {
        this.search = res;
        if (this.search) {
          this.dataLength = this.search[0].RecCount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
        this.selectedComplaintList = [];
      });
  }
  resetClick() {
    this.setDateRange();
    if (this.manageComplaints.get('ticketid').value != '' || this.manageComplaints.get('CmpType').value != '' || this.manageComplaints.get('CmpStatus').value != '' || this.manageComplaints.get('CmpPriority').value != '' || this.manageComplaints.get('CmpSeverity').value != '' || this.manageComplaints.get('keyword').value != '' || this.manageComplaints.get('checkactive').value != '') {

      this.manageComplaints.controls['ticketid'].reset();
      this.manageComplaints.controls['CmpType'].reset();
      this.manageComplaints.controls['CmpStatus'].reset();
      this.manageComplaints.controls['CmpPriority'].reset();
      this.manageComplaints.controls['CmpSeverity'].reset();
      this.manageComplaints.controls['keyword'].reset();
      this.manageComplaints.controls['checkactive'].reset();
    }
    this.pageItemNumber = 10;
    this.managesearch(false, true, "", this.p);
    this.materialscriptService.material();
  }
  checkboxCheckedEvent(search: IComplaintResponse, event) {
    var index = this.selectedComplaintList.findIndex(x => x.ProblemId == search.ProblemId);
    if (event.target.checked) {
      if (index == -1) {
        this.selectedComplaintList.push(search);
        this.selectedCheckboxsCountperPage++;
        search.isSearchBoxSelected = true;
        if (this.selectedCheckboxsCountperPage === this.search.length) {
          this.isParentSelected = true;
        }
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedCheckboxsCountperPage--;
        this.selectedComplaintList.splice(index, 1);
        search.isSearchBoxSelected = false;
      }
    }
  }

  onholdClick() {
    if (this.selectedComplaintList.length > 0) {
      console.log(this.selectedComplaintList);
      this.popupchild.accessContext("ONHOLD");

      this.helpService.changeResponse(this.selectedComplaintList);

      $('#onhold-dialog').modal('show');
    }
    else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#onhold-dialog').modal('hide');
    }
  }

  reopenClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("REOPENED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#reopen-dialog').modal('show');
    }
    else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#reopen-dialog').modal('hide');
    }
  }
  transferClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("TRANSFERRED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#transfer-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#transfer-dialog').modal('hide');
    }
  }
  assignClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("ASSIGNED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#assign-dialog').modal('show');
    }
    else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#assign-dialog').modal('hide');
    }
  }
  reassignClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("REASSIGNED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#reassign-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#reassign-dialog').modal('hide');
    }
  }
  resolveClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("RESOLVED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#resolve-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#resolve-dialog').modal('hide');
    }
  }
  rejectClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("REJECTED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#reject-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#reject-dialog').modal('hide');
    }
  }
  closeClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("CLOSED");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#close-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#close-dialog').modal('hide');
    }
  }

  viewComplaint(problemId) {
    $('#mymodal').modal('hide');
    let url = this.currentSubSystem.toLowerCase() + '/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: problemId } });
  }


  AssignMaster() {
    if (this.selectedComplaintList.length > 0) {
      this.helpService.changeResponse(this.selectedComplaintList);

      let cmpUrl = this.currentSubSystem.toLowerCase() + '/helpdesk/assign-to-master-complaints';
      this.router.navigate([cmpUrl], { queryParams: { url: this.currentSubSystem.toLowerCase() + '/helpdesk/manage-complaints' } });
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
    }
  }

  linkClick(problemid) {
    this.searchComplaint = <ISearchRequest>{};
    this.searchComplaint.ProblemId = problemid;
    this.searchComplaint.IsParent = true;
    this.searchComplaint.SortColumn = 'TICKETID';
    this.searchComplaint.SortDirection = 1;
    this.searchComplaint.PageSize = 10
    this.searchComplaint.PageNumber = 1;
    this.searchComplaint.startEffectiveDate = new Date();
    this.searchComplaint.endEffectiveDate = new Date();
    this.helpService.search(this.searchComplaint).subscribe(
      res => {
        this.childSearch = res;
        console.log(res);
      });

  }

  createComplaint() {
    const url = this.currentSubSystem.toLowerCase() + '/helpdesk/create-complaint';
    this.router.navigate([url], { queryParams: { url: this.router.url } });
  }

  onSuccess(): void {
    //this.managesearch(false, true, "", this.p);
    this.managesearch(true, false, "", this.p);
  }

  showSucsMsg(msg: string): void {
    this.errorMessage = '';
    this.successMessage = msg;
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }
  onStatusChange(msg: string): void {

    this.showSucsMsg(msg);
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }
  onInputFieldRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

  }
  onInputFocusBlur(event: IMyInputFocusBlur): void {
    if (event.value == "")
      this.invalidDateRange = false;
  }

}

export interface IInternalUsers {
  id: number;
  name: string;
}