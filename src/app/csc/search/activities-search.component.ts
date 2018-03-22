import { Component, OnInit, Renderer, ElementRef, ViewChild, OnChanges, DoCheck } from '@angular/core';
import { DatePipe } from '@angular/common'
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SearchDetailsComponent } from './search-details.component';
import { CustomerSearchService } from "./services/customer.search";
import { IPaging } from "../../shared/models/paging";
import { ICustomerActivitesRequest } from "../customerdetails/models/customeractivitiesrequest";
import { ICustomerActivitesResponse } from "../customerdetails/models/customeractivitesresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IActivityResponse } from "../../shared/models/activitiesresponse";
import { ActivityTypesService } from "./services/activities-service";
import { IActivityRequest } from "../../shared/models/activitesrequest";
import { SubSystem, ActivitySource, LookupTypeCodes, Features, Actions, defaultCulture } from "../../shared/constants";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { isDate } from "util";
import { IMyDrpOptions, IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-activities-search',
  templateUrl: './activities-search.component.html',
  styleUrls: ['./activities-search.component.scss']
})
export class ActivitiesSearchComponent implements OnInit, DoCheck {
  gridArrowUPDATEDUSER: boolean;
  gridArrowACTIVITYTEXT: boolean;
  gridArrowACTIVITYTYPE: boolean;
  gridArrowACTIVITYDATE: boolean;
  gridArrowACTIVITYSOURCE: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowCUSTOMERID: boolean;
  defaultTime = new Date();
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false,
    inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false,
  };
  activityType = 0;
  activitiesSearchForm: FormGroup;
  getActivityRequest: IActivityRequest;
  getActivityResponse: IActivityResponse[];
  bsRangeValue: any;
  selectedValue: string;
  disableButton: boolean = false;
  dateFormatValidator = "^\\(([0]{2})\\-[ ]([0]{2})[-]([0]{4}))$";


  getCustomerActivityRequest: ICustomerActivitesRequest;
  getCustomerActivityResponse: ICustomerActivitesResponse[] = <ICustomerActivitesResponse[]>[];

  paging: IPaging;
  systemactivites: ISystemActivities;
  boolSubmit: boolean = true;
  dateRange;

  //User log in details
  sessionContextResponse: IUserresponse


  constructor(private activityService: ActivityTypesService,
    private searchService: CustomerSearchService, private commonService: CommonService, public renderer: Renderer, private router: Router,
    public datepipe: DatePipe, private customerContext: CustomerContextService, private context: SessionService, private materialscriptService: MaterialscriptService) { }
  //constructor() { }

  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  invalid: boolean;
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.customerActivitiesSearch(this.p, 'reLoad');
  }




  ngOnInit() {
    this.gridArrowACTIVITYDATE = true;
    this.sortingColumn = "ACTIVITYDATE";
    this.disableButton = !this.commonService.isAllowed(Features[Features.ACTIVITIESSEARCH], Actions[Actions.SEARCH], "");
    this.p = 1;
    this.endItemNumber = 10;
    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

    this.activitiesSearchForm = new FormGroup({
      'AccountId': new FormControl(''),
      'bsRangeValue': new FormControl('', [Validators.required]),
      'ActivityType': new FormControl('', ),
    });
    let date = new Date();
    this.activitiesSearchForm.patchValue({
      bsRangeValue: {
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

    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.getActivityTypes('onLoad');
    this.selectedValue = 'ALL';

    this.customerActivitiesSearch(1, 'onLoad');
    let rootSelector = this;
    setTimeout(function () { rootSelector.materialscriptService.material() }, 0);
  }

  ngDoCheck() {
    // this.materialscriptService.selectMaterial();
  }



  getActivityTypes(event): void {

    //user events start

    let userEvents = <IUserEvents>{};
    if (event == "onLoad") {
      userEvents.FeatureName = Features[Features.ACTIVITIESSEARCH];
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


    this.getActivityRequest = <IActivityRequest>{};
    this.getActivityRequest.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.Activity_Categories];
    this.activityService.getActivityTypes(this.getActivityRequest, userEvents).subscribe(
      res => {
        res = res.filter((c: IActivityRequest) => c.LookUpTypeCode !== 'CsrActivity' && c.LookUpTypeCode !== 'Violations');
        this.getActivityResponse = res;
        let rootSelector = this;
        setTimeout(function () { rootSelector.materialscriptService.selectMaterial() }, 100);

      },
      (err) => {
        this.showErrorMessage(err.statusText);
      });
  }


  resetclick() {
    this.p = 1;
    this.startItemNumber = 1;
    this.pageItemNumber = 10;
    this.endItemNumber = 10;

    this.activitiesSearchForm.reset();
    this.getActivityTypes('reLoad');
    //this.selectedValue = 'ALL';
    this.activitiesSearchForm.controls['ActivityType'].setValue('ALL');

    this.getCustomerActivityResponse = null;

    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    let date = new Date();
    this.activitiesSearchForm.patchValue({
      bsRangeValue: {
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
    this.customerActivitiesSearch(1, 'reLoad');
  }



  customerActivitiesSearch(pageNumber: number, event: string): void {
    if(this.invalid)
    {
      return;
    }
    if(event=="onSearch")
    {
    if (this.activitiesSearchForm.invalid)
    {
        this.validateAllFormFields(this.activitiesSearchForm);
        return;
    }
    }
debugger;
    if (pageNumber == 1) {
      this.p = 1;
      this.startItemNumber = 1;
      this.pageItemNumber = 10;
      this.endItemNumber = 10;

    }
    let userEvents = <IUserEvents>{};
    if (event == "onSearch") {
      userEvents.FeatureName = Features[Features.ACTIVITIESSEARCH];
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

    this.getCustomerActivityRequest = <ICustomerActivitesRequest>{};

    let fromDate = new Date();
    let toDate = new Date();
    this.getCustomerActivityRequest.CustomerId = 0;
    this.getCustomerActivityRequest.Activity = "";

    let strDate = this.activitiesSearchForm.controls['bsRangeValue'].value;
    //debugger;
    if (strDate) {
      //let strDateRange = strDate.slice(",");

      fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
      //alert(fromDate.getFullYear());
      toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
      //toDate = new Date(strDateRange[1]);
    }


    if (this.activitiesSearchForm.controls['AccountId'].value == "")
      this.getCustomerActivityRequest.CustomerId = 0;
    else
      this.getCustomerActivityRequest.CustomerId = this.activitiesSearchForm.controls['AccountId'].value;

    this.getCustomerActivityRequest.Type = this.activitiesSearchForm.controls['ActivityType'].value === '' ? this.selectedValue : this.activitiesSearchForm.controls['ActivityType'].value;
    if (this.getCustomerActivityRequest.Type == "ALL")
      this.getCustomerActivityRequest.Type = "";




    this.getCustomerActivityRequest.IsSearchEventFired = true;
    this.getCustomerActivityRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    this.getCustomerActivityRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    this.getCustomerActivityRequest.PerformedBy = this.context.customerContext.userName;


    this.getCustomerActivityRequest.PageNumber = pageNumber;
    this.getCustomerActivityRequest.PageSize = 10;
    // this.getCustomerActivityRequest.SortColumn = "ACTIVITYID";
    this.getCustomerActivityRequest.SortColumn = this.sortingColumn;
    // this.getCustomerActivityRequest.SortDir = 0;
    this.getCustomerActivityRequest.SortDir = this.sortingDirection == false ? 1 : 0;

    this.systemactivites = <ISystemActivities>{};
    this.systemactivites.LoginId = this.context.customerContext.loginId;
    this.systemactivites.UserId = this.context.customerContext.userId;
    this.systemactivites.SubSystem = SubSystem.CSC.toString();
    this.systemactivites.ActivitySource = ActivitySource.Internal.toString();
    this.getCustomerActivityRequest.SystemActivities = this.systemactivites;

    this.searchService.getCustomerActivites(this.getCustomerActivityRequest, userEvents).subscribe(
      res => {
        this.getCustomerActivityResponse = res;
        if (this.getCustomerActivityResponse && this.getCustomerActivityResponse.length > 0) {
          this.totalRecordCount = this.getCustomerActivityResponse[0].Recount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      },
      (err) => {
        this.getCustomerActivityResponse = <ICustomerActivitesResponse[]>[];
        this.showErrorMessage(err.statusText);
      });
  }




  setOutputFlag(e) {
    this.msgFlag = e;
  }
  showErrorMessage(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSuccessMessage(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  closeAlert() {
    this.msgFlag = false;
  }

  closeDtlAlert() {
    this.msgFlag = false;
  }

  showDtlErrorMsg(msg: string) {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  bsValueChange(value) {
    if (value == null || value[0] == null) {
      this.activitiesSearchForm.controls['bsRangeValue'].setValue(void 0);
    }
  }

  validateDateFormat(inputDate: any) {

    let strDateRangeArray = inputDate.slice(",");
    if (strDateRangeArray.length < 2) {
      this.invalid = true;
      const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
      this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
      return;
    }
    else {
      if ((strDateRangeArray[0] != null) || (strDateRangeArray[1] != null)) {
        if (!isDate(new Date(strDateRangeArray[0])) || !isDate(new Date(strDateRangeArray[1]))) {
          this.invalid = true;
          const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
          this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
          return;
        }
      }
      else {
        this.invalid = true;
      }
    }
  }



  validateDateMessages(event, val) {
    debugger;
    if (val[0] && val[1]) {
      if (isDate(new Date(val[0])) && isDate(new Date(val[1]))) {
        this.invalid = false;
      }
    }
    else {
      this.invalid = true;
    }
  }
  showError(event, val) {
    console.log('asdsdasdasd');
  }

  sortDirection(SortingColumn) {
    this.gridArrowCUSTOMERID = false;
    this.gridArrowACTIVITYTYPE = false;
    this.gridArrowACTIVITYTEXT = false;
    this.gridArrowUPDATEDUSER = false;
    this.gridArrowACTIVITYSOURCE = false;
    this.gridArrowACTIVITYDATE = false;



    this.sortingColumn = SortingColumn;

    if (this.sortingColumn == "CUSTOMERID") {
      this.gridArrowCUSTOMERID = true;
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

    else if (this.sortingColumn == "ACTIVITYTYPE") {
      this.gridArrowACTIVITYTYPE = true;
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
    else if (this.sortingColumn == "UPDATEDUSER") {
      this.gridArrowUPDATEDUSER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ACTIVITYDATE") {
      this.gridArrowACTIVITYDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.customerActivitiesSearch(this.p, '');
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalid = true;

      return;
    }
    else
      this.invalid = false;

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
}

