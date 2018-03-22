import { ComplaintContextService } from './../shared/services/complaint.context.service';
import { IComplaintContextresponse } from './../shared/models/complaintcontextresponse';
import { Router } from '@angular/router';
import { IAssignStatusRequest } from './models/assignstatusrequest';
import { IStatusupdateRequest } from './models/statusupdaterequest';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ISearchRequest } from "./models/searchrequest";
import { IProblemStatusResponse } from "./models/problem-statusresponse";
import { HelpDeskService } from "./services/helpdesk.service";
import { SessionService } from "../shared/services/session.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { IComplaintResponse } from "../shared/models/complaintsresponse";
import { ComplaintStatus, SubSystem, Features, Actions, defaultCulture } from "../shared/constants";
import { IUserEvents } from '../shared/models/userevents';
//date picker imports
import { isDate } from "util";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-pm-popup',
  templateUrl: './pm-popup.component.html',
  styleUrls: ['./pm-popup.component.scss']
})
export class PmPopupComponent implements OnInit {
  invalidDate: boolean;
  childResponse: [IComplaintResponse[]];
  allowed: IProblemStatusResponse[];
  assignStatus: IAssignStatusRequest;
  arrStatus = [];
  dateFrom: Date;
  arrProblemId = [];
  arrTicketID = [];
  arrOpenedDate = [];
  problemID: string = "";
  updateInfo: IStatusupdateRequest;
  complaintResp: IComplaintResponse[];
  myDatePickerOptions: ICalOptions;
  //toDaydate =new Date();
  // myDatePickerOptions: IMyDpOptions = {dateFormat: 'mm/dd/yyyy', disableSince: { year:this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 }, sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };
  popup: FormGroup;
  searchComplaint: ISearchRequest;
  buttonClick: IProblemStatusResponse;
  usersdropdown: any;
  notes: string = "";
  errorNotes: string = "";
  internalUsers: IInternalUsers[] = [];
  subSystem: string = SubSystem[SubSystem.CSC];
  strProblemId: string;
  ptype: string;
  currentSubSystem: string;
  allowedProblems: string[] = [];
  notAllowedProblems: string[] = [];
  isAllowShow: boolean = false;
  isNotAllowShow: boolean = false;
  errorBlock: boolean = false;
  daysDiff: any;
  toDayDate: Date = new Date();
  referrenceURL: string;
  successBlock: boolean;
  errorMessage: string;
  successMessage: string;
  complaintContext: IComplaintContextresponse;
  featureName: string;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  department: any[] = [
    { "key": "CSC", "value": "Customer Service Center" },
    { "key": "TVC", "value": "Toll Violation Center" }
  ];

  @Output() handleMsg: EventEmitter<string> = new EventEmitter<string>();
  @Output() getManageComp: EventEmitter<string> = new EventEmitter<string>();
  constructor(private helpService: HelpDeskService, private context: SessionService, private customerContextService: CustomerContextService, private datePickerFormat: DatePickerFormatService, private router: Router, private complaintContextService: ComplaintContextService, private materialscriptService: MaterialscriptService) {

  }

  ngOnInit() {
    this.materialscriptService.material();
    console.log('currentSubSystem popup1:' + this.currentSubSystem);
    console.log('currentSubSystem url1:' + this.router.url);
    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
      this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
    }

    if(this.currentSubSystem===SubSystem[SubSystem.CSC]){
      this.department = [
        { "key": "TVC", "value": "Toll Violation Center" }
      ];
    } else{
      this.department = [
        { "key": "CSC", "value": "Customer Service Center" }
      ];
    }
    this.getDropdownValues();

    console.log("Complaint Resp pop up3: " + this.complaintResp);
    console.log('currentSubSystem popup3:' + this.currentSubSystem);

