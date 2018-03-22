import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ISearchCustomerRequest } from '../../csc/search/models/searchcustomerrequest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialscriptService } from "../materialscript.service";

@Component({
  selector: 'app-advance-search',
  templateUrl: './advance-search.component.html',
  styleUrls: ['./advance-search.component.scss']
})
export class AdvanceSearchComponent implements OnInit {

  searchRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  createForm: FormGroup;
  constructor(private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.createForm = new FormGroup({
      'AccountNo': new FormControl('', []),
      'Fname': new FormControl('', []),
      'Lastname': new FormControl('', []),
      'PlateNo': new FormControl('', []),
      'PhoneNo': new FormControl('', []),
      'SerialNo': new FormControl('', []),
      'EmailAdd': new FormControl('', []),
      'CCSuffix': new FormControl('', []),
      'Address': new FormControl('', [])
    });

    this.searchRequest.AccountId = this.createForm.controls['AccountNo'].value;
    this.searchRequest.FirstName = this.createForm.controls['Fname'].value.toUpperCase();
    this.searchRequest.LastName = this.createForm.controls['Lastname'].value.toUpperCase();
    this.searchRequest.VehicleNumber = this.createForm.controls['PlateNo'].value.toUpperCase();
    this.searchRequest.Phone = this.createForm.controls['PhoneNo'].value.toUpperCase();
    this.searchRequest.TransponderNumber = this.createForm.controls['SerialNo'].value.toUpperCase();
    this.searchRequest.EmailAddress = this.createForm.controls['EmailAdd'].value.toUpperCase();
    this.searchRequest.CCSuffix = this.createForm.controls['CCSuffix'].value.toUpperCase();
    this.searchRequest.Address = this.createForm.controls['Address'].value.toUpperCase();
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.createForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.createForm.controls[objId].setValue(phone);
    }
  }
}
