import { IPlanResponse } from './models/plansresponse';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IinvoiceResponse } from './models/invoicecycleresponse';
import { ITollTypes } from './models/tolltypesresponse';
import { IStatementResponse } from './models/statementcycleresponse';
import { IPlanRequest } from './models/plansrequest';
import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { PlansService } from './services/plans.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationParameter, TollTypes, PlanEndEffDate } from './constants';
import { Router, ActivatedRoute } from '@angular/router';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { SubSystem, ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDpOptions } from "mydatepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-create-plans',
  templateUrl: './create-plans.component.html',
  styleUrls: ['./create-plans.component.css']
})

export class CreatePlansComponent implements OnInit {
  endinvalidDate: boolean;
  invalidDate: boolean = false;

  // variable declaration
  createForm: FormGroup;
  objPlanRequest: IPlanRequest = <IPlanRequest>{};
  getPlanResponse: IPlanResponse;
  isPlanBased: string;
  statementTypes: IStatementResponse[];
  invoiceTypes: IinvoiceResponse[];
  tollTypes: ITollTypes[];
  systemActivites: ISystemActivities;
  boolSubmit: boolean = true;
  getPlanResponses: IPlanResponse = <IPlanResponse>{};
  // to get id value
  @ViewChild('startDt') public startDt: ElementRef;
  @ViewChild('chkDate') public chkDate: ElementRef;
  @ViewChild('desc') public desc: ElementRef;
  @ViewChild('accountType') public accountTypes: ElementRef;
  @ViewChild('planCodes') public planCodes: ElementRef;
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ \'-][a-zA-Z0-9]+)*";
  validateIntialSpaces = "[^<> ][^<>]*";
  stmtCylce = "Statement Cycle";
  invCycle = "Invoice Cycle";
  boolCycle: boolean = true;
  planId: number;
  endDate: Date;
  disable: boolean = false;
  id: number = 250;
  descLength: number = 255;
  endEffectiveDate: number;
  planEndEffDate: number;
  disableButton: boolean = false;
  minDate = new Date();
  maxDate: Date;
  //bsValue1: Date;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  planBased: boolean;
  // _bsValue: Date;

  // get bsValue(): Date {
  //   return this._bsValue;
  // }
  // set bsValue(v: Date) {
  //   this._bsValue = v;
  // }

  startDatedisable: boolean = false;
  invalid: boolean;
  toDayDate: Date = new Date();
  myDatePickerOptions: ICalOptions = {
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    indicateInvalidDate: true,
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false

  };

