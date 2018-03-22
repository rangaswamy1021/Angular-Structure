import { IRefundQueue } from './../refunds/models/RefundQueue';
import { Router } from '@angular/router';

import { ISystemActivities } from './../shared/models/systemactivitiesrequest';
import { IAssignStatusRequest } from './models/assignstatusrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HelpDeskService } from './services/helpdesk.service';
import { IUserresponse } from './../shared/models/userresponse';
import { SessionService } from './../shared/services/session.service';
import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
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
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-front-desk',
  templateUrl: './front-desk.component.html',
  styleUrls: ['./front-desk.component.scss']
})
export class FrontDeskComponent implements OnInit {
  invalid: boolean;
  timePeriod: Date[];
  selectedSearchList: FormGroup;
  reqAssignStatus: ICustomerContextResponse;
  customerContextResponse: ICustomerContextResponse;
  users: any;
  internalUsers: IInternalUsers[] = [];
  subSystem: string = SubSystem[SubSystem.CSC];

  isParentSelected: boolean;
  selectedCheckboxsCountperPage: any;
  errorMessage: string;
  errorBlock: boolean = false;
  successBlock: boolean = false;
  successMessage: string;
  selectedComplaintList: IComplaintResponse[] = <IComplaintResponse[]>[];
  selectedRow: number;
  selected: boolean = false;

  statusTypes: any[];
  p: number;
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
  frontDesk: FormGroup;
  complaintResp: IComplaintResponse;
  currentSubSystem: string;
  selectedStatusType;
  featureName: string;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px', width: '260px',
    inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };

  disableRejectButton: boolean = false;
  disableCloseButton: boolean = false;
  disableOnHoldButton: boolean = false;
  disableResolveButton: boolean = false;
  @ViewChild(PmPopupComponent) popupchild;

  constructor(private helpService: HelpDeskService, private commonService: CommonService, private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService) {
  }
  //paging
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
    //  this.dateBind();
    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCFRONTDESK];
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
      this.featureName = Features[Features.TVCFRONTDESK];
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCFRONTDESK];
    }

    if (this.dataLength < this.pageItemNumber) {
      this.endItemNumber = this.dataLength
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

    this.frontDesk = new FormGroup({
      'ticketid': new FormControl(''),
      'CmpStatus': new FormControl(''),
      'CmpType': new FormControl(''),
      'timePeriod': new FormControl('', Validators.required),
      'CmpSeverity': new FormControl(''),
      'CmpPriority': new FormControl(''),
      'selectedSearchList': new FormControl('')
    });
    this.bindDropDowns();


    this.disableOnHoldButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.ONHOLD], "");
    this.disableResolveButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.RESOLVE], "");
    this.disableRejectButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.REJECT], "");
    this.disableCloseButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.CLOSE], "");

    let date = new Date();
    this.frontDesk.patchValue({
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
    this.managesearch(false, true, "");
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
        console.log(res);
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
        this.pmStatus = this.pmStatus.filter((x: ICommonResponse) => x.LookUpTypeCode != "Opened" && x.LookUpTypeCode != "Transferred")
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
        this.managesearch(true, false, this.selectedStatusType);
      } else {
        this.selectedStatusType = "";
        this.managesearch(false, true, this.selectedStatusType);
      }
    }
    else {
      this.selectedStatusType = "";
    }
  }

  searchClick() {
    this.managesearch(true, false, "");
  }

  managesearch(isSearch: boolean, isPageLoad: boolean, selectedStatusType) {
    if (this.frontDesk.valid) {
      this.searchComplaint = <ISearchRequest>{};
      this.searchComplaint.TicketId = this.frontDesk.controls['ticketid'].value;
      this.searchComplaint.ProblemType = this.frontDesk.controls['CmpType'].value;
      this.searchComplaint.status = this.frontDesk.controls['CmpStatus'].value;
      this.searchComplaint.Priority = this.frontDesk.controls['CmpPriority'].value;
      this.searchComplaint.Severity = this.frontDesk.controls['CmpSeverity'].value;
      this.searchComplaint.SortColumn = 'TICKETID';
      this.searchComplaint.SortDirection = 0;
      this.searchComplaint.PageSize = 100;
      this.searchComplaint.PageNumber = 1;
      this.searchComplaint.LoginId = this.context._customerContext.loginId;
      this.searchComplaint.UserName = this.context._customerContext.userName;
      this.searchComplaint.UserId = this.context._customerContext.userId;
      this.searchComplaint.IsFlag = true;
      this.searchComplaint.IsInternal = true;
      this.searchComplaint.IsParent = false;
      this.searchComplaint.IsAssigned = false;
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
        let fromDate = new Date();
        let toDate = new Date();
        let strDate = this.frontDesk.controls['timePeriod'].value;
        debugger;
        if (strDate != "" && strDate != null) {
          fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
          toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
          this.searchComplaint.startEffectiveDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          let endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59);
          this.searchComplaint.endEffectiveDate = endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        }


        // this.searchComplaint.startEffectiveDate = new Date(this.timePeriod[0]).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        // const dt: Date = new Date();
        // const endDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
        // this.searchComplaint.endEffectiveDate = endDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
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
          if(res){
          this.search = this.search.filter((x: IComplaintResponse) => x.Status != "Opened" && x.Status != "Transferred")
          this.dataLength = this.search.length;
          }
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        
        });
    }
    else {
      this.validateAllFormFields(this.frontDesk);
    }
  }
  resetClick() {
    debugger;
    // if (this.timePeriod[0] != this.timePeriod[1]) {

    // }
    if (this.frontDesk.get('ticketid').value != '' || this.frontDesk.get('CmpType').value != '' || this.frontDesk.get('CmpStatus').value != '' || this.frontDesk.get('CmpPriority').value != '' || this.frontDesk.get('CmpSeverity').value != '') {

      this.frontDesk.controls['ticketid'].reset();
      this.frontDesk.controls['CmpType'].reset();
      this.frontDesk.controls['CmpStatus'].reset();
      this.frontDesk.controls['CmpPriority'].reset();
      this.frontDesk.controls['CmpSeverity'].reset();
    }
    let date = new Date();
    this.frontDesk.patchValue({
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
    this.managesearch(false, true, "");
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

  resolveClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("RESOLVE");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#resolve-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#resolve-dialog').modal('hide');
    }
  }
  rejectClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("REJECT");
      this.helpService.changeResponse(this.selectedComplaintList);
      $('#reject-dialog').modal('show');
    } else {
      this.showErrorMsg('Please select atleast one Complaint');
      $('#reject-dialog').modal('hide');
    }
  }
  closeClick() {
    if (this.selectedComplaintList.length > 0) {
      this.popupchild.accessContext("CLOSE");
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
    this.router.navigate([url], { queryParams: { id: problemId, url: this.router.url } });
  }

  createComplaint() {
    this.router.navigateByUrl(this.currentSubSystem.toLowerCase() + '/helpdesk/create-complaint');
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

  onDateRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalid = true;
    }
    else
      this.invalid = false;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}

export interface IInternalUsers {
  id: number;
  name: string;
}