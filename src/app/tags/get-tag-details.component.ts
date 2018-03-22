import { ApplicationParameterkey } from './../shared/applicationparameter';
import { RevenueCategory } from './../shared/constants';
import { IUserEvents } from './../shared/models/userevents';
import { IVehicleResponse } from './../shared/models/vehicleresponse';
import { AddAddressComponent } from './../shared/address/add-address.component';
import { IUserresponse } from './../shared/models/userresponse';
import { SessionService } from './../shared/services/session.service';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { ICustomerContextResponse } from './../shared/models/customercontextresponse';
import { Router, ActivatedRoute } from '@angular/router';
import { IShipmentAdressResponse, ICommonResponse, ICommon } from './models/tagshipmentaddressresponse';
import { IShipmentAdressRequest } from './models/tagshipmentaddressrequest';
import { ITagShipmentTypesResponse } from './models/tagshipmentsresponse';
import { ITagConfigurationResponse } from './models/tagsconfigurationresponse';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TagService } from './services/tags.service';
import { ITagRequest, IAssignTagRequest } from './models/tagrequest';
import { ITagResponse } from '../shared/models/tagresponse';
import { TagRequestType } from './constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivitySource, SubSystem, AddressTypes, Features, Actions, defaultCulture } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';

declare var $: any;
@Component({
  selector: 'app-get-tag-details',
  templateUrl: './get-tag-details.component.html',
  styleUrls: ['./get-tag-details.component.css']
})

export class GetTagDetailsComponent implements OnInit {
  IsTagAllowforPostpaid: number = 0;
  nonRevenueForm: FormGroup;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  hideAllBlocks = true;
  countries: any[];
  tagsResponseArray: ITagResponse[];
  manageTagsResponseArray: ITagResponse[];
  nonRevenueTagsResponse: ITagResponse[];
  tagStatusResponseArray: ITagResponse[];
  getTagconfigResponse: ITagConfigurationResponse[];
  getShipmentTypeResponse: ITagShipmentTypesResponse[];
  shipmentTypes: ITagShipmentTypesResponse[];
  selectedAccountList: ITagResponse[] = <ITagResponse[]>[];
  shipmentAddressList = [];
  tagRequestlist: ITagRequest[] = [];
  isParentSelected: boolean;
  purchaseMethod = [];
  childobject: ITagResponse;
  customerId: number = 0;
  tagStatus: string = '';
  tagAlias: string = '';
  fulfillVisible: boolean = false;
  addressForm: FormGroup;
  shipmentVisible: boolean = false;
  selectedShipmentFee: number = 0;
  replacementVisible: boolean = false;
  common: ICommon = <ICommon>{};
  isManage: boolean = false;
  serialNumber: string;
  protocol: string;
  mounting: string;
  tagDeliveryMethod: string = "PickUpAfterNotification";
  serviceTypeId: number = 0;
  descLength: number = 255;
  isAddressEnable: boolean;
  customerInformationres: any;
  revenueCategory: string;
  customerStatus: string;
  selectedValue: string = 'updateTags';
  isNonRevenue: boolean = false;
  tagRequired: boolean;
  CustTagReqId: number;
  isCancel: boolean = false;
  isManageTags: boolean = false;
  activeStatus: boolean = false;
  isCustTagId: boolean = false;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  apageItemNumber: number = 10;
  acurrentPage: number = 1;
  astartItemNumber: number = 1;
  aendItemNumber: number = this.apageItemNumber;;
  atotalRecordCount: number;

  npageItemNumber: number = 10;
  ncurrentPage: number = 1;
  nstartItemNumber: number = 1;
  nendItemNumber: number = this.npageItemNumber;
  ntotalRecordCount: number;

  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  userEventsResult: boolean = false;
  disableButton: boolean = false;
  disableCancel: boolean = false;
  disableUpdate: boolean = false;
  disableRequest: boolean = false;
  disableAssociate: boolean = false;
  disableNonRev: boolean = false;

  constructor(private tagService: TagService, private commonService: CommonService, private route: ActivatedRoute, private router: Router, private customerContext: CustomerContextService,
    private sessionContext: SessionService) { }
  @ViewChild(AddAddressComponent) addressComponent;

