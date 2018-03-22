import { Component, OnInit, Renderer, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { IVehicleResponse, ICommonResponse, ICommon, IVehicleClass } from './models/vehicleresponse';
import { ISearchVehicle, IVehicleRequest } from './models/vehiclecrequest';
import { VehicleService } from './services/vehicle.services';
import { List } from 'linqts';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonService } from '../shared/services/common.service';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from '../shared/constants';
import { IUserresponse } from '../shared/models/userresponse';
import { SessionService } from '../shared/services/session.service';
import { IBlocklistresponse } from '../shared/models/blocklistmessageresponse';
import { ICustomerResponse } from '../shared/models/customerresponse';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { CustomDateTimeFormatPipe } from '../shared/pipes/convert-datetime.pipe';
import { IUserEvents } from '../shared/models/userevents';
import { MaterialscriptService } from "../shared/materialscript.service";
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";

declare var $: any;
@Component({
  selector: 'app-add-vehicle',
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.css']
})
export class AddVehicleComponent implements OnInit {
  isNonRevenueCategory: string;
  invalidDate: boolean;
  dateError: boolean;
  startingDate: any;
  endDate: any;
  countries: any[];
  states: ICommonResponse[];
  common: ICommon = <ICommon>{};
  vehicleClass: IVehicleClass[];
  vehicleAttributes: IVehicleAttribute[];
  vehicleModel: any[];
  vehicleColors: ICommonResponse[];
  contarctualType: any[];
  years: any[];
  startDate: string;
  accountIdContext: number;
  vehicleMake: string[];
  accountCreatedDate: Date;

  blockListDetails: IBlocklistresponse[] = [];

  // Form group 
  addVehicleForm: FormGroup;
  vehicle: IVehicleRequest = <IVehicleRequest>{};
  //Create status message 
  message: string;
  status: boolean;

  //Input from other module 
  UserInputs: IaddVehicleInputs = <IaddVehicleInputs>{};
  @Input() isCreateCustomerAccount;
  @Input() customerAccountId;


  // Customer Context
  objICustomerContextResponse: ICustomerContextResponse;

  //User log in details 
  sessionContextResponse: IUserresponse;

  @Output() createClicked: EventEmitter<string> =
  new EventEmitter<string>();

  @Output() cancelClicked: EventEmitter<string> =
  new EventEmitter<string>();

