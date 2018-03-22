
import { IFeeRequest } from './models/feerequest';
import { IFeeResponse } from './models/feeresponse';
import { IDiscountRequest } from './models/discountrequest';
import { IDiscountResponse } from './models/discountresponse';
import { PlansService } from './services/plans.service';
import { ITollTypes } from './models/tolltypesresponse';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IinvoiceResponse } from './models/invoicecycleresponse';
import { IStatementResponse } from './models/statementcycleresponse';
import { IPlanResponse } from './models/plansresponse';
import { IPlanRequest } from './models/plansrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TollTypes, ApplicationParameter } from './constants';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { SubSystem, ActivitySource, Features, Actions, SubFeatures, defaultCulture } from '../../shared/constants';
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
//import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydatepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-update-plans',
  templateUrl: './update-plans.component.html',
  styleUrls: ['./update-plans.component.css']
})

export class UpdatePlansComponent implements OnInit {
  invalidPlan: boolean = false;
  endEffDate: Date;
  endFeeDate: Date;
  endDiscountDate: Date;
  feeModel: Object = {};
   descLength: number = 255;
  discountModel: object = {};
  renderer: any;
  planId: number;
  updateForm: FormGroup;
  objPlanRequest: IPlanRequest = <IPlanRequest>{};
  getPlanResponse: IPlanResponse;
  isPlanBased: string;
  statementTypes: IStatementResponse[];
  invoiceTypes: IinvoiceResponse[];
  tollTypes: ITollTypes[];
  systemActivites: ISystemActivities;
  boolSubmit: boolean = true;
  getPlanResponses: IPlanResponse = <IPlanResponse>{};
  getDiscountResponse: IDiscountResponse[];
  getFeeResponse: IFeeRequest[];
  discountObj: IDiscountRequest = <IDiscountRequest>{};
  feeObj: IFeeRequest = <IFeeRequest>{};
  feeItems = [];
  filteredItem = [];
  discountItems = [];
  filteredDiscountItems = [];
  enteredStartDate = new Date();
  enteredEndDate = new Date();
  boolValid: boolean;
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ \'-][a-zA-Z0-9]+)*";
  stmtCylce = "Statement Cycle";
  invCycle = "Invoice Cycle";
  shouldShow = true;
  boolCycle: boolean = true;
  planBased: boolean;
  endDate: Date;
  id: number = 250;
  boolDiscButton: boolean = false;
  isTagReq: boolean = false;
  selected: boolean = false;
  selectedRow: number;
  minDate = new Date();
  disableButton: boolean = false;
  // maxDate = new Date(2070, 9, 15);
  bsValue1: Date;
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    this._bsValue = v;
  }

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  toDayDate = new Date();
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    sunHighlight: false, inline: false, alignSelectorRight: false, indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
  };
  myDatePickerOptionsFee: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    openSelectorTopOfInput: true,
    firstDayOfWeek: 'mo', height: '34px', width: '250px',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    sunHighlight: false, inline: false, alignSelectorRight: true, indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
  };

  sessionContextResponse: IUserresponse;
  constructor(private planService: PlansService,
    private router: Router, private route: ActivatedRoute, private Context: SessionService, private cdr: ChangeDetectorRef, private commonService: CommonService, private materialscriptService: MaterialscriptService ) {
  }

  ngOnInit() {
    this.disableButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.UPDATE], "");
    this.planId = +this.route.snapshot.paramMap.get('id');
    this.stmtCylce = "Statement Cycle";
    this.boolCycle = true;
    this.updateForm = new FormGroup({
      'accountType': new FormControl('', [Validators.required]),
      'planName': new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      'planCode': new FormControl('', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])),
      'planDesc': new FormControl('', [Validators.required, Validators.maxLength(255)]),
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'stmtCycle': new FormControl('', [Validators.required]),
      'invoiceCycle': new FormControl('', []),
      'chkTagRequired': new FormControl([]),
      'chkDate': new FormControl('', [])
    });
    this.getApplicationParameterValueByParameterKey();
    this.getStatementCycleTypes();
    this.getInvoiceCycleTypes();
    this.getTollTypes();
    if (this.planId > 0) {
      this.bindPlanDetails(this.planId);
      this.getdiscountsAvailable(this.planId);
      this.getPlanFeesByPlanId(this.planId);
    }
    this.materialscriptService.material();
  }

  descEvent(event: any) {
    this.descLength = 255 - event.target.value.length
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

          let startDate = new Date();
          startDate = new Date(this.getPlanResponse.StartEffDate);
          this.updateForm.patchValue({
            startDate: {
              date: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                day: startDate.getDate()
              }
            }
          });
           let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)

          let endDate = new Date();
          endDate = new Date(this.getPlanResponse.EndEffDate);
          this.updateForm.patchValue({
            endDate: {
              date: {
                year: endDate.getFullYear(),
                month: endDate.getMonth() + 1,
                day: endDate.getDate()
              }
            }
          });
          
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
          this.getPlanResponses.StartEffDate = this.getPlanResponse.StartEffDate;
          this.getPlanResponses.EndEffDate = this.getPlanResponse.EndEffDate;

