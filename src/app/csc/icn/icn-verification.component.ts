import { CommonService } from './../../shared/services/common.service';
import { IUserEvents } from './../../shared/models/userevents';
import { ICNTxns } from './models/icntxnsresponse';
import { ICNSysTxns } from './models/icnsystxns';
import { PaymentMode } from './../../payment/constants';
import { debug } from 'util';
import { IVarianceDetailsResponse } from './models/variancedetailsresponse';
import { ICNDetailsResponse } from './models/icndetailsresponse';
import { ICNStatus } from './constants';
import { SessionService } from './../../shared/services/session.service';
import { ICNService } from './services/icn.service';
import { Router } from '@angular/router';
import { Actions, Features, defaultCulture } from './../../shared/constants';
import { IUserresponse } from './../../shared/models/userresponse';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IPaging } from './../../shared/models/paging';
import { ICNDetailsRequest } from './models/icndetailsrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { BoundCallbackObservable } from 'rxjs/observable/BoundCallbackObservable';
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-icn-verification',
  templateUrl: './icn-verification.component.html',
  styleUrls: ['./icn-verification.component.scss']
})
export class IcnVerificationComponent implements OnInit {
  invalidDate: boolean;
  timeperiod: any;
  moment4: Date;
  icnVerificationForm: FormGroup;
  icnDetailsRequest: ICNDetailsRequest;
  isViewIcnUsers: boolean = true;
  isViewTransactions: boolean = false;
  isViewPaymentTxnEntries: boolean = false;
  isViewTransponderTxnDetails: boolean = false;
  icnIdViewed: number;
  paymentModeViewed: string;
  isVerifyButtonVisible: boolean = false;
  usersPageNumber: number = 1;
  usersPageItemNumber: number = 10;
  usersStartItemNumber: number = 1;
  usersEndItemNumber: number = this.usersPageItemNumber;
  usersTotalRecordCount: number;
  isSearchEnable: boolean = true;
  isVarianceEnable: boolean = false;
  isClerkVerification: boolean = false;
  isClerkEnable: boolean = false;
  isSysEnable: boolean = false;
  isItemSysTxns: boolean = false;
  payMode: string = "";
  constructor(private icnService: ICNService,
    private datePickerFormat: DatePickerFormatService,
    private router: Router,
    private sessionContext: SessionService,
    private commonService: CommonService) { }
  sessionContextResponse: IUserresponse;
  icnUsersDetailsResponseArray: ICNDetailsResponse[] = [];
  varianceDetailsArray: IVarianceDetailsResponse[] = [];
  icnManualEntriesArray: ICNDetailsResponse[] = [];
  icnManualEntry: ICNDetailsResponse;
  clerkEntries: ICNDetailsResponse;
  icnSysEntries: ICNSysTxns[] = [];
  icnTxns: ICNTxns[] = [];
  userId: number;
  icnId: number;
  isError: boolean = false;
  errorMessage: string;
  isSuccess: boolean = false;
  isNote: boolean = false;
  isReopen: boolean = false;
  successMessage: string = "";
  txtDescription: string;
  isVarianceOccured: boolean = false;
  descLength: number = 250;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  disableSearch: boolean;
  disableReopen: boolean;
  disableVerify: boolean;
  timePeriod: Date[];
  invalid: boolean;
  calOptions: ICalOptions = <ICalOptions>{};
  myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };
  // timeperiod:any;
  ngOnInit() {
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.timeperiod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.icnVerificationForm = new FormGroup({

      timeperiod: new FormControl('', [Validators.required]),
    });
    this.currentDateSelection();
    this.getUserDetails(false, false, Actions[Actions.VIEW]);
    this.icnManualEntry = <ICNDetailsResponse>{};
    this.icnManualEntry.CashAmount = 0;
    this.icnManualEntry.CheckAmount = 0;
    this.icnManualEntry.MOAmount = 0;
    this.icnManualEntry.ItemAllotedCount = 0;
    this.icnManualEntry.ItemAssignCount = 0;
    this.icnManualEntry.ItemRemainingCount = 0;
    this.icnManualEntry.ItemReturnedCount = 0;
    this.disableSearch = !this.commonService.isAllowed(Features[Features.ICNVERIFY], Actions[Actions.SEARCH], "");
    this.disableVerify = !this.commonService.isAllowed(Features[Features.ICNVERIFY], Actions[Actions.VERIFY], "");
    this.disableReopen = !this.commonService.isAllowed(Features[Features.ICNVERIFY], Actions[Actions.REOPEN], "");
  }

  getTxn(variance) {
    let type = this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase());
    alert(type);
    this.getTxns(type.toString());
  }


  submitNotes() {
    if (this.txtDescription == "" || this.txtDescription == null) {
      this.isError = true;
      this.errorMessage = "Notes required";
      this.isSuccess = false;
      this.isReopen = false;
      this.successMessage = "";
      return;
    }
    this.icnService.updateICNotes(this.icnId, this.txtDescription, this.sessionContextResponse.userName)
      .subscribe(res => {
        if (res) {
          this.isReopen = true;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = 'ICN has been verified successfully';
          this.isNote = false;
        }
      });
  }
  reopen() {
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.CustomerId = this.userId;
    systemActivities.IsViewed = true;
    systemActivities.ActionCode = Actions[Actions.REOPEN];
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];
    let iCNDetails = <ICNDetailsRequest>{}
    iCNDetails.UserName = this.sessionContextResponse.userName;
    let status = ICNStatus[ICNStatus.Reopened].toString();

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ICNVERIFY];
    userEvents.ActionName = Actions[Actions.REOPEN];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.icnService.updateICNStatus(this.icnId, status, iCNDetails.UserName, systemActivities, userEvents).subscribe(res => {
      if (res) {
        this.cancel();
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgTitle = '';
        this.msgDesc = 'ICN has been verified successfully';
      }
    });
  }
  btnVerify(icnManualEntry: ICNDetailsResponse) {
    this.isVarianceEnable = true;
    this.isClerkVerification = false;
    this.isSysEnable = false;
    this.isItemSysTxns = false;
    this.isNote = true;
    this.icnTxns = <ICNTxns[]>[];
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.CustomerId = this.userId;
    systemActivities.IsViewed = true;
    systemActivities.ActionCode = Actions[Actions.VERIFY];
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ICNVERIFY];
    userEvents.ActionName = Actions[Actions.VERIFY];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    let varianceDetails = <IVarianceDetailsResponse>{};
    debugger;
    this.icnService.getTxnsbyICNId(this.icnId, systemActivities)
      .subscribe(res => {
        this.varianceDetailsArray = res;
        if (this.varianceDetailsArray != null && this.varianceDetailsArray.length > 0) {       
          console.log(this.varianceDetailsArray);
          varianceDetails = this.varianceDetailsArray[0];
          this.varianceDetailsArray.forEach(x => {
            if (parseInt(x.Variance) > 0) {
              this.isVarianceOccured = true;
            }
          });
          if (this.isVarianceOccured) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = "Variance Occured";
          }
          let iCNDetails = <ICNDetailsRequest>{}
          iCNDetails.ICNId = this.icnId;
          iCNDetails.CashAmount = parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CASH")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CASH")[0].Variance) : 0;
          iCNDetails.CheckAmount = parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CHEQUE")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CHEQUE")[0].Variance) : 0;
          iCNDetails.MOAmount = parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "MONEYORDER")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "MONEYORDER")[0].Variance) : 0;
          iCNDetails.CreditAmount = 0;// parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CREDITCARD")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "CREDITCARD")[0].Variance) : 0;          
          iCNDetails.ItemAssignCount = parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "ASSIGN TAG")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "ASSIGN TAG")[0].Variance) : 0;
          iCNDetails.ItemReturnedCount = parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "TAG ASSIGN TO RETURNED")[0].Variance) ? parseInt(this.varianceDetailsArray.filter(x => x.VarianceType.toUpperCase() == "TAG ASSIGN TO RETURNED")[0].Variance) : 0;
          iCNDetails.TotalVarianceAmount = iCNDetails.CashAmount + iCNDetails.CheckAmount + iCNDetails.CreditAmount + iCNDetails.MOAmount;
          iCNDetails.TotalVarianceItemCount = iCNDetails.ItemAssignCount + iCNDetails.ItemReturnedCount;
          iCNDetails.UserName = this.sessionContextResponse.userName;
          let isVerified = false;
          this.icnService.insertIcnVariance(iCNDetails, userEvents).subscribe(res => {
            if (res) {
              let status;
              if (iCNDetails.TotalVarianceAmount == 0 && iCNDetails.TotalVarianceItemCount == 0) {
                isVerified = true;
                status = ICNStatus[ICNStatus.Verified].toString();//. ICNStatus.Verified.toString();
              }
              else {
                status = ICNStatus[ICNStatus.Variance].toString();
              }

              this.icnService.updateICNStatus(this.icnId, status, iCNDetails.UserName, systemActivities, userEvents).subscribe(res => {
                if (res) {
                  if (isVerified) {
                    this.msgFlag = true;
                    this.msgType = 'success';
                    this.msgTitle = '';
                    this.msgDesc = 'ICN has been verified successfully';
                  }
                }
              });
            }
          });
        }
      });
  }

  tagSysPageNumber: number = 1;
  tagPageItemNumber: number = 10;
  tagStartItemNumber: number = 1;
  tagEndItemNumber: number = this.tagPageItemNumber;
  tagTotalRecordCount: number;

  tagPageChanged(event) {
    this.tagSysPageNumber = event;
    this.tagStartItemNumber = (((this.tagSysPageNumber) - 1) * this.tagPageItemNumber) + 1;
    this.tagEndItemNumber = ((this.tagSysPageNumber) * this.tagPageItemNumber);
    if (this.tagEndItemNumber > this.tagTotalRecordCount)
      this.tagEndItemNumber = this.tagTotalRecordCount;
    this.getOnlySysTxns();
  }
  getOnlySysTxns() {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.tagSysPageNumber;
    paging.PageSize = this.tagPageItemNumber;
    paging.SortColumn = "SERIALNO";
    paging.SortDir = 1;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];
    systemActivities.IsViewed = true;
    this.icnService.bindItemSystransactions(this.icnId, paging, systemActivities)
      .subscribe(res => {
        this.icnTxns = res;
        if (this.icnTxns.length > 0 && this.icnTxns != null) {
          this.tagTotalRecordCount = this.icnTxns[0].ReCount;
        }
        if (this.tagTotalRecordCount < this.tagPageItemNumber) {
          this.tagEndItemNumber = this.tagTotalRecordCount
        }
      });

    this.isItemSysTxns = true;
    this.isSysEnable = false;
    this.isClerkEnable = false;
  }

  SysPageNumber: number = 1;
  PageItemNumber: number = 10;
  StartItemNumber: number = 1;
  EndItemNumber: number = this.PageItemNumber;
  TotalRecordCount: number;

  PageChanged(event) {
    this.SysPageNumber = event;
    this.StartItemNumber = (((this.SysPageNumber) - 1) * this.PageItemNumber) + 1;
    this.EndItemNumber = ((this.SysPageNumber) * this.PageItemNumber);
    if (this.EndItemNumber > this.TotalRecordCount)
      this.EndItemNumber = this.TotalRecordCount;
    this.getTxns(this.payMode);
  }
  getTxns(payMode: string) {
    this.payMode = payMode;

    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.SysPageNumber;
    paging.PageSize = this.PageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];
    systemActivities.IsViewed = true;
    this.icnTxns = <ICNTxns[]>[];
    if (payMode != null) {      
      if ((payMode.toUpperCase() == 'ASSIGN TAG') || (payMode.toUpperCase() == 'TAG ASSIGN TO RETURNED')) {
        this.getOnlySysTxns();
        return;
      }
    }

    this.icnService.bindClerktransactions(this.icnId, systemActivities)
      .subscribe(res => {
        this.clerkEntries = res;
        console.log(this.clerkEntries);
      });

    this.icnService.bindSystransactions(this.icnId, payMode, paging, systemActivities)
      .subscribe(res => {
        this.icnSysEntries = res;
        console.log(this.icnSysEntries);
        if (this.icnSysEntries.length > 0 && this.icnSysEntries != null) {
          this.TotalRecordCount = this.icnSysEntries[0].ReCount;
        }
        if (this.TotalRecordCount < this.PageItemNumber) {
          this.EndItemNumber = this.TotalRecordCount
        }

      });
    this.isClerkEnable = true;
    this.isItemSysTxns = false;

  }

  resetSearchDetails() {

    this.icnVerificationForm.reset();
    this.usersPageNumber = 1;
    this.usersStartItemNumber = 1;
    this.usersEndItemNumber = this.usersPageItemNumber;
    this.clearSuccessandErrorBlocks();
    this.currentDateSelection();
    this.isViewIcnUsers = true;
    this.isViewTransactions = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = 0;
    //this.statusViewed = "";
    this.paymentModeViewed = "";
    this.getUserDetails(false, false, "");
  }
  currentDateSelection() {
    this.icnDetailsRequest = <ICNDetailsRequest>{};
    this.icnDetailsRequest.ICNId = 0;
    let date = new Date();
    this.icnVerificationForm.patchValue({
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


    let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnVerificationForm.controls["timeperiod"].value);
    this.icnDetailsRequest.CreatedDate = datevalue[0];
    this.icnDetailsRequest.UpdatedDate = datevalue[1];
    // var todayDate: Date = new Date();
    //  this.icnDetailsRequest.CreatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    //  this.icnDetailsRequest.UpdatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.icnVerificationForm.controls["timeperiod"].setValue([this.icnDetailsRequest.CreatedDate, this.icnDetailsRequest.UpdatedDate]);


  }

  cancel() {
    this.currentDateSelection();
    this.getUserDetails(false, false, "");
    this.isSearchEnable = true;
    this.isClerkVerification = false;
    this.isClerkEnable = false;
    this.isSysEnable = false;
    this.isItemSysTxns = false;
    this.isVarianceEnable = false;
    this.icnId = 0;
    this.icnManualEntry = <ICNDetailsResponse>{};
    this.userId = 0;
  }
  getICNTransactionDetails(icnUsersDetails: ICNDetailsResponse) {

    if (icnUsersDetails.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase()) {
      // this.isError = true;
      // this.errorMessage = "You cannot view your details";
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'You cannot view your details';
      return;
    }
    this.isSearchEnable = false;
    this.isClerkVerification = true;
    this.userId = icnUsersDetails.UserId;
    this.isViewTransactions = true;
    this.isViewIcnUsers = false;
    this.isViewPaymentTxnEntries = false;
    this.isViewTransponderTxnDetails = false;
    this.icnIdViewed = icnUsersDetails.ICNId;
    this.icnId = icnUsersDetails.ICNId;
    //this.statusViewed = ICNStatus[icnUsersDetails.ICNStatus];
    this.paymentModeViewed = "";
    this.isVerifyButtonVisible = true;

    if (icnUsersDetails.ICNId) {
      let systemActivities: ISystemActivities = <ISystemActivities>{};
      systemActivities.UserId = this.sessionContextResponse.userId;
      systemActivities.User = this.sessionContextResponse.userName;
      systemActivities.LoginId = this.sessionContextResponse.loginId;
      systemActivities.CustomerId = icnUsersDetails.UserId;
      systemActivities.IsViewed = true;
      systemActivities.ActionCode = Actions[Actions.VIEW];
      systemActivities.FeaturesCode = Features[Features.ICNVERIFY];

      this.icnService.getICNDetailsByICNId(this.icnIdViewed, systemActivities)
        .subscribe(res => {
          this.icnManualEntry = res[0];
          this.icnManualEntry.ItemRemainingCount
          console.log(this.icnManualEntry);
        });
    }
  }

  searchUsers() {
    // if (!this.IsAllowed(Features.ICN.ToString(), Actions.SEARCH.ToString()))
    //   return this.SecurityMessage();
    if (this.invalidDate) {
      return;
    }

    if (this.icnVerificationForm.valid) {
      this.icnDetailsRequest = <ICNDetailsRequest>{};

      let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnVerificationForm.controls['timeperiod'].value);
      this.icnDetailsRequest.CreatedDate = datevalue[0];
      this.icnDetailsRequest.UpdatedDate = datevalue[1];

      //let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnVerificationForm.controls['timePeriod'].value);
      if (datevalue) {


        // this.icnDetailsRequest.CreatedDate =  datevalue[0];
        // this.icnDetailsRequest.UpdatedDate = datevalue[1];
        console.log(datevalue);
        if (datevalue[0] && datevalue[1]) {
          this.icnDetailsRequest.CreatedDate = datevalue[0];
          this.icnDetailsRequest.UpdatedDate = datevalue[1];
          this.usersPageNumber = 1;
          this.usersStartItemNumber = 1;
          this.usersEndItemNumber = this.usersPageItemNumber;
          this.clearSuccessandErrorBlocks();
          this.getUserDetails(false, true, Actions[Actions.SEARCH]);
        }
        else {
          // this.isError = true;          
          // this.errorMessage = "Invalid Date Range";
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Invalid Date Range';
        }
      }
      else {
        // this.isError = true;
        // this.errorMessage = "Invalid Date Range";
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Invalid Date Range';
      }
    }
  }

  clearSuccessandErrorBlocks() {
    this.isSuccess = false;
    this.successMessage = "";
    this.isError = false;
    this.errorMessage = "";
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
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];
    systemActivities.IsViewed = isView;
    systemActivities.IsSearch = isSearch;

    let userEvents: IUserEvents;
    if (userEventsActionName) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNVERIFY];
      userEvents.ActionName = userEventsActionName;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }

    //this.icnDetailsRequest.ICNId = this.sessionContextResponse.icnId;
    //this.icnDetailsRequest.UpdatedDate.setHours(23, 59, 59, 59);
    console.log(this.icnDetailsRequest);
    this.icnDetailsRequest.ICNId = 0;

    this.icnService.icnUsersSearch(this.icnDetailsRequest.ICNId, this.icnDetailsRequest.CreatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, ""), this.icnDetailsRequest.UpdatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, ""), ICNStatus[ICNStatus.Counted], paging, systemActivities, userEvents)
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
  closeSuccessMessage() {
    this.isSuccess = false;
    this.successMessage = "";
  }

  closeErrorMessage() {
    this.isError = false;
    this.errorMessage = "";
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  descEvent(event: any) {
    this.descLength = 250 - event.target.value.length
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
