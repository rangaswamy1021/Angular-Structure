import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse, ICommon } from "../../shared/models/commonresponse";
import { FormGroup, FormControl, Validators, ValidationErrors } from "@angular/forms";
import { IAddressRequest } from "../../shared/models/addressrequest";
import { IAddressResponse } from "../../shared/models/addressresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IVendorResponse } from "./models/venodrresponse";
import { VendorService } from "./services/vendor.service";
import { SubSystem, ActivitySource, UserType, CustomerStatus, AccountStatus, SourceOfEntry, PhoneType, EmailType, AddressTypes, VendorStatus, RevenueCategory, VendorUserTypes, Features, Actions, SubFeatures } from "../../shared/constants";
import { IPhoneRequest } from "../../shared/models/phonerequest";
import { IEmailRequest } from "../../shared/models/emailrequest";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AddAddressComponent, IaddAddressInputs } from "../../shared/address/add-address.component";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { IvendorRequest } from "./models/vendorrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
    selector: 'app-vendor-company',
    templateUrl: './vendor-company.component.html',
    styleUrls: ['./vendor-company.component.scss']
})
export class VendorCompanyComponent implements OnInit {
    userAction: string;
    @ViewChild(AddAddressComponent) addressComponent;
    vendorCompanyForm: FormGroup;
    vendorAddressForm: FormGroup;
    private _toEditVendorId: any;

    //Requests And Responses
    userEventRequest: IUserEvents = <IUserEvents>{};
    sessionContextResponse: IUserresponse;
    common: ICommon = <ICommon>{}
    obj: IvendorRequest;
    addressRequest: IAddressRequest;
    addressResponse: IAddressResponse;
    addressStates: ICommonResponse[];
    vendorResponse: IVendorResponse[];
    addressCountries: ICommonResponse[];
    phoneObject: IPhoneRequest = <IPhoneRequest>{};
    addAddress: IAddressRequest = <IAddressRequest>{};
    vendorRequest: IvendorRequest = <IvendorRequest>{};
    UserInputs: IaddAddressInputs = <IaddAddressInputs>{};
    addressVendorRequest: IAddressRequest = <IAddressRequest>{};
    vendoraddressRequest: IAddressRequest = <IAddressRequest>{};
    // companyNameAvlMessage: string;
    // emailFMessage: string;
    btnFinish: string;
    isCompanyNotAvailable: boolean;
    companyNameMessage: string;
    checkCompanyName: any;
    companyName: any;
    ceoName: any;
    webSite: any;
    vendorId: number = 0;
    submitted = false;

    //Variables For Address Component
    customerID: number;
    addressType: string;
    AddressType = AddressTypes[AddressTypes.Primary];

    //supplierId Variabes
    hideSuppierId: boolean;
    supplierId: any;
    supplierIDMessage: any;
    TagSupplierID: any;

    //error block and successblock
    errorMessage: string;
    successMessage: string;
    successHeading: string;
    // successBlock: boolean;
    // errorBlock: boolean;
    // success and error block
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;
    //Phone Details
    phoneType: any;
    pdetails: any;
    preferredPhone: any;
    resPhoneArray: any;
    divDayPhone: boolean;
    divMobileNo: boolean;
    divWorkPhone: boolean;
    divEveningPhone: boolean;
    divFax: boolean;
    boolPhonePrference: boolean;
    isInvalidDayPhone: boolean = false;
    isInvalidEveningPhone: boolean = false;
    isInvalidMobilePhone: boolean = false;
    isInvalidWorkPhone: boolean = false;
    isInvalidFax: boolean = false;
    phoneTypes = { DayPhone: "", EveningPhone: "", MobileNo: "", WorkPhone: "", Fax: "", };
    checkPhoneChanges = ["DayPhone", "EveningPhone", "MobileNo", "WorkPhone", "Fax"];

    //Zip Validations 
    country: any;
    zipMessage: string;
    zipMaxlength: number;
    zipMinlength: number;
    isAddressChanged: boolean;
    zipMaxLength: number;
    zipMinLength: number;

    //Email Details
    emailType;
    eDetails: any;
    divPrimaryEmail: boolean;
    divSecondaryEmail: boolean;
    emailEqual: boolean;
    checkEmail: any;
    emailEqualMessage: string;
    resEmailArray: boolean;
    preferredEmail: any;
    emailObject: IEmailRequest;
    emailMessage: string;
    isPrimaryEmailExists: boolean = false;
    isSecondaryEmailExists: boolean = false;
    isSecondaryEmailError: boolean = false;
    secondaryEmailErrorMessage: string = "";
    checkEmailChanges = ["PrimaryEmail", "SecondaryEmail"];
    emailTypes = { PrimaryEmail: "", SecondaryEmail: "", };

    //Pattrens
    validateHexadecimal = "/^[A-Fa-f0-9]+$/";
    IntailSpacesPattren = "[a-zA-Z0-9][a-zA-Z0-9 ]*";
    validateNumberPattern = "[0-9][0-9]*";
    validateAlphanumericWhiteSpace = "^[a-zA-Z0-9 ]+$";
    validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
    validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([a-zA-Z0-9 ]+)*";
    validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
    validateExceptAnglePattern = "[^<> ][^<>]*";
    //validateWebsitePattern = "/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/"
    //validateWebsitePattern = "(^http(s?):\\/\\/){0,1}(www\\.){0,1}[a-zA-Z0-9\\.\\-]+\\.[a-zA-Z]{2,5}[\\.]{0,1}";
    validateWebsitePattern = "^(http[s]?:\\/\\/){0,1}(www[A-Za-z]\\.){0,1}[a-zA-Z0-9\\.\\-]+\\.[a-zA-Z]{2,5}[\\.]{0,1}$";
    validateEmail = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
    validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";

