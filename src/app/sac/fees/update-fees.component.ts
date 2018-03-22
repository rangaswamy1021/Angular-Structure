import { Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { SessionService } from './../../shared/services/session.service';
import { IUserresponse } from './../../shared/models/userresponse';
import { IFeeTypesResponse } from './models/feetypes.response';
import { IFeeTypesRequest } from './models/feetypes.request';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild, Renderer, Input, Output, EventEmitter } from '@angular/core';
import { FeeTypesService } from "./services/fees.service";
import { Features, defaultCulture } from '../../shared/constants';
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-update-fees',
  templateUrl: './update-fees.component.html',
  styleUrls: ['./update-fees.component.scss']
})
export class UpdateFeesComponent implements OnInit {
  descLength: number=250;
  toDayDate = new Date();
  invalidDate: boolean;
  invalid: boolean;
  @Input() id: number
  @Output() isUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
  updateFeeForm: FormGroup
  getFeeRequest: IFeeTypesRequest = <IFeeTypesRequest>{};
  getFeesResponse: IFeeTypesResponse = <IFeeTypesResponse>{};
  nggetFeesResponse: IFeeTypesResponse = <IFeeTypesResponse>{};
  sessionContextResponse: IUserresponse;
  //feeTypeId: number;
  myDatePickerOptions2: ICalOptions;
  myDatePickerOptions1: ICalOptions;
  minDate;
  maxDate = new Date(2100, 9, 15);
  bsvalue: Date;
  bsvalue1: Date;
  _bsValue: Date;
  lbAmount: string;
  validateNumberPattern = "^[0-9]*(\.)?[0-9]{1,2}$";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  activeCheck: boolean;
  inActiveCheck: boolean;
  percenCheck: boolean;
  amntCheck: boolean;
  isFeeAtCreate: boolean;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  get bsValue(): Date {
    console.log(this._bsValue);
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
  _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }

  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }

  get bsValue1(): Date {
    console.log(this._bsValue);
    return this._bsValue;
  }

  set bsValue1(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
  _bsRangeValue1: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue1(): any {
    return this._bsRangeValue;
  }

  set bsRangeValue1(v: any) {
    this._bsRangeValue = v;
  }


  log(v: any) { console.log(v); }

  constructor(private feeService: FeeTypesService, private router: Router, private route: ActivatedRoute, public renderer: Renderer, private sessionContext: SessionService, private materialscriptService: MaterialscriptService) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }
  @ViewChild('AddFeediv') public AddFeediv: ElementRef
  @ViewChild('BtnAddFeediv') public BtnAddFeediv: ElementRef

  ngOnChanges() {
    console.log(this.id);
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.nggetFeesResponse.FeeTypeId = this.id;
    this.updateFeeForm = new FormGroup({
      'feeCode': new FormControl('', [Validators.required, Validators.pattern(this.validateAlphaNumericsPattern)]),
      'feeName': new FormControl('', [Validators.required, Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      'feeDesc': new FormControl('', [Validators.required]),
      'amount': new FormControl('', [Validators.required, Validators.pattern(this.validateNumberPattern)]),
      'strtDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'status': new FormControl('', []),
      'feeFactor': new FormControl('', []),
      'chkFee': new FormControl('', [])
    });
    this.feeService.getFeesById(this.id).subscribe(
      res => {
        this.getFeesResponse = res;
        console.clear();
        console.log(this.getFeesResponse);
        this.bindData(this.getFeesResponse);
      }
    );

    this.myDatePickerOptions1 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false

    };

  }

  factorChange(): void {
    if (this.updateFeeForm.controls['feeFactor'].value == "AmountBased") {
      this.lbAmount = "Amount:";
    }
    else
      this.lbAmount = "Percentage:";
  }

  bindData(getFeesResponse: IFeeTypesResponse): void {
    this.nggetFeesResponse.FeeCode = this.getFeesResponse.FeeCode;
    this.nggetFeesResponse.FeeName = this.getFeesResponse.FeeName;
    this.nggetFeesResponse.FeeDescription = this.getFeesResponse.FeeDescription;
    this.nggetFeesResponse.Amount = this.getFeesResponse.Amount;
    // this.nggetFeesResponse.EndDate = this.getFeesResponse.EndDate;
    //  this.nggetFeesResponse.StartDate = this.getFeesResponse.StartDate;
    let startDate = new Date(this.getFeesResponse.StartDate);
    this.updateFeeForm.patchValue({
      strtDate: {
        date: {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate()
        }
      }
    });
    let endDate = new Date(this.getFeesResponse.EndDate);
    this.updateFeeForm.patchValue({
      endDate: {
        date: {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }
      }
    });
    this.myDatePickerOptions1 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
    };
    this.myDatePickerOptions2 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
    };


    if (this.getFeesResponse.IsActive) {
      this.activeCheck = true;
      this.inActiveCheck = false;
    }
    else {
      this.inActiveCheck = true;
      this.activeCheck = false;
    }
    if (!this.getFeesResponse.FeeFactor) {
      this.lbAmount = "Amount:";
      this.amntCheck = true;
      this.percenCheck = false;
    }
    else {
      this.lbAmount = "Percentage:";
      this.percenCheck = true;
      this.amntCheck = false;
    }
    if (this.getFeesResponse.IsFeeAppliedatCreateAccount) {
      this.isFeeAtCreate = true;
    }
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
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
  descEvent(event: any) {
    this.descLength = 250 - event.target.value.length
  }

  updateData(): void {
    debugger;
    if (this.updateFeeForm.valid) {
      this.getFeeRequest.LoginId = this.sessionContextResponse.loginId;
      this.getFeeRequest.UserId = this.sessionContextResponse.userId;
      this.getFeeRequest.PerformedBy = this.sessionContextResponse.userName;
      this.getFeeRequest.FeeCode = this.updateFeeForm.controls['feeCode'].value;
      this.getFeeRequest.FeeName = this.updateFeeForm.controls['feeName'].value;
      this.getFeeRequest.FeeDescription = this.updateFeeForm.controls['feeDesc'].value;
      this.getFeeRequest.Amount = this.updateFeeForm.controls['amount'].value;
      let startDate = this.updateFeeForm.controls['strtDate'].value;
      let endDate = this.updateFeeForm.controls['endDate'].value;
      this.getFeeRequest.StartDate = (new Date(startDate.date.month + '/' + startDate.date.day + '/' + startDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.getFeeRequest.EndDate = (new Date(endDate.date.month + '/' + endDate.date.day + '/' + endDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      if (new Date(this.getFeeRequest.StartDate) > new Date(this.getFeeRequest.EndDate)) {
        // this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "End Effective Date should not be less than Start Effective Date";
        console.log(this.msgDesc);
        return;
      }
      this.getFeeRequest.Status = this.updateFeeForm.controls['status'].value;
      if (this.getFeeRequest.Status == "" || this.getFeeRequest.Status == null) {
        if (this.activeCheck) {
          this.getFeeRequest.Status = "active";
          this.getFeeRequest.IsActive = true;
        }
        else {
          this.getFeeRequest.Status = "inactive";
          this.getFeeRequest.IsActive = false;
        }
      }
      if (this.getFeeRequest.Status == "active")
        this.getFeeRequest.IsActive = true;
      this.getFeeRequest.FeeFactor = this.updateFeeForm.controls['feeFactor'].value;
      if (this.getFeeRequest.FeeFactor == "" || this.getFeeRequest.FeeFactor == null) {
        if (this.amntCheck)
          this.getFeeRequest.FeeFactor = "AmountBased";
        else
          this.getFeeRequest.FeeFactor = "PercentageBased";
      }
      this.getFeeRequest.IsFeeAppliedatCreateAccount = this.updateFeeForm.controls['chkFee'].value;
      this.getFeeRequest.FeeTypeId = this.id;
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.FEETYPES];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.feeService.updateFees(this.getFeeRequest, userEvents).subscribe(res => {
        this.isUpdate.emit(true);
      });
    }
    else {
      this.validateAllFormFields(this.updateFeeForm);
    }
  }
  closeDiv(): void {
    this.isUpdate.emit(false);
  }

  endEffectiveDate() {
    this.minDate = this.updateFeeForm.controls["strtDate"].value;
    if (this.minDate) {
      this.myDatePickerOptions2 = {
        // other options...
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.minDate.date.year, month: this.minDate.date.month, day: this.minDate.date.day - 1 },
        inline: false,
        indicateInvalidDate: true,
        showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
      };
    }
  }

  onDateChanged1(event: IMyInputFieldChanged) {
    let date = this.updateFeeForm.controls["strtDate"].value;
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
    let date = this.updateFeeForm.controls["endDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
