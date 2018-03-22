import { ComplaintContextService } from './../shared/services/complaint.context.service';
import { IComplaintContextresponse } from './../shared/models/complaintContextresponse';
import { Router, ActivatedRoute } from '@angular/router';
import { ComplaintStatus, SubSystem, Features, Actions, defaultCulture } from './../shared/constants';
import { IComplaintResponse } from './../shared/models/complaintsresponse';
import { ISearchRequest } from './models/searchrequest';
import { ICommonResponse } from './../shared/models/commonresponse';
import { IUserresponse } from './../shared/models/userresponse';
import { IAssignStatusRequest } from './models/assignstatusrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionService } from './../shared/services/session.service';
import { HelpDeskService } from './services/helpdesk.service';
import { Component, OnInit } from '@angular/core';
import { IPaging } from "../shared/models/paging";
import { IUserEvents } from '../shared/models/userevents';
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";


@Component({
  selector: 'app-assign-to-master-complaints',
  templateUrl: './assign-to-master-complaints.component.html',
  styleUrls: ['./assign-to-master-complaints.component.scss']
})
export class AssignToMasterComplaintsComponent implements OnInit {
  invalid: boolean;
  Paging: IPaging;
  sessionContextResponse: IUserresponse;
  assignToMaster: FormGroup;
  mergeObj: IAssignStatusRequest;
  problemIds = [];
  errorBlock: boolean;
  successBlock: boolean;
  errorMessage: string;
  successMessage: string;
  pmPriority: ICommonResponse[];
  pmSeverity: ICommonResponse[];
  pmStatus: ICommonResponse[];
  timePeriodValue: Date[];
  lookuptype: ICommonResponse;
  problemTypes: any;
  searchComplaint: ISearchRequest;
  notes: string;
  search: IComplaintResponse[];
  objComplaintsSearch: ISearchRequest;
  selectedRow: number;
  selected: boolean = false;
  arrProblemId = [];
  arrTicketID = [];
  isParentChecked: boolean;
  selectedComplaintList: IAssignStatusRequest[] = <IAssignStatusRequest[]>[];
  responseid: number;
  complaintResp: IComplaintResponse[];
  currentSubSystem: string;
  referrenceURL: string;
  featureName: string;
  complaintContext: IComplaintContextresponse;
  mergeComplaints: IAssignStatusRequest = <IAssignStatusRequest>{};
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px', width: '260px',
    inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  constructor(private helpService: HelpDeskService, private context: SessionService, private router: Router,
    private complaintContextService: ComplaintContextService, private route: ActivatedRoute, private materialscriptService: MaterialscriptService) {
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.helpService.currentContext
      .subscribe(customerContext => { this.complaintResp = customerContext; }
      );
    console.log("Assign to context:" + this.context.customerContext);

    // this.dateBind();

    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
      this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
    }
    this.route.queryParams.subscribe(p => {
      this.referrenceURL = p["url"];
    })

    console.log("Assign to master:" + this.complaintResp);

    //const token = localStorage.getItem('access_token');
    //console.log(token);
    this.assignToMaster = new FormGroup({
      'ticketid': new FormControl(''),
      'CmpStatus': new FormControl(''),
      'CmpType': new FormControl(''),
      'timePeriod': new FormControl('', Validators.required),
      'CmpSeverity': new FormControl(''),
      'CmpPriority': new FormControl(''),
      'selectedSearchList': new FormControl('')
    });

    this.bindDropDowns();
    if (this.complaintResp.length > 0) {
      this.problemIdList();
    }


    this.complaintContextService.currentContext.subscribe(res => {
      if (res && res.referenceURL) {
        this.referrenceURL = res.referenceURL;
        console.log("complaintContextService--", res);
      } else {
        console.log("complaintContextService--else--", res);
      }
    });

