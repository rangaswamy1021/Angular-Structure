import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfigurationService } from './services/configuration.service';
import { SessionService } from '../../shared/services/session.service';
import { IDocumenttextRequest } from './models/documenttextrequest';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { IPaging } from '../../shared/models/paging';
import { IDocumenttextResponse } from './models/documenttextresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { Router } from '@angular/router';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-include-message-to-invoice',
  templateUrl: './include-message-to-invoice.component.html',
  styleUrls: ['./include-message-to-invoice.component.scss']
})
export class IncludeMessageToInvoiceComponent implements OnInit {
  details: IDocumenttextResponse;
  isEditClicked: boolean;
  isDeleteClicked: boolean;
  isAddClicked: boolean;
  isCancelClicked: boolean;
  isResetClicked: boolean;
  includeMessage: FormGroup;
  createMessage: IDocumenttextRequest = <IDocumenttextRequest>{};
  getMessage: IDocumenttextRequest = <IDocumenttextRequest>{};
  updateMessage: IDocumenttextRequest = <IDocumenttextRequest>{};
  deleteMessage: IDocumenttextRequest = <IDocumenttextRequest>{};
  invoices: IDocumenttextResponse[];
  active: boolean;
  editDocumentId: number;
  delDocumentId: number;
  descriptionMaxLength: number = 1000;
  descriptionLength: number = this.descriptionMaxLength;
  disableCButton: boolean = false;
  disableUButton: boolean = false;
  disableDButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private confService: ConfigurationService, private commonService: CommonService, private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService ) { }

  ngOnInit() {
       this.materialscriptService.material();
    this.isEditClicked = false;
    this.isDeleteClicked = false;
    this.isAddClicked = true;
    this.isResetClicked = true;

    this.includeMessage = new FormGroup({
      'invoicemessage': new FormControl('', [Validators.required, Validators.maxLength(this.descriptionMaxLength)]),
      'active': new FormControl('')
    });
    this.getDetails();

    this.disableCButton = !this.commonService.isAllowed(Features[Features.INVOICETEXT], Actions[Actions.CREATE], "");
    this.disableUButton = !this.commonService.isAllowed(Features[Features.INVOICETEXT], Actions[Actions.UPDATE], "");
    this.disableDButton = !this.commonService.isAllowed(Features[Features.INVOICETEXT], Actions[Actions.DELETE], "");
  }

  calculateLength(event: any) {
    this.descriptionLength = 1000 - event.target.value.length
  }

  checkActive(checked: boolean) {
    this.active = checked;
  }

  addMessage() {
    if (this.includeMessage.valid) {
      this.createMessage = <IDocumenttextRequest>{};
      this.createMessage.CreatedUser = this.context._customerContext.userName;
      this.createMessage.DocumentsText = this.includeMessage.controls['invoicemessage'].value;
      this.createMessage.IncludeInDocument = this.includeMessage.controls['active'].value;
      this.createMessage.DocumentType = "Invoice";
      this.createMessage.LoginId = this.context._customerContext.loginId;
      this.createMessage.UserId = this.context._customerContext.userId;
      this.createMessage.PerformedBy = this.context._customerContext.userName;
      this.createMessage.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.createMessage.ViewFlag = "CREATE";
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.INVOICETEXT];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.confService.CreateDocumentText(this.createMessage, userEvents).subscribe(res => {
        if (res) {
          this.getDetails();
          const msg = 'Invoice Text Created Successfully';
          this.showSucsMsg(msg);
          this.includeMessage.reset();
          this.descriptionLength = this.descriptionMaxLength;
        } else {
          this.showErrorMsg('Unable to create invoice text');
        }
      });
    } else {
      this.validateAllFormFields(this.includeMessage);
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

  getDetails() {
    this.getMessage = <IDocumenttextRequest>{};
    this.getMessage.LoginId = this.context._customerContext.loginId;
    this.getMessage.UserId = this.context._customerContext.userId;
    this.getMessage.PerformedBy = this.context._customerContext.userName;
    this.getMessage.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getMessage.ViewFlag = "GET";
    this.getMessage.PageNumber = 1;
    this.getMessage.PageSize = 100;
    this.getMessage.SortColumn = "INVOICETEXT";
    this.getMessage.SortDir = 1;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICETEXT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.confService.GetDocumentTextDetails(this.getMessage, userEvents).subscribe(
      res => {
        this.invoices = res;
        console.log(this.invoices);
      });
  }

  resetClick() {
    if (this.isEditClicked) {
      this.editDetails(this.details);
    } else {
      this.includeMessage.reset();
      this.descriptionLength = this.descriptionMaxLength;
    }
    let a=this;
   setTimeout(function() {
     a.materialscriptService.material();
   }, 100);
  }

  cancel() {
    this.isAddClicked = true;
    this.isResetClicked = true;
    this.isDeleteClicked = false;
    this.isCancelClicked = false
    this.isEditClicked = false;
    this.includeMessage.reset();
    this.includeMessage.controls['active'].enable(true);
    this.descriptionLength = this.descriptionMaxLength;
  }

  onEditClick(msgResp: IDocumenttextResponse) {
    this.details = msgResp;
    this.editDetails(msgResp);
    this.materialscriptService.material();


  }
  editDetails(msgResp) {
    this.isEditClicked = true;
    this.isResetClicked = true;
    this.isCancelClicked = true;
    this.isAddClicked = false;
    this.isDeleteClicked = false;

    if (msgResp.DocumentsText)
      this.descriptionLength = this.descriptionMaxLength - msgResp.DocumentsText.length;
    this.editDocumentId = msgResp.DocumentInvoiceID;
    this.includeMessage.controls['invoicemessage'].setValue(msgResp.DocumentsText);
    this.includeMessage.controls['active'].setValue(msgResp.IncludeInDocument);
  }

  onUpdateClick() {
    if (this.includeMessage.valid) {
      this.updateMessage = <IDocumenttextRequest>{};
      this.updateMessage.InvoiceTextID = this.editDocumentId;
      this.updateMessage.DocumentsText = this.includeMessage.controls['invoicemessage'].value;
      this.updateMessage.IncludeInDocument = this.includeMessage.controls['active'].value;
      this.updateMessage.CreatedUser = this.context._customerContext.userName;
      this.updateMessage.LoginId = this.context._customerContext.loginId;
      this.updateMessage.UserId = this.context._customerContext.userId;
      this.updateMessage.PerformedBy = this.context._customerContext.userName;
      this.updateMessage.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.updateMessage.ViewFlag = "UPDATE";
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.INVOICETEXT];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.confService.UpdateDocumentText(this.updateMessage, userEvents).subscribe(res => {
        if (res) {
          this.getDetails();
          this.editDocumentId = 0;
          this.includeMessage.reset();
          this.descriptionLength = this.descriptionMaxLength;
          this.isEditClicked = false;
          this.isDeleteClicked = false;
          this.isAddClicked = true;
          this.isResetClicked = true;
          this.isCancelClicked = false;
          const msg = 'Invoice Text Updated Successfully';
          this.showSucsMsg(msg);
          console.log("Message Updated successfully");
        } else {
          this.showErrorMsg('Unable to update invoice text');
        }
      });
    } else {
      this.validateAllFormFields(this.includeMessage);
    }

  }

  onDeleteClick(msgResp: IDocumenttextResponse) {
    this.isEditClicked = false;
    this.isDeleteClicked = true;
    this.isCancelClicked = true;
    this.isAddClicked = false;
    this.isResetClicked = false;

    if (msgResp.DocumentsText)
      this.descriptionLength = this.descriptionMaxLength - msgResp.DocumentsText.length;
    this.delDocumentId = msgResp.DocumentInvoiceID;
    this.includeMessage.controls['invoicemessage'].setValue(msgResp.DocumentsText);
    this.includeMessage.controls['active'].setValue(msgResp.IncludeInDocument);
    this.includeMessage.controls['active'].disable(true);
  }

  onDelClick() {
    this.deleteMessage = <IDocumenttextRequest>{};
    this.deleteMessage.InvoiceTextID = this.delDocumentId;
    this.deleteMessage.CreatedUser = this.context._customerContext.userName;
    this.deleteMessage.LoginId = this.context._customerContext.loginId;
    this.deleteMessage.UserId = this.context._customerContext.userId;
    this.deleteMessage.PerformedBy = this.context._customerContext.userName;
    this.deleteMessage.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.deleteMessage.ViewFlag = "DELETE";
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICETEXT];
    userEvents.ActionName = Actions[Actions.DELETE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.confService.DeleteDocumentText(this.deleteMessage, userEvents).subscribe(res => {
      if (res) {
        this.getDetails();
        this.editDocumentId = 0;
        this.includeMessage.reset();
        this.descriptionLength = this.descriptionMaxLength;
        this.includeMessage.controls['active'].enable(true);
        this.isEditClicked = false;
        this.isDeleteClicked = false;
        this.isAddClicked = true;
        this.isResetClicked = true;
        this.isCancelClicked = false;
        const msg = 'Invoice Text Deleted Successfully';
          this.showSucsMsg(msg);
        
      } else {
        this.showErrorMsg('Unable to delete invoice text');
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