    this.popup = new FormGroup({
      'onholddate': new FormControl('', [Validators.required]),
      'onholdnotes': new FormControl('', [Validators.required]),
      'reopendate': new FormControl('', [Validators.required]),
      'reopennotes': new FormControl('', [Validators.required]),
      'departmentdropdown': new FormControl('', [Validators.required]),
      'transfernotes': new FormControl('', [Validators.required]),
      'usersdropdown': new FormControl('', [Validators.required]),
      'assignnotes': new FormControl('', [Validators.required]),
      'reassignusersdropdown': new FormControl('', [Validators.required]),
      'reassignnotes': new FormControl('', [Validators.required]),
      'resolvedate': new FormControl('', [Validators.required]),
      'resolverca': new FormControl('', [Validators.required]),
      'resolveresolution': new FormControl('', [Validators.required]),
      'rejectdate': new FormControl('', [Validators.required]),
      'rejectrca': new FormControl('', [Validators.required]),
      'rejectresolution': new FormControl('', [Validators.required]),
      'closedate': new FormControl('', [Validators.required]),
      'closenotes': new FormControl('', [Validators.required])
    });



    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
      disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() -1 },
      inline: false,
      indicateInvalidDate: true,
      alignSelectorRight: false,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false
    };
  }
  accessContext(contextstatus: string) {
    this.ptype = contextstatus;
    this.helpService.currentContext
      .subscribe(customerContext => {
        this.complaintResp = customerContext;
        console.log("Complaint Resp pop up2: " + this.complaintResp)
        console.log("ptype ---popup--2" + this.ptype);
        this.arrProblemId = [];
        this.arrTicketID = [];
        this.arrOpenedDate = [];
        this.problemIdList();
        this.getAllowedTickets();
      }
      );
  }

  getDropdownValues() {

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;
    console.log("dropdown----" + this.currentSubSystem);
    this.helpService.getInterUserDetails(this.currentSubSystem).subscribe(
      res => {
        this.usersdropdown = res;
        console.log(this.usersdropdown);

        for (var key in this.usersdropdown) {
          if (this.usersdropdown.hasOwnProperty(key)) {

            let inter = <IInternalUsers>{};
            inter.name = key;
            inter.id = this.usersdropdown[key];
            this.internalUsers.push(inter);
          }
        }

      }
    );
  }


  problemIdList() {
    if (this.complaintResp) {
      for (let i = 0; i < this.complaintResp.length; i++) {
        this.arrProblemId.push(this.complaintResp[i].ProblemId);
        this.arrTicketID.push(this.complaintResp[i].TicketId);
        this.arrOpenedDate.push(this.complaintResp[i].DateOccurred);
      }
    }
  }

  getAllowedTickets() {
    this.assignStatus = <IAssignStatusRequest>{};
    this.assignStatus.TicketIdCSV = this.arrTicketID.toString();
    this.assignStatus.Status = this.ptype;
    this.helpService.getAllowedTicketsForAction(this.assignStatus).subscribe(
      res => {
        this.allowed = res;
        this.checkAllowedTickets(this.assignStatus.Status);
      });
  }
  onDateChanged(event: IMyInputFieldChanged) {

    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }

  checkAllowedTickets(status: string) {
    if (this.allowed) {
      this.notes = "";
      this.problemID = "";
      for (let i = 0; i < this.allowed.length; i++) {
        if (this.allowed[i].IsAllowed) {
          this.allowedProblems.push(this.allowed[i].TicketId);
          this.notes = "Complaint(s) can be " + status + ":" + this.arrTicketID + "\n";
          this.isAllowShow = true;
          this.isNotAllowShow = false;
        }
        else {
          this.notAllowedProblems.push(this.allowed[i].TicketId);
          this.problemID = "Complaint(s) cannnot be " + status + ":" + this.arrTicketID + "\n";
          this.isNotAllowShow = true;
          this.isAllowShow = false;
        }
      }
    }
  }


  getChildIdsByProblemId() {
    this.helpService.getChildIdsByProblemId(this.strProblemId).subscribe(res => {
      this.childResponse = res;
    });
  }

  reset() {
    this.popup.reset();
    this.materialscriptService.material();
  }

  onCancelClicked() {
    this.notes = "";
    this.problemID = "";
    this.arrTicketID = [];
    this.popup.reset();
  }

  //popup button click start
  onholdClicked() {
    if (!this.invalidDate) {
      if ((this.popup.controls['onholddate'].value != '' && this.popup.controls['onholddate'].value != null) &&
        (this.popup.controls['onholdnotes'].value != '' && this.popup.controls['onholdnotes'].value != null)) {
        this.updateInfo = <IStatusupdateRequest>{};
        //my changes
        let onHoldDate = this.popup.controls['onholddate'].value;
        let date = this.datePickerFormat.getFormattedDate(onHoldDate.date);
        //previous code
        // let date: Date = new Date(this.popup.get('onholddate').value);
        if (this.popup.get('onholddate').value && this.popup.controls['onholdnotes'].value) {
          for (let i = 0; i < this.arrOpenedDate.length; i++) {
            let daysDiff = date.getDate() - new Date(this.arrOpenedDate[i]).getDate();
            if (daysDiff >= 0) {
              // this.updateInfo.DateRCA = new Date(this.popup.get('onholddate').value);
              //this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
              this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(),23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
              this.updateInfo.ProblemAbstract = this.popup.controls['onholdnotes'].value;
              this.updateInfo.Status = this.ptype;
              this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
              this.updateInfo.RecordedBy = this.context.customerContext.userId;
              this.updateInfo.UserName = this.context.customerContext.userName;
              this.updateInfo.OwnerId = 0;
              this.updateInfo.ProblemRCA = "";
              this.updateInfo.SubSystem = this.currentSubSystem;
              this.updateInfo.UserId = this.context.customerContext.userId;
              let userEvents = <IUserEvents>{};
              userEvents.FeatureName = this.featureName;
              userEvents.ActionName = Actions[Actions.ONHOLD];
              userEvents.PageName = this.router.url;
              userEvents.CustomerId = 0;
              userEvents.RoleId = parseInt(this.context._customerContext.roleID);
              userEvents.UserName = this.context._customerContext.userName;
              userEvents.LoginId = this.context._customerContext.loginId;

              this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
                (res => {
                  let msg = 'Complaint(s) has been on hold successfully';
                  this.showSucsMsg(msg);
                  this.popup.reset();
                  $('#onhold-dialog').modal('hide');
                  this.getManageComp.emit('success');
                },
                (err) => {
                  this.showErrorMsg('Error while onhold complaint');
                });
            }
            else {
              this.errorBlock = true;
              this.errorNotes = "Date should not be less than Complaint Date.";
            }
          }
        } else {
          this.errorBlock = true;
          this.errorNotes = "On Hold Date, Notes cannot be Empty.";
        }
      } else {
        this.validateAllFormFields(this.popup);
      }
    }
  }

  onreopenClicked() {
    if (!this.invalidDate) {
      if ((this.popup.controls['reopendate'].value != '' && this.popup.controls['reopendate'].value != null) &&
        (this.popup.controls['reopennotes'].value != '' && this.popup.controls['reopennotes'].value != null)) {
        this.updateInfo = <IStatusupdateRequest>{};
        //my changes
        let onReopenDate = this.popup.controls['reopendate'].value;
        let date = this.datePickerFormat.getFormattedDate(onReopenDate.date);
        //previous code
        //let date: Date = new Date(this.popup.get('onholddate').value);
        if (this.popup.get('reopendate').value && this.popup.controls['reopennotes'].value) {
          for (let i = 0; i < this.arrOpenedDate.length; i++) {
            let daysDiff = date.getDate() - new Date(this.arrOpenedDate[i]).getDate();
            if (daysDiff >= 0) {
              // this.updateInfo.DateRCA = this.popup.controls['reopendate'].value;
              //this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
              this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(),23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
              this.updateInfo.ProblemAbstract = this.popup.controls['reopennotes'].value;
              this.updateInfo.Status = this.ptype;
              this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
              this.updateInfo.RecordedBy = this.context.customerContext.userId;
              this.updateInfo.UserName = this.context.customerContext.userName;
              this.updateInfo.OwnerId = 0;
              this.updateInfo.ProblemRCA = '';
              this.updateInfo.SubSystem = this.currentSubSystem;
              let userEvents = <IUserEvents>{};
              userEvents.FeatureName = this.featureName;
              userEvents.ActionName = Actions[Actions.REOPEN];
              userEvents.PageName = this.router.url;
              userEvents.CustomerId = 0;
              userEvents.RoleId = parseInt(this.context._customerContext.roleID);
              userEvents.UserName = this.context._customerContext.userName;
              userEvents.LoginId = this.context._customerContext.loginId;
              this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
                (res => {
                  if (res) {
                    let msg = 'Complaint(s) has been reopened successfully';
                    this.showSucsMsg(msg);
                    this.popup.reset();
                    $('#reopen-dialog').modal('hide');
                    this.getManageComp.emit('success');
                  }
                },
                (err) => {
                  this.showErrorMsg('Error while reopening complaint');
                  console.log(err);
                });
            }
            else {
              this.errorBlock = true;
              this.errorNotes = "Date should not be less than Complaint Date.";
            }
          }
        } else {
          this.errorBlock = true;
          this.errorNotes = "Re Open Date, Notes cannot be Empty.";
        }
      } else {
        this.validateAllFormFields(this.popup);
      }
    }
  }
  ontransferClicked() {
    if ((this.popup.controls['departmentdropdown'].value != '' && this.popup.controls['departmentdropdown'].value != null) &&
      (this.popup.controls['transfernotes'].value != '' && this.popup.controls['transfernotes'].value != null)) {      
      this.updateInfo = <IStatusupdateRequest>{};
      this.updateInfo.DateRCA = new Date();
      this.updateInfo.SubSystem = this.popup.controls['departmentdropdown'].value;
      this.updateInfo.ProblemAbstract = this.popup.controls['transfernotes'].value;
      this.updateInfo.Status = this.ptype;
      this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
      this.updateInfo.RecordedBy = this.context.customerContext.userId;
      this.updateInfo.UserName = this.context.customerContext.userName;
      this.updateInfo.OwnerId = 0;
      this.updateInfo.ProblemRCA = '';
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureName;
      userEvents.ActionName = Actions[Actions.TRANSFER];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;
      this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
        (res => {
          if (res) {
            let msg = 'Complaint(s) has been transferred successfully';
            this.showSucsMsg(msg);
            this.popup.reset();
            $('#transfer-dialog').modal('hide');
            this.getManageComp.emit('success');
          }
        },
        (err) => {
          this.showErrorMsg('Error while transferring complaint');
          console.log(err);
        });
    } else {
      this.validateAllFormFields(this.popup);
    }
  }

  onassignClicked() {
    if ((this.popup.controls['usersdropdown'].value != '' && this.popup.controls['usersdropdown'].value != null) &&
      (this.popup.controls['assignnotes'].value != '' && this.popup.controls['assignnotes'].value != null)) {
      this.updateInfo = <IStatusupdateRequest>{};
      this.updateInfo.DateRCA = new Date();
      this.updateInfo.OwnerId = this.popup.controls['usersdropdown'].value;
      this.updateInfo.ProblemAbstract = this.popup.controls['assignnotes'].value;
      this.updateInfo.Status = this.ptype;
      this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
      this.updateInfo.RecordedBy = this.context.customerContext.userId;
      this.updateInfo.UserName = this.context.customerContext.userName;
      this.updateInfo.ProblemRCA = '';
      this.updateInfo.SubSystem = this.currentSubSystem;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureName;
      userEvents.ActionName = Actions[Actions.ASSIGN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;
      this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
        (res => {
          if (res) {
            let msg = 'Complaint(s) has been assigned successfully';
            this.showSucsMsg(msg);
            this.popup.reset();
            $('#assign-dialog').modal('hide');
            this.getManageComp.emit('success');
          }
        },
        (err) => {
          this.showErrorMsg('Error while assigning complaint');
          console.log(err);
        });
    } else {
      this.validateAllFormFields(this.popup);
    }
  }

  onreassignClicked() {
    if ((this.popup.controls['reassignusersdropdown'].value != '' && this.popup.controls['reassignusersdropdown'].value != null) &&
      (this.popup.controls['reassignnotes'].value != '' && this.popup.controls['reassignnotes'].value != null)) {
      this.updateInfo = <IStatusupdateRequest>{};
      this.updateInfo.DateRCA = new Date();
      this.updateInfo.OwnerId = this.popup.controls['reassignusersdropdown'].value;
      this.updateInfo.ProblemAbstract = this.popup.controls['reassignnotes'].value;
      this.updateInfo.Status = this.ptype;
      this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
      this.updateInfo.RecordedBy = this.context.customerContext.userId;
      this.updateInfo.UserName = this.context.customerContext.userName;
      this.updateInfo.ProblemRCA = '';
      this.updateInfo.SubSystem = this.currentSubSystem;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureName;
      userEvents.ActionName = Actions[Actions.REASSIGN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;
      this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
        (res => {
          let msg = 'Complaint(s) has been reassigned successfully';
          this.showSucsMsg(msg);
          this.popup.reset();
          $('#reassign-dialog').modal('hide');
          this.getManageComp.emit('success');
        },
        (err) => {
          this.showErrorMsg('Error while re-assigning complaint');
        });
    } else {
      this.validateAllFormFields(this.popup);
    }
  }

  onresolveClicked() {
    if (!this.invalidDate) {
      if ((this.popup.controls['resolvedate'].value != '' && this.popup.controls['resolvedate'].value != null) &&
        (this.popup.controls['resolverca'].value != '' && this.popup.controls['resolverca'].value != null) &&
        (this.popup.controls['resolveresolution'].value != '' && this.popup.controls['resolveresolution'].value != null)) {
        this.updateInfo = <IStatusupdateRequest>{};
        //my changes
        let onResolveDate = this.popup.controls['resolvedate'].value;
        let date = this.datePickerFormat.getFormattedDate(onResolveDate.date);
        //previous code

        //let date: Date = new Date(this.popup.get('resolvedate').value);
        if ((this.popup.get('resolvedate').value) != "") {
          for (let i = 0; i < this.arrOpenedDate.length; i++) {
            let daysDiff = date.getDate() - new Date(this.arrOpenedDate[i]).getDate();
            if (daysDiff >= 0) {
              //this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
              this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(),23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
              //this.updateInfo.DateRCA = this.popup.controls['resolvedate'].value;
              this.updateInfo.ProblemAbstract = this.popup.controls['resolveresolution'].value;
              this.updateInfo.Status = this.ptype;
              this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
              this.updateInfo.RecordedBy = this.context.customerContext.userId;
              this.updateInfo.UserName = this.context.customerContext.userName;
              this.updateInfo.OwnerId = 0;
              this.updateInfo.ProblemRCA = this.popup.controls['resolverca'].value;
              this.updateInfo.SubSystem = this.currentSubSystem;
              let userEvents = <IUserEvents>{};
              userEvents.FeatureName = this.featureName;
              userEvents.ActionName = Actions[Actions.RESOLVE];
              userEvents.PageName = this.router.url;
              userEvents.CustomerId = 0;
              userEvents.RoleId = parseInt(this.context._customerContext.roleID);
              userEvents.UserName = this.context._customerContext.userName;
              userEvents.LoginId = this.context._customerContext.loginId;
              this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
                (res => {
                  let msg = 'Complaint(s) has been resolved successfully';
                  this.showSucsMsg(msg);
                  this.popup.reset();
                  $('#resolve-dialog').modal('hide');
                  this.getManageComp.emit('success');
                },
                (err) => {
                  this.showErrorMsg('Error while resolving complaint');
                });
            }
            else {
              this.errorBlock = true;
              this.errorNotes = "Date should not be less than Complaint Date.";
            }
          }
        } else {
          this.errorBlock = true;
          this.errorNotes = "Complaint has been " + status + " successful.";
        }
      } else {
        this.validateAllFormFields(this.popup);
      }
    }
  }
  onrejectClicked() {
    if (!this.invalidDate) {
      if ((this.popup.controls['rejectdate'].value != '' && this.popup.controls['rejectdate'].value != null) &&
        (this.popup.controls['rejectrca'].value != '' && this.popup.controls['rejectrca'].value != null) &&
        (this.popup.controls['rejectresolution'].value != '' && this.popup.controls['rejectresolution'].value != null)) {
        this.updateInfo = <IStatusupdateRequest>{};
        //my changes
        let onRejectDate = this.popup.controls['rejectdate'].value;
        let date = this.datePickerFormat.getFormattedDate(onRejectDate.date);
        //previous code
        //let date: Date = new Date(this.popup.get('rejectdate').value);
        if ((this.popup.get('rejectdate').value) != "") {
          for (let i = 0; i < this.arrOpenedDate.length; i++) {
            let daysDiff = date.getDate() - new Date(this.arrOpenedDate[i]).getDate();
            if (daysDiff >= 0) {
              //this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
              this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(),23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
              //this.updateInfo.DateRCA = this.popup.controls['rejectdate'].value;
              this.updateInfo.ProblemAbstract = this.popup.controls['rejectresolution'].value;
              this.updateInfo.Status = this.ptype;
              this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
              this.updateInfo.RecordedBy = this.context.customerContext.userId;
              this.updateInfo.UserName = this.context.customerContext.userName;
              this.updateInfo.OwnerId = 0;
              this.updateInfo.ProblemRCA = this.popup.controls['rejectrca'].value;
              this.updateInfo.SubSystem = this.currentSubSystem;
              let userEvents = <IUserEvents>{};
              userEvents.FeatureName = this.featureName;
              userEvents.ActionName = Actions[Actions.REJECT];
              userEvents.PageName = this.router.url;
              userEvents.CustomerId = 0;
              userEvents.RoleId = parseInt(this.context._customerContext.roleID);
              userEvents.UserName = this.context._customerContext.userName;
              userEvents.LoginId = this.context._customerContext.loginId;
              this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
                (res => {
                  let msg = "Complaint(s) has been" + this.updateInfo.Status.toLowerCase() + " successfully";
                  this.showSucsMsg(msg);
                  this.popup.reset();
                  $('#reject-dialog').modal('hide');
                  this.getManageComp.emit('success');
                },
                (err) => {
                  this.showErrorMsg('Error while rejecting complaint');
                });
            }
            else {
              this.errorBlock = true;
              this.errorNotes = "Date should not be less than Complaint Date.";
            }
          }
        } else {
          this.errorBlock = true;
          this.errorNotes = "Complaint has been " + status + " successful.";
        }
      } else {
        this.validateAllFormFields(this.popup);
      }
    }
  }
  oncloseClicked() {
    if (!this.invalidDate) {
      if ((this.popup.controls['closedate'].value != '' && this.popup.controls['closedate'].value != null) &&
        (this.popup.controls['closenotes'].value != '' && this.popup.controls['closenotes'].value != null)) {

        this.updateInfo = <IStatusupdateRequest>{};

        //my changes
        let onCloseDate = this.popup.controls['closedate'].value;
        let date = this.datePickerFormat.getFormattedDate(onCloseDate.date);
        //previous code
        //let date: Date = new Date(this.popup.get('closedate').value);
        if ((this.popup.get('closedate').value) != "") {
          for (let i = 0; i < this.arrOpenedDate.length; i++) {
            let daysDiff = date.getDate() - new Date(this.arrOpenedDate[i]).getDate();
            if (daysDiff >= 0) {
              //this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
              this.updateInfo.DateRCA = new Date(date.getFullYear(), date.getMonth(), date.getDate(),23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
              //this.updateInfo.DateRCA = this.popup.controls['closedate'].value;
              this.updateInfo.ProblemAbstract = this.popup.controls['closenotes'].value;
              this.updateInfo.Status = this.ptype;
              this.updateInfo.ProblemIdCSV = this.arrProblemId.toString();
              this.updateInfo.RecordedBy = this.context.customerContext.userId;
              this.updateInfo.UserName = this.context.customerContext.userName;
              this.updateInfo.OwnerId = 0;
              this.updateInfo.ProblemRCA = '';
              this.updateInfo.SubSystem = this.currentSubSystem;
              let userEvents = <IUserEvents>{};
              userEvents.FeatureName = this.featureName;
              userEvents.ActionName = Actions[Actions.CLOSE];
              userEvents.PageName = this.router.url;
              userEvents.CustomerId = 0;
              userEvents.RoleId = parseInt(this.context._customerContext.roleID);
              userEvents.UserName = this.context._customerContext.userName;
              userEvents.LoginId = this.context._customerContext.loginId;
              this.helpService.updateProblemStatus(this.updateInfo, userEvents).subscribe
                (res => {
                  let msg = 'Complaint(s) has been closed successfully';
                  this.showSucsMsg(msg);
                  this.popup.reset();
                  $('#close-dialog').modal('hide');
                  this.getManageComp.emit('success');
                },
                (err) => {
                  this.showErrorMsg('Error while closing complaint');
                });
            }
            else {
              this.errorBlock = true;
              this.errorNotes = "Date should not be less than Complaint Date.";
            }
          }
        } else {
          this.errorBlock = true;
          this.errorNotes = "Complaint has been " + status + " successful.";
        }
      } else {
        this.validateAllFormFields(this.popup);
      }
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
  cancel() {
    this.popup.reset();
  }
  prepareContext(msg: string) {

    if (!this.complaintContext) {
      this.complaintContext = <IComplaintContextresponse>{};
    }
    this.complaintContext.successMessage = msg;
    this.complaintContextService.changeResponse(this.complaintContext);
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


export interface IInternalUsers {
  id: number;
  name: string;
}