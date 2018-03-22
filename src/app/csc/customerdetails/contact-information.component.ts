
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';

declare var $: any;

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.css']
})
export class ContactInformationComponent implements OnInit {
  blockListAddressDetails: IBlocklistresponse[];
  AddressblockListStatus: boolean;
  PhoneblockListStatus: boolean;
  EmailblockListStatus: boolean;
  AccountHolderblockListStatus: boolean;

  currentAction: string = '';

  ngOnInit() {
    this.blockListAddressDetails = [];
  }

  showAddressPopup(event) {
    console.log('blocklist' + event);
    this.blockListAddressDetails = event;
    this.currentAction = 'address';
    $('#blocklist-dialog').modal('show');
  }

  showPhonePopup(event) {
    this.blockListAddressDetails = <IBlocklistresponse[]>[];
    var object = JSON.stringify(event);
    this.blockListAddressDetails = JSON.parse(object);
    this.currentAction = 'phone';
    $('#blocklist-dialog').modal('show');
  }

  showEmailPopup(event) {
    this.blockListAddressDetails = <IBlocklistresponse[]>[];
    var object = JSON.stringify(event);
    this.blockListAddressDetails = JSON.parse(object);
    this.currentAction = 'email';
    $('#blocklist-dialog').modal('show');
  }


  showAccountHolderPopup(event) {
    this.blockListAddressDetails = <IBlocklistresponse[]>[];
    var object = JSON.stringify(event);
    this.blockListAddressDetails = JSON.parse(object);
    this.currentAction = 'account';
    $('#blocklist-dialog').modal('show');
  }



  sendBlockListStatus() {
    if (this.currentAction == 'address') {
      this.AddressblockListStatus = true;
      this.blockListAddressDetails=[];
    }
    if (this.currentAction == 'phone') {
      this.PhoneblockListStatus = true;
      this.blockListAddressDetails=[];
    }
    if (this.currentAction == 'email') {
      this.EmailblockListStatus = true;
      this.blockListAddressDetails=[];
    }
    if (this.currentAction == 'account') {
      this.AccountHolderblockListStatus = true;
      this.blockListAddressDetails=[];
    }
    this.currentAction = '';
  }
}