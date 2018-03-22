import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { IFicalyearResponse } from "./models/fiscalyearresponse";
import { IFiscalyearRequest } from "./models/fiscalyearrequest";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { User } from "../../shared/models/user";
import { ConfigurationService } from "./services/configuration.service";
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features, defaultCulture } from '../../shared/constants';
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-manage-fiscal-year',
  templateUrl: './manage-fiscal-year.component.html',
  styleUrls: ['./manage-fiscal-year.component.scss']
})

export class ManageFiscalYearComponent implements OnInit {
  invalidDate: boolean;
  dateEndDisplay: any = '';
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  sessionContextResponse: IUserresponse;
  description: any;
  fiscalHeading: string;
  fiscalYearId: number;
  dateEnd: Date;
  addDetails: boolean;
  updateDetails: boolean;
  enterNewFiscalYearDetails: boolean;
  addNewFiscalYearDetails: boolean = true;
  addNewFiscalYearForm: FormGroup;
  objSystemActivities: ISystemActivities;
  objFiscalYearResponse: IFicalyearResponse[];
  objFiscalYearRequest: IFiscalyearRequest = <IFiscalyearRequest>{};
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '330px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };

  constructor(private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService, private objSessionService: SessionService, private commonService: CommonService, private configService: ConfigurationService, private router: Router) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.addNewFiscalYearForm = new FormGroup({
      'Name': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
      'Description': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('')
    });
    this.sessionContextResponse = this.objSessionService.customerContext;
    this.getFiscalYearDetails();
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.FISCALYEARCONFIG], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.FISCALYEARCONFIG], Actions[Actions.UPDATE], "");
  }

  cancelNewFiscalYear() {
    this.enterNewFiscalYearDetails = false;
    this.addNewFiscalYearDetails = true;
    this.addNewFiscalYearForm.reset();
    this.dateEnd = null;
    // this.dateEndDisplay = 'MM/DD/YYYY';
    this.addNewFiscalYearForm.controls['endDate'].setValue('');
    this.materialscriptService.material();
  }

  addNewFiscalYear() {
    this.addNewFiscalYearForm.get('Name').enable();
    this.addNewFiscalYearForm.get('startDate').enable();
    this.enterNewFiscalYearDetails = true;
    this.fiscalHeading = "Add";
    this.addNewFiscalYearDetails = false;
    this.addDetails = true;
    this.updateDetails = false;
    this.dateEnd = null;
    this.addNewFiscalYearForm.reset();
    // this.dateEndDisplay = 'MM/DD/YYYY';
    this.addNewFiscalYearForm.controls['endDate'].setValue('');
    // this.materialscriptService.material();
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  onDateFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }

  selectEndDate(event) {
    if (event.date.day != 0) {
      let date = this.datePickerFormatService.getFormattedDate(event.date);
      this.dateEnd = new Date(date);
      this.dateEnd.setFullYear(this.dateEnd.getFullYear() + 1);
      this.dateEnd.setDate(this.dateEnd.getDate() - 1);
      this.dateEndDisplay = (((this.dateEnd.getMonth() + 1) < 10) ? (+'0' + ((this.dateEnd.getMonth() + 1)).toString()) : (this.dateEnd.getMonth() + 1)) + '/' + ((this.dateEnd.getDate() < 10) ? (+'0' + (this.dateEnd.getDate()).toString()) : (this.dateEnd.getDate())) + '/' + this.dateEnd.getFullYear();
      this.addNewFiscalYearForm.controls['endDate'].setValue(this.dateEndDisplay);
      // this.dateEnd = new Date(event);
      // this.dateEnd.setFullYear(this.dateEnd.getFullYear() + 1);
      // this.dateEnd.setDate(this.dateEnd.getDate() - 1);
    } else {
      // this.dateEndDisplay = 'MM/DD/YYYY';
      this.addNewFiscalYearForm.controls['endDate'].setValue('');
    }
    this.materialscriptService.material();
  }

  getFiscalYearDetails(): void {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
    this.objSystemActivities.UserId = this.objSessionService.customerContext.userId;
    this.objSystemActivities.User = this.objSessionService.customerContext.userName;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configService.getFiscalyearDetails(this.objSystemActivities, userEvents).subscribe(res => {
      this.objFiscalYearResponse = res;
    });
  }

  submitNewFiscalYearDetails() {
    if (this.addNewFiscalYearForm.valid && this.invalidDate == false) {
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.CREATE];
      this.userEventsCalling(userEvents);
      this.objFiscalYearRequest.FiscalYearName = this.addNewFiscalYearForm.controls['Name'].value;
      this.objFiscalYearRequest.FiscalYearDesc = this.addNewFiscalYearForm.controls['Description'].value;
      let date = this.datePickerFormatService.getFormattedDate((this.addNewFiscalYearForm.controls['startDate'].value).date);
      this.objFiscalYearRequest.StartDate = new Date((new Date(date).toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.objFiscalYearRequest.EndDate = new Date((new Date(this.dateEnd).toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      // this.objFiscalYearRequest.StartDate = new Date((new Date(this.addNewFiscalYearForm.controls['startDate'].value).toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      // this.objFiscalYearRequest.EndDate = new Date((new Date(this.dateEnd).toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
      this.objFiscalYearRequest.User = this.objSessionService.customerContext.userName;
      this.objSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
      this.objSystemActivities.UserId = this.objSessionService.customerContext.userId;
      this.objSystemActivities.User = this.objSessionService.customerContext.userName;
      this.objSystemActivities.IsViewed = true;
      this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objFiscalYearRequest.systemActivities = this.objSystemActivities;
      this.configService.createFiscalyearDetails(this.objFiscalYearRequest, userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Fiscal Year has been created successfully.'
          // this.dateEndDisplay = 'MM/DD/YYYY';
          this.addNewFiscalYearForm.controls['endDate'].setValue('');
          this.getFiscalYearDetails();
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error'
          this.msgDesc = 'Error while creating the Fiscal Year.'
        }
        this.enterNewFiscalYearDetails = false;
        this.addNewFiscalYearDetails = true;
        this.addNewFiscalYearForm.reset();
        this.dateEnd = null;
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText;
      });

    }
    else {
      this.validateAllFormFields(this.addNewFiscalYearForm);
    }
  }

  //to validate forms
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) { }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  //Populating data to controls
  editFiscalYear(selectedrow) {
    let startDate = new Date();
    startDate = new Date(selectedrow.StartDate);
    // let enddate = new Date();
    // enddate = new Date(selectedrow.EndDate);
    this.enterNewFiscalYearDetails = true;
    this.addNewFiscalYearDetails = false;
    this.addDetails = false;
    this.updateDetails = true;
    this.fiscalHeading = "Update";
    this.description = selectedrow.FiscalYearDesc;
    this.fiscalYearId = selectedrow.FiscalYearId;
    this.addNewFiscalYearForm.controls['Name'].setValue(selectedrow.FiscalYearName);
    this.addNewFiscalYearForm.get('Name').disable();
    this.addNewFiscalYearForm.controls['Description'].setValue(selectedrow.FiscalYearDesc);

    this.addNewFiscalYearForm.patchValue({
      startDate: {
        date: {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate()
        }
      },
    });
    this.addNewFiscalYearForm.get('startDate').disable();
    let dateEnd = new Date(selectedrow.EndDate);
    this.dateEndDisplay = (((dateEnd.getMonth() + 1) < 10) ? (+'0' + ((dateEnd.getMonth() + 1)).toString()) : (dateEnd.getMonth() + 1)) + '/' + ((dateEnd.getDate() < 10) ? (+'0' + (dateEnd.getDate()).toString()) : (dateEnd.getDate())) + '/' + dateEnd.getFullYear();
    this.addNewFiscalYearForm.controls['endDate'].setValue(this.dateEndDisplay);
    this.dateEnd = dateEnd;
    this.addNewFiscalYearForm.get('endDate').disable();
    // this.materialscriptService.material();
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  updateFiscalYear() {
    if (this.addNewFiscalYearForm.valid) {
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.UPDATE];
      this.userEventsCalling(userEvents);
      this.objFiscalYearRequest.FiscalYearId = this.fiscalYearId;
      this.objFiscalYearRequest.FiscalYearName = this.addNewFiscalYearForm.controls['Name'].value;
      this.objFiscalYearRequest.FiscalYearDesc = this.addNewFiscalYearForm.controls['Description'].value;
      let date = this.datePickerFormatService.getFormattedDate((this.addNewFiscalYearForm.controls['startDate'].value).date);
      this.objFiscalYearRequest.StartDate = new Date((new Date(date).toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
      this.objFiscalYearRequest.EndDate = new Date((new Date(this.dateEnd).toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();;
      this.objFiscalYearRequest.User = this.objSessionService.customerContext.userName;
      this.objSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
      this.objSystemActivities.UserId = this.objSessionService.customerContext.userId;
      this.objSystemActivities.User = this.objSessionService.customerContext.userName;
      this.objSystemActivities.IsViewed = true;
      this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objFiscalYearRequest.systemActivities = this.objSystemActivities;
      this.configService.editFiscalYearDetails(this.objFiscalYearRequest, userEvents).subscribe(res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Fiscal Year has been updated successfully.'
          // this.dateEndDisplay = 'MM/DD/YYYY';
          this.addNewFiscalYearForm.controls['endDate'].setValue('');
          this.getFiscalYearDetails();
        }
        else {
          this.msgFlag = true;
          this.msgType = 'failure'
          this.msgDesc = 'Error while updating the Fiscal Year'
        }

      },
        err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          //this.msgTitle = '';
          return;
        }
      );
      this.enterNewFiscalYearDetails = false;
      this.addNewFiscalYearDetails = true;
      this.addNewFiscalYearForm.reset();
    }
    else {
      this.validateAllFormFields(this.addNewFiscalYearForm);
    }
  }


  userEventsCalling(userEvents) {
    // let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FISCALYEARCONFIG];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) { this.msgFlag = e; }
}
