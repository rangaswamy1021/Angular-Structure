import { IUserEvents } from './../../shared/models/userevents';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Renderer, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from './../../shared/services/common.service';
import { Features, LookupTypeCodes, Actions } from './../../shared/constants';
import { ICommonResponse } from './../../shared/models/commonresponse';
import { any } from 'codelyzer/util/function';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { ITollRatesResponse } from './models/tollratesresponse';
import { IPaging } from './../../shared/models/paging';
import { ITollRatesRequest } from './models/tollratesrequest';
import { TollRatesService } from './services/tollrates.service';
import { Router } from '@angular/router';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-toll-rates',
  templateUrl: './manage-toll-rates.component.html',
  styleUrls: ['./manage-toll-rates.component.scss']
})
export class ManageTollRatesComponent implements OnInit {
  vehicleClasses: any;
  gridArrowCLASS2L: boolean;
  gridArrowTXNMETHOD: boolean;
  gridArrowTOLLRATENAME: boolean;
  gridArrowLANETYPE: boolean;
  gridArrowRETAILERID: boolean;
  sortingColumn: string;
  sortingDirection: boolean;
  addDisableButton: boolean;
  msgTitle: string;
  msgDesc: string;
  tollHdrId: any;
  laneTypes: ICommonResponse[];
  sessionContextResponse: IUserresponse;
  addRatesForm: FormGroup;
  getTollRequest: ITollRatesRequest;
  addNewRate = false;
  fieldDisabled: boolean;
  successMessage: string;
  faileureMessge: string;
  tollRateTitle: string;
  isDisabled: boolean = false;
  resetHide: boolean;
  msgFlag: boolean;
  msgType: string;
  tollRates: ITollRatesResponse[] = <ITollRatesResponse[]>[{}];
  tollRateId: number;
  tollRateName: string;
  laneType: string;
  txnMethod: string;
  class2L: Number;
  class2H: Number;
  class3L: Number;
  class3H: Number;
  class4H: Number;
  class5H: Number;
  class6H: Number;
  class7H: Number;
  buttonType: String;
  validateNumberPattern = "[0-9]+(\.[0-9][0-9]?)?";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  validateExceptAnglePattern = "[^<>]*";
  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
 
