import { Component, OnInit } from '@angular/core';
import { HelpDeskService } from "./services/helpdesk.service";
import { ICommonResponse } from "../shared/models/commonresponse";
import { ISearchRequest } from "./models/searchrequest";
import { IComplaintResponse } from "../shared/models/complaintsresponse";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionService } from "../shared/services/session.service";
import { Router, ActivatedRoute } from '@angular/router';
import { IPaging } from "../shared/models/paging";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { SubSystem, ActivitySource, Features, Actions, defaultCulture } from "../shared/constants";
import { ViolatorContextService } from '../shared/services/violator.context.service';
import { IUserEvents } from '../shared/models/userevents';
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-track-complaints',
  templateUrl: './track-complaints.component.html',
  styleUrls: ['./track-complaints.component.scss']
})
export class TrackComplaintsComponent implements OnInit {
  invalidDate: boolean;

  pmStatus: ICommonResponse[];
  lookuptype: ICommonResponse;
  problemTypes: any;
  searchComplaint: ISearchRequest;
  currentSubSystem: string;
  searchTrackResponse: IComplaintResponse[];
  pmPriority: ICommonResponse[];
  pmSeverity: ICommonResponse[];
  timePeriodValue: Date[];
  trackComplaints: FormGroup;
  Paging: IPaging;
  contextAccountId: number;
  featureName: string;
  calOptions: ICalOptions = <ICalOptions>{};
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px',
    inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  constructor(private helpService: HelpDeskService, private datePickerFormat: DatePickerFormatService, private context: SessionService, private customerContext: CustomerContextService, private router: Router, private violatorContext: ViolatorContextService, private materialscriptService: MaterialscriptService) { }


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
            this.contextAccountId = customerContext.ParentId > 0 ? customerContext.ParentId : customerContext.AccountId;
            this.featureName = Features[Features.CSCTRACKCOMPLAINT];
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
          this.featureName = Features[Features.TVCTRACKCOMPLAINT];
        } else {
          this.contextAccountId = 0;
          this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
        }
      });
    }

    // this.dateBind();
    this.bindDropDowns();

    this.trackComplaints = new FormGroup({
      'timePeriod': new FormControl('', [Validators.required]),
      'CmpStatus': new FormControl('', [Validators.required]),
      'CmpType': new FormControl('', [Validators.required]),
      'ticketid': new FormControl('', [Validators.required])
    });

    let date = new Date();
    this.trackComplaints.patchValue({
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

    this.searchingTrack(false, true, this.p);
    this.trackComplaints.controls["CmpStatus"].setValue(0);
    this.trackComplaints.controls["CmpType"].setValue(0);
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
    userEvents.CustomerId = this.contextAccountId;
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

  reset() {
    this.trackComplaints.reset();

    this.searchingTrack(false, true, this.p);
  }


  resetClick() {  
    let date = new Date();
    this.trackComplaints.patchValue({
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
    this.trackComplaints.controls["CmpStatus"].setValue(0);
    this.trackComplaints.controls["CmpType"].setValue(0);
    this.trackComplaints.controls['ticketid'].reset();
    // if (this.trackComplaints.get('CmpStatus').value != '' || this.trackComplaints.get('CmpType').value != '' || this.trackComplaints.get('ticketid').value != '') {

    //   this.trackComplaints.controls['CmpStatus'].reset();
    //   this.trackComplaints.controls['CmpType'].reset();
    //   this.trackComplaints.controls['ticketid'].reset();
    // }
    this.searchingTrack(false, true, this.p);
    this.materialscriptService.material();
  }

  searchTrack() {
    this.searchingTrack(true, false, this.p);
  }


  searchingTrack(isSearch: boolean, isPageLoad: boolean, pageNumber: number) {
    console.log(this.trackComplaints.controls['CmpStatus'].value);
    this.searchComplaint = <ISearchRequest>{};
    this.searchComplaint.TicketId = this.trackComplaints.controls['ticketid'].value;
    this.searchComplaint.ProblemType = this.trackComplaints.controls['CmpType'].value;
    this.searchComplaint.status = this.trackComplaints.controls['CmpStatus'].value;
    this.searchComplaint.SortColumn = 'TICKETID';
    this.searchComplaint.SortDirection = 0;
    this.searchComplaint.PageSize = 10;
    this.searchComplaint.PageNumber = pageNumber;
    this.searchComplaint.LoginId = this.context._customerContext.loginId;
    this.searchComplaint.UserName = this.context._customerContext.userName;
    this.searchComplaint.UserId = this.context._customerContext.userId;
    this.searchComplaint.CustomerId = this.contextAccountId;
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
      if (this.trackComplaints.controls['timePeriod'].value) {
        let datevalue = this.datePickerFormat.getFormattedDateRange(this.trackComplaints.controls['timePeriod'].value);
        var startDate = new Date(datevalue[0]);
        let endDate = new Date(datevalue[1]);
        this.searchComplaint.startEffectiveDate = startDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        const dt: Date = new Date();
        const endDt: Date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
        this.searchComplaint.endEffectiveDate = endDt.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.searchComplaint.IsPageLoad = false;
        this.searchComplaint.IsSearch = true;
      } else {
        return;
      }
    }
    this.searchComplaint.SubSystem = this.currentSubSystem;
    this.searchComplaint.ActivitySource = ActivitySource[ActivitySource.Internal];
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.helpService.search(this.searchComplaint, userEvents).subscribe(
      res => {
        this.searchTrackResponse = res;
        if (this.searchTrackResponse) {
          this.dataLength = this.searchTrackResponse[0].RecCount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
      });

  }

  viewComplaint(problemId) {
    $('#mymodal').modal('hide');
    let url = this.currentSubSystem.toLowerCase() + '/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: problemId } });
  }
  onDateRangeFieldChanged(event) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }


}
