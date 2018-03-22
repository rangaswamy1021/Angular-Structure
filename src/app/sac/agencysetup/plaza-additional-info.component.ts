import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AgencySetupService } from "./services/agencysetup.service";
import { IPlazaRequest } from "./models/plazasrequest";
import { ActivitySource, Features, Actions, SubFeatures } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-plaza-additional-info',
  templateUrl: './plaza-additional-info.component.html',
  styleUrls: ['./plaza-additional-info.component.scss']
})
export class PlazaAdditionalInfoComponent implements OnInit {
  passwordMessage: string = '';
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse;
  plazaForm: FormGroup;
  bankForm: FormGroup;
  bankAccountTypes: any[];
  plazID: number;
  plazCode: string;
  action: string;
  objPlazaUpdate = <IPlazaRequest>{};
  btnText: string;
  litFTPPwd: string;
  PasswordMask: string = "*************";
  isPasword: boolean = false;
  isCancelShow: boolean = false;
  passDisabled: boolean = false;
  previewPlazas: boolean = false;
  plazaName: string;
  priceMode: string;
  isDisabledPreview: boolean = false;
  constructor(private commonService: CommonService, private route: ActivatedRoute, private sessionService: SessionService, private router: Router, private agencySetupService: AgencySetupService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.loadBankForm();
    this.loadFTPForm(0, '');
    this.route.queryParams.subscribe(param => {
      this.plazID = (Number)(param["plazaId"]);
      this.plazCode = (param["plazaCode"]);
      this.action = (param["source"]);
    });

    this.agencySetupService.BindBankAccountTypes().subscribe(res => {
      this.bankAccountTypes = res;
      if (this.action == "Update") {
        this.agencySetupService.GetPlazaById(this.plazID).subscribe(objPlaza => {
          if (objPlaza) {
            this.objPlazaUpdate = objPlaza;
            if (this.objPlazaUpdate.AccountName == "" && this.objPlazaUpdate.PGPKeyId == "")
              this.btnText = "Add";
            else
              this.btnText = this.action;

            this.bankForm.controls["accoutNo"].setValue(this.objPlazaUpdate.AccountNumber);
            if (objPlaza.AccountType != "")
              this.bankForm.controls["accoutType"].setValue(this.objPlazaUpdate.AccountType);
            else
              this.bankForm.controls["accoutType"].setValue(this.bankAccountTypes[0].Key);
            this.bankForm.controls["accountName"].setValue(this.objPlazaUpdate.AccountName);
            this.bankForm.controls["bankName"].setValue(this.objPlazaUpdate.BankName);
            this.bankForm.controls["ifscCode"].setValue(this.objPlazaUpdate.IFSCCode);
            this.plazaForm.controls["ftpUrl"].setValue(this.objPlazaUpdate.FTPURL);
            this.plazaForm.controls["ftpLogin"].setValue(this.objPlazaUpdate.FTPLogin);


            if (this.objPlazaUpdate.FTPPwd != "") {
              this.litFTPPwd = this.objPlazaUpdate.FTPPwd;
              this.plazaForm.controls["ftpPassword"].setValue(this.PasswordMask);
              this.passDisabled = true;
              this.isPasword = true;
            }
            else {
              this.plazaForm.controls["ftpPassword"].setValue("");
              this.isPasword = false;
              this.passDisabled = false;
            }
            this.plazaForm.controls["ftpPort"].setValue(this.objPlazaUpdate.PortNumber);
            this.plazaForm.controls["PGPKey"].setValue(this.objPlazaUpdate.PGPKeyId);
            if (this.objPlazaUpdate.EncryptFlag == "1")
              this.plazaForm.controls["isEncrypt"].setValue(true);
            else
              this.plazaForm.controls["isEncrypt"].setValue(false);

            if (this.objPlazaUpdate.PGPKeyId != "")
              this.loadFTPForm(1, this.objPlazaUpdate.PGPKeyId);
              let a=this;
                   setTimeout(function() {
    a.materialscriptService.material();
    }, 1000);
          }
        });
      }
      else {
        this.showMsg("success", "Plaza details has been added successfully");
        this.bankForm.controls["accoutType"].setValue(this.bankAccountTypes[0].Key);
        this.btnText = this.action;
        this.passDisabled = false;
      }
    });
    this.isDisabledPreview = !this.commonService.isAllowed(Features[Features.PLAZAS], Actions[Actions.PREVIEW], "");
  }

  chnagePassword() {
    this.passDisabled = false;
    this.isCancelShow = true;
    this.plazaForm.controls["ftpPassword"].setValue("");
  }

