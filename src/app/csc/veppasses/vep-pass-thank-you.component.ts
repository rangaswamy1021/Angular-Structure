import { VepPassesService } from './services/veppasses.service';
import { IVepVehicleContextResponse } from './models/vepvehiclescontext';
import { VepContextService } from './services/vepcontext.service';
import { Data } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-vep-pass-thank-you',
  templateUrl: './vep-pass-thank-you.component.html',
  styleUrls: ['./vep-pass-thank-you.component.scss']
})
export class VepPassThankYouComponent implements OnInit {
  referenceNo: string;
  totalAmnt: string;
  txnDateTime: Date;
  vepVehicleresponse: IVepVehicleContextResponse;
  vepresp: IVepVehicleContextResponse = null;
  viewPath: string;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  disableReceipt:boolean  = true;
  constructor(private vepService: VepPassesService, private vepContext: VepContextService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.vepContext.currentContext
      .subscribe(customerContext => { this.vepVehicleresponse = customerContext; }
      );
    this.referenceNo = this.vepVehicleresponse.ReferenceNo;
    this.totalAmnt = this.vepVehicleresponse.TotalAmount;
    this.txnDateTime = this.vepVehicleresponse.TxnDateTime;           
    if (parseInt(this.vepVehicleresponse.TotalAmount) > 0) {
      $('#pageloader').modal('show');
      this.vepService.generateVEPPaymentReciept(this.vepVehicleresponse, this.vepVehicleresponse.PaymentId, this.vepVehicleresponse.CustomerId).subscribe(res => {               
        console.log(res);
        this.disableReceipt = false;
        this.viewPath = res;
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
    this.vepContext.changeResponse(this.vepresp);
  }

  generateReceipt() {
    window.open(this.viewPath);
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
