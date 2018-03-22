import { IUserEvents } from './../shared/models/userevents';
import { AddAddressComponent } from './../shared/address/add-address.component';
import { SessionService } from './../shared/services/session.service';
import { IUserresponse } from './../shared/models/userresponse';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { ICustomerContextResponse } from './../shared/models/customercontextresponse';
import { Router } from '@angular/router';
import { IShipmentAdressRequest } from './models/tagshipmentaddressrequest';
import { ITagRequest, IAssignTagRequest } from './models/tagrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IShipmentAdressResponse, ICommonResponse, ICommon } from './models/tagshipmentaddressresponse';
import { elementAt } from 'rxjs/operator/elementAt';
import { ITagShipmentTypesResponse } from './models/tagshipmentsresponse';
import { Component, ElementRef, OnInit, Renderer, ViewChild } from '@angular/core';
import { TagService } from './services/tags.service';
import { ITagConfigurationResponse } from './models/tagsconfigurationresponse';
import { List } from 'linqts';
import { CommonService } from '../shared/services/common.service';
import { ApplicationParameterkey } from '../shared/applicationparameter';
import { ActivitySource, SubSystem, AddressTypes, Features, Actions } from '../shared/constants';
import { TagRequestType } from './constants';

declare var $: any;
@Component({
  selector: 'app-request-new-tags',
  templateUrl: './request-new-tags.component.html',
  styleUrls: ['./request-new-tags.component.css']
})
export class RequestNewTagsComponent implements OnInit {
  countries: any[];
  states: ICommonResponse[];
  common: ICommon = <ICommon>{};
  getTagconfigResponse: ITagConfigurationResponse[];
  getShipmentTypeResponse: ITagShipmentTypesResponse[];
  getDefaultAddrsResponse: IShipmentAdressResponse[];
  shipmentTypes: ITagShipmentTypesResponse[];
  tagAssignRequest: IAssignTagRequest = <IAssignTagRequest>{};
  tagRequest: ITagRequest;
  shipmentAddressList = [];
  tagRequestlist: ITagRequest[] = [];
  shipmentVisible: boolean = false;
  selectedShipmentFee: number;
  customerId: number = 0;
  addressForm: FormGroup;
  deliveryMethods: string;
  message: string = "";
  isServiceTax: boolean;
  serviceTax: number;
  totalShippingCharge: number = 0;
  purchaseMethod = [];
  tagsArrayCount = [];
  tagsCount: number = 0;
  totalTagFee: number = 0;
  totalTagDeposit: number = 0;
  totalServiceTax: number = 0;
  totalAmount: number = 0;
  tagDeliveryMethod: string = "PickUpAfterNotification";
  msgFlag: boolean;
  msgType: string;  
  msgDesc: string;
  commentTextLength: number = 255;
  shipmentServiceId: number;
  isAddressEnable: boolean;
  customerInformationres: any;
  revenueCategory: string;
  isAllowNonRevenuePayments: boolean;
  disableButton: boolean = false;
  constructor(private tagService: TagService, private commonService: CommonService, private router: Router, private customerContext: CustomerContextService,
    private sessionContext: SessionService) { }
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  @ViewChild(AddAddressComponent) addressComponent;

