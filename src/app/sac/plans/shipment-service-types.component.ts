import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { IPaging } from '../../shared/models/paging';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { DatePipe } from '@angular/common';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SubSystem, AccountStatus, ActivitySource, Features, Actions } from '../../shared/constants';
import { PlansService } from './services/plans.service';
import { IShipmentservicetypesresponse } from './models/shipmenttypesresponse';
import { IShipmentTypesRequest } from './models/shipmenttypesrequest';
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
 selector: 'app-shipment-service-types',
 templateUrl: './shipment-service-types.component.html',
 styleUrls: ['./shipment-service-types.component.scss']
})
export class ShipmentServiceTypesComponent implements OnInit {
 shipmentTypeBlock;
 shipmentTypeForm: FormGroup;
 paging: IPaging;
 boolSubmit: boolean = true;
 shipmentservicetypesrequest: IShipmentTypesRequest;
 shipmentservicetypesresponse: IShipmentservicetypesresponse[];
 shipmentDetailsReponse: IShipmentservicetypesresponse[];
 //Session and Customer Context objects
 sessionContextResponse: IUserresponse
 customerContextResponse: ICustomerContextResponse;
 validateNumberPattern = "[0-9]+([.][0-9]{1,2})*";
 //validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
 validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ \'-][a-zA-Z0-9]+)*";
 zeroPattren = "^[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*$"; //"(([1-9]|(0)*1)(\d{1,})?(\.\d{1,2})?|0\.(\d?[1-9]|[1-9]\d))$";
 pattren = "[0-9]+(\.[0-9][0-9]?)?";
 userEventRequest: IUserEvents = <IUserEvents>{};
 disableButton: boolean = false;
 disableUpdateButton: boolean = false;
 //validateExceptAnglePattern = "[^<>]*";

 p: number;
 pageItemNumber: number = 10;
 startItemNumber: number = 1;
 endItemNumber: number;
 totalRecordCount: number;
 descLength: number = 255;

 msgFlag: boolean;
 msgType: string;
 msgTitle: string;
 msgDesc: string;

 pageChanged(event) {
 this.p = event;
 this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
 this.endItemNumber = ((this.p) * this.pageItemNumber);
 if (this.endItemNumber > this.totalRecordCount)
 this.endItemNumber = this.totalRecordCount;
 let userevnts = null;
 this.getShipmentServiceTypes(this.p, userevnts);
 }

 constructor(private planService: PlansService, public renderer: Renderer, private router: Router, private customerContext: CustomerContextService,
 private context: SessionService, private commonService: CommonService, private materialscriptService: MaterialscriptService ) { }

