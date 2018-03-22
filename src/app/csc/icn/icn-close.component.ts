import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IPaging } from '../../shared/models/paging';
import { ICNDetailsRequest } from './models/icndetailsrequest';
import { ICNStatus } from './constants';
import { Actions, Features, defaultCulture } from '../../shared/constants';
import { ICNService } from './services/icn.service';
import { ICNDetailsResponse } from './models/icndetailsresponse';
import { CommonService } from "../../shared/services/common.service";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-icn-close',
  templateUrl: './icn-close.component.html',
  styleUrls: ['./icn-close.component.scss']
})
export class IcnCloseComponent implements OnInit {
  icnCloseForm: FormGroup;
  invalidDate: boolean;

  constructor(private icnService: ICNService, private datePickerFormat: DatePickerFormatService, private router: Router, private sessionContext: SessionService, private commonService: CommonService) { }

  sessionContextResponse: IUserresponse;
  icnDetailsRequest: ICNDetailsRequest;
  timeperiod;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  isCloseButtonVisible: boolean = false;
  isCheckAll: boolean = false;

  icnDetailsResponseArray: ICNDetailsResponse[] = [];
  icnDetailsReOpenSelected: ICNDetailsResponse;
  disableCloseButton: boolean;
  disableSearchButton: boolean;
  disableReopenButton: boolean;
  calOptions: ICalOptions = <ICalOptions>{};

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.icnCloseForm = new FormGroup({

      timeperiod: new FormControl('', [Validators.required]),
    });

