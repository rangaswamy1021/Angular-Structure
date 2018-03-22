import { Router } from '@angular/router';
import { IUserresponse } from './../../shared/models/userresponse';
import { IUserEvents } from './../../shared/models/userevents';

import { SessionService } from './../../shared/services/session.service';
import { IExceptionListReviewResponse } from './models/exceptionlistreviewresponse';

import { CommonService } from './../../shared/services/common.service';
import { Features, LookupTypeCodes, Actions } from './../../shared/constants';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { ExceptionListService } from './services/exceptionlists.service';
import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, } from 'ngx-gallery';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-exception-list-review',
  templateUrl: './exception-list-review.component.html',
  styleUrls: ['./exception-list-review.component.css']
})

export class ExceptionListReviewComponent implements OnInit, AfterViewInit {
  addDisableButton: boolean;
  sessionContextResponse: IUserresponse;

  exceptionReviewedCount: number;
  countError: boolean;
  showError: boolean;
  showPatternError: boolean;
  showCountRequired: boolean;
  disablePrev: boolean;
  disableNext: boolean;
  progressIndex: number;
  keyCodes: {
    ctrl: boolean;
    left: boolean;
    right: boolean;
  };
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  nextImageIndex: any = 0
  indexVal: any;
  maxValue: number;
  faileureMessge: string;
  successMessage: string;
  disableText: boolean;
  completedArray: any;
  result: string = "Result";
  disableButton: boolean;
  status: string;
  showImageSec: boolean = false;
  showRequired: boolean;
  count;
  selectedException: IExceptionListReviewResponse = <IExceptionListReviewResponse>{};
  viewPath: string;
  exceptionLists: IExceptionListReviewResponse[] = <IExceptionListReviewResponse[]>[{}];
  marginTop: number = 0;
  states;
  brightIndex: number = 1;
  zoomIndex = 1;
  imageIndex = 0;
  galleryOptions: NgxGalleryOptions[];

  @ViewChild('selectedBox') elementRef: ElementRef;

  galleryImages: NgxGalleryImage[] = [];
  constructor(private renderer2: Renderer2, private router: Router, private sessionContext: SessionService, private exceptionListService: ExceptionListService, private commonService: CommonService, private sessionData: SessionService,private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.getMasterData();
    this.ngxGallerySlider();
    this.keyCodes = {
      ctrl: false,
      left: false,
      right: false
    }
    this.nextImageIndex = this.imageIndex;
    this.progressIndex = 1;

    this.exceptionReviewedCount = 0;
    this.materialscriptService.material();
  }
  ngAfterViewInit() {
    // console.log(this.elementRef);
  }

  @HostListener('document:keydown', ['$event']) getKeyCode(event) {
  if (event.keyCode == 27) {
     this.msgFlag=false;
      
    }
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
    if (event.keyCode == 39) {
      this.next();
    }
    if (event.keyCode == 37) {
      this.prev();
    }

  }

