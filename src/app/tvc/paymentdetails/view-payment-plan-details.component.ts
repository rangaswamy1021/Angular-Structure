import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from '../../shared/models/userevents';
import { Actions, ActivitySource, Features, SubFeatures, SubSystem, defaultCulture } from '../../shared/constants';
import { PaymentContextService } from './services/payment.context.service';
import { IViolationPaymentrequest } from '../../payment/models/violationpaymentrequest';
import { MakePaymentComponent } from '../../payment/make-payment.component';
import { SessionService } from '../../shared/services/session.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { PaymentDetailService } from './services/paymentdetails.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IMyDpOptions } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
declare var $: any;

@Component({
  selector: 'app-view-payment-plan-details',
  templateUrl: './view-payment-plan-details.component.html',
  styleUrls: ['./view-payment-plan-details.component.scss']
})
export class ViewPaymentPlanDetailsComponent implements OnInit {


  longViolatorid: number;
  eMIHeaderDetails: any[];
  eMITermDetails: any[];
  isShowTermsGrid: boolean = false;
  updateRequestObj: any;
  updateDueDate: Date;
  sessionContextResponse: IUserresponse;
  violatorContextResponse: IViolatorContextResponse;
  startDate: any;
  @ViewChild(MakePaymentComponent) makePaymentComp;
  objPaymentRequest: IViolationPaymentrequest = <IViolationPaymentrequest>{};
  paymentAmount: number;
  isShowPaymentBlock: boolean = true;
  editDefaultCountObject: any;
  disablePaymentButton: boolean = false;
  disablTermEditButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private paymentDetailService: PaymentDetailService, private router: Router, private commonService: CommonService,
    private violatorContext: ViolatorContextService, private vioPaymentContextService: PaymentContextService, private sessionContext: SessionService,private datePickerFormat: DatePickerFormatService,) {

  }

  ngOnInit() {
    this.isShowPaymentBlock = false;
    this.sessionContextResponse = this.sessionContext.customerContext;

    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );
    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longViolatorid = this.violatorContextResponse.accountId;
    }

    if (this.router.url.endsWith('/view-payment-plan')) {
      this.vioPaymentContextService.changeResponse(null);
    }

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.disablePaymentButton = !this.commonService.isAllowed(Features[Features.VIEWPAYMENTPLAN], Actions[Actions.PAYMENT], "");
    this.disablTermEditButton = !this.commonService.isAllowed(Features[Features.VIEWPAYMENTPLAN], Actions[Actions.TERMEDIT], "");
    this.getEMIDetailsBYViolatorID(userEvents);
    if (this.makePaymentComp != undefined) {
      this.vioPaymentContextService.currentContext.subscribe(res => {
        this.objPaymentRequest = res;
        if (this.objPaymentRequest == null || this.objPaymentRequest.CustomerId == 0) {
          this.makePaymentComp.InitialiZeObject(this.longViolatorid);
        } else {
          this.isShowPaymentBlock = true;
          this.paymentAmount = res.TxnAmount;
          $('#paymentBlock').show();
          this.makePaymentComp.setCustomerId(this.longViolatorid, "");
          this.makePaymentComp.bindDetailsOnBack(this.objPaymentRequest);
        }
      });
    }
  }


  //for date picker
  minDate = new Date();
  maxDate = new Date(2070, 9, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
 myDatePickerOptions: ICalOptions={
        // other options...
        dateFormat: 'mm/dd/yyyy',
         disableUntil:{year: this.minDate.getFullYear(), month:this.minDate.getMonth()+1 , day: this.minDate.getDate()-1},
         disableSince:{year: this.maxDate.getFullYear(), month:this.maxDate.getMonth()+1 , day: this.maxDate.getDate()},
         inline: false,
         indicateInvalidDate:true,
          showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
    };
  getEMIDetailsBYViolatorID(userEvents?: IUserEvents) {
    this.paymentDetailService.getEMIHeaderInfobyViolatorId(this.longViolatorid, userEvents).subscribe(
      res => {
        if (res) {
          this.eMIHeaderDetails = res;
          if (this.eMIHeaderDetails) {
            this.paymentAmount = this.eMIHeaderDetails[0].EMIDueAmount;
          }

        }
      }, (err) => {
      this.showErrorMsg(err.statusText.toString());
      });
  }

  viewTermsDetailsClick(eMIHeaderId: number) {
    this.isShowTermsGrid = true;
    this.getEMIdetailsbyEMIheaderId(eMIHeaderId);
  }

  getEMIdetailsbyEMIheaderId(eMIHeaderId: number) {
    this.paymentDetailService.getEMIdetailsbyEMIheaderId(eMIHeaderId).subscribe(
      res => {
        if (res) {
          this.eMITermDetails = res;
          for (var i = 0; i < this.eMITermDetails.length; i++) {
            this.eMITermDetails[i].isDispalyDueDate = true;
          }
        }
      }, (err) => {
       this.showErrorMsg(err.statusText.toString());
      });
  }

  exitClick() {
    this.vioPaymentContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  backClick() {
    this.vioPaymentContextService.changeResponse(null);
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }

  editGracePeriod(object, index) {
    object.isDispalyDueDate = false;
    object.IsExtentDueDate = false;
    object.isSelected = true;
  }
  editDefaultCount(object: any) {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgDesc = 'Are you sure you want to change the term default status?';
    this.editDefaultCountObject = object;
  }

  UpdateDefaultCount() {
    //User Events 

//     let postingDate = this.generateReportSearchForm.controls["postingDate"].value;
// if (postingDate != "" && postingDate != null) {
// let date = this.datePickerFormat.getFormattedDate(postingDate.date);
// this.setDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g,"");
// this.dailyRequest.PostingDate = this.setDate;
// }
// else {
// this.dailyRequest.PostingDate = null;
// }




    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
    userEvents.ActionName = Actions[Actions.TERMEDIT];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.updateRequestObj = <any>{};
    this.updateRequestObj.EMIDetailId = this.editDefaultCountObject.EMIdetailId;
    this.updateRequestObj.Username = this.sessionContextResponse.userName;
    this.updateRequestObj.CustomerId = this.longViolatorid;
    if (this.editDefaultCountObject.IsDefault)
      this.updateRequestObj.IsDefault = false;
    else
      this.updateRequestObj.IsDefault = true;
    this.paymentDetailService.updateTermDefaultCount(this.updateRequestObj, userEvents).subscribe(
      res => {
        if (res) {
          this.getEMIDetailsBYViolatorID();
          this.getEMIdetailsbyEMIheaderId(this.editDefaultCountObject.EMIHeaderId);
         this.showSucsMsg('Term defaulted status has been updated successfully');
        }
      }, (err) => {
      this.showErrorMsg(err.statusText.toString());
      });
  }

  updateGracePeriod(object: any, index) {
    
    if (this.startDate == undefined) {
     this.showErrorMsg('Please enter valid date');
      return false;
    }
    
    else {
      //User Events 
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.TERMEDIT];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longViolatorid;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.updateRequestObj = <any>{};
      this.updateRequestObj.EMIDetailId = object.EMIdetailId;
        
         let startDate = this.datePickerFormat.getFormattedDate(this.startDate.date);
        
       let date = new Date();
   
   //this.updatePrameterValue.StartEffectiveDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      let date1=new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
     //let date1 = new Date(this.startDate);
    
      console.log(date1);
      let date2 = new Date(this.eMITermDetails[index].EMITermDuedate);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var intDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.updateRequestObj.EMITermDuedate = date1.toLocaleString(defaultCulture).replace(/\u200E/g,""); //this.startDate
      //this.updateRequestObj.EMITermDuedate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      const strDateRange = new Date(this.eMITermDetails[index].EMIGraceperiod).toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
      var GracePeriod = new Date(this.eMITermDetails[index].EMIGraceperiod);
      GracePeriod.setDate(GracePeriod.getDate() + intDays);
      this.updateRequestObj.EMITermDuedateWithGracePeriod = GracePeriod;
      this.updateRequestObj.Username = this.sessionContextResponse.userName;
      this.updateRequestObj.CustomerId = this.longViolatorid;
      this.updateRequestObj.ActualTermDueDate = object.EMITermDuedate;
      console.log(date2,timeDiff,intDays,this.updateRequestObj.EMITermDuedateWithGracePeriod);
      this.paymentDetailService.updateEmiTermDueDate(this.updateRequestObj, userEvents).subscribe(
        res => {
          if (res) {
            this.getEMIDetailsBYViolatorID();
            this.getEMIdetailsbyEMIheaderId(object.EMIHeaderId);
            this.showSucsMsg('Term details has been updated successfully');
          }
        }, (err) => {
         this.showErrorMsg(err.statusText.toString());
        });
    }
  }

  cancelGracePeriod(object) {
    object.isDispalyDueDate = true;
    object.IsExtentDueDate = true;
    object.isSelected = false;
  }


  PayTermClick() {
    if (this.eMIHeaderDetails && this.eMIHeaderDetails.length) {
      if (this.eMIHeaderDetails[0].EMIStatus.toString().toUpperCase() != 'INIT' && this.eMIHeaderDetails[0].EMIStatus.toString().toUpperCase() != 'PARTIALPAID') {
      this.showErrorMsg('Initiate new payment plan for outstanding invoices to pay the term');
        return;
      }
    } else {
      this.showErrorMsg('Initiate new payment plan for outstanding invoices to pay the term');
      return;
    }
    this.isShowPaymentBlock = true;
    $('#paymentBlock').show();
    if (this.isShowPaymentBlock) {
      if (this.makePaymentComp != undefined) {
        this.vioPaymentContextService.currentContext.subscribe(res => {
          this.objPaymentRequest = res;
          if (this.objPaymentRequest == null || this.objPaymentRequest.CustomerId == 0) {
            this.makePaymentComp.InitialiZeObject(this.longViolatorid);
          } else {
            this.isShowPaymentBlock = true;
            this.paymentAmount = res.TxnAmount;
            this.makePaymentComp.setCustomerId(this.longViolatorid, "");
            this.makePaymentComp.bindDetailsOnBack(this.objPaymentRequest);
          }
        });
      }
    }
  }

  doPayment() {
    var res = this.paymentAmount.toString().match(/^[0-9]*(\.)?[0-9]{1,2}$/g);
    if (res == null) {
     this.showErrorMsg("Invalid amount in amount to be paid");
      return false;
    }
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.');
    }
    else if (this.paymentAmount <= 0) {
     this.showErrorMsg('Amount to be paid should be greater than zero.');
    } else {
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.VIEWPAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.PAYMENT];
      userEvents.SubFeatureName = SubFeatures[SubFeatures.PAYMENTPLANTERM];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longViolatorid;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {
      });
      this.objPaymentRequest = <IViolationPaymentrequest>{};
      this.objPaymentRequest.TxnAmount = parseFloat(this.paymentAmount.toString());
      this.objPaymentRequest.CustomerId = this.longViolatorid;
      this.objPaymentRequest.PaymentType = "TermPayment";
      this.objPaymentRequest.ViolationProcess = "TermPayment";
      this.objPaymentRequest.PaymentFor = "PayToEMI";
      this.objPaymentRequest.UserName = this.sessionContextResponse.userName;
      this.objPaymentRequest.LoginId = this.sessionContextResponse.loginId;
      this.objPaymentRequest.UserId = this.sessionContextResponse.userId;
      this.objPaymentRequest.ICNId = this.sessionContextResponse.icnId;
      this.objPaymentRequest.ActivitySource = ActivitySource.Internal;
      this.objPaymentRequest.SubSystem = SubSystem.TVC;
      this.objPaymentRequest.NavProcess = "TermPayment";
      this.objPaymentRequest.objEMIRequest = <any>{};
      if (this.eMIHeaderDetails && this.eMIHeaderDetails.length)
        this.objPaymentRequest.objEMIRequest.EmiHeaderId = this.eMIHeaderDetails[0].EMIHeaderId;
      this.vioPaymentContextService.changeResponse(this.objPaymentRequest);
      this.objPaymentRequest = this.makePaymentComp.DoViolationPayment(this.objPaymentRequest);
    }
  }

  doPaymentReset() {
    this.makePaymentComp.resetclick();
    this.vioPaymentContextService.changeResponse(null);
  }

  doPaymentCancel() {
    this.router.navigate(["/tvc/violatordetails/violator-summary"]);
    this.vioPaymentContextService.changeResponse(null);
  }

  closeTermDetails() {
    this.isShowTermsGrid = false;
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

  userAction(event) {
    if (event) {
      this.UpdateDefaultCount();
    }
  }
}
