import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TollRatesService } from "./services/tollrates.service";
import { IVEPTariffsRequest } from "./models/veptariffsrequest";
import { IVEPTariffsResponse } from "./models/veptariffsresponse";
import { IPaging } from "../../shared/models/paging";
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { DatePipe } from '@angular/common';
import { IUserEvents } from "../../shared/models/userevents";
import { SubSystem, ActivitySource, Features, Actions, defaultCulture } from '../../shared/constants';
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-manage-vep-passes',
  templateUrl: './manage-vep-passes.component.html',
  styleUrls: ['./manage-vep-passes.component.scss']
})
export class ManageVepPassesComponent implements OnInit {
  gridArrowStatus: boolean;
  gridArrowEndEffectiveDate: boolean;
  gridArrowStartEffectiveDate: boolean;
  gridArrowVEHICLECLASS: boolean;
  gridArrowPassTypeCode: boolean;
  gridArrowPlazaCode: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowLocationCode: boolean;
  toDayDate = new Date();
  endDate;
  myDatePickerOptions2: ICalOptions;
  myDatePickerOptions1: ICalOptions;
  invalidDate: boolean;
  invalid: boolean;
  addVepPass;
  vepResponse: IVEPTariffsResponse[];
  vepRequest: IVEPTariffsRequest = <IVEPTariffsRequest>{};
  paging: IPaging;
  VEPPassId: number;
  vepForm: FormGroup;
  dropdownList: DropdownList[];
  dropdownList1: any;
  selectedItems = [];
  dropdownSettings = {};
  locationResponse = [];
  plazaResponse = [];
  passTypeResponse = [];
  vehicleClassResponse = [];
  Plazas = [];
  itemsList = [];
  maxDate = new Date();
  minDate = new Date();
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  DecimalWith2ValuesAferDotAllowsZero = '^[0-9]\d*(\.\d{1,2})?$';
  zeroPattren = "^[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*$";      //"(([1-9]|(0)*1)(\d{1,})?(\.\d{1,2})?|0\.(\d?[1-9]|[1-9]\d))$";
  pattren = "[0-9]+(\.[0-9][0-9]?)?";
  disableButton: boolean = false;
  disableEditButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  // "^[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*$" 
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    let userEvent = null;
    this.getVepPasses(this.p, userEvent);
  }

  constructor(private materialscriptService:MaterialscriptService
,private tollRatesService: TollRatesService, private router: Router
    , private Context: SessionService, private commonService: CommonService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.gridArrowPassTypeCode = true;
    this.sortingColumn = "PassTypeCode";
    this.materialscriptService.material();
    if (!this.commonService.isAllowed(Features[Features.MANAGEVEPPASSTYPES], Actions[Actions.VIEW], "")) {

    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.MANAGEVEPPASSTYPES], Actions[Actions.CREATE], "");
    this.disableEditButton = !this.commonService.isAllowed(Features[Features.MANAGEVEPPASSTYPES], Actions[Actions.DELETE], "");
    this.minDate.setDate(this.minDate.getDate());
    this.p = 1;
    this.endItemNumber = 10;
    this.vepForm = new FormGroup({
      'location': new FormControl('', [Validators.required]),
      'plaza': new FormControl('', Validators.compose([Validators.required])),
      'passType': new FormControl('', Validators.compose([Validators.required])),
      'vehicleClass': new FormControl('', [Validators.required]),
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      //'amount': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.DecimalWith2ValuesAferDotAllowsZero)])),
      'amount': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.pattren), Validators.pattern(this.zeroPattren)])),
    });
    let userEvent = this.userEvents();
    this.getVepPasses(this.p, userEvent);
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Plaza",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class",
    };
    this.getLocations();
    this.getPassTypes();
    this.getVehicleClasses();

    this.myDatePickerOptions1 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false

    };
  }

  changeDate(startDate) {
    //  let transformedDate = this.datePipe.transform(startDate.value, 'MM/dd/yyyy');
    // let myDate = new Date(transformedDate);
    if (startDate != null) {
      let date = new Date(startDate).toDateString();
      this.maxDate = new Date(date);
    }
  }

  onItemSelect(item: any) {
    var filteredItem = this.itemsList.filter(d => d.id == item.id);
    if (filteredItem.length > 0) {
      this.itemsList.slice(item);
    }
    else {
      this.itemsList.push(item);
    }
  }

  OnItemDeSelect(item: any) {
    var index = this.itemsList.findIndex(x => x.id == item.id);
    if (index > -1) {
      this.itemsList.splice(index, 1);
    }
  }

  onSelectAll(items: any) {
    this.itemsList.push(items)
  }

  onDeSelectAll(items: any) {
    this.itemsList = items;
  }

  getVepPasses(pageNumber: number, userEvent: IUserEvents) {
    this.vepRequest = <IVEPTariffsRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = this.sortingColumn;
    this.paging.SortDir = this.sortingDirection == false ? 1 : 0;
    this.vepRequest.Paging = this.paging;
    this.vepRequest.CreatedUser = this.Context.customerContext.userName;
    this.vepRequest.UserId = this.Context.customerContext.userId;
    this.vepRequest.Action = "VIEW";
    this.vepRequest.LoginId = this.Context.customerContext.loginId;
    this.vepRequest.ViewFlag = false;
    this.vepRequest.Status = "ALL";
    this.tollRatesService.getVepPasses(this.vepRequest, userEvent).subscribe(
      res => {
        if (res) {
          this.vepResponse = res;
          this.totalRecordCount = this.vepResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  getLocations() {
    this.commonService.getLocations().subscribe(
      res => {
        if (res) {
          this.locationResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  changeLocation(location) {
    let locationCode = location.target.value;
    this.selectedItems = [];
    this.dropdownList = [];
    if (locationCode != '') {
      this.getPlazas(locationCode);
    }
    else {

    }
  }

  getPlazas(locationCode) {
    this.commonService.getPlazaDropDown(locationCode).subscribe(
      res => {
        if (res) {
          this.dropdownList = [];
          res.forEach(element => {
            this.dropdownList1 = {};
            this.dropdownList1.id = element.PlazaCode;
            this.dropdownList1.itemName = element.PlazaName;
            this.dropdownList.push(this.dropdownList1);
          });
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  getPassTypes() {
    this.tollRatesService.getPassTypes().subscribe(
      res => {
        if (res) {
          this.passTypeResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  getVehicleClasses() {
    this.tollRatesService.vehicleClasses().subscribe(
      res => {
        if (res) {
          this.vehicleClassResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  showAddVepPass() {
    this.addVepPass = true;
  }

  vepPassDelete(VEPPassId: number) {
    this.VEPPassId = VEPPassId;
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to deactivate VEP Pass ?";
    this.msgTitle = 'Alert';
  }

  vepPassDeleteBasedonId(event) {
    if (event) {
      $('#confirm-dialog').modal('hide');
      this.vepRequest = <IVEPTariffsRequest>{};
      this.vepRequest.VEPPassId = this.VEPPassId;
      this.vepRequest.IsActive = false;
      this.vepRequest.CreatedUser = this.Context.customerContext.userName;
      this.vepRequest.UserId = this.Context.customerContext.userId;
      this.vepRequest.Action = "DELETE";
      this.vepRequest.LoginId = this.Context.customerContext.loginId;
      let userEvent = this.userEvents();
      userEvent.ActionName = Actions[Actions.DELETE];
      this.tollRatesService.deleteVEPTariffs(this.vepRequest, userEvent).subscribe(
        res => {
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "VEP Pass deactivated successfully";
            this.msgTitle = '';
            let userEvent = null;
            this.getVepPasses(this.p, userEvent);
          }
        },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  addVepPasses() {
    if (this.vepForm.valid) {
      this.vepRequest = <IVEPTariffsRequest>{};
      this.vepRequest.LocationCode = this.vepForm.controls["location"].value;
      this.vepRequest.PlazaCode = this.vepForm.controls["plaza"].value;
      this.vepRequest.PassType = this.vepForm.controls["passType"].value;
      this.vepRequest.VehicleClass = this.vepForm.controls["vehicleClass"].value;
      let startDate = this.vepForm.controls["startDate"].value;
      let endDate = this.vepForm.controls["endDate"].value;
      this.vepRequest.StartEffectiveDate = (new Date(startDate.date.month + '/' + startDate.date.day + '/' + startDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.vepRequest.EndEffectiveDate = (new Date(endDate.date.month + '/' + endDate.date.day + '/' + endDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      //  this.vepRequest.StartEffectiveDate = this.vepForm.controls["startDate"].value;
      //  this.vepRequest.EndEffectiveDate = this.vepForm.controls["endDate"].value;
      this.vepRequest.Amount = this.vepForm.controls["amount"].value;
      this.vepRequest.IsActive = true;
      this.vepRequest.CreatedUser = this.Context.customerContext.userName;
      this.vepRequest.UserId = this.Context.customerContext.userId;
      this.vepRequest.Action = "CREATE";
      this.vepRequest.LoginId = this.Context.customerContext.loginId;
      if (new Date(this.vepRequest.StartEffectiveDate) > new Date(this.vepRequest.EndEffectiveDate)) {
       // this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = " End Effective Date should not be less than Start Effective Date";
        this.msgTitle = '';
        return ;
      }
      if (this.itemsList.length > 0) {
        this.prepareItemList(this.vepRequest);
      }
    }

    else {
      this.validateAllFormFields(this.vepForm);
    }
  }

  prepareItemList(vepRequests) {
    var strPlaza = '';
    var strPlazaName = '';
    var strResult = '';
    var FlagExists = false;
    var strResultPlaza = '';
    var FlagAdded = false;
    if (vepRequests.PlazaCode.length > 0) {
      vepRequests.PlazaCode.forEach(element => {
        strPlaza += element.id + ",";
        strPlazaName += element.itemName + ",";
      });
    }
    let plazaCodes = vepRequests.PlazaCode;
    vepRequests.PlazaCode = strPlaza;
    this.tollRatesService.IsTariffExists(vepRequests).subscribe(
      res => {
        if (res) {
          strResult = res;
        }
      },
      (err) => { }
      , () => {
        var ErrornSuceessErrornSuceess = strResult.split('+');
        if (ErrornSuceessErrornSuceess[0] != '') {
          FlagExists = true;
          var strPlazaNameResult = ErrornSuceessErrornSuceess[0].split(',');
          plazaCodes.forEach(element => {
            for (var i = 0; i < parseInt(strPlazaNameResult.length.toString()); i++) {
              for (var i = 0; i < parseInt(strPlazaNameResult.length.toString()); i++) {
                if (strPlazaNameResult[i].toString() != '') {
                  if (element.id.toUpperCase() == strPlazaNameResult[i].toString().toUpperCase()) {
                    strResultPlaza += element.itemName + ',';
                  }
                }
              }
            }
          });
          let strlength = strResultPlaza.length;
          strResultPlaza = strResultPlaza.substring(0, strlength - 1);
        }
        if (ErrornSuceessErrornSuceess[1] != '') {
          this.vepRequest.PlazaCode = ErrornSuceessErrornSuceess[1].toString();
          let userEvent = this.userEvents();
          userEvent.ActionName = Actions[Actions.CREATE];
          this.tollRatesService.CreateVepPasses(this.vepRequest, userEvent).subscribe(
            res => {
              if (res) {
                FlagAdded = true;
                if (FlagAdded && !FlagExists) {
                  if (FlagAdded) {
                    this.msgType = 'success';
                    this.msgFlag = true;
                    this.msgDesc = "VEP Pass added successfully";
                    this.msgTitle = '';
                    this.addVepPass = false;
                    let userEvent = null;
                    this.getVepPasses(this.p, userEvent);
                    this.vepForm.reset();
                    this.vepForm.controls["location"].setValue("");
                    this.dropdownList = [];
                    this.vepForm.controls["passType"].setValue("");
                    this.vepForm.controls["vehicleClass"].setValue("");
                    this.vepForm.controls["startDate"].reset();
                    this.vepForm.controls["endDate"].reset();
                    this.minDate.setDate(this.minDate.getDate());
                  }
                }
                else {
                  this.msgType = 'error';
                  this.msgFlag = true;
                  this.msgDesc = "VEP Pass already exists for this date range " + strResultPlaza;
                  this.msgTitle = '';
                  this.addVepPass = false;
                  let userEvent = null;
                  this.getVepPasses(this.p, userEvent);
                  this.vepForm.reset();
                  this.vepForm.controls["location"].setValue("");
                  this.dropdownList = [];
                  this.vepForm.controls["passType"].setValue("");
                  this.vepForm.controls["vehicleClass"].setValue("");
                  this.vepForm.controls["startDate"].reset();
                  this.vepForm.controls["endDate"].reset();
                  this.minDate.setDate(this.minDate.getDate());
                }
              }
            },
            err => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText;
              this.msgTitle = '';
              return;
            });
        }
        if (!FlagAdded && FlagExists) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "VEP Pass already exists for this date range " + strResultPlaza;
          this.msgTitle = 'Error';
        }
      });
  }

  IsTariffExists(plaza): string {
    let plazas = '';
    this.tollRatesService.IsTariffExists(plaza).subscribe(
      res => {
        if (res) {
          plazas = res;
        }
      });
    return plazas;
  }


  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  resetVepPass() {
    this.vepForm.reset();
       this.materialscriptService.material();
    this.vepForm.controls["location"].setValue("");
    this.dropdownList = [];
    this.vepForm.controls["passType"].setValue("");
    this.vepForm.controls["vehicleClass"].setValue("");
    this.vepForm.controls["startDate"].reset();
    this.vepForm.controls["endDate"].reset();
    this.minDate.setDate(this.minDate.getDate());
  }

  cancelVepPass() {
    this.addVepPass = false;
    this.resetVepPass();
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.MANAGEVEPPASSTYPES];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.Context.customerContext.roleID);
    this.userEventRequest.UserName = this.Context.customerContext.userName;
    this.userEventRequest.LoginId = this.Context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  endEffectiveDate() {
    this.endDate = this.vepForm.controls["startDate"].value;
    if (this.endDate) {
      this.myDatePickerOptions2 = {
        // other options...
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.endDate.date.year, month: this.endDate.date.month, day: this.endDate.date.day - 1 },
        inline: false,
        indicateInvalidDate: true,
        showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
      };
    }
  }

  onDateChanged1(event: IMyInputFieldChanged) {
    let date = this.vepForm.controls["startDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalid = true;
      return;
    }
    else {
      this.invalid = false;
      this.endEffectiveDate();
    }
  }
  onDateChanged2(event: IMyInputFieldChanged) {
    let date = this.vepForm.controls["endDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }

  sortDirection(SortingColumn) {
    this.gridArrowLocationCode = false;
    this.gridArrowPlazaCode = false;
    this.gridArrowPassTypeCode = false;
    this.gridArrowVEHICLECLASS = false;
    this.gridArrowStartEffectiveDate = false;
    this.gridArrowEndEffectiveDate = false;
    this.gridArrowStatus = false;



    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "PassTypeCode") {
      this.gridArrowPassTypeCode = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "PlazaCode") {
      this.gridArrowPlazaCode = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }


    else if (this.sortingColumn == "LocationCode") {
      this.gridArrowLocationCode = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "VEHICLECLASS") {
      this.gridArrowVEHICLECLASS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "StartEffectiveDate") {
      this.gridArrowStartEffectiveDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "EndEffectiveDate") {
      this.gridArrowEndEffectiveDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "Status") {
      this.gridArrowStatus = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    

    
    this.getVepPasses(this.p, null);
  }

}

export class DropdownList {
  id: string
  itemName: string
}
