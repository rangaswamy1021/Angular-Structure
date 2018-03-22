
import { routes } from './../../app.routing';
import { Http } from '@angular/http';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  userName: string;
  ICN: number;
  constructor(private router: Router, private http: Http, private sessionContext: SessionService) {
  }

  ngOnInit() {
    console.log("menu");
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.sessionContextResponse = this.sessionContext.customerContext;
        if (this.sessionContextResponse != null) {

          console.log(this.sessionContextResponse);
          this.userName = this.sessionContextResponse.FirstName + ' ' + this.sessionContextResponse.LastName;
          this.ICN = this.sessionContextResponse.icnId != null ? this.sessionContextResponse.icnId : 0;
        }
      }
    });

  }

  toggle(event) {
    // if (localStorage.getItem('rememberMe') != "true") {
    //   localStorage.removeItem("username");
    //   localStorage.removeItem("password");
    //   localStorage.removeItem("rememberMe");
    // }
    sessionStorage.clear();
    this.sessionContext.changeResponse(null);
    this.sessionContextResponse = null;
    this.router.navigate(['/login']);
    console.log("toggleevent");
    console.log(this.sessionContextResponse);
  }

  profileClick(event) {
    this.router.navigate(['user-profile-update']);
  }

}
