import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { CSCReportsService } from "./services/reports.service";
import { SessionService } from "../../shared/services/session.service";
import { Actions, Features, ActivitySource, defaultCulture } from "../../shared/constants";
import { ICNStatus } from "../icn/constants";
import { IPaging } from "../../shared/models/paging";
import { PaymentMode } from "../../payment/constants";
import { ICNTxnType } from "./constants";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';

@Component({
  selector: 'app-clerk-reconciliation-report',
  templateUrl: './clerk-reconciliation-report.component.html',
  styleUrls: ['./clerk-reconciliation-report.component.scss']
})
export class ClerkReconciliationReportComponent implements OnInit {
  gridArrowLOCATIONNAME: boolean;
  gridArrowUpdatedDate: boolean;
  gridArrowRevenueDate: boolean;
  gridArrowICNStatus: boolean;
  gridArrowICNID: boolean;
  gridArrowUsername: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowUserId: boolean;
  invalidDate: boolean;
  allowView: boolean;
  allowSearch: boolean;
  isSearch: boolean = false;
  isView: boolean = false;
  disableSearchButton: boolean;

  floatAmount: string;
  systemTransactionAmount: string;
  systemTotalRecordCount: number;
  systemPageItemNumber: number = 10;
  systemEndItemNumber: number;
  systemStartItemNumber: number = 1;
  systemPage: number;

  transponderPage: number;
  transponderTotalRecordCount: number;
  transponderPageItemNumber: number = 10;
  transponderEndItemNumber: number;
  transponderStartItemNumber: number = 1;

  transponderDetails: boolean;
  entryDetails: any = false;
  transactionDetails: boolean;
  transactionICNId: any;
  totalRecordCount: any;
  endItemNumber: number;
  pageItemNumber: any = 10;
  startItemNumber: number = 1;
  p: number = 1;
  index: number;
  index1: number;


