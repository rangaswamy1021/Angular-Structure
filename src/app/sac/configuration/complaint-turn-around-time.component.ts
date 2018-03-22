import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from './services/configuration.service';
import { SessionService } from '../../shared/services/session.service';
import { IComplaintturnaroundtimeRequest } from './models/complaintturnaroundtimerequest';
import { ActivitySource, Features, Actions } from '../../shared/constants';
import { IComplaintturnaroundtimeResponse } from './models/complaintturnaroundtimeresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from '../../shared/models/userevents';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-complaint-turn-around-time',
  templateUrl: './complaint-turn-around-time.component.html',
  styleUrls: ['./complaint-turn-around-time.component.scss']
})
export class ComplaintTurnAroundTimeComponent implements OnInit {
  details: IComplaintturnaroundtimeResponse;
  getComplaintConf: IComplaintturnaroundtimeRequest = <IComplaintturnaroundtimeRequest>{};
  updateComplaintConf: IComplaintturnaroundtimeRequest = <IComplaintturnaroundtimeRequest>{};
  complaintconf: IComplaintturnaroundtimeResponse[];
  complaintConf: FormGroup;
  isUpdate: boolean;
  editConfId: number;
  disableUButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private confService: ConfigurationService, private commonService: CommonService, private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService ) { }

  ngOnInit() {
         this.materialscriptService.material();
    this.getComplaintConfigurations();
    this.isUpdate = false;

    this.complaintConf = new FormGroup({
      'complaint-severity': new FormControl('', [Validators.required]),
      'complaint-time': new FormControl('', [Validators.required])
    });
    this.disableUButton = !this.commonService.isAllowed(Features[Features.INVOICETEXT], Actions[Actions.UPDATE], "");
  }

  getComplaintConfigurations() {
    this.getComplaintConf = <IComplaintturnaroundtimeRequest>{};
    this.getComplaintConf.LoginId = this.context._customerContext.loginId;
    this.getComplaintConf.UserId = this.context._customerContext.userId;
    this.getComplaintConf.PerformedBy = this.context._customerContext.userName;
    this.getComplaintConf.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getComplaintConf.ViewFlag = "GET";
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.COMPLAINTTURNAROUNDTIME];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.confService.GetComplaintTurnAroundTimes(this.getComplaintConf, userEvents).subscribe(
      res => {
        this.complaintconf = res;
      });
  }


  onEditClick(confs: IComplaintturnaroundtimeResponse) {
    this.details = confs;
    this.editDetails(confs);
      this.materialscriptService.material();
    
  }

  editDetails(confs) {
    this.isUpdate = true;
    this.editConfId = confs.SeverityID;
    this.complaintConf.controls['complaint-severity'].setValue(confs.ComplaintSeverity);
    this.complaintConf.controls['complaint-time'].setValue(confs.TurnAroundTime);
    this.complaintConf.controls['complaint-severity'].disable(true);
  }

  closeDiv(): void {
    this.isUpdate = false;
  }
  reset() {
    this.editDetails(this.details);
  }

  onUpdateClick() {
    if (this.complaintConf.valid) {
      this.updateComplaintConf = <IComplaintturnaroundtimeRequest>{};
      this.updateComplaintConf.SeverityID = this.editConfId;
      this.updateComplaintConf.TurnAroundTime = this.complaintConf.controls['complaint-time'].value;
      this.updateComplaintConf.CreatedUser = this.context._customerContext.userName;
      this.updateComplaintConf.LoginId = this.context._customerContext.loginId;
      this.updateComplaintConf.UserId = this.context._customerContext.userId;
      this.updateComplaintConf.PerformedBy = this.context._customerContext.userName;
      this.updateComplaintConf.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.updateComplaintConf.ViewFlag = "UPDATE";
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.COMPLAINTTURNAROUNDTIME];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.confService.UpdateComplaintTurnAroundTimesById(this.updateComplaintConf, userEvents).subscribe(res => {
        if (res) {
          this.getComplaintConfigurations();
          this.isUpdate = false;          
          const msg = 'Complaint Turn Around Time Configuration is Updated Successfully';
          this.showSucsMsg(msg);
        } else {          
          this.showErrorMsg('Unable to update Complaint Turn Around Time Configurations');
        }
      });
    } else {
      this.validateAllFormFields(this.complaintConf);
    }
  }


  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
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

}
