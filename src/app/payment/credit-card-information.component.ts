import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnChanges, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { PaymentService } from "./services/payment.service";
import { CreditCardType } from "./constants";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ICreditCardRequest } from "./models/creditcardrequest";
import { IMakePaymentrequest } from "./models/makepaymentrequest";
import { CommonService } from "../shared/services/common.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { Router } from "@angular/router";
import { AddAddressComponent } from "../shared/address/add-address.component";
import { IAddressResponse } from "../shared/models/addressresponse";
import { MaterialscriptService } from "../shared/materialscript.service";
import { AddressCreditcardService } from "../shared/services/addresscreditcarddetails.context.service";
//import { IAddressCreditCardResponse } from "../shared/models/addresscreditcardresponse";
declare var $: any;
@Component({
  selector: 'app-credit-card-information',
  templateUrl: './credit-card-information.component.html',
  styleUrls: ['./credit-card-information.component.css']
})
export class CreditCardInformationComponent implements OnInit, AfterViewChecked {
  isAddressButton: boolean = true;
  addressValue: string = "exist";
  cardType = [];
  years = [];
  months = [];
  creditCardRequest: ICreditCardRequest = <ICreditCardRequest>{};
  @Input("IsSaveCheckBox") isSaveCheckBox: boolean = true;
  @Input("CreditcardObjet") creditcardObjet: ICreditCardRequest[];
  @Input("ReplenishMentType") replenishMentType: string;
  @Input("Customerid") customerId: number;
  @Input("IsDeletebutton") isDeletebutton: boolean;
  @Input("IsAddButton") isAddButton: boolean;

  @Input("IsAddressVisible") isAddressVisible: boolean = true;
  @Output() saveClicked = new EventEmitter();
  @ViewChild(AddAddressComponent) addressComponent;
  @Input() addressResponse: IAddressResponse;

  sessionContextResponse: IUserresponse;
  isAddressEnable: boolean = false;
  saveVisible: boolean = false;
  createForm: FormGroup;

  constructor(private paymentService: PaymentService, private commonService: CommonService,
    private sessionService: SessionService, private addressCreditcardService: AddressCreditcardService, private router: Router, private el: ElementRef, private materialscriptService: MaterialscriptService, private cdr: ChangeDetectorRef) {

    this.createForm = new FormGroup({
      'Name': new FormControl('', [Validators.required]),
      'CCNumbers': new FormGroup({
        'CCNumber1': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber2': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber3': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber4': new FormControl('', [Validators.required])
      }),
      'CardType': new FormControl('', Validators.required),
      'Month': new FormControl('', Validators.required),
      'Year': new FormControl('', Validators.required),
      "SaveCreditCard": new FormControl('')
    });
  }

