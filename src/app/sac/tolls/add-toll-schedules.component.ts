import { IMyDrpOptions } from 'mydaterangepicker';
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { IUserEvents } from './../../shared/models/userevents';
import { ITollScheduleResponse } from './models/tollschedulesresponse';
import { ITollRatesResponse } from './models/tollratesresponse';
import { ActivatedRoute, Router, Data } from '@angular/router';
import { SessionService } from './../../shared/services/session.service';
import { ITollScheduleRequest } from './models/tollschedulesrequest';
import { IPaging } from './../../shared/models/paging';
import { IUserresponse } from './../../shared/models/userresponse';
import { Actions, ActivitySource, Features, LookupTypeCodes, defaultCulture } from './../../shared/constants';
import { ICommonResponse } from './../../shared/models/commonresponse';
import { CommonService } from './../../shared/services/common.service';
import { TollScheduleService } from './services/tollschedule.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var $: any;
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { IMyDpOptions } from "mydatepicker";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-add-toll-schedules',
  templateUrl: './add-toll-schedules.component.html',
  styleUrls: ['./add-toll-schedules.component.scss']
})
export class AddTollSchedulesComponent implements OnInit {
  showTollTable: boolean;
  vehicleClasses: ITollRatesResponse;
  invalidHolidayDate: boolean;
  invalidDate: boolean;
  endDate: any;
  startDate: any;
  tollScheduleRequestSaveArray: ITollScheduleRequest[];
  msgTitle: string;
  msgDesc: string;
  msgFlag: boolean;
  msgType: string;