    this.currentDateSelection();
    this.getICNUserDetails(true, false, Actions[Actions.VIEW]);
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.ICNCLOSE], Actions[Actions.SEARCH], "");
    this.disableCloseButton = !this.commonService.isAllowed(Features[Features.ICNCLOSE], Actions[Actions.CLOSE], "");
    this.disableReopenButton = !this.commonService.isAllowed(Features[Features.ICNCLOSE], Actions[Actions.REOPEN], "");
  }

  currentDateSelection() {
    this.patchValue();
    this.icnDetailsRequest = <ICNDetailsRequest>{};
    let datevalue = this.datePickerFormat.getFormattedDateRange(this.icnCloseForm.controls["timeperiod"].value);
    this.icnDetailsRequest.CreatedDate = datevalue[0];
    this.icnDetailsRequest.UpdatedDate = datevalue[1];
    // var todayDate: Date = new Date();
    // this.icnDetailsRequest.CreatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.icnDetailsRequest.UpdatedDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // this.timeperiod = [this.icnDetailsRequest.CreatedDate, this.icnDetailsRequest.UpdatedDate];
    // console.log(this.timeperiod);
  }

  searchUsers() {
    if (this.invalidDate) {
      return;
    }
    this.icnDetailsRequest = <ICNDetailsRequest>{};
    if (this.icnCloseForm.controls['timeperiod'].value) {
      var datevalue = this.datePickerFormat.getFormattedDateRange(this.icnCloseForm.controls['timeperiod'].value);
      this.icnDetailsRequest.CreatedDate = new Date(datevalue[0]);
      this.icnDetailsRequest.UpdatedDate = new Date(datevalue[1]);
    }
    if (datevalue) {
      if (datevalue[0] && datevalue[1]) {
        this.icnDetailsRequest.CreatedDate = new Date(datevalue[0]);
        this.icnDetailsRequest.UpdatedDate = new Date(datevalue[1]);
        this.pageNumber = 1;
        this.startItemNumber = 1;
        this.endItemNumber = this.pageItemNumber;
        this.isCheckAll = false;
        this.getICNUserDetails(false, true, Actions[Actions.SEARCH]);
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Invalid Date Range";
      }
    }


    // if (this.timeperiod) {
    //   if (this.timeperiod[0] && this.timeperiod[1]) {
    //     this.icnDetailsRequest.CreatedDate = this.timeperiod[0];
    //     this.icnDetailsRequest.UpdatedDate = this.timeperiod[1];
    //     this.pageNumber = 1;
    //     this.startItemNumber = 1;
    //     this.endItemNumber = this.pageItemNumber;
    //     this.isCheckAll = false;
    //     this.getICNUserDetails(false, true, Actions[Actions.SEARCH]);
    //   }
    //   else {
    //     this.msgFlag = true;
    //     this.msgType = 'error';
    //     this.msgDesc = "Invalid Date Range";
    //   }
    // }
    // else {
    //   this.msgFlag = true;
    //   this.msgType = 'error';
    //   this.msgDesc = "Invalid Date Range";
    // }
  }

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.isCheckAll = false;
    this.getICNUserDetails(false, false, "");
  }

  getICNUserDetails(isView: boolean, isSearch: boolean, userEventsActionName: string) {
    this.isCloseButtonVisible = false;
    let chkCount: number = 0;
    let strICNStatus: string = ICNStatus[ICNStatus.Reconciled] + "," + ICNStatus[ICNStatus.Variance];
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.pageNumber;
    paging.PageSize = this.pageItemNumber;
    paging.SortColumn = "ICNID";
    paging.SortDir = 1;
    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.ActionCode = Actions[Actions.VIEW];
    systemActivities.FeaturesCode = Features[Features.ICNCLOSE];
    systemActivities.IsViewed = isView;
    systemActivities.IsSearch = isSearch;

    // this.icnDetailsRequest.UpdatedDate.setHours(23, 59, 59, 59);

    let userEvents: IUserEvents;
    if (userEventsActionName) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNCLOSE];
      userEvents.ActionName = userEventsActionName;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }

    this.icnService.getUsersStatus(this.icnDetailsRequest.CreatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), this.icnDetailsRequest.UpdatedDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""), strICNStatus, paging, systemActivities, userEvents)
      .subscribe(res => {
        this.icnDetailsResponseArray = res;
        console.log(this.icnDetailsResponseArray);
        if (this.icnDetailsResponseArray && this.icnDetailsResponseArray.length > 0) {
          this.totalRecordCount = this.icnDetailsResponseArray[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }

          for (let i = 0; i < this.icnDetailsResponseArray.length; i++) {
            let icnStatus: string = this.icnDetailsResponseArray[i].ICNStatus.toString();
            if (icnStatus == ICNStatus[ICNStatus.Reconciled])
              this.icnDetailsResponseArray[i].isVisibleCheckbox = this.icnDetailsResponseArray[i].isVisibleICNNumber = true;
            else if (icnStatus == ICNStatus[ICNStatus.Variance])
              this.icnDetailsResponseArray[i].isVisibleICNNumber = this.icnDetailsResponseArray[i].isVisibleCheckbox = this.icnDetailsResponseArray[i].isVisibleReopen = true;
            else if (icnStatus == ICNStatus[ICNStatus.Open] || icnStatus == ICNStatus[ICNStatus.Reopened] || icnStatus == ICNStatus[ICNStatus.Counted] || icnStatus == ICNStatus[ICNStatus.Verified] || icnStatus == ICNStatus[ICNStatus.Closed]) {
              this.icnDetailsResponseArray[i].isVisibleReopen = this.icnDetailsResponseArray[i].isVisibleCheckbox = false;
              this.icnDetailsResponseArray[i].isVisibleICNNumber = true;
            }
            else if (icnStatus == ICNStatus[ICNStatus.NotAssigned])
              this.icnDetailsResponseArray[i].isVisibleReopen = this.icnDetailsResponseArray[i].isVisibleCheckbox = this.icnDetailsResponseArray[i].isVisibleICNNumber = false;

            if (this.icnDetailsResponseArray[i].isVisibleCheckbox)
              chkCount += 1;
          }
          if (chkCount > 0)
            this.isCloseButtonVisible = true;
        }
      });
  }

  resetSearchDetails() {
    this.currentDateSelection();
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.isCloseButtonVisible = false;
    this.getICNUserDetails(false, false, "");
  }

  reopenIcn(icnDetails: ICNDetailsResponse) {
    this.icnDetailsReOpenSelected = icnDetails;
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgDesc = "Are you sure you want to reopen the ICN?";
  }

  reopenIcnUser(event) {
    if (event) {
      if (this.icnDetailsReOpenSelected.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase()) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "You cannot reopen ICN to yourself";
        return;
      }

      if (this.icnDetailsReOpenSelected.ICNId == 0) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Identification Control Number (ICN) is not assigned to this user";
        return;
      }

      let systemActivities: ISystemActivities = <ISystemActivities>{};
      systemActivities.UserId = this.sessionContextResponse.userId;
      systemActivities.User = this.sessionContextResponse.userName;
      systemActivities.LoginId = this.sessionContextResponse.loginId;
      systemActivities.ActionCode = Actions[Actions.REOPEN];
      systemActivities.FeaturesCode = Features[Features.ICNCLOSE];
      systemActivities.IsViewed = true;

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNCLOSE];
      userEvents.ActionName = Actions[Actions.REOPEN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.icnService.updateICNStatus(this.icnDetailsReOpenSelected.ICNId, ICNStatus[ICNStatus.Reopened], this.sessionContextResponse.userName, systemActivities, userEvents)
        .subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "ICN has been reopened successfully";
            this.getICNUserDetails(false, false, "");
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  checkandUncheckAllUsers(event) {
    let isChecked: boolean = event.target.checked;
    this.icnDetailsResponseArray.forEach(element => {
      if (element.isVisibleCheckbox) {
        if (element.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase() && isChecked) {
          element.isICNUserChecked = false;
          event.target.checked = false;
          this.isCheckAll = false;
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "You cannot close ICN yourself";
        }
        else
          element.isICNUserChecked = isChecked;
      }
    })
  }

  checkorUncheckUser(icnDetails: ICNDetailsResponse, event) {
    let isChecked: boolean = event.target.checked;
    if (isChecked) {
      if (icnDetails.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase()) {
        icnDetails.isICNUserChecked = false;
        event.target.checked = false;
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "You cannot close ICN yourself";
        return;
      }
      icnDetails.isICNUserChecked = true;
      let visibleCheckboxCount = this.icnDetailsResponseArray.filter(x => x.isVisibleCheckbox).length;
      let checkedUsersCount = this.icnDetailsResponseArray.filter(x => x.isICNUserChecked && x.isVisibleCheckbox).length;
      if (visibleCheckboxCount == checkedUsersCount)
        this.isCheckAll = true;
      else
        this.isCheckAll = false;
    }
    else {
      icnDetails.isICNUserChecked = false;
      this.isCheckAll = false;
    }
  }

  closeIcnUsers() {
    let selectedUsers = this.icnDetailsResponseArray.filter(x => x.isICNUserChecked && x.isVisibleCheckbox);
    if (!selectedUsers || selectedUsers.length == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "You cannot close ICN yourself";
      return;
    }

    let loggedUser = selectedUsers.filter(x => x.UserName.toUpperCase() == this.sessionContextResponse.userName.toUpperCase());
    if (loggedUser && loggedUser.length > 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "You cannot close ICN yourself";
      return;
    }

    for (let i = 0; i < selectedUsers.length; i++) {
      let systemActivities: ISystemActivities = <ISystemActivities>{};
      systemActivities.UserId = this.sessionContextResponse.userId;
      systemActivities.User = this.sessionContextResponse.userName;
      systemActivities.LoginId = this.sessionContextResponse.loginId;
      systemActivities.ActionCode = Actions[Actions.CLOSE];
      systemActivities.FeaturesCode = Features[Features.ICNCLOSE];
      systemActivities.IsViewed = true;

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNCLOSE];
      userEvents.ActionName = Actions[Actions.CLOSE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.icnService.updateICNStatus(selectedUsers[i].ICNId, ICNStatus[ICNStatus.Closed], this.sessionContextResponse.userName, systemActivities, userEvents)
        .subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Successfully closed the ICN(s)";
          }
          if (i == selectedUsers.length - 1)
            this.getICNUserDetails(false, false, "");
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
          if (i == selectedUsers.length - 1)
            this.getICNUserDetails(false, false, "");
        });
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  patchValue(): void {
    let date = new Date();
    this.icnCloseForm.patchValue({
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
