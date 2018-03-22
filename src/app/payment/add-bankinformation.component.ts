import { Component, OnInit, ViewChild } from '@angular/core';
import { BankInformationComponent } from './bank-information.component';
import { FormsModule, FormGroup, FormControl } from '@angular/forms';
import { IBankRequest } from './models/bankrequest';
import { SharedModule } from './../shared/shared.module';
import { CustomerContextService } from "../shared/services/customer.context.service";
import { PaymentService } from "./services/payment.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { TableLayoutComponent } from "../shared/table-layout.component";
import { CommonService } from "../shared/services/common.service";
import { Features, Actions } from "../shared/constants";
import { IUserEvents } from "../shared/models/userevents";
import { SessionService } from "../shared/services/session.service";
import { IUserresponse } from "../shared/models/userresponse";
import { Router } from "@angular/router";
import { MaterialscriptService } from "../shared/materialscript.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";

@Component({
  selector: 'app-add-bankinformation',
  templateUrl: './add-bankinformation.component.html',
  styleUrls: ['./add-bankinformation.component.scss']
})
export class AddBankinformationComponent implements OnInit {
  setPrimaryBankForm: FormGroup;
  bankInfo: any;
  sessionContextResponse: IUserresponse;
  disableDeleteButton: boolean;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  resetBank: boolean;
  deleteBank: boolean;
  updateBank: boolean;
  addBank: boolean;
  msgType: string;
  msgDesc: any;
  msgTitle: string;
  msgFlag: any;
  enterBankDetails: boolean;
  bankAccountDetails: FormGroup;
  addBankInfo: IBankRequest = <IBankRequest>{};
  customerContextResponse: ICustomerContextResponse;
  successBlock: boolean = false;
  successMessage: string;
  items: any;
  bankAccountInfo: Array<any> = [];
  isPrimaryBankInfo: boolean = false;
  errorBlock: boolean = false;
  errorHeading: string;
  errorMessage: string;
  customerId: number;
  maxBankAccounts: number = 0;
  bankAccntsCount: number = 0;
  @ViewChild(BankInformationComponent) bankAccountDetailsComponent;