  addDisableButton: boolean;
  tollStatus: any;
  exitPlaza: any;
  scheduldeResponse: ITollScheduleResponse[];
  showExitPlaza: boolean;
  exitPlazaTypesObj: any;
  years: any;
  holidayDetails: ITollRatesResponse[];
  faileureMessge: string;
  successMessage: string;
  noScheduleView: boolean;
  tollIntervals: any;
  type: string = 'Save';
  tollRateLaneTypes: ITollRatesResponse[];
  tollId: number;
  tollScheduleRequest: ITollScheduleRequest = <ITollScheduleRequest>{};
  data: any = [];
  disabledDates: any;
  laneDetails: {};
  sessionContextResponse: IUserresponse;
  laneDirs: ICommonResponse[];
  schedules: any;
  showHoliday: boolean;
  scheduleTypeToggle: boolean;
  laneTypes: any;
  plazaTypes: any;
  plazaTypesObj: any;
  minEDate: Date;
  tollScheduleForm: FormGroup;
  minDate: Date;
  transTypes;
  holidayArray;
  errorBlock;
  transTypeMapping;
  timeIntervalArray: any;
  scheduleView: Boolean;
  disablePreview: Boolean;
  holidayWidth: boolean;
  isDisabled: boolean = false;
  previewVisible: boolean;
  selectedYear;
  toDayDate = new Date();
  tollRatesPreviewArray: ITollRatesResponse[];
  // myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
    showClearBtn: false,
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };
  //  myDatePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
  //   showClearBtn: false,
  //   showApplyBtn: false,
  //  showClearDateBtn: false };

  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  }
  constructor(private materialscriptService: MaterialscriptService, private cdr: ChangeDetectorRef, private tollService: TollScheduleService, private router: Router, private datePickerFormatService: DatePickerFormatService, private sessionContext: SessionService, private route: ActivatedRoute, private commonService: CommonService) { }

  ngOnInit() {
    this.getHolidayByYear(new Date().getFullYear());
    this.materialscriptService.material();
    this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
      Actions[Actions.UPDATE], "");
    this.minDate = new Date();
    this.plazaTypesObj = {
      "TOLL": [],
      "PARKING": [],
      "FERRY": [],
      "TRANSIT": []
    }
    this.exitPlazaTypesObj = {
      "TOLL": [],
      "PARKING": [],
      "FERRY": [],
      "TRANSIT": []
    }
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.getTollScheduleHolidays();
    this.getTransactionTypes();
    this.getPlazaDropDown();
    this.tollSchedule();
    this.bindLaneTypes();
    this.bindLaneDirections();
    this.getIntervalTimeLookups();
    this.minEDate = new Date(Date.now());
    this.tollScheduleForm = new FormGroup({
      transcationType: new FormControl('', [Validators.required]),
      scheduleName: new FormControl('', [Validators.required]),
      plaza: new FormControl('', [Validators.required]),
      exitPlaza: new FormControl('', []),
      laneDirection: new FormControl('', [Validators.required]),
      transactionMethod: new FormControl('', [Validators.required]),
      laneType: new FormControl('', [Validators.required]),
      scheduleType: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      holidayDate: new FormControl('', []),
      interval: new FormControl('', []),
    })
    this.route.params.subscribe(params => {
      this.tollId = +params['id'];
      this.tollStatus = params['status'];
      console.log(this.tollStatus)
      if (this.tollId) {
        this.getTollScheduleByHdrId();
        this.disablePreview = true;
        if (this.tollStatus == 'true') {
          this.type = 'Deactivate';
        }
        else {
          this.type = 'Activate';
        }
      }

    });
  }

  getTollScheduleByHdrId() {

    this.tollService.getTollScheduleByHdrId(this.tollId).subscribe(res => {
      this.scheduldeResponse = res;
      let txnMethods = {
        "TAG": "TAG",
        "PLATE": "PLATE"
      }

      let direction = res['EntryLaneDirection'];
      direction = direction.toLowerCase().charAt(0).toUpperCase() + direction.substring(1).toLowerCase();
      if (res) {
        this.isDisabled = true;
        this.previewVisible = true;
        this.transTypeChange(res["TransactionType"]);
        this.tollScheduleForm.patchValue({
          transcationType: res["TransactionType"],
          scheduleName: res['TollScheduleHdrDesc'],
          plaza: res['EntryPlazaCode'],
          laneDirection: direction,
          transactionMethod: txnMethods[res['TxnMethod']],
          laneType: res['EntryLaneType'],
          scheduleType: res['ScheduleType'],
          interval: res['Interval'],
          date: {
            beginDate: {
              year: new Date(res['StartEffectiveDate']).getFullYear(),
              month: new Date(res['StartEffectiveDate']).getMonth() + 1,
              day: new Date(res['StartEffectiveDate']).getDate(),


            }, endDate: {
              year: new Date(res['EndEffectiveDate']).getFullYear(),
              month: new Date(res['EndEffectiveDate']).getMonth() + 1,
              day: new Date(res['EndEffectiveDate']).getDate(),
            }
          }
        });
        this.getTollScheduleDetailsByHdrId(this.tollId);
        this.getTollRatesbyLaneTypeTransaction(res['EntryLaneType'], res['TxnMethod']);
        let interval;
        if (res['Interval'] == 1440) {
          interval = 30;
        }
        else {
          interval = 60;
        }
        this.tollScheduleForm.controls['interval'].setValue(interval);
      }
    })
  }

  getTollScheduleDetailsByHdrId(objTollObjDetails) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TOLLSCHEDULES];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.tollService.getTollRateDetailsByScheduleId(objTollObjDetails, userEvents).subscribe(res => {
      this.tollRatesPreviewArray = res;
      console.log('res', res);
      this.vehicleClasses = this.tollRatesPreviewArray[0];
      this.showTollTable = true;
      if (res) {
        for (let i = 0; i < this.tollRatesPreviewArray.length; i++) {
          this.tollRatesPreviewArray[i].TimeRange = this.tollRatesPreviewArray[i].FromTime.toFixed(2).replace('.', ':') + "-" + this.tollRatesPreviewArray[i].ToTime.toFixed(2).replace('.', ':');

          this.tollRatesPreviewArray[i]['tollRates'] = [];
          this.tollRatesPreviewArray[i]['DicVehicleClass'].forEach(element => {
            let key = 'Class' + element.Code.trim();
            this.tollRatesPreviewArray[i]['tollRates'].push({ code: key, val: element.ThresholdAmount })
          });
        }
      }
    })
    this.materialscriptService.material();
  }

  timeRangeInterval(interval) {
    this.tollService.timeRangeInterval(interval).subscribe(res => {
      this.tollIntervals = res;
    })
  }

  getTollRatesbyLaneTypeTransaction(laneType, transactionMethod) {
    this.tollService.getTollRatesbyLaneTypeTransaction(laneType, transactionMethod).subscribe(res => {
      this.tollRateLaneTypes = res;
    })
  }


  getTransactionTypes() {
    this.tollService.getTransactionTypes().subscribe(res => {
      this.transTypes = res;
    })
  }
  getPlazaDropDown() {
    this.tollService.getAllPlazas().subscribe(res => {
      this.parsePlazaTypes(res);
    })
  }
  parsePlazaTypes(data) {
    data.forEach(element => {
      if (this.plazaTypesObj[element.TransctionTypeInPlaza])
        this.plazaTypesObj[element.TransctionTypeInPlaza].push(element);
      if (this.exitPlazaTypesObj[element.TransctionTypeInPlaza])
        this.exitPlazaTypesObj[element.TransctionTypeInPlaza].push(element);
    });
  }

  transTypeChange(val) {
    this.plazaTypes = this.plazaTypesObj[val];
  }

  tollSchedule() {
    this.commonService.getTollScheduleTypesLookups().subscribe(res => {
      this.schedules = res;

      console.log('s', res)
    })
  }

  bindLaneTypes() {
    let lookuptype = <ICommonResponse>{};
    lookuptype.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.LaneTypes];
    this.commonService.getLookUpByParentLookupTypeCode(lookuptype).subscribe(
      res => {
        this.laneTypes = res;
      });
  }

  bindLaneDirections() {
    let lookuptype = <ICommonResponse>{};
    lookuptype.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.LaneDirections];
    this.commonService.getLookUpByParentLookupTypeCode(lookuptype).subscribe(
      res => {
        this.laneDirs = res;
      });
  }

  scheduleTypeChange(val) {
    if (val != 'NORMAL') {
      this.scheduleTypeToggle = true;
      if (val == "HOLIDAY") {
        this.showHoliday = true;
        this.tollScheduleForm.controls['date'].clearValidators();
        this.tollScheduleForm.controls['date'].setValue("");
        this.tollScheduleForm.controls['date'].updateValueAndValidity();
        this.tollScheduleForm.controls['interval'].clearValidators();
        this.tollScheduleForm.controls['interval'].updateValueAndValidity();
        this.tollScheduleForm.controls['holidayDate'].setValidators([Validators.required]);
        this.tollScheduleForm.controls['holidayDate'].updateValueAndValidity();
      }
      else {
        this.showHoliday = false;
        this.tollScheduleForm.controls['date'].setValue("");
        this.tollScheduleForm.controls['holidayDate'].setValue("");
        this.tollScheduleForm.controls['date'].clearValidators();
        this.tollScheduleForm.controls['date'].updateValueAndValidity();
        this.tollScheduleForm.controls['holidayDate'].clearValidators();
        this.tollScheduleForm.controls['holidayDate'].updateValueAndValidity();
        this.tollScheduleForm.controls['interval'].clearValidators();
        this.tollScheduleForm.controls['interval'].updateValueAndValidity();
      }
    }
    else {
      this.scheduleTypeToggle = false;
      this.tollScheduleForm.controls['date'].setValidators([Validators.required]);
      this.tollScheduleForm.controls['date'].updateValueAndValidity();
      this.tollScheduleForm.controls['interval'].setValidators([Validators.required]);
      this.tollScheduleForm.controls['interval'].updateValueAndValidity();
      this.tollScheduleForm.controls['holidayDate'].clearValidators();
      this.tollScheduleForm.controls['holidayDate'].updateValueAndValidity();
      this.tollScheduleForm.controls['holidayDate'].setValue("");
      this.showHoliday = false
    }
  }

  disableDates() {
    this.disabledDates = [new Date('10/12/2017')];
    let currentYear = new Date().getFullYear();
    let upcomingYear = currentYear + 3;
    for (var i = currentYear; i <= upcomingYear; i++) {
      for (var j = 1; j <= 12; j++) {
        for (var k = 1; k <= 31; k++) {
          if (this.holidayArray.indexOf(new Date(j + '/' + k + '/' + i).getTime()) < 0) {

            this.disabledDates.push({ year: i, month: j, day: k });
          }
        }
      }
    }
    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableDays: this.disabledDates,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false
    };
  }

  addSchedule() {
    if (this.invalidDate) {
      return;
    }
    let interval;
    console.log(this.tollScheduleForm);
    if (this.tollScheduleForm.valid) {
      let laneType = this.tollScheduleForm.controls['laneType'].value;
      let laneDirection = this.tollScheduleForm.controls['laneDirection'].value;
      let scheduleType = this.tollScheduleForm.controls['scheduleType'].value;
      if (scheduleType == 'NORMAL') {
        interval = this.tollScheduleForm.controls['interval'].value;
      }
      else {
        interval = 1440;
      }
      let plazaCode = this.tollScheduleForm.controls['plaza'].value;
      let transactionMethod = this.tollScheduleForm.controls['transactionMethod'].value;
      this.tollService.getLaneDetailsByLaneType(laneType, laneDirection, plazaCode).subscribe(res => {
        if (res) {
          this.scheduleView = true;
          this.noScheduleView = false;
          this.tollService.timeRangeInterval(interval).subscribe(res => {
            this.tollIntervals = res;
            this.tollRatesPreviewArray = [];
            for (let i = 0; i < this.tollIntervals.length; i++) {
              let tollRatesInterval = <ITollRatesResponse>{};
              tollRatesInterval.TimeRange = this.tollIntervals[i];
              this.tollRatesPreviewArray.push(tollRatesInterval);

            }
            this.tollService.getTollRatesbyLaneTypeTransaction(laneType, transactionMethod).subscribe(res => {
              this.tollRateLaneTypes = res;
              if (this.tollRateLaneTypes && this.tollRateLaneTypes.length > 0) {
                this.tollService.getTollRatesById(this.tollRateLaneTypes[0].TollHdrId).subscribe(res1 => {
                  if (res1) {
                    console.log(res1);
                    this.vehicleClasses = res1;
                    this.showTollTable = true;
                    for (let i = 0; i < this.tollRatesPreviewArray.length; i++) {
                      this.tollRatesPreviewArray[i]['tollRates'] = [];
                      this.tollRatesPreviewArray[i].TollHdrId = this.tollRateLaneTypes[0].TollHdrId;
                      this.tollRatesPreviewArray[i].LaneType = res1.LaneType;

                      res1['DicVehicleClass'].forEach(element => {
                        let key = 'Class' + element.Code.trim();
                        this.tollRatesPreviewArray[i]['tollRates'].push({ code: key, val: element.ThresholdAmount })
                      });
                      // this.tollRatesPreviewArray[i].Class2L = res1.Class2L;
                      // this.tollRatesPreviewArray[i].Class2H = res1.Class2H;
                      // this.tollRatesPreviewArray[i].Class3L = res1.Class3L;
                      // this.tollRatesPreviewArray[i].Class3H = res1.Class3H;
                      // this.tollRatesPreviewArray[i].Class4H = res1.Class4H;
                      // this.tollRatesPreviewArray[i].Class5H = res1.Class5H;
                      // this.tollRatesPreviewArray[i].Class6H = res1.Class6H;
                      // this.tollRatesPreviewArray[i].Class7H = res1.Class7H;
                    }


                  }
                });
              } else {
                this.faileureMessge = "No Toll Rates available";
              }
            })
          });
          this.faileureMessge = "";
          this.noScheduleView = false;
        }
        else {
          this.scheduleView = false;
          this.noScheduleView = true;
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "No lanes available for the plaza with the combination of lane type and direction";
          this.msgTitle = '';
          // this.faileureMessge = "No lanes available for the plaza with the combination of lane type and direction";
          this.tollRatesPreviewArray = null;
        }
      });
    }
    else {
      this.validateAllFormFields(this.tollScheduleForm);
    }
  }

  createExitPlaza(val) {
    this.showExitPlaza = false;
    this.plazaTypes.forEach(element => {
      if (element.PlazaCode == val && element.PriceMode != 'P') {
        this.exitPlaza = val;
        this.showExitPlaza = true;
      }
    });
  }

  saveSchedule(type) {
    let normalDate = this.tollScheduleForm.controls['date'].value;

    if (this.invalidDate) {
      return;
    }
    let parsedDate;
    let startEffectiveDate;
    let endEffectiveDate;
    if (normalDate) {
      parsedDate = this.datePickerFormatService.getFormattedDateRange(normalDate);
      let startDate = new Date(parsedDate[0]);
      let endDate = new Date(parsedDate[1]);
      startEffectiveDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      endEffectiveDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
    }
    else {
      startEffectiveDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");;
      endEffectiveDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");;
    }

    this.tollScheduleRequestSaveArray = [];
    let tollScheduleRequestSave: ITollScheduleRequest = <ITollScheduleRequest>{};
    tollScheduleRequestSave.LoginId = this.sessionContextResponse.loginId;
    tollScheduleRequestSave.UserId = this.sessionContextResponse.userId;
    tollScheduleRequestSave.PerformedBy = this.sessionContextResponse.userName;
    tollScheduleRequestSave.ActivitySource = ActivitySource[ActivitySource.Internal];
    tollScheduleRequestSave.EntryPlazaCode = this.tollScheduleForm.controls['plaza'].value;
    tollScheduleRequestSave.EntryLaneDirection = this.tollScheduleForm.controls['laneDirection'].value;
    tollScheduleRequestSave.EntryLaneType = this.tollScheduleForm.controls['laneType'].value;
    tollScheduleRequestSave.TollScheduleHdrDesc = this.tollScheduleForm.controls['scheduleName'].value;
    tollScheduleRequestSave.TransactionType = this.tollScheduleForm.controls['transcationType'].value;
    tollScheduleRequestSave.TxnMehtod = this.tollScheduleForm.controls['transactionMethod'].value;
    tollScheduleRequestSave.ScheduleType = this.tollScheduleForm.controls['scheduleType'].value;
    //tollScheduleRequestSave.PlazaPriceMode = litPlazaPriceMode.Text.ToUpper();
    if ((this.tollScheduleForm.controls['exitPlaza'].value == '') || (this.tollScheduleForm.controls['exitPlaza'].value == null))
      tollScheduleRequestSave.ExitPlazaCode = this.tollScheduleForm.controls['plaza'].value;
    else
      tollScheduleRequestSave.ExitPlazaCode = this.tollScheduleForm.controls['exitPlaza'].value;
    if (type == 'NORMAL' || type == 'HOLIDAY') {
      if (type == 'Save') {
        let tollRangeString: string = "";
        let tollRateIDString: string = "";
        for (let i = 0; i < this.tollRatesPreviewArray.length; i++) {
          tollRateIDString += this.tollRatesPreviewArray[i].TollHdrId + ",";
          tollRangeString += this.tollRatesPreviewArray[i].TimeRange + ",";
        }
        tollScheduleRequestSave.TollRangeString = tollRangeString.replace(/:/g, ".");
        tollScheduleRequestSave.TollRateIdString = tollRateIDString;


        if (type == 'NORMAL') {

          tollScheduleRequestSave.StartEffectiveDate = startEffectiveDate;
          tollScheduleRequestSave.EndEffectiveDate = endEffectiveDate;
          // tollScheduleRequestSave.EndEffectiveDate = this.tollScheduleForm.controls['date'].value[1].AddDays(1).AddMilliseconds(-3);
          tollScheduleRequestSave.Interval = this.tollScheduleForm.controls['interval'].value;
        }
        else {
          tollScheduleRequestSave.StartEffectiveDate = startEffectiveDate;
          tollScheduleRequestSave.EndEffectiveDate = endEffectiveDate;
          tollScheduleRequestSave.Interval = 24;
        }
      }
      else {
        tollScheduleRequestSave.StartEffectiveDate = startEffectiveDate;
        tollScheduleRequestSave.EndEffectiveDate = endEffectiveDate;
        tollScheduleRequestSave.ScheduleType = this.tollScheduleForm.controls['scheduleType'].value;

        if (this.tollStatus == 'false')
          tollScheduleRequestSave.IsActive = true;
        else
          tollScheduleRequestSave.IsActive = false;
        tollScheduleRequestSave.TollScheduleHdrId = this.tollId;
      }
    }
    else {
      if (type == 'Save') {
        let currentDate = new Date();
        if (this.tollScheduleForm.controls['date'].value) {
          tollScheduleRequestSave.StartEffectiveDate = new Date(new Date(parsedDate[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
          this.endDate = (parsedDate[1]).setHours(23, 59, 59, 997);
          tollScheduleRequestSave.EndEffectiveDate = new Date(this.endDate).toLocaleString(defaultCulture).replace(/\u200E/g, "");
          tollScheduleRequestSave.Interval = this.tollScheduleForm.controls['interval'].value;
        } else {
          let date = this.tollScheduleForm.controls['holidayDate'].value
          if (date) {
            debugger;
            let holidayStart = this.datePickerFormatService.getFormattedDate(date.date).setHours(0, 0, 0, 0);
            let holidayEnd = this.datePickerFormatService.getFormattedDate(date.date).setHours(23, 59, 59, 997);

            tollScheduleRequestSave.StartEffectiveDate = new Date(holidayStart).toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
            tollScheduleRequestSave.EndEffectiveDate = new Date(holidayEnd).toLocaleDateString(defaultCulture).replace(/\u200E/g, "");;
            tollScheduleRequestSave.Interval = 24;
          } else {
            tollScheduleRequestSave.StartEffectiveDate = new Date(currentDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
            tollScheduleRequestSave.EndEffectiveDate = new Date();
            tollScheduleRequestSave.EndEffectiveDate.setDate(30);
            tollScheduleRequestSave.EndEffectiveDate.setMonth(11);
            tollScheduleRequestSave.EndEffectiveDate.setFullYear(tollScheduleRequestSave.EndEffectiveDate.getFullYear());
            tollScheduleRequestSave.EndEffectiveDate = new Date(tollScheduleRequestSave.EndEffectiveDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
            tollScheduleRequestSave.Interval = 1440;
          }

        }
        let tollRangeString: string = "";
        let tollRateIDString: string = "";
        for (let i = 0; i < this.tollRatesPreviewArray.length; i++) {
          tollRateIDString += this.tollRatesPreviewArray[i].TollHdrId + ",";
          tollRangeString += this.tollRatesPreviewArray[i].TimeRange + ",";
        }


        tollScheduleRequestSave.TollRangeString = tollRangeString.replace(/:/g, ".");
        tollScheduleRequestSave.TollRateIdString = tollRateIDString;
      }
      else {
        tollScheduleRequestSave.StartEffectiveDate = startEffectiveDate;
        tollScheduleRequestSave.EndEffectiveDate = endEffectiveDate;

        if (this.tollStatus == 'false')
          tollScheduleRequestSave.IsActive = true;
        else
          tollScheduleRequestSave.IsActive = false;
        tollScheduleRequestSave.TollScheduleHdrId = this.tollId;
      }
    }
    this.tollScheduleRequestSaveArray.push(tollScheduleRequestSave);

    if (type == 'Save') {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TOLLSCHEDULES];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      if (!this.invalidDate)
        this.tollService.createTollSchedule(this.tollScheduleRequestSaveArray, userEvents).subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Toll schedule details has been added successfully";
            this.msgTitle = ''
            this.tollRatesPreviewArray = null;
            this.tollScheduleForm.reset();
            this.faileureMessge = "";
            this.tollScheduleForm.controls['date'].clearValidators();
            this.tollScheduleForm.controls['date'].updateValueAndValidity();

          } else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = "Unable to add Toll Schedule";
            this.msgTitle = '';
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
    }
    else if (type == 'Deactivate') {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Are you sure you want to deactivate the toll schedule?";
      this.msgTitle = ''
    }
    else {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Are you sure you want to activate the toll schedule?";
      this.msgTitle = ''
    }
  }




  userAction(event) {
    if (event) {
      if (this.type == 'Deactivate') {
        this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
          Actions[Actions.DELETE], "");

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.TOLLSCHEDULES];
        userEvents.SubFeatureName = "";
        userEvents.ActionName = Actions[Actions.DELETE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.tollService.deleteTollSchedule(this.tollScheduleRequestSaveArray, userEvents).subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Toll schedule details has been deactivated successfully";
            this.msgTitle = ''
            this.tollRatesPreviewArray = null;
            this.tollScheduleForm.reset();
          } else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = "Unable to Deactivate  Toll Schedule";
            this.msgTitle = '';
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
      }
      if (this.type == 'Activate') {
        this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
          Actions[Actions.UPDATE], "");
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.TOLLSCHEDULES];
        userEvents.SubFeatureName = "";
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.tollService.deleteTollSchedule(this.tollScheduleRequestSaveArray, userEvents).subscribe(res => {
          if (res) {
            console.log(res);
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Toll schedule details has been activated successfully";
            this.msgTitle = ''
            this.tollRatesPreviewArray = null;
            this.tollScheduleForm.reset();
          } else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = "Unable to Active Toll Schedule";
            this.msgTitle = '';
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
      }
    }
  }

  setOutputFlag(event) {
    this.msgFlag = event;
  }

  tollRateChanged(rateId: any, index: number) {
    this.tollService.getTollRatesById(rateId).subscribe(res1 => {
      console.log(res1);
      if (res1) {
        this.tollRatesPreviewArray[index]['tollRates'] = [];
        this.tollRatesPreviewArray[index].TollHdrId = rateId;
        res1['DicVehicleClass'].forEach(element => {
          let key = 'Class' + element.Code.trim();
          this.tollRatesPreviewArray[index]['tollRates'].push({ code: key, val: element.ThresholdAmount })
        });
      }
    });
  }

  getTollScheduleHolidays() {
    this.tollService.getTollScheduleHolidays().subscribe(res => {
      this.parseHolidays(res);
    });
  }

  parseHolidays(data) {
    this.holidayArray = []
    data.forEach(element => {
      this.holidayArray.push(new Date(element.HolidayDate).getTime());
      this.disableDates();
    });
  }

  getIntervalTimeLookups() {
    this.commonService.getIntervalTimeLookups().subscribe(res => this.timeIntervalArray = res);
  }
  showHolidayPopUp() {
    debugger
    this.years = [];
    for (var i = 0; i < 3; i++) {
      this.years.push(new Date(Date.now()).getFullYear() + i);
    }
    $('#holidayDetails').modal('show');


  }

  getHolidayByYear(year) {
    this.tollService.getTollScheduleHolidaysbyYear(year).subscribe(res => {
      this.holidayDetails = res;
    })
  }

  resetTolls() {
    this.tollScheduleForm.reset();
    this.materialscriptService.material();
    this.scheduleView = false;
    this.tollRatesPreviewArray = null;
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
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.tollScheduleForm.controls["date"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
  onDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.tollScheduleForm.controls["holidayDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidHolidayDate = true;

      return;
    }
    else
      this.invalidHolidayDate = false;

  }
}