  previewClick() {
    this.previewPlazas = true;
    let a=this;
  
    this.plazaName = this.objPlazaUpdate.PlazaName;
    this.priceMode = this.objPlazaUpdate.PriceMode;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PLAZAS];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.PLAZADDITIONALINFORMATION];
    userEvents.ActionName = Actions[Actions.PREVIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
 
  }

  previewBack() {
    if (this.passDisabled == false) {
      this.plazaForm.controls["ftpPassword"].setValue("");
    }
    this.previewPlazas = false;
  }

  cancelChnagePassword() {
    this.passwordMessage = '';
    this.isCancelShow = false;
    this.plazaForm.controls["ftpPassword"].setValue(this.PasswordMask);
    this.passDisabled = true;
  }

  loadFTPForm(value, enteredValue) {
    if (value == 1) {
      this.plazaForm = new FormGroup({
        'PGPKey': new FormControl(this.plazaForm.controls["PGPKey"].value, [Validators.required, Validators.minLength(6)]),
        'ftpUrl': new FormControl(this.plazaForm.controls["ftpUrl"].value, [Validators.required]),
        'ftpLogin': new FormControl(this.plazaForm.controls["ftpLogin"].value, [Validators.required]),
        'ftpPassword': new FormControl(this.plazaForm.controls["ftpPassword"].value, [Validators.required, Validators.minLength(7)]),
        'ftpPort': new FormControl(this.plazaForm.controls["ftpPort"].value, [Validators.required]),
        'isEncrypt': new FormControl(this.plazaForm.controls["isEncrypt"].value, )
      });
    }
    else {
      this.plazaForm = new FormGroup({
        'PGPKey': new FormControl('', ),
        'ftpUrl': new FormControl('', ),
        'ftpLogin': new FormControl('', ),
        'ftpPassword': new FormControl('', ),
        'ftpPort': new FormControl('', ),
        'isEncrypt': new FormControl('', )
      });
    }
  }

  backClick() {
    this.router.navigate(["sac/agencysetup/plaza-registration"], { queryParams: { plazaId: this.plazID } });
  }

  resetClick() {
    this.msgFlag = false;
    this.isCancelShow = false;
    if (this.btnText == "Add") {
      this.loadFTPForm(0, "");
      this.loadBankForm();
    }
    else {
      this.bankForm.controls["accoutNo"].setValue(this.objPlazaUpdate.AccountNumber);
      if (this.objPlazaUpdate.AccountType != "")
        this.bankForm.controls["accoutType"].setValue(this.objPlazaUpdate.AccountType);
      else
        this.bankForm.controls["accoutType"].setValue(this.bankAccountTypes[0].Key);
      this.bankForm.controls["accountName"].setValue(this.objPlazaUpdate.AccountName);
      this.bankForm.controls["bankName"].setValue(this.objPlazaUpdate.BankName);
      this.bankForm.controls["ifscCode"].setValue(this.objPlazaUpdate.IFSCCode);
      this.plazaForm.controls["ftpUrl"].setValue(this.objPlazaUpdate.FTPURL);
      this.plazaForm.controls["ftpLogin"].setValue(this.objPlazaUpdate.FTPLogin);
      if (this.objPlazaUpdate.AccountName == "" && this.objPlazaUpdate.PGPKeyId == "")
        this.btnText = "Add";
      else
        this.btnText = this.action;

      if (this.objPlazaUpdate.FTPPwd != "") {
        this.litFTPPwd = this.objPlazaUpdate.FTPPwd;
        this.plazaForm.controls["ftpPassword"].setValue(this.PasswordMask);
        this.passDisabled = true;
        this.isPasword = true;
      }
      else {
        this.plazaForm.controls["ftpPassword"].setValue("");
        this.passDisabled = false;
        this.isPasword = false;
      }
      this.plazaForm.controls["ftpPort"].setValue(this.objPlazaUpdate.PortNumber);
      this.plazaForm.controls["PGPKey"].setValue(this.objPlazaUpdate.PGPKeyId);
      if (this.objPlazaUpdate.EncryptFlag == "1")
        this.plazaForm.controls["isEncrypt"].setValue(true);
      else
        this.plazaForm.controls["isEncrypt"].setValue(false);
    }
  }

  cancelClick() {
    this.router.navigate(["sac/agencysetup/manage-plazas"]);
  }


  loadBankForm() {
    this.bankForm = new FormGroup({
      'accoutNo': new FormControl('', [Validators.required, Validators.minLength(9)]),
      'accoutType': new FormControl('', [Validators.required]),
      'accountName': new FormControl('', [Validators.required]),
      'bankName': new FormControl('', [Validators.required]),
      'ifscCode': new FormControl('', [Validators.required, Validators.minLength(9)]),
    });
  }

  pgpValueChanged(event) {
    if (event.target.value == "" && this.objPlazaUpdate.PGPKeyId == "") {
      this.loadFTPForm(0, '');
    }
    else if (this.objPlazaUpdate.PGPKeyId == undefined || this.objPlazaUpdate.PGPKeyId == "") {
      this.loadFTPForm(1, event.target.value);
    }
  }

  saveAdditionalInfo() {
    if (this.bankForm.valid && this.plazaForm.valid) {
      let objPlaza = <IPlazaRequest>{};
      objPlaza.AccountNumber = this.bankForm.controls["accoutNo"].value;
      objPlaza.AccountType = this.bankForm.controls["accoutType"].value;
      objPlaza.AccountName = this.bankForm.controls["accountName"].value;
      objPlaza.BankName = this.bankForm.controls["bankName"].value;
      objPlaza.IFSCCode = this.bankForm.controls["ifscCode"].value;

      if (this.plazaForm.valid) {
        objPlaza.PortNumber = this.plazaForm.controls["ftpPort"].value;

        objPlaza.FTPURL = this.plazaForm.controls["ftpUrl"].value;
        objPlaza.FTPLogin = this.plazaForm.controls["ftpLogin"].value;

        if (this.isCancelShow != true)
          objPlaza.FTPPwd = this.plazaForm.controls["ftpPassword"].value;
        else
          objPlaza.FTPPwd = this.litFTPPwd;

        objPlaza.PGPKeyId = this.plazaForm.controls["PGPKey"].value;

        if (this.plazaForm.controls["isEncrypt"].value == "1")
          objPlaza.EncryptFlag = "1";
        else
          objPlaza.EncryptFlag = "0";
      }
      objPlaza.PerformedBy = this.sessionContextResponse.userName;
      objPlaza.UserId = this.sessionContextResponse.userId;
      objPlaza.LoginId = this.sessionContextResponse.loginId;
      objPlaza.ActivitySource = ActivitySource.Internal;
      objPlaza.PlazaId = this.plazID;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.PLAZAS];
      userEvents.SubFeatureName = SubFeatures[SubFeatures.PLAZADDITIONALINFORMATION];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      if (this.btnText == "Add")
        userEvents.ActionName = Actions[Actions.CREATE];
      else
        userEvents.ActionName = Actions[Actions.UPDATE];
      this.agencySetupService.UpdatePlazaOtherInfo(objPlaza, userEvents).subscribe(res => {
        if (res) {
          if (this.btnText == "Add")
            this.router.navigate(["sac/agencysetup/manage-plazas"], { queryParams: { flag: 1 } });
          else {
            this.router.navigate(["sac/agencysetup/manage-plazas"], { queryParams: { flag: 2 } });
          }
        }
      },
        err => {
          this.showMsg("error", err.statusText);
        }
      );;
    }
    else {
      this.validateAllFormFields(this.plazaForm);
      this.validateAllFormFields(this.bankForm);
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

  passwordChange(event) {
    if (event.target.value != "" && event.target.value != this.PasswordMask)
      this.passwordMessage = this.passwordStrength(event.target.value, this.plazaForm.controls["ftpLogin"].value);
    else
      this.passwordMessage = "";
    console.log(this.passwordMessage);
  }

  shortPass: string = 'Too short'
  badPass: string = 'Weak'
  goodPass: string = 'Average'
  strongPass: string = 'Strong'



  passwordStrength(password, username): string {
    let score: number = 0

    //password < 4
    if (password.length < 7) { return this.shortPass }

    //password == username
    if (password.toLowerCase() == username.toLowerCase()) return this.badPass

    //password length
    score += password.length * 4
    score += (this.checkRepetition(1, password).length - password.length) * 1
    score += (this.checkRepetition(2, password).length - password.length) * 1
    score += (this.checkRepetition(3, password).length - password.length) * 1
    score += (this.checkRepetition(4, password).length - password.length) * 1

    //password has 3 numbers
    if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) score += 5

    //password has 2 sybols
    if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) score += 5

    //password has Upper and Lower chars
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) score += 10

    //password has number and chars
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) score += 10
    //
    //password has number and symbol
    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) score += 10

    //password has char and symbol
    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) score += 10

    //password is just a nubers or chars
    if (password.match(/^\w+$/) || password.match(/^\d+$/)) score -= 10

    //verifing 0 < score < 100
    if (score < 0) score = 0
    if (score > 100) score = 100

    if (score < 34) return this.badPass
    if (score < 80) return this.goodPass
    return this.strongPass
  }

  checkRepetition(pLen, str) {
    let res: string = ""
    for (let i = 0; i < str.length; i++) {
      let repeated: boolean = true;
      let j: number = 0;
      for (j = 0; j < pLen && (j + i + pLen) < str.length; j++)
        repeated = repeated && (str.charAt(j + i) == str.charAt(j + i + pLen))
      if (j < pLen) repeated = false
      if (repeated) {
        i += pLen - 1
        repeated = false
      }
      else {
        res += str.charAt(i)
      }
    }
    return res
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }
}
