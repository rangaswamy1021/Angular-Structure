import { SessionService } from './shared/services/session.service';
import { CommonService } from './shared/services/common.service';

import { Component, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RoutesRecognized } from '@angular/router';


declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{


  hideHeader: boolean = false;
  activeUrl;
  pageLoading;
  @HostListener('window:beforeunload') alertL(){
    console.log("sadas");
    return false;
  }
  constructor(private router: Router, private commonService: CommonService, private sessionService: SessionService) {
    router.events.forEach((event) => {
      
      if (event instanceof NavigationStart) {
        this.pageLoading=true;
       
      }
      if (event instanceof NavigationEnd) {
        this.pageLoading=false;
        window.scrollTo(0, 0);
        var str = window.location.href;
        var lastIndex = str.lastIndexOf("/");
        var lenght = str.length;
        var presentRoute = str.substr(lastIndex);
        if (presentRoute.includes("/login") || presentRoute == "/change-password" || presentRoute == "/forgot-password") {
          this.hideHeader = true;
        }
        else if (presentRoute == "/violator-refund-form") {
          this.hideHeader = true;
        }
        else if (presentRoute == "/customer-refund-form") {
          this.hideHeader = true;
        }
        else {
          this.hideHeader = false;
        }
        console.log(sessionService.customerContext);

      }
    });

   
  }

  ngOnInit() {
    
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

}
}