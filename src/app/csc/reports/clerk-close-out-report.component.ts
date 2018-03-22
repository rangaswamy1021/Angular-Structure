import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CSCReportsService } from "./services/reports.service";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { ActivitySource, Actions, Features, defaultCulture } from "../../shared/constants";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../shared/models/paging";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';

@Component({
  selector: 'app-clerk-close-out-report',
  templateUrl: './clerk-close-out-report.component.html',
  styleUrls: ['./clerk-close-out-report.component.scss']
})
export class ClerkCloseOutReportComponent implements OnInit {
  gridArrowLOCATIONNAME: boolean;
  gridArrowICNID: boolean;
  gridArrowUpdatedDate: boolean;
  gridArrowRevenueDate: boolean;
  gridArrowICNStatus: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowUserId: boolean;
  gridArrowUsername: boolean;
  gridArrowTOLLRATENAME: boolean;
  LocationCode: any;
  invalidDateRange: boolean;
  viewDisableButton: boolean;
  searchDisableButton: boolean;
  timePeriod: Date[];
  systemTransactionAmount: string;
  floatAmount: string;
  type: any;
  status: any;
  icnId: any;
  clerkCountResponse: any;
  itemDetails: any;
  clerkEntries: any;
  transactionSystemDetails: any;
  loginId: number;
  userId: number;
  userName: string;
  icnPattern = "^[0-9]+$";
  item = false;
  clerkCloseOutForm: FormGroup;
  sessionContextResponse: IUserresponse;
  clerk = true;
  transaction = false;
  clerkSystem = false;
  transactionDetails: any;
  startDate: string;
  endDate: string;
  icnNumber: any;
  // objSystemActivities: ISystemActivities;
  objPaging: IPaging;
  activitySource = ActivitySource[ActivitySource.Internal];
  objSystemActivities: ISystemActivities = <ISystemActivities>{};
  userEvents = <IUserEvents>{};
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageNumber: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  txnPageNumber: number;
  txnPageItemNumber: number = 10;
  txnStartItemNumber: number = 1;
  txnEndItemNumber: number;
  txnTotalRecordCount: number;

  itemPageNumber: number;
  itemPageItemNumber: number = 10;
  itemStartItemNumber: number = 1;
  itemEndItemNumber: number;
  itemTotalRecordCount: number;