 ngOnInit() {
 this.materialscriptService.material();
 if (!this.commonService.isAllowed(Features[Features.SHIPMENTTYPES], Actions[Actions.VIEW], "")) {

 }
 this.disableButton = !this.commonService.isAllowed(Features[Features.SHIPMENTTYPES], Actions[Actions.CREATE], "");
 this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.SHIPMENTTYPES], Actions[Actions.UPDATE], "");
 this.sessionContextResponse = this.context.customerContext;
 if (this.sessionContextResponse == null || this.sessionContextResponse == undefined) {
 let link = ['/'];
 this.router.navigate(link);
 };
 this.p = 1;
 this.endItemNumber=this.pageItemNumber;
 this.shipmentTypeForm = new FormGroup({
 'serviceTypeName': new FormControl('', [Validators.required, Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
 'serviceDescription': new FormControl('', [Validators.required, Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
 'cost': new FormControl('', [Validators.required, Validators.pattern(this.pattren), Validators.pattern(this.zeroPattren)]),
 'shipmentStatus': new FormControl('1', [Validators.required])
 });
 let userEvents = this.userEvents();
 this.getShipmentServiceTypes(this.p, userEvents);
 }

 //Get Shipment Service Types
 getShipmentServiceTypes(pageNumber: number, userEvent: IUserEvents) {
 this.shipmentservicetypesrequest = <IShipmentTypesRequest>{};
 this.shipmentservicetypesrequest.UserId = this.sessionContextResponse.userId;
 this.shipmentservicetypesrequest.LoginId = this.sessionContextResponse.loginId;
 this.shipmentservicetypesrequest.PerformedBy = this.sessionContextResponse.userName;
 this.shipmentservicetypesrequest.Operation = "VIEW";
 this.shipmentservicetypesrequest.PageNumber = pageNumber;
 this.shipmentservicetypesrequest.PageSize = this.pageItemNumber;
 this.shipmentservicetypesrequest.SortColumn = "SERVICETYPEID";
 this.shipmentservicetypesrequest.SortDir = 0;
 this.shipmentservicetypesrequest.ActivitySource = ActivitySource.Internal.toString();
 this.planService.getShipmentServiceTypes(this.shipmentservicetypesrequest, userEvent).subscribe(
 res => {
 this.shipmentservicetypesresponse = res;
 if (res != null && res.length > 0) {
 this.shipmentservicetypesresponse.forEach(element => {
 if (element.IsActive == true) {
 element.ShipmentStatus = "Active";
 }
 else {
 element.ShipmentStatus = "InActive";
 }
 })
 this.totalRecordCount = this.shipmentservicetypesresponse[0].RecordCount;
 if (this.totalRecordCount < this.pageItemNumber) {
 this.endItemNumber = this.totalRecordCount;
 }
 }
 },
 err => {
 this.msgType = 'error';
 this.msgFlag = true;
 this.msgDesc = err.statusText;
 this.msgTitle = '';
 });
 this.shipmentTypeBlock = false;
 }

 showHideaddShipmentType() {
     this.materialscriptService.material();
 this.shipmentTypeBlock = true;
 this.descLength = 255;
 this.shipmentservicetypesrequest.ServiceTypeId = 0;
 this.shipmentTypeForm.patchValue(
 {
 serviceTypeName: "",
 serviceDescription: "",
 cost: "",
 shipmentStatus: "1"
 }
 );
 }

 //method to store shipment service type
 saveShipmentServiceType() {
 if (this.shipmentTypeForm.valid) {
 this.shipmentservicetypesrequest = <IShipmentTypesRequest>{};
 this.shipmentservicetypesrequest.Operation = "ADD";
 this.storeValuesToRequestObject();
 let userEvents = this.userEvents();
 this.userEventRequest.ActionName = Actions[Actions.CREATE];
 this.planService.createShipmentServiceType(this.shipmentservicetypesrequest, userEvents).subscribe(
 res => {
 this.shipmentservicetypesresponse = res;
 if (res) {
 this.msgType = 'success';
 this.msgFlag = true;
 this.msgDesc = "Shipment Service Type Created Successfully";
 this.msgTitle = '';
 }
 this.descLength = 255;
 let userEvents = null;
 this.getShipmentServiceTypes(this.p, userEvents);
 },
 err => {
 this.msgType = 'error';
 this.msgFlag = true;
 this.msgDesc = err.statusText;
 this.msgTitle = '';
 });

 }
 else {
 this.validateAllFormFields(this.shipmentTypeForm);
 }
 }

 //Method to update service types
 updateShipmentServiceType(serviceID: number) {
 if (this.shipmentTypeForm.valid) {
 this.shipmentservicetypesrequest = <IShipmentTypesRequest>{};
 this.shipmentservicetypesrequest.Operation = "UPDATE";
 this.shipmentservicetypesrequest.ServiceTypeId = serviceID;
 this.storeValuesToRequestObject();
 let userEvents = this.userEvents();
 this.userEventRequest.ActionName = Actions[Actions.UPDATE];
 this.planService.updateShipmentServiceTypes(this.shipmentservicetypesrequest, userEvents).subscribe(
 res => {
 this.shipmentservicetypesresponse = res;
 if (res) {
 this.msgType = 'success';
 this.msgFlag = true;
 this.msgDesc = "Shipment Service Type Updated Successfully";
 this.msgTitle = '';
 }
 this.descLength = 255;
 let userEvents = null;
 this.getShipmentServiceTypes(this.p, userEvents);
 },
 err => {
 this.msgType = 'error';
 this.msgFlag = true;
 this.msgDesc = err.statusText;
 this.msgTitle = '';
 });

 }
 else {
 this.validateAllFormFields(this.shipmentTypeForm);
 }
 }

 storeValuesToRequestObject() {
 this.shipmentservicetypesrequest.UserId = this.sessionContextResponse.userId;
 this.shipmentservicetypesrequest.LoginId = this.sessionContextResponse.loginId;
 this.shipmentservicetypesrequest.PerformedBy = this.sessionContextResponse.userName;
 this.shipmentservicetypesrequest.PageNumber = this.p;
 this.shipmentservicetypesrequest.PageSize = this.pageItemNumber;
 this.shipmentservicetypesrequest.SortColumn = "SERVICETYPEID";
 this.shipmentservicetypesrequest.SortDir = 0;
 this.shipmentservicetypesrequest.ActivitySource = ActivitySource.Internal.toString();
 this.shipmentservicetypesrequest.ServiceDescription = this.shipmentTypeForm.value.serviceDescription;
 this.shipmentservicetypesrequest.ServiceTypeName = this.shipmentTypeForm.value.serviceTypeName;
 this.shipmentservicetypesrequest.Cost = this.shipmentTypeForm.value.cost;
 console.log(this.shipmentTypeForm.value.shipmentStatus);
 let isActiveStatus = this.shipmentTypeForm.value.shipmentStatus == '1' ? true : false;
 this.shipmentservicetypesrequest.IsActive = isActiveStatus;
 }

 //method to get shipment service details by service id
 assignFormValues(serviceID: number, serviceTypeName: string, serviceDescription: string, cost: number, shipmentStatus: string) {
 this.shipmentTypeBlock = true;
 this.shipmentservicetypesrequest = <IShipmentTypesRequest>{};
 this.shipmentservicetypesrequest.ServiceTypeId = serviceID;
 this.shipmentservicetypesrequest.ServiceTypeName = serviceTypeName;
 this.shipmentservicetypesrequest.ServiceDescription = serviceDescription;
 this.shipmentservicetypesrequest.Cost = cost;
 let isActiveStatus = shipmentStatus == 'Active' ? true : false;
 this.shipmentservicetypesrequest.IsActive = isActiveStatus;
 this.shipmentTypeForm.patchValue({
 serviceTypeName: serviceTypeName,
 serviceDescription: serviceDescription,
 cost: cost,
 shipmentStatus: isActiveStatus ? "1" : "0"
 });
 this.descLength = 255 - this.shipmentTypeForm.value.serviceDescription.length;
 this.materialscriptService.material();
 }

 // to show the how many characters are left for plan description
 descEvent(event: any) {
 this.descLength = 255 - event.target.value.length
 }

 //Clearning form variables
 resetForm() {
 this.shipmentTypeForm.reset();
 this.materialscriptService.material();
 let isActiveStatus = this.shipmentservicetypesrequest.IsActive;
 //this.closeMessage(0);
 this.shipmentTypeForm.patchValue({
 serviceTypeName: this.shipmentservicetypesrequest.ServiceTypeName,
 serviceDescription: this.shipmentservicetypesrequest.ServiceDescription,
 cost: this.shipmentservicetypesrequest.Cost,
 shipmentStatus: isActiveStatus ? "1" : "0"
 });
 this.descLength = 255 - this.shipmentTypeForm.value.serviceDescription.length;
 let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
 }

 resetAddForm() {

 this.shipmentTypeForm.reset();

 this.shipmentTypeForm.patchValue(
 {
 serviceTypeName: "",
 serviceDescription: "",
 cost: "",
 shipmentStatus: "1"
});

     this.materialscriptService.material();
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

 cancelClick() {
 this.shipmentTypeBlock = !this.shipmentTypeBlock;
 this.shipmentTypeForm.reset();

 this.shipmentTypeForm.controls["shipmentStatus"].setValue["1"];
  this.materialscriptService.material();
 }

 userEvents(): IUserEvents {
 this.userEventRequest.FeatureName = Features[Features.SHIPMENTTYPES];
 this.userEventRequest.ActionName = Actions[Actions.VIEW];
 this.userEventRequest.PageName = this.router.url;
 this.userEventRequest.CustomerId = 0;
 this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
 this.userEventRequest.UserName = this.sessionContextResponse.userName;
 this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
 return this.userEventRequest;
 }

 setOutputFlag(e) {
 this.msgFlag = e;
 }
}
