import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { VehicleService } from './services/vehicle.services';
import { Http } from '@angular/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IVehicleRequest } from './models/vehiclecrequest';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { IUserresponse } from '../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { Features, Actions } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';

@Component({
  selector: 'app-bulkupload',
  templateUrl: './bulkupload.component.html',
  styleUrls: ['./bulkupload.component.scss']
})

export class BulkuploadComponent implements OnInit {
  UserInputs: any;

  @ViewChild('selectedFileEl') selectedFileEl;
  tempString: string = "UploadFile";
  uploadStatus: string;
  vehicleRequest: IVehicleRequest = <IVehicleRequest>{};
  isUploadDisabled: boolean = true;

  objICustomerContextResponse: ICustomerContextResponse;
  //User log in details 
  sessionContextResponse: IUserresponse

  @Output() uploadClicked: EventEmitter<string> =
  new EventEmitter<string>();
  // Form group 
  uploadVehicleForm: FormGroup;

  @Input() isCreateAccountbulklod: boolean;
  @Input() accountIDCreateAccount: number;

  vehicleTemplatePath: string;
  isbulkUploadAllowed: boolean;
  constructor(private vehicle: VehicleService, private http: Http
    , private customerContextService: CustomerContextService, private router: Router
    , private sessionService: SessionService,
    private commonService: CommonService
  ) {

    this.uploadVehicleForm = new FormGroup({
      'fileUpload': new FormControl(''),
    });
  }

  ngOnInit() {
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.assignTemplatePath();


    this.customerContextService.currentContext
      .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
      );

    if (this.isCreateAccountbulklod) {
      this.vehicleRequest.AccountId = this.accountIDCreateAccount;
    }
    else {
      if (this.objICustomerContextResponse == undefined) {
        // Go to advance search if no customer context
        let link = ['csc/search/advance-csc-search'];
        this.router.navigate(link);
        return;
      }
      else {
        console.log(this.objICustomerContextResponse.AccountId);
        this.vehicleRequest.LoginId = this.sessionContextResponse.loginId;
        this.vehicleRequest.UserId = this.objICustomerContextResponse.AccountId;
        this.vehicleRequest.UserName = this.sessionContextResponse.userName;
        this.vehicleRequest.AccountId = this.objICustomerContextResponse.AccountId;
        // if (this.objICustomerContextResponse.ParentId > 0)
        //   this.vehicleRequest.AccountId = this.objICustomerContextResponse.ParentId;
        // else
        this.vehicleRequest.AccountId = this.objICustomerContextResponse.AccountId;
      }
    }
  }
  uploadClick() {

    let formData = new FormData();
    formData.append(this.vehicleRequest.AccountId.toString() + "," +
      this.sessionContextResponse.loginId.toString() + "," + this.sessionContextResponse.userName.toString(),
      this.selectedFileEl.nativeElement.files[0]);
    this.vehicle.uploadVehicles(formData).subscribe(result => {
      if (result) {
        // this.uploadStatus = ;
        this.isUploadDisabled = true; this.uploadClicked.emit("1," + "Vehicles uploaded sucessfully");
      }
      else {
        // this.uploadStatus = " ";
        this.isUploadDisabled = true; this.uploadClicked.emit("2," + "Error while uploading vehicles");
      }
    },
      res => {
        this.isUploadDisabled = true; this.uploadClicked.emit("2," + res.statusText);
        //  this.uploadStatus = res.statusText;
      }
    );

  }
  fileUpload() {
    let fileName = this.selectedFileEl.nativeElement.files[0].name;
    fileName = fileName.substring(fileName.lastIndexOf('.'));
    if (fileName != ".xls") {
      this.isUploadDisabled = true; this.uploadClicked.emit("2," + "Allowed extension is '.xls'");
      return;
    }
    this.isUploadDisabled = false;
  }

  assignTemplatePath() {
    this.vehicle.getVehicleTemplate().subscribe(result => {
      if (result) {
        this.vehicleTemplatePath = result;
      }
      else {
        this.uploadClicked.emit("2," + "Error while getting vehicles template path ");
      }
    },
      res => {
        this.uploadClicked.emit("2," + res.statusText);
      }
    );

  }

  download() {
    window.open(this.vehicleTemplatePath);
  }

}
