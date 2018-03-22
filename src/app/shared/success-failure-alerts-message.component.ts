import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

declare var $;

@Component({
  selector: 'app-success-failure-alerts-message',
  templateUrl: './success-failure-alerts-message.component.html',
  styleUrls: ['./success-failure-alerts-message.component.scss']
})
export class SuccessFailureAlertsMessageComponent implements OnInit {
  @Input() messageFlag: boolean;
  @Input() msgType;
  @Input() msgTitle;
  @Input() msgDesc;
  @Output() setFlag= new EventEmitter();
  @Output() onOk= new EventEmitter();

  constructor() { }

  emitFlag(){
    this.setFlag.emit(false);
    this.onOk.emit(false);

  }
  onClickOk(){
    this.setFlag.emit(false);
    this.onOk.emit(true);
  }

  ngOnInit() {

  }
  @HostListener('document:keydown', ['$event']) getKeyCode(event) {
    if(event.keyCode==13){
      this.messageFlag=false;
    }
  }
  
}
