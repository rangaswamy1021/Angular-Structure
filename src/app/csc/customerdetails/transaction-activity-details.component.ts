import { MaterialscriptService } from './../../shared/materialscript.service';
import { IUserEvents } from './../../shared/models/userevents';
import { AccountInfoComponent } from '../../shared/accountprimaryinfo/account-info.component';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, } from 'ngx-gallery';
import { environment } from './../../../environments/environment';
import { Component, ElementRef, OnInit, Renderer, Renderer2, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Observable } from 'rxjs';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { IPaymentHistoryDetailsRequest } from './models/PaymentHistoryDetailsRequest';
import { ISearchPaymentResponse } from './models/SearchPaymentResponse';
import { CustomerDetailsService } from './services/customerdetails.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ITripRequest } from './models/TripRequest';
import { ITripResponse } from './models/TripResponse';


import { CommonService } from './../../shared/services/common.service';
import { AccountStatus } from './../../payment/constants';

import {
  Actions,
  ActivitySource,
  AdjustmentCategory,
  Adjustments,
  ApplicationTransactionTypes,
  Features,
  RevenueCategory,
  SubSystem,
  TollType,
} from '../../shared/constants';

import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IRequestTranscationAdjustment } from './models/transcationadjustments';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';

import { ITripHistoryResponse } from './models/TripStatusHistoryResponse';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';

import { TripsContextService } from "../../shared/services/trips.context.service";
import { DebugContext } from '@angular/core/src/view';


declare var $: any;

@Component({
  selector: 'app-transaction-activity-details',
  templateUrl: './transaction-activity-details.component.html',
  styleUrls: ['./transaction-activity-details.component.scss']
})
export class TransactionActivityDetailsComponent implements OnInit {
  ITriphistorys: ITripHistoryResponse;
  systemActivity: any;
  imagePaths: any;
  marginTop: number;
  brightIndex: number = 1;
  // lngCustomerTripId: any;
  zoomIndex = 1;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  validateNumberPattern = "[0-9]+(\.[0-9][0-9]?)?";
  @ViewChild(AccountInfoComponent) accountInfo;
  constructor(private formBuilder: FormBuilder, private customerService: CustomerDetailsService, private renderer2: Renderer2, private router: Router, private sessionContext: SessionService, private customerContext: CustomerContextService, private customerDetailsService: CustomerDetailsService, private tripsContextService: TripsContextService, private materialscriptService: MaterialscriptService ) { }

  // constructor(private customerService: CustomerDetailsService, private router: Router, private sessionContext: SessionService, private customerContext: CustomerContextService,private customerDetailsService:CustomerDetailsService, private tripsContextService: TripsContextService) { }

  paymentHistoryDetailsRequest: IPaymentHistoryDetailsRequest = <IPaymentHistoryDetailsRequest>{};
  searchPaymentResponse: ISearchPaymentResponse[] = <ISearchPaymentResponse[]>[];
  iSystemActivities: ISystemActivities = <ISystemActivities>{};
  transactionActivitySearchForm: FormGroup;
  iTripresponse: ITripResponse = <ITripResponse>{};
  PageSize: number = 10;
  Itrip: ITripRequest = <ITripRequest>{};

  ITriphistory: ITripHistoryResponse = <ITripHistoryResponse>{};
  transactionHistoryForm: FormGroup;
  successBlock: boolean = false;
  successHeading: string;
  successMessage: string;
  errorBlock: boolean = false;
  errorHeading: string;
  errorMessage: string;
  popupHeading: string;
  popupMessage: string;
  longAccountId: number;
  dataLength: number;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  ActivitySource: string = 'internal';
  pageNumber: number = 1;
  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  activityPopUp: boolean = false;
  messagePopup: any;
  message: any;
  transcationadjustment: IRequestTranscationAdjustment = <IRequestTranscationAdjustment>{};
  tripContext: ITripsContextResponse;
  log = '';
  adjustmentCategory: string = '';
  form_control: FormGroup;
  reasonCodes: any[];
  accountAdjustments: any;
  customerStatus: string = '';
  customerParentPlan: string = '';
  customerTripId: any;
  vehiclenumber: any;
  icnId: number = 0;

  failureMessage: string;

  @ViewChild('SuccessMessage') public SuccessMessage: ElementRef
  @ViewChild('FailureMessage') public FailureMessage: ElementRef

