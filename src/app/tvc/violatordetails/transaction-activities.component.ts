import { InvoicesContextService } from '../../shared/services/invoices.context.service';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { CustomerDetailsService } from '../../csc/customerdetails/services/customerdetails.service';
import { Actions, ActivitySource, Features, defaultCulture } from '../../shared/constants';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViolatordetailsService } from './services/violatordetails.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IMyDrpOptions, IMyInputFieldChanged, IMyInputFocusBlur } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-transaction-activities',
  templateUrl: './transaction-activities.component.html',
  styleUrls: ['./transaction-activities.component.scss']
})
export class TransactionActivitiesComponent implements OnInit {
  gridArrowVehicleNumber: boolean;
  gridArrowENTRYTRIPDATETIME: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowCitationId: boolean;
  invalidDateRange: boolean;

  longViolatorId: number;
  tripsSearchRequest: any;
  tripResponse: any[];
  timePeriod: string;
  vehicleNUmber: string;
  tripId: number;
  tollTransactionType: string;
  bsRangeValue: any;
  tripActivityForm: FormGroup;
  tripGridForm: FormGroup;
  p: number;
  pageSize: number = 10;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  selectedTripList: any[] = <any>[];
  isParentSelected: boolean;
  tripContext: ITripsContextResponse;
  errorMessage: string;
  successMessage: string;
  zeroAmountTrips: string;
  paymentPlanTrips: string;
  courtTrips: string;
  guiltyCourtTrips: string;
  probleIdTrips: string;
  responseOfTripContext: ITripsContextResponse;
  isDisplayShowAll: boolean = false;
  isShowAll: boolean = false;
  tripIds: any;
  isNavigatedfromOtherPage: boolean = false;
  tripResponseofBack: any;
  violatorContextResponse: IViolatorContextResponse;
  isPageLoad: boolean = false;
  isSerach: boolean = false;
  sessionContextResponse: IUserresponse;
  systemActivities: ISystemActivities;
  intDisputeDays: number;
  dropDownList: any[];
  lookuptypeReq: any;
  txnCategotyLst: any[];
  billingStatus: string;
  disableSearchButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disputedTrips: string;

  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  constructor(private violatorDetailsService: ViolatordetailsService, private sessionContext: SessionService,
    private router: Router, private tripContextService: TripsContextService, private commonService: CommonService, private invoiceContextService: InvoicesContextService,
    private violatorContext: ViolatorContextService, private customerDetailsService: CustomerDetailsService, private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;

    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longViolatorId = this.violatorContextResponse.accountId;
    }

    if (this.router.url.endsWith('/trips-Search')) {
      this.tripContextService.changeResponse(null);
    }
    this.invoiceContextService.changeResponse(null);

    this.isPageLoad = true;
    this.p = 1;
    this.tollTransactionType = '';
    this.billingStatus = '';
    this.endItemNumber = this.pageItemNumber;
    this.tripActivityForm = new FormGroup({
      'plateNumber': new FormControl(''),
      'tripNumber': new FormControl(''),
      'tollTransactionType': new FormControl(''),
      'bsRangeValue': new FormControl('', Validators.required),
      'billingStatus': new FormControl('')
    });
    this.tripGridForm = new FormGroup({
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORTRANSACTIONACTIVITIES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    !this.commonService.isAllowed(Features[Features.VIOLATORTRANSACTIONACTIVITIES], Actions[Actions.VIEW], "");
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.VIOLATORTRANSACTIONACTIVITIES], Actions[Actions.SEARCH], "");

    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.setDateRange(date, date);
    this.bingDropdowns();
    this.readDataFromService();
    this.getTripDetails(this.p, this.pageSize, userEvents);
    this.getApplicationParams();

  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setDateRange(begindate, endDate): void {
    // Set date range  using the patchValue function
    this.tripActivityForm.patchValue({
      bsRangeValue: {
        beginDate: {
          year: begindate.getFullYear(),
          month: begindate.getMonth() + 1,
          day: begindate.getDate()
        },
        endDate: {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }
      }
    });
  }
  bingDropdowns() {
    this.commonService.getTollTypesLookups().subscribe(res => {
      this.dropDownList = res;
    });

    this.lookuptypeReq = <any>{};
    this.lookuptypeReq.LookUpTypeCode = "BILLINGSTATUS";
    this.commonService.getLookUpByParentLookupTypeCode(this.lookuptypeReq)
      .subscribe(res => {
        this.txnCategotyLst = res;
      });
  }

