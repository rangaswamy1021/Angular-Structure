import { Router } from '@angular/router';
import { IUserEvents } from './../../shared/models/userevents';
import { FeeTypes } from './constants';
import { ConvertToSpacesPipe } from './../../shared/pipes/convert-to-spaces.pipe';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { IFeeTypesResponse } from './models/feetypes.response';
import { IFeeTypesRequest } from './models/feetypes.request';
import { Observable } from 'rxjs';
import { Component, OnInit, Renderer, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { FeeTypesService } from "./services/fees.service";
import { Features, Actions, defaultCulture } from '../../shared/constants';
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-add-fees',
  templateUrl: './add-fees.component.html',
  styleUrls: ['./add-fees.component.scss']
})
export class AddFeesComponent implements OnInit {
  toDayDate = new Date();
  invalidDate: boolean;
  invalid: boolean;
  myDatePickerOptions2: ICalOptions;
  myDatePickerOptions1: ICalOptions;
  @Output() isAdd: EventEmitter<boolean> = new EventEmitter<boolean>();
  createForm: FormGroup;
  getFeesRequest: IFeeTypesRequest = <IFeeTypesRequest>{};
  getfeeresp: IFeeTypesResponse;
  lbAmount: string;
  successMessage: string;
  faileureMessge: string;
  feecodeExists: boolean = false;
  minDate;
  // maxDate = new Date(2100, 9, 15);
  bsValue1: Date;
  _bsValue: Date;
  bsvalue: Date;
  sessionContextResponse: IUserresponse;
  feeCodeExist: boolean;
  validateNumberPattern = "^[0-9]*(\.)?[0-9]{1,2}$";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  activeCheck: boolean;
  percenCheck: boolean;
  amntCheck: boolean;
  inActiveCheck: boolean;
  isFeeAtCreate: boolean;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  descLength: number = 250;
  get bsValue(): Date {
    console.log(this._bsValue);
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
  _bsRangeValue: any = [new Date(), new Date()];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }

  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }

  log(v: any) { console.log(v); }

  constructor(private feeService: FeeTypesService, public renderer: Renderer, private context: SessionService, private sessionContext: SessionService
    , private router: Router, private materialscriptService: MaterialscriptService) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }
  @ViewChild('AddFeediv') public AddFeediv: ElementRef
  @ViewChild('BtnAddFeediv') public BtnAddFeediv: ElementRef
  @ViewChild('SuccessMessage') public SuccessMessage: ElementRef
  @ViewChild('FailureMessage') public FailureMessage: ElementRef
  ngOnInit() {
    this.materialscriptService.material();
    this.successMessage = "";
    this.faileureMessge = "";
    this.activeCheck = true;
    this.amntCheck = true;
    this.intialzeFormValidations();

    this.myDatePickerOptions1 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false

    };
  }

  intialzeFormValidations() {
    this.createForm = new FormGroup({
      'feeCode': new FormControl('', [Validators.required, Validators.maxLength(15), Validators.pattern(this.validateAlphaNumericsPattern)]),
      'feeName': new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      'feeDesc': new FormControl('', [Validators.required, Validators.maxLength(250)]),
      'amount': new FormControl('', [Validators.required, Validators.pattern(this.validateNumberPattern)]),
      'status': new FormControl('active', []),
      'feeFactor': new FormControl('AmountBased', []),
      'chkFee': new FormControl('', []),
      'strtDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
    });
    this.lbAmount = "Amount:";
  }

  addFeeType(): void {
    this.getFeesRequest.LoginId = this.sessionContextResponse.loginId;
    this.getFeesRequest.UserId = this.sessionContextResponse.userId;
    this.getFeesRequest.PerformedBy = this.sessionContextResponse.userName;
    //this.formValidations();
    this.getFeesRequest.FeeCode = this.createForm.controls['feeCode'].value;
    this.getFeesRequest.FeeName = this.createForm.controls['feeName'].value;
    this.getFeesRequest.FeeDescription = this.createForm.controls['feeDesc'].value;
    this.getFeesRequest.Amount = this.createForm.controls['amount'].value;
    this.getFeesRequest.Status = this.createForm.controls['status'].value;
    if (this.getFeesRequest.Status == "" || this.getFeesRequest.Status == null) {
      if (this.activeCheck) {
        this.getFeesRequest.Status = "active";
        this.getFeesRequest.IsActive = true;
      }
      else {
        this.getFeesRequest.Status = "inactive";
        this.getFeesRequest.IsActive = false;
      }
    }
    if (this.getFeesRequest.Status == "active")
      this.getFeesRequest.IsActive = true;
    this.getFeesRequest.FeeFactor = this.createForm.controls['feeFactor'].value;
    if (this.getFeesRequest.FeeFactor == "" || this.getFeesRequest.FeeFactor == null) {
      if (this.amntCheck)
        this.getFeesRequest.FeeFactor = "AmountBased";
      else
        this.getFeesRequest.FeeFactor = "PercentageBased";
    }
    this.getFeesRequest.IsFeeAppliedatCreateAccount = this.createForm.controls['chkFee'].value;

    if (this.createForm.valid) {
      let startDate = this.createForm.controls['strtDate'].value;
      let endDate = this.createForm.controls['endDate'].value;
      this.getFeesRequest.StartDate = (new Date(startDate.date.month + '/' + startDate.date.day + '/' + startDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.getFeesRequest.EndDate = (new Date(endDate.date.month + '/' + endDate.date.day + '/' + endDate.date.year)).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      if (new Date(this.getFeesRequest.StartDate) > new Date(this.getFeesRequest.EndDate)) {
        // this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = " End Effective Date should not be less than Start Effective Date";
        this.msgTitle = '';
        return;
      }
      this.verifyFeeCode(this.getFeesRequest.FeeCode);
    }
    else {
      this.validateAllFormFields(this.createForm);
    }
  }

  verifyFeeCode(feeCode: string) {
    let isExist = false;
    this.feeService.feeCodeExists(feeCode).subscribe(res => {
      this.feecodeExists = res;
      if (!isExist) {
        this.addFees();
      }
    }, err => {
      isExist = true;
      this.faileureMessge = err.statusText;
      if (this.faileureMessge = "Already Exists")
        this.faileureMessge = "Fee Code Already Exists";
      this.successMessage = "";
    });

  }

  addFees() {
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FEETYPES];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.feeService.addFees(this.getFeesRequest, userEvents).subscribe(res => {
      if (res) {
        this.createForm.reset();
        this.renderer.setElementStyle(this.AddFeediv.nativeElement, 'display', 'none');
        this.isAdd.emit(true);
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText;
      console.log(err.statusText);
      if (err.statusText == "End Date should not be less than Start Date")
        this.msgDesc = "End Date should not be less than Start Date";
      //this.createForm.reset();
    }
    );
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

  factorChange(): void {
    if (this.createForm.controls['feeFactor'].value == "AmountBased") {
      this.lbAmount = "Amount:";
    }
    else
      this.lbAmount = "Percentage:";
  }

  closeDiv(): void {
    this.isAdd.emit(false);
    this.successMessage = "";
    this.faileureMessge = "";
    this.renderer.setElementStyle(this.AddFeediv.nativeElement, 'display', 'none');
  }

  resetDiv(): void {
    this.createForm.reset();
    this.intialzeFormValidations();
    console.log(this.createForm.controls["status"].value);
    this.materialscriptService.material();
   this.descLength=250;
    
  }
  descEvent(event: any) {
    this.descLength = 250 - event.target.value.length
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }


  endEffectiveDate() {
    this.minDate = this.createForm.controls["strtDate"].value;
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
    let date = this.createForm.controls["strtDate"].value;
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
    let date = this.createForm.controls["endDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}

