import { PaymentService } from './../../payment/services/payment.service';
import { IBlocklistRequest } from './../../payment/models/blocklistrequest';
import { MakePaymentComponent } from './../../payment/make-payment.component';
import { IUserEvents } from './../../shared/models/userevents';
import { Features, Actions, defaultCulture } from './../../shared/constants';
import { ICreditCardRequest } from './../../payment/models/creditcardrequest';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { AddAddressComponent } from './../../shared/address/add-address.component';
import { ConvertToSpacesPipe } from './../../shared/pipes/convert-to-spaces.pipe';
import { RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { VepContextService } from './services/vepcontext.service';
import { IVepVehicleContextResponse } from './models/vepvehiclescontext';
import { CreditCardInformationComponent } from './../../payment/credit-card-information.component';
import { List } from 'linqts';
import { IVEPPassResponse } from './models/veppasses.resonse';
import { IVEPPassesRequest } from './models/veppasses.request';
import { IPlazas } from './models/plazas';
import { ILocations } from './models/locations';
import { VepPassesService } from './services/veppasses.service';
import { ICommonResponse, ICommon, IVehicleResponse, IVehicleClass } from './../../vehicles/models/vehicleresponse';
import { CommonService } from './../../shared/services/common.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-vep-pass-details',
  templateUrl: './vep-pass-details.component.html',
  styleUrls: ['./vep-pass-details.component.scss']
})
export class VepPassDetailsComponent implements OnInit {
  invalidDate: boolean;
  amnt: number;
  vepPassForm: FormGroup;
  vepVehiclecontextResp: IVepVehicleContextResponse;
  passTypes: any[];
  vepRequest: IVEPPassesRequest = <IVEPPassesRequest>{};
  vepResponse: IVEPPassResponse[];
  vehClass: IVEPPassResponse[];
  countries: any[];
  Locations: ILocations[];
  Plazas: IPlazas[];
  states: ICommonResponse[];
  common: ICommon = <ICommon>{};
  Amount: string;
  txtDriverName: string;
  txtDrivingLicenceno: string;
  txtPlateNum: string;
  pltCountry: string = "";
  pltState: string = "";
  ddlLocation: string = "";
  ddlPlaza: string = "";
  ddlVehClass: string = "";
  ddlPassType: string = "";
  strtDate: Date;
  endDate: Date;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  addressZip1: number;
  addressZip2: number;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  cctype: string;
  ccMonth: number;
  ccYear: number;
  ccname: string;
  sTax: string;
  vepVehicleresponse: IVepVehicleContextResponse;
  hdnEndDate: Date;
  vepTarrifId: number = 0;
  @ViewChild(CreditCardInformationComponent) creditCardComponent;
  @ViewChild(AddAddressComponent) addressComponent;
  minDate = new Date();
  maxDate = new Date(2100, 9, 15);
  userName: string
  userId: number
  loginId: number
  //Create status message 
  message: string;
  status: boolean;
  myDatePickerOptions: ICalOptions;
  sessionContextResponse: IUserresponse;
  validateNumberPattern = "[0-9]*";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphaNumericSpaceHypenPattern = "[a-zA-Z0-9]+([ \'-][a-zA-Z0-9]+)*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  endDates: Date;
  disableVEP: boolean;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  objBlockList: IBlocklistRequest = <IBlocklistRequest>{};
  isCheckBloackList: boolean;
  constructor(private commonService: CommonService, private datePickerFormat: DatePickerFormatService, private vepService: VepPassesService, private vepContext: VepContextService, private router: Router, private sessionContext: SessionService, private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService
    , private paymentService: PaymentService, private route: ActivatedRoute) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }
  startEffDate: Date;
  endEffDate: Date;
  @ViewChild(MakePaymentComponent) makePaymentComp;

  ngOnInit() {
    this.materialscriptService.material();
    this.vepPassForm = new FormGroup({
      'driverName': new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)]),
      'drivingLicNo': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern(this.validateAlphaNumericSpaceHypenPattern)]),
      'plateNo': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateAlphaNumericsPattern)]),
      'pltState': new FormControl('', [Validators.required]),
      'pltCountry': new FormControl('', [Validators.required]),
      'ddlLocation': new FormControl('', [Validators.required]),
      'ddlPlaza': new FormControl('', [Validators.required]),
      'ddlVehicleClass': new FormControl('', [Validators.required]),
      'ddlPassType': new FormControl('', [Validators.required]),
      'strtDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl({ value: new Date().getDate(), disabled: true }, [Validators.required]),
      'amount': new FormControl({ value: '0', disabled: true }, [Validators.required]),
    });
    this.vepContext.currentContext
      .subscribe(customerContext => { this.vepVehicleresponse = customerContext; }
      );
    let isBack = this.route.snapshot.paramMap.get('status');
    if (isBack == "true") {
      if (this.vepVehicleresponse != null) {
        this.bindDetails(this.vepVehicleresponse);
      }
    } 
    this.getCountry();
    this.pltCountry = "USA";
    this.getCountryBystate(this.pltCountry);
    this.vepService.getServiceTax().subscribe(res => {
      this.sTax = res;
    });
    this.getLocations();
    this.disableVEP = !this.commonService.isAllowed(Features[Features.ISSUEVEPPASS], Actions[Actions.CREATE], "");

    this.myDatePickerOptions = {
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
      inline: false,
      indicateInvalidDate: true,
      alignSelectorRight: false,
      indicateInvalidDateRange: true,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false
    };
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.addressComponent.addAddressForm.controls['addressCity'].setValue(this.addressCity);
    this.addressComponent.addAddressForm.controls['addressZip1'].setValue(this.addressZip1);
    this.addressComponent.addAddressForm.controls['addressZip2'].setValue(this.addressZip2);
    this.addressComponent.addAddressForm.controls['addressLine2'].setValue(this.addressLine2);
    this.addressComponent.addAddressForm.controls['addressLine1'].setValue(this.addressLine1);
    this.addressComponent.addAddressForm.controls['addressLine3'].setValue(this.addressLine3);
    this.addressComponent.addAddressForm.controls['addressStateSelected'].setValue(this.addressState);
    this.creditCardComponent.createForm.controls['CardType'].setValue(this.cctype);
    this.creditCardComponent.createForm.controls['Month'].setValue(this.ccMonth);
    this.creditCardComponent.createForm.controls['Year'].setValue(this.ccYear);
    this.creditCardComponent.createForm.controls['Name'].setValue(this.ccname);
  }
  bindDetails(vepResp: IVepVehicleContextResponse) {
    this.txtDriverName = vepResp.DriverName;
    this.txtDrivingLicenceno = vepResp.DrivingLicenceNo;
    this.txtPlateNum = vepResp.VehicleNo;
    this.strtDate = vepResp.StartEffectiveDate;
    this.endDate = vepResp.EndEffectiveDate;
    this.Amount = vepResp.Amount;

    this.ccname = vepResp.CCName;
    this.cctype = vepResp.CCType;
    this.ccMonth = vepResp.CCMonth;
    this.ccYear = vepResp.CCYear;
    this.addressState = vepResp.State;
    this.addressCity = vepResp.City;
    this.addressLine1 = vepResp.Address1;
    this.addressLine2 = vepResp.Address2;
    this.addressZip1 = vepResp.Zip1;
    this.addressZip2 = vepResp.Zip2;
    this.addressLine2 = vepResp.Address3;
    this.getCountry();
    this.pltCountry = vepResp.VehicleCountry;
    this.getCountryBystate(this.pltCountry);
    this.pltState = vepResp.VehicleState;
    this.getLocations();
    this.ddlLocation = vepResp.LocationCode;
    this.getPlazasByLocation(this.ddlLocation);
    this.ddlPlaza = vepResp.PlazaCode;
    this.getVehicleClassByplazs(this.ddlPlaza);
    this.ddlVehClass = vepResp.VehicleClass;
    this.getCountry();
    this.addressCountry = vepResp.Country;
    this.getCountryBystate(this.addressCountry);
    this.addressState = vepResp.State;
  }

  getEndDate(event) {
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;

    }
    if (!this.invalidDate) {
      if (this.vepPassForm.controls['ddlVehicleClass'].value != null && this.vepPassForm.controls['ddlLocation'].value != null && this.vepPassForm.controls['strtDate'].value != null
        && this.vepPassForm.controls['ddlPassType'].value != null && this.vepPassForm.controls['ddlPlaza'].value != null) {

        this.ddlPassType = this.vepPassForm.controls['ddlPassType'].value;
        let strDate = this.vepPassForm.controls['strtDate'].value;
        let date = strDate.jsdate;
        if (this.ddlPassType == "Daily") {
          date.setDate(date.getDate() + 1);
          this.vepPassForm.patchValue({
            endDate: {
              date: {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
              }
            }
          });
        }
        else if (this.ddlPassType == "Weekly") {
          date.setDate(date.getDate() + 7);
          this.vepPassForm.patchValue({
            endDate: {
              date: {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
              }
            }
          });
        }
        else if (this.ddlPassType == "Monthly") {
          date.setDate(date.getDate() + 30);
          this.vepPassForm.patchValue({
            endDate: {
              date: {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()

              }
            }
          });
        }
      }
    }
  }

  getCountry() {
    this.commonService.getCountries().subscribe(res => this.countries = res);
  }
  getLocations() {
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ISSUEVEPPASS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.vepService.getLocationDetails(userEvents).subscribe(res => this.Locations = res);
  }

  ddlLocationChange(locationCode: string) {
    this.vepPassForm.controls['strtDate'].reset();
    this.vepPassForm.controls['endDate'].reset();
    this.vepPassForm.controls['amount'].reset();
    this.vepResponse = [];
    this.passTypes = [];
    this.Plazas = [];
    this.vehClass = [];
    this.vepPassForm.controls['ddlPlaza'].reset();
    this.vepPassForm.controls['ddlPlaza'].setValue("");
    this.vepPassForm.controls['ddlVehicleClass'].reset();
    this.vepPassForm.controls['ddlVehicleClass'].setValue("");
    this.vepPassForm.controls['ddlPassType'].reset();
    this.vepPassForm.controls['ddlPassType'].setValue("");
    this.getPlazasByLocation(locationCode);
  }

  getPlazasByLocation(locationCode: string) {
    this.vepService.getPlazaDetails(locationCode.trim()).subscribe(res => {
      this.Plazas = res;
    })
  }

  ddlPlazaChange(plazaCode: string) {
    this.vepPassForm.controls['strtDate'].reset();
    this.vepPassForm.controls['endDate'].reset();
    this.vepPassForm.controls['amount'].reset();
    this.vepResponse = [];
    this.passTypes = [];
    this.vehClass = [];
    this.vepPassForm.controls['ddlVehicleClass'].reset();
    this.vepPassForm.controls['ddlVehicleClass'].setValue("");
    this.vepPassForm.controls['ddlPassType'].reset();
    this.vepPassForm.controls['ddlPassType'].setValue("");
    this.getVehicleClassByplazs(plazaCode);
  }

  getVehicleClassByplazs(plazaCode: string) {
    this.vepRequest.PlazaCode = plazaCode.trim();
    this.vepService.getVehicleClass(this.vepRequest).subscribe(res => {
      this.vepResponse = res;
      let a = res;
      this.vehClass = [];
      if (a != null && a.length > 0) {
        a.forEach(x => {
          if (this.vehClass.filter(y => y.VehicleClassDesc == x.VehicleClassDesc).length < 1) {
            this.vehClass.push(x);
          }
        })
      }
    })
  }

  ddlVehicleClassChange(vehicleClass: string) {
    this.vepPassForm.controls['strtDate'].reset();
    this.vepPassForm.controls['endDate'].reset();
    this.vepPassForm.controls['amount'].reset();
    this.passTypes = [];
    this.vepPassForm.controls['ddlPassType'].reset();
    this.vepPassForm.controls['ddlPassType'].setValue("");
    this.getPassTypeByVehicleClass(vehicleClass);
  }

  getPassTypeByVehicleClass(vehicleClass: string) {

    let a = this.vepResponse.filter(x => x.VehicleClass == vehicleClass);
    if (a != null && a.length > 0) {
      a.forEach(x => {
        if (this.passTypes.filter(y => y.PassTypeDesc == x.PassTypeDesc).length < 1) {
          this.passTypes.push(x);
        }
      })
    }
    let b = this;
    setTimeout(function () {
      b.materialscriptService.material();
    }, 10);
  }

  getAmountDetails(passType: string) {
    this.vepPassForm.controls['strtDate'].reset();
    this.vepPassForm.controls['endDate'].reset();
    this.vepPassForm.controls['amount'].reset();
    this.vepRequest.PassType = passType.trim();
    let resp = [];
    this.vepService.getVehicleClass(this.vepRequest).subscribe(res => {
      resp = res;
      if (resp != null && resp.length > 0) {
        this.Amount = resp[0].Amount;
        this.vepTarrifId = resp[0].VEPTarrifId;
        this.hdnEndDate = resp[0].EndEffectiveDate;
      }
    })
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 0)
  }

  continue(): void {
    if (!this.invalidDate) {
      if (this.vepPassForm.valid && this.creditCardComponent.createForm.valid && this.addressComponent.addAddressForm.valid) {
        this.vepVehiclecontextResp = <IVepVehicleContextResponse>{};
        //login
        this.vepVehiclecontextResp.LoginId = this.sessionContextResponse.loginId;
        this.vepVehiclecontextResp.UserId = this.sessionContextResponse.userId;
        this.vepVehiclecontextResp.UserName = this.sessionContextResponse.userName;
        //Vehicle
        this.vepVehiclecontextResp.DriverName = this.vepPassForm.controls['driverName'].value;
        this.vepVehiclecontextResp.DrivingLicenceNo = this.vepPassForm.controls['drivingLicNo'].value;
        this.vepVehiclecontextResp.VehicleState = this.vepPassForm.controls['pltState'].value;
        this.vepVehiclecontextResp.VehicleCountry = this.vepPassForm.controls['pltCountry'].value;
        this.vepVehiclecontextResp.VehicleNo = this.vepPassForm.controls['plateNo'].value;
        //Pass
        this.vepVehiclecontextResp.LocationCode = this.vepPassForm.controls['ddlLocation'].value;
        this.vepVehiclecontextResp.PlazaCode = this.vepPassForm.controls['ddlPlaza'].value;
        this.vepVehiclecontextResp.VehicleClass = this.vepPassForm.controls['ddlVehicleClass'].value;
        this.vepVehiclecontextResp.PassType = this.vepPassForm.controls['ddlPassType'].value;
        let startDate = this.vepPassForm.controls['strtDate'].value;
        let stdate = new Date(startDate.date.year, startDate.date.month - 1, startDate.date.day, 0, 0, 0, 0).toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
        this.vepVehiclecontextResp.StartEffectiveDate = stdate;

        let endDate = this.vepPassForm.controls['endDate'].value;
        let edDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.vepVehiclecontextResp.EndEffectiveDate = edDate;
        this.vepVehiclecontextResp.Amount = this.vepPassForm.controls['amount'].value;
        //CC
        this.vepVehiclecontextResp.CCType = this.creditCardComponent.createForm.controls['CardType'].value;// this.creditCardComponent.creditcard_form.controls['CardType'].value;
        this.vepVehiclecontextResp.CCMonth = this.creditCardComponent.createForm.controls['Month'].value;
        this.vepVehiclecontextResp.CCYear = this.creditCardComponent.createForm.controls['Year'].value;
        this.vepVehiclecontextResp.CCName = this.creditCardComponent.createForm.controls['Name'].value;
        this.vepVehiclecontextResp.CCNumber = this.creditCardComponent.createForm.get("CCNumbers.CCNumber1").value + this.creditCardComponent.createForm.get("CCNumbers.CCNumber2").value + this.creditCardComponent.createForm.get("CCNumbers.CCNumber3").value + this.creditCardComponent.createForm.get("CCNumbers.CCNumber4").value;
        //Addr
        this.vepVehiclecontextResp.Country = this.addressComponent.addAddressForm.controls['addressCountrySelected'].value;
        this.vepVehiclecontextResp.State = this.addressComponent.addAddressForm.controls['addressStateSelected'].value;
        this.vepVehiclecontextResp.City = this.addressComponent.addAddressForm.controls['addressCity'].value;
        this.vepVehiclecontextResp.Zip1 = this.addressComponent.addAddressForm.controls['addressZip1'].value;
        this.vepVehiclecontextResp.Zip2 = this.addressComponent.addAddressForm.controls['addressZip2'].value;
        this.vepVehiclecontextResp.Address2 = this.addressComponent.addAddressForm.controls['addressLine2'].value;
        this.vepVehiclecontextResp.Address1 = this.addressComponent.addAddressForm.controls['addressLine1'].value;
        this.vepVehiclecontextResp.Address3 = this.addressComponent.addAddressForm.controls['addressLine3'].value;
        this.vepService.getServiceTax().subscribe(res => {
          this.sTax = res;
        });
        this.vepVehiclecontextResp.ServiceTax = ((parseFloat(this.vepVehiclecontextResp.Amount) / 100) * parseFloat(this.sTax)).toString();
        this.vepVehiclecontextResp.TotalAmount = (parseFloat(this.vepVehiclecontextResp.ServiceTax) + parseFloat(this.vepVehiclecontextResp.Amount)).toString();
        this.vepContext.changeResponse(this.vepVehiclecontextResp);
        this.vepVehiclecontextResp.VEPTarrifId = this.vepTarrifId;
        this.vepVehiclecontextResp.DriverName = this.vepVehiclecontextResp.DriverName.toUpperCase();
        this.vepVehiclecontextResp.DrivingLicenceNo = this.vepVehiclecontextResp.DrivingLicenceNo.toUpperCase();
        this.vepVehiclecontextResp.VehicleNo = this.vepVehiclecontextResp.VehicleNo.toUpperCase();

        this.vepRequest = <IVEPPassesRequest>{};
        this.vepRequest.VehicleNo = this.vepPassForm.controls['plateNo'].value;
        this.vepRequest.VEPTarrifId = this.vepTarrifId;
        this.vepRequest.StartEffectiveDate = this.vepVehiclecontextResp.StartEffectiveDate;
        this.vepRequest.EndEffectiveDate = this.vepVehiclecontextResp.EndEffectiveDate;
        this.vepService.isPassExist(this.vepRequest).subscribe(
          res => {
            if (res) {
              this.msgFlag = true;
              this.msgType = 'error';
              this.msgDesc = "VEP Pass already exists for this Plate #";
            }
            else {
              this.vepService.isCustomerVehicleExist(this.vepRequest.VehicleNo).subscribe(resp => {
                if (resp) {
                  this.msgFlag = true;
                  this.msgType = 'error';
                  this.msgDesc = "Vehicle number already registered for customer, You cannot add already registered vehicle in VEP Passes";
                }
                else {
                  this.router.navigateByUrl('csc/veppasses/vep-pass-verify-make-payment');
                  // if (this.makePaymentComp.creditCardComponent.checkCreditCard(this.vepVehiclecontextResp.CCNumber, this.vepVehiclecontextResp.CCType)) {
                  //   if (this.makePaymentComp.creditCardComponent.CheckExpairyDate(this.vepVehiclecontextResp.CCMonth, this.vepVehiclecontextResp.CCYear)) {
                  //     if (this.isCheckBloackList) {
                  //       this.objBlockList.CCNumber = this.vepVehiclecontextResp.CCNumber.toString();
                  //       this.objBlockList.Line1 = this.vepVehiclecontextResp.Address1;
                  //       this.objBlockList.Line2 = this.vepVehiclecontextResp.Address2;
                  //       this.objBlockList.Line3 = this.vepVehiclecontextResp.Address3;
                  //       this.objBlockList.City = this.vepVehiclecontextResp.City;
                  //       this.objBlockList.State = this.vepVehiclecontextResp.State;
                  //       this.objBlockList.Country = this.vepVehiclecontextResp.Country;
                  //       this.objBlockList.Zip1 = this.vepVehiclecontextResp.Zip1.toString();
                  //       this.objBlockList.Zip2 = this.vepVehiclecontextResp.Zip2.toString();
                  //       this.objBlockList.CCExpiryMonth = this.vepVehiclecontextResp.CCMonth.toString();
                  //       this.paymentService.IsExistsinBlockList(this.objBlockList).subscribe(res => {
                  //         if (res) {
                  //           // this.objBlockListRes = res;
                  //           // $('#blocklist-dialog').modal('show');                           
                  //         }
                  //         else {
                  //           this.router.navigateByUrl('csc/veppasses/vep-pass-verify-make-payment');
                  //         }

                  //       });
                  //     }
                  //     else {
                  //       this.router.navigateByUrl('csc/veppasses/vep-pass-verify-make-payment');
                  //     }
                  //   }
                  //   else {
                  //     this.msgFlag = true;
                  //     this.msgType = 'alert';
                  //     this.msgDesc = "Invalid Expiration Date";
                  //     this.msgTitle = '';
                  //   }
                  // }
                }
              })
            }
          }
        )
      }
      else {
        this.validateAllFormFields(this.vepPassForm);
        this.validateAllFormFields(this.creditCardComponent.createForm);
        this.validateAllFormFields(this.addressComponent.addAddressForm);
      }
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  private newFunction(): IVEPPassResponse[] {
    return this.vepResponse;
  }


  getCountryBystate(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.states = res;
    });
  }
  reset() {
    this.ddlLocation = "";
    this.ddlPlaza = "";
    this.creditCardComponent.createForm.reset();
    this.materialscriptService.material();
    this.creditCardComponent.createForm.controls['CardType'].setValue("");
    this.creditCardComponent.createForm.controls['Month'].setValue("");
    this.creditCardComponent.createForm.controls['Year'].setValue("");
    this.addressComponent.addAddressForm.reset();
    this.addressComponent.addAddressForm.controls["addressCountrySelected"].setValue("");
    this.addressComponent.addAddressForm.controls["addressStateSelected"].setValue("");
    this.materialscriptService.material();
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

