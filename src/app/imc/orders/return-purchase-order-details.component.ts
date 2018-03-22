import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { OrdersService } from './services/orders.service';
import { CommonService } from "../../shared/services/common.service";
import { DocumentdetailsService } from "../../csc/documents/services/documents.details.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { LookupTypeCodes, ActivitySource, Features, Actions } from "../../shared/constants";
import { IPurchaseOrderSearchResponse } from "./models/purchaseorderseacrhresponse";
import { IPurchaseOrderSearchRequest } from "./models/purchaseorderseacrhrequest";
import { IWarrantRequest } from "../warranty/models/warrantyrequest";
import { IWarrantyResponse } from "../warranty/models/warrantyresponse";
import { WarrantyService } from "../warranty/services/warranty.service";
import { ContractService } from "../contract/services/contract.service";
import { IPurchaseOrderDetailRequest } from "./models/purchaseorderdetailsrequest";
import { SessionService } from "../../shared/services/session.service";
import { IPurchaseOrderDetailResponse } from "./models/purchaseorderdetailsresponse";
import { IPurchaseOrderItemResponse } from "./models/purchaseorderitemresponse";
import { IUserEvents } from "../../shared/models/userevents";

@Component({
  selector: 'app-return-purchase-order-details',
  templateUrl: './return-purchase-order-details.component.html',
  styleUrls: ['./return-purchase-order-details.component.scss']
})

export class ReturnPurchaseOrderDetailsComponent implements OnInit {
  
  itemDetailsResponseView: IPurchaseOrderItemResponse[];
  itemDetailsRequest: IPurchaseOrderDetailRequest = <IPurchaseOrderDetailRequest>{};
  itemDetailsResponse: IPurchaseOrderDetailResponse = <IPurchaseOrderDetailResponse>{};
  purchaseOrder: IPurchaseOrderSearchResponse;
  itemDetails: IPurchaseOrderItemResponse[];
  itemDetailsResponseList: IPurchaseOrderSearchResponse[] = [];
   // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  constructor(private router: Router,
   private ordersService: OrdersService,
   private sessionContext: SessionService
  ) { }

  ngOnInit() {
    this.purchaseOrder = this.ordersService.dataReturnFromService();
     let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PURCHASEORDERDETAILS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName =this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;
    this.getPurchaseOrderDetailstoGrid(userEvents);
  }

  navigateToReturnPurchaseOrder() {
    this.router.navigate(['imc/orders/return-purchase-order']);
  }

  getPurchaseOrderDetailstoGrid(userEvents) {
    this.itemDetailsRequest.PurchaseOrderId = this.purchaseOrder.PurchaseOrderId;
    this.itemDetailsRequest.VendorId = this.purchaseOrder.VendorId;
    this.itemDetailsRequest.User = this.sessionContext.customerContext.userName;
    this.itemDetailsRequest.UserId = this.sessionContext.customerContext.userId;
    this.itemDetailsRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.itemDetailsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.ordersService.getReturnPurchaseOrderDetailstoGrid(this.itemDetailsRequest,userEvents).subscribe(
      res => {       
        this.itemDetailsResponse = res;
      
        if (this.itemDetailsResponse.PurchaseOrderLineItems!=null) {
          this.itemDetails = this.itemDetailsResponse.PurchaseOrderLineItems;
        }
         
      },
      (err) => {
         this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