  disableButton: boolean = false;
  userEvents: IUserEvents;
  maxVehEndEffDate: number;
  currentDate: Date;
  isStartDateEmpty: boolean = false;
  isEndDateEmpty: boolean = false;

  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    //  disableSince:{year: this.minDate.getFullYear(), month:this.minDate.getMonth()+1 , day: this.minDate.getDate()},
    // disableUntil:{year: this.maxDate.getFullYear(), month:this.maxDate.getMonth()+1 , day: this.maxDate.getDate()},
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };
  myDatePickerOptionEndDate: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };
  constructor(private vehicleService: VehicleService, public renderer: Renderer, private router: Router, private commonService: CommonService,
    private customerContextService: CustomerContextService
    , private sessionService: SessionService
    , private customerAccountsService: CustomerAccountsService, private materialscriptService: MaterialscriptService
    , private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    if (this.isCreateCustomerAccount) {
      this.accountIdContext = this.customerAccountId;
      this.UserInputs.AccountId = this.accountIdContext;
      this.UserInputs.UserId = this.accountIdContext;
      this.bindFormControl();
    }
    else {
      this.customerContextService.currentContext
        .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
        );
      if (this.objICustomerContextResponse == undefined) {
        this.accountIdContext = 0;
      }
      // if (this.objICustomerContextResponse.ParentId > 0)
      //   this.UserInputs.AccountId = this.objICustomerContextResponse.ParentId;
      // else
      this.UserInputs.AccountId = this.objICustomerContextResponse.AccountId;

      this.UserInputs.UserId = this.objICustomerContextResponse.AccountId;
      this.disableButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.CREATE], "");
      this.isStartDateEmpty = false;
    }
    this.customerAccountsService.getRevenueCategorybyAccountId(this.UserInputs.AccountId).subscribe(res => {
      if (res != null) {
        this.isNonRevenueCategory = res.RevenueCategory;       
      }
    })


    this.UserInputs.LoginId = this.sessionContextResponse.loginId;
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.getCountry();
    this.getConfigKey();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor("VehicleColors");
    this.getYear();
    this.getContractualType();
    this.populateCustomerDetails();
    this.bindFormControl();
    this.getCountryBystate('USA');
    this.currentDate = new Date();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  bindFormControl() {
    this.addVehicleForm = new FormGroup({
      'pltNumber': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]),
      'pltClass': new FormControl('', [Validators.required]),
      'pltYear': new FormControl(''),
      'pltMake': new FormControl(''),
      'pltModel': new FormControl(''),
      'pltColor': new FormControl(''),
      'pltCountry': new FormControl('USA', [Validators.required]),
      'pltState': new FormControl('', [Validators.required]),
      'startDate': new FormControl(''),
      'startTime': new FormControl(''),
      'endDate': new FormControl(''),
      'endTime': new FormControl(''),
      'pltContractual': new FormControl(''),
      'pltIsTempplate': new FormControl('')
    });
  }
  getCountry() {
    this.commonService.getCountries().subscribe(res => this.countries = res);

  }
  getCountryBystate(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    console.log(countryCode);
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.states = res;
      console.log(res);
    });
  }

  getVehicleClass() {
    this.vehicleService.getVehicleClass().subscribe(res => {
      this.vehicleClass = res;
      console.log(res);
    });
  }

  getVehicleMake() {
    this.vehicleService.getVehicleAttributes().subscribe(res => {
      this.vehicleAttributes = res;
      let vehicleList = new List<IVehicleAttribute>(this.newFunction());
      this.vehicleMake = vehicleList.Select(x => x.Make).Distinct().ToArray();
      console.log(vehicleList);
      console.log(res);
    });
  }

  getModel(make: string) {
    let vehicleList = new List<IVehicleAttribute>(this.newFunction());
    this.vehicleModel = vehicleList.Where(x => x.Make == make).Select(x => x.Model).ToArray();
    console.log(this.vehicleModel);
  }

  private newFunction(): IVehicleAttribute[] {
    return this.vehicleAttributes;
  }

  getVehicleColor(lookupTypeCode: string) {
    this.common.LookUpTypeCode = "VehicleColors";
    console.log(lookupTypeCode);
    this.vehicleService.getVehicleColor(this.common).subscribe(res => {
      this.vehicleColors = res;
      console.log(res);
    });
  }

  getYear() {
    this.vehicleService.getYears().subscribe(res => {
      this.years = res;
      console.log(res);
    });
  }

  getContractualType() {
    this.vehicleService.getContractualType().subscribe(res => {
      this.contarctualType = res;
      console.log(res);
    })
  }

  createVehiclePopup() {
    this.createVehicle(false);
  }
  createVehicleClick() {
    this.createVehicle(true);
  }
  createVehicle(checkBlockList: boolean) {
    if (this.addVehicleForm.valid) {
      if (!this.invalidDate && !this.dateError) {
        if (this.addVehicleForm.value.startDate) {
          let startdate = this.addVehicleForm.controls['startDate'].value;

          let startTime = this.addVehicleForm.controls['startTime'].value;
          console.log(startTime);
          if (startTime != "" && startTime != null) {
            this.startingDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
          }
          else {
            this.startingDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day).toLocaleString(defaultCulture).replace(/\u200E/g, "");
          }

        }
        if (this.addVehicleForm.value.endDate) {
          let endDate = this.addVehicleForm.controls['endDate'].value;
          let endTime = this.addVehicleForm.controls['endTime'].value;
          if (endTime != "" && endTime != null)
            this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
          else
            this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g, "");
          console.log(endTime, this.endDate);
        }
        console.log("this.addVehicleForm.value.startDate" + this.startDate);

        if (!(!this.addVehicleForm.value.startDate && !this.addVehicleForm.value.endDate)) {
          if (!this.addVehicleForm.value.startDate) { this.isStartDateEmpty = true; return }
          if (!this.addVehicleForm.value.endDate) { this.isEndDateEmpty = true; return; }
        }
        if (!this.addVehicleForm.value.startDate) {
          this.vehicle.StartEffectiveDate = this.currentDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
        }
        else {
          this.vehicle.StartEffectiveDate = this.startingDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");; //this.addVehicleForm.value.startDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        }
        if (!this.addVehicleForm.value.endDate) {
          this.vehicle.EndEffectiveDate = new Date(parseInt(this.currentDate.getFullYear().toString()) + parseInt(this.maxVehEndEffDate.toString()), this.currentDate.getMonth(), this.currentDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        }
        else {
          this.vehicle.EndEffectiveDate = this.endDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");; //this.addVehicleForm.value.endDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        }
        console.log(this.vehicle.EndEffectiveDate);
        if (new Date(this.accountCreatedDate) > new Date(this.vehicle.StartEffectiveDate)) {
          let accountCreateDate = new CustomDateTimeFormatPipe().transform(this.accountCreatedDate.toString());
          this.createClicked.emit("2," + "Start effective date time should be greater than account created date time." + " ( " + accountCreateDate + " ) ");
          return;
        }
        if (new Date(this.vehicle.EndEffectiveDate) < new Date(this.vehicle.StartEffectiveDate)) {
          this.createClicked.emit("2," + "End date should be greater than start date.");
          return;
        }

        this.vehicle.AccountId = this.UserInputs.AccountId;
        this.vehicle.VehicleClass = this.addVehicleForm.value.pltClass;
        this.vehicle.VehicleStatus = "Active";
        this.vehicle.UserName = this.UserInputs.UserName;
        if (this.addVehicleForm.value.pltContractual == '')
          this.vehicle.ContractType = "Owned";
        else
          this.vehicle.ContractType = this.addVehicleForm.value.pltContractual;
        this.vehicle.VehicleNumber = this.addVehicleForm.value.pltNumber;
        this.vehicle.VehicleNumber = this.vehicle.VehicleNumber.toUpperCase();
        this.vehicle.ActivitySource = ActivitySource.Internal;
        this.vehicle.Subsystem = SubSystem.CSC;
        this.vehicle.LoginId = this.UserInputs.LoginId;
        this.vehicle.UserId = this.UserInputs.UserId;
        this.vehicle.Country = this.addVehicleForm.value.pltCountry;;
        this.vehicle.State = this.addVehicleForm.value.pltState;
        this.vehicle.Make = this.addVehicleForm.value.pltMake;
        this.vehicle.Model = this.addVehicleForm.value.pltModel;
        this.vehicle.Year = this.addVehicleForm.value.pltYear;
        this.vehicle.Color = this.addVehicleForm.value.pltColor;
        this.vehicle.IsTemporaryNumber = this.addVehicleForm.value.pltIsTempplate;
        this.vehicle.CheckBlockList = checkBlockList;
        this.vehicle.CurrentDateTime = new Date().toLocaleString();
        this.setUserActionObject();
        if (this.isCreateCustomerAccount) {
          if (this.isNonRevenueCategory.toUpperCase() == "NONREVENUE")
            this.vehicle.IsExempted = true;
          else this.vehicle.IsExempted = false;
        }
        else {
          this.vehicle.IsExempted = false;
        }
        this.vehicleService.createVehicle(this.vehicle, this.userEvents).subscribe(res => {
          if (res) {
            // this.message = "Vehcile Created Successfully";
            this.createClicked.emit("1," + "Vehicle Created Successfully");
            this.addVehicleForm.reset();
            this.setValues();
          }
        },
          res => {
            if (res._body) {
              this.blockListDetails = res.json();
              $('#blocklist-dialog').modal('show');
            }
            else {
              // this.message = res.statusText;
              this.createClicked.emit("2," + res.statusText);
            }
          }
        );
      }
      else {
        this.createClicked.emit("2," + "Selected Date is Invalid");
      }
    }
    else {
      this.validateAllFormFields(this.addVehicleForm);
    }
  }

  setValues() {
    this.addVehicleForm.controls["pltClass"].setValue("");
    this.addVehicleForm.controls["pltCountry"].setValue("USA");
    this.addVehicleForm.controls["pltMake"].setValue("");
    this.addVehicleForm.controls["pltModel"].setValue("");
    this.addVehicleForm.controls["pltYear"].setValue("");
    this.addVehicleForm.controls["pltColor"].setValue("");
    this.addVehicleForm.controls["pltState"].setValue("");
    this.addVehicleForm.controls["pltContractual"].setValue("");
    this.addVehicleForm.controls["startDate"].setValue("");
    this.addVehicleForm.controls["endDate"].setValue("");
    this.isStartDateEmpty = false;
  }

  resetForm() {
    this.addVehicleForm.reset();
    this.setValues();
    this.getCountryBystate('USA');
    // this.getCountry();
    // this.getVehicleClass();
    // this.getVehicleMake();
    // this.getVehicleColor("VehicleColors");
    // this.getYear();
    // this.getContractualType();
    this.createClicked.emit("3," + "");
    return false;
  }

  cancleclick() {
    this.status = false;
    this.isStartDateEmpty = false;
    this.cancelClicked.emit(status);
    return false;
  }

  populateCustomerDetails() {
    var customerResponse: ICustomerResponse;
    // getting customer details
    this.customerAccountsService.getAccountCreatedDateTime(this.UserInputs.AccountId).subscribe(res => {
      this.accountCreatedDate = res;
      if (res) {
        console.log("res" + res);
        console.log(this.accountCreatedDate + "this.accountCreatedDate");

      }
    });
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  setUserActionObject() {
    if (!this.isCreateCustomerAccount) {
      this.userEvents = <IUserEvents>{};
      this.userEvents.FeatureName = Features[Features.VEHICLES];
      this.userEvents.ActionName = Actions[Actions.CREATE];
      this.userEvents.PageName = this.router.url;
      this.userEvents.CustomerId = this.UserInputs.AccountId;
      this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      this.userEvents.UserName = this.sessionContextResponse.userName;
      this.userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    else this.userEvents = null;
  }


  getConfigKey() {
    this.commonService.getApplicationParameterValueByParameterKey("MaxVehEndEffDate").subscribe(
      res => {
        this.maxVehEndEffDate = res;
      });
  }
  onInputFieldRangeChanged(event: IMyInputFieldChanged) {

    if (event.value != "" && event.valid) {
      let minDate = new Date(event.value);
      this.myDatePickerOptionEndDate = {
        disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },
      }

    }

    if (event.value != "" && !event.valid)
      this.dateError = true;
    else
      this.dateError = false;

  }
  onInputFieldEndDateChanged(event) {
    console.log(event);
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
    }
    else
      this.invalidDate = false;

  }

}
export interface IVehicleAttribute {
  VehicleClass: string
  Make: string
  Model: string
  Color: string
  ModelDescription: string
}

export interface IaddVehicleInputs {
  UserName: string
  LoginId: number
  UserId: number
  AccountId: number
}
