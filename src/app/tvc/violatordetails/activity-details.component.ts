import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViolatordetailsService } from "./services/violatordetails.service";
import { CommonService } from "../../shared/services/common.service";
import { SessionService } from "../../shared/services/session.service";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { IActivityRequest } from "../../shared/models/activitesrequest";
import { ActivityTypesService } from "../../csc/search/services/activities-service";
import { IActivityResponse } from "../../shared/models/activitiesresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SubSystem, ActivitySource, Activities, Features, Actions, defaultCulture } from "../../shared/constants";
import { IPaging } from "../../shared/models/paging";
import { CustomDateTimeFormatPipe } from "../../shared/pipes/convert-datetime.pipe";
import { IParentActivities } from "./models/parentactivities";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { Router } from "@angular/router";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDrpOptions, IMyInputFieldChanged, IMyInputFocusBlur } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {
  gridArrowACTIVITYTEXT: boolean;
  gridArrowACTIVITYTYPE: boolean;
  gridArrowACTIVITYSOURCE: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowPERFORMEDBY: boolean;
  gridArrowACTIVITYID: boolean;
  invalidDateRange: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isSearch: boolean = false;
  isAddActivity: boolean = false;
  createValue: string;
  vioalatorId: number;
  dateRange: any;
  isShowAll: boolean = false;
  rdoAll: boolean;
  rdoAccount: boolean;
  rdoTrip: boolean;
  parentActivities: IParentActivities;
  presentDate: Date;
  activity: number = 1;
  SystemActivities: ISystemActivities;
  isCreated: boolean;
  createActivity: IActivityRequest;
  createForm: FormGroup;
  stratDate: Date;
  endDate: Date;
  Paging: IPaging;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  activitySource: string = ActivitySource[ActivitySource.Internal];
  subSystem: string = SubSystem[SubSystem.TVC];
  systemActivities: ISystemActivities;
  searchActivityRequest: IActivityRequest;
  searchActivityTypeResponse: IActivityResponse[];
  activityForm: FormGroup;
  getActivityTypeResponse: IActivityResponse[] = <IActivityResponse[]>[];
  getUpperActivityTypeResponse: IActivityResponse[] = <IActivityResponse[]>[];
  getActivityTypeRequest: IActivityRequest;
  sessionContextResponse: IUserresponse;
  violatorContext: IViolatorContextResponse;
  preSelectedValue: string;
  selectedValue: string;
  p: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  addActivityDetails = false;
  isdisplayShowAll: boolean;
  disableDiv: string = "col-md-12";
  commentTextLength: number = 255;

  showActivity(flag) {
    this.addActivityDetails = flag;
    this.createValue = "";
    this.selectedValue = "ALL";
    this.disableDiv = "col-md-12";
    this.createForm.reset();
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 1000);
  }

  constructor(
 private materialscriptService: MaterialscriptService,private activityService: ActivityTypesService, private commonService: CommonService,
    private sessionContext: SessionService, private violatorContextService: ViolatorContextService,
    private router: Router, private violatorDetailsService: ViolatordetailsService, private cdr: ChangeDetectorRef) {

  }

  dropDownChange(event) {
    this.searchActivityRequest.Type = this.activityForm.controls['activityType'].value;
    if (this.searchActivityRequest.Type == "ALL") {
      this.disableDiv = "col-md-12";
    }
    else {
      this.disableDiv = "col-md-12 disableddiv";
    }
  }



  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.bindActivity(true, false, false);
  }

  ngOnInit() {
    this.gridArrowACTIVITYID = true;
    this.sortingColumn = "ACTIVITYID";
    this.materialscriptService.material();
    this.endItemNumber=10;
    this.p = 1;
    this.activityForm = new FormGroup({
      'dateRange': new FormControl('', [Validators.required]),
      'activityType': new FormControl('', []),
    });
    this.createForm = new FormGroup({
      'createType': new FormControl('', [Validators.required]),
      'activity': new FormControl('', [Validators.required]),
    });
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.dateRange = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.setDateRange();
    this.violatorContextService.currentContext
      .subscribe(customerContext => {
        this.violatorContext = customerContext;
        //  this.vioalatorId = this.violatorContext.accountId;
      });

    if (this.violatorContext && this.violatorContext.accountId > 0) {
      this.vioalatorId = this.violatorContext.accountId;
    }
    if (this.vioalatorId == 0) {
      let link = ['tvc/search/violation-search'];
      this.router.navigate(link);
    }

    this.sessionContextResponse = this.sessionContext.customerContext;
    this.getActivityTypes();
    this.bindActivity(false, true, false);
    this.selectedValue = 'ALL';
    this.createValue = "";
    if (!this.commonService.isAllowed(Features[Features.VIOLATIONACTIVITIES], Actions[Actions.VIEW], "")) {
      //error page;

    }
    this.isAddActivity = !this.commonService.isAllowed(Features[Features.VIOLATIONACTIVITIES], Actions[Actions.CREATE], "");
    this.isSearch = !this.commonService.isAllowed(Features[Features.VIOLATIONACTIVITIES], Actions[Actions.SEARCH], "");
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setDateRange(): void {
    // Set date range (today) using the patchValue function
    let date = new Date();
    this.activityForm.patchValue({
      dateRange: {
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
  getActivityTypes(): void {
    this.getActivityTypeRequest = <IActivityRequest>{};
    this.getActivityTypeRequest.LookUpTypeCode = 'Activity_Categories';
    this.violatorDetailsService.getActivityTypes(this.getActivityTypeRequest).subscribe(
      res => {
        res = res.filter((c: IActivityRequest) => c.LookUpTypeCode !== 'Transactions' && c.LookUpTypeCode !== 'CustomActivity' &&
          c.LookUpTypeCode !== 'Violations' && c.LookUpTypeCode !== 'Statements' && c.LookUpTypeCode !== 'Tags'
          && c.LookUpTypeCode !== 'Refund');
        this.getActivityTypeResponse = res;
      }
    );
  }
  resetActivity() {
    this.getActivityTypes();
    this.selectedValue = 'ALL';
    this.disableDiv = "col-md-12";
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.dateRange = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.setDateRange();
    this.isdisplayShowAll = false;
    this.endItemNumber=10;
    this.p = 1;
    this.startItemNumber=1;
    this.activity=1;
    this.bindActivity(false, true, false);
  }

  searchActivity() {
    this.isdisplayShowAll = false;
     this.endItemNumber=10;
     this.p = 1;
     this.startItemNumber=1;
    this.bindActivity(true, false, false);
    
  }

  bindActivity(isSearch: boolean, isPageLoad: boolean, isShowAll: boolean) {
    this.searchActivityRequest = <IActivityRequest>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.systemActivities.FeaturesCode = 'ACTIVITIES';
    this.searchActivityRequest.SystemActivities = this.systemActivities;
    this.searchActivityRequest.ActivitySource = this.activitySource;
    this.searchActivityRequest.PerformedBy = this.sessionContextResponse.userName;
    this.searchActivityRequest.Subsystem = this.subSystem;
    this.searchActivityRequest.CustomerId = this.violatorContext.accountId;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONACTIVITIES];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    //page load
    if (isPageLoad) {
      this.rdoAll = true;
      this.searchActivityRequest.Type = this.activityForm.controls['activityType'].value === 'ALL' ? '' : this.activityForm.controls['activityType'].value;
      this.searchActivityRequest.StartDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.searchActivityRequest.EndDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.searchActivityRequest.IsPageLoad = true;
      this.searchActivityRequest.IsSearchEventFired = false;
      if (this.searchActivityRequest.Type == "ALL" || this.searchActivityRequest.Type == '') {
        if (this.activity == 2) {
          this.searchActivityRequest.Type = "PARENTACCOUNT";
        }
        else if (this.activity == 3) {
          this.searchActivityRequest.Type = "PARENTTRIP";
        }
        else {
          this.searchActivityRequest.Type = "";
        }
      }
      userEvents.ActionName = Actions[Actions.VIEW];
    }
    //search
    else if (isSearch) {
      this.searchActivityRequest.Type = this.activityForm.controls['activityType'].value;
      const strDate = this.activityForm.controls['dateRange'].value;
      if (this.searchActivityRequest.Type == "ALL") {
        if (this.activity == 2) {
          this.searchActivityRequest.Type = "PARENTACCOUNT";
          if (strDate != undefined || strDate != null) {
            let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
            let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
            this.searchActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");  //new Date(this.activityForm.get('dateRange').value[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");  //new Date(this.activityForm.get('dateRange').value[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          else {
            this.searchActivityRequest.StartDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          this.selectedValue = 'ALL';
        }
        else if (this.activity == 3) {
          this.searchActivityRequest.Type = "PARENTTRIP";
          if (strDate != undefined || strDate != null) {
            let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
            let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
            this.searchActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");//new Date(this.activityForm.get('dateRange').value[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""); //new Date(this.activityForm.get('dateRange').value[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          else {
            this.searchActivityRequest.StartDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          this.selectedValue = 'ALL';
        }
        else {
          this.searchActivityRequest.Type = "";
          if (strDate != undefined || strDate != null) {
            let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
            let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
            this.searchActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");// new Date(this.activityForm.get('dateRange').value[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""); //new Date(this.activityForm.get('dateRange').value[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          else {
            this.searchActivityRequest.StartDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.searchActivityRequest.EndDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          }
          this.selectedValue = 'ALL';
        }
      }
      else {
        let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
        let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
        this.searchActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");// new Date(this.activityForm.get('dateRange').value[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        this.searchActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""); //new Date(this.activityForm.get('dateRange').value[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      }
      this.searchActivityRequest.IsPageLoad = false;
      this.searchActivityRequest.IsSearchEventFired = true;
      userEvents.ActionName = Actions[Actions.SEARCH];
    }
    //show all
    else if (isShowAll) {
      userEvents = null;
      this.p = 1;
      this.searchActivityRequest.Type = this.activityForm.controls['activityType'].value === 'ALL' ? '' : this.activityForm.controls['activityType'].value;
      const strDate = this.activityForm.controls['dateRange'].value;
      if (strDate) {
        let fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
        let toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
        this.searchActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");// new Date(this.activityForm.get('dateRange').value[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        this.searchActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""); //new Date(this.activityForm.get('dateRange').value[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      }
      else {
        this.searchActivityRequest.StartDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        this.searchActivityRequest.EndDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      }
      //  this.pageItemNumber = this.dataLength;
    }
    this.searchActivityRequest.Linkid = 0;
    this.searchActivityRequest.User = this.sessionContextResponse.userName;
   this.searchActivityRequest.SortColumn = this.sortingColumn;
  //  this.searchActivityRequest.SortColumn="ACTIVITYID";
    if (this.isShowAll)
      this.searchActivityRequest.PageSize = this.dataLength;
    else
      this.searchActivityRequest.PageSize = 10;
    this.searchActivityRequest.PageNumber = this.p;
   this.searchActivityRequest.SortDir = this.sortingDirection == true ? 1 : 0;
    // this.searchActivityRequest.SortDir = 1;
    if (this.activityForm.valid) {
      this.violatorDetailsService.searchActivities(this.searchActivityRequest, userEvents).subscribe(res => {
        this.searchActivityTypeResponse = res;
        if (this.searchActivityTypeResponse.length > 0) {
          this.dataLength = this.searchActivityTypeResponse[0].Recount;
          if (this.dataLength > 10) {
            this.isdisplayShowAll = true;
          } else {
            this.isdisplayShowAll = false;
          }
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          // else {
          //   this.endItemNumber = this.pageItemNumber;
          // }
        }
      });
    }
  }
  resetCreateForm() {
    this.createForm.reset();
    this.selectedValue = "ALL";
    this.disableDiv = "col-md-12";
    this.commentTextLength = 255;
    //  this.createValue = "";
    this.createForm.patchValue({
      createType: "",
    });
  }
  addActivity() {
    this.selectedValue = "ALL";
    this.createValue = "";
    this.createActivity = <IActivityRequest>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.systemActivities.ActivitySource = this.activitySource;
    this.createActivity.SystemActivities = this.systemActivities;
    this.createActivity.CustomerId = this.violatorContext.accountId;
    this.createActivity.Type = this.createForm.controls['createType'].value.toString().toUpperCase() == 'SPECIALALERTS' ? 'SPECIALALERT' : this.createForm.controls['createType'].value.toString().toUpperCase();
    this.createActivity.Activity = this.createForm.controls['activity'].value;
    this.createActivity.PerformedBy = this.sessionContextResponse.userName;
    this.createActivity.Subsystem = this.subSystem;
    this.createActivity.ActivitySource = this.activitySource;
    this.createActivity.Linkid = 0;
    this.createActivity.LinkSourceName = "TP_Customers";
    this.createActivity.User = this.sessionContextResponse.userName;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONACTIVITIES];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.violatorDetailsService.create(this.createActivity.CustomerId, this.createActivity, userEvents).subscribe(res => {
      this.isCreated = res;
      this.createForm.reset();
      this.showActivity(false);
      this.bindActivity(true, false, false);
      this.msgFlag = true;
      this.msgType = 'success';
      this.msgTitle = '';
      this.msgDesc = 'Activity has been added successfully';
    })
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  setradio(a: number) {
    this.activity = a;
    if (this.activity == 1) {
      this.selectedValue = "ALL";
      this.rdoAll = true;
      this.rdoAccount = false;
      this.rdoTrip = false;
      this.isShowAll = false;
      this.endItemNumber=10;
      this.pageItemNumber = 10;
      this.startItemNumber=1;
      this.p=1;
      this.bindActivity(true, false, false);
    }
    if (this.activity == 2) {
      this.selectedValue = "ALL";
      this.rdoAll = false;
      this.rdoAccount = true;
      this.rdoTrip = false;
      this.isShowAll = false;
      this.pageItemNumber = 10;
      this.endItemNumber=10;
       this.startItemNumber=1;
      this.p=1;
      this.bindActivity(true, false, false);
    }
    if (this.activity == 3) {
      this.selectedValue = "ALL";
      this.rdoAll = false;
      this.rdoAccount = false;
      this.rdoTrip = true;
      this.isShowAll = false;
      this.endItemNumber=10;
      this.pageItemNumber = 10;
       this.startItemNumber=1;
      this.p=1;
      this.bindActivity(true, false, false);
    }

  }
  showAll() {
    this.isShowAll = true;
    this.pageItemNumber = this.dataLength;
    this.bindActivity(false, false, true);
  }
  resetShowAll() {
    this.isdisplayShowAll = false;
    this.selectedValue = "ALL";
    this.createValue = "";
    this.isShowAll = false;
    this.pageItemNumber = 10;
    this.endItemNumber=10;
    this.p=1;
    this.startItemNumber=1;
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.dateRange = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.bindActivity(true, false, false);
  }

  back() {
    this.router.navigate(["/tvc/violatordetails/violator-summary"]);
  }
  exit() {
    this.violatorContextService.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length
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

  sortDirection(SortingColumn) {
    this.gridArrowACTIVITYID = false;
    this.gridArrowPERFORMEDBY = false;
    this.gridArrowACTIVITYSOURCE = false;
    this.gridArrowACTIVITYTYPE = false;
    this.gridArrowACTIVITYTEXT = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "ACTIVITYID") {
      this.gridArrowACTIVITYID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "PERFORMEDBY") {
      this.gridArrowPERFORMEDBY = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ACTIVITYSOURCE") {
      this.gridArrowACTIVITYSOURCE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ACTIVITYTYPE") {
      this.gridArrowACTIVITYTYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ACTIVITYTEXT") {
      this.gridArrowACTIVITYTEXT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    this.bindActivity(true, false, false);
  }
}
