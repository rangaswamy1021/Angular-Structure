import { DataType, ActivitySource, Features, Actions, defaultCulture } from './../../shared/constants';
import { Component, OnInit } from '@angular/core';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { ConfigurationService } from "./services/configuration.service";
import { IConfigurationRequest } from "./models/configurationsrequest";
import { IConfigurationResponse } from "./models/configurationsresponse";
import { CommonService } from "../../shared/services/common.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IUserEvents } from "../../shared/models/userevents";
import { isDate } from "util";
import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-general-configurations',
  templateUrl: './general-configurations.component.html',
  styleUrls: ['./general-configurations.component.scss']
})
export class GeneralConfigurationsComponent implements OnInit {
  notifications: any;
  isNotification: boolean = false;
  isDefaultMBS: boolean = false;
  ListMBSoptions: any[];
  MBSoptions: any;
  invalidDate: boolean;
  toDayDate: Date = new Date();
  stDate: Date[];
  invalid: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isConfig: boolean = false;
  date: Date;
  patternMessage: string;
  pattern: string;
  regExp: any;
  generalConfigurations: FormGroup;
  isParam: boolean = false;
  countries: any;
  isCountry: boolean = false;
  isSpaces: boolean;
  allowedSpclChar: boolean;
  paramKey: string;
  paramId: number;
  minLength: number;
  maxLength: number;
  dataType: string;
  configType: string;
  startDate: Date;
  description: string;
  paramName: string;
  paramValue: string;
  measurementDescription: string;
  updatePrameterValue: IConfigurationRequest;
  updatePrameterValueList: IConfigurationRequest[] = [];
  confg: any;
  confgData: any;
  sessionContextResponse: IUserresponse;
  objServiceConfigRequest: any;
  objConfigResponse: any;
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    firstDayOfWeek: 'mo', sunHighlight: false,
    height: '34px', width: '260px', inline: false,
    alignSelectorRight: false, indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };
  constructor(private sessionService: SessionService, private router: Router,
    private commonService: CommonService, private configurationService: ConfigurationService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    // this.date = this.minDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");

    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
    this.stDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];



    this.generalConfigurations = new FormGroup({
      'stDate': new FormControl('', [Validators.required]),
      'paraValue': new FormControl('', [Validators.required])
    });

    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.getAllParameters();
    if (!this.commonService.isAllowed(Features[Features.CONFIGURATION], Actions[Actions.VIEW], "")) {
      //error page;

    }
    this.isConfig = !this.commonService.isAllowed(Features[Features.CONFIGURATION], Actions[Actions.UPDATE], "");
  }
  getAllParameters() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CONFIGURATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.objServiceConfigRequest = <any>{};
    this.objServiceConfigRequest.LoginId = this.sessionContextResponse.loginId;
    this.objServiceConfigRequest.UserId = this.sessionContextResponse.userId;
    this.objServiceConfigRequest.PerformedBy = this.sessionContextResponse.userName;
    this.configurationService.GetAllConfigurations(this.objServiceConfigRequest, userEvents).subscribe(res => {
      if (res) {
        this.objConfigResponse = res;
        if (this.objConfigResponse) {
          this.objConfigResponse = this.objConfigResponse.filter(element =>
            element.ConfigurationType !== "DashBoardMonitoring Level Configurations");
        }
      }
    });
  }
  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };
  //General configuration edit begin
  getCountries() {
    this.commonService.getCountries().subscribe(res => {
      this.countries = res;
    });
  }
  getApplicationParameters(strConfig, confDetails: any) {
    $('#update-conf').modal('show');
    this.confg = strConfig;
    this.confgData = confDetails;
    this.measurementDescription = confDetails.MeasurementDescription;
    if (this.measurementDescription.endsWith('Country')) {
      this.isCountry = true;
      this.isParam = false;
      this.isDefaultMBS = false;
      this.isNotification = false;
      this.getCountries();

    }
    else if(this.measurementDescription.endsWith('method')) {
      this.isCountry = false;
      this.isParam = false;
      this.isNotification=true;
      this.isDefaultMBS=false;
      this.getDefaultNotifications();
    }
    //else if (this.measurementDescription.endsWith('MBS')) {
      else if (this.measurementDescription.lastIndexOf('format for MBS')>0) {
      this.isCountry = false;
      this.isParam = false;
      this.isNotification = false;
      this.isDefaultMBS = true;
      this.getMBSOptions();
    }
    else {
      this.isCountry = false;
      this.isParam = true;
      this.isNotification = false;
      this.isDefaultMBS = false;


    }
    //this.generalConfigurations.controls['stDate'].setValidators([]);
    //this.generalConfigurations.clearValidators()
    this.generalConfigurations.reset();
    let date = new Date();
    date = new Date(confDetails.StartEffectiveDate);
    this.generalConfigurations.patchValue({
      stDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.generalConfigurations.patchValue({
      // stDate: confDetails.StartEffectiveDate,
      paraValue: confDetails.ParameterValue
    });
    this.paramName = confDetails.ParameterName;
    this.description = confDetails.ParameterDescription;
    this.configType = strConfig;
    this.maxLength = confDetails.Maxlength;
    this.minLength = confDetails.MinLength;
    this.paramId = confDetails.ParameterId;
    this.paramKey = confDetails.ParamaterKey
    this.isSpaces = confDetails.isSpaceAllowed;
    this.allowedSpclChar = confDetails.AllowedSplChars;
    this.regExp = confDetails.RegularExp;
    this.dataType = DataType[confDetails.DataType];
    if (this.dataType.toUpperCase() == "INT") {
      this.pattern = "[0-9]*";
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required,]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required, Validators.pattern(this.pattern)]);
      this.patternMessage = "Only numbers allowed";
    }
    if (this.dataType.toUpperCase() == "MONEY") {
      this.pattern = "^-?[0-9]+(\.{1}[0-9]{1,2})?$";
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required,]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required, Validators.pattern(this.pattern), Validators.maxLength(9)]);
      this.patternMessage = "Enter valid money format";
    }
    if (this.dataType.toUpperCase() == "BIT") {
      this.pattern = "^[0-1]{1}$";
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required,]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required, Validators.pattern(this.pattern)]);
      this.patternMessage = "Parameter value must be 0 or 1";
    }
    if (this.dataType.toUpperCase() == "DECIMAL") {
      this.pattern = "^[0-9]{1,3}+(\.{1}[0-9]{1,2})?$";
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required,]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required, Validators.pattern(this.pattern)]);
      this.patternMessage = "Invalid percentage";
    }
    if (this.dataType.toUpperCase() == "NVARCHAR" && this.measurementDescription.endsWith('Path')) {
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required]);
    }
    if (this.dataType.toUpperCase() == "NVARCHAR" && this.measurementDescription.endsWith('Country')) {
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required]);
    }
    if (this.dataType.toUpperCase() == "NVARCHAR" && this.measurementDescription.endsWith('method')) {
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required]);
    }
    if (this.dataType.toUpperCase() == "NVARCHAR" && !(this.measurementDescription.endsWith('Path')) && !(this.measurementDescription.endsWith('Country'))) {
      this.pattern = "^[a-zA-Z]+$";
      // this.generalConfigurations = new FormGroup({
      //   'stDate': new FormControl('', [Validators.required]),
      //   'paraValue': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.pattern)]))
      // });
      this.generalConfigurations.controls['stDate'].setValidators([Validators.required,]);
      this.generalConfigurations.controls['paraValue'].setValidators([Validators.required, Validators.pattern(this.pattern)]);
      this.patternMessage = "Only alphabets allowed";
    }
    let b = this;
    setTimeout(function () {
      b.materialscriptService.material();
    }, 100);
  }
  getDefaultNotifications() {
    this.configurationService.getDefaultNotification().subscribe(res => {
      this.notifications = res;
    });
  }
  updateApplicationParameterKey() {
    if (this.generalConfigurations.valid) {
      this.updatePrameterValueList = [];
      this.updatePrameterValue = <IConfigurationRequest>{};
      this.updatePrameterValue.LoginId = this.sessionContextResponse.loginId;
      this.updatePrameterValue.UserId = this.sessionContextResponse.userId;
      this.updatePrameterValue.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
      this.updatePrameterValue.ParameterValue = this.generalConfigurations.controls['paraValue'].value;
      this.updatePrameterValue.ConfigType = this.configType;
      //this.updatePrameterValue.StartEffectiveDate = this.generalConfigurations.controls['stDate'].value.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //new change
      let dateval = this.generalConfigurations.controls['stDate'].value;
      dateval = dateval.date;
      let start = new Date(dateval.year, (dateval.month) - 1, dateval.day);
      this.updatePrameterValue.StartEffectiveDate = start;
      //new change end
      this.updatePrameterValue.PerformedBy = this.sessionContextResponse.userName;
      this.updatePrameterValue.ParameterId = this.paramId;
      this.updatePrameterValue.ParameterName = this.paramName;
      this.updatePrameterValue.ParamaterKey = this.paramKey;
      this.updatePrameterValue.DataType = DataType[this.dataType];
      let date = new Date();
      let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      //let newDate: Date = new Date(Date.now(), 0, 0, 0, 0);
      if (new Date(this.updatePrameterValue.StartEffectiveDate) >= newDate) {
        // this.updatePrameterValue.StartEffectiveDate = this.generalConfigurations.controls['stDate'].value.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        //this.updatePrameterValue.StartEffectiveDate = this.generalConfigurations.controls['stDate'].value.date.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        let date = new Date();
        let time = date.getTime();
        this.updatePrameterValue.StartEffectiveDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        this.updatePrameterValue.StartEffectiveDate = start.toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.updatePrameterValue.Maxlength = this.maxLength;
        this.updatePrameterValue.MinLength = this.minLength;
        if (this.minLength.toString() != null && this.minLength != undefined && this.maxLength.toString() != null && this.maxLength != undefined) {
          this.updatePrameterValue.Maxlength = this.maxLength;
          this.updatePrameterValue.MinLength = this.minLength;
        }
        if (this.paramKey == 'MaxPostpaidBalPCtoWO' || this.paramKey == 'MinPrepaidBalPCtoWO' || this.paramKey == 'MinBalCOtoCOWO') {
          this.updatePrameterValue.Maxlength = this.minLength;
          this.updatePrameterValue.MinLength = this.maxLength;
        }
        // if (this.isSpaceAllowed.toString() != null &&this.isSpaceAllowed != undefined && this.AllowedSplChars.toString() != null && this.AllowedSplChars != undefined) {
        //   this.updatePrameterValue.isSpaceAllowed = this.isSpaces;
        //   this.updatePrameterValue.AllowedSplChars = this.allowedSpclChar;
        // }
        this.updatePrameterValue.isSpaceAllowed = this.isSpaces;
        this.updatePrameterValue.AllowedSplChars = this.allowedSpclChar;

        this.updatePrameterValueList.push(this.updatePrameterValue);
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CONFIGURATION];
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.configurationService.updateApplicationParameterKey(this.updatePrameterValueList, userEvents).subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgTitle = '';
            this.msgDesc = 'Application Parameter has been updated successfully';
            this.confgData.StartEffectiveDate = this.updatePrameterValue.StartEffectiveDate;
            this.confgData.ParameterValue = this.updatePrameterValue.ParameterValue;
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText.toString();
        }
        )
      }
      // else {
      //   this.errorBlock = true;
      //   this.errorMessage = "Parameter Value must be between " + this.minLength + " and " + this.maxLength;
      // }

      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Start Effective Date should be greater than or equal to Today Date';
      }
    }
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  reset() {
    //  this.getApplicationParameters(this.confg, this.confgData);
    let date = new Date();
    date = new Date(this.confgData.StartEffectiveDate);
    this.generalConfigurations.patchValue({
      stDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.generalConfigurations.patchValue({
      // stDate: this.confgData.StartEffectiveDate,
      paraValue: this.confgData.ParameterValue
    });
  }

  //General configuration edit end
  /* Date picker code */
  minDate = new Date();
  maxDate = new Date(2038, 9, 15);
  _bsValue: Date = new Date();
  get bsValue(): Date {
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }

  // _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  // get bsRangeValue(): any {
  //   return this._bsRangeValue;
  // }

  // set bsRangeValue(v: any) {
  //   this._bsRangeValue = v;
  // }

  // log(v: any) { console.log(v); }
  validateDateFormat(inputDate: any) {

    let strDateRangeArray = inputDate.slice(",");
    if (strDateRangeArray.length < 2) {
      this.invalid = true;
      const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
      this.stDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
      return;
    }
    else {
      if ((strDateRangeArray[0] != null) || (strDateRangeArray[1] != null)) {
        if (!isDate(new Date(strDateRangeArray[0])) || !isDate(new Date(strDateRangeArray[1]))) {
          this.invalid = true;
          const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
          this.stDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
          return;
        }
      }
      else {
        this.invalid = true;
      }
    }
  }
  onDateFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
  validateDateMessages(event, val) {
    if (val[0] && val[1]) {
      if (isDate(new Date(val[0])) && isDate(new Date(val[1]))) {
        this.invalid = false;
      }
    }
    else {
      this.invalid = true;
    }
  }

  getMBSOptions() {
    this.MBSoptions = Array<ListMBSoptions>();
    this.MBSoptions.push(new ListMBSoptions('PDF', 'PDF'));
    this.MBSoptions.push(new ListMBSoptions('HTML', 'HTML'));
    this.MBSoptions.push(new ListMBSoptions('WORD', 'WORD'));
    this.MBSoptions.push(new ListMBSoptions('EXCEL', 'EXCEL'));

  }



}


export class ListMBSoptions {
  value: string;
  label: string;
  constructor(id: string, name: string) {
    this.value = id;
    this.label = name;
  }
}

