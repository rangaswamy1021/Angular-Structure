import { Component, OnInit, ElementRef, ViewChild, Renderer, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ITagConfigurationResponse } from './models/tags-configurationsresponse';
import { ITagConfigurationRequest } from './models/tags-configurationsrequest';
import { ConfigurationService } from './services/configuration.service';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from '../../shared/models/userevents';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { CommonService } from '../../shared/services/common.service';
//import { IMyDpOptions } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-update-tags-configuration',
  templateUrl: './update-tags-configuration.component.html',
  styleUrls: ['./update-tags-configuration.component.scss']
})
export class UpdateTagsConfigurationComponent implements OnInit {

  invalidDepositDate: boolean;
  invalidDate: boolean;
  setDepositDate: Date;
  setDate: Date;
  @Input() id: number
  @Output() isUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() getTagsComp: EventEmitter<string> = new EventEmitter<string>();
  tagResponse: ITagConfigurationResponse;
  tag: ITagConfigurationRequest = <ITagConfigurationRequest>{};
  isSuccess: boolean = false;
  isEditMode = false;
  pageTitle: string = '';
  updateConf: FormGroup;
  isEditClicked: boolean;
  disableUButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  tagConfigId: number;


  // this.myDatePickerOptions = {
  //   // other options...
  //   dateFormat: 'mm/dd/yyyy',
  //   disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
  //   inline: false,
  //   indicateInvalidDate: true
  // };
  todayDate = new Date();

  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false,
   //disableSince: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() + 1 }, 
   disableUntil: { year: this.todayDate.getFullYear(), month: this.todayDate.getMonth() + 1, day: this.todayDate.getDate() - 1 },
  };

  constructor(private tagService: ConfigurationService, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private route: ActivatedRoute,
    private router: Router, private commonService: CommonService, private context: SessionService, public renderer: Renderer) { }

  @ViewChild('SuccessMessage') public SuccessMessage: ElementRef

  ngOnInit() {
    this.updateConf = new FormGroup({
      'protocol': new FormControl(''),
      'mounting': new FormControl(''),
      'tagfee': new FormControl('', [Validators.required]),
      'tagfeestartdate': new FormControl('', [Validators.required]),
      'tagdeposit': new FormControl('', [Validators.required]),
      'tagdepositstartdate': new FormControl('', [Validators.required])
    });
    this.tagResponse = this.tagService.getvalue();
    this.loadFieldstoUpdate(this.tagResponse);

    this.disableUButton = !this.commonService.isAllowed(Features[Features.TAGCONFIG], Actions[Actions.UPDATE], "");

  }

  loadFieldstoUpdate(tagconf: ITagConfigurationResponse) {
    this.tagConfigId = tagconf.TagConfigId;
    let startDate = new Date();
    startDate = new Date(tagconf.TagFeeStartEffectiveDate);
    let startDepositDate = new Date();
    startDepositDate = new Date(tagconf.TagDepositStartEffectiveDate);
    this.updateConf.patchValue({
      protocol: tagconf.Protocol,
      mounting: tagconf.Mounting,
      tagfee: tagconf.TagFee,
      tagfeestartdate: {
        date: {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate()
        }
      },
      tagdeposit: tagconf.TagDeposit,
      tagdepositstartdate: {
        date: {
          year: startDepositDate.getFullYear(),
          month: startDepositDate.getMonth() + 1,
          day: startDepositDate.getDate()
        }
      },
    });
    this.updateConf.controls['protocol'].disable(true);
    this.updateConf.controls['mounting'].disable(true);
  }

  UpdateTag() {
    if (this.updateConf.valid) {
      this.tag.TagFee = this.updateConf.controls['tagfee'].value;
      this.tag.TagDeposit = this.updateConf.controls['tagdeposit'].value;

      // this.tag.TagFeeStartEffectiveDate = this.updateConf.controls['tagfeestartdate'].value;
      // this.tag.TagDepositStartEffectiveDate = this.updateConf.controls['tagdepositstartdate'].value;

      let startFeeDate = this.updateConf.controls["tagfeestartdate"].value;
      if (startFeeDate != "" && startFeeDate != null) {
        let feedate = this.datePickerFormat.getFormattedDate(startFeeDate.date);
        this.setDate = new Date(feedate.getFullYear(), feedate.getMonth(), feedate.getDate() + 1);
        this.tag.TagFeeStartEffectiveDate = this.setDate;
      }
      let startDepositDate = this.updateConf.controls["tagdepositstartdate"].value;
      if (startDepositDate != "" && startDepositDate != null) {
        let depositdate = this.datePickerFormat.getFormattedDate(startDepositDate.date);
        this.setDepositDate = new Date(depositdate.getFullYear(), depositdate.getMonth(), depositdate.getDate() + 1);
        this.tag.TagDepositStartEffectiveDate = this.setDepositDate;
      }

      this.tag.UpdateUser = this.context._customerContext.userName;
      this.tag.TagConfigId = this.tagConfigId;
      this.tag.UserId = this.context._customerContext.userId;
      this.tag.LoginId = this.context._customerContext.loginId;
      this.tag.ActivitySource = ActivitySource[ActivitySource.Internal];
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TAGCONFIG];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.tagService.UpdateTagConfigurations(this.tag, userEvents).subscribe(res => {
        this.isSuccess = res;
        if (this.isSuccess) {
          this.getTagsComp.emit('success');
          this.isUpdate.emit(false);
          const msg = 'Tag Configurations updated Successfully';
          this.showSucsMsg(msg);
        }
        else {
          this.showErrorMsg('Unable to update Tag Configurations');
        }
      });
    } else {
      this.validateAllFormFields(this.updateConf);
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
    this.isUpdate.emit(false);
  }


  /* Date picker code */
  minDate = new Date(Date.now());
  maxDate = new Date(2038, 9, 15);
  _bsValue: Date = new Date();
  get bsValue(): Date {
    return this._bsValue;
  }

  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onFeeDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.updateConf.controls["tagfeestartdate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  onDepositDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.updateConf.controls["tagdepositstartdate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDepositDate = true;

      return;
    }
    else
      this.invalidDepositDate = false;

  }

}