    constructor(private _vendorService: VendorService, private _router: Router, private _commonService: CommonService, private _routerParameter: ActivatedRoute, private _context: SessionService,
        private materialscriptService: MaterialscriptService) { }

    ngOnInit() {

        this.sessionContextResponse = this._context.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this._router.navigate(link);
        }
        this.isAddressChanged = false;
        this._toEditVendorId = this._routerParameter.snapshot.params["vendorId"];
        this.vendorCompanyForm = new FormGroup({
            'CompanyName': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphanumericWhiteSpace), Validators.pattern(this.IntailSpacesPattren)]),
            'OwnerName': new FormControl('', [Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphanumericWhiteSpace), Validators.pattern(this.IntailSpacesPattren)]),
            'Website': new FormControl('', [Validators.maxLength(320), Validators.minLength(9)]),                     //Validators.pattern(this.validateWebsitePattern),
            'addressLine1': new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern),]),
            'addressLine2': new FormControl('', [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern),]),
            'addressLine3': new FormControl('', [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
            'addressCity': new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
            'addressCountrySelected': new FormControl('', [Validators.required]),
            'addressStateSelected': new FormControl('', [Validators.required]),
            'zip1': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]),
            'zip2': new FormControl('', [Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]),
            'SupplierId': new FormControl('', [Validators.maxLength(2), Validators.pattern(this.validateNumberPattern)]),
        });
        this.vendorAddressForm = new FormGroup({
            'AddressType': new FormControl('', [Validators.required]),
            'DayPhone': new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
            'EveningPhone': new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
            'MobileNo': new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
            'WorkPhone': new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
            'extn': new FormControl('', [Validators.compose([Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)])]),
            'Fax': new FormControl('', [Validators.pattern(this.validatePhonePattern)]),
            'PrimaryEmail': new FormControl('', [Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmail)]),
            'SecondaryEmail': new FormControl('', [Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmail)]),
            'phonePreference': new FormControl('DayPhone', [Validators.required]),
            'emailPreference': new FormControl('PrimaryEmail', [Validators.required]),
        });
        this.prefferedPhoneTypeChange("DayPhone");
        this.prefferedEmailTypeChange("PrimaryEmail");
        this.vendorAddressForm.controls["AddressType"].setValue("Primary");
        this.zipValidations();
        this.getDefaultCountry();
        this.getCountry();
        if (this._toEditVendorId) {
            let userEvent = this.userEvents();
            userEvent.SubFeatureName = SubFeatures[SubFeatures.COMPANYINFORMATION];
            userEvent.ActionName = Actions[Actions.UPDATE];
            this.getApplicationParameterValueByParameterKey(userEvent);
            // this.isAddressChanged=false;
            this.addressType = this.AddressType;
            this.customerID = this._toEditVendorId;
            this.vendorCompanyForm.get('CompanyName').disable();
            this.vendorCompanyForm.get('SupplierId').disable();
            this.populateVendoDetails();
        } else {
            let userEvent = this.userEvents();
            userEvent.SubFeatureName = SubFeatures[SubFeatures.COMPANYINFORMATION];
            userEvent.ActionName = Actions[Actions.CREATE];
            this.getApplicationParameterValueByParameterKey(userEvent);
        }
    }
    getApplicationParameterValueByParameterKey(userEvents: IUserEvents) {
        this._vendorService.getApplicationParameterValueByParameterKey("IsTagByAgency", userEvents).subscribe(
            res => {
                let IsTagByAgency = res;
                if (IsTagByAgency == 0) {
                    //Visisble    CheckVendorSupplierID(supplierId)
                    this.TagSupplierID = this.supplierId
                    this.hideSuppierId = false;
                    this.vendorCompanyForm.controls['SupplierId'].setValidators([Validators.required, Validators.maxLength(2), Validators.pattern(this.validateNumberPattern)]);
                }
                else {
                    //Invisible
                    this.TagSupplierID = "";
                    this.hideSuppierId = true;
                    this.vendorCompanyForm.controls['SupplierId'].clearValidators();
                }
            });
    }

    checkSupplieridValidorNot(event) {
        this.supplierId = event.target.value;
        if (this.supplierId) {
            this._vendorService.CheckVendorSupplierID(this.supplierId).subscribe(
                res => {
                    if (res) {
                        this.supplierIDMessage = "Not available";
                    }
                    else {
                        this.supplierIDMessage = "Available";
                    }
                });
        }
    }
    userEvents(): IUserEvents {
        this.userEventRequest.FeatureName = Features[Features.VENDOR];
        this.userEventRequest.ActionName = Actions[Actions.VIEW];
        this.userEventRequest.PageName = this._router.url;
        this.userEventRequest.CustomerId = 0;
        this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
        this.userEventRequest.UserName = this.sessionContextResponse.userName;
        this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
        return this.userEventRequest;
    }

    // onlyNumberKey(event) {

    //     return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    // }

    addNewVendor() {
        this._router.navigateByUrl("imc/vendor/vendor-company");
    }

    cancelVendor() {
        this._router.navigateByUrl("imc/vendor/vendor-search");
    }

    //Phone method   Phone Format Like (111)-111-111
    formatPhone(event) {
        var phone = event.target.value;
        var target = event.target || event.srcElement || event.currentTarget;
        var objId = target.attributes.formcontrolname.value;

        if (phone.match(/^\d{3}$/)) {
            phone = phone.replace(/^(\d{3})/, '($1) ');
            this.vendorAddressForm.controls[objId].setValue(phone);
        }
        else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {

            phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
            this.vendorAddressForm.controls[objId].setValue(phone);
        }
    }

    prefferedEmailTypeChange(val) {
        this.vendorAddressForm.controls['PrimaryEmail'].clearValidators();
        this.vendorAddressForm.controls['SecondaryEmail'].clearValidators();
        this.vendorAddressForm.controls[val].setValidators([Validators.required, Validators.pattern(this.validateEmail)]);
        this.vendorAddressForm.controls[val].updateValueAndValidity();
        for (var i = 0; i < this.checkEmailChanges.length; i++) {
            if (this.checkEmailChanges[i] != val) {
                this.vendorAddressForm.controls[this.checkEmailChanges[i]].setValidators([Validators.pattern(this.validateEmail)]);
                this.vendorAddressForm.controls[this.checkEmailChanges[i]].updateValueAndValidity();
            }
            this.vendorAddressForm.controls[val].updateValueAndValidity();
        }
    }

    //Phone method
    prefferedPhoneTypeChange(val) {
        this.vendorAddressForm.controls['DayPhone'].clearValidators();
        this.vendorAddressForm.controls['EveningPhone'].clearValidators();
        this.vendorAddressForm.controls['MobileNo'].clearValidators();
        this.vendorAddressForm.controls['WorkPhone'].clearValidators();
        this.vendorAddressForm.controls[val].setValidators([Validators.required, Validators.pattern(this.validatePhonePattern)]);

        for (var i = 0; i < this.checkPhoneChanges.length; i++) {
            if (this.checkPhoneChanges[i] != val) {

                this.vendorAddressForm.controls[this.checkPhoneChanges[i]].setValidators([Validators.pattern(this.validatePhonePattern)]);
                this.vendorAddressForm.controls[this.checkPhoneChanges[i]].updateValueAndValidity();
            }
            this.vendorAddressForm.controls[val].updateValueAndValidity();
        }
    }

    checkVendorCompanyName(event) {
        let companyName = event.target.value;
        if (this.vendorCompanyForm.controls['CompanyName'].valid) {
            this._vendorService.checkVendorCompanyName(companyName).subscribe(
                res => {
                    if (res) {
                        this.companyNameMessage = "Not Available";
                        this.checkCompanyName = true;
                        this.isCompanyNotAvailable = true;
                    }
                    else {

                        this.companyNameMessage = "Available";

                        this.checkCompanyName = false;
                        this.isCompanyNotAvailable = false;
                    }
                }
                , err => {

                    this.errorMessage = err.statusText;
                    return;
                }
            );
        } else {
            this.companyNameMessage = "";
        }
    }

    addressChangeEvent(event) {
        this.AddressType = this.addressType = event;
        if (this._toEditVendorId)     //If Vendor Id is there 
        {
            if (this.AddressType == "Primary") {
                this.addressType = this.AddressType;
                this.customerID = this._toEditVendorId;
                this.isAddressChanged = false;
            }
            else {
                this.addressType = this.AddressType;
                this.customerID = this._toEditVendorId;
                this.isAddressChanged = true;
            }
        }
        else {
            this.addressComponent.addAddressForm.controls['addressStateSelected'].reset();
            this.addressComponent.addAddressForm.controls['addressStateSelected'].setValue("");
            this.addressComponent.addAddressForm.controls['addressLine1'].reset();
            this.addressComponent.addAddressForm.controls['addressLine2'].reset();
            this.addressComponent.addAddressForm.controls['addressLine3'].reset();
            this.addressComponent.addAddressForm.controls['addressZip1'].reset();
            this.addressComponent.addAddressForm.controls['addressZip2'].reset();
            this.addressComponent.addAddressForm.controls['addressCity'].reset();
            //this.getStatesByCountry("USA");
        }
    }

    populateVendoDetails() {
        this.vendorId = this._toEditVendorId;
        this._vendorService.GetVendorCompanyInformation(this.vendorId).subscribe(
            res => {
                if (res) {
                    this.vendorId = res.VendorId;
                    this.getStatesByCountry(res.Country);
                    this.vendorCompanyForm.patchValue({
                        SupplierId: res.TagSupplierId,
                        CompanyName: res.CompanyName,
                        OwnerName: res.CeoName,
                        Website: res.WebSite,
                        addressLine1: res.Line1,
                        addressLine2: res.Line2,
                        addressLine3: res.Line3,
                        addressStateSelected: res.State,
                        zip1: res.Zip1,
                        zip2: res.Zip2,
                        addressCountrySelected: res.Country,
                        addressCity: res.City,
                    });
                    this.zipValidations();
                    this.materialscriptService.material();
                }
            });
    }

    //Next Button to submit Vendor Company Info.. Company Info Page To Contact Page
    submitVendorCompanyInformation() {
        this.btnFinish = "Finish";

        if (this._toEditVendorId) {
            let userEvent = this.userEvents();
            userEvent.SubFeatureName = SubFeatures[SubFeatures.CONTACTINFORMATION];
            userEvent.ActionName = Actions[Actions.UPDATE];
            this._commonService.checkPrivilegeswithAuditLog(userEvent).subscribe(res => { });
            this.addressChangeEvent("Primary");
            this._vendorService.GetDetailsOfVendor(this.vendorId, this.AddressType).subscribe(
                res1 => {
                    this.btnFinish = "Update";
                    this.vendorResponse = res1;

                    if (res1) {
                        for (var i = 0; i < this.vendorResponse.length; i++) {
                            this.prefferedEmailTypeChange(this.vendorResponse[i].Comm_Email);
                            this.prefferedPhoneTypeChange(this.vendorResponse[i].Comm_Phone);
                            this.vendorAddressForm.patchValue({
                                AddressType: this.vendorResponse[i].Type,
                                DayPhone: this.vendorResponse[i].DayPhoneNumber,
                                EveningPhone: this.vendorResponse[i].EveningPhoneNumber,
                                MobileNo: this.vendorResponse[i].MobileNumber,
                                WorkPhone: this.vendorResponse[i].WorkPhoneNumber,
                                extn: this.vendorResponse[i].Extension,
                                Fax: this.vendorResponse[i].Fax,
                                PrimaryEmail: this.vendorResponse[i].PrimaryEmailAddress,
                                SecondaryEmail: this.vendorResponse[i].SecondaryEmailAddress,
                                phonePreference: this.vendorResponse[i].Comm_Phone,
                                emailPreference: this.vendorResponse[i].Comm_Email,
                            });

                            this.materialscriptService.material();
                            //Phone pReferences Delete
                            if (this.vendorResponse[i].Comm_Phone == PhoneType[PhoneType.DayPhone])
                                this.divDayPhone = false;
                            else if (this.vendorResponse[i].DayPhoneNumber.toString() == "")
                                this.divDayPhone = false;
                            else
                                this.divDayPhone = true;

                            if (this.vendorResponse[i].Comm_Phone == PhoneType[PhoneType.EveningPhone])
                                this.divEveningPhone = false;
                            else if (this.vendorResponse[i].EveningPhoneNumber.toString() == "")
                                this.divEveningPhone = false;
                            else
                                this.divEveningPhone = true;

                            if (this.vendorResponse[i].Comm_Phone == PhoneType[PhoneType.MobileNo])
                                this.divMobileNo = false;
                            else if (this.vendorResponse[i].MobileNumber.toString() == "")
                                this.divMobileNo = false;
                            else
                                this.divMobileNo = true;

                            if (this.vendorResponse[i].Comm_Phone == PhoneType[PhoneType.WorkPhone])
                                this.divWorkPhone = false;
                            else if (this.vendorResponse[i].WorkPhoneNumber.toString() == "")
                                this.divWorkPhone = false;
                            else
                                this.divWorkPhone = true;

                            if (this.vendorResponse[i].Comm_Phone == PhoneType[PhoneType.Fax])
                                this.divFax = false;
                            else if (this.vendorResponse[i].Fax.toString() == "")
                                this.divFax = false;
                            else
                                this.divFax = true;

                            //Email preferences delete
                            if (this.vendorResponse[i].Comm_Email == EmailType[EmailType.PrimaryEmail])
                                this.divPrimaryEmail = false;
                            else if (this.vendorResponse[i].PrimaryEmailAddress == "")
                                this.divPrimaryEmail = false;
                            else
                                this.divPrimaryEmail = true;

                            if (this.vendorResponse[i].Comm_Email == EmailType[EmailType.SecondaryEmail])
                                this.divSecondaryEmail = false;
                            else if (this.vendorResponse[i].SecondaryEmailAddress == "")
                                this.divSecondaryEmail = false;
                            else
                                this.divSecondaryEmail = true;
                        }
                    }
                },
                (err) => { }
                , () => {

                });
        }
        if (this.vendorCompanyForm.valid) {
            if (this.checkCompanyName) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Company Name Already Exists";
                this.msgTitle = '';
                return;
            }
            else {
                this.vendorAddressForm.controls['phonePreference'].setValue("DayPhone");
                this.vendorAddressForm.controls['emailPreference'].setValue("PrimaryEmail");
                this.submitted = true;
                if (this._toEditVendorId) {
                    this.getAllPhonesById();
                    this.getAllEmails();
                    this.companyName = this.vendorCompanyForm.controls['CompanyName'].value;
                    this.ceoName = this.vendorCompanyForm.controls['OwnerName'].value;
                    this.webSite = this.vendorCompanyForm.controls['Website'].value;
                    let companyCountry = this.vendorCompanyForm.controls['addressCountrySelected'].value;
                    let companyState = this.vendorCompanyForm.controls['addressStateSelected'].value;
                }
                else {
                    let userEvent = this.userEvents();
                    userEvent.SubFeatureName = SubFeatures[SubFeatures.CONTACTINFORMATION];
                    userEvent.ActionName = Actions[Actions.CREATE];
                    this._commonService.checkPrivilegeswithAuditLog(userEvent).subscribe(res => { });
                    //This is New Form Submiton code
                    this.companyName = this.vendorCompanyForm.controls['CompanyName'].value;
                    this.ceoName = this.vendorCompanyForm.controls['OwnerName'].value;
                    this.webSite = this.vendorCompanyForm.controls['Website'].value;
                    let companyCountry = this.vendorCompanyForm.controls['addressCountrySelected'].value;
                    let companyState = this.vendorCompanyForm.controls['addressStateSelected'].value;
                }
            }
        }
        else {
            this.validateAllFormFields(this.vendorCompanyForm);
        }
    }

    private _vendorCompanyInfo(vendorid: number) {
        this.vendorRequest.UserType = VendorUserTypes[VendorUserTypes.Vendor];
        this.vendorRequest.AccountStatus = AccountStatus[AccountStatus.AC];
        this.vendorRequest.UserTypeId = VendorUserTypes.Vendor;
        this.vendorRequest.ParentId = 0;
        this.vendorRequest.CustomerStatus = CustomerStatus[CustomerStatus.C];
        this.vendorRequest.IsParent = true;
        this.vendorRequest.SourceOfEntry = SourceOfEntry[SourceOfEntry.Offline];
        this.vendorRequest.Status = VendorStatus[VendorStatus.Active];
        this.vendorRequest.RevenueCategory = RevenueCategory[RevenueCategory.Revenue];
        this.vendorRequest.VendorId = this.vendorId;
        this.vendorRequest.InitiatedBy = this._context.customerContext.userName;
        this.vendorRequest.CompanyName = this.companyName;
        this.vendorRequest.CeoName = this.ceoName;
        this.vendorRequest.WebSite = this.webSite;
        this.vendorRequest.BusinessType = "";
        this.vendorRequest.BusinessNature = "";
        this.vendorRequest.CreditAffordAble = "";
        this.vendorRequest.TagSupplierId = this.TagSupplierID //"1";
        //this.vendorRequest.CreatedUser = this._context.customerContext.userName;
        this.vendorRequest.UpdatedUser = this._context.customerContext.userName;
        this.vendorRequest.VendorUserType = VendorUserTypes[VendorUserTypes.Vendor];
        this.vendorRequest.UserId = this._context.customerContext.userId;
        this.vendorRequest.LoginId = this._context.customerContext.loginId;
        this.vendorRequest.User = this._context.customerContext.userName;
        this.vendorRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    }
    //Previous Button click.....
    previousVendorCompanyInformation() {
        this.submitted = false;
        if (this._toEditVendorId) { }
        else {
            this.vendorAddressForm.reset();
            this.addressComponent.addAddressForm.reset();
            this.vendorAddressForm.controls["AddressType"].setValue("Primary");
            this.addressComponent.addAddressForm.controls['addressCountrySelected'].setValue("USA");
            this.getStatesByCountry("USA");
            this.addressComponent.addAddressForm.controls['addressStateSelected'].setValue("");
            this.addressComponent.addAddressForm.controls['addressLine1'].setValue("");
            this.addressComponent.addAddressForm.controls['addressLine2'].setValue("");
            this.addressComponent.addAddressForm.controls['addressLine3'].setValue("");
            this.addressComponent.addAddressForm.controls['addressZip1'].setValue("");
            this.addressComponent.addAddressForm.controls['addressZip2'].setValue("");
            this.addressComponent.addAddressForm.controls['addressCity'].setValue("");
            this.isSecondaryEmailError = false;
            this.isPrimaryEmailExists = false;
        }
    }

    //to get all countries
    getCountry() {
        this._commonService.getCountries().subscribe(
            res => {
                this.addressCountries = res;
            }, err => {

                this.errorMessage = err.statusText;
                return;
            }
        );
    }

    changeCountry(countryCode: string) {
        let state = this.vendorCompanyForm.controls["addressStateSelected"].setValue("");
        this.getStatesByCountry(countryCode);
        this.zipValidations();
    }

    zipValidations() {
        this.country = this.vendorCompanyForm.controls["addressCountrySelected"].value;
        if (this.country == "USA") {
            this.zipMinlength = 5;
            this.zipMaxlength = 5;
            this.vendorCompanyForm.controls["zip2"].enable();
            if (this.vendorCompanyForm.value.zip2 == "" || this.vendorCompanyForm.value.zip2 == null) {
                this.vendorCompanyForm.controls["zip2"].setValue(null);
            }
            this.vendorCompanyForm.controls['zip1'].clearValidators();
            this.vendorCompanyForm.controls["zip1"].setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)])
            this.vendorCompanyForm.controls['zip1'].updateValueAndValidity();
            this.zipMessage = "Enter 5 numbers";
        }
        else {
            this.zipMinlength = 6;
            this.zipMaxlength = 6;
            this.vendorCompanyForm.controls["zip2"].disable();
            this.vendorCompanyForm.controls["zip2"].setValue(null);
            this.vendorCompanyForm.controls['zip1'].clearValidators();
            this.vendorCompanyForm.controls["zip1"].setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)])
            this.vendorCompanyForm.controls['zip1'].updateValueAndValidity();
            this.zipMessage = "Enter 6 numbers";
        }

    }

    //Method to get states based on the Country code passed
    getStatesByCountry(countryCode: string) {

        this.common.CountryCode = countryCode;
        this._commonService.getStatesByCountryCode(this.common).subscribe(res => {
            if (res) {
                this.addressStates = res;
            }
        }, err => {

            this.errorMessage = err.statusText;
            return;
        });
        this.zipValidations();
    }

    //Phone method
    getAllPhonesById() {
        this._commonService.getAllPhonesByCustomerId(this.vendorId).subscribe(res => {

            this.parsePhone(res), this.resPhoneArray = res;
        }
            , (err) => {
                this.errorMessage = err.statusText.toString();
            });
    }

    parsePhone(phone) {
        this.phoneTypes = {
            DayPhone: "",
            EveningPhone: "",
            MobileNo: "",
            WorkPhone: "",
            Fax: "",
        };
        phone.forEach(element => {
            this.phoneTypes[element.Type] = element;

            if (element.IsCommunication) {
                this.preferredPhone = element;
            }
        });
    }

    deletePhoneClick(event) {
        if (event && this.userAction == "Phone") {
            this.getAllPhonesById();
            this.pdetails.UserName = this._context.customerContext.userName;
            this.pdetails.CustomerId = this.vendorId;
            this._commonService.deletePhone(this.pdetails).subscribe(res => {
                if (res) {
                    this.phoneType = this.pdetails.Type
                    this.vendorAddressForm.controls[this.phoneType].setValue("");  //reseting deleted Textbox

                    if (this.phoneType == "DayPhone") {
                        this.divDayPhone = false
                    }
                    else if (this.phoneType == "EveningPhone") {
                        this.divEveningPhone = false
                    }
                    else if (this.phoneType == "MobileNo") {
                        this.divMobileNo = false;
                    }
                    else if (this.phoneType == "WorkPhone") {
                        this.divWorkPhone = false;
                        this.vendorAddressForm.controls["extn"].setValue("");
                    } else if (this.phoneType == "Fax") {
                        this.divFax = false;
                    }
                    this.msgType = 'success';
                    this.msgFlag = true;
                    this.msgDesc = this.phoneType + "  # has been deleted successfully.";
                    this.msgTitle = '';
                }
            }, (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();;
                this.msgTitle = '';
            })
        }
        else {
            this.msgFlag = false;
        }
    }

    deletePhone(phoneDetails) {
        this.pdetails = phoneDetails;
        this.msgType = 'alert';
        this.msgFlag = true;
        this.msgDesc = "Are you sure you want to Delete " + this.pdetails.Type + " # ?";
        this.msgTitle = '';
        this.userAction = "Phone";
    }

    getAllEmails() {
        this._commonService.getAllEmails(this.vendorId).subscribe(res => {
            this.parseEmail(res), this.resEmailArray = res;
        }, err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();;
            this.msgTitle = '';
        }
        );
    }

    parseEmail(email) {
        this.emailTypes = {
            PrimaryEmail: "",
            SecondaryEmail: "",
        };
        email.forEach(element => {
            this.emailTypes[element.Type] = element;
            if (element.IsPreferred) {
                this.preferredEmail = element;
            }
        });
    }

    deleteEmailClick(event) {
        if (event && this.userAction == "Email") {
            this.getAllEmails();
            this.eDetails.UserName = this._context.customerContext.userName;
            this.eDetails.CustomerId = this.vendorId;
            this._commonService.deleteEmail(this.eDetails).subscribe(res => {
                this.emailType = this.eDetails.Type
                this.vendorAddressForm.controls[this.emailType].setValue(""); //reseting deleted Textbox
                if (this.emailType == "PrimaryEmail") this.divPrimaryEmail = false;
                else if (this.emailType == "SecondaryEmail") this.divSecondaryEmail = false;
                this.msgType = 'success';
                this.msgFlag = true;
                this.msgDesc = this.emailType + " has been deleted successfully";
                this.msgTitle = '';
            }, (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();;
                this.msgTitle = '';
            });
        }
        else if (this.userAction == "Phone") {
            this.deletePhoneClick(event);
        }
        else {
            this.msgFlag = false;
        }
    }
    deleteEmail(emailDetails) {
        this.eDetails = emailDetails;
        this.getAllEmails();
        this.msgType = 'alert';
        this.msgFlag = true;
        this.msgDesc = "Are you sure you want to Delete " + this.eDetails.Type + " # ?";
        this.msgTitle = '';
        this.userAction = "Email";
    }

    focusMail() {
        this.emailEqualMessage = " ";
    }

    //Method to set The Usa As Default Country ....
    getDefaultCountry() {
        let defaultCountry: string;
        this._commonService.getApplicationParameterValue(ApplicationParameterkey.DefaultCountry).subscribe(res => {
            if (res) {
                defaultCountry = res;
                this.vendorCompanyForm.controls["addressCountrySelected"].setValue(res);
                this.getStatesByCountry(defaultCountry);
            }
        }, err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();;
            this.msgTitle = '';
            return;
        });
    }

    emailId
    finishButtonClick() {
        if (this.vendorAddressForm.valid && this.addressComponent.addAddressForm.valid) {
            if (this.isPrimaryEmailExists) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = this.vendorAddressForm.controls["PrimaryEmail"].value + "  already exist";
                this.msgTitle = '';
                return;
            }
            if (this.isSecondaryEmailExists) {

                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = this.vendorAddressForm.controls["SecondaryEmail"].value + "  already exist";
                this.msgTitle = '';
                return;
            }
            if (this.emailEqual) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Primary Email & Secondary Email Should Not Be Equal";
                this.msgTitle = '';
                return;
            }
            if (this.isInvalidDayPhone || this.isInvalidEveningPhone || this.isInvalidMobilePhone || this.isInvalidWorkPhone || this.isInvalidFax) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Invalid phone number";
                this.msgTitle = '';
                return;
            }
            else {
                if (this._toEditVendorId) {
                    this.obj = this.storeAddressDetails();
                    this.obj.UpdatedUser = this._context.customerContext.userName;
                    $('#pageloader').modal('show');
                    let userEvents = this.userEvents();
                    userEvents.SubFeatureName = "";
                    userEvents.ActionName = Actions[Actions.UPDATE];
                    this._vendorService.UpdateVendor(this.obj, userEvents).subscribe(
                        res => {
                            $('#pageloader').modal('hide');
                            if (res) {
                                this._router.navigate(['imc/vendor/vendor-search/' + "Updated"], { skipLocationChange: true });
                            }
                        }, err => {
                            $('#pageloader').modal('hide');
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = err.statusText.toString();;
                            this.msgTitle = '';
                        });
                }
                else {
                    this.obj = this.storeAddressDetails();
                    this.obj.CreatedUser = this._context.customerContext.userName;
                    let userEvents = this.userEvents();
                    userEvents.SubFeatureName = "";
                    userEvents.ActionName = Actions[Actions.CREATE];
                    $('#pageloader').modal('show');
                    this._vendorService.CreateVendor(this.obj, userEvents).subscribe(
                        res => {
                            $('#pageloader').modal('hide');
                            this._router.navigate(['imc/vendor/vendor-search/' + "Created"], { skipLocationChange: true });
                        },
                        err => {
                            $('#pageloader').modal('hide');
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = err.statusText.toString();;
                            this.msgTitle = '';
                        }
                    );
                }
            }
        }
        else {
            this.validateAllFormFields(this.vendorAddressForm);
            this.validateAllFormFields(this.addressComponent.addAddressForm);
        }
    }

    //common method for add or update address details
    private storeAddressDetails() {
        if (this.vendorCompanyForm.valid && this.vendorAddressForm.valid && this.addressComponent.addAddressForm.valid) {
            let emailArray: IEmailRequest[] = [];
            let phoneList: IPhoneRequest = <IPhoneRequest>{};
            let emailList: IEmailRequest = <IEmailRequest>{};
            let addressList: IAddressRequest[] = [];
            let emailLists: IEmailRequest[] = [];
            let phoneArray: IPhoneRequest[] = [];

            this._vendorCompanyInfo(this.vendorId);
            this.vendoraddressRequest.Line1 = this.vendorCompanyForm.value.addressLine1;
            this.vendoraddressRequest.Line2 = this.vendorCompanyForm.value.addressLine2;
            this.vendoraddressRequest.Line3 = this.vendorCompanyForm.value.addressLine3;
            this.vendoraddressRequest.City = this.vendorCompanyForm.value.addressCity;
            this.vendoraddressRequest.State = this.vendorCompanyForm.value.addressStateSelected;
            this.vendoraddressRequest.Country = this.vendorCompanyForm.value.addressCountrySelected;
            this.vendoraddressRequest.Zip1 = this.vendorCompanyForm.value.zip1;
            this.vendoraddressRequest.Zip2 = this.vendorCompanyForm.value.zip2;
            this.vendoraddressRequest.Type = AddressTypes[AddressTypes.Business];
            this.vendoraddressRequest.IsPreferred = true;
            this.vendoraddressRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.vendoraddressRequest.SubSystem = SubSystem.IMC.toString();
            this.vendoraddressRequest.UserName = this._context.customerContext.userName;
            this.vendoraddressRequest.IsActive = true;
            this.vendoraddressRequest.IsActivityRequired = true;
            this.vendoraddressRequest.IsInvalidAddress = true;
            addressList.push(this.vendoraddressRequest);

            this.addressVendorRequest.Line1 = this.addressComponent.addAddressForm.value.addressLine1;
            this.addressVendorRequest.Line2 = this.addressComponent.addAddressForm.value.addressLine2;
            this.addressVendorRequest.Line3 = this.addressComponent.addAddressForm.value.addressLine3;
            this.addressVendorRequest.City = this.addressComponent.addAddressForm.value.addressCity;
            this.addressVendorRequest.State = this.addressComponent.addAddressForm.value.addressStateSelected;
            this.addressVendorRequest.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
            this.addressVendorRequest.Zip1 = this.addressComponent.addAddressForm.value.addressZip1;
            this.addressVendorRequest.Zip2 = this.addressComponent.addAddressForm.value.addressZip2;
            this.addressVendorRequest.Type = this.AddressType;
            this.addressVendorRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.addressVendorRequest.SubSystem = SubSystem.IMC.toString();
            this.addressVendorRequest.UserName = this._context.customerContext.userName; // "tpsuperuser";
            this.addressVendorRequest.IsActive = true;
            this.addressVendorRequest.IsPreferred = false;
            this.addressVendorRequest.IsActivityRequired = true;
            this.addressVendorRequest.IsInvalidAddress = true;
            addressList.push(this.addressVendorRequest);
            for (var i = 0; i < this.checkPhoneChanges.length; i++) {
                this.phoneObject = <IPhoneRequest>{};
                if (this.vendorAddressForm.controls[this.checkPhoneChanges[i]].value) {
                    this.phoneObject.PhoneNumber = this.vendorAddressForm.controls[this.checkPhoneChanges[i]].value;
                    this.phoneObject.Type = this.checkPhoneChanges[i];
                    if (this.phoneObject.Type == "WorkPhone") {
                        this.phoneObject.Extension = this.vendorAddressForm.controls['extn'].value;
                    }
                    this.phoneObject.PhoneId = 0;
                    this.phoneObject.UserName = this._context.customerContext.userName; // "tpsuperuser";
                    this.phoneObject.CustomerId = this.vendorId;
                    this.phoneObject.SubSystem = SubSystem.IMC.toString();// "IMC";
                    if (this.phoneObject.Type != this.vendorAddressForm.controls['phonePreference'].value) {
                        this.phoneObject.IsCommunication = false;
                    }
                    else {
                        this.phoneObject.IsCommunication = true;
                    }
                    phoneArray.push(this.phoneObject);
                }
            }
            for (var i = 0; i < this.checkEmailChanges.length; i++) {
                this.emailObject = <IEmailRequest>{};
                if (this.vendorAddressForm.controls[this.checkEmailChanges[i]].value) {
                    this.emailObject.EmailAddress = this.vendorAddressForm.controls[this.checkEmailChanges[i]].value;
                    this.emailObject.UserName = this._context.customerContext.userName; // "tpsuperuser";
                    this.emailObject.CustomerId = this.vendorId;
                    this.emailObject.Type = this.checkEmailChanges[i];
                    if (this.emailObject.Type != this.vendorAddressForm.controls['emailPreference'].value) {
                        this.emailObject.IsPreferred = false;
                    }
                    else {
                        this.emailObject.IsPreferred = true;
                    }

                    this.emailObject.IsValid = true; // default is true.
                    emailArray.push(this.emailObject);
                }
            };
            this.vendorRequest.PhoneList = phoneArray.map(x => Object.assign({}, x));
            this.vendorRequest.EmailList = emailArray.map(x => Object.assign({}, x));
            this.vendorRequest.AddressList = addressList.map(x => Object.assign({}, x));
            return this.vendorRequest;
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
    //check emails
    checkPrimaryEmailExists() {
        if (this.vendorAddressForm.controls["PrimaryEmail"].valid) {
            this._vendorService.isEmailExist(this.vendorAddressForm.value.PrimaryEmail).subscribe(res => {
                if (res)
                    this.isPrimaryEmailExists = true;
                else
                    this.isPrimaryEmailExists = false;
                if (this.vendorAddressForm.controls["SecondaryEmail"].valid) {
                    this.secondaryEmailErrorMessage = "";
                    if (this.isSecondaryEmailExists)
                        this.secondaryEmailErrorMessage = "Email already exists";
                    else {
                        this.secondaryEmailErrorMessage = "";
                    }
                    if ((this.vendorAddressForm.value.PrimaryEmail == this.vendorAddressForm.value.SecondaryEmail)) {
                        if (this.vendorAddressForm.value.PrimaryEmail != "") {
                            this.emailEqual = true;
                            if (this.secondaryEmailErrorMessage != "")
                                this.secondaryEmailErrorMessage += ", ";
                            this.secondaryEmailErrorMessage += "Both emails should not be same";
                        }
                    }
                    else {
                        this.emailEqual = false;
                    }
                    if (this.secondaryEmailErrorMessage == "")
                        this.isSecondaryEmailError = false;
                    else
                        this.isSecondaryEmailError = true;
                }
            });
        }
        else
            this.isPrimaryEmailExists = false;
    }

    checkSecondaryEmailExists() {
        if (this.vendorAddressForm.controls["SecondaryEmail"].valid) {
            this.secondaryEmailErrorMessage = "";
            this._vendorService.isEmailExist(this.vendorAddressForm.value.SecondaryEmail).subscribe(res => {
                if (res) {
                    this.isSecondaryEmailExists = true;
                    this.secondaryEmailErrorMessage = "Email already exists";

                }
                else {
                    this.isSecondaryEmailExists = false;
                    this.secondaryEmailErrorMessage = "";
                }
                if (this.vendorAddressForm.controls["PrimaryEmail"].valid) {
                    if ((this.vendorAddressForm.value.PrimaryEmail == this.vendorAddressForm.value.SecondaryEmail)) {
                        if (this.vendorAddressForm.value.PrimaryEmail != "") {
                            this.emailEqual = true;
                            if (this.secondaryEmailErrorMessage != "")
                                this.secondaryEmailErrorMessage += ", ";
                            this.secondaryEmailErrorMessage += "Both emails should not be same";
                        }
                    } else {
                        this.emailEqual = false;
                    }
                }
                if (this.secondaryEmailErrorMessage == "")
                    this.isSecondaryEmailError = false;
                else
                    this.isSecondaryEmailError = true;
            });
        }
        else
            this.isSecondaryEmailError = false;
    }

    // Phone vlidations for zeros
    changeExtension() {
        if (this.vendorAddressForm.controls["extn"].value)
            this.vendorAddressForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
        else {
            if (this.vendorAddressForm.controls["WorkPhone"].value) {
                if (this.vendorAddressForm.value.preferredPhone == PhoneType[PhoneType.WorkPhone]) {
                    this.vendorAddressForm.controls["WorkPhone"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
                }
                else
                    this.vendorAddressForm.controls["WorkPhone"].setValidators([Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
            } else
                this.vendorAddressForm.controls["WorkPhone"].setValidators([]);
        }
        this.vendorAddressForm.controls["WorkPhone"].updateValueAndValidity();
    }

    validateDayPhoneAllZeros() {
        if (this.vendorAddressForm.controls["DayPhone"].valid) {
            if (this.validateAllZerosinPhone(this.vendorAddressForm.value.DayPhone))
                this.isInvalidDayPhone = true;
            else
                this.isInvalidDayPhone = false;
        }
        else
            this.isInvalidDayPhone = false;
    }

    validateEveningPhoneAllZeros() {
        if (this.vendorAddressForm.controls["EveningPhone"].valid) {
            if (this.validateAllZerosinPhone(this.vendorAddressForm.value.EveningPhone))
                this.isInvalidEveningPhone = true;
            else
                this.isInvalidEveningPhone = false;
        }
        else
            this.isInvalidEveningPhone = false;
    }

    validateMobilePhoneAllZeros() {
        if (this.vendorAddressForm.controls["MobileNo"].valid) {
            if (this.validateAllZerosinPhone(this.vendorAddressForm.value.MobileNo))
                this.isInvalidMobilePhone = true;
            else
                this.isInvalidMobilePhone = false;
        }
        else
            this.isInvalidMobilePhone = false;
    }

    validateWorkPhoneAllZeros() {
        if (this.vendorAddressForm.controls["WorkPhone"].valid) {
            if (this.validateAllZerosinPhone(this.vendorAddressForm.value.WorkPhone))
                this.isInvalidWorkPhone = true;
            else
                this.isInvalidWorkPhone = false;
        }
        else
            this.isInvalidWorkPhone = false;
    }

    validateFaxAllZeros() {
        if (this.vendorAddressForm.controls["Fax"].valid) {
            if (this.validateAllZerosinPhone(this.vendorAddressForm.value.Fax))
                this.isInvalidFax = true;
            else
                this.isInvalidFax = false;
        }
        else
            this.isInvalidFax = false;
    }

    validateAllZerosinPhone(phoneNumber: string): boolean {
        var pattern = new RegExp(this.validatePhoneAllZerosPattern);
        var result = pattern.test(phoneNumber);
        return result;
    }

    setOutputFlag(e) {
        this.msgFlag = e;
    }
    // InitiateAdrressForm() {
    //     //Not Using Any Where ..
    //     this.addressComponent.addAddressForm = new FormGroup({
    //         'addressLine1': new FormControl({ value: '', }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
    //         'addressLine2': new FormControl({ value: '', }, [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
    //         'addressLine3': new FormControl({ value: '' }, [Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)]),
    //         'addressStateSelected': new FormControl({ value: '', }, [Validators.required]),
    //         'addressZip1': new FormControl({ value: '', }, [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern(this.validateNumberPattern)]),
    //         'addressZip2': new FormControl({ value: '', }, [Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]),
    //         'addressCountrySelected': new FormControl({ value: '', }, [Validators.required]),
    //         'addressCity': new FormControl({ value: '', }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)])
    //     });
    // }
}