  locationResponse: IManageUserResponse[];
  locationsRequest: IManageUserRequest;

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.clerkCloseOutReportSearch("", this.pageNumber, null);
  }

  txnPageChanged(event) {
    this.txnPageNumber = event;
    this.txnStartItemNumber = (((this.txnPageNumber) - 1) * this.txnPageItemNumber) + 1;
    this.txnEndItemNumber = ((this.txnPageNumber) * this.txnPageItemNumber);
    if (this.txnEndItemNumber > this.txnTotalRecordCount)
      this.txnEndItemNumber = this.txnTotalRecordCount;
    this.viewClerkAndSystemEntries(this.type, this.txnPageNumber);
  }

  itemPageChanged(event) {
    this.itemPageNumber = event;
    this.itemStartItemNumber = (((this.itemPageNumber) - 1) * this.itemPageItemNumber) + 1;
    this.itemEndItemNumber = ((this.itemPageNumber) * this.itemPageItemNumber);
    if (this.itemEndItemNumber > this.itemTotalRecordCount)
      this.itemEndItemNumber = this.itemTotalRecordCount;
    this.viewItemDetails(this.itemPageNumber);
  }
  constructor(private router: Router, private sessionContext: SessionService,
    private clerkCloseOutService: CSCReportsService, private commonService: CommonService, private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.gridArrowICNID = true;
    this.sortingColumn = "ICNID";
    this.materialscriptService.material();
    this.pageNumber = 1;
    this.endItemNumber = 10;

    this.txnPageNumber = 1;
    this.txnEndItemNumber = 10;

    this.itemPageNumber = 1;
    this.itemEndItemNumber = 10;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;

    this.clerkCloseOutForm = new FormGroup({
      'icnNumber': new FormControl('', Validators.pattern(this.icnPattern)),
      'timePeriod': new FormControl('', Validators.required),
      'location': new FormControl('')
    });
    this.setDateRange();
    this.getUserEvents();
    this.clerkCloseOutReportSearch("VIEW", this.pageNumber, this.userEvents);
    this.searchDisableButton = !this.commonService.isAllowed(Features[Features.CLERKCLOSEOUT], Actions[Actions.SEARCH], "");
    this.viewDisableButton = !this.commonService.isAllowed(Features[Features.CLERKCLOSEOUT], Actions[Actions.VIEW], "");
    this.getLocations();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setDateRange(): void {
    // Set date range (today) using the patchValue function
    let date = new Date();
    this.clerkCloseOutForm.patchValue({
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

  viewTransactionDetails(ID, status) {
    this.clerk = false;
    this.transaction = true;
    this.getTransactionsbyICNId(ID, status);

  }

  backToClerkDetails() {
    this.clerk = true;
    this.transaction = false;
    this.clerkSystem = false;
    this.item = false;
  }
  viewClerkAndSystemEntries(type, pageNumber) {
    if (pageNumber == 1) {
      this.txnPageNumber = 1;
      this.txnStartItemNumber = 1;
      this.txnEndItemNumber = 10;
    }
    this.type = type;
    this.clerkSystem = true;
    this.item = false;
    let icnId = this.icnId;
    this.objPaging.PageNumber = pageNumber;
    if (type == "Cash")
      type = "CASH";
    else if (type == "Check")
      type = "CHEQUE";
    else if (type == "Money Order")
      type = "MONEYORDER";
    else if (type != "") {
      this.viewItemDetails(pageNumber);
      return;
    }


    this.objPaging.SortColumn = "LINKID";

    this.clerkCloseOutService.GetICNTxnDetailsBYICNId(icnId, type, this.objPaging, this.objSystemActivities).subscribe(
      res => {
        this.transactionSystemDetails = res;
        if (res != null && res.length > 0) {
          this.txnTotalRecordCount = this.transactionSystemDetails[0].ReCount;
          if (this.txnTotalRecordCount < this.txnPageItemNumber) {
            this.txnEndItemNumber = this.txnTotalRecordCount;
          }
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      }
    );

  }
  viewItemDetails(pageNumber) {
    if (pageNumber == 1) {
      this.itemPageNumber = 1;
      this.itemStartItemNumber = 1;
      this.itemEndItemNumber = 10;
    }
    this.clerkSystem = false;
    this.item = true;
    let icnId = this.icnId;
    let type = "";
    this.objPaging.SortColumn = "ICNID";
    this.objPaging.PageNumber = pageNumber;
    this.clerkCloseOutService.GetICNItemTxns(icnId, type, this.objPaging, this.objSystemActivities).subscribe(
      res => {
        this.itemDetails = res;
        if (res != null && res.length > 0) {
          this.itemTotalRecordCount = this.itemDetails[0].ReCount;
          if (this.itemTotalRecordCount < this.itemPageItemNumber) {
            this.itemEndItemNumber = this.itemTotalRecordCount;
          }
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      }
    );
  }
  clerkCloseOutReportSearchButton() {
    this.getUserEvents();
    this.userEvents.ActionName = Actions[Actions.SEARCH];
    this.clerkCloseOutReportSearch('SEARCH', 1, this.userEvents)
  }
  clerkCloseOutReportSearch(type, PageNumber, userEvents) {
    this.clerk = true;
    this.transaction = false;
    this.clerkSystem = false;
    this.item = false;
    let status = "CLOSED";  //CLOSED
    if (type == "SEARCH") {
      this.icnNumber = this.clerkCloseOutForm.controls['icnNumber'].value;
      const location = this.clerkCloseOutForm.controls['location'].value;

      if (this.icnNumber == "" || this.icnNumber == null)
        this.icnNumber = 0;
      if (location != null && location != "") {
        this.LocationCode = location;
      }
      else {
        this.LocationCode = "";
      }
      let dateRange = this.clerkCloseOutForm.controls['timePeriod'].value;
      if (dateRange != "" && dateRange != null) {
        // const strDateRange = dateRange.slice(',');

        let firstDate = new Date(dateRange.beginDate.month + '/' + dateRange.beginDate.day + '/' + dateRange.beginDate.year);
        let lastDate = new Date(dateRange.endDate.month + '/' + dateRange.endDate.day + '/' + dateRange.endDate.year);
        this.startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }
      else {
        this.startDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.endDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }

    }
    if (type == "VIEW") {
      this.icnNumber = 0;
      this.LocationCode = "";
      this.startDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.endDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");

    }
    if (this.clerkCloseOutForm.valid) {
      this.objSystemActivities.UserId = this.userId;
      this.objSystemActivities.LoginId = this.loginId;
      this.objSystemActivities.User = this.userName;
      this.objSystemActivities.ActionCode = Actions[Actions.VIEW];
      this.objSystemActivities.FeaturesCode = Features[Features.ICN];
      this.objSystemActivities.IsViewed = true;
      this.objSystemActivities.IsSearch = true;
      this.objSystemActivities.ActivitySource = this.activitySource;
      this.objPaging = <IPaging>{};
      this.objPaging.PageNumber = PageNumber;
      this.objPaging.PageSize = 10;
      this.objPaging.SortColumn = this.sortingColumn;
      this.objPaging.SortDir = this.sortingDirection == true ? 1 : 0;
      this.clerkCloseOutService.GetICNHistoryReports(this.icnNumber, this.startDate, this.endDate, status, this.LocationCode, this.objPaging, this.objSystemActivities, userEvents).subscribe(
        res => {
          this.clerkCountResponse = res;
          if (res != null && res.length > 0) {
            this.totalRecordCount = this.clerkCountResponse[0].ReCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
        },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';

          return;
        }
      );
    }
    else
      this.validateAllFormFields(this.clerkCloseOutForm);
  }
  clerkCloseOutReportReset() {
    this.clerk = true;
    this.transaction = false;
    this.clerkSystem = false;
    this.item = false;
    this.clerkCloseOutForm.reset();
    this.setDateRange();
    this.clerkCloseOutReportSearch("VIEW", this.pageNumber, null);
    this.clerkCloseOutForm.patchValue({ location: "" });

  }

  getTransactionsbyICNId(ID, status) {
    this.icnId = ID;
    this.status = status;
    this.clerkCloseOutService.GetTransactionsbyICNId(this.icnId, this.objSystemActivities).subscribe(
      res => {
        this.transactionDetails = res;
        let totalAmount = this.transactionDetails[0].SystemTxnCount;
        var splitString = totalAmount.split('+');
        this.systemTransactionAmount = splitString[0];
        this.floatAmount = splitString[1];
        this.getIcnDetailsByIcnId()


      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      }
    );
  }


  getIcnDetailsByIcnId() {
    let icnId = this.icnId;
    let systemActivities;

    this.clerkCloseOutService.GetIcnDetailsByIcnId(icnId, this.objSystemActivities).subscribe(
      res => {
        this.clerkEntries = res;
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      }
    );
  }
  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.CLERKCLOSEOUT];
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
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


  onInputFieldRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

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

    this.clerkCloseOutReportSearch("", this.pageNumber, null);
  }
  getLocations() {
    this.locationsRequest = <IManageUserRequest>{};
    this.locationsRequest.LocationCode = '';
    this.locationsRequest.LocationName = '';
    this.locationsRequest.SortColumn = 'LOCATIONCODE';
    this.locationsRequest.SortDir = 1;
    this.locationsRequest.PageNumber = 1;
    this.locationsRequest.PageSize = 100;
    this.clerkCloseOutService.getLocations(this.locationsRequest).subscribe(res => {
      this.locationResponse = res;
      console.log(this.locationResponse)
    })
  }
}