  ngOnInit() {
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;

    this.addressForm = new FormGroup({
      tagscount: new FormControl('', []),
      tagdelivery: new FormControl('', []),
      addressRadioOptions: new FormControl('exist'),
      comments: new FormControl('', [])
    });
    this.customerId = this.customerContextResponse.AccountId;

    this.getApplicationParameterKeys();
    this.bindCustomerInfo();
    this.commonService.getCountries().subscribe(res => this.countries = res);
    this.commonService.getTransponderPurchaseMethod().subscribe(res => this.purchaseMethod = res);
    this.tagService.getActiveTagConfigurations().subscribe(res => this.getTagconfigResponse = res);
    this.tagService.getShipmentServiceTypes().subscribe(res => this.getShipmentTypeResponse = res);

    this.disableButton = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.REQUEST], "");
  }
  getApplicationParameterKeys() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsServiceTax).subscribe(res => this.isServiceTax = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ServiceTax).subscribe(res => this.serviceTax = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsAllowNonRevenuePayments).subscribe(res => this.isAllowNonRevenuePayments = res == "1" ? true : false);
  }
  bindCustomerInfo() {
    this.tagService.bindCustomerInfoDetails(this.customerId).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => { }
      , () => {
        if (this.customerInformationres) {
          this.revenueCategory = this.customerInformationres.RevenueCategory;
          this.customerId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.customerId;
        }
      }
    )
  }
  onServiceTypeChange(service: ITagShipmentTypesResponse) {
    this.shipmentServiceId = service.ServiceTypeId;
    this.totalShippingCharge = this.tagsCount * service.Cost;
  }
  calculateTagDespositandTagBal(tagArray) {
    this.tagsCount = 0;
    this.totalTagDeposit = 0;
    this.totalTagFee = 0;
    if ((!this.isAllowNonRevenuePayments && this.revenueCategory.toUpperCase() == "NONREVENUE")) {
      this.totalTagFee = 0; this.totalTagDeposit = 0;
      tagArray.forEach(x => {
        this.tagsCount += parseInt(x.Tagcount == "" ? "0" : x.Tagcount);
      })
      return;
    }
    console.log(tagArray);
    if (tagArray.length > 0) {
      tagArray.forEach(x => {
        var count = parseInt(x.Tagcount == "" ? "0" : x.Tagcount);
        console.log(count);
        var fee = parseFloat(x.TagFee);
        var deposit = parseFloat(x.TagDeposit);
        var totalfee = count * fee;
        var totaldep = count * deposit;
        this.tagsCount += count;
        this.totalTagFee += totalfee;
        this.totalTagDeposit += totaldep;
      });
    }
  }
  calculateAmounts() {
    if (this.isServiceTax)
      this.totalServiceTax =this.totalTagFee * (this.serviceTax / 100);
  }
  onChange(tagconfig: ITagConfigurationResponse, tagcount: number, row_no) {
    if (this.tagsArrayCount.length > 0) {
      console.log(this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting))
      if (this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting).length > 0) {
        this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting)[0].Tagcount = tagcount;
      }
      else {
        tagconfig.Tagcount = tagcount;
        this.tagsArrayCount[row_no] = tagconfig;
      }
    }
    else {
      tagconfig.Tagcount = tagcount;
      this.tagsArrayCount[row_no] = tagconfig;
    }
    this.calculateTagDespositandTagBal(this.tagsArrayCount);
    this.calculateAmounts();
    this.totalAmount = this.totalTagFee + this.totalTagDeposit + this.totalServiceTax + this.totalShippingCharge;
    console.log(this.tagsArrayCount);

  }
  onSelectDeliveryMethod(methodType: string) {
    this.tagDeliveryMethod = methodType;
    if (methodType.toUpperCase() == "SHIPMENTBYPOST") {
      this.shipmentVisible = true;
      this.tagService.getShipmentServiceTypes().subscribe(res => {
        this.getShipmentTypeResponse = res;
        this.getShipmentTypeResponse[0].IsSelected = true;
        //this.shipmentServiceId = this.shipmentTypes[0].ServiceTypeId;
        this.onServiceTypeChange(this.getShipmentTypeResponse[0]);
        this.isAddressEnable = true;
      });
    }
    else {
      this.shipmentVisible = false;
      this.getShipmentTypeResponse = [];
      this.totalShippingCharge = 0;
      this.shipmentServiceId = 0;
    }
  }
   onlyNumberKey(event) {
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
  }
  submitTagRequest() {
    this.tagRequestlist = [];
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TAG];
    userEvents.ActionName = Actions[Actions.REQUEST];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    if (this.revenueCategory.toUpperCase() == 'REVENUE') {
      if (this.totalTagDeposit <= 0) {
        $('#alert-dialog').modal('show');
        return;
      }
    }
    if (this.addressForm.valid) {
      if (this.tagsArrayCount != null && this.tagsArrayCount.length > 0) {
        for (var i = 0; i < this.tagsArrayCount.length; i++) {
          if (this.tagsArrayCount[i]) {
            var tagRequest = <ITagRequest>{};
            tagRequest.CustomerId = this.customerId;
            tagRequest.UserName = this.sessionContextResponse.userName;
            tagRequest.UserId = this.sessionContextResponse.userId;
            tagRequest.LoginId = this.sessionContextResponse.loginId;
            tagRequest.RevenueCategory = this.revenueCategory;
            tagRequest.SubSystem = SubSystem[SubSystem.CSC];
            tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            tagRequest.TagReqDate = new Date;
            tagRequest.TagReqType = TagRequestType[TagRequestType.Additional];
            tagRequest.TotalRequiredAmount = this.totalAmount;
            tagRequest.TagPurchaseMethod = 0;
            tagRequest.TagPurchaseMethodCode = this.tagDeliveryMethod;
            tagRequest.TagDeliveryMethod = this.shipmentServiceId > 0 ? this.shipmentServiceId : 0;
            tagRequest.ReqCount = this.tagsArrayCount[i].Tagcount;
            tagRequest.Protocol = this.tagsArrayCount[i].Protocol;
            tagRequest.Mounting = this.tagsArrayCount[i].Mounting;
            tagRequest.TagDeliveryOption = this.tagDeliveryMethod;
            tagRequest.TagType = "";
            tagRequest.IsNotification = false;
            tagRequest.TagReqComment = this.addressForm.value.comments;
            if (this.tagDeliveryMethod.toUpperCase() == "SHIPMENTBYPOST") {
              if (this.addressForm.get("addressRadioOptions").value == "new") {
                if (this.addressComponent.addAddressForm.valid) {
                  this.shipmentAddress(tagRequest);
                }
                else {
                  this.validateAllFormFields(this.addressComponent.addAddressForm);
                  return;
                }
              }
              else {
                this.shipmentAddress(tagRequest);
              }
            }
            this.tagRequestlist.push(tagRequest);
          }
        }
        $('#pageloader').modal('show');
        this.tagService.tagRequestInqueue(this.tagRequestlist, userEvents).subscribe(res => {
          if (res) {
            //this.successMessageBlock("Tag(s) has been requested successfully.");
            this.shipmentVisible = false;
            this.tagsArrayCount = [];
            $('#pageloader').modal('hide');
            this.router.navigate(['csc/customerdetails/manage-tags', 2]);
          }
          else {
            this.shipmentVisible = true;
            this.errorMessageBlock("Error while requesting tag(s)");
            $('#pageloader').modal('hide');
            this.tagsArrayCount = [];
          }
        },
          (err) => {
            this.errorMessageBlock(err.statusText.toString());
            $('#pageloader').modal('hide');
            //this.tagsArrayCount = [];
          },
          () => {
          });
      }
      else {
        $('#alert-dialog').modal('show');
        return false;
      }
    }
    else {
      this.validateAllFormFields(this.addressForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  shipmentAddress(tagRequest: ITagRequest) {
    var shipmentAddress = <IShipmentAdressRequest>{};
    shipmentAddress.CustomerId = this.customerId;
    shipmentAddress.UserName = this.sessionContextResponse.userName;
    shipmentAddress.ActivitySource = ActivitySource[ActivitySource.Internal];
    shipmentAddress.SubSystem = SubSystem[SubSystem.CSC];
    shipmentAddress.Line1 = this.addressComponent.addAddressForm.value.addressLine1;
    shipmentAddress.Line2 = this.addressComponent.addAddressForm.value.addressLine2;
    shipmentAddress.Line3 = this.addressComponent.addAddressForm.value.addressLine3;
    shipmentAddress.City = this.addressComponent.addAddressForm.value.addressCity;
    shipmentAddress.State = this.addressComponent.addAddressForm.value.addressStateSelected;
    shipmentAddress.Country = this.addressComponent.addAddressForm.value.addressCountrySelected;
    shipmentAddress.Zip1 = this.addressComponent.addAddressForm.value.addressZip1;
    shipmentAddress.Zip2 = this.addressComponent.addAddressForm.value.addressZip2;
    shipmentAddress.Type = AddressTypes[AddressTypes.Shipping];
    shipmentAddress.IsActive = true;
    shipmentAddress.IsPreferred = true;
    shipmentAddress.IsActivityRequired = true;
    shipmentAddress.IsShipmentupdateAddress = this.isAddressEnable;
    this.shipmentAddressList.push(shipmentAddress);
    tagRequest.ShipmentAddress = this.shipmentAddressList;
  }
  addressChange(addressType) {
    if (addressType == "exist")
      this.isAddressEnable = true;
    else
      this.isAddressEnable = false;
  }

  oncancelClick() {
    this.router.navigateByUrl('csc/customerdetails/manage-tags');
  }
  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;    
  }
  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;   
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}