  timePeriod: any;
  tableHeading: any;
  clerkReconciliationReportSearchForm: FormGroup;
  icnRequest: ICNReportsRequest = <ICNReportsRequest>{};
  icnResponse: ICNReportResponse[];
  icnTransactionResponse: ICNReportResponse[];
  icnSystemResponse: ICNReportResponse[];
  icnEntryResponse: ICNReportResponse[];
  icnTransponderResponse: ICNReportResponse[];
  objSystemActivities: ISystemActivities;
  objPaging: IPaging;
  icnNO: number;
  status: string;
  userEventRequest: IUserEvents = <IUserEvents>{};

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

  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear());
  toDayDate: Date = new Date();
  start = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");

  startDate: any;
  endDate: any;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  locationResponse: IManageUserResponse[];
  locationsRequest: IManageUserRequest;



  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.clerkreconciliationSearch("", this.p, null);
  }

  systemPageChanged(event) {
    this.systemPage = event;
    this.systemStartItemNumber = (((this.systemPage) - 1) * this.systemPageItemNumber) + 1;
    this.systemEndItemNumber = ((this.systemPage) * this.systemPageItemNumber);
    if (this.systemEndItemNumber > this.systemTotalRecordCount)
      this.systemEndItemNumber = this.systemTotalRecordCount;
    this.viewEntries("", "", "", this.systemPage);
  }

  transponderPageChanged(event) {
    this.transponderPage = event;
    this.transponderStartItemNumber = (((this.transponderPage) - 1) * this.transponderPageItemNumber) + 1;
    this.transponderEndItemNumber = ((this.transponderPage) * this.transponderPageItemNumber);
    if (this.transponderEndItemNumber > this.transponderTotalRecordCount)
      this.transponderEndItemNumber = this.transponderTotalRecordCount;
    this.viewTransponderDetails(this.transponderPage);
  }


  constructor(private _reportService: CSCReportsService, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private router: Router, private commonService: CommonService, private sessionContext: SessionService,
    private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.endItemNumber = 10;
    this.p = 1;
    this.systemPage = 1;
    this.transponderPage = 1;
    this.systemEndItemNumber = 10;
    this.transponderEndItemNumber = 10;
    this.clerkReconciliationReportSearchForm = new FormGroup({
      'icnNumber': new FormControl('', ),
      'timePeriod': new FormControl('', [Validators.required]),
      'location': new FormControl('', )
    });
    let date = new Date();
    this.clerkReconciliationReportSearchForm.patchValue({
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
    //this.dateBind();
    this.tableHeading = "Clerk Reconciled Details";
    this.allowSearch = this.commonService.isAllowed(Features[Features.CLERKRECONCILIATION], Actions[Actions.SEARCH], "");
    this.clerkReconciliationPage();
    if (this.allowSearch) {
      this.disableSearchButton = false;
    }
    else {
      this.disableSearchButton = true;
    }

    this.getLocations();
  }

  //event for allowing only numbers in textbox
  _keyPress(event: any) {
    const pattern = /[0-9][0-9 ]*/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      event.preventDefault();
    }
  }

  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.CLERKRECONCILIATION];  //logging out
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }


  //on pageLoad View
  clerkReconciliationPage() {
    this.isSearch = true;
    this.isView = false;
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    let userevents = this.userEvents();
    this.clerkreconciliationSearch("VIEW", this.p, userevents);
  }

  //on search button click
  searchClerkReconciliation() {
    if (this.clerkReconciliationReportSearchForm.valid && !(this.invalidDate)) {
      this.isView = false;
      this.isSearch = false;
      this.transponderDetails = false;
      this.entryDetails = false;
      this.p = 1;
      this.endItemNumber = 10;
      this.startItemNumber = 1;
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.SEARCH];
      this.clerkreconciliationSearch("SEARCH", this.p, userevents);
    }
    else {

    }


  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  //search Method First grid

  clerkreconciliationSearch(type: any, PageNumber: Number, userevents: IUserEvents) {

    this.transactionDetails = false;
    if (type == "VIEW") {
      this.objPaging = <IPaging>{};
      this.tableHeading = "Clerk Reconciled Details";
      this.startDate = this.start;
      this.endDate = this.end;
      this.icnRequest.ICNId = 0;
      this.icnRequest.LocationCode = "";
    }

    if (type == "SEARCH") {
      this.objPaging = <IPaging>{};
      this.tableHeading = "Clerk Reconciled Details";
      const icnNumber = this.clerkReconciliationReportSearchForm.controls['icnNumber'].value;
      const location = this.clerkReconciliationReportSearchForm.controls['location'].value;

      let dateRange = this.clerkReconciliationReportSearchForm.controls['timePeriod'].value;
      if (dateRange != "" && dateRange != null) {
        let date = this.datePickerFormat.getFormattedDateRange(this.clerkReconciliationReportSearchForm.controls['timePeriod'].value)
        let firstDate = date[0];
        let lastDate = date[1];
        this.startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }
      else {
        this.startDate = this.start;
        this.endDate = this.end;
      }

      if (icnNumber != null && icnNumber != "") {
        this.icnRequest.ICNId = icnNumber;
      }
      else {
        this.icnRequest.ICNId = 0;
      }

      if (location != null && location != "") {
        this.icnRequest.LocationCode = location;
      }
      else {
        this.icnRequest.LocationCode = "";
      }
    }

    this.icnRequest.ICNStatus = ICNStatus[ICNStatus.Reconciled];
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.objSystemActivities.ActionCode = Actions[Actions.VIEW];
    this.objSystemActivities.FeaturesCode = Features[Features.ICN];
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objSystemActivities.IsViewed = this.isView;
    this.objSystemActivities.IsSearch = this.isSearch;
    this.objPaging.PageNumber = this.p;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = this.sortingColumn;
    this.objPaging.SortDir = this.sortingDirection == true ? 1 : 0;;

    this._reportService.GetICNHistoryReports(this.icnRequest.ICNId, this.startDate, this.endDate, this.icnRequest.ICNStatus, this.icnRequest.LocationCode, this.objPaging, this.objSystemActivities, userevents).subscribe(
      res => {
        if (res != null && res.length > 0) {
          this.icnResponse = res;
          this.totalRecordCount = this.icnResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }

        else {
          this.icnResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      }

    );

  }


  //Reset Button Click
  clerkreconciliationReset() {
    this.clerkReconciliationReportSearchForm.reset();
    this.clerkReconciliationReportSearchForm.patchValue({ location: "" });
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.clerkReconciliationReportSearchForm.patchValue({
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
    this.entryDetails = false;
    this.transponderDetails = false;
    this.clerkreconciliationSearch("VIEW", this.p, null);
  }

  // view Method for View click in clerk reconciliation details grid
  viewTransactionDetails(icnID, index, icnStatus) {
    this.icnNO = icnID;
    this.status = icnStatus;
    this.transactionDetails = true;
    this.tableHeading = "Transaction Details";
    this.transactionICNId = icnID;
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.objSystemActivities.ActionCode = Actions[Actions.VIEW];
    this.objSystemActivities.FeaturesCode = Features[Features.ICN];
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.IsSearch = true;
    this._reportService.GetTransactionsbyICNId(this.transactionICNId, this.objSystemActivities).subscribe(
      res => {
        if (res != null && res.length > 0) {
          this.icnTransactionResponse = res;
          let totalAmount = this.icnTransactionResponse[0].SystemTxnCount;
          var splitString = totalAmount.split('+');
          this.systemTransactionAmount = splitString[0];
          this.floatAmount = splitString[1];
        }

        else {
          this.icnTransactionResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      }

    );


  }

  //back button click.
  goToClerkReconciledDetails() {
    this.tableHeading = "Clerk Reconciled Details"
    this.transactionDetails = false;
    this.entryDetails = false;
    this.transponderDetails = false;
    //this.clerkreconciliationSearch(this.p, null);
  }


  //view button click in second(transaction details) grid.
  viewEntries(entry, index1, VarianceType, pagenumber: number) {
    this.entryDetails = true;
    let paymentmode
    if (entry.VarianceType == "Cash") {
      paymentmode = PaymentMode[PaymentMode.Cash];
    }
    else if (entry.VarianceType == "Check") {
      paymentmode = PaymentMode[PaymentMode.Cheque];
    }
    else if (entry.VarianceType == "Money Order") {
      paymentmode = PaymentMode[PaymentMode.MoneyOrder];
    }

    if (entry.VarianceType == 'Cash' || entry.VarianceType == 'Check' || entry.VarianceType == 'Money Order') {
      this.entryDetails = true;
      this.transponderDetails = false;
      this.objSystemActivities = <ISystemActivities>{};
      this.objPaging.PageNumber = this.systemPage;
      this.objPaging.PageSize = 10;
      this.objPaging.SortColumn = "USER";
      this.objPaging.SortDir = 1;
      this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
      this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
      this.objSystemActivities.ActionCode = Actions[Actions.VIEW];
      this.objSystemActivities.FeaturesCode = Features[Features.ICN];
      this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objSystemActivities.IsViewed = true;
      this.objSystemActivities.IsSearch = true;
      this._reportService.GetIcnDetailsByIcnId(this.transactionICNId, this.objSystemActivities).subscribe(
        res => {
          if (res != null) {
            this.icnEntryResponse = res;
            console.log("1");
            console.log(this.icnEntryResponse);
          }
        },
        (err) => { }
        , () => {
          this._reportService.GetICNTxnDetailsBYICNId(this.transactionICNId, paymentmode, this.objPaging, this.objSystemActivities).subscribe(res => {
            if (res != null && res.length > 0) {
              this.icnSystemResponse = res;
              console.log("2");
              console.log(this.icnSystemResponse);
              this.systemTotalRecordCount = this.icnSystemResponse[0].ReCount;
              if (this.systemTotalRecordCount < this.systemPageItemNumber) {
                this.systemEndItemNumber = this.systemTotalRecordCount;
              }

            }
            else {
              this.icnSystemResponse = res;
            }
          }, err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = '';
            return;
          });
          err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = '';

            return;
          }
        });
    }
    else {
      this.transponderDetails = true;
      this.entryDetails = false;
      this.viewTransponderDetails(this.transponderPage);
    }
  }

  // view button click in transaction details(second grid) for last two rows
  viewTransponderDetails(pageNumber: number) {
    this.transponderDetails = true;
    this.entryDetails = false;
    var objTxnType = ICNTxnType[ICNTxnType.Transponder];
    this.objSystemActivities = <ISystemActivities>{};
    this.objPaging.PageNumber = this.transponderPage;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = "USER";
    this.objPaging.SortDir = 1;
    this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.objSystemActivities.User = this.sessionContext.customerContext.userName;
    this.objSystemActivities.ActionCode = Actions[Actions.VIEW];
    this.objSystemActivities.FeaturesCode = Features[Features.TAG];
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objSystemActivities.IsViewed = true;
    this._reportService.GetICNItemTxns(this.transactionICNId, objTxnType, this.objPaging, this.objSystemActivities).subscribe(res => {
      if (res != null && res.length > 0) {
        this.icnTransponderResponse = res;
        this.transponderTotalRecordCount = this.icnTransponderResponse[0].ReCount;
        if (this.transponderTotalRecordCount < this.transponderPageItemNumber) {
          this.transponderEndItemNumber = this.transponderTotalRecordCount;
        }
      }

      else {
        this.icnTransponderResponse = res;
      }
    }, err => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText;
      this.msgTitle = '';
      return;
    });
    //  longICNId: number, objTxnType: any, objPaging: any, objSystemActivities: any) 
  }
  // bsValueChange(value) {
  //   if (value == null || value[0] == null) {
  //     this.clerkReconciliationReportSearchForm.controls['timePeriod'].setValue(void 0);
  //   }
  // }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.clerkReconciliationReportSearchForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  getLocations() {
    this.locationsRequest = <IManageUserRequest>{};
    this.locationsRequest.LocationCode = '';
    this.locationsRequest.LocationName = '';
    this.locationsRequest.SortColumn = 'LOCATIONCODE';
    this.locationsRequest.SortDir = 1;
    this.locationsRequest.PageNumber = 1;
    this.locationsRequest.PageSize = 100;
    this._reportService.getLocations(this.locationsRequest).subscribe(res => {
      this.locationResponse = res;
      console.log(this.locationResponse)
    })
  }

  sortDirection(SortingColumn) {
    this.gridArrowUserId = false;
    this.gridArrowUsername = false;
    this.gridArrowICNID = false;
    this.gridArrowICNStatus = false;
    this.gridArrowRevenueDate = false;
    this.gridArrowUpdatedDate = false;
    this.gridArrowLOCATIONNAME = false;

    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "UserId") {
      this.gridArrowUserId = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "Username") {
      this.gridArrowUsername = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ICNID") {
      this.gridArrowICNID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ICNStatus") {
      this.gridArrowICNStatus = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "RevenueDate") {
      this.gridArrowRevenueDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "UpdatedDate") {
      this.gridArrowUpdatedDate = true;
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

    this.clerkreconciliationSearch("", this.p, null);
  }


}
