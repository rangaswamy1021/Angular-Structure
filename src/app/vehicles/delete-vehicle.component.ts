import { Component, OnInit, Renderer, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
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
import { IUserresponse } from '../shared/models/userresponse';
import { SessionService } from '../shared/services/session.service';
import { IUserEvents } from '../shared/models/userevents';


@Component({
  selector: 'app-delete-vehicle',
  templateUrl: './delete-vehicle.component.html',
  styleUrls: ['./delete-vehicle.component.css']
})
export class DeleteVehicleComponent implements OnInit {

  countries: any[];
  states: ICommonResponse[];
  common: ICommon = <ICommon>{};
  vehicleClass: IVehicleClass[];
  vehicleAttributes: IVehicleAttribute[];
  vehicleModel: any[];
  vehicleColors: ICommonResponse[];
  contarctualType: any[];
  years: any[];

  vehicleResponse: IVehicleResponse;
  vehicleResponseNgModel: IVehicleResponse = <IVehicleResponse>{};
  yearNG: string;
  searchVehicle: ISearchVehicle;
  vehicle: IVehicleRequest = <IVehicleRequest>{};
  message: string;
  buttonText: string = "Deactivate";

  // Form group 
  updateVehicleForm: FormGroup;

  UserInputs: IaddVehicleInputs = <IaddVehicleInputs>{};
  temp: string;

  objStartDate: string;
  objEndDate: string;

  // Customer Context
  objICustomerContextResponse: ICustomerContextResponse;

  //User log in details 
  sessionContextResponse: IUserresponse


  urlParaForOperation: number;

  @Input() inputVehicleID: number;
  @Input() inputOperation: number;
  @Input() isCreateCustomerAccount: boolean
  @Input() customerAccountId: number


  @Output() deactivateClicked: EventEmitter<string> =
  new EventEmitter<string>();

  @Output() deactivateCancelClicked: EventEmitter<boolean> =
  new EventEmitter<boolean>();
  disableButton: boolean = false;
  userEvents: IUserEvents;
  constructor(private vehicleService: VehicleService, private route: ActivatedRoute, private router: Router,
    private commonService: CommonService,
    private customerContextService: CustomerContextService
    , private sessionService: SessionService) {
    this.updateVehicleForm = new FormGroup({
      'pltNumber': new FormControl(''),
      'pltClass': new FormControl('', [Validators.required]),
      'pltYear': new FormControl(''),
      'pltMake': new FormControl(''),
      'pltModel': new FormControl(''),
      'pltColor': new FormControl(''),
      'pltCountry': new FormControl(''),
      'pltState': new FormControl('', [Validators.required]),
      'startDate': new FormControl(''),
      'endDate': new FormControl(''),
      'pltContractual': new FormControl(''),
      'pltIsTempplate': new FormControl('')
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    this.getCountry();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor("VehicleColors");
    this.getYear();
    this.getContractualType();
    this.bindVehicleDetails();
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
      // if (this.objICustomerContextResponse.ParentId > 0)
      //   this.UserInputs.AccountId = this.objICustomerContextResponse.ParentId;
      // else
      this.UserInputs.AccountId = this.objICustomerContextResponse.AccountId;
      this.UserInputs.UserId = this.objICustomerContextResponse.AccountId;
      this.disableButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.DELETE], "");
    }
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.UserInputs.LoginId = this.sessionContextResponse.loginId;

    // let id = +this.route.snapshot.params['id'];
    // this.urlParaForOperation = +this.route.snapshot.params['id2'];

    this.getCountry();
    this.getVehicleClass();
    this.getVehicleMake();
    this.getVehicleColor("VehicleColors");
    this.getYear();
    this.getContractualType();
    this.bindVehicleDetails();
    //console.log(this.objaddVehicleComponent.countries);
  }

  bindVehicleDetails() {
    let id = this.inputVehicleID;
    this.urlParaForOperation = this.inputOperation;

    if (this.urlParaForOperation == 1) { this.buttonText = "Delete"; } else this.buttonText = "Deactivate";
    this.vehicleService.getVehiclebyPK(id.toString()).subscribe(res => {
      this.vehicleResponse = <IVehicleResponse>res;
      this.vehicleResponseNgModel.VehicleId = id;
      this.vehicleResponseNgModel.VehicleNumber = this.vehicleResponse.VehicleNumber;
      this.vehicleResponseNgModel.VehicleClass = this.vehicleResponse.VehicleClass;
      if (this.vehicleResponse.Year == 0) this.yearNG = "";
      else
        this.yearNG = this.vehicleResponse.Year.toString();
      this.vehicleResponseNgModel.Year = this.vehicleResponse.Year;
      if (this.vehicleResponse.Make == '' || this.vehicleResponse.Make == null || this.vehicleResponse.Make == "undefined")
        this.vehicleResponseNgModel.Make = "";
      else this.vehicleResponseNgModel.Make = this.vehicleResponse.Make;


      this.getModel(this.vehicleResponseNgModel.Make);
      if (this.vehicleResponse.Model == '' || this.vehicleResponse.Model == null)
        this.vehicleResponseNgModel.Model = "";
      else this.vehicleResponseNgModel.Model = this.vehicleResponse.Model;

      if (this.vehicleResponse.Color == '' || this.vehicleResponse.Color == null)
        this.vehicleResponseNgModel.Color = "";
      else {

        this.temp = this.vehicleResponse.Color.toLowerCase();
        this.vehicleResponseNgModel.Color = this.temp.charAt(0).toUpperCase() + this.temp.slice(1);
      }

      if (this.vehicleResponse.Country == '' || this.vehicleResponse.Country == null)
        this.vehicleResponseNgModel.Country = "";
      else this.vehicleResponseNgModel.Country = this.vehicleResponse.Country;

      this.getCountryBystate(this.vehicleResponseNgModel.Country);

      if (this.vehicleResponse.State == '' || this.vehicleResponse.State == null)
        this.vehicleResponseNgModel.State = "";
      else this.vehicleResponseNgModel.State = this.vehicleResponse.State;

      if (this.vehicleResponse.ContractType == '' || this.vehicleResponse.ContractType == null || this.vehicleResponse.ContractType == "Owned")
        this.vehicleResponseNgModel.ContractType = "";
      else this.vehicleResponseNgModel.ContractType = this.vehicleResponse.ContractType.toUpperCase();

      if (this.vehicleResponse.IsTemporaryNumber) {
        this.vehicleResponseNgModel.IsTemporaryNumber = true;
      }
      else
        this.vehicleResponseNgModel.IsTemporaryNumber = false;

      this.vehicleResponseNgModel.StartEffectiveDate = this.vehicleResponse.StartEffectiveDate;
      let currentStartDate = new Date(this.vehicleResponse.StartEffectiveDate);
      let startDate = currentStartDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
      let startTime = currentStartDate.toLocaleTimeString();
      let appendStartDate = startDate + " " + startTime;
      this.vehicleResponseNgModel.StartEffectiveDate = appendStartDate;
      this.objStartDate=appendStartDate;

      //this.objStartDate = new Date(this.vehicleResponse.StartEffectiveDate).toString().replace('T', ' ');
      //this.objStartDate.tol
      let currentDate = new Date(this.vehicleResponse.EndEffectiveDate);
      let date = currentDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
      let time = currentDate.toLocaleTimeString();
      let appendDate = date + " " + time;
      this.vehicleResponseNgModel.EndEffectiveDate = appendDate;
      //this.vehicleResponseNgModel.EndEffectiveDate =  this.vehicleResponseNgModel.EndEffectiveDate
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
  // private getVehicleClass(): IVehicleClass[] {
  //   return this.vehicleClass;
  // }


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

  deactivateVehicle() {
    this.searchVehicle = <ISearchVehicle>{};
    this.searchVehicle.VehicleId = this.vehicleResponseNgModel.VehicleId;
    this.searchVehicle.accountId = this.UserInputs.AccountId;
    this.searchVehicle.DeactivatedDate = new Date().toLocaleString();
    this.searchVehicle.EndEffectiveDate = new Date().toLocaleString(); //this.vehicleResponseNgModel.EndEffectiveDate;
    this.searchVehicle.StartEffectiveDate = this.vehicleResponseNgModel.StartEffectiveDate;
    this.searchVehicle.VehicleStatus = "Active";
    this.searchVehicle.UserName = this.UserInputs.UserName;
    this.searchVehicle.ContractType = "Owned";
    this.searchVehicle.vehicleNumber = this.vehicleResponseNgModel.VehicleNumber.toUpperCase();
    this.searchVehicle.ActivitySource = ActivitySource.Internal;
    this.searchVehicle.Subsystem = SubSystem.CSC;
    this.searchVehicle.LoginId = this.UserInputs.LoginId;
    this.searchVehicle.UserId = this.UserInputs.UserId;
    //this._vehicleService.deactivateVehicle(this._searchVehicle).subscribe(res => this.message = res);
    if (this.urlParaForOperation === 2) {
      this.setUserActionObject();
      this.vehicleService.deactivateVehicle(this.searchVehicle, this.userEvents).subscribe(res => {
        if (res) {

          // this.message = "Vehcile Deactivated Successfully";
          // this.updateVehicleForm.reset();

          this.deactivateClicked.emit("1," + "Vehicle Deactivated Successfully");
          //  this._router.navigateByUrl('vehicle/get-vehicle');
        }
        else {
          this.deactivateClicked.emit("2," + "Error while Deactivating Vehicle");
        }
        //this.message = "Error while Deactivating Vehcile";
      },
        res => {
          //  this.message = res.statusText;
          //console.log(res.statusText.toString());
          this.deactivateClicked.emit("2," + res.statusText);

        }
      );
    }

    if (this.urlParaForOperation === 1) {
      this.vehicleService.removeVehicle(this.searchVehicle).subscribe(res => {
        if (res) {
          //console.log("nmk");
          //console.log(res);
          this.deactivateClicked.emit("1," + "Vehicle Deleted Successfully");
        }
        else
          this.deactivateClicked.emit("2," + "Error while Deleting Vehcile");
      }
        , res => {
          //  this.message = res.statusText;
          this.deactivateClicked.emit("2," + res.statusText);
        });
    }
    //this._router.navigateByUrl('vehicle/get-vehicle');
  }
  cancelVehicle() {
    this.deactivateCancelClicked.emit(false);
    // this.router.navigateByUrl('vehicle/get-vehicle');
  }
  setUserActionObject() {
    if (!this.isCreateCustomerAccount) {
      this.userEvents = <IUserEvents>{};
      this.userEvents.FeatureName = Features[Features.VEHICLES];
      this.userEvents.ActionName = Actions[Actions.DELETE];
      this.userEvents.PageName = this.router.url;
      this.userEvents.CustomerId = this.UserInputs.AccountId;
      this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      this.userEvents.UserName = this.sessionContextResponse.userName;
      this.userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    else this.userEvents = null;
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