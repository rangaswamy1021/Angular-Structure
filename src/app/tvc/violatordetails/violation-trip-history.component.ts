import { CommonService } from './../../shared/services/common.service';
import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { ViolatordetailsService } from './services/violatordetails.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { Router } from '@angular/router';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { SessionService } from '../../shared/services/session.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { ActivitySource, SubSystem, Activities, Features, Actions, defaultCulture } from '../../shared/constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-violation-trip-history',
  templateUrl: './violation-trip-history.component.html',
  styleUrls: ['./violation-trip-history.component.scss']
})
export class ViolationTripHistoryComponent implements OnInit {
  msgTitle: string;
  disableAddActivitybtn: boolean = false;
  violationTrans: any;

  imagePaths: any;
  marginTop: number;
  brightIndex: number = 1;
  // lngCustomerTripId: any;
  zoomIndex = 1;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  addActivity;

  violatorContextResponse: IViolatorContextResponse;
  sessionContextResponse: IUserresponse;
  tripContext: ITripsContextResponse;
  tripIdCSV: string = '';
  UserInputs: IAddUserInputs = <IAddUserInputs>{};
  longViolatorId: number = 0;
  redirectURL: string;
  tripsSearchRequest: any;
  systemActivities: any;
  tripResponse: any[];
  bsRangeValue: Date;
  errorBlock: boolean;


  zeroAmountTrips: string;
  paymentPlanTrips: string;
  courtTrips: string;
  probleIdTrips: string;
  accountSummartReq: any;
  activityRes: any[];
  tripHistoryRes: any[];
  createActivity: any;
  activityForm: FormGroup;
  commentTextLength: number = 255;


  p: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number = 10;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;


