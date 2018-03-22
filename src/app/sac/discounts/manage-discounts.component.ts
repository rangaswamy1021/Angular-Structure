import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IDiscountResponse } from "./models/discountsresponse";
import { DiscountsService } from "./services/discounts.service";
import { IDiscountRequest } from "./models/discountsrequest";
import { IPaging } from "../../shared/models/paging";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { IDesignationsResponse } from "./models/designationsresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IDiscountDetailsResponse } from "./models/discountsdetailsresponse";
import { Subsystem, DiscountType } from "../constants";
import { FeesFactor } from "../fees/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
//import { IMyDpOptions } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { AgencySetupService } from "../agencysetup/services/agencysetup.service";
import { IAgencyRequest } from "../agencysetup/models/agencyrequest";
import { IAgencyResponse } from "../agencysetup/models/agencyresponse";
import { IDiscountTypeResponse } from "./models/discounttyperesponse";
import { IDiscountFactorResponse } from "./models/discountfactorresponse";
import { ICriteriasResponse } from "./models/criteriaresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { IPlazaRequest } from "../agencysetup/models/plazasrequest";
import { IDiscountDetailsRequest } from "./models/discountsdetailsrequest";
import { IEligibilityDetailsRequest } from "./models/eligibilityDetailsrequest";
import { List } from "linqts/dist/linq";
import { CSCReportsService } from '../../csc/reports/services/reports.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-manage-discounts',
  templateUrl: './manage-discounts.component.html',
  styleUrls: ['./manage-discounts.component.scss']
})
export class ManageDiscountsComponent implements OnInit {
  LanesByPlazaCode: any;
  criteriaValue: any;
  eligibilityResp: any;
  eligibilityResponse: IEligibilityDetailsRequest[];
  plaza: any;
  startDateTimeFactor: any;
  endDateTimeFactor: any;
  plazaValue: any;
  discntEligibility: any;
  resetButton: boolean;
  updateButton: boolean;
  addButton: boolean;
  activeInactiveRadios: {
    Key: any;
    Value: string;
  }[];
  seletedcriteria = [];
  isActiveValue: boolean = true;
  objEligibilityDetailsRequest: IEligibilityDetailsRequest;
  systemactivites: ISystemActivities;
  objDiscountDetailsRequest: IDiscountDetailsRequest;
  objReqDiscount: IDiscountRequest;
  minAvailDiscount: boolean;
  maxAvailDiscount: boolean;
  maxthresholdAmt: boolean;
  minthresholdAmt: boolean;
  feeFactorValue: any;
  listOfPlazas: any;
  objIPlazaRequest: any;
  agencyName: any;
  agencies: any;
  sessionContextResponse: IUserresponse;
  criterias: ICriteriasResponse[];
  transactionTime: boolean;
  transactionDateTime: boolean;
  subscription: boolean;
  discountType: number;
  subCriteria: number;
  agency: any;
  discountFactor: string;
  //criteriaList: boolean = true;
  manageAgencyResp: IAgencyResponse[];
  pageNumber: number = 1;
  manageAgencyReq: IAgencyRequest;
  discountFactors: IDiscountFactorResponse[];
  manageDiscounts: boolean;
  invalidEnd: boolean;
  invalidEnd1:boolean;
  invalidDate: boolean;
  invalidDate1: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  maxDate: Date;
  //setDate: any;
  //endDate: any;
  startTime: any;
  endTime: any;
  criteriasFormValue: any;
  discountList: IDiscountResponse[];
  pageItemNumber: number = 10;
  dataLength: number = 0;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number = 1;

  designations: IDesignationsResponse[];
  discountTypes: IDiscountTypeResponse[];
  feeFactors: any;

  discntForm: FormGroup;
  // discntDtlsForm: FormGroup;

  editDiscountRes: IDiscountResponse;
  percentagePattern = "^(([0-9]{0,2}(\.[0-9]{1,2})?)|100([\.][0]{1,2})?)$";
  zeroPattren = "^[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*$";
  pattren = "[0-9]+(\.[0-9][0-9]?)?";
  fldMinTxn: boolean;
  fldMaxTxn: boolean;
  fldMinDays: boolean;
  fldMaxDays: boolean;
  fldAmt: boolean;
  fldPercent: boolean;
  fldMaxDisc: boolean;
  discntDtlsListFly: IDiscountDetailsResponse[] = [];
  discntDtlsListDisp: IDiscountDetailsResponse[] = [];
  isEditDiscntDtl: boolean = false;
  editId: number;
  mode: string = 'add';
  minStDate: Date;
  descCharLeft: number = 255;
  editDiscountId: number;
  enableStartDate: boolean;
  enableEndDate: boolean;
  disableButton: boolean = false;

  //new changes
  isAgencies: boolean;
  isPlaza: boolean;
  isLanes: boolean;
  isFacilities: boolean;
  criteriasRange: ICriteriasResponse[];
  criteriasTrxnType: ICriteriasResponse[];
  criteriasTripMethod: ICriteriasResponse[];
  rangeValue: number;
  tripMethod: number;
  txnType: number;
  facility: any;
  locations: any[];
  rangeCriteria: any;
  laneValue: any;
  toDayDate = new Date();

  _bsValue: Date = new Date();
  get bsValue(): Date {
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }

  _bsValue2: Date = new Date();
  get bsValue2(): Date {
    return this._bsValue2;
  }

