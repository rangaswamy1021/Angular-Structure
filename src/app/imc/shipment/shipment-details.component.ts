import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ShipmentService } from "./services/shipment.service";
import { IItemDetailsRequest } from "./models/itemdetailsrequest";
import { IItemtDetailsResponse } from "./models/itemdetailsresponse";
import { IVendorResponse } from "../vendor/models/venodrresponse";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, AddressTypes, Features, Actions, SubFeatures } from "../../shared/constants";
import { IvendorRequest } from "../vendor/models/vendorrequest";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";


@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss']
})
export class ShipmentDetailsComponent implements OnInit {
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  ShipmentStatus: string;
  addressDataNotFound: string;
  vendorId: any;
  userEventRequest: IUserEvents = <IUserEvents>{};
  shipmentResponse: IItemtDetailsResponse[];
  itemDetailsRequest: IItemDetailsRequest = <IItemDetailsRequest>{};
  itemDetailsResponse: IItemtDetailsResponse[];
  shipmentDetailsRequest: IvendorRequest = <IvendorRequest>{};
  shipmentDetailsResponse: IVendorResponse[];
  sessionContextResponse: IUserresponse;

  constructor(private router: Router,
    private shipmentService: ShipmentService,
    private commonService: CommonService,
    private sessionContext: SessionService,
    private context: SessionService) { }

  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getItemDetailsByShipmentId(this.p, null);
  }

  ngOnInit() {
    this.p = 1;
    this.endItemNumber = 10;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.getShipmentDetails();
    let userevents = this.userEvents();
    this.getItemDetailsByShipmentId(this.p, userevents);
  }

  backMethod() {
    this.router.navigateByUrl("imc/shipment/shipment-search");
  }

  getShipmentDetails() {
    let shipmentId = this.shipmentService.dataFromService;
    this.shipmentService.getShipmentDetails(shipmentId).subscribe(
      shipRes => {
        this.shipmentResponse = shipRes;
        let response = shipRes[0];
        this.vendorId = response.VendorID;
        this.getVendorDetailsByVendorId();
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      }
    );
  }

  getStatus(id) {

    if (id == 1) {
      this.ShipmentStatus = "ShipPartial";
    }
    if (id == 2) {
      this.ShipmentStatus = "ShippedFull";
    }
    return this.ShipmentStatus;
  }

  //Vendor address Details
  getVendorDetailsByVendorId() {
    this.shipmentDetailsRequest.VendorId = this.vendorId;
    this.shipmentDetailsRequest.AddressType = AddressTypes[AddressTypes.Business];
    this.shipmentService.getAddressTypeByVendorId(this.shipmentDetailsRequest.VendorId, this.shipmentDetailsRequest.AddressType).subscribe(
      res => {
        this.shipmentDetailsResponse = res;
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      });
  }


  //Items Grid
  getItemDetailsByShipmentId(pageNumber: number, userevents) {
    this.itemDetailsRequest.ShipmentID = this.shipmentService.dataFromService;
    this.itemDetailsRequest.PageNumber = this.p;
    this.itemDetailsRequest.PageSize = 10;
    this.itemDetailsRequest.SortColumn = "SERIALNO";
    this.itemDetailsRequest.SortDirection = 1;
    this.itemDetailsRequest.User = this.context.customerContext.userName;
    this.itemDetailsRequest.UserId = this.context.customerContext.userId;
    this.itemDetailsRequest.LoginId = this.context.customerContext.loginId;
    this.itemDetailsRequest.ActivitySource = ActivitySource.Internal.toString();
    // this.itemDetailsRequest.OnSearchClick = true;
    this.itemDetailsRequest.OnPageLoad = true;




    this.shipmentService.getItemDetailsByShipmentId(this.itemDetailsRequest, userevents).subscribe(
      res => {
        this.itemDetailsResponse = res;
        this.totalRecordCount = this.itemDetailsResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;

        }

      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      }
    );

  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.SHIPMENT];
    this.userEventRequest.SubFeatureName = SubFeatures[SubFeatures.SHIPMENTDETAILS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
}