  ngOnInit() {
    this.customerContext.currentContext
      .subscribe(customerContext => {
        this.customerContextResponse = customerContext;
      }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;
    let id = +this.route.snapshot.params['id'];
    if (id == 2) {
      this.successMessageBlock("Tag(s) has been requested successfully.");
    }

    this.addressForm = new FormGroup({
      addressRadioOptions: new FormControl('exist'),
      comments: new FormControl('', [])
    });
    this.nonRevenueForm = new FormGroup({
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });

    this.bindCustomerInfo();
    //this.changeRadioButton(this.selectedValue);
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => this.userEventsResult = res);
    this.commonService.getTransponderPurchaseMethod().subscribe(res => this.purchaseMethod = res);
    this.commonService.getCountries().subscribe(res => this.countries = res);
    this.tagService.getActiveTagConfigurations().subscribe(res => this.getTagconfigResponse = res);
    this.tagService.getShipmentServiceTypes().subscribe(res => this.getShipmentTypeResponse = res);

    this.disableButton = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.FULFILL], "");
    console.log(this.disableButton);
    this.disableCancel = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.CANCEL], "");
    this.disableUpdate = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.UPDATE], "");
    this.disableRequest = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.REQUEST], "");
    this.disableAssociate = !this.commonService.isAllowed(Features[Features.TAG], Actions[Actions.ASSOCIATETAG], "");
    this.disableNonRev = !this.commonService.isAllowed(Features[Features.MANAGENONREVENUETAGS], Actions[Actions.UPDATE], "");
  }

  changeRadioButton(selectedValue) {
    this.selectedValue = selectedValue;
    if (this.selectedValue == 'updateTags') {
      this.acurrentPage = 1;
      this.getAssignedTags();
      this.isManageTags = true;
      this.fulfillVisible = false;
      this.isNonRevenue = false;
    }
    else if (this.selectedValue == 'requestNewTags') {
      this.currentPage = 1;
      this.getRequestTags();
      this.isManageTags = false;
      this.replacementVisible = false;
      this.isManage = false;
      this.isNonRevenue = false;
    }
    else if (this.selectedValue == 'nonrevenueTags') {
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.VIEW];
      this.userEventsCalling(userEvents);
      userEvents.FeatureName = Features[Features.MANAGENONREVENUETAGS];
      this.selectedAccountList = [];
      this.ncurrentPage = 1;
      this.getNonRevenueTagDetails(userEvents);
      this.isNonRevenue = true;
      this.isManageTags = false;
      this.replacementVisible = false;
      this.fulfillVisible = false;
      this.isManage = false;
    }
  }
  onFulfillClicked(message: string): void {
    this.successMessageBlock(message);
    this.selectedValue = 'updateTags';
    this.changeRadioButton(this.selectedValue);
  }

  onCancelClicked(status: boolean): void {
    this.fulfillVisible = status;
  }

  bindCustomerInfo() {
    this.tagService.bindCustomerInfoDetails(this.customerContextResponse.AccountId).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => { }
      , () => {
        if (this.customerInformationres) {
          this.tagRequired = this.customerInformationres.IsTagRequired;
          this.customerStatus = this.customerInformationres.AccountStatus;
          this.revenueCategory = this.customerInformationres.RevenueCategory;
          this.customerId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.customerContextResponse.AccountId;
          if (this.customerStatus == 'PC') { this.activeStatus = true }
          if ((this.customerStatus == "CORR") || (this.customerStatus == "COWO") ||
            (this.customerStatus == "COCL") || (this.customerStatus == "RR") ||
            (this.customerStatus == "WO") || (this.customerStatus == "CL")) {
            this.hideAllBlocks = false;
            this.errorMessageBlock("The account status is not in Active. You are not allowed to do this operation");
            return false;
          }
          if (!this.tagRequired) {            
            if (this.customerInformationres.ParentPlanName.toUpperCase() == 'POSTPAID') {
              this.commonService.getApplicationParameterValue(ApplicationParameterkey.VehicleswithTranspondersforPostpaidVideo).subscribe(
                res => {
                  this.IsTagAllowforPostpaid = res;
                 
                  if (this.IsTagAllowforPostpaid == 0) {
                    this.hideAllBlocks = false;
                    this.errorMessageBlock("You are not allowed to do this operation");
                    return false;
                  }
                  else {
                    this.hideAllBlocks = true;
                  }
                });
            }
            else {             
              this.hideAllBlocks = false;
              this.errorMessageBlock("You are not allowed to do this operation");
              return false;
            }
          }
          // this.getRequestTags();        
          this.changeRadioButton(this.selectedValue);
        }
      }
    )
  }
  addressChange(addressType) {
    if (addressType == "exist")
      this.isAddressEnable = true;
    else
      this.isAddressEnable = false;
  }
  getRequestTags() {
    var tagRequest = <ITagRequest>{};
    tagRequest.TagReqType = TagRequestType[TagRequestType.All];
    tagRequest.CustomerId = this.customerId;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.UserName = this.sessionContextResponse.userName;
    tagRequest.PageNumber = this.currentPage;
    tagRequest.PageSize = this.pageItemNumber;
    tagRequest.SortColumn = "TAGREQDATE";
    tagRequest.SortDirection = false;
    tagRequest.IsPageLoad = true;
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    tagRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.tagService.getRequestedTagsByAccountId(tagRequest).subscribe(res => {
      this.tagsResponseArray = res;
      if (this.tagsResponseArray != null && this.tagsResponseArray.length > 0) {
        this.totalRecordCount = this.tagsResponseArray[0].RecCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount
        }
        for (var i in this.tagsResponseArray) {
          this.tagsResponseArray[i].TagReqType = TagRequestType[this.tagsResponseArray[i].TagReqType];
        }
      }
    });
  }
  getAssignedTags() {
    var tagRequest = <ITagRequest>{};
    var strAccountId = this.customerId.toString();
    tagRequest.PageNumber = this.acurrentPage;
    tagRequest.PageSize = this.apageItemNumber;
    tagRequest.SortColumn = "SERIALNO";
    tagRequest.SortDirection = true;
    this.tagService.getTagsByAccountId(strAccountId, tagRequest).subscribe(res => {
      this.manageTagsResponseArray = res;
      if (this.manageTagsResponseArray != null && this.manageTagsResponseArray.length > 0) {
        this.atotalRecordCount = this.manageTagsResponseArray[0].RecCount;
        if (this.atotalRecordCount < this.apageItemNumber) {
          this.aendItemNumber = this.atotalRecordCount
        }
      }
    });
  }
  totalTagsCount() {
    let count: number = 0;
    this.tagsResponseArray.forEach(function (arrayItem) {
      count += arrayItem.ReqCount;
    });
    return count;
  }

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getRequestTags();
  }

  pageChangedforAssignedTags(event) {
    this.acurrentPage = event;
    this.astartItemNumber = (((this.acurrentPage) - 1) * this.apageItemNumber) + 1;
    this.aendItemNumber = ((this.acurrentPage) * this.apageItemNumber);
    if (this.aendItemNumber > this.atotalRecordCount)
      this.aendItemNumber = this.atotalRecordCount;
    this.isManage = false;
    this.getAssignedTags();
  }

  pageChangedforNonRevenue(event) {
    this.ncurrentPage = event;
    this.nstartItemNumber = (((this.ncurrentPage) - 1) * this.npageItemNumber) + 1;
    this.nendItemNumber = ((this.ncurrentPage) * this.npageItemNumber);
    if (this.nendItemNumber > this.ntotalRecordCount)
      this.nendItemNumber = this.ntotalRecordCount;
    this.isParentSelected = false;
    this.getNonRevenueTagDetails();
  }

  deleteTagRequest(tagRequestId: number) {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.CANCEL];
    this.userEventsCalling(userEvents);

    var tagRequest = <ITagRequest>{};
    tagRequest.CustTagReqId = tagRequestId;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.CustomerId = this.customerId;
    tagRequest.UserName = this.sessionContextResponse.userName;
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    tagRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.tagService.removeTagRequestFromQueue(tagRequest, userEvents).subscribe(res => {
      $('#confirm-dialog').modal('hide');
      if (res) {
        this.successMessageBlock("Tag request cancelled successfully");
        this.getRequestTags();
      }
      else {
        this.errorMessageBlock("Error while deleting request");
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }
  redirectPage(tagResponse: ITagResponse) {
    this.getAssignedTags();
    this.replacementVisible = false;
    this.isManage = false;
    this.childobject = tagResponse;
    this.customerId = this.customerId;
    this.fulfillVisible = true;
    setTimeout(function () { window.scrollTo(200, document.body.scrollHeight) }, 100);
  }

  onManageClick(selectedTag: ITagResponse, index) {
    this.fulfillVisible = false;
    this.serialNumber = selectedTag.SerialNumber;
    this.protocol = selectedTag.Protocol;
    this.mounting = selectedTag.Mounting;
    if (this.isManage) {
      this.informationMessage("Manage not allowed for multiple tags");
      return false;
    }
    else {
      this.manageTagsResponseArray[index].isSelected = true;
      if (!((selectedTag.TagStatus.toUpperCase() == "ASSIGNED")
        || (selectedTag.TagStatus.toUpperCase() == "LOST")
        || (selectedTag.TagStatus.toUpperCase() == "STOLEN")
        || (selectedTag.TagStatus.toUpperCase() == "REPLACED")
        || (selectedTag.TagStatus.toUpperCase() == "STOLENCOLLECTION"))) {
        this.manageTagsResponseArray[index].isSelected = false;
        this.isManage = false;
        this.informationMessage(selectedTag.TagStatus + " Tag can not be managed");
        return false;
      }
      else {
        this.isManage = true;
        this.tagService.getTagStatusbyMatrix(selectedTag.TagStatus)
          .subscribe(res => {
            this.tagStatusResponseArray = res;
          });
      }
    }
  }
  updateTagStatus(manageTag) {
    if (this.tagAlias != '' || this.tagStatus != '') {
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.UPDATE];
      this.userEventsCalling(userEvents);

      var tagRequest = <ITagRequest>{};
      if (this.tagStatus.toUpperCase() == "FOUND") {
        tagRequest.TagStatus = "Assigned";
      }
      tagRequest.UserName = this.sessionContextResponse.userName;
      tagRequest.ICNId = this.sessionContextResponse.icnId;
      tagRequest.LoginId = this.sessionContextResponse.loginId;
      tagRequest.UserId = this.sessionContextResponse.userId;
      tagRequest.TagStatus = this.tagStatus;
      tagRequest.PreviousTagStatus = manageTag.TagStatus;
      tagRequest.SerialNumber = manageTag.SerialNumber;
      tagRequest.CustomerId = manageTag.CustomerId;
      tagRequest.StartEffectiveDate = manageTag.StartEffectiveDate;
      tagRequest.Protocol = manageTag.Protocol;
      tagRequest.HexTagNumber = manageTag.HexTagNumber;
      tagRequest.PreviousTagAlias = manageTag.tagAlias;
      tagRequest.TagAlias = this.tagAlias;
      tagRequest.CustTagReqId = manageTag.CustTagReqId;
      tagRequest.EndEffectiveDate = (new Date).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      tagRequest.StatusDate = new Date;
      tagRequest.TagReqDate = new Date;
      tagRequest.TagTobeReplaced = manageTag.SerialNumber;
      tagRequest.TagReqType = TagRequestType[TagRequestType.Replace];
      tagRequest.ReqCount = 1;
      tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      tagRequest.SubSystem = SubSystem[SubSystem.CSC];
      tagRequest.VehicleId = manageTag.VehicleId;
      $('#pageloader').modal('show');
      this.tagService.updateTagAliasandStatus(tagRequest, userEvents).subscribe(res => {
        if (res) {
          this.successMessageBlock("Tag staus updated successfully");
          $('#pageloader').modal('hide');
          this.getAssignedTags();
          this.isManage = false;
          this.tagAlias = '';
          this.tagStatus = '';
        }
        else {
          this.errorMessageBlock("Error while update tagstatus");
          $('#pageloader').modal('hide');
          this.isManage = false;
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
          $('#pageloader').modal('hide');
        },
        () => {
        });
    }
    else {
      this.informationMessage("Change tag status to update");
      return false;
    }
  }
  dropdownselectedValue(tag) {
    this.tagStatus = tag;
    if (this.tagStatus.toUpperCase() == "REQUEST REPLACEMENT") {
      this.replacementVisible = true;
      this.shipmentVisible = false;
    }
    else {
      this.replacementVisible = false;
    }
  }
  txtChange(alias) {
    this.tagAlias = alias;
  }
  cancelTagStatus() {
    this.getAssignedTags();
    this.tagAlias = "";
    this.replacementVisible = false;
    this.isManage = false;
  }
  cancelTagRequest(custTagReqId) {
    this.CustTagReqId = custTagReqId;
    this.fulfillVisible = false;
    this.isCancel = true;
    this.confirmationBlock("Are you sure you want to cancel tag request ?");
  }

  onSelectDeliveryMethod(methodType: string) {
    this.tagDeliveryMethod = methodType;
    if (this.tagDeliveryMethod.toUpperCase() == "SHIPMENTBYPOST") {
      this.shipmentVisible = true;
      this.tagService.getShipmentServiceTypes().subscribe(res => {
        this.getShipmentTypeResponse = res;
        this.getShipmentTypeResponse[0].IsSelected = true;
        this.onShipmentSelectionChange(this.getShipmentTypeResponse[0]);
        this.isAddressEnable = true;
      });
    }
    else {
      this.shipmentVisible = false;
      this.getShipmentTypeResponse = [];
      this.selectedShipmentFee = 0;
      this.serviceTypeId = 0;
    }
  }
  onShipmentSelectionChange(service: ITagShipmentTypesResponse) {
    this.serviceTypeId = service.ServiceTypeId;
    this.selectedShipmentFee = service.Cost;
  }
  submitTagRequest() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.REQUEST];
    this.userEventsCalling(userEvents);

    var tagRequest = <ITagRequest>{};
    tagRequest.CustomerId = this.customerId;
    tagRequest.UserName = this.sessionContextResponse.userName;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.RevenueCategory = this.revenueCategory;
    tagRequest.SubSystem = SubSystem[SubSystem.CSC];
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    tagRequest.TagReqDate = new Date;
    tagRequest.TagReqType = TagRequestType[TagRequestType.Replace];
    tagRequest.TotalRequiredAmount = 0;
    tagRequest.TagTobeReplaced = this.serialNumber;
    tagRequest.TagPurchaseMethod = 0;
    tagRequest.TagPurchaseMethodCode = this.tagDeliveryMethod;
    tagRequest.TagDeliveryMethod = this.serviceTypeId > 0 ? this.serviceTypeId : 0;
    tagRequest.ReqCount = 1;
    tagRequest.Protocol = this.protocol;
    tagRequest.Mounting = this.mounting;
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
          this.validateAllFeilds();
          return false;
        }
      }
      else {
        this.shipmentAddress(tagRequest);
      }
    }
    this.tagRequestlist.push(tagRequest);
    $('#pageloader').modal('show');
    this.tagService.tagRequestInqueue(this.tagRequestlist, userEvents).subscribe(res => {
      if (res) {
        this.successMessageBlock("Tag(s) requested successfully");
        this.selectedValue = 'requestNewTags';
        this.changeRadioButton(this.selectedValue);
        this.replacementVisible = false;
        this.isManage = false;
        this.tagRequestlist = [];
        $('#pageloader').modal('hide');
      }
      else {
        this.errorMessageBlock("Error while requested tags");
        this.tagRequestlist = [];
        $('#pageloader').modal('hide');
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
        this.tagRequestlist = [];
        this.shipmentVisible = false;
        this.getShipmentTypeResponse = [];
        this.selectedShipmentFee = 0;
        this.serviceTypeId = 0;
        $('#pageloader').modal('hide');
      },
      () => {
      });
    $('#pageloader').modal('hide');
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
  onCancelTagRequest(event) {
    this.replacementVisible = false;
    this.getAssignedTags();
    this.isManage = false;
    this.tagDeliveryMethod = "PickUpAfterNotification";
    this.shipmentVisible = false;
    this.getShipmentTypeResponse = [];
    this.selectedShipmentFee = 0;
    this.serviceTypeId = 0;
  }
  onRequestclick() {
    this.router.navigateByUrl('csc/tags/request-new-tags');
  }
  onAssociateTagclick() {
    this.router.navigate(['csc/tags/associate-tags']);
  }

  descEvent(event: any) {
    this.descLength = 255 - event.target.value.length
  }

  validateAllFeilds() {
    this.addressComponent.addAddressForm.controls["addressCity"].markAsTouched({ onlySelf: true });
    this.addressComponent.addAddressForm.controls["addressLine1"].markAsTouched({ onlySelf: true });
    this.addressComponent.addAddressForm.controls["addressStateSelected"].markAsTouched({ onlySelf: true });
    this.addressComponent.addAddressForm.controls["addressZip1"].markAsTouched({ onlySelf: true });
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.TAG];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
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
  confirmationBlock(alertMsg) {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = alertMsg;
  }
  informationMessage(infoMsg) {
    this.msgType = 'info';
    this.msgFlag = true;
    this.msgDesc = infoMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
  userAction(event) {
    if (event) {
      if (this.isCancel) {
        this.deleteTagRequest(this.CustTagReqId)
      }
      else {
        this.submitNonRevenue();
      }
    }
  }

  getNonRevenueTagDetails(userEvents?: IUserEvents) {
    if (!this.commonService.isAllowed(Features[Features.MANAGENONREVENUETAGS], Actions[Actions.VIEW], "")) {
      this.informationMessage("You don't have privileges to access");
      return;
    }
    //this.selectedAccountList = [];
    var tagRequest = <ITagRequest>{};
    var strAccountId = this.customerId.toString();
    tagRequest.PageNumber = this.ncurrentPage;
    tagRequest.PageSize = this.npageItemNumber;
    tagRequest.SortColumn = "CUSTTAGID";
    tagRequest.SortDirection = true;
    this.tagService.getAssignedTagsbyCustomerId(strAccountId, tagRequest, userEvents).subscribe(res => {
      this.nonRevenueTagsResponse = res;
      if (this.nonRevenueTagsResponse != null && this.nonRevenueTagsResponse.length > 0) {
        this.ntotalRecordCount = this.nonRevenueTagsResponse[0].RecCount;
        if (this.ntotalRecordCount < this.npageItemNumber) {
          this.nendItemNumber = this.ntotalRecordCount
        }
        for (var i = 0; i < this.nonRevenueTagsResponse.length; i++) {
          if (this.nonRevenueTagsResponse[i].IsNonRevenue) {
            if (this.selectedAccountList && this.selectedAccountList.length == 0) {
              this.nonRevenueTagsResponse[i].isAccountSelected = true;
              this.selectedAccountList.push(this.nonRevenueTagsResponse[i]);
            }
            if (this.selectedAccountList && this.selectedAccountList.length > 0) {
              var index = this.selectedAccountList.findIndex(x => x.CustTagReqId == this.nonRevenueTagsResponse[i].CustTagReqId);
              if (index == -1) {
                this.nonRevenueTagsResponse[i].isAccountSelected = true;
                this.selectedAccountList.push(this.nonRevenueTagsResponse[i]);
                this.isParentSelected = false;
              }
            }

          }
        }
      }
      if (this.selectedAccountList && this.selectedAccountList.length > 0) {
        let count: number = 0;
        for (var i = 0; i < this.nonRevenueTagsResponse.length; i++) {
          var index = this.selectedAccountList.findIndex(x => x.CustTagReqId == this.nonRevenueTagsResponse[i].CustTagReqId);
          if (index > -1) {
            this.nonRevenueTagsResponse[i].isAccountSelected = true;
            //this.nonRevenueTagsResponse[i].RequestStatus = this.selectedAccountList[index].RequestStatus;
            count++;
          }
          else
            this.nonRevenueTagsResponse[i].isAccountSelected = false;
        }
        if (this.nonRevenueTagsResponse.length == count) {
          this.isParentSelected = true;
        }
        else {
          this.isParentSelected = false;
        }
      }
      console.log(this.selectedAccountList);
    });
  }

  checkAllClick(event) {
    for (var i = 0; i < this.nonRevenueTagsResponse.length; i++) {
      let isChecked: boolean = event.target.checked;
      this.nonRevenueTagsResponse[i].isAccountSelected = isChecked;
      var index = this.selectedAccountList.findIndex(x => x.CustTagReqId == this.nonRevenueTagsResponse[i].CustTagReqId);
      if (index > -1 && !isChecked) {
        this.selectedAccountList = this.selectedAccountList.filter(item => item.CustTagReqId != this.nonRevenueTagsResponse[i].CustTagReqId);
        this.nonRevenueTagsResponse[i].isAccountSelected = false;
      }
      else if (isChecked) {
        var index = this.selectedAccountList.findIndex(x => x.CustTagReqId == this.nonRevenueTagsResponse[i].CustTagReqId);
        if (index === -1) {
          this.selectedAccountList.push(this.nonRevenueTagsResponse[i]);
          this.nonRevenueTagsResponse[i].isAccountSelected = true;
        }
      }
    }
  }

  checkboxCheckedEvent(object: ITagResponse, event) {
    var index = this.selectedAccountList.findIndex(x => x.CustTagReqId == object.CustTagReqId);
    if (event.target.checked) {
      if (index == -1) {
        this.selectedAccountList.push(object);
        object.isAccountSelected = true;
        var result = this.nonRevenueTagsResponse.filter(x => x.isAccountSelected == true).length;
        if (result == this.nonRevenueTagsResponse.length)
          this.isParentSelected = true;
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedAccountList.splice(index, 1);
        object.isAccountSelected = false;
      }
    }
  }
  confirmSubmitNonRevenue() {
    // if (this.selectedAccountList.length > 0) {
    this.isCancel = false;
    this.confirmationBlock("Are you sure you want to update tag(s) ?");
  }

  submitNonRevenue() {
    if (this.selectedAccountList.length > 0) {
      var trueNonRevenueIds: string = '';
      var trueSerialNos: string = '';
      for (var i = 0; i < this.selectedAccountList.length; i++) {
        trueNonRevenueIds += this.selectedAccountList[i].CustTagReqId.toString() + ',';
        trueSerialNos += this.selectedAccountList[i].SerialNumber.toString() + ',';
      }
      if (trueNonRevenueIds != null && trueNonRevenueIds.length > 0) {
        trueNonRevenueIds = trueNonRevenueIds.slice(0, -1);
      }
      else {
        this.errorMessageBlock('Select at least tag serial no');
        return;
      }
      let strUpdateFlag = 1;
      this.updateNonRevenue(trueNonRevenueIds, strUpdateFlag);
    }
    else {
      var trueNonRevenueIds: string = '';
      let strUpdateFlag = 0;
      if (this.nonRevenueTagsResponse.length > 0) {
        for (var i = 0; i < this.nonRevenueTagsResponse.length; i++) {
          trueNonRevenueIds += this.nonRevenueTagsResponse[i].CustTagReqId.toString() + ',';
        }
        if (trueNonRevenueIds != null && trueNonRevenueIds.length > 0) {
          trueNonRevenueIds = trueNonRevenueIds.slice(0, -1);
        }
        else {
          this.errorMessageBlock('Select at least tag serial no');
          return;
        }
        this.updateNonRevenue(trueNonRevenueIds, strUpdateFlag);
      }
    }
  }
  updateNonRevenue(trueNonRevenueIds, strUpdateFlag) {
    let userEvents = <IUserEvents>{};
    let strUpdateduser = this.sessionContextResponse.userName;
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    userEvents.FeatureName = Features[Features.MANAGENONREVENUETAGS];
    this.tagService.updateIsNonRevenueForTags(trueNonRevenueIds, strUpdateFlag, strUpdateduser, userEvents)
      .subscribe(res => {
        if (res) {
          this.successMessageBlock("Tag(s) has been updated successfully");
          this.ncurrentPage = 1;
          this.getNonRevenueTagDetails();
        }
        else {
          this.errorMessageBlock('Error while updating to Non Revenue');
          this.selectedAccountList = [];
          return;
        }
      },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
        this.selectedAccountList = [];
      },
      () => {
      });
  }
  clearRevenueDetails() {
    this.ncurrentPage = 1;
    this.selectedAccountList = [];
    this.getNonRevenueTagDetails();
    if (this.nonRevenueTagsResponse != null && this.selectedAccountList != null) {
      if (this.nonRevenueTagsResponse.length == this.selectedAccountList.length) {
        this.isParentSelected = true;
      }
      else {
        this.isParentSelected = false;
        this.nonRevenueForm.controls['checkAll'].setValue('');
      }
    }
  }
}