  ngOnInit() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 400);
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.paymentService.getLookups().subscribe(
      res => {
        this.cardType = res;
        this.bindExpireMonthsAndYears();
        if (this.creditcardObjet != null && this.creditcardObjet.length > 0 && this.replenishMentType != undefined) {
          this.saveVisible = false;
          this.createForm.patchValue({ 'Name': this.creditcardObjet[0].NameOnCard, 'CardType': this.creditcardObjet[0].CCType, 'Month': (Number)(this.creditcardObjet[0].ExpDate.toString().slice(-2)), 'Year': this.creditcardObjet[0].ExpDate.toString().substring(0, 4) });
          if (this.creditcardObjet[0].DefaultFlag != undefined && this.creditcardObjet[0].DefaultFlag)
            this.createForm.patchValue({ 'SaveCreditCard': true });
          if (this.creditcardObjet[0].IsPreferred) {
            var addressResponse = <IAddressResponse>{};
            addressResponse.Line1 = this.creditcardObjet[0].Line1;
            addressResponse.Line2 = this.creditcardObjet[0].Line2;
            addressResponse.Line3 = this.creditcardObjet[0].Line3;
            addressResponse.City = this.creditcardObjet[0].City;
            addressResponse.State = this.creditcardObjet[0].State
            addressResponse.Country = this.creditcardObjet[0].Country
            addressResponse.Zip1 = this.creditcardObjet[0].Zip1;
            addressResponse.Zip2 = this.creditcardObjet[0].Zip2
            this.addressResponse = addressResponse;
            this.isAddressEnable = this.creditcardObjet[0].IsPreferred;
          }
          this.isSaveCheckBox = true;
        }
        else {
          if (this.replenishMentType != undefined && this.replenishMentType.toUpperCase() == "CREDITCARD") {
            this.saveVisible = true;
            this.isSaveCheckBox = false;
          }
        }
      });

  }

  moveToNextTab(event, toTextBox, fromTexBox) {
    if (event.target.maxLength === event.target.value.length) {
      this.el.nativeElement.querySelector("#" + toTextBox).focus();
    }
    if (event.target.maxLength === 4 && event.target.value.length === 0) {
      this.el.nativeElement.querySelector("#" + fromTexBox).focus();
    }
    if (event.target.id === 'txt-4' && event.target.maxLength === event.target.value.length) {
      this.el.nativeElement.querySelector("#expiry-month").focus();
    }
  }

  ngAfterViewChecked() {
    if (!this.isAddButton || this.isAddButton) {
      this.addressValue = "exist";
    }
    // if (this.customerId > 0 && this.customerId != null && this.isAddButton) {
    //   console.log("this.isAddButton After View Checked: ", this.isAddButton);
    //   this.addressValue = "exist";
    // }
    this.cdr.detectChanges();
  }

  addressChange(addressTypes) {
    this.addressValue = addressTypes;
    if (addressTypes == "exist") {
      this.isAddressEnable = false;
    }
    else {
      this.isAddressEnable = true;
      if (this.addressResponse) {
        this.addressComponent.addAddressForm.reset();
      }
    }
    let rootSelect = this;
    setTimeout(function () {
      rootSelect.materialscriptService.material();
    }, 100)
  }

  bindExpireMonthsAndYears() {
    var ccExpirtyYears = 10;
    for (var i = (new Date()).getFullYear(); i <= (new Date()).getFullYear() + ccExpirtyYears; i++)
      this.years.push(i);
    for (var i = 1; i < 13; i++)
      this.months.push(i);
  }

  saveCreditCardDetails() {
    let creditCardNum: string;
    creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
    if (this.checkCreditCard(creditCardNum, this.createForm.controls['CardType'].value)) {
      if (this.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {
        this.creditCardRequest.CustomerId = this.customerId;
        this.creditCardRequest.DefaultFlag = true;
        this.saveCreditCards(this.creditCardRequest);
      }
      else {
        this.saveClicked.emit({ result: false, msg: "Invalid Expiration Date" });
      }
    }
    else {
      this.saveClicked.emit({ result: false, msg: "Enter valid Credit Card #" });
    }
  }

  saveCreditCards(creditcard: ICreditCardRequest): boolean {
    $('#pageloader').modal('show');
    //creditcard = this.creditCardRequest;
    let creditCardNum: string;
    creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
    if (creditCardNum != "")
      creditcard.prefixsuffix = +creditCardNum.substr(creditCardNum.length - 4);
    else
      creditcard.prefixsuffix = 0;
    creditcard.CCNumber = creditCardNum;
    creditcard.CCType = this.createForm.controls['CardType'].value;
    creditcard.ExpDate = Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value);
    creditcard.NameOnCard = this.createForm.controls['Name'].value.toUpperCase();

    creditcard.Line1 = this.addressComponent.addAddressForm.controls["addressLine1"].value;
    creditcard.Line2 = this.addressComponent.addAddressForm.controls["addressLine2"].value;
    creditcard.Line3 = this.addressComponent.addAddressForm.controls["addressLine3"].value;
    creditcard.City = this.addressComponent.addAddressForm.controls["addressCity"].value;
    creditcard.State = this.addressComponent.addAddressForm.controls["addressStateSelected"].value;
    creditcard.Country = this.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
    creditcard.Zip1 = this.addressComponent.addAddressForm.controls["addressZip1"].value;
    creditcard.Zip2 = this.addressComponent.addAddressForm.controls["addressZip2"].value;
    creditcard.User = this.sessionContextResponse.userName;
    creditcard.ICNId = this.sessionContextResponse.icnId;
    this.paymentService.CreateCreditCard(creditcard).subscribe(res => {
      if (res) {
        //this.createForm.reset();
        if (this.router.url.endsWith('/payment/add-creditcard'))
          this.isSaveCheckBox = false;
        else
          this.isSaveCheckBox = true;
        this.saveVisible = false;
        this.isAddressEnable = false;
        this.saveClicked.emit({ result: true, msg: "Credit Card has been added successfully" });
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
    return false;
  }

  CheckExpairyDate(month: number, year: number): boolean {
    var date = new Date();
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    if (currentYear == year && month < currentMonth)
      return false;
    else
      return true;
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
