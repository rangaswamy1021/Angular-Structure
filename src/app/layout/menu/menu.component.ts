import { ViolatorContextService } from './../../shared/services/violator.context.service';
import { LoginService } from './../../login/services/login.service';
import { CustomerContextService } from './../../shared/services/customer.context.service';
import { element } from 'protractor';
import { Observable } from 'rxjs/Observable';

import { SessionService } from './../../shared/services/session.service';
import { CommonService } from './../../shared/services/common.service';
import { Http } from '@angular/http';
import { Component, AfterViewInit, OnChanges, AfterViewChecked } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RoutesRecognized } from '@angular/router';
import { routes } from './../../app.routing';
import { componentName } from "../../route-mappings";
import { IUserresponse } from '../../shared/models/userresponse';
declare const routeLength;
declare var $:any;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements AfterViewInit {
  cscBeforeSearchMenu: any;
  tvcBeforeSearchMenu: any;
  tvcAfterSearchMenu: any;
  cscAfterSearchMenu: any;
  postPaidFlag: boolean = false;
  menuItemsObj;
  menuItems;
  userData;
  beforeSearchMenuItemsArray = [];
  afterSearchMenuItemsArray = [];
  showCountOut = false;
  routeLength = routes.length;
  sessionContextResponse: IUserresponse;
  constructor(private http: Http, private commonService: CommonService, private loginService: LoginService, private violatorContext: ViolatorContextService, private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router, private sessionService: SessionService) {
  }

  ngAfterViewInit() {
    
console.log(document.body.scrollHeight);
if(document.body.scrollHeight>800){
    $(window).scroll(function () {

      if ($(window).scrollTop() > 62) {
        $('.affix').parents('app-header').next().css({ 'padding-top': '72px' })
      }
      else {
        $('.affix').parents('app-header').next().css({ 'padding-top': '0px' })
      }
    })
}
    this.loginService.setAfterSearchArray('');
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        let countout;
        let str = window.location.href;
        let lastIndex = str.lastIndexOf("/");
        const token = localStorage.getItem('access_token');
        let presentRoute = str.substr(lastIndex);
        let currentRoute = str.substr(str.lastIndexOf("#") + 2)
        if (presentRoute != "/login" && presentRoute != "/change-password" && presentRoute != "/forgot-password") {
          let sessionData=sessionStorage.getItem('ng2-webstorage|_customercontext');
          if (sessionData!="null"&&sessionData!=null) {
            countout = JSON.parse(sessionData).icnId;
            console.log(countout);
            if (countout > 0) {
              this.showCountOut = true;
            }
            else {
              this.showCountOut = false;
            }
          }
          this.menuItemsObj = sessionStorage.getItem('menu');
          this.menuItemsObj = JSON.parse(this.menuItemsObj);
          this.afterSearchMenuItemsArray = this.loginService.afterSearchArray;
          if(this.menuItemsObj){
          this.routeDetection(currentRoute)
          }
          
        }
      
      }
    })
  }

  routeDetection(presentRoute) {
    this.menuItems = this.menuItemsObj['beforesearch']
    this.afterSearchMenuItemsArray.forEach(element => {
      if (presentRoute.indexOf(element) >= 0) {
        this.menuItemsObj['aftersearch'].forEach(a => {
          if(a.name=='CSC'){
            this.cscAfterSearchMenu=a;
          }
          else{
            if(a.name=='TVC'){
            this.tvcAfterSearchMenu=a;
          }}
        });
        this.menuItemsObj['beforesearch'].forEach(b => {
          if(b.name=='CSC'){
            this.cscBeforeSearchMenu=b;
          }
          else{
            if(b.name=='TVC'){
            this.tvcBeforeSearchMenu=b;
          }}
        });

        if (this.loginService.ccontext == undefined) {
          this.postPaidFlag = false;
          this.menuItems.forEach(subElement => {
            if(subElement.name=='CSC'){
             let i=this.menuItems.indexOf(subElement);
             this.menuItems[i]=this.cscBeforeSearchMenu;
            }
          });
        }
        else {
          console.log(this.menuItems);
          this.menuItems.forEach(subElement => {
           
            if(subElement.name=='CSC'){
              let i=this.menuItems.indexOf(subElement);
             this.menuItems[i]=this.cscAfterSearchMenu;
            }
          });
          if (this.loginService.ccontext.AccountType == "POSTPAID") {
            this.postPaidFlag = true;
          }
          else {
            this.postPaidFlag = false;
          }
        }
        
        if (this.loginService.vcontext == undefined) {
          this.menuItems.forEach(subElement => {
            if(subElement.name=='TVC'){
             let i=this.menuItems.indexOf(subElement);
             this.menuItems[i]=this.tvcBeforeSearchMenu;
            }
          });
        }
        else {
         this.menuItems.forEach(subElement => {
            
            if(subElement.name=='TVC'){
             let i=this.menuItems.indexOf(subElement);
             this.menuItems[i]=this.tvcAfterSearchMenu;
            }
          });

        }
      }
    });
  }

}
