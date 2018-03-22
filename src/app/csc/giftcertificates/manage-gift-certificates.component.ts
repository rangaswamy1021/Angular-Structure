import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';

declare var $:any;
@Component({
  selector: 'app-manage-gift-certificates',
  templateUrl: './manage-gift-certificates.component.html',
  styleUrls: ['./manage-gift-certificates.component.css']
})
export class ManageGiftCertificatesComponent implements OnInit {

  sessionContextResponse: IUserresponse;

  constructor(public http: HttpClient, private Context : SessionService) { }
paymethod="option1";
changePayment(){
   $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    console.log(this.paymethod);}
  ngOnInit() {

    const token=localStorage.getItem('access_token');

    console.log(token)
            
    console.log(this.Context.customerContext)
    
if(token)
{
    this.http.get('http://localhost:49563/Test')
    .subscribe(
      data => console.log(data),
      err => console.log(err)
    );
  }

 
}

}
