import { Component, OnInit } from '@angular/core';
import { IItemRequest } from "./models/itemrequest";
import { InventoryService } from './services/inventory.service';
import { IItemResponse } from "./models/itemresponse";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ITagResponse } from "./models/tagresponse";
import { ITagRequest } from "./models/tagrequest";
import { ICSRRelationsRequest } from "../../shared/models/csrrelationsrequest";
import { CommonService } from "../../shared/services/common.service";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { List } from "linqts/dist/linq";
import { TagStatus } from "../constants";
import { DatePipe } from '@angular/common';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-inventory-tracking',
  templateUrl: './inventory-tracking.component.html',
  styleUrls: ['./inventory-tracking.component.scss']
})
export class InventoryTrackingComponent implements OnInit {
  gridArrowTAGSTATUS: boolean;
  gridArrowITEMNAME: boolean;
  gridArrowFULLNAME: boolean;
  gridArrowCustomerId: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowSerialNumber: boolean;
  allowView: boolean;
  userEventRequest: IUserEvents = <IUserEvents>{}
  disableManageButton: boolean;
  disableSearchButton: boolean;

  showrmaTextbox: boolean;


  searchResponse: ITagResponse[];
  itemResponse: IItemResponse[];
  itemResponseLocation: IItemResponse[];
  responseItemStatus: IItemResponse[];
  validatePatternRange = "[0-9]*";
  validatePattern = "^[-\s\/a-zA-Z0-9 ]+$";
  inventoryTrackingSearchForm: FormGroup;
  inventoryTrackingRMAForm: FormGroup;
  inventoryTracking = true;
  inventoryDetails: boolean = true;



  isManage: boolean;

  replacementVisible: boolean = false;

