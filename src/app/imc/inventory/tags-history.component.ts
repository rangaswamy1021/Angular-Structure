import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ITagRequest } from "./models/tagrequest";
import { InventoryService } from "./services/inventory.service";
import { ITagResponse } from "./models/tagresponse";
import { DatePipe } from '@angular/common';
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions, SubFeatures } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";

@Component({
  selector: 'app-tags-history',
  templateUrl: './tags-history.component.html',
  styleUrls: ['./tags-history.component.scss']
})
export class TagsHistoryComponent implements OnInit {
  allowView: any;

  userEventRequest: IUserEvents = <IUserEvents>{}
  serialId: any;
  inventoryTracking = true;
  inventaryDetails = false;
  tagDetails = false;
  itemSearch: any[];
  responseTagHistory: ITagResponse[];
  itemName: string;
  itemStatus: string;
  location: string;
  po: string;
  shipment: number;
  serial: number;
  hexTag: number;
    sessionContextResponse: IUserresponse;
  constructor(private commonService: CommonService,private inventoryService: InventoryService, private _routerParameter: ActivatedRoute, private _routers: Router,private datePipe: DatePipe, private sessionContext: SessionService) { }

  pageItemNumber: number = 50;
  currentPage: number=1;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  
  
 pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.historyClick(this.serialId,this.currentPage,null);
  }


  ngOnInit() {
    this.serialId = this._routerParameter.snapshot.params["serialNumber"];
     this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._routers.navigate(link);
    }
     this.userEvents();
    this.allowView=this.commonService.isAllowed(Features[Features.INVENTORYTRACKING], Actions[Actions.VIEW], "");
     if(!this.allowView)
     {
        this._routers.navigate(['/404']);
     }
    this.historyClick(this.serialId,this.currentPage,null);

  }
 
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.INVENTORYTRACKING];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
   this.userEventRequest.SubFeatureName=SubFeatures[SubFeatures.TAGHISTORY]
    this.userEventRequest.PageName = this._routers.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  historyClick(serialNumber,currentPage:number,userevents:IUserEvents) {
    if(this.allowView)
    {
    this.inventoryTracking = false;
    this.inventaryDetails = false;
    this.tagDetails = true;
    let tagRequest: ITagRequest = <ITagRequest>{};
    tagRequest.SerialNumber = serialNumber;
    tagRequest.SortColumn = "INVSTATUSDATE";
    tagRequest.SortDirection = true;
    tagRequest.PageNumber = 1;
    tagRequest.PageSize = 10;

    let userevents=this.userEvents();
     if (this.inventoryService.goToBulkManage == true) {
      this.userEventRequest.FeatureName = Features[Features.BULKMANAGETAGS];
    }
    else {
       this.userEventRequest.FeatureName = Features[Features.INVENTORYTRACKING];
    }
    
    
     this.inventoryService.getTagHistory(tagRequest,userevents).subscribe(
      res => {
        this.responseTagHistory = res;
        console.log(this.responseTagHistory);
        this.totalRecordCount =this.responseTagHistory.length;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }

      }
    );
  }
  }
 
  backClick() {
    if (this.inventoryService.goToBulkManage == true) {
      this._routers.navigate(['imc/inventory/manage-bulk-tags']);
    }
    else {
      this._routers.navigate(['imc/inventory/inventory-tracking']);
    }
  }
}