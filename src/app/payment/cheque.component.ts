import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "../shared/services/common.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";
//import { IMyDpOptions } from "mydatepicker";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";
@Component({
  selector: 'app-cheque',
  templateUrl: './cheque.component.html',
  styleUrls: ['./cheque.component.scss']
})
export class ChequeComponent implements OnInit {
  invalidDate: boolean;
  createForm: FormGroup;
  @Input() chequeDate: Date;
  @Input() chequeNumber: string;
  @Input() checkRoutingNumber: string;
  checkDateRange: number;
  maxDate = new Date();

  myDateRangePickerOptions: ICalOptions;
  // = {
  //     dateFormat: 'mm/dd/yyyy',
  //     firstDayOfWeek: 'mo',
  //     sunHighlight: false,
  //     height: '34px',
  //     width: '260px',
  //     inline: false,
  //     alignSelectorRight: false,
  //     indicateInvalidDateRange: true,
  //     showClearBtn: false,
  //     showApplyBtn: false,
  //     showClearDateBtn: false
  //   };//= { disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 8 }, disableUntil: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() - 8 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };

  constructor(private commonService: CommonService, private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService) {
  }
  minDate = new Date(2017, 5, 10);
  // maxDate = new Date(2017, 11, 15);
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
      'checkNumber': new FormControl('', [Validators.required, Validators.minLength(4)]),
      'checkRouting': new FormControl('', [Validators.required, Validators.minLength(9)]),
      'checkDate': new FormControl('', [Validators.required])
    });
    if (this.chequeNumber != null && this.chequeNumber != " ") {
      this.createForm.patchValue({
        'checkNumber': this.chequeNumber,
        'checkRouting': this.checkRoutingNumber,
        'checkDate': { date: { year: new Date(this.chequeDate).getFullYear(), month: new Date(this.chequeDate).getMonth() + 1, day: new Date(this.chequeDate).getDate() } }
      });


    }

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ChequeDateRange).subscribe(
      res => {
        this.checkDateRange = ((Number)(res)) + 1;
        this.myDateRangePickerOptions = {
          disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + this.checkDateRange },
          disableUntil: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() - this.checkDateRange },
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

  onDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.createForm.controls["checkDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

}