  constructor(private customerContext: CustomerContextService, private materialscriptService: MaterialscriptService, private router: Router, private paymentService: PaymentService, private commonService: CommonService, private context: SessionService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.setPrimaryBankForm = new FormGroup({
      'isPrimaryBank': new FormControl('')
    })
    this.sessionContextResponse = this.context.customerContext;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0 && this.customerContextResponse.AccountStatus === "AC") {
      this.customerId = this.customerContextResponse.AccountId;
      this.getBankByAccountId(this.customerId.toString());
    }
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.BANKACCOUNTS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.BANKACCOUNTS], Actions[Actions.UPDATE], "");
    this.disableDeleteButton = !this.commonService.isAllowed(Features[Features.BANKACCOUNTS], Actions[Actions.DELETE], "");

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxBankAccounts).subscribe(res => {
      this.maxBankAccounts = res;
    });
  }

  getBankByAccountId(customerId) {
    //console.log("customerId", customerId);
    this.paymentService.GetBankByAccountID(customerId).subscribe(res => {
      this.items = res;
      this.bankAccntsCount = this.items.length;
      //console.log("items: ", this.items);
      this.bankAccountInfo = [];
      this.items.forEach(element => {
        this.bankAccountInfo.push({
          "CustomerBankAccountId": element.CustomerBankAccountId,
          "accName": element.AccName,
          "bankAccount": "XXXX_" + element.prefixsuffix,
          "routingNumber": element.MICRCode,
          "bankName": element.BankName,
          "primaryCard": element.IsDefault,
          "Accnumber": element.Accnumber
        });
      });
      //console.log("bankAccountInfo: ", this.bankAccountInfo);
    });
  }

  addNewBankInfo() {
    this.enterBankDetails = true;
    this.addBank = true;
    this.updateBank = false;
    this.deleteBank = false;
    this.resetBank = true;
    this.bankAccountDetails = this.bankAccountDetailsComponent.createForm;
    this.bankAccountDetails.reset();
    this.bankAccountDetails.get('bankName').enable();
    this.bankAccountDetails.get('accountNo').enable();
    this.bankAccountDetails.get('accountHolderName').enable();
    this.bankAccountDetails.get('routingValue').enable();
    this.setPrimaryBankForm.controls['isPrimaryBank'].enable();
    this.materialscriptService.material();
    this.isPrimaryBankInfo = false;
  }

  addBankDetails() {
    let isFormValid: boolean;
    isFormValid = this.bankAccountDetailsComponent.createForm.valid;
    if (isFormValid) {

      if (this.maxBankAccounts <= this.bankAccntsCount) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = "Number of Bank Accounts limit has exceeded";
        return;
      }

      this.addBankInfo.AccName = this.bankAccountDetails.controls['accountHolderName'].value.toUpperCase();
      this.addBankInfo.BankName = this.bankAccountDetails.controls['bankName'].value.toUpperCase();
      this.addBankInfo.MICRCode = this.bankAccountDetails.controls['routingValue'].value;
      this.addBankInfo.Accnumber = this.bankAccountDetails.controls['accountNo'].value;
      this.addBankInfo.IsDefault = this.isPrimaryBankInfo;
      // this.addBankInfo.CustomerBankAccountId = this.bankInfo.CustomerBankAccountId;
      let accNumber: string;
      accNumber = this.addBankInfo.Accnumber.toString();
      if (this.addBankInfo.Accnumber != "")
        this.addBankInfo.prefixsuffix = +accNumber.substr(accNumber.length - 4);
      else
        this.addBankInfo.prefixsuffix = 0;
      this.addBankInfo.User = this.sessionContextResponse.userName;
      this.addBankInfo.CustomerId = this.customerId;
      //console.log("addBankInfo: ", this.addBankInfo);
      this.paymentService.CreateBank(this.addBankInfo).subscribe(res => {
        //console.log("response: ", res);
        if (res) {
          this.bankAccountInfo = []
          this.getBankByAccountId(this.customerId.toString());
          this.bankAccountDetails.reset();
          this.isPrimaryBankInfo = false;
          this.enterBankDetails = false;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = "Bank Details has been added successfully";
        }
      },
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        })
    } else {
      // this.msgFlag = true;
      // this.msgType = 'error'
      // this.msgTitle = "Validation Failed";
      // this.msgDesc = "Enter valid data";
      this.validateAllFormFields(this.bankAccountDetailsComponent.createForm)
    }
    this.isPrimaryBankInfo = false;
  }

  resetBankDetails() {
    if (this.updateBank) {
      this.editBankDetails(this.bankInfo);
    } else {
      this.bankAccountDetails = this.bankAccountDetailsComponent.createForm;
      this.bankAccountDetails.reset();
      this.isPrimaryBankInfo = false;
    }
  }

  addBankInfoClicked($event) {
    if ($event.result == true) {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgTitle = ''
      this.msgDesc = $event.msg;
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgTitle = ''
      this.msgDesc = $event.statusText;
    }

  }

  cancelBankDetails() {
    this.enterBankDetails = false;
    this.addBank = true;
    this.updateBank = false;
    this.deleteBank = false;
    this.resetBank = true;
  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }

  editBankDetails(bankInfo) {
    this.bankInfo = bankInfo;
    // console.log("bank Info: ", bankInfo);
    this.enterBankDetails = true;
    this.addBank = false;
    this.updateBank = true;
    this.deleteBank = false;
    this.resetBank = true;
    this.bankAccountDetails = this.bankAccountDetailsComponent.createForm;
    this.bankAccountDetails.get('accountHolderName').enable();
    this.bankAccountDetails.get('routingValue').enable();
    this.setPrimaryBankForm.controls['isPrimaryBank'].enable();
    this.isPrimaryBankInfo = bankInfo.primaryCard;
    this.sharedBankDetails(bankInfo);
    this.materialscriptService.material();
    if (this.isPrimaryBankInfo)
      this.setPrimaryBankForm.controls['isPrimaryBank'].disable();
    else
      this.setPrimaryBankForm.controls['isPrimaryBank'].enable();
  }

  updateBankDetails() {
    // //console.log("bank Info update: ", this.bankInfo);
    this.addBankInfo.AccName = this.bankAccountDetails.controls['accountHolderName'].value.toUpperCase();
    this.addBankInfo.BankName = this.bankAccountDetails.controls['bankName'].value.toUpperCase();
    this.addBankInfo.MICRCode = this.bankAccountDetails.controls['routingValue'].value;
    this.addBankInfo.Accnumber = this.bankAccountDetails.controls['accountNo'].value;
    this.addBankInfo.IsDefault = this.isPrimaryBankInfo;
    this.addBankInfo.CustomerBankAccountId = this.bankInfo.CustomerBankAccountId;
    let accNumber: string;
    accNumber = this.addBankInfo.Accnumber.toString();
    if (this.addBankInfo.Accnumber != "")
      this.addBankInfo.prefixsuffix = +accNumber.substr(accNumber.length - 4);
    else
      this.addBankInfo.prefixsuffix = 0;
    this.addBankInfo.User = this.sessionContextResponse.userName;
    this.addBankInfo.CustomerId = this.customerId;
    //console.log("addBankInfo: ", this.addBankInfo);
    this.addBankInfo.Accnumber = this.bankInfo.Accnumber;
    this.paymentService.updateBank(this.addBankInfo).subscribe(res => {
      //console.log("response: ", res);
      if (res) {
        this.bankAccountInfo = []
        this.getBankByAccountId(this.customerId.toString());
        this.bankAccountDetails.reset();
        this.isPrimaryBankInfo = false;
        this.enterBankDetails = false;
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgTitle = '';
        this.msgDesc = "Bank Details has been updated successfully";
      }
    },
      err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = err.statusText;
      })
  }

  deleteBankDetails(bankInfo) {
    //console.log("bank Info: ", bankInfo);
    this.enterBankDetails = true;
    this.addBank = false;
    this.updateBank = false;
    this.deleteBank = true;
    this.resetBank = false;
    this.bankAccountDetails = this.bankAccountDetailsComponent.createForm;
    this.bankAccountDetails.get('accountHolderName').disable();
    this.bankAccountDetails.get('routingValue').disable();
    this.setPrimaryBankForm.controls['isPrimaryBank'].disable();
    this.isPrimaryBankInfo = bankInfo.primaryCard;
    this.sharedBankDetails(bankInfo);
    this.materialscriptService.material();
  }

  deleteDetails() {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgTitle = '';
    this.msgDesc = "Are you sure you want to delete the bank information?";
  }

  okDeleteBankInfo(event) {
    // console.log("event", event.target.value);
    if (event) {
      this.addBankInfo.AccName = this.bankAccountDetails.controls['accountHolderName'].value.toUpperCase();
      this.addBankInfo.BankName = this.bankAccountDetails.controls['bankName'].value.toUpperCase();
      this.addBankInfo.MICRCode = this.bankAccountDetails.controls['routingValue'].value;
      this.addBankInfo.Accnumber = this.bankAccountDetails.controls['accountNo'].value;
      this.addBankInfo.CustomerBankAccountId = this.bankInfo.CustomerBankAccountId;
      this.addBankInfo.User = this.sessionContextResponse.userName;
      this.addBankInfo.CustomerId = this.customerId;
      //console.log("addBankInfo: ", this.addBankInfo);
      this.paymentService.deleteBank(this.addBankInfo).subscribe(res => {
        //console.log("response: ", res);
        if (res) {
          this.bankAccountInfo = []
          this.getBankByAccountId(this.customerId.toString());
          this.bankAccountDetails.reset();
          this.isPrimaryBankInfo = false;
          this.enterBankDetails = false;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = "Bank information has been deleted successfully";
        }
      },
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        })
    }
  }

  sharedBankDetails(bankInfo) {
    //console.log("bank Info: ", bankInfo);
    this.bankInfo = bankInfo;
    this.enterBankDetails = true;
    this.addBank = false;
    this.bankAccountDetails = this.bankAccountDetailsComponent.createForm;
    this.bankAccountDetails.controls['accountHolderName'].setValue(bankInfo.accName);
    this.bankAccountDetails.controls['bankName'].setValue(bankInfo.bankName);
    this.bankAccountDetails.controls['routingValue'].setValue(bankInfo.routingNumber);
    this.bankAccountDetails.controls['accountNo'].setValue(bankInfo.bankAccount);
    this.bankAccountDetails.get('bankName').disable();
    this.bankAccountDetails.get('accountNo').disable();
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.BANKACCOUNTS];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }
}
