import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "../shared/services/common.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
//import { MoneyOrderService } from "./services/money-order.service";
//import { Money } from "./money";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-money-order',
  templateUrl: './money-order.component.html',
  styleUrls: ['./money-order.component.scss']
})
export class MoneyOrderComponent implements OnInit {
  invalidDate: boolean;
  message: string;
  titleAlert: string;
  createForm: FormGroup;
  maxDate = new Date();
  moDateRange: number;
  @Input() mODate: Date;
  @Input() mONumber: string;
  myDatePickerOptions: ICalOptions;//{ disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };

  constructor(private commonService: CommonService, private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService) {

  }

  minDate = new Date(2017, 11, 10);
  // maxDate = new Date(2017, 11, 28);
  _bsValue: Date;
  get bsValue(): Date {
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

  log(v: any) { console.log(v); }
  ngOnInit() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material()
    }, 100);
    this.createForm = new FormGroup({
      'moneyOrderNumber': new FormControl('', [Validators.required, Validators.minLength(4)]),
      'moneyOrderDate': new FormControl('', [Validators.required])
    });
    if (this.mONumber != null && this.mONumber != " ") {
      this.createForm.patchValue({
        'moneyOrderNumber': this.mONumber,
        'moneyOrderDate': { date: { year: new Date(this.mODate).getFullYear(), month: new Date(this.mODate).getMonth() + 1, day: new Date(this.mODate).getDate(), } }
      });
    }

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MODateRange).subscribe(
      res => {
        this.moDateRange = ((Number)(res)) + 1;
        this.myDatePickerOptions = {
          disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + this.moDateRange },
          disableUntil: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() - this.moDateRange },
          dateFormat: 'mm/dd/yyyy',
          firstDayOfWeek: 'mo',
          sunHighlight: false,
          height: '34px',
          width: '260px',
          inline: false,
          alignSelectorRight: false,
          indicateInvalidDate: true,
          showClearBtn: false,
          showApplyBtn: false,
          showClearDateBtn: false
        };
      }
    );
  }
  // moneyOrderUpdate(): void {
  //   this._money.amount=this.createForm.value.amount;
  //   this._money.money_Order=this.createForm.value.amount;
  //   this._money.money_Order_Date=this.createForm.value.amount;
  //   console.log(this.createForm.value.amount);
  //  this._moneyOrderService.moneyOrderUpdate(this._money);
  // }
  update() {
    //alert("selected");
    console.log(this.createForm.value.amount);
  }
  onDateFieldChanged(event: IMyInputFieldChanged) {
    //let date = this.createForm.controls["checkDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
}