setTimeout(function(){
rootSele.materialscriptService.material();
},0)
          if (this.getPlanResponses.ParentPlanName == "PREPAID") {
            this.stmtCylce = "Statement Cycle";
            this.boolCycle = true;
            this.getPlanResponses.StatementCycle = this.getPlanResponse.StatementCycle;
            if (this.planBased) {
              this.updateForm.controls["stmtCycle"].setValidators([Validators.required]);
              this.updateForm.controls['stmtCycle'].updateValueAndValidity();
            }
            else {
              this.updateForm.controls["stmtCycle"].setValidators([]);
              this.updateForm.controls['stmtCycle'].updateValueAndValidity();
            }
          }
          else {
            this.stmtCylce = "Invoice Cycle";
            this.boolCycle = false;
            this.getPlanResponses.InvoiceCycle = this.getPlanResponse.InvoiceCycle;
            this.updateForm.controls["stmtCycle"].setValidators([]);
            this.updateForm.controls['stmtCycle'].updateValueAndValidity();
          }
          this.getPlanResponses.isFeeRequired = this.getPlanResponse.isFeeRequired;
          this.getPlanResponses.IsTagRequired = this.getPlanResponse.IsTagRequired;
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while getting the plan details";
          this.msgTitle = '';
        }
      },
      (err) => { }
      , () => {
        this.planService.isPlanAssociatedToCustomer(this.getPlanResponse.Code).subscribe(res => {
          if (res) {
            this.updateForm.get('chkTagRequired').disable();
          }
          else {
            this.updateForm.get('chkTagRequired').enable();
          }
        }, err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return this.isTagReq;
        });
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        }
      });
      this.materialscriptService.material();
     
  }

  // to get plan based or not
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
      let rootSele=this;
      setTimeout(function(){
rootSele.materialscriptService.material();
},0)
  }

  // to show the statement cycle or invoice cycle
  toggleStmtCycle() {
    if (this.isPlanBased != "1") {
      this.stmtCylce = "Invoice Cycle"
      this.boolCycle = false;
      this.planBased = false;
    }
    else {
      this.stmtCylce = "Statement Cycle";
      this.boolCycle = true;
      this.planBased = true;
    }
  }

  // to get statement cycles
  getStatementCycleTypes(): void {
    this.planService.getStatementCycleTypes().subscribe(res => {
      if (res) {
        this.statementTypes = res;
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Error while getting the statement cycles details ";
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
      this.materialscriptService.material();
  }

  //to get invoice cycles
  getInvoiceCycleTypes(): void {
    this.planService.getInvoiveCycleTypes().subscribe(res => {
      if (res) {
        this.invoiceTypes =
          res.filter(r => r.CycleID == 1)
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Error while getting the invoice cycles details ";
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
      this.materialscriptService.material();
  }

  //to get tolltypes
  getTollTypes(): void {
    this.planService.getTollTypes(TollTypes.PrePaid.toString()).
      subscribe(res => {
        if (res) {
          this.tollTypes = res
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while getting the account type details ";
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
      this.materialscriptService.material();
  }

  // to get discounts based on plan id
  getdiscountsAvailable(id: number) {
    this.planService.getPlanDiscountsByPlanId(this.planId.toString()).subscribe(res => {
      if (res) {
        this.getDiscountResponse = res;
        for (let i = 0; i < res.length; i++) {
          let date = new Date();
          date = new Date(res[i].EndEffectiveDate);
          this.discountModel = {
            date: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate()
            }
          };
          res[i].EndEffectiveDate = this.discountModel;
        }
        this.getDiscountResponse.forEach(res => res.IsSelected = true);
        this.endDate = new Date(res[0].EndEffectiveDate);
        if (this.endDate < new Date()) {
          this.boolDiscButton = true;
        }
        else {
          this.boolDiscButton = false;
        }
      }
      else {
        this.boolDiscButton = true;
      }
    },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
      this.materialscriptService.material();
  }

  // to get the plan is already associated with customer or not
  isPlanAssociatedToCustomer(planCode: string): boolean {
    this.materialscriptService.material();
    this.planService.isPlanAssociatedToCustomer(planCode).subscribe(res => {
      if (res) {
        this.isTagReq = res;
      }
      else {
        this.isTagReq = false;
      }
    }, err => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText;
      this.msgTitle = '';
      return this.isTagReq;
    });
    return this.isTagReq;
   
  }

  // to get fees based on planid
  getPlanFeesByPlanId(id: number) {
    this.planService.getPlanFeesByPlanId(this.planId.toString()).subscribe(res => {
      if (res) {
        this.getFeeResponse = res;
        for (let i = 0; i < res.length; i++) {
          let date = new Date();
          date = new Date(res[i].DtEndEffDate);
          this.feeModel = {
            date: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate()
            }
          };
          res[i].DtEndEffDate = this.feeModel;
        }
        this.getFeeResponse.forEach(res => res.IsSelected = true);
      }
    },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
      this.materialscriptService.material();
  }

  // to update the discount details
  onDiscountUpdate() {
    if (this.filteredDiscountItems.length > 0) {
      this.boolValid = this.discountValidations(this.filteredDiscountItems);
      if (this.boolValid) {
        this.objPlanRequest.Discounts = this.filteredDiscountItems.map(x => Object.assign({}, x));
        this.objPlanRequest.PlanId = this.planId;
        this.objPlanRequest.UpdateUser = this.Context.customerContext.userName;
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.PLANS];
        userEvents.SubFeatureName = SubFeatures[SubFeatures.DISCOUNTASSOCIATE];
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
        userEvents.UserName = this.Context.customerContext.userName;
        userEvents.LoginId = this.Context.customerContext.loginId;
        this.planService.updatePlanDiscountAssociation(this.objPlanRequest, userEvents).subscribe(res => {
          if (res) {
            this.discountItems = [];
            this.filteredDiscountItems = [];
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Discount has been updated successfully";
            this.msgTitle = '';
            //this.router.navigateByUrl('/sac/plans/viewplan');
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while updating the plan";
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
    }
  }

  // to update the fee details
  onFeeUpdate() {
    if (this.filteredItem.length > 0) {
      this.boolValid = this.feeValidations(this.filteredItem);
      if (this.boolValid) {
        this.objPlanRequest.FeeTypes = this.filteredItem.map(x => Object.assign({}, x));
        this.objPlanRequest.PlanId = this.planId;
        this.objPlanRequest.UpdateUser = this.Context.customerContext.userName;
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.PLANS];
        userEvents.SubFeatureName = SubFeatures[SubFeatures.FEEASSOCIATE];
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
        userEvents.UserName = this.Context.customerContext.userName;
        userEvents.LoginId = this.Context.customerContext.loginId;
        this.planService.updatePlanFeeAssociation(this.objPlanRequest, userEvents).subscribe(res => {
          if (res) {
            this.feeItems = [];
            this.filteredItem = [];
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Fee has been updated successfully";
            this.msgTitle = '';
            //this.router.navigateByUrl('/sac/plans/viewplan');
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while updating the plan";
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
    }
  }

  // to validate the fee details
  feeValidations(itemValues: any): boolean {
    // this.objPlanRequest.EndEffDate = this.updateForm.controls['endDate'].value;
    let dateEnd = this.updateForm.controls['endDate'].value;
    dateEnd = dateEnd.date
    let EndEffDate = new Date(dateEnd.year, (dateEnd.month) - 1, dateEnd.day, 23, 59, 59, 59);
    this.objPlanRequest.EndEffDate = EndEffDate;

    for (var i = 0; i < itemValues.length; i++) {
      if(itemValues[i].DtEndEffDate=="Invalid Date"){
         this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "End Effective Date is Invalid";
        this.msgTitle = '';
        return this.boolValid;
      }
      if (itemValues[i].DtEndEffDate == null) {
        this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Enter End Effective Date";
        this.msgTitle = '';
        return this.boolValid;
      }
      else {
        this.enteredStartDate = new Date(itemValues[i].DtStartEffDate);
        this.enteredEndDate = new Date(itemValues[i].DtEndEffDate);
        if (this.enteredEndDate > this.objPlanRequest.EndEffDate) {
          this.boolValid = false;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "End Effective Date of Fee " + itemValues[i].FeeName + " should not be greater than " + this.updateForm.controls['planName'].value +
            " Plan End Effective Date : " + this.objPlanRequest.EndEffDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          this.msgTitle = '';
          return this.boolValid;
        }
        else if (new Date(this.enteredEndDate.toLocaleDateString()) < new Date(this.enteredStartDate.toLocaleDateString())) {
          this.boolValid = false;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Fee End Effective Date should not be less than Start Effective date";
          this.msgTitle = '';
          return this.boolValid;
        }
        else if (new Date(this.enteredEndDate.toLocaleDateString()) < new Date(new Date().toLocaleDateString())) {
          this.boolValid = false;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Fee End Effective Date should not be less than current date";
          this.msgTitle = '';
          return this.boolValid;
        }
      }
    }
    this.boolValid = true;
    return this.boolValid;
  }

  // to validate the discount validations
  discountValidations(itemValues: any): boolean {
    //this.objPlanRequest.EndEffDate = this.updateForm.controls['endDate'].value;
    let discountEnd = this.updateForm.controls['endDate'].value;
    discountEnd = discountEnd.date
    let EndDiscountDate = new Date(discountEnd.year, (discountEnd.month) - 1, discountEnd.day, 23, 59, 59, 59);
    this.objPlanRequest.EndEffDate = EndDiscountDate;
    for (var i = 0; i < itemValues.length; i++) {
      this.enteredStartDate = new Date(itemValues[i].StartEffectiveDate);
      this.enteredEndDate = new Date(itemValues[i].EndEffectiveDate);
       if(itemValues[i].EndEffectiveDate == "Invalid Date"){
         this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "End Effective Date is Invalid";
        this.msgTitle = '';
        return this.boolValid;
      }
      if (this.enteredEndDate > this.objPlanRequest.EndEffDate) {
        this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "End Effective Date of Discount " + itemValues[i].DiscountName + " should not be greater than " + this.updateForm.controls['planName'].value +
          " Plan End Effective Date: " + this.objPlanRequest.EndEffDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        this.msgTitle = '';
        return this.boolValid;
      }
      
      if (this.enteredEndDate == null) {
        this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Enter End Effective Date";
        this.msgTitle = '';
        return this.boolValid;
      }
      else if (new Date(this.enteredEndDate.toLocaleDateString()) < new Date(this.enteredStartDate.toLocaleDateString())) {
        this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Discount End Effective Date should not be less than Start Effective date";
        this.msgTitle = '';
        return this.boolValid;
      }
      else if (new Date(this.enteredEndDate.toLocaleDateString()) < new Date(new Date().toLocaleDateString())) {
        this.boolValid = false;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Discount End Effective Date should not be less than current date";
        this.msgTitle = '';
        return this.boolValid;
      }
    }
    this.boolValid = true;
    return this.boolValid;
  }



  // to update the selected end date for fee details
  updateFeeEndEffectiveDate(index: number, feeType: IFeeRequest, endDate) {
 
    this.filteredItem = this.feeItems.filter(d => d.Id == feeType.Id);
    if (this.filteredItem.length > 0) {
      this.filteredItem[0].DtEndEffDate = new Date(endDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");;
      this.filteredItem[0].IsUpdated = true;
    }
    else {
      this.feeObj = <IFeeRequest>{};
      this.feeObj.Id = feeType.Id;
      this.feeObj.DtStartEffDate = feeType.DtStartEffDate;
      this.feeObj.DtEndEffDate = endDate.value;
      this.feeObj.StartDate = feeType.DtStartEffDate;
      this.feeObj.EndDate = feeType.DtEndEffDate;
      this.feeObj.FeeName = feeType.FeeName;
      this.feeObj.IsActive = true;
      this.feeObj.IsUpdated = false;
      this.feeItems.push(this.feeObj);
    }
  }

  // to update the selected end date for doscount details
  updateDiscountEndEffectiveDate(index: number, discountType: IDiscountRequest, endDate) {
    this.filteredDiscountItems = this.discountItems.filter(d => d.DiscountId == discountType.DiscountId);
    if (this.filteredDiscountItems.length > 0) {
      this.filteredDiscountItems[0].EndEffectiveDate = new Date(endDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    }
    else {
      this.discountObj = <IDiscountRequest>{};
      this.discountObj.DiscountId = discountType.DiscountId;
      this.discountObj.StartEffectiveDate = discountType.StartEffectiveDate;
      this.discountObj.EndEffectiveDate = discountType.EndEffectiveDate;
      this.discountObj.StartDate = discountType.StartEffectiveDate;
      this.discountObj.EndDate = endDate.value;
      this.discountObj.DiscountName = discountType.DiscountName;
      this.discountObj.Description = discountType.Description;
      this.discountObj.Isactive = true;
      this.discountItems.push(this.discountObj);
    }
  }
  // to update the plan details 
  updatePlan(planRequest: IPlanResponse) {
    if (this.updateForm.valid) {
      this.objPlanRequest.Name = this.updateForm.controls['planName'].value;
      this.objPlanRequest.Code = this.updateForm.controls['planCode'].value;
      this.objPlanRequest.Desc = this.updateForm.controls['planDesc'].value;

      let dateStartVal = this.updateForm.controls['startDate'].value;
      dateStartVal = dateStartVal.date;
      let start = new Date(dateStartVal.year, (dateStartVal.month) - 1, dateStartVal.day);

      this.objPlanRequest.StartEffDate = start.toLocaleString(defaultCulture).replace(/\u200E/g,""); //this.updateForm.controls['startDate'].value

      let dateEndVal = this.updateForm.controls['endDate'].value;
      dateEndVal = dateEndVal.date;
      let end = new Date(dateEndVal.year, (dateEndVal.month) - 1, dateEndVal.day);
      this.objPlanRequest.EndEffDate = end.toLocaleString(defaultCulture).replace(/\u200E/g,""); //this.updateForm.controls['endDate'].value;

      if (new Date(this.objPlanRequest.EndEffDate) < new Date(this.objPlanRequest.StartEffDate)) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Plan End Effective Date should be greater than or equal to Plan Start Effective Date";
        this.msgTitle = '';
        return;
      }
      let todayDatee=new Date().toLocaleDateString();
      if (new Date(this.objPlanRequest.EndEffDate).toLocaleDateString() < todayDatee ) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "End Effective Date should be greater than or equal to today Date";
        this.msgTitle = '';
        return;
      }
      this.objPlanRequest.TollType = this.updateForm.controls['accountType'].value;
      if (this.objPlanRequest.TollType == "PREPAID") {
        this.objPlanRequest.StatementCycle = this.updateForm.controls['stmtCycle'].value;
      }
      else {
        this.objPlanRequest.StatementCycle = this.updateForm.controls['invoiceCycle'].value;
      }
      // let startDate = this.updateForm.controls['startDate'].value;
      // let endDate = this.updateForm.controls['endDate'].value;
      this.objPlanRequest.StartEffDate = start.toLocaleString(defaultCulture).replace(/\u200E/g,""); //new Date(startDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.objPlanRequest.EndEffDate = end.toLocaleString(defaultCulture).replace(/\u200E/g,""); //new Date(endDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      this.objPlanRequest.Subsystem = SubSystem[SubSystem.SAC];
      this.objPlanRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objPlanRequest.UpdateUser = this.Context.customerContext.userName;
      this.objPlanRequest.isFeeRequired = false;
      this.objPlanRequest.IsTagRequired = this.updateForm.controls['chkTagRequired'].value;
      this.systemActivites = <ISystemActivities>{};
      this.systemActivites.LoginId = this.Context.customerContext.loginId;
      this.systemActivites.UserId = this.Context.customerContext.userId;
      this.objPlanRequest.SystemActivities = this.systemActivites;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.PLANS];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
      userEvents.UserName = this.Context.customerContext.userName;
      userEvents.LoginId = this.Context.customerContext.loginId;
      if (this.planId > 0) {
        this.objPlanRequest.PlanId = this.planId;
        this.planService.updatePlan(this.objPlanRequest, userEvents).subscribe(res => {
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Plan has been updated successfully";
            this.msgTitle = '';
            //this.router.navigateByUrl('/sac/plans/viewplan');
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while updating the plan";
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
    }
    else {
      this.validateAllFormFields(this.updateForm);
    }
  }

  // to add fees
  addFees() {
    this.router.navigate(['/sac/plans/assign-fees-to-plans', true, this.planId]);
  }

  // to add discounts
  addDiscounts() {
    this.router.navigate(['/sac/plans/assign-discounts-to-plans', true, this.planId]);
  }

  // to cancel the event
  cancleClick() {
    this.router.navigateByUrl('/sac/plans/view-plans');
  }

  // to reset the discount details
  discresetClick() {
    this.getdiscountsAvailable(this.planId);
  }

  // to reset the fee details
  feeresetClick() {
    this.getPlanFeesByPlanId(this.planId);
  }

  // to reset the plan details
  resetclick() {
    if (this.planId > 0) {
      this.updateForm.reset();
      this.bindPlanDetails(this.planId);
    }
    else {
      this.updateForm.reset();
      this.updateForm.controls["accountType"].setValue("");
      this.updateForm.controls["stmtCycle"].setValue("");
      this.updateForm.controls["invoiceCycle"].setValue("");
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

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldPlan(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidPlan = true;

      return;
    }
    else
      this.invalidPlan = false;

  }
}

