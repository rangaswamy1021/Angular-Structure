import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unauthorized-access',
  templateUrl: './unauthorized-access.component.html',
  styleUrls: ['./unauthorized-access.component.scss']
})
export class UnauthorizedAccessComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  backToHistory(){
    window.history.go(-3);
  }
}
