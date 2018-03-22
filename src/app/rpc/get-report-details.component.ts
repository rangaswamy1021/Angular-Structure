import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

@Component({
  selector: 'app-get-report-details',
  templateUrl: './get-report-details.component.html',
  styleUrls: ['./get-report-details.component.scss']
})
export class GetReportDetailsComponent implements OnInit {
  Url: string;
  reportId: string = "";

  constructor(public sanitizer: DomSanitizer, public route:Router) { }

  ngOnInit() {
    var token = localStorage.getItem('access_token');
    this.reportId = this.route.url.replace('/','') +"&"+ token;
    this.Url = environment.reportUrl + this.reportId;
  }

}
