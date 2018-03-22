
import { ICommonResponse } from './../../tags/models/tagshipmentaddressresponse';
import { IItemResponse } from './models/itemresponse';
import { IItemRequest } from './models/itemrequest';
import { InventoryService } from './services/inventory.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {
  gridArrowITEMDESC: boolean;
  gridArrowITEMNAME: boolean;
  gridArrowITEMCODE: boolean;
  gridArrowITEMTYPEDESC: boolean;
  gridArrowMOUNTING: boolean;
  sortingColumn: string;
  sortingDirection: boolean;
  gridArrowPROTOCOL: boolean;
  searchClicked: boolean;
  addForm: FormGroup;
  searchForm: FormGroup;
  isValid: boolean;
  isDisabled: boolean;
  boolItemName: boolean;
  boolItemCode: boolean;
  ItemPriceLimit: boolean;
  isSearch: boolean;
  ItemPrice: boolean;
  isAddButtonEnabled = true;
  isUpdateButtonEnabled = false;
  isDeleteButtonEnabled = false;
  isResetButtonEnabled = true;
  isSubmitted = true;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  items: string;
  itemCodeMessage: string;
  itemNameMessage: string;
  itemPriceMessage: string;
  editResponse: any;
  itemType: any[];
  protocol: any[];
  vendors: any[];
  public editItemResponse: any;

  p: number;
  desclength: number = 150;
  itemId: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  totalCount: number;
  userEventRequest: IUserEvents = <IUserEvents>{};
  commonResponse: ICommonResponse[];
  itemResponse: IItemResponse[];
  inventoryEdit: IItemResponse[];
  sessionContextResponse: IUserresponse;
  //diabling buttons
  searchButton: boolean;
  addItemsButton: boolean;
  disableDeleteLink: boolean;
  disableEditLink: boolean;
  validatePattern = "^((?:[1-9][0-9]*)(?:\[0-9]+)?)$";
  validateName = "^[a-zA-Z0-9\\-\\s]+$";
  validateNamePattern = "[a-zA-Z][a-zA-Z]*";
  validatePricePattern = "^[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*$";
  validateSpacePattern = "[^< ][^<]*";
  validateZeroPattern = "[0-9]+(\.[0-9][0-9]?)?";

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getInventoryDetailsData('', this.p, null);
  }

  constructor(private inventoryService: InventoryService, private commonService: CommonService, private context: SessionService, private router: Router, private sessionContext: SessionService, private materialscriptService: MaterialscriptService) {
    this.items = "Add New Item";
  }

  ngOnInit() {
    this.gridArrowITEMTYPEDESC = true;
    this.sortingColumn = "ITEMTYPEDESC";
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = 10;

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.searchForm = new FormGroup({
      'searchItem': new FormControl('', [Validators.required,]),
    });
    this.isDisabled = false;
    this.addForm = new FormGroup({
      'itemtype': new FormControl('', [Validators.required,]),
      'protocol': new FormControl('', [Validators.required]),
      'mounting': new FormControl('', [Validators.required]),
      'itemCode': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateNamePattern), Validators.minLength(1), Validators.maxLength(15)])),
      'itemName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateSpacePattern), Validators.minLength(1), Validators.maxLength(15)])),
      'itemPrice': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePricePattern), Validators.pattern(this.validateZeroPattern)])),
      'threshold': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),
      'minOrderQty': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),
      'maxOrderQty': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),
      'description': new FormControl('', Validators.compose([Validators.required, , Validators.pattern(this.validateSpacePattern), Validators.minLength(1), Validators.maxLength(150)])),
      'vendorList': new FormControl('', [Validators.required])
    });

    this.searchButton = !this.commonService.isAllowed(Features[Features.INVENTORYITEMS], Actions[Actions.SEARCH], "");

    this.addItemsButton = !this.commonService.isAllowed(Features[Features.INVENTORYITEMS], Actions[Actions.CREATE], "");

    this.disableEditLink = !this.commonService.isAllowed(Features[Features.INVENTORYITEMS], Actions[Actions.UPDATE], "");

    this.disableDeleteLink = !this.commonService.isAllowed(Features[Features.INVENTORYITEMS], Actions[Actions.DELETE], "");

    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.VIEW];
    this.getInventoryDetailsData('View', this.p, userEvents);
    this.getInventoryItemTypes();
    this.getInventoryProtocol();
    this.getVendors();
  }

  descEvent(event) {
    this.desclength = 150 - event.target.value.length;
  }

  addNewInventoryItemFlag() {
    this.materialscriptService.material();
    if (this.searchClicked)
      this.inventorySearchReset();
    this.isAddButtonEnabled = true;
    this.isDeleteButtonEnabled = false;
    this.isResetButtonEnabled = true;
    this.isUpdateButtonEnabled = false;
    this.isSubmitted = false;
    this.items = "Add New Item";
    this.addForm.get('itemtype').enable();
    this.addForm.get('itemCode').enable();
    this.addForm.get('itemName').enable();
    this.addForm.reset();
    this.addForm.controls["itemtype"].setValue("");
    this.addForm.controls["protocol"].setValue("");
    this.addForm.controls["mounting"].setValue("");
    this.desclength = 150;
  }

  addInventoryReset() {
    this.addForm.get('itemtype').enable();
    this.addForm.get('itemCode').enable();
    this.addForm.get('itemName').enable();
    this.addForm.reset();
    this.addForm.controls["itemtype"].setValue("");
    this.addForm.controls["protocol"].setValue("");
    this.addForm.controls["mounting"].setValue("");
    this.desclength = 150;
    this.boolItemName = false;
    this.boolItemCode = false;
    this.ItemPriceLimit = false;
    this.ItemPrice = false;
    this.itemCodeMessage = "";
    this.itemNameMessage = "";
    this.itemPriceMessage = "";

  }

  cancelFormMethod() {
    this.isSubmitted = true;
    this.boolItemName = false;
    this.boolItemCode = false;
    this.ItemPriceLimit = false;
    this.itemCodeMessage = "";
    this.itemNameMessage = "";
    this.itemPriceMessage = "";

  }

  getInventoryDetailsData(strSearchFlag: string, pageNumber: number, userEvents: IUserEvents) {
    let itemRequest: IItemRequest = <IItemRequest>{};
    itemRequest.ItemName = '';
    itemRequest.UserId = this.context.customerContext.userId;
    itemRequest.LoginId = this.context.customerContext.loginId;
    itemRequest.User = this.context.customerContext.userName;
    itemRequest.SearchFlag = strSearchFlag;
    itemRequest.ActivitySource = ActivitySource.Internal.toString();
    itemRequest.PageNumber = pageNumber;
    itemRequest.PageSize = 10;
    itemRequest.SortColumn = this.sortingColumn;
    itemRequest.SortDirection = this.sortingDirection == true ? true : false;
    $('#pageloader').modal('show');
    this.inventoryService.getItemDetails(itemRequest, userEvents).subscribe(
      res => {
        $('#pageloader').modal('hide');
        if (res != null && res.length > 0) {
          this.itemResponse = res;
          this.totalRecordCount = this.itemResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
        else {
          this.itemResponse = res;
        }

      }, (err) => {
        $('#pageloader').modal('hide');
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  inventorySearchItemsClicked() {
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.inventorySearchItems(userEvents);
  }
  inventorySearchItems(userEvents: IUserEvents) {
    this.searchClicked = true;
    if (!this.searchForm.valid) {
      this.validateAllFormFields(this.searchForm);
      return;
    }
    let itemRequest: IItemRequest = <IItemRequest>{};
    itemRequest.ItemName = (this.searchForm.controls['searchItem'].value).trim();
    if ((this.searchForm.controls['searchItem'].value).trim().length > 0) {
      this.isSearch = true;
      $('#pageloader').modal('show');
      this.inventoryService.getItemDetails(itemRequest, userEvents).subscribe(
        res => {
          this.itemResponse = res;
          $('#pageloader').modal('hide');
        }, (err) => {
          $('#pageloader').modal('hide');
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
  }

  inventorySearchReset() {
    this.isSearch = false;
    this.searchClicked = false;
    this.p = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    this.getInventoryDetailsData("", this.p, null);
    this.searchForm.reset();

  }

  getInventoryItemTypes() {
    this.inventoryService.getInventryItemTypes().subscribe(res => {
      this.itemType = res;
    })
  }

  getInventoryProtocol() {
    this.inventoryService.getInventryProtocol().subscribe(res => {
      this.protocol = res;
    })
  }

  inventoryProtocolChange(lookUpTypeCode: string) {
    this.getInventoryMounting(lookUpTypeCode);
    this.addForm.controls['mounting'].setValue("");

  }

  getInventoryMounting(protocol: string) {
    this.inventoryService.getInventryMounting(protocol).subscribe(res => {
      if (res) {
        this.commonResponse = res;
      }
    }, (err) => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText.toString();
      this.msgTitle = '';
      return;
    });
  }

  getVendors() {
    this.inventoryService.getVendors().subscribe(res => {
      this.vendors = res;
    }, (err) => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText.toString();
      this.msgTitle = '';
      return;
    });
  }

  editVendorsByItemId(item) {
    this.totalCount = item.TotalCount;
    this.itemNameMessage = "";
    this.itemCodeMessage = "";
    this.itemPriceMessage = "";
    this.items = "Edit Item";
    this.isUpdateButtonEnabled = true;
    this.isAddButtonEnabled = false;
    this.isDeleteButtonEnabled = false;
    this.isResetButtonEnabled = false;
    this.isSubmitted = false;
    if (this.totalCount > 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Selected Item is being used, you can not update";
      this.msgTitle = '';
      this.isSubmitted = true;
      return;
    }
    this.itemId = item.ItemId;
    this.isDisabled = true;
    this.inventoryService.editVendorsByItemId(item.ItemId).subscribe(
      res => {
        this.inventoryEdit = res;
        let vendorArray: string[] = [];
        this.editResponse = this.itemResponse
        this.inventoryEdit.forEach(element => {
          vendorArray.push(element.VendorId.toString());
        });

        for (let editItem = 0; editItem < this.editResponse.length; editItem++) {
          if (this.editResponse[editItem].ItemId == item.ItemId) {
            this.editItemResponse = this.editResponse[editItem];
            this.editItemResponse.MinOrderLevel = this.inventoryEdit[0].MinOrderLevel;
            this.editItemResponse.MaxOrderLevel = this.inventoryEdit[0].MaxOrderLevel;
            this.editItemResponse.VendorId = this.inventoryEdit[0].VendorId;
            this.getInventoryMounting(this.editItemResponse.Protocol);
            this.addForm.patchValue({
              itemtype: this.editItemResponse.ItemTypeId,
              protocol: this.editItemResponse.Protocol,
              mounting: this.editItemResponse.Mounting,
              itemCode: this.editItemResponse.ItemCode,
              itemName: this.editItemResponse.ItemName,
              itemPrice: (this.editItemResponse.ItemPrice).toFixed(2),
              threshold: this.editItemResponse.ThresholdCount,
              minOrderQty: this.editItemResponse.MinOrderLevel,
              maxOrderQty: this.editItemResponse.MaxOrderLevel,
              description: this.editItemResponse.ItemDesc,
              vendorList: vendorArray
            });
            this.addForm.get('itemtype').disable();
            this.addForm.get('itemCode').disable();
            this.addForm.get('itemName').disable();
            this.materialscriptService.material();
          }
        }
        let description = this.addForm.get('description').value;
        this.desclength = 150 - description.length;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }
  deleteInventoryItemModel() {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to Delete Inventory Items ?";
    this.msgTitle = '';
  }

  deleteVendorsByItemId(item) {
    this.totalCount = item.TotalCount;
    this.itemNameMessage = "";
    this.itemCodeMessage = "";
    this.itemPriceMessage = "";
    this.isAddButtonEnabled = false;
    this.isResetButtonEnabled = false;
    this.isUpdateButtonEnabled = false;
    this.isDeleteButtonEnabled = true;
    this.isSubmitted = false;
    this.isDisabled = true;
    if (this.totalCount > 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Selected Item is being used, you can not delete";
      this.msgTitle = '';
      this.isSubmitted = true;
      return;
    }
    this.items = "Delete Item";
    this.itemId = item.ItemId;
    this.inventoryService.editVendorsByItemId(item.ItemId).subscribe(
      res => {
        this.inventoryEdit = res;
        let vendorArray: string[] = [];
        this.editResponse = this.itemResponse
        this.inventoryEdit.forEach(element => {
          vendorArray.push(element.VendorId.toString());
        });

        for (let editItemRes = 0; editItemRes < this.editResponse.length; editItemRes++) {
          if (this.editResponse[editItemRes].ItemId == item.ItemId) {
            this.editItemResponse = this.editResponse[editItemRes];
            this.editItemResponse.MinOrderLevel = this.inventoryEdit[0].MinOrderLevel;
            this.editItemResponse.MaxOrderLevel = this.inventoryEdit[0].MaxOrderLevel;
            this.editItemResponse.VendorId = this.inventoryEdit[0].VendorId;
            this.getInventoryMounting(this.editItemResponse.Protocol);
            this.addForm.patchValue({
              itemtype: this.editItemResponse.ItemTypeId,
              protocol: this.editItemResponse.Protocol,
              mounting: this.editItemResponse.Mounting,
              itemCode: this.editItemResponse.ItemCode,
              itemName: this.editItemResponse.ItemName,
              itemPrice: (this.editItemResponse.ItemPrice).toFixed(2),
              threshold: this.editItemResponse.ThresholdCount,
              minOrderQty: this.editItemResponse.MinOrderLevel,
              maxOrderQty: this.editItemResponse.MaxOrderLevel,
              description: this.editItemResponse.ItemDesc,
              vendorList: vendorArray
            });
            this.addForm.get('itemtype').disable();
            this.addForm.get('itemCode').disable();
            this.addForm.get('itemName').disable();
          }
        }
        let description = this.addForm.get('description').value;
        this.desclength = 150 - description.length;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  addInventoryItems() {
    if (this.boolItemName) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Item Name already exist.";
      this.msgTitle = '';
      return;
    }
    if (this.boolItemCode) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Item Code already exist.";
      this.msgTitle = '';
      return;
    }

    if (this.ItemPriceLimit) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = this.itemPriceMessage;
      this.msgTitle = '';
      return;
    }

    if (this.ItemPrice) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Item Price should not be zero.";
      this.msgTitle = '';
      return;
    }

    if (parseInt(this.addForm.controls["minOrderQty"].value) > parseInt(this.addForm.controls["maxOrderQty"].value)) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Minimum order quantity should be less than or equal to Maximum order quantity.";
      this.msgTitle = '';
      return;
    }

    if (((parseInt(this.addForm.controls["minOrderQty"].value) <= 0) || (parseInt(this.addForm.controls["maxOrderQty"].value) <= 0)) &&
      ((this.addForm.controls["minOrderQty"].value != "") && (this.addForm.controls["minOrderQty"].value != null)) &&
      ((this.addForm.controls["maxOrderQty"].value != "") && (this.addForm.controls["maxOrderQty"].value != null))) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Minimum and Maximum order quantity should be not be Zero";
      this.msgTitle = '';
      return;
    }
    else {
      if (this.addForm.valid) {
        let itemReqList = [];
        let itemRequest: IItemRequest = <IItemRequest>{};
        itemRequest.ItemTypeId = this.addForm.controls['itemtype'].value;
        itemRequest.Protocol = this.addForm.controls['protocol'].value;
        itemRequest.Mounting = this.addForm.controls['mounting'].value;
        itemRequest.ItemCode = this.addForm.controls['itemCode'].value;
        itemRequest.ItemName = this.addForm.controls['itemName'].value;
        itemRequest.ItemPrice = this.addForm.controls['itemPrice'].value;
        itemRequest.ThresholdCount = this.addForm.controls['threshold'].value;
        itemRequest.MinOrderLevel = this.addForm.controls['minOrderQty'].value;
        itemRequest.MaxOrderLevel = this.addForm.controls['maxOrderQty'].value;
        itemRequest.ItemDesc = this.addForm.controls['description'].value;
        itemRequest.UpdatedDate = new Date();
        itemRequest.UserId = this.context.customerContext.userId;
        itemRequest.LoginId = this.context.customerContext.loginId;
        itemRequest.ActivitySource = ActivitySource.Internal.toString();
        itemRequest.CreatedUser = this.context.customerContext.userName;
        let mySelectedValue: string[] = this.addForm.controls['vendorList'].value;
        for (let item = 0; item < mySelectedValue.length; item++) {
          let itemRequestList = <IItemRequest>{};
          itemRequestList.ItemTypeId = this.addForm.controls['itemtype'].value;
          itemRequestList.Protocol = this.addForm.controls['protocol'].value;
          itemRequestList.Mounting = this.addForm.controls['mounting'].value;
          itemRequestList.MinOrderLevel = this.addForm.controls['minOrderQty'].value;
          itemRequestList.MaxOrderLevel = this.addForm.controls['maxOrderQty'].value;
          itemRequestList.VendorId = parseInt(mySelectedValue[item].toString());
          itemRequestList.CreatedUser = this.context.customerContext.userName;
          itemReqList.push(itemRequestList);
        }
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.CREATE];
        $('#pageloader').modal('show');
        this.inventoryService.addVendorItems(itemRequest, itemReqList, userEvents).subscribe(
          res => {

            if (res > 0) {
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Item details has been added successfully.";
              this.msgTitle = '';
              this.getInventoryDetailsData("", this.p, null);
              $('#pageloader').modal('hide');
              this.addForm.reset();
            }
            else {
              $('#pageloader').modal('hide');
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Add Items Error while Adding Items.";
              this.msgTitle = '';
              this.addForm.reset();
            }
            this.isSubmitted = true;
          }, (err) => {
            $('#pageloader').modal('hide');
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();
            this.msgTitle = '';
            return;
          });
      }
      else {
        this.validateAllFormFields(this.addForm);
      }
    }
  }
  updateInventoryItems() {
    if (this.ItemPriceLimit) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = this.itemPriceMessage;
      this.msgTitle = '';
      return;
    }

    if (this.ItemPrice) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Item Price should not be zero.";
      this.msgTitle = '';
      return;
    }

    if (this.addForm.controls["minOrderQty"].value > this.addForm.controls["maxOrderQty"].value) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Minimum order quantity should be less than or equal to Maximum order quantity.";
      this.msgTitle = '';
      return;
    }

    if (this.addForm.controls["minOrderQty"].value <= 0 || this.addForm.controls["maxOrderQty"].value <= 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Minimum and Maximum order quantity should be not be Zero";
      this.msgTitle = '';
      return;
    }
    else {
      if (this.addForm.valid) {
        let itemReqList = [];
        let itemRequest: IItemRequest = <IItemRequest>{};
        itemRequest.ItemTypeId = this.addForm.controls['itemtype'].value;
        itemRequest.Protocol = this.addForm.controls['protocol'].value;
        itemRequest.Mounting = this.addForm.controls['mounting'].value;
        itemRequest.ItemCode = this.addForm.controls['itemCode'].value;
        itemRequest.ItemName = this.addForm.controls['itemName'].value;
        itemRequest.ItemPrice = this.addForm.controls['itemPrice'].value;
        itemRequest.ThresholdCount = this.addForm.controls['threshold'].value;
        itemRequest.MinOrderLevel = this.addForm.controls['minOrderQty'].value;
        itemRequest.MaxOrderLevel = this.addForm.controls['maxOrderQty'].value;
        itemRequest.ItemDesc = this.addForm.controls['description'].value;
        itemRequest.UpdatedDate = new Date();
        itemRequest.UserId = this.context.customerContext.userId;
        itemRequest.LoginId = this.context.customerContext.loginId;
        itemRequest.ActivitySource = ActivitySource.Internal.toString();
        itemRequest.CreatedUser = this.context.customerContext.userName;
        itemRequest.UpdatedUser = this.context.customerContext.userName;
        itemRequest.ItemId = this.itemId;
        let mySelectedValue: string[] = this.addForm.controls['vendorList'].value;
        for (let item = 0; item < mySelectedValue.length; item++) {
          let itemRequestList = <IItemRequest>{};
          itemRequestList.ItemTypeId = this.addForm.controls['itemtype'].value;
          itemRequestList.Protocol = this.addForm.controls['protocol'].value;
          itemRequestList.Mounting = this.addForm.controls['mounting'].value;
          itemRequestList.MinOrderLevel = this.addForm.controls['minOrderQty'].value;
          itemRequestList.MaxOrderLevel = this.addForm.controls['maxOrderQty'].value;
          itemRequestList.VendorId = parseInt(mySelectedValue[item].toString());
          itemRequestList.CreatedUser = this.context.customerContext.userName;
          itemRequestList.UpdatedUser = this.context.customerContext.userName;
          itemRequestList.ItemId = this.itemId;
          itemReqList.push(itemRequestList);
        }
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.UPDATE];
        $('#pageloader').modal('show');
        this.inventoryService.updateInventoryItems(itemRequest, itemReqList, userEvents).subscribe(
          res => {
            if (res > 0) {

              if (this.searchClicked && this.searchForm.valid) {
                this.inventorySearchItems(null);

              }
              else {
                this.getInventoryDetailsData("", this.p, null);
                this.searchForm.reset();
              }
              $('#pageloader').modal('hide');
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Item details has been updated successfully.";
              this.msgTitle = '';
            }

            else {
              $('#pageloader').modal('hide');
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Error while updating Item details, Try again";
              this.msgTitle = '';
            }
            this.isSubmitted = true;
          }, (err) => {
            $('#pageloader').modal('hide');
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();
            this.msgTitle = '';
            return;
          });
      };
    }
  }

  deleteItemsByItemId(event) {
    if (event) {
      let itemRequest: IItemRequest = <IItemRequest>{};
      itemRequest.UserId = this.context.customerContext.userId;
      itemRequest.LoginId = this.context.customerContext.loginId;
      itemRequest.ActivitySource = ActivitySource.Internal.toString();
      itemRequest.User = this.context.customerContext.userName;
      itemRequest.UpdatedUser = this.context.customerContext.userName;
      itemRequest.ItemId = this.itemId;
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.DELETE];
      this.inventoryService.deleteItemsByItemId(itemRequest, userEvents).subscribe(
        res => {
          if (res) {
            if (this.searchClicked && this.searchForm.valid) {
              this.inventorySearchItems(null);

            }
            else {
              this.getInventoryDetailsData("", this.p, null);
              this.searchForm.reset();
            }
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Item details has been deleted successfully.";
            this.msgTitle = '';
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error while deleting Item details, Try again";
            this.msgTitle = '';
          }
          this.isSubmitted = true;
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.msgFlag = false;
    }
  }


  checkInventoryItemName(event) {
    if (this.addForm.controls["itemName"].value != "" && this.addForm.controls["itemName"].value != null) {
      let itemName = this.addForm.controls['itemName'].value;
      this.inventoryService.checkInventoryItemName(itemName).subscribe(
        res => {
          if (res) {
            this.boolItemName = res;
            this.itemNameMessage = "Already Exists";
          }
          else {
            this.boolItemName = false;
            this.itemNameMessage = "";
          }
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.itemNameMessage = "";

    }
  }
  checkInventoryItemCode(event) {
    if (this.addForm.controls["itemCode"].value != "" && this.addForm.controls['itemCode'].value != null) {
      let itemCode = this.addForm.controls['itemCode'].value;
      this.inventoryService.checkInventoryItemCode(itemCode).subscribe(
        res => {
          if (res) {
            this.boolItemCode = res;
            this.itemCodeMessage = "Already Exists";
          }
          else {
            this.boolItemCode = false;
            this.itemCodeMessage = "";
          }
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.itemCodeMessage = "";

    }
  }
  checkInventoryItemPrice(event) {
    if (this.addForm.controls['itemPrice'].value != "" && this.addForm.controls['itemPrice'].value != null) {
      let itemPrice = (this.addForm.controls['itemPrice'].value);
      this.inventoryService.checkInventoryItemPrice("InventoryItemPrice").subscribe(
        res => {
          if (res) {
            if (itemPrice > parseInt(res)) {
              this.itemPriceMessage = "Item Price must not be more than " + parseInt(res) + ".";
              this.ItemPriceLimit = true
            }
            else if (itemPrice < 0) {
              this.itemPriceMessage = "Item Price should be Positive and greater than 0 .";

              this.ItemPrice = true
            }
            else {
              this.itemPriceMessage = "";
              this.ItemPriceLimit = false;
              this.ItemPrice = false
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
    else {
      this.itemPriceMessage = "";
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

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.INVENTORYITEMS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  sortDirection(SortingColumn) {
    this.gridArrowPROTOCOL = false;
    this.gridArrowMOUNTING = false;
    this.gridArrowITEMTYPEDESC = false;
    this.gridArrowITEMCODE = false;
    this.gridArrowITEMNAME = false;
    this.gridArrowITEMDESC = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "PROTOCOL") {
      this.gridArrowPROTOCOL = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "MOUNTING") {
      this.gridArrowMOUNTING = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ITEMTYPEDESC") {
      this.gridArrowITEMTYPEDESC = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ITEMCODE") {
      this.gridArrowITEMCODE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ITEMNAME") {
      this.gridArrowITEMNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ITEMDESC") {
      this.gridArrowITEMDESC = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    if (this.searchClicked && this.searchForm.valid) {
      this.inventorySearchItems(null);
    }
    else {
      this.getInventoryDetailsData("", this.p, null);
      this.searchForm.reset();
    }
  }
}