  getApplicationParams() {
    this.customerDetailsService.getApplicationParameterValueByParameterKey("MaxPostDisputDay").subscribe(
      res => {
        this.intDisputeDays = res;
      });

  }

  readDataFromService() {
    this.tripContextService.currentContext.
      subscribe(res => {
        console.log(res);
        if (res != null) {
          this.isNavigatedfromOtherPage = true;
          this.tripIds = res.tripIDs;

          this.successMessage = res.successMessage;
          if (this.successMessage && this.successMessage.length > 0) {
            this.tripIds = null;
            this.showSucsMsg(this.successMessage);
          }
          this.errorMessage = res.errorMessage;
          if (this.errorMessage && this.errorMessage.length > 0) {
            this.tripIds = null;
            this.showErrorMsg(this.errorMessage);
          }
          this.tollTransactionType = res.tollTransactionType;
          this.billingStatus = res.billingStatus;
          this.tripId = res.tripNumber;
          this.vehicleNUmber = res.vehicleNumber;
          this.bsRangeValue = res.dateRange;
          const fromDate = new Date(res.dateRange.beginDate.month + '/' + res.dateRange.beginDate.day + '/' + res.dateRange.beginDate.year);
          const toDate = new Date(res.dateRange.endDate.month + '/' + res.dateRange.endDate.day + '/' + res.dateRange.endDate.year);
          this.setDateRange(fromDate, toDate);
        }
      });
  }