  set bsValue2(v: Date) {
    console.log(v);
    this._bsValue2 = v;
  }
  myDatePickerOptions1: ICalOptions;
  myDatePickerOptions2: ICalOptions;
  myDatePickerOptions3: ICalOptions;
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    firstDayOfWeek: 'mo', sunHighlight: false,
    inline: false, showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
    alignSelectorRight: false, indicateInvalidDate: true
  };
  defaultStatus: number = 1;
  statuses = [
    {
      id: 1,
      Value: 'Active'
    },
    {
      id: 0,
      Value: 'Inactive'
    }
  ];
  constructor(private agencySetupService: AgencySetupService, private discountService: DiscountsService, private sessionService: SessionService, private cdr: ChangeDetectorRef, private discountsService: DiscountsService, private datePickerFormat: DatePickerFormatService,
    private router: Router, private commonService: CommonService, private ezPassService: CSCReportsService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    $('#pageloader').modal('show');
    this.getDiscounts(1, true);
    this.activeInactiveRadios = [
      { Key: 1, Value: "Active" }, { Key: 0, Value: "Inactive" }]
    this.discntForm = new FormGroup({
      'name': new FormControl('', [Validators.required]),
      'code': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'startDateFactor': new FormControl(''),
      'endDateFactor': new FormControl(''),
      // 'accessLevel': new FormControl('', [Validators.required]),
      'status': new FormControl('1', [Validators.required]),
      'type': new FormControl('Volume'),
      'discountType': new FormControl('', [Validators.required]),
      'criteriaFormName': new FormControl(''),
      'agencies': new FormControl(''),
      'plazas': new FormControl(''),
      // 'subCriterias': new FormControl(''),
      'discountFactor': new FormControl('', [Validators.required]),
      //'duration': new FormControl('', [Validators.required]),
      'fee': new FormControl(''),
      'startTime': new FormControl(''),
      'endTime': new FormControl(''),
      'feeFactor': new FormControl('PercentageBased'),
      'minTxn': new FormControl(''),
      'maxTxn': new FormControl(''),
      'minDays': new FormControl({ value: '1', disabled: true }),
      'maxDays': new FormControl(''),
      'amt': new FormControl('', [Validators.required]),
      'percent': new FormControl('', [Validators.required]),
      'maxDisc': new FormControl(''),
      'minThreshold': new FormControl(''),
      'maxThreshold': new FormControl(''),
      'minAvailDiscount': new FormControl(''),
      'maxAvailDiscount': new FormControl(''),
      'facility': new FormControl(''),
      'tripMethodForm': new FormControl(''),
      'txnType': new FormControl(''),
      'rangeCriteria': new FormControl(''),
      'laneType': new FormControl('')
    });
    // this.defaultStatus = 0;
    //this.criteriasFormValue = 0;
    // this.plazaValue = 0;
    // this.discountFactor = "Volume";
    // this.agency = 0;
    // this.subCriteria = 0;
    // this.discountType = 0;
    // this.discntForm.reset();
    this.minStDate = new Date();
    this.getAgencies();
    this.getDiscountTypes();
    this.getDiscountFactor();
    this.getCriteria();
    this.getFeesFactor();
    this.getLocation();
    this.feeFactorValue = "PercentageBased";
    // this.isActiveValue = true;
    this.discntForm.controls['status'].setValue(1);
    this.showHideFldsOnChange(this.feeFactorValue, this.discountFactor);
    this.discntForm.controls["criteriaFormName"].setValue("");
    this.discntForm.controls["rangeCriteria"].setValue("");
    this.discntForm.controls["laneType"].setValue("");
    this.discntForm.controls["tripMethodForm"].setValue("");
    this.discntForm.controls["facility"].setValue("");
    this.discntForm.controls["txnType"].setValue("");

  }

  getDiscountTypes() {
    this.discountService.getDiscountTypes().subscribe(res => {
      this.discountTypes = res;
    })
  }

  getDiscountFactor() {
    this.discountService.getDiscountFactor().subscribe(res => {
      this.discountFactors = res;
    })
  }

  getCriteria() {
    this.discountService.getCriteria().subscribe(res => {
      this.criterias = res.filter(x => x.CetegoryId == 5 || x.CetegoryId == 4);
      this.getCriteriaRange();
      this.getCriteriaTripMethod();
      this.getCriteriaTxnType();
    })
  }
  //Date ,Time,Date Time 
  getCriteriaRange() {
    this.discountService.getCriteria().subscribe(res => {
      this.criteriasRange = res.filter(x => x.CriteriaType == "RANGE");
    })
  }
  // AVI/VEDIO
  getCriteriaTripMethod() {
    this.discountService.getCriteria().subscribe(res => {
      this.criteriasTripMethod = res.filter(x => x.Category == "TRANSACTION TYPE");
    })
  }
  //Parking ferry
  getCriteriaTxnType() {
    this.discountService.getCriteria().subscribe(res => {
      this.criteriasTrxnType = res.filter(x => x.Category == "FACILITY TYPE");
    })
  }
  getAgencies() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISCOUNTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.agencySetupService.GetAgencies(userEvents).subscribe(res => {
      this.agencies = res;
    });
  }
  getLocation() {
    this.agencySetupService.GetLocations().subscribe(res => {
      this.locations = res;
      console.log(res);
    });
  }
  getPlazaDetails(agencyCode) {
    this.objIPlazaRequest = <IPlazaRequest>{};
    let paging: IPaging = <IPaging>{};
    this.objIPlazaRequest.AgencyCode = agencyCode;
    this.objIPlazaRequest.LocationCode = "";
    this.objIPlazaRequest.PlazaCode = "";
    this.objIPlazaRequest.PlazaName = "";
    this.objIPlazaRequest.viewFlag = "SEARCH";
    this.objIPlazaRequest.UserId = this.sessionContextResponse.userId;
    this.objIPlazaRequest.LoginId = this.sessionContextResponse.loginId;
    this.objIPlazaRequest.ActivitySource = ActivitySource.Internal;
    this.objIPlazaRequest.PerformedBy = this.sessionContextResponse.userName;
    paging.PageSize = 1000;
    paging.PageNumber = 1;
    paging.SortDir = 1;
    paging.SortColumn = 'PLAZACODE';
    this.objIPlazaRequest.Paging = paging;
    // console.log(this.objIPlazaRequest);
    this.agencySetupService.GetPlaza(this.objIPlazaRequest).subscribe(res => {
      this.listOfPlazas = res;
      // console.log("plazas list: ", this.listOfPlazas);

    });
  }

  getFeesFactor() {
    this.discountsService.getFeesFactors().subscribe(res => {
      if (res) {
        this.feeFactors = res;
        // console.log("feeFactors: ", this.feeFactors);
      }
    }, (err) => {
      this.showErrorMessage(err.statusText);
    });
  }

  changeDate(startDate) {
    this.onDateRangeFieldChanged(startDate);
    startDate = startDate.value;
    if (startDate != null) {
      let date = new Date(startDate).toDateString();
      this.maxDate = new Date(date);
      this.myDatePickerOptions1 = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: {
          year: this.maxDate.getFullYear(),
          month: this.maxDate.getMonth() + 1,
          day: this.maxDate.getDate() - 1
        },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
        alignSelectorRight: false, indicateInvalidDate: true
      };
    }

  }
   changeDateTrxn(startDate) {
    this.onDateRangeFieldChangedTrxn(startDate);
    startDate = startDate.value;
    if (startDate != null) {
      let date = new Date(startDate).toDateString();
      this.maxDate = new Date(date);
      this.myDatePickerOptions1 = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: {
          year: this.maxDate.getFullYear(),
          month: this.maxDate.getMonth() + 1,
          day: this.maxDate.getDate() - 1
        },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
        alignSelectorRight: false, indicateInvalidDate: true
      };
    }

  }

  getDiscounts(pageNum: number, isPageLoad: boolean): void {
    const objReqDiscount: IDiscountRequest = <IDiscountRequest>{};
    objReqDiscount.Paging = <IPaging>{};
    objReqDiscount.Paging.PageNumber = pageNum;
    objReqDiscount.Paging.PageSize = 10;
    objReqDiscount.Paging.SortColumn = "DISCOUNTCODE";
    objReqDiscount.Paging.SortDir = 1;
    this.p = pageNum;

    objReqDiscount.SystemActivity = <ISystemActivities>{};
    objReqDiscount.SystemActivity.LoginId = this.sessionService.customerContext.loginId;
    objReqDiscount.SystemActivity.UserId = this.sessionService.customerContext.userId;
    objReqDiscount.SystemActivity.User = this.sessionService.customerContext.userName;
    objReqDiscount.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];

    let userEvents;
    if (isPageLoad) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DISCOUNTS];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
      userEvents.UserName = this.sessionService.customerContext.userName;
      userEvents.LoginId = this.sessionService.customerContext.loginId;
    }
    this.discountsService.getDiscounts(objReqDiscount, userEvents).subscribe(res => {
      if (res) {
        $('#pageloader').modal('hide');
        this.discountList = res;
        console.log("discountList: ", this.discountList);
        if (this.discountList && this.discountList.length > 0) {
          this.dataLength = this.discountList[0].Paging.ReCount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength;
          } else {
            this.endItemNumber = this.pageItemNumber;
          }
        }
      }
    }, (err) => {
      this.showErrorMessage(err.statusText);
      $('#pageloader').modal('hide');
    });

  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength) { this.endItemNumber = this.dataLength; }
    this.getDiscounts(this.p, false);
  }

  getDiscountById(discountId: number): void {
    this.discountsService.getDiscountByDiscountId(discountId.toString()).subscribe(res => {
      if (res && res.DiscountId > 0) {
        this.editDiscountRes = res;
        console.log("this.editDiscountRes", this.editDiscountRes);
        let startDate = new Date();
        startDate = new Date(res.StartEffectiveDate);
        this.discntForm.patchValue({
          startDate: {
            date: {
              year: startDate.getFullYear(),
              month: startDate.getMonth() + 1,
              day: startDate.getDate()
            }
          }
        });
        let endDate = new Date();
        endDate = new Date(res.EndEffectiveDate);
        this.discntForm.patchValue({
          endDate: {
            date: {
              year: endDate.getFullYear(),
              month: endDate.getMonth() + 1,
              day: endDate.getDate()
            }
          }
        });
        let a = this;
        setTimeout(function () {
          a.materialscriptService.material();
        }, 0);
        this.loadFieldstoUpdate(this.editDiscountRes);
      } else {
        this.showErrorMessage("Invalid discount to edit");
      }
      $('#pageloader').modal('hide');
    }, (err) => {
      this.showErrorMessage(err.statusText);
      $('#pageloader').modal('hide');
    }
    );
  }

  editDiscount(discountId: number) {
    this.mode = 'update';
    this.addButton = false;
    this.updateButton = true;
    this.manageDiscounts = true;
    this.editDiscountId = discountId;
    this.isEditDiscntDtl = false;
    this.editId = 0;
    this.getDiscountById(discountId);
    this.disableButton = !this.commonService.isAllowed(Features[Features.DISCOUNTS], Actions[Actions.UPDATE], '');

  }

  loadFieldstoUpdate(discRes: IDiscountResponse) {
    this.discntDtlsListDisp = discRes.ListDiscountDetails;
    this.discntDtlsListFly = discRes.ListDiscountDetails;
    this.discntEligibility = discRes.EligibilityDetails
    let eligibility = new List<IEligibilityDetailsRequest>(this.newFunctionEligibility());
    if (discRes.Isactive) {
      this.defaultStatus = 1;
    } else {
      this.defaultStatus = 0;
    }
    this.eligibilityResp = eligibility.ToArray();
    this.discntForm.patchValue({
      name: discRes.DiscountName,
      code: discRes.DiscountCode,
      description: discRes.Description,
      startDate: discRes.StartEffectiveDate,
      endDate: discRes.EndEffectiveDate,
      accessLevel: discRes.AccessLevel,
      status: discRes.Isactive ? '1' : '0',
      type: DiscountType[discRes.DiscountType],
      discountFactor: discRes.DiscountFactor
    });
    this.descriptionCharCount(discRes.Description);
    this.discntForm.controls["code"].disable();
    this.enableStartDate = true;
    this.enableEndDate = true;
    this.discntForm.patchValue({
      feeFactor: FeesFactor[discRes.ListDiscountDetails[0].Factor]
    });
    this.discntForm.controls['discountType'].setValue(discRes.ListDiscountDetails[0].DiscountType);
    this.showHideFldsOnChange(FeesFactor[discRes.ListDiscountDetails[0].Factor], discRes.DiscountFactor);
    this.discntForm.controls['fee'].setValue(discRes.Fee);
    // this.discntForm.controls['duration'].setValue(discRes.Duration);
    this.discntForm.controls['maxDisc'].setValue(discRes.ListDiscountDetails[0].UpperLimit);

    if (discRes.DiscountFactor === "Volume") {
      this.discntForm.controls['maxTxn'].setValue(discRes.ListDiscountDetails[0].MaxValue);// max
      this.discntForm.controls['minTxn'].setValue(discRes.ListDiscountDetails[0].MinValue);// min
      this.discntForm.controls['maxDays'].setValue(discRes.ListDiscountDetails[0].MaxRange);// max
      this.discntForm.controls['minDays'].setValue(discRes.ListDiscountDetails[0].MinRange);// min
      if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "AmountBased") {
        this.discntForm.controls['amt'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
      else if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "PercentageBased") {
        this.discntForm.controls['percent'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
    }

    if (discRes.DiscountFactor === "Period") {
      this.discntForm.controls['maxDays'].setValue(discRes.ListDiscountDetails[0].MaxRange);// max
      this.discntForm.controls['minDays'].setValue(discRes.ListDiscountDetails[0].MinRange);// min
      if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "AmountBased") {
        this.discntForm.controls['amt'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
      else if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "PercentageBased") {
        this.discntForm.controls['percent'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
    }

    if (discRes.DiscountFactor === "Amounts") {
      this.discntForm.controls['maxThreshold'].setValue(discRes.ListDiscountDetails[0].MaxValue);// max
      this.discntForm.controls['minThreshold'].setValue(discRes.ListDiscountDetails[0].MinValue);// min
      this.discntForm.controls['maxDays'].setValue(discRes.ListDiscountDetails[0].MaxRange);// max
      this.discntForm.controls['minDays'].setValue(discRes.ListDiscountDetails[0].MinRange);// min
      this.discntForm.controls['maxAvailDiscount'].setValue(discRes.ListDiscountDetails[0].UpperLimit);
      if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "AmountBased") {
        this.discntForm.controls['minAvailDiscount'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
      else if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "PercentageBased") {
        this.discntForm.controls['minAvailDiscount'].setValue(discRes.ListDiscountDetails[0].DiscountValue);// ACTUAL DISC VALUE
      }
    }
    if (discRes.DiscountFactor === "Trip") {
      this.discntForm.controls['maxTxn'].setValue(discRes.ListDiscountDetails[0].MaxRange);
      if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "AmountBased") {
        this.discntForm.controls['amt'].setValue(discRes.ListDiscountDetails[0].DiscountValue); // ACTUAL DISC VALUE
      }
      else if (FeesFactor[discRes.ListDiscountDetails[0].Factor] === "PercentageBased") {
        this.discntForm.controls['percent'].setValue(discRes.ListDiscountDetails[0].DiscountValue);
        this.discntForm.controls['maxDisc'].setValue(discRes.ListDiscountDetails[0].UpperLimit);

      }
    }

    let isTxnType = false;
    let isTripMetthod = false;
    let isRange = false;

    let elementName;
    if (this.eligibilityResp !== null) {
      this.eligibilityResp.forEach(element => {
        if (element.Criteria === "AGENCY") {
          this.isAgencies = true;
          this.agency = element.MinRange;
          this.isFacilities = false;
          // this.criteriaValue = element.Criteria;
          this.discntForm.controls['criteriaFormName'].setValue(element.Criteria);
          this.discntForm.controls['agencies'].setValue(element.MinRange);
          this.getPlazaDetails(element.MinRange);
        }
        if (element.Criteria === "FACILITY") {
          // let selectedLocation = new List<any>(this.locations);
          // let seletedcriteria = selectedLocation.Where(x => x.LocationCode == element.MinRange).ToArray();
          console.log("seletedcriteria" + element.MinRange);
          this.isFacilities = true;
          this.isAgencies = false;
          this.isLanes = false;
          this.isPlaza = false;
          this.discntForm.controls['criteriaFormName'].setValue(element.Criteria);
          this.discntForm.controls['facility'].setValue(element.MinRange);
          this.facility = element.MinRange;
        }
        if (element.Criteria === "PLAZA") {
          this.isPlaza = true;
          this.plazaValue = element.MinRange;
          this.discntForm.controls['plazas'].setValue(element.MinRange);

        }
        // else {
        //   this.plazaValue = 0;
        //   this.discntForm.controls['plazas'].setValue("");
        // }
        if (element.Criteria === "LANE") {
          this.bindLanes(this.plazaValue);
          this.laneValue = element.MinRange;
          this.isLanes = true;
          this.discntForm.controls['laneType'].setValue(element.MinRange);
        }
        //else {
        //   this.laneValue = 0;
        //   this.discntForm.controls['laneType'].setValue("");
        // }

        if (element.CriteriaType == "RANGE") {
          //  this.discntForm.controls['rangeCriteria'].setValue(element.Criteria);
          console.log("RANGE", element.Criteria);
          this.rangeValue = element.Criteria;
          isRange = true;
        }
        if (element.Criteria === "TRANSACTION DATE") {
          this.rangeCriteria = element.Criteria;
          console.log("", element.Criteria);
          this.transactionDateTime = true;
          this.transactionTime = false;
          this.setDate(element.MinRange, element.MaxRange);
          // this.discntForm.controls["startDateFactor"].setValue(element.MinRange);
          //  this.discntForm.controls["endDateFactor"].setValue(element.MaxRange);
          // this.discntForm.controls['criteriaFormName'].setValue(element.Criteria);
        }
        if (element.Criteria === "TRANSACTION DATE TIME") {
          this.rangeCriteria = element.Criteria;
          this.transactionDateTime = true;
          this.transactionTime = true;
          this.setDate(element.MinRange, element.MaxRange);
          console.log("", element.Criteria);
          // this.discntForm.controls['criteriaFormName'].setValue(element.Criteria);
        }
        if (element.Criteria === "TRANSACTION TIME") {
          this.rangeCriteria = element.Criteria;
          this.transactionTime = true;
          this.transactionDateTime = false;
          this.setDate('2017-' + '07-' + '01 ' + element.MinRange, '2017-' + '07-' + '01 ' + element.MaxRange);
          //this.discntForm.controls['startTime'].setValue(element.MinRange);
          // this.discntForm.controls['endTime'].setValue(element.MaxRange);
          console.log("", element.Criteria);
          // this.discntForm.controls['criteriaFormName'].setValue(element.Criteria);
        }
        if (element.Criteria === "FACILITYTYPE") {
          this.discntForm.controls['txnType'].setValue(element.MinRange);
          isTxnType = true;
        }
        // else {
        //   this.discntForm.controls['txnType'].setValue("");
        // }
        if (element.Criteria === "TRIPMETHOD") {
          this.discntForm.controls['tripMethodForm'].setValue(element.MinRange);
          isTripMetthod = true;
        }
        // else {
        //   this.discntForm.controls['tripMethodForm'].setValue("");
        // }

      });
      //To default populate select rangeCriteria
      if (!isRange) this.discntForm.controls['rangeCriteria'].setValue("");
      if (!isTxnType) this.discntForm.controls['txnType'].setValue("");
      if (!isTripMetthod) this.discntForm.controls['tripMethodForm'].setValue("");

    }
    else {
      //To default populate select rangeCriteria
      if (!isRange) this.discntForm.controls['rangeCriteria'].setValue("");
      if (!isTxnType) this.discntForm.controls['txnType'].setValue("");
      if (!isTripMetthod) this.discntForm.controls['tripMethodForm'].setValue("");
      // this.discntForm.controls['criteriaFormName'].setValue("0");
      this.criteriasFormValue = "";
    }
  }

  showHideFldsOnChange(feeFactor, discountFactor) {
    this.discntForm.controls["minDays"].enable();
    this.discntForm.controls['minDays'].setValue("1");
    if (discountFactor === "Volume" && feeFactor === "AmountBased") {
      this.fldMinTxn = true;
      this.fldMaxTxn = true;
      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = true;
      this.fldPercent = false;
      this.fldMaxDisc = true;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false
      this.discntForm.controls["minTxn"].enable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators([Validators.required]);
      this.discntForm.controls["maxDisc"].setValidators([Validators.required]);
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls["maxDays"].updateValueAndValidity();
      this.discntForm.controls["maxDisc"].updateValueAndValidity();
      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls["amt"].setValidators([Validators.required]);
      this.discntForm.controls["percent"].setValidators(null);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();
    } else if (discountFactor === "Volume" && feeFactor === "PercentageBased") {
      this.fldMinTxn = true;
      this.fldMaxTxn = true;
      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = false;
      this.fldPercent = true;
      this.fldMaxDisc = true;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false;
      this.discntForm.controls["minTxn"].enable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators([Validators.required]);
      this.discntForm.controls["maxDisc"].setValidators([Validators.required]);
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls["maxDays"].updateValueAndValidity();
      this.discntForm.controls["maxDisc"].updateValueAndValidity();

      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls["amt"].setValidators(null);
      this.discntForm.controls["percent"].setValidators([Validators.required]);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();
    } else if (discountFactor === "Period" && feeFactor === "AmountBased") {
      this.fldMinTxn = false;
      this.fldMaxTxn = false;
      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = true;
      this.fldPercent = false;
      this.fldMaxDisc = true;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false
      //this.discntForm.controls["minTxn"].disable();
      // this.discntForm.controls["maxTxn"].disable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      //  this.discntForm.controls["percent"].disable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minTxn"].setValidators(null);
      this.discntForm.controls["maxTxn"].setValidators(null);
      this.discntForm.controls["maxDays"].setValidators([Validators.required]);
      this.discntForm.controls["maxDisc"].setValidators([Validators.required]);
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls["maxDays"].updateValueAndValidity();
      this.discntForm.controls["maxDisc"].updateValueAndValidity();

      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls["amt"].setValidators([Validators.required]);
      this.discntForm.controls["percent"].setValidators([Validators.required]);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();

    } else if (discountFactor === "Period" && feeFactor === "PercentageBased") {
      this.fldMinTxn = false;
      this.fldMaxTxn = false;
      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = false;
      this.fldPercent = true;
      this.fldMaxDisc = true;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false
      //this.discntForm.controls["minTxn"].disable();
      // this.discntForm.controls["maxTxn"].disable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls["minTxn"].setValidators(null);
      this.discntForm.controls["maxTxn"].setValidators(null);
      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();

      this.discntForm.controls["amt"].setValidators(null);
      this.discntForm.controls["percent"].setValidators([Validators.required]);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();

    } else if (discountFactor === "Trip" && feeFactor === "AmountBased") {
      this.fldMinTxn = false;
      this.fldMaxTxn = true;
      this.fldMinDays = false;
      this.fldMaxDays = false;
      this.fldAmt = true;
      this.fldPercent = false;
      this.fldMaxDisc = false;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false;
      this.discntForm.controls["minTxn"].disable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].disable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].disable();
      this.discntForm.controls["minTxn"].setValidators(null);
      this.discntForm.controls["maxTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators(null);
      this.discntForm.controls["minDays"].setValidators(null);
      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls["maxDays"].updateValueAndValidity();
      this.discntForm.controls["minDays"].updateValueAndValidity();
      this.discntForm.controls["minThreshold"].updateValueAndValidity();
      this.discntForm.controls["maxThreshold"].updateValueAndValidity();
      this.discntForm.controls["minAvailDiscount"].updateValueAndValidity();
      this.discntForm.controls["maxAvailDiscount"].updateValueAndValidity();

      this.discntForm.controls["amt"].setValidators([Validators.required]);
      this.discntForm.controls["percent"].setValidators(null);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();

    } else if (discountFactor === "Trip" && feeFactor === "PercentageBased") {
      this.fldMinTxn = false;
      this.fldMaxTxn = true;
      this.fldMinDays = false;
      this.fldMaxDays = false;
      this.fldAmt = false;
      this.fldPercent = true;
      this.fldMaxDisc = true;
      this.minthresholdAmt = false;
      this.maxthresholdAmt = false;
      this.maxAvailDiscount = false;
      this.minAvailDiscount = false
      this.discntForm.controls["minTxn"].disable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].disable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minTxn"].setValidators(null);
      this.discntForm.controls["maxTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators(null);
      this.discntForm.controls["minDays"].setValidators(null);
      this.discntForm.controls["minThreshold"].setValidators(null);
      this.discntForm.controls["maxThreshold"].setValidators(null);
      this.discntForm.controls["minAvailDiscount"].setValidators(null);
      this.discntForm.controls["maxAvailDiscount"].setValidators(null);
      this.discntForm.controls['minTxn'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls["maxDays"].updateValueAndValidity();
      this.discntForm.controls["minDays"].updateValueAndValidity();
      this.discntForm.controls["minThreshold"].updateValueAndValidity();
      this.discntForm.controls["maxThreshold"].updateValueAndValidity();
      this.discntForm.controls["minAvailDiscount"].updateValueAndValidity();
      this.discntForm.controls["maxAvailDiscount"].updateValueAndValidity();

      this.discntForm.controls["amt"].setValidators(null);
      this.discntForm.controls["percent"].setValidators([Validators.required]);
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();

    } else if (discountFactor === "Amounts" && feeFactor === "AmountBased") {

      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = false;
      this.fldPercent = false;
      this.fldMaxDisc = false;
      this.fldMinTxn = false;
      this.fldMaxTxn = false;
      // this.fldAmt = true;
      // this.fldPercent = true;
      // this.fldMaxDisc = true;
      // this.fldMinTxn = true;
      // this.fldMaxTxn = true;
      this.minthresholdAmt = true;
      this.maxthresholdAmt = true;
      this.maxAvailDiscount = true;
      this.minAvailDiscount = true;
      this.discntForm.controls["minTxn"].disable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();
      this.discntForm.controls["minThreshold"].setValidators([Validators.required]);
      this.discntForm.controls["maxThreshold"].setValidators([Validators.required]);
      this.discntForm.controls["minAvailDiscount"].setValidators([Validators.required]);
      this.discntForm.controls["maxAvailDiscount"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators([Validators.required]);

      this.discntForm.controls["maxTxn"].setValidators(null);
      this.discntForm.controls["amt"].setValidators(null);
      this.discntForm.controls["percent"].setValidators(null);
      this.discntForm.controls["maxDisc"].setValidators(null);

      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls['maxDays'].updateValueAndValidity();
      this.discntForm.controls['amt'].updateValueAndValidity();
      this.discntForm.controls['percent'].updateValueAndValidity();
      this.discntForm.controls['maxDisc'].updateValueAndValidity();

    } else if (discountFactor === "Amounts" && feeFactor === "PercentageBased") {
      this.fldMinTxn = false;
      this.fldMaxTxn = false;
      this.fldMinDays = true;
      this.fldMaxDays = true;
      this.fldAmt = false;
      this.fldPercent = false;
      this.fldMaxDisc = false;
      this.minthresholdAmt = true;
      this.maxthresholdAmt = true;
      this.maxAvailDiscount = true;
      this.minAvailDiscount = true;
      this.discntForm.controls["minTxn"].disable();
      this.discntForm.controls["maxTxn"].enable();
      this.discntForm.controls["minDays"].disable();
      this.discntForm.controls["maxDays"].enable();
      this.discntForm.controls["amt"].enable();
      this.discntForm.controls["percent"].enable();
      this.discntForm.controls["maxDisc"].enable();

      this.discntForm.controls["minThreshold"].setValidators([Validators.required]);
      this.discntForm.controls["maxThreshold"].setValidators([Validators.required]);
      this.discntForm.controls["minAvailDiscount"].setValidators([Validators.required]);
      this.discntForm.controls["maxAvailDiscount"].setValidators([Validators.required]);
      this.discntForm.controls["maxTxn"].setValidators([Validators.required]);
      this.discntForm.controls["maxDays"].setValidators([Validators.required]);

      this.discntForm.controls["maxTxn"].setValidators(null);
      this.discntForm.controls["amt"].setValidators(null);
      this.discntForm.controls["percent"].setValidators(null);
      this.discntForm.controls["maxDisc"].setValidators(null);

      this.discntForm.controls['minThreshold'].updateValueAndValidity();
      this.discntForm.controls['maxThreshold'].updateValueAndValidity();
      this.discntForm.controls['minAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxAvailDiscount'].updateValueAndValidity();
      this.discntForm.controls['maxTxn'].updateValueAndValidity();
      this.discntForm.controls['maxDays'].updateValueAndValidity();

      this.discntForm.controls["maxTxn"].updateValueAndValidity();
      this.discntForm.controls["amt"].updateValueAndValidity();
      this.discntForm.controls["percent"].updateValueAndValidity();
      this.discntForm.controls["maxDisc"].updateValueAndValidity();
    }
  }

  feeFactorChangeClick(feeFactor) {
    this.feeFactorValue = feeFactor.Key;
    this.showHideFldsOnChange(this.feeFactorValue, this.discountFactor);
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 0);
  }

  discTypeChangeClick() {
    const dType = this.discntForm.controls["type"].value;
    if (this.discntDtlsListFly && this.discntDtlsListFly.length > 0) {
      this.discntDtlsListDisp = this.discntDtlsListFly.filter((x: IDiscountDetailsResponse) => x.DiscountType === dType);
    }
  }

  deleteDiscountDtl(objdiscntDtls: IDiscountDetailsResponse) {
    let indx = this.discntDtlsListFly.indexOf(objdiscntDtls);
    if (indx >= 0) {
      this.discntDtlsListFly.splice(indx, 1);
    }

    indx = this.discntDtlsListDisp.indexOf(objdiscntDtls);
    if (indx >= 0) {
      this.discntDtlsListDisp.splice(indx, 1);
    }
  }

  editDiscountDtl(objdiscntDtls: IDiscountDetailsResponse) {
    this.discntForm.patchValue({
      feeFactor: isNaN(objdiscntDtls.Factor) ? objdiscntDtls.Factor : FeesFactor[objdiscntDtls.Factor],
      minTxn: objdiscntDtls.MinValue,
      maxTxn: objdiscntDtls.MaxValue,
      minDays: objdiscntDtls.MinRange,
      maxDays: objdiscntDtls.MaxRange,
      amt: objdiscntDtls.DiscountValue,
      percent: objdiscntDtls.DiscountValue,
      maxDisc: objdiscntDtls.UpperLimit
    });
    this.isEditDiscntDtl = true;
    this.editId = objdiscntDtls.Id;
  }

  createDiscount() {
    console.log("discntForm" + this.discntForm.controls);
    if (this.discntForm.valid) {
      this.getFormValue(true);
      console.log("objReqDiscount: ", this.objReqDiscount);
      console.log("DiscountDetails: ", this.objReqDiscount.DiscountDetails);
      let userEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DISCOUNTS];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
      userEvents.UserName = this.sessionService.customerContext.userName;
      userEvents.LoginId = this.sessionService.customerContext.loginId;

      this.discountsService.createDiscount(this.objReqDiscount, userEvents).subscribe(res => {
        if (res) {
          this.showSuccessMessage('Discount has been added successfully');
          $('#myModal').modal('hide');
          this.getDiscounts(1, false);
          this.manageDiscounts = false;

          this.enableStartDate = true;
          this.enableEndDate = true;
          this.feeFactorValue = "PercentageBased";
          this.isActiveValue = true;
          this.addButton = true;
          this.updateButton = false;
          this.defaultStatus = 1;
          this.mode = 'add';
          this.discntForm.controls['code'].reset();
          this.discntForm.controls['name'].reset();
          this.discntForm.controls['minTxn'].reset();
          this.discntForm.controls['maxTxn'].reset();
          this.discntForm.controls['percent'].reset();
          this.discntForm.controls['maxDisc'].reset();
          this.discntForm.controls['criteriaFormName'].setValue("");
          this.discntForm.controls['discountType'].setValue("");
          this.discntForm.controls['agencies'].setValue("");
          this.discntForm.controls['plazas'].setValue("");
          this.discntForm.controls['discountFactor'].setValue("Volume");
          this.discountFactor = "Volume";
          this.showHideFldsOnChange(this.feeFactorValue, this.discountFactor);
          this.onChangeRangeCriteria('');
          this.onChangeCriteria('');
        } else {
          this.showErrorMessage('Error while creating discount');
        }
        $('#pageloader').modal('hide');
      }, (err) => {
        this.showErrorMessage(err.statusText);
        $('#pageloader').modal('hide');
      });
    }
    else {
      this.validateAllFormFields(this.discntForm);
    }
  }
  private newFunction(): ICriteriasResponse[] {
    return this.criterias;
  }

  private newFunctionEligibility(): IEligibilityDetailsRequest[] {
    return this.discntEligibility;
  }

  updateDiscount() {
    if (this.discntForm.valid) {
      this.getFormValue(false);
      this.objReqDiscount.DiscountId = this.editDiscountId;
      console.log("startDate", this.discntForm.controls["startDate"].value);
      console.log("EndDate", this.discntForm.controls["endDate"].value);
      let endCreate = this.discntForm.controls["endDate"].value;
      let startCreate = this.discntForm.controls["startDate"].value
      if (startCreate.date != undefined) {
        startCreate = new Date(startCreate.date.year, (startCreate.date.month) - 1, startCreate.date.day, 0, 0, 0, 0).toLocaleString();
      }
      else {
        let newEndDate = new Date(this.discntForm.controls["startDate"].value);
        startCreate = new Date(newEndDate.getFullYear(), (newEndDate.getMonth()), newEndDate.getDate()).toLocaleString();
      }

      if (endCreate.date != undefined) {
        endCreate = new Date(endCreate.date.year, (endCreate.date.month) - 1, endCreate.date.day, 0, 0, 0, 0).toLocaleString();
      }
      else {
        let newEndDate = new Date(this.discntForm.controls["endDate"].value);
        endCreate = new Date(newEndDate.getFullYear(), (newEndDate.getMonth()), newEndDate.getDate()).toLocaleString();
      }
      this.objReqDiscount.EndEffectiveDate = endCreate;
      this.objReqDiscount.StartEffectiveDate = startCreate;
      let userEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DISCOUNTS];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
      userEvents.UserName = this.sessionService.customerContext.userName;
      userEvents.LoginId = this.sessionService.customerContext.loginId;
      this.discountsService.updateDiscount(this.objReqDiscount, userEvents).subscribe(res => {
        if (res) {
          this.showSuccessMessage('Discount has been updated successfully');
          $('#myModal').modal('hide');
          this.getDiscounts(1, false);
          this.manageDiscounts = false;
        } else {
          this.showErrorMessage('Error while updating discount');
        }
        $('#pageloader').modal('hide');
      }, (err) => {
        this.showErrorMessage(err.statusText);
        $('#pageloader').modal('hide');
      });

    }
    else {
      this.validateAllFormFields(this.discntForm);
    }
  }

  rdoStatusChangeClick(activeInactiveRadio) {
    this.isActiveValue = activeInactiveRadio;
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;
  }
   onDateRangeFieldChangedTrxn(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate1 = true;

      return;
    }
    else
      this.invalidDate1 = false;
  }

  onDateRangeFieldEndDate(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidEnd = true;

      return;
    }
    else
      this.invalidEnd = false;
  }
  onDateRangeFieldTrxn(event: IMyInputFieldChanged){
     if (!event.valid && event.value != "") {
      this.invalidEnd1 = true;

      return;
    }
    else
      this.invalidEnd1 = false;
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

  closeDtlAlert() {
    this.msgFlag = false;
  }

  showDtlErrorMsg(msg: string) {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  resetDtls() {
    this.discntForm.reset();
    this.discntForm.patchValue({
      feeFactor: 'PercentageBased',
      minDays: '1',
      status: '1'
    });
  }

  cancelDtlsClick() {
    this.discntForm.controls["code"].enable();
    this.resetDtls();
    this.isEditDiscntDtl = false;
    this.editId = 0;

    // if (this.mode === 'update' && this.editDiscountId > 0) {
    //   this.loadFieldstoUpdate(this.editDiscountRes);
    // }
  }

  getFeeFactorDesc(key: string): string {
    if (this.feeFactors && this.feeFactors.length > 0) {
      let item = this.feeFactors.filter((x) => x.Key === key);
      if (item && item.length > 0) {
        return item[0].Value;
      } else {
        item = this.feeFactors.filter((x) => x.Key === FeesFactor[key]);
        if (item && item.length > 0) {
          return item[0].Value;
        }
      }
    }
    return key;
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  getCurrentDate(): Date {
    const dt = new Date();
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  descriptionCharCount(txt: string): void {
    this.descCharLeft = 255 - txt.length;
  }

  cancelClick() {
    this.manageDiscounts = false;
    this.discntForm.reset();
    this.discountFactor = "0";
    this.agency = 0;
    this.subCriteria = 0;
    this.discountType = 0;
    // this.discntForm.reset();
    this.subscription = false;
    this.transactionDateTime = false;
    this.transactionTime = false;
    this.discntForm.controls['criteriaFormName'].setValue("");
    this.discntForm.controls['discountType'].setValue("");
    this.discntForm.controls['agencies'].setValue("");
    this.discntForm.controls['plazas'].setValue("");
    this.discntForm.controls['discountFactor'].setValue("Volume");
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  addNewManageDiscounts() {
    this.discntForm.controls["code"].enable();
    this.discntForm.reset();
    this.manageDiscounts = true;
    this.enableStartDate = true;
    this.enableEndDate = true;
    this.feeFactorValue = "PercentageBased";
    this.isActiveValue = true;
    this.addButton = true;
    this.updateButton = false;
    this.defaultStatus = 1;
    this.mode = 'add';
    this.discntForm.controls['criteriaFormName'].setValue("");
    this.discntForm.controls['discountType'].setValue("");
    this.discntForm.controls['agencies'].setValue("");
    this.discntForm.controls['plazas'].setValue("");
    this.discntForm.controls['discountFactor'].setValue("Volume");
    this.discntForm.controls["criteriaFormName"].setValue("");
    this.discntForm.controls["rangeCriteria"].setValue("");
    this.discntForm.controls["laneType"].setValue("");
    this.discntForm.controls["tripMethodForm"].setValue("");
    this.discntForm.controls["facility"].setValue("");
    this.discntForm.controls["txnType"].setValue("");
    this.discountFactor = "Volume";
    this.discntForm.controls["status"].setValue("1");
    this.discntForm.controls["feeFactor"].setValue("PercentageBased");
    this.showHideFldsOnChange(this.feeFactorValue, this.discountFactor);
    this.onChangeCriteria('');
    this.onChangeRangeCriteria('');
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 1000);
  }

  onChangeDiscountType(event) {
    // console.log("event", event);
    // console.log("discountType: ", event.target.value);
    // if (event.target.value == "Global") {
    //   this.criteriaList = false;
    // } else if (event.target.value != "Global") {
    //   this.criteriaList = true;
    // }
    if (event.target.value == "Subscription") {
      this.subscription = true;
      this.discntForm.value.firstName
      this.discntForm.controls["fee"].setValidators(Validators.compose([Validators.required, Validators.pattern(this.pattren), Validators.pattern(this.zeroPattren)]));
      this.discntForm.controls['fee'].updateValueAndValidity();
    }
    else {
      this.subscription = false;
      this.discntForm.controls["fee"].setValidators(null);
      this.discntForm.controls['fee'].updateValueAndValidity();
    }

  }

  onChangeRangeCriteria(event) {
    console.log("event: ", event);
    this.rangeCriteria = event;
    if (event == "TRANSACTION DATE TIME") {
      this.transactionDateTime = true;
      this.transactionTime = true;
      this.discntForm.controls["startDateFactor"].setValidators([Validators.required]);
      this.discntForm.controls["endDateFactor"].setValidators([Validators.required]);
      this.discntForm.controls["startTime"].setValidators([Validators.required]);
      this.discntForm.controls["endTime"].setValidators([Validators.required]);
    } else if (event == "TRANSACTION TIME") {
      this.transactionDateTime = false;
      this.transactionTime = true;
      this.discntForm.controls["startDateFactor"].setValidators(null);
      this.discntForm.controls["endDateFactor"].setValidators(null);
      this.discntForm.controls["startTime"].setValidators([Validators.required]);
      this.discntForm.controls["endTime"].setValidators([Validators.required]);

    } else if (event == "TRANSACTION DATE") {
      this.transactionDateTime = true;
      this.transactionTime = false;
      this.discntForm.controls["startDateFactor"].setValidators([Validators.required]);
      this.discntForm.controls["endDateFactor"].setValidators([Validators.required]);
      this.discntForm.controls["startTime"].setValidators(null);
      this.discntForm.controls["endTime"].setValidators(null);
    }
    else {
      this.transactionDateTime = false;
      this.transactionTime = false;
      this.discntForm.controls["startDateFactor"].setValidators(null);
      this.discntForm.controls["endDateFactor"].setValidators(null);
      this.discntForm.controls["startTime"].setValidators(null);
      this.discntForm.controls["endTime"].setValidators(null);
    }
    this.discntForm.controls["startDateFactor"].updateValueAndValidity();
    this.discntForm.controls["endDateFactor"].updateValueAndValidity();
    this.discntForm.controls["startTime"].updateValueAndValidity();
    this.discntForm.controls["endTime"].updateValueAndValidity();
  }

  onChangeCriteria(event) {
    console.log("event: ", event);
    if (event == "AGENCY") {
      this.agency = "";
      this.isAgencies = true;
      this.isFacilities = false;
      // this.discntForm.controls['agencies'].setValue("");
      this.discntForm.controls["agencies"].setValidators([Validators.required]);
      this.discntForm.controls["facility"].setValidators(null);
      this.discntForm.controls["agencies"].updateValueAndValidity();
      this.discntForm.controls["facility"].updateValueAndValidity();
    } else if (event == "FACILITY") {
      this.isFacilities = true;
      this.isAgencies = false;
      this.isLanes = false;
      this.isPlaza = false;
      this.facility = "";
      this.discntForm.controls["agencies"].setValidators(null);
      this.discntForm.controls["facility"].setValidators([Validators.required]);
      this.discntForm.controls["agencies"].updateValueAndValidity();
      this.discntForm.controls["facility"].updateValueAndValidity();
      // this.discntForm.controls['facility'].setValue("");
    }
    else {
      this.discntForm.controls["agencies"].setValidators(null);
      this.discntForm.controls["facility"].setValidators(null);
      this.discntForm.controls["agencies"].updateValueAndValidity();
      this.discntForm.controls["facility"].updateValueAndValidity();
      this.isAgencies = false;
      this.isFacilities = false;
      this.isLanes = false;
      this.isPlaza = false;
    }
  }

  onChangeDiscountFactor(event) {
    console.log("event", event);
    this.discountFactor = event;
    console.log("discountFactor: ", this.discountFactor);
    this.showHideFldsOnChange(this.feeFactorValue, this.discountFactor);
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 0);
  }

  onChangeAgency(event) {
    this.plazaValue = "";
    this.isPlaza = true;
    this.agencyName = event.target.value;
    this.getPlazaDetails(this.agencyName);
  }

  onChangePlaza(event) {
    this.isLanes = true;

    //this.agencyName = event.target.value;
    //this.getPlazaDetails(this.agencyName);
    this.bindLanes(event);
  }

  onChangeLanes(event) {
    // this.isLanes = true;
    //this.agencyName = event.target.value;
    //this.getPlazaDetails(this.agencyName);
  }

  bindLanes(event) {
    this.laneValue = "";//LaneCode
    this.ezPassService.getLanesByPlazaCode(event).subscribe(res => {
      this.LanesByPlazaCode = res;
      console.log('lanes' + JSON.stringify(this.LanesByPlazaCode));
    }, (err) => {

      return;
    });
  }
  getFormValue(isAdd: boolean) {
    this.objReqDiscount = <IDiscountRequest>{};
    this.objReqDiscount.SystemActivity = <ISystemActivities>{};
    this.objDiscountDetailsRequest = <IDiscountDetailsRequest>{};
    this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
    this.objReqDiscount.DiscountDetails = [];
    this.objReqDiscount.EligibilityDetails = [];
    this.objReqDiscount.DiscountCode = this.discntForm.controls["code"].value;
    this.objReqDiscount.DiscountName = this.discntForm.controls["name"].value;
    this.objReqDiscount.Description = this.discntForm.controls["description"].value;
    if (isAdd) {
      let startdateGlobal = this.discntForm.controls["startDate"].value;
      let enddateGlobal = this.discntForm.controls["endDate"].value;
      this.objReqDiscount.StartEffectiveDate = new Date(startdateGlobal.date.year, startdateGlobal.date.month - 1, startdateGlobal.date.day).toLocaleString();
      this.objReqDiscount.EndEffectiveDate = new Date(enddateGlobal.date.year, enddateGlobal.date.month - 1, enddateGlobal.date.day).toLocaleString();
    }
    this.objReqDiscount.DiscountType = this.discountType;
    this.objReqDiscount.Isactive = this.discntForm.controls["status"].value == "1" ? true : false;
    this.objReqDiscount.PerformBy = this.sessionService.customerContext.userName;
    this.objReqDiscount.ActivitySource = ActivitySource.Internal;
    this.objReqDiscount.SubSystem = Subsystem.SAC;
    this.objReqDiscount.Fee = this.discntForm.controls['fee'].value;
    //this.objReqDiscount.Duration = this.discntForm.controls['duration'].value;
    this.objReqDiscount.IsSlab = false;
    this.objReqDiscount.DiscountFactor = this.discountFactor;

    this.objReqDiscount.SystemActivity.LoginId = this.sessionContextResponse.loginId;;
    this.objReqDiscount.SystemActivity.UserId = this.sessionContextResponse.userId;
    this.objReqDiscount.SystemActivity.User = this.sessionContextResponse.userName;
    this.objReqDiscount.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objReqDiscount.SystemActivity.SubSystem = Subsystem[Subsystem.SAC];
    this.objReqDiscount.SystemActivity.CustomerId = this.sessionContextResponse.userId;

    if (this.discountFactor === "Volume") {
      this.objDiscountDetailsRequest.MaxValue = this.discntForm.controls['maxTxn'].value;// max
      this.objDiscountDetailsRequest.MinValue = this.discntForm.controls['minTxn'].value;// min
      this.objDiscountDetailsRequest.MaxRange = this.objReqDiscount.Duration = this.discntForm.controls['maxDays'].value;// max
      this.objDiscountDetailsRequest.MinRange = this.discntForm.controls['minDays'].value;// min
      this.objDiscountDetailsRequest.Factor = this.feeFactorValue; //Amn / per
      this.objDiscountDetailsRequest.UpperLimit = this.discntForm.controls['maxDisc'].value; //CAP
      if (this.feeFactorValue === "AmountBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['amt'].value; // ACTUAL DISC VALUE
      }
      else if (this.feeFactorValue === "PercentageBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['percent'].value; // ACTUAL DISC VALUE
      }
    }

    if (this.discountFactor === "Period") {
      this.objDiscountDetailsRequest.MaxRange = this.objReqDiscount.Duration = this.discntForm.controls['maxDays'].value;// max
      this.objDiscountDetailsRequest.MinRange = this.discntForm.controls['minDays'].value;// min

      this.objDiscountDetailsRequest.Factor = this.feeFactorValue; //Amn / per
      this.objDiscountDetailsRequest.UpperLimit = this.discntForm.controls['maxDisc'].value; //CAP

      if (this.feeFactorValue === "AmountBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['amt'].value; // ACTUAL DISC VALUE
      }
      else if (this.feeFactorValue === "PercentageBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['percent'].value; // ACTUAL DISC VALUE
      }
    }

    if (this.discountFactor === "Amounts") {
      this.objDiscountDetailsRequest.MaxRange = this.objReqDiscount.Duration = this.discntForm.controls['maxDays'].value;// max
      this.objDiscountDetailsRequest.MinRange = this.discntForm.controls['minDays'].value;// min
      this.objDiscountDetailsRequest.MaxValue = this.discntForm.controls['maxThreshold'].value;// max
      this.objDiscountDetailsRequest.MinValue = this.discntForm.controls['minThreshold'].value;// min
      this.objDiscountDetailsRequest.Factor = this.feeFactorValue; //Amn / per
      this.objDiscountDetailsRequest.UpperLimit = this.discntForm.controls['maxAvailDiscount'].value; //CAP
      if (this.feeFactorValue === "AmountBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['minAvailDiscount'].value; // ACTUAL DISC VALUE
      }
      else if (this.feeFactorValue === "PercentageBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['minAvailDiscount'].value; // ACTUAL DISC VALUE
      }
    }

    if (this.discountFactor === "Trip") {
      this.objDiscountDetailsRequest.Factor = this.feeFactorValue; //Amn / per
      this.objDiscountDetailsRequest.MaxRange = this.discntForm.controls['maxTxn'].value;// max
      if (this.feeFactorValue === "AmountBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['amt'].value; // ACTUAL DISC VALUE
      }
      else if (this.feeFactorValue === "PercentageBased") {
        this.objDiscountDetailsRequest.DiscountValue = this.discntForm.controls['percent'].value; // ACTUAL DISC VALUE
        this.objDiscountDetailsRequest.UpperLimit = this.discntForm.controls['maxDisc'].value; //CAP
      }
    }

    let criteria = new List<ICriteriasResponse>(this.newFunction());
    this.seletedcriteria = criteria.Where(x => x.Criteria == this.criteriasFormValue).ToArray();
    if (this.seletedcriteria[0] !== undefined) {
      if (this.seletedcriteria[0].Criteria == "FACILITY") {
        if (this.facility != 0) {
          let criteria = new List<ICriteriasResponse>(this.newFunction());
          // this.seletedcriteria = criteria.Where(x => x.Criteria == this.facility.toString()).ToArray();
          this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
          this.objEligibilityDetailsRequest.MinRange = this.facility.toString();
          this.objEligibilityDetailsRequest.MaxRange = this.facility.toString();
          this.objEligibilityDetailsRequest.Criteria = this.seletedcriteria[0].Criteria;
          this.objEligibilityDetailsRequest.CriteriaType = this.seletedcriteria[0].CriteriaType;
          this.objEligibilityDetailsRequest.DataType = this.seletedcriteria[0].DataType;
          this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
          this.objEligibilityDetailsRequest.DiscountId = 0;
          this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
        }
      }
      else if (this.seletedcriteria[0].Criteria == "AGENCY") {
        if (this.isAgencies) {
          if (this.agency != 0) {
            this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
            this.objEligibilityDetailsRequest.MinRange = this.agencyName;
            this.objEligibilityDetailsRequest.MaxRange = this.agencyName;
            this.objEligibilityDetailsRequest.Criteria = "AGENCY";
            this.objEligibilityDetailsRequest.CriteriaType = "VALUE";
            this.objEligibilityDetailsRequest.DataType = "VARCHAR";
            this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
            this.objEligibilityDetailsRequest.DiscountId = 0;
            this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
          }
        }

        if (this.isPlaza) {
          if (this.plazaValue != 0) {
            this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
            this.objEligibilityDetailsRequest.MinRange = this.plazaValue.toString();
            this.objEligibilityDetailsRequest.MaxRange = this.plazaValue.toString();
            this.objEligibilityDetailsRequest.Criteria = "PLAZA";
            this.objEligibilityDetailsRequest.CriteriaType = "VALUE";
            this.objEligibilityDetailsRequest.DataType = "VARCHAR";
            this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
            this.objEligibilityDetailsRequest.DiscountId = 0;
            this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
          }
        }
        if (this.isLanes) {
          if (this.laneValue != 0) {
            this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
            this.objEligibilityDetailsRequest.MinRange = this.laneValue.toString();
            this.objEligibilityDetailsRequest.MaxRange = this.laneValue.toString();
            this.objEligibilityDetailsRequest.Criteria = "LANE";
            this.objEligibilityDetailsRequest.CriteriaType = "VALUE";
            this.objEligibilityDetailsRequest.DataType = "VARCHAR";
            this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
            this.objEligibilityDetailsRequest.DiscountId = 0;
            this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
          }
        }
      }

    }
    if (this.tripMethod != 0) {
      this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
      this.objEligibilityDetailsRequest.MinRange = this.tripMethod.toString();
      this.objEligibilityDetailsRequest.MaxRange = this.tripMethod.toString();
      this.objEligibilityDetailsRequest.Criteria = "TRIPMETHOD";
      this.objEligibilityDetailsRequest.CriteriaType = "VALUE";
      this.objEligibilityDetailsRequest.DataType = "VARCHAR";
      this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
      this.objEligibilityDetailsRequest.DiscountId = 0;
      this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
    }
    if (this.txnType != 0) {
      this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
      this.objEligibilityDetailsRequest.MinRange = this.txnType.toString();
      this.objEligibilityDetailsRequest.MaxRange = this.txnType.toString();
      this.objEligibilityDetailsRequest.Criteria = "FACILITYTYPE";
      this.objEligibilityDetailsRequest.CriteriaType = "VALUE";
      this.objEligibilityDetailsRequest.DataType = "VARCHAR";
      this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
      this.objEligibilityDetailsRequest.DiscountId = 0;
      this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
    }
    if (this.rangeValue != 0) {
      let criteria = new List<ICriteriasResponse>(this.criteriasRange);
      this.seletedcriteria = criteria.Where(x => x.Criteria == this.rangeCriteria).ToArray();
      if (this.seletedcriteria[0].Criteria == "TRANSACTION DATE") {
        this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
        let startdate = this.discntForm.controls["startDateFactor"].value;
        let enddate = this.discntForm.controls["endDateFactor"].value;
        //this.objEligibilityDetailsRequest.MinRange = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day).toLocaleString();
        // this.objEligibilityDetailsRequest.MaxRange = new Date(enddate.date.year, enddate.date.month - 1, enddate.date.day).toLocaleString();
        this.objEligibilityDetailsRequest.MinRange = startdate.date.year + "," + startdate.date.month + "," + startdate.date.day + "," + 0 + "," + 0 + "," + 0
        this.objEligibilityDetailsRequest.MaxRange = enddate.date.year + "," + enddate.date.month + "," + enddate.date.day + "," + 0 + "," + 0 + "," + 0;
        this.objEligibilityDetailsRequest.Criteria = this.seletedcriteria[0].Criteria;
        this.objEligibilityDetailsRequest.CriteriaType = this.seletedcriteria[0].CriteriaType;
        this.objEligibilityDetailsRequest.DataType = this.seletedcriteria[0].DataType;
        this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
        this.objEligibilityDetailsRequest.DiscountId = 0;
        this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
      }
      else if (this.seletedcriteria[0].Criteria == "TRANSACTION DATE TIME") {

        let startDate = this.discntForm.controls['startDateFactor'].value;
        console.log("endDate" + this.discntForm.controls['endDateFactor'].value);

        let endDate = this.discntForm.controls['endDateFactor'].value;
        let endTime = new Date(this.discntForm.controls['endTime'].value);
        let startTime = new Date(this.discntForm.controls['startTime'].value);
        console.log("startTime" + startTime);
        console.log("this.startTime" + this.discntForm.controls['startTime'].value);

        this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};
        //this.objEligibilityDetailsRequest.MinRange = this.startDateTimeFactor;
        // this.objEligibilityDetailsRequest.MaxRange = this.endDateTimeFactor;
        this.objEligibilityDetailsRequest.MinRange = startDate.date.year + "," + startDate.date.month + "," + startDate.date.day + "," + startTime.getHours() + "," + startTime.getMinutes() + "," + startTime.getSeconds();
        this.objEligibilityDetailsRequest.MaxRange = endDate.date.year + "," + endDate.date.month + "," + endDate.date.day + "," + endTime.getHours() + "," + endTime.getMinutes() + "," + endTime.getSeconds();
        this.objEligibilityDetailsRequest.Criteria = this.seletedcriteria[0].Criteria;
        this.objEligibilityDetailsRequest.CriteriaType = this.seletedcriteria[0].CriteriaType;
        this.objEligibilityDetailsRequest.DataType = this.seletedcriteria[0].DataType;
        this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
        this.objEligibilityDetailsRequest.DiscountId = 0;
        this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
      }
      else if (this.seletedcriteria[0].Criteria == "TRANSACTION TIME") {
        console.log("time" + this.discntForm.controls["endTime"].value);
        let startTimeGlobal = new Date(this.discntForm.controls["startTime"].value);
        let enddTimeGlobal = new Date(this.discntForm.controls["endTime"].value);
        this.objEligibilityDetailsRequest = <IEligibilityDetailsRequest>{};

        this.objEligibilityDetailsRequest.MinRange = new Date(2017, 7, 1, startTimeGlobal.getHours(), startTimeGlobal.getMinutes(), startTimeGlobal.getSeconds(), 0).toLocaleString();
        this.objEligibilityDetailsRequest.MaxRange = new Date(2017, 7, 1, enddTimeGlobal.getHours(), enddTimeGlobal.getMinutes(), enddTimeGlobal.getSeconds(), 0).toLocaleString();
        this.objEligibilityDetailsRequest.Criteria = this.seletedcriteria[0].Criteria;
        this.objEligibilityDetailsRequest.CriteriaType = this.seletedcriteria[0].CriteriaType;
        this.objEligibilityDetailsRequest.DataType = this.seletedcriteria[0].DataType;
        this.objEligibilityDetailsRequest.UpdateUser = this.sessionContextResponse.userName;
        this.objEligibilityDetailsRequest.DiscountId = 0;
        this.objReqDiscount.EligibilityDetails.push(this.objEligibilityDetailsRequest);
      }
    }
    this.objReqDiscount.DiscountDetails.push(this.objDiscountDetailsRequest);
  }

  setDate(startingDate, endingDate): void {
    // Set today date using the patchValue function
    let startedDate = new Date(startingDate);
    this.discntForm.patchValue({
      startDateFactor: {
        date: {
          year: startedDate.getFullYear(),
          month: startedDate.getMonth() + 1,
          day: startedDate.getDate()
        }
      },
    });
    let endedDate = new Date(endingDate);
    this.discntForm.patchValue({
      endDateFactor: {
        date: {
          year: endedDate.getFullYear(),
          month: endedDate.getMonth() + 1,
          day: endedDate.getDate()
        }
      },
    });
    this.startTime = startedDate;
    this.endTime = endedDate;
  }
}
