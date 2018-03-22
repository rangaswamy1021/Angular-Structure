import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IAlertsAndCommunicationsRequest } from './models/alertandcommunicationsrequest';
import { IAlertandCommunicationResponse } from './models/alertsandcommunicationsresponse';
import { CommonService } from '../../shared/services/common.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ActivitySource, SubSystem, Features, Actions } from '../../shared/constants';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { SessionService } from '../../shared/services/session.service';
import { CustomerserviceService } from './services/customerservice.service';
import { isSuccess } from '@angular/http/src/http_utils';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-alerts-communications',
  templateUrl: './alerts-communications.component.html',
  styleUrls: ['./alerts-communications.component.scss']
})
export class AlertsCommunicationsComponent implements OnInit {
  responseAlertsAndCommunications: IAlertandCommunicationResponse[];
  alertsAndCommunicationrequest: IAlertsAndCommunicationsRequest;
  listAlertsAndCommunicationrequest: IAlertsAndCommunicationsRequest[] = [];
  customerId: number = 0;
  value: string;
  customerContextResponse: ICustomerContextResponse;
  disableButton: boolean = false;
  disableEditButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  constructor(private commonService: CommonService,
    private customerContext: CustomerContextService,
    private customerServiceService: CustomerserviceService
    , private context: SessionService, private router: Router,private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
      this.materialscriptService.material();
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (!this.commonService.isAllowed(Features[Features.ALERTSETTINGS], Actions[Actions.VIEW],
      this.customerContextResponse.AccountStatus)) {

    }
    if (!this.commonService.isAllowed(Features[Features.ALERTSETTINGS], Actions[Actions.VIEW],
      this.customerContextResponse.AccountStatus)) {

    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.ALERTSETTINGS], Actions[Actions.UPDATE],
      this.customerContextResponse.AccountStatus);
    if (this.customerContextResponse.AccountId > 0) {
      this.customerId = this.customerContextResponse.AccountId;
      let userEvent = this.userEvents();
      this.bindData(userEvent);
    }
  }

  bindData(userEvent: IUserEvents) {
    this.customerServiceService.getAlertsByCustomerId(this.customerId, userEvent).subscribe(
      res => {
        //console.log(res);
        this.responseAlertsAndCommunications = res;
      });
  }

  onChangeEventEMAIL(id, value) {
    if (value) {
      this.responseAlertsAndCommunications[id].NONEFLAG = 0;
      this.responseAlertsAndCommunications[id].EMAILFLAG = 1;
    }
    else {
      if (!this.responseAlertsAndCommunications[id].EMAILFLAG && !this.responseAlertsAndCommunications[id].MAILFlag)
        this.responseAlertsAndCommunications[id].NONEFLAG = 1;
      else
        this.responseAlertsAndCommunications[id].NONEFLAG = 0;

    }
    //console.log(this.responseAlertsAndCommunications);
  }

  onChangeEventSMS(id, value) {
    if (value) {
      this.responseAlertsAndCommunications[id].NONEFLAG = 0;
      this.responseAlertsAndCommunications[id].SMSFlag = 1;
    }
    else {
      if (!this.responseAlertsAndCommunications[id].EMAILFLAG && !this.responseAlertsAndCommunications[id].MAILFlag)
        this.responseAlertsAndCommunications[id].NONEFLAG = 1;
      else
        this.responseAlertsAndCommunications[id].NONEFLAG = 0;

    }
    // console.log(this.responseAlertsAndCommunications);
  }

  onChangeEventMAIL(id, value) {
    if (value) {
      this.responseAlertsAndCommunications[id].NONEFLAG = 0;
      this.responseAlertsAndCommunications[id].MAILFlag = 1;
    }
    else {
      if (!this.responseAlertsAndCommunications[id].EMAILFLAG && !this.responseAlertsAndCommunications[id].MAILFlag)
        this.responseAlertsAndCommunications[id].NONEFLAG = 1;
      else
        this.responseAlertsAndCommunications[id].NONEFLAG = 0;

    }
    // console.log(this.responseAlertsAndCommunications);
  }

  onChangeEventNot(id, value) {
    if (value) {
      this.responseAlertsAndCommunications[id].SMSFlag = 0;
      this.responseAlertsAndCommunications[id].EMAILFLAG = 0;
      this.responseAlertsAndCommunications[id].MAILFlag = 0;
      this.responseAlertsAndCommunications[id].NONEFLAG = 1;
    }
    else {
      this.responseAlertsAndCommunications[id].NONEFLAG = 0;
    }
    // console.log(this.responseAlertsAndCommunications);
    // else {
    //   this.responseAlertsAndCommunications[id].SMSFlag = 1;
    //   this.responseAlertsAndCommunications[id].EMAILFLAG = 1;
    //   this.responseAlertsAndCommunications[id].MAILFlag = 1;
    // }

  }


  private _bitMapValue: number;

  save() {
    // this.listAlertsAndCommunicationrequest = <IAlertsAndCommunicationsRequest[]>{};
    if (this.responseAlertsAndCommunications) {
      for (let i = 0; i < this.responseAlertsAndCommunications.length; i++) {
        this.alertsAndCommunicationrequest = <IAlertsAndCommunicationsRequest>{};
        this.alertsAndCommunicationrequest.CustomerId = this.customerId;
        this.alertsAndCommunicationrequest.AlertTypeId = this.responseAlertsAndCommunications[i].AlertTypeId;
        this._bitMapValue = 0;

        if (this.responseAlertsAndCommunications[i].SMSFlag == 1) {
          this._bitMapValue += this.responseAlertsAndCommunications[i].SMSBITMAPVALUE;
          this.alertsAndCommunicationrequest.SMSNoteText = "SMS - ON";
        }
        else {
          this.alertsAndCommunicationrequest.SMSNoteText = "SMS - OFF";
        }
        if (this.responseAlertsAndCommunications[i].MAILFlag == 1) {
          this._bitMapValue += this.responseAlertsAndCommunications[i].MAILBITMAPVALUE;
          this.alertsAndCommunicationrequest.MAILNoteText = "MAIL - ON";
        }
        else {
          this.alertsAndCommunicationrequest.MAILNoteText = "MAIL - OFF";
        }

        if (this.responseAlertsAndCommunications[i].EMAILFLAG == 1) {
          this._bitMapValue += this.responseAlertsAndCommunications[i].EMAILBITMAPVALUE;
          this.alertsAndCommunicationrequest.EMAILNoteText = "EMAIL - ON";
        }
        else {
          this.alertsAndCommunicationrequest.EMAILNoteText = "EMAIL - OFF";
        }
        if (this.responseAlertsAndCommunications[i].SMSFlag == 0 && this.responseAlertsAndCommunications[i].MAILFlag == 0 && this.responseAlertsAndCommunications[i].EMAILFLAG == 0) {
          this._bitMapValue = this.responseAlertsAndCommunications[i].NONEBITMAPVALUE;
        }
        this.alertsAndCommunicationrequest.BITMAPVALUE = this._bitMapValue;
        this.alertsAndCommunicationrequest.UpdatedUser = this.context.customerContext.userName;
        this.alertsAndCommunicationrequest.SubSystem = SubSystem[SubSystem.CSC];
        this.alertsAndCommunicationrequest.ActivityType = "ConfiguredAlerts";
        this.alertsAndCommunicationrequest.AlertType = this.responseAlertsAndCommunications[i].AlertTypeDesc;
        this.alertsAndCommunicationrequest.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.alertsAndCommunicationrequest.LinkSourceName = "CustomerAlerts";

        if (this.responseAlertsAndCommunications[i].NONEFLAG == 1) {
          this.alertsAndCommunicationrequest.SMSNoteText = "SMS - OFF";
          this.alertsAndCommunicationrequest.EMAILNoteText = "EMAIL - OFF";
          this.alertsAndCommunicationrequest.MAILNoteText = "MAIL - OFF";
        }
        this.listAlertsAndCommunicationrequest.push(this.alertsAndCommunicationrequest);
      }
      if (this.listAlertsAndCommunicationrequest.length) {
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.UPDATE];
        this.customerServiceService.alertSettingInsertOrUpdate(this.listAlertsAndCommunicationrequest, userEvent).subscribe(
          res => {
            this.responseAlertsAndCommunications = res;
          }
          , (err) => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = '';
            let userEvent = null;
            this.bindData(userEvent);
          }
          , () => {
            let userEvent = null;
            this.bindData(userEvent);
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Settings have been updated successfully";
            this.msgTitle = '';
          });
      }
      // console.log(this.listAlertsAndCommunicationrequest);

    }
  }
  reset() {
    let userEvent = null;
    this.bindData(userEvent);
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.ALERTSETTINGS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = this.customerContextResponse.AccountId;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