  @HostListener('document:keydown', ['$event']) getKeyCode(event) {

    if (event.keyCode == 114) {
      this.resetImageProperties();
      event.returnValue = false;
    }
    if (event.keyCode == 113) {
      this.zoomOut();
      event.returnValue = false;
    }
    if (event.keyCode == 112) {
      this.zoomIn(event);
      event.returnValue = false;
    } if (event.keyCode == 115) {
      this.darken();
      event.returnValue = false;
    } if (event.keyCode == 116) {
      this.brighten();
      event.returnValue = false;
    } if (event.keyCode == 117) {
      this.print();
      event.returnValue = false;
    }

  }

  ngOnInit() {
  this.materialscriptService.material();
    this.ngxGallerySlider();
    this.form_control = new FormGroup({
      "customerId": new FormControl('', []),
      "amount": new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateNumberPattern)])),
      "type": new FormControl('C', []),
      "type1": new FormControl('Percentage', []),
      "ReasonCode": new FormControl('', Validators.required),

      "description": new FormControl('', Validators.required),

    })

    let tripContextResponse: ITripsContextResponse = <ITripsContextResponse>{};
    this.tripsContextService.currentContext.subscribe(tripContext => { tripContextResponse = tripContext; console.log("tripContext: ", tripContext) });
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.customerContext.currentContext.subscribe(customerContext => {
      this.customerContextResponse = customerContext;
      console.log('MyTestRes', this.customerContextResponse);
    }
    );
    if (tripContextResponse != undefined) {
      this.getImagePath(parseInt(tripContextResponse.tripIDs.toString()));
      if (tripContextResponse.tripStatusCode != null && tripContextResponse.tripStatusCode == "VIOLATIONS") {

        this.getViolationHistory(tripContextResponse);
      }
      else {

        this.getTripActivity(tripContextResponse);
        $('#modalAdjustment').modal('hide');

      }
    }
  }

  getImagePath(tripId: number) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CUSTOMERTRANSACTIONACTIVITIES];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.IMAGEVIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.customerService.getImagePath(tripId, userEvents).subscribe(
      res => {
        this.imagePaths = res;
        console.log('Tripimages', this.imagePaths);
        this.imagePaths.forEach(item => {
          this.galleryImages.push({
            small: item.ImagePath, medium: item.ImagePath, big: item.ImagePath
          });
          console.log('GalleryImages', this.galleryImages);
        })
      });
  }



  ngxGallerySlider() {
    this.galleryOptions = [
      {
        "layout": "thumbnails-top",
        width: '100%',
        height: '524px',
        thumbnailsColumns: 8,
        preview: false,
        previewZoom: true,
        imageSwipe: true,
        imageSize: "contain",
        imageArrows: false,
      }
    ];
    this.galleryImages = []
  }

  zoomIn(event) {
    this.msgFlag = false;
    this.msgFlag = false;
    if (this.zoomIndex < 2.1) {
      this.zoomIndex += 0.1;
      this.marginTop += 20;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(" + this.zoomIndex + ")");
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", this.marginTop + "px");
    } else {
      this.msgFlag = true;
      this.msgType = 'info';
      this.msgDesc = "reached maximum ZoomIn";
      this.msgTitle = '';
      return false;
    }
    return false;
  }

  zoomOut() {
    this.msgFlag = false;
    if (this.zoomIndex > 0.5) {
      this.msgFlag = false;
      this.zoomIndex -= 0.1;
      this.marginTop -= 20;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(" + this.zoomIndex + ")");
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", this.marginTop + "px");
    } else {
      this.msgFlag = true;
      this.msgType = 'info';
      this.msgDesc = "reached maximum Zoomout";
      this.msgTitle = '';
      return false;
    }
    return false;
  }

  brighten() {
    this.msgFlag = false;
    if (this.brightIndex < 2.5) {
      this.brightIndex += 0.2;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(" + this.brightIndex + ")");
    } else {
      this.msgFlag = true;
      this.msgType = 'info';
      this.msgDesc = "Maximum Brightness reached";
      this.msgTitle = '';
      return false;
    }
    return false;
  }

  print() {
    this.msgFlag = false;
    let oldContent = document.body.innerHTML;
    let imageURL = (document.querySelector('.ngx-gallery-active') as HTMLElement).style.backgroundImage.slice(4, -1).replace(/"/g, "");
    console.dir(imageURL);
    var printContents = document.getElementsByClassName('ngx-gallery-image-wrapper')[0].innerHTML;
    let data = "<img src='" + imageURL + "' width='100%'>";
    var mywindow = window.open('', '', 'height=1000,width=1000');
    mywindow.document.write('<html><head><title></title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write(data);
    mywindow.document.write('</body></html>');
    mywindow.print();
    mywindow.close();
    return true;
  }

  resetImageProperties() {
    this.msgFlag = false;
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(1)");
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(1)");
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", "0px");
  }

  darken() {
    this.msgFlag = false;
    if (this.brightIndex > 0.5) {
      this.brightIndex -= 0.2;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(" + this.brightIndex + ")");
    } else {
      this.msgFlag = true;
      this.msgType = 'info';
      this.msgDesc = "Maximum Darkness reached";
      this.msgTitle = '';
      return false;
    }
    return false;
  }

  SubmitHistoryPopup() {
    let tripContext: ITripsContextResponse = <ITripsContextResponse>{};
    this.customerDetailsService.getTripStatusHistory(this.Itrip.CustomerTripId).subscribe(
      res => {
        this.ITriphistorys = res;
        if (this.ITriphistorys == null) {
          this.messagePopup = "No Details to Display";
        }
        console.log('TripHistory', this.ITriphistorys)
      });
    $('#myModal').modal('show');

  }

  SubmitPopup() {
    this.bindReasonCodes(0);
    $('#modalAdjustment').modal('show');
    this.form_control.controls["description"].setValue(null);
    this.form_control.controls["amount"].setValue(null);
    this.form_control.controls["ReasonCode"].setValue(null);
    this.form_control.controls["ReasonCode"].reset();
    this.form_control.controls["amount"].reset();
    this.form_control.controls["description"].reset();
  }

  onSelectionChange(entry) {
    this.bindReasonCodes(entry);
  }


  makeAdjustments() {
    this.InsertTranscationAdjustment();
  }

  getViolationHistory(tripContext) {
    ////debugger;
    var todayDate: Date = new Date();
    var startDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
    var endDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 59);
    this.Itrip = <ITripRequest>{};
    this.Itrip.AccountId = this.customerContextResponse.AccountId;  //violatorID
    this.Itrip.VehicleNumber = tripContext.vehicleNumber;
    this.Itrip.StartDate = tripContext.startDate;
    this.Itrip.EndDate = tripContext.endDate;
    this.Itrip.PageNumber = tripContext.pageNumber;
    this.Itrip.PageSize = 5;
    this.Itrip.TollTransactionTypeCode = tripContext.tollTransactionType;
    this.Itrip.SortColumn = "";
    this.Itrip.SortDirection = 1;
    this.Itrip.TripId = tripContext.tripIDs[0];;
    this.iSystemActivities.UserId = this.sessionContextResponse.userId;
    this.iSystemActivities.User = this.sessionContextResponse.userName;
    this.iSystemActivities.LoginId = this.sessionContextResponse.loginId;
    this.paymentHistoryDetailsRequest.SystemActivity = this.iSystemActivities;
    this.customerService.getViolationHistory(this.Itrip).subscribe(
      res => {
        //debugger;
        this.iTripresponse = res;
        console.log("IRES", this.iTripresponse)
      },
      (err) => {
        this.successBlock = false;
        this.errorBlock = true;
        this.errorHeading = "Internal Server Error";
        this.errorMessage = err.statusText;

      },
      () => {
        this.dataLength = this.searchPaymentResponse.length;

        if (this.searchPaymentResponse.length > 0)
          this.activityPopUp = true;
        else
          this.activityPopUp = false;

      });

    if (this.dataLength < this.pageItemNumber) {
      this.endItemNumber = this.dataLength
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

  }
  getTripActivity(tripContext) {
    // //debugger;
    // var todayDate: Date = new Date();
    // var startDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
    // var endDate: Date = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 59);

    this.Itrip = <ITripRequest>{};
    this.Itrip.AccountId = this.customerContextResponse.AccountId;  //violatorID
    this.Itrip.VehicleNumber = tripContext.vehicleNumber;
    this.Itrip.Entry_TripDateTime = tripContext.PostedDate;
    this.Itrip.TripId = tripContext.tripIDs[0];
    this.Itrip.CustomerTripId = tripContext.tripNumber;
    this.Itrip.TagId = tripContext.tagId;
    this.Itrip.Exit_TripDateTime = tripContext.PostedDate;
    this.Itrip.PageNumber = 1;
    this.Itrip.PageSize = 5;
    this.Itrip.TollTransactionTypeCode = tripContext.tollTransactionType;
    this.Itrip.SortColumn = "";
    this.Itrip.SortDirection = 1;
    this.iSystemActivities.UserId = this.sessionContextResponse.userId;;
    this.iSystemActivities.User = this.sessionContextResponse.userName;
    this.iSystemActivities.LoginId = this.sessionContextResponse.loginId;
    this.Itrip.IsSearchEventFired = true;
    this.Itrip.ActivitySource = this.ActivitySource;
    this.Itrip.IsPageLoad = true;
    this.Itrip.TripStatusCode = tripContext.tripStatusCode;
    this.paymentHistoryDetailsRequest.SystemActivity = this.iSystemActivities;

    this.customerService.getTripActivity(this.Itrip).subscribe(
      res => {
        // //debugger;
        this.iTripresponse = res;
        console.log("IRESGGG", this.iTripresponse)
        console.log(this.iTripresponse)
      },
      (err) => {
        this.successBlock = false;
        this.errorBlock = true;
        this.errorHeading = "Internal Server Error";
        this.errorMessage = err.statusText;

      },
      () => {
        this.dataLength = this.searchPaymentResponse.length;

        if (this.searchPaymentResponse.length > 0)
          this.activityPopUp = true;
        else
          this.activityPopUp = false;

      });

    if (this.dataLength < this.pageItemNumber) {
      this.endItemNumber = this.dataLength
    }
    else {
      this.endItemNumber = this.pageItemNumber;
    }

  }

  bindReasonCodes(adjustmentType: number) {

    this.reasonCodes = [{}];
    this.accountAdjustments = <any>{};
    if (adjustmentType == 0)
      this.accountAdjustments.DrCr_Flag = Adjustments[Adjustments.C.toString()];
    else
      this.accountAdjustments.DrCr_Flag = Adjustments[Adjustments.D.toString()];

    if (this.customerStatus.toUpperCase() == AccountStatus.CO.toString() || this.customerStatus.toUpperCase() == AccountStatus.COPD.toString()) {
      this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.Collection];
    }
    else {
      if (this.customerParentPlan.toUpperCase() == TollType.POSTPAID.toString().toUpperCase()) {
        this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PostPaid.toString()];
      }
      else {
        this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PrePaid.toString()];
      }
    }
    this.adjustmentCategory = this.accountAdjustments.AdjustmentCategory;
    this.accountAdjustments.CustomerId = this.sessionContextResponse.userId;
    this.accountAdjustments.strSubSystem = "CSC";
    this.accountAdjustments.ISTripLvel = false;

    this.customerDetailsService.getAdjustmentTypeDetails(this.accountAdjustments).subscribe(
      res => {
        this.reasonCodes = res;

        console.log(this.reasonCodes)
      });
  }
  InsertTranscationAdjustment() {
    if ((this.form_control.valid)) {
      let tripadjustmentContext: ITripsContextResponse = <ITripsContextResponse>{};
      this.tripsContextService.currentContext.subscribe(tripContext => { tripadjustmentContext = tripContext; console.log("tripContext: ", tripContext) });
      this.sessionContextResponse = this.sessionContext.customerContext;

      this.transcationadjustment.amount = this.form_control.controls["amount"].value;
      this.transcationadjustment.AdjustmentCategoryId = 0;
      this.transcationadjustment.PageSize = 10;
      this.transcationadjustment.SortDir = 1;
      this.transcationadjustment.ReasonCode = "TRIPAD";
      this.transcationadjustment.DrCr_Flag = this.form_control.controls["type"].value;
      this.transcationadjustment.AccStatusCode = "AC";
      this.transcationadjustment.SubSystem = "CSC";
      this.transcationadjustment.ActivitySource = this.ActivitySource;
      this.transcationadjustment.CustomerTripId = tripadjustmentContext.tripNumber;
      this.transcationadjustment.AppTxnTypeCode = "";
      this.transcationadjustment.TripProblemId = tripadjustmentContext.tripProblemId;

      this.transcationadjustment.LoginId = this.sessionContextResponse.loginId;
      this.transcationadjustment.ICNId = this.sessionContextResponse.icnId;
      this.transcationadjustment.UserId = this.sessionContextResponse.userId;

      this.transcationadjustment.TxnAmount = this.form_control.controls["amount"].value;

      this.transcationadjustment.User = this.sessionContextResponse.userName;

      let list: string[] = this.form_control.controls['ReasonCode'].value.split('-');

      this.transcationadjustment.TxnType = list[0].toString();
      this.transcationadjustment.TxnTypeDesc = list[1].toString();

      this.transcationadjustment.IsPostpaidCustomer = this.customerParentPlan == TollType.POSTPAID.toString() ? true : false;;

      this.transcationadjustment.CustomerId = this.customerContextResponse.AccountId;
      this.transcationadjustment.Check = this.form_control.controls["type1"].value;
      this.transcationadjustment.Description = this.form_control.controls["description"].value;
      this.transcationadjustment.AmountType = this.transcationadjustment.Check;
      this.transcationadjustment.AdjustmentCategory = this.accountAdjustments.AdjustmentCategory;
      this.systemActivity = <any>{};
      this.systemActivity.LoginId = this.sessionContextResponse.loginId;  //this.UserInputs.LoginId;
      this.systemActivity.UserId = this.sessionContextResponse.userId;//this.UserInputs.UserId;
      this.systemActivity.User = this.sessionContextResponse.userName; //this.UserInputs.UserName;
      this.systemActivity.ActivitySource = "Internal";
      this.transcationadjustment.SystemActivity = this.systemActivity;

      if (this.transcationadjustment.TxnType == "Select") {
        this.message = "Select Reason Code";
        return;
      }
      if (this.transcationadjustment.amount > this.transcationadjustment.TxnAmount) {
        this.message = "Adjustment amount should not be greater than Txn Amount";
        return;
      }
      // if (this.transcationadjustment.Check == "Percentage") {
      //   if ((this.transcationadjustment.amount - Math.floor(this.transcationadjustment.amount)) == 0) {
      //     this.message = "Amount allows decimal values";
      //     return;
      //   }
      // }
      //Check amount value with maximum range

      if (this.transcationadjustment.amount > 100) {
        this.message = "Not allowed more than 100% adjustment";
        return;

      }
      //Check amount value with minimum range
      if (this.transcationadjustment.amount <= 0) {
        this.message = "Not allowed 0% adjustment";
        return;
      }
      //Check amount value with minimum range
      if (this.transcationadjustment.amount <= 0) {
        this.message = "Not allowed zero amount";
        return;
      }

      this.transcationadjustment.AdjustmentDate = new Date();
      this.transcationadjustment.ApprovedStatusDate = new Date();
      //this.transcationadjustment = <any>{};

      this.customerDetailsService.insertTollLevelAdjustments(this.transcationadjustment).subscribe(res => {
        if (res) {
          //debugger;
          this.accountInfo.refreshAccountInformation();
          $('#modalAdjustment').modal('hide');
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = "Adjustment has been done successfully.";
          this.msgTitle = '';
          console.log(res);
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Unable to do the trip adjustment";
          this.msgTitle = '';
          // this.errorMessage = "Unable to do the trip adjustment";
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        // this.errorMessage = err.statusText.toString();
      })
    } else {
      this.validateAllFormFields(this.form_control);
    }
  }
  userAction(event) {
    console.log('sdfsd');
  }
  transferTransactions() {

    let tripContextResponse: ITripsContextResponse = <ITripsContextResponse>{};
    tripContextResponse.tripIDs = [];
    tripContextResponse.tripIDs.push(this.Itrip.CustomerTripId);
    if (tripContextResponse.tripIDs.length >= 1) {
      this.tripsContextService.changeResponse(tripContextResponse);
      let link = ['/csc/customerdetails/transaction-transfer/'];
      this.router.navigate(link);
    }
  }

  goToComplaint(problemId: number) {
    debugger
    if (problemId > 0) {
      // todo: Display problem id exist message
    } else {
      this.savingData();
      const link = ['csc/helpdesk/create-complaint'];
      this.router.navigate(link);
    }
  }

  redirectPage() {
    let link = ['csc/customerdetails/transaction-activities'];
    this.router.navigate(link, { queryParams: { fromSearch: true } });
  }


  viewComplaint(prolemId: number) {
    let url = 'csc/helpdesk/view-complaints';
    this.router.navigate([url], { queryParams: { id: prolemId } });
  }
  setOutputFlag(event) {
    this.msgFlag = event;
  }

  savingData() {
    let tripContextResponse: ITripsContextResponse;
    this.tripsContextService.currentContext.subscribe(tripContext => {
      tripContextResponse = tripContext;
    });

    if (!tripContextResponse) {
      tripContextResponse = <ITripsContextResponse>{};
    }
    tripContextResponse.tripIDs = [];
    tripContextResponse.tripIDs.push(this.Itrip.CustomerTripId);
    tripContextResponse.referenceURL = 'csc/customerdetails/transaction-activities';

    this.tripsContextService.changeResponse(tripContextResponse);
  }
  descEvent(event: any) {

  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }
}