  getAllTransactions(number) {
    if (number) {

      if (!this.countError) {
        this.showCountRequired = false;
        this.exceptionListService.getTransactions(number).subscribe(res => {
          this.exceptionLists = res;
          this.maxValue = this.exceptionLists.length;
          this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.TripImages)
            .subscribe(res => {
              this.viewPath = res;
              this.getImages(0)
            });

        })
      }
    }
    else {
      this.showCountRequired = true;
      this.showError = true;
    }
  }

  getCountValue(number) {
    if (number.length <= 0) {
      this.showError = true;
      this.showPatternError = false;
      this.showCountRequired = true;
      this.countError = false;
    }
    else {
      this.showCountRequired = false;
      this.showError = false;
      let regex = /[0-9]/g;
      if (!number.match(regex)) {
        this.showError = true;
        this.showPatternError = true;
        this.countError = true;
      }
      this.countError = false;
    }
  }

  getMasterData() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.EXCEPTIONLISTREVIEW];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.exceptionListService.getMasterData(userEvents).subscribe(res => {
      this.states = res[0]['Value'];
    })
  }

  updateIndex() {
    let nextFlag;
    this.imageIndex += 1;

    nextFlag = this.setExceptionListItem(this.imageIndex - 1);
    if (nextFlag)
      this.getImages(this.imageIndex);



  }

  getImages(index) {
    this.indexVal = index + 1;
    this.galleryImages = [];
    if (this.imageIndex < this.exceptionLists.length) {

      this.progressIndex = index + 1;
    }
    if (index < this.exceptionLists.length) {
      this.selectedException = this.exceptionLists[index];
      this.states.forEach(element => {
        if (element.Key == this.selectedException.VEHICLESTATE) {
          this.selectedException.VEHICLESTATE = element.Value;
        }
      });
      this.disableText = false;
      this.exceptionLists[index].TripImages.forEach(item => {
        this.galleryImages.push({
          small: this.viewPath + item.IMAGENAME, medium: this.viewPath + item.IMAGENAME, big: this.viewPath + item.IMAGENAME
        })
      });
      this.showImageSec = true;

      this.disableButton = true;
    }
  }




  setExceptionListItem(index) {
    this.exceptionLists[index].UserAction = this.result;
    this.exceptionLists[index].REASONCODE = this.status;
    this.status = "";
    this.selectedException = this.exceptionLists[index];
    this.exceptionReviewedCount += 1;
    this.states.forEach(element => {
      if (element.Key == this.selectedException.VEHICLESTATE) {
        this.selectedException.VEHICLESTATE = element.Value;
      }
    });
    if (index >= this.exceptionLists.length - 1) {
      this.msgType = 'alert';
      this.msgFlag = true;
      this.disableText = true;
      this.disableNext = true;
      if (this.exceptionReviewedCount >= this.exceptionLists.length) {
        this.msgDesc = 'You have completed all transactions. Do you want to commit the changes?';
        this.msgTitle = 'Complete';
        return false;
      }
      else {
        this.msgDesc = 'You have completed only few transactions. Do you want to commit the changes';
        this.msgTitle = 'Warning';
        return false;
      }
    }
    else {
      return true;
    }

  }

  ngxGallerySlider() {
    this.galleryOptions = [
      // { "arrowPrevIcon": "fa fa-arrow-circle-o-left", "arrowNextIcon": "fa fa-arrow-circle-o-right", "closeIcon": "fa fa-window-close", "fullscreenIcon": "fa fa-arrows", "spinnerIcon": "fa fa-refresh fa-spin fa-3x fa-fw", "previewFullscreen": true },
      {
        "layout": "thumbnails-top",
        width: '100%',
        height: '524px',
        thumbnailsColumns: 8,
        preview: false,
        previewZoom: true,
        imageSwipe: false,
        imageSize: "contain",
        imageArrows: false,
      }
    ];
  }

  zoomIn() {
    if (this.zoomIndex < 2.1) {
      this.zoomIndex += 0.1;
      this.marginTop += 20;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(" + this.zoomIndex + ")");
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", this.marginTop + "px");
    }
    return false;
  }

  zoomOut() {
    if (this.zoomIndex > 0.5) {
      this.zoomIndex -= 0.1;
      this.marginTop -= 20;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(" + this.zoomIndex + ")");
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", this.marginTop + "px");
    }
  }

  brighten() {
    if (this.brightIndex < 2.5) {
      this.brightIndex += 0.2;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(" + this.brightIndex + ")");
    }
  }

  resetImageProperties() {
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(1)");
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "transform", "scale(1)");
    this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "margin-top", "0px");
  }

  darken() {
    if (this.brightIndex > 0.5) {
      this.brightIndex -= 0.2;
      this.renderer2.setStyle(document.querySelector('.ngx-gallery-active'), "filter", "brightness(" + this.brightIndex + ")");
    }
  }


  next() {
    if (this.imageIndex < this.exceptionLists.length) {
      if (this.exceptionLists[this.imageIndex].UserAction) {
        this.imageIndex += 1;
        this.disablePrev = false;
        this.status = this.exceptionLists[this.imageIndex].REASONCODE;
        this.getImages(this.imageIndex);
      }
      else {
        this.msgType = 'error';

        this.msgFlag = true;
        this.msgDesc = 'Cannot move to next transcation without processing current transaction';
        this.msgTitle = 'Error';
      }
    }
    else {
      this.disableNext = true;
    }
  }

  prev() {
    if (this.imageIndex > 0) {
      this.disableNext = false;
      this.imageIndex -= 1;
      this.status = this.exceptionLists[this.imageIndex].REASONCODE
      this.getImages(this.imageIndex);
      this.msgType = '';

      this.msgFlag = false;

    }
    else {
      this.disablePrev = true;
    }
  }

  getArrowKeyCode(event) {
    if (event.keyCode == 39) {
      this.next();
    }
    if (event.keyCode == 37) {
      this.prev();
    }
  }

  selectStatus(event, status) {


    if (event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37) {
      this.showRequired = false;
      if (status[0].toLowerCase() == 'a') {
        this.status = "ACCEPTED"
      }
      else if (status[0].toLowerCase() == 'r') {
        this.status = "REJECTED"
      }
      else {
        this.status = status.slice(0, 0);
      }
      if (status.length > 8) {
        this.status = status.slice(0, 8);
      }
      else if (status.length < 8 && status.length > 1) {
        this.status = "";
      }
      this.faileureMessge = "";
    }
    else {
      if (event.keyCode == 13) {
        if (this.status) {
          this.updateIndex();
        }
        else {
          this.showRequired = true;
        }
      }


    }
  }

  checkChanges() {
    this.exceptionReviewedCount = 0;
    this.exceptionLists.forEach(element => {
      if (element.UserAction != undefined) {
        this.exceptionReviewedCount++;
      }
    });
    if (this.exceptionReviewedCount == 0) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = 'No Transactions Reviewed';
      this.msgTitle = 'Error';
    }
    else if (this.exceptionReviewedCount != this.exceptionLists.length) {
      this.msgType = 'alert';
      this.msgFlag = true;
      this.msgDesc = 'You have completed only few transactions. Do you want to commit the changes';
      this.msgTitle = 'Warning';
    }
    else {
      this.commitChanges();
    }

  }

  setOutputFlag(event, duration) {
    this.msgFlag = event;

  }



  userAction(event) {
    if (event) {
      this.commitChanges();
      this.status = "";
    }
  }

  releaseBtn() {
    this.exceptionLists = [];
    this.selectedException = null;
    this.showImageSec = false;
    this.count = '';
    this.imageIndex = 0;
    this.disableButton = false;
    this.disablePrev = false;
    this.disableNext = false;
    this.disableText = false;
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = 'Transaction Released Successfully';
    this.msgTitle = 'Success';
    this.status = "";
  }

  commitChanges() {
    this.completedArray = [];
    this.exceptionLists.forEach(element => {
      if (element.UserAction != undefined) {
        this.completedArray.push(element.EXEMPTED_TRIPID + "~" + element.REASONCODE + "~" + this.sessionData.customerContext.userName);
      }
    });
    this.addDisableButton = !this.commonService.isAllowed(Features[Features.TOLLRATES],
      Actions[Actions.COMMIT], "");
      alert(this.addDisableButton);
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.EXCEPTIONLISTREVIEW];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.COMMIT];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.exceptionListService.commitTransactions(this.completedArray, userEvents).subscribe(res => {
      if (res) {

        this.msgType = 'success';
        this.msgFlag = true;
        this.msgDesc = 'Transactions committed successfully';
        this.msgTitle = 'Success';
        this.exceptionLists = [];
        this.selectedException = null;
        this.showImageSec = false;
        this.count = '';
        this.imageIndex = 0;
        this.disableButton = false;
        this.disablePrev = false;
        this.disableNext = false;
        this.disableText = false;
      }
    })
  }
}