  getTagStatusbyMatrixResponse: ITagResponse[];
  tagStatus: string = "";
  internalUserResponse: boolean;
  updateResponse: ITagResponse[];
  updatedTagStatus: string;
  sessionContextResponse: IUserresponse;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  AfterSearch: boolean = false;
  customerId: number;
  getVehicleTagsResponse: number;
  index: number;
  userName: string;
  userId: number;
  loginId: number;
  icnId: number;
  //IsTagRequired: boolean = false;
  tagRequestSearch: ITagRequest = <ITagRequest>{};
  tagRequired: boolean;
  validateHexaPattern = "^[A-Fa-f0-9]+$";
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  noRecordsDisplay: boolean = false;
  currentDate: Date;
  currentDat: string;
  onlyNumberKey(event) {

    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
  }
  onlyHexaKey(event) {

    return (event.charCode == 8 || event.charCode == 0) ? null : (event.charCode >= 48 && event.charCode <= 57) || (event.charCode >= 97 && event.charCode <= 102) || (event.charCode >= 65 && event.charCode <= 70);
  }
  constructor(private inventoryService: InventoryService, private _routerParameter: ActivatedRoute, private _routers: Router, private commonService: CommonService, private sessionContext: SessionService, private datePipe: DatePipe, 
  private materialscriptService:MaterialscriptService) {
  }
  ngOnInit() {
    this.gridArrowSerialNumber = true;
    this.sortingColumn = "SerialNumber";
    this.materialscriptService.material();

    this.inventoryTrackingSearchForm = new FormGroup({
      'itemName': new FormControl('', Validators.required),
      'location': new FormControl(''),
      'itemStatus': new FormControl(''),
      'purchaseOrder': new FormControl('', Validators.compose([Validators.pattern(this.validatePattern)])),
      'serial': new FormControl('', Validators.compose([
        Validators.pattern(this.validatePatternRange)])),
      'hexTag': new FormControl('', Validators.compose([Validators.minLength(1),
      Validators.maxLength(16), Validators.pattern(this.validateHexaPattern)])),
      'shipment': new FormControl('', Validators.compose([
        Validators.pattern(this.validatePatternRange), Validators.minLength(1),
        Validators.maxLength(8)]))

    });
    this.inventoryTrackingRMAForm = new FormGroup({
      'rmaNumber': new FormControl('')
    });
  
    this.currentDate = new Date();

    this.currentDat = this.datePipe.transform(this.currentDate, 'yyyy-MM-ddThh:mm:ss');
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._routers.navigate(link);
    }
      this.allowView=this.commonService.isAllowed(Features[Features.INVENTORYTRACKING], Actions[Actions.VIEWDETAILS], "");

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.INVENTORYTRACKING], Actions[Actions.SEARCH], "");
    this.disableManageButton = !this.commonService.isAllowed(Features[Features.INVENTORYTRACKING], Actions[Actions.MANAGE], "");
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.icnId = this.sessionContextResponse.icnId;
    this.userEvents();
    this.getItemTagTypes();
    this.getItemLocation();
    this.getItemStatus();
    if (this.inventoryService.dataFromService != undefined)
      this.setData();
  }

  pageChanged(event) {

    this.currentPage = event;
    this.isManage = false;
    this.updatedTagStatus = "";
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    
    this.searchInventoryItems("",null);
  
  }
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.INVENTORYTRACKING];
    this.userEventRequest.ActionName = Actions[Actions.SEARCH];
    this.userEventRequest.PageName = this._routers.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  onSearchClick() {
   

    this.currentPage = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;

    this.inventoryTrackingSearchForm.controls["itemName"].setValidators(Validators.required);
    this.inventoryTrackingSearchForm.controls["itemName"].updateValueAndValidity();
 

    this.noRecordsDisplay = true;
    this.isManage = false;
    this.showrmaTextbox = false;
    if (this.inventoryTrackingSearchForm.invalid) {
      if ((this.inventoryTrackingSearchForm.controls['itemName'].value == "") && (this.inventoryTrackingSearchForm.controls['location'].value == "") &&
        (this.inventoryTrackingSearchForm.controls['itemStatus'].value == "") && (this.inventoryTrackingSearchForm.controls['purchaseOrder'].value == "") &&
        (this.inventoryTrackingSearchForm.controls['serial'].value == "") && (this.inventoryTrackingSearchForm.controls['hexTag'].value == "")
        && this.inventoryTrackingSearchForm.controls['shipment'].value == "") {

        this.noRecordsDisplay = false;
        this.validateAllFormFields(this.inventoryTrackingSearchForm);

      } else {
        this.inventoryTrackingSearchForm.controls["itemName"].clearValidators();
        this.inventoryTrackingSearchForm.controls["itemName"].setValue("");
   
        this.inventoryDetails = true;
        let userevents=this.userEvents();
       
        this.searchInventoryItems("SEARCH",userevents);
         
          
      }
    }
    else {

   
      this.inventoryDetails = true;
       let userevents=this.userEvents();
      
      this.searchInventoryItems("SEARCH",userevents);
     
    }
    
  }

  onResetClick() {
    this.noRecordsDisplay = false;
    this.isManage = false;
    this.showrmaTextbox = false;
    this.inventoryTrackingSearchForm.reset();
    this.inventoryTrackingSearchForm.controls["itemName"].setValidators(Validators.required);
    this.inventoryTrackingSearchForm.controls['itemName'].setValue("");
    this.inventoryTrackingSearchForm.controls['location'].setValue("");
    this.inventoryTrackingSearchForm.controls['itemStatus'].setValue("");
    this.inventoryTrackingSearchForm.controls['purchaseOrder'].setValue("");
    this.inventoryTrackingSearchForm.controls['serial'].setValue("");
    this.inventoryTrackingSearchForm.controls['hexTag'].setValue("");
    this.inventoryTrackingSearchForm.controls['shipment'].setValue("");
   
    this.inventoryDetails = false;
  }

  historyClick(serialNumber) {
    this.inventoryService.dataFromService = this.tagRequestSearch;
    this._routers.navigate(['imc/inventory/tags-history/' + serialNumber]);
    this.inventoryService.goToBulkManage = false;
  }

  getItemTagTypes() {
    let itemRequest: IItemRequest = <IItemRequest>{};
   let userevents=this.userEvents();
        userevents.ActionName=Actions[Actions.VIEW];
        
    this.inventoryService.getItemsTagTypes(itemRequest,userevents).subscribe(
      res => {
        this.itemResponse = res;
      }
    );
  


  }

  getItemLocation() {
    let itemRequest: IItemRequest = <IItemRequest>{};
    this.inventoryService.getInventoryLocations(itemRequest).subscribe(
      res => {
        this.itemResponseLocation = res;
      }
    );
  }

  getItemStatus() {
    let itemRequest: IItemRequest = <IItemRequest>{};
    this.inventoryService.getAllStatus(itemRequest).subscribe(
      res => {
        this.responseItemStatus = res;
      }
    );
  }

  searchInventoryItems(type:any,userevents:IUserEvents) {
    if(type=="SEARCH"){

    this.tagRequestSearch.ItemCode = this.inventoryTrackingSearchForm.controls['itemName'].value;
     this.tagRequestSearch.TagStatus = this.inventoryTrackingSearchForm.controls['itemStatus'].value;
    this.tagRequestSearch.SerialNumber = this.inventoryTrackingSearchForm.controls['serial'].value;
    this.tagRequestSearch.HexTagNumber = this.inventoryTrackingSearchForm.controls['hexTag'].value;
    this.tagRequestSearch.TagLocation = this.inventoryTrackingSearchForm.controls['location'].value;
    this.tagRequestSearch.ShipmentId = this.inventoryTrackingSearchForm.controls['shipment'].value;
    this.tagRequestSearch.PurchaseOrderNumber = this.inventoryTrackingSearchForm.controls['purchaseOrder'].value;
    if (this.tagRequestSearch.PurchaseOrderNumber != null && this.tagRequestSearch.PurchaseOrderNumber != "")
      this.tagRequestSearch.PurchaseOrderNumber = this.inventoryTrackingSearchForm.controls['purchaseOrder'].value.trim();
    }
    this.tagRequestSearch.UserId = this.userId;
    this.tagRequestSearch.LoginId = this.loginId;
    this.tagRequestSearch.UserName = this.userName;
    this.tagRequestSearch.ActivitySource = ActivitySource.Internal.toString();
    this.tagRequestSearch.PageNumber = this.currentPage;
    this.tagRequestSearch.PageSize = this.pageItemNumber;
    this.tagRequestSearch.SortColumn = this.sortingColumn;
    this.tagRequestSearch.SortDirection = this.sortingDirection;
   

    this.tagRequestSearch.IsSearch = true;
   
   

    this.inventoryService.searchInventoryItems(this.tagRequestSearch, userevents).subscribe(
      res => {
       this.searchResponse = res;
       console.log("response", this.searchResponse);

        if (res.length > 0) {

          this.AfterSearch = true;
          this.totalRecordCount = this.searchResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount
          }

        }
      },
      (err) => {
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       }
    );
    
  }

  setData() {
    this.inventoryTrackingSearchForm.controls['itemName'].setValue(this.inventoryService.dataFromService.ItemCode);
    this.inventoryTrackingSearchForm.controls['location'].setValue(this.inventoryService.dataFromService.TagLocation);
    this.inventoryTrackingSearchForm.controls['itemStatus'].setValue(this.inventoryService.dataFromService.TagStatus);
    this.inventoryTrackingSearchForm.controls['purchaseOrder'].setValue(this.inventoryService.dataFromService.PurchaseOrderNumber);
    this.inventoryTrackingSearchForm.controls['serial'].setValue(this.inventoryService.dataFromService.SerialNumber);
    this.inventoryTrackingSearchForm.controls['hexTag'].setValue(this.inventoryService.dataFromService.HexTagNumber);
    this.inventoryTrackingSearchForm.controls['shipment'].setValue(this.inventoryService.dataFromService.ShipmentId);
   
    this.searchInventoryItems("SEARCH",null);
  }

  onManageClick(searchRes, index) {

 
    let internalUserVerify: ITagRequest = <ITagRequest>{};
    var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
    csrRelationReq.CustomerIds = searchRes.CustomerId;
    csrRelationReq.VehicleNumbers = "";
    csrRelationReq.TagIds = searchRes.SerialNumber;
    csrRelationReq.InternalUserId = this.userId;
    this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
      this.internalUserResponse = res;
      if (res) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Access Denied. You do not have privileges to access Serial Number " + csrRelationReq.TagIds;
             this.msgTitle='';
      
        return true;
      }
    },
      (err) => {
       
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       
       }
      , () => {
      });
    if (!(this.internalUserResponse)) {
      if (this.sessionContextResponse.icnId <= 0) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "ICN not assigned";
             this.msgTitle='';
        
        return true;
      }
      else if (this.isManage) {
        
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Manage not allowed for multiple tags";
             this.msgTitle='';
  
        return true;
       
      }
      else {
        this.onRowBound(searchRes, index);
      }
    }
  }

  onRowBound(searchRes, index) {
    let tagStatus = searchRes.TagStatus;
    if (tagStatus.toUpperCase() == TagStatus[TagStatus.InventoryNew].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.InventoryRetailer].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.DestroyedDisposal].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.DestroyedObsolete].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.VendorReturn].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.Shipped].toUpperCase() || tagStatus == TagStatus[TagStatus.Shipped] || tagStatus.toUpperCase() == TagStatus[TagStatus.Expired].toUpperCase()) {
      searchRes.CustomerId = 0;
      searchRes.CustomerName = "N/A";
      this.searchResponse[index].isSelected = false;
      this.isManage = false;
      return true;
    }
    if (tagStatus.toUpperCase() == TagStatus[TagStatus.InventoryRecycled].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDefective].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDamaged].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedGood].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDamaged].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDefective].toUpperCase()) {
      searchRes.CustomerId = 0;
      this.dropdownManage(searchRes, index);
      this.inventoryService.getVehicleTags('IsVehicleTags').subscribe(
        res => {
          this.getVehicleTagsResponse = res;
        },
        (err) => {
         
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       
         }
        , () => {
          if (this.getVehicleTagsResponse == 1) {
            if (!(tagStatus.toUpperCase() == TagStatus[TagStatus.Assigned].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDamaged].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.ShippedDefective].toUpperCase() || tagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase())) {

              this.searchResponse[index].isSelected = false;
              this.isManage = false;
            }
          }
          else {
            if (tagStatus.toUpperCase() == TagStatus[TagStatus.TagInactive].toUpperCase()) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Transponder can not be managed";
             this.msgTitle='';
            
              this.searchResponse[index].isSelected = false;
              this.isManage = false;
            }
          }
        });
    }
    else {
      this.dropdownManage(searchRes, index);
    }
  }

  dropdownManage(searchRes, index) {
    this.isManage = false;
    this.searchResponse[index].isSelected = true;
    this.inventoryService.getVehicleTags('IsVehicleTags').subscribe(
      res => {
        this.getVehicleTagsResponse = res;
      },
      (err) => {
     
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       
       }
      , () => {
        this.inventoryService.getTagStatusbyMatrix(searchRes.TagStatus)
          .subscribe(res => {
            if (res) {
              this.getTagStatusbyMatrixResponse = res;
              if (this.getTagStatusbyMatrixResponse != null) {
                if (!(this.getVehicleTagsResponse == 1)) {
                  if (!(searchRes.TagStatus.toUpperCase() == TagStatus[TagStatus.Lost].toUpperCase()) && !(searchRes.TagStatus.toUpperCase() == TagStatus[TagStatus.Stolen].toUpperCase())) {
                    if (searchRes.TagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDefective].toUpperCase() && searchRes.WarrantyEndDate > this.currentDat) {
                      let list = new List<ITagResponse>(this.newFunction());
                   
                      this.getTagStatusbyMatrixResponse = this.getTagStatusbyMatrixResponse.filter(x => x.ColumnName != TagStatus[TagStatus.DestroyedObsolete].toUpperCase());
                     
                    }
                    else if (searchRes.TagStatus.toUpperCase() == TagStatus[TagStatus.ReturnedDefective].toUpperCase() && searchRes.WarrantyEndDate < this.currentDat) {
                      let list = new List<ITagResponse>(this.newFunction());
                      this.getTagStatusbyMatrixResponse = this.getTagStatusbyMatrixResponse.filter(x => x.ColumnName != TagStatus[TagStatus.VendorReturn].toUpperCase());
                    
                    }
                  }
                  else {
                    for (var i = 0; i < this.getTagStatusbyMatrixResponse.length; i++) {
                      if (this.getTagStatusbyMatrixResponse[i].ColumnName == TagStatus[TagStatus.Assigned].toUpperCase()) {
                        this.getTagStatusbyMatrixResponse[i].ColumnName = TagStatus[TagStatus.Found].toUpperCase();
                      }
                    }

                  }
                }
                else {
                  if (searchRes.TagStatus == TagStatus[TagStatus.Assigned].toUpperCase() || searchRes.TagStatus == TagStatus[TagStatus.ShippedDamaged].toUpperCase() || searchRes.TagStatus == TagStatus[TagStatus.ShippedDefective].toUpperCase() || searchRes.TagStatus == TagStatus[TagStatus.TagInactive].toUpperCase()) {
                    this.getTagStatusbyMatrixResponse = this.getTagStatusbyMatrixResponse.filter(x => x.ColumnName.replace(TagStatus[TagStatus.Returned].toUpperCase(), TagStatus[TagStatus.ReturnedDamaged].toUpperCase()));
                   
                  }
                }
              }
              this.isManage = true;
            }
          }
          , (err) => { }
          , () => {
            if (searchRes.CustomerId != null) {
              this.inventoryService.getPlanDetail(searchRes.CustomerId)
                .subscribe(res => {
                  if (res) {
                    this.tagRequired = res[0].IsTagRequired;
                  }
                  if (!this.tagRequired) {
                    this.getTagStatusbyMatrixResponse = this.getTagStatusbyMatrixResponse.filter(x => x.ColumnName != TagStatus[TagStatus.Found].toUpperCase());
                    
                  }
                },
                (err) => {
          
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
       });
            }
          });
      });
    return;
  }

  onCancelClick(searchRes, index) {

   
    this.replacementVisible = false;
    this.isManage = false;
    this.showrmaTextbox = false;
    this.searchResponse[index].isSelected = false;
  }

  dropdownselectedValue(tag) {
    this.updatedTagStatus = tag;
    this.inventoryTrackingRMAForm.controls['rmaNumber'].setValue("");
    if (this.updatedTagStatus == TagStatus[TagStatus.VendorReturn].toUpperCase()) {
      this.showrmaTextbox = true;
    }

  }


  updateTagStatus(searchRes, index) {
 
    if (this.updatedTagStatus == null || this.updatedTagStatus == "") {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc ="Select status";
             this.msgTitle='';
     
    }
    else {


      if (this.updatedTagStatus.toUpperCase() == TagStatus[TagStatus.Found].toUpperCase()) {
        this.updatedTagStatus = TagStatus[TagStatus.Assigned].toUpperCase();
      }
      var tagUpdate = <ITagRequest>{};
      tagUpdate.CustomerId = searchRes.CustomerId;
      tagUpdate.TagStatus = this.updatedTagStatus;
      tagUpdate.CustomerId = searchRes.CustomerId;
      this.customerId = searchRes.CustomerId;
      tagUpdate.TagType = searchRes.TagType;
      tagUpdate.SerialNumber = searchRes.SerialNumber;
      tagUpdate.UserName = this.userName;
      tagUpdate.CustTagReqId = searchRes.CustTagReqId;

      tagUpdate.EndEffectiveDate = new Date();
      tagUpdate.PreviousTagStatus = searchRes.TagStatus;
      tagUpdate.TagLocation = "Inventory";
      tagUpdate.StatusDate = new Date();
      tagUpdate.WarrantyEndDate = searchRes.WarrantyEndDate;
      tagUpdate.ICNId = this.icnId;
      tagUpdate.UserId = this.userId;
      tagUpdate.LoginId = this.loginId;
      tagUpdate.SubSystem = "IMC";
      tagUpdate.RMANumber = this.inventoryTrackingRMAForm.controls['rmaNumber'].value.toString();
 
      let userevents=this.userEvents();
      userevents.ActionName=Actions[Actions.MANAGE];
       userevents.CustomerId=searchRes.CustomerId;
      $('#pageloader').modal('show');
      this.inventoryService.updateStatus(tagUpdate, userevents).subscribe(res => {

        this.updateResponse = res;
        if (this.updateResponse) {
           $('#pageloader').modal('hide');
 this.msgType = 'success';

              this.msgFlag = true;
              this.msgDesc ="Tag Status has been updated successfully.";
                 this.msgTitle='';
            
     
          this.searchInventoryItems("SEARCH",userevents);
          this.updatedTagStatus = "";
          this.isManage = false;
          this.showrmaTextbox = false;
        }
        else {
           $('#pageloader').modal('hide');
 this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc ="Error while update tagstatus";
             this.msgTitle='';
        
          this.replacementVisible = false;
          this.isManage = false;
          this.updatedTagStatus = "";
          this.showrmaTextbox = false;
          this.searchResponse[index].isSelected = false;


        }

      },
        (err) => {
 $('#pageloader').modal('hide');
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc =err.statusText.toString();
           this.msgTitle='';
       
          this.replacementVisible = false;
          this.updatedTagStatus = "";
          this.isManage = false;
          this.searchResponse[index].isSelected = false;
          this.showrmaTextbox = false;

        },
        () => {
        });
     
    }
  }

  private newFunction(): any {
    return this.getTagStatusbyMatrixResponse;
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

   setOutputFlag(e) {
    this.msgFlag = e;
  }

  sortDirection(SortingColumn) {
    this.gridArrowSerialNumber = false;
    this.gridArrowCustomerId = false;
    this.gridArrowFULLNAME = false;
    this.gridArrowITEMNAME = false;
    this.gridArrowTAGSTATUS = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "SerialNumber") {
      this.gridArrowSerialNumber = true;
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
    
    else if (this.sortingColumn == "ITEMNAME") {
      this.gridArrowITEMNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
    else if (this.sortingColumn == "TAGSTATUS") {
      this.gridArrowTAGSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
    this.searchInventoryItems("",null);
  }


}