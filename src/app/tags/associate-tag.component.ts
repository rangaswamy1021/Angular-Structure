import { IPaging } from './../shared/models/paging';
import { TagTypes } from './models/tagtypes';
import { IUserEvents } from './../shared/models/userevents';
import { IUserresponse } from './../shared/models/userresponse';
import { SessionService } from './../shared/services/session.service';
import { CommonService } from './../shared/services/common.service';
import { ApplicationParameterkey } from './../shared/applicationparameter';
import { IVehicleRequest } from './../vehicles/models/vehiclecrequest';
import { ICustomerContextResponse } from './../shared/models/customercontextresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { Router } from '@angular/router';
import { TagService } from './services/tags.service';
import { Component, OnInit } from '@angular/core';
import { IVehicleResponse } from "../shared/models/vehicleresponse";
import { Features, Actions, defaultCulture } from "../shared/constants";
import { Console } from '@angular/core/src/console';
import { ICalOptions } from '../shared/models/datepickeroptions';
import { min } from 'rxjs/operator/min';

@Component({
  selector: 'app-associate-tag',
  templateUrl: './associate-tag.component.html',
  styleUrls: ['./associate-tag.component.scss']
})
export class AssociateTagComponent implements OnInit {
  tagTypes: TagTypes;
  selectedTagType: string;
  serialNumResponse: IVehicleResponse[];
  vehicleResponse: IVehicleResponse[];
  vehicleDetailsResponse: IVehicleResponse[];
  vehicleResSelected: IVehicleResponse[] = <IVehicleResponse[]>[];
  vehicleRequest: IVehicleRequest = <IVehicleRequest>{};
  assocRequest: IVehicleRequest = <IVehicleRequest>{};
  assocResponse: IVehicleResponse[] = [];
  dropdownValue: string = "";
  vehicleTagCount: number = 0;//config
  vehicleCheckedCount: number = 0;
  vehicleCountByTagId: number = 0;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  associateForm: FormGroup;
  serialNumber: string = "";
  plateVisible: boolean = false;
  customerId: number = 0;
  customerInformationres: any;
  disableButton: boolean = false;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  minDate = new Date();
  maxDate: Date;
  _bsValue: Date;
  tagStartDate: Date;
  tagEndDate: Date;
  isTagDataAvailable: boolean = false;
  chkDisable: boolean;
  maxCount: number;
  assocCount: number = 0;
  myDatePickerOptionsGridStart: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    // disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
    firstDayOfWeek: 'mo', sunHighlight: false,
    inline: false, height: '34px', width: '150px',
    alignSelectorRight: true, indicateInvalidDate: true,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
  };
  myDatePickerOptionsGridEnd: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo', sunHighlight: false,
    inline: false, height: '34px', width: '150px',
    alignSelectorRight: true, indicateInvalidDate: true,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
  };
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    this._bsValue = v;
  }
  constructor(private tagService: TagService, private commonService: CommonService, private router: Router, private customerContext: CustomerContextService,
    private sessionContext: SessionService) { }

  ngOnInit() {
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;

    this.associateForm = new FormGroup({
      'serialno': new FormControl('', [Validators.required]),
      'chkvehicle': new FormControl('', [Validators.required]),
    });
    this.bindCustomerInfo();
    this.bindCustomerAssocInfo();
    this.getTagTypeConfiguration();
    this.disableButton = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.REQUEST], "");
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxVehicleTagCount).subscribe(res => this.vehicleTagCount = res);
  }

  getTagTypeConfiguration() {
    this.tagService.getTagTypesConfiguration().subscribe(
      res => {
        this.tagTypes = res;
      }
    )
  }

  onSelectTagSerialNum(serialNum) {
    console.log(serialNum);
    if (this.dropdownValue != null) {
      if (this.dropdownValue != serialNum && this.vehicleResSelected != null) {
        this.vehicleResSelected.forEach(x => x.IsSelected = false);
        this.vehicleResSelected = <IVehicleResponse[]>[];
        this.vehicleCheckedCount = 0;
      }
    }
    this.dropdownValue = serialNum;
    if (serialNum != null && serialNum != undefined) {
      this.tagStartDate = this.serialNumResponse.filter(x => x.TagSerialNumber == serialNum)[0].StartEffectiveDate;
      this.tagEndDate = this.serialNumResponse.filter(x => x.TagSerialNumber == serialNum)[0].EndEffectiveDate;
      let tagtype = this.serialNumResponse.filter(x => x.TagSerialNumber == serialNum)[0].TagType;
      if (tagtype != null) {
        if (tagtype == "EZPASS-TDMINTERNAL") {
          this.maxCount = this.tagTypes.VehiclesToEZPASSTDMInternalTag;
        }
        else if (tagtype == "EZPASS-TDMEXTERNAL") {
          this.maxCount = this.tagTypes.VehiclesToEZPASSTDMExternalTag;
        }
        else if (tagtype == "Title 21EXTERNAL") {
          this.maxCount = this.tagTypes.VehiclesToTitle21ExternalTag;
        }
        else if (tagtype == "Title 21INTERNAL") {
          this.maxCount = this.tagTypes.VehiclesToTitle21InternalTag;
        }
        else if (tagtype == "6CEXTERNAL") {
          this.maxCount = this.tagTypes.VehiclesTo6CExternalTag;
        }
        else if (tagtype == "6CINTERNAL") {
          this.maxCount = this.tagTypes.VehiclesTo6CInternalTag;
        }
        this.isTagDataAvailable = true;
        this.selectedTagType = tagtype;
      }
      this.assocCount = 0;
      this.getAsocatedCountBySerial(serialNum);
    }
  }

  storeTagDates(tagData: IVehicleResponse) {
    this.isTagDataAvailable = false;
    if (tagData != null && tagData != undefined) {
      this.tagStartDate = tagData.StartEffectiveDate;
      this.tagEndDate = tagData.EndEffectiveDate;
    }
  }

  validateEndDate(vehicles: IVehicleResponse, endDate) {
    if (endDate.value != "") {
      let edate = new Date(endDate.value);
      let convertedEDate = new Date(edate.getFullYear(), edate.getMonth(), edate.getDate(), edate.getHours(), edate.getMinutes(), edate.getSeconds());
      let a = new Date(vehicles.EndEffectiveDate);
      let convertedVehEndDate = new Date(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
      let maxDate;
      if (this.isTagDataAvailable) {
        if (this.tagEndDate > convertedVehEndDate) {
          maxDate = convertedVehEndDate;
          //   this.minmaxDate(null, maxDate);
        }
        else {
          maxDate = this.tagEndDate;
          //  this.minmaxDate(null, maxDate);
        }
      }
      else {
        maxDate = convertedVehEndDate;
        //   this.minmaxDate(null, maxDate);

      }
      if (convertedEDate > convertedVehEndDate) {
        this.errorMessageBlock("Association end date should not be greater than vehicle end date\n Minimum date should be: " + maxDate);
        return;
      }
      // if (this.isTagDataAvailable) {
      //   if (convertedEDate > this.tagEndDate)
      //     this.errorMessageBlock("Association end date should not be greater than tag end date\n Minimum date should be: " + maxDate);
      //   return;
      // }
      this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].EndEffectiveDate = convertedEDate;
    }
  }



  validateStartDate(vehicles, event) {

    if (event) {
      debugger;
      let strtDate = new Date(event.value);
      let minDate;
      let maxDate;
      if (strtDate) {
        let stdate = new Date(strtDate);
        let convertedSDate = new Date(stdate.getFullYear(), stdate.getMonth(), stdate.getDate(), stdate.getHours(), stdate.getMinutes(), stdate.getSeconds());
        let a = new Date(vehicles.StartEffectiveDate);
        let convertedVehStartDate = new Date(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());

        if (this.isTagDataAvailable) {
          if (new Date(this.tagStartDate) < convertedVehStartDate) {
            minDate = convertedVehStartDate;
          }
          else {
            minDate = this.tagStartDate;
          }
        }
        else {
          minDate = convertedVehStartDate;
        }

        let edate = new Date(event.value);
        let convertedEDate = new Date(edate.getFullYear(), edate.getMonth(), edate.getDate(), edate.getHours(), edate.getMinutes(), edate.getSeconds());
        let b = new Date(vehicles.EndEffectiveDate);
        let convertedVehEndDate = new Date(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());

        if (this.isTagDataAvailable) {
          if (new Date(this.tagEndDate) > convertedVehEndDate) {
            maxDate = convertedVehEndDate;
          }
          else {
            maxDate = this.tagEndDate;
          }
        }
        else {
          maxDate = convertedVehEndDate;

        }
        this.myDatePickerOptionsGridStart = {
          dateFormat: 'mm/dd/yyyy',
          disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },
          disableSince: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() + 1 },
          firstDayOfWeek: 'mo', sunHighlight: false,
          inline: false, height: '34px', width: '150px',
          alignSelectorRight: true, indicateInvalidDate: true,
          indicateInvalidDateRange: true,
          showClearBtn: false,
          showApplyBtn: false,
          showClearDateBtn: false,
        };
        this.myDatePickerOptionsGridEnd = {
          dateFormat: 'mm/dd/yyyy',
          // disableUntil: { year: event.date.year, month: event.date.month, day: event.date.day },
          // disableSince: { year: maxDate.getFullYear(), month: maxDate.getMonth() + 1, day: maxDate.getDate() + 1 },
          disableUntil: { year: event.getFullYear(), month: event.getMonth(), day: event.getDate() },
          disableSince: { year: maxDate.getFullYear(), month: maxDate.getMonth(), day: maxDate.getDate() },
          firstDayOfWeek: 'mo', sunHighlight: false,
          inline: false, height: '34px', width: '150px',
          alignSelectorRight: true, indicateInvalidDate: true,
          indicateInvalidDateRange: true,
          showClearBtn: false,
          showApplyBtn: false,
          showClearDateBtn: false,
        };
        vehicles.Endrow_no = {
          date: {
            year: edate.getFullYear(),
            month: edate.getMonth() + 1,
            day: edate.getDate()
          }
        };


        if (this.vehicleResSelected != null && this.vehicleResSelected.length > 0) {
          if (this.vehicleResSelected.filter(x => x.VehicleId === vehicles.VehicleId).length > 0) {
            if (convertedSDate < convertedVehStartDate) {
              this.errorMessageBlock("Association Start date should not be less than vehicle Start date.\n Minimum date should be: " + minDate);
              return;
            }
            if (this.isTagDataAvailable) {
              if (convertedSDate < this.tagStartDate)
                this.errorMessageBlock("Association start date should not be less than tag start date. \n Minimum date should be: " + minDate);
              return;
            }
          }
        }
        this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].StartEffectiveDate = convertedSDate;
        console.clear();
        console.log(this.vehicleResSelected);
      }
    }
  }

  getAsocatedCountBySerial(id: number) {
    this.tagService.GetActiveAssocCountBySerialNo(id.toString()).subscribe(
      res => {
        this.assocCount = res;
        this.maxCount -= this.assocCount;
        if (this.maxCount < 0) {
          this.maxCount = 0
        }
      }
    )
  }

  getSerialNumber() {
    this.tagService.getSerialNumByTagTypeAndTagStatus(this.customerId).subscribe(res => {
      this.serialNumResponse = res
      console.log("res", this.serialNumResponse);
    });
    this.tagService.getVehiclesByAccountId(this.customerId).subscribe(res => {      
      this.vehicleResponse = res
      this.vehicleResponse.forEach(x => x.IsSelected = false);
      this.bindCustomerAssocInfo();
    });
    this.tagService.getVehicleDetailsByTagId(this.serialNumber).subscribe(res => this.vehicleDetailsResponse = res);
  }
  bindCustomerInfo() {
    this.tagService.bindCustomerInfoDetails(this.customerContextResponse.AccountId).subscribe(
      res => {
        this.customerInformationres = res;

      }, (err) => { }
      , () => {
        if (this.customerInformationres) {
          this.customerId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.customerContextResponse.AccountId;
          this.getSerialNumber();
        }
      }
    )
  }

  deactivateAssociation(id: number) {
    this.tagService.deactivateAssociation(id.toString()).subscribe(
      res => {
        this.clearFields();
        this.successMessageBlock("Deactivation occurred successfully.");
        this.bindCustomerInfo();
        this.bindCustomerAssocInfo();
      }, (err) => {
        this.clearFields();
        this.errorMessageBlock("Error occurred while deactivating the vehicle association");
      }
    )
  }

  assocPageNumber: number = 1;
  assocPageItemNumber: number = 5;
  assocStartItemNumber: number = 1;
  assocEndItemNumber: number = this.assocPageItemNumber;
  assocTotalRecordCount: number;
  cashPageChanged(event) {
    this.assocPageNumber = event;
    this.assocStartItemNumber = (((this.assocPageNumber) - 1) * this.assocPageItemNumber) + 1;
    this.assocEndItemNumber = ((this.assocPageNumber) * this.assocPageItemNumber);
    if (this.assocEndItemNumber > this.assocTotalRecordCount)
      this.assocEndItemNumber = this.assocTotalRecordCount;
    this.bindCustomerAssocInfo();
  }

  bindCustomerAssocInfo() {
    this.assocRequest = <IVehicleRequest>{};
    this.assocRequest.SortColumn = "VEHICLENUMBER";
    this.assocRequest.SortDirection = true;
    this.assocRequest.PageNumber = this.assocPageNumber;
    this.assocRequest.PageSize = this.assocPageItemNumber;
    this.tagService.bindCustomerAssocDetails(this.customerContextResponse.AccountId, this.assocRequest).subscribe(
      res => {
        this.assocResponse = res;
        if (this.assocResponse.length > 0 && this.assocResponse != null) {
          this.assocTotalRecordCount = this.assocResponse[0].RecordCount;
        }
        if (this.assocTotalRecordCount < this.assocPageItemNumber) {
          this.assocEndItemNumber = this.assocTotalRecordCount
        }
      }, (err) => { }
      , () => {

      }
    )
  }

  minimumDate: any;

  onCheckChange(event, vehicles: IVehicleResponse) {
    console.log("data" + JSON.stringify(vehicles));
    let id = event.target.value;
    let minDate;
    let maxDate;
    if (this.vehicleResSelected.length > 0) {
      if (this.vehicleResSelected.filter(x => x.VehicleId === parseInt(id)).length > 0) {
        vehicles.Endrow_no = null;
        vehicles.Startrow_no = null;
        this.vehicleCheckedCount--;
        this.vehicleResSelected = this.vehicleResSelected.filter(x => x.VehicleId != id);
      }
      else {
        if (this.vehicleCheckedCount + 1 > this.maxCount) {
          this.errorMessageBlock("Maximum " + this.maxCount + " vehicles can be associated for " + this.dropdownValue + " " + this.selectedTagType);
          this.vehicleResponse.filter(x => x.VehicleId === vehicles.VehicleId)[0].IsSelected = false;
          return;
        }
        this.vehicleResSelected.push(vehicles);
        this.vehicleCheckedCount++;
        console.log(this.vehicleResSelected);
      }
    }
    else {
      if (this.vehicleCheckedCount + 1 > this.maxCount) {
        this.vehicleResponse.filter(x => x.VehicleId === vehicles.VehicleId)[0].IsSelected = false;
        this.errorMessageBlock("Maximum " + this.maxCount + " vehicles can be associated for " + this.dropdownValue + " " + this.selectedTagType);
        return;
      }
      this.vehicleResSelected.push(vehicles);
      console.log(this.vehicleResSelected);
      this.vehicleCheckedCount++;
    }
    if (this.vehicleCheckedCount == 0) {
      this.errorMessageBlock("Select atleast a Vehicle to process.");
      return false;
    }
    if (this.dropdownValue != "") {
      this.tagService.getVehicleDetailsByTagId(this.dropdownValue).subscribe(res => {
        this.vehicleDetailsResponse = res;
      });
    }
    else {
      this.errorMessageBlock("Select Tag Serial Number to process.");
      return false;
    }




    if (this.isTagDataAvailable) {
      if (new Date(this.tagStartDate) < new Date(vehicles.StartEffectiveDate)) {
        this.minimumDate = minDate = new Date(vehicles.StartEffectiveDate);
        if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
        this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].StartEffectiveDate = minDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");

      }
      else {
        this.minimumDate = minDate = new Date(this.tagStartDate);
        if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
        this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].StartEffectiveDate = minDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");

      }
    }
    else {
      this.minimumDate = minDate = new Date(vehicles.StartEffectiveDate);
      if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
      this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].StartEffectiveDate = minDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");

    }
    if (new Date(minDate) < new Date()) {
      this.minimumDate = minDate = new Date();
      if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
      this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].StartEffectiveDate = minDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
    }

    // if (this.isTagDataAvailable) {
    //   if (new Date(this.tagEndDate) > new Date(vehicles.EndEffectiveDate)) {
    //     maxDate = new Date(vehicles.EndEffectiveDate);;
    //   }
    //   else {
    //     maxDate = new Date(this.tagEndDate);
    //   }
    // }
    // else {
    //   maxDate = new Date(vehicles.EndEffectiveDate);

    // }

    // let date = new Date(vehicles.StartEffectiveDate);
    // let endDate = new Date(vehicles.EndEffectiveDate);
    if (this.isTagDataAvailable) {
      if (new Date(this.tagEndDate) > new Date(vehicles.EndEffectiveDate)) {
        maxDate = new Date(vehicles.EndEffectiveDate);
        var date = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), maxDate.getHours(), maxDate.getMinutes(), maxDate.getSeconds());
        if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
        this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].EndEffectiveDate = date.toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }
      else {
        maxDate = new Date(this.tagEndDate);
        var date = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), maxDate.getHours(), maxDate.getMinutes(), maxDate.getSeconds());
        if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
        this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].EndEffectiveDate = date.toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }
    }
    else {
      maxDate = new Date(vehicles.EndEffectiveDate);
      var date = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), maxDate.getHours(), maxDate.getMinutes(), maxDate.getSeconds());
      if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
      this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].EndEffectiveDate = date.toLocaleString(defaultCulture).replace(/\u200E/g, "");
    }

    this.myDatePickerOptionsGridStart = {
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },
      disableSince: { year: maxDate.getFullYear(), month: maxDate.getMonth() + 1, day: maxDate.getDate() + 1 },
      firstDayOfWeek: 'mo', sunHighlight: false,
      inline: false, height: '34px', width: '150px',
      alignSelectorRight: true, indicateInvalidDate: true,
      indicateInvalidDateRange: true,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false,
    };

    this.myDatePickerOptionsGridEnd = {
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },
      disableSince: { year: maxDate.getFullYear(), month: maxDate.getMonth() + 1, day: maxDate.getDate() + 1 },
      firstDayOfWeek: 'mo', sunHighlight: false,
      inline: false, height: '34px', width: '150px',
      alignSelectorRight: true, indicateInvalidDate: true,
      indicateInvalidDateRange: true,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false,
    };
  }

  setEndEfficetiveDate(vehicles, event) {
    if (event) {
      var date = new Date(event.date.year, event.date.month - 1, event.date.day);
      // let date = new Date(event.value);
      var endDate = new Date(vehicles.EndEffectiveDate);

      this.myDatePickerOptionsGridEnd = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: event.date.year, month: event.date.month, day: event.date.day },
        // disableSince: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() + 1 },
        //disableUntil: { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() },
        // disableSince: { year: endDate.getFullYear(), month: endDate.getMonth(), day: endDate.getDate() },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, height: '34px', width: '150px',
        alignSelectorRight: true, indicateInvalidDate: true,
        indicateInvalidDateRange: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
      };
      vehicles.Endrow_no = {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      };
      //date=new Date(event.date.year, event.date.month - 1, event.date.day, 23, 59, 59, 997)
      let edate = new Date(event.date.year, event.date.month - 1, event.date.day, 23, 59, 59, 997);
      if(this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != undefined && this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0] != null)
      this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId)[0].EndEffectiveDate = new Date(edate).toLocaleString(defaultCulture).replace(/\u200E/g, "");
    }

    if (this.vehicleResSelected != null && this.vehicleResSelected.length > 0) {
      if (this.vehicleResSelected.filter(x => x.VehicleId == vehicles.VehicleId).length > 0) {
        var enteredStartDate = new Date(date);
        let datePlanStartDate = new Date(endDate);
        // if (new Date(enteredStartDate) > new Date(datePlanStartDate)) {
        //   this.errorMessageBlock("Association Start date should not be less than vehicle Start date.\n Minimum date should be: " + datePlanStartDate);
        //   return;
        // }
        // if (this.isTagDataAvailable) {
        //   if (new Date(enteredStartDate) < new Date(this.tagStartDate)) {
        //     this.errorMessageBlock("Association start date should not be less than tag start date. \n Minimum date should be: " + enteredStartDate);
        //     return;
        //   }
        // }
      }
      this.vehicleResSelected.filter(x => x.VehicleId === vehicles.VehicleId)[0].StartEffectiveDate = enteredStartDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
      let minimumDateTime = (this.minimumDate);
      if (new Date(minimumDateTime).toDateString() == enteredStartDate.toDateString()) {
        enteredStartDate = new Date(enteredStartDate.getFullYear(), enteredStartDate.getMonth(), enteredStartDate.getDate(), this.minimumDate.getHours(), this.minimumDate.getMinutes(), this.minimumDate.getSeconds());
        this.vehicleResSelected.filter(x => x.VehicleId === vehicles.VehicleId)[0].StartEffectiveDate = enteredStartDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
      }
      console.clear();
      console.log(this.vehicleResSelected);
    }
  }

  setEndEfficetive(vehicles, event) {
    if (event) {//this.vehicleRequest.EndEffectiveDate.setHours(23, 59, 59, 997);
      var date = new Date(event.date.year, event.date.month - 1, event.date.day, 23, 59, 59, 997);
      this.vehicleResSelected.filter(x => x.VehicleId === vehicles.VehicleId)[0].EndEffectiveDate = date.toLocaleString(defaultCulture).replace(/\u200E/g, "");
    }
  }
  associateTagstoVehicle(vehicleResSelected) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TAG];
    userEvents.ActionName = Actions[Actions.ASSOCIATETAG];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    if (this.dropdownValue != "") {
      if (this.vehicleCheckedCount == 0) {
        this.errorMessageBlock("Select atleast a Vehicle to process.");
        return;

      }
      var varCount = this.vehicleTagCount - this.vehicleCountByTagId;
      if (varCount == 0) {
        this.errorMessageBlock("Cannot assign to more than " + this.vehicleCountByTagId + " vehicles.");
        return;
      }
      else if (this.vehicleCheckedCount > varCount) {
        this.errorMessageBlock("Cannot assign to more than " + varCount + " vehicles.");
        return;
      }
      else {
        debugger;
        this.vehicleRequest = <IVehicleRequest>{};
        if (this.vehicleResSelected.length > 0) {
          for (var i = 0; i < this.vehicleResSelected.length; i++) {
            this.vehicleRequest.TagSerialNum = this.associateForm.value.serialno;
            this.vehicleRequest.VehicleId = vehicleResSelected[i].VehicleId;
            this.vehicleRequest.VehicleNumber = vehicleResSelected[i].VehicleNumber;
            this.vehicleRequest.UserName = this.sessionContextResponse.userName;
            this.vehicleRequest.AccountId = this.customerId;
            this.vehicleRequest.StartEffectiveDate = vehicleResSelected[i].StartEffectiveDate;
            this.vehicleRequest.EndEffectiveDate = vehicleResSelected[i].EndEffectiveDate;
            console.log("service Request" + JSON.stringify(this.vehicleRequest));
            this.tagService.updateVehicleTagIdByVehicleId(this.vehicleRequest, userEvents).subscribe(res => {
              if (res) {
                this.clearFields();
                this.successMessageBlock("Successfully updated TagId for selected vehicles.");
                this.vehicleResSelected = [];
              }
              else {
                this.errorMessageBlock("Error while update TagId for selected vehicles");
                this.vehicleResSelected = [];
                return;
              }
            },
              (err) => {
                this.errorMessageBlock(err.statusText.toString());
                this.vehicleResSelected = [];
                return;
              },
              () => {
              });
          }
        }
        else if (this.vehicleCheckedCount == 0) {
          this.errorMessageBlock("Select atleast a Vehicle to process.");
          return false;

        }
      }
    }
    else {
      this.validateAllFormFields(this.associateForm);
      this.errorMessageBlock("Select Tag Serial Number to process.");
      return;
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  clearFields() {
    this.associateForm.reset();
    this.dropdownValue = '';
    this.vehicleCheckedCount = 0;
    this.getSerialNumber();
  }

  onCancelClick() {
    this.router.navigateByUrl("csc/customerdetails/manage-tags");
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
    this.msgTitle = 'Error';
  }
  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
    this.msgTitle = 'Success';
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }


  // minmaxDate(minDate, maxDate) {
  //   if (minDate != null) {
  //     let date = new Date(minDate.value);
  //     // this.myDatePickerOptionsGridStart = {
  //     //   dateFormat: 'mm/dd/yyyy',
  //     //   disableUntil: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() - 1 },
  //     //   firstDayOfWeek: 'mo', sunHighlight: false,
  //     //   inline: false, height: '34px', width: '150px',
  //     //   alignSelectorRight: true, indicateInvalidDate: true,
  //     //   indicateInvalidDateRange: true,
  //     //   showClearBtn: false,
  //     //   showApplyBtn: false,
  //     //   showClearDateBtn: false,
  //     // };
  //   } else {
  //     let date = new Date(maxDate.value);
  //     this.myDatePickerOptionsGridStart = {
  //       dateFormat: 'mm/dd/yyyy',
  //       disableUntil: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() - 1 },
  //       firstDayOfWeek: 'mo', sunHighlight: false,
  //       inline: false, height: '34px', width: '150px',
  //       alignSelectorRight: true, indicateInvalidDate: true,
  //       indicateInvalidDateRange: true,
  //       showClearBtn: false,
  //       showApplyBtn: false,
  //       showClearDateBtn: false,
  //     };
  //     this.myDatePickerOptionsGridEnd = {
  //       dateFormat: 'mm/dd/yyyy',
  //       disableUntil: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() - 1 },
  //       firstDayOfWeek: 'mo', sunHighlight: false,
  //       inline: false, height: '34px', width: '150px',
  //       alignSelectorRight: true, indicateInvalidDate: true,
  //       indicateInvalidDateRange: true,
  //       showClearBtn: false,
  //       showApplyBtn: false,
  //       showClearDateBtn: false,
  //     };
  //   }

  // }
}