  getTripDetails(pageNumber: number, pageSize: number, userEvents?: IUserEvents) {
    let strDate;
    if (this.tripActivityForm.controls['bsRangeValue'].value === null || this.tripActivityForm.controls['bsRangeValue'].value == '') {
      strDate = this.bsRangeValue;
    } else {
      strDate = this.tripActivityForm.controls['bsRangeValue'].value;
    }
    // if (this.isNavigatedfromOtherPage) {
    //   strDate = this.bsRangeValue;
    // }
    const fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
    const toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
    this.tripsSearchRequest = <any>{};
    this.tripsSearchRequest.ViolatorId = this.longViolatorId;
    if (this.tripId > 0) {
      this.tripsSearchRequest.CitationId = this.tripId;
    }
    this.tripsSearchRequest.VehicleNumber = this.vehicleNUmber;
    this.tripsSearchRequest.TransactionTypeCode = this.tripActivityForm.controls['tollTransactionType'].value;
    this.tripsSearchRequest.BillingStatus = this.tripActivityForm.controls['billingStatus'].value;
    if (this.isNavigatedfromOtherPage) {
      this.tripsSearchRequest.TransactionTypeCode = this.tollTransactionType;
      this.tripsSearchRequest.BillingStatus = this.billingStatus;
    }
    this.tripsSearchRequest.PageNumber = pageNumber;
    this.tripsSearchRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    this.tripsSearchRequest.SortColumn = this.sortingColumn;;
    this.tripsSearchRequest.PageSize = pageSize;
    this.tripsSearchRequest.CurrentPageForPager = this.p;
    this.tripsSearchRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.tripsSearchRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.tripsSearchRequest.IsSearch = this.isSerach;
    this.tripsSearchRequest.IsPageLoad = this.isPageLoad;
    this.tripsSearchRequest.UserId = this.sessionContextResponse.userId;
    this.tripsSearchRequest.LoginId = this.sessionContextResponse.loginId;
    this.tripsSearchRequest.UserName = this.sessionContextResponse.userName;
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.tripsSearchRequest.SystemActivity = this.systemActivities;
    this.violatorDetailsService.violatorTripsSearch(this.tripsSearchRequest, userEvents)
      .subscribe(res => {
        this.tripResponse = res;
      }, (err) => {

      }, () => {
        if (this.tripResponse && this.tripResponse.length) {
          this.totalRecordCount = this.tripResponse[0].RecordCount;
          if (this.totalRecordCount > 10)
            this.isDisplayShowAll = true;
          else
            this.isDisplayShowAll = false;
        }
        else
          this.isDisplayShowAll = false;

        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }

        //Trip selection
        if (this.tripIds && this.tripIds.length) {
          for (var i = 0; i < this.tripIds.length; i++) {
            this.tripResponseofBack = <any>{};
            this.tripResponseofBack = this.tripResponse.find(x => x.CitationId == this.tripIds[i]);
            // this.tripResponseofBack.CitationId = this.tripIds[i]
            if (this.tripResponseofBack) {
              var index = this.selectedTripList.findIndex(x => x.CitationId == this.tripResponseofBack.CitationId);
              if (index == -1) {
                this.selectedTripList.push(this.tripResponseofBack);
              }
            }
          }
        }

        if (this.selectedTripList && this.selectedTripList.length > 0) {
          let count: number = 0;
          for (var i = 0; i < this.tripResponse.length; i++) {
            var index = this.selectedTripList.findIndex(x => x.CitationId == this.tripResponse[i].CitationId);
            if (index > -1) {
              this.tripResponse[i].istripSelected = true;
              count++;
            }
            else
              this.tripResponse[i].istripSelected = false;
          }
          if (this.tripResponse.length == count) {
            this.isParentSelected = true;
          }
          else {
            this.isParentSelected = false;
          }
        }

      });
  }

  resetClick() {
    this.isSerach = false;
    this.isPageLoad = true;
    this.isDisplayShowAll = false;
    this.tripActivityForm.reset();
    this.selectedTripList = [];
    this.tripIds = <any>[];
    this.tripActivityForm.patchValue({
      tollTransactionType: "",
    });
    this.tripActivityForm.patchValue({
      billingStatus: "",
    });
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.setDateRange(date, date);
    this.tollTransactionType = '';
    this.billingStatus = '';
    this.getTripDetails(1, this.pageSize);
  }

  showAllClick() {
    this.p = 1;
    this.pageItemNumber = this.totalRecordCount;
    this.getTripDetails(1, this.totalRecordCount);
    this.isShowAll = true;
  }

  restShowAllClick() {
    this.startItemNumber = 1;
    this.endItemNumber = this.pageSize;
    this.pageItemNumber = this.pageSize;
    this.getTripDetails(1, this.pageSize);
    this.isShowAll = false;
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getTripDetails(this.p, this.pageSize);
  }

  tripSearch() {
    if (this.tripActivityForm.valid) {
      this.isSerach = true;
      this.isParentSelected = false;
      this.selectedTripList = [];
      this.tripIds = <any>[];
      this.successMessage = '';
      this.p = 1;
      //User Events 
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIOLATORTRANSACTIONACTIVITIES];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longViolatorId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getTripDetails(this.p, this.pageSize, userEvents);
    }
  }

  checkboxCheckedEvent(object: any, event) {
    var index = this.selectedTripList.findIndex(x => x.CitationId == object.CitationId);
    if (event.target.checked) {
      if (index == -1) {
        this.selectedTripList.push(object);
        object.istripSelected = true;
        var result = this.tripResponse.filter(x => x.istripSelected == true).length;
        if (result == this.tripResponse.length)
          this.isParentSelected = true;
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedTripList.splice(index, 1);
        object.istripSelected = false;
      }
    }
  }

  viewTripDetailsClick(object: any) {
    this.selectedTripList = [];
    this.selectedTripList.push(object);
    this.savingData();
    let link = ['tvc/violatordetails/violation-trip-history'];
    this.router.navigate(link);
  }


  checkAllClick(event) {
    for (var i = 0; i < this.tripResponse.length; i++) {
      let isChecked: boolean = event.target.checked;
      this.tripResponse[i].istripSelected = isChecked;
      var index = this.selectedTripList.findIndex(x => x.CitationId == this.tripResponse[i].CitationId);
      if (index > -1 && !isChecked) {
        this.selectedTripList = this.selectedTripList.filter(item => item.CitationId != this.tripResponse[i].CitationId);
        this.tripResponse[i].istripSelected = false;
      }
      else if (isChecked) {
        var index = this.selectedTripList.findIndex(x => x.CitationId == this.tripResponse[i].CitationId);
        if (index === -1) {
          this.selectedTripList.push(this.tripResponse[i]);
          this.tripResponse[i].istripSelected = true;
        }
      }
    }
  }

  savingData() {
    this.tripContext = <ITripsContextResponse>{};
    this.tripContext.tripIDs = [];
    this.tripContext.vehicleNumberForDispute = [];
    this.tripContext.beforeCitationIds = [];
    this.tripContext.aferCitationIds = [];
    for (var i = 0; i < this.selectedTripList.length; i++) {
      this.tripContext.tripIDs.push(this.selectedTripList[i].CitationId);
      var date1 = new Date(this.selectedTripList[i].Entry_TripDateTime);
      var date2 = new Date();
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if ((parseInt(diffDays.toString()) < this.intDisputeDays))
        this.tripContext.beforeCitationIds.push(this.selectedTripList[i].CitationId);
      else
        this.tripContext.aferCitationIds.push(this.selectedTripList[i].CitationId);
    }

    if (this.selectedTripList && this.selectedTripList.length) {
      for (var i = 0; i < this.selectedTripList.length; i++) {
        var index = this.tripContext.vehicleNumberForDispute.indexOf(this.selectedTripList[i].VehicleNumber);
        if (index == -1) {
          this.tripContext.vehicleNumberForDispute.push(this.selectedTripList[i].VehicleNumber);
        }
      }
    }
    this.tripContext.referenceURL = 'tvc/violatordetails/trip-Search';
    this.tripContext.tripNumber = this.tripId;
    this.tripContext.vehicleNumber = this.vehicleNUmber;
    this.tripContext.billingStatus = this.tripActivityForm.controls['billingStatus'].value;
    this.tripContext.tollTransactionType = this.tripActivityForm.controls['tollTransactionType'].value;
    this.tripContext.dateRange = this.tripActivityForm.controls['bsRangeValue'].value;//this.bsRangeValue;
    this.tripContextService.changeResponse(this.tripContext);
  }

  atleaseone(): boolean {
    if (this.selectedTripList && this.selectedTripList.length) {
      return true;
    }
    else {
      return false;
    }
  }

  outstandingAmountCheck(): string {
    this.zeroAmountTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].OutstandingAmount <= 0) {
        this.zeroAmountTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.zeroAmountTrips;
  }

  paymentPLanTripsChecking() {
    this.paymentPlanTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].HoldType.toString().toUpperCase() == 'PAYMENTPLAN') {
        if (this.selectedTripList[i].IsHold)
          this.paymentPlanTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.paymentPlanTrips;
  }

  courtTripsChecking() {
    this.courtTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].CitationStage.toUpperCase() == 'CRT') {
        this.courtTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.courtTrips;
  }

  courtTripCheckingforPayment() {
    this.courtTrips = '';
    this.guiltyCourtTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].CitationStage.toUpperCase() == 'CRT') {
        if (this.selectedTripList[i].CitationType.toUpperCase() == 'INIT') {
          this.courtTrips += this.selectedTripList[i].CitationId + ',';
          return this.courtTrips;
        }
        if (this.selectedTripList[i].CitationType.toUpperCase() == 'GUILTY')
          this.guiltyCourtTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.guiltyCourtTrips;
  }


  problemIDTrips() {
    this.probleIdTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].ProblemId > 0) {
        this.probleIdTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.probleIdTrips;
  }

  createCorrespondenceClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.outstandingAmountCheck() != '') {
      this.errorMessage = 'Trip(s) # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero';
      this.showErrorMsg(this.errorMessage);
    } else {
      let link = ['tvc/violatordetails/create-correspondence'];
      this.router.navigate(link);
    }
    setTimeout(function () { window.scrollTo(0, document.body.scrollHeight) }, 100);
  }

  makePaymentClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.paymentPLanTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # (s) ' + this.paymentPlanTrips.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(this.errorMessage);
    } else if (this.courtTripCheckingforPayment() != '') {
      if (this.courtTrips.length > 1) {
        this.errorMessage = 'Selected Trip # ' + this.courtTrips.slice(0, -1) + ' is in court';
        this.showErrorMsg(this.errorMessage);
      } else if (this.guiltyCourtTrips.length > 1) {
        this.guiltyCourtTrips = this.courtTrips.slice(0, -1);
        let lstguiltyTrips = this.guiltyCourtTrips.split(',');
        if (lstguiltyTrips.length == 1 && this.selectedTripList.length == 1) {
          let link = ['/tvc/paymentdetails/violation-payment'];
          this.router.navigate(link);
        }
        else {
          if (lstguiltyTrips.length > 1) {
            this.errorMessage = 'Multiple court trip selection not allowed for the payment';
            this.showErrorMsg(this.errorMessage);
          } else {
            this.errorMessage = 'Cannot combine court trips along with regular trips ';
            this.showErrorMsg(this.errorMessage);
          }
        }
      }
    } else {
      let link = ['/tvc/paymentdetails/violation-payment'];
      this.router.navigate(link);
    }
  }


  submitInquiryClick() {
    console.log("submitenquiry");
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.problemIDTrips() != '') {
      this.errorMessage = 'Complaint(s) already created for Trip (s) #  ' + this.probleIdTrips.slice(0, -1);
      this.showErrorMsg(this.errorMessage);
    } else {
      let link = ['tvc/helpdesk/create-complaint'];
      this.router.navigate(link);
    }
  }

  disputeClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.outstandingAmountCheck() != '') {
      this.errorMessage = 'Trip(s) # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero';
      this.showErrorMsg(this.errorMessage);
    } else if (this.paymentPLanTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # (s) ' + this.paymentPlanTrips.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(this.errorMessage);
    } else if (this.disputeCheck() != '') {
      this.errorMessage = 'Selected Trip # (s) ' + this.disputedTrips.slice(0, -1) + ' are already disputed';
      this.showErrorMsg(this.errorMessage);
    } else if (this.courtTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # ' + this.courtTrips.slice(0, -1) + ' is in court';
      this.showErrorMsg(this.errorMessage);
    } else {
      let link = ['tvc/disputes/non-liability'];
      this.router.navigate(link);
    }
  }

  disputeCheck() {
    this.disputedTrips = '';
    for (var i = 0; i < this.selectedTripList.length; i++) {
      if (this.selectedTripList[i].IsDisputed) {
        this.disputedTrips += this.selectedTripList[i].CitationId + ',';
      }
    }
    return this.disputedTrips;
  }

  overpaymentTransferClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.outstandingAmountCheck() != '') {
      this.errorMessage = 'Trip(s) # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero';
      this.showErrorMsg(this.errorMessage);
    } else if (this.paymentPLanTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # (s) ' + this.paymentPlanTrips.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(this.errorMessage);
    } else if (this.courtTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # ' + this.courtTrips.slice(0, -1) + ' is in court';
      this.showErrorMsg(this.errorMessage);
    } else {
      let link = ['tvc/violatordetails/over-payment-transfer'];
      this.router.navigate(link);
    }
  }

  adminHearingTransferClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else if (this.outstandingAmountCheck() != '') {
      this.errorMessage = 'Trip(s) # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero';
      this.showErrorMsg(this.errorMessage);
    } else if (this.paymentPLanTripsChecking() != '') {
      this.errorMessage = 'Selected Trip # (s) ' + this.paymentPlanTrips.slice(0, -1) + ' are in payment plan';
      this.showErrorMsg(this.errorMessage);
    } else {
      let link = ['tvc/violatordetails/admin-hearing'];
      this.router.navigate(link);
    }
  }


  tripStatusUpdateClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else {
      let link = ['tvc/violatordetails/transaction-status-update'];
      this.router.navigate(link);
    }
  }

  AdjustmentClick() {
    this.savingData();
    if (!this.atleaseone()) {
      this.showErrorMsg('Select atleast one trip');
    } else {
      let link = ['tvc/violatordetails/trip-adjustments'];
      this.router.navigate(link);
    }
  }

  exitClick() {
    this.violatorContext.changeResponse(null);
    this.tripContextService.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  backClick() {
    this.tripContextService.changeResponse(null);
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }

  viewComplaintDetailsClick(prolemId: number) {
    this.savingData();
    let url = 'tvc/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: prolemId } });
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

  setOutputFlag(e) {
    this.msgFlag = e;
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
    this.gridArrowCitationId = false;
    this.gridArrowENTRYTRIPDATETIME = false;
    this.gridArrowVehicleNumber = false;



    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "CitationId") {
      this.gridArrowCitationId = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ENTRYTRIPDATETIME") {
      this.gridArrowENTRYTRIPDATETIME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "VehicleNumber") {
      this.gridArrowVehicleNumber = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.getTripDetails(this.p, this.pageSize);
  }


}

export class lookUps {
  LookUpTypeCode: string;
  LookUpTypeCodeDesc: string;
}
