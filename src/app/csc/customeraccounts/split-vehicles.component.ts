import { Component, OnInit, ViewChild, ElementRef, Renderer, ChangeDetectorRef } from '@angular/core';
import { VehicleService } from '../../vehicles/services/vehicle.services';
import { ISearchVehicle, IVehicleRequest } from '../../vehicles/models/vehiclecrequest';
import { IVehicleResponse, IVehicleClass } from '../../vehicles/models/vehicleresponse';
import { ICommonResponse, ICommon } from '../../shared/models/commonresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../../shared/services/common.service';
import { List } from 'linqts/dist/linq';
import { IVehicleAttribute } from '../../vehicles/add-vehicle.component';
import { ISplitRequest } from './models/splitrequest';
import { SplitCustomerService } from './services/splitcustomer.service';
import { Router } from '@angular/router';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IBlocklistRequest } from "../../shared/models/blocklistmessagerequest";
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { Observable } from "rxjs/Observable";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, SubFeatures, Actions, defaultCulture } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-split-vehicles',
  templateUrl: './split-vehicles.component.html',
  styleUrls: ['./split-vehicles.component.scss']
})
export class SplitVehiclesComponent implements OnInit {
  dateStart: any;
  invalidStartDate: boolean = false;
  invalidEndDate: boolean = false;
  enddate: any;
  endTime: any;
  startTime: any;
  startdate: any;
  endingDate: string;
  todayDate = new Date();
  myStartDatePickerOptions: ICalOptions = {
    disableUntil: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() - 1 },
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };

  myEndDatePickerOptions: ICalOptions = {
    disableUntil: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() - 1 },
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };
  // myDatePickerOptions: IMyDpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };
  startingDate: string;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  customerId: number;
  parentVehicle: IVehicleResponse[] = [];
  childVehicle: IVehicleResponse[] = [];
  pcurrentPage = 1;
  pdataLength: number;
  ppageItemNumber: number = 10;
  pendItemNumber: number;
  pstartItemNumber: number = 1;
  ccurrentPage = 1;
  cdataLength: number;
  cpageItemNumber: number = 10;
  cendItemNumber: number;
  cstartItemNumber: number = 1;
  selectedArray = [];
  selectedChildArray = [];
  showVehicleBlock: boolean = false;
  isEditClicked: boolean;
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
  addVehicleForm: FormGroup;
  planName: string;
  fee: string;
  discount: string;
  isTagRequired: boolean;
  isTagMessage: string;
  txnAmount: number;
  feeAmount: string;
  splitCustomer: ISplitRequest
  addedVehicles: IVehicleResponse[] = [];
  plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
  isCheckBlockList: boolean;
  blockListDetails: IBlocklistresponse[] = [];
  maxVehicleEndDate: number;
  constructor(private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private vehicleService: VehicleService, private commonService: CommonService, public renderer: Renderer,
    private splitService: SplitCustomerService, private sessionService: SessionService, private router: Router, private customerContextService: CustomerContextService, private customerAccountsService: CustomerAccountsService, private materialscriptService: MaterialscriptService) {
    this.loadVechileForm();
  }

  ngOnInit() {
    this.materialscriptService.material();
    //this.customerId = 10258205//10258326//
    this.customerContextService.currentContext.subscribe(context => {
      if (context != null)
        this.customerId = context.AccountId;
      else {
        const link = ['/csc/customerAccounts/split-account/'];
        this.router.navigate(link);
      }
    })
    this.splitCustomer = this.splitService.splitContext();
    if (this.splitCustomer == null) {
      const link = ['/csc/customerAccounts/split-account/'];
      this.router.navigate(link);
    }
    const parentVehicleReq: ISearchVehicle = <ISearchVehicle>{}
    parentVehicleReq.accountId = this.customerId;
    parentVehicleReq.vehicleNumber = '';
    parentVehicleReq.SortColumn = 'VEHICLENUMBER';
    parentVehicleReq.SortDirection = true;
    parentVehicleReq.PageNumber = 1;
    parentVehicleReq.PageSize = 10000;

    // Checking Previleges 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VEHICLEINFORMATION];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;
    this.vehicleService.getVehicles(parentVehicleReq).subscribe(
      res => {
        if (res) {
          this.parentVehicle = res;
          if (this.parentVehicle.length >= 1)
            this.showVehicleBlock = false;
        }
        //this.paginateparentdata();
        this.populateData();
      });
    Observable.forkJoin(
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList),
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxVehEndEffDate)
    ).subscribe(response => {
      this.isCheckBlockList = <any>response[0];
      this.maxVehicleEndDate = <any>response[1];
    });
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(
      res => this.isCheckBlockList = res
    );
    this.customerAccountsService.getAllPlansWithFees().subscribe(res => {
      this.plansResponse = res
      var plan = this.plansResponse.filter(x => x.PlanId == this.splitCustomer.CustAttrib.PlanId)[0];
      this.planName = plan.Name;
      this.isTagRequired = plan.IsTagRequired;
      this.fee = plan.FeeDesc;
      //this.feeAmount = plan.TotalFee;
      this.discount = plan.DiscountDesc;
      this.txnAmount = this.splitCustomer.totAmount;
      if (this.isTagRequired) { this.isTagMessage = "(Transponder Required)"; } else { this.isTagMessage = "(Vehicle Required)"; }
    });
    this.getCountry();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor('VehicleColors');
    this.getYear();
    this.getContractualType();
    this.getCountryBystate('USA');
  }

  populateData() {
    if (this.splitCustomer.Vehicle != null && this.splitCustomer.Vehicle.length > 0) {
      this.childVehicle = this.splitCustomer.Vehicle;
      this.childVehicle.forEach(x => {
        if (this.parentVehicle.filter(y => y.VehicleNumber == x.VehicleNumber).length > 0)
          this.parentVehicle = this.parentVehicle.filter(y => y.VehicleNumber != x.VehicleNumber);
        else
          this.addedVehicles.push(x);
      })
      // this.paginateparentdata();
      // this.paginateChilddata();
    }
  }

  onVehSplitChange(value) {
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
    if (value == "EXIST") {
      this.showVehicleBlock = false;
    }
    else {
      this.showVehicleBlock = true;
      this.isEditClicked = false;
      this.addVehicleForm.reset();
      this.loadVechileForm();
    } this.materialscriptService.material();
  }
  loadVechileForm() {
    this.addVehicleForm = new FormGroup({
      'pltNumber': new FormControl({ value: '', disabled: this.isEditClicked }, this.isEditClicked ? [] : [Validators.required, Validators.minLength(1), Validators.maxLength(10)]),
      'pltClass': new FormControl('', [Validators.required]),
      'pltYear': new FormControl(''),
      'pltMake': new FormControl(''),
      'pltModel': new FormControl(''),
      'pltColor': new FormControl(''),
      'pltCountry': new FormControl('USA', [Validators.required]),
      'pltState': new FormControl('', [Validators.required]),
      'startDate': new FormControl(''),
      'endDate': new FormControl(''),
      'pltContractual': new FormControl(''),
      'pltIsTempplate': new FormControl(''),
      'startTime': new FormControl(''),
      'endTime': new FormControl(''),
    });
  }
  getCountry() {
    this.commonService.getCountries().subscribe(res => this.countries = res);

  }
  getCountryBystate(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.states = res;
    });
  }

  getVehicleClass() {
    this.vehicleService.getVehicleClass().subscribe(res => {
      this.vehicleClass = res;
    });
  }

  getVehicleMake() {
    this.vehicleService.getVehicleAttributes().subscribe(res => {
      this.vehicleAttributes = res;
      const vehicleList = new List<IVehicleAttribute>(this.newFunction());
      this.vehicleMake = vehicleList.Select(x => x.Make).Distinct().ToArray();
    });
  }

  getModel(make: string) {
    const vehicleList = new List<IVehicleAttribute>(this.newFunction());
    this.vehicleModel = vehicleList.Where(x => x.Make == make).Select(x => x.Model).ToArray();
  }

  private newFunction(): IVehicleAttribute[] {
    return this.vehicleAttributes;
  }

  getVehicleColor(lookupTypeCode: string) {
    this.common.LookUpTypeCode = 'VehicleColors';
    this.vehicleService.getVehicleColor(this.common).subscribe(res => {
      this.vehicleColors = res;
    });
  }

  getYear() {
    this.vehicleService.getYears().subscribe(res => {
      this.years = res;
    });
  }

  getContractualType() {
    this.vehicleService.getContractualType().subscribe(res => {
      this.contarctualType = res;
    })
  }

  transferVehicle(checked, vehicle: IVehicleResponse) {
    if (checked) {
      this.selectedArray.push(vehicle);
    }
    else {
      this.selectedArray = this.selectedArray.filter(x => x.VehicleNumber != vehicle.VehicleNumber)
    }
  }

  transferMoveVehicle(checked, vehicle: IVehicleResponse) {
    if (checked) {
      this.selectedChildArray.push(vehicle);
    }
    else {
      this.selectedChildArray = this.selectedChildArray.filter(x => x.VehicleNumber != vehicle.VehicleNumber)
    }
  }

  resetForm() {
    this.addVehicleForm.reset();
    return false;
  }

  cancleclick() {
    this.showVehicleBlock = false;
    //this.addVehicleForm.reset();
    return false;
  }

  addVehicle(checkBlockList: boolean) {
    if ((this.invalidStartDate) || (this.invalidEndDate)) {
      return;
    }

    this.blockListDetails = [];
    if (this.addVehicleForm.valid) {
      if (this.isCheckBlockList && checkBlockList) {
        var blockListRequest = <IBlocklistRequest>{};
        blockListRequest.VehicleNumber = this.addVehicleForm.value.pltNumber;

        this.commonService.isExistBlockList(blockListRequest).subscribe(res => {
          if (res) {
            this.blockListDetails = res;
            $('#blocklist-dialog').modal('show');
          }
          else {
            this.addorEditVehicle();
          }
        })
      }
      else
        this.addorEditVehicle();
    }
    else {
      this.validateAllFormFields(this.addVehicleForm);
    }
  }

  addorEditVehicle() {
    if ((this.invalidStartDate) || (this.invalidEndDate)) {
      return;
    }
    const Vehicle: IVehicleResponse = <IVehicleResponse>{};
    if (this.addVehicleForm.controls['startDate'].value) {
      this.startdate = this.addVehicleForm.controls['startDate'].value;
      this.startTime = this.addVehicleForm.controls['startTime'].value;
      if (this.startTime == "" || this.startTime == null) {
        this.startingDate = new Date(this.startdate.date.year, this.startdate.date.month - 1, this.startdate.date.day, 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        Vehicle.StartEffectiveDate = new Date(this.startingDate);

      }
      else {
        this.startingDate = new Date(this.startdate.date.year, this.startdate.date.month - 1, this.startdate.date.day, this.startTime.getHours(), this.startTime.getMinutes(), this.startTime.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        Vehicle.StartEffectiveDate = new Date(this.startingDate);

      }
    }
    if (this.addVehicleForm.controls['endDate'].value) {
      this.enddate = this.addVehicleForm.controls['endDate'].value;
      this.endTime = this.addVehicleForm.controls['endTime'].value;
      if (this.endTime == "" || this.endTime == null) {
        this.endingDate = new Date(this.enddate.date.year, this.enddate.date.month - 1, this.enddate.date.day, 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        Vehicle.EndEffectiveDate = new Date(this.endingDate);
      } else {
        this.endingDate = new Date(this.enddate.date.year, this.enddate.date.month - 1, this.enddate.date.day, this.endTime.getHours(), this.endTime.getMinutes(), this.endTime.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        Vehicle.EndEffectiveDate = new Date(this.endingDate);
      }
    }
    // if ((this.addVehicleForm.controls['startDate'].value == '') || (this.addVehicleForm.controls['startDate'].value == undefined) || (this.addVehicleForm.controls['startDate'].value == null)) {
    // let StartDate = new Date();
    // this.startdate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    // //this.startdate = new Date();
    // this.startingDate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    // Vehicle.StartEffectiveDate = new Date(this.startingDate);
    // }
    // if ((this.addVehicleForm.controls['endDate'].value == '') || (this.addVehicleForm.controls['endDate'].value == undefined) || (this.addVehicleForm.controls['endDate'].value == null)) {
    // let EndDate = new Date();
    // this.enddate = new Date(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    // this.endingDate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    // Vehicle.EndEffectiveDate = new Date(this.endingDate);
    // }
    // if (this.startingDate != '' && this.endingDate < this.startingDate) {
    // this.msgFlag = true;
    // this.msgType = 'error';
    // this.msgDesc = "End effective date time should be greater than Start effective date time";
    // return;
    // }
    // if (this.endingDate != '' && this.startdate <= new Date()) {
    // this.msgFlag = true;
    // this.msgType = 'error';
    // this.msgDesc = "Start effective date time should be greater than today date time";
    // return;
    // }
    if ((this.addVehicleForm.controls['startDate'].value == '') || (this.addVehicleForm.controls['startDate'].value == undefined) || (this.addVehicleForm.controls['startDate'].value == null)) {
      let StartDate = new Date();
      // this.startTime = this.addVehicleForm.controls['startTime'].value;
      // if (this.startTime == "" || this.startTime == null) {
      //   this.startingDate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), StartDate.getHours(), StartDate.getMinutes(), StartDate.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //   Vehicle.StartEffectiveDate = new Date(this.startingDate);
      // } else 
      // this.startdate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(),0,0,0,0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //this.startdate = new Date();

      this.startingDate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), StartDate.getHours(), StartDate.getMinutes(), StartDate.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      Vehicle.StartEffectiveDate = new Date(this.startingDate);

      //  let StartDate = new Date();
      //  this.startingDate = new Date(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), StartDate.getHours(), StartDate.getMinutes(), StartDate.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //  Vehicle.StartEffectiveDate = new Date(this.startingDate);
    }
    if ((this.addVehicleForm.controls['endDate'].value == '') || (this.addVehicleForm.controls['endDate'].value == undefined) || (this.addVehicleForm.controls['endDate'].value == null)) {
      let EndDate = new Date();
      // this.endTime = this.addVehicleForm.controls['endTime'].value;
      // if (this.endTime == "" || this.endTime == null) {
      //   this.enddate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");

      //   this.endingDate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //   Vehicle.EndEffectiveDate = new Date(this.endingDate);
      // } else 

      // this.enddate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), this.endTime.getHours(), this.endTime.getMinutes(), this.endTime.getSeconds(), 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");

      this.endingDate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      Vehicle.EndEffectiveDate = new Date(this.endingDate);


      //  let EndDate = new Date();
      //  this.enddate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //  this.endingDate = new Date(parseInt(EndDate.getFullYear().toString()) + parseInt(this.maxVehicleEndDate.toString()), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 997).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      //  Vehicle.EndEffectiveDate = new Date(this.endingDate);
    }
    if (this.startingDate != '' && Vehicle.EndEffectiveDate < Vehicle.StartEffectiveDate) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "End effective date time should be greater than Start effective date time";
      return;
    }
    if (this.endingDate != '' && Vehicle.StartEffectiveDate < this.todayDate) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Start effective date time should be greater than today date time";
      return;
    }

    Vehicle.VehicleClass = this.addVehicleForm.controls["pltClass"].value;
    Vehicle.VehicleStatus = 'Active';
    Vehicle.ContractType = this.addVehicleForm.controls["pltContractual"].value == '' ? 'OWNED' : this.addVehicleForm.controls["pltContractual"].value;;
    Vehicle.VehicleNumber = this.addVehicleForm.controls["pltNumber"].value;
    if (Vehicle.VehicleNumber) {
      Vehicle.VehicleNumber = Vehicle.VehicleNumber.toUpperCase();
    }
    Vehicle.Country = this.addVehicleForm.controls["pltCountry"].value;
    Vehicle.State = this.addVehicleForm.controls["pltState"].value;
    Vehicle.Make = this.addVehicleForm.controls["pltMake"].value;
    Vehicle.Model = this.addVehicleForm.controls["pltModel"].value;
    Vehicle.Year = this.addVehicleForm.controls["pltYear"].value;
    Vehicle.Color = this.addVehicleForm.controls["pltColor"].value;
    Vehicle.IsTemporaryNumber = this.addVehicleForm.controls["pltIsTempplate"].value;
    if (this.childVehicle.filter(x => x.VehicleNumber == Vehicle.VehicleNumber).length > 0) {
      this.childVehicle = this.childVehicle.filter(x => x.VehicleNumber != Vehicle.VehicleNumber)
      this.childVehicle.push(Vehicle);
    }
    else {
      this.childVehicle.push(Vehicle);
    }
    this.addVehicleForm.reset();
    this.showVehicleBlock = false;
    this.addedVehicles.push(Vehicle);
  }

  onEditClicked(vehicle: IVehicleResponse) {
    this.isEditClicked = true;
    this.showVehicleBlock = true;
    this.loadVechileForm();
    this.addVehicleForm.controls['pltNumber'].setValue(vehicle.VehicleNumber);
    this.addVehicleForm.controls['pltClass'].setValue(vehicle.VehicleClass);
    this.addVehicleForm.controls['pltYear'].setValue(vehicle.Year);
    this.addVehicleForm.controls['pltMake'].setValue(vehicle.Make);
    this.getModel(vehicle.Make);

    // this.addVehicleForm.controls['startDate'].setValue(this.startdate);
    // this.addVehicleForm.controls['endDate'].setValue(this.enddate);

    this.startTime = vehicle.StartEffectiveDate;
    this.endTime = vehicle.EndEffectiveDate;

    this.startdate = new Date(vehicle.StartEffectiveDate);
    this.addVehicleForm.patchValue({
      startDate: {
        date: {
          year: this.startdate.getFullYear(),
          month: this.startdate.getMonth() + 1,
          day: this.startdate.getDate(),
        }
      }
    });
    this.enddate = new Date(vehicle.EndEffectiveDate);
    this.addVehicleForm.patchValue({
      endDate: {
        date: {
          year: this.enddate.getFullYear(),
          month: this.enddate.getMonth() + 1,
          day: this.enddate.getDate(),
        }
      }
    });

    //this.addVehicleForm.controls['startTime'].setValue(this.startTime);
    // this.addVehicleForm.controls['endTime'].setValue(this.endTime);
    this.addVehicleForm.controls['pltModel'].setValue(vehicle.Model);
    this.addVehicleForm.controls['pltColor'].setValue(vehicle.Color);
    this.addVehicleForm.controls['pltCountry'].setValue(vehicle.Country);
    this.getCountryBystate(vehicle.Country);
    this.addVehicleForm.controls['pltState'].setValue(vehicle.State);
    // this.addVehicleForm.controls['ContractType'].setValue(vehicle.ContractType);
    this.addVehicleForm.controls['pltContractual'].setValue(vehicle.ContractType);
    //this.addVehicleForm.controls['IsTemporaryNumber'].setValue(vehicle.IsTemporaryNumber);
    this.addVehicleForm.controls['pltIsTempplate'].setValue(vehicle.IsTemporaryNumber);
  }


  onPrevious() {
    const link = ['/csc/customeraccounts/split-plan-selection/'];
    this.router.navigate(link);
  }

  movetoChild() {
    if (this.parentVehicle.length - this.selectedArray.length == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Source customer need to have at least one vehicle';
      return;
    }
    if (this.selectedArray.length == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select atleast one vehicle';
      return;
    }
    for (let i = 0; i < this.selectedArray.length; i++) {
      this.childVehicle.push(this.selectedArray[i]);
      this.parentVehicle = this.parentVehicle.filter(x => x.VehicleId !== this.selectedArray[i].VehicleId);
    }
    // this.paginateparentdata();
    // this.paginateChilddata();
    this.selectedArray = [];
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = 'Vehicle(s) moved to new customer successfully';
    return;
  }

  moveVehiclesChild() {
    if (this.selectedChildArray.length == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Select atleast one vehicle';
      return;
    }
    for (let i = 0; i < this.selectedChildArray.length; i++) {
      if (this.addedVehicles.filter(y => y.VehicleNumber == this.selectedChildArray[i].VehicleNumber).length > 0) {
        this.addedVehicles = this.addedVehicles.filter(y => y.VehicleNumber != this.selectedChildArray[i].VehicleNumber);
      }
      else {
        this.parentVehicle.push(this.selectedChildArray[i]);
      }
      this.childVehicle = this.childVehicle.filter(x => x.VehicleId !== this.selectedChildArray[i].VehicleId);
    }
    // this.paginateparentdata();
    // this.paginateChilddata();
    this.selectedChildArray = [];
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = 'Vehicle(s) has been deleted successfully';
  }

  onSubmit() {
    console.log(this.childVehicle);
    if (this.childVehicle.length >= 1) {
      this.splitCustomer.Vehicle = <IVehicleResponse[]>{};
      this.splitCustomer.Vehicle = this.childVehicle;
      this.splitService.changeResponse(this.splitCustomer);
    }
    else {
      // if plan not require vehicle redirect else show error message
      if (!this.splitCustomer.CustAttrib.IsTagRequired) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = 'Vehicle(s) has required for selected plan ' + this.splitCustomer.CustAttrib.PlanDescription;
        return false;
      }
    }
    const link = ['/csc/customeraccounts/split-payment/'];
    this.router.navigate(link);
  }


  onCancel() {
    const link = ['/csc/customeraccounts/split-account/'];
    this.router.navigate(link);
    // var splitReq = <ISplitRequest>{}
    // this.splitService.changeResponse(splitReq);
  }


  parentpageChanged(event) {
    this.pcurrentPage = event;
    this.pstartItemNumber = (((this.pcurrentPage) - 1) * this.ppageItemNumber) + 1;
    this.pendItemNumber = ((this.pcurrentPage) * this.ppageItemNumber);
    if (this.pendItemNumber > this.parentVehicle.length)
      this.pendItemNumber = this.parentVehicle.length;
  }

  childpageChanged(event) {
    this.ccurrentPage = event;
    this.cstartItemNumber = (((this.ccurrentPage) - 1) * this.cpageItemNumber) + 1;
    this.cendItemNumber = ((this.ccurrentPage) * this.cpageItemNumber);
    if (this.cendItemNumber > this.childVehicle.length)
      this.cendItemNumber = this.childVehicle.length;
  }


  paginateparentdata() {
    this.pdataLength = this.parentVehicle.length;
    if (this.pdataLength < this.ppageItemNumber) {
      this.pendItemNumber = this.pdataLength;
    }
    else {
      this.pendItemNumber = this.ppageItemNumber;
    }
  }

  paginateChilddata() {
    this.cdataLength = this.childVehicle.length;
    if (this.cdataLength < this.cpageItemNumber) {
      this.cendItemNumber = this.cdataLength;
    }
    else {
      this.cendItemNumber = this.cpageItemNumber;
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  validateAllFormFields(formGroup: FormGroup) {
    console.log("sdfsdfsd"); //{1}
    Object.keys(formGroup.controls).forEach(controlName => { //{2}
      const control = formGroup.get(controlName); //{3}
      if (control instanceof FormControl) { //{4}
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) { //{5}
        this.validateAllFormFields(control); //{6}
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChangedEndDate(event: IMyInputFieldChanged) {



    //let date = this.addVehicleForm.controls["endDate"].value;

    if (!event.valid && event.value != "") {
      this.invalidEndDate = true;



      return;
    }
    else
      this.invalidEndDate = false;

  }
  // onDateRangeFieldChangedStartDate(event: IMyInputFieldChanged) {
  //   this.dateStart = this.addVehicleForm.controls["startDate"].value;
  //   if (this.dateStart != null && this.dateStart != "") {
  //     let dmy = this.dateStart;
  //     this.myEndDatePickerOptions = {
  //       disableUntil: { year: dmy.getFullYear(), month: dmy.getMonth() + 1, day: dmy.getDate() - 1 },
  //       dateFormat: 'mm/dd/yyyy',
  //       firstDayOfWeek: 'mo',
  //       sunHighlight: false,
  //       height: '34px',
  //       width: '260px',
  //       inline: false,
  //       alignSelectorRight: false,
  //       indicateInvalidDate: true,
  //       showClearBtn: false,
  //       showApplyBtn: false,
  //       showClearDateBtn: false
  //     };
  //   }
  //   else {
  //     //todayDate = new Date();
  //     this.myEndDatePickerOptions = {
  //       disableUntil: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() - 1 },
  //       dateFormat: 'mm/dd/yyyy',
  //       firstDayOfWeek: 'mo',
  //       sunHighlight: false,
  //       height: '34px',
  //       width: '260px',
  //       inline: false,
  //       alignSelectorRight: false,
  //       indicateInvalidDate: true,
  //       showClearBtn: false,
  //       showApplyBtn: false,
  //       showClearDateBtn: false
  //     };
  //   }

  //   //console.log(this.dateStart.date);
  //   if (!event.valid && event.value != "") {
  //     this.invalidStartDate = true;

  //     return;
  //   }
  //   else
  //     this.invalidStartDate = false;

  // }

  onDateRangeFieldChangedStartDate(event: IMyInputFieldChanged) {


    this.dateStart = event.value;
    if (this.dateStart != null && this.dateStart != "") {
      let dmy = new Date(this.dateStart);
      this.myEndDatePickerOptions = {
        disableUntil: { year: dmy.getFullYear(), month: dmy.getMonth() + 1, day: dmy.getDate() - 1 },
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo',
        sunHighlight: false,
        height: '34px',
        width: '260px',
        inline: false,
        alignSelectorRight: false,
        indicateInvalidDate: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
      };
    }
    else {
      //todayDate = new Date();
      this.myEndDatePickerOptions = {
        disableUntil: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() - 1 },
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo',
        sunHighlight: false,
        height: '34px',
        width: '260px',
        inline: false,
        alignSelectorRight: false,
        indicateInvalidDate: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
      };
    }

    //console.log(this.dateStart.date);
    if (!event.valid && event.value != "") {
      this.invalidStartDate = true;

      return;
    }
    else
      this.invalidStartDate = false;

  }
}