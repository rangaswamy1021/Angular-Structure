
import { Router } from '@angular/router';
import { Actions } from './../constants';
import { IUserEvents } from './../models/userevents';
import { IEmailRequest } from './../models/emailrequest';
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { IPaging } from './../models/paging';
import { CommonService } from './../services/common.service';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { IaddAddressInputs } from "../address/add-address.component";

import { IEmailResponse } from "../models/emailresponse";
import { CustomerDetailsService } from "../../csc/customerdetails/services/customerdetails.service";
import { ICustomerContextResponse } from "../models/customercontextresponse";
import { CustomerContextService } from "../services/customer.context.service";
import { IUserresponse } from "../models/userresponse";
import { SessionService } from "../services/session.service";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { Features } from "../constants";
import { MaterialscriptService } from "../materialscript.service";

declare var $: any;
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  disableDeletebtn: boolean = false;
  disableVerifybtn: boolean= false;
  disableUpdateEmailButton: boolean= false;
  disableEmailHistorybtn: boolean= false;
  disableButton: boolean;
  userEvents = <IUserEvents>{};
  accountId = 0;
  UserInputs: IaddAddressInputs = <IaddAddressInputs>{};
  preferredEmail;
  resEmailArray;
  phoneFormToggle: Boolean = false;
  title: string;
  formType: string;  
  paging: IPaging;

  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;

  emailForm: FormGroup;
  emailArray: IEmailRequest[] = [];
  resEmailArrayArray;
  emailObject: IEmailRequest = <IEmailRequest>{};
  showEmailHistoryFlag: boolean;
  emailHistoryReqObj: IEmailRequest = <IEmailRequest>{};
  emailHistory: IEmailResponse[];
 
  emailRequest: IEmailRequest;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  blockListEmailDetails: IBlocklistresponse[] = [];

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";

  @Output() EmailblockListArray: EventEmitter<IBlocklistresponse[]> = new EventEmitter<IBlocklistresponse[]>();
  @Input() EmailblockListStatus;


  constructor(private commonService: CommonService,private router:Router, private customerDetailsService: CustomerDetailsService, private customerContext: CustomerContextService,private sessionContext: SessionService, private materialscriptService:MaterialscriptService) { }
  emailTypes = {
    PrimaryEmail: "",
    SecondaryEmail: "",
  };




  checkEmailChanges = ["PrimaryEmail", "SecondaryEmail"];



  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
       
      this.userEvents.FeatureName = Features[Features.EMAIL];
 
  this.userEvents.PageName = this.router.url;
  this.userEvents.CustomerId = this.customerContextResponse.AccountId;
  this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
  this.userEvents.UserName = this.sessionContextResponse.userName;
  this.userEvents.LoginId = this.sessionContextResponse.loginId;
      this.accountId = this.customerContextResponse.AccountId;
      this.getAllEmails();
      }
    this.emailFormGenerate();
    this.checkRolesandPrivileges();
  }

  checkRolesandPrivileges(){
    this.disableEmailHistorybtn = !this.commonService.isAllowed(Features[Features.EMAIL], Actions[Actions.HISTORY], "");
    this.disableButton = !this.commonService.isAllowed(Features[Features.EMAIL], Actions[Actions.UPDATE], "");
    this.disableVerifybtn = !this.commonService.isAllowed(Features[Features.EMAIL],Actions[Actions.VERIFY], "");
    this.disableDeletebtn = !this.commonService.isAllowed(Features[Features.EMAIL],Actions[Actions.DELETE], "");
 }

  getAllEmails() {
    this.commonService.getAllEmails(this.accountId).subscribe(res => {
      //console.log(res); 
      this.parseEmail(res), this.resEmailArray = res;
    });
  }

  parseEmail(email) {
    this.emailTypes = {
      PrimaryEmail: "",
      SecondaryEmail: "",
    };
    email.forEach(element => {
      this.emailTypes[element.Type] = element;
      if (element.IsPreferred) {
        this.preferredEmail = element;

        //console.log(this.preferredEmail)
      }
    });
  }


  editDetails(infoType, functionType) {
    this.phoneFormToggle = true;
    this.title = functionType + ' ' + infoType;
    this.formType = infoType;

    $('#emailEdit').modal('show');
    this.emailForm.patchValue({
      PrimaryEmail: this.emailTypes.PrimaryEmail['EmailAddress'], SecondaryEmail: this.emailTypes.SecondaryEmail['EmailAddress'],
      emailPreference: this.preferredEmail.Type, isValid: this.preferredEmail.IsValid
    })
    let rootSele=this;
    setTimeout(function(){
     rootSele.materialscriptService.material();
    })
    this.emailForm.controls[this.preferredEmail.Type].setValidators(Validators.required);
    this.materialscriptService.material();
  }

  emailFormGenerate() {
    this.emailForm = new FormGroup({
      PrimaryEmail: new FormControl('', Validators.compose([Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      SecondaryEmail: new FormControl('', Validators.compose([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)])),
      isValid: new FormControl(''),
      emailPreference: new FormControl('')
    })
  }

  prefferedEmailTypeChange(val) {
    this.emailForm.controls['PrimaryEmail'].clearValidators();
    this.emailForm.controls['SecondaryEmail'].clearValidators();
    this.emailForm.controls[val].setValidators([Validators.required, Validators.pattern(this.validateEmailPattern)]);
    for (var i = 0; i < this.checkEmailChanges.length; i++) {
      if (this.checkEmailChanges[i] != val) {
        this.emailForm.controls[this.checkEmailChanges[i]].setValidators([Validators.pattern(this.validateEmailPattern)]);
      }
    }
  }


  deleteEmail(emailDetails) {
    this.userEvents.ActionName = Actions[Actions.DELETE];
    emailDetails.UpdatedUser = this.UserInputs.userName;
    this.commonService.deleteEmail(emailDetails, this.userEvents).subscribe(res => { 
      if(res){
        this.showSucsMsg("Email has been deleted");
      }
      this.getAllEmails() 
     }
      , (err) => {
        this.showErrorMsg(err.statusText.toString());
      })
  }


  showEmailHistory() {
    this.p =1;
    this.userEvents.ActionName = Actions[Actions.HISTORY];
    this.getEmailHistory(this.p,this.userEvents);
    this.showEmailHistoryFlag = true;
this.materialscriptService.material();
  }

  getEmailHistory(pageNumber: number, userEvents?: IUserEvents) {
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;    
    this.paging.SortColumn = "";
    this.paging.SortDir = 1;
    this.emailHistoryReqObj.CustomerId = this.accountId;
    this.emailHistoryReqObj.Paging = this.paging;

    this.commonService.getEmailHistoryByAccountId(this.emailHistoryReqObj, userEvents)
      .subscribe(res => {
        this.emailHistory = res;
        if(this.emailHistory.length > 0){
          this.totalRecordCount = this.emailHistory[0].RecordCount;
         if (this.totalRecordCount < this.pageItemNumber) {
           this.endItemNumber = this.totalRecordCount;
         } else {
           this.endItemNumber = this.pageItemNumber;
         }
         this.dataLength = this.emailHistory.length
       }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
    $('#emailHistory').modal('show');
  }


  emailHistoryPageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
      this.getEmailHistory(this.p);
  }

  verifyEmail(emailDetails) {

    this.emailRequest = <IEmailRequest>{};
    this.emailRequest.CustomerId = emailDetails.CustomerId;
    this.emailRequest.EmailAddress = emailDetails.EmailAddress;
    this.emailRequest.UserName = emailDetails.FullName;
    this.emailRequest.EmailInterface = "EMAILVERIFICATION"
    this.emailRequest.EmailSubject = "Email Verification";
    this.emailRequest.CreatedUser = "";
    this.emailRequest.CreatedDate = new Date();
    this.emailRequest.Attachement = "";
    this.userEvents.ActionName = Actions[Actions.VERIFY];
    this.customerDetailsService.generateEmailVerification(this.emailRequest, this.userEvents)
      .subscribe(res => {
        if (res) {
          this.showSucsMsg("Email Verification link has been successfully sent to " + this.emailRequest.EmailAddress);
        }
        else {
          this.showErrorMsg("Emial Verification is not completed. Please check with Administrator");
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      },
      () => {
      }
      );
  }

  changeEmail(isBlockListCheck) {
    
    this.emailArray = [];
    let oldVal = this.resEmailArrayArray;
    if (this.emailForm.valid) {
      for (var i = 0; i < this.checkEmailChanges.length; i++) {
        if (this.emailTypes[this.checkEmailChanges[i]]) {
          if (this.emailTypes[this.checkEmailChanges[i]].EmailAddress != this.emailForm.controls[this.emailTypes[this.checkEmailChanges[i]].Type].value
             || this.preferredEmail.Type!=this.emailForm.controls["emailPreference"].value) {
            this.emailTypes[this.checkEmailChanges[i]].EmailAddress = this.emailForm.controls[this.emailTypes[this.checkEmailChanges[i]].Type].value;
            this.emailTypes[this.checkEmailChanges[i]]["IsEmailAddressChanged"] = true;
            this.emailTypes[this.checkEmailChanges[i]]["UpdatedUser"] = this.UserInputs.userName;
            this.emailTypes[this.checkEmailChanges[i]]["UserName"] = this.UserInputs.userName;
            this.emailTypes[this.checkEmailChanges[i]]["IsValid"] = true;
            
            //  if (this.preferredEmail.Type != this.emailForm.controls['isValid'].value) {
            //       this.emailTypes[this.preferredEmail.Type]["IsValid"] = true;
            // }
            // else {
            //  this.emailTypes[this.preferredEmail.Type]["IsValid"] = true;
            // }
            //debugger;
             // true; // get from form control
            this.emailTypes[this.checkEmailChanges[i]]["IsActivityRequired"] = true;
            this.emailTypes[this.checkEmailChanges[i]]["UserId"] = this.UserInputs.userId;
            this.emailTypes[this.checkEmailChanges[i]]["LoginId"] = this.UserInputs.loginId;;
            this.emailTypes[this.checkEmailChanges[i]]["CheckBlockList"] = isBlockListCheck;
            if (this.emailTypes[this.checkEmailChanges[i]]["Type"] != this.emailForm.controls['emailPreference'].value) {
               this.emailTypes[this.checkEmailChanges[i]]["IsPreferred"] = false;
            }
            else {
              this.emailTypes[this.checkEmailChanges[i]]["IsPreferred"] = true;
                if(!(this.preferredEmail.Type == this.emailForm.controls["emailPreference"].value && this.preferredEmail.Type!=this.emailForm.controls["isValid"].value))
                     this.emailTypes[this.preferredEmail.Type]["IsPreferred"] = false;
            }
          this.emailArray.push(this.emailTypes[this.checkEmailChanges[i]]);
          }
          if(this.emailTypes[this.checkEmailChanges[i]]["IsPreferred"] && this.preferredEmail.IsValid != this.emailForm.controls['isValid'].value) {
            debugger;
            this.emailTypes[this.checkEmailChanges[i]].EmailAddress = this.emailForm.controls[this.emailTypes[this.checkEmailChanges[i]].Type].value;
            this.emailTypes[this.checkEmailChanges[i]]["IsEmailAddressChanged"] = true;
            this.emailTypes[this.checkEmailChanges[i]]["UpdatedUser"] = this.UserInputs.userName;
            this.emailTypes[this.checkEmailChanges[i]]["UserName"] = this.UserInputs.userName;
            this.emailTypes[this.checkEmailChanges[i]]["IsValid"] = this.emailForm.controls['isValid'].value;
            this.emailTypes[this.preferredEmail.Type]["IsValid"] = this.emailForm.controls['isValid'].value;
             // true; // get from form control
            this.emailTypes[this.checkEmailChanges[i]]["IsActivityRequired"] = true;
            this.emailTypes[this.checkEmailChanges[i]]["UserId"] = this.UserInputs.userId;
            this.emailTypes[this.checkEmailChanges[i]]["LoginId"] = this.UserInputs.loginId;;
           
            if (this.emailTypes[this.checkEmailChanges[i]]["Type"] != this.emailForm.controls['emailPreference'].value) {
               this.emailTypes[this.checkEmailChanges[i]]["IsPreferred"] = false;
            }
            else {
              this.emailTypes[this.checkEmailChanges[i]]["IsPreferred"] = true;
                if(!(this.preferredEmail.Type == this.emailForm.controls["emailPreference"].value && this.preferredEmail.Type!=this.emailForm.controls["isValid"].value))
                     this.emailTypes[this.preferredEmail.Type]["IsPreferred"] = false;
            }
          this.emailArray.push(this.emailTypes[this.checkEmailChanges[i]]);
            
          }
        }
        else {
          if (this.emailForm.controls[this.checkEmailChanges[i]].value) {
            this.emailObject.EmailAddress = this.emailForm.controls[this.checkEmailChanges[i]].value;
            this.emailObject.UserName = this.UserInputs.userName;
            this.emailObject.CustomerId = this.accountId;
            this.emailObject.Type = this.checkEmailChanges[i];
             if (this.emailObject.Type != this.emailForm.controls['emailPreference'].value) {
              this.emailObject.IsPreferred = false;
            }
            else {
             this.emailObject.IsPreferred = true;
            }
            this.emailObject.CheckBlockList = isBlockListCheck;
            this.emailObject.IsValid = true; // default is true.
            
            this.emailArray.push(this.emailObject);

          }
        }
      }
      if (this.emailArray.length > 0) {
          this.userEvents.ActionName = Actions[Actions.UPDATE];

        //console.log(this.emailArray);
        this.commonService.updateEmail(this.emailArray,this.userEvents).subscribe(res => {
          // console.log(res); 
          if (res) {
            this.showSucsMsg("Email(s) has been updated");
          } $('#emailEdit').modal('hide'); this.getAllEmails()
        }, (err) => {
          if (err.error) {
            this.blockListEmailDetails = err.error;
          //  $('#emailEdit').modal('hide');
            this.EmailblockListArray.emit(this.blockListEmailDetails);
          }
          else {
          
          this.showErrorMsg(err.statusText.toString()); 
          }
          this.emailTypes = {
            PrimaryEmail: "",
            SecondaryEmail: "",
          };
          this.getAllEmails();
        });
      }
      else{
            this.showErrorMsg("No email details to update");
      }
    }
   this.materialscriptService.material();
  }


  ngOnChanges():void{  
    //console.log('email false');
    if(this.EmailblockListStatus){
     // alert('email block list call');
      this.changeEmail(false);
    }
  }

  // blockListPopup(isBlockListCheck) {
  //   this.changeEmail(isBlockListCheck);
  // }

  resetEmail(){
    this.emailForm.patchValue({
      PrimaryEmail: this.emailTypes.PrimaryEmail['EmailAddress'], SecondaryEmail: this.emailTypes.SecondaryEmail['EmailAddress'],
      emailPreference: this.preferredEmail.Type, isValid: this.preferredEmail.IsValid
    })
    let rootSele=this;
    setTimeout(function(){
      rootSele.materialscriptService.material();
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
