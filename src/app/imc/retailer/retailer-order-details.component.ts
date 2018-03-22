import { Component, OnInit, ViewChild } from '@angular/core';
import { RetailerService } from "./services/retailer.service";
import { ActivatedRoute, Router } from "@angular/router";
import { IretailerResponse } from "./models/retailerresponse";
import { CreditCardInformationComponent } from "../../payment/credit-card-information.component";
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { IPOSOutletItems } from "./models/retaileruserrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, SubSystem, LookupTypeCodes, Actions, Features } from "../../shared/constants";
import { DocumentdetailsService } from "../../csc/documents/services/documents.details.service";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { PaymentMode } from "../../payment/constants";
import { FormGroup, FormControl } from "@angular/forms";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-retailer-order-details',
  templateUrl: './retailer-order-details.component.html',
  styleUrls: ['./retailer-order-details.component.scss']
})
export class RetailerOrderDetailsComponent implements OnInit {
  btnPdfDisable: boolean;
  btnMakePaymentDisable: boolean;

  userEventRequest: IUserEvents = <IUserEvents>{}

  paymentSelectionForm: FormGroup;
  cashOptionSelected: boolean;
  creditcardOptionSelected: boolean;


 
  documentLinked: string;
  displayMakePaymentButton: boolean;
  PosOutletId: any;


  Month: any;
  Year: any;