  myDatePickerOptions1: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo', sunHighlight: false,
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,

  };

  startDate: Date[];
  sessionContextResponse: IUserresponse;
  constructor(private planService: PlansService, private router: Router,
    public renderer: Renderer, private Context: SessionService,
    private datePickerFormat: DatePickerFormatService
    , private route: ActivatedRoute, private commonService: CommonService,
    private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.disableButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.CREATE], "");

    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

    this.stmtCylce = "Statement Cycle";
    this.boolCycle = true;
    this.createForm = new FormGroup({
      'accountType': new FormControl('', [Validators.required]),
      'planName': new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      'planCode': new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      'planDesc': new FormControl('', [Validators.required, Validators.maxLength(255), Validators.pattern(this.validateIntialSpaces)]),
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'stmtCycle': new FormControl('', [Validators.required]),
      'invoiceCycle': new FormControl('', []),
      'chkTagRequired': new FormControl('', []),
      'chkDate': new FormControl('', [])
    });
    this.getApplicationParameterValueByParameterKey();
    this.getStatementCycleTypes();
    this.getInvoiceCycleTypes();
    this.getTollTypes();
    this.PlanEndEffDate();
    this.planId = +this.route.snapshot.paramMap.get('id');
    if (this.planId > 0) {
      this.bindPlanDetails(this.planId);
    }
    else {
      this.getPlanResponses = <IPlanResponse>{};
      this.getPlanResponses.Code = ''
      this.getPlanResponses.ParentPlanName = '';
      this.getPlanResponses.Name = '';
      this.getPlanResponses.Desc = '';
      this.getPlanResponses.StatementCycle = '';
      this.getPlanResponses.isFeeRequired = false;
      this.getPlanResponses.IsTagRequired = false;
    }
    this.materialscriptService.material();
  }

  // to get the plan details based on planid
  bindPlanDetails(id: number) {
    this.planService.getPlanByPK(id.toString()).subscribe(
      res => {
        this.getPlanResponse = <IPlanResponse>res;
        if (res) {
          this.getPlanResponses.Code = this.getPlanResponse.Code;
          this.getPlanResponses.ParentPlanName = this.getPlanResponse.ParentPlanName;
          this.getPlanResponses.Name = this.getPlanResponse.Name;
          this.getPlanResponses.Desc = this.getPlanResponse.Desc;
          // this.getPlanResponses.StartEffDate = this.getPlanResponse.StartEffDate;
          // this.getPlanResponses.EndEffDate = this.getPlanResponse.EndEffDate;
          let startDate = new Date();
          startDate = new Date(this.getPlanResponse.StartEffDate);
          this.createForm.patchValue({
            startDate: {
              date: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                day: startDate.getDate()
              }
            }
          });
          this.changeDate(startDate)
          let endDate = new Date();
          endDate = new Date(this.getPlanResponse.EndEffDate);
          this.getPlanResponses.EndEffDate = endDate;
          this.createForm.patchValue({
            endDate: {
              date: {
                year: endDate.getFullYear(),
                month: endDate.getMonth() + 1,
                day: endDate.getDate()
              }
            }
          });



          if (this.getPlanResponses.ParentPlanName == "PREPAID") {
            this.stmtCylce = "Statement Cycle";
            this.boolCycle = true;
            if (this.planBased) {
              this.createForm.controls["stmtCycle"].setValidators([Validators.required]);
              this.createForm.controls["stmtCycle"].updateValueAndValidity();
            }
            else {
              this.createForm.controls["stmtCycle"].setValidators([]);
              this.createForm.controls['stmtCycle'].updateValueAndValidity();
            }
            this.getPlanResponses.StatementCycle = this.getPlanResponse.StatementCycle;
          }
          else {
            this.stmtCylce = "Invoice Cycle";
            this.boolCycle = false;
            this.getPlanResponses.InvoiceCycle = this.getPlanResponse.InvoiceCycle;
            this.createForm.controls["stmtCycle"].setValidators([]);
            this.createForm.controls["stmtCycle"].updateValueAndValidity();
          }
          this.getPlanResponses.isFeeRequired = this.getPlanResponse.isFeeRequired;
          this.getPlanResponses.IsTagRequired = this.getPlanResponse.IsTagRequired;
          this.renderer.setElementStyle(this.chkDate.nativeElement, 'display', 'none');
          this.renderer.setElementStyle(this.desc.nativeElement, 'display', 'none');
          // this.renderer.setElementAttribute(this.startDt.nativeElement.querySelector('#startDate'), 'disabled', 'true');
          this.startDatedisable = true;
          this.renderer.setElementAttribute(this.accountTypes.nativeElement.querySelector('#accountType'), 'disabled', 'true');
          this.renderer.setElementAttribute(this.planCodes.nativeElement.querySelector('#planCode'), 'disabled', 'true');
          this.disable = true;
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while getting the plan details";
          this.msgTitle = '';
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

  // to show the statement cycle or invoice cycle based on plan based condition
  toggleStmtCycle() {
    if (this.isPlanBased != "1") {
      this.stmtCylce = "Invoice Cycle"
      this.boolCycle = false;
    }
    else {
      this.stmtCylce = "Statement Cycle";
      this.boolCycle = true;
    }
  }

  // to get value of IsPlanBased key
  getApplicationParameterValueByParameterKey() {
    this.planService.getApplicationParameterValueByParameterKey(ApplicationParameter).subscribe(
      res => {
        if (res) {
          this.isPlanBased = res.toString();
          if (this.isPlanBased == "1")
            this.planBased = true;
          else
            this.planBased = false;
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while getting the details ";
          this.msgTitle = '';
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

  // to get the statement cycles
  getStatementCycleTypes(): void {
    this.planService.getStatementCycleTypes().subscribe(res => {
      if (res) {
        this.statementTypes = res;
        this.createForm.controls["stmtCycle"].setValue("");
      }
      else {
        this.msgDesc = "Error while getting the statement cycles details ";
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
      }
    },
      err => {
        this.msgDesc = err.statusText;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        return;
      });
  }

  // to get the invoice cycles
  getInvoiceCycleTypes(): void {
    this.planService.getInvoiveCycleTypes().subscribe(res => {
      if (res) {
        this.invoiceTypes = res.filter(r => r.CycleID == 1);
        this.createForm.controls["invoiceCycle"].setValue("");
      }
      else {
        this.msgDesc = "Error while getting the invoice cycles details ";
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
      }
    },
      err => {
        this.msgDesc = err.statusText;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        return;
      });
  }

  PlanEndEffDate() {
    this.planService.getApplicationParameterValueByParameterKey(PlanEndEffDate).subscribe(
      res => {
        if (res) {
          this.planEndEffDate = res;
        }
      },
      err => {
        this.msgDesc = err.statusText;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        return;
      });
  }

  // to get toll types
  getTollTypes(): void {
    this.planService.getTollTypes(TollTypes.PrePaid.toString()).
      subscribe(res => {
        if (res) {
          this.tollTypes = res
        }
        else {
          this.msgDesc = "Error while getting the account type details ";
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgTitle = '';
        }
      },
      err => {
        this.msgDesc = err.statusText;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        return;
      });
  }

  // to cancel the event
  cancleclick() {
    this.router.navigateByUrl('/sac/plans/view-plans');
  }

  // to reset the enterd details
  resetclick() {
    if (this.planId > 0) {
      this.bindPlanDetails(this.planId);
    }
    else {
      this.createForm.reset();
      this.createForm.controls["accountType"].setValue("");
      this.createForm.controls["stmtCycle"].setValue("");
      this.createForm.controls["invoiceCycle"].setValue("");
      this.createForm.controls["startDate"].reset();
      this.createForm.controls["endDate"].reset();
       this.materialscriptService.material();
    }
   
  }

  // to show statement cycle or invoice cycle based on tolltype
  cycleVisible(tollType: string) {
    if (tollType == "PREPAID") {
      if (this.planBased) {
        this.stmtCylce = "Statement Cycle";
        this.boolCycle = true;
        this.createForm.controls["stmtCycle"].setValue("");
        this.createForm.controls["stmtCycle"].setValidators([Validators.required]);
        this.createForm.controls['stmtCycle'].updateValueAndValidity();
        this.getPlanResponses.StatementCycle = '';
        this.getPlanResponses.InvoiceCycle = '';
      }
      else {
        this.boolCycle = true;
        this.createForm.controls["stmtCycle"].setValidators([]);
        this.createForm.controls['stmtCycle'].updateValueAndValidity();
      }
    }
    else if (tollType == "POSTPAID") {
      this.stmtCylce = "Invoice Cycle";
      this.boolCycle = false;
      this.createForm.controls["stmtCycle"].setValue("");
      this.createForm.controls["stmtCycle"].setValidators([]);
      this.createForm.controls['stmtCycle'].updateValueAndValidity();
      this.getPlanResponses.StatementCycle = '';
      this.getPlanResponses.InvoiceCycle = '';
    }
    else {
      if (this.planBased) {
        this.stmtCylce = "Statement Cycle";
        this.boolCycle = true;
        this.createForm.controls["stmtCycle"].setValue("");
        this.createForm.controls["stmtCycle"].setValidators([Validators.required]);
        this.createForm.controls["stmtCycle"].updateValueAndValidity();
        this.getPlanResponses.StatementCycle = '';
        this.getPlanResponses.InvoiceCycle = '';
      }
      else {
        this.boolCycle = true;
        this.createForm.controls["stmtCycle"].setValidators([]);
        this.createForm.controls['stmtCycle'].updateValueAndValidity();
      }
    }
  }

  // to add the end date for check box selection
  chkEndDate() {
    this.objPlanRequest.chkDate = this.createForm.controls['chkDate'].value;
    this.objPlanRequest.chkDate = this.createForm.controls['chkDate'].value;
    this.endDate = this.createForm.controls['startDate'].value;
    let eDate = this.createForm.controls['startDate'].value;
    if (this.objPlanRequest.chkDate) {
      this.createForm.controls["endDate"].reset();
    }
    else { 
      if (this.endDate == undefined || eDate == "") {
        this.createForm.controls['startDate'].reset();
        //this.getPlanResponses.EndEffDate = new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(this.planEndEffDate.toString())));
        let date = new Date();
        this.createForm.patchValue({
          endDate: {
            date: {
              year: date.getFullYear() + parseInt(this.planEndEffDate.toString()),
              month: date.getMonth() + 1,
              day: date.getDate(),
            }
          }
        });
      }
      else {
        let dateval = this.createForm.controls['startDate'].value;
        dateval = dateval.date;
        let year = dateval.year + parseInt(this.planEndEffDate.toString());
        this.createForm.patchValue({
          endDate: {
            date: {
              year: year,
              month: (dateval.month),
              day: dateval.day
            }
          }
        });
        // this.getPlanResponses.EndEffDate = new Date(this.createForm.controls['startDate'].value);
        //this.getPlanResponses.EndEffDate.setFullYear(this.getPlanResponses.EndEffDate.getFullYear() + parseInt(this.planEndEffDate.toString()));
      }
    }
  }

  // to create the plan 
  createPlan(boolValue: boolean) {
    if (this.createForm.valid) {
      this.objPlanRequest.Name = this.createForm.controls['planName'].value;
      this.objPlanRequest.Code = this.createForm.controls['planCode'].value;
      this.objPlanRequest.Desc = this.createForm.controls['planDesc'].value;
      // let stDate = this.createForm.controls['startDate'].value;
      // stDate = stDate.date;
      // this.objPlanRequest.StartEffDate = new Date(stDate);
      // let efDate = this.createForm.controls['endDate'].value;
      // efDate = efDate.date;
      // this.objPlanRequest.StartEffDate = new Date(efDate);

      let StartEffDate = this.datePickerFormat.getFormattedDate(this.createForm.controls['startDate'].value.date);
      let EndEffDate = this.datePickerFormat.getFormattedDate(this.createForm.controls['endDate'].value.date);
      this.objPlanRequest.StartEffDate = StartEffDate;
      this.objPlanRequest.EndEffDate = EndEffDate;


      //this.objPlanRequest.StartEffDate = this.createForm.controls['startDate'].value;
      // this.objPlanRequest.EndEffDate = this.createForm.controls['endDate'].value;
      if (new Date(this.objPlanRequest.EndEffDate) < new Date(this.objPlanRequest.StartEffDate)) {
        this.msgDesc = "Plan End Effective Date should be greater than or equal to Plan Start Effective Date";
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        return;
      }
      this.objPlanRequest.TollType = this.createForm.controls['accountType'].value;
      if (this.objPlanRequest.TollType == "PREPAID") {
        this.objPlanRequest.StatementCycle = this.createForm.controls['stmtCycle'].value;
      }
      else {
        this.objPlanRequest.StatementCycle = this.createForm.controls['invoiceCycle'].value;
      }
      // let startDate = this.createForm.controls['startDate'].value;
      // let endDate = this.createForm.controls['endDate'].value;

      //let date = new Date();
      //let time = date.getTime();
      //this.objPlanRequest.StartEffDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      // this.objPlanRequest.EndEffDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      this.objPlanRequest.StartEffDate.setHours(0, 0, 0, 0);
      this.objPlanRequest.EndEffDate.setHours(23, 59, 59, 997);
      this.objPlanRequest.StartEffDate = new Date(StartEffDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.objPlanRequest.EndEffDate = new Date(EndEffDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.objPlanRequest.Subsystem = SubSystem[SubSystem.SAC];
      this.objPlanRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objPlanRequest.UpdateUser = this.Context.customerContext.userName;
      this.objPlanRequest.isFeeRequired = false;
      this.objPlanRequest.IsTagRequired = this.createForm.controls['chkTagRequired'].value;
      this.systemActivites = <ISystemActivities>{};
      this.systemActivites.LoginId = this.Context.customerContext.loginId;
      this.systemActivites.UserId = this.Context.customerContext.userId;
      this.objPlanRequest.SystemActivities = this.systemActivites;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.PLANS];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
      userEvents.UserName = this.Context.customerContext.userName;
      userEvents.LoginId = this.Context.customerContext.loginId;
      if (this.planId > 0) {
        this.objPlanRequest.PlanId = this.planId;
        this.planService.updatePlan(this.objPlanRequest, userEvents).subscribe(res => {
          if (res) {
            if (boolValue) {
              this.msgDesc = "Plan is updated SuccessFully";
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgTitle = '';
            }
            else if (!boolValue) {
              this.router.navigate(['/sac/plans/assign-fees-to-plans', false, this.planId]);
            }
          }
          else {
            this.msgDesc = "Error while updating the plan";
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgTitle = '';
          }
        }, err => {
          this.msgDesc = err.statusText;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgTitle = '';
          return;
        });
      }
      else {
        this.planService.createPlan(this.objPlanRequest, userEvents).subscribe(res => {
          if (res) {
            if (boolValue) {
              this.msgDesc = "Plan is created SuccessFully";
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgTitle = '';
              this.resetclick();
            }
            else {
              this.router.navigate(['/sac/plans/assign-fees-to-plans', false, res]);
            }
          }
          else {
            this.msgDesc = "Error while creating the plan";
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgTitle = '';
          }
        }, err => {
          this.msgDesc = err.statusText;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgTitle = '';
          return;
        });
      }
    }
    else {
      this.validateAllFormFields(this.createForm);
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

  // to show the how many characters are left for plan description
  descEvent(event: any) {
    this.descLength = 255 - event.target.value.length
  }

  // changeDate(startDate) {
  //   let dateval = startDate.date;
  //   let start = new Date(dateval.year, (dateval.month) - 1, dateval.day);
  //   if (start != null) {
  //     let date = new Date(start).toDateString();
  //     this.maxDate = new Date(date);
  //     this.myDatePickerOptions1 = {
  //       dateFormat: 'mm/dd/yyyy',
  //       disableUntil: {
  //         year: this.maxDate.getFullYear(),
  //         month: this.maxDate.getMonth() + 1,
  //         day: this.maxDate.getDate() - 1
  //       },
  //       firstDayOfWeek: 'mo', sunHighlight: false,
  //       inline: false,
  //       alignSelectorRight: false, indicateInvalidDate: true
  //     };
  //   }
  // }
  changeDate(startDate) {
    if (startDate.value != null) {
      if (!startDate.valid && startDate.value != "") {
        this.invalidDate = true;
        return;
      }
      else {
        this.invalidDate = false;
      }

      let date = new Date(startDate.value).toDateString();
      this.maxDate = new Date(date);
      this.myDatePickerOptions1 = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: {
          year: this.maxDate.getFullYear(),
          month: this.maxDate.getMonth() + 1,
          day: this.maxDate.getDate() - 1
        },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false,
        alignSelectorRight: false, indicateInvalidDate: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
      };
    }
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  validateDateFormat(inputDate: any) {

    let strDateRangeArray = inputDate.slice(",");
    if (strDateRangeArray.length < 2) {
      this.invalid = true;
      const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
      this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
      return;
    }
    else {
      if ((strDateRangeArray[0] != null) || (strDateRangeArray[1] != null)) {
        if (!isDate(new Date(strDateRangeArray[0])) || !isDate(new Date(strDateRangeArray[1]))) {
          this.invalid = true;
          const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
          this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
          return;
        }
      }
      else {
        this.invalid = true;
      }
    }
  }



  validateDateMessages(event, val) {
    debugger;
    if (val[0] && val[1]) {
      if (isDate(new Date(val[0])) && isDate(new Date(val[1]))) {
        this.invalid = false;
      }
    }
    else {
      this.invalid = true;
    }
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.endinvalidDate = true;

      return;
    }
    else
      this.endinvalidDate = false;

  }
}


