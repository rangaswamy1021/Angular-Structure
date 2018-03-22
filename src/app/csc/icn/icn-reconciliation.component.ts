import { Component, OnInit } from '@angular/core';
import { ICNService } from './services/icn.service';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICNDetailsRequest } from './models/icndetailsrequest';
import { IPaging } from '../../shared/models/paging';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { Actions, Features, ApplicationTransactionTypes, defaultCulture } from '../../shared/constants';
import { ICNStatus } from './constants';
import { ICNDetailsResponse } from './models/icndetailsresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IVarianceDetailsResponse } from './models/variancedetailsresponse';
import { PaymentMode } from '../../payment/constants';
import { IICNTxnsResponse } from './models/icntxnsresponse';
import { ICNSysTxns } from './models/icnsystxns';
import { CurrencycustomPipe } from "../../shared/pipes/convert-currency.pipe";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-icn-reconciliation',
  templateUrl: './icn-reconciliation.component.html',
  styleUrls: ['./icn-reconciliation.component.scss']
})
export class IcnReconciliationComponent implements OnInit {
  invalidDate: boolean;

  constructor(private icnService: ICNService, private datePickerFormat: DatePickerFormatService, private router: Router, private sessionContext: SessionService, private currencycustomPipe: CurrencycustomPipe, private commonService: CommonService, 
  private materialscriptService:MaterialscriptService) { }

  icnReconcileForm: FormGroup;

  sessionContextResponse: IUserresponse;
  icnUsersDetailsResponseArray: ICNDetailsResponse[] = [];
  varianceDetailsArray: IVarianceDetailsResponse[] = [];
  icnTagTxnsArray: IICNTxnsResponse[] = [];
  icnManualEntriesArray: ICNDetailsResponse[] = [];
  icnSystemEntriesArray: ICNSysTxns[] = [];
  icnDetailsRequest: ICNDetailsRequest;

  usersPageNumber: number = 1;
  usersPageItemNumber: number = 10;
  usersStartItemNumber: number = 1;
  usersEndItemNumber: number = this.usersPageItemNumber;
  usersTotalRecordCount: number;

  sEntiresPageNumber: number = 1;
  sEntiresPageItemNumber: number = 10;
  sEntiresStartItemNumber: number = 1;
  sEntiresEndItemNumber: number = this.sEntiresPageItemNumber;
  sEntiresTotalRecordCount: number;

  tagsPageNumber: number = 1;
  tagsPageItemNumber: number = 10;
  tagsStartItemNumber: number = 1;
  tagsEndItemNumber: number = this.tagsPageItemNumber;
  tagsTotalRecordCount: number;

  isReconcileButtonVisible: boolean = false;

  isViewIcnUsers: boolean = true;
  isViewTransactions: boolean = false;
  isViewPaymentTxnEntries: boolean = false;
  isViewTransponderTxnDetails: boolean = false;
  icnIdViewed: number;
  statusViewed: string;
  paymentModeViewed: string;

  validateNumberPattern = "[0-9]*";
  disableSearchButton: boolean;
  disableReconcileButton: boolean;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  timePeriod: Date[];
  invalid: boolean;
  calOptions: ICalOptions = <ICalOptions>{};

  myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.icnReconcileForm = new FormGroup({
      icnId: new FormControl('', Validators.pattern(this.validateNumberPattern)),
      timeperiod: new FormControl('', [Validators.required]),
    });

