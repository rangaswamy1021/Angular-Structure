import { User } from './../../shared/models/User';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IGiftCertificateRequest } from './models/gift-certificate.request';
import { GiftCertificateService } from './services/giftcertificates.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-add-gift-certificate',
  templateUrl: './add-gift-certificate.component.html',
  styleUrls: ['./add-gift-certificate.component.css']
})
export class AddGiftCertificateComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  
giftCertificate: FormGroup;
  certificateTootip: string = "Giftcertificate # is required.It allows only numbers and hyphen(-).It should be minimum 1 and maximum 15 numbers long";
   rangeTootip: string = "Range is allowed.It allows only numbers.";
   amountTooltip: string = "Face amount is required.It allows only valid format.It should be minimum 1 and maximum 10 numbers long";
  constructor(private giftCertificateService: GiftCertificateService, private Context : SessionService) { 
    this.giftCertificate = new FormGroup({
      'certificate': new FormControl('', [Validators.required]),
      'range': new FormControl('', [Validators.required]),
      'amount': new FormControl('', [Validators.required])
    });
  }
 //Create status message 
 message: string;
  giftcertificate: IGiftCertificateRequest = <IGiftCertificateRequest>{};

  ngOnInit() {
    const token=localStorage.getItem('access_token');
    
    console.log(token)
    console.log(this.Context.customerContext)
            
  }

  CreateGiftCertificate() {
    if (this.giftCertificate.valid) {

           
      this.giftcertificate.GCNumber = this.giftCertificate.value.certificate;
      this.giftcertificate.GCPurhcaseAmount = this.giftCertificate.value.amount;
      this.giftcertificate.Range = this.giftCertificate.value.range;
      this.giftcertificate.SystemActivity=<ISystemActivities>{};
      this.giftcertificate.SystemActivity.UserId = this.Context.customerContext.userId;
      this.giftcertificate.SystemActivity.LoginId = this.Context.customerContext.loginId;
      this.giftcertificate.SystemActivity.User = this.Context.customerContext.userName;
      
      
      this.giftCertificateService.CreateGiftCertificate(this.giftcertificate).subscribe(res => {
        if (res) {
          this.message = "Gift certificate Created SuccessFully";
          this.giftCertificate.reset();
        }
        else
          this.message = "Error while creating Vehcile";
      });


    
}

}
}
