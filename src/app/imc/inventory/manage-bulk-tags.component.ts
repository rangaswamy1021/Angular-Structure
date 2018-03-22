import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IItemRequest } from "./models/itemrequest";
import { InventoryService } from "./services/inventory.service";
import { IItemResponse } from "./models/itemresponse";
import { ITagResponse } from "./models/tagresponse";
import { ITagRequest } from "./models/tagrequest";
import { Router } from "@angular/router";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { TagStatus } from "../constants";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";

declare var $: any;
@Component({
  selector: 'app-manage-bulk-tags',
  templateUrl: './manage-bulk-tags.component.html',
  styleUrls: ['./manage-bulk-tags.component.scss']
})
export class ManageBulkTagsComponent implements OnInit {
  gridArrowTAGTYPE: boolean;
  gridArrowFULLNAME: boolean;
  gridArrowCustomerId: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowSERIALNUMBER: boolean;
  invalidDate: boolean;
  disableViewButton: boolean;
  disableManageButton: boolean;
  disableSearchButton: boolean;
  tagStatusDropdown: any;
  strDate: any;
  statusTagForm: FormGroup;
  rmaForm: FormGroup;
  tooltip: string;
  selectedAll1: any;

  tagStatus: string;
  tagRequestSearch: ITagRequest = <ITagRequest>{};
  searchDetails: boolean;
  bulkManage: boolean;
  manageBulkForm: FormGroup;
  responseItemStatus: IItemResponse[];
  searchResponse: ITagResponse[];
  AfterSearch: boolean = false;
  clickManage: boolean = false;
  btnManage: boolean = true;
  readOnly: boolean = true;

  getTagStatusbyMatrixResponse: ITagResponse[];
  sessionContextResponse: IUserresponse;
  userEventRequest: IUserEvents = <IUserEvents>{};
  userName: string;
  loginId: number;
  userId: number;
  dropDownValue: string;
  checkBoxArray: any[] = [];
  selectedAll: boolean = false;
  isParentSelected: boolean;
  showRmaTextbox: boolean = false;
  getVehicleTagsResponse: number;
  timePeriod: any;
  noRecordsToDisplay: boolean = false;

