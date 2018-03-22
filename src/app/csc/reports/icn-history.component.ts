import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { IPaging } from "../../shared/models/paging";
import { SessionService } from "../../shared/services/session.service";
import { CSCReportsService } from "./services/reports.service";
import { Actions, Features, defaultCulture } from "../../shared/constants";
import { ICNStatus } from "../icn/constants";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { DatePipe } from "@angular/common/common";
import { CommonService } from "../../shared/services/common.service";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { IMyDrpOptions, IMyInputFieldChanged } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';
@Component({
  selector: 'app-icn-history',
  templateUrl: './icn-history.component.html',
  styleUrls: ['./icn-history.component.scss']
})
export class IcnHistoryComponent implements OnInit {
  gridArrowLOCATIONNAME: boolean;
  LocationCode: any;
  gridArrowREVENUEDATE: boolean;
  gridArrowICNSTATUS: boolean;
  gridArrowITEMRETURNEDCOUNT: boolean;
  gridArrowITEMASSIGNCOUNT: boolean;
  gridArrowMOAMOUNT: boolean;
  gridArrowCHECKAMOUNT: boolean;
  gridArrowCASHAMOUNT: boolean;
  gridArrowFLOATAMOUNT: boolean;
  gridArrowUSERID: boolean;
  gridArrowICNID: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  timePeriod: Date[];
  bsRangeValue: Date[];


  sessionContextResponse: IUserresponse;
  icnHistoryReportsForm: FormGroup;

  // pagination
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;


  invalidDate: boolean = false;
  boolIsViewed: boolean = false;
  boolIsSearch: boolean = false;
  disableSearchbtn: boolean;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  timePeriodValue: Date[];
  incPattern = "[0-9]+$";
  icnHistoryRequest: ICNReportsRequest = <ICNReportsRequest>{};
  objSystemActivities = <ISystemActivities>{};
  icnHistoryResponse: ICNReportResponse[];
  objPaging = <IPaging>{};
  userEventRequest: IUserEvents = <IUserEvents>{};

  locationResponse: IManageUserResponse[];
    locationsRequest: IManageUserRequest;

  constructor(
    private reportsServices: CSCReportsService,
    private context: SessionService,
    private commonService: CommonService,
    private router: Router,
    private datePickerFormat: DatePickerFormatService, private materialscriptService:MaterialscriptService
  ) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.gridArrowICNID = true;
    this.sortingColumn = "ICNID";
    this.endItemNumber = 10;
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