  constructor(private violatorDetailsService: ViolatordetailsService,
    private violatorContext: ViolatorContextService,
    private router: Router,
    private renderer2: Renderer2,
    private tripContextService: TripsContextService,
    private sessionContext: SessionService,
    private materialscriptService: MaterialscriptService,
    private commonService: CommonService) { }

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
      this.zoomIn();
      event.returnValue = false;
    } if (event.keyCode == 115) {
      this.darken();
      event.returnValue = false;
    } if (event.keyCode == 116) {
      this.brighten();
      event.returnValue = false;
    }
    if (event.keyCode == 117) {
      this.print();
      event.returnValue = false;
    }

  }


  ngOnInit() {
    this.materialscriptService.material();
    this.ngxGallerySlider();
    this.activityForm = new FormGroup({
      'activityText': new FormControl('', [Validators.required]),
    });

    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.UserInputs.icnId = this.sessionContextResponse.icnId;


    this.violatorContext.currentContext
      .subscribe(customerContext => {
        if (customerContext && customerContext.accountId > 0) {
          this.violatorContextResponse = customerContext;
          this.longViolatorId = this.violatorContextResponse.accountId;
          this.tripContextService.currentContext.subscribe(res => {
            if (res && res.referenceURL.length > 0) {
              this.tripContext = res;
              this.tripIdCSV = res.tripIDs.toString();
              this.redirectURL = res.referenceURL;
              this.violationTrans = <any>{};

              this.violationTrans.CustomerId = this.longViolatorId;
              this.violationTrans.LoginId = this.UserInputs.loginId;
              this.violationTrans.UserId = this.UserInputs.userId;
              this.violationTrans.UserName = this.UserInputs.userName;
              this.violationTrans.CitationId = this.tripIdCSV;
              this.getImagePath(this.violationTrans);

            } else {
              // let link = ['tvc/search/violation-search'];
              // this.tripContextService.changeResponse(null);
              // this.router.navigate(link);
              // TODO: If no trips context
              // navigate to
            }
          });
        } else {
          // let link = ['tvc/search/violation-search'];
          // this.tripContextService.changeResponse(null);
          // this.router.navigate(link);
          // TO DO if no customer context
        }
        // console.log('Recvd trips:' + this.tripIdCSV);
        // console.log('Recvd URL:' + this.redirectURL);
      });



    //prepare audit log for view.
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONTRIPHISTORY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.getTripDetails(1, 10, userEvents);
    this.getActivities(1);
    this.checkRolesandPrivileges();



  }


  checkRolesandPrivileges() {
    this.disableAddActivitybtn = !this.commonService.isAllowed(Features[Features.VIOLATIONTRIPHISTORY], Actions[Actions.CREATE], "");

  }


  getImagePath(violationTrans: any) {
    this.violatorDetailsService.getImagePath(violationTrans).subscribe(
      res => {
        this.imagePaths = res;
        console.log('Tripimages', this.imagePaths);
        this.imagePaths.objImageDetails.forEach(item => {
          this.galleryImages.push({
            small: item.ImageName, medium: item.ImageName, big: item.ImageName
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

  zoomIn() {
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


  getTripDetails(pageNumber: number, pageSize: number, userEvents: IUserEvents) {
    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
    this.bsRangeValue = new Date(Number(strDateRange[2]) - 5, Number(strDateRange[0]), Number(strDateRange[1]));
    this.tripsSearchRequest = <any>{};
    this.tripsSearchRequest.ViolatorId = this.longViolatorId;
    this.tripsSearchRequest.StartDate = this.bsRangeValue;;
    this.tripsSearchRequest.EndDate = new Date();
    this.tripsSearchRequest.CitationId = this.tripIdCSV;
    this.tripsSearchRequest.VehicleNumber = '';
    this.tripsSearchRequest.StatusCode = '';

    this.tripsSearchRequest.PageNumber = pageNumber;
    this.tripsSearchRequest.SortDirection = 1;
    this.tripsSearchRequest.SortColumn = 'CitationId';
    this.tripsSearchRequest.PageSize = pageSize;

    this.tripsSearchRequest.UserId = this.sessionContextResponse.userId;
    this.tripsSearchRequest.LoginId = this.sessionContextResponse.loginId;
    this.tripsSearchRequest.UserName = this.sessionContextResponse.userName;

    this.systemActivities = <any>{};
    this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.tripsSearchRequest.SystemActivity = this.systemActivities;

    this.violatorDetailsService.violatorTripsSearch(this.tripsSearchRequest, userEvents)
      .subscribe(res => {
        this.tripResponse = res;
      }, (err) => {

      }, () => {
        if (this.tripResponse && this.tripResponse.length > 0) {
        }
      });
  }


  getActivities(pageNumber: number) {
    this.accountSummartReq = <any>{};
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.sessionContextResponse.loginId;
    this.systemActivities.UserId = this.sessionContextResponse.userId;
    this.systemActivities.User = this.sessionContextResponse.userName;
    this.accountSummartReq.SystemActivities = this.systemActivities;
    this.accountSummartReq.PerformedBy = this.sessionContextResponse.userName;
    this.accountSummartReq.CustomerId = this.longViolatorId;
    this.accountSummartReq.Type = '';
    this.accountSummartReq.Subsystem = SubSystem[SubSystem.TVC];
    this.accountSummartReq.StartDate = this.bsRangeValue;
    this.accountSummartReq.EndDate = new Date();
    this.accountSummartReq.Linkid = this.tripIdCSV.toString();

    this.accountSummartReq.PageNumber = pageNumber;
    this.accountSummartReq.PageSize = 10;
    this.accountSummartReq.SortDir = 1;
    this.accountSummartReq.SortColumn = "ACTIVITYDATE";
    this.accountSummartReq.IsSearchEventFired = false;

    this.violatorDetailsService.getActivitiesForViolator(this.accountSummartReq)
      .subscribe(res => {
        this.activityRes = res

        if (this.activityRes && this.activityRes.length > 0) {
          this.dataLength = this.activityRes[0].Recount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.activityRes.length;
          }
        }
      });
  }


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.getActivities(this.p);
  }


  makePaymentClick() {
    if (this.outstandingAmountCheck() != '') {
      this.showErrorMsg('Trip # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero');
    } else if (this.paymentPLanTripsChecking() != '') {
      this.showErrorMsg('Selected Trip # ' + this.paymentPlanTrips.slice(0, -1) + ' is in payment plan')
    } else if (this.courtTripsChecking(true) != '') {
        this.showErrorMsg('Trip # ' + this.courtTrips.slice(0, -1) + ' is in court');
    } else {
      this.changeNavigateURL();
      let link = ['/tvc/paymentdetails/violation-payment'];
      this.router.navigate(link);
    }
  }

  submitInquiryClick() {
    if (this.problemIDTrips() != '') {
      this.showErrorMsg('Complaint(s) already created for Trip #  ' + this.probleIdTrips.slice(0, -1));
    } else {
      this.changeNavigateURL();
      let link = ['tvc/helpdesk/create-complaint'];
      this.router.navigate(link);
    }
  }

  disputeClick() {
    if (this.outstandingAmountCheck() != '') {
      this.showErrorMsg('Trip # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero');
    } else if (this.paymentPLanTripsChecking() != '') {
      this.showErrorMsg('Trip # ' + this.paymentPlanTrips.slice(0, -1) + ' is in payment plan');
    } else if (this.courtTripsChecking(false) != '') {
      this.showErrorMsg('Trip # ' + this.courtTrips.slice(0, -1) + ' is in court');
    }
    else {
      if (this.tripResponse && this.tripResponse[0].IsDisputed) {
        this.showErrorMsg('Trip # ' + this.tripResponse[0].CitationId + ' is already disputed');
      } else {
        this.changeNavigateURL();
        let link = ['tvc/disputes/non-liability'];
        this.router.navigate(link);
      }
    }
  }


  SSTHistory() {
    this.changeNavigateURL();
    let link = ['tvc/violatordetails/sst-history'];
    this.router.navigate(link);
  }

  viewCorrespondingHistory() {
    this.changeNavigateURL();
    let link = ['tvc/violatordetails/view-correspondence'];
    this.router.navigate(link);
  }

  tripStatusUpdateClick() {
    this.changeNavigateURL();
    let link = ['tvc/violatordetails/transaction-status-update'];
    this.router.navigate(link);
  }


  overpaymentTransferClick() {
    if (this.outstandingAmountCheck() != '') {
      this.showErrorMsg('Trip # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero');

    } else if (this.paymentPLanTripsChecking() != '') {
      this.showErrorMsg('Trip # ' + this.paymentPlanTrips.slice(0, -1) + ' is in payment plan');

    } else if (this.courtTripsChecking(false) != '') {
      this.showErrorMsg('Trip # ' + this.courtTrips.slice(0, -1) + ' is in court');
    } else {
      this.changeNavigateURL();
      let link = ['tvc/violatordetails/over-payment-transfer'];
      this.router.navigate(link);
    }
  }

  adminHearingTransferClick() {
    if (this.outstandingAmountCheck() != '') {
      this.showErrorMsg('Trip # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero');
    } else if (this.paymentPLanTripsChecking() != '') {
      this.showErrorMsg('Trip # ' + this.paymentPlanTrips.slice(0, -1) + ' is in payment plan');

    } else {
      this.changeNavigateURL();
      let link = ['tvc/violatordetails/admin-hearing'];
      this.router.navigate(link);
    }
  }

  AdjustmentClick() {
    this.changeNavigateURL();
    let link = ['tvc/violatordetails/trip-adjustments'];
    this.router.navigate(link);
  }

  createCorrespondenceClick() {
    if (this.outstandingAmountCheck() != '') {
      this.showErrorMsg('Trip # ' + this.zeroAmountTrips.slice(0, -1) + ' Outstanding amount should be greater than zero')
    } else {
      this.changeNavigateURL();
      let link = ['tvc/violatordetails/create-correspondence'];
      this.router.navigate(link);
    }
  }

  outstandingAmountCheck(): string {
    this.zeroAmountTrips = '';
    for (var i = 0; i < this.tripResponse.length; i++) {
      if (this.tripResponse[i].OutstandingAmount <= 0) {
        this.zeroAmountTrips += this.tripResponse[i].CitationId + ',';
      }
    }
    return this.zeroAmountTrips;
  }



  paymentPLanTripsChecking() {
    this.paymentPlanTrips = '';
    for (var i = 0; i < this.tripResponse.length; i++) {
      if (this.tripResponse[i].HoldType.toString().toUpperCase() == 'PAYMENTPLAN') {
        if (this.tripResponse[i].IsHold)
          this.paymentPlanTrips += this.tripResponse[i].CitationId + ',';
      }
    }
    return this.paymentPlanTrips;
  }

  courtTripsChecking(isPayment: boolean) {
    this.courtTrips = '';
    for (var i = 0; i < this.tripResponse.length; i++) {
      if (isPayment) {
        if (this.tripResponse[i].CitationStage.toString().toUpperCase() === 'CRT' && this.tripResponse[i].CitationType.toString().toUpperCase() === 'INIT'){
          this.courtTrips += this.tripResponse[i].CitationId + ',';
        }

      } else {
        if (this.tripResponse[i].CitationStage.toString().toUpperCase() === 'CRT') {
          this.courtTrips += this.tripResponse[i].CitationId + ',';
        }
      }
    }
    return this.courtTrips;
  }


  changeNavigateURL() {
    if (this.tripContext != null) {
      this.tripContext.referenceURL = 'tvc/violatordetails/violation-trip-history'
    }
  }

  problemIDTrips() {
    this.probleIdTrips = '';
    for (var i = 0; i < this.tripResponse.length; i++) {
      if (this.tripResponse[i].ProblemId > 0) {
        this.probleIdTrips += this.tripResponse[i].CitationId + ',';
      }
    }
    return this.probleIdTrips;
  }

  bindTripStatusHistory() {
    this.violatorDetailsService.bindTripStatusHistory(-1 * parseInt(this.tripIdCSV.toString()))
      .subscribe(res => {
        this.tripHistoryRes = res;
      });
  }

  addActivityForTrip() {
    if (this.activityForm.valid) {
      this.createActivity = <any>{};
      this.createActivity.CustomerId = this.longViolatorId;
      this.createActivity.Type = Activities[Activities.TRIPACTIVITY.toString()];
      this.createActivity.Activity = this.activityForm.controls['activityText'].value;
      this.createActivity.PerformedBy = this.sessionContextResponse.userName;
      this.createActivity.Subsystem = SubSystem[SubSystem.TVC];;
      this.createActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.createActivity.Linkid = this.tripIdCSV.toString();
      this.createActivity.LinkSourceName = "VIOLATION";
      this.createActivity.User = this.sessionContextResponse.userName;
      this.systemActivities = <ISystemActivities>{};
      this.systemActivities.LoginId = this.sessionContextResponse.loginId;
      this.systemActivities.UserId = this.sessionContextResponse.userId;
      this.systemActivities.User = this.sessionContextResponse.userName;
      this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.createActivity.SystemActivities = this.systemActivities;



      //prepare audit log for view.
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIOLATIONTRIPHISTORY];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longViolatorId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.violatorDetailsService.create(this.createActivity.CustomerId, this.createActivity, userEvents).subscribe(res => {
        if (res) {
          this.showSucsMsg('Activity has been added successfully');
          this.activityForm.reset();
          this.startItemNumber = 1;
          this.endItemNumber = 10;
          this.p = 1;
          this.addActivity = false;
        }
        else {
          this.showErrorMsg('Error While Inserting Activity.');
        }
        this.getActivities(1);
      }, (err) => {
        this.showErrorMsg(err.statusText.toString())
      })
    }
    else {
      this.validateAllFormFields(this.activityForm)
    }
  }

  validateAllFormFields(formGroup: FormGroup) { //{1}
    Object.keys(formGroup.controls).forEach(controlName => { //{2}
      const control = formGroup.get(controlName); //{3}
      if (control instanceof FormControl) { //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) { //{5}
        this.validateAllFormFields(control); //{6}
      }
    });
  }

  backClick() {
    this.router.navigate(['tvc/violatordetails/trip-Search'])
  }

  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length
  }

  resetForm() {
    this.activityForm.reset();
    this.commentTextLength = 255;
  }

  showActivity() {
    this.addActivity = true;
    this.activityForm.patchValue({
      activityText: ''
    })
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }

}



export interface IAddUserInputs {
  userName: string
  loginId: number
  userId: number
  icnId: number;
}
