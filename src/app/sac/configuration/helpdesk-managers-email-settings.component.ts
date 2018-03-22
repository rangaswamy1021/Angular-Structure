import { Component, OnInit } from '@angular/core';
import { IHelpdeskmanagerdetailsRequest } from './models/helpdeskmanagerdetailsrequest';
import { ConfigurationService } from './services/configuration.service';
import { SessionService } from '../../shared/services/session.service';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { IHelpdeskmanagerdetailsResponse } from './models/helpdeskmanagerdetailsresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { fail } from 'assert';
import { IUserEvents } from '../../shared/models/userevents';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-helpdesk-managers-email-settings',
  templateUrl: './helpdesk-managers-email-settings.component.html',
  styleUrls: ['./helpdesk-managers-email-settings.component.scss']
})
export class HelpdeskManagersEmailSettingsComponent implements OnInit {
  details: IHelpdeskmanagerdetailsResponse;
  department: any[] = [
    { "key": "CSC", "value": "Customer Service Center" },
    { "key": "TVC", "value": "Toll Violation Center" }
  ];
  bindDetails: IHelpdeskmanagerdetailsRequest = <IHelpdeskmanagerdetailsRequest>{};
  updateDetails: IHelpdeskmanagerdetailsRequest = <IHelpdeskmanagerdetailsRequest>{};
  managerDetails: IHelpdeskmanagerdetailsResponse[];
  hdmanager: FormGroup;
  isUpdate: boolean;
  editManagerId: number;
  disableUButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  emailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  constructor(private confService: ConfigurationService, private commonService: CommonService, private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService ) { }

  ngOnInit() {
         this.materialscriptService.material();
    this.isUpdate = false;
    this.hdmanager = new FormGroup({
      'department': new FormControl(''),
      'problemtype': new FormControl('', [Validators.required]),
      'managername': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)])
    });
    this.hdmanager.controls['department'].setValue(this.department[0].key);
    this.bindManagerDetails();
    this.disableUButton = !this.commonService.isAllowed(Features[Features.HELPDESKMANAGERSEMAILSETTINGS], Actions[Actions.UPDATE], "");
  }

  searchClick() {
    this.bindManagerDetails();
  }

  bindManagerDetails() {
    this.bindDetails = <IHelpdeskmanagerdetailsRequest>{};
    this.bindDetails.LoginId = this.context._customerContext.loginId;
    this.bindDetails.UserId = this.context._customerContext.userId;
    this.bindDetails.PerformedBy = this.context._customerContext.userName;
    this.bindDetails.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.bindDetails.ViewFlag = "GET";
    this.bindDetails.SubSystem = this.hdmanager.controls['department'].value;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.HELPDESKMANAGERSEMAILSETTINGS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.confService.BindManagerDetails(this.bindDetails, userEvents).subscribe(
      res => {
        this.managerDetails = res;
        console.log(this.managerDetails);
      });
  }

  onEditClick(hdmanagersettings: IHelpdeskmanagerdetailsResponse) {
    this.details = hdmanagersettings;
    this.editDetails(hdmanagersettings);
    let a=this;
    setTimeout(function(){
    a.materialscriptService.material();
  },1000)
  }

  editDetails(hdmanagersettings) {
    this.isUpdate = true;
    this.editManagerId = hdmanagersettings.ProblemTypeID;
    this.hdmanager.controls['problemtype'].setValue(hdmanagersettings.ProblemType);
    this.hdmanager.controls['managername'].setValue(hdmanagersettings.ManagerName);
    this.hdmanager.controls['email'].setValue(hdmanagersettings.EmailAddress);
    this.hdmanager.controls['problemtype'].disable(true);
  }

  updateClick() {
    this.onUpdateClick();
  }

  onUpdateClick() {
    if (this.hdmanager.valid) {
      this.updateDetails = <IHelpdeskmanagerdetailsRequest>{};
      this.updateDetails.ProblemTypeID = this.editManagerId;
      this.updateDetails.SubSystem = this.hdmanager.controls['department'].value;
      this.updateDetails.EmailAddress = this.hdmanager.controls['email'].value;
      this.updateDetails.ManagerName = this.hdmanager.controls['managername'].value;
      this.updateDetails.CreatedUser = this.context._customerContext.userName;
      this.updateDetails.LoginId = this.context._customerContext.loginId;
      this.updateDetails.UserId = this.context._customerContext.userId;
      this.updateDetails.PerformedBy = this.context._customerContext.userName;
      this.updateDetails.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.updateDetails.ViewFlag = "UPDATE";
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.HELPDESKMANAGERSEMAILSETTINGS];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;
      this.confService.UpdateManagerDetailsById(this.updateDetails, userEvents).subscribe(res => {
        if (res) {
          this.bindManagerDetails();
          this.isUpdate = false;
          const msg = 'Manager details are Updated Successfully';
          this.showSucsMsg(msg);
        } else {
          this.showErrorMsg('Unable to update Manager details');
        }
      });
    } else {
      this.validateAllFormFields(this.hdmanager);
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

  closeDiv(): void {
    this.isUpdate = false;
  }
  reset() {
    this.editDetails(this.details);
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