    this.currentDateSelection();
    this.getUserDetails(true, false, Actions[Actions.VIEW]);
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.ICNRECONCILE], Actions[Actions.SEARCH], "");
    this.disableReconcileButton = !this.commonService.isAllowed(Features[Features.ICNRECONCILE], Actions[Actions.RECONCILE], "");
  }

  currentDateSelection() {
    this.icnDetailsRequest = <ICNDetailsRequest>{};
    this.icnDetailsRequest.ICNId = 0;
    let date = new Date();
    this.icnReconcileForm.patchValue({
      timeperiod: {
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
    let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnReconcileForm.controls["timeperiod"].value);
    this.icnDetailsRequest.CreatedDate = datevalue[0];
    this.icnDetailsRequest.UpdatedDate = datevalue[1];
    // var todayDate: Date = new Date();
    // this.icnDetailsRequest.CreatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.icnDetailsRequest.UpdatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.icnReconcileForm.controls["timeperiod"].setValue([this.icnDetailsRequest.CreatedDate, this.icnDetailsRequest.UpdatedDate]);
  }

  usersPageChanged(event) {
    this.usersPageNumber = event;
    this.usersStartItemNumber = (((this.usersPageNumber) - 1) * this.usersPageItemNumber) + 1;
    this.usersEndItemNumber = ((this.usersPageNumber) * this.usersPageItemNumber);
    if (this.usersEndItemNumber > this.usersTotalRecordCount)
      this.usersEndItemNumber = this.usersTotalRecordCount;
    this.isViewIcnUsers = true;
    this.isViewTransactions = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = 0;
    this.statusViewed = "";
    this.getUserDetails(false, false, "");
  }

  searchUsers() {
    if (this.icnReconcileForm.valid) {
      this.icnDetailsRequest = <ICNDetailsRequest>{};
      this.icnDetailsRequest.ICNId = this.icnReconcileForm.controls["icnId"].value ? this.icnReconcileForm.controls["icnId"].value : 0;

      let fromDate = new Date();
      let toDate = new Date();
      let strDate = this.icnReconcileForm.controls["timeperiod"].value;
      if (strDate) {
        let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnReconcileForm.controls['timeperiod'].value);
        this.icnDetailsRequest.CreatedDate = datevalue[0];
        this.icnDetailsRequest.UpdatedDate = datevalue[1];
        // this.icnDetailsRequest.CreatedDate = this.icnReconcileForm.controls["timeperiod"].value[0];
        // this.icnDetailsRequest.UpdatedDate = this.icnReconcileForm.controls["timeperiod"].value[1];
        this.usersPageNumber = 1;
        this.usersStartItemNumber = 1;
        this.usersEndItemNumber = this.usersPageItemNumber;
        this.isViewIcnUsers = true;
        this.isViewTransactions = false;
        this.isViewPaymentTxnEntries = false;
        this.isViewTransponderTxnDetails = false;
        this.icnIdViewed = 0;
        this.statusViewed = "";
        this.getUserDetails(false, true, Actions[Actions.SEARCH]);
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Invalid Date Range";

      }
    }
    // else {
    //   this.msgType = 'error';
    //   this.msgFlag = true;
    //   this.msgDesc = "Invalid Date Range";

    // }

  }

  getUserDetails(isView: boolean, isSearch: boolean, userEventsActionName: string) {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.usersPageNumber;
    paging.PageSize = this.usersPageItemNumber;
    paging.SortColumn = "ICNID";
    paging.SortDir = 1;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICNRECONCILE];
    systemActivities.IsViewed = isView;
    systemActivities.IsSearch = isSearch;

    //this.icnDetailsRequest.UpdatedDate.setHours(23, 59, 59, 59);

    let userEvents: IUserEvents;
    if (userEventsActionName) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNRECONCILE];
      userEvents.ActionName = userEventsActionName;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }

    this.icnService.icnUsersSearch(this.icnDetailsRequest.ICNId, this.icnDetailsRequest.CreatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), this.icnDetailsRequest.UpdatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), ICNStatus[ICNStatus.Verified], paging, systemActivities, userEvents)
      .subscribe(res => {
        this.icnUsersDetailsResponseArray = res;
        console.log(this.icnUsersDetailsResponseArray);
        if (this.icnUsersDetailsResponseArray && this.icnUsersDetailsResponseArray.length > 0) {
          this.usersTotalRecordCount = this.icnUsersDetailsResponseArray[0].ReCount;
          if (this.usersTotalRecordCount < this.usersPageItemNumber) {
            this.usersEndItemNumber = this.usersTotalRecordCount;
          }
        }
      });
  }

  resetSearchDetails() {
    this.icnReconcileForm.reset();
    this.usersPageNumber = 1;
    this.usersStartItemNumber = 1;
    this.usersEndItemNumber = this.usersPageItemNumber;
    this.currentDateSelection();
    this.isViewIcnUsers = true;
    this.isViewTransactions = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = 0;
    this.statusViewed = "";
    this.paymentModeViewed = "";
    this.getUserDetails(false, false, "");
  }

  getICNTransactionDetails(icnUsersDetails: ICNDetailsResponse) {

    if (icnUsersDetails.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase()) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "You cannot view your details";
      return;
    }

    this.isViewTransactions = true;
    this.isViewIcnUsers = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = icnUsersDetails.ICNId;
    this.statusViewed = icnUsersDetails.ICNStatus.toString();
    this.paymentModeViewed = "";
    this.isReconcileButtonVisible = true;

    if (icnUsersDetails.ICNId) {
      let systemActivities: ISystemActivities = <ISystemActivities>{};
      systemActivities.UserId = this.sessionContextResponse.userId;
      systemActivities.User = this.sessionContextResponse.userName;
      systemActivities.LoginId = this.sessionContextResponse.loginId;
      systemActivities.CustomerId = icnUsersDetails.UserId;
      systemActivities.IsViewed = true;
      systemActivities.ActionCode = Actions[Actions.VIEW];
      systemActivities.FeaturesCode = Features[Features.ICNRECONCILE];

      this.icnService.getTransactionsbyICNId(icnUsersDetails.ICNId, systemActivities)
        .subscribe(res => {
          this.varianceDetailsArray = res;
          if (this.varianceDetailsArray && this.varianceDetailsArray.length > 0) {
            this.varianceDetailsArray.forEach(element => {
              if (element.VarianceType.toUpperCase() == PaymentMode[PaymentMode.Cash].toUpperCase()) {
                let strCash: string[] = element.SystemTxnCount.split('+');
                let strSystemTxns = this.currencycustomPipe.transform(strCash[0]);
                let strFloatAmount: string = strCash.length > 1 ? this.currencycustomPipe.transform(strCash[1]) : this.currencycustomPipe.transform(icnUsersDetails.FloatAmount);
                element.SystemTxnCount = strSystemTxns + "+" + strFloatAmount;
              }
              else
                element.SystemTxnCount = this.currencycustomPipe.transform(element.SystemTxnCount);
            });
          }
          console.log(this.varianceDetailsArray);
        });
    }
  }

  reconcileUser() {
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.RECONCILE];
    systemActivities.FeaturesCode = Features[Features.ICNRECONCILE];
    systemActivities.IsViewed = true;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ICNRECONCILE];
    userEvents.ActionName = Actions[Actions.RECONCILE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.icnService.updateICNStatus(this.icnIdViewed, ICNStatus[ICNStatus.Reconciled], this.sessionContextResponse.userName, systemActivities, userEvents)
      .subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = "ICN has been reconciled successfully";
          this.isReconcileButtonVisible = false;
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
      });
  }

  backToViewIcnUsers() {
    this.isViewIcnUsers = true;
    this.isViewTransactions = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = 0;
    this.statusViewed = "";
    this.paymentModeViewed = "";
    this.getUserDetails(false, false, "");
  }

  getPaymentandTransponderDetails(varianceType: string) {
    this.paymentModeViewed = "";
    console.log(varianceType);
    if (varianceType.toUpperCase() == ApplicationTransactionTypes[ApplicationTransactionTypes.ASSIGNTAG] || varianceType.toUpperCase() == ApplicationTransactionTypes[ApplicationTransactionTypes.TAGRETURN]) {
      console.log('transponder block');
      this.icnSystemEntriesArray = [];
      this.tagsPageNumber = 1;
      this.tagsStartItemNumber = 1;
      this.tagsEndItemNumber = this.tagsPageItemNumber;
      this.isViewTransponderTxnDetails = true;
      this.isViewPaymentTxnEntries = false;
      this.getTransponderTxnDetails(true);
    }
    else {
      console.log('payment block');
      this.icnTagTxnsArray = [];
      this.sEntiresPageNumber = 1;
      this.sEntiresStartItemNumber = 1;
      this.sEntiresEndItemNumber = this.sEntiresPageItemNumber;
      this.paymentModeViewed = varianceType;
      this.isViewTransponderTxnDetails = false;
      this.isViewPaymentTxnEntries = true;
      this.getManualEntries(true);
      this.getSystemEntries(true);
    }
  }

  tagsPageChanged(event) {
    this.tagsPageNumber = event;
    this.tagsStartItemNumber = (((this.tagsPageNumber) - 1) * this.tagsPageItemNumber) + 1;
    this.tagsEndItemNumber = ((this.tagsPageNumber) * this.tagsPageItemNumber);
    if (this.tagsEndItemNumber > this.tagsTotalRecordCount)
      this.tagsEndItemNumber = this.tagsTotalRecordCount;
    this.isViewTransponderTxnDetails = true;
    this.isViewPaymentTxnEntries = false;
    this.getTransponderTxnDetails(false);
  }

  getTransponderTxnDetails(isView: boolean) {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.tagsPageNumber;
    paging.PageSize = this.tagsPageItemNumber;
    paging.SortColumn = "SERIALNO";
    paging.SortDir = 1;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.TAG];
    systemActivities.IsViewed = isView;

    this.icnService.getICNItemTxns(this.icnIdViewed, paging, systemActivities)
      .subscribe(res => {
        this.icnTagTxnsArray = res;
        console.log(this.icnTagTxnsArray);
        if (this.icnTagTxnsArray && this.icnTagTxnsArray.length > 0) {
          this.tagsTotalRecordCount = this.icnTagTxnsArray[0].ReCount;
          if (this.tagsTotalRecordCount < this.tagsPageItemNumber) {
            this.tagsEndItemNumber = this.tagsTotalRecordCount;
          }
        }
      });
  }

  systemEntriesPageChanged(event) {
    this.sEntiresPageNumber = event;
    this.sEntiresStartItemNumber = (((this.sEntiresPageNumber) - 1) * this.sEntiresPageItemNumber) + 1;
    this.sEntiresEndItemNumber = ((this.sEntiresPageNumber) * this.sEntiresPageItemNumber);
    if (this.sEntiresEndItemNumber > this.sEntiresTotalRecordCount)
      this.sEntiresEndItemNumber = this.sEntiresTotalRecordCount;
    this.isViewTransponderTxnDetails = false;
    this.isViewPaymentTxnEntries = true;
    this.getSystemEntries(false);
  }

  getManualEntries(isView: boolean) {
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICNRECONCILE];
    systemActivities.IsViewed = isView;

    this.icnService.getICNDetailsByICNId(this.icnIdViewed, systemActivities)
      .subscribe(res => {
        this.icnManualEntriesArray = res;
        console.log(this.icnManualEntriesArray);
      });
  }

  getSystemEntries(isView: boolean) {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.sEntiresPageNumber;
    paging.PageSize = this.sEntiresPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.PAYMENT];
    systemActivities.IsViewed = isView;
    this.icnService.getICNTxnDetailsBYICNId(this.icnIdViewed, this.paymentModeViewed, paging, systemActivities)
      .subscribe(res => {
        this.icnSystemEntriesArray = res;
        console.log(this.icnSystemEntriesArray);
        if (this.icnSystemEntriesArray && this.icnSystemEntriesArray.length > 0) {
          this.sEntiresTotalRecordCount = this.icnSystemEntriesArray[0].ReCount;
          if (this.sEntiresTotalRecordCount < this.sEntiresPageItemNumber) {
            this.sEntiresEndItemNumber = this.sEntiresTotalRecordCount;
          }
        }
      });
  }
    onDateRangeFieldChanged(event) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
 
}
