import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
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
import { IUserresponse } from "../../shared/models/userresponse";

@Component({
  selector: 'app-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  errorMsgAttachment: any;
  isDanger: boolean;
  itemDetailsResponseView: IPurchaseOrderItemResponse[];

  
  itemDetailsRequest: IPurchaseOrderDetailRequest = <IPurchaseOrderDetailRequest>{};
  itemDetailsResponse: IPurchaseOrderDetailResponse = <IPurchaseOrderDetailResponse>{};

  purchaseOrder: IPurchaseOrderSearchResponse;
  itemDetails:IPurchaseOrderItemResponse[];
 
  // success and error block
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;

  itemDetailsResponseList: IPurchaseOrderSearchResponse[] = [];
  constructor(private router: Router, 
  private ordersService: OrdersService, 
  private sessionContext: SessionService) {
 }

  ngOnInit() {
    this.purchaseOrder = this.ordersService.dataFromService();
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
     userEvents.FeatureName = Features[Features.PURCHASEORDERDETAILS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.getPurchaseOrderDetailstoGrid(userEvents);

  }

  navigateToPurchaseOrderSearch() {
    this.router.navigate(['imc/orders/purchase-order-search']);
  }

  getPurchaseOrderDetailstoGrid(userEvents) {

    this.itemDetailsRequest.PurchaseOrderId = this.purchaseOrder.PurchaseOrderId;      
    this.itemDetailsRequest.VendorId = this.purchaseOrder.VendorId;            
    this.itemDetailsRequest.User = this.sessionContext.customerContext.userName;
    this.itemDetailsRequest.UserId = this.sessionContext.customerContext.userId;
    this.itemDetailsRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.itemDetailsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];

    this.ordersService.getPurchaseOrderDetailstoGrid(this.itemDetailsRequest,userEvents).subscribe(
      res => {      
        this.itemDetailsResponse = res;
        if(this.itemDetailsResponse.PurchaseOrderLineItems!=null){
            this.itemDetails=this.itemDetailsResponse.PurchaseOrderLineItems;
        }

      },
      (err) => {
                   this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc =  err.statusText.toString();
          this.msgTitle = '';
       
        return;
      });
  }


 setOutputFlag(e) {
        this.msgFlag = e;
    }



}