  constructor(private materialscriptService: MaterialscriptService, private tollRatesService: TollRatesService, public renderer: Renderer, private sessionContext: SessionService, private router: Router, private commonService: CommonService) {

    this.sessionContextResponse = this.sessionContext.customerContext;
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  resetTollRate(){     
    this.addRatesForm.reset();
    this.materialscriptService.material();
  }
  tollRatesPatchValue(tollRatedata) {
    let laneType = "LOV";
    if (tollRatedata.LaneType == "Heavy Occupancy Vehicles") {
      laneType = "HOV";
    }
    this.addRatesForm.patchValue({
      tollRateName: tollRatedata.TollRateName,
      laneType: laneType,
      txnMethod: tollRatedata.TxnMethod,
      tollRateId: tollRatedata.TollHdrId,
     
    })
    tollRatedata['DicVehicleClass'].forEach(element => {
                        let key='class'+ element.Code.trim();
                         this.addRatesForm.controls[key].setValue(element.ThresholdAmount)
                      });
   
this.materialscriptService.material();
  }


  showRates(type, tollRatedata) {
    this.addNewRate = true;
    this.buttonType = type;
    this.tollHdrId = tollRatedata.TollHdrId;
    this.successMessage = "";
    this.faileureMessge = "";
    
    let rootSel=this;
    setTimeout(function(){rootSel.materialscriptService.material()},100);
    if (type == 'update') {
        this.materialscriptService.material();
      this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
        Actions[Actions.UPDATE], "");
      this.tollRatesPatchValue(tollRatedata);
      this.fieldDisabled = false;
      this.isDisabled = false;
      this.resetHide = false;
      this.tollRateTitle = "Update Toll Rate Details";
    } else if (type == 'add') {

      this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
        Actions[Actions.CREATE], "");
      this.addRatesForm.reset();
      this.fieldDisabled = false;
      this.isDisabled = false;
      this.tollRateTitle = "Add New Rate";
      this.successMessage = "";

    } else {
      if (type == 'delete') {

        this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
          Actions[Actions.DELETE], "");
        this.tollRatesPatchValue(tollRatedata);
        this.tollRateTitle = "Delete Toll Rate Details";
        this.isDisabled = true;
        this.fieldDisabled = true;
        this.resetHide = true;
      }
    }

  }
  getVehicleClasses(){
    this.tollRatesService.vehicleClasses().subscribe(res=>{
      this.vehicleClasses=res;
      this.createAddRatesForm();
      console.log(this.vehicleClasses);
    })
  }
  createAddRatesForm() {
    this.addRatesForm = new FormGroup({
      tollRateName: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
      laneType: new FormControl('', Validators.required),
      txnMethod: new FormControl('TAG'),
     
    });

    for (let item of this.vehicleClasses) {
      let control: FormControl = new FormControl(item.TagFee, Validators.compose([Validators.required, Validators.pattern(this.validateNumberPattern)]));
      let name='class'+item.Code;
      this.addRatesForm.addControl(name, control);
    }

  }

  getTollRateDetails(userEvents) {

    this.getTollRequest = <ITollRatesRequest>{};
    this.getTollRequest.LoginId = this.sessionContextResponse.loginId;
    this.getTollRequest.UserId = this.sessionContextResponse.userId;
    this.getTollRequest.PerformedBy = this.sessionContextResponse.userName;
    this.getTollRequest.ViewFlag = true;
    this.getTollRequest.Paging = <IPaging>{};
    this.getTollRequest.Paging.PageNumber = 1;
    this.getTollRequest.Paging.PageSize = 50;
    this.getTollRequest.Paging.SortDir = this.sortingDirection == true ? 1 : 0;
    // this.getTollRequest.Paging.SortColumn = "TOLLRATENAME";
    this.getTollRequest.Paging.SortColumn = this.sortingColumn;
    this.tollRatesService.bindTollRateDetails(this.getTollRequest, userEvents).subscribe(res => {
      this.tollRates = res;
      console.log("res",res);
      this.dataLength = res.length;
      if (this.endItemNumber < res.length)
        this.endItemNumber = res.length;
    });

  }

  ngOnInit() {
    this.getVehicleClasses();
      this.materialscriptService.material();
    let self = this;
    setTimeout(function () {
      self.materialscriptService.material();
    }, 1000);
    this.gridArrowTOLLRATENAME = true;
    this.sortingColumn = "TOLLRATENAME";
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TOLLRATES];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.getTollRateDetails(userEvents);
    this.bindLaneTypes();
    this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
      Actions[Actions.CREATE], "");
  }

  bindLaneTypes() {
    let lookuptype = <ICommonResponse>{};
    lookuptype.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.LaneTypes];
    this.commonService.getLookUpByParentLookupTypeCode(lookuptype).subscribe(
      res => {
        this.laneTypes = res;
      }, err => {
        this.faileureMessge = err.statusText;
        return;
      });
  }
  addNewRates(type): void {
    debugger;
    this.getTollRequest.LoginId = this.sessionContextResponse.loginId;
    this.getTollRequest.UserId = this.sessionContextResponse.userId;
    this.getTollRequest.PerformedBy = this.sessionContextResponse.userName;
    this.getTollRequest.TollRateName = this.addRatesForm.controls['tollRateName'].value;
    this.getTollRequest.LaneType = this.addRatesForm.controls['laneType'].value;
    if (this.addRatesForm.controls['txnMethod'].value)
      this.getTollRequest.TxnMethod = this.addRatesForm.controls['txnMethod'].value;
    else
      this.getTollRequest.TxnMethod = 'TAG';
      let tollAmount='',vehicleClass='';
     for (let item of this.vehicleClasses) {
       if(tollAmount==''){
        tollAmount=parseFloat(this.addRatesForm.controls['class'+item.Code].value).toFixed(2)
       }
       else{
        tollAmount+=','+parseFloat(this.addRatesForm.controls['class'+item.Code].value).toFixed(2)
        
      }
      if(vehicleClass==''){
        vehicleClass=item.Code;
      }
      else
       vehicleClass+=','+item.Code;
     }
    this.getTollRequest.TollAmount = tollAmount;
    this.getTollRequest.VehicleClass = vehicleClass;

    if (type == 'add') {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TOLLRATES];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      if ((this.addRatesForm.valid)) {
        this.tollRatesService.createTollRateDetails(this.getTollRequest, userEvents).subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Toll rate " + this.addRatesForm.controls['tollRateName'].value + " has been added successfully";
            this.msgTitle = '';
            this.addRatesForm.reset();
            this.addNewRate = !this.addNewRate;
            this.getTollRateDetails(null);
          } else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = "Unable to add Toll rate";
            this.msgTitle = '';
            this.addRatesForm.reset();
            this.addNewRate = !this.addNewRate;
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        });
      } else {
        this.validateAllFormFields(this.addRatesForm);
      }

    }
    else if (type == 'update') {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TOLLRATES];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getTollRequest.TollRateHdrId = this.tollHdrId;
      this.tollRatesService.updateTollRateDetails(this.getTollRequest, userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = "Toll rate has been updated successfully for " + this.addRatesForm.controls['tollRateName'].value;
          this.msgTitle = '';
          this.addRatesForm.reset();
          this.addNewRate = !this.addNewRate;
          this.getTollRateDetails(null);
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Unable to update Toll rate";
          this.msgTitle = '';
          this.addRatesForm.reset();
          this.addNewRate = !this.addNewRate;
        }
        this.getTollRateDetails(null);
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;;
        this.msgTitle = '';
        return;
      });

    }
    else {
      if (type == 'delete') {
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = 'Are you sure you want to delete Toll Rate ?';
        this.msgTitle = '';
        this.getTollRequest.TollRateId = this.tollHdrId;
      }
    }
  }

  setOutputFlag(event) {
    this.msgFlag = event;
  }


  userAction(event) {
    if (event) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TOLLRATES];
      userEvents.SubFeatureName = "";
      userEvents.ActionName = Actions[Actions.DELETE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.tollRatesService.deleteTollRateDetails(this.getTollRequest, userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = "Toll rate " + this.addRatesForm.controls['tollRateName'].value + " has been deleted successfully";
          this.msgTitle = '';
          this.addRatesForm.reset();
          this.addNewRate = !this.addNewRate;
          this.getTollRateDetails(null);
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Unable to delete Toll rate";
          this.msgTitle = '';
          this.addRatesForm.reset();
          this.addNewRate = !this.addNewRate;
        }
        this.getTollRateDetails(null);
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
      this.msgFlag = false;
    }
  }
  cancelRates() {
    this.addNewRate = !this.addNewRate;
    this.faileureMessge = "";
    this.successMessage = "";
    this.addRatesForm.reset();

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

  sortDirection(SortingColumn) {
    this.gridArrowTOLLRATENAME = false;
    this.gridArrowLANETYPE = false;
    this.gridArrowTXNMETHOD = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "TOLLRATENAME") {
      this.gridArrowTOLLRATENAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "LANETYPE") {
      this.gridArrowLANETYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "TXNMETHOD") {
      this.gridArrowTXNMETHOD = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.getTollRateDetails(null);
  }


}