  pageItemNumber: number = 50;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo',
    sunHighlight: false, height: '34px', width: '260px', inline: false,
    alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false,
    showApplyBtn: false, showClearDateRangeBtn: false
  };


  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  msgTitle: string;



  pageChanged(event) {

    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.searchItems("", this.currentPage, null);
  }

  constructor(private inventoryService: InventoryService, private cdr: ChangeDetectorRef,
    private datePickerFormat: DatePickerFormatService, private commonService: CommonService, private _routers: Router, private sessionContext: SessionService) {
  }

  ngOnInit() {
    this.gridArrowSERIALNUMBER = true;
    this.sortingColumn = "SERIALNUMBER";
    this.noRecordsToDisplay = false;
    this.endItemNumber = 50;

    this.manageBulkForm = new FormGroup({
      'itemStatus': new FormControl('', [Validators.required]),
      'timePeriod': new FormControl('')
    });
    this.statusTagForm = new FormGroup({
      'status': new FormControl('', [Validators.required]),
    });
    this.rmaForm = new FormGroup({
      'rmaNumber': new FormControl('')
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._routers.navigate(link);
    }
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.disableViewButton = !(this.commonService.isAllowed(Features[Features.BULKMANAGETAGS], Actions[Actions.VIEWDETAILS], ""));
    this.disableSearchButton = !(this.commonService.isAllowed(Features[Features.BULKMANAGETAGS], Actions[Actions.SEARCH], ""));
    this.disableManageButton = !(this.commonService.isAllowed(Features[Features.BULKMANAGETAGS], Actions[Actions.MANAGE], ""));


    this.getItemStatus();
    this.getVehicleNumber();

    if ((this.inventoryService.viewItemsFromService) != undefined) {
      this.viewItems();
    }
  }
  historyClick(serialNumber) {
    this._routers.navigate(['imc/inventory/tags-history/' + serialNumber]);
    this.inventoryService.goToBulkManage = true;
    this.inventoryService.viewItemsFromService = this.tagRequestSearch;
  }

  viewItems() {
    this.manageBulkForm.controls['itemStatus'].setValue(this.inventoryService.viewItemsFromService.TagStatus);
    this.manageBulkForm.controls['timePeriod'].setValue(this.inventoryService.viewItemsFromService.timePeriod);
    this.bulkManage = true;
    this.searchItems("SEARCH", this.currentPage, null);

  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.BULKMANAGETAGS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this._routers.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }


  searchReset() {
    this.bulkManage = false;
    this.clickManage = false;
    this.readOnly = true;
    this.endItemNumber = 50;
    this.tooltip = "Manage";
    this.noRecordsToDisplay = false;
    this.selectedAll1 = false;
    this.tagRequestSearch.StartEffectiveDate = null;
    this.tagRequestSearch.EndEffectiveDate = null;
    this.statusTagForm.reset();
    this.manageBulkForm.reset();
    this.showRmaTextbox = false;
    this.rmaForm.controls["rmaNumber"].reset();
    this.inventoryService.viewItemsFromService = null;
    this.tagRequestSearch.timePeriod = null;
  }
  selectAllTransActivity() {
    for (var i = 0; i < this.searchResponse.length; i++) {
      this.searchResponse[i].isSelected = this.selectedAll;
    }
  }
  dropdownselectedValue(tag) {
    this.dropDownValue = tag;
    if (this.dropDownValue == "VENDORRETURN") {
      this.showRmaTextbox = true;
    }
    else {
      this.showRmaTextbox = false;
    }
  }

  getItemStatus() {
    let userEvents = this.userEvents();
    let itemRequest: IItemRequest = <IItemRequest>{};
    this.inventoryService.getAllStatus(itemRequest, userEvents).subscribe(
      res => {
        this.responseItemStatus = res;

      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  getVehicleNumber() {
    this.inventoryService.getVehicleTags('IsVehicleTags').subscribe(
      res => {
        this.getVehicleTagsResponse = res;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }
  searchItemsClick() {
    if (!this.invalidDate) {
      this.tagRequestSearch.StartEffectiveDate = null;
      this.tagRequestSearch.EndEffectiveDate = null;
      this.readOnly = true;
      this.showRmaTextbox = false;
      this.rmaForm.controls["rmaNumber"].reset();
      this.statusTagForm.reset();
      if ((this.manageBulkForm.controls['itemStatus'].value == "" || this.manageBulkForm.controls['itemStatus'].value == null)) {
        this.validateAllFormFields(this.manageBulkForm);
      }
      else {
        this.currentPage = 1;
        this.endItemNumber = 50;
        this.startItemNumber = 1;
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.SEARCH];
        this.searchItems("SEARCH", this.currentPage, userEvents);
      }
    }

  }
  searchItems(type: string, currentPage: number, userEvents: IUserEvents) {

    if (type == "SEARCH") {
      this.strDate = this.manageBulkForm.controls['timePeriod'].value;
      let fromDate = new Date();
      let toDate = new Date();
      let strDate = this.manageBulkForm.controls['timePeriod'].value;
      debugger;
      if (strDate) {
        fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
        toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
        this.tagRequestSearch.StartEffectiveDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");;
        this.tagRequestSearch.EndEffectiveDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");;
        this.tagRequestSearch.timePeriod = this.strDate;
      }

      this.timePeriod = this.manageBulkForm.controls['timePeriod'].value;
      this.tagRequestSearch.TagStatus = this.manageBulkForm.controls['itemStatus'].value;
    }
    this.tagRequestSearch.UserId = this.sessionContext.customerContext.userId;
    this.tagRequestSearch.LoginId = this.sessionContext.customerContext.loginId;
    this.tagRequestSearch.UserName = this.sessionContext.customerContext.userName;
    this.tagRequestSearch.ActivitySource = ActivitySource.Internal.toString();
    this.tagRequestSearch.PageNumber = this.currentPage;
    this.tagRequestSearch.PageSize = this.pageItemNumber;
    this.tagRequestSearch.SortColumn = this.sortingColumn;
    this.tagRequestSearch.SortDirection = this.sortingDirection;

    this.inventoryService.searchBulkItems(this.tagRequestSearch, userEvents).subscribe(
      res => {
        if (res == "" || res == null || res == []) {
          this.bulkManage = false;
          this.noRecordsToDisplay = true;
        }
        else {
          this.noRecordsToDisplay = false;
          this.bulkManage = true;
          this.searchResponse = res;
          this.selectedAll1 = false;
          let searchTagStatus = this.manageBulkForm.controls['itemStatus'].value;
          this.tagStatusDropdown = searchTagStatus;
          this.AfterSearch = true;
          this.clickManage = false;
          this.btnManage = true;
          this.totalRecordCount = this.searchResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
          if ((searchTagStatus.toUpperCase() == TagStatus[TagStatus.InventoryNew].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.InventoryRetailer].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.DestroyedDisposal].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.DestroyedObsolete].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDefective].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.VendorReturn].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Shipped].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Expired].toUpperCase())) {
            this.tooltip = searchTagStatus + " Transponder cannot be managed";
            this.clickManage = false;
          }
          else {
            this.tooltip = "Manage";

          }
          if (!(searchTagStatus.toUpperCase() == TagStatus[TagStatus.Assigned].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDamaged].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDefective].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Missing].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Returned].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDamaged].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedGood].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Lost].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Stolen].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.Replaced].toUpperCase() ||
            searchTagStatus.toUpperCase() == TagStatus[TagStatus.InventoryRecycled].toUpperCase())) {
            this.tooltip = searchTagStatus + " Transponder cannot be managed";
            this.clickManage = false;
          }
          else {
            this.tooltip = "Manage";
          }
          if ((this.getVehicleTagsResponse == 1)) {
            if (!(searchTagStatus.toUpperCase() == TagStatus[TagStatus.Assigned].toUpperCase() ||
              searchTagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDamaged].toUpperCase() ||
              searchTagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDefective].toUpperCase() ||
              searchTagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase() ||
              searchTagStatus.toUpperCase() == TagStatus[TagStatus.Missing].toUpperCase())) {
              this.tooltip = searchTagStatus + " Transponder cannot be managed";
              this.clickManage = false;
            }
            else {
              this.tooltip = "Manage";
            }
          }
          else {
            if (searchTagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase()) {
              this.tooltip = searchTagStatus + " Transponder cannot be managed";
              this.bulkManage = true;
              this.btnManage = true;
              this.clickManage = false;
            }
          }
        }
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });


  }


  manageItems(event) {
    this.readOnly = true;
    this.checkBoxArray = [];
    this.dropDownValue = null;
    this.tagStatus = this.tagStatusDropdown;
    if (this.sessionContextResponse.icnId <= 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgTitle = '';
      this.msgDesc = "ICN must be assigned to update the transponder status";
      return;
    }
    if (!(this.tagStatus.toUpperCase() == TagStatus[TagStatus.Assigned].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDamaged].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDefective].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.Stolen].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.Returned].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDamaged].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedGood].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.Replaced].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.Lost].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.Missing].toUpperCase() ||
      this.tagStatus.toUpperCase() == TagStatus[TagStatus.InventoryRecycled].toUpperCase())) {
      this.tooltip = this.tagStatus + " Transponder cannot be managed";
      this.clickManage = false;
    }
    else {
      this.tooltip = "Manage";
      this.inventoryService.getTagStatusbyMatrix(this.tagStatus)
        .subscribe(
        res => {
          if (res) {
            this.getTagStatusbyMatrixResponse = res;
            if (!(this.getVehicleTagsResponse == 1)) {
              for (var i = 0; i < this.getTagStatusbyMatrixResponse.length; i++) {
                if (this.getTagStatusbyMatrixResponse[i].ColumnName == TagStatus[TagStatus.Assigned].toUpperCase()) {
                  this.getTagStatusbyMatrixResponse[i].ColumnName = TagStatus[TagStatus.Found].toUpperCase();
                }
              }
            }
            else {
              for (var i = 0; i < this.getTagStatusbyMatrixResponse.length; i++) {
                if (this.getTagStatusbyMatrixResponse[i].ColumnName == TagStatus[TagStatus.Returned].toUpperCase()) {
                  this.getTagStatusbyMatrixResponse[i].ColumnName = TagStatus[TagStatus.ReturnedDamaged].toUpperCase();
                }
              }
            }
          }
          else {
            this.tooltip = this.tagStatus + " Transponder cannot be managed";
            this.bulkManage = true;
            this.btnManage = true;
            this.clickManage = false;
          }
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
      this.clickManage = true;
      this.btnManage = false;
      this.readOnly = null;
    }
  }

  updateTagStatusWithDropdown() {
    if (this.dropDownValue == null) {
      this.validateAllFormFields(this.statusTagForm);
    } else {
      this.updateTagStatus();
    }
  }

  requestArray = [];
  updateTagStatus() {
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.MANAGE];
    this.requestArray = [];
    if (this.getVehicleTagsResponse == 1) {
      if (this.dropDownValue == TagStatus[TagStatus.ReturnedDamaged].toUpperCase()) {
        this.dropDownValue = TagStatus[TagStatus.Returned].toUpperCase();
      }
    }
    if (this.dropDownValue == TagStatus[TagStatus.Found].toUpperCase()) {
      this.dropDownValue = TagStatus[TagStatus.Assigned].toUpperCase();
    }
    for (let i = 0; i < this.checkBoxArray.length; i++) {
      var tagUpdate = <ITagRequest>{};
      tagUpdate.TagStatus = this.dropDownValue;
      tagUpdate.SerialNumber = this.searchResponse[this.checkBoxArray[i]].SerialNumber;
      tagUpdate.TagType = this.searchResponse[this.checkBoxArray[i]].TagType;
      tagUpdate.CustomerId = this.searchResponse[this.checkBoxArray[i]].CustomerId;
      tagUpdate.PreviousTagStatus = this.searchResponse[this.checkBoxArray[i]].TagStatus;
      tagUpdate.UserName = this.userName;
      tagUpdate.CustTagReqId = this.searchResponse[this.checkBoxArray[i]].CustTagReqId;
      tagUpdate.EndEffectiveDate = new Date();
      tagUpdate.TagLocation = "Inventory";
      tagUpdate.StatusDate = new Date();
      tagUpdate.WarrantyEndDate = this.searchResponse[this.checkBoxArray[i]].WarrantyEndDate;
      tagUpdate.ICNId = this.sessionContextResponse.icnId;
      if (this.rmaForm.controls["rmaNumber"].value == null) {
        tagUpdate.RMANumber = "";
      }
      else {
        tagUpdate.RMANumber = this.rmaForm.controls["rmaNumber"].value.toString();
      }
      tagUpdate.SubSystem = "IMC";
      tagUpdate.UserId = this.userId;
      tagUpdate.LoginId = this.loginId;
      tagUpdate.AccountId = this.userId;
      this.requestArray.push(tagUpdate);
      $('#pageloader').modal('show')
    }
    if (this.checkBoxArray.length > 0) {
      this.inventoryService.bulkTagUpdateStatus(this.requestArray, userEvents).subscribe(
        res => {
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgTitle = '';
            this.msgDesc = res;
            // this.successBlock = true;
            // this.successMessage = res;
            this.isParentSelected = false;
            this.searchItems("SEARCH", this.currentPage, null);
            this.clickManage = false;
            this.btnManage = true;
            this.readOnly = true;
            $('#pageloader').modal('hide');
            this.dropDownValue = null;
            this.statusTagForm.reset();
          }
        },
        err => {
          this.selectedAll1 = false;
          for (var i = 0; i < this.searchResponse.length; i++) {
            this.searchResponse[i].isSelected = false;
          }
          this.checkBoxArray.length = null;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgTitle = '';
          this.msgDesc = err.statusText;
          this.clickManage = false;
          this.btnManage = true;
          this.readOnly = true;
          $('#pageloader').modal('hide');
          return;
        });
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgTitle = '';
      this.msgDesc = "Select atleast one tag";
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


  setOutputFlag(e) {
    this.msgFlag = e;
  }


  checkBoxChange(event, i) {
    if (event.target.checked)
      this.checkBoxArray.push(i);
    else {
      for (var j = 0; j < this.checkBoxArray.length; j++) {
        if (this.checkBoxArray[j] == i)
          this.checkBoxArray.splice(j, 1);
      }
    }
  }

  selectAll() {
    this.checkBoxArray = [];
    for (var i = 0; i < this.searchResponse.length; i++) {
      this.searchResponse[i].isSelected = this.selectedAll1;

      if (this.selectedAll1) {
        this.checkBoxArray.push(i);
      }
    }
  }
  checkIfAllSelected() {
    this.selectedAll1 = this.searchResponse.every(function (item: any) {
      return item.isSelected == true;
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.manageBulkForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  sortDirection(SortingColumn) {
    this.gridArrowSERIALNUMBER = false;
    this.gridArrowCustomerId = false;
    this.gridArrowFULLNAME = false;
    this.gridArrowTAGTYPE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "SERIALNUMBER") {
      this.gridArrowSERIALNUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "CustomerId") {
      this.gridArrowCustomerId = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "FULLNAME") {
      this.gridArrowFULLNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "TAGTYPE") {
      this.gridArrowTAGTYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.searchItems("", this.currentPage, null);

  }


}