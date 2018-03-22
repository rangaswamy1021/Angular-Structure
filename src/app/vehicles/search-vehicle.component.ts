import { Component, OnInit, Renderer, Output, EventEmitter, Input } from '@angular/core';
import { VehicleService } from './services/vehicle.services';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ISearchVehicle } from './models/vehiclecrequest';
import { Features, Actions } from '../shared/constants';
import { IUserEvents } from '../shared/models/userevents';
import { SessionService } from '../shared/services/session.service';
import { CommonService } from '../shared/services/common.service';
import { IUserresponse } from '../shared/models/userresponse';
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-search-vehicle',
  templateUrl: './search-vehicle.component.html',
  styleUrls: ['./search-vehicle.component.scss']
})

export class SearchVehicleComponent implements OnInit {
  contarctualType: any[];
  // Form group 
  searchVehicleForm: FormGroup;
  @Output() searchClicked: EventEmitter<string> = new EventEmitter<string>();

  isbothFeildEmpty: boolean = false;
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  @Input() customerAccountId;
  disableButton: boolean = false;
  userEvents: IUserEvents;
  //User log in details 
  sessionContextResponse: IUserresponse;

  constructor(private _vehicleService: VehicleService, public renderer: Renderer, private router: Router,
    private commonService: CommonService
    , private sessionService: SessionService, private materialscriptService: MaterialscriptService) {
    this.bindFormControl();
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.SEARCH], "");
    this.getContractualType();
    this.bindFormControl();
  }

  getContractualType() {
    this._vehicleService.getContractualType().subscribe(res => {
      this.contarctualType = res;
      console.log(res);
    })
  }
  // ouput returned 
  seacrhClick() {
    let temp = this.anyOneValue();
    if (!temp) {
      let searchObject: any = {
        vehicleNumber: this.searchVehicleForm.value.pltNumber,
        vehicleStatus: this.searchVehicleForm.value.pltStatus,
        contractType: this.searchVehicleForm.value.pltContractual,
        isSearched: true
      };
      this.setUserActionObject();
  
      this.searchClicked.emit(searchObject);
      return false;
    }
    else {
      this.isbothFeildEmpty = true;
      return;
    }
  }


  resetClick() {
    this.bindFormControl();
    this.searchVehicleForm.patchValue({
      pltNumber: "",
      pltStatus: "",
      pltContractual: ""
    });
    this.isbothFeildEmpty = false;
    let searchObject: any = {
      vehicleNumber: this.searchVehicleForm.value.pltNumber,
      vehicleStatus: this.searchVehicleForm.value.pltStatus,
      contractType: this.searchVehicleForm.value.pltContractual,
      isSearched: false
    };
    this.searchClicked.emit(searchObject);
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 100);
  }
  anyOneValue(): boolean {

    console.log("pltNumber" + this.searchVehicleForm.controls["pltNumber"].value);
    console.log("pltStatus" + this.searchVehicleForm.controls["pltStatus"].value);
    console.log("pltContractual" + this.searchVehicleForm.controls["pltContractual"].value);

    return ((this.searchVehicleForm.controls["pltNumber"].value == '' || this.searchVehicleForm.controls["pltNumber"].value == null)
      && (this.searchVehicleForm.controls["pltStatus"].value == '' || this.searchVehicleForm.controls["pltStatus"].value == null)
      && (this.searchVehicleForm.controls["pltContractual"].value == '' || this.searchVehicleForm.controls["pltContractual"].value == null)
    )
  }
  checkField() {
    if (this.searchVehicleForm.controls["pltNumber"].value == '' && this.searchVehicleForm.controls["pltStatus"].value == '' || this.searchVehicleForm.controls["pltContractual"].value == '')
      this.isbothFeildEmpty = true;
    else this.isbothFeildEmpty = false;
  }

  checkFieldOnchange() {
    if (this.searchVehicleForm.controls["pltNumber"].value != '' || this.searchVehicleForm.controls["pltStatus"].value != '' || this.searchVehicleForm.controls["pltContractual"].value != '')
      this.isbothFeildEmpty = false;
  }

  bindFormControl() {
    this.searchVehicleForm = new FormGroup({
      'pltNumber': new FormControl('', [Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateAlphaNumericsPattern)]),
      'pltStatus': new FormControl(''),
      'pltContractual': new FormControl('')
    });
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.FeatureName = Features[Features.VEHICLES];
    this.userEvents.ActionName = Actions[Actions.SEARCH];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.customerAccountId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;

  }
}