    this.icnHistoryReportsForm = new FormGroup({
      'icn': new FormControl('', Validators.compose([Validators.pattern(this.incPattern)])),
      'timePeriod': new FormControl('', Validators.required),
      'location': new FormControl('')
    });
    this.currentDateSelection();
    this.boolIsViewed = true;
    let userEvent = this.userEvents();
    userEvent.ActionName = Actions[Actions.VIEW];
    this.getUserDetails(true, false, this.p, userEvent);
    this.disableSearchbtn = !this.commonService.isAllowed(Features[Features.ICNHISTORY], Actions[Actions.SEARCH], "");
    this.getLocations();
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getUserDetails(false, true, this.p, null);
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.ICNHISTORY];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEventRequest.UserName = this.sessionContextResponse.userName;
    this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
    return this.userEventRequest;
  }
  currentDateSelection() {
    this.icnHistoryRequest = <ICNReportsRequest>{};
    this.icnHistoryRequest.ICNId = 0;
    let date = new Date();
    this.icnHistoryReportsForm.patchValue({
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

    let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnHistoryReportsForm.controls['timePeriod'].value);
    this.icnHistoryRequest.TxnStartDate = datevalue[0];
    this.icnHistoryRequest.TxnEndDate = datevalue[1];
    // let strDate = this.icnHistoryReportsForm.controls['timePeriod'].value;
    // let firstDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
    // let lastDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
    // this.icnHistoryRequest.TxnStartDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0);
    // this.icnHistoryRequest.TxnEndDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59);
  }
  // currentDateSelection() {
  //   this.icnHistoryRequest = <ICNReportsRequest>{};
  //   this.icnHistoryRequest.ICNId = 0;
  //   var todayDate: Date = new Date();
  //   this.icnHistoryRequest.TxnStartDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  //   this.icnHistoryRequest.TxnEndDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  //   this.icnHistoryRequest.TxnStartDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
  //   this.icnHistoryRequest.TxnEndDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }
  // bsValueChange(value) {
  //   if (value == null || value[0] == null) {
  //     this.icnHistoryReportsForm.controls['timePeriod'].setValue(void 0);
  //   }
  // }




  searchIcnHistpryReports() {

    if (this.icnHistoryReportsForm.valid) {
      this.invalidDate = false;
      this.icnHistoryRequest = <ICNReportsRequest>{};
      this.icnHistoryRequest.ICNId = this.icnHistoryReportsForm.controls["icn"].value ? this.icnHistoryReportsForm.controls["icn"].value : 0;
      this.icnHistoryRequest.LocationCode = this.icnHistoryReportsForm.controls["location"].value ? this.icnHistoryReportsForm.controls["location"].value : "";
      // const location = this.icnHistoryReportsForm.controls["location"].value;
      // if (location != null && location != "") {
      //   this.LocationCode = location;
      // }
      // else {
      //   this.LocationCode = "";
      // }
      let fromDate = new Date();
      let toDate = new Date();
      let strDate = this.icnHistoryReportsForm.controls["timePeriod"].value;
      if (strDate) {
        let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnHistoryReportsForm.controls['timePeriod'].value);
        this.icnHistoryRequest.TxnStartDate = datevalue[0];
        this.icnHistoryRequest.TxnEndDate = datevalue[1];
        // this.icnHistoryRequest.TxnStartDate = this.icnHistoryReportsForm.controls["timePeriod"].value[0];
        // this.icnHistoryRequest.TxnEndDate = this.icnHistoryReportsForm.controls["timePeriod"].value[1];

        // let firstDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
        // let lastDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
        // this.icnHistoryRequest.TxnStartDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0);
        // this.icnHistoryRequest.TxnEndDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59);
        this.p = 1;
        this.startItemNumber = 1;
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.SEARCH];
        this.getUserDetails(false, true, this.p, userEvent);
      }
      else {
        this.showErrorMessage("Invalid Data range");
      }
    }
    else {
      this.validateAllFormFields(this.icnHistoryReportsForm);
      // this.msgType = 'error';
      // this.msgFlag = true;
      // this.msgDesc = "Invalid ICN #";
      // this.msgTitle = '';
    }
  }
  getUserDetails(isView: boolean, isSearch: boolean, PageNumber: number, userEvent: IUserEvents) {

    this.objPaging.PageNumber = PageNumber;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = this.sortingColumn;
    this.objPaging.SortDir = this.sortingDirection == true ? 1 : 0;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.context.customerContext.userId;
    systemActivities.User = this.context.customerContext.userName;
    systemActivities.LoginId = this.context.customerContext.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICN];
    systemActivities.IsViewed = isView;
    systemActivities.IsSearch = isSearch;
    if (this.icnHistoryRequest.LocationCode != null && this.icnHistoryRequest.LocationCode != "") {
        this.LocationCode = this.icnHistoryRequest.LocationCode;
      }
      else {
        this.LocationCode = "";
      }
    this.reportsServices.GetICNHistoryReports(this.icnHistoryRequest.ICNId, this.icnHistoryRequest.TxnStartDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), this.icnHistoryRequest.TxnEndDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), ICNStatus[ICNStatus.None], this.LocationCode,this.objPaging, systemActivities, userEvent)
      .subscribe(res => {
        this.icnHistoryResponse = res;
        if (res != null && res.length > 0) {
          this.totalRecordCount = this.icnHistoryResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }, err => {

        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
      });
  }
  showErrorMessage(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  resetIcnHistpryReports() {
    this.icnHistoryReportsForm.controls["icn"].reset();
    this.currentDateSelection();
    this.getUserDetails(true, false, this.p, null);
    this.icnHistoryReportsForm.patchValue({ location: "" });
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



  validateDateFormat(inputDate: any) {
    let strDateRangeArray = inputDate.slice(",");
    if (strDateRangeArray.length < 2) {
      this.invalidDate = true;
      const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
      this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
      return;
    }
    else {
      if ((strDateRangeArray[0] != null) || (strDateRangeArray[1] != null)) {
        if (!isDate(new Date(strDateRangeArray[0])) || !isDate(new Date(strDateRangeArray[1]))) {
          this.invalidDate = true;
          const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
          this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
          return;
        }
      }
      else {
        this.invalidDate = true;
      }
    }
  }



  validateDateMessages(event, val) {
    debugger;
    if (val[0] && val[1]) {
      if (isDate(new Date(val[0])) && isDate(new Date(val[1]))) {
        this.invalidDate = false;
      }
    }
    else {
      this.invalidDate = true;
    }
  }


  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;
  }



  sortDirection(SortingColumn) {
    this.gridArrowICNID = false;
    this.gridArrowUSERID = false;
    this.gridArrowFLOATAMOUNT = false;
    this.gridArrowCASHAMOUNT = false;
    this.gridArrowCHECKAMOUNT = false;
    this.gridArrowMOAMOUNT = false;
    this.gridArrowITEMASSIGNCOUNT = false;
    this.gridArrowITEMRETURNEDCOUNT = false;
    this.gridArrowICNSTATUS = false;
    this.gridArrowREVENUEDATE = false;
    this.gridArrowLOCATIONNAME = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "ICNID") {
      this.gridArrowICNID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "USERID") {
      this.gridArrowUSERID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "FLOATAMOUNT") {
      this.gridArrowFLOATAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "CASHAMOUNT") {
      this.gridArrowCASHAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "CHECKAMOUNT") {
      this.gridArrowCHECKAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "MOAMOUNT") {
      this.gridArrowMOAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ITEMASSIGNCOUNT") {
      this.gridArrowITEMASSIGNCOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ITEMRETURNEDCOUNT") {
      this.gridArrowITEMRETURNEDCOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ICNSTATUS") {
      this.gridArrowICNSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "REVENUEDATE") {
      this.gridArrowREVENUEDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "LOCATIONNAME") {
      this.gridArrowLOCATIONNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
        this.getUserDetails(false, true, this.p, null);
  }

  getLocations(){
    this.locationsRequest=<IManageUserRequest>{};
    this.locationsRequest.LocationCode='';
    this.locationsRequest.LocationName='';
    this.locationsRequest.SortColumn='LOCATIONCODE';
    this.locationsRequest.SortDir=1;
    this.locationsRequest.PageNumber=1;
    this.locationsRequest.PageSize=100;
    this.reportsServices.getLocations(this.locationsRequest).subscribe(res=>{
        this.locationResponse=res;
        console.log(this.locationResponse)
    })
  }



}


//let strDateRange = strDate.slice(",");
        // if (strDateRange.length < 2) {
        //   this.showErrorMessage("Invalid Data range");
        //   const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
        //   this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
        //   return;
        // }
        // else {
        //   fromDate = new Date(strDateRange[0]);
        //   toDate = new Date(strDateRange[1]);
        //   if ((fromDate.getFullYear() == 1970) || (toDate.getFullYear() == 1970)) {
        //     this.showErrorMessage("Invalid Data range");
        //     const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
        //     this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
        //     return;
        //   }
        // }
        //  fromDate = new Date(strDateRange[0]);
        //alert(fromDate.getFullYear());
        //toDate = new Date(strDateRange[1]);