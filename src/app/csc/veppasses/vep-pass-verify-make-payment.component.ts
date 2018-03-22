import { Status } from './../../sac/promos/constants';
import { Router } from '@angular/router';
import { VepPassesService } from './services/veppasses.service';
import { IVepVehicleContextResponse } from './models/vepvehiclescontext';
import { VepContextService } from './services/vepcontext.service';
import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-vep-pass-verify-make-payment',
  templateUrl: './vep-pass-verify-make-payment.component.html',
  styleUrls: ['./vep-pass-verify-make-payment.component.scss']
})
export class VepPassVerifyMakePaymentComponent implements OnInit {
  vepVehicleresponse: IVepVehicleContextResponse;
  passType: string;
  payBy: string;
  creditCard: string;
  creditCardName: string;
  cardType: string;
  ccTax: string;
  ccTotal: string;
  str: number;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  res: IVepVehicleContextResponse;
  tmpRes: IVepVehicleContextResponse;
  contexts: IVepVehicleContextResponse;

  constructor(private vepContext: VepContextService, private vepService: VepPassesService, private router: Router, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.vepContext.currentContext
      .subscribe(customerContext => { this.vepVehicleresponse = customerContext; }
      );
    this.passType = this.vepVehicleresponse.PassType;
    this.creditCardName = this.vepVehicleresponse.CCName;
    this.creditCard = "XXXX_" + this.vepVehicleresponse.CCNumber.toString().substring(12);
    this.cardType = this.vepVehicleresponse.CCType;
    this.ccTax = this.vepVehicleresponse.ServiceTax;
    this.str = parseInt(this.vepVehicleresponse.ServiceTax);
    this.ccTotal = this.vepVehicleresponse.TotalAmount;
    //this.makePayment();
  }
  goBack(): void {

    this.router.navigate(['csc/veppasses/vep-pass-details', true]);
    //this.router.navigateByUrl('csc/veppasses/vep-pass-details',true);
  }
  makePayment(): void {
    //console.log(this.vepVehicleresponse);
    $('#pageloader').modal('show');
    this.vepService.doVEPPayment(this.vepVehicleresponse).subscribe(ress => {
      if (ress) {
        this.tmpRes = ress;
        this.res = this.vepVehicleresponse;
        this.res.ReferenceNo = this.tmpRes.ReferenceNo;
        this.res.TxnDateTime = this.tmpRes.TxnDateTime;
        this.res.PaymentId = this.tmpRes.PaymentId;
        this.res.CustomerId = this.tmpRes.CustomerId;
        this.vepContext.changeResponse(this.res);
        $('#pageloader').modal('hide');
        this.router.navigateByUrl('csc/veppasses/vep-pass-thank-you');
      }
    }, err => {
      console.log(err);
      $('#pageloader').modal('hide');
      this.msgFlag = true;
      this.msgTitle = '';
      this.msgType = 'error';
      this.msgDesc = err.statusText;
    });
    $('#pageloader').modal('hide');
  }
  cancelPayment(): void {
    this.vepContext.changeResponse(this.contexts);
    this.router.navigateByUrl('csc/veppasses/vep-pass-details');
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
