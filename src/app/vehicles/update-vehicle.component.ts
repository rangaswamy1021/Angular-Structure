
import { Component, OnInit, Renderer, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { IVehicleResponse, ICommonResponse, ICommon, IVehicleClass } from './models/vehicleresponse';
import { ISearchVehicle, IVehicleRequest } from './models/vehiclecrequest';
import { VehicleService } from './services/vehicle.services';
import { List } from 'linqts'
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from '../shared/constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../shared/services/common.service';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { SessionService } from '../shared/services/session.service';
import { IUserresponse } from '../shared/models/userresponse';
import { ICustomerResponse } from '../shared/models/customerresponse';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { CustomDateTimeFormatPipe } from '../shared/pipes/convert-datetime.pipe';
import { IUserEvents } from '../shared/models/userevents';
import { ICalOptions } from "../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydatepicker";

@Component({
  selector: 'app-update-vehicle',
  templateUrl: './update-vehicle.component.html',
  styleUrls: ['./update-vehicle.component.css']
})

export class UpdateVehicleComponent implements OnInit {
  disableisNoneRevenue: boolean=true;
  tagSerialNum: string;
  tagRevenueType: boolean;
  count: any;
  endingDate: Date;
  startingDate: Date;
  startTime: any;
  endTime: any;
  invalidDate: boolean;
  dateError: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  countries: any[];
  states: ICommonResponse[];
  common: ICommon = <ICommon>{};
  vehicleClass: IVehicleClass[];
  vehicleAttributes: IVehicleAttribute[];
  vehicleModel: any[];
  vehicleColors: ICommonResponse[];
  contarctualType: any[];
  years: any[];
  vehicleMake: string[];
  maxVehEndEffDate: number;

  vehicleResponse: IVehicleResponse;
  vehicleResponseNgModel: IVehicleResponse = <IVehicleResponse>{};
  yearNg: string;
  vehicle: IVehicleRequest = <IVehicleRequest>{};
  message: string;
  // Form group 
  updateVehicleForm: FormGroup;

  UserInputs: IaddVehicleInputs = <IaddVehicleInputs>{};
  temp: string;
  // Customer Context
  objICustomerContextResponse: ICustomerContextResponse;

  //User log in details 
  sessionContextResponse: IUserresponse

  startDate: Date;
  endDate: Date;
  accountCreatedDate: Date;
  vehicleStatus: string;
  buttonText: string = "Update";
  isActivate: boolean = false;


  @Input() inputVehicleID: number;
  @Input() isCreateCustomerAccount: number
  @Input() customerAccountId: number

  @Output() updateClicked: EventEmitter<string> =
  new EventEmitter<string>();

  @Output() updateCancelClicked: EventEmitter<boolean> =
  new EventEmitter<boolean>();

  disableButton: boolean = false;
  userEvents: IUserEvents;

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
  constructor(private vehicleService: VehicleService, private route: ActivatedRoute, private router: Router, private commonService: CommonService,
    private customerContextService: CustomerContextService
    , private sessionService: SessionService
    , private customerAccountsService: CustomerAccountsService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.getCountry();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor("VehicleColors");
    this.getYear();
    this.getContractualType();
    this.bindVehicleDetails();
    this.bindFormControl();
  }

  ngOnInit() {
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    // this.customerContextService.currentContext
    //   .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
    //   );
    // if (this.objICustomerContextResponse == undefined) {
    //   // Go to advance search if no customer context
    //   let link = ['csc/search/advanced'];
    //   this.router.navigate(link);
    //   return;
    // }
    // else {
    //   console.log(this.objICustomerContextResponse.AccountId);
    //   this.UserInputs.LoginId = this.sessionContextResponse.loginId;
    //   this.UserInputs.UserId = this.objICustomerContextResponse.AccountId;
    //   this.UserInputs.UserName = this.sessionContextResponse.userName;
    //   this.UserInputs.AccountId = this.objICustomerContextResponse.AccountId;
    // }

    if (this.isCreateCustomerAccount) {
      this.UserInputs.AccountId = this.customerAccountId;
      this.UserInputs.UserId = this.customerAccountId;;
    }
    else {
      this.customerContextService.currentContext
        .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
        );
      if (this.objICustomerContextResponse == undefined) {
        this.UserInputs.AccountId = 0;
      }
      //   if (this.objICustomerContextResponse.ParentId > 0)
      //   this.UserInputs.AccountId = this.objICustomerContextResponse.ParentId;
      // else
      this.UserInputs.AccountId = this.objICustomerContextResponse.AccountId;
      this.UserInputs.UserId = this.objICustomerContextResponse.AccountId;
      this.disableButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.UPDATE], "");
    }
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.UserInputs.LoginId = this.sessionContextResponse.loginId;

    //let id = +this.route.snapshot.params['id'];
    this.bindVehicleDetails();
    this.getCountry();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor("VehicleColors");
    this.getYear();
    this.getContractualType();
    this.populateCustomerDetails();
    this.getConfigKey();

    this.bindFormControl();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  getCountry() {
    this.commonService.getCountries().subscribe(res => this.countries = res);
  }
  getStateByCountry(countryCode: string) {
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
  getConfigKey() {
    this.commonService.getApplicationParameterValueByParameterKey("MaxVehEndEffDate").subscribe(
      res => {
        this.maxVehEndEffDate = res;
      });
  }
  getVehicleMake() {
    this.vehicleService.getVehicleAttributes().subscribe(res => {
      this.vehicleAttributes = res;
      let vehicleList = new List<IVehicleAttribute>(this.newFunction());
      this.vehicleMake = vehicleList.Select(x => x.Make).Distinct().ToArray();
      console.log('vehicleMake' + this.vehicleMake);
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

  // checkVehicleTagCount() {
  //   let id = this.inputVehicleID;
  //   this.vehicleService.getVehicleAssociatedTagCount(id.toString()).subscribe(res => {
  //     console.log("res", res);
  //     this.count = res;
  //     if (this.count !== undefined) {
  //       if (this.count == 1 && this.tagRevenueType != this.vehicleResponseNgModel.IsExempted) {
  //         this.updateClicked.emit("2," + "The count greater than 1");
  //       }
  //     }
  //   })
  // }

  // update() {
  //   if (this.tagSerialNum != '') {
  //     this.checkVehicleTagCount();
  //   }
  // }

  updateVehicle() {
    let currentDate = new Date();
    if (this.updateVehicleForm.valid) {
      if (!this.invalidDate && !this.dateError) {
        if (this.updateVehicleForm.value.startDate) {
          let startdate = this.updateVehicleForm.controls['startDate'].value;

          let startTime = new Date(this.updateVehicleForm.controls['startTime'].value);
          console.log(startTime);
          if (startTime != null) {
            this.startingDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), 0);
          }
          else {
            this.startingDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day);
          }

        }
        else
          this.startingDate = null;
        if (this.updateVehicleForm.value.endDate) {
          let endDate = this.updateVehicleForm.controls['endDate'].value;
          let endTime = new Date(this.updateVehicleForm.controls['endTime'].value);
          console.log(endTime);
          if (endTime != null)
            this.endingDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), 0);
          else
            //  this.endingDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, 23, 59, 59, 997);
            this.endingDate = new Date(parseInt(currentDate.getFullYear().toString()) + parseInt(this.maxVehEndEffDate.toString()), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 997);
          console.log(endTime, this.endDate);
        }
        else
          this.endingDate = new Date(parseInt(currentDate.getFullYear().toString()) + parseInt(this.maxVehEndEffDate.toString()), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 997);;
        console.log(this.vehicleStatus);
        if (this.vehicleStatus == "Active") {
          if (this.endingDate < this.startingDate) {
            this.updateClicked.emit("2," + "End date should be greater than start date.");
            return;
          }
        }
        if (new Date(this.accountCreatedDate) > this.startingDate) {
          let accountCreateDate = new CustomDateTimeFormatPipe().transform(this.accountCreatedDate.toString());
          this.updateClicked.emit("2," + "Start effective date time should be greater than account created date time." + " ( " + accountCreateDate + " ) ");
          return;
        }
        // if (this.tagSerialNum != '') {
        //   let id = this.inputVehicleID;
        //   this.vehicleService.getVehicleAssociatedTagCount(id.toString()).subscribe(res => {
        //     console.log("res", res);
        //     this.count = res;
        //   })
        //   if (this.count == 1 && this.tagRevenueType != this.vehicleResponseNgModel.IsExempted) {
        //     this.updateClicked.emit("2," + "The count greater than 1");
        //      return;
        //   }
        // }
        this.vehicle.AccountId = this.UserInputs.AccountId;
        this.vehicle.VehicleNumber = this.vehicleResponseNgModel.VehicleNumber;
        this.vehicle.StartEffectiveDate = this.startingDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");//this.updateVehicleForm.value.startDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.vehicle.EndEffectiveDate = this.endingDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");//this.updateVehicleForm.value.endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
        let newDate: Date = new Date(Date.now());
        if (new Date(this.vehicle.EndEffectiveDate) > newDate) {
          this.vehicle.VehicleClass = this.updateVehicleForm.value.pltClass;
          this.vehicle.VehicleStatus = "Active";
          this.vehicle.UserName = this.UserInputs.UserName;
          if (this.updateVehicleForm.value.pltContractual == '')
            this.vehicle.ContractType = "Owned";
          else this.vehicle.ContractType = this.updateVehicleForm.value.pltContractual;

          this.vehicle.ActivitySource = ActivitySource.Internal;
          this.vehicle.Subsystem = SubSystem.CSC;// need to place thise as inputs 
          this.vehicle.LoginId = this.UserInputs.LoginId;
          this.vehicle.UserId = this.UserInputs.UserId;
          this.vehicle.Country = this.updateVehicleForm.value.pltCountry;;
          this.vehicle.State = this.updateVehicleForm.value.pltState;
          this.vehicle.Make = this.updateVehicleForm.value.pltMake;
          this.vehicle.Model = this.updateVehicleForm.value.pltModel;
          this.vehicle.Year = this.updateVehicleForm.value.pltYear;
          this.vehicle.Color = this.updateVehicleForm.value.pltColor;
          this.vehicle.VehicleId = this.vehicleResponse.VehicleId;
          this.vehicle.CurrentDateTime=currentDate.toLocaleString();
          if (this.vehicleStatus == "Active") {
            this.vehicle.Source = "ManageUpdate";
            this.vehicle.IsExempted = this.updateVehicleForm.value.pltIsExempt;
          }
          else if (this.vehicleStatus == "Inactive") {
            this.vehicle.Source = "ManageActivate";
            this.vehicle.IsExempted = this.vehicleResponseNgModel.IsExempted;
          }
          console.log("this.updateVehicleForm.value.pltIsTempplate" + this.updateVehicleForm.value.pltIsTempplate);
          if (this.updateVehicleForm.value.pltIsTempplate == this.vehicleResponseNgModel.IsTemporaryNumber)
            this.vehicle.IsTemporaryNumber = this.vehicleResponseNgModel.IsTemporaryNumber;
          else
            this.vehicle.IsTemporaryNumber = this.updateVehicleForm.value.pltIsTempplate;

          // console.log("this.updateVehicleForm.value.pltIsExempt" + this.updateVehicleForm.value.pltIsExempt);

          

          this.setUserActionObject();
          // new code 


          // if (this.tagSerialNum != '') {
          //   // this.checkVehicleTagCount();
          //   let id = this.inputVehicleID;
          //   this.vehicleService.getVehicleAssociatedTagCount(id.toString()).subscribe(res => {
          //     console.log("res", res);
          //     this.count = res;
          //     if (this.count !== undefined) {
          //       if (this.count == 1 && this.tagRevenueType != this.vehicleResponseNgModel.IsExempted) {
          //         this.disableisNoneRevenue = true;
          //         this.updateClicked.emit("2," + "! You cannot change Vehicle type to" + this.vehicleResponseNgModel.IsExempted + "if Tag is" + this.tagRevenueType);
          //       } else {
          //         this.disableisNoneRevenue = false;
          //         this.vehicleService.updateVehicle(this.vehicle, this.userEvents).subscribe(res => {
          //           if (res) {
          //             // this.message = "Vehcile Updated Successfully";
          //             //this.updateVehicleForm.reset();
          //             this.updateClicked.emit("1," + "Vehicle Updated Successfully");
          //           }
          //           else {
          //             this.updateClicked.emit("2," + "Error while Updating Vehicle");
          //             //this.message = "Error while Updating Vehcile";
          //           }
          //         },
          //           res => {
          //             //  this.message = res.statusText;
          //             this.updateClicked.emit("2," + res.statusText);
          //           }
          //         );
          //       }
          //     }
          //   })
          // }
          // else {
          //   this.disableisNoneRevenue = false;
          //   this.vehicleService.updateVehicle(this.vehicle, this.userEvents).subscribe(res => {
          //     if (res) {
          //       // this.message = "Vehcile Updated Successfully";
          //       //this.updateVehicleForm.reset();
          //       this.updateClicked.emit("1," + "Vehicle Updated Successfully");
          //     }
          //     else {
          //       this.updateClicked.emit("2," + "Error while Updating Vehicle");
          //       //this.message = "Error while Updating Vehcile";
          //     }
          //   },
          //     res => {
          //       //  this.message = res.statusText;
          //       this.updateClicked.emit("2," + res.statusText);
          //     }
          //   );
          // }
            this.vehicleService.updateVehicle(this.vehicle, this.userEvents).subscribe(res => {
              if (res) {
                // this.message = "Vehcile Updated Successfully";
                //this.updateVehicleForm.reset();
                this.updateClicked.emit("1," + "Vehicle Updated Successfully");
              }
              else {
                this.updateClicked.emit("2," + "Error while Updating Vehicle");
                //this.message = "Error while Updating Vehcile";
              }
            },
              res => {
                //  this.message = res.statusText;
                this.updateClicked.emit("2," + res.statusText);
              }
            );
          // }
        }
        else {
          this.updateClicked.emit("2," + "Date time should be greater than today date time.");
        }
      }
      else
        this.updateClicked.emit("2," + "Selected Date is invalid");
    }
    else {
      this.validateAllFormFields(this.updateVehicleForm);
    }
  }

  cancelVehicle() {
    this.updateCancelClicked.emit(false);
    //this.router.navigateByUrl('vehicle/get-vehicle');
  }

  resetUpdateVehicle() {
    // this.updateVehicleForm.reset();

    let id = this.inputVehicleID;
    this.vehicleService.getVehiclebyPK(id.toString()).subscribe(res => {
      this.vehicleResponse = <IVehicleResponse>res;
      this.vehicleResponseNgModel.VehicleNumber = this.vehicleResponse.VehicleNumber;
      this.vehicleResponseNgModel.VehicleClass = this.vehicleResponse.VehicleClass;
      if (this.vehicleResponse.Year == 0) this.yearNg = "";
      else
        this.yearNg = this.vehicleResponse.Year.toString();
      if (this.vehicleResponse.Make == '' || this.vehicleResponse.Make == null || this.vehicleResponse.Make == "undefined") {
        this.vehicleResponseNgModel.Make = "";
        this.getModel("BMW");
      }
      else {
        this.vehicleResponseNgModel.Make = this.vehicleResponse.Make
        this.getModel(this.vehicleResponseNgModel.Make);
      };



      if (this.vehicleResponse.Model == '' || this.vehicleResponse.Model == null) { this.vehicleResponseNgModel.Model = ""; }
      else this.vehicleResponseNgModel.Model = this.vehicleResponse.Model;

      if (this.vehicleResponse.Color == '' || this.vehicleResponse.Color == null) { this.vehicleResponseNgModel.Color = "" }
      else {

        this.temp = this.vehicleResponse.Color.toLowerCase();
        this.vehicleResponseNgModel.Color = this.temp.charAt(0).toUpperCase() + this.temp.slice(1);
      }


      if (this.vehicleResponse.Country == '' || this.vehicleResponse.Country == null) { this.vehicleResponseNgModel.Country = ""; }
      else this.vehicleResponseNgModel.Country = this.vehicleResponse.Country;

      this.getStateByCountry(this.vehicleResponseNgModel.Country);

      if (this.vehicleResponse.State == '' || this.vehicleResponse.State == null) { this.vehicleResponseNgModel.State = "" }
      else this.vehicleResponseNgModel.State = this.vehicleResponse.State;

      if (this.vehicleResponse.ContractType == '' || this.vehicleResponse.ContractType == null || this.vehicleResponse.ContractType == "Owned")
        this.vehicleResponseNgModel.ContractType = "";
      else this.vehicleResponseNgModel.ContractType = this.vehicleResponse.ContractType;
      console.log(this.vehicleResponseNgModel.ContractType);
      this.startDate = this.vehicleResponse.StartEffectiveDate;
      this.endDate = this.vehicleResponse.EndEffectiveDate;

    });
    this.updateClicked.emit("3," + "");
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

  bindFormControl() {
    this.updateVehicleForm = new FormGroup({
      'pltNumber': new FormControl(''),
      'pltClass': new FormControl('', [Validators.required]),
      'pltYear': new FormControl(''),
      'pltMake': new FormControl(''),
      'pltModel': new FormControl(''),
      'pltColor': new FormControl(''),
      'pltCountry': new FormControl('', [Validators.required]),
      'pltState': new FormControl('', [Validators.required]),
      'startDate': new FormControl(''),
      'startTime': new FormControl(''),
      'endDate': new FormControl(''),
      'endTime': new FormControl(''),
      'pltContractual': new FormControl(''),
      'pltIsTempplate': new FormControl(''),
      'pltIsExempt': new FormControl('')
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

  bindVehicleDetails() {
    let id = this.inputVehicleID;
    this.vehicleService.getVehiclebyPK(id.toString()).subscribe(res => {
      this.vehicleResponse = <IVehicleResponse>res;
      this.vehicleResponseNgModel.VehicleNumber = this.vehicleResponse.VehicleNumber;
      this.vehicleResponseNgModel.VehicleClass = this.vehicleResponse.VehicleClass;
      this.tagRevenueType = this.vehicleResponse.TagRevenueType;
      //this.tagRevenueType = true;
      this.tagSerialNum = this.vehicleResponse.TagSerialNumber;
      // this.tagSerialNum = "654654";
      if (this.vehicleResponse.Year == 0)
        this.yearNg = "";
      else
        this.yearNg = this.vehicleResponse.Year.toString();

      if (this.vehicleResponse.Make == '' || this.vehicleResponse.Make == null || this.vehicleResponse.Make == "undefined") {
        this.vehicleResponseNgModel.Make = "";
        this.getModel("BMW");
      }
      else {
        this.vehicleResponseNgModel.Make = this.vehicleResponse.Make;
        this.getModel(this.vehicleResponseNgModel.Make);
      }



      if (this.vehicleResponse.Model == '' || this.vehicleResponse.Model == null) { this.vehicleResponseNgModel.Model = "" }
      else { this.vehicleResponseNgModel.Model = this.vehicleResponse.Model; }

      if (this.vehicleResponse.Color == '' || this.vehicleResponse.Color == null) { this.vehicleResponseNgModel.Color = ""; }
      else {

        this.temp = this.vehicleResponse.Color.toLowerCase();
        this.vehicleResponseNgModel.Color = this.temp.charAt(0).toUpperCase() + this.temp.slice(1);
      }


      if (this.vehicleResponse.Country == '' || this.vehicleResponse.Country == null) { this.vehicleResponseNgModel.Country = ""; }
      else this.vehicleResponseNgModel.Country = this.vehicleResponse.Country;

      this.getStateByCountry(this.vehicleResponseNgModel.Country);

      if (this.vehicleResponse.State == '' || this.vehicleResponse.State == null) { this.vehicleResponseNgModel.State = ""; }
      else this.vehicleResponseNgModel.State = this.vehicleResponse.State;

      if (this.vehicleResponse.ContractType == '' || this.vehicleResponse.ContractType == null || this.vehicleResponse.ContractType == "Owned") {
        this.vehicleResponseNgModel.ContractType = "";
      }
      else {
        this.vehicleResponseNgModel.ContractType = this.vehicleResponse.ContractType;
      }
      if (this.vehicleResponse.IsTemporaryNumber) {
        this.vehicleResponseNgModel.IsTemporaryNumber = true;
      }
      else
        this.vehicleResponseNgModel.IsTemporaryNumber = false;

      if (this.vehicleResponse.IsExempted) {
        this.vehicleResponseNgModel.IsExempted = true;
      }
      else
        this.vehicleResponseNgModel.IsExempted = false;
      this.vehicleStatus = this.vehicleResponse.VehicleStatus;

      if (this.vehicleResponse.VehicleStatus == "Active") {
        this.isActivate = false;
        this.buttonText = "Update";
        // this.startDate = this.vehicleResponse.StartEffectiveDate;
        // this.endDate = this.vehicleResponse.EndEffectiveDate;
        this.setDate(this.vehicleResponse.StartEffectiveDate, this.vehicleResponse.EndEffectiveDate)
      }
      else {
        this.buttonText = "Activate"; this.isActivate = true;
        // this.startDate = new Date();
        // this.endDate = null;
        this.setDate(new Date(), null)
      }
      console.log("inputVehicleID-" + this.inputVehicleID);
      if (this.tagSerialNum != '') {
        // this.checkVehicleTagCount();
        let id = this.inputVehicleID;
        this.vehicleService.getVehicleAssociatedTagCount(id.toString()).subscribe(res => {
          console.log("res", res);
          this.count = res;
          if (this.count !== undefined) {
            if (this.count === 1 && this.tagRevenueType === this.vehicleResponseNgModel.IsExempted) {
              this.disableisNoneRevenue = false;
              // this.updateClicked.emit("2," + "! You cannot change Vehicle type to" + this.vehicleResponseNgModel.IsExempted + "if Tag is" + this.tagRevenueType);
            } else {
              this.disableisNoneRevenue = true;
              // this.vehicleService.updateVehicle(this.vehicle, this.userEvents).subscribe(res => {
              //   if (res) {
              //     // this.message = "Vehcile Updated Successfully";
              //     //this.updateVehicleForm.reset();
              //     this.updateClicked.emit("1," + "Vehicle Updated Successfully");
              //   }
              //   else {
              //     this.updateClicked.emit("2," + "Error while Updating Vehicle");
              //this.message = "Error while Updating Vehcile";
              // }
              //}
              //   res => {
              //     //  this.message = res.statusText;
              //     this.updateClicked.emit("2," + res.statusText);
              //   }
              // );
            }
          }
        })
      }
      else {
        this.disableisNoneRevenue = true;
        // this.vehicleService.updateVehicle(this.vehicle, this.userEvents).subscribe(res => {
        //   if (res) {
        //     // this.message = "Vehcile Updated Successfully";
        //     //this.updateVehicleForm.reset();
        //     this.updateClicked.emit("1," + "Vehicle Updated Successfully");
        //   }
        //   else {
        //     this.updateClicked.emit("2," + "Error while Updating Vehicle");
        //     //this.message = "Error while Updating Vehcile";
        //   }
        // },
        //   res => {
        //     //  this.message = res.statusText;
        //     this.updateClicked.emit("2," + res.statusText);
        //   }
        // );
      }
    });
  }
  setDate(startingDate, endingDate): void {
    // Set today date using the patchValue function
    let startedDate = new Date(startingDate);
    this.updateVehicleForm.patchValue({
      startDate: {
        date: {
          year: startedDate.getFullYear(),
          month: startedDate.getMonth() + 1,
          day: startedDate.getDate()
        }
      },
    });
    if (endingDate != null) {
      let endedDate = new Date(endingDate);
      this.updateVehicleForm.patchValue({
        endDate: {
          date: {
            year: endedDate.getFullYear(),
            month: endedDate.getMonth() + 1,
            day: endedDate.getDate()
          }
        },
      });
    }
    this.startTime = startingDate;
    this.endTime = endingDate;

  }

  setUserActionObject() {
    if (!this.isCreateCustomerAccount) {
      this.userEvents = <IUserEvents>{};
      this.userEvents.FeatureName = Features[Features.VEHICLES];
      this.userEvents.ActionName = Actions[Actions.UPDATE];
      this.userEvents.PageName = this.router.url;
      this.userEvents.CustomerId = this.UserInputs.AccountId;
      this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      this.userEvents.UserName = this.sessionContextResponse.userName;
      this.userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    else this.userEvents = null;
  }
  onInputFieldRangeChanged(event: IMyInputFieldChanged) {
    console.log(event.value);
    if (event.value != "" && event.valid) {
      let minDate = new Date(event.value);
      console.log(minDate);
      this.myDatePickerOptionEndDate = {
        disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },

        dateFormat: 'mm/dd/yyyy',
        inline: false,
        indicateInvalidDate: true,
        showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
      }
    }

    if (event.value != "" && !event.valid)
      this.dateError = true;
    else
      this.dateError = false;

  }
  onInputFieldEndDateChanged(event: IMyInputFieldChanged) {
    console.log(event);
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
    }
    else
      this.invalidDate = false;

  }
}

export interface IaddVehicleInputs {
  UserName: string
  LoginId: number
  UserId: number
  AccountId: number
}

export interface IVehicleAttribute {
  VehicleClass: string
  Make: string
  Model: string
  Color: string
  ModelDescription: string
}