    let date = new Date();
    this.assignToMaster.patchValue({
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
    this.managesearch(false, true);

  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  //   //console.log("timePeriodValue: ", this.timePeriodValue);
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
      });
    this.lookuptype.LookUpTypeCode = 'PM_Priority';
    this.helpService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => { this.pmPriority = res; });
  }

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


  problemIdList() {
    for (let i = 0; i < this.complaintResp.length; i++) {
      this.arrProblemId.push(this.complaintResp[i].ProblemId);
      this.arrTicketID.push(this.complaintResp[i].TicketId);
      console.log(this.arrProblemId);
      console.log("You have selected ticket id's as child record " + this.arrTicketID + "\n" + "Search and select a parent record.");
      const msg = "You have selected ticket id's as child record " + this.arrTicketID + "\n" + ",Search and select a parent record.";
      this.showSucsMsg(msg);
    }
  }

  checkboxCheckedEvent(search: IAssignStatusRequest, event) {
    console.log("enter checbox event");
    if (event.target.checked) {
      if (!this.isParentChecked) {
        this.selectedComplaintList.push(search);
        this.isParentChecked = true;
      } else {
        // alertMessage="Only one checkbox can be selected";
        console.log("Only one checkbox can be selected");
      }

    } else {
      this.isParentChecked = false;
    }
  }

  mergeTicket() {
    this.mergeObj = <IAssignStatusRequest>{};
    this.mergeObj.Status = this.selectedComplaintList[0].Status;
    this.mergeObj.Priority = this.selectedComplaintList[0].Priority;
    this.mergeObj.Severity = this.selectedComplaintList[0].Severity;
    this.mergeObj.ProblemType = this.selectedComplaintList[0].ProblemType;
    this.mergeObj.ProblemId = this.selectedComplaintList[0].ProblemId;
    this.mergeObj.RecordedBy = this.context.customerContext.userId;
    this.mergeObj.TransformationEventTypeId = ComplaintStatus[ComplaintStatus.MERGE];
    this.mergeObj.UserName = this.context.customerContext.userName;
    this.mergeObj.LoginId = this.context.customerContext.loginId;
    this.mergeObj.UserId = this.context.customerContext.userId;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.ASSIGNTOMASTER];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.helpService.mergeComplaints(this.mergeObj, this.arrProblemId, userEvents)
      .subscribe(res => {
        if (res) {
          let msg = 'Complaint(s) has been assigned to master successfully';
          this.showSucsMsg(msg);
          if (this.referrenceURL) {
            this.prepareContext(msg);
            this.router.navigate([this.referrenceURL], { queryParams: { flag: 1 } });
            this.showSucsMsg(msg);
          } else {
            this.successMessage = msg;
            //this.showSucsMsg(msg);
          }
        }
      },
      (err) => {
        //this.showErrorMsg('Error while assigning complaint');
        this.errorMessage = 'Error while assigning';
        console.log(err);
      });
  }

  searchClick() {
    this.managesearch(true, false);
  }

  managesearch(isSearch: boolean, isPageLoad: boolean) {
    if (this.assignToMaster.valid) {
      console.log(this.assignToMaster.controls['CmpStatus'].value);
      this.searchComplaint = <ISearchRequest>{};
      this.searchComplaint.TicketId = this.assignToMaster.controls['ticketid'].value;
      this.searchComplaint.ProblemType = this.assignToMaster.controls['CmpType'].value;
      this.searchComplaint.status = this.assignToMaster.controls['CmpStatus'].value;
      this.searchComplaint.Priority = this.assignToMaster.controls['CmpPriority'].value;
      this.searchComplaint.Severity = this.assignToMaster.controls['CmpSeverity'].value;
      this.searchComplaint.SortColumn = 'TICKETID';
      this.searchComplaint.SortDirection = 1;
      this.searchComplaint.PageSize = 10000;
      this.searchComplaint.PageNumber = 1;
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
        this.searchComplaint.IsSearch = false
      }

      else if (isSearch) {

        let fromDate = new Date();
        let toDate = new Date();
        let strDate = this.assignToMaster.controls['timePeriod'].value;
        if (strDate != "" && strDate != null) {
          fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
          toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
          this.searchComplaint.startEffectiveDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          let endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59);
          this.searchComplaint.endEffectiveDate = endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        }
        // this.searchComplaint.startEffectiveDate = new Date(this.timePeriodValue[0]).toLocaleString(defaultCulture).replace(/\u200E/g,"");
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
    else {
      this.validateAllFormFields(this.assignToMaster);
    }
  }

  resetClick() {
    // if (this.timePeriodValue[0] != this.timePeriodValue[1]) {
    //   this.dateBind();
    // }
    if (this.assignToMaster.get('ticketid').value != '' || this.assignToMaster.get('CmpType').value != '' || this.assignToMaster.get('CmpStatus').value != '' || this.assignToMaster.get('CmpPriority').value != '' || this.assignToMaster.get('CmpSeverity').value != '') {

      this.assignToMaster.controls['ticketid'].reset();
      this.assignToMaster.controls['CmpType'].reset();
      this.assignToMaster.controls['CmpStatus'].reset();
      this.assignToMaster.controls['CmpPriority'].reset();
      this.assignToMaster.controls['CmpSeverity'].reset();
    }
    let date = new Date();
    this.assignToMaster.patchValue({
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
    this.managesearch(false, true);
    this.materialscriptService.material();
  }

  prepareContext(msg: string) {
    if (!this.complaintContext) {
      this.complaintContext = <IComplaintContextresponse>{};
    }
    this.complaintContext.successMessage = msg;
    this.complaintContextService.changeResponse(this.complaintContext);
  }

  backClick() {
    this.router.navigateByUrl(this.currentSubSystem.toLowerCase() + '/helpdesk/manage-complaints');
  }

  setOutputFlag(e) {
    this.msgFlag = e;
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

