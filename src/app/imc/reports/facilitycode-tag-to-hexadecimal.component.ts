import { CommonService } from './../../shared/services/common.service';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup,FormControl,Validators,ReactiveFormsModule  } from "@angular/forms";
import { Observable } from 'rxjs';
import { IInventoryRequest } from "./models/inventoryrequest";
import { ImcReportsService } from "./services/report.service";
import { IInventoryResponse } from "./models/inventoryresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-facilitycode-tag-to-hexadecimal',
  templateUrl: './facilitycode-tag-to-hexadecimal.component.html',
  styleUrls: ['./facilitycode-tag-to-hexadecimal.component.scss']
})
export class FacilitycodeTagToHexadecimalComponent implements OnInit {
  searchDisableButton: boolean;
  sessionContextResponse: IUserresponse;
  iInventoryResponse: IInventoryResponse;
  convertToHexatagForm: FormGroup;
  userEvents = <IUserEvents>{};
    // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
    
  constructor(private router:Router, private imcReportsService:ImcReportsService,private commonService:CommonService,
  private sessionContext: SessionService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
     this.sessionContextResponse = this.sessionContext.customerContext;
     this.convertToHexatagForm = new FormGroup({
      'facilityCode': new FormControl('', [Validators.required]),
      'tag': new FormControl('', [Validators.required])
     
    });
    
   this.getUserEvents();
  this.commonService.checkPrivilegeswithAuditLog(this.userEvents).subscribe(res=>{
  }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc =  err.statusText.toString();
          this.msgTitle = '';
      }
  );
   this.searchDisableButton = !this.commonService.isAllowed(Features[Features.CONVERTFACILITYANDTAGTOHEXTAG], Actions[Actions.SEARCH], "");
  }
    _keyPress(event: any) {
    const pattern =/[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      // invalid character, prevent input
      event.preventDefault();
    }

  }
  convertToHexaTag():void{
    if(this.convertToHexatagForm.valid){
    let facilityCode=this.convertToHexatagForm.controls['facilityCode'].value;
    let tag=this.convertToHexatagForm.controls['tag'].value;
   let iTagSummaryRequest:IInventoryRequest=<IInventoryRequest>{};
    iTagSummaryRequest.FacilityCode=facilityCode;
    iTagSummaryRequest.SerialNumber=tag;
     this.getUserEvents();
   this.userEvents.ActionName = Actions[Actions.SEARCH];
    this.imcReportsService.convertToHexTagId(iTagSummaryRequest,this.userEvents).subscribe(res =>{
     if(res)
     this.iInventoryResponse=res;
   },
       (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc =  err.statusText.toString();
          this.msgTitle = '';
       
        return;
      });
  }
  else
         this.validateAllFormFields(this.convertToHexatagForm);
  }
  	

 
   resetclick() {
    this.convertToHexatagForm.reset();
    this.convertToHexatagForm.controls['facilityCode'].setValue("");
    this.convertToHexatagForm.controls['tag'].setValue("");
    this.iInventoryResponse=null;

  }
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
  getUserEvents(){
      this.userEvents.FeatureName = Features[Features.CONVERTFACILITYANDTAGTOHEXTAG];
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
    setOutputFlag(e) {
    this.msgFlag = e;
  }

}
