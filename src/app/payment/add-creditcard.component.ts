import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreditCardInformationComponent } from './credit-card-information.component';
import { ICreditCardRequest } from './models/creditcardrequest';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { PaymentService } from './services/payment.service';
import { SharedModule } from './../shared/shared.module';
import { TableLayoutComponent } from "../shared/table-layout.component";
import { CommonService } from "../shared/services/common.service";
import { Features, Actions } from "../shared/constants";
import { Router } from "@angular/router";
import { SessionService } from "../shared/services/session.service";
import { IUserEvents } from "../shared/models/userevents";
import { IUserresponse } from "../shared/models/userresponse";
import { AddCreditCardDetailsComponent } from "../csc/customerservice/add-credit-card-details.component";
import { MaterialscriptService } from "../shared/materialscript.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
// import { IAddressCreditCardResponse } from "../shared/models/addresscreditcardresponse";
import { AddressCreditcardService } from "../shared/services/addresscreditcarddetails.context.service";
import { IAddressResponse } from "../shared/models/addressresponse";

@Component({
  selector: 'app-add-creditcard',
  templateUrl: './add-creditcard.component.html',
  styleUrls: ['./add-creditcard.component.scss']
})
export class AddCreditcardComponent implements OnInit {
  addressContext: IAddressResponse;
  status: string;
  @Output() buttonClicked: EventEmitter<boolean>;
  setPrimaryCardForm: FormGroup;
  updateCredit: boolean;
  getCreditCardDetails: ICreditCardRequest[] = [];
  resetCardDetails: boolean;
  deleteCardDetails: boolean;
  creditCard: any;
  addCardDetails: boolean;
  updateCardDetails: boolean;
  disableDeleteButton: boolean;
  disableUpdateButton: boolean;
  sessionContextResponse: IUserresponse;
  disableCreateButton: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  enterCreditCardDetails: boolean;
  creditCardDetails: FormGroup;
  creditCardNumber: string;
  successBlock: boolean = false;
  successMessage: string;
  addCreditCardDetail: ICreditCardRequest = <ICreditCardRequest>{};
  customerContextResponse: ICustomerContextResponse;
  isPrimaryCreditCard: boolean = false;
  errorBlock: boolean = false;
  errorHeading: string;
  errorMessage: string;
  items: any;
  creditCardInfo: Array<any> = [];
  setPrimaryCard: boolean = false;
  customerId: number = 0;
  isDeletebutton: boolean = false;
  isAddButton: boolean = false;
  maxCreditCards: number = 0;
  cardsCount: number = 0;
  @ViewChild(CreditCardInformationComponent) creditCardDetailsComponent;
  // @ViewChild(TableLayoutComponent) commonTableLayoutComponent;
  constructor(private customerContext: CustomerContextService, private addressCreditcardService: AddressCreditcardService, private router: Router, private paymentService: PaymentService, private commonService: CommonService, private context: SessionService, private materialscriptService: MaterialscriptService) {
    this.buttonClicked = new EventEmitter();
  }

