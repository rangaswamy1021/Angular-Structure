import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MaterialscriptService } from "../shared/materialscript.service";
@Component({
  selector: 'app-payment-giftcertificate',
  templateUrl: './payment-giftcertificate.component.html',
  styleUrls: ['./payment-giftcertificate.component.scss']
})
export class PaymentGiftcertificateComponent implements OnInit {
payment_form: FormGroup;
tooltipGiftCertificate: string = "Giftcertificate # is required.It allows only numbers and hyphen(-).It should be minimum 1 and maximum 15 numbers long";
tooltipRedemAmount: string = "Redem Amount is required.It allows numerics with decimals.";
  constructor(private materialscriptService:MaterialscriptService) {
    this.payment_form = new FormGroup({
      'giftCertificate': new FormControl('', [Validators.required]),
      'giftCertificateDate': new FormControl('',),
      'giftCertificateAmount': new FormControl('',),
      'redemAmount': new FormControl('',Validators.required),
      'totalRedemAmount': new FormControl('',)
      
      })
  };
minDate = new Date(2017, 5, 10);
  maxDate = new Date(2017, 11, 15);
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
 
  log(v: any) {console.log(v);}
  ngOnInit() {
    this.materialscriptService.material();
  }

}