  CardType: any;
  name: any;
  sessionContextResponse: IUserresponse;
  retailerId: number;
  paymentSelected: boolean;
  retailerResponse: IretailerResponse[];
  displayCardInfo: Boolean;
  diplayCashInformation: boolean;
  makePaymentReq: IPOSOutletItems = <IPOSOutletItems>{};
  userName: string;
  userId: number;
  loginId: number;
  icnId: number;
  totalAmount: any;
  customerId: number = 0;
  index: number;




  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  @ViewChild(CreditCardInformationComponent) creditCardDetailsComponent;
  @ViewChild(AddAddressComponent) addressComponent;
  //@ViewChild(AddAddressComponent) addressComponent;
  constructor(private retailerService: RetailerService, private _routerParameter: ActivatedRoute, private _router: Router, private sessionContext: SessionService, private commonService: CommonService,
    private documentdetailsService: DocumentdetailsService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.paymentSelectionForm = new FormGroup({
      'paymentOption': new FormControl('', []),
    });
    this.retailerId = this._routerParameter.snapshot.params["retailerID"];

    this.btnMakePaymentDisable = !this.commonService.isAllowed(Features[Features.RETAILERORDER], Actions[Actions.PAYMENT], "");

    this.btnPdfDisable = !this.commonService.isAllowed(Features[Features.RETAILERORDER], Actions[Actions.VIEWPDF], "");

    this.commonService.isAllowed(Features[Features.RETAILERORDER], Actions[Actions.VIEW], "");
    this.getFulfilledItemsbyRetailerId(this.retailerId);
    this.documentdetailsService.currentDetails.subscribe(documentdetailsService => {
      this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.POInvoice)
        .subscribe(res => {
          this.documentLinked = res;
        },(err) => {
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       });
    });
    //this.allowView=this.commonService.isAllowed(Features[Features.RETAILER], Actions[Actions.VIEW], "");
  }
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.RETAILERORDER];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this._router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  getFulfilledItemsbyRetailerId(retailerId: number) {
    let userevents = this.userEvents();
    userevents.ActionName = Actions[Actions.VIEW];
    this.retailerService.getFulfilledItemsbyRetailerId(retailerId, userevents).subscribe(
      res => {
        this.retailerResponse = res;
        
      },
       (err) => {
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       });
    this.customerId = this.retailerId
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._router.navigate(link);
    }
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.icnId = this.sessionContextResponse.icnId;
  }

  backButton() {
    this._router.navigate(['imc/retailer/retailer-search/']);
  }

  paymentButton(retailerOrder, index) {


    this.retailerId = this.customerId;
    this.PosOutletId = retailerOrder.POSRequestId;
    this.totalAmount = parseFloat(retailerOrder.TotalAmount).toFixed(2);

    this.paymentSelected = true;
    this.displayCardInfo = false;
    this.diplayCashInformation = false;


    if (this.cashOptionSelected) {
      this.cashOptionSelect();
      return;
    }
    this.creditcardOptionSelect();
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 1000);
    
  }

  creditcardOptionSelect() {

    this.paymentSelectionForm.controls.paymentOption.setValue("creditcardPrefrence");
    this.creditcardOptionSelected = true;
    this.cashOptionSelected = false;


    this.displayMakePaymentButton = true;
    this.displayCardInfo = true;
    this.diplayCashInformation = true;
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 100);
  }

  cashOptionSelect() {
    this.cashOptionSelected = true;
    this.creditcardOptionSelected = false;;


    this.displayMakePaymentButton = true;
    this.diplayCashInformation = true;
    this.displayCardInfo = false;
  }

  onCancelClick() {


    this.paymentSelected = false;
    this.diplayCashInformation = false;
    this.displayCardInfo = false;
    this.displayMakePaymentButton = false;
    if (this.cashOptionSelected) {
      this.cashOptionSelected = false;
    }
  }

  onMakePayment() {

    if (this.cashOptionSelected == true) {
      this.creditcardOptionSelected = false;
      this.makePayment();
    }
    else {
      this.cashOptionSelected = false;
      if (this.creditCardDetailsComponent.createForm.valid) {
        if (this.creditCardDetailsComponent.isAddressEnable == true) {
          if (this.creditCardDetailsComponent.addressComponent.addAddressForm.invalid) {
            this.validateAllFormFields(this.creditCardDetailsComponent.addressComponent.addAddressForm);
          }
          else{
            this.makePayment();
          }
        }
        else {
          this.makePayment();
        }
      }
      else {
        this.validateAllFormFields(this.creditCardDetailsComponent.createForm);
      }
    }
  }
  paymentOk(event) {
    if (event) {
      this.makePaymentReq.DefaultFlag = false;
      this.makePaymentReq.AccountID = this.retailerId;
      this.makePaymentReq.ICNId = this.icnId;
      this.makePaymentReq.ActivitySource = ActivitySource.Internal.toString();
      this.makePaymentReq.SubSystem = SubSystem[SubSystem.IMC];
      this.makePaymentReq.CreatedDate = new Date();
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.PAYMENT];
      $('#pageloader').modal('show');
      this.retailerService.makePayment(this.makePaymentReq, userevents).subscribe(
        res => {
          $('#pageloader').modal('hide');
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Payment has been done successfully";
            this.msgTitle = '';
            this.getFulfilledItemsbyRetailerId(this.retailerId);
            this.diplayCashInformation = false;
            this.displayCardInfo = false;
            this.paymentSelected = false;
            this.displayMakePaymentButton = false;
            if (this.cashOptionSelected) {
              this.cashOptionSelected = false;
            }
          }
        },
        (err) => {
          $('#pageloader').modal('hide');
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';


          this.diplayCashInformation = true;
          this.displayCardInfo = true;
          this.paymentSelected = true;
          this.displayMakePaymentButton = true;
          if (this.cashOptionSelected) {
            this.cashOptionSelected = false;
          }
        },
        () => {
        });
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) { }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  makePayment() {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to proceed?";
    this.msgTitle = '';

    if (this.totalAmount != "" || this.totalAmount != null) {
      if (this.totalAmount > 0) {
        this.makePaymentReq.POSOutletId = this.retailerId;
        this.makePaymentReq.RetailerId = this.retailerId;
        this.makePaymentReq.POSRequestId = this.PosOutletId;
        this.makePaymentReq.TxnAmount = this.totalAmount;
        this.makePaymentReq.CustomerId = this.retailerId;
        this.makePaymentReq.UserName = this.userName;
        this.makePaymentReq.PerformedBy = this.userName;
        this.makePaymentReq.UserId = this.userId;
        this.makePaymentReq.LoginId = this.loginId;
        this.makePaymentReq.PaymentMode = PaymentMode[PaymentMode.Cash];
        if (this.displayCardInfo) {
          this.makePaymentReq.PaymentMode = PaymentMode[PaymentMode.CreditCard];
          let creditCardNum: string;
          creditCardNum = this.creditCardDetailsComponent.createForm.get("CCNumbers.CCNumber1").value
            + "" + this.creditCardDetailsComponent.createForm.get("CCNumbers.CCNumber2").value + ""
            + this.creditCardDetailsComponent.createForm.get("CCNumbers.CCNumber3").value + "" +
            this.creditCardDetailsComponent.createForm.get("CCNumbers.CCNumber4").value;
          if (this.checkCreditCard(creditCardNum, this.creditCardDetailsComponent.createForm.controls["CardType"].value)) {
            if (this.CheckExpairyDate(this.creditCardDetailsComponent.createForm.controls["Month"].value, this.creditCardDetailsComponent.createForm.controls["Year"].value)) {
              this.makePaymentReq.NameOnCard = this.creditCardDetailsComponent.createForm.controls["Name"].value;
              this.makePaymentReq.CreditCardType = this.creditCardDetailsComponent.createForm.controls["CardType"].value;
              this.makePaymentReq.ddlYears = this.creditCardDetailsComponent.createForm.controls["Year"].value;
              let month = this.creditCardDetailsComponent.createForm.controls["Month"].value;
              if (month.length == 1) {
                month = "0" + month;
              }
              this.makePaymentReq.ddlMonths = month;
              this.makePaymentReq.CVV = 111;
              this.makePaymentReq.Line1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
              this.makePaymentReq.Line2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
              this.makePaymentReq.Line3 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressLine3"].value;
              this.makePaymentReq.City = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCity"].value;
              this.makePaymentReq.State = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
              this.makePaymentReq.Country = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
              this.makePaymentReq.Zip1 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
              this.makePaymentReq.Zip2 = this.creditCardDetailsComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
              this.makePaymentReq.CCardNumber = creditCardNum;

            }
            else {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Invalid Expiration Date";
              this.msgTitle = '';

              return;
            }
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Enter valid Credit Card #";
            this.msgTitle = '';

            return;
          }

        }

      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Amount should be greater than zero";
        this.msgTitle = '';

        this.diplayCashInformation = false;
        this.displayCardInfo = false;
        this.paymentSelected = false;
        this.displayMakePaymentButton = false;
      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Amount should not be empty";
      this.msgTitle = '';

      this.diplayCashInformation = false;
      this.displayCardInfo = false;
      this.paymentSelected = false;
      this.displayMakePaymentButton = false;

    }
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
    var cards = new Array();
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
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
