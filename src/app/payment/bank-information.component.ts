import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IBankRequest } from "./models/bankrequest";
import { PaymentService } from "./services/payment.service";
import { Router } from "@angular/router";
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-bank-information',
  templateUrl: './bank-information.component.html',
  styleUrls: ['./bank-information.component.css']
})
export class BankInformationComponent implements OnInit {
  createForm: FormGroup;
  @Input("IsSaveBankCheckBox") isSaveCheckBox: boolean;
  bnkReqest: IBankRequest = <IBankRequest>{};
  @Input("BankObject") bankObject: IBankRequest[];
  @Input("ReplenishMentType") replenishMentType: string = "";
  @Input("Customerid") customerId: number;
  @Output() saveClicked = new EventEmitter();

  sessionContextResponse: IUserresponse;

  saveVisible: boolean = false;
  saveChecBoxVisible = false;
  constructor(private _PaymentService: PaymentService, private materialscriptService: MaterialscriptService, private router: Router, private sessionService: SessionService) { }

  ngOnInit() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material()
    }, 100);
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    //  this.sessionContextResponse = <IUserresponse>{};
    // this.sessionContextResponse.userId = 235235235;
    // this.sessionContextResponse.userName = "Tpsuperuser";
    // this.sessionContextResponse.loginId = 12345;
    this.createForm = new FormGroup({
      'accountHolderName': new FormControl('', [Validators.required]),
      'bankName': new FormControl('', [Validators.required]),
      'accountNo': new FormControl('', [Validators.required, Validators.minLength(9)]),
      'routingValue': new FormControl('', [Validators.required, Validators.minLength(9)]),
      "SaveBank": new FormControl('')
    });
    if (this.bankObject != null && this.bankObject.length > 0) {
      this.saveVisible = false;
      this.createForm.patchValue({ 'accountHolderName': this.bankObject[0].AccName, 'bankName': this.bankObject[0].BankName, 'routingValue': this.bankObject[0].MICRCode });
      if (this.bankObject[0].IsDefault != undefined && this.bankObject[0].IsDefault)
        this.createForm.patchValue({ 'SaveBank': this.bankObject[0].IsDefault });
      this.isSaveCheckBox = true;
    }
    else {
      if (this.replenishMentType != undefined && this.replenishMentType.toUpperCase() == "ACH") {
        this.saveVisible = true;
        this.isSaveCheckBox = false;
      }
    }
  }

  saveBankDetails(objBank: IBankRequest): boolean {
    $('#pageloader').modal('show');
    objBank = this.bnkReqest;

    objBank.AccName = this.createForm.controls['accountHolderName'].value.toUpperCase();
    objBank.BankName = this.createForm.controls['bankName'].value.toUpperCase();
    objBank.MICRCode = this.createForm.controls['routingValue'].value;
    objBank.Accnumber = this.createForm.controls['accountNo'].value;
    if (this.saveVisible)
      objBank.IsDefault = true;
    else
      objBank.IsDefault = this.createForm.controls['SaveBank'].value;
    let accNumber: string;
    accNumber = objBank.Accnumber.toString();
    if (objBank.Accnumber != "")
      objBank.prefixsuffix = +accNumber.substr(accNumber.length - 4);
    else
      objBank.prefixsuffix = 0;
    objBank.User = this.sessionContextResponse.userName;
    objBank.CustomerId = this.customerId;
    this._PaymentService.CreateBank(objBank).subscribe(res => {
      if (res) {
        this.saveVisible = false;
        if (this.router.url.endsWith('/payment/add-bankinformation'))
          this.isSaveCheckBox = false;
        else
          this.isSaveCheckBox = true;
        this.saveClicked.emit({ result: true, msg: "ACH account has been added successfully" });
        $('#pageloader').modal('hide');
        return true;
      }
      else {
        $('#pageloader').modal('hide');
        return false;
      }
    },
      err => {
        $('#pageloader').modal('hide');
      });
    return true;
  }
}