  ngOnInit() {
    let isFormValid: boolean;
    // this.creditCard = {};
    isFormValid = this.creditCardDetailsComponent.createForm.valid;
    this.creditCardDetails = this.creditCardDetailsComponent.createForm;
    this.materialscriptService.material();
    this.setPrimaryCardForm = new FormGroup({
      'isPrimaryCard': new FormControl('')
    });
    this.status = "Add";
    this.addCardDetails = true;
    this.sessionContextResponse = this.context.customerContext;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId !== undefined) {
      if (this.customerContextResponse.AccountId > 0 && this.customerContextResponse.AccountStatus === "AC") {
        this.customerId = this.customerContextResponse.AccountId;
        // console.log("customerId: ", this.customerId);
        this.getCreditCardByAccountId(this.customerId.toString());
      }
    }
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.CREDITCARDS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.CREDITCARDS], Actions[Actions.UPDATE], "");
    this.disableDeleteButton = !this.commonService.isAllowed(Features[Features.CREDITCARDS], Actions[Actions.DELETE], "");

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxCreditCards).subscribe(res => {
      this.maxCreditCards = res;
    });
    // this.creditCardDetailsComponent.addressResponse;
    // console.log("addressResponse: ", this.creditCardDetailsComponent.);
    // let addressContext: IAddressCreditCardResponse = <IAddressCreditCardResponse>{};
    this.addressCreditcardService.currentContext.subscribe(customerContext => this.addressContext = customerContext);
  }

  getCreditCardByAccountId(customerId) {
    this.paymentService.GetCreditCardByAccountId(customerId).subscribe(res => {
      this.items = res;
      // console.log("getCreditCardDetails: ", this.items);
      this.cardsCount = this.items.length;
      this.creditCardInfo = [];
      this.items.forEach(element => {
        this.creditCardInfo.push({
          "cardNum": "XXXX_" + element.prefixsuffix,
          "cardType": element.CCType,
          "cardExpDate": element.ExpDate.toString().substring(4, 6) + '/' + element.ExpDate.toString().substring(0, 4),
          "primaryCard": element.DefaultFlag,
          "NameOnCard": element.NameOnCard,
          "CCID": element.CCID,
          "DefaultFlag": element.DefaultFlag,
          "FullAddress": element.FullAddress,
          "Line1": element.Line1,
          "Line2": element.Line2,
          "Line3": element.Line3,
          "City": element.City,
          "State": element.State,
          "Zip1": element.Zip1,
          "Zip2": element.Zip2,
          "Country": element.Country
        });

        // if (this.creditCardInfo.length < 5) {
        //   this.creditCardInfo.push(creditCardObj);
        // }
      });
      // console.log("creditCardInfo: ", this.creditCardInfo);
    });
  }

  // Show Credit Card Information
  addNewCreditCard() {
    this.status = "Add";
    this.isDeletebutton = false;
    this.isAddButton = true;
    this.enterCreditCardDetails = true;
    this.resetCardDetails = true;
    this.addCardDetails = true;
    this.updateCardDetails = false;
    this.deleteCardDetails = false;
    this.isPrimaryCreditCard = false;
    this.creditCardDetails.controls['Name'].enable();
    this.creditCardDetails.controls['CardType'].enable();
    this.creditCardDetails.controls['Month'].enable();
    this.creditCardDetails.controls['Year'].enable();
    this.creditCardDetails.reset();
    if (this.isAddButton) {
      this.creditCardDetailsComponent.isAddressEnable = false;
    }
    this.creditCardDetails.get('CCNumbers.CCNumber1').enable();
    this.creditCardDetails.get('CCNumbers.CCNumber2').enable();
    this.creditCardDetails.get('CCNumbers.CCNumber3').enable();
    this.creditCardDetails.get('CCNumbers.CCNumber4').enable();
    this.setPrimaryCardForm.controls['isPrimaryCard'].enable();
    this.materialscriptService.material();
    let addressContext: IAddressResponse = <IAddressResponse>{};
    addressContext = null;
    this.addressCreditcardService.changeResponse(addressContext);
  }

  // add card details
  addCreditCardDetails() {
    let isFormValid: boolean;
    // this.creditCard = {};
    isFormValid = this.creditCardDetailsComponent.createForm.valid;
    if (isFormValid && !this.creditCardDetailsComponent.addressComponent.addAddressForm.invalid) {

      this.creditCardDetails = this.creditCardDetailsComponent.createForm;
      let creditCardNum: string;
      creditCardNum = this.creditCardDetails.get("CCNumbers.CCNumber1").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber2").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber3").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber4").value;
      if (creditCardNum != "")
        this.addCreditCardDetail.prefixsuffix = +creditCardNum.substr(creditCardNum.length - 4);
      else
        this.addCreditCardDetail.prefixsuffix = 0;

      if (this.maxCreditCards <= this.cardsCount) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = "Number of Credit Cards limit has exceeded";
        return;
      }

      if (!this.checkCreditCard(creditCardNum, this.creditCardDetails.controls['CardType'].value)) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = "Enter valid Credit Card #";
        return;
      }
      this.addCreditCardDetail.CCNumber = creditCardNum;
      this.addCreditCardDetail.DefaultFlag = this.isPrimaryCreditCard; // is Primay Card Selected
      this.addCreditCardDetail.CCType = this.creditCardDetails.controls['CardType'].value;
      this.addCreditCardDetail.ExpDate = Number(this.creditCardDetails.controls['Year'].value * 100) + Number(this.creditCardDetails.controls['Month'].value);
      this.addCreditCardDetail.NameOnCard = this.creditCardDetails.controls['Name'].value.toUpperCase();
      this.addCreditCardDetail.Line1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
      this.addCreditCardDetail.Line2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
      this.addCreditCardDetail.Line3 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine3"].value;
      this.addCreditCardDetail.City = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCity"].value;
      this.addCreditCardDetail.State = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
      this.addCreditCardDetail.Country = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
      this.addCreditCardDetail.Zip1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
      this.addCreditCardDetail.Zip2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
      this.addCreditCardDetail.User = this.sessionContextResponse.userName;
      this.addCreditCardDetail.ICNId = this.sessionContextResponse.icnId;
      this.addCreditCardDetail.CustomerId = this.customerId;
      //console.log("addCreditCardDetail: ", this.addCreditCardDetail);

      this.paymentService.CreateCreditCard(this.addCreditCardDetail).subscribe(res => {
        // console.log("response Create Credit CardF: ", res);
        if (res) {
          this.creditCardInfo = [];
          this.buttonClicked.emit();
          // this.accountInfo.refreshPaymentAmountDetails();
          this.getCreditCardByAccountId(this.customerId.toString());
          this.creditCardDetails.reset();
          this.isPrimaryCreditCard = false;
          this.enterCreditCardDetails = false;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = "Credit Card has been added successfully";
          this.creditCardDetailsComponent.isAddressEnable = true;
        }
      },
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        }
      )
    } else {
      // this.msgFlag = true;
      // this.msgType = 'error';
      // this.msgTitle = 'Validation Failed';
      // this.msgDesc = "Enter valid data";
      this.validateAllFormFields(this.creditCardDetailsComponent.createForm)
      this.validateAllFormFields(this.creditCardDetailsComponent.addressComponent.addAddressForm);
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  // Reset Card Details
  resetCreditCardInformation() {
    if (this.updateCardDetails) {
      this.editCreditCardDetails(this.creditCard);
      this.creditCardDetailsComponent.addressChange('exist');
    } else {
      this.creditCardDetails = this.creditCardDetailsComponent.createForm;
      this.creditCardDetails.reset();
      this.creditCardDetailsComponent.addressChange('exist');
      this.isPrimaryCreditCard = false;
    }
  }

  addCreditCardClicked($event) {
    if ($event.result == true) {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgTitle = ''
      this.msgDesc = $event.msg;
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = $event.msg;
    }
  }

  updateCreditCardDetails() {
    if (!this.creditCardDetailsComponent.createForm.valid ||
      this.creditCardDetailsComponent.addressComponent.addAddressForm.invalid) {
      this.validateAllFormFields(this.creditCardDetailsComponent.createForm)
      this.validateAllFormFields(this.creditCardDetailsComponent.addressComponent.addAddressForm);
      return;
    }
    this.creditCardDetails = this.creditCardDetailsComponent.createForm;
    let creditCardNum: string;
    creditCardNum = this.creditCardDetails.get("CCNumbers.CCNumber1").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber2").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber3").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber4").value;
    if (creditCardNum != "")
      this.addCreditCardDetail.prefixsuffix = +creditCardNum.substr(creditCardNum.length - 4);
    else
      this.addCreditCardDetail.prefixsuffix = 0;
    this.addCreditCardDetail.CCNumber = creditCardNum;
    this.addCreditCardDetail.DefaultFlag = this.isPrimaryCreditCard; // is Primay Card Selected
    this.addCreditCardDetail.CCType = this.creditCardDetails.controls['CardType'].value;
    this.addCreditCardDetail.ExpDate = Number(this.creditCardDetails.controls['Year'].value * 100) + Number(this.creditCardDetails.controls['Month'].value);
    this.addCreditCardDetail.NameOnCard = this.creditCardDetails.controls['Name'].value.toUpperCase();
    this.addCreditCardDetail.Line1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
    this.addCreditCardDetail.Line2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
    this.addCreditCardDetail.Line3 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine3"].value;
    this.addCreditCardDetail.City = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCity"].value;
    this.addCreditCardDetail.State = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
    this.addCreditCardDetail.Country = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
    this.addCreditCardDetail.Zip1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
    this.addCreditCardDetail.Zip2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
    this.addCreditCardDetail.User = this.sessionContextResponse.userName;
    this.addCreditCardDetail.ICNId = this.sessionContextResponse.icnId;
    this.addCreditCardDetail.CCID = this.creditCard.CCID;
    this.addCreditCardDetail.CustomerId = this.customerId;
    //console.log("addCreditCardDetail: ", this.addCreditCardDetail);

    this.paymentService.UpdateCreditCard(this.addCreditCardDetail).subscribe(res => {
      // console.log("response Update: ", res);
      if (res) {
        this.creditCardInfo = [];
        this.getCreditCardByAccountId(this.customerId.toString());
        // this.addCreditCardDetailsComponent.updateAccountInfo();
        this.creditCardDetails.reset();
        this.buttonClicked.emit();
        this.isPrimaryCreditCard = false;
        this.enterCreditCardDetails = false;
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgTitle = '';
        this.msgDesc = "Credit Card has been updated successfully";
        let addressContext: IAddressResponse = <IAddressResponse>{};
        addressContext = this.creditCard;
        this.addressCreditcardService.changeResponse(addressContext);
        this.creditCardDetailsComponent.isAddressEnable = true;
        // console.log("addressContext: ", addressContext);
      }
    },
      err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = err.statusText;
      }
    )
  }

  editCreditCardDetails(creditCard) {
    this.isDeletebutton = false;
    this.isAddButton = false;
    let addressContext: IAddressResponse = <IAddressResponse>{};
    this.creditCard = creditCard;
    this.status = "Update";
    addressContext = this.creditCard;
    this.creditCardDetails.controls['Name'].enable();
    this.creditCardDetails.controls['CardType'].enable();
    this.creditCardDetails.controls['Month'].enable();
    this.creditCardDetails.controls['Year'].enable();
    // console.log("this.addressContext.addressResponse: ", addressContext);
    this.addressCreditcardService.changeResponse(addressContext);
    this.creditCardDetailsComponent.isAddressEnable = false;
    this.sharedCardDetails(creditCard);
    let rootSelect = this;
    setTimeout(function () {
      rootSelect.materialscriptService.material();
    }, 100);
    this.updateCardDetails = true;
    this.deleteCardDetails = false;
    this.resetCardDetails = true;
    if (this.isPrimaryCreditCard)
      this.setPrimaryCardForm.controls['isPrimaryCard'].disable();
    else
      this.setPrimaryCardForm.controls['isPrimaryCard'].enable();
  }

  deleteCreditCardDetails(creditCard) {
    let addressContext: IAddressResponse = <IAddressResponse>{};
    this.creditCard = creditCard;
    this.status = "Update";
    addressContext = this.creditCard;
    //console.log("Card Number: ", creditCard);
    this.isDeletebutton = true;
    this.isAddButton = false;
    this.status = "Delete";
    this.updateCardDetails = false;
    this.deleteCardDetails = true;
    this.resetCardDetails = false;
    this.setPrimaryCardForm.controls['isPrimaryCard'].disable();
    this.addressCreditcardService.changeResponse(addressContext);
    this.creditCardDetailsComponent.isAddressEnable = false;
    this.creditCardDetails.controls['Name'].disable();
    this.creditCardDetails.controls['CardType'].disable();
    this.creditCardDetails.controls['Month'].disable();
    this.creditCardDetails.controls['Year'].disable();
    this.sharedCardDetails(creditCard);
    let rootSelect = this;
    setTimeout(function () {
      rootSelect.materialscriptService.material();
    }, 100)
    this.materialscriptService.material();

  }

  sharedCardDetails(creditCard) {
    //console.log("shared Card Details: ", creditCard);
    this.creditCard = creditCard;
    this.enterCreditCardDetails = true;
    this.addCardDetails = false;
    this.creditCardDetails = this.creditCardDetailsComponent.createForm;
    this.creditCardDetails.controls['Name'].setValue(creditCard.NameOnCard);
    this.creditCardDetails.get('CCNumbers.CCNumber1').disable();
    this.creditCardDetails.get('CCNumbers.CCNumber2').disable();
    this.creditCardDetails.get('CCNumbers.CCNumber3').disable();
    this.creditCardDetails.get('CCNumbers.CCNumber4').disable();
    this.creditCardDetails.get('CCNumbers.CCNumber1').setValue(creditCard.cardNum.split("_")[0]);
    this.creditCardDetails.get('CCNumbers.CCNumber2').setValue(creditCard.cardNum.split("_")[0]);
    this.creditCardDetails.get('CCNumbers.CCNumber3').setValue(creditCard.cardNum.split("_")[0]);
    this.creditCardDetails.get('CCNumbers.CCNumber4').setValue(creditCard.cardNum.split("_")[1]);
    this.isPrimaryCreditCard = creditCard.DefaultFlag;
    this.creditCardDetails.controls['CardType'].setValue(creditCard.cardType);
    this.creditCardDetails.controls['Month'].setValue(parseInt(creditCard.cardExpDate.split("/")[0]));
    this.creditCardDetails.controls['Year'].setValue(creditCard.cardExpDate.split("/")[1]);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressLine1'].setValue(creditCard.Line1);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressLine2'].setValue(creditCard.Line2);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressLine3'].setValue(creditCard.Line3);

    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressCity'].setValue(creditCard.City);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressStateSelected'].setValue(creditCard.State);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressCountrySelected'].setValue(creditCard.Country);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressZip1'].setValue(creditCard.Zip1);
    this.creditCardDetailsComponent.addressComponent.addAddressForm.controls['addressZip2'].setValue(creditCard.Zip2);
    this.materialscriptService.material();
  }

  deleteCreditCard() {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgTitle = '';
    this.msgDesc = "Are you sure you want to delete the Credit Card?";
  }

  okDeleteCreditCard(event) {
    if (event) {
      this.creditCardDetails = this.creditCardDetailsComponent.createForm;
      let creditCardNum: string;
      creditCardNum = this.creditCardDetails.get("CCNumbers.CCNumber1").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber2").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber3").value + "" + this.creditCardDetails.get("CCNumbers.CCNumber4").value;
      if (creditCardNum != "")
        this.addCreditCardDetail.prefixsuffix = +creditCardNum.substr(creditCardNum.length - 4);
      else
        this.addCreditCardDetail.prefixsuffix = 0;
      this.addCreditCardDetail.CCNumber = creditCardNum;
      this.addCreditCardDetail.CCType = this.creditCardDetails.controls['CardType'].value;
      this.addCreditCardDetail.ExpDate = Number(this.creditCardDetails.controls['Year'].value * 100) + Number(this.creditCardDetails.controls['Month'].value);
      this.addCreditCardDetail.NameOnCard = this.creditCardDetails.controls['Name'].value.toUpperCase();
      this.addCreditCardDetail.Line1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
      this.addCreditCardDetail.Line2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
      this.addCreditCardDetail.Line3 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine3"].value;
      this.addCreditCardDetail.City = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCity"].value;
      this.addCreditCardDetail.State = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
      this.addCreditCardDetail.Country = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
      this.addCreditCardDetail.Zip1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
      this.addCreditCardDetail.Zip2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
      this.addCreditCardDetail.User = this.sessionContextResponse.userName;
      this.addCreditCardDetail.ICNId = this.sessionContextResponse.icnId;
      this.addCreditCardDetail.CCID = this.creditCard.CCID;
      this.addCreditCardDetail.CustomerId = this.customerId;
      //console.log("addCreditCardDetail: ", this.addCreditCardDetail);
      this.paymentService.DeleteCreditCard(this.addCreditCardDetail).subscribe(res => {
        //console.log("response: ", res);
        if (res) {
          this.creditCardInfo = [];
          this.getCreditCardByAccountId(this.customerId.toString());
          this.creditCardDetails.reset();
          this.buttonClicked.emit();
          this.isPrimaryCreditCard = false;
          this.enterCreditCardDetails = false;
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = "Credit Card has been deleted successfully";
          this.creditCardDetailsComponent.isAddressEnable = true;
          //let addressContext: IAddressResponse = <IAddressResponse>{};
          //addressContext = null;
          //this.addressCreditcardService.changeResponse(addressContext);
        }
      },
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = err.statusText;
        });
    }
  }

  cancelCreditCardInformation() {
    this.enterCreditCardDetails = false;
    this.creditCardDetails = this.creditCardDetailsComponent.createForm;
    this.creditCardDetails.reset();
    this.creditCardDetailsComponent.isAddressEnable = true;
    let addressContext: IAddressResponse = <IAddressResponse>{};
    addressContext = null;
    this.addressCreditcardService.changeResponse(addressContext);
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.CREDITCARDS];
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



  // function to validate credit card number based on Card type
  checkCreditCard(cardnumber, cardname): boolean {

    // Array to hold the permitted card characteristics
    var cards = new Array();

    // Define the cards we support. You may add addtional card types.

    //  Name:      As in the selection box of the form - must be same as user's
    //  Length:    List of possible valid lengths of the card number for the card
    //  prefixes:  List of possible prefixes for the card
    //  checkdigit Boolean to say whether there is a check digit

    cards[0] = {
      name: "VISA",
      length: "13,16",
      prefixes: "4",
      checkdigit: true
    };
    cards[1] = {
      name: "MASTER",
      length: "16",
      prefixes: "51,52,53,54,55",
      checkdigit: true
    };
    cards[2] = {
      name: "DINERS",
      length: "14,16",
      prefixes: "300,301,302,303,304,305,36,38,55",
      checkdigit: true
    };
    cards[3] = {
      name: "CarteBlanche",
      length: "14",
      prefixes: "300,301,302,303,304,305,36,38",
      checkdigit: true
    };
    cards[4] = {
      name: "AMEX",
      length: "15",
      prefixes: "34,37",
      checkdigit: true
    };
    cards[5] = {
      name: "Discover",
      length: "16",
      prefixes: "6011,650",
      checkdigit: true
    };
    cards[6] = {
      name: "JCB",
      length: "15,16",
      prefixes: "3,1800,2131",
      checkdigit: true
    };
    cards[7] = {
      name: "enRoute",
      length: "15",
      prefixes: "2014,2149",
      checkdigit: true
    };
    cards[8] = {
      name: "Solo",
      length: "16,18,19",
      prefixes: "6334, 6767",
      checkdigit: true
    };
    cards[9] = {
      name: "Switch",
      length: "16,18,19",
      prefixes: "4903,4905,4911,4936,564182,633110,6333,6759",
      checkdigit: true
    };
    cards[10] = {
      name: "Maestro",
      length: "16,18",
      prefixes: "5020,6",
      checkdigit: true
    };
    cards[11] = {
      name: "VisaElectron",
      length: "16",
      prefixes: "417500,4917,4913",
      checkdigit: true
    };

    // Establish card type
    var cardType = -1;
    for (var i = 0; i < cards.length; i++) {

      // See if it is this card (ignoring the case of the string)
      if (cardname.toLowerCase() == cards[i].name.toLowerCase()) {
        cardType = i;
        break;
      }
    }

    // If card type not found, report an error
    if (cardType == -1) {
      //ccErrorNo = 0;
      return false;
    }

    // Ensure that the user has provided a credit card number
    if (cardnumber.length == 0) {
      //ccErrorNo = 1;
      return false;
    }

    // Now remove any spaces from the credit card number
    cardnumber = cardnumber.replace(/\s/g, "");

    // Check that the number is numeric
    var cardNo = cardnumber
    var cardexp = /^[0-9]{13,19}$/;
    if (!cardexp.exec(cardNo)) {
      //ccErrorNo = 2;
      return false;
    }

    // Now check the modulus 10 check digit - if required
    if (cards[cardType].checkdigit) {
      var checksum = 0;                                  // running checksum total
      var mychar = "";                                   // next char to process
      var j = 1;                                         // takes value of 1 or 2

      // Process each digit one by one starting at the right
      var calc;
      for (i = cardNo.length - 1; i >= 0; i--) {

        // Extract the next digit and multiply by 1 or 2 on alternative digits.
        calc = Number(cardNo.charAt(i)) * j;

        // If the result is in two digits add 1 to the checksum total
        if (calc > 9) {
          checksum = checksum + 1;
          calc = calc - 10;
        }

        // Add the units element to the checksum total
        checksum = checksum + calc;

        // Switch the value of j
        if (j == 1) { j = 2 } else { j = 1 };
      }

      // All done - if checksum is divisible by 10, it is a valid modulus 10.
      // If not, report an error.
      if (checksum % 10 != 0) {
        //ccErrorNo = 3;
        return false;
      }
    }

    // The following are the card-specific checks we undertake.
    var LengthValid = false;
    var PrefixValid = false;
    var undefined;

    // We use these for holding the valid lengths and prefixes of a card type
    var prefix = new Array();
    var lengths = new Array();

    // Load an array with the valid prefixes for this card
    prefix = cards[cardType].prefixes.split(",");

    // Now see if any of them match what we have in the card number
    for (i = 0; i < prefix.length; i++) {
      var exp = new RegExp("^" + prefix[i]);
      if (exp.test(cardNo)) PrefixValid = true;
    }

    // If it isn't a valid prefix there's no point at looking at the length
    if (!PrefixValid) {
      //ccErrorNo = 3;
      return false;
    }

    // See if the length is valid for this card
    lengths = cards[cardType].length.split(",");
    for (j = 0; j < lengths.length; j++) {
      if (cardNo.length == lengths[j]) LengthValid = true;
    }

    // See if all is OK by seeing if the length was valid. We only check the 
    // length if all else was hunky dory.
    if (!LengthValid) {
      //ccErrorNo = 4;
      return false;
    };
    // The credit card is in the required format.
    return true;
  }
}

